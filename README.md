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


🚀 Setup Guide

Follow the steps below to run the Express Client and MCP Server.

1️⃣ Clone the Repository

 ```env
git clone <your-repo-url>
   ```


2️⃣ Setup Express Client

 ```env
cd Express-client
   ```


Install Dependencies


 ```env
npm install cors express multer
   ```


Start Express Client

 ```env
node client.js
   ```


3️⃣ Setup MCP Server

 ```env
cd ../mcp
   ```


Install Dependencies

 ```env
npm install @google/generative-ai @modelcontextprotocol/sdk dotenv express pdf-parse sharp tesseract.js zod
   ```


Start MCP Server
 ```env
node index.js
   ```

**Environment Setup**
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
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
|    ├── index.js        # Entry  point
|    ├── utils/
|    │   ├── extractText.js    # PDF/OCR text extraction  
|    │   └── openAiExtractor.js 
|    └── .env               
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