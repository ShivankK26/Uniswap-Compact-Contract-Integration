"use client";

import { WalletConnect } from "../components/WalletConnect";
import { Deposit } from "../components/Deposit";
import { Withdraw } from "../components/Withdraw";


export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 py-8" style={{ backgroundColor: '#f9fafb' }}>
      <div className="max-w-6xl mx-auto px-4">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#111827' }}>
            Uniswap Compact Contract
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
        </div>
        </div>
    </div>
  );
}
