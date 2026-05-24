import { useState } from 'react'
import FrameworksPage from './pages/FrameworksPage'
import GamePage from './pages/GamePage'
import CasesPage from './pages/CasesPage'
import MathPage from './pages/MathPage'
import ProgressPage from './pages/ProgressPage'
import InfoPage from './pages/InfoPage'
import { T } from './theme'

// Nav: Frameworks · Math · HOME (center, elevated) · Cases · Game
const TABS = [
  { id: 'frameworks', label: 'Frameworks', icon: 'menu_book' },
  { id: 'math',       label: 'Math',       icon: 'calculate'  },
  { id: 'home',       label: 'Home',       icon: 'home'       },
  { id: 'cases',      label: 'Cases',      icon: 'work'       },
  { id: 'game',       label: 'Game',       icon: 'psychology' },
]

function trackPage(tabId) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'page_view', {
      page_title: tabId.charAt(0).toUpperCase() + tabId.slice(1),
      page_location: window.location.href,
      page_path: '/' + tabId,
    })
  }
}

function NavIcon({ name, filled = false, size = 22 }) {
  return (
    <span
      className="material-symbols-outlined"
      style={{
        fontSize: size,
        fontVariationSettings: filled ? "'FILL' 1, 'wght' 500" : "'FILL' 0, 'wght' 400",
        lineHeight: 1,
      }}
    >
      {name}
    </span>
  )
}

function App() {
  const [activeTab, setActiveTab] = useState('home')
  const [showInfo, setShowInfo]   = useState(false)

  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
    trackPage(tabId)
  }

  const renderPage = () => {
    switch (activeTab) {
      case 'frameworks': return <FrameworksPage />
      case 'game':       return <GamePage />
      case 'cases':      return <CasesPage />
      case 'math':       return <MathPage />
      case 'home':       return <ProgressPage onNavigate={handleTabChange} />
      default:           return <ProgressPage onNavigate={handleTabChange} />
    }
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: T.bg,
      backgroundImage: T.mesh,
      fontFamily: T.fontBody,
      color: T.text,
    }}>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header style={{
        flexShrink: 0,
        padding: '12px 20px 10px',
        borderBottom: `1px solid ${T.border}`,
        background: 'rgba(252,248,255,0.96)',
      }}>
        <div style={{
          maxWidth: 520, margin: '0 auto',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          {/* Wordmark */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 20, color: T.secondary, fontVariationSettings: "'FILL' 1" }}
            >
              bolt
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              <span style={{
                fontFamily: T.fontDisplay,
                fontSize: 20, fontWeight: 800,
                color: T.primary,
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
              }}>
                MBAce
              </span>
              <span style={{
                fontFamily: T.fontBody,
                fontSize: 9, fontWeight: 500,
                color: T.textMuted,
                letterSpacing: '0.04em',
                lineHeight: 1,
              }}>
                developed by Kim McMillian
              </span>
            </div>
          </div>

          {/* Info icon */}
          <button
            onClick={() => setShowInfo(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              background: 'none', border: 'none', cursor: 'pointer',
              color: T.textMuted, padding: '4px 8px',
              borderRadius: T.r.full, fontFamily: T.fontBody,
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18, color: T.textMuted }}>info</span>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Info
            </span>
          </button>
        </div>
      </header>

      {/* ── Page content ───────────────────────────────────────────────── */}
      <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {renderPage()}
      </main>

      {/* ── Bottom nav ─────────────────────────────────────────────────── */}
      <nav style={{
        flexShrink: 0,
        borderTop: `1px solid ${T.border}`,
        background: 'rgba(252,248,255,0.97)',
        boxShadow: T.shadow.nav,
      }}>
        <div style={{
          display: 'flex',
          maxWidth: 520, margin: '0 auto',
          padding: '6px 8px 10px',
          alignItems: 'flex-end',
        }}>
          {TABS.map(tab => {
            const isActive = activeTab === tab.id
            const isHome   = tab.id === 'home'

            if (isHome) {
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className="bouncy"
                  style={{
                    flex: 1,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                    padding: '10px 8px 8px',
                    border: 'none', cursor: 'pointer',
                    background: isActive ? T.secondaryContainer : T.primaryLight,
                    borderRadius: T.r.full,
                    color: isActive ? T.onSecondary : T.primary,
                    transform: 'translateY(0px)',
                    boxShadow: isActive ? T.shadow.pink : T.shadow.sm,
                    transition: 'all 0.2s ease',
                    marginLeft: 4, marginRight: 4,
                  }}
                >
                  <NavIcon name={tab.icon} filled={isActive} size={22} />
                  <span style={{
                    fontSize: 10, fontWeight: 700,
                    letterSpacing: '0.06em', textTransform: 'uppercase',
                  }}>
                    {tab.label}
                  </span>
                </button>
              )
            }

            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                style={{
                  flex: 1,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                  padding: '8px 4px 4px',
                  border: 'none', background: 'transparent',
                  color: isActive ? T.primary : T.textMuted,
                  cursor: 'pointer', transition: 'color 0.15s',
                  fontFamily: T.fontBody,
                }}
              >
                <NavIcon name={tab.icon} filled={isActive} size={22} />
                <span style={{
                  fontSize: 10,
                  fontWeight: isActive ? 700 : 500,
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                }}>
                  {tab.label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>

      {/* ── Info slide-up panel ─────────────────────────────────────────── */}
      {showInfo && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(27,27,35,0.55)',
            display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
          }}
          onClick={() => setShowInfo(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: T.bg,
              backgroundImage: T.mesh,
              borderRadius: `${T.r.xl}px ${T.r.xl}px 0 0`,
              maxHeight: '90vh', overflowY: 'auto',
              boxShadow: '0 -8px 40px rgba(70,72,212,0.18)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 14 }}>
              <div style={{ width: 40, height: 4, borderRadius: 9999, background: T.border }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '8px 16px 0' }}>
              <button
                onClick={() => setShowInfo(false)}
                style={{
                  background: T.surfaceContainer, border: 'none', cursor: 'pointer',
                  color: T.textSub, fontSize: 12, fontWeight: 700,
                  fontFamily: T.fontBody, padding: '6px 14px',
                  borderRadius: T.r.full, letterSpacing: '0.05em',
                }}
              >
                ✕ Close
              </button>
            </div>
            <InfoPage />
          </div>
        </div>
      )}
    </div>
  )
}

export default App
