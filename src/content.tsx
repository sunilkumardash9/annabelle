import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import "./loading.css"
import openIcon from "../assets/share.svg"
import {getDefaultTextGenerator, getDefaultMultiModalGenerator} from "./llms/defaultModel"


const formatResponse = (response) => {
  return response.split("**").map((text, index) => {
    if (index % 2 === 0) {
      // Regular text
      return text.split(". ").map((sentence, idx, arr) => `${sentence}${idx < arr.length - 1 ? ".<br/>" : ""}`).join("");
    } else {
      // Bold text
      return `<strong>${text}</strong>`;
    }
  }).join("");
};
const handleOpenSidePanel = () => {
  chrome.runtime.sendMessage({ action: "openSidePanel" });
};
const Popup = ({ children, onClose, position }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [popupPosition, setPopupPosition] = useState(position);

  const handleMouseDown = (event) => {
    if (!event.target.classList.contains("streamed-text")) {
      setIsDragging(true);
      setDragStart({ x: event.clientX, y: event.clientY });
      event.preventDefault(); 
    }
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
        width: '400px',
        height: '300px',
        overflow: 'auto',
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      onMouseDown={handleMouseDown}
    >
      <div
      style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '10px',
      }}
    >
      <div style={{ fontSize: '18px', fontWeight: 'bold', marginRight: '10px', marginLeft: '5px'}}>
        annabelle
      </div>
      <img
        src={openIcon}
        alt="Open Side Panel"
        style={{ cursor: 'pointer', width: '24px', height: '24px'}}
        onClick={handleOpenSidePanel}
      />
    </div>
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
      top: rect.bottom + window.scrollY + 10,
      left: rect.left + window.scrollX + (rect.width) / 2,
      
    });
  };

  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (!selection) return; 
      const text = selection.toString().trim();
      const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
      const isSelectionInsidePopup = range && document.getElementById("popup-content")?.contains(range.commonAncestorContainer);
      setSelectedText(text)
      if (text.length > 0 && !isSelectionInsidePopup) {
        updatePosition();
        setIsVisible(true);
      } else if (selection.isCollapsed) {
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
    setStreamedContent(
    <>
    <div style={{ backgroundColor: "rgb(33, 33, 33)", fontSize: "14px", marginTop: "30px" }}>
        {selectedText}
      </div>
    <div className="wave-loader">
        <div className="dot"></div>
        <div className="dot"></div>
        <div className="dot"></div>
      </div>
    </>
    );
    try{
    const { defaultService, textGenerator } = await getDefaultTextGenerator();
    const serviceData = await chrome.storage.sync.get(defaultService);
    const result = serviceData[defaultService];

    textGenerator(selectedText, (streamedText) => {
      
      setStreamedContent((prevContent) =>{
        const prevTextContent = typeof prevContent.props.children[1].props.children === "string"
              ? prevContent.props.children[1].props.children
              : "";
        var newTextContent = prevTextContent + streamedText;
       return (
        <>
        <div style={{ backgroundColor: "rgb(33, 33, 33)", fontSize: "14px", marginTop: "30px" }} >
        {selectedText}
       </div>
      <div style={{ color: "white", marginTop: "30px", fontSize: "14px"}}>
              {newTextContent}
          </div>
        </>)
    })
      },
      result
    )} catch (error){
  
        setStreamedContent(
          <>
         <div
        style={{ backgroundColor: "rgb(33, 33, 33)", fontSize: "14px", marginTop: "30px" }}
      >
        {selectedText}
      </div>
          
          <div className="streamed-text" style={{ color: "red", marginTop: "30px", fontSize: "14px"}}>
              Please, provide API keys for a model.
          </div>
        </>
        )
    
    }
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

  const captureSelectionArea = async () => {
    chrome.runtime.sendMessage({ action: "captureVisibleTab" }, (response) => {
      if (response.screenshotUrl) {
        const img = new Image();
        img.onload = async () => { // Mark this function as async
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
          try {
          const {imageGenerator, apiKey} = await getDefaultMultiModalGenerator();
          imageGenerator(imageData, (streamedText) => {
            setStreamedContent((prevContent) => {
              const prevTextContent = typeof prevContent.props.children[1].props.children === "string"
                ? prevContent.props.children[1].props.children
                : "";
              const newTextContent = prevTextContent + streamedText;
              return (
                <>
                  <div style={{backgroundColor: "rgb(33, 33, 33)"}}>
                    <img src={imageData} alt="Screenshot" style={{ maxWidth: "100%", maxHeight: "200px" }}/>
                  </div>
                 
                  <div className="streamed-text" style={{ color: "white", marginTop: "10px" }}>
                    {newTextContent}
                  </div>
                </>
              );
            });
          }, apiKey);
        } catch (error){
          setStreamedContent(
          <>
            <div style={{backgroundColor: "rgb(33, 33, 33)"}}>
              <img src={imageData} alt="Screenshot" style={{ maxWidth: "100%", maxHeight: "200px" }}/>
            </div>
            <div className="streamed-text" style={{ color: "red", marginTop: "10px" }}>
              Please recheck your Gemini API key
            </div>
          </>
          )

        }
        ;}
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

const bg_btn_color = "#1950a8"
  return (
    <>
      {isVisible && (
        <div
          style={{
            position: "absolute",
            top: buttonPosition.top,
            left: buttonPosition.left,
            display: "flex",
            backgroundColor: bg_btn_color,
            borderRadius: "10px",
          }}
        >
          <button
            style={{
              marginRight: "0px",
              borderRadius: "20px",
              backgroundColor: bg_btn_color,
              color: "white",
              padding: "5px 5px",
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
              backgroundColor: bg_btn_color,
              color: "white",
              padding: "5px 5px",
              border: "none",
              cursor: "pointer",
            }}
            onClick={handleImageButtonClick}
          > 
            Image
          </button>
          <button style={{borderRadius: "10px", backgroundColor: bg_btn_color, border: "None", alignItems:"center"}}>
            <img src={openIcon}
            alt="Open Side Panel"
            style={{ width: '20px', height: '20px'}}
            onClick={handleOpenSidePanel}/>
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
