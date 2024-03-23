import React, { useState, useEffect, useRef } from "react";
import "./chat.css";
import logo from "../../assets/annabelle_bold.png";
import sendIcon from "../../assets/icons8-send-64.png";
import clipIcon from "../../assets/clip.png";
import userIcon from "../../assets/iuser.png";
import systemIcon from "../../assets/system.png"
import menuIcon from "../../assets/menu-2.png"
import chatIcon from "../../assets/chat.png"
import settingsIcon from "../../assets/settings.svg"
import { getDefaultChatGenerator } from "../llms/defaultModel";


const ChatPanel = () => {
  const [message, setMessage] = useState("");
  const [isButtonActive, setIsButtonActive] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const [showMenu, setShowMenu] = useState(false);
  const [messageList, setMessageList] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [geminiCredential, setGeminiCredentials] = useState(null)
  
  chrome.storage.sync.get(['gemini'], function(result){
    if(result.gemini){
       setGeminiCredentials(result.gemini)
    }
  })
  const toggleMenu = () => {
    setShowMenu((prevShowMenu) => !prevShowMenu);
  };
 
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

      // Update messageList and use the updated list in chatGenerator
      setMessageList((prevMessageList) => {
          const updatedMessageList = [...prevMessageList, {"role": "user", "content": userMessage.text}];
          setMessage("");
          setUploadedImages([]);
          let systemResponse = '';
          (async () => {
              try {
                  console.log(updatedMessageList)
                  const { defaultService, chatGenerator } = await getDefaultChatGenerator();
                  const serviceData = await chrome.storage.sync.get(defaultService);
                  const result = serviceData[defaultService];
                  if (geminiCredential){
                    result['geminiKey'] = geminiCredential.apiKey
                  }
                  console.log(result, 'result dict')
                  await chatGenerator(updatedMessageList, (chunkText) => {
                      systemResponse += chunkText;
                  }, uploadedImages, result);

                  // Add the complete system response as a single message
                  const systemMessage = {
                      id: Date.now() + 1,
                      text: systemResponse,
                      images: [],
                      sender: 'system',
                  };
                  setMessageList((prevMessageList)=> [...prevMessageList, {"role": "assistant", "content": systemResponse}])
                  setMessages((prevMessages) => [...prevMessages, systemMessage]);
                  setIsLoading(false);
              } catch (error) {
                  console.log(error);
              }
          })();

          // Reset the height of the textarea if needed
          const textarea = textareaRef.current;
          if (textarea) {
              textarea.style.height = '20px';
          }

          return updatedMessageList;
      });
  }
};

  const handleUploadClick = (event) => {
    // chrome.storage.sync.get(['gemini'], function(result) {
      if (geminiCredential) {
        fileInputRef.current.click();
        setErrorMessage("");
      } else {
        setErrorMessage("Please set the Gemini credential in settings before uploading an image.");
        setTimeout(() => {
          setErrorMessage("");
        }, 2000);
      }
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
const resetChat = () => {
    setMessages([])
    setMessageList([])
}
  return (
    <div className="chat-panel">
      <header className="chat-header">
        <img src={logo} alt="Logo" className="chat-logo" />
        {/* <span className="chat-title">annabelle</span> */}
        <button className="menu-button" onClick={toggleMenu}>
          <img src={menuIcon} alt="Menu" />
        </button>
        {showMenu && (
          <div className="menu-content">
            <button className="menu-item" onClick={resetChat}>
            <img src={chatIcon} alt="Select Models" className="menu-item-icon" />
              Reset chat
            </button>
            <button className="menu-item" onClick={()=>{chrome.runtime.openOptionsPage();}}>
            <img src={settingsIcon} alt="Select Models" className="menu-item-icon" />
              Settings
            </button>
          </div>
        )}
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
    {errorMessage && (
      <div className="error-message">
        {errorMessage}
      </div>
    )}
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

export default ChatPanel;
