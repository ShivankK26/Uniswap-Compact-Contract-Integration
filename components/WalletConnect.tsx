"use client";

import { useAccount } from "wagmi";
import { useConnectWallet, useWallets } from "@privy-io/react-auth";

export function WalletConnect() {
  const { address, isConnected } = useAccount();
  const { connectWallet } = useConnectWallet({
    onSuccess: (wallet) => {
      console.log("Wallet connected:", wallet);
    },
    onError: (error) => {
      console.error("Connection error:", error);
    },
  });
  const { wallets, ready } = useWallets();

  if (!ready) {
    return (
      <div className="text-sm text-gray-600">Loading wallet connection...</div>
    );
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-4">
        <div className="text-sm">
          <div className="font-medium">Connected</div>
          <div className="text-gray-600 font-mono text-xs">{address}</div>
          {wallets.length > 0 && (
            <div className="text-xs text-gray-500 mt-1">
              {wallets.length} wallet{wallets.length !== 1 ? "s" : ""} connected
            </div>
          )}
        </div>
        <button
          onClick={() => connectWallet()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Connect Another Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-600">Connect your wallet to get started</p>
      <button
        onClick={() => connectWallet()}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Connect Wallet
      </button>
    </div>
  );
}
