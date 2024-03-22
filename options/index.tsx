import React, {useState, useEffect} from 'react';
import './style.css';

function optionsPage() {

  const [selectedOption, setSelectedOption] = useState('Models');
  const [showOpenAIInputs, setShowOpenAIInputs] = useState(false);
  const [showGeminiInputs, setShowGeminiInputs] = useState(false);
  const [activeToggle, setActiveToggle] = useState(null);
  const [OpenAIMessage, setOpenAIMessage] = useState('');
  const [geminiMessage, setGeminiMessage] = useState('');

  const [openAI, setOpenAICredentials] = useState({
    serviceName: 'OpenAI',
    baseApiUrl: '',
    apiKey: '',
    modelName: ''
  });
  
  const [gemini, setGeminiCredentials] = useState({
    serviceName:'Gemini',
    apiKey: '',
    modelName: ''
  });

const handleToggle = (toggleName) => {
    if (activeToggle === toggleName) {
      setActiveToggle(null); 
    } else {
      setActiveToggle(toggleName);
      chrome.storage.sync.set({ defaultService: toggleName }, () => {
        console.log(`Default service set to ${toggleName}`);
      });
      
    }
};


const handleSave = (serviceName) => {

  if (serviceName === 'openAI') {
    if (openAI.apiKey) {
      chrome.storage.sync.set({ openAI }, () => {
        console.log('OpenAI data saved:', openAI);
        setOpenAIMessage(serviceName + ' credentials saved successfully');
        setTimeout(() => setOpenAIMessage(''), 2000);
      });
    } else {
      setOpenAIMessage("Fill in the required fields")
      setTimeout(() => setOpenAIMessage(''), 2000);
    }
  } else if (serviceName === 'gemini') {
    if (gemini.apiKey) {
      chrome.storage.sync.set({ gemini }, () => {
        console.log('Gemini data saved:', gemini);
        setGeminiMessage(serviceName + ' credentials saved successfully');
        setTimeout(() => setGeminiMessage(''), 2000);
      });
    } else {
      setGeminiMessage("Fill in the required fields")
      setTimeout(() => setGeminiMessage(''), 2000);
    }
  }

  // Update default service
  setActiveToggle(serviceName)
  chrome.storage.sync.set({ serviceName }, () => {
    console.log(`Default service set to ${serviceName}`);
  });
  chrome.storage.sync.get('defaultService', (result) => {
    console.log('This is defaultService: ' + result.defaultService);
});
  
};


const handleReset = (serviceName) => {
  if (serviceName === 'openAI') {
    setOpenAICredentials({ serviceName: 'OpenAI', baseApiUrl: '', apiKey: '', modelName: '' });
    chrome.storage.sync.remove('openAI', () => {
      setOpenAIMessage(serviceName + ' credentials removed successfully')
      setTimeout(() => setOpenAIMessage(''), 2000);
    });
  } else if (serviceName === 'gemini') {
    setGeminiCredentials({ serviceName: 'Gemini', apiKey: '', modelName: '' });
    chrome.storage.sync.remove('gemini', () => {
      setGeminiMessage(serviceName + ' credentials removed successfully')
      setTimeout(() => setGeminiMessage(''), 2000);
    });
  }

  // Check remaining credentials and update default service
  chrome.storage.sync.get(['openAI', 'gemini'], (result) => {
    let defaultService = null;
    if (result.openAI && result.openAI.apiKey) {
      defaultService = 'openAI';
    } else if (result.gemini && result.gemini.apiKey) {
      defaultService = 'gemini';
    }
    setActiveToggle(defaultService)

    chrome.storage.sync.set({ defaultService }, () => {
      console.log(`Default service set to ${defaultService}`);
    });
  });
};


useEffect(() => {
  chrome.storage.sync.get(['openAI', 'gemini', 'defaultService'], (result) => {
    if (result.openAI) {
      setOpenAICredentials(result.openAI);
    }
    if (result.gemini) {
      setGeminiCredentials(result.gemini);
    }
    if (result.defaultService) {
      console.log(result.defaultService)
      setActiveToggle(result.defaultService);
    }
  });
}, []);


  return (
    <div className="container">
      <div className="sidebar">
        <div className="sidebar-header">annabelle</div>
        <ul>
          <li onClick={() => setSelectedOption('Models')}>Models</li>
          <li onClick={() => setSelectedOption('About')}>About</li>
        </ul>
      </div>
      <div className="main">
        {selectedOption === 'Models' ? (
          <div>
            <h1>Models</h1>
            <div className="button-switch-container">
                  <button className="toggle-buttons" onClick={() => setShowOpenAIInputs(!showOpenAIInputs)}>OpenAI</button>
                  <label className="switch">
                    <input type="checkbox" 
                       checked={activeToggle === 'openAI'}
                       onChange={() => {
                        if (openAI.apiKey) {
                          handleToggle('openAI');
                        }}}
                  />
                   <span className="slider round"></span>
                 </label>
            </div>
            <div className="note">Note: You can use any language model inference provider that supports the OpenAI API format, 
            <br/> such as Together, Anyscale, and others.</div>
            {showOpenAIInputs && (
             <div>
              <div className='inputs-container'>
                <input className="input-box" type="text" 
                       placeholder='Base API URL' 
                       value={openAI.baseApiUrl}
                       onChange={(e) => setOpenAICredentials({ ...openAI, baseApiUrl: e.target.value})} />
                <input className="input-box" 
                       type="text" 
                       placeholder='API Key'
                       value={openAI.apiKey}
                       onChange={(e) => setOpenAICredentials({ ...openAI, apiKey: e.target.value })} />
                <input className="input-box" 
                       type="text" 
                       placeholder='Model Name'
                       value={openAI.modelName}
                       onChange={(e) => setOpenAICredentials({ ...openAI, modelName: e.target.value })}/>
                {OpenAIMessage && <div className="message">{OpenAIMessage}</div>}
              </div>
              
              <div className="buttons-container">
               <button className="action-button" onClick={() => handleSave('openAI')}>Save</button>
               <button className="action-button" onClick={() => handleReset('openAI')}>Reset</button>
            </div>

          </div>
            )}
            <div className="button-switch-container">
            <button className='toggle-buttons' onClick={() => setShowGeminiInputs(!showGeminiInputs)}>Gemini</button>

            <label className="switch">
            <input
              type="checkbox"
              checked={activeToggle === 'gemini'}
                onChange={() => {
                  if (gemini.apiKey) {
                    handleToggle('gemini');
                  }
                }}
            />
                <span className="slider round"></span>
            </label>
            </div>
            <div className="note">Note: Add API key for Gemini for Multi-modal support</div>
            {showGeminiInputs && (
            <div>
              <div className='inputs-container'>
              <input
                 className="input-box"
                 type="text"
                 placeholder="Gemini API Key"
                 value={gemini.apiKey}
                 onChange={(e) => setGeminiCredentials({ ...gemini, apiKey: e.target.value })}
              />
            <input
                 className="input-box"
                 type="text"
                 placeholder="Gemini Model Name"
                 value={gemini.modelName}
                 onChange={(e) => setGeminiCredentials({ ...gemini, modelName: e.target.value })}
              />
              {geminiMessage && <div className="message">{geminiMessage}</div>}
              </div>
              <div className="buttons-container">
               <button className="action-button" onClick={() => handleSave('gemini')}>Save</button>
               <button className="action-button" onClick={() => handleReset("gemini")}>Reset</button>
             </div>
           </div>
            )}
        </div>
        ) : selectedOption === 'About' ? (
          <div>
            <h1>About</h1>
            <p style={{fontSize: "20px"}}>An open-source AI web assistant that let's you use Gemini and model's that support OpenAI API format.
            <br/>Star us on Github <a href='https://github.com/sunilkumardash9/annabelle' style={{color:"blue"}}> annabelle.</a></p>
          </div>
        ) : (
          <h1>Main Content</h1>
        )}
      </div>
    </div>
  );
}

export default optionsPage;
