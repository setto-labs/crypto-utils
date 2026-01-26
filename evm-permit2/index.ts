/**
 * Permit2 Module
 *
 * Uniswap Permit2 관련 기능
 * - allowance 확인
 * - EIP-712 서명 생성
 */

// Types
export type {
  Permit2Allowance,
  PermitDetails,
  PermitSingle,
  CheckPermit2AllowanceParams,
  SignPermit2Params,
  SignPermit2Result,
} from './types';

// Constants
export {
  PERMIT2_ALLOWANCE_ABI,
  PERMIT2_DOMAIN_NAME,
  PERMIT_SINGLE_TYPES,
  PERMIT2_ALLOWANCE_SELECTOR,
  PERMIT2_ADDRESS,
} from './constants';

// Allowance
export {
  checkPermit2Allowance,
  isAllowanceSufficient,
} from './allowance';

// Sign Permit
export {
  signPermit2,
  isSignatureValid,
} from './sign-permit';
