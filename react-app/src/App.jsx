import { useState, useEffect } from 'react'
import ThemeSelector from './components/ThemeSelector'
import StatusCard from './components/StatusCard'
import ActionCard from './components/ActionCard'
import DemoComponents from './components/DemoComponents'
import PerformanceCard from './components/PerformanceCard'

function App() {
  const [counter, setCounter] = useState(0)
  const [message, setMessage] = useState('Velkommen til DevOpsChat Dark Mode! 🌙')
  const [currentTheme, setCurrentTheme] = useState('dark')
  const [uptime, setUptime] = useState(0)

  // Update uptime every second
  useEffect(() => {
    const startTime = Date.now()
    const interval = setInterval(() => {
      setUptime(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleClick = () => {
    setCounter(c => c + 1)
    setMessage(`Button clicked ${counter + 1} times! 🎉`)
  }

  const resetCounter = () => {
    setCounter(0)
    setMessage('Counter reset! 🔄')
  }

  const showTime = () => {
    const time = new Date().toLocaleTimeString()
    setMessage(`Current time: ${time} ⏰`)
  }

  const testActions = {
    handleClick,
    resetCounter,
    showTime,
    setMessage
  }

  return (
    <div className="min-h-screen bg-base-100 text-base-content">
      {/* Header with theme selector */}
      <div className="navbar bg-base-300 shadow-lg">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-primary">
            🚀 DevOpsChat React UI
          </h1>
        </div>
        <div className="flex-none">
          <ThemeSelector currentTheme={currentTheme} onThemeChange={setCurrentTheme} />
        </div>
      </div>

      <div className="container mx-auto p-6 space-y-6">
        {/* Status Message */}
        <div className="alert alert-success shadow-lg glass-effect">
          <div>
            <svg className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="font-bold">System Status</h3>
              <div className="text-xs">{message}</div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatusCard 
            title="React Version" 
            value="18.2.0" 
            description="Framework"
            icon="⚛️"
          />
          <StatusCard 
            title="Uptime" 
            value={`${uptime}s`} 
            description="Running time"
            icon="⏱️"
          />
          <StatusCard 
            title="Counter" 
            value={counter} 
            description="Button clicks"
            icon="🎯"
          />
          <StatusCard 
            title="Theme" 
            value={currentTheme} 
            description="Current theme"
            icon="🎨"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Action Card */}
          <ActionCard counter={counter} actions={testActions} />

          {/* Performance Card */}
          <PerformanceCard uptime={uptime} />

          {/* Demo Components - Full Width */}
          <div className="lg:col-span-2">
            <DemoComponents />
          </div>
        </div>

        {/* Footer */}
        <footer className="footer footer-center p-4 bg-base-300 text-base-content rounded-lg">
          <div>
            <p>🎉 DevOpsChat React UI v1.0.0 - Dark Mode Edition</p>
            <p className="text-sm opacity-70">
              Built with React 18 + DaisyUI + TailwindCSS • Theme: {currentTheme}
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default App