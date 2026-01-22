import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getSupportedNetworks } from "./chains.js";

/**
 * Register TRON-related resources with the MCP server
 *
 * Resources are application-driven, read-only data that clients can explicitly load.
 * For an AI agent use case, most data should be exposed through tools instead,
 * which allow the model to discover and autonomously fetch information.
 *
 * The supported_networks resource provides a static reference list that clients
 * may want to browse when configuring which networks to use.
 *
 * @param server The MCP server instance
 */
export function registerTRONResources(server: McpServer) {
  server.registerResource(
    "supported_networks",
    "tron://networks",
    { description: "Get list of all supported TRON networks and their configuration", mimeType: "application/json" },
    async (uri) => {
      try {
        const networks = getSupportedNetworks();
        return {
          contents: [{
            uri: uri.href,
            text: JSON.stringify({ supportedNetworks: networks }, null, 2)
          }]
        };
      } catch (error) {
        return {
          contents: [{
            uri: uri.href,
            text: `Error: ${error instanceof Error ? error.message : String(error)}`
          }]
        };
      }
    }
  );
}
