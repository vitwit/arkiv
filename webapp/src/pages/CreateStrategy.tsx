import React, { useEffect, useState } from 'react';
import Card from './../components/ui/Card';
import { ArrowRightIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/solid';
import { getPairs, type Pair } from '../lib/dcaQuery';
import { createDCA } from '../lib/dcaTx';
import { useSnackbar } from '../hooks/useSnackbar';
import { approveSpend } from '../lib/erc20';

const CreateStrategy: React.FC = () => {
    const [fromToken, setFromToken] = useState(import.meta.env.VITE_USDC_CONTRACT);
    const [toToken, setToToken] = useState('');
    const [budget, setBudget] = useState('');
    const [purchaseAmount, setPurchaseAmount] = useState('');
    const [everyValue, setEveryValue] = useState('');
    const [everyUnit, setEveryUnit] = useState('days');
    const [overValue, setOverValue] = useState('');

    const [loading, setLoading] = useState<boolean>(false);


    const fromPairs: Pair[] = [
        {
            from: import.meta.env.VITE_USDC_CONTRACT || "",
            fromName: "USDC",
            fromDecimals: 6,
            to: "",
            toName: "",
            toDecimals: 16,
            allowed: true,
        }
    ]


    const [error, setError] = useState("");
    const [pairs, setPairs] = useState<Pair[]>([]);
    useEffect(() => {
        getPairs()
            .then((pairs: Pair[]) => {
                if (!pairs) setPairs([]);
                else
                    setPairs(pairs);
            })
            .catch((err) => {
                setError(err);
            })
    }, []);

    // Help popup state
    const [visibleHelp, setVisibleHelp] = useState<string | null>(null);
    const [hoveredHelp, setHoveredHelp] = useState<string | null>(null);

    const toggleHelp = (field: string) => {
        setVisibleHelp((prev) => (prev === field ? null : field));
    };


    const HelpIcon = ({
        fieldKey,
        description,
    }: {
        fieldKey: string;
        description: string;
    }) => {
        const isVisible = visibleHelp === fieldKey || hoveredHelp === fieldKey;

        return (
            <div className="relative inline-block">
                <QuestionMarkCircleIcon
                    className="h-4 w-4 text-gray-400 cursor-pointer hover:text-white"
                    onClick={() => toggleHelp(fieldKey)}
                    onMouseEnter={() => setHoveredHelp(fieldKey)}
                    onMouseLeave={() => setHoveredHelp(null)}
                />
                {isVisible && (
                    <div className="absolute z-10 left-full ml-2 w-48 p-2 bg-gray-800 border border-gray-600 rounded-md shadow-lg text-xs text-gray-300">
                        {description}
                    </div>
                )}
            </div>
        );
    };

    const { showSnackbar } = useSnackbar();
    const [txHash, setTxHash] = useState('');
    const handleSubmit = async (e: React.FormEvent) => {

        showSnackbar('Requesting USDC spend...', 'info');
        e.preventDefault();
        setLoading(true);

        // USDC decimals (usually 6 decimals)
        const USDC_DECIMALS = 10 ** 6;

        // Convert budget and purchase amount to smallest units (integer)
        const budgetInUnits = Math.floor(parseFloat(budget) * USDC_DECIMALS);
        await approveSpend(budgetInUnits)
        const purchaseAmountInUnits = Math.floor(parseFloat(purchaseAmount) * USDC_DECIMALS);

        // Helper: convert value+unit to seconds
        const toSeconds = (value: number, unit: string) => {
            const secondsPerUnit: Record<string, number> = {
                minutes: 60,
                hours: 60 * 60,
                days: 24 * 60 * 60,
                weeks: 7 * 24 * 60 * 60
            };
            return value * (secondsPerUnit[unit] || 0);
        };

        const everyInSeconds = toSeconds(Number(everyValue), everyUnit);
        const numPurchases = Number(overValue);
        try {
            showSnackbar('Requesting wallet approval...', 'info');
            const result = await createDCA(toToken, budgetInUnits.toString(),
                purchaseAmountInUnits.toString(), numPurchases.toString(), everyInSeconds.toString())
            setTxHash(result.hash);
        } catch (err: any) {
            setError(err?.message || "unknown");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!purchaseAmount || !everyValue || !overValue) {
            setBudget("");
            return;
        }

        const toSeconds = (value: number, unit: string) => {
            const secondsPerUnit: Record<string, number> = {
                minutes: 60,
                hours: 60 * 60,
                days: 24 * 60 * 60,
                weeks: 7 * 24 * 60 * 60,
            };
            return value * (secondsPerUnit[unit] || 0);
        };

        const everyInSeconds = toSeconds(Number(everyValue), everyUnit);
        const numPurchases = Number(overValue);

        if (everyInSeconds > 0 && numPurchases > 0) {
            const totalBudget = numPurchases * parseFloat(purchaseAmount || "0");
            setBudget(totalBudget.toString());
        }
    }, [purchaseAmount, everyValue, everyUnit, overValue, overValue]);

    return (
        <div className="max-w-4xl mx-auto mt-8">
            <h1 className="text-3xl font-bold mb-6 text-white">Create New DCA Plan</h1>

            <Card>
                <div className='p-6'>
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Token Pair */}
                        <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-4">
                            <div className="flex-1">
                                <div className="flex items-center space-x-1">
                                    <label className="block text-sm font-medium text-gray-300">From Token</label>
                                    <HelpIcon
                                        fieldKey="fromToken"
                                        description="The token you will be spending to perform the DCA strategy."
                                    />
                                </div>
                                <select
                                    value={fromToken}
                                    onChange={(e) => setFromToken(e.target.value)}
                                    className="w-full mt-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    required
                                >
                                    <option value="">Select Token</option>
                                    {fromPairs.map((pair, index) => (
                                        <option key={index} disabled={!pair.allowed} value={pair.from}>
                                            {pair.fromName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="hidden sm:flex items-center justify-center h-12 w-12 rounded-full bg-gray-700 mt-6">
                                <ArrowRightIcon className="h-5 w-5 text-gray-300" />
                            </div>

                            <div className="flex-1">
                                <div className="flex items-center space-x-1">
                                    <label className="block text-sm font-medium text-gray-300">To Token</label>
                                    <HelpIcon
                                        fieldKey="toToken"
                                        description="The token you want to acquire through your DCA strategy."
                                    />
                                </div>
                                <select
                                    value={toToken}
                                    onChange={(e) => setToToken(e.target.value)}
                                    className="w-full mt-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    required
                                >
                                    <option value="">Select Token</option>
                                    {pairs.map((pair, index) => (
                                        <option key={index} value={pair.to}>
                                            {pair.toName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:space-x-6">

                            {/* Budget */}
                            <div className='flex-1'>
                                <div className="flex items-center space-x-1">
                                    <label className="block text-sm font-medium text-gray-300">Budget</label>
                                    <HelpIcon
                                        fieldKey="budget"
                                        description="Total USDC you plan to invest across the whole DCA strategy."
                                    />
                                </div>
                                <div className="flex space-x-1 mt-1">
                                    <input
                                        value={budget}
                                        disabled
                                        onChange={(e) => setBudget(e.target.value)}
                                        className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        placeholder="Enter total budget"
                                        required
                                    />
                                    <select
                                        value="USDC"
                                        disabled
                                        className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                    >
                                        <option value="USDC">USDC</option>
                                    </select>
                                </div>
                            </div>

                            {/* Purchase Amount */}
                            <div className='flex-1'>
                                <div className="flex items-center space-x-1">
                                    <label className="block text-sm font-medium text-gray-300">Purchase Amount</label>
                                    <HelpIcon
                                        fieldKey="purchaseAmount"
                                        description="The amount of USDC to spend on each purchase interval."
                                    />
                                </div>
                                <div className="flex space-x-1 mt-1">
                                    <input
                                        value={purchaseAmount}
                                        onChange={(e) => setPurchaseAmount(e.target.value)}
                                        className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        placeholder="Enter amount per buy"
                                        required
                                    />
                                    <select
                                        value="USDC"
                                        disabled
                                        className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                    >
                                        <option value="USDC">USDC</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:space-x-6">

                            {/* Frequency (Every) */}
                            <div className='flex-1'>
                                <div className="flex items-center space-x-1">
                                    <label className="block text-sm font-medium text-gray-300">Every</label>
                                    <HelpIcon
                                        fieldKey="every"
                                        description="How often to make each purchase (e.g., every 2 days)."
                                    />
                                </div>
                                <div className="flex space-x-1 mt-1">
                                    <input
                                        type="number"
                                        value={everyValue}
                                        onChange={(e) => setEveryValue(e.target.value)}
                                        className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        placeholder="Interval value"
                                        required
                                    />
                                    <select
                                        value={everyUnit}
                                        onChange={(e) => setEveryUnit(e.target.value)}
                                        className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    >
                                        <option value="minutes">Minutes</option>
                                        <option value="hours">Hours</option>
                                        <option value="days">Days</option>
                                        <option value="weeks">Weeks</option>
                                    </select>
                                </div>
                            </div>


                            {/* Timeframe (Over) */}
                            <div className='flex-1'>
                                <div className="flex items-center space-x-1">
                                    <label className="block text-sm font-medium text-gray-300">Number of Intervals</label>
                                    <HelpIcon
                                        fieldKey="over"
                                        description="How many times the DCA will execute in total."
                                    />
                                </div>
                                <div className="flex space-x-1 mt-1">
                                    <input
                                        type="number"
                                        value={overValue}
                                        onChange={(e) => setOverValue(e.target.value)}
                                        className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        placeholder="e.g. 10 (total purchases)"
                                        required
                                    />

                                </div>
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className="
                                    bg-indigo-600 
                                    text-white 
                                    px-6 py-3 
                                    rounded-lg 
                                    font-medium 
                                    hover:bg-indigo-700 
                                    focus:ring-2 
                                    focus:ring-indigo-500 
                                    focus:outline-none
                                    disabled:bg-gray-400     /* background color when disabled */
                                    disabled:cursor-not-allowed /* prevents hover pointer */
                                    disabled:hover:bg-gray-400  /* stops hover color change */
                                "
                            >
                                {loading ? `Please wait..` : `Create Strategy`}
                            </button>
                        </div>

                    </form>
                </div>

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
            </Card>

        </div>
    );
};

export default CreateStrategy;
