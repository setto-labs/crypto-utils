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
import { NONCES_SELECTOR, NAME_SELECTOR, ALLOWANCE_SELECTOR, EIP712_DOMAIN_SELECTOR, VERSION_SELECTOR, DEFAULT_PERMIT_VERSION } from './constants';

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

/**
 * ERC-20 토큰 version 조회
 *
 * @param provider EIP-1193 provider
 * @param tokenAddress 토큰 주소
 * @returns version 문자열 (기본값: "1")
 */
async function getTokenVersion(
  provider: EIP1193Provider,
  tokenAddress: string
): Promise<string> {
  try {
    const result = (await provider.request({
      method: 'eth_call',
      params: [
        {
          to: tokenAddress,
          data: VERSION_SELECTOR,
        },
        'latest',
      ],
    })) as string;

    // ABI-encoded string 파싱
    const hex = result.slice(2);
    const length = parseInt(hex.slice(64, 128), 16);
    const versionHex = hex.slice(128, 128 + length * 2);

    return hexToString(versionHex);
  } catch {
    // version() 미지원 토큰은 기본값 사용
    return DEFAULT_PERMIT_VERSION;
  }
}

/**
 * EIP-712 Domain 정보
 */
export interface Eip712DomainInfo {
  /** 토큰 이름 (EIP-712 domain name) */
  name: string;
  /** domain version (토큰마다 다름: "1" 또는 "2") */
  version: string;
  /** 체인 ID */
  chainId: number;
  /** 토큰 주소 */
  verifyingContract: string;
}

/**
 * EIP-5267 eip712Domain() 호출로 domain 정보 조회
 *
 * 토큰마다 EIP-712 domain version이 다르므로 (USDC "2", 대부분 "1"),
 * 하드코딩 대신 동적으로 조회해야 서명 검증 실패를 방지할 수 있음.
 *
 * @param provider EIP-1193 provider
 * @param tokenAddress 토큰 주소
 * @returns EIP-712 domain 정보 (name, version, chainId, verifyingContract)
 *
 * @example
 * ```ts
 * const domain = await getEip712Domain(provider, '0x...');
 * // { name: 'USD Coin', version: '2', chainId: 1, verifyingContract: '0x...' }
 * ```
 */
export async function getEip712Domain(
  provider: EIP1193Provider,
  tokenAddress: string
): Promise<Eip712DomainInfo> {
  try {
    const result = (await provider.request({
      method: 'eth_call',
      params: [
        {
          to: tokenAddress,
          data: EIP712_DOMAIN_SELECTOR,
        },
        'latest',
      ],
    })) as string;

    return decodeEip712Domain(result, tokenAddress);
  } catch {
    // eip712Domain() 미지원 토큰은 name(), version() 개별 조회
    const name = await getTokenName({ provider, tokenAddress });
    const version = await getTokenVersion(provider, tokenAddress);
    const chainIdHex = (await provider.request({
      method: 'eth_chainId',
    })) as string;

    return {
      name,
      version,
      chainId: parseInt(chainIdHex, 16),
      verifyingContract: tokenAddress,
    };
  }
}

/**
 * eip712Domain() 응답 디코딩
 *
 * Returns: (bytes1 fields, string name, string version, uint256 chainId, address verifyingContract, bytes32 salt, uint256[] extensions)
 */
function decodeEip712Domain(result: string, tokenAddress: string): Eip712DomainInfo {
  const hex = result.slice(2);

  // fields (1 byte) - offset 0
  // name offset - offset 32 (0x20)
  // version offset - offset 64 (0x40)
  // chainId - offset 96 (0x60)
  // verifyingContract - offset 128 (0x80)
  // ... (salt, extensions 무시)

  // chainId (uint256 at offset 96)
  const chainIdHex = hex.slice(192, 256);
  const chainId = Number(BigInt('0x' + chainIdHex));

  // name offset -> name length -> name data
  const nameOffsetHex = hex.slice(64, 128);
  const nameOffset = parseInt(nameOffsetHex, 16) * 2; // bytes to hex chars
  const nameLengthHex = hex.slice(nameOffset, nameOffset + 64);
  const nameLength = parseInt(nameLengthHex, 16);
  const nameHex = hex.slice(nameOffset + 64, nameOffset + 64 + nameLength * 2);
  const name = hexToString(nameHex);

  // version offset -> version length -> version data
  const versionOffsetHex = hex.slice(128, 192);
  const versionOffset = parseInt(versionOffsetHex, 16) * 2;
  const versionLengthHex = hex.slice(versionOffset, versionOffset + 64);
  const versionLength = parseInt(versionLengthHex, 16);
  const versionHex = hex.slice(versionOffset + 64, versionOffset + 64 + versionLength * 2);
  const version = hexToString(versionHex);

  return {
    name,
    version,
    chainId,
    verifyingContract: tokenAddress,
  };
}

/**
 * hex string to utf-8 string
 */
function hexToString(hex: string): string {
  let str = '';
  for (let i = 0; i < hex.length; i += 2) {
    str += String.fromCharCode(parseInt(hex.slice(i, i + 2), 16));
  }
  return str;
}
