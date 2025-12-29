import { Link, useNavigate } from 'react-router-dom'
import { useGameState } from '../app/GameContext.tsx'

function HomePage() {
  const navigate = useNavigate()
  const { persistence, clearPersistence } = useGameState()
  const canResume = persistence.status === 'ok'
  const hasSchemaMismatch = persistence.status === 'mismatch'

  return (
    <div className="page">
      <header className="page-header">
        <p className="eyebrow">/</p>
        <h1>ホーム</h1>
        <p className="lede">ここからセットアップやテーブル画面に移動できます。</p>
      </header>

      <section className="info-card">
        <h2>ナビゲーション</h2>
        <p>保存データがある場合は続きから再開できます。</p>
        <div className="cta-row">
          {canResume && (
            <button type="button" className="primary" onClick={() => navigate('/table')}>
              続きから
            </button>
          )}
          <Link to="/setup" className={canResume ? 'ghost' : 'primary'}>
            セットアップへ
          </Link>
          <Link to="/table" className="ghost">
            テーブルへ
          </Link>
        </div>
      </section>

      {hasSchemaMismatch && (
        <section className="info-card">
          <h2>保存データのバージョンが異なります</h2>
          <p>
            以前のバージョンで保存されたデータは復元できません。クリアして新しいゲームを開始してください。
          </p>
          <div className="cta-row">
            <button type="button" className="ghost" onClick={clearPersistence}>
              保存データをクリア
            </button>
          </div>
        </section>
      )}
    </div>
  )
}

export default HomePage
