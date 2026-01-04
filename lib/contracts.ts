// Contract addresses and ABIs for The Compact
export const COMPACT_ADDRESS = "0x00000000000000171ede64904551eeDF3C6C9788" as const;

// Simplified ABI for The Compact - focusing on deposit/withdraw functions
export const COMPACT_ABI = [
  {
    inputs: [
      { name: "lockTag", type: "bytes12" },
      { name: "recipient", type: "address" },
    ],
    name: "depositNative",
    outputs: [{ name: "id", type: "uint256" }],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { name: "token", type: "address" },
      { name: "lockTag", type: "bytes12" },
      { name: "amount", type: "uint256" },
      { name: "recipient", type: "address" },
    ],
    name: "depositERC20",
    outputs: [{ name: "id", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "transfer", type: "tuple", components: [
        { name: "allocatorData", type: "bytes" },
        { name: "nonce", type: "uint256" },
        { name: "expires", type: "uint256" },
        { name: "id", type: "uint256" },
        { name: "recipients", type: "tuple[]", components: [
          { name: "claimant", type: "uint256" },
          { name: "amount", type: "uint256" },
        ]},
      ]},
    ],
    name: "allocatedTransfer",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "id", type: "uint256" }],
    name: "enableForcedWithdrawal",
    outputs: [{ name: "withdrawableAt", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "id", type: "uint256" },
      { name: "recipient", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "forcedWithdrawal",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "account", type: "address" },
      { name: "id", type: "uint256" },
    ],
    name: "getForcedWithdrawalStatus",
    outputs: [
      { name: "status", type: "uint8" },
      { name: "forcedWithdrawalAvailableAt", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "owner", type: "address" },
      { name: "id", type: "uint256" },
    ],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "id", type: "uint256" }],
    name: "getLockDetails",
    outputs: [
      { name: "token", type: "address" },
      { name: "allocator", type: "address" },
      { name: "resetPeriod", type: "uint8" },
      { name: "scope", type: "uint8" },
      { name: "lockTag", type: "bytes12" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "claimPayload", type: "tuple", components: [
        { name: "allocatorData", type: "bytes" },
        { name: "sponsorSignature", type: "bytes" },
        { name: "sponsor", type: "address" },
        { name: "nonce", type: "uint256" },
        { name: "expires", type: "uint256" },
        { name: "witness", type: "bytes32" },
        { name: "witnessTypestring", type: "string" },
        { name: "id", type: "uint256" },
        { name: "allocatedAmount", type: "uint256" },
        { name: "claimants", type: "tuple[]", components: [
          { name: "claimant", type: "uint256" },
          { name: "amount", type: "uint256" },
        ]},
      ]},
    ],
    name: "claim",
    outputs: [{ name: "claimHash", type: "bytes32" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "allocator", type: "address" },
      { name: "proof", type: "bytes" },
    ],
    name: "__registerAllocator",
    outputs: [{ name: "allocatorId", type: "uint96" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "claimHash", type: "bytes32" },
      { name: "typehash", type: "bytes32" },
    ],
    name: "register",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "sponsor", type: "address" },
      { name: "claimHash", type: "bytes32" },
      { name: "typehash", type: "bytes32" },
    ],
    name: "isRegistered",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "DOMAIN_SEPARATOR",
    outputs: [{ name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

// IAllocator ABI for checking claim authorization
export const ALLOCATOR_ABI = [
  {
    inputs: [
      { name: "claimHash", type: "bytes32" },
      { name: "arbiter", type: "address" },
      { name: "sponsor", type: "address" },
      { name: "nonce", type: "uint256" },
      { name: "expires", type: "uint256" },
      { name: "idsAndAmounts", type: "uint256[2][]" },
      { name: "allocatorData", type: "bytes" },
    ],
    name: "isClaimAuthorized",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

// Helper function to create lockTag
// lockTag encodes: scope (bit 95), resetPeriod (bits 92-94), allocatorId (bits 0-91)
// Based on: scope << 95 | resetPeriod << 92 | allocatorId
export function createLockTag(
  allocatorId: bigint,
  scope: number, // 0 = SingleChain, 1 = Multichain
  resetPeriod: number // 0-7 (ResetPeriod enum)
): `0x${string}` {
  // Pack: scope at bit 95, resetPeriod at bits 92-94, allocatorId at bits 0-91
  const ninetyFive = BigInt(95);
  const ninetyTwo = BigInt(92);
  const packed = (BigInt(scope) << ninetyFive) | (BigInt(resetPeriod) << ninetyTwo) | allocatorId;
  return `0x${packed.toString(16).padStart(24, "0")}` as `0x${string}`;
}

// Helper to extract lockTag components
export function parseLockTag(lockTag: `0x${string}`) {
  const value = BigInt(lockTag);
  const ninetyFive = BigInt(95);
  const ninetyTwo = BigInt(92);
  const seven = BigInt(7);
  const one = BigInt(1);
  const scope = Number((value >> ninetyFive) & one);
  const resetPeriod = Number((value >> ninetyTwo) & seven);
  const allocatorId = value & ((one << ninetyTwo) - one); // Mask for bits 0-91
  return { allocatorId, scope, resetPeriod };
}

// Helper to create tokenId from lockTag and token address
// tokenId = (lockTag << 160) | tokenAddress
export function createTokenId(lockTag: `0x${string}`, tokenAddress: `0x${string}`): bigint {
  const lockTagValue = BigInt(lockTag);
  const tokenValue = BigInt(tokenAddress);
  const oneSixty = BigInt(160);
  return (lockTagValue << oneSixty) | tokenValue;
}

// Helper to calculate token ID from deposit parameters
// For native ETH, use address(0)
export function calculateTokenId(
  allocatorId: bigint,
  scope: number,
  resetPeriod: number,
  tokenAddress: `0x${string}` = "0x0000000000000000000000000000000000000000"
): bigint {
  const lockTag = createLockTag(allocatorId, scope, resetPeriod);
  return createTokenId(lockTag, tokenAddress);
}

// Helper to extract lockTag from tokenId
// tokenId = (lockTag << 160) | tokenAddress
// So lockTag = tokenId >> 160 (upper 96 bits)
export function extractLockTagFromTokenId(tokenId: bigint): `0x${string}` {
  const oneSixty = BigInt(160);
  const lockTagValue = tokenId >> oneSixty;
  return `0x${lockTagValue.toString(16).padStart(24, "0")}` as `0x${string}`;
}

// Helper to extract token address from tokenId
// tokenId = (lockTag << 160) | tokenAddress
// So tokenAddress = tokenId & 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF (lower 160 bits)
export function extractTokenFromTokenId(tokenId: bigint): `0x${string}` {
  const mask = (BigInt(1) << BigInt(160)) - BigInt(1);
  const tokenValue = tokenId & mask;
  return `0x${tokenValue.toString(16).padStart(40, "0")}` as `0x${string}`;
}

// Helper to encode claimant (lockTag + recipient)
export function encodeClaimant(lockTag: `0x${string}`, recipient: `0x${string}`): bigint {
  const lockTagValue = BigInt(lockTag);
  const recipientValue = BigInt(recipient);
  const oneSixty = BigInt(160);
  return (lockTagValue << oneSixty) | recipientValue;
}

// Reset period constants (from ResetPeriod enum)
export const RESET_PERIOD = {
  ONE_MINUTE: 0,
  TEN_MINUTES: 3,
  ONE_HOUR: 4,
  ONE_DAY: 5,
  ONE_WEEK: 6,
} as const;

// Scope constants
export const SCOPE = {
  SINGLE_CHAIN: 0,
  MULTICHAIN: 1,
} as const;

// COMPACT_TYPEHASH from The Compact contract
// keccak256(bytes("Compact(address arbiter,address sponsor,uint256 nonce,uint256 expires,bytes12 lockTag,address token,uint256 amount)"))
export const COMPACT_TYPEHASH = "0x73b631296de001508966ddfc334593ad8f850ccd3be4d2c58a9ed469844eebc7" as const;

