import { Link } from 'react-router-dom'

function TablePage() {
  return (
    <div className="page">
      <header className="page-header">
        <p className="eyebrow">/table</p>
        <h1>テーブル</h1>
        <p className="lede">ゲーム進行用の画面をここに実装する予定です。</p>
      </header>

      <section className="info-card">
        <h2>プレースホルダー</h2>
        <p>ドメインロジックと連携した UI を後続タスクで追加します。</p>
      </section>

      <div className="cta-row">
        <Link to="/" className="ghost">
          ホームに戻る
        </Link>
        <Link to="/setup" className="primary">
          セットアップへ
        </Link>
      </div>
    </div>
  )
}

export default TablePage
