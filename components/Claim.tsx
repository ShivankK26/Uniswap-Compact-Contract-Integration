"use client";

import { useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther, isAddress } from "viem";
import { COMPACT_ADDRESS, COMPACT_ABI, encodeClaimant } from "../lib/contracts";

export function Claim() {
  const { address, isConnected } = useAccount();
  const [tokenId, setTokenId] = useState("");
  const [amount, setAmount] = useState("");
  const [claimantAddress, setClaimantAddress] = useState("");
  const [arbiterAddress, setArbiterAddress] = useState("");
  const [nonce, setNonce] = useState("0");
  const [expires, setExpires] = useState("");

  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const handleCreateClaim = async () => {
    if (!isConnected || !address) {
      alert("Please connect your wallet");
      return;
    }

    if (!tokenId || !amount || !claimantAddress || !arbiterAddress) {
      alert("Please fill in all required fields");
      return;
    }

    if (!isAddress(claimantAddress) || !isAddress(arbiterAddress)) {
      alert("Please enter valid addresses");
      return;
    }

    try {
      const expiresTimestamp = expires 
        ? BigInt(Math.floor(new Date(expires).getTime() / 1000))
        : BigInt(Math.floor(Date.now() / 1000) + 3600); // 1 hour from now

      // Encode claimant (zero lockTag means withdraw underlying)
      const zeroLockTag = "0x000000000000000000000000" as `0x${string}`;
      const claimant = encodeClaimant(zeroLockTag, claimantAddress as `0x${string}`);

      // Note: In a real implementation:
      // 1. Sponsor would sign the compact off-chain using EIP-712
      // 2. The signature would be passed to the arbiter
      // 3. The arbiter would submit the claim with proper allocator authorization
      // 
      // For this demo, we're using an empty signature. In production, you need:
      // - Proper EIP-712 signing (use wagmi's useSignTypedData or similar)
      // - Allocator authorization (allocatorData)
      // - The arbiter should be the one calling this function

      await writeContract({
        address: COMPACT_ADDRESS,
        abi: COMPACT_ABI,
        functionName: "claim",
        args: [
          {
            allocatorData: "0x", // Empty - requires allocator approval in production
            sponsorSignature: "0x" as `0x${string}`, // Empty for demo - needs proper EIP-712 signature
            sponsor: address,
            nonce: BigInt(nonce),
            expires: expiresTimestamp,
            witness: "0x0000000000000000000000000000000000000000000000000000000000000000",
            witnessTypestring: "",
            id: BigInt(tokenId),
            allocatedAmount: parseEther(amount),
            claimants: [
              {
                claimant,
                amount: parseEther(amount),
              },
            ],
          },
        ],
      });
    } catch (err) {
      console.error("Claim error:", err);
    }
  };

  if (!isConnected) {
    return (
      <div className="p-6 border rounded-lg bg-gray-50">
        <p className="text-gray-600">Please connect your wallet to create a claim</p>
      </div>
    );
  }

  return (
    <div className="p-6 border rounded-lg bg-white">
      <h2 className="text-2xl font-bold mb-4">Create Claim (Allow Different Address to Claim)</h2>
      <p className="text-sm text-gray-600 mb-4">
        Create a compact that allows a different address to claim your locked assets.
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Token ID</label>
          <input
            type="text"
            value={tokenId}
            onChange={(e) => setTokenId(e.target.value)}
            placeholder="Token ID of your resource lock"
            className="w-full p-2 border rounded"
          />
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
          <label className="block text-sm font-medium mb-2">Claimant Address *</label>
          <input
            type="text"
            value={claimantAddress}
            onChange={(e) => setClaimantAddress(e.target.value)}
            placeholder="0x... (address that will receive tokens)"
            className="w-full p-2 border rounded"
          />
          <p className="text-xs text-gray-500 mt-1">
            The address that will receive the claimed tokens
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Arbiter Address *</label>
          <input
            type="text"
            value={arbiterAddress}
            onChange={(e) => setArbiterAddress(e.target.value)}
            placeholder="0x... (arbiter that verifies conditions)"
            className="w-full p-2 border rounded"
          />
          <p className="text-xs text-gray-500 mt-1">
            The arbiter that will verify conditions and process the claim
          </p>
        </div>

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
          <label className="block text-sm font-medium mb-2">Expires</label>
          <input
            type="datetime-local"
            value={expires}
            onChange={(e) => setExpires(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-700 text-sm">
          ⚠️ This is a simplified demo. In production:
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>The arbiter should submit the claim, not the sponsor</li>
            <li>Allocator approval is required</li>
            <li>Proper EIP-712 signing is needed</li>
            <li>Conditions/witness data should be included</li>
          </ul>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            Error: {error.message}
          </div>
        )}

        {isSuccess && (
          <div className="p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
            Claim created successfully! Transaction: {hash}
          </div>
        )}

        <button
          onClick={handleCreateClaim}
          disabled={isPending || isConfirming}
          className="w-full py-2 px-4 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
        >
          {isPending || isConfirming ? "Processing..." : "Create Claim"}
        </button>
      </div>
    </div>
  );
}

