// ==========================================================================
//  Miner: マイニング用 Web Worker を React から使いやすくするための窓口。
//  - mine() を呼ぶとマイニングを開始し、見つかったら Promise が解決する。
//  - 途中経過は onProgress コールバックで受け取れる。
//  - stop() でいつでも中断できる。
// ==========================================================================

// マイニングの途中経過。
export type MineProgress = {
  nonce: number; // 現在試している nonce
  attempts: number; // これまでの試行回数
  hash: string; // 直近に計算したハッシュ
  elapsedMs: number; // 経過時間(ミリ秒)
  hashRate: number; // ハッシュレート(回/秒)
};

// マイニングの最終結果。
export type MineResult = {
  found: boolean; // true=発見、false=停止された
  nonce: number;
  attempts: number;
  hash: string;
  elapsedMs: number;
  hashRate: number;
};

export class Miner {
  private worker: Worker;

  constructor() {
    // Vite の作法で Worker を読み込む(バンドルもよしなにやってくれる)。
    this.worker = new Worker(
      new URL("../workers/miner.worker.ts", import.meta.url),
      { type: "module" }
    );
  }

  /**
   * マイニングを開始する。
   * @param data マイニング対象のデータ文字列(この後ろに nonce が付く)
   * @param difficulty 難易度(先頭ゼロの個数)
   * @param startNonce 開始する nonce(通常は 0)
   * @param onProgress 途中経過を受け取るコールバック
   */
  mine(
    data: string,
    difficulty: number,
    startNonce: number,
    onProgress?: (p: MineProgress) => void
  ): Promise<MineResult> {
    return new Promise((resolve) => {
      const handler = (e: MessageEvent) => {
        const m = e.data;
        if (m.type === "progress") {
          onProgress?.(m);
        } else if (m.type === "found") {
          this.worker.removeEventListener("message", handler);
          resolve({ ...m, found: true });
        } else if (m.type === "stopped") {
          this.worker.removeEventListener("message", handler);
          resolve({ ...m, found: false, hash: "" });
        }
      };
      this.worker.addEventListener("message", handler);
      this.worker.postMessage({ type: "start", data, difficulty, startNonce });
    });
  }

  /** マイニングを中断する。 */
  stop() {
    this.worker.postMessage({ type: "stop" });
  }

  /** Worker を完全に破棄する(画面を離れるときなど)。 */
  terminate() {
    this.worker.terminate();
  }
}
