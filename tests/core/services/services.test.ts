import { describe, it, expect } from "vitest";
import {
  getTRXBalance,
  getTRC20Balance,
  getBlockNumber,
  getChainId,
  readContract,
  getTRC20TokenInfo,
} from "../../../src/core/services/index";

const USDT_ADDRESS_NILE = "TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf";
const TEST_ADDRESS = "T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb";

describe("Read-only Services Integration (Nile)", () => {
  it("should fetch TRX balance", async () => {
    const balance = await getTRXBalance(TEST_ADDRESS, "nile");
    expect(balance.wei).toBeDefined();
    expect(typeof balance.formatted).toBe("string");
    expect(balance.symbol).toBe("TRX");
    console.log(`TRX Balance: ${balance.formatted} TRX`);
  }, 20000);

  it("should fetch TRC20 balance (USDT)", async () => {
    const balance = await getTRC20Balance(USDT_ADDRESS_NILE, TEST_ADDRESS, "nile");
    expect(balance.raw).toBeDefined();
    expect(balance.token.symbol).toBe("USDT");
    expect(balance.token.decimals).toBe(6);
    console.log(`USDT Balance: ${balance.formatted} ${balance.token.symbol}`);
  }, 20000);

  it("should fetch TRC20 token info", async () => {
    const info = await getTRC20TokenInfo(USDT_ADDRESS_NILE, "nile");
    expect(info.name).toBe("Tether USD");
    expect(info.symbol).toBe("USDT");
    expect(info.decimals).toBe(6);
    expect(info.totalSupply).toBeGreaterThan(0n);
    console.log(`Token Info: ${info.name} (${info.symbol})`);
  }, 20000);

  it("should fetch current block number", async () => {
    const blockNumber = await getBlockNumber("nile");
    expect(blockNumber).toBeGreaterThan(0n);
    console.log(`Current Block: ${blockNumber}`);
  }, 20000);

  it("should fetch chain ID", async () => {
    // Nile chain ID is typically a hex string or special identifier in Tron
    const chainId = await getChainId("nile");
    expect(chainId).toBeDefined();
    console.log(`Chain ID: ${chainId}`);
  }, 20000);

  it("should read contract directly", async () => {
    const abi = [
      {
        inputs: [],
        name: "name",
        outputs: [{ type: "string" }],
        stateMutability: "view",
        type: "function",
      },
    ];
    const name = await readContract(
      {
        address: USDT_ADDRESS_NILE,
        functionName: "name",
        abi: abi,
      },
      "nile",
    );

    expect(name).toBe("Tether USD");
  }, 20000);
});
