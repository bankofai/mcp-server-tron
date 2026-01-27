import { spawn } from "child_process";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const serverPath = join(__dirname, "../src/index.ts");

async function runIntegrationTest() {
  console.log("🚀 Starting Integration Test via Stdio...");

  const serverProcess = spawn("npx", ["tsx", serverPath], {
    env: {
      ...process.env,
      TRON_PRIVATE_KEY: "0000000000000000000000000000000000000000000000000000000000000001", // Dummy key
    },
    stdio: ["pipe", "pipe", "inherit"], // Pipe stdin/stdout, inherit stderr
  });

  const send = (msg: any) => {
    const str = JSON.stringify(msg);
    serverProcess.stdin.write(str + "\n");
  };

  let buffer = "";

  // Helper to wait for a specific response
  const waitForResponse = (id: string | number): Promise<any> => {
    return new Promise((resolve, reject) => {
      const onData = (data: Buffer) => {
        buffer += data.toString();
        const lines = buffer.split("\n");
        buffer = lines.pop() || ""; // Keep incomplete line in buffer

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const json = JSON.parse(line);
            if (json.id === id) {
              serverProcess.stdout.off("data", onData); // Stop listening once found
              resolve(json);
            }
          } catch (_e) {
            // Ignore non-JSON lines (logs)
          }
        }
      };
      serverProcess.stdout.on("data", onData);

      // Timeout
      setTimeout(() => {
        serverProcess.stdout.off("data", onData);
        reject(new Error(`Timeout waiting for response to ${id}`));
      }, 5000);
    });
  };

  try {
    // 1. Initialize
    console.log("1️⃣  Sending Initialize...");
    const initPromise = waitForResponse(1);
    send({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: { name: "test-client", version: "1.0.0" },
      },
    });
    const initRes = await initPromise;
    console.log("✅ Initialize Result:", initRes.result.serverInfo);

    // 2. Initialized Notification
    send({
      jsonrpc: "2.0",
      method: "notifications/initialized",
    });

    // 3. List Tools
    console.log("2️⃣  Listing Tools...");
    const toolsPromise = waitForResponse(2);
    send({
      jsonrpc: "2.0",
      id: 2,
      method: "tools/list",
    });
    const toolsRes = await toolsPromise;
    const toolNames = toolsRes.result.tools.map((t: any) => t.name);
    console.log(`✅ Found ${toolNames.length} tools:`, toolNames.join(", "));

    if (!toolNames.includes("get_balance") || !toolNames.includes("transfer_trx")) {
      throw new Error("Missing expected tools!");
    }

    // 4. Call a Tool (get_supported_networks)
    console.log("3️⃣  Calling get_supported_networks...");
    const callPromise = waitForResponse(3);
    send({
      jsonrpc: "2.0",
      id: 3,
      method: "tools/call",
      params: {
        name: "get_supported_networks",
        arguments: {},
      },
    });
    const callRes = await callPromise;
    console.log("✅ Tool Result:", JSON.parse(callRes.result.content[0].text));

    console.log("🎉 Integration Test Passed!");
  } catch (error) {
    console.error("❌ Test Failed:", error);
    process.exit(1);
  } finally {
    serverProcess.kill();
  }
}

runIntegrationTest();
