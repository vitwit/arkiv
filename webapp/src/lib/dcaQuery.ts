

import { ethers } from "ethers";
import { ABI, contractAddress } from "./dcaTx";
import type { ConfidentialDCABatch } from "./ConfidentialDCABatch";

export interface Pair {
    from: string
    fromName: string
    fromDecimals: number
    to: string
    toName: string
    toDecimals: number
    allowed: boolean
}

export async function getPairs(): Promise<Pair[]> {
    const provider = new ethers.JsonRpcProvider(import.meta.env.VITE_RPC_URL);

    const contract = new ethers.Contract(
        contractAddress,
        ABI,
        provider
    ) as unknown as ConfidentialDCABatch;

    try {
        const pairs: any[] = await contract.getAllPairs();
        return pairs as unknown as Pair[];
    } catch (err) {
        throw err;
    }
}



export interface PlanResult {
    id: number
    fromName: string
    toName: string
    startedAt: number
    frequency: string
    totalAmount: string
    amount: string
    totalIntervals: string
    executedIntervals: string
    remainingAmount: string
    status: number
    from: string
    to: string
    fromDecimals: number;
    toDecimals: number;
    pendingOut: string;
}

export async function getPlans(owner: string, pairs: Pair[]): Promise<PlanResult[]> {
    const pairsMap: Record<string, number> = {};
    for (let index = 0; index < pairs.length; index++) {
        const pair = pairs[index];
        pairsMap[pair.from + pair.to] = index
    }
    const provider = new ethers.JsonRpcProvider(import.meta.env.VITE_RPC_URL);

    const contract = new ethers.Contract(
        contractAddress,
        ABI,
        provider
    ) as unknown as ConfidentialDCABatch;

    try {
        const nextPlanId = await contract.nextPlanId();
        const ownedPlans: PlanResult[] = [];

        for (let i = 1; i < nextPlanId; i++) {
            const plan = await contract.plans(i);

            const pairIndex = pairsMap[plan.tokens.fromToken + plan.tokens.toToken];
            const fromToken = pairs[pairIndex].fromName
            const toToken = pairs[pairIndex].toName
            const from = pairs[pairIndex].from;
            const fromDecimals = pairs[pairIndex].fromDecimals;
            const toDecimals = pairs[pairIndex].toDecimals;
            const to = pairs[pairIndex].to;

            if (plan.owner.toLowerCase() === owner.toLowerCase()) {
                ownedPlans.push({
                    id: Number(plan.meta.planId),
                    fromName: fromToken,
                    toName: toToken,
                    from: from,
                    to: to,
                    fromDecimals: fromDecimals,
                    toDecimals: toDecimals,
                    startedAt: Number(plan.timing.startTime),
                    amount: plan.amounts.amountPerInterval,
                    totalAmount: plan.amounts.totalAmount,
                    remainingAmount: plan.amounts.remainingAmount,
                    executedIntervals: plan.timing.executedIntervals,
                    pendingOut: plan.amounts.pendingOut,
                    frequency: plan.timing.interval,
                    totalIntervals: plan.timing.totalIntervals,
                    status: Number(plan.status)
                });

            }
        }

        return ownedPlans;
    } catch (err) {
        console.log(err);
        throw err;
    }
}
