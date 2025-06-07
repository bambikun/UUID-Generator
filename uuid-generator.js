/**
 * UUID Generator Library
 * ブラウザ向けにUUIDv3,v4,v5を生成可能
 */

const UUID = (() => {

  // UUIDv4: ランダム生成
  function UUIDv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = crypto.getRandomValues(new Uint8Array(1))[0] % 16;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // 名前空間UUID用のユーティリティ
  // 文字列 → UTF-8 バイト配列変換
  function stringToBytes(str) {
    return new TextEncoder().encode(str);
  }

  // 16進文字列 → バイト配列変換
  function hexToBytes(hex) {
    const bytes = [];
    for(let i=0; i<hex.length; i+=2) {
      bytes.push(parseInt(hex.substr(i, 2), 16));
    }
    return new Uint8Array(bytes);
  }

  // バイト配列 → 16進文字列（UUID形式）
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

  // UUIDv3/v5の共通部分：名前空間＋名前をハッシュ化してUUID生成
  // hashFuncはMD5（v3）かSHA-1（v5）を渡す
  async function generateNameBasedUUID(namespaceUUID, name, hashFunc, version) {
    const namespaceBytes = hexToBytes(namespaceUUID.replace(/-/g, ''));
    const nameBytes = stringToBytes(name);
    // namespace + name を連結
    const data = new Uint8Array(namespaceBytes.length + nameBytes.length);
    data.set(namespaceBytes, 0);
    data.set(nameBytes, namespaceBytes.length);
    // ハッシュ計算
    const hashBuffer = await crypto.subtle.digest(hashFunc, data);
    const hash = new Uint8Array(hashBuffer);

    // バージョンをセット
    hash[6] = (hash[6] & 0x0f) | (version << 4);
    // バリアントをセット
    hash[8] = (hash[8] & 0x3f) | 0x80;

    // 最初の16バイトをUUIDに
    return bytesToUUID(hash.slice(0,16));
  }

  // UUIDv3: 名前空間＋名前 → MD5 → UUID
  async function UUIDv3(namespaceUUID, name) {
    return generateNameBasedUUID(namespaceUUID, name, 'MD5', 3);
  }

  // UUIDv5: 名前空間＋名前 → SHA-1 → UUID
  async function UUIDv5(namespaceUUID, name) {
    return generateNameBasedUUID(namespaceUUID, name, 'SHA-1', 5);
  }

  // 定義済み名前空間UUID（例）
  const NAMESPACE_DNS = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
  const NAMESPACE_URL = '6ba7b811-9dad-11d1-80b4-00c04fd430c8';
  const NAMESPACE_OID = '6ba7b812-9dad-11d1-80b4-00c04fd430c8';
  const NAMESPACE_X500 = '6ba7b814-9dad-11d1-80b4-00c04fd430c8';

  // 公開API
  return {
    v4,
    v3,
    v5,
    NAMESPACE_DNS,
    NAMESPACE_URL,
    NAMESPACE_OID,
    NAMESPACE_X500,
  };
})();
