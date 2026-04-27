import './TopBar.css'

export const TopBar = ({ title }) => (
  <header className="top-bar">
    <div className="top-bar-left">
      <span className="breadcrumb-label">Planta Central</span>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="2" aria-hidden="true">
        <polyline points="9 18 15 12 9 6"></polyline>
      </svg>
      <span className="breadcrumb-current">{title}</span>
    </div>
  </header>
)
