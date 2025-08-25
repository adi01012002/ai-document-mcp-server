import express from "express"
import { Server } from "@modelcontextprotocol/sdk/server/index.js"
import { AIAgentMCPServer } from "./server.js"


const server = new AIAgentMCPServer(
    new Server({
        name: "ai-mcp-server",
        version: "1.0.0"
    }, {
        capabilities: {
            tools: {},
            logging: {}
        }
    })
)


const app = express();
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

const router = express.Router();

// endpoint for the client to use for sending messages
const MCP_ENDPOINT = "/mcp"

// MCP endpoint handlers
router.post(MCP_ENDPOINT, async (req, res) => {
  console.log("mcp end point ");  
  try {
    await server.handlePostRequest(req, res);
  } catch (error) {
    console.error("Error in POST handler:", error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: {
          code: -32000,
          message: "Internal server error",
        },
        id: null,
      });
    }
  }
});

router.get(MCP_ENDPOINT, async (req, res) => {
  try {
    await server.handledGetRequest(req, res);  
  } catch (error) {
    console.error("Error in GET handler:", error);
    if (!res.headersSent) {
      res.status(405).set("Allow", "POST").send("Method Not Allowed");
    }
  }
});


app.use('/', router)

const PORT = 3000
app.listen(PORT, () => {
    console.log(`MCP Streamable HTTP Server listening on port ${PORT}`)
})

process.on('SIGINT', async () => {
    console.log('Shutting down server...')
    await server.cleanup()
    process.exit(0)
})