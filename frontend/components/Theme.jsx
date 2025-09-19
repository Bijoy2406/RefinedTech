import { useState, useEffect, createContext, useContext } from 'react'
import '../css/Theme.css'

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
      {children}
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

// Theme Aware Logo Component
export function ThemeLogo({ lightSrc, darkSrc, alt, className = '' }) {
  const { theme } = useTheme()

  return (
    <img 
      src={theme === 'dark' ? darkSrc : lightSrc}
      alt={alt}
      className={`theme-logo ${className}`}
    />
  )
}

export default ThemeProvider

//hi
//hi
//hi
//hi
//hi
//hi
