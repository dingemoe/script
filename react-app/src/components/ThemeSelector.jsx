import { useState, useEffect } from 'react'

const themes = [
  { name: 'dark', label: '🌙 Dark', primary: '#661AE6' },
  { name: 'synthwave', label: '🌆 Synthwave', primary: '#E779C1' },
  { name: 'cyberpunk', label: '🤖 Cyberpunk', primary: '#FFFF00' },
  { name: 'halloween', label: '🎃 Halloween', primary: '#F28C18' },
  { name: 'forest', label: '🌲 Forest', primary: '#1EB854' },
  { name: 'aqua', label: '🌊 Aqua', primary: '#09ECDB' },
  { name: 'luxury', label: '✨ Luxury', primary: '#FFFFFF' },
  { name: 'dracula', label: '🧛 Dracula', primary: '#FF79C6' },
  { name: 'night', label: '🌃 Night', primary: '#38BDF8' },
  { name: 'coffee', label: '☕ Coffee', primary: '#DB924B' }
]

function ThemeSelector({ currentTheme, onThemeChange }) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme)
  }, [currentTheme])

  const handleThemeChange = (themeName) => {
    onThemeChange(themeName)
    setIsOpen(false)
  }

  const currentThemeInfo = themes.find(t => t.name === currentTheme) || themes[0]

  return (
    <div className="dropdown dropdown-end">
      <div 
        tabIndex={0} 
        role="button" 
        className="btn btn-ghost m-1"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-lg">{currentThemeInfo.label}</span>
        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      
      {isOpen && (
        <ul 
          tabIndex={0} 
          className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52 max-h-96 overflow-y-auto"
        >
          {themes.map((theme) => (
            <li key={theme.name}>
              <a 
                onClick={() => handleThemeChange(theme.name)}
                className={`justify-between ${theme.name === currentTheme ? 'active' : ''}`}
              >
                <span>{theme.label}</span>
                {theme.name === currentTheme && (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default ThemeSelector