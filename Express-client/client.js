
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { URL } from "url";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import cors from "cors"
import express from "express";
import router from "./Routes/routes.js"
export let tools = [];

export class AIAgentMCPClient {
  constructor(serverName) {
    console.log(serverName);
    this.client = new Client({
      name: `ai-agent-client-for-${serverName}`,
      version: "1.0.0",
    }); 

    this.transport = null;
    
    this.connected = false;
    this.isCompleted = false;
    this.sessionId = null;
    this.chatHistory = [];
}


  async connectToServer(serverUrl) {
    console.log(serverUrl)
    const url = new URL(serverUrl);
    console.log(`🔗 Connecting to AI Agent MCP server at ${url}`);

    try {
      this.transport = new StreamableHTTPClientTransport(url);
      this.setUpTransport();
      console.log("transport",this.transport)

      await this.client.connect(this.transport);
      this.connected = true;
      this.sessionId = this.transport.sessionId;

      console.log(
        this.sessionId
          ? `🔌 Connected with session ID: ${this.sessionId}`
          : "🔌 Connected without session ID"
      );
      console.log("✅ Connected to AI Agent MCP server");

      await this.loadTools();
    } catch (e) {
      console.error("❌ Failed to connect to AI Agent MCP server:", e);
      this.connected = false;
      throw e;
    }
  }

  setUpTransport() {
    console.log("🔧 Setting up transport event handlers...");
    if (!this.transport) return;

    this.transport.onclose = () => {
      console.log("🔌 Transport closed.");
      this.isCompleted = true;
      this.connected = false;
    };

    this.transport.onerror = async (error) => {
      console.error("⚠️ Transport error:", error); // Assistant
      this.connected = false;
      await this.cleanup();
    };

    this.transport.onmessage = (message) => {
      // Only log non-routine messages
      if (message.method !== "notifications/message") {
        console.log("📨 Server message:", message);
      }
    };
  }

  async loadTools() {
    try {
      if (!this.client || !this.connected) {
        throw new Error("AI Agent MCP Client not connected");
      }

      console.log("📋 Loading tools from AI Agent MCP server...");

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Tool loading timeout")), 30000);
      });

      const mcpToolsPromise = this.client.listTools();
      console.log(mcpToolsPromise)
      const mcpToolsResult = await Promise.race([mcpToolsPromise, timeoutPromise]);
      console.log("mcpToolsResult",mcpToolsResult)

      tools = mcpToolsResult.tools.map((tool) => ({
        name: tool.name,
        description: tool.description,
        parameters: {
          type: (tool.inputSchema && tool.inputSchema.type) || "object",
          properties: (tool.inputSchema && tool.inputSchema.properties) || {},
          required: (tool.inputSchema && tool.inputSchema.required) || [],
        },
        _mcpTool: tool,
      }));

      console.log(`📋 Loaded ${tools.length} tools:`);
      tools.forEach((tool) => {
        console.log(`  🔧 ${tool.name}: ${tool.description}`);
      });

      return tools;
    } catch (error) {
      console.error("❌ Failed to load tools:", error);
      tools = [];
      throw error;
    }
  }   

  getTools() {
    return tools;
  }

  async callTool(toolName, args = {}) {
    console.log(toolName , args);
    
    try {
      if (!this.connected) {
        throw new Error("AI Agent MCP Client not connected");
      }

      const tool = tools.find((t) => t.name === toolName);
      if (!tool) {
        throw new Error(
          `Tool '${toolName}' not found. Available tools: ${tools
            .map((t) => t.name)
            .join(", ")}`
        );
      } 
      // getTool
      console.log(`⚙️ Calling tool: ${toolName}`);
      if (toolName !== "chat" && Object.keys(args).length > 0) { 
        console.log(`   Arguments:`, args);
      }

      const start = Date.now();

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Tool call timeout")), 60000);
      });

      const callPromise = this.client.callTool({
        name: toolName,
        arguments: args,
      });

      const result = await Promise.race([callPromise, timeoutPromise]);
      const duration = Date.now() - start;

      console.log(`✅ Tool '${toolName}' executed in ${duration}ms`);

      return {
        success: true,
        toolName,
        result,
        duration,
        content: result.content || [],
      };
    } catch (error) {
      console.error(`❌ Error calling tool '${toolName}':`, error.message);
      return {
        success: false,
        toolName,
        error: error.message,
        content: [{ type: "text", text: `Tool failed: ${error.message}` }],
      };
    }
  }

    // Main chat method - processes messages and maintains history
      async chat(message) {
        console.log(`\n💬 You: ${message}`);
        console.log("━".repeat(50));

        const result = await this.callTool("chat", {
          message,
          sessionId: this.sessionId,
        });

        if (result.success && result.content.length > 0) {  
          const response = result.content[0].text; 
          console.log(`🤖 Assistant: ${response}`);

          // Update local chat history if available
          if (result.result.chatHistory) {
            this.chatHistory = result.result.chatHistory;
          }

          // Show tools used if any
          if (result.result.toolsUsed && result.result.toolsUsed.length > 0) {
            console.log(`\n🔧 Tools used: ${result.result.toolsUsed.map(t => t.tool).join(', ')}`);
          }

          console.log("━".repeat(50));
          return {  
            response,
            toolsUsed: result.result.toolsUsed || [],
            sessionId: result.result.sessionId || this.sessionId,
            success: true
          };
        } else {
          const errorMsg = `❌ Failed to process message: ${result.error}`;
          console.log(errorMsg);
          console.log("━".repeat(50));
          return {
            response: errorMsg,
            success: false,
            error: result.error
          };
        }
      }

  // Get chat history
  async getChatHistory(limit = 10) {
    const result = await this.callTool("getChatHistory", {
      sessionId: this.sessionId,
      limit
    });

    if (result.success) {
      return result.content[0].text;
    } else {
      return `Error retrieving chat history: ${result.error}`;
    }
  }


  // Legacy method for backward compatibility 
  async processQuery(query) {
    return await this.chat(query);
  }

  async cleanup() {
    try {
      this.connected = false;
      if (this.client) {
        await this.client.close();
      }
      console.log("🧹 AI Agent MCP client cleanup done.");
    } catch (error) {
      console.error("Error during cleanup:", error);
    }
  }
}



export const client = new AIAgentMCPClient("ai-agent-mcp-server");

async function main() {
    const app = express();
    app.use(express.json({ limit: "20mb" }));
    app.use(express.urlencoded({ extended: true, limit: "20mb" }));
    app.use(cors());
    app.use("/",router);
  try {
      await client.connectToServer("http://localhost:3000/mcp");

      app.listen(4000,()=>{
      console.log("Client app listening at http://localhost:4000");
      })    

    }catch (error) {
    console.error("❌ Main execution error:", error);
    }

}

main(); 

