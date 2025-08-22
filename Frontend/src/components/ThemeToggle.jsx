import './ThemeToggle.css'

function ThemeToggle({ theme, onToggle }) {
  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return '☀️'
      case 'dark':
        return '🌙'
      case 'auto':
        return '🌓'
      default:
        return '🌓'
    }
  }

  const getThemeLabel = () => {
    switch (theme) {
      case 'light':
        return 'Light'
      case 'dark':
        return 'Dark'
      case 'auto':
        return 'Auto'
      default:
        return 'Auto'
    }
  }

  return (
    <button 
      className="theme-toggle"
      onClick={onToggle}
      title={`Current theme: ${getThemeLabel()}. Click to switch.`}
      aria-label={`Switch theme. Current: ${getThemeLabel()}`}
    >
      <span className="theme-icon">{getThemeIcon()}</span>
      <span className="theme-label">{getThemeLabel()}</span>
    </button>
  )
}

export default ThemeToggle