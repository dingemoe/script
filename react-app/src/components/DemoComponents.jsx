import { useState } from 'react'

function DemoComponents() {
  const [selectedTab, setSelectedTab] = useState('alerts')
  const [modalOpen, setModalOpen] = useState(false)
  const [toastVisible, setToastVisible] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const showToast = () => {
    setToastVisible(true)
    setTimeout(() => setToastVisible(false), 3000)
  }

  return (
    <div className="card bg-base-200 shadow-xl border border-base-300">
      <div className="card-body">
        <h2 className="card-title text-primary">
          🧩 DaisyUI Component Showcase
          <div className="badge badge-info">Interactive</div>
        </h2>
        
        {/* Tab Navigation */}
        <div className="tabs tabs-boxed bg-base-300 mb-4">
          <a 
            className={`tab ${selectedTab === 'alerts' ? 'tab-active' : ''}`}
            onClick={() => setSelectedTab('alerts')}
          >
            🚨 Alerts
          </a>
          <a 
            className={`tab ${selectedTab === 'forms' ? 'tab-active' : ''}`}
            onClick={() => setSelectedTab('forms')}
          >
            📝 Forms
          </a>
          <a 
            className={`tab ${selectedTab === 'data' ? 'tab-active' : ''}`}
            onClick={() => setSelectedTab('data')}
          >
            📊 Data
          </a>
          <a 
            className={`tab ${selectedTab === 'navigation' ? 'tab-active' : ''}`}
            onClick={() => setSelectedTab('navigation')}
          >
            🧭 Navigation
          </a>
        </div>

        {/* Tab Content */}
        <div className="space-y-4">
          {selectedTab === 'alerts' && (
            <div className="space-y-3">
              <div className="alert alert-info">
                <svg className="stroke-current shrink-0 w-6 h-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span>New software update available!</span>
              </div>
              
              <div className="alert alert-success">
                <svg className="stroke-current shrink-0 w-6 h-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span>Your purchase has been confirmed!</span>
              </div>
              
              <div className="alert alert-warning">
                <svg className="stroke-current shrink-0 w-6 h-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.89-.833-2.664 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
                <span>Warning: Invalid email address!</span>
              </div>
              
              <div className="alert alert-error">
                <svg className="stroke-current shrink-0 w-6 h-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span>Error! Task failed successfully.</span>
              </div>
            </div>
          )}

          {selectedTab === 'forms' && (
            <div className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Username</span>
                </label>
                <input type="text" placeholder="Enter username" className="input input-bordered" />
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Password</span>
                </label>
                <input type="password" placeholder="Enter password" className="input input-bordered" />
              </div>
              
              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text">Remember me</span>
                  <input type="checkbox" className="checkbox checkbox-primary" />
                </label>
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Theme preference</span>
                </label>
                <select className="select select-bordered">
                  <option>Dark</option>
                  <option>Light</option>
                  <option>Synthwave</option>
                  <option>Cyberpunk</option>
                </select>
              </div>
              
              <div className="flex gap-2">
                <button className="btn btn-primary flex-1">Login</button>
                <button className="btn btn-outline">Register</button>
              </div>
            </div>
          )}

          {selectedTab === 'data' && (
            <div className="space-y-4">
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Job</th>
                      <th>Company</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Cy Ganderton</td>
                      <td>Quality Control Specialist</td>
                      <td>Littel, Schaden and Vandervort</td>
                      <td><div className="badge badge-success">Active</div></td>
                    </tr>
                    <tr>
                      <td>Hart Hagerty</td>
                      <td>Desktop Support Technician</td>
                      <td>Zemlak, Daniel and Leannon</td>
                      <td><div className="badge badge-warning">Pending</div></td>
                    </tr>
                    <tr>
                      <td>Brice Swyre</td>
                      <td>Tax Accountant</td>
                      <td>Carroll Group</td>
                      <td><div className="badge badge-error">Inactive</div></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              {/* Radial Progress */}
              <div className="flex justify-center space-x-4">
                <div className="radial-progress text-primary" style={{"--value":70}} role="progressbar">70%</div>
                <div className="radial-progress text-secondary" style={{"--value":85}} role="progressbar">85%</div>
                <div className="radial-progress text-accent" style={{"--value":90}} role="progressbar">90%</div>
              </div>
            </div>
          )}

          {selectedTab === 'navigation' && (
            <div className="space-y-4">
              {/* Breadcrumbs */}
              <div className="text-sm breadcrumbs">
                <ul>
                  <li><a>Home</a></li>
                  <li><a>Documents</a></li>
                  <li>Add Document</li>
                </ul>
              </div>
              
              {/* Pagination */}
              <div className="btn-group justify-center">
                <button className="btn btn-sm">«</button>
                <button className="btn btn-sm">1</button>
                <button className="btn btn-sm btn-active">2</button>
                <button className="btn btn-sm">3</button>
                <button className="btn btn-sm">»</button>
              </div>
              
              {/* Steps */}
              <ul className="steps steps-vertical lg:steps-horizontal w-full">
                <li className="step step-primary">Register</li>
                <li className="step step-primary">Choose plan</li>
                <li className="step">Purchase</li>
                <li className="step">Receive Product</li>
              </ul>
              
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 justify-center">
                <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
                  Open Modal
                </button>
                <button className="btn btn-secondary" onClick={showToast}>
                  Show Toast
                </button>
                <button className="btn btn-accent" onClick={() => setDrawerOpen(true)}>
                  Open Drawer
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Hello! 👋</h3>
            <p className="py-4">This is a DaisyUI modal component working perfectly!</p>
            <div className="modal-action">
              <button className="btn" onClick={() => setModalOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastVisible && (
        <div className="toast toast-top toast-end">
          <div className="alert alert-info">
            <span>🎉 Toast notification appeared!</span>
          </div>
        </div>
      )}

      {/* Drawer */}
      <div className={`drawer ${drawerOpen ? 'drawer-open' : ''}`}>
        <input id="drawer-toggle" type="checkbox" className="drawer-toggle" checked={drawerOpen} readOnly />
        <div className="drawer-side">
          <label className="drawer-overlay" onClick={() => setDrawerOpen(false)}></label>
          <aside className="w-80 min-h-full bg-base-200 text-base-content">
            <div className="p-4">
              <h2 className="text-xl font-bold mb-4">Drawer Menu</h2>
              <ul className="menu">
                <li><a>🏠 Home</a></li>
                <li><a>📊 Dashboard</a></li>
                <li><a>⚙️ Settings</a></li>
                <li><a>📧 Contact</a></li>
              </ul>
              <button className="btn btn-primary mt-4" onClick={() => setDrawerOpen(false)}>
                Close Drawer
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

export default DemoComponents