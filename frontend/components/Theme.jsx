import { useState, useEffect, createContext, useContext } from 'react'
import '../css/theme.css'

// Create Theme Context
const ThemeContext = createContext()

// Theme Provider Component
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light')

  useEffect(() => {
    // Load theme from localStorage on mount
    const storedTheme = localStorage.getItem('rt_theme') || 'light'
    setTheme(storedTheme)
    applyTheme(storedTheme)
  }, [])

  const applyTheme = (themeName) => {
    document.body.className = themeName === 'dark' ? 'dark-mode' : ''
    
    // Add smooth transition class to body
    if (!document.body.classList.contains('theme-transition-container')) {
      document.body.classList.add('theme-transition-container')
    }
  }

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('rt_theme', newTheme)
    applyTheme(newTheme)
  }

  const setThemeMode = (themeName) => {
    setTheme(themeName)
    localStorage.setItem('rt_theme', themeName)
    applyTheme(themeName)
  }

  const value = {
    theme,
    toggleTheme,
    setThemeMode,
    isDark: theme === 'dark',
    isLight: theme === 'light'
  }

  return (
    <ThemeContext.Provider value={value}>
      <div className="theme-transition-container">
        {children}
      </div>
    </ThemeContext.Provider>
  )
}

// Custom hook to use theme
export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

// Theme Toggle Button Component
export function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme()

  return (
    <button 
      onClick={toggleTheme} 
      className={`theme-toggle ${className}`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  )
}

// Advanced Theme Toggle with Slider
export function AdvancedThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme()

  return (
    <div 
      className={`advanced-theme-toggle ${theme} ${className}`}
      onClick={toggleTheme}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          toggleTheme()
        }
      }}
    >
      <div className="theme-toggle-slider">
        {theme === 'light' ? '☀️' : '🌙'}
      </div>
    </div>
  )
}

// Theme Switcher with Label
export function ThemeSwitcher({ showLabel = true, className = '' }) {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className={`theme-switcher ${className}`}>
      {showLabel && (
        <span className="theme-switcher-label">
          {theme === 'light' ? '☀️ Light' : '🌙 Dark'}
        </span>
      )}
      <ThemeToggle />
    </div>
  )
}

// Theme Status Indicator
export function ThemeStatus({ className = '' }) {
  const { theme } = useTheme()

  return (
    <div className={`theme-status ${className}`}>
      <div className="theme-status-dot"></div>
      <span>{theme === 'light' ? 'Light Mode' : 'Dark Mode'}</span>
    </div>
  )
}

// Theme Aware Logo Component
export function ThemeLogo({ lightSrc, darkSrc, alt, className = '' }) {
  const { theme } = useTheme()
  const [isLoading, setIsLoading] = useState(true)
  const [currentSrc, setCurrentSrc] = useState(theme === 'dark' ? darkSrc : lightSrc)

  useEffect(() => {
    // Add a small delay to create smooth transition effect
    setIsLoading(true)
    const timer = setTimeout(() => {
      setCurrentSrc(theme === 'dark' ? darkSrc : lightSrc)
      setIsLoading(false)
    }, 150)

    return () => clearTimeout(timer)
  }, [theme, lightSrc, darkSrc])

  return (
    <div className="theme-logo-container" style={{ position: 'relative' }}>
      <img 
        src={currentSrc}
        alt={alt}
        className={`theme-logo ${className} ${isLoading ? 'loading' : ''}`}
        style={{ 
          opacity: isLoading ? 0.7 : 1,
          transition: 'opacity 0.3s ease'
        }}
      />
    </div>
  )
}

export default ThemeProvider

// Export all components for easy importing
export {
  ThemeProvider,
  useTheme,
  ThemeToggle,
  AdvancedThemeToggle,
  ThemeSwitcher,
  ThemeStatus,
  ThemeLogo
}