/**
 * Permit2 Types
 *
 * Uniswap Permit2 관련 타입 정의
 * https://docs.uniswap.org/contracts/permit2/overview
 */

import type { EIP1193Provider } from '../evm-permit/types';

// ============================================
// Permit2 Allowance (on-chain 상태)
// ============================================

/**
 * Permit2 allowance 정보 (컨트랙트에서 조회)
 */
export interface Permit2Allowance {
  /** 허용된 금액 (uint160) */
  amount: bigint;
  /** 만료 시간 (Unix timestamp, uint48) */
  expiration: number;
  /** 현재 nonce (uint48) */
  nonce: number;
}

// ============================================
// PermitSingle (EIP-712 서명용)
// ============================================

/**
 * PermitDetails 구조체
 */
export interface PermitDetails {
  /** 토큰 주소 */
  token: string;
  /** 허용 금액 (uint160) */
  amount: string;
  /** 만료 시간 (Unix timestamp, uint48) */
  expiration: number;
  /** nonce (uint48) */
  nonce: number;
}

/**
 * PermitSingle 구조체 (EIP-712 서명 대상)
 */
export interface PermitSingle {
  /** 상세 정보 */
  details: PermitDetails;
  /** 허용할 spender (SettoPayment 컨트랙트) */
  spender: string;
  /** 서명 유효 기간 (Unix timestamp) */
  sigDeadline: number;
}

// ============================================
// Function Parameters
// ============================================

/**
 * Permit2 allowance 확인 파라미터
 */
export interface CheckPermit2AllowanceParams {
  /** EIP-1193 provider */
  provider: EIP1193Provider;
  /** Permit2 컨트랙트 주소 */
  permit2Address: string;
  /** 사용자 주소 */
  ownerAddress: string;
  /** 토큰 주소 */
  tokenAddress: string;
  /** Spender 주소 (SettoPayment) */
  spenderAddress: string;
}

/**
 * Permit2 서명 파라미터
 */
export interface SignPermit2Params {
  /** EIP-1193 provider */
  provider: EIP1193Provider;
  /** 체인 ID */
  chainId: number;
  /** Permit2 컨트랙트 주소 */
  permit2Address: string;
  /** 토큰 주소 */
  tokenAddress: string;
  /** Spender 주소 (SettoPayment) */
  spenderAddress: string;
  /** 허용 금액 (hex string, uint160) */
  allowanceAmount: string;
  /** 만료일 (일 수, 기본: 30) */
  expirationDays?: number;
  /** 서명 유효 기간 (분, 기본: 5) */
  sigDeadlineMinutes?: number;
  /** 현재 nonce (on-chain에서 조회) */
  nonce: number;
  /** 서명자 주소 (필수) */
  signerAddress: string;
}

/**
 * Permit2 서명 결과
 */
export interface SignPermit2Result {
  /** PermitSingle 데이터 */
  permitSingle: PermitSingle;
  /** 서명 (hex string) */
  signature: string;
  /** 서명자 주소 */
  signerAddress: string;
}
