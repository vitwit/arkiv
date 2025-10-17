import { ethers } from "ethers";
import { getProviderAndSigner } from "./dcaTx";


const RPC = import.meta.env.VITE_RPC_URL;
const provider = new ethers.JsonRpcProvider(RPC);
const usdcAddress: string = import.meta.env.VITE_USDC_CONTRACT;
const dcaAddress: string = import.meta.env.VITE_DCA_CONTRACT;

const abi = [
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)"
];

export async function getERC20Balance(): Promise<void> {
    const contract = new ethers.Contract(usdcAddress, abi, provider);

    const { signer } = await getProviderAndSigner();


    const [rawBalance, decimals]: [bigint, number] = await Promise.all([
        contract.balanceOf(signer.address),
        contract.decimals()
    ]);

    const balance: string = ethers.formatUnits(rawBalance, decimals);
    console.log(`Balance: ${balance}`);
}

export async function approveSpend(amount: number): Promise<void> {

    const { signer } = await getProviderAndSigner();

    const usdc = new ethers.Contract(usdcAddress, abi, signer);

    // Step 1: User approves your contract
    await usdc.approve(dcaAddress, amount);

    return;
}
