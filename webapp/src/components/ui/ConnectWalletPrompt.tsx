import { ethers } from 'ethers';
import { useWalletStore } from './../../store/walletStore';

export default function ConnectWalletPrompt() {
    const { setWallet } = useWalletStore();

    const connectWallet = async () => {
        try {
            if (!window.ethereum) {
                alert('MetaMask is not installed. Please install it to connect.');
                return;
            }

            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts',
            });

            const provider = new ethers.BrowserProvider(window.ethereum);
            const name = await provider.lookupAddress(accounts[0]);

            setWallet(accounts[0], name || null);
        } catch (err) {
            console.error('Wallet connection failed:', err);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-6">
            <h2 className="text-xl md:text-2xl font-semibold text-gray-200">
                Please connect wallet to continue
            </h2>
            <button
                onClick={connectWallet}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition hover:cursor-pointer"
            >
                Connect Wallet
            </button>
        </div>
    );
}
