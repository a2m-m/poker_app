import { Link } from 'react-router-dom'

function SetupPage() {
  return (
    <div className="page">
      <header className="page-header">
        <p className="eyebrow">/setup</p>
        <h1>ゲームセットアップ</h1>
        <p className="lede">
          プレイヤー人数やブラインドを確認するための準備ページです。
        </p>
      </header>

      <section className="info-card">
        <h2>次のステップ</h2>
        <ol className="step-list">
          <li>プレイヤー情報を入力（後続タスクで実装）</li>
          <li>ブラインドとテーブル名を決める</li>
          <li>テーブル画面に進んでハンドを開始</li>
        </ol>
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
