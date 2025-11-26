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
  const [selectedTrack, setSelectedTrack] = useState<'frontend' | 'backend' | 'data' | 'ml'>(
    'frontend',
  )
  const [selectedLanguage, setSelectedLanguage] = useState('typescript')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isInterviewMode, setIsInterviewMode] = useState(false)

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
    if (!isAuthenticated) {
      alert('Сначала войди или зарегистрируйся')
      return
    }
    setIsStarting(true)
    setSelectedLevel(opts.level)
    setSelectedTrack(opts.track)
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
        setIsInterviewMode(true)
      } else {
        alert('Не удалось создать сессию')
      }
    } catch (e) {
      alert((e as Error).message)
    } finally {
      setIsStarting(false)
    }
  }

  useEffect(() => {
    if (isInterviewMode) {
      document.getElementById('interview-workspace')?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [isInterviewMode])

  return (
    <div className="app-shell">
      <ShellHeader theme={theme} onToggleTheme={toggleTheme} sessionId={sessionId} />

      <section className="overview">
        <div className="overview-card">
          <p className="eyebrow">Статус</p>
          <h3>{sessionId ? `Сессия #${sessionId}` : 'Сессия не запущена'}</h3>
          <p className="muted">Перед стартом авторизуйся, затем выбери трек/уровень/язык.</p>
        </div>
        <div className="overview-card">
          <p className="eyebrow">Настройки интервью</p>
          <h3>{selectedTrack.toUpperCase()} · {selectedLevel.toUpperCase()} · {selectedLanguage}</h3>
          <p className="muted">
            {isAuthenticated ? 'Выбери направление и стартуй' : 'Сначала авторизация'}
          </p>
        </div>
        <div className="overview-card">
          <p className="eyebrow">Тема</p>
          <h3>{theme === 'light' ? 'Светлая' : 'Тёмная'}</h3>
          <p className="muted">Переключатель доступен в шапке.</p>
        </div>
      </section>

      <main className="layout">
        <div className="column column-left">
          <AuthPanel onAuthSuccess={() => setIsAuthenticated(true)} />
          <TrackSelection onStart={handleStart} isStarting={isStarting} disabled={!isAuthenticated} />
          <ResultsPanel />
        </div>
        <div className="column column-right">
          <div className="workspace" id="interview-workspace">
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
    </div>
  )
}

export default App
