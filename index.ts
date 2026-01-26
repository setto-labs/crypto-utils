/**
 * @setto/crypto-utils
 *
 * Cryptographic signing utilities for blockchain transactions
 *
 * Modules:
 * - evm-permit: ERC-20 Permit (EIP-2612) signing
 * - evm-permit2: Uniswap Permit2 signing
 * - svm-delegate: Solana SPL Token delegate signing
 */

// ============================================
// EVM Permit (EIP-2612)
// ============================================
export {
  // Types
  type EIP1193Provider,
  type ERC20PermitSignature,
  type ERC20AllowanceInfo,
  type CheckERC20AllowanceParams,
  type SignERC20PermitParams,
  type SignERC20PermitResult,
  type GetERC20NonceParams,
  type GetTokenNameParams,
  // Constants
  ERC20_PERMIT_ABI,
  ERC20_PERMIT_TYPES,
  NONCES_SELECTOR,
  NAME_SELECTOR,
  ALLOWANCE_SELECTOR,
  USDC_PERMIT_VERSION,
  // Functions
  signERC20Permit,
  isPermitValid,
  getERC20Nonce,
  getTokenName,
  getERC20Allowance,
  checkERC20Allowance,
} from './evm-permit';

// ============================================
// Permit2 (Uniswap)
// ============================================
export {
  // Types
  type Permit2Allowance,
  type PermitDetails,
  type PermitSingle,
  type CheckPermit2AllowanceParams,
  type SignPermit2Params,
  type SignPermit2Result,
  // Constants
  PERMIT2_ALLOWANCE_ABI,
  PERMIT2_DOMAIN_NAME,
  PERMIT_SINGLE_TYPES,
  PERMIT2_ALLOWANCE_SELECTOR,
  PERMIT2_ADDRESS,
  // Functions
  signPermit2,
  isSignatureValid,
  checkPermit2Allowance,
  isAllowanceSufficient,
} from './evm-permit2';

// ============================================
// SVM Delegate (Solana SPL Token)
// ============================================
export {
  // Types
  type SolanaProvider,
  type DelegateApproveTxResponse,
  type SignedTxResult,
  type DelegateAllowance,
  type SignDelegateTxParams,
  type FindProviderParams,
  // Constants
  SPL_TOKEN_PROGRAM_ID,
  SPL_TOKEN_2022_PROGRAM_ID,
  SUPPORTED_WALLETS,
  type SupportedWallet,
  // Functions
  signDelegateTx,
  signDelegateTxWithTransaction,
  findConnectedProvider,
  connectSolanaWallet,
  base64ToUint8Array,
  uint8ArrayToBase64,
  isBlockhashValid,
} from './svm-delegate';
