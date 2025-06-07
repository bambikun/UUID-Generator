/**
 * UUID Generator Library
 * ブラウザ環境向けに
 * UUIDv1, v2, v3, v4, v5 を生成可能
 * 
 * 注意：
 * - UUIDv1/v2はMACアドレスが取得できないため擬似実装
 * - UUIDv3/v5は非同期関数（Web Crypto APIのため）
 */

/* =========================
 * UUIDv1 簡易実装（ブラウザ用）
 * - 1582年UUIDエポックからの経過時間をベースに生成
 * - ランダムクロックシーケンス・ランダムノード（MACアドレス代替）
 * - RFC4122準拠のバージョンとバリアントをセット
 * ========================= */
function UUIDv1() {
  const now = Date.now();
  const UUID_EPOCH = Date.UTC(1582, 9, 15);
  const timestamp = BigInt(now) - BigInt(UUID_EPOCH);

  // 100ナノ秒単位タイムスタンプ（概算）
  const time100ns = timestamp * 10000n;

  // タイムスタンプ分割
  const timeLow = Number(time100ns & 0xffffffffn);
  const timeMid = Number((time100ns >> 32n) & 0xffffn);
  const timeHi = Number((time100ns >> 48n) & 0x0fffn);

  // バージョン（1）をセット
  const timeHiVersion = timeHi | (1 << 12);

  // クロックシーケンス（14bitランダム）
  const clockSeq = Math.floor(Math.random() * 0x3fff);
  const clockSeqHi = (clockSeq >> 8) | 0x80; // variant bits 10xxxxxx
  const clockSeqLow = clockSeq & 0xff;

  // ノード（MACアドレス代わりにランダム48bit）
  const node = [];
  for (let i = 0; i < 6; i++) {
    node.push(Math.floor(Math.random() * 256));
  }

  // フォーマット成形
  return (
    hex4(timeLow >> 16) +
    hex4(timeLow & 0xffff) + '-' +
    hex4(timeMid) + '-' +
    hex4(timeHiVersion) + '-' +
    hex2(clockSeqHi) + hex2(clockSeqLow) + '-' +
    node.map(b => hex2(b)).join('')
  );
}

/* =========================
 * UUIDv2 簡易実装（DCE Security版イメージ）
 * - UUIDv1ベース
 * - 先頭4バイトにUID（ユーザID）をセット（ここでは0固定）
 * ========================= */
function UUIDv2() {
  const uid = 0; // 擬似UID

  // UUIDv1生成
  const uuid1 = UUIDv1();

  // UUID先頭8文字をUIDに置換
  const uidHex = hex8(uid);

  return uidHex + uuid1.slice(8);
}

/* =========================
 * UUIDv3: 名前空間 + 名前 → MD5ハッシュ → UUIDv3
 * - 名前に基づくUUID生成（名前空間付き）
 * - MD5ハッシュを用いる
 * - 非同期関数（Promise）
 * ========================= */
async function UUIDv3(namespaceUUID, name) {
  return generateNameBasedUUID(namespaceUUID, name, 'MD5', 3);
}

/* =========================
 * UUIDv4: ランダム生成
 * - RFC4122準拠のバージョン4UUID
 * - Web Crypto APIのcrypto.getRandomValues()を利用
 * ========================= */
function UUIDv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = crypto.getRandomValues(new Uint8Array(1))[0] % 16;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/* =========================
 * UUIDv5: 名前空間 + 名前 → SHA-1ハッシュ → UUIDv5
 * - 名前に基づくUUID生成（名前空間付き）
 * - SHA-1ハッシュを用いる
 * - 非同期関数（Promise）
 * ========================= */
async function UUIDv5(namespaceUUID, name) {
  return generateNameBasedUUID(namespaceUUID, name, 'SHA-1', 5);
}

/* =========================
 * UUIDv3 / UUIDv5 共通ユーティリティ
 * - 名前空間UUID + 名前 → ハッシュ → UUID生成
 * - hashFuncに'MD5'または'SHA-1'を指定
 * ========================= */
function stringToBytes(str) {
  return new TextEncoder().encode(str);
}
function hexToBytes(hex) {
  const bytes = [];
  for(let i=0; i<hex.length; i+=2) {
    bytes.push(parseInt(hex.substr(i, 2), 16));
  }
  return new Uint8Array(bytes);
}
function bytesToUUID(buf) {
  const hex = [...buf].map(b => b.toString(16).padStart(2, '0')).join('');
  return (
    hex.substr(0,8) + '-' +
    hex.substr(8,4) + '-' +
    hex.substr(12,4) + '-' +
    hex.substr(16,4) + '-' +
    hex.substr(20,12)
  );
}

async function generateNameBasedUUID(namespaceUUID, name, hashFunc, version) {
  const namespaceBytes = hexToBytes(namespaceUUID.replace(/-/g, ''));
  const nameBytes = stringToBytes(name);
  const data = new Uint8Array(namespaceBytes.length + nameBytes.length);
  data.set(namespaceBytes, 0);
  data.set(nameBytes, namespaceBytes.length);

  const hashBuffer = await crypto.subtle.digest(hashFunc, data);
  const hash = new Uint8Array(hashBuffer);

  // バージョンセット
  hash[6] = (hash[6] & 0x0f) | (version << 4);
  // バリアントセット
  hash[8] = (hash[8] & 0x3f) | 0x80;

  return bytesToUUID(hash.slice(0,16));
}

/* =========================
 * ヘルパー関数
 * ========================= */
function hex4(num) {
  return num.toString(16).padStart(4, '0');
}
function hex2(num) {
  return num.toString(16).padStart(2, '0');
}
function hex8(num) {
  return num.toString(16).padStart(8, '0');
}

/* =========================
 * 定義済み名前空間UUID（RFC4122より）
 * ========================= */
const NAMESPACE_DNS  = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
const NAMESPACE_URL  = '6ba7b811-9dad-11d1-80b4-00c04fd430c8';
const NAMESPACE_OID  = '6ba7b812-9dad-11d1-80b4-00c04fd430c8';
const NAMESPACE_X500 = '6ba7b814-9dad-11d1-80b4-00c04fd430c8';

/* =========================
 * エクスポート用まとめオブジェクト
 * ========================= */
const UUID = {
  v1: UUIDv1,
  v2: UUIDv2,
  v3: UUIDv3,
  v4: UUIDv4,
  v5: UUIDv5,
  NAMESPACE_DNS,
  NAMESPACE_URL,
  NAMESPACE_OID,
  NAMESPACE_X500,
};
