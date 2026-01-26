/**
 * @setto/evm-permit
 *
 * ERC-20 Permit (EIP-2612) signing utilities
 */

// Types
export type {
  EIP1193Provider,
  ERC20PermitSignature,
  ERC20AllowanceInfo,
  CheckERC20AllowanceParams,
  SignERC20PermitParams,
  SignERC20PermitResult,
  GetERC20NonceParams,
  GetTokenNameParams,
} from './types';

// Constants
export {
  ERC20_PERMIT_ABI,
  ERC20_PERMIT_TYPES,
  NONCES_SELECTOR,
  NAME_SELECTOR,
  ALLOWANCE_SELECTOR,
  USDC_PERMIT_VERSION,
} from './constants';

// Sign
export { signERC20Permit, isPermitValid } from './sign-permit';

// Allowance
export {
  getERC20Nonce,
  getTokenName,
  getERC20Allowance,
  checkERC20Allowance,
} from './allowance';
