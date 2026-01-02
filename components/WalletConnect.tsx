"use client";

import { useAccount } from "wagmi";
import { useConnectWallet, useWallets } from "@privy-io/react-auth";
import { useEffect, useState } from "react";

export function WalletConnect() {
  const { address, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);
  const { connectWallet } = useConnectWallet({
    onSuccess: (wallet) => {
      console.log("Wallet connected:", wallet);
    },
    onError: (error) => {
      console.error("Connection error:", error);
    },
  });
  const { wallets, ready } = useWallets();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="text-sm" style={{ color: '#4b5563' }}>Initializing...</div>
    );
  }

  if (!ready) {
    return (
      <div className="text-sm" style={{ color: '#4b5563' }}>Loading wallet connection...</div>
    );
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-4">
        <div className="text-sm">
          <div className="font-medium" style={{ color: '#111827' }}>Connected</div>
          <div className="font-mono text-xs" style={{ color: '#4b5563' }}>{address}</div>
          {wallets.length > 0 && (
            <div className="text-xs mt-1" style={{ color: '#6b7280' }}>
              {wallets.length} wallet{wallets.length !== 1 ? "s" : ""} connected
            </div>
          )}
        </div>
        <button
          onClick={() => connectWallet()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          style={{ backgroundColor: '#2563eb', color: '#ffffff' }}
        >
          Connect Another Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm" style={{ color: '#4b5563' }}>Connect your wallet to get started</p>
      <button
        onClick={() => connectWallet()}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        style={{ backgroundColor: '#2563eb', color: '#ffffff' }}
      >
        Connect Wallet
      </button>
    </div>
  );
}
