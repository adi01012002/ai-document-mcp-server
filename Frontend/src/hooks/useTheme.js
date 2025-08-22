import { useState, useEffect } from 'react'

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('chatbot-theme')
    if (savedTheme && ['light', 'dark', 'auto'].includes(savedTheme)) {
      return savedTheme
    }
    return 'auto'
  })

  const [systemTheme, setSystemTheme] = useState(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleChange = (e) => {
      setSystemTheme(e.matches ? 'dark' : 'light')
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  useEffect(() => {
    localStorage.setItem('chatbot-theme', theme)
    
    const root = document.documentElement
    const effectiveTheme = theme === 'auto' ? systemTheme : theme
    
    root.setAttribute('data-theme', effectiveTheme)
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', effectiveTheme === 'dark' ? '#1a1a2e' : '#667eea')
    } else {
      const meta = document.createElement('meta')
      meta.name = 'theme-color'
      meta.content = effectiveTheme === 'dark' ? '#1a1a2e' : '#667eea'
      document.head.appendChild(meta)
    }
  }, [theme, systemTheme])

  const toggleTheme = () => {
    const themes = ['light', 'dark', 'auto']
    const currentIndex = themes.indexOf(theme)
    const nextIndex = (currentIndex + 1) % themes.length
    setTheme(themes[nextIndex])
  }

  const effectiveTheme = theme === 'auto' ? systemTheme : theme

  return { theme: effectiveTheme, themeMode: theme, toggleTheme }
}