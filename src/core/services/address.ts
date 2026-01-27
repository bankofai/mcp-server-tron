import { TronWeb } from "tronweb";

/**
 * Service for handling address conversions (Hex <-> Base58)
 */

export function toHexAddress(address: string): string {
  if (address.startsWith("T")) {
    return TronWeb.address.toHex(address);
  }
  return address;
}

export function toBase58Address(address: string): string {
  if (address.startsWith("41")) {
    return TronWeb.address.fromHex(address);
  }
  if (address.startsWith("0x")) {
    // TronWeb expects 41 prefix for hex addresses usually, but 0x might be passed from EVM habits
    // 0x prefix usually needs to be replaced with 41 if it's a valid Tron address in hex
    // However, TronWeb.address.fromHex handles 0x prefix by assuming it's an ETH address and converting?
    // Let's rely on TronWeb's robust handling
    return TronWeb.address.fromHex(address);
  }
  return address;
}

export function isBase58(address: string): boolean {
  return address.startsWith("T") && TronWeb.isAddress(address);
}

export function isHex(address: string): boolean {
  // Base58 addresses start with T, Hex addresses don't (0-9, a-f)
  if (address.startsWith("T")) return false;

  let cleanAddress = address;
  if (address.startsWith("0x")) {
    cleanAddress = address.substring(2);
  }

  // If it's a 20-byte hex (40 chars), prefix with 41 to verify as a Tron address
  // TronWeb.address.fromHex handles this auto-prefixing, so isHex should validate it too
  if (cleanAddress.length === 40) {
    cleanAddress = "41" + cleanAddress;
  }

  return TronWeb.isAddress(cleanAddress);
}

// Re-export utility for convenience
export const resolveAddress = async (nameOrAddress: string, _network?: string): Promise<string> => {
  // Tron doesn't have ENS exactly like ETH.
  // If it's a valid address, return it.
  if (TronWeb.isAddress(nameOrAddress)) {
    return nameOrAddress;
  }

  // Future: Implement Tron NS resolution if needed
  throw new Error(`Invalid address or unsupported name service: ${nameOrAddress}`);
};
