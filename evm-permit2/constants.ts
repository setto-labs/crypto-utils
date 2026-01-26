/**
 * Permit2 Constants
 *
 * ABI 및 EIP-712 TypeHash 정의
 */

// ============================================
// Permit2 ABI (필요한 함수만)
// ============================================

/**
 * Permit2.allowance(owner, token, spender) 조회 ABI
 * returns (uint160 amount, uint48 expiration, uint48 nonce)
 */
export const PERMIT2_ALLOWANCE_ABI = [
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'token', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [
      { name: 'amount', type: 'uint160' },
      { name: 'expiration', type: 'uint48' },
      { name: 'nonce', type: 'uint48' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

// ============================================
// EIP-712 Type Definitions
// ============================================

/**
 * Permit2 EIP-712 Domain
 */
export const PERMIT2_DOMAIN_NAME = 'Permit2';

/**
 * PermitSingle EIP-712 Types
 */
export const PERMIT_SINGLE_TYPES = {
  PermitSingle: [
    { name: 'details', type: 'PermitDetails' },
    { name: 'spender', type: 'address' },
    { name: 'sigDeadline', type: 'uint256' },
  ],
  PermitDetails: [
    { name: 'token', type: 'address' },
    { name: 'amount', type: 'uint160' },
    { name: 'expiration', type: 'uint48' },
    { name: 'nonce', type: 'uint48' },
  ],
} as const;

// ============================================
// Function Selectors
// ============================================

/**
 * allowance(address,address,address) selector
 * keccak256("allowance(address,address,address)")[0:4]
 */
export const PERMIT2_ALLOWANCE_SELECTOR = '0x927da105';

// ============================================
// Permit2 Contract Address (canonical)
// ============================================

/**
 * Uniswap Permit2 컨트랙트 주소 (모든 체인 동일)
 */
export const PERMIT2_ADDRESS = '0x000000000022D473030F116dDEE9F6B43aC78BA3';
