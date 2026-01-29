/**
 * ERC-20 Permit Constants (EIP-2612)
 *
 * EIP-2612 Permit 관련 상수 정의
 */

// ============================================
// ABI
// ============================================

/**
 * ERC-20 Permit ABI (nonces, DOMAIN_SEPARATOR, name 조회용)
 */
export const ERC20_PERMIT_ABI = [
  // nonces(address owner) -> uint256
  {
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'nonces',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  // DOMAIN_SEPARATOR() -> bytes32
  {
    inputs: [],
    name: 'DOMAIN_SEPARATOR',
    outputs: [{ name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  // name() -> string
  {
    inputs: [],
    name: 'name',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  // allowance(address owner, address spender) -> uint256
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

/**
 * ERC-20 nonces 함수 selector
 * keccak256("nonces(address)") = 0x7ecebe00
 */
export const NONCES_SELECTOR = '0x7ecebe00';

/**
 * ERC-20 name 함수 selector
 * keccak256("name()") = 0x06fdde03
 */
export const NAME_SELECTOR = '0x06fdde03';

/**
 * ERC-20 allowance 함수 selector
 * keccak256("allowance(address,address)") = 0xdd62ed3e
 */
export const ALLOWANCE_SELECTOR = '0xdd62ed3e';

// ============================================
// EIP-712 Types
// ============================================

/**
 * EIP-2612 Permit EIP-712 타입 정의
 */
export const ERC20_PERMIT_TYPES = {
  Permit: [
    { name: 'owner', type: 'address' },
    { name: 'spender', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' },
  ],
};

/**
 * EIP-5267 eip712Domain() 함수 selector
 * keccak256("eip712Domain()") = 0x84b0196e
 */
export const EIP712_DOMAIN_SELECTOR = '0x84b0196e';

/**
 * 기본 EIP-712 domain version (fallback용)
 * eip712Domain() 호출 실패 시 사용
 */
export const DEFAULT_PERMIT_VERSION = '1';
