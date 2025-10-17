import { Link, useLocation } from 'react-router-dom';
import { HomeIcon, PlusCircleIcon, ClipboardDocumentIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { isContractOwner } from '../../lib/dcaTx';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const location = useLocation();
    const [isOwner, setOwner] = useState<boolean>(false);
    const [account, setAccount] = useState<string | null>(null);

    useEffect(() => {
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts: string[]) => {
                setAccount(accounts.length > 0 ? accounts[0] : null);
            });

            window.ethereum.request({ method: 'eth_accounts' }).then((accounts: string[]) => {
                setAccount(accounts.length > 0 ? accounts[0] : null);
            });
        }
    }, []);

    useEffect(() => {
        if (account) {
            (async () => {
                try {
                    const ownerStatus = await isContractOwner();
                    setOwner(ownerStatus);
                } catch (err) {
                    console.error("Failed to check contract owner status:", err);
                    setOwner(false);
                }
            })();
        }
    }, [account]);

    const navItems = [
        { to: '/', label: 'Home', Icon: HomeIcon },
        { to: '/strategies/create', label: 'Create Strategy', Icon: PlusCircleIcon },
        // { to: '/my-strategies', label: 'My Strategies', Icon: ClipboardDocumentIcon },
        ...(isOwner
            ? [{ to: '/trading-pairs/add', label: 'Add Trading Pair', Icon: ClipboardDocumentIcon },
            { to: '/trading-pairs', label: 'Trading Pairs', Icon: ClipboardDocumentIcon }
            ]
            : []),
        { to: '/about', label: 'About', Icon: InformationCircleIcon },
    ];

    return (
        <aside
            className={`
                fixed top-0 left-0 h-screen bg-gray-800 text-gray-100 w-64 z-30
                transform transition-transform duration-300
                md:translate-x-0 md:static md:flex md:flex-col md:h-screen
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}
        >
            <div className="flex flex-col h-full">
                {/* Logo */}
                <div className="px-6 py-5 font-bold text-2xl border-b border-gray-700">
                    <Link to="/" onClick={onClose}>
                        DCA Bot
                    </Link>
                </div>

                {/* Nav Links */}
                <nav className="flex flex-col flex-1 px-4 py-6 space-y-2">
                    {navItems.map(({ to, label, Icon }) => {
                        const isActive = location.pathname === to;

                        return (
                            <Link
                                key={to}
                                to={to}
                                onClick={onClose}
                                className={`
                                    flex items-center space-x-3 px-3 py-2 rounded-md
                                    transition-colors
                                    ${isActive ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}
                                `}
                            >
                                <Icon className="h-5 w-5" aria-hidden="true" />
                                <span>{label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </aside>
    );
}
