function StatusCard({ title, value, description, icon }) {
  return (
    <div className="stat bg-base-200 shadow-lg rounded-box border border-base-300 hover:shadow-xl transition-shadow">
      <div className="stat-figure text-primary text-3xl">
        {icon}
      </div>
      <div className="stat-title text-base-content/70">{title}</div>
      <div className="stat-value text-primary">{value}</div>
      <div className="stat-desc text-base-content/50">{description}</div>
    </div>
  )
}

export default StatusCard