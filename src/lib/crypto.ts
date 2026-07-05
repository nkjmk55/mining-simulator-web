// ==========================================================================
//  ハッシュ計算ユーティリティ
//  ブラウザ標準の Web Crypto API(crypto.subtle)を使って SHA-256 を計算する。
//  追加ライブラリは不要。マイニングページなど他の画面でも再利用する。
// ==========================================================================

/**
 * 文字列を SHA-256 でハッシュ化し、16進数(hex)の文字列で返す。
 *
 * 例: sha256Hex("abc") → "ba7816bf8f01cfea..."(必ず 64 文字)
 *
 * ポイント:
 * - どんな長さの入力でも、出力は必ず 64 文字(256 ビット)になる。
 * - 入力が 1 文字でも変われば、出力は全く別物になる。
 * - 出力から入力を逆算することはできない(一方向)。
 */
export async function sha256Hex(input: string): Promise<string> {
  // 1) 文字列を UTF-8 のバイト列(数値の並び)に変換する
  const bytes = new TextEncoder().encode(input);

  // 2) SHA-256 でダイジェスト(要約)を計算する。結果は ArrayBuffer。
  //    crypto.subtle.digest は非同期(Promise を返す)なので await する。
  const digest = await crypto.subtle.digest("SHA-256", bytes);

  // 3) バイト列を 1 バイトずつ「2 桁の 16 進数」に変換して連結する
  //    例: 10 → "0a"、255 → "ff"
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * ハッシュ(16進文字列)が指定した難易度を満たすか判定する。
 *
 * このサイトでは難易度を「先頭に並ぶゼロの個数」で表現している。
 * 例: difficulty=3 なら "000..." で始まるハッシュが「当たり」。
 * ゼロが 1 個増えるごとに、当たりを引く確率は 1/16 になる
 * (=必要な計算量が約 16 倍に跳ね上がる)。
 */
export function meetsDifficulty(hash: string, difficulty: number): boolean {
  return hash.startsWith("0".repeat(difficulty));
}

/** ハッシュの先頭に何個ゼロが並んでいるかを数える(表示のハイライト用)。 */
export function leadingZeroCount(hash: string): number {
  const m = hash.match(/^0*/);
  return m ? m[0].length : 0;
}
