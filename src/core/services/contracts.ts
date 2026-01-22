import { getTronWeb, getWallet } from './clients.js';

/**
 * Read from a smart contract (view/pure functions)
 */
export async function readContract(
    params: {
        address: string;
        functionName: string;
        args?: any[];
        abi?: any[]; // Optional, TronWeb can sometimes infer or fetch if we use .at()
    },
    network = 'mainnet'
) {
    const tronWeb = getTronWeb(network);
    
    try {
        // If ABI provided, we might use it, but TronWeb .at() fetches it from chain usually.
        // If we want to use specific ABI, we might need lower level calls or contract(abi, address)
        
        let contract;
        if (params.abi) {
            contract = tronWeb.contract(params.abi, params.address);
        } else {
            contract = await tronWeb.contract().at(params.address);
        }
        
        const method = contract.methods[params.functionName];
        if (!method) {
            throw new Error(`Function ${params.functionName} not found in contract`);
        }
        
        const args = params.args || [];
        const result = await method(...args).call();
        return result;
        
    } catch (error: any) {
        throw new Error(`Read contract failed: ${error.message}`);
    }
}

/**
 * Write to a smart contract (state changing functions)
 */
export async function writeContract(
    privateKey: string,
    params: {
        address: string;
        functionName: string;
        args?: any[];
        value?: string; // TRX value to send (in Sun)
        abi?: any[];
    },
    network = 'mainnet'
) {
    const tronWeb = getWallet(privateKey, network);
    
    try {
        let contract;
        if (params.abi) {
            contract = tronWeb.contract(params.abi, params.address);
        } else {
            contract = await tronWeb.contract().at(params.address);
        }
        
        const method = contract.methods[params.functionName];
        if (!method) {
            throw new Error(`Function ${params.functionName} not found in contract`);
        }
        
        const args = params.args || [];
        const options: any = {};
        if (params.value) {
            options.callValue = params.value;
        }
        
        const txId = await method(...args).send(options);
        return txId;
        
    } catch (error: any) {
        throw new Error(`Write contract failed: ${error.message}`);
    }
}

/**
 * Fetch contract ABI from TronScan (or via TronWeb if verified)
 */
export async function fetchContractABI(contractAddress: string, network = 'mainnet') {
    const tronWeb = getTronWeb(network);
    try {
        const contract = await tronWeb.trx.getContract(contractAddress);
        if (contract && contract.abi) {
            return contract.abi.entrys;
        }
        throw new Error("ABI not found in contract data");
    } catch (error: any) {
        throw new Error(`Failed to fetch ABI: ${error.message}`);
    }
}

/**
 * Parse ABI (helper to ensure correct format for TronWeb if needed)
 * TronWeb usually expects array of objects.
 */
export function parseABI(abiJson: string | any[]): any[] {
    if (typeof abiJson === 'string') {
        return JSON.parse(abiJson);
    }
    return abiJson;
}

/**
 * Get readable function signatures from ABI
 */
export function getReadableFunctions(abi: any[]) {
    return abi
        .filter(item => item.type === 'function')
        .map(item => {
            const inputs = item.inputs ? item.inputs.map((i: any) => `${i.type} ${i.name}`).join(', ') : '';
            const outputs = item.outputs ? item.outputs.map((i: any) => `${i.type} ${i.name || ''}`).join(', ') : '';
            return `${item.name}(${inputs}) -> (${outputs})`;
        });
}

/**
 * Helper to get a specific function definition from ABI
 */
export function getFunctionFromABI(abi: any[], functionName: string) {
    const func = abi.find(item => item.type === 'function' && item.name === functionName);
    if (!func) {
        throw new Error(`Function ${functionName} not found in ABI`);
    }
    return func;
}

/**
 * Multicall (Simulated/Native)
 * Tron has Multicall contracts deployed. We can try to find one or loop parallel calls.
 * Parallel calls are often "good enough" for MCP unless extremely heavy.
 * For this version, we will implement parallel execution wrapper as Multicall is not standard at one address on all Tron networks.
 */
export async function multicall(
    calls: Array<{
        address: string;
        functionName: string;
        args?: any[];
        abi?: any[];
    }>,
    allowFailure = true,
    network = 'mainnet'
) {
    // Parallel execution
    const results = await Promise.allSettled(
        calls.map(call => readContract(call, network))
    );
    
    return results.map(result => {
        if (result.status === 'fulfilled') {
            return { status: 'success', result: result.value };
        } else {
            return { status: 'failure', error: result.reason };
        }
    });
}
