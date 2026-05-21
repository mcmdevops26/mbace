import { useState } from 'react'
import FrameworksPage from './pages/FrameworksPage'
import GamePage from './pages/GamePage'
import CasesPage from './pages/CasesPage'
import MathPage from './pages/MathPage'
import ProgressPage from './pages/ProgressPage'

const TABS = [
  { id: 'frameworks', label: 'Frameworks', icon: '📚' },
  { id: 'game',       label: 'Game',       icon: '🃏' },
  { id: 'cases',      label: 'Cases',      icon: '💼' },
  { id: 'math',       label: 'Math',       icon: '🧮' },
  { id: 'progress',   label: 'Progress',   icon: '📈' },
]

function App() {
  const [activeTab, setActiveTab] = useState('frameworks')

  const renderPage = () => {
    switch (activeTab) {
      case 'frameworks': return <FrameworksPage />
      case 'game':       return <GamePage />
      case 'cases':      return <CasesPage />
      case 'math':       return <MathPage />
      case 'progress':   return <ProgressPage />
      default:           return <FrameworksPage />
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0f172a' }}>
      {/* Header */}
      <header style={{ flexShrink: 0, padding: '12px 16px 10px', borderBottom: '1px solid #1e293b' }}>
        <div style={{ fontSize: 17, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.3px', lineHeight: 1.2 }}>
          MBAce <span style={{ fontWeight: 400, color: '#94a3b8' }}>Marketing Case Prep</span>
        </div>
        <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>
          created by Kim McMillian · Cornell '28
        </div>
      </header>

      {/* Page content */}
      <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {renderPage()}
      </main>

      {/* Bottom nav */}
      <nav style={{ flexShrink: 0, borderTop: '1px solid #1e293b', background: '#0f172a' }}>
        <div style={{ display: 'flex' }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                padding: '8px 0 10px',
                fontSize: 11,
                fontWeight: 500,
                border: 'none',
                background: 'transparent',
                color: activeTab === tab.id ? '#60a5fa' : '#475569',
                cursor: 'pointer',
                transition: 'color 0.15s',
              }}
            >
              <span style={{ fontSize: 20, lineHeight: 1 }}>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}

export default App
