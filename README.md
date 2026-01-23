# TRON MCP Server

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![TRON Network](https://img.shields.io/badge/Network-TRON-red)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8+-3178C6)
![MCP](https://img.shields.io/badge/MCP-1.22.0+-blue)
![TronWeb](https://img.shields.io/badge/TronWeb-6.0+-green)

A comprehensive Model Context Protocol (MCP) server that provides blockchain services for the TRON network. This server enables AI agents to interact with TRON blockchain with a unified interface through tools and AI-guided prompts for TRX, TRC20 tokens and smart contracts.

## Contents

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
- [Security Considerations](#security-considerations)
- [Project Structure](#project-structure)
- [License](#license)

## Overview

The MCP TRON Server leverages the Model Context Protocol to provide blockchain services to AI agents. It fully supports the TRON ecosystem using `tronweb`.

Key capabilities:

- **Blockchain Data**: Read blocks, transactions, and chain parameters (Energy/Bandwidth costs).
- **Smart Contracts**: Interact with any TRON smart contract (Read/Write).
- **Tokens**: Transfer TRX and TRC20 tokens; check balances.
- **Address Management**: Convert between Hex (0x...) and Base58 (T...) formats.
- **Wallet Integration**: Support for Private Key and Mnemonic (BIP-39) wallets.
- **Multi-Network**: Seamless support for Mainnet, Nile, and Shasta.

## Features

### Blockchain Data Access

- **TRON network support**: Mainnet, Nile, Shasta.
- **Chain information**: Block number, Chain ID, RPC endpoints.
- **Block data**: Access by number or hash.
- **Transaction details**: Detailed info including resource usage (Energy/Bandwidth).
- **Resource Costs**: Query current chain parameters for Energy and Bandwidth prices.

### Token Services

- **Native TRX**: Check balance and transfer.
- **TRC20 Tokens**:
  - Check balances.
  - Transfer tokens.
  - Get token metadata (name, symbol, decimals).

### Address Services

- **Format Conversion**: Convert between Hex (`41...` or `0x...`) and Base58 (`T...`) formats.
- **Validation**: Verify if an address is valid on TRON.

### Smart Contract Interactions

- **Read Contract**: Call `view` and `pure` functions.
- **Write Contract**: Execute state-changing functions.
- **ABI Fetching**: Automatically fetches ABI from the blockchain for verified contracts.

### Wallet & Security

- **Flexible Wallet**: Configure via `TRON_PRIVATE_KEY` or `TRON_MNEMONIC`.
- **HD Wallet**: Supports BIP-44 derivation path `m/44'/195'/0'/0/{index}`.
- **Signing**: Sign arbitrary messages.

## Supported Networks

- **Mainnet**: `mainnet` (Default)
- **Nile Testnet**: `nile`
- **Shasta Testnet**: `shasta`

## Prerequisites

- [Node.js](https://nodejs.org/) 20.0.0 or higher
- Optional: [TronGrid API key](https://www.trongrid.io/) to avoid rate limiting on Mainnet.

## Installation

```bash
# Clone the repository
git clone https://github.com/sun-protocol/tron-mcp-server.git
cd tron-mcp-server

# Install dependencies
npm install
```

## Configuration

### Environment Variables

To enable write operations (transfers, contract calls) and ensure reliable API access, you should configure the following variables.

#### Network Configuration

- `TRONGRID_API_KEY`: (Optional) Your TronGrid API key. Highly recommended for Mainnet to avoid frequency limits.

#### Wallet Configuration

**Option 1: Private Key**

```bash
export TRON_PRIVATE_KEY="your_private_key_hex" # e.g., 0123... or 0x0123...
```

**Option 2: Mnemonic Phrase (Recommended)**

```bash
export TRON_MNEMONIC="word1 word2 word3 ... word12"
export TRON_ACCOUNT_INDEX="0" # Optional, default: 0
```

### Server Configuration

The server runs on port **3001** by default in HTTP mode.

## Usage

### Running Locally

```bash
# Start in stdio mode (for MCP clients like Claude Desktop/Cursor)
npm start

# Start in HTTP mode (Server-Sent Events)
npm run start:http
```

### Testing

The project includes a comprehensive test suite with unit tests and integration tests (using the Nile network).

```bash
# Run all tests
npm test

# Run specific test suites
npx vitest tests/core/tools.test.ts          # Unit tests for tools
npx vitest tests/core/services/multicall.test.ts # Multicall integration
npx vitest tests/core/services/services.test.ts # Services integration
```

### Connecting from Cursor / Claude Desktop

Add the following to your MCP configuration file (e.g., `~/.config/Claude/claude_desktop_config.json` or `.cursor/mcp.json`):

**For local development (running from source):**

```json
{
  "mcpServers": {
    "tron-mcp-server": {
      "command": "npx",
      "args": ["tsx", "/ABSOLUTE/PATH/TO/tron-mcp-server/src/index.ts"],
      "env": {
        "TRON_PRIVATE_KEY": "your_private_key_hex",
        "TRONGRID_API_KEY": "your_trongrid_api_key"
      }
    }
  }
}
```

**For using the built package (if installed globally or via npx):**

```json
{
  "mcpServers": {
    "tron-mcp-server": {
      "command": "npx",
      "args": ["-y", "@sun-protocol/tron-mcp-server"],
      "env": {
        "TRON_PRIVATE_KEY": "your_private_key_hex",
        "TRONGRID_API_KEY": "your_trongrid_api_key"
      }
    }
  }
}
```

## API Reference

### Tools

#### Wallet & Address

- `get_wallet_address`: Get the configured wallet's address (Base58 & Hex).
- `convert_address`: Convert between Hex and Base58 formats.

#### Network & Resources

- `get_chain_info`: Get current block and chain ID.
- `get_chain_parameters`: Get current Energy and Bandwidth costs.
- `get_supported_networks`: List available networks.

#### Blocks & Transactions

- `get_block`: Fetch block by number or hash.
- `get_latest_block`: Get the latest block.
- `get_transaction`: Get transaction details.
- `get_transaction_info`: Get transaction receipt/info (including resource usage).

#### Balances

- `get_balance`: Get TRX balance.
- `get_token_balance`: Get TRC20 token balance.

#### Transfers (Write)

- `transfer_trx`: Send TRX.
- `transfer_trc20`: Send TRC20 tokens.

#### Smart Contracts

- `read_contract`: Call read-only contract functions.
- `multicall`: Execute multiple read-only functions in a single batch call.
- `write_contract`: Call state-changing contract functions.

#### Signing

- `sign_message`: Sign a text message with the configured wallet.

### Prompts

- `prepare_transfer`: Interactive guide to prepare TRX/TRC20 transfers.
- `diagnose_transaction`: Analyze a transaction hash for status and errors.
- `analyze_wallet`: Comprehensive report of wallet assets.
- `check_network_status`: Report on network health and resource costs.

## Security Considerations

- **Private Keys**: Never share your private keys. Use environment variables.
- **Testnets**: Always test on Nile or Shasta before performing operations on Mainnet.
- **Approvals**: Be cautious when approving token allowances via `write_contract`.

## Project Structure

```
tron-mcp-server/
├── src/
│   ├── core/
│   │   ├── chains.ts           # Network definitions
│   │   ├── tools.ts            # MCP Tool definitions
│   │   ├── prompts.ts          # MCP Prompt definitions
│   │   └── services/           # Business logic (TronWeb integration)
│   │       ├── wallet.ts       # Wallet management
│   │       ├── transfer.ts     # Transfer logic
│   │       ├── contracts.ts    # Contract logic
│   │       ├── address.ts      # Address conversion
│   │       └── ...
│   ├── server/                 # HTTP/Stdio server setup
│   └── index.ts                # Entry point
├── tests/                      # Unit tests
└── package.json
```

## License

MIT
