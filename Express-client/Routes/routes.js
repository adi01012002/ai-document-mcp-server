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
    console.log(sessionId,"in chat");

    if (!message) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Message parameter is required",
      });
    }

    const finalSessionId = client.sessionId;
    
    console.log(
      `💬 Chat API request from session ${finalSessionId}: "${message}"`
    );
    const result = await client.chat(message);
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
    console.error("Error processing chat request:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      sessionId: req.sessionId,
      timestamp: new Date().toISOString(),
    });
  }
});


router.post("/upload", upload.single("file"), async (req, res) => {
  console.log("Upload request body:", req);
  const sessionId = client.sessionId; 
  console.log('Session ID:', sessionId);
  try {
    const file = req.file;   ///Connected with session ID
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const buffer = file.buffer; // raw binary
    const base64 = buffer.toString("base64");
    // console.log(file.mimetype);

    const fileType = file.originalname.split(".").pop().toLowerCase(); // 'pdf', 'txt', etc.

    console.log(`📂 File upload request for session ${sessionId}`);

    const toolName="extractTextFromFile";
    const args={ fileBase64:base64, fileType, sessionId };
     const tool = tools.find((t) => t.name === toolName);
      if (!tool) {
        throw new Error(
          `Tool '${toolName}' not found. Available tools: ${tools
            .map((t) => t.name)
            .join(", ")}`
        );
      } 
    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Tool loading timeout")), 30000);
      });
    const callPromise = client.callTool(toolName,args);
      const result = await Promise.race([callPromise, timeoutPromise]);

    res.json({
      fileName: file.originalname,
      fileType,
      sessionId,
      ...result,   //  5
    });
  } catch (err) {
    console.error("Error in /upload:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;