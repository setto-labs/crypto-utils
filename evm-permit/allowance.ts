/**
 * ERC-20 Permit Allowance (EIP-2612)
 *
 * nonce 조회, allowance 확인
 */

import type {
  EIP1193Provider,
  GetERC20NonceParams,
  GetTokenNameParams,
  CheckERC20AllowanceParams,
  ERC20AllowanceInfo,
} from './types';
import { NONCES_SELECTOR, NAME_SELECTOR, ALLOWANCE_SELECTOR } from './constants';

/**
 * ERC-20 Permit nonce 조회
 *
 * @param params 조회 파라미터
 * @returns 현재 nonce 값
 *
 * @example
 * ```ts
 * const nonce = await getERC20Nonce({
 *   provider,
 *   tokenAddress: '0x...',
 *   ownerAddress: '0x...',
 * });
 * ```
 */
export async function getERC20Nonce(params: GetERC20NonceParams): Promise<number> {
  const { provider, tokenAddress, ownerAddress } = params;

  // nonces(address) 호출 데이터 생성
  // selector (4 bytes) + address (32 bytes, left-padded)
  const paddedAddress = ownerAddress.slice(2).toLowerCase().padStart(64, '0');
  const callData = NONCES_SELECTOR + paddedAddress;

  const result = (await provider.request({
    method: 'eth_call',
    params: [
      {
        to: tokenAddress,
        data: callData,
      },
      'latest',
    ],
  })) as string;

  // uint256 결과 파싱
  return parseInt(result, 16);
}

/**
 * ERC-20 토큰 이름 조회
 *
 * @param params 조회 파라미터
 * @returns 토큰 이름
 *
 * @example
 * ```ts
 * const name = await getTokenName({
 *   provider,
 *   tokenAddress: '0x...',
 * });
 * // 'USD Coin'
 * ```
 */
export async function getTokenName(params: GetTokenNameParams): Promise<string> {
  const { provider, tokenAddress } = params;

  const result = (await provider.request({
    method: 'eth_call',
    params: [
      {
        to: tokenAddress,
        data: NAME_SELECTOR,
      },
      'latest',
    ],
  })) as string;

  // ABI-encoded string 파싱
  // offset (32 bytes) + length (32 bytes) + data
  const hex = result.slice(2);
  const length = parseInt(hex.slice(64, 128), 16);
  const nameHex = hex.slice(128, 128 + length * 2);

  // hex to string
  let name = '';
  for (let i = 0; i < nameHex.length; i += 2) {
    name += String.fromCharCode(parseInt(nameHex.slice(i, i + 2), 16));
  }

  return name;
}

/**
 * ERC-20 allowance 확인
 *
 * @param params 확인 파라미터
 * @returns allowance 금액 (wei string)
 *
 * @example
 * ```ts
 * const allowance = await getERC20Allowance({
 *   provider,
 *   tokenAddress: '0x...',
 *   ownerAddress: '0x...',
 *   spenderAddress: '0x...',
 * });
 * ```
 */
export async function getERC20Allowance(
  params: CheckERC20AllowanceParams
): Promise<string> {
  const { provider, tokenAddress, ownerAddress, spenderAddress } = params;

  // allowance(address,address) 호출 데이터 생성
  const paddedOwner = ownerAddress.slice(2).toLowerCase().padStart(64, '0');
  const paddedSpender = spenderAddress.slice(2).toLowerCase().padStart(64, '0');
  const callData = ALLOWANCE_SELECTOR + paddedOwner + paddedSpender;

  const result = (await provider.request({
    method: 'eth_call',
    params: [
      {
        to: tokenAddress,
        data: callData,
      },
      'latest',
    ],
  })) as string;

  // uint256 결과를 decimal string으로 변환
  return BigInt(result).toString();
}

/**
 * ERC-20 allowance 확인 (충분 여부 포함)
 *
 * @param params 확인 파라미터
 * @param requiredAmount 필요한 금액 (wei string)
 * @returns allowance 정보
 *
 * @example
 * ```ts
 * const info = await checkERC20Allowance({
 *   provider,
 *   tokenAddress: '0x...',
 *   ownerAddress: '0x...',
 *   spenderAddress: '0x...',
 * }, '1000000');
 * // { allowance: '5000000', isSufficient: true }
 * ```
 */
export async function checkERC20Allowance(
  params: CheckERC20AllowanceParams,
  requiredAmount: string
): Promise<ERC20AllowanceInfo> {
  const allowance = await getERC20Allowance(params);

  return {
    allowance,
    isSufficient: BigInt(allowance) >= BigInt(requiredAmount),
  };
}
