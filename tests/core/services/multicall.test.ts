import { describe, it, expect } from "vitest";
import { multicall } from "../../../src/core/services/contracts";

const MULTICALL3_ADDRESS_NILE = "TPX1jdAu3qdGCZCWX1m75RtB2wgtKotuDC";
const USDT_ADDRESS_NILE = "TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf";

// Standard Multicall3 and TRC20 partial ABI for testing
const TEST_ABI = [
  {
    inputs: [],
    name: "getCurrentBlockTimestamp",
    outputs: [{ internalType: "uint256", name: "timestamp", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
];

describe("Multicall Service Integration", () => {
  it("should execute multiple read-only calls on Nile network (Multicall + USDT)", async () => {
    const calls = [
      {
        address: MULTICALL3_ADDRESS_NILE,
        functionName: "getCurrentBlockTimestamp",
        args: [],
        abi: TEST_ABI,
      },
      {
        address: USDT_ADDRESS_NILE,
        functionName: "name",
        args: [],
        abi: TEST_ABI,
      },
      {
        address: USDT_ADDRESS_NILE,
        functionName: "symbol",
        args: [],
        abi: TEST_ABI,
      },
      {
        address: USDT_ADDRESS_NILE,
        functionName: "balanceOf",
        args: ["T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb"],
        abi: TEST_ABI,
      },
    ];

    const results = await multicall(
      {
        calls,
        multicallAddress: MULTICALL3_ADDRESS_NILE,
        version: 3,
        allowFailure: false,
      },
      "nile",
    );

    expect(results).toHaveLength(4);

    // Multicall result
    expect(results[0].success).toBe(true);
    expect(typeof results[0].result.timestamp).toBe("bigint");

    // USDT Name
    expect(results[1].success).toBe(true);
    expect(results[1].result).toBe("Tether USD");

    // USDT Symbol
    expect(results[2].success).toBe(true);
    expect(results[2].result).toBe("USDT");

    // USDT Balance
    expect(results[3].success).toBe(true);
    expect(typeof results[3].result).toBe("bigint");
    console.log("USDT Data:", {
      name: results[1].result,
      symbol: results[2].result,
      balance: results[3].result.toString(),
    });
  }, 30000);

  it("should fallback to simulation when contract address is invalid", async () => {
    const calls = [
      {
        address: USDT_ADDRESS_NILE,
        functionName: "name",
        args: [],
        abi: TEST_ABI,
      },
    ];

    // Using an intentionally wrong multicall address to trigger fallback
    const results = await multicall(
      {
        calls,
        multicallAddress: "T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb", // Not a multicall contract
        version: 3,
        allowFailure: true,
      },
      "nile",
    );

    expect(results).toHaveLength(1);
    expect(results[0].success).toBe(true); // Should still succeed via simulation
    expect(results[0].result).toBe("Tether USD");
  }, 30000);
});
