import { describe, it, expect, beforeEach } from "vitest";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerTRONTools } from "../../src/core/tools";

const USDT_ADDRESS_NILE = "TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf";
const TEST_ADDRESS = "T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb";

describe("TRON Tools Integration (Nile)", () => {
  let server: McpServer;
  let registeredTools: Map<string, any>;

  beforeEach(() => {
    server = new McpServer({
      name: "test-server",
      version: "1.0.0",
    });

    // Track registered tools
    registeredTools = new Map();
    const originalRegisterTool = server.registerTool.bind(server);
    server.registerTool = (name: string, schema: any, handler: any) => {
      registeredTools.set(name, { schema, handler });
      return originalRegisterTool(name, schema, handler);
    };

    registerTRONTools(server);
  });

  it("get_balance should return real balance from Nile", async () => {
    const tool = registeredTools.get("get_balance");
    const result = await tool.handler({
      address: TEST_ADDRESS,
      network: "nile",
    });

    expect(result.isError).toBeUndefined();
    const content = JSON.parse(result.content[0].text);
    expect(content.network).toBe("nile");
    expect(content.address).toBe(TEST_ADDRESS);
    expect(Number(content.balance.trx)).toBeGreaterThan(0);
  }, 20000);

  it("get_token_balance should return USDT balance from Nile", async () => {
    const tool = registeredTools.get("get_token_balance");
    const result = await tool.handler({
      address: TEST_ADDRESS,
      tokenAddress: USDT_ADDRESS_NILE,
      network: "nile",
    });

    expect(result.isError).toBeUndefined();
    const content = JSON.parse(result.content[0].text);
    expect(content.tokenAddress).toBe(USDT_ADDRESS_NILE);
    expect(content.balance.symbol).toBe("USDT");
  }, 20000);

  it("read_contract should return name for USDT on Nile", async () => {
    const tool = registeredTools.get("read_contract");
    const result = await tool.handler({
      contractAddress: USDT_ADDRESS_NILE,
      functionName: "name",
      network: "nile",
    });

    expect(result.isError).toBeUndefined();
    const content = JSON.parse(result.content[0].text);
    expect(content.result).toContain("Tether USD");
  }, 20000);

  it("get_chain_info should return info for Nile", async () => {
    const tool = registeredTools.get("get_chain_info");
    const result = await tool.handler({ network: "nile" });

    expect(result.isError).toBeUndefined();
    const content = JSON.parse(result.content[0].text);
    expect(content.network).toBe("nile");
    expect(content.rpcUrl).toContain("nile");
  }, 20000);

  it("multicall should work with real contracts on Nile", async () => {
    const tool = registeredTools.get("multicall");
    const result = await tool.handler({
      calls: [
        {
          address: USDT_ADDRESS_NILE,
          functionName: "name",
          abi: [{ name: "name", type: "function", inputs: [], outputs: [{ type: "string" }] }],
        },
        {
          address: USDT_ADDRESS_NILE,
          functionName: "symbol",
          abi: [{ name: "symbol", type: "function", inputs: [], outputs: [{ type: "string" }] }],
        },
      ],
      network: "nile",
    });

    expect(result.isError).toBeUndefined();
    const content = JSON.parse(result.content[0].text);
    expect(content.count).toBe(2);
    expect(content.results[0].result).toBe("Tether USD");
    expect(content.results[1].result).toBe("USDT");
  }, 20000);
});
