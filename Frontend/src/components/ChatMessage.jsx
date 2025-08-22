// import './ChatMessage.css'

// function ChatMessage({ message }) {
//   // const formatTime = (timestamp) => {
//   //   return timestamp.toLocaleTimeString('en-US', { 
//   //     hour: '2-digit', 
//   //     minute: '2-digit' 
//   //   })
//   // }

//   return (
//     <div className={`message ${message.role}`}>
//       <div className="message-content">
//         <div className="message-text">
//           {message.content}
//           {message.file && (
//             <div className="file-info">
//               <div className="file-icon">📁</div>
//               <div className="file-details">
//                 <span className="file-name">{message.file.name}</span>
//                 <span className="file-size">
//                   {(message.file.size / 1024).toFixed(2)} KB
//                 </span>
//               </div>
//             </div>
//           )}
//         </div>
//         <div className="message-time">
//           {/* {formatTime(message.timestamp)} */}
//         </div>
//       </div>
//     </div>
//   )
// }

// export default ChatMessage








import './ChatMessage.css'

function ChatMessage({ message }) {
  return (
    <div className={`message-row ${message.role}`}>
      <div className={`bubble ${message.role}`}>
        {typeof message.content === 'string' ? (
          <p>{message.content}</p>
        ) : message.content?.type === 'userData' ? (
          <div>
            <h3>📌 Extracted User Details</h3>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default ChatMessage
