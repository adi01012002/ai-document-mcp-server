

// import React, { useState, useEffect} from 'react';
// import { useTheme } from './hooks/useTheme'
// import axios from 'axios';
// import ChatMessage from './components/ChatMessage'
// import FileUpload from './components/FileUpload'
// import ThemeToggle from './components/ThemeToggle'
// // import cors from 'cors';
// import './App.css'

// function App() {
//   const { theme, toggleTheme } = useTheme()
//   const [messages, setMessages] = useState([
//     { role: 'bot', content: "Hello! I'm your chatbot assistant. How can I help you today?"}
//   ])
//   const [inputText, setInputText] = useState('')
//   const [isTyping, setIsTyping] = useState(false);
//   const [sessionId, setSessionId] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [userData, setUserData] = useState(null);



//   // Generate and persist sessionId
//   useEffect(() => {
//     const id = localStorage.getItem('sessionId');
//     if (id) {
//       setSessionId(id);
//     } else {
//       const newId = 'session-' + Date.now();
//       localStorage.setItem('sessionId', newId);
//       setSessionId(newId);
//     }
//   }, []);

// const addMessage = (role, content) => {
//     setMessages(prev => [...prev, { role, content }]);
//   };  

//   // ❌ Error occurred while fetching response.

//   const handleSendMessage = async () => {
//     if (!inputText.trim()) return;

//     const userMessage = inputText.trim();
//     console.log(messages);
//     setInputText('');
//     addMessage('user', userMessage);
//     setIsLoading(true);
//     setError('');

//     try {
//       const res = await axios.post('http://localhost:4000/chat', {
//         message: userMessage,
//         sessionId,
//       });
//       addMessage('assistant', res.data.response);
//     } catch (error) {
//       setError('Failed to send message. Please try again.');
//       addMessage('assistant', '❌ Error occurred while fetching response.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleFileUpload = async (e) => {
//     console.log(e);

//     const file = e
//     if (!file) return;
  
//     addMessage('user', `📄 Uploaded file: ${file.name}`);
//     setIsLoading(true);
//     setError('');
  
//     const formData = new FormData();
//     formData.append('file', file);
//     formData.append('sessionId', sessionId);
  
//     try {
//       const res = await axios.post('http://localhost:4000/upload', formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//         },
//       });
//       console.log(res);
//       const userData=res.data.content[0].data.extracted_fields
//       console.log(userData);
//        setUserData(userData);

//       addMessage('assistant', res.data.response || '✅ File uploaded and processed.');
//     } catch (err) {
//       setError('Failed to upload file. Please try again.');
//       addMessage('assistant', '❌ Failed to upload file.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleKeyPress = (e) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault()
//       handleSendMessage()
//     }
//   }

//   return (
//     <div className={`chat-container ${theme}`}>
//       <div className="chat-header">
//         <ThemeToggle theme={theme} onToggle={toggleTheme} />
//         <h1>Simple Chatbot</h1>
//         <p>Chat with me and upload files!</p>
//       </div>
      
//        <div className="chat-messages">
//         {messages.map((message,idx) => (
//           <ChatMessage key={idx} message={message} />
//         ))}


//          {userData && (
//   <div className="user-data-card">
//     <h3>📌 Extracted User Details</h3>
//     <ul>
//       <li><strong>Full Name:</strong> {userData.full_name}</li>
//       <li><strong>Date of Birth:</strong> {userData.dob}</li>
//       <li><strong>Father's Name:</strong> {userData.father_name}</li>
//       <li><strong>Gender:</strong> {userData.gender}</li>
//       <li><strong>Aadhaar Number:</strong> {userData.aadhaar_number}</li>
//       <li><strong>Address:</strong> {userData.address}</li>
//     </ul>
//   </div>
// )}
//         {isTyping && (
//           <div className="typing-indicator">
//             <div className="typing-dots">
//               <span></span>
//               <span></span>
//               <span></span>
//             </div>
//             <span className="typing-text">Bot is typing...</span>
//           </div>
//         )}

             


//       </div> 




//       <div className="chat-input-container">
//         <FileUpload onFileUpload={handleFileUpload} />
//         <div className="input-group">
//           <textarea
//             value={inputText}
//             onChange={(e) => setInputText(e.target.value)}
//             onKeyPress={handleKeyPress}
//             placeholder="Type your message..."
//             className="message-input"
//             rows="1"
//           />
//           <button 
//             onClick={handleSendMessage}
//             className="send-button"
//             disabled={!inputText.trim()}
//           >
//             Send
//           </button>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default App







import React, { useState, useEffect} from 'react';
import { useTheme } from './hooks/useTheme'
import axios from 'axios';
import ChatMessage from './components/ChatMessage'
import FileUpload from './components/FileUpload'
import ThemeToggle from './components/ThemeToggle'
import './App.css'

function App() {
  const { theme, toggleTheme } = useTheme()
  const [messages, setMessages] = useState([
    { role: 'bot', content: "Hello! I'm your chatbot assistant. How can I help you today?"}
  ])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [userData, setUserData] = useState(null);

  // Generate and persist sessionId
  useEffect(() => {
    const id = localStorage.getItem('sessionId');
    if (id) {
      setSessionId(id);
    } else {
      const newId = 'session-' + Date.now();
      localStorage.setItem('sessionId', newId);
      setSessionId(newId);
    }
  }, []);

  const addMessage = (role, content) => {
    setMessages(prev => [...prev, { role, content }]);
  };  

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = inputText.trim();
    setInputText('');
    addMessage('user', userMessage);
    setIsLoading(true);
    setError('');

    try {
      const res = await axios.post('http://localhost:4000/chat', {
        message: userMessage,
        sessionId,
      });


      let botResponse = res.data.response;
      console.log("in line 240",botResponse);
      

    // If response is JSON-like string, try parsing
    try {
      const parsed = JSON.parse(botResponse);
      console.log("converting");
      console.log("in line 242",parsed);
      // Format JSON into clean string (key: value pairs)
      botResponse = Object.entries(parsed)
        .map(([key, value]) => `${key}: ${value}`)
        .join("\n\n");
    } catch (e) {
      // not JSON, keep as plain text
    }
    console.log("in line 254",botResponse);

    addMessage('assistant', botResponse);
    } catch (error) {
      setError('Failed to send message. Please try again.');
      addMessage('assistant', '❌ Error occurred while fetching response.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
  
    addMessage('user', `📄 Uploaded file: ${file.name}`);
    setIsLoading(true);
    setError('');
  
    const formData = new FormData();
    formData.append('file', file);
    formData.append('sessionId', sessionId);
  
    try {
      const res = await axios.post('http://localhost:4000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const extractedData = res.data.content[0].data.extracted_fields;
      setUserData(extractedData);

      // Instead of a separate card, push extracted object into chat messages
      addMessage('assistant', {
        type: 'userData',
        data: extractedData
      });

    } catch (err) {
      setError('Failed to upload file. Please try again.');
      addMessage('assistant', '❌ Failed to upload file.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className={`chat-container ${theme}`}>
      <div className="chat-header">
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
        <h1>Simple Chatbot</h1>
        <p>Chat with me and upload files!</p>
      </div>
      
      <div className="chat-messages">
        {messages.map((message, idx) => (
          <div key={idx}>
            {typeof message.content === 'string' ? (
              <ChatMessage message={message} />
            ) : message.content?.type === 'userData' ? (
              <div className="chat-message bot">
                <div className="user-data-card">
                  <h3>📌 Extracted User Details</h3>
                  <ul>
                    <li><strong>Full Name:</strong> {message.content.data.full_name}</li>
                    <li><strong>Date of Birth:</strong> {message.content.data.dob}</li>
                    <li><strong>Father's Name:</strong> {message.content.data.father_name}</li>
                    <li><strong>Gender:</strong> {message.content.data.gender}</li>
                    <li><strong>Aadhaar Number:</strong> {message.content.data.aadhaar_number}</li>
                    <li><strong>Address:</strong> {message.content.data.address}</li>
                  </ul>
                </div>
              </div>
            ) : null}
          </div>
        ))}
        {isTyping && (
          <div className="typing-indicator">
            <div className="typing-dots">
              <span></span><span></span><span></span>
            </div>
            <span className="typing-text">Bot is typing...</span>
          </div>
        )}
      </div> 

      <div className="chat-input-container">
        <FileUpload onFileUpload={handleFileUpload} />
        <div className="input-group">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="message-input"
            rows="1"
          />
          <button 
            onClick={handleSendMessage}
            className="send-button"
            disabled={!inputText.trim()}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}

export default App;
