import { create } from 'zustand';

interface WalletState {
    account: string | null;
    ensName: string | null;
    setWallet: (account: string | null, ensName?: string | null) => void;
    resetWallet: () => void;
}

export const useWalletStore = create<WalletState>((set) => ({
    account: null,
    ensName: null,
    setWallet: (account, ensName) => set({ account, ensName }),
    resetWallet: () => set({ account: null, ensName: null }),
}));
