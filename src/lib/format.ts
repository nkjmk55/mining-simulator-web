// 表示用の小さなフォーマット関数たち。

/** 数値を 3 桁区切りにする。例: 12345 → "12,345" */
export function formatNumber(n: number): string {
  return Math.round(n).toLocaleString("ja-JP");
}

/** ミリ秒を「秒」に直して表示する。例: 1234 → "1.23 秒" */
export function formatSeconds(ms: number): string {
  return `${(ms / 1000).toFixed(2)} 秒`;
}

/** ハッシュレート(回/秒)を読みやすく表示する。例: 12345 → "12,345 回/秒" */
export function formatHashRate(rate: number): string {
  if (!isFinite(rate) || rate <= 0) return "— 回/秒";
  return `${formatNumber(rate)} 回/秒`;
}
