"use client";

import { useState } from "react";
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
        // Note: This requires allocator approval. For simplicity, we'll use empty allocatorData
        // In production, you'd need to get proper allocator authorization
        const lockTag = "0x000000000000000000000000"; // Zero lockTag means withdraw underlying
        const claimant = encodeClaimant(lockTag, recipientAddress as `0x${string}`);

        await writeContract({
          address: COMPACT_ADDRESS,
          abi: COMPACT_ABI,
          functionName: "allocatedTransfer",
          args: [
            {
              allocatorData: "0x", // Empty - requires allocator approval in production
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
      <div className="p-6 border rounded-lg bg-gray-50">
        <p className="text-gray-600">Please connect your wallet to withdraw</p>
      </div>
    );
  }

  return (
    <div className="p-6 border rounded-lg bg-white">
      <h2 className="text-2xl font-bold mb-4">Withdraw Assets</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Withdrawal Type</label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="normal"
                checked={withdrawType === "normal"}
                onChange={(e) => setWithdrawType(e.target.value as "normal" | "forced")}
                className="mr-2"
              />
              Normal (Requires Allocator)
            </label>
            <label className="flex items-center">
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
          <label className="block text-sm font-medium mb-2">Token ID</label>
          <input
            type="text"
            value={tokenId}
            onChange={(e) => setTokenId(e.target.value)}
            placeholder="Token ID (uint256)"
            className="w-full p-2 border rounded"
          />
          {balance !== undefined && (
            <p className="text-xs text-gray-500 mt-1">
              Your balance: {formatEther(balance)} tokens
            </p>
          )}
        </div>

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
          <label className="block text-sm font-medium mb-2">Recipient Address</label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder={address || "0x..."}
            className="w-full p-2 border rounded"
          />
          <p className="text-xs text-gray-500 mt-1">
            Leave empty to withdraw to your address
          </p>
        </div>

        {withdrawType === "normal" && (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">Nonce</label>
              <input
                type="number"
                value={nonce}
                onChange={(e) => setNonce(e.target.value)}
                placeholder="0"
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Expires (optional)</label>
              <input
                type="datetime-local"
                value={expires}
                onChange={(e) => setExpires(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-700 text-sm">
              ⚠️ Normal withdrawal requires allocator approval. This demo uses empty allocatorData.
              In production, you need proper allocator authorization.
            </div>
          </>
        )}

        {withdrawType === "forced" && (
          <div className="space-y-2">
        {forcedWithdrawalStatus && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded text-blue-700 text-sm">
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
            >
              Enable Forced Withdrawal
            </button>
            <p className="text-xs text-gray-500">
              You must enable forced withdrawal first, then wait for the reset period before withdrawing.
            </p>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            Error: {error.message}
          </div>
        )}

        {isSuccess && (
          <div className="p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
            Withdrawal successful! Transaction: {hash}
          </div>
        )}

        <button
          onClick={handleWithdraw}
          disabled={isPending || isConfirming}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isPending || isConfirming ? "Processing..." : "Withdraw"}
        </button>
      </div>
    </div>
  );
}

