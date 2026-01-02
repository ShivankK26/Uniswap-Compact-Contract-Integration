# The Compact Protocol - Frontend Interface

A basic frontend interface for interacting with Uniswap's The Compact Protocol. This allows users to deposit, withdraw, and create claims for assets locked in The Compact contract.

## Features

- **Deposit Assets**: Deposit native ETH or ERC20 tokens into resource locks
- **Withdraw Assets**: Withdraw assets via normal withdrawal (requires allocator) or forced withdrawal
- **Create Claims**: Allow different addresses to claim your locked assets (bonus feature)

## Setup

1. Install dependencies:
```bash
yarn install
```

2. Set up Privy credentials:
   - Create a `.env.local` file (or use existing `.env`)
   - Add: `NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id`
   - The app will also check for `PRIVY_APP_ID` if `NEXT_PUBLIC_PRIVY_APP_ID` is not set

3. Run the development server:
```bash
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Important Notes

### Allocator Setup

Before depositing, you need an allocator. For testing:

1. **Use AlwaysOKAllocator** (if available on your test network):
   - Deploy `AlwaysOKAllocator` from the Compact test contracts
   - Register it with The Compact using `__registerAllocator`
   - Use the returned `allocatorId` when depositing

2. **For Production**:
   - Deploy your own allocator implementing `IAllocator` interface
   - Register it with The Compact
   - Ensure it properly handles authorization

### Contract Address

The Compact is deployed at: `0x00000000000000171ede64904551eeDF3C6C9788`

Available on:
- Mainnet
- Base
- Unichain

### Limitations of This Demo

1. **Normal Withdrawals**: Require allocator approval. This demo uses empty `allocatorData` which won't work in production.

2. **Claims**: The claim component is simplified. In production:
   - Sponsor should sign compact off-chain using EIP-712
   - Arbiter should submit the claim
   - Proper allocator authorization is required

3. **ERC20 Deposits**: Users must approve tokens before depositing. This UI doesn't handle approvals automatically.

## Usage

### Depositing

1. Connect your wallet
2. Choose deposit type (Native ETH or ERC20)
3. Enter amount and allocator ID
4. Select reset period and scope
5. Click "Deposit"

### Withdrawing

**Normal Withdrawal:**
- Requires allocator approval
- Enter token ID, amount, and recipient
- Note: This demo uses empty allocatorData (won't work without proper allocator)

**Forced Withdrawal:**
- First, enable forced withdrawal
- Wait for the reset period to elapse
- Then execute the withdrawal

### Creating Claims

1. Enter token ID and amount
2. Specify claimant address (who will receive tokens)
3. Specify arbiter address (who verifies conditions)
4. Set nonce and expiration
5. Click "Create Claim"

Note: This is a simplified demo. In production, proper EIP-712 signing and allocator authorization are required.

## Project Structure

```
epoch-assignment/
├── app/
│   ├── layout.tsx          # Root layout with Wagmi providers
│   └── page.tsx             # Main page with all components
├── components/
│   ├── Deposit.tsx         # Deposit component
│   ├── Withdraw.tsx        # Withdraw component
│   ├── Claim.tsx           # Claim component (bonus)
│   └── WalletConnect.tsx   # Wallet connection component
├── lib/
│   ├── contracts.ts        # Contract ABIs and helper functions
│   ├── claim-helpers.ts    # Claim-related helper functions
│   └── wagmi-config.tsx    # Wagmi configuration
└── README.md
```

## Technologies

- **Next.js 16**: React framework
- **Privy**: Wallet connection and authentication
- **Wagmi v3**: Ethereum React hooks (via Privy integration)
- **Viem**: Ethereum utilities
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling

## License

MIT
