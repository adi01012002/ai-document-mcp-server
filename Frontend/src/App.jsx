

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







import { useState, useEffect} from 'react';
import { useTheme } from './hooks/useTheme'
import axios from 'axios';
import ChatMessage from './components/ChatMessage'
import FileUpload from './components/FileUpload'
import ThemeToggle from './components/ThemeToggle'
import './App.css'
// const END_URL = 'http://localhost:4000';
const END_URL = 'https://ai-document-mcp-server-1.onrender.com';

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
    setIsTyping(true);
    setError('');

    try {
      const res = await axios.post(`${END_URL}/chat`, {
        message: userMessage,
        sessionId,
      }, {
        timeout: 120000, // 2 minutes timeout for AI processing
      });

      let botResponse = res.data.response;

      // If response is JSON-like string, try parsing
      try {
        const parsed = JSON.parse(botResponse);
        // Format JSON into clean string (key: value pairs)
        botResponse = Object.entries(parsed)
          .map(([key, value]) => `${key}: ${value}`)
          .join("\n\n");
      } catch (e) {
        // not JSON, keep as plain text
      }

      addMessage('assistant', botResponse);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMsg = error.code === 'ECONNABORTED' 
        ? '⏱️ Request timed out. The server is taking too long to respond. Please try again.'
        : error.response?.data?.error 
        ? `❌ ${error.response.data.error}`
        : '❌ Failed to send message. Please check your connection and try again.';
      
      setError(errorMsg);
      addMessage('assistant', errorMsg);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
  
    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      const errorMsg = '❌ File too large. Maximum size is 10MB.';
      setError(errorMsg);
      addMessage('assistant', errorMsg);
      return;
    }

    addMessage('user', `📄 Uploaded file: ${file.name}`);
    addMessage('assistant', '⏳ Processing your document... This may take 30-60 seconds for OCR and AI extraction.');
    setIsLoading(true);
    setIsTyping(true);
    setError('');
  
    const formData = new FormData();
    formData.append('file', file);
    formData.append('sessionId', sessionId);
  
    try {
      const res = await axios.post(`${END_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 180000, // 3 minutes timeout for file processing (OCR can be slow)
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`Upload progress: ${percentCompleted}%`);
        }
      });

      const extractedData = res.data.content[0]?.data?.extracted_fields;
      
      if (!extractedData) {
        throw new Error('No data extracted from document');
      }

      // Push extracted object into chat messages
      addMessage('assistant', {
        type: 'userData',
        data: extractedData
      });

    } catch (err) {
      console.error('Upload error:', err);
      const errorMsg = err.code === 'ECONNABORTED'
        ? '⏱️ Upload timed out. Large files or slow OCR processing can take time. Please try again or use a smaller file.'
        : err.response?.data?.error
        ? `❌ ${err.response.data.error}`
        : '❌ Failed to upload file. Please check the file format and try again.';
      
      setError(errorMsg);
      addMessage('assistant', errorMsg);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
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
        {error && (
          <div className="error-banner" style={{
            padding: '10px',
            margin: '10px',
            backgroundColor: '#fee',
            border: '1px solid #fcc',
            borderRadius: '5px',
            color: '#c00'
          }}>
            {error}
          </div>
        )}
        
        {messages.map((message, idx) => (
  <div key={idx}>
    {typeof message.content === 'string' ? (
      <ChatMessage message={message} />
    ) : message.content?.type === 'userData' ? (
      <div className="chat-message bot">
        <div className="user-data-card">
          <h3>📌 Extracted Details</h3>
          <ul>
            {Object.entries(message.content.data).map(([key, value]) => (
              <li key={key}>
                <strong>{key.replace(/_/g, " ")}:</strong> {value || "—"}
              </li>
            ))}
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
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="message-input"
            rows="1"
            disabled={isLoading}
          />
          <button 
            onClick={handleSendMessage}
            className="send-button"
            disabled={!inputText.trim() || isLoading}
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default App;
