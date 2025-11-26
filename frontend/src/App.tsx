import { useEffect, useState } from 'react'
import './App.css'
import { AntiCheatPanel } from './components/AntiCheatPanel'
import { AuthPanel } from './components/AuthPanel'
import { ChatPanel } from './components/ChatPanel'
import { IdeShell } from './components/IdeShell'
import { ResultsPanel } from './components/ResultsPanel'
import { ShellHeader } from './components/ShellHeader'
import { TaskPane } from './components/TaskPane'
import { TrackSelection } from './components/TrackSelection'
import { startInterview } from './shared/api/interview'

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [sessionId, setSessionId] = useState<number | null>(null)
  const [isStarting, setIsStarting] = useState(false)
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null)
  const [selectedLevel, setSelectedLevel] = useState<'junior' | 'middle' | 'senior'>('junior')
  const [selectedLanguage, setSelectedLanguage] = useState('typescript')
  const [mode, setMode] = useState<'home' | 'interview'>('home')
  const [selectedTrack, setSelectedTrack] = useState<'frontend' | 'backend' | 'data' | 'ml'>(
    'frontend',
  )

  useEffect(() => {
    document.body.setAttribute('data-theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  const handleStart = async (opts: {
    track: 'frontend' | 'backend' | 'data' | 'ml'
    level: 'junior' | 'middle' | 'senior'
    language: 'typescript' | 'python' | 'go'
  }) => {
    setIsStarting(true)
    setSelectedLevel(opts.level)
    setSelectedLanguage(opts.language)
    try {
      const res = await startInterview({
        track: opts.track,
        level: opts.level,
        preferred_language: opts.language,
        user_id: 'frontend-user',
        locale: 'ru',
      })
      if (res.success && res.session_id) {
        setSessionId(res.session_id)
        setCurrentTaskId(null)
        setMode('interview')
      } else {
        alert('Не удалось создать сессию')
      }
    } catch (e) {
      alert((e as Error).message)
    } finally {
      setIsStarting(false)
    }
  }

  const handleEnd = () => {
    setSessionId(null)
    setCurrentTaskId(null)
    setMode('home')
  }

  const homeView = (
    <>
      <section className="hero panel">
        <div>
          <p className="eyebrow">Авто-интервью на Scibox</p>
          <h1>Платформа для тех собеседований</h1>
          <p className="muted">
            Авторизация → выбор направления и уровня → интервью с чат-LLM, задачей и раннером.
            Результат сохраняется в «Мои результаты».
          </p>
          <div className="hero-actions">
            <button
              className="cta"
              type="button"
              onClick={() =>
                handleStart({
                  track: selectedTrack,
                  level: selectedLevel,
                  language: selectedLanguage as 'typescript' | 'python' | 'go',
                })
              }
              disabled={isStarting}
            >
              {isStarting ? 'Запуск...' : 'Начать интервью'}
            </button>
            <button className="ghost-btn" type="button" onClick={() => setMode('home')}>
              Остаться в меню
            </button>
          </div>
        </div>
      </section>

      <main className="layout">
        <div className="column">
          <AuthPanel />
          <TrackSelection
            onStart={handleStart}
            isStarting={isStarting}
            onSelectTrack={(track) => setSelectedTrack(track)}
            onSelectLevel={(lvl) => setSelectedLevel(lvl)}
            onSelectLanguage={(lang) => setSelectedLanguage(lang)}
          />
        </div>
        <div className="column">
          <ResultsPanel />
        </div>
      </main>
    </>
  )

  const interviewView = (
    <>
      <section className="overview">
        <div className="overview-card">
          <p className="eyebrow">Сессия</p>
          <h3>{sessionId ? `#${sessionId}` : 'Нет сессии'}</h3>
          <p className="muted">
            {selectedTrack} · {selectedLevel} · {selectedLanguage}
          </p>
        </div>
        <div className="overview-card">
          <p className="eyebrow">Навигация</p>
          <div className="hero-actions">
            <button className="ghost-btn" type="button" onClick={() => setMode('home')}>
              В меню
            </button>
            <button className="ghost-btn" type="button" onClick={handleEnd}>
              Завершить сессию
            </button>
          </div>
        </div>
      </section>

      <main className="layout">
        <div className="column">
          <TrackSelection
            onStart={handleStart}
            isStarting={isStarting}
            onSelectTrack={(track) => setSelectedTrack(track)}
            onSelectLevel={(lvl) => setSelectedLevel(lvl)}
            onSelectLanguage={(lang) => setSelectedLanguage(lang)}
          />
          <ResultsPanel />
        </div>
        <div className="column column-right">
          <div className="workspace">
            <ChatPanel sessionId={sessionId} />
            <TaskPane
              sessionId={sessionId}
              level={selectedLevel}
              language={selectedLanguage}
              onTaskChange={(taskId) => setCurrentTaskId(taskId)}
            />
            <IdeShell sessionId={sessionId} taskId={currentTaskId} language={selectedLanguage} />
            <AntiCheatPanel sessionId={sessionId} />
          </div>
        </div>
      </main>
    </>
  )

  return (
    <div className="app-shell">
      <ShellHeader theme={theme} onToggleTheme={toggleTheme} sessionId={sessionId} />
      {mode === 'home' ? homeView : interviewView}
    </div>
  )
}

export default App
