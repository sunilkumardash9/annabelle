import React, { useState, useEffect, useRef } from "react";
import "./chat.css";
import logo from "../assets/annabelle_bold.png";
import sendIcon from "../assets/icons8-send-64.png";
import clipIcon from "../assets/clip.png";
import userIcon from "../assets/iuser.png";
import systemIcon from "../assets/system.png"
import { geminiGeneratorText, GeminiChatGenerator } from "~llms/geminiAi";


const ChatPopup = () => {
  const [message, setMessage] = useState("");
  const [isButtonActive, setIsButtonActive] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  
   
  useEffect(() => {
    setIsButtonActive(message.length > 0 || uploadedImages.length > 0);
}, [message, uploadedImages]);


  const handleMessageChange = (event) => {
    setMessage(event.target.value);
  
    // Automatically adjust the height of the textarea to fit the content
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };
  
  const handleRemoveImage = (index) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index));
};

  const handleSubmit = (event) => {
    event.preventDefault();
    setMessage("");
    setUploadedImages([]);
  };

  const handleSendMessage = async (event) => {
    event.preventDefault();
    if (message.trim() || uploadedImages.length > 0) {
        const userMessage = {
            id: Date.now(),
            text: message,
            images: uploadedImages,
            sender: 'user',
        };
        setIsLoading(true)

        // Add the user's message to the messages array
        setMessages((prevMessages) => [...prevMessages, userMessage]);

        // Clear the message input and uploaded images
        setMessage("");
        setUploadedImages([]);

        // Accumulate the response from the geminiGeneratorText function
        let systemResponse = '';
        await GeminiChatGenerator(message, (chunkText) => {
            systemResponse += chunkText;
        }, uploadedImages);

        // Add the complete system response as a single message
        const systemMessage = {
            id: Date.now() + 1,
            text: systemResponse,
            images: [],
            sender: 'system',
        };
        setMessages((prevMessages) => [...prevMessages, systemMessage]);
        setIsLoading(false);
        // Reset the height of the textarea if needed
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = '20px';
        }
    }
};


  const handleUploadClick = (event) => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const files = event.target.files;
    if (files && files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                // Resize and compress the image using a canvas
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                // Set the desired width and calculate the height to maintain aspect ratio
                const maxWidth = 300; // Change this to your desired width
                const scale = maxWidth / img.width;
                const width = maxWidth;
                const height = img.height * scale;

                canvas.width = width;
                canvas.height = height;

                // Draw the resized image on the canvas
                ctx.drawImage(img, 0, 0, width, height);

                // Get the resized and compressed image as a base64-encoded string
                const base64Image = canvas.toDataURL('image/png', 0.8); // Adjust the quality as needed

                // Add the resized and compressed image to the uploadedImages state
                setUploadedImages([...uploadedImages, base64Image]);
            };
            if (typeof e.target.result === 'string') {
                img.src = e.target.result;
            }
        };
        reader.readAsDataURL(files[0]);
    }
};

  return (
    <div className="chat-popup">
      <header className="chat-header">
        <img src={logo} alt="Logo" className="chat-logo" />
        {/* <span className="chat-title">annabelle</span> */}
      </header>
      <div className="chat-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`message ${msg.sender}`}>
                <img src={msg.sender === 'user' ? userIcon : systemIcon} alt={`${msg.type} logo`} className="message-logo" />
                <div className="message-text">
                    <div className="message-images">
                        {msg.images.map((imageSrc, index) => (
                            <img key={index} src={imageSrc} alt={`Uploaded content ${index + 1}`} className="message-image" />
                    )
                  )
                }
                </div>
                <p>{msg.text}</p>
            </div>
        </div>
    ))}
    {isLoading && (
        <div className="loading-icon">
            <div></div>
            <div></div>
            <div></div>
        </div>
    )
  }
</div>

      <div className="uploaded-images-container">
        {uploadedImages.map((imageSrc, index) => (
            <div key={index} className="uploaded-image">
                <img src={imageSrc} alt={`Uploaded content ${index + 1}`} />
                <button
                    className="cancel-image-button"
                    onClick={() => handleRemoveImage(index)}

                >
                 X
              </button>
            </div>
        ))}
    </div>
      <form onSubmit={handleSubmit} className="chat-form">
        <div className="chat-input-container">
           <textarea
              value={message}
              onChange={handleMessageChange}
              placeholder="Type a message..."
              className="chat-input"
            />
          <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              multiple
              onChange={handleFileChange}
        />
           <button
              type="button" 
              className="upload-image upload-button-adjustment"
              // onChange={handleMessageChange}
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
