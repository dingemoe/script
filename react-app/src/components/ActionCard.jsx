function ActionCard({ counter, actions }) {
  return (
    <div className="card bg-base-200 shadow-xl border border-base-300">
      <div className="card-body">
        <h2 className="card-title text-primary">
          🎮 Interactive Actions
          <div className="badge badge-secondary">{counter}</div>
        </h2>
        
        <div className="space-y-4">
          {/* Primary Action */}
          <button 
            className="btn btn-primary btn-lg w-full glass-effect"
            onClick={actions.handleClick}
          >
            🎯 Click Me! ({counter})
          </button>
          
          {/* Secondary Actions Grid */}
          <div className="grid grid-cols-2 gap-2">
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => actions.setMessage('Secondary button clicked! 🎨')}
            >
              🎨 Style
            </button>
            
            <button 
              className="btn btn-accent btn-sm"
              onClick={actions.showTime}
            >
              ⏰ Time
            </button>
            
            <button 
              className="btn btn-success btn-sm"
              onClick={actions.resetCounter}
            >
              🔄 Reset
            </button>
            
            <button 
              className="btn btn-warning btn-sm"
              onClick={() => actions.setMessage('Warning: System hot! 🔥')}
            >
              🔥 Alert
            </button>
          </div>
          
          {/* Progress indicator */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{Math.min(counter * 10, 100)}%</span>
            </div>
            <progress 
              className="progress progress-primary w-full" 
              value={Math.min(counter * 10, 100)} 
              max="100"
            ></progress>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ActionCard