import { getWallet } from "./clients.js";
import { utils } from "./utils.js";

/**
 * Transfer TRX to an address
 */
export async function transferTRX(
  privateKey: string,
  to: string,
  amount: string, // Amount in TRX (not Sun)
  network = "mainnet",
) {
  const tronWeb = getWallet(privateKey, network);

  // Convert TRX to Sun
  const amountSun = utils.toSun(amount as any);

  const tx = await tronWeb.trx.sendTransaction(to, amountSun as any);

  // If result is just true/false (older TronWeb), handle it?
  // Newer TronWeb returns transaction object usually.
  if ((tx as any).result === true && (tx as any).transaction) {
    return (tx as any).transaction.txID;
  }
  // If it returns the tx object directly
  if ((tx as any).txID) {
    return (tx as any).txID;
  }

  throw new Error(`Transaction failed: ${JSON.stringify(tx)}`);
}

/**
 * Transfer TRC20 tokens
 */
export async function transferTRC20(
  tokenAddress: string,
  to: string,
  amount: string, // Raw amount (accounting for decimals)
  privateKey: string,
  network = "mainnet",
) {
  const tronWeb = getWallet(privateKey, network);

  try {
    const contract = await tronWeb.contract().at(tokenAddress);
    // TRC20 transfer(to, amount)
    const txId = await contract.methods.transfer(to, amount).send();

    // Fetch token info for return
    const symbol = await contract.methods.symbol().call();
    const decimals = await contract.methods.decimals().call();

    // Basic formatting for return
    const decimalsNum = Number(decimals);
    const divisor = BigInt(10) ** BigInt(decimalsNum);
    const formatted = (Number(BigInt(amount)) / Number(divisor)).toString();

    return {
      txHash: txId,
      amount: {
        raw: amount,
        formatted: formatted,
      },
      token: {
        symbol: symbol,
        decimals: decimalsNum,
      },
    };
  } catch (error: any) {
    throw new Error(`Failed to transfer TRC20: ${error.message}`);
  }
}

/**
 * Approve token spending
 */
export async function approveTRC20(
  tokenAddress: string,
  spenderAddress: string,
  amount: string,
  privateKey: string,
  network = "mainnet",
) {
  const tronWeb = getWallet(privateKey, network);

  try {
    const contract = await tronWeb.contract().at(tokenAddress);
    const txId = await contract.methods.approve(spenderAddress, amount).send();
    return txId;
  } catch (error: any) {
    throw new Error(`Failed to approve TRC20: ${error.message}`);
  }
}
