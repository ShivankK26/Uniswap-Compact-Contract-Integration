"use client";

import { WalletConnect } from "../components/WalletConnect";
import { Deposit } from "../components/Deposit";
import { Withdraw } from "../components/Withdraw";
import { Claim } from "../components/Claim";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 py-8" style={{ backgroundColor: '#f9fafb' }}>
      <div className="max-w-6xl mx-auto px-4">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#111827' }}>
            The Compact Protocol
          </h1>
          <p className="mb-4" style={{ color: '#4b5563', fontSize: '18px' }}>
            Deposit, withdraw, and manage assets on Uniswap Compact Contract
          </p>
          <div className="bg-white p-4 rounded-lg border" style={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb' }}>
            <WalletConnect />
          </div>
        </header>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Deposit />
          </div>
          <div className="lg:col-span-1">
            <Withdraw />
          </div>
          <div className="lg:col-span-3">
            <Claim />
          </div>
        </div>

        <footer className="mt-12 pt-8 border-t text-center text-sm" style={{ borderTopColor: '#e5e7eb', color: '#6b7280' }}>
          <p>
            Contract Address:{" "}
            <span className="font-mono" style={{ color: '#111827' }}>
              0x00000000000000171ede64904551eeDF3C6C9788
            </span>
          </p>
          <p className="mt-2">
            This is a simplified demo interface. For production use, ensure proper allocator
            setup and authorization.
          </p>
        </footer>
        </div>
    </div>
  );
}
