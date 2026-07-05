import { NavLink, Outlet, Link } from "react-router-dom";

// ヘッダーに並べるナビゲーション項目。
// 学習の推奨順(ハッシュ → マイニング → ブロックチェーン)に沿って並べる。
const NAV_ITEMS = [
  { to: "/", label: "ホーム", end: true },
  { to: "/hash", label: "ハッシュ実験室" },
  { to: "/mining", label: "マイニング体験" },
  { to: "/blockchain", label: "ブロックチェーン" },
  { to: "/glossary", label: "用語集" },
];

// 全ページ共通のレイアウト。
// ヘッダー(ナビ)とフッターで挟み、中央の <Outlet /> に各ページを表示する。
export function Layout() {
  return (
    <div className="flex min-h-full flex-col">
      <Header />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-white/10 bg-[#0a0e14]/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
        {/* サイトロゴ(クリックでトップへ) */}
        <Link to="/" className="flex items-center gap-2 font-mono text-lg font-bold text-white">
          <span aria-hidden="true">⛏️</span>
          <span>Mining&nbsp;Sim</span>
        </Link>

        {/* ページ間を移動するためのナビゲーション */}
        <nav className="flex flex-wrap items-center gap-1 text-sm">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                [
                  "rounded-md px-3 py-1.5 transition-colors",
                  isActive
                    ? "bg-emerald-500/15 text-emerald-300"
                    : "text-slate-300 hover:bg-white/5 hover:text-white",
                ].join(" ")
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/10 px-4 py-6 text-center text-xs text-slate-500 sm:px-6">
      <p>
        マイニング疑似体験サイト — Proof of Work
        を手を動かして学ぶための学習用プロジェクト。
      </p>
      <p className="mt-1">
        すべての計算はブラウザ内で完結します(サーバー・DB なし)。
      </p>
    </footer>
  );
}
