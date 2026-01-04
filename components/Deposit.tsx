"use client";

import { useState, useMemo } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther, isAddress } from "viem";
import { COMPACT_ADDRESS, COMPACT_ABI, createLockTag, calculateTokenId, RESET_PERIOD, SCOPE } from "../lib/contracts";

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
  // Calculate token ID when deposit parameters change
  const tokenId = useMemo(() => {
    if (allocatorId && (depositType === "native" || (depositType === "erc20" && tokenAddress && isAddress(tokenAddress)))) {
      try {
        const calculatedId = calculateTokenId(
          BigInt(allocatorId),
          scope,
          resetPeriod,
          depositType === "native" ? "0x0000000000000000000000000000000000000000" : tokenAddress as `0x${string}`
        );
        return calculatedId.toString();
      } catch {
        return "";
      }
    }
    return "";
  }, [allocatorId, scope, resetPeriod, depositType, tokenAddress]);

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
      <div className="p-6 border rounded-lg bg-gray-50" style={{ backgroundColor: '#f9fafb', borderColor: '#e5e7eb' }}>
        <p style={{ color: '#4b5563' }}>Please connect your wallet to deposit</p>
      </div>
    );
  }

  return (
    <div className="p-6 border rounded-lg bg-white" style={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb' }}>
      <h2 className="text-2xl font-bold mb-4" style={{ color: '#111827' }}>Deposit Assets</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>Deposit Type</label>
          <div className="flex gap-4">
            <label className="flex items-center" style={{ color: '#111827' }}>
              <input
                type="radio"
                value="native"
                checked={depositType === "native"}
                onChange={(e) => setDepositType(e.target.value as "native" | "erc20")}
                className="mr-2"
              />
              Native ETH
            </label>
            <label className="flex items-center" style={{ color: '#111827' }}>
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
            <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>Token Address</label>
            <input
              type="text"
              value={tokenAddress}
              onChange={(e) => setTokenAddress(e.target.value)}
              placeholder="0x..."
              className="w-full p-2 border rounded"
              style={{ color: '#111827', borderColor: '#d1d5db' }}
            />
            <p className="text-xs mt-1" style={{ color: '#6b7280' }}>
              Note: You must approve this token first before depositing
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.0"
            step="0.0001"
            className="w-full p-2 border rounded"
            style={{ color: '#111827', borderColor: '#d1d5db' }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>Allocator ID</label>
          <input
            type="number"
            value={allocatorId}
            onChange={(e) => setAllocatorId(e.target.value)}
            placeholder="0"
            className="w-full p-2 border rounded"
            style={{ color: '#111827', borderColor: '#d1d5db' }}
          />
          <p className="text-xs mt-1" style={{ color: '#6b7280' }}>
            Allocator must be registered. Use 0 for testing with AlwaysOKAllocator.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>Reset Period</label>
          <select
            value={resetPeriod}
            onChange={(e) => setResetPeriod(Number(e.target.value))}
            className="w-full p-2 border rounded"
            style={{ color: '#111827', borderColor: '#d1d5db' }}
          >
            <option value={RESET_PERIOD.ONE_MINUTE}>1 Minute</option>
            <option value={RESET_PERIOD.TEN_MINUTES}>10 Minutes</option>
            <option value={RESET_PERIOD.ONE_HOUR}>1 Hour</option>
            <option value={RESET_PERIOD.ONE_DAY}>1 Day</option>
            <option value={RESET_PERIOD.ONE_WEEK}>1 Week</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>Scope</label>
          <select
            value={scope}
            onChange={(e) => setScope(Number(e.target.value))}
            className="w-full p-2 border rounded"
            style={{ color: '#111827', borderColor: '#d1d5db' }}
          >
            <option value={SCOPE.SINGLE_CHAIN}>Single Chain</option>
            <option value={SCOPE.MULTICHAIN}>Multichain</option>
          </select>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-sm" style={{ backgroundColor: '#fef2f2', borderColor: '#fecaca', color: '#991b1b' }}>
            Error: {error.message}
          </div>
        )}

        {isSuccess && (
          <div className="p-3 bg-green-50 border border-green-200 rounded text-sm" style={{ backgroundColor: '#f0fdf4', borderColor: '#bbf7d0', color: '#166534' }}>
            <div className="font-bold mb-2">✓ Deposit successful!</div>
            <div className="mb-2">Transaction: <span className="font-mono text-xs">{hash?.slice(0, 20)}...</span></div>
            {tokenId && (
              <div className="mt-2 p-2 bg-white rounded border" style={{ borderColor: '#bbf7d0' }}>
                <div className="text-xs font-semibold mb-1">Your Token ID (use this for withdrawal):</div>
                <div className="flex items-center gap-2">
                  <div className="font-mono text-xs break-all flex-1" style={{ color: '#111827' }}>{tokenId}</div>
                  
                </div>
                <div className="text-xs mt-1" style={{ color: '#6b7280' }}>
                  Paste this Token ID in the Withdraw section to withdraw your assets!
                </div>
              </div>
            )}
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

