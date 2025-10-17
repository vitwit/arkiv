import React, { type JSX } from 'react';
import {
    CheckCircleIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
    XMarkIcon
} from '@heroicons/react/24/solid';
import type { SnackbarMessage } from '../../hooks/useSnackbar';

interface Props extends SnackbarMessage {
    onDismiss: () => void;
}

const iconMap: Record<SnackbarMessage['type'], JSX.Element> = {
    success: <CheckCircleIcon className="h-6 w-6 text-white" />,
    'tx-success': <CheckCircleIcon className="h-6 w-6 text-white" />,
    error: <ExclamationTriangleIcon className="h-6 w-6 text-white" />,
    info: <InformationCircleIcon className="h-6 w-6 text-white" />
};

const bgMap: Record<SnackbarMessage['type'], string> = {
    success: 'bg-green-600',
    'tx-success': 'bg-green-700',
    error: 'bg-red-600',
    info: 'bg-teal-800'
};

const Snackbar: React.FC<Props> = ({ message, type, txHash, onDismiss }) => {
    return (
        <div
            className={`
                flex items-start p-4 rounded-lg shadow-lg text-white w-80 max-w-sm
                animate-slideInRight
                ${bgMap[type]}
            `}
        >
            <div className="flex-shrink-0">{iconMap[type]}</div>
            <div className="ml-3 flex-1 text-sm">
                <p>{message}</p>
                {type === 'tx-success' && (
                    <a
                        href={`${import.meta.env.VITE_TX_HASH_URL}/${txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline text-xs text-white/90 hover:text-white"
                    >
                        View on Explorer
                    </a>
                )}
            </div>
            <button
                onClick={onDismiss}
                className="ml-4 hover:text-gray-200 transition"
                aria-label="Dismiss"
            >
                <XMarkIcon className="h-5 w-5" />
            </button>
        </div>
    );
};

export default Snackbar;
