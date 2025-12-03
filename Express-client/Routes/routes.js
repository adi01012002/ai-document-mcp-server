import express from "express";
const router=express.Router();
import multer from "multer";
import {client} from "../client.js"
import {tools} from "../client.js"
    
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/chat", async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: "Message parameter is required and cannot be empty",
      });
    }

    const finalSessionId = client.sessionId;
    
    console.log(`💬 Chat request [${finalSessionId}]: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`);
    
    const result = await client.chat(message);
    
    if (!result.success) {
      throw new Error(result.error || "Chat processing failed");
    }

    const response = result.response || "No response generated";

    res.json({
      success: true,
      message,
      response,
      sessionId: result.sessionId || finalSessionId,
      toolsUsed: result.toolsUsed || [],
      chatHistory: result.chatHistory || [],
      timestamp: new Date().toISOString(),
    });
     
  } catch (error) {
    console.error("❌ Error processing chat request:", error.message);
    res.status(500).json({
      success: false,
      error: error.message || "Chat request failed",
      sessionId: client.sessionId,
      timestamp: new Date().toISOString(),
    });
  }
});


router.post("/upload", upload.single("file"), async (req, res) => {
  const sessionId = client.sessionId; 
  console.log('📂 File upload request for session:', sessionId);
  
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ 
        success: false,
        error: "No file uploaded" 
      });
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return res.status(400).json({ 
        success: false,
        error: "File too large. Maximum size is 10MB." 
      });
    }

    // Validate file type
    const allowedTypes = ['pdf', 'png', 'jpg', 'jpeg', 'webp', 'txt'];
    const fileType = file.originalname.split(".").pop().toLowerCase();
    
    if (!allowedTypes.includes(fileType)) {
      return res.status(400).json({ 
        success: false,
        error: `Unsupported file type. Allowed: ${allowedTypes.join(', ')}` 
      });
    }

    const buffer = file.buffer;
    const base64 = buffer.toString("base64");

    console.log(`Processing ${fileType} file: ${file.originalname} (${(file.size / 1024).toFixed(2)} KB)`);

    const toolName = "extractTextFromFile";
    const args = { fileBase64: base64, fileType, sessionId };
    
    const tool = tools.find((t) => t.name === toolName);
    if (!tool) {
      throw new Error(
        `Tool '${toolName}' not found. Available tools: ${tools
          .map((t) => t.name)
          .join(", ")}`
      );
    }

    // Increase timeout to 3 minutes for OCR processing
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("File processing timeout - OCR or AI extraction took too long")), 180000);
    });
    
    const callPromise = client.callTool(toolName, args);
    const result = await Promise.race([callPromise, timeoutPromise]);

    if (!result.success) {
      throw new Error(result.error || "File processing failed");
    }

    res.json({
      success: true,
      fileName: file.originalname,
      fileType,
      sessionId,
      ...result,
    });
  } catch (err) {
    console.error("❌ Error in /upload:", err.message);
    res.status(500).json({ 
      success: false,
      error: err.message || "File upload failed" 
    });
  }
});

export default router;