import { useState, useEffect } from 'react'

function PerformanceCard({ uptime }) {
  const [memoryUsage, setMemoryUsage] = useState({ used: 0, total: 100 })
  const [cpuLoad, setCpuLoad] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate memory usage
      const used = Math.floor(Math.random() * 50) + 30
      setMemoryUsage({ used, total: 100 })
      
      // Simulate CPU load
      setCpuLoad(Math.floor(Math.random() * 30) + 10)
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const formatUptime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ${hours % 24}h`
    if (hours > 0) return `${hours}h ${minutes % 60}m`
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`
    return `${seconds}s`
  }

  const getPerformanceColor = (value, thresholds = [50, 80]) => {
    if (value < thresholds[0]) return 'text-success'
    if (value < thresholds[1]) return 'text-warning'
    return 'text-error'
  }

  return (
    <div className="card bg-base-200 shadow-xl border border-base-300">
      <div className="card-body">
        <h2 className="card-title text-primary">
          📊 Performance Monitor
          <div className="badge badge-accent">Live</div>
        </h2>
        
        <div className="space-y-4">
          {/* Uptime */}
          <div className="flex justify-between items-center">
            <span className="font-medium">⏱️ Uptime</span>
            <span className="text-success font-mono">{formatUptime(uptime)}</span>
          </div>
          
          {/* Memory Usage */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">💾 Memory</span>
              <span className={`font-mono ${getPerformanceColor(memoryUsage.used)}`}>
                {memoryUsage.used}MB / {memoryUsage.total}MB
              </span>
            </div>
            <progress 
              className={`progress w-full ${
                memoryUsage.used < 50 ? 'progress-success' : 
                memoryUsage.used < 80 ? 'progress-warning' : 'progress-error'
              }`}
              value={memoryUsage.used} 
              max={memoryUsage.total}
            ></progress>
          </div>
          
          {/* CPU Load */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">🔥 CPU Load</span>
              <span className={`font-mono ${getPerformanceColor(cpuLoad)}`}>
                {cpuLoad}%
              </span>
            </div>
            <progress 
              className={`progress w-full ${
                cpuLoad < 50 ? 'progress-success' : 
                cpuLoad < 80 ? 'progress-warning' : 'progress-error'
              }`}
              value={cpuLoad} 
              max="100"
            ></progress>
          </div>
          
          {/* System Status Indicators */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
              <span className="text-xs">React</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
              <span className="text-xs">DaisyUI</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
              <span className="text-xs">Vite</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PerformanceCard