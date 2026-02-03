/**
 * ERC-20 Permit Sign (EIP-2612)
 *
 * EIP-712 서명 생성
 */

import type {
  SignERC20PermitParams,
  SignERC20PermitResult,
  ERC20PermitSignature,
} from './types';
import { ERC20_PERMIT_TYPES } from './constants';
import { getEip712Domain } from './allowance';

/**
 * EIP-2612 Permit 서명 생성
 *
 * EIP-712 typed data 서명을 통해 ERC-20 permit 서명 생성
 *
 * @param params 서명 파라미터
 * @returns Permit signature + signer address
 *
 * @example
 * ```ts
 * const result = await signERC20Permit({
 *   provider,
 *   chainId: 43113,
 *   tokenAddress: '0x...',
 *   tokenName: 'USD Coin',
 *   spenderAddress: '0x...', // SettoPayment
 *   value: '1000000', // 1 USDC (6 decimals)
 *   nonce: 0,
 *   deadlineMinutes: 60,
 * });
 * ```
 */
export async function signERC20Permit(
  params: SignERC20PermitParams
): Promise<SignERC20PermitResult> {
  const {
    provider,
    chainId,
    tokenAddress,
    tokenName,
    spenderAddress,
    value,
    nonce,
    deadlineMinutes = 60,
    signerAddress: expectedSignerAddress,
  } = params;

  // 현재 시간 기준 계산
  const now = Math.floor(Date.now() / 1000);
  const deadline = now + deadlineMinutes * 60;

  // 연결된 계정 가져오기 (먼저 접근 권한 요청)
  let accounts = (await provider.request({
    method: 'eth_accounts',
  })) as string[];

  // 계정이 없으면 접근 권한 요청
  if (accounts.length === 0) {
    accounts = (await provider.request({
      method: 'eth_requestAccounts',
    })) as string[];
  }

  if (accounts.length === 0) {
    throw new Error('No connected accounts');
  }

  // 서명할 주소 결정 (expectedSignerAddress가 있으면 사용, 없으면 accounts[0])
  const signerAddress = expectedSignerAddress || accounts[0];

  // EIP-712 도메인 (토큰마다 version이 다름 - 동적 조회)
  const domainInfo = await getEip712Domain(provider, tokenAddress);
  const domain = {
    name: domainInfo.name,
    version: domainInfo.version,
    chainId,
    verifyingContract: tokenAddress,
  };

  // EIP-712 메시지
  const message = {
    owner: signerAddress,
    spender: spenderAddress,
    value,
    nonce,
    deadline,
  };

  // EIP-712 서명 요청
  const typedData = {
    types: {
      EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' },
      ],
      ...ERC20_PERMIT_TYPES,
    },
    primaryType: 'Permit',
    domain,
    message,
  };

  const signature = (await provider.request({
    method: 'eth_signTypedData_v4',
    params: [signerAddress, JSON.stringify(typedData)],
  })) as string;

  // 서명 파싱 (v, r, s)
  const { v, r, s } = parseSignature(signature);

  const permitSignature: ERC20PermitSignature = {
    value,
    deadline,
    v,
    r,
    s,
  };

  return {
    permitSignature,
    signerAddress,
  };
}

/**
 * 서명 파싱 (v, r, s 추출)
 *
 * @param signature hex signature string (0x + 65 bytes)
 * @returns { v, r, s }
 */
function parseSignature(signature: string): { v: number; r: string; s: string } {
  // Remove 0x prefix
  const sig = signature.slice(2);

  // r: 32 bytes (64 hex chars)
  const r = '0x' + sig.slice(0, 64);

  // s: 32 bytes (64 hex chars)
  const s = '0x' + sig.slice(64, 128);

  // v: 1 byte (2 hex chars)
  let v = parseInt(sig.slice(128, 130), 16);

  // EIP-155: v가 0 또는 1이면 27 또는 28로 변환
  if (v < 27) {
    v += 27;
  }

  return { v, r, s };
}

/**
 * Permit 서명 만료 확인
 *
 * @param deadline 서명 유효 기간 (Unix timestamp)
 * @param bufferSeconds 버퍼 (기본: 30초)
 * @returns true if signature is still valid
 */
export function isPermitValid(deadline: number, bufferSeconds = 30): boolean {
  const now = Math.floor(Date.now() / 1000);
  return deadline > now + bufferSeconds;
}
