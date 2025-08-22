import { useState } from 'react'
import './FileUpload.css'

function FileUpload({ onFileUpload }) {
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e) => {
    e.preventDefault()
    console.log(e.target.files[0]);
    
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (file) => {
    // Basic file size validation (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB')
      return
    }
    
    onFileUpload(file)
  }

  return (
    <div className="file-upload-container">
      <input
        type="file"
        id="file-upload"
        onChange={handleChange}
        style={{ display: 'none' }}
        accept=".txt,.pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
      />
      
      <label
        htmlFor="file-upload"
        className={`file-upload-button ${dragActive ? 'drag-active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        📎
      </label>
    </div>
  )
}

export default FileUpload