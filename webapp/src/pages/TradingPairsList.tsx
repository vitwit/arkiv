import { useEffect, useState } from "react";
import { getPairs } from "../lib/dcaQuery";
import type { Pair } from "../lib/dcaQuery";
import { executeBot } from "../lib/dcaTx";

export default function TradingPairsList() {
    const [pairs, setPairs] = useState<Pair[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const data = await getPairs();
                setPairs(data);
            } catch (err: any) {
                console.error(err);
                setError(err?.message || "Failed to load trading pairs");
            } finally {
                setLoading(false);
            }

        })();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-6 text-gray-400">
                <svg
                    className="animate-spin h-6 w-6 mb-2 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    ></circle>
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    ></path>
                </svg>
                Loading trading pairs...
            </div>
        );
    }


    if (error) {
        return (
            <p className="p-6 text-red-400">
                Error loading trading pairs: {error}
            </p>
        );
    }

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Trading Pairs</h2>
            {pairs.length === 0 ? (
                <p className="text-gray-400">No trading pairs found.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-gray-900 text-gray-200 rounded-lg overflow-hidden">
                        <thead>
                            <tr className="bg-gray-800">
                                <th className="px-4 py-2 text-left">From</th>
                                <th className="px-4 py-2 text-left">To</th>
                                <th className="px-4 py-2">Allowed</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pairs.map((pair, idx) => (
                                <tr
                                    key={idx}
                                    className="border-b border-gray-700 hover:bg-gray-800 transition"
                                >
                                    <td className="px-4 py-2">
                                        <div>
                                            <div className="font-semibold">{pair.fromName}</div>
                                            <div className="text-xs text-gray-500">
                                                {pair.from}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-2">
                                        <div>
                                            <div className="font-semibold">{pair.toName}</div>
                                            <div className="text-xs text-gray-500">
                                                {pair.to}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                        {pair.allowed ? (
                                            <span className="px-2 py-1 text-xs rounded bg-green-600 text-white">
                                                Yes
                                            </span>
                                        ) : (
                                            <span className="px-2 py-1 text-xs rounded bg-red-600 text-white">
                                                No
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
