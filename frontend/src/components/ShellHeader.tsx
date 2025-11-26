type Props = {
  theme: 'light' | 'dark'
  onToggleTheme: () => void
  onShowAuth: () => void
  onShowResults: () => void
  isAuthenticated: boolean
  onLogout: () => void
  onGoHome: () => void
}

export function ShellHeader({
  theme,
  onToggleTheme,
  onShowAuth,
  onShowResults,
  isAuthenticated,
  onLogout,
  onGoHome,
}: Props) {
  return (
    <header className="shell-header">
      <button className="brand" type="button" onClick={onGoHome}>
        <div className="brand-title">Genesis Interview</div>
      </button>
      <div className="meta">
        <button className="ghost-btn" type="button" onClick={onToggleTheme}>
          {theme === 'light' ? 'Тёмная тема' : 'Светлая тема'}
        </button>
        <button className="ghost-btn" type="button" onClick={onShowResults}>
          Мои результаты
        </button>
        {isAuthenticated ? (
          <button className="ghost-btn" type="button" onClick={onLogout}>
            Выйти
          </button>
        ) : (
          <button className="ghost-btn" type="button" onClick={onShowAuth}>
            Аккаунт
          </button>
        )}
      </div>
    </header>
  )
}
