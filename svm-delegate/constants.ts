/**
 * SVM Delegate Constants
 *
 * SPL Token delegate 관련 상수
 */

// ============================================
// SPL Token Program
// ============================================

/**
 * SPL Token Program ID
 */
export const SPL_TOKEN_PROGRAM_ID = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';

/**
 * SPL Token 2022 Program ID
 */
export const SPL_TOKEN_2022_PROGRAM_ID = 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb';

// ============================================
// Known Wallet Providers
// ============================================

/**
 * 지원하는 Solana 지갑 목록
 */
export const SUPPORTED_WALLETS = [
  'phantom',
  'solflare',
  'okxwallet',
  'coinbaseSolana',
  'backpack',
] as const;

export type SupportedWallet = typeof SUPPORTED_WALLETS[number];
