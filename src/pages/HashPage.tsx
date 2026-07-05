import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { sha256Hex } from "../lib/crypto";

// 入力とそのハッシュを 1 セットにした型。
type Snapshot = { text: string; hash: string };

// ハッシュ実験室(/hash)
// テキストを入力すると、リアルタイムで SHA-256 ハッシュを計算して表示する。
// 「直前の入力」のハッシュと並べ、変化した文字をハイライトすることで、
// 「1 文字変えただけで全く別物になる」ことを視覚的に体感してもらう。
export function HashPage() {
  // 入力欄の文字列(初期値はサンプルとして "Blockchain")
  const [text, setText] = useState("Blockchain");

  // 現在のハッシュと、直前(1 つ前)のハッシュをまとめて保持する。
  const [state, setState] = useState<{
    current: Snapshot;
    previous: Snapshot | null;
  }>({
    current: { text: "", hash: "" },
    previous: null,
  });

  // 最新の入力値を覚えておくための箱。
  // 高速でタイピングしたときに、古い計算結果で上書きしてしまうのを防ぐ。
  const latestTextRef = useRef(text);

  // text が変わるたびに、そのハッシュを計算する。
  useEffect(() => {
    latestTextRef.current = text;
    let active = true; // このエフェクトがまだ有効かどうか

    sha256Hex(text).then((hash) => {
      // 計算が終わる頃には別の文字が入力済みかもしれないので、その場合は破棄
      if (!active || latestTextRef.current !== text) return;

      setState((prev) => {
        // 同じ入力なら何もしない
        if (prev.current.text === text) return prev;
        return {
          current: { text, hash },
          // 直前の current を previous に送る(まだハッシュが無い初回は null のまま)
          previous: prev.current.hash ? prev.current : prev.previous,
        };
      });
    });

    return () => {
      active = false;
    };
  }, [text]);

  const { current, previous } = state;

  // 現在のハッシュと直前のハッシュで、何文字が変化したかを数える。
  const changedCount =
    previous != null
      ? [...current.hash].filter((ch, i) => previous.hash[i] !== ch).length
      : 0;

  return (
    <div className="space-y-8">
      {/* 見出しと導入 */}
      <header>
        <p className="font-mono text-sm text-emerald-400">① ハッシュ実験室</p>
        <h1 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
          ハッシュ関数の「性質」を体感する
        </h1>
        <p className="mt-3 text-sm text-slate-300">
          下の欄に文字を入力すると、その文字列の
          <strong className="text-white"> SHA-256 ハッシュ</strong>{" "}
          がリアルタイムに計算されます。
          <br />
          <strong className="text-emerald-300">1 文字だけ</strong>
          変えてみて、ハッシュがどれだけ変化するかを確かめてください。
        </p>
      </header>

      {/* 入力欄 */}
      <section>
        <label
          htmlFor="hash-input"
          className="mb-2 block text-sm font-medium text-slate-200"
        >
          入力テキスト(自由に編集できます)
        </label>
        <textarea
          id="hash-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          placeholder="ここに文字を入力…"
          className="w-full resize-y rounded-lg border border-white/15 bg-black/40 px-4 py-3 font-mono text-sm text-slate-100 outline-none transition-colors focus:border-emerald-400/60"
        />
        <p className="mt-1 text-xs text-slate-500">
          文字数: {text.length}(空欄でもハッシュは計算されます)
        </p>
      </section>

      {/* 現在のハッシュ */}
      <section className="rounded-xl border border-emerald-400/30 bg-emerald-500/[0.04] p-5">
        <div className="mb-2 flex items-baseline justify-between gap-2">
          <h2 className="text-sm font-semibold text-emerald-300">
            現在のハッシュ(SHA-256)
          </h2>
          <span className="font-mono text-xs text-slate-500">64 文字</span>
        </div>
        <HashText hash={current.hash} compareTo={previous?.hash ?? null} />
      </section>

      {/* 直前のハッシュとの比較 */}
      {previous ? (
        <section className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
          <h2 className="mb-2 text-sm font-semibold text-slate-300">
            直前の入力(
            <span className="font-mono text-slate-400">
              「{previous.text || "(空欄)"}」
            </span>
            )のハッシュ
          </h2>
          <HashText hash={previous.hash} compareTo={null} muted />
          <p className="mt-4 rounded-lg bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200">
            変化した文字:{" "}
            <strong className="font-mono text-emerald-300">
              64 文字中 {changedCount} 文字
            </strong>
            {changedCount > 0 && (
              <>
                {" "}
                (約 {Math.round((changedCount / 64) * 100)}%)
              </>
            )}
            が変わりました。
          </p>
        </section>
      ) : (
        <p className="text-sm text-slate-500">
          もう一度 1 文字だけ書き換えると、直前のハッシュとの比較が表示されます。
        </p>
      )}

      {/* 常設の解説 */}
      <aside className="rounded-xl border border-sky-400/20 bg-sky-500/[0.04] p-5 text-sm leading-relaxed text-slate-300">
        <h2 className="mb-2 font-semibold text-sky-300">
          💡 ハッシュ関数ってなに?
        </h2>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            ハッシュは、データから作られる
            <strong className="text-white">「指紋」</strong>
            のようなものです。同じ入力からは必ず同じハッシュが得られます。
          </li>
          <li>
            入力がたった 1 文字違うだけで、出力は
            <strong className="text-white">まったく別物</strong>
            になります(上のハイライトで確認できます)。
          </li>
          <li>
            ハッシュから元の入力を
            <strong className="text-white">逆算することはできません</strong>
            (一方向の変換)。
          </li>
          <li>
            入力がどんなに長くても短くても、出力は必ず 64 文字(256 ビット)です。
          </li>
        </ul>
        <p className="mt-3 text-xs text-slate-500">
          用語の詳しい説明は
          <Link to="/glossary" className="text-emerald-400 hover:underline">
            用語集
          </Link>
          にまとめます(Phase 6 で作成)。次は
          <Link to="/mining" className="text-emerald-400 hover:underline">
            マイニング体験
          </Link>
          で、この性質を使った「ナンス探し」を体感します。
        </p>
      </aside>
    </div>
  );
}

// ハッシュ文字列を等幅フォントで表示するコンポーネント。
// compareTo が渡された場合、その文字列と異なる位置の文字をハイライトする。
// muted=true のときは全体を少し暗く表示する(=直前のハッシュ用)。
function HashText({
  hash,
  compareTo,
  muted = false,
}: {
  hash: string;
  compareTo: string | null;
  muted?: boolean;
}) {
  if (!hash) {
    return <p className="font-mono text-sm text-slate-600">計算中…</p>;
  }

  return (
    <p
      className={[
        "break-all font-mono text-sm leading-relaxed sm:text-base",
        muted ? "text-slate-500" : "text-slate-100",
      ].join(" ")}
    >
      {[...hash].map((ch, i) => {
        // compareTo と違う文字ならハイライト(=前回から変化した文字)
        const changed = compareTo != null && compareTo[i] !== ch;
        return (
          <span
            key={i}
            className={
              changed
                ? "rounded-sm bg-emerald-500/25 font-bold text-emerald-300"
                : ""
            }
          >
            {ch}
          </span>
        );
      })}
    </p>
  );
}
