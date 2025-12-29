import { Link } from 'react-router-dom'
import Drawer from '../components/Drawer.tsx'

const quickLinks = [
  { to: '/setup', label: 'セットアップへ' },
  { to: '/table', label: 'テーブル画面へ' },
]

function HomePage() {
  return (
    <div className="page">
      <header className="page-header">
        <p className="eyebrow">Texas Hold'em Dealer Assist</p>
        <h1>キャッシュゲーム用パス＆プレイ</h1>
        <p className="lede">
          09_tech_spec_architecture.md に沿ったディレクトリ構成で、HashRouter
          ベースの React + TypeScript + Vite プロジェクトを立ち上げました。
        </p>
        <div className="cta-row">
          {quickLinks.map((link) => (
            <Link key={link.to} to={link.to} className="primary">
              {link.label}
            </Link>
          ))}
        </div>
      </header>

      <section className="card-grid">
        <article className="info-card">
          <h2>アーキテクチャの骨組み</h2>
          <p>
            /src 配下に app / pages / components / domain / persistence / utils
            を用意し、UI と ドメインロジックを切り離す準備を整えました。
          </p>
        </article>
        <article className="info-card">
          <h2>Lint / Format</h2>
          <p>
            ESLint（flat config）と Prettier
            をスクリプトから実行できます。typecheck も npm scripts
            に追加済みです。
          </p>
          <code className="code-inline">npm run lint</code> ·{' '}
          <code className="code-inline">npm run format</code>
        </article>
      </section>

      <Drawer open title="現在の進行状況">
        <ul className="drawer-list">
          <li>React + TypeScript テンプレートを導入</li>
          <li>HashRouter によるルーティングを準備</li>
          <li>
            テーブル画面の TopBar / PlayerGrid / ActionPanel
            プレースホルダーを配置
          </li>
        </ul>
      </Drawer>
    </div>
  )
}

export default HomePage
