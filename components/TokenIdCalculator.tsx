"use client";

import { useState } from "react";
import { calculateTokenId, createLockTag } from "../lib/contracts";
import { isAddress } from "viem";

export function TokenIdCalculator() {
  const [allocatorId, setAllocatorId] = useState("180023937104134439673439690");
  const [resetPeriod, setResetPeriod] = useState("3");
  const [scope, setScope] = useState("0");
  const [tokenAddress, setTokenAddress] = useState("0x0000000000000000000000000000000000000000");
  const [calculatedTokenId, setCalculatedTokenId] = useState<string>("");

  const handleCalculate = () => {
    try {
      const allocatorIdBigInt = BigInt(allocatorId);
      const resetPeriodNum = Number(resetPeriod);
      const scopeNum = Number(scope);
      const tokenAddr = tokenAddress as `0x${string}`;

      if (tokenAddress !== "0x0000000000000000000000000000000000000000" && !isAddress(tokenAddr)) {
        alert("Please enter a valid token address");
        return;
      }

      const tokenId = calculateTokenId(allocatorIdBigInt, scopeNum, resetPeriodNum, tokenAddr);
      setCalculatedTokenId(tokenId.toString());
    } catch (err) {
      alert("Error calculating Token ID. Please check your inputs.");
      console.error(err);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-blue-50 mb-4" style={{ backgroundColor: '#eff6ff', borderColor: '#93c5fd' }}>
      <h3 className="font-bold mb-3" style={{ color: '#1e40af' }}>Calculate Token ID</h3>
      <p className="text-sm mb-3" style={{ color: '#1e40af' }}>
        Enter your deposit parameters to calculate your Token ID:
      </p>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>Allocator ID</label>
          <input
            type="text"
            value={allocatorId}
            onChange={(e) => setAllocatorId(e.target.value)}
            className="w-full p-2 border rounded text-sm"
            style={{ color: '#111827', borderColor: '#d1d5db' }}
            placeholder="180023937104134439673439690"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>Reset Period</label>
          <input
            type="number"
            value={resetPeriod}
            onChange={(e) => setResetPeriod(e.target.value)}
            className="w-full p-2 border rounded text-sm"
            style={{ color: '#111827', borderColor: '#d1d5db' }}
            placeholder="3"
          />
          <p className="text-xs mt-1" style={{ color: '#6b7280' }}>3 = 10 Minutes</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>Scope</label>
          <input
            type="number"
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            className="w-full p-2 border rounded text-sm"
            style={{ color: '#111827', borderColor: '#d1d5db' }}
            placeholder="0"
          />
          <p className="text-xs mt-1" style={{ color: '#6b7280' }}>0 = Single Chain, 1 = Multichain</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>Token Address</label>
          <input
            type="text"
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)}
            className="w-full p-2 border rounded text-sm"
            style={{ color: '#111827', borderColor: '#d1d5db' }}
            placeholder="0x0000... for native ETH"
          />
          <p className="text-xs mt-1" style={{ color: '#6b7280' }}>
            Use 0x0000000000000000000000000000000000000000 for native ETH
          </p>
        </div>

        <button
          onClick={handleCalculate}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
          style={{ backgroundColor: '#2563eb' }}
        >
          Calculate Token ID
        </button>

        {calculatedTokenId && (
          <div className="mt-3 p-3 bg-white rounded border" style={{ borderColor: '#93c5fd' }}>
            <div className="text-sm font-semibold mb-2" style={{ color: '#111827' }}>Your Token ID:</div>
            <div className="flex items-center gap-2">
              <div className="font-mono text-xs break-all flex-1 p-2 bg-gray-50 rounded" style={{ color: '#111827' }}>
                {calculatedTokenId}
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(calculatedTokenId);
                  alert("Token ID copied!");
                }}
                className="px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                style={{ backgroundColor: '#16a34a' }}
              >
                Copy
              </button>
            </div>
            <p className="text-xs mt-2" style={{ color: '#6b7280' }}>
              Use this Token ID in the Withdraw section to withdraw your assets!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

