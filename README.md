# TRON MCP Server

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![TRON Network](https://img.shields.io/badge/Network-TRON-red)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8+-3178C6)
![MCP](https://img.shields.io/badge/MCP-1.22.0+-blue)
![TronWeb](https://img.shields.io/badge/TronWeb-6.0+-green)

A comprehensive Model Context Protocol (MCP) server that provides blockchain services for the TRON network. This server enables AI agents to interact with TRON blockchain with a unified interface through tools and AI-guided prompts for TRX, TRC20, TRC721 tokens and smart contracts.

## 📋 Contents

- [Overview](#overview)
- [Features](#features)
- [Supported Networks](#supported-networks)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
  - [Environment Variables](#environment-variables)
  - [Server Configuration](#server-configuration)
- [Usage](#usage)
- [API Reference](#api-reference)
  - [Tools](#tools)
  - [Prompts](#prompts)
  - [Resources](#resources)
- [Security Considerations](#security-considerations)
- [Project Structure](#project-structure)
- [Development](#development)
- [License](#license)

## 🔭 Overview

The MCP TRON Server leverages the Model Context Protocol to provide blockchain services to AI agents. It supports a wide range of services including:

- Reading blockchain state (balances, transactions, blocks, etc.)
- Interacting with smart contracts with **automatic ABI fetching** from block explorers
- Transferring tokens (native TRX, TRC20, TRC721, TRC1155)
- Querying token metadata and balances
- TRON network support (mainnet and testnets)
- **AI-friendly prompts** that guide agents through complex workflows

All services are exposed through a consistent interface of MCP tools, resources, and prompts, making it easy for AI agents to discover and use blockchain functionality. The server includes intelligent ABI fetching, eliminating the need to know contract ABIs in advance.

## ✨ Features

### Blockchain Data Access

- **TRON network support** (mainnet and testnets)
- **Chain information** including blockNumber, chainId, and RPCs
- **Block data** access by number, hash, or latest
- **Transaction details** and receipts with decoded logs
- **Address balances** for native tokens and all token standards

### Token services

- **TRC20 Tokens**

  - Get token metadata (name, symbol, decimals, supply)
  - Check token balances
  - Transfer tokens between addresses
  - Approve spending allowances

- **NFTs (TRC721)**

  - Get collection and token metadata
  - Verify token ownership
  - Transfer NFTs between addresses
  - Retrieve token URIs and count holdings

- **Multi-tokens (TRC1155)**
  - Get token balances and metadata
  - Transfer tokens with quantity
  - Access token URIs

### Smart Contract Interactions

- **Read contract state** through view/pure functions
- **Write to contracts** - Execute any state-changing function with automatic ABI fetching
- **Contract verification** to distinguish from EOAs
- **Event logs** retrieval and filtering
- **Automatic ABI fetching** from Tronscan API (no need to know ABIs in advance)
- **ABI parsing and validation** with function discovery

### Comprehensive Transaction Support

- **Flexible Wallet Support** - Configure with Private Key or Mnemonic (BIP-39) with HD path support
- **Native token transfers** across all supported networks
- **Energy/Bandwidth estimation** for transaction planning
- **Transaction status** and receipt information
- **Error handling** with descriptive messages

### Message Signing Capabilities

- **Personal Message Signing** - Sign arbitrary messages for authentication and verification
- **Typed Data Signing** - Sign structured data for gasless transactions and meta-transactions
- **Permit Signatures** - Create off-chain approvals for gasless token operations
- **Meta-Transaction Support** - Sign transaction data for relay services and gasless transfers

### AI-Guided Workflows (Prompts)

- **Transaction preparation** - Guidance for planning and executing transfers
- **Wallet analysis** - Tools for analyzing wallet activity and holdings
- **Smart contract exploration** - Interactive ABI fetching and contract analysis
- **Contract interaction** - Safe execution of write operations on smart contracts
- **Network information** - Learning about TRON networks and comparisons
- **Approval auditing** - Reviewing and managing token approvals
- **Error diagnosis** - Troubleshooting transaction failures

## 🌐 Supported Networks

### Mainnets

- TRON Mainnet

### Testnets

- Shasta Testnet
- Nile Testnet

## 🛠️ Prerequisites

- [Bun](https://bun.sh/) 1.0.0 or higher (recommended)
- Node.js 20.0.0 or higher (if not using Bun)
- Optional: [Tronscan API key](https://tronscan.org/) for ABI fetching

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/sun-protocol/tron-mcp-server.git
cd tron-mcp-server

# Install dependencies with Bun
bun install

# Or with npm
npm install
```

## ⚙️ Configuration

### Environment Variables

The server uses the following environment variables. For write operations and ABI fetching, you must configure these variables:

#### Wallet Configuration (For Write Operations)

You can configure your wallet using **either** a private key or a mnemonic phrase:

**Option 1: Private Key**

```bash
export TRON_PRIVATE_KEY="0x..." # Your private key in hex format (with or without 0x prefix)
```

**Option 2: Mnemonic Phrase (Recommended for HD Wallets)**

```bash
export TRON_MNEMONIC="word1 word2 word3 ... word12" # Your 12 or 24 word BIP-39 mnemonic
export TRON_ACCOUNT_INDEX="0" # Optional: Account index for HD wallet derivation (default: 0)
```

The mnemonic option supports hierarchical deterministic (HD) wallet derivation:

- Uses BIP-39 standard mnemonic phrases (12 or 24 words)
- Supports BIP-44 derivation path: `m/44'/195'/0'/0/{accountIndex}`
- `TRON_ACCOUNT_INDEX` allows you to derive different accounts from the same mnemonic
- Default account index is 0 (first account)

**Wallet is used for:**

- Transferring native tokens (`transfer_native` tool)
- Transferring TRC20 tokens (`transfer_trc20` tool)
- Approving token spending (`approve_token_spending` tool)
- Writing to smart contracts (`write_contract` tool)
- Signing messages for authentication (`sign_message` tool)
- Signing structured data for gasless transactions (`sign_typed_data` tool)

⚠️ **Security**:

- Never commit your private key or mnemonic to version control
- Use environment variables or a secure key management system
- Store mnemonics securely - they provide access to all derived accounts
- Consider using different account indices for different purposes

#### API Keys (For ABI Fetching)

```bash
export TRONSCAN_API_KEY="your-api-key-here"
```

This API key is optional but required for:

- Automatic ABI fetching from block explorers (`get_contract_abi` tool)
- Auto-fetching ABIs when reading contracts (`read_contract` tool with `abiJson` parameter)
- The `fetch_and_analyze_abi` prompt

Get your free API key from:

- [Tronscan](https://tronscan.org/) - For TRON network

### Server Configuration

The server uses the following default configuration:

- **Default Network**: TRON Mainnet
- **Server Port**: 3001
- **Server Host**: 0.0.0.0 (accessible from any network interface)

These values are hardcoded in the application. If you need to modify them, you can edit the following files:

- For chain configuration: `src/core/chains.ts`
- For server configuration: `src/server/http-server.ts`

## 🚀 Usage

### Using npx (No Installation Required)

You can run the MCP TRON Server directly without installation using npx:

```bash
# Run the server in stdio mode (for CLI tools)
npx @sun-protocol/tron-mcp-server

# Run the server in HTTP mode (for web applications)
npx @sun-protocol/tron-mcp-server --http
```

### Running the Server Locally

Start the server using stdio (for embedding in CLI tools):

```bash
# Start the stdio server
bun start

# Development mode with auto-reload
bun dev
```

Or start the HTTP server with SSE for web applications:

```bash
# Start the HTTP server
bun start:http

# Development mode with auto-reload
bun dev:http
```

### Connecting to the Server

Connect to this MCP server using any MCP-compatible client. For testing and debugging, you can use the [MCP Inspector](https://github.com/modelcontextprotocol/inspector).

### Connecting from Cursor

To connect to the MCP server from Cursor:

1. Open Cursor and go to Settings (gear icon in the bottom left)
2. Click on "Features" in the left sidebar
3. Scroll down to "MCP Servers" section
4. Click "Add new MCP server"
5. Enter the following details:

   - Server name: `tron-mcp-server`
   - Type: `command`
   - Command: `npx @sun-protocol/tron-mcp-server`

6. Click "Save"

Once connected, you can use the MCP server's capabilities directly within Cursor. The server will appear in the MCP Servers list and can be enabled/disabled as needed.

### Using mcp.json with Cursor

For a more portable configuration that you can share with your team or use across projects, you can create an `.cursor/mcp.json` file in your project's root directory:

```json
{
  "mcpServers": {
    "tron-mcp-server": {
      "command": "npx",
      "args": ["-y", "@sun-protocol/tron-mcp-server"]
    },
    "tron-mcp-http": {
      "command": "npx",
      "args": ["-y", "@sun-protocol/tron-mcp-server", "--http"]
    }
  }
}
```

Place this file in your project's `.cursor` directory (create it if it doesn't exist), and Cursor will automatically detect and use these MCP server configurations when working in that project. This approach makes it easy to:

1. Share MCP configurations with your team
2. Version control your MCP setup
3. Use different server configurations for different projects

### Example: HTTP Mode with SSE

If you're developing a web application and want to connect to the HTTP server with Server-Sent Events (SSE), you can use this configuration:

```json
{
  "mcpServers": {
    "tron-mcp-sse": {
      "url": "http://localhost:3001/sse"
    }
  }
}
```

This connects directly to the HTTP server's SSE endpoint, which is useful for:

- Web applications that need to connect to the MCP server from the browser
- Environments where running local commands isn't ideal
- Sharing a single MCP server instance among multiple users or applications

To use this configuration:

1. Create a `.cursor` directory in your project root if it doesn't exist
2. Save the above JSON as `mcp.json` in the `.cursor` directory
3. Restart Cursor or open your project
4. Cursor will detect the configuration and offer to enable the server(s)

### Example: Using the MCP Server in Cursor

After configuring the MCP server with `mcp.json`, you can easily use it in Cursor. Here's an example workflow:

1. Create a new JavaScript/TypeScript file in your project:

```javascript
// blockchain-example.js
async function main() {
  try {
    // Get TRX balance for an address
    console.log("Getting TRX balance for an address...");

    // When using with Cursor, you can simply ask Cursor to:
    // "Check the TRX balance of TAddress on mainnet"
    // Or "Transfer 10 TRX from my wallet to TAddress"

    // Cursor will use the MCP server to execute these operations
    // without requiring any additional code from you

    // This is the power of the MCP integration - your AI assistant
    // can directly interact with blockchain data and operations
  } catch (error) {
    console.error("Error:", error.message);
  }
}

main();
```

2. With the file open in Cursor, you can ask Cursor to:

   - "Check the current TRX balance of TAddress"
   - "Look up the price of USDT on TRON"
   - "Show me the latest block on TRON mainnet"
   - "Check if TAddress is a contract address"

3. Cursor will use the MCP server to execute these operations and return the results directly in your conversation.

The MCP server handles all the blockchain communication while allowing Cursor to understand and execute blockchain-related tasks through natural language.

### Connecting using Claude CLI

If you're using Claude CLI, you can connect to the MCP server with just two commands:

```bash
# Add the MCP server
claude mcp add tron-mcp-server npx @sun-protocol/tron-mcp-server

# Start Claude with the MCP server enabled
claude
```

### Example: Getting a Token Balance

```javascript
// Example of using the MCP client to check a token balance
const mcp = new McpClient("http://localhost:3000");

const result = await mcp.invokeTool("get-token-balance", {
  tokenAddress: "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t", // USDT on TRON
  ownerAddress: "TAddress",
  network: "mainnet",
});

console.log(result);
// {
//   tokenAddress: "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
//   owner: "TAddress",
//   network: "mainnet",
//   raw: "1000000000",
//   formatted: "1000",
//   symbol: "USDT",
//   decimals: 6
// }
```

### Example: Batch Multiple Calls with Multicall

```javascript
// Example of using multicall to batch multiple contract reads in a single RPC call
const mcp = new McpClient("http://localhost:3000");

const result = await mcp.invokeTool("multicall", {
  network: "mainnet",
  calls: [
    {
      contractAddress: "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t", // USDT
      functionName: "balanceOf",
      args: ["TAddress"],
    },
    {
      contractAddress: "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t", // USDT
      functionName: "symbol",
    },
    {
      contractAddress: "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t", // USDT
      functionName: "decimals",
    },
  ],
});

console.log(result);
// {
//   network: "mainnet",
//   totalCalls: 3,
//   successfulCalls: 3,
//   failedCalls: 0,
//   results: [
//     { contractAddress: "TR7N...", functionName: "balanceOf", result: "1000000000", status: "success" },
//     { contractAddress: "TR7N...", functionName: "symbol", result: "USDT", status: "success" },
//     { contractAddress: "TR7N...", functionName: "decimals", result: "6", status: "success" }
//   ]
// }
```

## 📚 API Reference

### Tools

The server provides MCP tools for agents. **All tools that accept address parameters support TRON addresses.**

#### Wallet Information

| Tool Name            | Description                                                      | Key Parameters |
| -------------------- | ---------------------------------------------------------------- | -------------- |
| `get_wallet_address` | Get the address of the configured wallet (from TRON_PRIVATE_KEY) | none           |

#### Network Information

| Tool Name                | Description                          | Key Parameters |
| ------------------------ | ------------------------------------ | -------------- |
| `get_chain_info`         | Get network information              | `network`      |
| `get_supported_networks` | List all supported TRON networks     | none           |
| `get_gas_price`          | Get current energy prices on network | `network`      |

#### Block & Transaction Information

| Tool Name                 | Description                       | Key Parameters                          |
| ------------------------- | --------------------------------- | --------------------------------------- |
| `get_block`               | Get block data                    | `blockNumber` or `blockHash`, `network` |
| `get_latest_block`        | Get latest block data             | `network`                               |
| `get_transaction`         | Get transaction details           | `txHash`, `network`                     |
| `get_transaction_receipt` | Get transaction receipt with logs | `txHash`, `network`                     |
| `wait_for_transaction`    | Wait for transaction confirmation | `txHash`, `confirmations`, `network`    |

#### Balance & Token Information

| Tool Name           | Description                    | Key Parameters                                                    |
| ------------------- | ------------------------------ | ----------------------------------------------------------------- |
| `get_balance`       | Get native token balance       | `address`, `network`                                              |
| `get_token_balance` | Check TRC20 token balance      | `tokenAddress`, `ownerAddress`, `network`                         |
| `get_allowance`     | Check token spending allowance | `tokenAddress`, `ownerAddress`, `spenderAddress`, `network`       |

#### Smart Contract Interactions

| Tool Name          | Description                                                   | Key Parameters                                                                                   |
| ------------------ | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `get_contract_abi` | Fetch contract ABI from block explorer                        | `contractAddress`, `network`                                                                     |
| `read_contract`    | Read smart contract state (auto-fetches ABI if needed)        | `contractAddress`, `functionName`, `args[]`, `abiJson` (optional), `network`                     |
| `write_contract`   | Execute state-changing functions (auto-fetches ABI if needed) | `contractAddress`, `functionName`, `args[]`, `value` (optional), `abiJson` (optional), `network` |
| `multicall`        | Batch multiple read calls into a single RPC request           | `calls[]` (array of contract calls), `allowFailure` (optional), `network`                        |

#### Token Transfers

| Tool Name                | Description                 | Key Parameters                                            |
| ------------------------ | --------------------------- | --------------------------------------------------------- |
| `transfer_native`        | Send native tokens (TRX)    | `to`, `amount`, `network`                                 |
| `transfer_trc20`         | Transfer TRC20 tokens       | `tokenAddress`, `to`, `amount`, `network`                 |
| `approve_token_spending` | Approve token allowances    | `tokenAddress`, `spenderAddress`, `amount`, `network`     |

#### NFT Services

| Tool Name             | Description                | Key Parameters                                   |
| --------------------- | -------------------------- | ------------------------------------------------ |
| `get_nft_info`        | Get NFT (TRC721) metadata  | `tokenAddress`, `tokenId`, `network`             |
| `get_trc1155_balance` | Check TRC1155 balance      | `tokenAddress`, `tokenId`, `ownerAddress`, `network` |

#### Message Signing

| Tool Name         | Description                                                                   | Key Parameters                                          |
| ----------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------- |
| `sign_message`    | Sign arbitrary messages for authentication and verification                   | `message`                                               |
| `sign_typed_data` | Sign structured data for gasless transactions, permits, and meta-transactions | `domainJson`, `typesJson`, `primaryType`, `messageJson` |

### Resources

The server exposes blockchain data through the following MCP resource URIs.

#### Blockchain Resources

| Resource URI Pattern                         | Description                              |
| -------------------------------------------- | ---------------------------------------- |
| `tron://{network}/chain`                     | Chain information for a specific network |
| `tron://chain`                               | TRON mainnet chain information           |
| `tron://{network}/block/{blockNumber}`       | Block data by number                     |
| `tron://{network}/block/latest`              | Latest block data                        |
| `tron://{network}/address/{address}/balance` | Native token balance                     |
| `tron://{network}/tx/{txHash}`               | Transaction details                      |
| `tron://{network}/tx/{txHash}/receipt`       | Transaction receipt with logs            |

#### Token Resources

| Resource URI Pattern                                                    | Description                     |
| ----------------------------------------------------------------------- | ------------------------------- |
| `tron://{network}/token/{tokenAddress}`                                 | TRC20 token information         |
| `tron://{network}/token/{tokenAddress}/balanceOf/{address}`             | TRC20 token balance             |
| `tron://{network}/nft/{tokenAddress}/{tokenId}`                         | NFT (TRC721) token information  |
| `tron://{network}/nft/{tokenAddress}/{tokenId}/isOwnedBy/{address}`     | NFT ownership verification      |
| `tron://{network}/trc1155/{tokenAddress}/{tokenId}/uri`                 | TRC1155 token URI               |
| `tron://{network}/trc1155/{tokenAddress}/{tokenId}/balanceOf/{address}` | TRC1155 token balance           |

## 🔒 Security Considerations

- **Private keys** are used only for transaction signing and are never stored by the server
- Consider implementing additional authentication mechanisms for production use
- Use HTTPS for the HTTP server in production environments
- Implement rate limiting to prevent abuse
- For high-value services, consider adding confirmation steps

## 📁 Project Structure

```
tron-mcp-server/
├── src/
│   ├── index.ts                # Main stdio server entry point
│   ├── server/                 # Server-related files
│   │   ├── http-server.ts      # HTTP server with SSE
│   │   └── server.ts           # General server setup
│   ├── core/
│   │   ├── chains.ts           # Chain definitions and utilities
│   │   ├── resources.ts        # MCP resources implementation
│   │   ├── tools.ts            # MCP tools implementation
│   │   ├── prompts.ts          # MCP prompts implementation
│   │   └── services/           # Core blockchain services
│   │       ├── index.ts        # Operation exports
│   │       ├── balance.ts      # Balance services
│   │       ├── transfer.ts     # Token transfer services
│   │       ├── utils.ts        # Utility functions
│   │       ├── tokens.ts       # Token metadata services
│   │       ├── contracts.ts    # Contract interactions
│   │       ├── transactions.ts # Transaction services
│   │       └── blocks.ts       # Block services
│   │       └── clients.ts      # RPC client utilities
├── package.json
├── tsconfig.json
└── README.md
```

## 🛠️ Development

To modify or extend the server:

1. Add new services in the appropriate file under `src/core/services/`
2. Register new tools in `src/core/tools.ts`
3. Register new resources in `src/core/resources.ts`
4. Add new network support in `src/core/chains.ts`
5. To change server configuration, edit the hardcoded values in `src/server/http-server.ts`

## 📄 License

This project is licensed under the terms of the [MIT License](./LICENSE).
