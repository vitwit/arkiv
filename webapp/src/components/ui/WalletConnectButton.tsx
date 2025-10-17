import { ethers } from 'ethers';
import { ClipboardIcon, CheckIcon, ArrowRightEndOnRectangleIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { useWalletStore } from './../../store/walletStore';

export default function ConnectWalletButton() {
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

    const shortAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

    const copyAddress = async () => {
        if (account) {
            await navigator.clipboard.writeText(account);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (!account) {
        return (
            <button
                onClick={connectWallet}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
                Connect Wallet
            </button>
        );
    }

    return (
        <div className="bg-gray-800 rounded-lg flex items-center justify-between gap-6">
            <div className="flex flex-col gap-1">
                <span className="text-white text-sm font-medium">{ensName || 'Ethereum Wallet'}</span>
                <div className="flex items-center space-x-1">
                    <span className="text-gray-400 text-xs">{shortAddress(account)}</span>
                    <button onClick={copyAddress} className="hover:bg-gray-700 p-1 rounded hover:cursor-pointer">
                        {copied ? (
                            <CheckIcon className="h-3 w-3 text-green-400" />
                        ) : (
                            <ClipboardIcon className="h-3 w-3 text-gray-400" />
                        )}
                    </button>
                </div>
            </div>
            <button onClick={resetWallet} className="hover:bg-gray-700 p-1 rounded hover:cursor-pointer" title="Disconnect">
                <ArrowRightEndOnRectangleIcon className="h-5 w-5 text-red-400 hover:text-red-500" />
            </button>
        </div>
    );
}
