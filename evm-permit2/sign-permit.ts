/**
 * Permit2 Sign Permit
 *
 * EIP-712 서명 생성
 */

import type { SignPermit2Params, SignPermit2Result, PermitSingle } from './types';
import { PERMIT2_DOMAIN_NAME, PERMIT_SINGLE_TYPES } from './constants';

/**
 * Permit2 서명 생성
 *
 * EIP-712 typed data 서명을 통해 PermitSingle 서명 생성
 *
 * @param params 서명 파라미터
 * @returns PermitSingle + signature
 *
 * @example
 * ```ts
 * const result = await signPermit2({
 *   provider,
 *   chainId: 43113,
 *   permit2Address: '0x000000000022D473030F116dDEE9F6B43aC78BA3',
 *   tokenAddress: '0x...',
 *   spenderAddress: '0x...', // SettoPayment
 *   allowanceAmount: '0xFFFF...', // uint160 max
 *   expirationDays: 30,
 *   sigDeadlineMinutes: 5,
 *   nonce: 0,
 * });
 * ```
 */
export async function signPermit2(
  params: SignPermit2Params
): Promise<SignPermit2Result> {
  const {
    provider,
    chainId,
    permit2Address,
    tokenAddress,
    spenderAddress,
    allowanceAmount,
    expiration,
    sigDeadline,
    nonce,
    signerAddress,
  } = params;

  if (!signerAddress) {
    throw new Error('signerAddress is required');
  }

  // PermitSingle 구조체 생성
  const permitSingle: PermitSingle = {
    details: {
      token: tokenAddress,
      amount: allowanceAmount,
      expiration,
      nonce,
    },
    spender: spenderAddress,
    sigDeadline,
  };

  // EIP-712 도메인
  const domain = {
    name: PERMIT2_DOMAIN_NAME,
    chainId,
    verifyingContract: permit2Address,
  };

  // EIP-712 메시지
  const message = {
    details: {
      token: permitSingle.details.token,
      amount: permitSingle.details.amount,
      expiration: permitSingle.details.expiration,
      nonce: permitSingle.details.nonce,
    },
    spender: permitSingle.spender,
    sigDeadline: permitSingle.sigDeadline,
  };

  // EIP-712 서명 요청
  const typedData = {
    types: {
      EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' },
      ],
      ...PERMIT_SINGLE_TYPES,
    },
    primaryType: 'PermitSingle',
    domain,
    message,
  };

  const signature = (await provider.request({
    method: 'eth_signTypedData_v4',
    params: [signerAddress, JSON.stringify(typedData)],
  })) as string;

  return {
    permitSingle,
    signature,
    signerAddress,
  };
}

