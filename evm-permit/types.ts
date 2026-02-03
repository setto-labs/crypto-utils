/**
 * ERC-20 Permit Types (EIP-2612)
 *
 * EIP-2612 Permit 관련 타입 정의
 * https://eips.ethereum.org/EIPS/eip-2612
 */

// ============================================
// EIP-1193 Provider Interface
// ============================================

/**
 * EIP-1193 Provider interface (minimal)
 * wagmi, ethers, window.ethereum 등 모두 호환
 */
export interface EIP1193Provider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
}

// ============================================
// ERC-20 Permit Signature
// ============================================

/**
 * ERC-20 Permit 서명 데이터 (컨트랙트 호출용)
 */
export interface ERC20PermitSignature {
  /** 허용 금액 (wei string) */
  value: string;
  /** 서명 만료 시간 (Unix timestamp) */
  deadline: number;
  /** ECDSA v */
  v: number;
  /** ECDSA r (hex string) */
  r: string;
  /** ECDSA s (hex string) */
  s: string;
}

// ============================================
// Allowance Info
// ============================================

/**
 * ERC-20 allowance 정보
 */
export interface ERC20AllowanceInfo {
  /** 현재 allowance 금액 (wei string) */
  allowance: string;
  /** allowance가 충분한지 여부 */
  isSufficient: boolean;
}

// ============================================
// Function Parameters
// ============================================

/**
 * ERC-20 allowance 확인 파라미터
 */
export interface CheckERC20AllowanceParams {
  /** EIP-1193 provider */
  provider: EIP1193Provider;
  /** 토큰 주소 */
  tokenAddress: string;
  /** 사용자 주소 */
  ownerAddress: string;
  /** Spender 주소 (SettoPayment) */
  spenderAddress: string;
}

/**
 * EIP-2612 Permit 서명 파라미터
 */
export interface SignERC20PermitParams {
  /** EIP-1193 provider */
  provider: EIP1193Provider;
  /** 체인 ID */
  chainId: number;
  /** 토큰 주소 */
  tokenAddress: string;
  /** 토큰 이름 (EIP-712 domain name) */
  tokenName: string;
  /** Spender 주소 (SettoPayment) */
  spenderAddress: string;
  /** 허용 금액 (wei string) */
  value: string;
  /** 현재 nonce (on-chain에서 조회) */
  nonce: number;
  /** 서명 유효 기간 (분, 기본: 60) */
  deadlineMinutes?: number;
  /** 서명할 주소 (지정하지 않으면 연결된 첫 번째 계정 사용) */
  signerAddress?: string;
}

/**
 * EIP-2612 Permit 서명 결과
 */
export interface SignERC20PermitResult {
  /** Permit 서명 데이터 */
  permitSignature: ERC20PermitSignature;
  /** 서명자 주소 */
  signerAddress: string;
}

/**
 * ERC-20 nonce 조회 파라미터
 */
export interface GetERC20NonceParams {
  /** EIP-1193 provider */
  provider: EIP1193Provider;
  /** 토큰 주소 */
  tokenAddress: string;
  /** 사용자 주소 */
  ownerAddress: string;
}

/**
 * ERC-20 토큰 이름 조회 파라미터
 */
export interface GetTokenNameParams {
  /** EIP-1193 provider */
  provider: EIP1193Provider;
  /** 토큰 주소 */
  tokenAddress: string;
}
