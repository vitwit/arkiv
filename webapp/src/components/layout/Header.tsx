import { useState } from 'react';
import { Link } from 'react-router-dom';
import WalletConnectButton from './../ui/WalletConnectButton';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

export default function Header() {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <header className="bg-gray-800 shadow-sm relative">
            <div className="container mx-auto flex justify-between items-center py-4 px-4">
                {/* Left side: Logo + Nav */}
                <div className="flex items-center space-x-6">
                    <Link to="/" className="font-bold text-xl text-white">DCA Bot</Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex space-x-4">
                        <Link to="/" className="text-gray-300 hover:text-white">Dashboard</Link>
                        <Link to="/plans" className="text-gray-300 hover:text-white">Plans</Link>
                    </nav>
                </div>

                {/* Right side: Wallet + Hamburger */}
                <div className="flex items-center space-x-3">
                    <div className="hidden md:block">
                        <WalletConnectButton />
                    </div>

                    {/* Mobile Hamburger */}
                    <button
                        className="md:hidden p-2 rounded hover:bg-gray-700 hover:cursor-pointer"
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label="Toggle Menu"
                    >
                        {menuOpen ? (
                            <XMarkIcon className="h-6 w-6 text-white" />
                        ) : (
                            <Bars3Icon className="h-6 w-6 text-white" />
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {menuOpen && (
                <div className="md:hidden bg-gray-800 px-4 pb-4 space-y-2 absolute w-full shadow-lg z-10">
                    <Link to="/" className="block text-gray-300 hover:text-white">Dashboard</Link>
                    <Link to="/plans" className="block text-gray-300 hover:text-white">Plans</Link>
                    <div className="pt-2 border-t border-gray-700">
                        <WalletConnectButton />
                    </div>
                </div>
            )}
        </header>
    );
}
