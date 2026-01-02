"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PrivyProvider } from "@privy-io/react-auth";
import { WagmiProvider, createConfig } from "@privy-io/wagmi";
import { http } from "wagmi";
import { mainnet, base, sepolia } from "wagmi/chains";
import { useState, useEffect } from "react";

const queryClient = new QueryClient();

// Create wagmi config using Privy's createConfig
const wagmiConfig = createConfig({
  chains: [mainnet, base, sepolia],
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
    [sepolia.id]: http(),
  },
});

// Declare module for wagmi type registration
declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Get Privy App ID from environment variable
  const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID || process.env.PRIVY_APP_ID || "";
  
  if (!mounted) {
    return (
      <div style={{ padding: "20px", textAlign: "center", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div>Loading...</div>
      </div>
    );
  }
  
  if (!privyAppId) {
    console.error("Privy App ID is missing! Please set NEXT_PUBLIC_PRIVY_APP_ID in .env.local");
    return (
      <div style={{ padding: "20px", textAlign: "center", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "16px" }}>Configuration Error</h1>
          <p>Privy App ID is missing. Please set NEXT_PUBLIC_PRIVY_APP_ID in .env.local</p>
          <p style={{ marginTop: "8px", fontSize: "12px", color: "#666" }}>Current value: {privyAppId || "(empty)"}</p>
        </div>
      </div>
    );
  }
  
  return (
    <PrivyProvider
      appId={privyAppId}
      config={{
        appearance: {
          theme: "light",
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>{children}</WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
