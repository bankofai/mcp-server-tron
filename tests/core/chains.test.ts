import { describe, expect, it } from "vitest";
import {
  getNetworkConfig,
  getRpcUrl,
  getSupportedNetworks,
  TronNetwork,
  DEFAULT_NETWORK,
  NETWORKS,
} from "../../src/core/chains";

describe("Chains", () => {
  it("should export supported networks", () => {
    const networks = getSupportedNetworks();
    expect(networks).toEqual(["mainnet", "nile", "shasta"]);
  });

  it("should get network config for mainnet", () => {
    const config = getNetworkConfig(TronNetwork.Mainnet);
    expect(config.name).toBe("Mainnet");
    expect(config.fullNode).toBe("https://api.trongrid.io");
  });

  it("should get network config for nile", () => {
    const config = getNetworkConfig(TronNetwork.Nile);
    expect(config.name).toBe("Nile");
    expect(config.fullNode).toBe("https://nile.trongrid.io");
  });

  it("should get network config for shasta", () => {
    const config = getNetworkConfig(TronNetwork.Shasta);
    expect(config.name).toBe("Shasta");
    expect(config.fullNode).toBe("https://api.shasta.trongrid.io");
  });

  it("should resolve aliases correctly", () => {
    expect(getNetworkConfig("tron")).toBe(NETWORKS[TronNetwork.Mainnet]);
    expect(getNetworkConfig("trx")).toBe(NETWORKS[TronNetwork.Mainnet]);
    expect(getNetworkConfig("testnet")).toBe(NETWORKS[TronNetwork.Nile]);
  });

  it("should return correct RPC URL", () => {
    expect(getRpcUrl("mainnet")).toBe("https://api.trongrid.io");
    expect(getRpcUrl("nile")).toBe("https://nile.trongrid.io");
  });

  it("should throw error for unsupported network", () => {
    expect(() => getNetworkConfig("invalid_network")).toThrow(
      "Unsupported network: invalid_network",
    );
  });

  it("should use default network if none provided", () => {
    expect(getNetworkConfig()).toBe(NETWORKS[DEFAULT_NETWORK]);
  });
});
