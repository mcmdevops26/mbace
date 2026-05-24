import { useState } from 'react'
import { useProgress } from '../hooks/useProgress'
import { FRAMEWORKS } from '../data/frameworks'
import SCENARIOS from '../data/scenarios.json'
import { track } from '../utils/analytics'
import { T } from '../theme'

const MATH_TYPE_LABELS = {
  fraction_to_decimal:     'Fractions → Decimals',
  percent_of_number:       '% of a Number',
  multiplication_shortcut: 'Multiplication Shortcuts',
  rounding_scale:          'Rounding & Scale',
  decimal_operations:      'Decimal Operations',
  profit_equation:         'Profit',
  breakeven:               'Breakeven',
  growth_rate:             'Growth Rate',
  roi:                     'ROI',
  market_sizing:           'Market Sizing',
  contribution_margin:     'Contribution Margin',
  market_share:            'Market Share',
}

const MATH_TARGET = { 1: 25, 2: 45, 3: 60 }
const LEVEL1 = ['fraction_to_decimal','percent_of_number','multiplication_shortcut','rounding_scale','decimal_operations']
const LEVEL2 = ['profit_equation','breakeven','growth_rate','roi','market_sizing','contribution_margin','market_share']
const LEVEL3 = ['weighted_average','price_volume_mix','payback_period','unit_economics','index_numbers','percentage_point','npv_estimation']

const glassCard = {
  background: 'rgba(255,255,255,0.80)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(255,255,255,0.55)',
  boxShadow: T.shadow.md,
}

function StatCard({ label, value, sub, color = T.text }) {
  return (
    <div style={{
      ...glassCard,
      borderRadius: T.r.lg, padding: '14px 16px', flex: 1,
    }}>
      <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 4, fontFamily: T.fontBody }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 800, color, fontFamily: T.fontDisplay }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2, fontFamily: T.fontBody }}>{sub}</div>}
    </div>
  )
}

function MiniBar({ value, max, color }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0
  return (
    <div style={{ background: T.surfaceContainer, borderRadius: 999, height: 8, overflow: 'hidden', marginTop: 6 }}>
      <div style={{
        height: '100%', borderRadius: 999,
        width: `${pct}%`,
        background: color,
        transition: 'width 0.4s ease',
      }} />
    </div>
  )
}

function SectionHeader({ title, emoji }) {
  return (
    <div style={{
      fontSize: 12, fontWeight: 800, color: T.primary,
      letterSpacing: 1.5, marginBottom: 10, marginTop: 6,
      fontFamily: T.fontDisplay,
    }}>
      {emoji} {title}
    </div>
  )
}

function WeakAreaRow({ label, accuracy, attempts, targetLabel, color }) {
  const accColor = accuracy >= 80 ? T.green : accuracy >= 60 ? T.amber : T.pink
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '10px 0', borderBottom: `1px solid ${T.border}`,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, color: T.text, fontWeight: 600, marginBottom: 2, fontFamily: T.fontBody }}>{label}</div>
        <div style={{ fontSize: 11, color: T.textMuted, fontFamily: T.fontBody }}>{attempts} attempts{targetLabel ? ` · ${targetLabel}` : ''}</div>
        <MiniBar value={accuracy} max={100} color={accColor} />
      </div>
      <div style={{ fontSize: 18, fontWeight: 800, color: accColor, marginLeft: 16, flexShrink: 0, fontFamily: T.fontDisplay }}>
        {accuracy}%
      </div>
    </div>
  )
}

export default function ProgressPage({ onNavigate = null }) {
  const { progress, getWeakestMathTypes, getWeakestScenarioTypes, getGameAccuracy } = useProgress()
  const [confirmReset, setConfirmReset] = useState(false)

  const handleReset = async () => {
    track('progress_reset_confirmed')
    // Clear main progress
    localStorage.removeItem('mba_prep_progress')
    // Clear all case notes
    Object.keys(localStorage)
      .filter(k => k.startsWith('mbace_note_'))
      .forEach(k => localStorage.removeItem(k))
    // Clear audio recordings from IndexedDB
    try {
      indexedDB.deleteDatabase('mbace_audio')
    } catch (_) {}
    // Reload to reset all in-memory state
    window.location.reload()
  }

  // ── Framework stats ──────────────────────────────────────────────────────
  const cardProgress = progress.frameworks.cardProgress
  const fwKnow   = FRAMEWORKS.filter(f => cardProgress[f.id] === 'know').length
  const fwUnsure = FRAMEWORKS.filter(f => cardProgress[f.id] === 'unsure').length
  const fwAgain  = FRAMEWORKS.filter(f => cardProgress[f.id] === 'again').length
  const fwRated  = fwKnow + fwUnsure + fwAgain

  // ── Case stats ───────────────────────────────────────────────────────────
  const { viewed, selfRatings } = progress.cases
  const caseRated  = Object.keys(selfRatings).length
  const caseNailed = Object.values(selfRatings).filter(r => r.overall === 3).length
  const caseStruggled = Object.values(selfRatings).filter(r => r.overall === 1).length

  // ── Math stats ───────────────────────────────────────────────────────────
  const { byType, totalProblems, streakDays: mathStreak } = progress.math
  const mathTypes = Object.entries(byType)
  const totalMathAttempts = mathTypes.reduce((sum, [, s]) => sum + s.attempts, 0)
  const totalMathCorrect  = mathTypes.reduce((sum, [, s]) => sum + s.correct, 0)
  const overallMathAcc    = totalMathAttempts > 0 ? Math.round((totalMathCorrect / totalMathAttempts) * 100) : null

  const weakMath = getWeakestMathTypes().slice(0, 4)

  // ── Game stats ───────────────────────────────────────────────────────────
  const gameAcc = getGameAccuracy()
  const weakGame = getWeakestScenarioTypes().slice(0, 3)
  const { scenariosCompleted, streakDays: gameStreak, byScenarioType } = progress.game

  // ── Best streak ──────────────────────────────────────────────────────────
  const bestStreak = Math.max(mathStreak || 0, gameStreak || 0)

  // ── CSAI averages from case ratings ─────────────────────────────────────
  const csaiKeys = ['C', 'S', 'A', 'I']
  const csaiLabels = { C: 'Communication', S: 'Structure', A: 'Analysis', I: 'Integration' }
  const csaiTotals = { C: 0, S: 0, A: 0, I: 0 }
  const ratedCases = Object.values(selfRatings).filter(r => r.csai)
  ratedCases.forEach(r => {
    csaiKeys.forEach(k => { csaiTotals[k] += r.csai[k] || 0 })
  })
  const csaiAvgs = ratedCases.length > 0
    ? csaiKeys.reduce((obj, k) => ({ ...obj, [k]: (csaiTotals[k] / ratedCases.length).toFixed(1) }), {})
    : null

  const hasAnyData = fwRated > 0 || viewed.length > 0 || totalProblems > 0 || scenariosCompleted.length > 0

  return (
    <div style={{ padding: '16px 20px 32px', maxWidth: 520, margin: '0 auto', fontFamily: T.fontBody }}>

      {/* ── Welcome Hero ── */}
      <div style={{
        position: 'relative',
        borderRadius: T.r.xl,
        background: `linear-gradient(135deg, ${T.primary} 0%, ${T.primaryContainer} 100%)`,
        padding: '28px 24px 24px',
        marginBottom: 24,
        overflow: 'hidden',
        boxShadow: T.shadow.primary,
      }}>
        {/* Decorative circles */}
        <div style={{
          position: 'absolute', top: -32, right: -32,
          width: 120, height: 120, borderRadius: '50%',
          background: 'rgba(255,255,255,0.10)', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: -20, right: 40,
          width: 72, height: 72, borderRadius: '50%',
          background: 'rgba(255,255,255,0.07)', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', top: 16, right: 80,
          width: 36, height: 36, borderRadius: '50%',
          background: 'rgba(255,255,255,0.12)', pointerEvents: 'none',
        }} />

        {/* Label */}
        <div style={{
          fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.70)',
          letterSpacing: 2, marginBottom: 8, fontFamily: T.fontBody,
          textTransform: 'uppercase',
        }}>
          Performance Dashboard
        </div>

        {/* Headline */}
        <div style={{
          fontSize: 36, fontWeight: 800, color: '#ffffff',
          fontFamily: T.fontDisplay, lineHeight: 1.1, marginBottom: 6,
        }}>
          MBAce
        </div>

        {/* Tagline */}
        <div style={{
          fontSize: 14, color: 'rgba(255,255,255,0.80)',
          fontFamily: T.fontBody, marginBottom: onNavigate ? 20 : 0,
          lineHeight: 1.5,
        }}>
          Your marketing case interview toolkit.
        </div>

        {/* Nav pills */}
        {onNavigate && (
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => onNavigate('frameworks')}
              style={{
                padding: '8px 18px', borderRadius: T.r.full,
                background: 'rgba(255,255,255,0.20)',
                border: '1px solid rgba(255,255,255,0.35)',
                color: '#ffffff', fontSize: 13, fontWeight: 700,
                cursor: 'pointer', fontFamily: T.fontBody,
                backdropFilter: 'blur(8px)',
              }}
            >
              Frameworks →
            </button>
            <button
              onClick={() => onNavigate('cases')}
              style={{
                padding: '8px 18px', borderRadius: T.r.full,
                background: 'rgba(255,255,255,0.20)',
                border: '1px solid rgba(255,255,255,0.35)',
                color: '#ffffff', fontSize: 13, fontWeight: 700,
                cursor: 'pointer', fontFamily: T.fontBody,
                backdropFilter: 'blur(8px)',
              }}
            >
              Cases →
            </button>
          </div>
        )}
      </div>

      {/* ── Empty state ── */}
      {!hasAnyData && (
        <div style={{
          ...glassCard,
          borderRadius: T.r.lg, padding: '32px 24px', textAlign: 'center', marginBottom: 16,
        }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📈</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 6, fontFamily: T.fontDisplay }}>No data yet</div>
          <div style={{ fontSize: 13, color: T.textMuted, lineHeight: 1.6, fontFamily: T.fontBody }}>
            Practice flashcards, drill math problems, and work through cases — your progress will appear here.
          </div>
        </div>
      )}

      {/* ── Streak + overview ── */}
      <SectionHeader emoji="🔥" title="OVERVIEW" />
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <StatCard label="Day streak" value={bestStreak || '—'} sub="Keep going daily" color={T.amber} />
        <StatCard label="Math solved" value={totalProblems || 0} sub={overallMathAcc != null ? `${overallMathAcc}% accuracy` : 'No data yet'} color={T.primary} />
        <StatCard label="Cases viewed" value={viewed.length} sub={`of ${SCENARIOS.length}`} color={T.green} />
      </div>

      {/* ── Frameworks ── */}
      <SectionHeader emoji="📚" title="FRAMEWORKS" />
      <div style={{ ...glassCard, borderRadius: T.r.lg, padding: '14px 16px', marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ fontSize: 13, color: T.textMuted, fontFamily: T.fontBody }}>Rated {fwRated} of {FRAMEWORKS.length}</div>
          <div style={{ display: 'flex', gap: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: T.green, fontFamily: T.fontBody }}>✅ {fwKnow}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: T.amber, fontFamily: T.fontBody }}>🤔 {fwUnsure}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: T.pink, fontFamily: T.fontBody }}>🔁 {fwAgain}</span>
          </div>
        </div>
        <MiniBar value={fwKnow} max={FRAMEWORKS.length} color={`linear-gradient(90deg, ${T.primary}, ${T.green})`} />

        {fwAgain > 0 && (
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 11, color: T.pink, fontWeight: 700, marginBottom: 6, fontFamily: T.fontBody }}>NEED REVIEW</div>
            {FRAMEWORKS.filter(f => cardProgress[f.id] === 'again').map(f => (
              <div key={f.id} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0',
                borderBottom: `1px solid ${T.border}`,
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%', background: f.color, flexShrink: 0,
                }} />
                <span style={{ fontSize: 13, color: T.text, fontFamily: T.fontBody }}>{f.name}</span>
                <span style={{ fontSize: 11, color: T.textMuted, marginLeft: 'auto', fontFamily: T.fontBody }}>{f.subtitle}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Cases ── */}
      <SectionHeader emoji="💼" title="CASES" />
      <div style={{ ...glassCard, borderRadius: T.r.lg, padding: '14px 16px', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <div style={{ flex: 1, textAlign: 'center', background: T.surfaceContainer, borderRadius: T.r.md, padding: '10px 4px' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: T.primary, fontFamily: T.fontDisplay }}>{viewed.length}</div>
            <div style={{ fontSize: 10, color: T.textMuted, fontFamily: T.fontBody }}>Viewed</div>
          </div>
          <div style={{ flex: 1, textAlign: 'center', background: T.surfaceContainer, borderRadius: T.r.md, padding: '10px 4px' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: T.amber, fontFamily: T.fontDisplay }}>{caseRated}</div>
            <div style={{ fontSize: 10, color: T.textMuted, fontFamily: T.fontBody }}>Rated</div>
          </div>
          <div style={{ flex: 1, textAlign: 'center', background: T.surfaceContainer, borderRadius: T.r.md, padding: '10px 4px' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: T.green, fontFamily: T.fontDisplay }}>{caseNailed}</div>
            <div style={{ fontSize: 10, color: T.textMuted, fontFamily: T.fontBody }}>Nailed</div>
          </div>
          <div style={{ flex: 1, textAlign: 'center', background: T.surfaceContainer, borderRadius: T.r.md, padding: '10px 4px' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: T.pink, fontFamily: T.fontDisplay }}>{caseStruggled}</div>
            <div style={{ fontSize: 10, color: T.textMuted, fontFamily: T.fontBody }}>Struggled</div>
          </div>
        </div>
        <MiniBar value={caseRated} max={SCENARIOS.length} color={T.amber} />

        {/* CSAI breakdown */}
        {csaiAvgs && (
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 700, marginBottom: 8, fontFamily: T.fontBody }}>
              CSAI AVERAGES (from {ratedCases.length} rated cases)
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {csaiKeys.map(k => {
                const avg = parseFloat(csaiAvgs[k])
                const c = avg >= 2.5 ? T.green : avg >= 1.5 ? T.amber : T.pink
                return (
                  <div key={k} style={{
                    flex: 1, background: T.surfaceContainer, borderRadius: T.r.md, padding: '8px 4px', textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: c, fontFamily: T.fontDisplay }}>{csaiAvgs[k]} / 3</div>
                    <div style={{ fontSize: 10, color: T.textMuted, fontFamily: T.fontBody }}>{k}</div>
                    <div style={{ fontSize: 9, color: T.textMuted, fontFamily: T.fontBody }}>{csaiLabels[k]}</div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Math ── */}
      <SectionHeader emoji="🧮" title="MATH DRILLS" />
      <div style={{ ...glassCard, borderRadius: T.r.lg, padding: '14px 16px', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          <div style={{ flex: 1, textAlign: 'center', background: T.surfaceContainer, borderRadius: T.r.md, padding: '10px 4px' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: T.primary, fontFamily: T.fontDisplay }}>{totalProblems || 0}</div>
            <div style={{ fontSize: 10, color: T.textMuted, fontFamily: T.fontBody }}>Problems</div>
          </div>
          <div style={{ flex: 1, textAlign: 'center', background: T.surfaceContainer, borderRadius: T.r.md, padding: '10px 4px' }}>
            <div style={{ fontSize: 20, fontWeight: 800, fontFamily: T.fontDisplay, color: overallMathAcc >= 80 ? T.green : overallMathAcc >= 60 ? T.amber : T.pink }}>
              {overallMathAcc != null ? `${overallMathAcc}%` : '—'}
            </div>
            <div style={{ fontSize: 10, color: T.textMuted, fontFamily: T.fontBody }}>Accuracy</div>
          </div>
          <div style={{ flex: 1, textAlign: 'center', background: T.surfaceContainer, borderRadius: T.r.md, padding: '10px 4px' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: T.amber, fontFamily: T.fontDisplay }}>{mathStreak || 0}</div>
            <div style={{ fontSize: 10, color: T.textMuted, fontFamily: T.fontBody }}>Streak</div>
          </div>
        </div>

        {/* L1 breakdown */}
        {LEVEL1.some(t => byType[t]?.attempts > 0) && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: T.primary, fontWeight: 700, marginBottom: 6, fontFamily: T.fontBody }}>LEVEL 1 — MENTAL MATH</div>
            {LEVEL1.map(type => {
              const s = byType[type]
              if (!s || s.attempts === 0) return null
              const acc = Math.round((s.correct / s.attempts) * 100)
              const accColor = acc >= 80 ? T.green : acc >= 60 ? T.amber : T.pink
              const avgSec = s.avgTimeMs ? (s.avgTimeMs / 1000).toFixed(1) : null
              return (
                <div key={type} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '8px 0', borderBottom: `1px solid ${T.border}`,
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: T.text, fontWeight: 600, fontFamily: T.fontBody }}>{MATH_TYPE_LABELS[type]}</div>
                    <div style={{ fontSize: 10, color: T.textMuted, fontFamily: T.fontBody }}>
                      {s.attempts} attempts{avgSec ? ` · avg ${avgSec}s / 25s target` : ''}
                    </div>
                    <MiniBar value={acc} max={100} color={accColor} />
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: accColor, marginLeft: 12, fontFamily: T.fontDisplay }}>{acc}%</div>
                </div>
              )
            })}
          </div>
        )}

        {/* L2 breakdown */}
        {LEVEL2.some(t => byType[t]?.attempts > 0) && (
          <div>
            <div style={{ fontSize: 11, color: T.amber, fontWeight: 700, marginBottom: 6, fontFamily: T.fontBody }}>LEVEL 2 — BUSINESS MATH</div>
            {LEVEL2.map(type => {
              const s = byType[type]
              if (!s || s.attempts === 0) return null
              const acc = Math.round((s.correct / s.attempts) * 100)
              const accColor = acc >= 80 ? T.green : acc >= 60 ? T.amber : T.pink
              const avgSec = s.avgTimeMs ? (s.avgTimeMs / 1000).toFixed(1) : null
              return (
                <div key={type} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '8px 0', borderBottom: `1px solid ${T.border}`,
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: T.text, fontWeight: 600, fontFamily: T.fontBody }}>{MATH_TYPE_LABELS[type]}</div>
                    <div style={{ fontSize: 10, color: T.textMuted, fontFamily: T.fontBody }}>
                      {s.attempts} attempts{avgSec ? ` · avg ${avgSec}s / 45s target` : ''}
                    </div>
                    <MiniBar value={acc} max={100} color={accColor} />
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: accColor, marginLeft: 12, fontFamily: T.fontDisplay }}>{acc}%</div>
                </div>
              )
            })}
          </div>
        )}

        {/* L3 breakdown */}
        {LEVEL3.some(t => byType[t]?.attempts > 0) && (
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 11, color: T.pink, fontWeight: 700, marginBottom: 6, fontFamily: T.fontBody }}>LEVEL 3 — ADVANCED CASE MATH</div>
            {LEVEL3.map(type => {
              const s = byType[type]
              if (!s || s.attempts === 0) return null
              const acc = Math.round((s.correct / s.attempts) * 100)
              const accColor = acc >= 80 ? T.green : acc >= 60 ? T.amber : T.pink
              const avgSec = s.avgTimeMs ? (s.avgTimeMs / 1000).toFixed(1) : null
              return (
                <div key={type} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '8px 0', borderBottom: `1px solid ${T.border}`,
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: T.text, fontWeight: 600, fontFamily: T.fontBody }}>{MATH_TYPE_LABELS[type]}</div>
                    <div style={{ fontSize: 10, color: T.textMuted, fontFamily: T.fontBody }}>
                      {s.attempts} attempts{avgSec ? ` · avg ${avgSec}s / 60s target` : ''}
                    </div>
                    <MiniBar value={acc} max={100} color={accColor} />
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: accColor, marginLeft: 12, fontFamily: T.fontDisplay }}>{acc}%</div>
                </div>
              )
            })}
          </div>
        )}

        {totalProblems === 0 && (
          <div style={{ textAlign: 'center', color: T.textMuted, fontSize: 13, padding: '12px 0', fontFamily: T.fontBody }}>
            No math drills yet — head to the Math tab to start.
          </div>
        )}
      </div>

      {/* ── Weak spots ── */}
      {(weakMath.length > 0 || weakGame.length > 0) && (
        <>
          <SectionHeader emoji="🎯" title="FOCUS AREAS" />
          <div style={{ ...glassCard, borderRadius: T.r.lg, padding: '14px 16px', marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: T.pink, fontWeight: 700, marginBottom: 8, fontFamily: T.fontBody }}>NEEDS WORK (≥3 attempts)</div>

            {weakMath.map(({ type, accuracy, avgTimeMs }) => (
              <WeakAreaRow
                key={type}
                label={MATH_TYPE_LABELS[type] || type}
                accuracy={Math.round(accuracy * 100)}
                attempts={byType[type]?.attempts || 0}
                targetLabel={avgTimeMs ? `avg ${(avgTimeMs / 1000).toFixed(1)}s` : null}
                color={T.primary}
              />
            ))}

            {weakGame.map(({ type, accuracy }) => (
              <WeakAreaRow
                key={type}
                label={type}
                accuracy={Math.round(accuracy * 100)}
                attempts={progress.game.byScenarioType[type]?.attempts || 0}
                targetLabel={null}
                color={T.amber}
              />
            ))}
          </div>
        </>
      )}

      {/* ── Game ── */}
      <SectionHeader emoji="🃏" title="CASE GAME" />

      <div style={{ ...glassCard, borderRadius: T.r.lg, padding: '14px 16px', marginBottom: 16 }}>
        {scenariosCompleted.length === 0 ? (
          <div style={{ textAlign: 'center', color: T.textMuted, fontSize: 13, padding: '8px 0', fontFamily: T.fontBody }}>
            No game sessions yet — head to the Game tab to start playing.
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <div style={{ flex: 1, textAlign: 'center', background: T.surfaceContainer, borderRadius: T.r.md, padding: '10px 4px' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: T.primary, fontFamily: T.fontDisplay }}>{scenariosCompleted.length}</div>
                <div style={{ fontSize: 10, color: T.textMuted, fontFamily: T.fontBody }}>Played</div>
              </div>
              <div style={{ flex: 1, textAlign: 'center', background: T.surfaceContainer, borderRadius: T.r.md, padding: '10px 4px' }}>
                <div style={{
                  fontSize: 20, fontWeight: 800, fontFamily: T.fontDisplay,
                  color: gameAcc != null ? (gameAcc >= 70 ? T.green : T.amber) : T.textMuted,
                }}>
                  {gameAcc != null ? `${gameAcc}%` : '—'}
                </div>
                <div style={{ fontSize: 10, color: T.textMuted, fontFamily: T.fontBody }}>Accuracy</div>
              </div>
              <div style={{ flex: 1, textAlign: 'center', background: T.surfaceContainer, borderRadius: T.r.md, padding: '10px 4px' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: T.amber, fontFamily: T.fontDisplay }}>{gameStreak || 0}</div>
                <div style={{ fontSize: 10, color: T.textMuted, fontFamily: T.fontBody }}>Streak</div>
              </div>
            </div>

            {Object.entries(byScenarioType).length > 0 && (
              <div>
                <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 700, marginBottom: 6, fontFamily: T.fontBody }}>BY SCENARIO TYPE</div>
                {Object.entries(byScenarioType).map(([type, stat]) => {
                  const acc = Math.round((stat.correct / stat.attempts) * 100)
                  const accColor = acc >= 70 ? T.green : acc >= 50 ? T.amber : T.pink
                  return (
                    <div key={type} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '7px 0', borderBottom: `1px solid ${T.border}`,
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, color: T.text, fontFamily: T.fontBody }}>{type}</div>
                        <div style={{ fontSize: 10, color: T.textMuted, fontFamily: T.fontBody }}>{stat.attempts} attempts</div>
                        <MiniBar value={acc} max={100} color={accColor} />
                      </div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: accColor, marginLeft: 12, fontFamily: T.fontDisplay }}>{acc}%</div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Reset ── */}
      <div style={{ marginTop: 32, borderTop: `1px solid ${T.border}`, paddingTop: 24 }}>
        {!confirmReset ? (
          <button
            onClick={() => setConfirmReset(true)}
            style={{
              width: '100%', padding: '12px', borderRadius: T.r.md,
              border: `1px solid ${T.pink}`, background: 'none',
              color: T.textMuted, fontSize: 13, fontWeight: 600,
              cursor: 'pointer', fontFamily: T.fontBody,
            }}
          >
            Reset All Progress
          </button>
        ) : (
          <div style={{
            ...glassCard,
            borderRadius: T.r.lg, padding: '16px',
            border: `1px solid ${T.pinkBorder}`,
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 4, fontFamily: T.fontDisplay }}>
              Are you sure?
            </div>
            <div style={{ fontSize: 12, color: T.textMuted, lineHeight: 1.6, marginBottom: 14, fontFamily: T.fontBody }}>
              This will permanently delete all your progress, case notes, and saved recordings from this device. This cannot be undone.
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setConfirmReset(false)}
                style={{
                  flex: 1, padding: '10px', borderRadius: T.r.sm,
                  border: `1px solid ${T.border}`, background: 'none',
                  color: T.textMuted, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  fontFamily: T.fontBody,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                style={{
                  flex: 1, padding: '10px', borderRadius: T.r.sm,
                  border: 'none', background: T.pink,
                  color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  fontFamily: T.fontBody,
                }}
              >
                Yes, Reset Everything
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}
