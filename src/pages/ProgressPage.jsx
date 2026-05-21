import { useState } from 'react'
import { useProgress } from '../hooks/useProgress'
import { FRAMEWORKS } from '../data/frameworks'
import SCENARIOS from '../data/scenarios.json'

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

function StatCard({ label, value, sub, color = '#f1f5f9' }) {
  return (
    <div style={{
      background: '#1e293b', borderRadius: 14, padding: '14px 16px', flex: 1,
    }}>
      <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 800, color }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

function MiniBar({ value, max, color }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0
  return (
    <div style={{ background: '#0f172a', borderRadius: 999, height: 5, overflow: 'hidden', marginTop: 6 }}>
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
    <div style={{ fontSize: 12, fontWeight: 800, color: '#64748b', letterSpacing: 1.5, marginBottom: 10, marginTop: 6 }}>
      {emoji} {title}
    </div>
  )
}

function WeakAreaRow({ label, accuracy, attempts, targetLabel, color }) {
  const accColor = accuracy >= 80 ? '#22c55e' : accuracy >= 60 ? '#f59e0b' : '#ef4444'
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '10px 0', borderBottom: '1px solid #0f172a',
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, color: '#f1f5f9', fontWeight: 600, marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 11, color: '#475569' }}>{attempts} attempts{targetLabel ? ` · ${targetLabel}` : ''}</div>
        <MiniBar value={accuracy} max={100} color={accColor} />
      </div>
      <div style={{ fontSize: 18, fontWeight: 800, color: accColor, marginLeft: 16, flexShrink: 0 }}>
        {accuracy}%
      </div>
    </div>
  )
}

export default function ProgressPage() {
  const { progress, getWeakestMathTypes, getWeakestScenarioTypes, getGameAccuracy } = useProgress()
  const [confirmReset, setConfirmReset] = useState(false)

  const handleReset = async () => {
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
    <div style={{ padding: '16px 16px 32px', maxWidth: 520, margin: '0 auto' }}>

      {/* ── Empty state ── */}
      {!hasAnyData && (
        <div style={{
          background: '#1e293b', borderRadius: 16, padding: '32px 24px', textAlign: 'center', marginBottom: 16,
        }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📈</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 6 }}>No data yet</div>
          <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>
            Practice flashcards, drill math problems, and work through cases — your progress will appear here.
          </div>
        </div>
      )}

      {/* ── Streak + overview ── */}
      <SectionHeader emoji="🔥" title="OVERVIEW" />
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <StatCard label="Day streak" value={bestStreak || '—'} sub="Keep going daily" color="#f59e0b" />
        <StatCard label="Math solved" value={totalProblems || 0} sub={overallMathAcc != null ? `${overallMathAcc}% accuracy` : 'No data yet'} color="#6366f1" />
        <StatCard label="Cases viewed" value={viewed.length} sub={`of ${SCENARIOS.length}`} color="#10b981" />
      </div>

      {/* ── Frameworks ── */}
      <SectionHeader emoji="📚" title="FRAMEWORKS" />
      <div style={{ background: '#1e293b', borderRadius: 14, padding: '14px 16px', marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ fontSize: 13, color: '#64748b' }}>Rated {fwRated} of {FRAMEWORKS.length}</div>
          <div style={{ display: 'flex', gap: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#22c55e' }}>✅ {fwKnow}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#f59e0b' }}>🤔 {fwUnsure}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#ef4444' }}>🔁 {fwAgain}</span>
          </div>
        </div>
        <MiniBar value={fwKnow} max={FRAMEWORKS.length} color="linear-gradient(90deg, #3b82f6, #22c55e)" />

        {fwAgain > 0 && (
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 11, color: '#ef4444', fontWeight: 700, marginBottom: 6 }}>NEED REVIEW</div>
            {FRAMEWORKS.filter(f => cardProgress[f.id] === 'again').map(f => (
              <div key={f.id} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0',
                borderBottom: '1px solid #0f172a',
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%', background: f.color, flexShrink: 0,
                }} />
                <span style={{ fontSize: 13, color: '#f1f5f9' }}>{f.name}</span>
                <span style={{ fontSize: 11, color: '#64748b', marginLeft: 'auto' }}>{f.subtitle}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Cases ── */}
      <SectionHeader emoji="💼" title="CASES" />
      <div style={{ background: '#1e293b', borderRadius: 14, padding: '14px 16px', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <div style={{ flex: 1, textAlign: 'center', background: '#0f172a', borderRadius: 10, padding: '10px 4px' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#3b82f6' }}>{viewed.length}</div>
            <div style={{ fontSize: 10, color: '#64748b' }}>Viewed</div>
          </div>
          <div style={{ flex: 1, textAlign: 'center', background: '#0f172a', borderRadius: 10, padding: '10px 4px' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#f59e0b' }}>{caseRated}</div>
            <div style={{ fontSize: 10, color: '#64748b' }}>Rated</div>
          </div>
          <div style={{ flex: 1, textAlign: 'center', background: '#0f172a', borderRadius: 10, padding: '10px 4px' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#22c55e' }}>{caseNailed}</div>
            <div style={{ fontSize: 10, color: '#64748b' }}>Nailed</div>
          </div>
          <div style={{ flex: 1, textAlign: 'center', background: '#0f172a', borderRadius: 10, padding: '10px 4px' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#ef4444' }}>{caseStruggled}</div>
            <div style={{ fontSize: 10, color: '#64748b' }}>Struggled</div>
          </div>
        </div>
        <MiniBar value={caseRated} max={SCENARIOS.length} color="#f59e0b" />

        {/* CSAI breakdown */}
        {csaiAvgs && (
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, marginBottom: 8 }}>CSAI AVERAGES (from {ratedCases.length} rated cases)</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {csaiKeys.map(k => {
                const avg = parseFloat(csaiAvgs[k])
                const c = avg >= 2.5 ? '#22c55e' : avg >= 1.5 ? '#f59e0b' : '#ef4444'
                return (
                  <div key={k} style={{
                    flex: 1, background: '#0f172a', borderRadius: 10, padding: '8px 4px', textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: c }}>{csaiAvgs[k]}</div>
                    <div style={{ fontSize: 10, color: '#64748b' }}>{k}</div>
                    <div style={{ fontSize: 9, color: '#334155' }}>{csaiLabels[k]}</div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Math ── */}
      <SectionHeader emoji="🧮" title="MATH DRILLS" />
      <div style={{ background: '#1e293b', borderRadius: 14, padding: '14px 16px', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          <div style={{ flex: 1, textAlign: 'center', background: '#0f172a', borderRadius: 10, padding: '10px 4px' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#6366f1' }}>{totalProblems || 0}</div>
            <div style={{ fontSize: 10, color: '#64748b' }}>Problems</div>
          </div>
          <div style={{ flex: 1, textAlign: 'center', background: '#0f172a', borderRadius: 10, padding: '10px 4px' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: overallMathAcc >= 80 ? '#22c55e' : overallMathAcc >= 60 ? '#f59e0b' : '#ef4444' }}>
              {overallMathAcc != null ? `${overallMathAcc}%` : '—'}
            </div>
            <div style={{ fontSize: 10, color: '#64748b' }}>Accuracy</div>
          </div>
          <div style={{ flex: 1, textAlign: 'center', background: '#0f172a', borderRadius: 10, padding: '10px 4px' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#f59e0b' }}>{mathStreak || 0}</div>
            <div style={{ fontSize: 10, color: '#64748b' }}>Streak</div>
          </div>
        </div>

        {/* L1 breakdown */}
        {LEVEL1.some(t => byType[t]?.attempts > 0) && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: '#6366f1', fontWeight: 700, marginBottom: 6 }}>LEVEL 1 — MENTAL MATH</div>
            {LEVEL1.map(type => {
              const s = byType[type]
              if (!s || s.attempts === 0) return null
              const acc = Math.round((s.correct / s.attempts) * 100)
              const accColor = acc >= 80 ? '#22c55e' : acc >= 60 ? '#f59e0b' : '#ef4444'
              const avgSec = s.avgTimeMs ? (s.avgTimeMs / 1000).toFixed(1) : null
              return (
                <div key={type} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '8px 0', borderBottom: '1px solid #0f172a',
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: '#f1f5f9', fontWeight: 600 }}>{MATH_TYPE_LABELS[type]}</div>
                    <div style={{ fontSize: 10, color: '#475569' }}>
                      {s.attempts} attempts{avgSec ? ` · avg ${avgSec}s / 25s target` : ''}
                    </div>
                    <MiniBar value={acc} max={100} color={accColor} />
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: accColor, marginLeft: 12 }}>{acc}%</div>
                </div>
              )
            })}
          </div>
        )}

        {/* L2 breakdown */}
        {LEVEL2.some(t => byType[t]?.attempts > 0) && (
          <div>
            <div style={{ fontSize: 11, color: '#f59e0b', fontWeight: 700, marginBottom: 6 }}>LEVEL 2 — BUSINESS MATH</div>
            {LEVEL2.map(type => {
              const s = byType[type]
              if (!s || s.attempts === 0) return null
              const acc = Math.round((s.correct / s.attempts) * 100)
              const accColor = acc >= 80 ? '#22c55e' : acc >= 60 ? '#f59e0b' : '#ef4444'
              const avgSec = s.avgTimeMs ? (s.avgTimeMs / 1000).toFixed(1) : null
              return (
                <div key={type} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '8px 0', borderBottom: '1px solid #0f172a',
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: '#f1f5f9', fontWeight: 600 }}>{MATH_TYPE_LABELS[type]}</div>
                    <div style={{ fontSize: 10, color: '#475569' }}>
                      {s.attempts} attempts{avgSec ? ` · avg ${avgSec}s / 45s target` : ''}
                    </div>
                    <MiniBar value={acc} max={100} color={accColor} />
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: accColor, marginLeft: 12 }}>{acc}%</div>
                </div>
              )
            })}
          </div>
        )}

        {/* L3 breakdown */}
        {LEVEL3.some(t => byType[t]?.attempts > 0) && (
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 11, color: '#f43f5e', fontWeight: 700, marginBottom: 6 }}>LEVEL 3 — ADVANCED CASE MATH</div>
            {LEVEL3.map(type => {
              const s = byType[type]
              if (!s || s.attempts === 0) return null
              const acc = Math.round((s.correct / s.attempts) * 100)
              const accColor = acc >= 80 ? '#22c55e' : acc >= 60 ? '#f59e0b' : '#ef4444'
              const avgSec = s.avgTimeMs ? (s.avgTimeMs / 1000).toFixed(1) : null
              return (
                <div key={type} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '8px 0', borderBottom: '1px solid #0f172a',
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: '#f1f5f9', fontWeight: 600 }}>{MATH_TYPE_LABELS[type]}</div>
                    <div style={{ fontSize: 10, color: '#475569' }}>
                      {s.attempts} attempts{avgSec ? ` · avg ${avgSec}s / 60s target` : ''}
                    </div>
                    <MiniBar value={acc} max={100} color={accColor} />
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: accColor, marginLeft: 12 }}>{acc}%</div>
                </div>
              )
            })}
          </div>
        )}

        {totalProblems === 0 && (
          <div style={{ textAlign: 'center', color: '#334155', fontSize: 13, padding: '12px 0' }}>
            No math drills yet — head to the Math tab to start.
          </div>
        )}
      </div>

      {/* ── Weak spots ── */}
      {(weakMath.length > 0 || weakGame.length > 0) && (
        <>
          <SectionHeader emoji="🎯" title="FOCUS AREAS" />
          <div style={{ background: '#1e293b', borderRadius: 14, padding: '14px 16px', marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: '#ef4444', fontWeight: 700, marginBottom: 8 }}>NEEDS WORK (≥3 attempts)</div>

            {weakMath.map(({ type, accuracy, avgTimeMs }) => (
              <WeakAreaRow
                key={type}
                label={MATH_TYPE_LABELS[type] || type}
                accuracy={Math.round(accuracy * 100)}
                attempts={byType[type]?.attempts || 0}
                targetLabel={avgTimeMs ? `avg ${(avgTimeMs / 1000).toFixed(1)}s` : null}
                color="#6366f1"
              />
            ))}

            {weakGame.map(({ type, accuracy }) => (
              <WeakAreaRow
                key={type}
                label={type}
                accuracy={Math.round(accuracy * 100)}
                attempts={progress.game.byScenarioType[type]?.attempts || 0}
                targetLabel={null}
                color="#f59e0b"
              />
            ))}
          </div>
        </>
      )}

      {/* ── Game ── */}
      <SectionHeader emoji="🃏" title="CASE GAME" />

      <div style={{ background: '#1e293b', borderRadius: 14, padding: '14px 16px', marginBottom: 16 }}>
        {scenariosCompleted.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#334155', fontSize: 13, padding: '8px 0' }}>
            Game tab coming soon — your scenario accuracy will appear here.
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <div style={{ flex: 1, textAlign: 'center', background: '#0f172a', borderRadius: 10, padding: '10px 4px' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#3b82f6' }}>{scenariosCompleted.length}</div>
                <div style={{ fontSize: 10, color: '#64748b' }}>Played</div>
              </div>
              <div style={{ flex: 1, textAlign: 'center', background: '#0f172a', borderRadius: 10, padding: '10px 4px' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: gameAcc != null ? (gameAcc >= 70 ? '#22c55e' : '#f59e0b') : '#475569' }}>
                  {gameAcc != null ? `${gameAcc}%` : '—'}
                </div>
                <div style={{ fontSize: 10, color: '#64748b' }}>Accuracy</div>
              </div>
              <div style={{ flex: 1, textAlign: 'center', background: '#0f172a', borderRadius: 10, padding: '10px 4px' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#f59e0b' }}>{gameStreak || 0}</div>
                <div style={{ fontSize: 10, color: '#64748b' }}>Streak</div>
              </div>
            </div>

            {Object.entries(byScenarioType).length > 0 && (
              <div>
                <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, marginBottom: 6 }}>BY SCENARIO TYPE</div>
                {Object.entries(byScenarioType).map(([type, stat]) => {
                  const acc = Math.round((stat.correct / stat.attempts) * 100)
                  const accColor = acc >= 70 ? '#22c55e' : acc >= 50 ? '#f59e0b' : '#ef4444'
                  return (
                    <div key={type} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '7px 0', borderBottom: '1px solid #0f172a',
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, color: '#f1f5f9' }}>{type}</div>
                        <div style={{ fontSize: 10, color: '#475569' }}>{stat.attempts} attempts</div>
                        <MiniBar value={acc} max={100} color={accColor} />
                      </div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: accColor, marginLeft: 12 }}>{acc}%</div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Reset ── */}
      <div style={{ marginTop: 32, borderTop: '1px solid #1e293b', paddingTop: 24 }}>
        {!confirmReset ? (
          <button
            onClick={() => setConfirmReset(true)}
            style={{
              width: '100%', padding: '12px', borderRadius: 10,
              border: '1px solid #334155', background: 'none',
              color: '#475569', fontSize: 13, fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Reset All Progress
          </button>
        ) : (
          <div style={{
            background: '#1e293b', borderRadius: 14, padding: '16px',
            border: '1px solid #ef444433',
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', marginBottom: 4 }}>
              Are you sure?
            </div>
            <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.6, marginBottom: 14 }}>
              This will permanently delete all your progress, case notes, and saved recordings from this device. This cannot be undone.
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setConfirmReset(false)}
                style={{
                  flex: 1, padding: '10px', borderRadius: 8,
                  border: '1px solid #334155', background: 'none',
                  color: '#94a3b8', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                style={{
                  flex: 1, padding: '10px', borderRadius: 8,
                  border: 'none', background: '#ef4444',
                  color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
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
