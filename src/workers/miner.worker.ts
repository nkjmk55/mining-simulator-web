/// <reference lib="webworker" />
// ==========================================================================
//  マイニング用 Web Worker
//  nonce を 0 から順番に試し、条件(先頭ゼロ)を満たすハッシュを探す。
//  この重い計算をメインスレッドから切り離すことで、
//  計算中でも画面(UI)が固まらないようにする。
// ==========================================================================
import { sha256Hex, meetsDifficulty } from "../lib/crypto";

// このファイル内の self は Worker のグローバルスコープ。
declare const self: DedicatedWorkerGlobalScope;

// 停止ボタンが押されたかどうかのフラグ。
let stopRequested = false;

// メインスレッドからのメッセージを受け取る。
self.addEventListener("message", (e: MessageEvent) => {
  const msg = e.data;
  if (msg.type === "stop") {
    stopRequested = true;
  } else if (msg.type === "start") {
    run(msg.data, msg.difficulty, msg.startNonce ?? 0);
  }
});

/**
 * マイニング本体。data に nonce を付け足したハッシュを計算し続け、
 * 条件を満たす nonce が見つかるまで繰り返す。
 */
async function run(data: string, difficulty: number, startNonce: number) {
  stopRequested = false;
  let nonce = startNonce;
  let attempts = 0;
  const startTime = performance.now();
  let lastPost = startTime;

  while (!stopRequested) {
    // 「データ + nonce」のハッシュを計算する
    const hash = await sha256Hex(data + nonce);
    attempts++;

    // 条件を満たしたら「発見!」を通知して終了
    if (meetsDifficulty(hash, difficulty)) {
      const elapsedMs = performance.now() - startTime;
      self.postMessage({
        type: "found",
        nonce,
        attempts,
        hash,
        elapsedMs,
        hashRate: attempts / (elapsedMs / 1000),
      });
      return;
    }

    // 一定時間(約 80ms)ごとに、途中経過をメインスレッドへ送る。
    const now = performance.now();
    if (now - lastPost >= 80) {
      const elapsedMs = now - startTime;
      self.postMessage({
        type: "progress",
        nonce,
        attempts,
        hash,
        elapsedMs,
        hashRate: attempts / (elapsedMs / 1000),
      });
      lastPost = now;
      // イベントループに一瞬制御を返す。
      // こうしないと「停止」メッセージを受け取れなくなる。
      await new Promise((resolve) => setTimeout(resolve));
    }

    nonce++;
  }

  // 停止が要求されたのでここまでの結果を通知する
  const elapsedMs = performance.now() - startTime;
  self.postMessage({
    type: "stopped",
    nonce,
    attempts,
    elapsedMs,
    hashRate: attempts / (elapsedMs / 1000),
  });
}
