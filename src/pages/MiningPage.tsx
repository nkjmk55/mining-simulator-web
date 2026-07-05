import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { sha256Hex, meetsDifficulty } from "../lib/crypto";
import { Miner, type MineProgress, type MineResult } from "../lib/minerClient";
import { HashDisplay } from "../components/HashDisplay";
import { formatNumber, formatSeconds, formatHashRate } from "../lib/format";

// 選べる難易度(先頭ゼロの個数)。1〜6。
const DIFFICULTIES = [1, 2, 3, 4, 5, 6];

// マイニング体験(/mining)— このサイトの核となるページ。
// 「データ + nonce」のハッシュが、先頭ゼロ◯個の条件を満たす nonce を探す作業
// =マイニングであることを、手動・自動の両方で体感してもらう。
export function MiningPage() {
  const [mode, setMode] = useState<"manual" | "auto">("manual");
  // 手動・自動で共通の入力
  const [data, setData] = useState("こんにちは、ブロックチェーン");
  const [difficulty, setDifficulty] = useState(3);

  return (
    <div className="space-y-8">
      <header>
        <p className="font-mono text-sm text-emerald-400">② マイニング体験</p>
        <h1 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
          nonce 探し=マイニングを体感する
        </h1>
        <p className="mt-3 text-sm text-slate-300">
          「データ + nonce」のハッシュが、
          <strong className="text-amber-300">先頭にゼロが並ぶ</strong>
          という条件を満たす nonce を探します。
          これこそがマイニングの正体です。
          <br />
          まずは<strong className="text-white">手動</strong>で当たりを探す感覚を掴み、
          次に<strong className="text-white">自動</strong>で総当たりの速さと難易度の壁を体感しましょう。
        </p>
      </header>

      {/* 共通の入力(データと難易度) */}
      <section className="grid gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="mining-data"
            className="mb-2 block text-sm font-medium text-slate-200"
          >
            ブロックデータ(自由テキスト)
          </label>
          <input
            id="mining-data"
            type="text"
            value={data}
            onChange={(e) => setData(e.target.value)}
            className="w-full rounded-lg border border-white/15 bg-black/40 px-4 py-2.5 font-mono text-sm text-slate-100 outline-none transition-colors focus:border-emerald-400/60"
          />
        </div>
        <div>
          <label
            htmlFor="mining-difficulty"
            className="mb-2 block text-sm font-medium text-slate-200"
          >
            難易度(先頭ゼロの数):{" "}
            <span className="font-mono text-amber-300">{difficulty}</span>
          </label>
          <div className="flex flex-wrap gap-1.5">
            {DIFFICULTIES.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDifficulty(d)}
                className={[
                  "h-9 w-9 rounded-md font-mono text-sm transition-colors",
                  d === difficulty
                    ? "bg-amber-400 font-bold text-slate-950"
                    : "bg-white/5 text-slate-300 hover:bg-white/10",
                ].join(" ")}
              >
                {d}
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-xs text-slate-500">
            目標:先頭が「{"0".repeat(difficulty)}」で始まるハッシュ
          </p>
        </div>
      </section>

      {/* モード切り替えタブ */}
      <div className="flex gap-1 rounded-lg border border-white/10 bg-black/30 p-1">
        <ModeTab active={mode === "manual"} onClick={() => setMode("manual")}>
          🖐️ 手動マイニング
        </ModeTab>
        <ModeTab active={mode === "auto"} onClick={() => setMode("auto")}>
          ⚙️ 自動マイニング
        </ModeTab>
      </div>

      {mode === "manual" ? (
        <ManualMining data={data} difficulty={difficulty} />
      ) : (
        <AutoMining data={data} difficulty={difficulty} />
      )}
    </div>
  );
}

function ModeTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-emerald-500/15 text-emerald-300"
          : "text-slate-400 hover:bg-white/5",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

// ==========================================================================
//  手動マイニングモード(Phase 3)
//  nonce を +1 しながら、自分の手で「当たり」を探す。
// ==========================================================================
function ManualMining({ data, difficulty }: { data: string; difficulty: number }) {
  const [nonce, setNonce] = useState(0);
  const [hash, setHash] = useState("");

  // data か nonce が変わるたびにハッシュを計算し直す。
  useEffect(() => {
    let active = true;
    sha256Hex(data + nonce).then((h) => {
      if (active) setHash(h);
    });
    return () => {
      active = false;
    };
  }, [data, nonce]);

  const success = hash !== "" && meetsDifficulty(hash, difficulty);

  return (
    <section className="space-y-4">
      {/* nonce の操作 */}
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label
            htmlFor="manual-nonce"
            className="mb-2 block text-sm font-medium text-slate-200"
          >
            nonce(数値)
          </label>
          <input
            id="manual-nonce"
            type="number"
            value={nonce}
            onChange={(e) => setNonce(Number(e.target.value) || 0)}
            className="w-32 rounded-lg border border-white/15 bg-black/40 px-4 py-2.5 font-mono text-sm text-slate-100 outline-none focus:border-emerald-400/60"
          />
        </div>
        <button
          type="button"
          onClick={() => setNonce((n) => n + 1)}
          className="rounded-lg bg-emerald-500 px-5 py-2.5 font-semibold text-slate-950 transition-colors hover:bg-emerald-400"
        >
          nonce +1
        </button>
        <button
          type="button"
          onClick={() => setNonce(0)}
          className="rounded-lg border border-white/15 px-4 py-2.5 text-sm text-slate-300 transition-colors hover:bg-white/5"
        >
          0 に戻す
        </button>
      </div>

      {/* 計算対象と結果 */}
      <div
        className={[
          "rounded-xl border p-5 transition-colors",
          success
            ? "border-emerald-400/50 bg-emerald-500/10"
            : "border-white/10 bg-white/[0.02]",
        ].join(" ")}
      >
        <p className="mb-1 text-xs text-slate-500">計算している文字列</p>
        <p className="mb-3 break-all font-mono text-sm text-slate-400">
          "{data}" + {nonce} ={" "}
          <span className="text-slate-200">
            "{data}
            {nonce}"
          </span>
        </p>
        <p className="mb-1 text-xs text-slate-500">SHA-256 ハッシュ</p>
        <HashDisplay hash={hash} success={success} className="text-sm sm:text-base" />

        {success ? (
          <div className="mt-4 rounded-lg bg-emerald-500/20 px-4 py-3 text-emerald-200">
            <p className="text-lg font-bold">ブロック発見! ⛏️🎉</p>
            <p className="mt-1 text-sm">
              nonce = <span className="font-mono">{nonce}</span> で、先頭ゼロ{" "}
              {difficulty} 個の条件を満たしました!
            </p>
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-400">
            まだ条件を満たしていません。「nonce +1」を押して当たりを探しましょう。
          </p>
        )}
      </div>

      <p className="text-xs text-slate-500">
        💡 難易度 1〜2 なら手で見つかりますが、3 以上になると手作業ではほぼ不可能に。
        そこで「自動マイニング」の出番です。
      </p>
    </section>
  );
}

// ==========================================================================
//  自動マイニングモード(Phase 4)
//  Web Worker で nonce を 0 から総当たりし、統計を記録する。
// ==========================================================================
type DifficultyStat = { attempts: number; elapsedMs: number; hashRate: number };

function AutoMining({ data, difficulty }: { data: string; difficulty: number }) {
  const minerRef = useRef<Miner | null>(null);
  const [mining, setMining] = useState(false);
  const [progress, setProgress] = useState<MineProgress | null>(null);
  const [result, setResult] = useState<MineResult | null>(null);
  // 難易度ごとの記録(所要時間の比較テーブル用)
  const [stats, setStats] = useState<Record<number, DifficultyStat>>({});

  // Worker は使い回す。画面を離れるときに破棄する。
  function getMiner(): Miner {
    if (!minerRef.current) minerRef.current = new Miner();
    return minerRef.current;
  }
  useEffect(() => {
    return () => {
      minerRef.current?.terminate();
      minerRef.current = null;
    };
  }, []);

  async function start() {
    setMining(true);
    setResult(null);
    setProgress(null);
    const r = await getMiner().mine(data, difficulty, 0, (p) => setProgress(p));
    setMining(false);
    if (r.found) {
      setResult(r);
      // 難易度別の記録を更新
      setStats((s) => ({
        ...s,
        [difficulty]: {
          attempts: r.attempts,
          elapsedMs: r.elapsedMs,
          hashRate: r.hashRate,
        },
      }));
    }
  }

  function stop() {
    getMiner().stop();
  }

  const recordedDifficulties = Object.keys(stats)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={start}
          disabled={mining}
          className="rounded-lg bg-emerald-500 px-6 py-2.5 font-semibold text-slate-950 transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {mining ? "マイニング中…" : "マイニング開始"}
        </button>
        <button
          type="button"
          onClick={stop}
          disabled={!mining}
          className="rounded-lg border border-red-400/40 px-5 py-2.5 text-sm font-medium text-red-300 transition-colors hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-40"
        >
          停止
        </button>
      </div>

      {/* リアルタイムの状態表示 */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="試行中の nonce" value={progress ? formatNumber(progress.nonce) : "—"} />
        <Stat label="試行回数" value={progress ? formatNumber(progress.attempts) : "—"} />
        <Stat label="経過時間" value={progress ? formatSeconds(progress.elapsedMs) : "—"} />
        <Stat
          label="ハッシュレート"
          value={progress ? formatHashRate(progress.hashRate) : "—"}
        />
      </div>

      {/* 現在計算中のハッシュ(高速で変化する様子) */}
      <div className="rounded-xl border border-white/10 bg-black/30 p-5">
        <p className="mb-1 text-xs text-slate-500">
          現在のハッシュ(目標:先頭「{"0".repeat(difficulty)}」)
        </p>
        <HashDisplay
          hash={result?.hash ?? progress?.hash ?? ""}
          success={!!result?.found}
          className="text-sm sm:text-base"
        />
      </div>

      {/* 成功結果 */}
      {result?.found && (
        <div className="rounded-xl border border-emerald-400/50 bg-emerald-500/10 p-5 text-emerald-200">
          <p className="text-lg font-bold">ブロック発見! ⛏️🎉</p>
          <div className="mt-2 grid grid-cols-1 gap-1 text-sm sm:grid-cols-3">
            <p>
              成功 nonce:{" "}
              <span className="font-mono text-white">{formatNumber(result.nonce)}</span>
            </p>
            <p>
              総試行回数:{" "}
              <span className="font-mono text-white">
                {formatNumber(result.attempts)}
              </span>{" "}
              回
            </p>
            <p>
              所要時間:{" "}
              <span className="font-mono text-white">
                {formatSeconds(result.elapsedMs)}
              </span>
            </p>
          </div>
        </div>
      )}

      {/* 難易度別の所要時間テーブル */}
      {recordedDifficulties.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/[0.02]">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/10 text-xs text-slate-400">
              <tr>
                <th className="px-4 py-3">難易度(先頭ゼロ)</th>
                <th className="px-4 py-3">試行回数</th>
                <th className="px-4 py-3">所要時間</th>
                <th className="px-4 py-3">ハッシュレート</th>
              </tr>
            </thead>
            <tbody className="font-mono text-slate-200">
              {recordedDifficulties.map((d) => (
                <tr key={d} className="border-b border-white/5 last:border-0">
                  <td className="px-4 py-2.5 text-amber-300">{d}</td>
                  <td className="px-4 py-2.5">{formatNumber(stats[d].attempts)} 回</td>
                  <td className="px-4 py-2.5">{formatSeconds(stats[d].elapsedMs)}</td>
                  <td className="px-4 py-2.5">{formatHashRate(stats[d].hashRate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="px-4 py-3 text-xs text-slate-500">
            💡 難易度を 1 ずつ上げて試すと、試行回数と時間が
            <strong className="text-amber-300">おおよそ 16 倍ずつ</strong>
            跳ね上がることが分かります。
          </p>
        </div>
      )}

      <p className="text-xs text-slate-500">
        計算は Web Worker で動いているので、マイニング中でもこのページの操作は固まりません。
        次は
        <Link to="/blockchain" className="text-emerald-400 hover:underline">
          ブロックチェーン
        </Link>
        で、掘ったブロックをつなげてみましょう。
      </p>
    </section>
  );
}

// リアルタイム数値を表示する小さなカード。
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2.5">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-0.5 truncate font-mono text-sm text-slate-100">{value}</p>
    </div>
  );
}
