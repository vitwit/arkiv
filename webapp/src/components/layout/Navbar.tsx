import { useState } from "react";
import { useWalletStore } from "../../store/walletStore";
import {
    WalletIcon,
    ChevronDownIcon,
    ArrowLeftOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { ethers } from 'ethers';

export default function NavBar() {
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const { account, ensName, setWallet, resetWallet } = useWalletStore();
    const [copied, setCopied] = useState(false);

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


    const shortenAddress = (addr: string) =>
        addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "";

    return (
        <nav className="w-full bg-gray-800 px-6 py-4 flex items-center justify-between text-white shadow-md">
            {/* Left: App Name */}
            <div className="text-2xl font-bold">Arkiv</div>

            {/* Right: Wallet */}
            <div className="relative">
                {!account ? (
                    <button
                        onClick={connectWallet}
                        className="inline-flex items-center gap-2 bg-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                    >
                        <WalletIcon className="w-5 h-5" />
                        Connect Wallet
                    </button>
                ) : (
                    <div>
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="inline-flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-lg hover:bg-gray-700 transition"
                        >
                            <WalletIcon className="w-5 h-5" />
                            {ensName || shortenAddress(account)}
                            <ChevronDownIcon
                                className={`w-4 h-4 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                            />
                        </button>

                        {/* Dropdown */}
                        {dropdownOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-lg shadow-lg z-10">
                                <button
                                    onClick={() => {
                                        resetWallet();
                                        setDropdownOpen(false);
                                    }}
                                    className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-100 rounded-t-md"
                                >
                                    <ArrowLeftOnRectangleIcon className="w-4 h-4" />
                                    Disconnect
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
}
