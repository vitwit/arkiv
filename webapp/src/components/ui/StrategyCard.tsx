import React, { useState } from "react";
// import { decrypt } from "../lib/fhe";
import { useSnackbar } from "../../hooks/useSnackbar";
import { LockClosedIcon, LockOpenIcon, CalendarIcon } from "@heroicons/react/24/solid";
import { decrypt } from "../../lib/fhe";

const statusLabels: Record<number, string> = {
  0: "Pending",
  1: "Active",
  2: "Paused",
  3: "Completed",
  4: "Canceled",
};

interface StrategyCardProps {
  title: string;
  createdAt: number;
  status: number; // 0–4
  investedAmount: string;
  intervalAmount: string;
  executedIntervals: string;
  totalIntervals: string;
  outputAmount: string;
  remainingAmount: string;
  planId: number;
  frequency: string;

  from: string;
  to: string;
  fromName: string;
  toName: string;
  fromDecimals: number;
  toDecimals: number;

  onCancel: (id: number) => void;
  onDeposit: (id: number, amount: string) => void;
  onPause: (id: number) => void;
  onResume: (id: number) => void;
  onWithdraw: (id: number) => void;

}

const StrategyCard: React.FC<StrategyCardProps> = ({
  title,
  createdAt,
  status,
  investedAmount,
  intervalAmount,
  executedIntervals,
  totalIntervals,
  outputAmount,
  remainingAmount,
  frequency,
  planId,
  fromName,
  toName,
  fromDecimals,
  toDecimals,
  onCancel,
  onDeposit,
  onPause,
  onResume,
  onWithdraw
}) => {
  const { showSnackbar, clearSnackbars } = useSnackbar();
  const [encrypted, setEncrypted] = useState(true); // 🔒 default: encrypted
  const [loading, setLoading] = useState(false);
  const [decryptedValues, setDecryptedValues] = useState<Record<string, string>>({});

  const handleDecrypt = async () => {
    setLoading(true);
    showSnackbar("Decrypting values...", "info");
    try {
      const result = await decrypt([
        investedAmount,
        remainingAmount,
        intervalAmount,
        executedIntervals,
        totalIntervals,
        outputAmount,
        frequency,
      ])

      console.log(result);

      setDecryptedValues(result);
      setEncrypted(false); // 🔓 decrypted
    //   clearSnackbars();
    //   showSnackbar("Decryption successful", "success");
    } catch (err: any) {
      clearSnackbars();
      showSnackbar(err.message || "Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  const renderActions = () => {
      switch (Number(status)) {
          case 1: // Active
          return (
              <>
            <button className="px-3 py-1 rounded-md bg-yellow-600 hover:bg-yellow-700 text-white text-sm"
              onClick={() => {
                onPause(planId)
              }}
            >
              Pause
            </button>
            <button className="px-3 py-1 rounded-md bg-red-600 hover:bg-red-700 text-white text-sm"
            onClick={() => {
                onCancel(planId)
              }}
            >
              Cancel
            </button>
             <button className="px-3 py-1 rounded-md bg-gray-600 hover:bg-gray-700 text-white text-sm"
            onClick={() => {
                onWithdraw(planId)
              }}
            >
              Withdraw
            </button>
          </>
        );
        case 2: // Paused
        return (
            <>
            <button className="px-3 py-1 rounded-md bg-green-600 hover:bg-green-700 text-white text-sm"
            onClick={() => {
                onResume(planId)
              }}
            >
              Resume
            </button>
            <button className="px-3 py-1 rounded-md bg-red-600 hover:bg-red-700 text-white text-sm"
              onClick={() => {
                onCancel(planId)
              }}
            >
              Cancel
            </button>
            <button className="px-3 py-1 rounded-md bg-gray-600 hover:bg-gray-700 text-white text-sm"
            onClick={() => {
                onWithdraw(planId)
              }}
            >
              Withdraw
            </button>
          </>
        );
      case 0: // Pending → treat like inactive (deposit)
      return (
          <button className="px-3 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm"
            onClick={() => {
                onDeposit(planId, investedAmount)
              }}
          >
            Deposit
          </button>
        );
        case 3: // Completed → no actions
        return (<button className="px-3 py-1 rounded-md bg-gray-600 hover:bg-gray-700 text-white text-sm"
            onClick={() => {
                onWithdraw(planId)
              }}
            >
              Withdraw
            </button>
            );
        case 4: // Canceled → no actions
        return (
        <button className="px-3 py-1 rounded-md bg-gray-600 hover:bg-gray-700 text-white text-sm"
            onClick={() => {
                onWithdraw(planId)
              }}
            >
              Withdraw
            </button>
        );
        default:
            return null;
        }
    };
    
  const getFieldValue = (rawValue: string) => {
    if (encrypted) return "****";
    return decryptedValues[rawValue] ?? rawValue;
  };

  return (
    <div className="bg-gray-900 border border-gray-700 shadow-lg rounded-xl p-6 flex flex-col gap-4 hover:border-purple-500 transition">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <div className="flex items-center text-gray-400 text-xs mt-1">
            <CalendarIcon className="h-4 w-4 mr-1" />
            {new Date(Number(createdAt) * 1000).toLocaleString()}
          </div>
        </div>
        <span
  className={`px-3 py-1 rounded-md text-sm font-medium ${
    status == 1
      ? "bg-green-600 text-white"
      : status == 2
      ? "bg-yellow-500 text-black"
      : status == 0
      ? "bg-blue-600 text-white"
      : status == 3
      ? "bg-gray-500 text-white"
      : "bg-red-600 text-white"
  }`}
>
  {statusLabels[status] ?? "Unknown"}
</span>
      </div>

      {/* Details as Grid */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-md text-gray-300">
        <div>
          <span className="block text-gray-400 text-sm"> Total Invested</span>
          <span className="font-medium">{encrypted ? getFieldValue(investedAmount): formatTokenAmount(fromName, parseInt(getFieldValue(investedAmount)),fromDecimals)}</span>
        </div>
        <div>
          <span className="block text-gray-400 text-sm">Uninvested Amount</span>
          <span className="font-medium">{encrypted ? getFieldValue(remainingAmount):  formatTokenAmount(fromName, parseInt(getFieldValue(remainingAmount)),fromDecimals)}</span>
        </div>
        <div>
          <span className="block text-gray-400 text-sm">Interval Amount</span>
          <span className="font-medium">{encrypted ? getFieldValue(intervalAmount): formatTokenAmount(fromName, parseInt(getFieldValue(intervalAmount)),fromDecimals)}</span>
        </div>
        <div>
          <span className="block text-gray-400 text-sm">Accumulated Tokens</span>
          <span className="font-medium">{encrypted ? getFieldValue(outputAmount): formatTokenAmount(toName, parseInt(getFieldValue(outputAmount)),toDecimals)}</span>
        </div>
        <div>
          <span className="block text-gray-400 text-sm">Investment Frequency</span>
          <span className="font-medium">{encrypted ? getFieldValue(frequency): secToDuration(parseInt(getFieldValue(frequency)))}</span>
        </div>
        <div>
          <span className="block text-gray-400 text-sm">Remaining Intervals</span>
          <span className="font-medium">{encrypted ? "****": parseInt(getFieldValue(totalIntervals)) - parseInt(getFieldValue(executedIntervals))}</span>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-between items-center mt-4">
        <div className="flex gap-2">{renderActions()}</div>

        {/* Decrypt Button */}
        <button
          onClick={handleDecrypt}
          disabled={loading || !encrypted}
          className={`flex items-center gap-1 px-3 py-1 rounded-md text-sm ${
            !encrypted
              ? "bg-gray-700 text-gray-300 cursor-not-allowed"
              : "bg-purple-600 hover:bg-purple-700 text-white"
          }`}
        >
          {loading ? (
            "Decrypting..."
          ) : !encrypted ? (
            <>
              <LockOpenIcon className="h-4 w-4" /> Decrypted
            </>
          ) : (
            <>
              <LockClosedIcon className="h-4 w-4" /> Decrypt
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default StrategyCard;


function formatTokenAmount(
  fromName: string,
  amount: bigint | number,
  decimals: number = 6
): string {
  try {
    const bigAmount = typeof amount === "number"
      ? BigInt(Math.floor(amount))  // ensure integer
      : amount;

    const bigDecimals = BigInt(decimals); // keep decimals as BigInt
    const divisor = BigInt(10) ** bigDecimals;

    const integerPart = bigAmount / divisor;
    const remainder = bigAmount % divisor;

    if (remainder === BigInt(0)) {
      return `${integerPart.toString()} ${fromName}`;
    }

    const remainderStr = remainder
      .toString()
      .padStart(Number(bigDecimals), "0") // only cast here for padding length
      .replace(/0+$/, ""); // trim trailing zeros

    return `${integerPart.toString()}.${remainderStr} ${fromName}`;
  } catch (err) {
    console.error(err);
    return `0.0 ${fromName}`;
  }
}


function secToDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);

  return parts.join(" ");
}