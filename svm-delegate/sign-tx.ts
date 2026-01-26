/**
 * SVM Delegate TX Signing
 *
 * Solana TX 서명 유틸리티
 */

import type {
  SolanaProvider,
  SignDelegateTxParams,
  SignedTxResult,
  FindProviderParams,
} from './types';
import { SUPPORTED_WALLETS } from './constants';

/**
 * unsigned TX 서명
 *
 * 서버에서 받은 unsigned TX를 지갑으로 서명
 *
 * @param params 서명 파라미터
 * @returns signed TX (base64) + signer address
 *
 * @example
 * ```ts
 * const result = await signDelegateTx({
 *   provider: window.phantom.solana,
 *   unsignedTxBase64: txData.unsigned_tx,
 *   expectedSigner: walletAddress,
 * });
 * ```
 */
export async function signDelegateTx(
  params: SignDelegateTxParams
): Promise<SignedTxResult> {
  const { provider, unsignedTxBase64, expectedSigner } = params;

  // 1. 지갑 연결 확인
  if (!provider.isConnected || !provider.publicKey) {
    throw new Error('Wallet not connected');
  }

  const signerAddress = provider.publicKey.toString();

  // 2. 서명자 주소 검증 (optional)
  if (expectedSigner && signerAddress.toLowerCase() !== expectedSigner.toLowerCase()) {
    throw new Error(
      `Wallet address mismatch. Expected: ${expectedSigner}, Got: ${signerAddress}`
    );
  }

  // 3. base64 → Uint8Array
  const txBytes = base64ToUint8Array(unsignedTxBase64);

  // 4. Transaction 객체 생성 (@solana/web3.js 의존성 없이)
  // provider.signTransaction은 Transaction 객체를 받음
  // 여기서는 raw bytes를 Transaction으로 변환해야 함
  // @solana/web3.js의 Transaction.from()이 필요함

  // NOTE: 이 함수를 사용하려면 @solana/web3.js를 import해야 함
  // crypto-utils는 의존성 최소화를 위해 Transaction 변환은 호출자에게 위임
  throw new Error(
    'signDelegateTx requires @solana/web3.js Transaction object. ' +
    'Use signDelegateTxWithTransaction() instead, or convert base64 to Transaction manually.'
  );
}

/**
 * Transaction 객체로 서명 (권장)
 *
 * @solana/web3.js Transaction 객체를 직접 받아서 서명
 *
 * @param provider Solana wallet provider
 * @param transaction @solana/web3.js Transaction object
 * @returns signed TX (base64) + signer address
 *
 * @example
 * ```ts
 * import { Transaction } from '@solana/web3.js';
 *
 * const txBytes = base64ToUint8Array(txData.unsigned_tx);
 * const transaction = Transaction.from(txBytes);
 *
 * const result = await signDelegateTxWithTransaction(
 *   window.phantom.solana,
 *   transaction,
 * );
 * ```
 */
export async function signDelegateTxWithTransaction<T extends { serialize(): Uint8Array }>(
  provider: SolanaProvider,
  transaction: T
): Promise<SignedTxResult> {
  // 1. 지갑 연결 확인
  if (!provider.isConnected || !provider.publicKey) {
    throw new Error('Wallet not connected');
  }

  const signerAddress = provider.publicKey.toString();

  // 2. TX 서명
  const signedTx = await provider.signTransaction(transaction);

  // 3. serialize → base64
  const signedTxBytes = signedTx.serialize();
  const signedTxBase64 = uint8ArrayToBase64(signedTxBytes);

  return {
    signedTx: signedTxBase64,
    signerAddress,
  };
}

/**
 * 연결된 Solana 지갑 provider 찾기
 *
 * @param params 검색 파라미터
 * @returns 연결된 provider 또는 null
 *
 * @example
 * ```ts
 * const provider = findConnectedProvider({
 *   expectedAddress: campaign.wallet_address,
 * });
 *
 * if (!provider) {
 *   // 지갑 연결 필요
 * }
 * ```
 */
export function findConnectedProvider(
  params: FindProviderParams
): SolanaProvider | null {
  const { expectedAddress } = params;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const win = window as any;

  // 지원하는 지갑들에서 연결된 것 찾기
  const providers: (SolanaProvider | undefined)[] = [
    win.phantom?.solana,
    win.solflare,
    win.okxwallet?.solana,
    win.coinbaseSolana,
    win.backpack?.solana,
  ];

  for (const provider of providers) {
    if (!provider) continue;

    try {
      if (
        provider.isConnected &&
        provider.publicKey?.toString() === expectedAddress
      ) {
        return provider;
      }
    } catch {
      // skip invalid provider
    }
  }

  return null;
}

/**
 * Solana 지갑 연결 시도
 *
 * @param expectedAddress 예상 지갑 주소
 * @returns 연결된 provider
 *
 * @example
 * ```ts
 * const provider = await connectSolanaWallet(campaign.wallet_address);
 * ```
 */
export async function connectSolanaWallet(
  expectedAddress: string
): Promise<SolanaProvider> {
  // 1. 이미 연결된 provider 찾기
  const connected = findConnectedProvider({ expectedAddress });
  if (connected) {
    return connected;
  }

  // 2. Phantom 먼저 시도
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const win = window as any;

  if (win.phantom?.solana) {
    try {
      const resp = await win.phantom.solana.connect();
      if (resp.publicKey.toString() === expectedAddress) {
        return win.phantom.solana;
      }
    } catch {
      // skip
    }
  }

  // 3. Solflare 시도
  if (win.solflare) {
    try {
      await win.solflare.connect();
      if (win.solflare.publicKey?.toString() === expectedAddress) {
        return win.solflare;
      }
    } catch {
      // skip
    }
  }

  throw new Error(
    `Could not find wallet with address: ${expectedAddress}. ` +
    `Please connect the correct wallet.`
  );
}

// ============================================
// Utility Functions
// ============================================

/**
 * base64 → Uint8Array
 */
export function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Uint8Array → base64
 */
export function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * blockhash 만료 확인
 *
 * @param expiresAt 만료 시간 (Unix ms)
 * @param bufferMs 버퍼 (기본: 10000ms = 10초)
 * @returns true if blockhash is still valid
 */
export function isBlockhashValid(expiresAt: number, bufferMs = 10000): boolean {
  return expiresAt > Date.now() + bufferMs;
}
