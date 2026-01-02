import { keccak256, toHex, encodePacked } from "viem";

// Helper to get Compact typehash
export function getCompactTypeHash(): `0x${string}` {
  const typeString = "Compact(address arbiter,address sponsor,uint256 nonce,uint256 expires,bytes12 lockTag,address token,uint256 amount)";
  return keccak256(toHex(typeString));
}

// Helper to get claim hash from compact
export function getClaimHash(
  compact: {
    arbiter: `0x${string}`;
    sponsor: `0x${string}`;
    nonce: bigint;
    expires: bigint;
    lockTag: `0x${string}`;
    token: `0x${string}`;
    amount: bigint;
  },
  typehash: `0x${string}`
): `0x${string}` {
  // EIP-712 structured data hash
  const encoded = encodePacked(
    ["bytes32", "address", "address", "uint256", "uint256", "bytes12", "address", "uint256"],
    [
      typehash,
      compact.arbiter,
      compact.sponsor,
      compact.nonce,
      compact.expires,
      compact.lockTag,
      compact.token,
      compact.amount,
    ]
  );
  return keccak256(encoded);
}

