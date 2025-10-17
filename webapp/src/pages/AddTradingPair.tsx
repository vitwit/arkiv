import { useMemo, useState } from "react";
import { addNewPair } from "./../lib/dcaTx";
import { ArrowRightIcon } from "@heroicons/react/24/solid";
import { useSnackbar } from "../hooks/useSnackbar";

export default function AddTradingPair() {
    const [from, setFrom] = useState(import.meta.env.VITE_USDC_CONTRACT);
    const [fromName, setFromName] = useState("USDC");
    const [fromDecimals, setFromDecimals] = useState<number>(6);

    const [to, setTo] = useState("");
    const [toName, setToName] = useState("");
    const [toDecimals, setToDecimals] = useState<number>(18);

    const [loading, setLoading] = useState(false);
    const [txHash, setTxHash] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // very light client-side checks
    const isAddress = (v: string) => /^0x[a-fA-F0-9]{40}$/.test(v.trim());
    const errors = useMemo(() => {
        const e: Record<string, string> = {};
        if (!isAddress(from)) e.from = "Enter a valid ERC-20 contract address (0x…40 hex).";
        if (!isAddress(to)) e.to = "Enter a valid ERC-20 contract address (0x…40 hex).";
        if (!fromName.trim()) e.fromName = "Token name is required.";
        if (!toName.trim()) e.toName = "Token name is required.";
        if (!Number.isFinite(fromDecimals) || fromDecimals < 0 || fromDecimals > 255)
            e.fromDecimals = "Decimals must be 0–255 (int8).";
        if (!Number.isFinite(toDecimals) || toDecimals < 0 || toDecimals > 255)
            e.toDecimals = "Decimals must be 0–255 (int8).";
        return e;
    }, [from, to, fromName, toName, fromDecimals, toDecimals]);

    const hasErrors = Object.keys(errors).length > 0;

    const [touched, setTouched] = useState<Record<string, boolean>>({});

    const markTouched = (field: string) =>
        setTouched((prev) => ({ ...prev, [field]: true }));

    const showError = (field: string) =>
        (touched[field]) && errors[field];


    const { showSnackbar } = useSnackbar();
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setTxHash(null);
        if (hasErrors) {
            setError("Please fix the highlighted fields.");
            return;
        }
        try {
            showSnackbar("Requesting wallet", "info")
            setLoading(true);
            const tx = await addNewPair(
                from.trim(),
                fromName.trim(),
                fromDecimals,
                to.trim(),
                toName.trim(),
                toDecimals,
                true
            );
            setTxHash(tx.hash);
            showSnackbar("Transaction broadcasted successfully", "success", tx.hash)
        } catch (err: any) {
            console.error(err);
            showSnackbar(err?.message || "Transaction failed", "error");
            setError(err?.message || "Transaction failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto text-center bg-gray-900 text-white rounded-xl shadow-lg">
            <h2 className="text-3xl font-bold mb-2">Add Trading Pair</h2>
            <p className="text-sm text-gray-400 mb-6">
                Define an allowed trading pair your DCA strategies can use.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* FROM → TO row */}
                <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 md:gap-6 items-stretch">
                    {/* FROM card */}
                    <section className="bg-gray-800 rounded-lg border border-gray-700 p-4">
                        <header className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-semibold text-blue-400">From</h3>
                            <span className="text-xs text-gray-400">Spending token</span>
                        </header>

                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm mb-1">Token Address</label>
                                <input
                                    value={from}
                                    disabled
                                    onChange={(e) => setFrom(e.target.value)}
                                    placeholder="0x…"
                                    onBlur={() => markTouched("from")}
                                    className={`w-full p-2 rounded bg-gray-900 text-gray-500 border ${showError("from") ? "border-red-500" : "border-gray-700"} focus:outline-none`}
                                />
                                {showError("from") && <p className="text-xs text-red-400 mt-1">{errors.from}</p>}
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div className="col-span-2">
                                    <label className="block text-sm mb-1">Token Name</label>
                                    <input
                                        value={fromName}
                                        disabled
                                        onChange={(e) => setFromName(e.target.value)}
                                        placeholder="USDC, ETH…"
                                        onBlur={() => markTouched("fromName")}
                                        className={`w-full p-2 rounded bg-gray-900 text-gray-500 border ${showError("fromName") ? "border-red-500" : "border-gray-700"} focus:outline-none`}
                                    />
                                    {showError("fromName") && <p className="text-xs text-red-400 mt-1">{errors.fromName}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm mb-1">Decimals</label>
                                    <input
                                        type="number"
                                        disabled
                                        value={fromDecimals}
                                        onBlur={() => markTouched("fromDecimals")}
                                        onChange={(e) => setFromDecimals(Number(e.target.value))}
                                        className={`w-full p-2 rounded bg-gray-900 text-gray-500 border ${showError("fromDecimals") ? "border-red-500" : "border-gray-700"} focus:outline-none`}
                                    />
                                    {showError("fromDecimals") && (
                                        <p className="text-xs text-red-400 mt-1">{errors.fromDecimals}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* center arrow */}
                    <div className="hidden md:flex items-center justify-center">
                        <div className="h-12 w-12 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center">
                            <ArrowRightIcon className="h-6 w-6 text-gray-300" />
                        </div>
                    </div>

                    {/* TO card */}
                    <section className="bg-gray-800 rounded-lg border border-gray-700 p-4">
                        <header className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-semibold text-green-400">To</h3>
                            <span className="text-xs text-gray-400">Acquired token</span>
                        </header>

                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm mb-1">Token Address</label>
                                <input
                                    value={to}
                                    onChange={(e) => setTo(e.target.value)}
                                    placeholder="0x…"
                                    onBlur={() => markTouched("to")}
                                    className={`w-full p-2 rounded bg-gray-900 border ${showError("to") ? "border-red-500" : "border-gray-700"} focus:outline-none`}
                                />
                                {showError("to") && <p className="text-xs text-red-400 mt-1">{errors.to}</p>}
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div className="col-span-2">
                                    <label className="block text-sm mb-1">Token Name</label>
                                    <input
                                        value={toName}
                                        onChange={(e) => setToName(e.target.value)}
                                        placeholder="ETH, wBTC…"
                                        onBlur={() => markTouched("toName")}
                                        className={`w-full p-2 rounded bg-gray-900 border ${showError("toName") ? "border-red-500" : "border-gray-700"} focus:outline-none`}
                                    />
                                    {showError("toName") && <p className="text-xs text-red-400 mt-1">{errors.toName}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm mb-1">Decimals</label>
                                    <input
                                        type="number"
                                        value={toDecimals}
                                        onBlur={() => markTouched("toDecimals")}
                                        onChange={(e) => setToDecimals(Number(e.target.value))}
                                        className={`w-full p-2 rounded bg-gray-900 border ${showError("toPrecison") ? "border-red-500" : "border-gray-700"} focus:outline-none`}
                                    />
                                    {showError("toDecimals") && (
                                        <p className="text-xs text-red-400 mt-1">{errors.toDecimals}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* footer row */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-6 justify-between">

                    <div className="flex-1" />

                    <button
                        type="submit"
                        disabled={loading || hasErrors}
                        className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Sending…" : "Submit"}
                    </button>
                </div>

                {/* messages */}
                {txHash && (
                    <p className="text-green-400 text-sm">
                        Transaction sent:{" "}
                        <a
                            href={`https://sepolia.etherscan.io/tx/${txHash}`}
                            target="_blank"
                            rel="noreferrer"
                            className="underline"
                        >
                            {txHash}
                        </a>
                    </p>
                )}
                {error && <p className="text-red-400 text-sm">{error}</p>}
            </form>
        </div>
    );
}
