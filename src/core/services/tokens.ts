import { 
  type Address, 
  type Hex,
  type Hash,
  formatUnits,
  getContract
} from 'viem';
import { getPublicClient } from './clients.js';

// Standard TRC20 ABI (minimal for reading)
const trc20Abi = [
  {
    inputs: [],
    name: 'name',
    outputs: [{ type: 'string' }],
    stateMutability: 'view',
    type: 'function'
  },
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
    inputs: [],
    name: 'totalSupply',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const;

// Standard TRC721 ABI (minimal for reading)
const trc721Abi = [
  {
    inputs: [],
    name: 'name',
    outputs: [{ type: 'string' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ type: 'string' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ type: 'uint256', name: 'tokenId' }],
    name: 'tokenURI',
    outputs: [{ type: 'string' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const;

// Standard TRC1155 ABI (minimal for reading)
const trc1155Abi = [
  {
    inputs: [{ type: 'uint256', name: 'id' }],
    name: 'uri',
    outputs: [{ type: 'string' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const;

/**
 * Get TRC20 token information
 */
export async function getTRC20TokenInfo(
  tokenAddress: Address,
  network: string = 'mainnet'
): Promise<{
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: bigint;
  formattedTotalSupply: string;
}> {
  const publicClient = getPublicClient(network);

  const contract = getContract({
    address: tokenAddress,
    abi: trc20Abi,
    client: publicClient,
  });

  const [name, symbol, decimals, totalSupply] = await Promise.all([
    contract.read.name(),
    contract.read.symbol(),
    contract.read.decimals(),
    contract.read.totalSupply()
  ]);

  return {
    name,
    symbol,
    decimals,
    totalSupply,
    formattedTotalSupply: formatUnits(totalSupply, decimals)
  };
}

/**
 * Get TRC721 token metadata
 */
export async function getTRC721TokenMetadata(
  tokenAddress: Address,
  tokenId: bigint,
  network: string = 'mainnet'
): Promise<{
  name: string;
  symbol: string;
  tokenURI: string;
}> {
  const publicClient = getPublicClient(network);

  const contract = getContract({
    address: tokenAddress,
    abi: trc721Abi,
    client: publicClient,
  });

  const [name, symbol, tokenURI] = await Promise.all([
    contract.read.name(),
    contract.read.symbol(),
    contract.read.tokenURI([tokenId])
  ]);

  return {
    name,
    symbol,
    tokenURI
  };
}

/**
 * Get TRC1155 token URI
 */
export async function getTRC1155TokenURI(
  tokenAddress: Address,
  tokenId: bigint,
  network: string = 'mainnet'
): Promise<string> {
  const publicClient = getPublicClient(network);

  const contract = getContract({
    address: tokenAddress,
    abi: trc1155Abi,
    client: publicClient,
  });

  return contract.read.uri([tokenId]);
} 