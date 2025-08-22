# AI Agent MCP Server

AI-powered Model Context Protocol server for intelligent document processing and chat with Google Gemini AI integration.

## Features

- Extract text from PDFs and images (OCR)
- Auto-detect document types (Aadhaar, PAN, Bank Statements, etc.)
- AI chat with context retention
- Session management with file storage
- RESTful API endpoints

## Prerequisites

- Node.js (v16+)
- Google Gemini API key

## Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. **Start servers**
   ```bash
   # Terminal 1 - MCP Server (port 3000)
   node index.js
   
   # Terminal 2 - Client API (port 4000)  
   node client.js
   ```

## API Endpoints

### Upload Document
```bash
POST http://localhost:4000/upload
# multipart/form-data with 'file' field
```

### Chat 
```bash
POST http://localhost:4000/chat
# JSON: {"message": "your question", "sessionId": "optional"}

```

## Usage Examples

```bash
# Upload document
curl -X POST http://localhost:4000/upload -F "file=@document.pdf"

# Ask about uploaded document  
curl -X POST http://localhost:4000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "check my pdf file for predefined rule"}'
```

## Project Structure

```
├──Express-client/
│   ├── client.js  # MCP client + Express API 
|   └── Routes/
|         └── routes.js      # API endpoint
|   
├──mcp/
│    ├── server.js
|    ├── index.js  
|    ├── utils/
|    │   ├── extractText.js    # PDF/OCR text extraction  
|    │   └── openAiExtractor.js 
|    └── .env               entry       point
|                            
└──frontend/

```

## Available Tools

- `extractTextFromFile` - Extract text from PDFs/images
- `askAboutUploadedText` - Query uploaded documents
- `runPredefinedChecks` - Automated document validation
- `chat` - Main conversation interface

## Document Types

Auto-detects: Aadhaar, PAN, Bank Statements, Salary Slips, Loan Applications