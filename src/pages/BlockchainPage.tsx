import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { sha256Hex, meetsDifficulty } from "../lib/crypto";
import { Miner, type MineProgress } from "../lib/minerClient";
import { HashDisplay } from "../components/HashDisplay";
import { formatNumber } from "../lib/format";

// このページのチェーンの難易度は固定にして、
// 「連結」と「改ざん耐性」の理解に集中してもらう。
const CHAIN_DIFFICULTY = 3;

// 1 つのブロックが持つ情報。
// hash は「その時点の各フィールドから計算した値」なので保持せず、
// 表示のたびに再計算する(改ざんすると即座に変わることを見せるため)。
type Block = {
  index: number; // ブロック番号(0 = ジェネシス)
  data: string; // 取引メモなどの自由テキスト
  nonce: number; // マイニングで見つけた nonce
  prevHash: string; // 前のブロックのハッシュ(先頭は "0" 固定)
};

// ブロックのハッシュ計算に使う文字列を組み立てる。
// nonce を末尾に置くことで、Miner(data + nonce を計算する)と辻褄を合わせる。
function blockData(index: number, data: string, prevHash: string): string {
  return `${index}|${data}|${prevHash}|`;
}
function blockPreimage(b: Block): string {
  return blockData(b.index, b.data, b.prevHash) + b.nonce;
}

export function BlockchainPage() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  // 各ブロックの現在のハッシュ(blocks から非同期に計算する)
  const [hashes, setHashes] = useState<string[]>([]);
  const [newData, setNewData] = useState("Alice → Bob : 10 coins");
  // 実行中の処理("genesis" | "add" | "repair" | null)
  const [busy, setBusy] = useState<null | "genesis" | "add" | "repair">(null);
  const [progress, setProgress] = useState<MineProgress | null>(null);

  const minerRef = useRef<Miner | null>(null);
  function getMiner(): Miner {
    if (!minerRef.current) minerRef.current = new Miner();
    return minerRef.current;
  }

  // 最初のブロック(ジェネシスブロック)を用意する。
  useEffect(() => {
    let active = true;
    (async () => {
      setBusy("genesis");
      const prevHash = "0";
      const r = await getMiner().mine(
        blockData(0, "ジェネシスブロック", prevHash),
        CHAIN_DIFFICULTY,
        0,
        (p) => active && setProgress(p)
      );
      if (!active) return;
      setBlocks([{ index: 0, data: "ジェネシスブロック", nonce: r.nonce, prevHash }]);
      setBusy(null);
      setProgress(null);
    })();
    return () => {
      active = false;
      minerRef.current?.terminate();
      minerRef.current = null;
    };
  }, []);

  // blocks が変わるたびに、全ブロックのハッシュを計算し直す。
  useEffect(() => {
    let active = true;
    Promise.all(blocks.map((b) => sha256Hex(blockPreimage(b)))).then((hs) => {
      if (active) setHashes(hs);
    });
    return () => {
      active = false;
    };
  }, [blocks]);

  // 各ブロックが有効かどうかを判定する。
  // 有効 = 「自分のハッシュが難易度を満たす」かつ
  //        「前ハッシュが実際の前ブロックのハッシュと一致」かつ
  //        「前のブロックも有効」。1 つでも壊れると、それ以降すべて無効になる。
  const validity: boolean[] = [];
  for (let i = 0; i < blocks.length; i++) {
    const hash = hashes[i];
    if (hash === undefined) {
      validity.push(true); // 計算待ちのあいだは判定を保留
      continue;
    }
    const ownOk = meetsDifficulty(hash, CHAIN_DIFFICULTY);
    const expectedPrev = i === 0 ? "0" : hashes[i - 1];
    const linkOk = blocks[i].prevHash === expectedPrev;
    const prevOk = i === 0 ? true : validity[i - 1];
    validity.push(ownOk && linkOk && prevOk);
  }

  const chainBroken = validity.some((v) => !v);
  const isBusy = busy !== null;

  // 新しいブロックを追加する(データ入力 → マイニング → 連結)。
  async function addBlock() {
    if (blocks.length === 0) return;
    setBusy("add");
    setProgress(null);
    const index = blocks.length;
    const prevHash = hashes[hashes.length - 1];
    const r = await getMiner().mine(
      blockData(index, newData, prevHash),
      CHAIN_DIFFICULTY,
      0,
      (p) => setProgress(p)
    );
    setBlocks((bs) => [...bs, { index, data: newData, nonce: r.nonce, prevHash }]);
    setBusy(null);
    setProgress(null);
  }

  // ブロックのデータを書き換える(改ざん実験)。
  function editBlockData(i: number, value: string) {
    setBlocks((bs) => bs.map((b, idx) => (idx === i ? { ...b, data: value } : b)));
  }

  // 無効になったブロックを先頭から順に掘り直して、チェーンを修復する。
  async function repairChain() {
    setBusy("repair");
    setProgress(null);
    const current = [...blocks];
    let prevHash = "0";
    for (let i = 0; i < current.length; i++) {
      const b = current[i];
      const ownHash = await sha256Hex(blockData(b.index, b.data, prevHash) + b.nonce);
      const ok = b.prevHash === prevHash && meetsDifficulty(ownHash, CHAIN_DIFFICULTY);
      if (ok) {
        // このブロックは既に有効。次へ。
        prevHash = ownHash;
        continue;
      }
      // 正しい前ハッシュで nonce を探し直す(=掘り直し)
      const r = await getMiner().mine(
        blockData(b.index, b.data, prevHash),
        CHAIN_DIFFICULTY,
        0,
        (p) => setProgress(p)
      );
      current[i] = { ...b, prevHash, nonce: r.nonce };
      setBlocks([...current]); // 途中経過を画面に反映
      prevHash = r.hash;
    }
    setBusy(null);
    setProgress(null);
  }

  return (
    <div className="space-y-8">
      <header>
        <p className="font-mono text-sm text-emerald-400">③ ブロックチェーン</p>
        <h1 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
          ブロックの連結と改ざん耐性を体感する
        </h1>
        <p className="mt-3 text-sm text-slate-300">
          各ブロックは「前のブロックのハッシュ」を含んでいます。だから鎖(チェーン)のように繋がります。
          <br />
          試しに<strong className="text-red-300">過去のブロックのデータを書き換えて</strong>
          みてください。そのブロックと、それ以降の全ブロックが一斉に
          <strong className="text-red-300">無効(赤)</strong>
          になります。
        </p>
      </header>

      {/* 新しいブロックの追加 */}
      <section className="flex flex-wrap items-end gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-5">
        <div className="flex-1 min-w-[200px]">
          <label
            htmlFor="new-block-data"
            className="mb-2 block text-sm font-medium text-slate-200"
          >
            新しいブロックのデータ
          </label>
          <input
            id="new-block-data"
            type="text"
            value={newData}
            onChange={(e) => setNewData(e.target.value)}
            disabled={isBusy}
            className="w-full rounded-lg border border-white/15 bg-black/40 px-4 py-2.5 font-mono text-sm text-slate-100 outline-none focus:border-emerald-400/60 disabled:opacity-50"
          />
        </div>
        <button
          type="button"
          onClick={addBlock}
          disabled={isBusy || blocks.length === 0}
          className="rounded-lg bg-emerald-500 px-5 py-2.5 font-semibold text-slate-950 transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy === "add" ? "マイニング中…" : "＋ ブロックを追加"}
        </button>
      </section>

      {/* 修復が必要なときのバナー */}
      {chainBroken && !isBusy && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-400/40 bg-red-500/10 p-4">
          <p className="text-sm text-red-200">
            ⚠️ チェーンが壊れています。改ざんされた箇所以降がすべて無効です。
          </p>
          <button
            type="button"
            onClick={repairChain}
            className="rounded-lg border border-amber-400/50 px-4 py-2 text-sm font-medium text-amber-200 transition-colors hover:bg-amber-500/10"
          >
            🔨 再マイニングで修復
          </button>
        </div>
      )}

      {/* マイニング中の進捗表示 */}
      {isBusy && (
        <div className="rounded-xl border border-white/10 bg-black/30 p-4 text-sm">
          <p className="text-slate-300">
            {busy === "genesis" && "ジェネシスブロックを生成中…"}
            {busy === "add" && "新しいブロックをマイニング中…"}
            {busy === "repair" && "チェーンを再マイニング中…"}
          </p>
          {progress && (
            <p className="mt-1 font-mono text-xs text-slate-500">
              nonce: {formatNumber(progress.nonce)} / 試行 {formatNumber(progress.attempts)} 回
            </p>
          )}
        </div>
      )}

      {/* ブロック一覧 */}
      <section className="space-y-3">
        {blocks.map((block, i) => (
          <BlockCard
            key={block.index}
            block={block}
            hash={hashes[i] ?? ""}
            valid={validity[i]}
            editable={!isBusy}
            onEditData={(v) => editBlockData(i, v)}
          />
        ))}
        {blocks.length === 0 && !isBusy && (
          <p className="text-sm text-slate-500">ブロックがありません。</p>
        )}
      </section>

      <p className="text-xs text-slate-500">
        💡 一度でも改ざんすると、正しい状態に戻すには壊れたブロックをすべて掘り直す必要があります
        (=改ざんには莫大な計算のやり直しが必要)。ページを再読み込みすると初期状態に戻ります。
        用語は
        <Link to="/glossary" className="text-emerald-400 hover:underline">
          用語集
        </Link>
        へ。
      </p>
    </div>
  );
}

// 1 つのブロックを表すカード。有効なら緑寄り、無効なら赤で表示する。
function BlockCard({
  block,
  hash,
  valid,
  editable,
  onEditData,
}: {
  block: Block;
  hash: string;
  valid: boolean;
  editable: boolean;
  onEditData: (value: string) => void;
}) {
  return (
    <div
      className={[
        "rounded-xl border p-5 transition-colors",
        valid
          ? "border-emerald-400/30 bg-emerald-500/[0.04]"
          : "border-red-400/50 bg-red-500/10",
      ].join(" ")}
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-mono text-sm font-bold text-white">
          {block.index === 0 ? "ブロック #0(ジェネシス)" : `ブロック #${block.index}`}
        </h3>
        <span
          className={[
            "rounded-full px-2.5 py-0.5 text-xs font-medium",
            valid
              ? "bg-emerald-500/20 text-emerald-300"
              : "bg-red-500/20 text-red-300",
          ].join(" ")}
        >
          {valid ? "有効 ✓" : "無効 ✗"}
        </span>
      </div>

      {/* データ(編集可能=改ざん実験) */}
      <label className="mb-1 block text-xs text-slate-500">
        データ(書き換えると改ざんになります)
      </label>
      <input
        type="text"
        value={block.data}
        onChange={(e) => onEditData(e.target.value)}
        disabled={!editable}
        className={[
          "mb-3 w-full rounded-lg border bg-black/40 px-3 py-2 font-mono text-sm text-slate-100 outline-none disabled:opacity-60",
          valid
            ? "border-white/15 focus:border-emerald-400/60"
            : "border-red-400/40 focus:border-red-400/70",
        ].join(" ")}
      />

      <dl className="space-y-1.5 text-xs">
        <Row label="nonce">
          <span className="font-mono text-slate-300">{formatNumber(block.nonce)}</span>
        </Row>
        <Row label="前ブロックのハッシュ">
          <span className="break-all font-mono text-slate-500">{block.prevHash}</span>
        </Row>
        <Row label="このブロックのハッシュ">
          <HashDisplay hash={hash} success={valid} className="text-xs" />
        </Row>
      </dl>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 sm:grid-cols-[180px_1fr]">
      <dt className="text-slate-500">{label}</dt>
      <dd className="min-w-0">{children}</dd>
    </div>
  );
}
