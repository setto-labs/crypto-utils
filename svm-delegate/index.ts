/**
 * SVM Delegate Module
 *
 * Solana SPL Token delegate 관련 기능
 * - TX 서명
 * - Provider 찾기/연결
 * - base64 인코딩/디코딩
 */

// Types
export type {
  SolanaProvider,
  DelegateApproveTxResponse,
  SignedTxResult,
  DelegateAllowance,
  SignDelegateTxParams,
  FindProviderParams,
} from './types';

// Constants
export {
  SPL_TOKEN_PROGRAM_ID,
  SPL_TOKEN_2022_PROGRAM_ID,
  SUPPORTED_WALLETS,
  type SupportedWallet,
} from './constants';

// Sign TX
export {
  signDelegateTx,
  signDelegateTxWithTransaction,
  findConnectedProvider,
  connectSolanaWallet,
  base64ToUint8Array,
  uint8ArrayToBase64,
  isBlockhashValid,
} from './sign-tx';
