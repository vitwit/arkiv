import React, { useEffect, useState } from 'react';
import { getPlans, type PlanResult } from '../lib/dcaQuery';
import { usePairs } from '../hooks/usePairs';
import { useWalletStore } from '../store/walletStore';
import { approveSpend } from '../lib/erc20';
import { cancelDCA, depositToDCA, pauseDCA, resumeDCA, withdraw } from '../lib/dcaTx';
import { useSnackbar } from '../hooks/useSnackbar';
import { decrypt } from '../lib/fhe';
import StrategyCard from '../components/ui/StrategyCard';


const Strategies: React.FC = () => {
    const { showSnackbar, clearSnackbars } = useSnackbar();
    const [loading, setLoading] = useState(false);
    const [plans, setPlans] = useState<PlanResult[]>([]);

    const { account } = useWalletStore();
    const { data: pairs } = usePairs();

    // ---------- ACTION HANDLERS ---------- //
    const handlePause = async (id: number) => {
        showSnackbar("Signing transaction...", "info");
        try {
            const result = await pauseDCA(id);
            clearSnackbars();
            showSnackbar("Transaction broadcasted", "tx-success", result.hash);
            await fetchPairs();
        } catch (err: any) {
            clearSnackbars();
            showSnackbar(err.message || "Something went wrong", "error");
        } finally {

        }
    };

    const handleResume = async (id: number) => {
        showSnackbar("Signing transaction...", "info");
        try {
            const result = await resumeDCA(id);
            clearSnackbars();
            showSnackbar("Transaction broadcasted", "tx-success", result.hash);
            await fetchPairs();
        } catch (err: any) {
            clearSnackbars();
            showSnackbar(err.message || "Something went wrong", "error");
        } finally {

        }
    };

    const handleCancel = async (id: number) => {
        showSnackbar("Signing transaction...", "info");
        try {
            const result = await cancelDCA(id);
            clearSnackbars();
            showSnackbar("Transaction broadcasted", "tx-success", result.hash);
            await fetchPairs();
        } catch (err: any) {
            clearSnackbars();
            showSnackbar(err.message || "Something went wrong", "error");
        } finally {

        }
    };

    const handleDeposit = async (id: number, totalAmount: string) => {

        showSnackbar("Approve decryption request", "info");
        try {
            const amount = await decrypt([totalAmount]);
            showSnackbar("Requesting token spend", "info");
            await approveSpend(amount[totalAmount]);
            showSnackbar("Depositing into DCA", "info");
            const result = await depositToDCA(id);
            clearSnackbars();
            showSnackbar("Transaction broadcasted", "tx-success", result.hash);
            await fetchPairs();
        } catch (err: any) {
            clearSnackbars();
            showSnackbar(err.message || "Something went wrong", "error");
        } finally {

        }
    };

    const handleWithdraw = async (id: number) => {
        showSnackbar("Signing withdraw transaction...", "info");
        try {
            const result = await withdraw(id);
            clearSnackbars();
            showSnackbar("Withdraw transaction broadcasted", "tx-success", result.hash);
            await fetchPairs();
        } catch (err: any) {
            clearSnackbars();
            showSnackbar(err.message || "Something went wrong", "error");
        } finally {

        }
    };

    const fetchPairs = async () => {
        if (account && pairs) {
            setLoading(true);
            setPlans([]);
            const result = await getPlans(account, pairs);
            setPlans(result);
            setLoading(false);
        }
    }

    // ---------- LOAD DATA ---------- //
    useEffect(() => {
        if (pairs && account) {
            const fetchPlans = async () => {
                try {
                    setLoading(true);
                    const result = await getPlans(account, pairs);
                    setPlans(result);
                } catch (err: any) {
                    showSnackbar(err?.message || "Unknown", "error");
                } finally {
                    setLoading(false);
                }
            };
            fetchPlans();
        }
    }, [pairs, account]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-6 text-gray-400">
                <svg
                    className="animate-spin h-6 w-6 mb-2 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
                Loading Strategies...
            </div>
        );
    }

    if (!loading && plans.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-6 text-gray-400">
                <h1 className="text-xl font-bold">No Strategies Found</h1>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Active DCA Strategies</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map(plan => (

                    <>
                        <StrategyCard
                            planId={plan.id}
                            status={plan.status}
                            title={plan.fromName + '→' + plan.toName}
                            from={plan.from}
                            to={plan.to}
                            fromName={plan.fromName}
                            toName={plan.toName}
                            fromDecimals={plan.fromDecimals}
                            toDecimals={plan.toDecimals}
                            createdAt={plan.startedAt}
                            intervalAmount={plan.amount}
                            investedAmount={plan.totalAmount}
                            outputAmount={plan.pendingOut}
                            remainingAmount={plan.remainingAmount}
                            executedIntervals={plan.executedIntervals}
                            totalIntervals={plan.totalIntervals}
                            frequency={plan.frequency}
                            onCancel={handleCancel}
                            onDeposit={handleDeposit}
                            onPause={handlePause}
                            onResume={handleResume}
                            onWithdraw={handleWithdraw}
                            key={plan.id}
                        />

                    </>
                ))}
            </div>
        </div>
    );
};

export default Strategies;
