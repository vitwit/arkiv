import { ethers } from 'ethers';
import contractJson from './ConfidentialDCABatch.json';
import type { ConfidentialDCABatch } from "./ConfidentialDCABatch";
import { FHEService } from './fheService';

export const contractAddress = import.meta.env.VITE_DCA_CONTRACT || "0xa7c0881009756025F52952e380896fC1D008D448";
export const ABI = contractJson.abi;

export interface TransactionConfirmation {
    hash: string;
}

export async function getProviderAndSigner() {
    if (!window.ethereum) throw new Error("Please install wallet!");

    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send("eth_accounts", []);

    if (!accounts.length) {
        // Only prompt if no accounts connected yet
        await provider.send("eth_requestAccounts", []);
    }

    const signer = await provider.getSigner();
    return { provider, signer };
}

export async function getContract(readOnly = false): Promise<ConfidentialDCABatch> {
    if (readOnly) {
        const provider = new ethers.JsonRpcProvider(import.meta.env.VITE_RPC_URL);
        return new ethers.Contract(contractAddress, ABI, provider) as unknown as ConfidentialDCABatch;
    }

    const { signer } = await getProviderAndSigner();
    return new ethers.Contract(contractAddress, ABI, signer) as unknown as ConfidentialDCABatch;
}


export async function createDCA(toAddress: string, totalAmount: string, intervalAmount: string,
    timeframe: string, frequency: string): Promise<TransactionConfirmation> {

    const contract = await getContract();
    const { signer } = await getProviderAndSigner();

    try {
        const instance = FHEService.getInstance();
        if (!instance.isReady()) {
            instance.initialize();
        }
        const buffer = instance.createEncryptedInput(
            contractAddress,
            signer.address,
        );

        buffer.add64(parseInt(timeframe));
        buffer.add64(parseInt(frequency));
        buffer.add64(parseInt(totalAmount));
        buffer.add64(parseInt(intervalAmount));
        const ciphertexts = await buffer.encrypt();

        const tx = await contract.createPlan(
            toAddress,
            BigInt(Math.floor(Date.now() / 1000) + 60), // startTime: 1 min later
            ciphertexts.handles[1],
            ciphertexts.handles[2],
            ciphertexts.handles[3],
            ciphertexts.handles[0],
            ciphertexts.inputProof,
        )

        // Wait for confirmation
        const receipt = await tx.wait();
        console.log("Transaction confirmed:", receipt);
        return {
            hash: receipt?.hash || ""
        }
    } catch (err) {
        console.error("Error sending transaction:", err);
        throw err;
    }
}

export async function pauseDCA(planId: number): Promise<TransactionConfirmation> {

    const contract = await getContract();
    try {
        const tx = await contract.pausePlan(planId);

        const receipt = await tx.wait();
        console.log("Transaction confirmed:", receipt);
        return {
            hash: receipt?.hash || ""
        }
    } catch (err) {
        console.error("Error sending transaction:", err);
        throw err;
    }
}


export async function cancelDCA(planId: number): Promise<TransactionConfirmation> {

    const contract = await getContract();
    try {
        const tx = await contract.cancelPlan(planId);

        // Wait for confirmation
        const receipt = await tx.wait();
        console.log("Transaction confirmed:", receipt);
        return {
            hash: receipt?.hash || ""
        }
    } catch (err) {
        console.error("Error sending transaction:", err);
        throw err;
    }
}

export async function depositToDCA(planId: number): Promise<TransactionConfirmation> {

    const contract = await getContract();
    try {
        const tx = await contract.depositToPlan(planId);

        // Wait for confirmation
        const receipt = await tx.wait();
        console.log("Transaction confirmed:", receipt);
        return {
            hash: receipt?.hash || ""
        }
    } catch (err) {
        console.error("Error sending transaction:", err);
        throw err;
    }
}

export async function resumeDCA(planId: number): Promise<TransactionConfirmation> {

    const contract = await getContract();
    try {
        const tx = await contract.resumePlan(planId);

        // Wait for confirmation
        const receipt = await tx.wait();
        console.log("Transaction confirmed:", receipt);
        return {
            hash: receipt?.hash || ""
        }
    } catch (err) {
        console.error("Error sending transaction:", err);
        throw err;
    }
}

export async function withdraw(planId: number): Promise<TransactionConfirmation> {

    const contract = await getContract();
    try {
        const tx = await contract.withdraw(planId);

        // Wait for confirmation
        const receipt = await tx.wait();
        console.log("Transaction confirmed:", receipt);
        return {
            hash: receipt?.hash || ""
        }
    } catch (err) {
        console.error("Error sending transaction:", err);
        throw err;
    }
}


export async function addNewPair(from: string, fromName: string, fromDecimals: number,
    to: string, toName: string, toDecimals: number, allowed: boolean = true): Promise<TransactionConfirmation> {

    const contract = await getContract(); // wallet-connected
    try {
        const tx = await contract.updateAllowedPair(
            from,
            fromName,
            ethers.toNumber(fromDecimals),
            to,
            toName,
            ethers.toNumber(toDecimals),
            allowed,
        )
        const receipt = await tx.wait();
        console.log("Transaction confirmed:", receipt);
        return {
            hash: receipt?.hash || ""
        }
    } catch (err) {
        console.error("Error sending transaction:", err);
        throw err;
    }
}

export async function isContractOwner(): Promise<boolean> {
    const contract = await getContract();
    const { signer } = await getProviderAndSigner();
    try {
        const adminAddress = await contract.owner();
        return signer.address.toLowerCase() === adminAddress.toLowerCase();
    } catch (err) {
        console.log(err);
        return false
    }
}



export async function executeBot(from: string, to: string): Promise<TransactionConfirmation> {

    const contract = await getContract();
    try {
        const tx = await contract.triggerBatch(from, to);

        const receipt = await tx.wait();
        console.log("Transaction confirmed:", receipt);
        return {
            hash: receipt?.hash || ""
        }
    } catch (err) {
        console.error("Error sending transaction:", err);
        throw err;
    }
}


export async function testswap() {

    const abi = [
        "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)"
    ]

    const { signer } = await getProviderAndSigner();
    const uniswapContract = new ethers.Contract("0xeE567Fe1712Faf6149d80dA1E6934E354124CfE3", abi, signer) as unknown as any;

    const USDC = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";
    const USDT = "0x7169d38820dfd117c3fa1f22a697dba58d90ba06";

    const amountIn = ethers.parseUnits("1", 6); // 10 USDC (if 6 decimals)


    // Approve router
    // const usdc = new ethers.Contract(USDC, ["function approve(address spender,uint256 amount) public returns(bool)"], signer);
    // await usdc.approve(uniswapContract.target, amountIn);

    // Path USDC -> USDT
    const path = [USDC, USDT];

    const tx = await uniswapContract.swapExactTokensForTokens(
        amountIn,
        0, // minOut
        path,
        signer.address,
        Math.floor(Date.now() / 1000) + 60 * 20
    );

    console.log("Swap TX:", tx.hash);
    await tx.wait();
    console.log("Swap completed!");
}
