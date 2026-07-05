import { Link } from "react-router-dom";

// 定義されていない URL にアクセスしたときに表示するページ。
export function NotFoundPage() {
  return (
    <div className="mx-auto max-w-md text-center">
      <p className="font-mono text-5xl font-bold text-emerald-400">404</p>
      <h1 className="mt-4 text-xl font-semibold text-white">
        ページが見つかりません
      </h1>
      <p className="mt-2 text-sm text-slate-400">
        お探しのページは存在しないか、移動した可能性があります。
      </p>
      <Link
        to="/"
        className="mt-6 inline-block rounded-lg bg-emerald-500 px-5 py-2.5 font-semibold text-slate-950 transition-colors hover:bg-emerald-400"
      >
        ホームに戻る
      </Link>
    </div>
  );
}
