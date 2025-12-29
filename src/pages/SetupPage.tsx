import { Link } from 'react-router-dom'

function SetupPage() {
  return (
    <div className="page">
      <header className="page-header">
        <p className="eyebrow">/setup</p>
        <h1>セットアップ</h1>
        <p className="lede">ゲーム開始前の設定をここで行う予定です。</p>
      </header>

      <section className="info-card">
        <h2>プレースホルダー</h2>
        <p>後続タスクでプレイヤー情報やブラインド設定を追加します。</p>
      </section>

      <div className="cta-row">
        <Link to="/" className="ghost">
          ホームに戻る
        </Link>
        <Link to="/table" className="primary">
          テーブルへ進む
        </Link>
      </div>
    </div>
  )
}

export default SetupPage
