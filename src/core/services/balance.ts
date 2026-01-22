import { 
  formatEther,
  formatUnits,
  type Address,
  type Abi,
  getContract
} from 'viem';
import { getPublicClient } from './clients.js';
import { readContract } from './contracts.js';
import { resolveAddress } from './ens.js';

// Standard TRC20 ABI (minimal for reading)
const trc20Abi = [
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ type: 'string' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ type: 'uint8' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ type: 'address', name: 'account' }],
    name: 'balanceOf',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const;

// Standard TRC721 ABI (minimal for reading)
const trc721Abi = [
  {
    inputs: [{ type: 'address', name: 'owner' }],
    name: 'balanceOf',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ type: 'uint256', name: 'tokenId' }],
    name: 'ownerOf',
    outputs: [{ type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const;

// Standard TRC1155 ABI (minimal for reading)
const trc1155Abi = [
  {
    inputs: [
      { type: 'address', name: 'account' },
      { type: 'uint256', name: 'id' }
    ],
    name: 'balanceOf',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const;

/**
 * Get the TRX balance for an address
 * @param addressOrEns TRON address
 * @param network Network name or chain ID
 * @returns Balance in sun and TRX
 */
export async function getTRXBalance(
  addressOrEns: string, 
  network = 'mainnet'
): Promise<{ wei: bigint; ether: string }> {
  // Resolve address if needed
  const address = await resolveAddress(addressOrEns, network);
  
  const client = getPublicClient(network);
  const balance = await client.getBalance({ address });
  
  return {
    wei: balance,
    ether: formatEther(balance)
  };
}

/**
 * Get the balance of a TRC20 token for an address
 * @param tokenAddressOrEns Token contract address
 * @param ownerAddressOrEns Owner address
 * @param network Network name or chain ID
 * @returns Token balance with formatting information
 */
export async function getTRC20Balance(
  tokenAddressOrEns: string,
  ownerAddressOrEns: string,
  network = 'mainnet'
): Promise<{
  raw: bigint;
  formatted: string;
  token: {
    symbol: string;
    decimals: number;
  }
}> {
  // Resolve addresses if needed
  const tokenAddress = await resolveAddress(tokenAddressOrEns, network);
  const ownerAddress = await resolveAddress(ownerAddressOrEns, network);
  
  const publicClient = getPublicClient(network);

  const contract = getContract({
    address: tokenAddress,
    abi: trc20Abi,
    client: publicClient,
  });

  const [balance, symbol, decimals] = await Promise.all([
    contract.read.balanceOf([ownerAddress]),
    contract.read.symbol(),
    contract.read.decimals()
  ]);

  return {
    raw: balance,
    formatted: formatUnits(balance, decimals),
    token: {
      symbol,
      decimals
    }
  };
}

/**
 * Check if an address owns a specific NFT
 * @param tokenAddressOrEns NFT contract address
 * @param ownerAddressOrEns Owner address
 * @param tokenId Token ID to check
 * @param network Network name or chain ID
 * @returns True if the address owns the NFT
 */
export async function isNFTOwner(
  tokenAddressOrEns: string,
  ownerAddressOrEns: string,
  tokenId: bigint,
  network = 'mainnet'
): Promise<boolean> {
  // Resolve addresses if needed
  const tokenAddress = await resolveAddress(tokenAddressOrEns, network);
  const ownerAddress = await resolveAddress(ownerAddressOrEns, network);
  
  try {
    const actualOwner = await readContract({
      address: tokenAddress,
      abi: trc721Abi,
      functionName: 'ownerOf',
      args: [tokenId]
    }, network) as Address;
    
    return actualOwner.toLowerCase() === ownerAddress.toLowerCase();
  } catch (error: any) {
    console.error(`Error checking NFT ownership: ${error.message}`);
    return false;
  }
}

/**
 * Get the number of NFTs owned by an address for a specific collection
 * @param tokenAddressOrEns NFT contract address
 * @param ownerAddressOrEns Owner address
 * @param network Network name or chain ID
 * @returns Number of NFTs owned
 */
export async function getTRC721Balance(
  tokenAddressOrEns: string,
  ownerAddressOrEns: string,
  network = 'mainnet'
): Promise<bigint> {
  // Resolve addresses if needed
  const tokenAddress = await resolveAddress(tokenAddressOrEns, network);
  const ownerAddress = await resolveAddress(ownerAddressOrEns, network);
  
  return readContract({
    address: tokenAddress,
    abi: trc721Abi,
    functionName: 'balanceOf',
    args: [ownerAddress]
  }, network) as Promise<bigint>;
}

/**
 * Get the balance of a TRC1155 token for an address
 * @param tokenAddressOrEns TRC1155 contract address
 * @param ownerAddressOrEns Owner address
 * @param tokenId Token ID to check
 * @param network Network name or chain ID
 * @returns Token balance
 */
export async function getTRC1155Balance(
  tokenAddressOrEns: string,
  ownerAddressOrEns: string,
  tokenId: bigint,
  network = 'mainnet'
): Promise<bigint> {
  // Resolve addresses if needed
  const tokenAddress = await resolveAddress(tokenAddressOrEns, network);
  const ownerAddress = await resolveAddress(ownerAddressOrEns, network);
  
  return readContract({
    address: tokenAddress,
    abi: trc1155Abi,
    functionName: 'balanceOf',
    args: [ownerAddress, tokenId]
  }, network) as Promise<bigint>;
} 