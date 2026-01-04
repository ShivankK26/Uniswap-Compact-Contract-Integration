"use client";

import { useState, useMemo } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { parseEther, formatEther, isAddress } from "viem";
import { COMPACT_ADDRESS, COMPACT_ABI, createTokenId, encodeClaimant } from "../lib/contracts";

export function Withdraw() {
  const { address, isConnected } = useAccount();
  const [withdrawType, setWithdrawType] = useState<"normal" | "forced">("normal");
  const [tokenId, setTokenId] = useState("");
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [nonce, setNonce] = useState("0");
  const [expires, setExpires] = useState("");

  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Check forced withdrawal status
  const { data: forcedWithdrawalStatus } = useReadContract({
    address: COMPACT_ADDRESS,
    abi: COMPACT_ABI,
    functionName: "getForcedWithdrawalStatus",
    args: tokenId ? [address!, BigInt(tokenId)] : undefined,
    query: { enabled: !!tokenId && !!address && withdrawType === "forced" },
  });

  // Get balance
  const { data: balance } = useReadContract({
    address: COMPACT_ADDRESS,
    abi: COMPACT_ABI,
    functionName: "balanceOf",
    args: address && tokenId ? [address, BigInt(tokenId)] : undefined,
    query: { enabled: !!address && !!tokenId },
  });

  // Check if forced withdrawal is available
  const isForcedWithdrawalAvailable = useMemo(() => {
    if (withdrawType !== "forced" || !forcedWithdrawalStatus) return true; // Allow normal withdrawals
    
    const status = forcedWithdrawalStatus[0];
    const availableAt = forcedWithdrawalStatus[1];
    
    // Status: 0 = Disabled, 1 = Pending, 2 = Enabled
    if (status === 2) return true; // Enabled
    if (status === 1) {
      // Pending - check if current time >= availableAt
      const now = BigInt(Math.floor(Date.now() / 1000));
      return now >= availableAt;
    }
    return false; // Disabled
  }, [withdrawType, forcedWithdrawalStatus]);

  const handleWithdraw = async () => {
    if (!isConnected || !address) {
      alert("Please connect your wallet");
      return;
    }

    if (!tokenId) {
      alert("Please enter a token ID");
      return;
    }

    const recipientAddress = recipient || address;
    if (!isAddress(recipientAddress)) {
      alert("Please enter a valid recipient address");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    try {
      if (withdrawType === "forced") {
        // Forced withdrawal
        await writeContract({
          address: COMPACT_ADDRESS,
          abi: COMPACT_ABI,
          functionName: "forcedWithdrawal",
          args: [BigInt(tokenId), recipientAddress as `0x${string}`, parseEther(amount)],
        });
      } else {
        // Normal withdrawal via allocatedTransfer
        const lockTag = "0x000000000000000000000000" as `0x${string}`;
        const claimant = encodeClaimant(lockTag, recipientAddress as `0x${string}`);

        await writeContract({
          address: COMPACT_ADDRESS,
          abi: COMPACT_ABI,
          functionName: "allocatedTransfer",
          args: [
            {
              allocatorData: "0x",
              nonce: BigInt(nonce),
              expires: expires ? BigInt(Math.floor(new Date(expires).getTime() / 1000)) : BigInt(0),
              id: BigInt(tokenId),
              recipients: [
                {
                  claimant,
                  amount: parseEther(amount),
                },
              ],
            },
          ],
        });
      }
    } catch (err) {
      console.error("Withdraw error:", err);
    }
  };

  const handleEnableForcedWithdrawal = async () => {
    if (!tokenId) {
      alert("Please enter a token ID");
      return;
    }

    try {
      await writeContract({
        address: COMPACT_ADDRESS,
        abi: COMPACT_ABI,
        functionName: "enableForcedWithdrawal",
        args: [BigInt(tokenId)],
      });
    } catch (err) {
      console.error("Enable forced withdrawal error:", err);
    }
  };

  if (!isConnected) {
    return (
      <div className="p-6 border rounded-lg bg-gray-50" style={{ backgroundColor: '#f9fafb', borderColor: '#e5e7eb' }}>
        <p style={{ color: '#4b5563' }}>Please connect your wallet to withdraw</p>
      </div>
    );
  }

  return (
    <div className="p-6 border rounded-lg bg-white" style={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb' }}>
      <h2 className="text-2xl font-bold mb-4" style={{ color: '#111827' }}>Withdraw Assets</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>Withdrawal Type</label>
          <div className="flex gap-4">
            <label className="flex items-center" style={{ color: '#111827' }}>
              <input
                type="radio"
                value="normal"
                checked={withdrawType === "normal"}
                onChange={(e) => setWithdrawType(e.target.value as "normal" | "forced")}
                className="mr-2"
              />
              Normal (Requires Allocator)
            </label>
            <label className="flex items-center" style={{ color: '#111827' }}>
              <input
                type="radio"
                value="forced"
                checked={withdrawType === "forced"}
                onChange={(e) => setWithdrawType(e.target.value as "normal" | "forced")}
                className="mr-2"
              />
              Forced Withdrawal
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>Token ID</label>
          <input
            type="text"
            value={tokenId}
            onChange={(e) => setTokenId(e.target.value)}
            placeholder="Token ID (uint256)"
            className="w-full p-2 border rounded"
            style={{ color: '#111827', borderColor: '#d1d5db' }}
          />
          {balance !== undefined && (
            <p className="text-xs mt-1" style={{ color: '#6b7280' }}>
              Your balance: {formatEther(balance)} tokens
            </p>
          )}
        </div>

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
          <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>Recipient Address</label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder={address || "0x..."}
            className="w-full p-2 border rounded"
            style={{ color: '#111827', borderColor: '#d1d5db' }}
          />
          <p className="text-xs mt-1" style={{ color: '#6b7280' }}>
            Leave empty to withdraw to your address
          </p>
        </div>

        {withdrawType === "normal" && (
          <>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>Nonce</label>
              <input
                type="number"
                value={nonce}
                onChange={(e) => setNonce(e.target.value)}
                placeholder="0"
                className="w-full p-2 border rounded"
                style={{ color: '#111827', borderColor: '#d1d5db' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>Expires (optional)</label>
              <input
                type="datetime-local"
                value={expires}
                onChange={(e) => setExpires(e.target.value)}
                className="w-full p-2 border rounded"
                style={{ color: '#111827', borderColor: '#d1d5db' }}
              />
            </div>
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm" style={{ backgroundColor: '#fefce8', borderColor: '#fde047', color: '#854d0e' }}>
              ⚠️ Normal withdrawal requires allocator approval. This demo uses empty allocatorData.
              In production, you need proper allocator authorization.
            </div>
          </>
        )}

        {withdrawType === "forced" && (
          <div className="space-y-2">
            {forcedWithdrawalStatus && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm" style={{ backgroundColor: '#eff6ff', borderColor: '#93c5fd', color: '#1e40af' }}>
                Status: {forcedWithdrawalStatus[0] === 0 ? "Disabled" : forcedWithdrawalStatus[0] === 1 ? "Pending" : "Enabled"}
                {forcedWithdrawalStatus[1] > BigInt(0) && (
                  <div>Available at: {new Date(Number(forcedWithdrawalStatus[1]) * 1000).toLocaleString()}</div>
                )}
              </div>
            )}
            <button
              onClick={handleEnableForcedWithdrawal}
              disabled={isPending}
              className="w-full py-2 px-4 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50"
              style={{ backgroundColor: '#ea580c', color: '#ffffff' }}
            >
              Enable Forced Withdrawal
            </button>
            <p className="text-xs" style={{ color: '#6b7280' }}>
              You must enable forced withdrawal first, then wait for the reset period before withdrawing.
            </p>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-sm" style={{ backgroundColor: '#fef2f2', borderColor: '#fecaca', color: '#991b1b' }}>
            Error: {error.message}
          </div>
        )}

        {isSuccess && (
          <div className="p-3 bg-green-50 border border-green-200 rounded text-sm" style={{ backgroundColor: '#f0fdf4', borderColor: '#bbf7d0', color: '#166534' }}>
            Withdrawal successful! Transaction: {hash}
          </div>
        )}

        <button
          onClick={handleWithdraw}
          disabled={isPending || isConfirming || (withdrawType === "forced" && !isForcedWithdrawalAvailable)}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{ backgroundColor: '#2563eb', color: '#ffffff' }}
          title={withdrawType === "forced" && !isForcedWithdrawalAvailable ? "Wait for the reset period to complete before withdrawing" : undefined}
        >
          {withdrawType === "forced" && !isForcedWithdrawalAvailable ? (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Withdraw (Available Soon)</span>
            </>
          ) : (
            <>
              {isPending || isConfirming ? "Processing..." : "Withdraw"}
            </>
          )}
        </button>
        {withdrawType === "forced" && !isForcedWithdrawalAvailable && forcedWithdrawalStatus && (
          <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs" style={{ backgroundColor: '#fefce8', borderColor: '#fde047', color: '#854d0e' }}>
            🔒 Withdrawal is locked. Wait until {forcedWithdrawalStatus[1] > BigInt(0) ? new Date(Number(forcedWithdrawalStatus[1]) * 1000).toLocaleString() : "the reset period completes"} to withdraw.
          </div>
        )}
      </div>
    </div>
  );
}
