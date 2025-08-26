import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { InitializeRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { randomUUID } from "crypto";
import { z } from "zod";
import dotenv from "dotenv"
import { GoogleGenerativeAI } from "@google/generative-ai";
import { extractText } from "./utils/extractText.js";
import { extractUserDetails } from "./utils/openAiExtractor.js";
dotenv.config();


const JSON_RPC = "2.0";

export class AIAgentMCPServer {  
  constructor(aiConfig = {}) {
    this.server = new McpServer(
      {
        name: "ai-agent-mcp-server",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: true,
        },
      }
    );

    // AI Configuration
    this.aiConfig = {
      provider: aiConfig.provider || "gemini",
      apiKey:
        aiConfig.apiKey ||
        process.env.GEMINI_API_KEY ,
      model: aiConfig.model || "gemini-2.0-flash",
      ...aiConfig,
    };
    this.sessionId=null

    // Initialize AI client
    this.initializeAI();

    // Session management
    this.transports = {}; // sessionId -> transport
    this.sessionData = {}; // sessionId -> { chatHistory: [], user: {} }

    // Tool registry for AI decision making
    this.toolRegistry = new Map();

    // Register all tools   
    this.registerTools();
  }

  initializeAI() {
    switch (this.aiConfig.provider) {
      case "gemini":
        this.aiClient = new GoogleGenerativeAI(this.aiConfig.apiKey);
        this.aiModel = this.aiClient.getGenerativeModel({
          model: this.aiConfig.model,
        });
        break;
      default:
        throw new Error(`Unsupported AI provider: ${this.aiConfig.provider}`);
    }
  }

  // Initialize session data   
  initializeSession(sessionId) {
    if (!this.sessionData[sessionId]) {
      this.sessionData[sessionId] = {
        chatHistory: [],
        uploadedFiles :[],
        user: {},
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
      };
      console.log(`📝 Initialized session data for: ${sessionId}`);
    }
    return this.sessionData[sessionId];
  }

  // Add message to chat history
  addToChatHistory(sessionId, role, message, toolCalls = null) {
    const session = this.initializeSession(sessionId);
    console.log(
      `📜 Adding message to chat history for session ${sessionId}: [${role}] ${message}`
    );
    const chatMessage = {
      id: sessionId,
      role,
      message,
      timestamp: new Date().toISOString(),
      toolCalls,
    };
    console.log("Chat message object:", session);
    console.log("Chat message:", chatMessage);
    session.chatHistory.push(chatMessage);
    session.lastActivity = new Date().toISOString();

    // Keep only last 50 messages to prevent memory issues
    if (session.chatHistory.length > 50) {
      session.chatHistory = session.chatHistory.slice(-50);
    }

    return chatMessage;
  }

  addUploadedFileData(sessionId, document_type, rawJson, finalText) {
    const session = this.initializeSession(sessionId);
  
    const fileData = {
      document_type,
      rawJson,
      finalText,
      timestamp: new Date().toISOString(),
    };
  
    if (!session.uploadedFiles) {
      session.uploadedFiles = [];
    }
  
    session.uploadedFiles.push(fileData);
  
    console.log(`📁 Added file data to session ${sessionId}:`, fileData);
  
    // Optional: Trim to last 20 files to save memory
    if (session.uploadedFiles.length > 20) {
      session.uploadedFiles = session.uploadedFiles.slice(-20);
    }
  
    return fileData;
  }
  

  // chat history for context
  getChatHistory(sessionId, limit = 10) {
    const session = this.initializeSession(sessionId);
    console.log(session.chatHistory);
    if (!session || !session.chatHistory) return [];
    return session.chatHistory  
  }
  registerTools() {
    // ----------------------------------------------------------------------
    // Tool: extractTextFromFile
    // ----------------------------------------------------------------------
    this.registerTool({
      name: "extractTextFromFile",
      description:
        "Extracts text from PDF, TXT, or image (base64 input) and stores it",
      schema: {
        fileBase64: z.string().describe("Base64-encoded file content"),
        fileType: z.string().describe("Type of file: pdf, txt, png, jpg"),
        sessionId: z
          .string()
          .optional()
          .describe("Session to store document under"),
      },
      handler: async ({ fileBase64, fileType, sessionId }) => {
        console.log("🔍 Extracting text from file...");
        let extractedText = "";
        extractedText = await extractText(fileBase64, fileType);
        console.log("aagaya djfjjffndkkf dji f ",extractedText);
        
        const userDetails = await extractUserDetails(extractedText);
        console.log("User Details in json formate " ,userDetails);
        
        

        const prompt = `Convert the following given JSON data into a single-line paragraph in natural English:${JSON.stringify(
          userDetails,
          null,
          2 
        )}
        Format for aadhar 
        "[Full Name], son of [Father Name], residing at [Address], was born on [DOB]. Aadhaar Number: [Number]. Gender: [Gender]."`;
        const res = await this.aiModel.generateContent(prompt);
        const finalResult = res.response.candidates[0]?.content?.parts[0]?.text;
        this.addUploadedFileData(sessionId, userDetails.document_type, userDetails, finalResult);
        console.log("Final result:", finalResult);
        
        this.addToChatHistory(sessionId, "user", userDetails);

        // Save text to session
        const sid = sessionId || randomUUID();
        
        return {
          content: [
            {
              type: "text",
              text: `Successfully extracted and saved text from your ${fileType} (session: ${sid})`,
              data: userDetails || {},
            },
          ],
          sessionId: sid,
          RawText: extractedText,
        };
      },
    });

    this.registerTool({
      name: "askAboutUploadedText",
      description: "Ask questions about previously uploaded document text",
      schema: {
        question: z.string().describe("Question about uploaded document"),
        sessionId: z.string().describe("Session ID with uploaded documents"),
      },

      handler: async (question, sessionId) => {
        console.log("question : ", question, "sessionId : ", sessionId);
        const session = this.sessionData[sessionId];
        console.log(session);
        if (!session) {
          return {
            content: [
              {
                type: "text",
                text: `No documents found in session ${sessionId}`,
              },
            ],
          };
        }

        let rawText="";
        for (const file of session.uploadedFiles) {
            rawText+=file.finalText;
          }

        const history = this.getChatHistory(sessionId, 5);

        console.log("history on handle chat",history);
        const context = history.map((m) => `${m.role}: ${m.message}`).join("\n");
        const fileText=session.uploadedFiles.map((m)=>{
          return m.finalText;
        })

        console.log("file data is ", fileText);
        console.log("context from chat history",context,"finish");

        
        const prompt = `
        You are an AI assistant that answers user questions using both chat history and uploaded document data. 

        ### Guidelines:
        - Always analyze the **latest user message** in the context of the previous conversation and uploaded documents.
        - If the user's message refers to something from the past (e.g., "explain that again", "what about the first point?"), use the chat history (\n${context}\n) to infer meaning.
        - If the user's message refers to content inside uploaded documents, extract and ground your answer from the provided file text.
        - If both apply, combine chat history and file data for the most accurate response.
        - Be concise but professional. If the answer is in the file, cite it clearly; if it's inferred from context, explain logically.

        ---

        ### Uploaded Document Data:
        ${fileText}

        ---

        ### Conversation History:
        ${context}
        and file data is ${rawText}

        ---

        ### User Question:
        ${question}

        ---

        ### Task:
        Provide the **best possible answer** to the user’s question by analyzing both the document and prior conversation. Ensure answers remain consistent with uploaded file content while maintaining the conversational flow.
        `;
        const response = await this.aiModel.generateContent(prompt);

        return {
          content: [
            {
              type: "text",  // extractUserDetails
              text: response.response.text().trim(),
            },
          ],
        };
      },
    });

    this.registerTool({
  name: "runPredefinedChecks",
  description: "Run predefined checks on previously uploaded document text",
  schema: {
    sessionId: z.string().describe("Session ID with uploaded documents"),
  },
  handler: async ( question,sessionId ) => {
    console.log("Running predefined checks for session:", sessionId);

    const session = this.sessionData[sessionId];
    if (!session) {
      return {
        content: [
          {
            type: "text",
            text: `No documents found in session ${sessionId}`,
          },
        ],
      };
    }

    // Combine all extracted text from uploaded files
    let rawText = "";
    for (const file of session.uploadedFiles) {
      rawText += file.finalText + "\n";
    }
    console.log("our uploaded files",session.uploadedFiles);
    

    // Predefined questions
    const predefinedQueries = [
      "Check customer data and find discrepancies if any.",
      "Check customer is belong to which state of india ",
      "Check if age is between 18-30 years.",
      "Check if salary is between ₹30,000-₹50,000 per month.",
      "Match salary in salary slip with bank statement.",
    ];

    // Run checks and store results
    let results = {};
    for (const query of predefinedQueries) {
      const prompt = `Document content:\n${rawText}\n\nTask: ${query}\nAnswer clearly:`;
      const response = await this.aiModel.generateContent(prompt);
      results[query] = response.response.text().trim();
    }

    // Return all answers
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(results, null, 2),
        },
      ],
    };
  },
});



   
    this.registerTool({
      name: "chat",
      description:
        "Main chat interface that processes user messages and maintains conversation history.",
      schema: {
        message: z.string().describe("The user's message or query"),
        sessionId: z
          .string()
          .optional()
          .describe("Session ID for maintaining chat history"),
      },
      handler: async ({ message, sessionId }) => {
        return await this.handleChatMessage(message, sessionId);
      },
    });

    // Get chat history tool  5
    this.registerTool({
      name: "getChatHistory",
      description: "Retrieves the chat history for a session.",
      schema: {
        sessionId: z.string().describe("Session ID to get history for"),
        limit: z
          .number()
          .optional()
          .describe("Number of recent messages to retrieve (default: 10)"),
      },
      handler: async ({ meassage=null ,sessionId=null,}) => {
        const session = this.initializeSession(this.sessionId);
        const history=session.chatHistory;
        console.log("chat history in handler function",session.chatHistory);
        return {
          content: [
            {
              type: "text",
              text: `Chat History fnnfjijwnsju osks soko djnjd d od (${history.length})`,
            },
          ],
        };
      },
    });

    // Utility tool for getting available tools
    this.registerTool({
      name: "listAvailableTools",
      description:
        "Lists all available tools and their descriptions. Use when user asks what can be done.",
      schema: {},
      handler: async () => {
        const toolList = Array.from(this.toolRegistry.values())
          .filter(
            (tool) =>
              !["listAvailableTools", "chat", "getChatHistory"].includes(
                tool.name
              )
          )
          .map((tool) => `- ${tool.name}: ${tool.description}`)
          .join("\n");

        return {
          content: [
            {
              type: "text",
              text: `Available tools:\n${toolList}`,
            },
          ],
        };
      },  //  5
    });
  }

  registerTool(toolConfig) {
    const { name, description, schema, handler } = toolConfig;

    this.toolRegistry.set(name, {
      name,
      description,
      schema,
      handler,
    });

    // d

    this.server.tool(name, description, schema, handler);
    console.log(`✅ Registered tool: ${name}`);
  }

  // ============================================
  // 🔧 COMPLETE FIX FOR MCP SERVER CHAT HANDLER
  // ============================================

  // Main chat handler: decides tool usage via AI
  async handleChatMessage(message, sessionId = null) {

    console.log("Message in handleChatMessage", message," with sessionId" , sessionId);
    if (!sessionId) sessionId = randomUUID();
    this.initializeSession(sessionId);
    this.addToChatHistory(sessionId, "user", message);

    const history = this.getChatHistory(sessionId, 5);

    console.log("history on handle chat",history);
    const context = history.map((m) => `${m.role}: ${m.message}`).join("\n");
    const session = this.initializeSession(sessionId)
    const fileText=session.uploadedFiles.map((m)=>{
      return m.finalText;
    })

    console.log("file data is ", fileText);


    console.log("context from chat history",context);
 

    // 🔍 List tool descriptions to inform LLM about capabilities   Chat message object:
    const availableTools = Array.from(this.toolRegistry.values())
      .filter((t) => t.name !== "chat")
      .map((t) => ({
        name: t.name,
        description: t.description,
        schema: t.schema.shape ? Object.keys(t.schema.shape) : [],
      }));

const planningPrompt = `
You are an AI assistant acting as a Tool Planner. Your task is to **analyze the user's latest message and the conversation context** to decide whether any tools should be called, and if so, which ones and with what arguments.

You must:
- Carefully reason about the user's intent (question, action request, or command).
- Use tools only when required and explain clearly why a tool is the best fit.
- Avoid calling tools that do not add value to the response.
- Only use getChatHistory when past context is needed for a response.
- Use listAvailableTools only when the user explicitly or implicitly requests knowledge of available tools.
- Use chat when the user is directly asking a question or seeking an answer without needing tool assistance.
- Use multiple tools only if strictly necessary to accomplish the task.

---

Available Tools:
${availableTools
  .map((t) => `- ${t.name}: ${t.description} (Args: ${t.schema.join(", ")})`)
  .join("\n")}

---

Instructions:

Based on the conversation context and user message, respond in this JSON format:

{
  "needsTools": true | false,
  "tools": [
    {
      "name": "<tool_name>",
      "args": { <tool_arguments> }
    }
  ],
  "reasoning": "Explain in detail WHY the tool(s) were chosen, referencing user's intent and message content"
}

---

Conversation History:
${context} and uploaded file data text summary is ${fileText}

User Message:
"${message}"
`;


    let toolPlanRaw;
    try {
      const analysisResp = await this.aiModel.generateContent(planningPrompt);
      console.log(
        "analysisResp : ",
        analysisResp.response.candidates[0].content.parts[0]
      );
      toolPlanRaw = analysisResp.response
        .text()
        .trim()
        .replace(/```json|```/g, "");
    } catch (err) {
      console.error("🧠 Tool planning error:", err.message);
    }

    let plan;
    try {
      plan = JSON.parse(toolPlanRaw);
    } catch {
      plan = {
        needsTools: false,
        tools: [],
        reasoning: "LLM response was not valid JSON",
      };
    }

    let finalText = "";
    const toolCalls = [];

    if (plan.needsTools && plan.tools.length) {
      for (const toolCall of plan.tools) {
        const tool = this.toolRegistry.get(toolCall.name);
        if (!tool) {
          toolCalls.push({
            tool: toolCall.name,
            success: false,
            error: "Tool not registered",
          });
          continue;
        }
        console.log("tool : ", tool);
        console.log("toolCall.args", toolCall);

        try {
            const result = await tool.handler(
              message,
              sessionId // inject sessionId if needed
            );
          const textOut = result.content?.[0]?.text || "";
          finalText += textOut + "\n\n";
          toolCalls.push({
            tool: toolCall.name,
            success: true,
            result: textOut,
            args: toolCall.args,
          });
        } catch (err) {
          toolCalls.push({
            tool: toolCall.name,
            success: false,
            error: err.message,
          });
        }
      }
    } else {
      // Fallback: Just chat like a normal assistant 
      const chatPrompt = `You are a helpful assistant. Respond to: "${message}"`;
      const fallbackResp = await this.aiModel.generateContent(chatPrompt);
      finalText = fallbackResp.response.text().trim();
    }

    this.addToChatHistory(sessionId, "assistant", finalText, toolCalls);


    return {
      content: [{ type: "text", text: finalText }],
      sessionId,
      toolsUsed: toolCalls,
      chatHistory: this.getChatHistory(sessionId, 5),
    };
  }

  convertZodSchemaToJSON(zodSchema) {
    const properties = {};
    const required = [];

    for (const [key, value] of Object.entries(zodSchema)) {
      if (value._def) {
        properties[key] = {
          type: this.dZodType(value),
          description: value.description || `Parameter ${key}`,
        };

        if (!value.isOptional()) { 
          required.push(key);
        }
      }
    }

    return {
      type: "object",
      properties,
      required,
    };
  }

  dZodType(zodType) {
    const typeName = zodType._def.typeName;
    switch (typeName) {
      case "ZodString":
        return "string";
      case "ZodNumber":
        return "number";
      case "ZodBoolean":
        return "boolean";
      case "ZodArray":
        return "array";
      case "ZodObject":
        return "object";
      default:
        return "string";
    }
  }

  async handledGetRequest(req, res) {
    console.log("request received - Method not allowed for MCP");
    if (res.headersSent) return;
    res.status(405).set("Allow", "POST").send("Method Not Allowed");
  }

  async handlePostRequest(req, res) {

    console.log("handle PostRequest");
    

    console.log("first req.body ",req.body);
    
    
    console.log("first mcp server post request");
    const sessionId = req.headers["mcp-session-id"];
    console.log("POST request received, Session ID:", sessionId);
    this.sessionId=sessionId;

    if (res.headersSent) {
      console.log("Response already sent, ignoring request");
      return;
    }

    let transport;

    try {
      // Handle existing session
      if (sessionId && this.transports[sessionId]) {
        transport = this.transports[sessionId];
        console.log("Reusing existing transport for session:", sessionId);

       

        try {
          // New session created
          await transport.handleRequest(req, res, req.body);
        } catch (error) {
          console.error(
            "Error handling request with existing transport:",
            error
          );
          if (!res.headersSent) {
            res.status(500).json(this.createErrorResponse("Transport error"));
          }
        }
        return;
      }

      console.log("handle post request",req.body);

      // Handle new session (initialization request)
      if (this.isInitializeRequest(req.body)) {
        console.log("Creating new transport for initialization");

        transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => randomUUID(),
        });
        console.log("hu");
        
        await this.server.connect(transport);
        await transport.handleRequest(req, res, req.body);
  

        const newSessionId = transport.sessionId;

        if (newSessionId) {
          this.transports[newSessionId] = transport;
          this.initializeSession(newSessionId); 
          console.log("New transport created for session:", newSessionId);
        }

        return;
      }

      console.log(
        "Invalid request - not an initialize request and no valid session"
      );
      if (!res.headersSent) {
        res
          .status(400)
          .json(
            this.createErrorResponse(
              "Bad Request: invalid session ID or not an initialize request"
            )
          );
      }
    } catch (error) {
      console.error("Error handling MCP request:", error);
      if (!res.headersSent) {
        res.status(500).json(this.createErrorResponse("Internal server error"));
      }
    }
  }

  createErrorResponse(message) {
    return {
      jsonrpc: JSON_RPC,
      error: {
        code: -32000,
        message,
      },
      id: randomUUID(),
    };
  }

  isInitializeRequest(body) {
    const isInitial = (data) => {
      try {
        const result = InitializeRequestSchema.safeParse(data);
        return result.success;
      } catch (error) {
        console.error("Error parsing initialize request:", error);
        return false;
      }
    };

    if (Array.isArray(body)) {
      return body.some((req) => isInitial(req));
    }
    return isInitial(body);
  } //New session created

  async cleanup() {
    console.log("Cleaning up AI Agent MCP server...");

    // Clean up transports
    for (const [sessionId, transport] of Object.entries(this.transports)) {
      try {
        await transport.close();
        console.log(`Closed transport for session ${sessionId}`);
      } catch (error) {
        console.error(
          `Error closing transport for session ${sessionId}:`,
          error
        );
      }
    }

    // Clean up session data
    this.transports = {};
    this.sessionData = {};
  }
}
