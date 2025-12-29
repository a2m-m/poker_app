import { Link } from 'react-router-dom'

function HomePage() {
  return (
    <div className="page">
      <header className="page-header">
        <p className="eyebrow">/</p>
        <h1>ホーム</h1>
        <p className="lede">ここからセットアップやテーブル画面に移動できます。</p>
      </header>

      <section className="info-card">
        <h2>ナビゲーション</h2>
        <p>各ページへのプレースホルダーリンクです。</p>
        <div className="cta-row">
          <Link to="/setup" className="primary">
            セットアップへ
          </Link>
          <Link to="/table" className="ghost">
            テーブルへ
          </Link>
        </div>
      </section>
    </div>
  )
}

export default HomePage
