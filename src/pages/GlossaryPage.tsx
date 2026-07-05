import { Link } from "react-router-dom";

// サイト内に登場する用語を、初学者向けに 1〜3 文で解説する。
const TERMS: { term: string; reading?: string; desc: string }[] = [
  {
    term: "ハッシュ",
    reading: "hash",
    desc: "データから作られる、短い「指紋」のような値。同じ入力からは必ず同じハッシュが得られ、入力が少しでも違うと全く別の値になります。",
  },
  {
    term: "ハッシュ関数",
    reading: "hash function",
    desc: "データを受け取ってハッシュを計算する仕組み。一方向で、ハッシュから元のデータを逆算することはできません。",
  },
  {
    term: "SHA-256",
    desc: "広く使われているハッシュ関数の一つ。どんな入力でも 256 ビット(16進数で 64 文字)のハッシュを出力します。ビットコインでも使われています。",
  },
  {
    term: "nonce",
    reading: "ナンス",
    desc: "ハッシュの条件を満たすために、総当たりで変えていく使い捨ての数値。「nonce をいくつにすれば当たりが出るか」を探す作業がマイニングです。",
  },
  {
    term: "難易度",
    reading: "difficulty",
    desc: "当たりの出にくさ。このサイトでは「ハッシュの先頭に並ぶゼロの個数」で表します。ゼロが 1 個増えるごとに、必要な計算量が約 16 倍になります。",
  },
  {
    term: "マイニング",
    reading: "mining",
    desc: "条件を満たすハッシュになる nonce を、総当たりで探し出す作業のこと。見つけた人が新しいブロックを追加できます。",
  },
  {
    term: "ハッシュレート",
    reading: "hash rate",
    desc: "1 秒あたりに計算できたハッシュの回数。マイニングの「探す速さ」を表す指標です。",
  },
  {
    term: "ブロック",
    reading: "block",
    desc: "データ・nonce・前のブロックのハッシュなどをまとめた一かたまり。これが鎖状に連なってブロックチェーンになります。",
  },
  {
    term: "ジェネシスブロック",
    reading: "genesis block",
    desc: "チェーンの一番最初のブロック。前のブロックが存在しないので、前ハッシュは「0」で固定されています。",
  },
  {
    term: "ブロックチェーン",
    reading: "blockchain",
    desc: "各ブロックが「前のブロックのハッシュ」を含むことで、鎖のように繋がったデータ構造。途中を書き換えると、それ以降が全て壊れます。",
  },
  {
    term: "改ざん耐性",
    desc: "過去のデータを書き換えにくい性質。1 ブロックを改ざんすると以降の全ブロックが無効になり、直すには全て掘り直す必要があるため、事実上とても難しくなります。",
  },
  {
    term: "PoW(Proof of Work)",
    reading: "プルーフ・オブ・ワーク",
    desc: "「たしかに計算作業(マイニング)を行った」という証明の仕組み。当たりの nonce を見つけること自体が、その証明になります。",
  },
  {
    term: "マイニング報酬",
    desc: "新しいブロックを最初に見つけた人に与えられるごほうび(実際の暗号資産では新規発行コインなど)。このサイトでは扱いませんが、マイナーが計算する動機になっています。",
  },
];

export function GlossaryPage() {
  return (
    <div className="space-y-8">
      <header>
        <p className="font-mono text-sm text-emerald-400">用語集</p>
        <h1 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
          このサイトに出てくる用語
        </h1>
        <p className="mt-3 text-sm text-slate-300">
          分からない言葉が出てきたら、ここで確認してください。まずは
          <Link to="/hash" className="text-emerald-400 hover:underline">
            ハッシュ実験室
          </Link>
          から手を動かすのがおすすめです。
        </p>
      </header>

      <dl className="space-y-3">
        {TERMS.map((t) => (
          <div
            key={t.term}
            className="rounded-xl border border-white/10 bg-white/[0.02] p-5"
          >
            <dt className="flex flex-wrap items-baseline gap-2">
              <span className="font-mono text-base font-bold text-emerald-300">
                {t.term}
              </span>
              {t.reading && (
                <span className="text-xs text-slate-500">{t.reading}</span>
              )}
            </dt>
            <dd className="mt-2 text-sm leading-relaxed text-slate-300">
              {t.desc}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
