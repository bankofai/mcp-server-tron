import { describe, expect, it } from "bun:test";

const BASE58_ADDRESS = "TFyiaYiJoCAPhZZfshRS9CD88XbyKkqjZq";
const HEX_ADDRESS_41 = "4141e971d57dd131214af645e8d5d4d38f51e512ce";

import { 
    toHexAddress, 
    toBase58Address, 
    isBase58, 
    isHex 
} from "../../../src/core/services/address";

describe("Address Service", () => {
  it("should convert Base58 to Hex", () => {
    const hex = toHexAddress(BASE58_ADDRESS);
    expect(hex.toLowerCase()).toBe(HEX_ADDRESS_41.toLowerCase());
  });

  it("should convert Hex to Base58", () => {
    const base58 = toBase58Address(HEX_ADDRESS_41);
    expect(base58).toBe(BASE58_ADDRESS);
  });

  it("should handle 0x prefix in hex", () => {
    const hex0x = "0x" + HEX_ADDRESS_41.substring(2);
    const base58 = toBase58Address(hex0x);
    expect(base58).toBe(BASE58_ADDRESS);
  });

  it("should validate Base58", () => {
    expect(isBase58(BASE58_ADDRESS)).toBe(true);
    expect(isBase58("Invalid")).toBe(false);
    expect(isBase58(HEX_ADDRESS_41)).toBe(false);
  });

  it("should validate Hex", () => {
    expect(isHex(HEX_ADDRESS_41)).toBe(true);
    expect(isHex("0x" + HEX_ADDRESS_41.substring(2))).toBe(true);
    expect(isHex(BASE58_ADDRESS)).toBe(false);
  });
});
