import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";

const Popup = ({ text, onClose, position, onDrag}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });

  const handleMouseDown = (event) => {
    setIsDragging(true);
    setStartPosition({ x: event.clientX - position.left, y: event.clientY - position.top });
    event.preventDefault(); // Prevent text selection
  };

  const handleMouseMove = (event) => {
    if (isDragging) {
      onDrag({ left: event.clientX - startPosition.x, top: event.clientY - startPosition.y });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest("#popup-content")) {
        onClose();
      }
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDragging, startPosition, onDrag, onClose]);

  return (
    <div
      id="popup-content"
      style={{
        position: "fixed",
        top: Math.min(Math.max(position.top, 0), window.innerHeight - 200) + "px",
        bottom: Math.max(0,window.innerHeight - position.top - 200) + "px",
        left:Math.min(position.left, window.innerWidth - 320) + "px",
        backgroundColor: "black",
        color: "white",
        padding: "20px",
        borderRadius: "10px",
        zIndex: 1000,
        width: "300px",
        height: "200px",
        overflow: "auto",
        cursor: isDragging ? "grabbing" : "grab",
      }}
      onMouseDown={handleMouseDown}
    >
      {text}
    </div>
  );
};

const ButtonContainer = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [buttonPosition, setButtonPosition] = useState({ top: 0, left: 0 });
  const [selectedText, setSelectedText] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });

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
      const text = window.getSelection()?.toString().trim();
      if (text?.length > 0) {
        updatePosition();
        setIsVisible(true);
        setSelectedText(text);
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

  const handleButtonClick = () => {
    setShowPopup(true);
    setIsVisible(false);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setIsVisible(false);
  };

  const handleDragPopup = (newPosition) => {
    setPopupPosition(newPosition);
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
            onClick={handleButtonClick}
          >
            Button 1
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
          > 
            Button 2
          </button>
        </div>
      )}
      {showPopup && (
        <Popup
          text={selectedText}
          onClose={handleClosePopup}
          position={popupPosition}
          onDrag={handleDragPopup}
        />
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
