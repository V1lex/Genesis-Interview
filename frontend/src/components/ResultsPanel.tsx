type Result = {
  id: string
  track: string
  level: string
  status: 'passed' | 'failed' | 'in-progress'
  score: number
  date: string
}

const mockResults: Result[] = [
  { id: 'INT-031', track: 'Frontend', level: 'Middle', status: 'passed', score: 82, date: '2025-01-22' },
  { id: 'INT-024', track: 'Backend', level: 'Junior', status: 'in-progress', score: 0, date: '2025-01-18' },
  { id: 'INT-019', track: 'ML', level: 'Senior', status: 'failed', score: 56, date: '2025-01-12' },
]

export function ResultsPanel() {
  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <p className="eyebrow">История</p>
          <h2>Мои результаты</h2>
          <p className="muted">Фильтры по треку/уровню, последние попытки.</p>
        </div>
        <div className="pill pill-ghost">Mock data</div>
      </div>
      <div className="results-grid">
        {mockResults.map((res) => (
          <div key={res.id} className="result-card">
            <div className="result-top">
              <span className="pill pill-ghost">#{res.id}</span>
              <span className={`status status-${res.status}`}>
                {res.status === 'passed'
                  ? 'успех'
                  : res.status === 'in-progress'
                    ? 'в работе'
                    : 'не пройдено'}
              </span>
            </div>
            <div className="result-info">
              <div>{res.track}</div>
              <div className="muted">
                {res.level} · {res.date}
              </div>
            </div>
            <div className="score">{res.score ? `${res.score} / 100` : '—'}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
