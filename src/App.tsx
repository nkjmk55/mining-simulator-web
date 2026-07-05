import { Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { HomePage } from "./pages/HomePage";
import { HashPage } from "./pages/HashPage";
import { MiningPage } from "./pages/MiningPage";
import { BlockchainPage } from "./pages/BlockchainPage";
import { GlossaryPage } from "./pages/GlossaryPage";
import { NotFoundPage } from "./pages/NotFoundPage";

// ルーティング定義。
// Layout(共通ヘッダー/フッター)の中に、パスごとのページを差し込む。
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="hash" element={<HashPage />} />
        <Route path="mining" element={<MiningPage />} />
        <Route path="blockchain" element={<BlockchainPage />} />
        <Route path="glossary" element={<GlossaryPage />} />
        {/* 未定義のパスは 404 ページへ */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
