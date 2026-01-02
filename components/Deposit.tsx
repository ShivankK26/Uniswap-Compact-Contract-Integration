"use client";

import { useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther, formatEther, isAddress } from "viem";
import { COMPACT_ADDRESS, COMPACT_ABI, createLockTag, RESET_PERIOD, SCOPE } from "../lib/contracts";

export function Deposit() {
  const { address, isConnected } = useAccount();
  const [depositType, setDepositType] = useState<"native" | "erc20">("native");
  const [amount, setAmount] = useState("");
  const [tokenAddress, setTokenAddress] = useState("");
  const [allocatorId, setAllocatorId] = useState("0");
  const [resetPeriod, setResetPeriod] = useState<number>(RESET_PERIOD.TEN_MINUTES);
  const [scope, setScope] = useState<number>(SCOPE.SINGLE_CHAIN);

  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const handleDeposit = async () => {
    if (!isConnected || !address) {
      alert("Please connect your wallet");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    if (depositType === "erc20" && (!tokenAddress || !isAddress(tokenAddress))) {
      alert("Please enter a valid ERC20 token address");
      return;
    }

    try {
      const lockTag = createLockTag(BigInt(allocatorId), scope, resetPeriod);

      if (depositType === "native") {
        await writeContract({
          address: COMPACT_ADDRESS,
          abi: COMPACT_ABI,
          functionName: "depositNative",
          args: [lockTag, address],
          value: parseEther(amount),
        });
      } else {
        // For ERC20, user needs to approve first
        // This is a simplified version - in production, you'd handle approval separately
        await writeContract({
          address: COMPACT_ADDRESS,
          abi: COMPACT_ABI,
          functionName: "depositERC20",
          args: [tokenAddress as `0x${string}`, lockTag, parseEther(amount), address],
        });
      }
    } catch (err) {
      console.error("Deposit error:", err);
    }
  };

  if (!isConnected) {
    return (
      <div className="p-6 border rounded-lg bg-gray-50">
        <p className="text-gray-600">Please connect your wallet to deposit</p>
      </div>
    );
  }

  return (
    <div className="p-6 border rounded-lg bg-white">
      <h2 className="text-2xl font-bold mb-4">Deposit Assets</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Deposit Type</label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="native"
                checked={depositType === "native"}
                onChange={(e) => setDepositType(e.target.value as "native" | "erc20")}
                className="mr-2"
              />
              Native ETH
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="erc20"
                checked={depositType === "erc20"}
                onChange={(e) => setDepositType(e.target.value as "native" | "erc20")}
                className="mr-2"
              />
              ERC20 Token
            </label>
          </div>
        </div>

        {depositType === "erc20" && (
          <div>
            <label className="block text-sm font-medium mb-2">Token Address</label>
            <input
              type="text"
              value={tokenAddress}
              onChange={(e) => setTokenAddress(e.target.value)}
              placeholder="0x..."
              className="w-full p-2 border rounded"
            />
            <p className="text-xs text-gray-500 mt-1">
              Note: You must approve this token first before depositing
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-2">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.0"
            step="0.0001"
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Allocator ID</label>
          <input
            type="number"
            value={allocatorId}
            onChange={(e) => setAllocatorId(e.target.value)}
            placeholder="0"
            className="w-full p-2 border rounded"
          />
          <p className="text-xs text-gray-500 mt-1">
            Allocator must be registered. Use 0 for testing with AlwaysOKAllocator.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Reset Period</label>
          <select
            value={resetPeriod}
            onChange={(e) => setResetPeriod(Number(e.target.value))}
            className="w-full p-2 border rounded"
          >
            <option value={RESET_PERIOD.ONE_MINUTE}>1 Minute</option>
            <option value={RESET_PERIOD.TEN_MINUTES}>10 Minutes</option>
            <option value={RESET_PERIOD.ONE_HOUR}>1 Hour</option>
            <option value={RESET_PERIOD.ONE_DAY}>1 Day</option>
            <option value={RESET_PERIOD.ONE_WEEK}>1 Week</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Scope</label>
          <select
            value={scope}
            onChange={(e) => setScope(Number(e.target.value))}
            className="w-full p-2 border rounded"
          >
            <option value={SCOPE.SINGLE_CHAIN}>Single Chain</option>
            <option value={SCOPE.MULTICHAIN}>Multichain</option>
          </select>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            Error: {error.message}
          </div>
        )}

        {isSuccess && (
          <div className="p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
            Deposit successful! Transaction: {hash}
          </div>
        )}

        <button
          onClick={handleDeposit}
          disabled={isPending || isConfirming}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isPending || isConfirming ? "Processing..." : "Deposit"}
        </button>
      </div>
    </div>
  );
}

