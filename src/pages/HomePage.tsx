import { Link } from "react-router-dom";

// トップページで表示する「体験ページ」カードの定義。
// step は推奨学習順(①→②→③)。
const EXPERIENCE_CARDS = [
  {
    step: "①",
    to: "/hash",
    icon: "🔑",
    title: "ハッシュ実験室",
    summary: "1文字変えるだけでハッシュが全く別物になることを体感する。",
  },
  {
    step: "②",
    to: "/mining",
    icon: "⛏️",
    title: "マイニング体験",
    summary: "条件を満たすハッシュを nonce の総当たりで探す=マイニングの本質。",
  },
  {
    step: "③",
    to: "/blockchain",
    icon: "🔗",
    title: "ブロックチェーン",
    summary: "ブロックの連結と、改ざんすると鎖全体が壊れる仕組みを体感する。",
  },
];

export function HomePage() {
  return (
    <div className="space-y-12">
      {/* ヒーローセクション:サイトの目的を短く伝える */}
      <section className="text-center">
        <p className="font-mono text-sm text-emerald-400">Proof of Work を体感する</p>
        <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
          マイニングを「座学」ではなく
          <br className="hidden sm:block" />
          <span className="text-emerald-300">手を動かして</span>理解する
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-slate-300">
          ハッシュ関数・ナンス探し・ブロックチェーンを、ブラウザ上で実際にさわりながら学ぶ学習用サイトです。
          難しい数式は使わず、まずは「動かして感じる」ことを大切にしています。
        </p>
        <div className="mt-6">
          <Link
            to="/hash"
            className="inline-block rounded-lg bg-emerald-500 px-6 py-3 font-semibold text-slate-950 transition-colors hover:bg-emerald-400"
          >
            ① ハッシュ実験室からはじめる →
          </Link>
        </div>
      </section>

      {/* 3つの体験ページへのカード型リンク */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-white">3つの体験ページ</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {EXPERIENCE_CARDS.map((card) => (
            <Link
              key={card.to}
              to={card.to}
              className="group flex flex-col rounded-xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-emerald-400/40 hover:bg-white/[0.06]"
            >
              <div className="flex items-center gap-2 text-2xl">
                <span aria-hidden="true">{card.icon}</span>
                <span className="font-mono text-sm text-emerald-400">
                  {card.step}
                </span>
              </div>
              <h3 className="mt-3 font-semibold text-white group-hover:text-emerald-300">
                {card.title}
              </h3>
              <p className="mt-2 flex-1 text-sm text-slate-400">{card.summary}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* 推奨学習順序の案内 */}
      <section className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
        <h2 className="mb-3 text-lg font-semibold text-white">おすすめの学習順序</h2>
        <ol className="space-y-2 text-sm text-slate-300">
          <li>
            <span className="font-mono text-emerald-400">①</span>{" "}
            <strong className="text-white">ハッシュ実験室</strong> —
            まずハッシュ関数の「性質」を体で覚える。
          </li>
          <li>
            <span className="font-mono text-emerald-400">②</span>{" "}
            <strong className="text-white">マイニング体験</strong> —
            そのハッシュを使った「ナンス探し」がマイニングだと知る。
          </li>
          <li>
            <span className="font-mono text-emerald-400">③</span>{" "}
            <strong className="text-white">ブロックチェーン</strong> —
            ブロックをつなげ、改ざん耐性の意味を理解する。
          </li>
        </ol>
        <p className="mt-4 text-xs text-slate-500">
          わからない言葉が出てきたら、いつでも
          <Link to="/glossary" className="text-emerald-400 hover:underline">
            用語集
          </Link>
          で確認できます。
        </p>
      </section>
    </div>
  );
}
