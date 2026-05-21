import { useState, useEffect, useRef, useCallback } from 'react'
import MATH_DATA from '../data/math_system.json'
import { useProgress } from '../hooks/useProgress'

const { problemBank, speedTargets } = MATH_DATA

const TYPE_LABELS = {
  fraction_to_decimal:    'Fractions → Decimals',
  percent_of_number:      '% of a Number',
  multiplication_shortcut:'Multiplication Shortcuts',
  rounding_scale:         'Rounding & Scale',
  decimal_operations:     'Decimal Operations',
  profit_equation:        'Profit',
  breakeven:              'Breakeven',
  growth_rate:            'Growth Rate',
  roi:                    'ROI',
  market_sizing:          'Market Sizing',
  contribution_margin:    'Contribution Margin',
  market_share:           'Market Share',
  weighted_average:       'Weighted Averages',
  price_volume_mix:       'Price / Volume / Mix',
  payback_period:         'Payback Period',
  unit_economics:         'Unit Economics (LTV/CAC)',
  index_numbers:          'BDI / CDI Index',
  percentage_point:       'Percentage Points vs. %',
  npv_estimation:         'NPV & Valuation',
}

const LEVEL1_TYPES = ['fraction_to_decimal','percent_of_number','multiplication_shortcut','rounding_scale','decimal_operations']
const LEVEL2_TYPES = ['profit_equation','breakeven','growth_rate','roi','market_sizing','contribution_margin','market_share']
const LEVEL3_TYPES = ['weighted_average','price_volume_mix','payback_period','unit_economics','index_numbers','percentage_point','npv_estimation']

const TYPE_COLOR = {
  fraction_to_decimal:    '#6366f1',
  percent_of_number:      '#3b82f6',
  multiplication_shortcut:'#8b5cf6',
  rounding_scale:         '#06b6d4',
  decimal_operations:     '#10b981',
  profit_equation:        '#f59e0b',
  breakeven:              '#ef4444',
  growth_rate:            '#22c55e',
  roi:                    '#f97316',
  market_sizing:          '#a855f7',
  contribution_margin:    '#ec4899',
  market_share:           '#84cc16',
  weighted_average:       '#0ea5e9',
  price_volume_mix:       '#f43f5e',
  payback_period:         '#84cc16',
  unit_economics:         '#fb923c',
  index_numbers:          '#a78bfa',
  percentage_point:       '#34d399',
  npv_estimation:         '#fbbf24',
}

function normalize(str) {
  return str.trim().toLowerCase().replace(/\s+/g, '')
}

function checkAnswer(userInput, problem) {
  const u = normalize(userInput)
  return problem.acceptableAnswers.some(a => normalize(a) === u)
}

function getTargetSeconds(level) {
  return level === 1 ? 25 : level === 2 ? 45 : 60
}

// ── Adaptive problem selection ─────────────────────────────────────────────
function selectProblem(level, typeFilter, byType, recentIds) {
  const pool = problemBank.filter(p => {
    if (p.level !== level) return false
    if (typeFilter !== 'all' && p.type !== typeFilter) return false
    return true
  })
  if (!pool.length) return null

  // Weight problems by weakness (low accuracy or slow avg time)
  const weights = pool.map(p => {
    const stat = byType[p.type]
    if (!stat || stat.attempts < 3) return 3 // boost unseen types
    const accuracy = stat.correct / stat.attempts
    const target = getTargetSeconds(p.type, p.difficulty)
    const avgSec = (stat.avgTimeMs || 0) / 1000
    const speedRatio = avgSec > 0 ? Math.min(avgSec / target, 3) : 1
    // Higher weight = more likely to appear
    return Math.max(1, (1 - accuracy) * 3 + speedRatio)
  })

  // Deprioritize recently seen problems
  const adjusted = weights.map((w, i) =>
    recentIds.includes(pool[i].id) ? w * 0.1 : w
  )

  const total = adjusted.reduce((a, b) => a + b, 0)
  let rand = Math.random() * total
  for (let i = 0; i < pool.length; i++) {
    rand -= adjusted[i]
    if (rand <= 0) return pool[i]
  }
  return pool[pool.length - 1]
}

// ── Timer display ─────────────────────────────────────────────────────────
function TimerBar({ elapsedMs, targetSeconds }) {
  const elapsed = elapsedMs / 1000
  const pct = Math.min((elapsed / targetSeconds) * 100, 100)
  const color = pct < 60 ? '#22c55e' : pct < 90 ? '#f59e0b' : '#ef4444'
  const secs = Math.floor(elapsed)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: '#64748b' }}>Time</span>
        <span style={{ fontSize: 13, fontWeight: 700, color }}>{secs}s <span style={{ color: '#475569', fontWeight: 400 }}>/ {targetSeconds}s target</span></span>
      </div>
      <div style={{ background: '#0f172a', borderRadius: 999, height: 5, overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 999,
          width: `${pct}%`,
          background: color,
          transition: 'width 0.1s linear, background 0.3s',
        }} />
      </div>
    </div>
  )
}

// ── Stats for one type ─────────────────────────────────────────────────────
function TypeStat({ type, stat, targetSeconds }) {
  const color = TYPE_COLOR[type] || '#475569'
  const label = TYPE_LABELS[type] || type
  const accuracy = stat.attempts > 0 ? Math.round((stat.correct / stat.attempts) * 100) : null
  const avgSec = stat.avgTimeMs ? (stat.avgTimeMs / 1000).toFixed(1) : null
  const bestSec = stat.bestTimeMs ? (stat.bestTimeMs / 1000).toFixed(1) : null
  const accColor = accuracy == null ? '#475569' : accuracy >= 80 ? '#22c55e' : accuracy >= 60 ? '#f59e0b' : '#ef4444'

  return (
    <div style={{
      background: '#1e293b', borderRadius: 12, padding: '12px 14px', marginBottom: 8,
      borderLeft: `3px solid ${color}`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>{label}</div>
          <div style={{ fontSize: 11, color: '#475569', marginTop: 1 }}>{stat.attempts} attempts</div>
        </div>
        {accuracy != null && (
          <div style={{ fontSize: 18, fontWeight: 800, color: accColor }}>{accuracy}%</div>
        )}
      </div>

      {stat.attempts > 0 && (
        <div style={{ display: 'flex', gap: 16 }}>
          <div>
            <div style={{ fontSize: 10, color: '#475569' }}>Avg time</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: avgSec && parseFloat(avgSec) <= targetSeconds ? '#22c55e' : '#f59e0b' }}>
              {avgSec ? `${avgSec}s` : '—'}
              <span style={{ fontSize: 10, color: '#475569', fontWeight: 400 }}> / {targetSeconds}s</span>
            </div>
          </div>
          {bestSec && (
            <div>
              <div style={{ fontSize: 10, color: '#475569' }}>Best</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#60a5fa' }}>{bestSec}s</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────
export default function MathPage() {
  const { progress, recordMathResult } = useProgress()
  const [view, setView] = useState('drill')   // 'drill' | 'stats'
  const [level, setLevel] = useState(1)
  const [typeFilter, setTypeFilter] = useState('all')
  const [started, setStarted] = useState(false)

  // Drill state
  const [problem, setProblem] = useState(null)
  const [phase, setPhase] = useState('answering') // 'answering' | 'result'
  const [userAnswer, setUserAnswer] = useState('')
  const [correct, setCorrect] = useState(null)
  const [elapsedMs, setElapsedMs] = useState(0)
  const [finalMs, setFinalMs] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [showBreakdown, setShowBreakdown] = useState(false)
  const [sessionCount, setSessionCount] = useState(0)
  const [sessionCorrect, setSessionCorrect] = useState(0)
  const recentIds = useRef([])

  const startTimeRef = useRef(null)
  const timerRef = useRef(null)
  const targetSecRef = useRef(25)
  const inputRef = useRef(null)

  const byType = progress.math.byType
  const targetSec = getTargetSeconds(level)

  const loadNextProblem = useCallback(() => {
    const p = selectProblem(level, typeFilter, byType, recentIds.current)
    if (!p) return
    const tSec = getTargetSeconds(level)
    targetSecRef.current = tSec
    setProblem(p)
    setPhase('answering')
    setUserAnswer('')
    setCorrect(null)
    setElapsedMs(0)
    setShowHint(false)
    setShowBreakdown(false)
    startTimeRef.current = Date.now()
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current
      const capMs = targetSecRef.current * 1000
      if (elapsed >= capMs) {
        setElapsedMs(capMs)
        clearInterval(timerRef.current)
      } else {
        setElapsedMs(elapsed)
      }
    }, 100)
    setTimeout(() => inputRef.current?.focus(), 50)
  }, [level, typeFilter, byType])

  // Reset to start screen when level or type filter changes mid-drill
  useEffect(() => {
    clearInterval(timerRef.current)
    setStarted(false)
    setProblem(null)
  }, [level, typeFilter])

  useEffect(() => () => clearInterval(timerRef.current), [])

  const submit = () => {
    if (phase !== 'answering' || !problem) return
    clearInterval(timerRef.current)
    const timeMs = Math.min(Date.now() - startTimeRef.current, targetSecRef.current * 1000)
    setFinalMs(timeMs)
    const isCorrect = checkAnswer(userAnswer, problem)
    setCorrect(isCorrect)
    setPhase('result')
    setSessionCount(c => c + 1)
    if (isCorrect) setSessionCorrect(c => c + 1)
    recentIds.current = [...recentIds.current.slice(-7), problem.id]
    recordMathResult({ problemId: problem.id, type: problem.type, correct: isCorrect, timeMs })
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (phase === 'answering') submit()
      else loadNextProblem()
    }
  }

  const color = problem ? (TYPE_COLOR[problem.type] || '#475569') : '#475569'
  const activeTypes = level === 1 ? LEVEL1_TYPES : level === 2 ? LEVEL2_TYPES : LEVEL3_TYPES

  return (
    <div style={{ padding: '16px 16px 24px', maxWidth: 520, margin: '0 auto' }}>

      {/* View toggle */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {[{ key: 'drill', label: '🧮 Drill' }, { key: 'stats', label: '📊 My Stats' }].map(t => (
          <button
            key={t.key}
            onClick={() => setView(t.key)}
            style={{
              flex: 1, padding: '10px', borderRadius: 12, border: 'none',
              background: view === t.key ? '#3b82f6' : '#1e293b',
              color: view === t.key ? '#fff' : '#64748b',
              fontSize: 14, fontWeight: 700, cursor: 'pointer',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── STATS VIEW ── */}
      {view === 'stats' && (
        <div>
          <div style={{
            background: '#1e293b', borderRadius: 16, padding: '14px 16px',
            marginBottom: 16, display: 'flex', justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ fontSize: 13, color: '#64748b', marginBottom: 2 }}>Problems solved</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#f1f5f9' }}>{progress.math.totalProblems || 0}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#f59e0b' }}>{progress.math.streakDays || 0}</div>
              <div style={{ fontSize: 10, color: '#64748b' }}>Day streak</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
            {[
              { l: 1, label: 'L1: Mental', color: '#6366f1' },
              { l: 2, label: 'L2: Business', color: '#f59e0b' },
              { l: 3, label: 'L3: Advanced', color: '#f43f5e' },
            ].map(({ l, label, color }) => (
              <button
                key={l}
                onClick={() => setLevel(l)}
                style={{
                  flex: 1, padding: '8px 4px', borderRadius: 10, border: 'none',
                  background: level === l ? color : '#1e293b',
                  color: level === l ? '#fff' : '#64748b',
                  fontSize: 11, fontWeight: 700, cursor: 'pointer',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {(level === 1 ? LEVEL1_TYPES : level === 2 ? LEVEL2_TYPES : LEVEL3_TYPES).map(type => {
            const stat = byType[type] || { attempts: 0, correct: 0 }
            return <TypeStat key={type} type={type} stat={stat} targetSeconds={getTargetSeconds(level)} />
          })}
        </div>
      )}

      {/* ── DRILL VIEW ── */}
      {view === 'drill' && (
        <div>
          {/* Level selector */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
            {[{ l: 1, label: 'L1: Mental Math', color: '#6366f1' }, { l: 2, label: 'L2: Business', color: '#f59e0b' }, { l: 3, label: 'L3: Advanced', color: '#f43f5e' }].map(({ l, label, color }) => (
              <button
                key={l}
                onClick={() => { setLevel(l); setTypeFilter('all') }}
                style={{
                  flex: 1, padding: '8px 4px', borderRadius: 10, border: 'none',
                  background: level === l ? color : '#1e293b',
                  color: level === l ? '#fff' : '#64748b',
                  fontSize: 11, fontWeight: 700, cursor: 'pointer',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Type filter */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
            <button
              onClick={() => setTypeFilter('all')}
              style={{
                padding: '5px 10px', borderRadius: 999, border: 'none', flexShrink: 0,
                background: typeFilter === 'all' ? '#475569' : '#1e293b',
                color: typeFilter === 'all' ? '#fff' : '#64748b',
                fontSize: 11, fontWeight: 600, cursor: 'pointer',
              }}
            >
              All
            </button>
            {activeTypes.map(type => {
              const c = TYPE_COLOR[type]
              const active = typeFilter === type
              return (
                <button
                  key={type}
                  onClick={() => setTypeFilter(active ? 'all' : type)}
                  style={{
                    padding: '5px 10px', borderRadius: 999, border: 'none', flexShrink: 0,
                    background: active ? c : '#1e293b',
                    color: active ? '#fff' : c,
                    fontSize: 11, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
                  }}
                >
                  {TYPE_LABELS[type]}
                </button>
              )
            })}
          </div>

          {/* ── START SCREEN ── */}
          {!started && (
            <div style={{
              background: '#1e293b', borderRadius: 20, padding: 28, textAlign: 'center',
            }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🧮</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#f1f5f9', marginBottom: 6 }}>
                {level === 1 ? 'Level 1: Mental Math' : 'Level 2: Business Math'}
              </div>
              <div style={{ fontSize: 13, color: '#64748b', marginBottom: 6 }}>
                {typeFilter === 'all' ? 'All problem types' : TYPE_LABELS[typeFilter]}
              </div>
              <div style={{
                display: 'inline-block', fontSize: 12, color: level === 1 ? '#6366f1' : '#f59e0b',
                background: (level === 1 ? '#6366f1' : '#f59e0b') + '22',
                borderRadius: 8, padding: '4px 10px', marginBottom: 20,
              }}>
                {targetSec}s per question
              </div>
              {sessionCount > 0 && (
                <div style={{ fontSize: 13, color: '#475569', marginBottom: 16 }}>
                  Session so far: {sessionCorrect}/{sessionCount} correct
                </div>
              )}
              <button
                onClick={() => { setStarted(true); loadNextProblem() }}
                style={{
                  width: '100%', padding: '16px', borderRadius: 14, border: 'none',
                  background: level === 1 ? '#6366f1' : '#f59e0b',
                  color: '#fff', fontSize: 16, fontWeight: 800, cursor: 'pointer',
                }}
              >
                Start Drill →
              </button>
            </div>
          )}

          {/* ── PROBLEM CARD ── */}
          {started && problem && (
            <div>
              {/* Session score */}
              {sessionCount > 0 && (
                <div style={{
                  background: '#1e293b', borderRadius: 12, padding: '8px 14px',
                  marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <span style={{ fontSize: 12, color: '#64748b' }}>Session</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>
                    {sessionCorrect}/{sessionCount}
                    <span style={{ color: '#64748b', fontWeight: 400, fontSize: 11 }}> correct</span>
                  </span>
                </div>
              )}

              <div style={{
                background: '#1e293b', borderRadius: 20, padding: 20, marginBottom: 12,
                border: phase === 'result'
                  ? `2px solid ${correct ? '#22c55e' : '#ef4444'}`
                  : `2px solid ${color}33`,
              }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700, color,
                      background: color + '22', borderRadius: 6, padding: '3px 8px',
                    }}>
                      {TYPE_LABELS[problem.type]}
                    </span>
                    <span style={{
                      fontSize: 10, fontWeight: 700,
                      color: problem.difficulty === 'easy' ? '#22c55e' : problem.difficulty === 'medium' ? '#f59e0b' : '#ef4444',
                    }}>
                      {problem.difficulty}
                    </span>
                  </div>
                  <span style={{ fontSize: 11, color: '#475569' }}>L{problem.level}</span>
                </div>

                {/* Timer */}
                {phase === 'answering' && (
                  <div style={{ marginBottom: 16 }}>
                    <TimerBar elapsedMs={elapsedMs} targetSeconds={targetSec} />
                  </div>
                )}

                {/* Question */}
                <div style={{
                  fontSize: 18, fontWeight: 700, color: '#f1f5f9',
                  lineHeight: 1.4, marginBottom: 20, minHeight: 52,
                }}>
                  {problem.question}
                </div>

                {/* Answer input */}
                {phase === 'answering' && (
                  <div>
                    <input
                      ref={inputRef}
                      type="text"
                      inputMode="decimal"
                      value={userAnswer}
                      onChange={e => setUserAnswer(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Your answer..."
                      style={{
                        width: '100%', padding: '12px 14px', borderRadius: 12,
                        border: `2px solid ${color}44`,
                        background: '#0f172a', color: '#f1f5f9',
                        fontSize: 16, fontWeight: 600, outline: 'none',
                        boxSizing: 'border-box', marginBottom: 10,
                      }}
                    />
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={submit}
                        disabled={!userAnswer.trim()}
                        style={{
                          flex: 1, padding: '12px', borderRadius: 12, border: 'none',
                          background: userAnswer.trim() ? color : '#1e293b',
                          color: userAnswer.trim() ? '#fff' : '#475569',
                          fontSize: 14, fontWeight: 700, cursor: userAnswer.trim() ? 'pointer' : 'default',
                        }}
                      >
                        Submit
                      </button>
                      <button
                        onClick={() => setShowHint(h => !h)}
                        style={{
                          padding: '12px 16px', borderRadius: 12,
                          border: showHint ? `1px solid #f59e0b` : '1px solid #334155',
                          background: showHint ? '#f59e0b18' : 'none',
                          color: showHint ? '#f59e0b' : '#64748b',
                          fontSize: 13, cursor: 'pointer',
                        }}
                      >
                        💡 Hint
                      </button>
                    </div>
                    {showHint && (
                      <div style={{
                        marginTop: 10, background: '#0f172a', borderRadius: 10,
                        padding: '10px 12px', fontSize: 13, color: '#94a3b8', lineHeight: 1.5,
                      }}>
                        <span style={{ fontWeight: 700, color: '#f59e0b' }}>Hint: </span>
                        {problem.hint}
                      </div>
                    )}
                  </div>
                )}

                {/* Result */}
                {phase === 'result' && (
                  <div>
                    <div style={{
                      background: correct ? '#22c55e18' : '#ef444418',
                      border: `1px solid ${correct ? '#22c55e44' : '#ef444444'}`,
                      borderRadius: 12, padding: '12px 14px', marginBottom: 12,
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: correct ? '#22c55e' : '#ef4444' }}>
                          {correct ? '✅ Correct!' : '❌ Not quite'}
                        </div>
                        {!correct && (
                          <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 2 }}>
                            Answer: <span style={{ color: '#f1f5f9', fontWeight: 700 }}>{problem.answer}</span>
                          </div>
                        )}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{
                          fontSize: 16, fontWeight: 800,
                          color: finalMs / 1000 <= targetSec ? '#22c55e' : '#f59e0b',
                        }}>
                          {(finalMs / 1000).toFixed(1)}s
                        </div>
                        <div style={{ fontSize: 10, color: '#475569' }}>target {targetSec}s</div>
                      </div>
                    </div>

                    {/* Quick explanation */}
                    <div style={{
                      background: '#0f172a', borderRadius: 10, padding: '10px 14px',
                      fontSize: 13, color: '#94a3b8', lineHeight: 1.6, marginBottom: 10,
                    }}>
                      <span style={{ fontWeight: 700, color: '#60a5fa' }}>How to think about it: </span>
                      {problem.hint}
                    </div>

                    {/* Further breakdown toggle */}
                    <button
                      onClick={() => setShowBreakdown(b => !b)}
                      style={{
                        width: '100%', padding: '9px', borderRadius: 10, marginBottom: 10,
                        border: showBreakdown ? '1px solid #6366f1' : '1px solid #334155',
                        background: showBreakdown ? '#6366f118' : 'none',
                        color: showBreakdown ? '#818cf8' : '#64748b',
                        fontSize: 13, fontWeight: 600, cursor: 'pointer',
                      }}
                    >
                      {showBreakdown ? '▲ Hide breakdown' : '▼ Further breakdown'}
                    </button>

                    {showBreakdown && (
                      <div style={{
                        background: '#0f172a', borderRadius: 10, padding: '12px 14px',
                        fontSize: 13, color: '#94a3b8', lineHeight: 1.7, marginBottom: 10,
                        borderLeft: '3px solid #6366f1',
                      }}>
                        <div style={{ fontWeight: 700, color: '#818cf8', marginBottom: 6 }}>Full explanation:</div>
                        {problem.explanation}
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => { setStarted(false); clearInterval(timerRef.current) }}
                        style={{
                          padding: '12px 16px', borderRadius: 12,
                          border: '1px solid #334155', background: 'none',
                          color: '#64748b', fontSize: 13, cursor: 'pointer',
                        }}
                      >
                        ← Menu
                      </button>
                      <button
                        onClick={loadNextProblem}
                        style={{
                          flex: 1, padding: '12px', borderRadius: 12, border: 'none',
                          background: '#3b82f6', color: '#fff',
                          fontSize: 14, fontWeight: 700, cursor: 'pointer',
                        }}
                      >
                        Next Problem →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
