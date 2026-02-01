/**
 * SVM Delegate Types
 *
 * Solana SPL Token delegate 관련 타입 정의
 */

// ============================================
// Solana Provider Interface
// ============================================

/**
 * Solana Wallet Provider (Phantom, Solflare 등)
 */
export interface SolanaProvider {
  /** 연결 상태 */
  isConnected: boolean;
  /** 연결된 지갑 주소 */
  publicKey: {
    toString(): string;
    toBytes(): Uint8Array;
  } | null;
  /** 지갑 연결 */
  connect(): Promise<{ publicKey: { toString(): string } }>;
  /** TX 서명 */
  signTransaction<T>(transaction: T): Promise<T>;
  /** TX 서명 및 전송 */
  signAndSendTransaction?<T>(transaction: T): Promise<{ signature: string }>;
}

// ============================================
// Delegate Approve TX
// ============================================

/**
 * Delegate + Payment TX 응답 (서버에서 받음)
 */
export interface DelegatePaymentTxResponse {
  /** base64 encoded unsigned transaction */
  unsigned_tx: string;
  /** blockhash */
  blockhash: string;
  /** blockhash 만료 시간 (Unix ms) */
  blockhash_expires_at: number;
  /** Delegate PDA 주소 */
  delegate_pda: string;
  /** 상태 조회용 Payment ID */
  payment_id: string;
  /** Approve 금액 (raw) */
  approve_amount: string;
  /** Fee 금액 (raw) */
  fee_amount: string;
}

/**
 * @deprecated Use DelegatePaymentTxResponse instead
 */
export type DelegateApproveTxResponse = DelegatePaymentTxResponse;

/**
 * TX 서명 결과
 */
export interface SignedTxResult {
  /** base64 encoded signed transaction */
  signedTx: string;
  /** 서명자 주소 */
  signerAddress: string;
}

// ============================================
// Delegate Allowance (on-chain 상태)
// ============================================

/**
 * SPL Token delegate 상태
 */
export interface DelegateAllowance {
  /** delegate 승인 여부 */
  approved: boolean;
  /** 위임된 금액 (raw) */
  delegatedAmount: string;
  /** delegate PDA 주소 */
  delegatePda: string;
}

// ============================================
// Function Parameters
// ============================================

/**
 * TX 서명 파라미터
 */
export interface SignDelegateTxParams {
  /** Solana wallet provider */
  provider: SolanaProvider;
  /** base64 encoded unsigned TX */
  unsignedTxBase64: string;
  /** 예상 서명자 주소 (검증용) */
  expectedSigner?: string;
}

/**
 * Provider 찾기 파라미터
 */
export interface FindProviderParams {
  /** 예상 지갑 주소 */
  expectedAddress: string;
}
