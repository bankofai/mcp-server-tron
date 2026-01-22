import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

/**
 * Register task-oriented prompts with the MCP server
 *
 * All prompts follow a consistent structure:
 * - Clear objective statement
 * - Step-by-step instructions
 * - Expected outputs
 * - Safety/security considerations
 *
 * Prompts guide the model through complex workflows that would otherwise
 * require multiple tool calls in the correct sequence.
 *
 * @param server The MCP server instance
 */
export function registerTRONPrompts(server: McpServer) {
  // ============================================================================
  // TRANSACTION PROMPTS
  // ============================================================================

  server.registerPrompt(
    "prepare_transfer",
    {
      description: "Safely prepare and execute a token transfer with validation checks",
      argsSchema: {
        tokenType: z
          .enum(["trx", "trc20"])
          .describe("Token type: 'trx' for native or 'trc20' for contract tokens"),
        recipient: z.string().describe("Recipient address"),
        amount: z.string().describe("Amount to transfer (in TRX or token units)"),
        network: z.string().optional().describe("Network name (default: mainnet)"),
        tokenAddress: z.string().optional().describe("Token contract address (required for TRC20)"),
      },
    },
    ({ tokenType, recipient, amount, network = "mainnet", tokenAddress }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `# Token Transfer Task

**Objective**: Safely transfer ${amount} ${tokenType === "trx" ? "TRX" : "TRC20 tokens"} to ${recipient} on ${network}

## Validation & Checks
Before executing any transfer:
1. **Wallet Verification**: Call \`get_wallet_address\` to confirm the sending wallet
2. **Balance Check**:
   ${
     tokenType === "trx"
       ? "- Call `get_balance` to verify TRX balance"
       : `- Call \`get_token_balance\` with tokenAddress=${tokenAddress} to verify balance`
   }
3. **Resource Analysis**: Call \`get_chain_parameters\` to assess current network costs (Energy/Bandwidth)

## Execution Steps
${
  tokenType === "trx"
    ? `
1. Summarize: sender address, recipient, amount, and estimated cost
2. Request confirmation from user
3. Call \`transfer_trx\` with to="${recipient}", amount="${amount}", network="${network}"
4. Return transaction hash to user
5. Call \`get_transaction_info\` to confirm completion
`
    : `
1. Summarize: sender, recipient, token, amount
2. Request confirmation
3. Call \`transfer_trc20\` with tokenAddress, recipient, amount
4. Wait for confirmation with \`get_transaction_info\`
`
}

## Output Format
- **Transaction Hash**: Clear hex value
- **Status**: Pending or Confirmed
- **User Confirmation**: Always ask before sending

## Safety Considerations
- Never send more than available balance
- Double-check recipient address
- Explain any approval requirements
`,
          },
        },
      ],
    }),
  );

  server.registerPrompt(
    "diagnose_transaction",
    {
      description: "Analyze transaction status, failures, and provide debugging insights",
      argsSchema: {
        txHash: z.string().describe("Transaction hash to diagnose"),
        network: z.string().optional().describe("Network name (default: mainnet)"),
      },
    },
    ({ txHash, network = "mainnet" }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `# Transaction Diagnosis

**Objective**: Analyze transaction ${txHash} on ${network} and identify any issues

## Investigation Process

### 1. Gather Transaction Data
- Call \`get_transaction\` to fetch transaction details
- Call \`get_transaction_info\` to get status and energy/bandwidth used
- Note: both calls are read-only and free

### 2. Status Assessment
Determine transaction state:
- **Pending**: Not yet mined
- **Confirmed**: Successfully executed (contractRet='SUCCESS')
- **Failed**: Execution failed (contractRet='REVERT' or other error)

### 3. Failure Analysis
If transaction failed, investigate:

**Out of Energy**:
- Check energy_usage vs energy_limit
- If usage >= limit, suggest increasing fee limit

**Contract Revert**:
- Check function called and parameters
- Verify sufficient balance/approvals
- Look for require/revert statements in contract

### 4. Resource Analysis
- Calculate energy/bandwidth cost
- Compare to current chain parameters

## Output Format

Provide structured diagnosis:
- **Status**: Pending/Confirmed/Failed with reason
- **Transaction Hash**: The hash analyzed
- **From/To**: Addresses involved
- **Resource Usage**: Energy / Bandwidth used
- **Issue (if failed)**: Root cause and explanation
- **Recommended Actions**: Next steps to resolve
`,
          },
        },
      ],
    }),
  );

  // ============================================================================
  // WALLET ANALYSIS PROMPTS
  // ============================================================================

  server.registerPrompt(
    "analyze_wallet",
    {
      description: "Get comprehensive overview of wallet assets, balances, and activity",
      argsSchema: {
        address: z.string().describe("Wallet address to analyze"),
        network: z.string().optional().describe("Network name (default: mainnet)"),
        tokens: z.string().optional().describe("Comma-separated token addresses to check"),
      },
    },
    ({ address, network = "mainnet", tokens }) => {
      const tokenList = tokens ? tokens.split(",").map((t) => t.trim()) : [];
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `# Wallet Analysis

**Objective**: Provide complete asset overview for ${address} on ${network}

## Information Gathering

### 1. Address Resolution
- Call \`convert_address\` to get both Hex and Base58 formats

### 2. Native Token Balance
- Call \`get_balance\` to fetch TRX balance
- Report both sun and TRX formats

### 3. Token Balances
${
  tokenList.length > 0
    ? `- Call \`get_token_balance\` for each token:\n${tokenList.map((t) => `  * ${t}`).join("\n")}`
    : `- If specific tokens provided: call \`get_token_balance\` for each`
}

## Output Format

Provide analysis with clear sections:

**Wallet Overview**
- Address (Base58): [address]
- Address (Hex): [hex]
- Network: [network]

**TRX Balance**
- TRX: [formatted amount]
- Sun: [raw amount]

**Token Holdings** (if requested)
- Token: [address]
- Symbol: [symbol]
- Balance: [formatted]
- Decimals: [decimals]

**Summary**
- Primary holdings
- Notable observations
`,
            },
          },
        ],
      };
    },
  );

  // ============================================================================
  // NETWORK & EDUCATION PROMPTS
  // ============================================================================

  server.registerPrompt(
    "check_network_status",
    {
      description: "Check current network health and conditions",
      argsSchema: {
        network: z.string().optional().describe("Network name (default: mainnet)"),
      },
    },
    ({ network = "mainnet" }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `# Network Status Check

**Objective**: Assess health and current conditions of ${network}

## Status Assessment

### 1. Gather Current Data
Call these read-only tools:
- \`get_chain_info\` for chain ID and current block number
- \`get_latest_block\` for block details and timing
- \`get_chain_parameters\` for current resource costs

### 2. Network Health Analysis

**Block Production**:
- Current block number
- Block timing (normal ~3 sec for Tron)
- Consistent vs irregular blocks

**Resource Market**:
- Energy Fee
- Bandwidth Fee

**Overall Status**:
- Operational: Yes/No
- Issues detected: Yes/No

## Output Format

**Network Status Report: ${network}**

**Overall Status**
- Operational Status: [Online/Degraded/Offline]
- Current Block: [number]
- Network Time: [timestamp]

**Performance Metrics**
- Block Time: [seconds] (normal: 3s)
- Energy Fee: [amount]
- Bandwidth Fee: [amount]

**Recommendations**

For **sending transactions now**:
- Status is Green/Yellow/Red
`,
          },
        },
      ],
    }),
  );
}
