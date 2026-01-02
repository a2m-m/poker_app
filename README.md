# Poker Dealer Assist (React + TypeScript)

Vite と HashRouter で構成したテキサスホールデム向けのディーラー支援アプリの土台です。
`09_tech_spec_architecture.md` で定義されたディレクトリ構成を反映し、ESLint/Prettier の
スクリプトも用意しています。

## セットアップ

```bash
npm install
npm run dev
```

## 主なスクリプト

- `npm run dev`: 開発サーバーを起動します。
- `npm run build`: TypeScript をビルドし、Vite の production ビルドを生成します。
- `npm run typecheck`: 型チェックのみを実行します。
- `npm run lint` / `npm run lint:fix`: ESLint のチェックと自動修正を実行します。
- `npm run format`: Prettier でコード整形を行います。
- `npm run build:pages`: GitHub Pages 用に `GITHUB_REPOSITORY` を設定してビルドします。
- `npm run deploy`: `gh-pages` ブランチへ静的ファイルを公開します（ローカル確認用）。

## ディレクトリ概要

- `src/app`: ルーターやアプリシェル。
- `src/pages`: `/`, `/setup`, `/table` のページコンポーネント。
- `src/components`: TopBar や ActionPanel など UI コンポーネント。
- `src/domain`: ゲームロジック用の型・reducer・ルール関数の雛形。
- `src/persistence`: localStorage 永続化のプレースホルダー。
- `src/utils`: ID 生成や clamp などのユーティリティ。

HashRouter を使ったルーティングと、テーブル画面のプレースホルダーコンポーネントを用意して
いるので、ドメインロジックを組み込みながら MVP を進められます。
