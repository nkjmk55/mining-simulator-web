import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Vite の設定ファイル。
// - React プラグイン: JSX/TSX を変換する
// - Tailwind CSS プラグイン(v4): CSS 内の @import "tailwindcss" を有効にする
export default defineConfig({
  plugins: [react(), tailwindcss()],
});
