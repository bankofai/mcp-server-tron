// Polyfill for protobuf generated code issues in Bun
// google-protobuf generated code often expects 'proto' to be globally available or implicitly defined
// especially when using CommonJS/Closure style.

// This file must be imported BEFORE any other imports that might load tronweb
if (typeof globalThis.proto === 'undefined') {
    // @ts-ignore
    globalThis.proto = {};
}

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import startServer from "./server/server.js";

// Start the server
async function main() {
  try {
    const server = await startServer();
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("TRON MCP Server running on stdio");
  } catch (error) {
    console.error("Error starting MCP server:", error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
