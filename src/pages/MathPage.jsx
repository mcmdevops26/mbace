import { useState, useEffect, useRef, useCallback } from 'react'
import MATH_DATA from '../data/math_system.json'
import { useProgress } from '../hooks/useProgress'
import { track } from '../utils/analytics'
import { T } from '../theme'

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
  const color = pct < 60 ? T.green : pct < 90 ? T.amber : T.pink
  const glow = pct < 60
    ? '0 0 8px rgba(132,204,22,0.5)'
    : pct < 90
    ? '0 0 8px rgba(245,158,11,0.5)'
    : '0 0 8px rgba(244,63,94,0.5)'
  const secs = Math.floor(elapsed)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: T.textMuted, fontFamily: T.fontBody }}>Time</span>
        <span style={{ fontSize: 13, fontWeight: 700, color, fontFamily: T.fontBody }}>
          {secs}s{' '}
          <span style={{ color: T.textMuted, fontWeight: 400 }}>/ {targetSeconds}s target</span>
        </span>
      </div>
      <div style={{ background: T.border, borderRadius: 999, height: 8, overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 999,
          width: `${pct}%`,
          background: color,
          boxShadow: glow,
          transition: 'width 0.1s linear, background 0.3s',
        }} />
      </div>
    </div>
  )
}

// ── Stats for one type ─────────────────────────────────────────────────────
function TypeStat({ type, stat, targetSeconds }) {
  const color = TYPE_COLOR[type] || T.textMuted
  const label = TYPE_LABELS[type] || type
  const accuracy = stat.attempts > 0 ? Math.round((stat.correct / stat.attempts) * 100) : null
  const avgSec = stat.avgTimeMs ? (stat.avgTimeMs / 1000).toFixed(1) : null
  const bestSec = stat.bestTimeMs ? (stat.bestTimeMs / 1000).toFixed(1) : null
  const accColor = accuracy == null ? T.textMuted : accuracy >= 80 ? T.green : accuracy >= 60 ? T.amber : T.pink

  return (
    <div style={{
      ...T.glass,
      borderRadius: 12, padding: '12px 14px', marginBottom: 8,
      borderLeft: `3px solid ${color}`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.text, fontFamily: T.fontBody }}>{label}</div>
          <div style={{ fontSize: 11, color: T.textMuted, marginTop: 1, fontFamily: T.fontBody }}>{stat.attempts} attempts</div>
        </div>
        {accuracy != null && (
          <div style={{ fontSize: 18, fontWeight: 800, color: accColor, fontFamily: T.fontDisplay }}>{accuracy}%</div>
        )}
      </div>

      {stat.attempts > 0 && (
        <div style={{ display: 'flex', gap: 16 }}>
          <div>
            <div style={{ fontSize: 10, color: T.textMuted, fontFamily: T.fontBody }}>Avg time</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: avgSec && parseFloat(avgSec) <= targetSeconds ? T.green : T.amber, fontFamily: T.fontBody }}>
              {avgSec ? `${avgSec}s` : '—'}
              <span style={{ fontSize: 10, color: T.textMuted, fontWeight: 400 }}> / {targetSeconds}s</span>
            </div>
          </div>
          {bestSec && (
            <div>
              <div style={{ fontSize: 10, color: T.textMuted, fontFamily: T.fontBody }}>Best</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.primary, fontFamily: T.fontBody }}>{bestSec}s</div>
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
    track('math_problem_answered', { correct: isCorrect, problem_type: problem.type, level: problem.level, time_seconds: Math.round(timeMs / 1000) })
  }

  const skip = () => {
    if (phase !== 'answering' || !problem) return
    clearInterval(timerRef.current)
    const timeMs = Math.min(Date.now() - startTimeRef.current, targetSecRef.current * 1000)
    setFinalMs(timeMs)
    setCorrect(false)
    setPhase('result')
    setSessionCount(c => c + 1)
    recentIds.current = [...recentIds.current.slice(-7), problem.id]
    recordMathResult({ problemId: problem.id, type: problem.type, correct: false, timeMs })
    track('math_problem_answered', { correct: false, problem_type: problem.type, level: problem.level, time_seconds: Math.round(timeMs / 1000), skipped: true })
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (phase === 'answering') submit()
      else loadNextProblem()
    }
  }

  const color = problem ? (TYPE_COLOR[problem.type] || T.textMuted) : T.textMuted
  const activeTypes = level === 1 ? LEVEL1_TYPES : level === 2 ? LEVEL2_TYPES : LEVEL3_TYPES

  const levelColors = { 1: '#6366f1', 2: '#f59e0b', 3: '#f43f5e' }
  const levelColor = levelColors[level]

  return (
    <div style={{ padding: '16px 20px 24px', maxWidth: 520, margin: '0 auto' }}>

      {/* View toggle */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {[{ key: 'drill', label: '🧮 Drill' }, { key: 'stats', label: '📊 My Stats' }].map(t => (
          <button
            key={t.key}
            onClick={() => setView(t.key)}
            style={{
              flex: 1, padding: '10px', borderRadius: 12, cursor: 'pointer',
              ...(view === t.key
                ? { background: T.primary, color: '#fff', border: 'none' }
                : { ...T.glass, color: T.textSub, border: T.glass.border }),
              fontSize: 14, fontWeight: 700, fontFamily: T.fontBody,
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
            ...T.glass,
            borderRadius: 16, padding: '14px 16px',
            marginBottom: 16, display: 'flex', justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ fontSize: 13, color: T.textMuted, marginBottom: 2, fontFamily: T.fontBody }}>Problems solved</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: T.text, fontFamily: T.fontDisplay }}>{progress.math.totalProblems || 0}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: T.amber, fontFamily: T.fontDisplay }}>{progress.math.streakDays || 0}</div>
              <div style={{ fontSize: 10, color: T.textMuted, fontFamily: T.fontBody }}>Day streak</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
            {[
              { l: 1, label: 'L1: Mental', color: '#6366f1' },
              { l: 2, label: 'L2: Business', color: '#f59e0b' },
              { l: 3, label: 'L3: Advanced', color: '#f43f5e' },
            ].map(({ l, label, color: lc }) => (
              <button
                key={l}
                onClick={() => setLevel(l)}
                style={{
                  flex: 1, padding: '8px 4px', borderRadius: 10, border: 'none',
                  background: level === l ? lc : T.surfaceContainer,
                  color: level === l ? '#fff' : T.textMuted,
                  fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: T.fontBody,
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
            {[{ l: 1, label: 'L1: Mental Math', color: '#6366f1' }, { l: 2, label: 'L2: Business', color: '#f59e0b' }, { l: 3, label: 'L3: Advanced', color: '#f43f5e' }].map(({ l, label, color: lc }) => (
              <button
                key={l}
                onClick={() => { setLevel(l); setTypeFilter('all') }}
                style={{
                  flex: 1, padding: '8px 4px', borderRadius: 10, border: 'none',
                  background: level === l ? lc : T.surfaceContainer,
                  color: level === l ? '#fff' : T.textMuted,
                  fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: T.fontBody,
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Type filter */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 16, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none', msOverflowStyle: 'none' }} className="hide-scrollbar">
            <button
              onClick={() => setTypeFilter('all')}
              style={{
                padding: '5px 10px', borderRadius: 999, border: 'none', flexShrink: 0,
                background: typeFilter === 'all' ? T.textSub : T.surfaceContainer,
                color: typeFilter === 'all' ? '#fff' : T.textMuted,
                fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: T.fontBody,
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
                    background: active ? c : T.surfaceContainer,
                    color: active ? '#fff' : c,
                    fontSize: 11, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: T.fontBody,
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
              ...T.glass,
              borderRadius: 20, padding: 28, textAlign: 'center',
            }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🧮</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: T.text, marginBottom: 6, fontFamily: T.fontDisplay }}>
                {level === 1 ? 'Level 1: Mental Math' : level === 2 ? 'Level 2: Business Math' : 'Level 3: Advanced'}
              </div>
              <div style={{ fontSize: 13, color: T.textSub, marginBottom: 6, fontFamily: T.fontBody }}>
                {typeFilter === 'all' ? 'All problem types' : TYPE_LABELS[typeFilter]}
              </div>
              <div style={{
                display: 'inline-block', fontSize: 12, color: levelColor,
                background: levelColor + '22',
                borderRadius: 8, padding: '4px 10px', marginBottom: 20, fontFamily: T.fontBody,
              }}>
                {targetSec}s per question
              </div>
              {sessionCount > 0 && (
                <div style={{ fontSize: 13, color: T.textMuted, marginBottom: 16, fontFamily: T.fontBody }}>
                  Session so far: {sessionCorrect}/{sessionCount} correct
                </div>
              )}
              <button
                onClick={() => { track('math_drill_started', { level, type_filter: typeFilter }); setStarted(true); loadNextProblem() }}
                style={{
                  width: '100%', padding: '16px', borderRadius: 14, border: 'none',
                  background: `linear-gradient(135deg, ${levelColor}, ${T.primaryContainer})`,
                  color: '#fff', fontSize: 16, fontWeight: 800, cursor: 'pointer', fontFamily: T.fontDisplay,
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
                  ...T.glass,
                  borderRadius: 12, padding: '8px 14px',
                  marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <span style={{ fontSize: 12, color: T.textMuted, fontFamily: T.fontBody }}>Session</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: T.text, fontFamily: T.fontBody }}>
                    {sessionCorrect}/{sessionCount}
                    <span style={{ color: T.textMuted, fontWeight: 400, fontSize: 11 }}> correct</span>
                  </span>
                </div>
              )}

              <div style={{
                ...T.glass,
                borderRadius: 20, padding: 20, marginBottom: 12,
                border: phase === 'result'
                  ? `2px solid ${correct ? T.green : T.pink}`
                  : `2px solid ${T.primaryBorder}`,
              }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700, color,
                      background: color + '22', borderRadius: 6, padding: '3px 8px', fontFamily: T.fontBody,
                    }}>
                      {TYPE_LABELS[problem.type]}
                    </span>
                    <span style={{
                      fontSize: 10, fontWeight: 700, fontFamily: T.fontBody,
                      color: problem.difficulty === 'easy' ? T.green : problem.difficulty === 'medium' ? T.amber : T.pink,
                    }}>
                      {problem.difficulty}
                    </span>
                  </div>
                  <span style={{ fontSize: 11, color: T.textMuted, fontFamily: T.fontBody }}>L{problem.level}</span>
                </div>

                {/* Timer */}
                {phase === 'answering' && (
                  <div style={{ marginBottom: 16 }}>
                    <TimerBar elapsedMs={elapsedMs} targetSeconds={targetSec} />
                  </div>
                )}

                {/* Question */}
                <div style={{
                  fontSize: 18, fontWeight: 700, color: T.text,
                  lineHeight: 1.4, marginBottom: 20, minHeight: 52, fontFamily: T.fontDisplay,
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
                        border: `2px solid ${T.primaryBorder}`,
                        background: T.surfaceContainerLow, color: T.text,
                        fontSize: 16, fontWeight: 600, outline: 'none',
                        boxSizing: 'border-box', marginBottom: 10, fontFamily: T.fontBody,
                      }}
                    />
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={submit}
                        disabled={!userAnswer.trim()}
                        style={{
                          flex: 1, padding: '12px', borderRadius: 12, border: 'none',
                          background: userAnswer.trim()
                            ? `linear-gradient(135deg, ${color}, ${T.primaryContainer})`
                            : T.surfaceContainer,
                          color: userAnswer.trim() ? '#fff' : T.textMuted,
                          fontSize: 14, fontWeight: 700, cursor: userAnswer.trim() ? 'pointer' : 'default', fontFamily: T.fontBody,
                        }}
                      >
                        Submit
                      </button>
                      <button
                        onClick={() => { if (!showHint) track('math_hint_used', { problem_type: problem.type, level: problem.level }); setShowHint(h => !h) }}
                        style={{
                          padding: '12px 16px', borderRadius: 12,
                          border: showHint ? `1px solid ${T.amberBorder}` : `1px solid ${T.border}`,
                          background: showHint ? T.amberLight : 'transparent',
                          color: showHint ? T.amber : T.textMuted,
                          fontSize: 13, cursor: 'pointer', fontFamily: T.fontBody,
                        }}
                      >
                        💡 Hint
                      </button>
                    </div>
                    <button
                      onClick={skip}
                      style={{
                        width: '100%', marginTop: 8, padding: '10px', borderRadius: 12,
                        border: `1px solid ${T.border}`, background: T.surfaceContainer,
                        color: T.textMuted, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: T.fontBody,
                      }}
                    >
                      I don't know — show answer
                    </button>
                    {showHint && (
                      <div style={{
                        marginTop: 10, background: T.amberLight, borderRadius: 10,
                        padding: '10px 12px', fontSize: 13, color: T.textSub, lineHeight: 1.5, fontFamily: T.fontBody,
                      }}>
                        <span style={{ fontWeight: 700, color: T.amber }}>Hint: </span>
                        {problem.hint}
                      </div>
                    )}
                  </div>
                )}

                {/* Result */}
                {phase === 'result' && (
                  <div>
                    <div style={{
                      background: correct ? 'rgba(132,204,22,0.12)' : 'rgba(244,63,94,0.10)',
                      border: `1px solid ${correct ? 'rgba(132,204,22,0.3)' : 'rgba(244,63,94,0.25)'}`,
                      borderRadius: 12, padding: '12px 14px', marginBottom: 12,
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: correct ? T.green : T.pink, fontFamily: T.fontBody }}>
                          {correct ? '✅ Correct!' : '❌ Not quite'}
                        </div>
                        {!correct && (
                          <div style={{ fontSize: 13, color: T.textSub, marginTop: 2, fontFamily: T.fontBody }}>
                            Answer: <span style={{ color: T.text, fontWeight: 700 }}>{problem.answer}</span>
                          </div>
                        )}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{
                          fontSize: 16, fontWeight: 800, fontFamily: T.fontDisplay,
                          color: finalMs / 1000 <= targetSec ? T.green : T.amber,
                        }}>
                          {(finalMs / 1000).toFixed(1)}s
                        </div>
                        <div style={{ fontSize: 10, color: T.textMuted, fontFamily: T.fontBody }}>target {targetSec}s</div>
                      </div>
                    </div>

                    {/* Quick explanation */}
                    <div style={{
                      background: T.surfaceContainer, borderRadius: 10, padding: '10px 14px',
                      fontSize: 13, color: T.textSub, lineHeight: 1.6, marginBottom: 10, fontFamily: T.fontBody,
                    }}>
                      <span style={{ fontWeight: 700, color: T.primary }}>How to think about it: </span>
                      {problem.hint}
                    </div>

                    {/* Further breakdown toggle */}
                    <button
                      onClick={() => setShowBreakdown(b => !b)}
                      style={{
                        width: '100%', padding: '9px', borderRadius: 10, marginBottom: 10,
                        border: showBreakdown ? `1px solid ${T.primaryBorder}` : `1px solid ${T.border}`,
                        background: showBreakdown ? T.primaryLight : 'transparent',
                        color: showBreakdown ? T.primary : T.textMuted,
                        fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: T.fontBody,
                      }}
                    >
                      {showBreakdown ? '▲ Hide breakdown' : '▼ Further breakdown'}
                    </button>

                    {showBreakdown && (
                      <div style={{
                        background: T.surfaceContainer, borderRadius: 10, padding: '12px 14px',
                        fontSize: 13, color: T.textSub, lineHeight: 1.7, marginBottom: 10,
                        borderLeft: `3px solid ${T.primary}`, fontFamily: T.fontBody,
                      }}>
                        <div style={{ fontWeight: 700, color: T.primary, marginBottom: 6 }}>Full explanation:</div>
                        {problem.explanation}
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => { setStarted(false); clearInterval(timerRef.current) }}
                        style={{
                          padding: '12px 16px', borderRadius: 12,
                          border: `1px solid ${T.border}`, background: T.surfaceContainer,
                          color: T.textSub, fontSize: 13, cursor: 'pointer', fontFamily: T.fontBody,
                        }}
                      >
                        ← Menu
                      </button>
                      <button
                        onClick={loadNextProblem}
                        style={{
                          flex: 1, padding: '12px', borderRadius: 12, border: 'none',
                          background: `linear-gradient(135deg, ${T.primary}, ${T.primaryContainer})`,
                          color: '#fff',
                          fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: T.fontBody,
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
