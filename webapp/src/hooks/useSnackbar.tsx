import React, { createContext, useContext, useCallback, useState } from 'react';
import Snackbar from './../components/ui/Snackbar';

type SnackbarType = 'info' | 'success' | 'error' | 'tx-success';

export interface SnackbarMessage {
  id: number;
  message: string;
  type: SnackbarType;
  txHash?: string;
}

interface SnackbarContextType {
  showSnackbar: (message: string, type?: SnackbarType, txHash?: string) => void;
  clearSnackbars: () => void;
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

let idCounter = 0;

export const SnackbarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [snacks, setSnacks] = useState<SnackbarMessage[]>([]);

  const showSnackbar = useCallback((message: string, type: SnackbarType = 'info', txHash?: string) => {
    const id = idCounter++;
    const snack: SnackbarMessage = { id: id, message: message, type: type, txHash: txHash };
    setSnacks((prev) => [...prev, snack]);

    setTimeout(() => {
      setSnacks((prev) => prev.filter((s) => s.id !== id));
    }, 5000);
  }, []);

  const handleDismiss = (id: number) => {
    setSnacks((prev) => prev.filter((s) => s.id !== id));
  };

  const clearSnackbars = () => {
    setSnacks([]); // clears all at once
  };

  return (
    <SnackbarContext.Provider value={{ showSnackbar, clearSnackbars }}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-3">
        {snacks.map((snack) => (
          <Snackbar key={snack.id} {...snack} onDismiss={() => handleDismiss(snack.id)} />
        ))}
      </div>
    </SnackbarContext.Provider>
  );
};

export const useSnackbar = () => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }
  return context;
};
