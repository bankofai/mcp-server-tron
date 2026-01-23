import { TronWeb } from "tronweb";
import { getTronWeb, getWallet } from "./clients.js";
import { MULTICALL2_ABI, MULTICALL3_ABI } from "./multicall-abi.js";

/**
 * Read from a smart contract (view/pure functions)
 */
export async function readContract(
  params: {
    address: string;
    functionName: string;
    args?: any[];
    abi?: any[]; // Optional, TronWeb can sometimes infer or fetch if we use .at()
  },
  network = "mainnet",
) {
  const tronWeb = getTronWeb(network);

  try {
    let contract;
    if (params.abi) {
      contract = tronWeb.contract(params.abi, params.address);
    } else {
      contract = await tronWeb.contract().at(params.address);
    }

    const method = contract.methods[params.functionName];
    if (!method) {
      throw new Error(`Function ${params.functionName} not found in contract`);
    }

    const args = params.args || [];
    const result = await method(...args).call();
    return result;
  } catch (error: any) {
    throw new Error(`Read contract failed: ${error.message}`);
  }
}

/**
 * Write to a smart contract (state changing functions)
 */
export async function writeContract(
  privateKey: string,
  params: {
    address: string;
    functionName: string;
    args?: any[];
    value?: string; // TRX value to send (in Sun)
    abi?: any[];
  },
  network = "mainnet",
) {
  const tronWeb = getWallet(privateKey, network);

  try {
    let contract;
    if (params.abi) {
      contract = tronWeb.contract(params.abi, params.address);
    } else {
      contract = await tronWeb.contract().at(params.address);
    }

    const method = contract.methods[params.functionName];
    if (!method) {
      throw new Error(`Function ${params.functionName} not found in contract`);
    }

    const args = params.args || [];
    const options: any = {};
    if (params.value) {
      options.callValue = params.value;
    }

    const txId = await method(...args).send(options);
    return txId;
  } catch (error: any) {
    throw new Error(`Write contract failed: ${error.message}`);
  }
}

/**
 * Fetch contract ABI via TronWeb (available for verified contracts)
 */
export async function fetchContractABI(contractAddress: string, network = "mainnet") {
  const tronWeb = getTronWeb(network);
  try {
    const contract = await tronWeb.trx.getContract(contractAddress);
    if (contract && contract.abi) {
      return contract.abi.entrys;
    }
    throw new Error("ABI not found in contract data");
  } catch (error: any) {
    throw new Error(`Failed to fetch ABI: ${error.message}`);
  }
}

/**
 * Parse ABI (helper to ensure correct format for TronWeb if needed)
 */
export function parseABI(abiJson: string | any[]): any[] {
  if (typeof abiJson === "string") {
    return JSON.parse(abiJson);
  }
  return abiJson;
}

/**
 * Get readable function signatures from ABI
 */
export function getReadableFunctions(abi: any[]) {
  return abi
    .filter((item) => item.type === "function")
    .map((item) => {
      const inputs = item.inputs
        ? item.inputs.map((i: any) => `${i.type} ${i.name}`).join(", ")
        : "";
      const outputs = item.outputs
        ? item.outputs.map((i: any) => `${i.type} ${i.name || ""}`).join(", ")
        : "";
      return `${item.name}(${inputs}) -> (${outputs})`;
    });
}

/**
 * Helper to get a specific function definition from ABI
 */
export function getFunctionFromABI(abi: any[], functionName: string) {
  const func = abi.find((item) => item.type === "function" && item.name === functionName);
  if (!func) {
    throw new Error(`Function ${functionName} not found in ABI`);
  }
  return func;
}

/**
 * Multicall (Simulated or Native Multicall2/3)
 */
export async function multicall(
  params: {
    calls: Array<{
      address: string;
      functionName: string;
      args?: any[];
      abi: any[];
      allowFailure?: boolean;
    }>;
    multicallAddress?: string;
    version?: 2 | 3;
    allowFailure?: boolean;
  },
  network = "mainnet",
) {
  const { calls, version = 3, allowFailure: globalAllowFailure = true } = params;
  const mAddress = params.multicallAddress;

  const fallbackToSimulation = async (error?: string) => {
    if (error) console.error(`Multicall failed, falling back to simulation: ${error}`);
    const results = await Promise.allSettled(calls.map((call) => readContract(call, network)));
    return results.map((result, idx) => {
      if (result.status === "fulfilled") {
        return { success: true, result: result.value };
      } else {
        return {
          success: false,
          error: `Call to ${calls[idx].functionName} failed: ${result.reason}`,
        };
      }
    });
  };

  if (!mAddress) {
    return fallbackToSimulation();
  }

  const tronWeb = getTronWeb(network);

  try {
    const callDataWithFuncs = calls.map((call) => {
      const func = call.abi.find((i: any) => i.name === call.functionName && i.type === "function");
      if (!func) {
        throw new Error(`Function ${call.functionName} not found in ABI for ${call.address}`);
      }

      const inputs = func.inputs || [];
      const types = inputs.map((i: any) => i.type);
      const signature = `${call.functionName}(${types.join(",")})`;

      const fullHash = tronWeb.sha3(signature);
      const selector = fullHash.startsWith("0x")
        ? fullHash.slice(0, 10)
        : "0x" + fullHash.slice(0, 8);

      const values = call.args || [];
      const encodedArgs = (tronWeb as any).utils.abi.encodeParams(types, values).replace(/^0x/, "");
      const callData = selector + encodedArgs;

      const callAllowFailure =
        call.allowFailure !== undefined ? call.allowFailure : globalAllowFailure;

      return {
        callData:
          version === 3 ? [call.address, callAllowFailure, callData] : [call.address, callData],
        func,
      };
    });

    const encodedCalls = callDataWithFuncs.map((item) => item.callData);
    const multicallAbi = version === 3 ? MULTICALL3_ABI : MULTICALL2_ABI;
    const method = version === 3 ? "aggregate3" : "tryAggregate";
    const multicallArgs = version === 3 ? [encodedCalls] : [!globalAllowFailure, encodedCalls];

    const contract = tronWeb.contract(multicallAbi, mAddress);
    const results = await (contract as any)[method](...multicallArgs).call();

    // TronWeb might wrap the result array in another array
    const finalResults =
      Array.isArray(results) &&
      results.length === 1 &&
      Array.isArray(results[0]) &&
      (Array.isArray(results[0][0]) || typeof results[0][0] === "object")
        ? results[0]
        : results;

    return finalResults.map((res: any, index: number) => {
      const success = res.success !== undefined ? res.success : res[0];
      const returnData = res.returnData !== undefined ? res.returnData : res[1];

      if (!success) {
        return {
          success: false,
          error: `Call to ${calls[index].functionName} failed in multicall`,
        };
      }

      const func = callDataWithFuncs[index].func;
      const outputs = func.outputs || [];
      const outputTypes = outputs.map((o: any) => o.type);
      const outputNames = outputs.map((o: any) => o.name || "");

      try {
        const decoded = (tronWeb as any).utils.abi.decodeParams(
          outputNames,
          outputTypes,
          returnData,
          true,
        );

        let result: any;
        if (outputTypes.length === 1) {
          if (typeof decoded === "object" && !Array.isArray(decoded)) {
            // TronWeb decodeParams returns an object with both index keys and named keys
            // For example: { "0": 123n, "timestamp": 123n }
            // We want to return the raw value if it's a single output,
            // but we need to be careful if the user expects the object structure.
            // MCP tools usually prefer the raw value for single outputs for simplicity.
            const entries = Object.entries(decoded);
            const namedEntry = entries.find(([k]) => isNaN(Number(k)) && k !== "");

            // If it's a single output AND it has a name, we return the WHOLE object
            // so results[0].result.timestamp works.
            // If it has NO name (just "0"), we return the raw value.
            if (namedEntry) {
              result = decoded;
            } else {
              result = entries[0] ? entries[0][1] : decoded;
            }
          } else {
            result = Array.isArray(decoded) && decoded.length === 1 ? decoded[0] : decoded;
          }
        } else {
          result = decoded;
        }
        return { success: true, result };
      } catch (e: any) {
        return {
          success: false,
          error: `Failed to decode ${calls[index].functionName}: ${e.message}`,
        };
      }
    });
  } catch (error: any) {
    return fallbackToSimulation(error.message);
  }
}
