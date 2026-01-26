/**
 * Permit2 Allowance
 *
 * Permit2 컨트랙트에서 allowance 조회
 */

import type { Permit2Allowance, CheckPermit2AllowanceParams } from './types';
import { PERMIT2_ALLOWANCE_SELECTOR } from './constants';

/**
 * Permit2 allowance 조회
 *
 * @param params 조회 파라미터
 * @returns Permit2Allowance (amount, expiration, nonce)
 *
 * @example
 * ```ts
 * const allowance = await checkPermit2Allowance({
 *   provider,
 *   permit2Address: '0x000000000022D473030F116dDEE9F6B43aC78BA3',
 *   ownerAddress: '0x...',
 *   tokenAddress: '0x...',
 *   spenderAddress: '0x...', // SettoPayment
 * });
 *
 * if (allowance.amount < requiredAmount || allowance.expiration < now) {
 *   // Permit2 서명 필요
 * }
 * ```
 */
export async function checkPermit2Allowance(
  params: CheckPermit2AllowanceParams
): Promise<Permit2Allowance> {
  const {
    provider,
    permit2Address,
    ownerAddress,
    tokenAddress,
    spenderAddress,
  } = params;

  // allowance(address owner, address token, address spender)
  // ABI encode: selector + padded addresses
  const callData = encodeAllowanceCall(ownerAddress, tokenAddress, spenderAddress);

  const result = (await provider.request({
    method: 'eth_call',
    params: [
      {
        to: permit2Address,
        data: callData,
      },
      'latest',
    ],
  })) as string;

  // Decode result: (uint160 amount, uint48 expiration, uint48 nonce)
  return decodeAllowanceResult(result);
}

/**
 * allowance(address,address,address) 호출 데이터 인코딩
 */
function encodeAllowanceCall(
  owner: string,
  token: string,
  spender: string
): string {
  // selector (4 bytes) + owner (32 bytes) + token (32 bytes) + spender (32 bytes)
  const paddedOwner = owner.toLowerCase().replace('0x', '').padStart(64, '0');
  const paddedToken = token.toLowerCase().replace('0x', '').padStart(64, '0');
  const paddedSpender = spender.toLowerCase().replace('0x', '').padStart(64, '0');

  return `${PERMIT2_ALLOWANCE_SELECTOR}${paddedOwner}${paddedToken}${paddedSpender}`;
}

/**
 * allowance 응답 디코딩
 *
 * Returns: (uint160 amount, uint48 expiration, uint48 nonce)
 * Layout: 32 bytes each, right-aligned
 */
function decodeAllowanceResult(result: string): Permit2Allowance {
  // Remove 0x prefix
  const hex = result.replace('0x', '');

  // uint160 amount (first 32 bytes = 64 hex chars)
  // uint160 is 20 bytes, stored in rightmost 20 bytes of 32-byte slot
  const amountHex = hex.slice(0, 64);
  const amount = BigInt('0x' + amountHex);

  // uint48 expiration (next 32 bytes)
  // uint48 is 6 bytes, stored in rightmost 6 bytes of 32-byte slot
  const expirationHex = hex.slice(64, 128);
  const expiration = Number(BigInt('0x' + expirationHex));

  // uint48 nonce (last 32 bytes)
  const nonceHex = hex.slice(128, 192);
  const nonce = Number(BigInt('0x' + nonceHex));

  return { amount, expiration, nonce };
}

/**
 * Permit2 allowance가 충분한지 확인
 *
 * @param allowance 현재 allowance
 * @param requiredAmount 필요한 금액 (bigint)
 * @param bufferSeconds 만료 버퍼 (기본: 1800초 = 30분)
 * @returns true if allowance is sufficient
 */
export function isAllowanceSufficient(
  allowance: Permit2Allowance,
  requiredAmount: bigint,
  bufferSeconds = 1800
): boolean {
  const now = Math.floor(Date.now() / 1000);

  // 금액 체크
  if (allowance.amount < requiredAmount) {
    return false;
  }

  // 만료 체크 (버퍼 포함)
  if (allowance.expiration < now + bufferSeconds) {
    return false;
  }

  return true;
}
