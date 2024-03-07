import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import openAITextGenerator from "./llms/openAI";
import {geminiGeneratorText, geminiGeneratorImage} from "./llms/geminiAi"
import "./loading.css"


const Popup = ({ children, onClose, position }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [popupPosition, setPopupPosition] = useState(position);

  const handleMouseDown = (event) => {
    setIsDragging(true);
    setDragStart({ x: event.clientX, y: event.clientY });
    event.preventDefault(); // Prevent text selection
  };

  const handleMouseMove = (event) => {
    if (isDragging) {
      const dx = event.clientX - dragStart.x;
      const dy = event.clientY - dragStart.y;
      setPopupPosition((prevPosition) => ({
        top: Math.max(0, prevPosition.top + dy),
        left: Math.max(0, prevPosition.left + dx),
      }));
      setDragStart({ x: event.clientX, y: event.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('#popup-content')) {
        onClose();
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDragging, dragStart, onClose]);

  return (
    <div
      id="popup-content"
      style={{
        position: 'fixed',
        top: `${Math.min(Math.max(popupPosition.top, 0), window.innerHeight - 200)}px`,
        left: `${Math.min(Math.max(popupPosition.left, 0), window.innerWidth - 300)}px`,
        backgroundColor: 'black',
        color: 'white',
        padding: '20px',
        borderRadius: '10px',
        zIndex: 1000,
        width: '300px',
        height: '200px',
        overflow: 'auto',
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      onMouseDown={handleMouseDown}
    >
      {children}
    </div>
  );
};


const ButtonContainer = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [buttonPosition, setButtonPosition] = useState({ top: 0, left: 0 });
  const [showPopup, setShowPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  const [selectionArea, setSelectionArea] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [isSelecting, setIsSelecting] = useState(false);
  const [streamedContent, setStreamedContent] = useState<React.ReactNode>(null);
  const [selectedText, setSelectedText] = useState("");



  const updatePosition = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    setButtonPosition({
      top: rect.top + window.scrollY - 40,
      left: Math.min(rect.right + window.scrollX, window.innerWidth - 120),
    });
  };

  useEffect(() => {
    const handleSelectionChange = () => {
      const text:string = window.getSelection()?.toString().trim() || "";
      setSelectedText(text)
      if (text?.length > 0) {
        updatePosition();
        setIsVisible(true)
      } else {
        setIsVisible(false);
      }
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    window.addEventListener("scroll", updatePosition); // Update position on scroll
    window.addEventListener("resize", updatePosition)

    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
      window.removeEventListener("scroll", updatePosition);
      window.removeEventListener('resize', updatePosition)
    };
  }, []);

  useEffect(() => {
    if (isVisible) {
      setPopupPosition({ 
        top: buttonPosition.top - window.scrollY, // Adjust for scrolling
        left: buttonPosition.left + 100, // Position the popup beside the buttons
       });
    }
  }, [isVisible, buttonPosition]);

  const handleTextButtonClick = async () => {
    setStreamedContent("");
        geminiGeneratorText(selectedText, (content) => {
            setStreamedContent((prevContent) => prevContent + content);
        });
    setShowPopup(true);
    setIsVisible(false);
  };

  const handleImageButtonClick = () => {
    setIsSelecting(true);
    setIsVisible(false);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Enter" && isSelecting) {
        setIsSelecting(false);
        setShowPopup(true);
        captureSelectionArea();
      }
    };

    if (isSelecting) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSelecting, selectionArea]);

  const captureSelectionArea = () => {
    chrome.runtime.sendMessage({ action: "captureVisibleTab" }, (response) => {
      if (response.screenshotUrl) {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          const x = Math.min(selectionArea.x, selectionArea.x + selectionArea.width);
          const y = Math.min(selectionArea.y, selectionArea.y + selectionArea.height);
          const width = Math.abs(selectionArea.width);
          const height = Math.abs(selectionArea.height);
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, x, y, width, height, 0, 0, width, height);
          const imageData = canvas.toDataURL("image/png");
          setStreamedContent(
            <>
              <img src={imageData} alt="Screenshot" style={{ maxWidth: "100%", maxHeight: "200px" }}/>
              <div className="wave-loader">
                 <div className="dot"></div>
                 <div className="dot"></div>
                 <div className="dot"></div>
              </div>
            </>
          );
          
          geminiGeneratorImage(imageData, (streamedText) => {
            setStreamedContent((prevContent) =>{
              const prevTextContent = typeof prevContent.props.children[1].props.children === "string"
              ? prevContent.props.children[1].props.children
              : "";
              const newTextContent = prevTextContent + streamedText;
             return (
              <>
                <img src={imageData} alt="Screenshot" style={{ maxWidth: "100%", maxHeight: "200px" }}/>
                <div style={{ color: "white", marginTop: "10px" }}>
                    {newTextContent}
                </div>
              </>)
          })
            }
          )
        };
        img.src = response.screenshotUrl;
      }
    });
  };
  

  const handleClosePopup = () => {
    setShowPopup(false);
    setIsVisible(false);
  };

  const handleCancelSelection = () => {
    setIsSelecting(false);
    setSelectionArea({ x: 0, y: 0, width: 0, height: 0 });
  };

  const handleExitScreenCapture = () => {
    setIsSelecting(false);
    setSelectionArea({ x: 0, y: 0, width: 0, height: 0 });
  };


  return (
    <>
      {isVisible && (
        <div
          style={{
            position: "absolute",
            top: buttonPosition.top,
            left: buttonPosition.left,
            display: "flex",
          }}
        >
          <button
            style={{
              marginRight: "5px",
              borderRadius: "20px",
              backgroundColor: "indigo",
              color: "white",
              padding: "5px 15px",
              border: "none",
              cursor: "pointer",
            }}
            onClick={handleTextButtonClick}
          >
            Text
          </button>
          <button
            style={{
              borderRadius: "20px",
              backgroundColor: "indigo",
              color: "white",
              padding: "5px 15px",
              border: "none",
              cursor: "pointer",
            }}
            onClick={handleImageButtonClick}
          > 
            Image
          </button>
        </div>
      )}
      {isSelecting && (
        <>
        <button
            style={{
              position: "fixed",
              top: "10px",
              right: "10px",
              backgroundColor: "white",
              color: "black",
              border: "1px solid black",
              borderRadius: "5px",
              padding: "5px 10px",
              cursor: "pointer",
              zIndex: 10001, // Ensure the button is above the overlay
            }}
            onClick={handleExitScreenCapture}
          >
            Exit Screen Capture
          </button>
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.3)",
            cursor: "crosshair",
            zIndex: 10000,
          }}
          onMouseDown={(event) => {
            setSelectionArea({ x: event.clientX, y: event.clientY, width: 0, height: 0 });
          }}
          onMouseMove={(event) => {
            if (event.buttons === 1) {
              setSelectionArea((prev) => ({
                x: prev.x,
                y: prev.y,
                width: event.clientX - prev.x,
                height: event.clientY - prev.y,
              }));
            }
          }}
          onMouseUp={() => {
            setIsSelecting(true);
          }}
        >
          <div
            style={{
              position: "absolute",
              top: `${selectionArea.y}px`,
              left: `${selectionArea.x}px`,
              width: `${selectionArea.width}px`,
              height: `${selectionArea.height}px`,
              border: "2px solid red",
            }}
          ></div>
          <button
            style={{
              position: "absolute",
              top: `${selectionArea.y - 30}px`, // Position the button above the selection area
              left: `${selectionArea.x + selectionArea.width}px`, // Position the button to the right of the selection area
              backgroundColor: "white",
              color: "black",
              border: "1px solid black",
              borderRadius: "50%",
              width: "25px",
              height: "25px",
              cursor: "pointer",
              display: selectionArea.width && selectionArea.height ? "block" : "none", // Only show the button if a selection area exists
            }}
            onClick={handleCancelSelection}
          >
            &times; {/* Cross symbol */}
          </button>
        </div>
        </>
      )}
      {showPopup && (
  <Popup
    onClose={handleClosePopup}
    position={popupPosition}
  >
    {streamedContent || "Couldn't load response"}
  </Popup>
)}
    </>
  );
};

const ContentScript = () => {
  return <ButtonContainer />;
};

const app = document.createElement("div");
app.id = "chrome-extension-buttons-container";
document.body.appendChild(app);
ReactDOM.render(<ContentScript />, app);
