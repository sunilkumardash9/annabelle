import React, { useState, useEffect, useRef } from "react";
import "./ChatPopup.css";
import logo from "./assets/annabelle_bold.png";
import sendIcon from "./assets/icons8-send-64.png";
import clipIcon from "./assets/clip.png";

const ChatPopup = () => {
  const [message, setMessage] = useState("");
  const [isButtonActive, setIsButtonActive] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  
  
  useEffect(() => {
    setIsButtonActive(message.length > 0); 
  }, [message]);

  const handleMessageChange = (event) => {
    setMessage(event.target.value);
  
    // Automatically adjust the height of the textarea to fit the content
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };
  

  const handleSubmit = (event) => {
    event.preventDefault();
    // Handle message submission here
    console.log(message);
    setMessage("");
  };

  const handleSendMessage = (event) => {
    event.preventDefault();
    if (message.trim()) {
      // Handle sending the message here
      console.log("Message sent:", message);
      console.log("Images sent:", uploadedImages);
      setMessage("");
      setUploadedImages([]);

      // Directly use the ref to reset the height of the textarea
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.style.height = '20px'; // Set this to the initial height of your textarea
      }
    }
  };

  const handleUploadClick = (event) => {
    event.preventDefault();
    // Add your send message logic here
    console.log("Message sent:", message);
    // setMessage("");
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    // Limit the number of uploaded files to 2
    const imagesToUpload = files.slice(0, 2).map((file) => URL.createObjectURL(file));
    setUploadedImages(imagesToUpload);
  };

  return (
    <div className="chat-popup">
      <header className="chat-header">
        <img src={logo} alt="Logo" className="chat-logo" />
        {/* <span className="chat-title">annabelle</span> */}
      </header>
      <div className="chat-messages">
        {/* Display chat messages here */}
      </div>
      <form onSubmit={handleSubmit} className="chat-form">
        <div className="chat-input-container">
           <textarea
              value={message}
              onChange={handleMessageChange}
              placeholder="Type a message..."
              className="chat-input"
            />
           <button
              type="button" 
              className="upload-image"
              onChange={handleMessageChange}
              onClick={handleUploadClick}
            >
              <img src={clipIcon} alt="Clip" className="clip-icon"/>
           </button>
          <button
             type="submit"
             className={`send-button ${isButtonActive ? "active" : ""}`}
             onClick={handleSendMessage}
             disabled={!isButtonActive}
           >
             <img src={sendIcon} alt="Send" className="send-icon" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatPopup;
