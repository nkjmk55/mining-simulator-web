import { leadingZeroCount } from "../lib/crypto";

// ハッシュ値を等幅フォントで表示し、先頭に並ぶゼロを強調するコンポーネント。
// マイニングでは「先頭にゼロがいくつ並ぶか」が重要なので、そこを目立たせる。
type HashDisplayProps = {
  hash: string;
  // 条件を満たしているか。true なら全体を緑、false/未指定なら通常色。
  success?: boolean;
  className?: string;
};

export function HashDisplay({ hash, success = false, className = "" }: HashDisplayProps) {
  if (!hash) {
    return <span className="font-mono text-slate-600">—</span>;
  }

  const zeros = leadingZeroCount(hash);
  const head = hash.slice(0, zeros); // 先頭のゼロ部分
  const rest = hash.slice(zeros); // それ以降

  return (
    <span
      className={[
        "break-all font-mono",
        success ? "text-emerald-300" : "text-slate-200",
        className,
      ].join(" ")}
    >
      {/* 先頭ゼロは黄色で強調(=難易度を満たしている桁) */}
      <span className="font-bold text-amber-300">{head}</span>
      {rest}
    </span>
  );
}
