import { getTronWeb } from './clients.js';

type Transaction = any;
type TransactionInfo = any;

/**
 * Get transaction details by transaction hash
 */
export async function getTransaction(txHash: string, network = 'mainnet'): Promise<Transaction> {
  const tronWeb = getTronWeb(network);
  const tx = await tronWeb.trx.getTransaction(txHash);
  return tx;
}

/**
 * Get transaction info (receipt equivalent)
 */
export async function getTransactionInfo(txHash: string, network = 'mainnet'): Promise<TransactionInfo> {
  const tronWeb = getTronWeb(network);
  const info = await tronWeb.trx.getTransactionInfo(txHash);
  return info;
}

// Alias for tools expecting 'receipt'
export const getTransactionReceipt = getTransactionInfo;

/**
 * Wait for a transaction to be confirmed
 */
export async function waitForTransaction(txHash: string, network = 'mainnet'): Promise<TransactionInfo> {
    const tronWeb = getTronWeb(network);
    
    // Poll for transaction info
    const maxAttempts = 30;
    const interval = 2000; // 2 seconds
    
    for (let i = 0; i < maxAttempts; i++) {
        try {
            const info = await tronWeb.trx.getTransactionInfo(txHash);
            if (info && info.id) {
                return info;
            }
        } catch (e) {
            // Ignore error and retry
        }
        await new Promise(resolve => setTimeout(resolve, interval));
    }
    
    throw new Error(`Transaction ${txHash} not confirmed after ${maxAttempts * interval}ms`);
}
