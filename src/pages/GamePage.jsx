import { useState, useEffect, useRef, useCallback } from 'react'
import SCENARIOS from '../data/scenarios.json'
import { FRAMEWORKS } from '../data/frameworks'
import { useProgress } from '../hooks/useProgress'
import { track } from '../utils/analytics'
import { T } from '../theme'

const ROUND_COUNT = 10
const TIMER_SECONDS = 30

const ALL_FRAMEWORK_NAMES = FRAMEWORKS.map(f => f.name)

function pickOptions(correctFrameworks) {
  const primary = correctFrameworks[0]
  const wrong = ALL_FRAMEWORK_NAMES.filter(n => !correctFrameworks.includes(n))
  const distractors = wrong.sort(() => Math.random() - 0.5).slice(0, 3)
  return [primary, ...distractors].sort(() => Math.random() - 0.5)
}

function pickScenarios() {
  return [...SCENARIOS].sort(() => Math.random() - 0.5).slice(0, ROUND_COUNT)
}

function TimerBar({ secondsLeft, total }) {
  const pct = (secondsLeft / total) * 100
  const color =
    secondsLeft <= 3 ? T.pink :
    secondsLeft <= 6 ? T.amber :
    T.primary
  const glow =
    secondsLeft <= 3
      ? '0 0 8px rgba(244,63,94,0.5)'
      : '0 0 6px rgba(70,72,212,0.3)'
  return (
    <div style={{
      background: T.border,
      borderRadius: 999,
      height: 8,
      marginBottom: 16,
      overflow: 'hidden',
    }}>
      <div style={{
        height: '100%',
        borderRadius: 999,
        width: `${pct}%`,
        background: color,
        boxShadow: glow,
        transition: 'width 1s linear, background 0.3s',
      }} />
    </div>
  )
}

function OptionCard({ label, state, onClick }) {
  const style =
    state === 'correct'
      ? {
          background: 'rgba(132,204,22,0.12)',
          border: '2px solid #84CC16',
          color: T.text,
        }
      : state === 'wrong'
      ? {
          background: 'rgba(244,63,94,0.08)',
          border: '2px solid #F43F5E',
          color: T.text,
        }
      : {
          background: 'rgba(255,255,255,0.80)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.55)',
          color: T.text,
        }

  const icon =
    state === 'correct' ? '✅ ' :
    state === 'wrong'   ? '❌ ' : ''

  return (
    <button
      onClick={onClick}
      disabled={state !== 'idle'}
      style={{
        width: '100%',
        padding: '14px 16px',
        borderRadius: T.r.lg,
        fontSize: 14,
        fontWeight: 600,
        textAlign: 'left',
        cursor: state === 'idle' ? 'pointer' : 'default',
        marginBottom: 10,
        transition: 'background 0.2s, border 0.2s',
        lineHeight: 1.4,
        fontFamily: T.fontBody,
        ...style,
      }}
    >
      {icon}{label}
    </button>
  )
}

function StartScreen({ progress, onStart }) {
  const { game, frameworks } = progress
  const knowCount = Object.values(frameworks.cardProgress).filter(v => v === 'know').length
  const gameAccuracy = (() => {
    const all = Object.values(game.byScenarioType)
    if (!all.length) return null
    const total = all.reduce((a, s) => a + s.attempts, 0)
    const correct = all.reduce((a, s) => a + s.correct, 0)
    return total ? Math.round((correct / total) * 100) : null
  })()

  return (
    <div style={{ padding: '24px 20px', maxWidth: 440, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{
          fontFamily: T.fontDisplay,
          fontSize: 28,
          fontWeight: 800,
          color: T.primary,
          marginBottom: 6,
        }}>
          Framework Match
        </div>
        <div style={{ fontSize: 14, color: T.textSub, lineHeight: 1.5 }}>
          Read the scenario. Pick the right framework.<br />10 rounds · 30-second countdown each.
        </div>
      </div>

      <div style={{
        ...T.glass,
        borderRadius: T.r.lg,
        padding: 16,
        marginBottom: 24,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: 12,
        boxShadow: T.shadow.sm,
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: T.primary, fontFamily: T.fontDisplay }}>
            {game.streakDays}
          </div>
          <div style={{ fontSize: 10, color: T.textMuted, marginTop: 2 }}>Day Streak</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: T.green, fontFamily: T.fontDisplay }}>
            {gameAccuracy !== null ? `${gameAccuracy}%` : '—'}
          </div>
          <div style={{ fontSize: 10, color: T.textMuted, marginTop: 2 }}>Accuracy</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: T.primary, fontFamily: T.fontDisplay }}>
            {knowCount}
          </div>
          <div style={{ fontSize: 10, color: T.textMuted, marginTop: 2 }}>Frameworks Known</div>
        </div>
      </div>

      <button
        onClick={onStart}
        style={{
          width: '100%',
          padding: '16px',
          borderRadius: T.r.lg,
          border: 'none',
          background: `linear-gradient(135deg, ${T.primary}, ${T.primaryContainer})`,
          color: '#fff',
          fontSize: 16,
          fontWeight: 800,
          fontFamily: T.fontDisplay,
          cursor: 'pointer',
          letterSpacing: 0.3,
          boxShadow: T.shadow.primary,
        }}
      >
        Start Session →
      </button>
    </div>
  )
}

function SessionEnd({ rounds, onRestart }) {
  const correct = rounds.filter(r => r.correct).length
  const pct = Math.round((correct / rounds.length) * 100)
  const avgMs = Math.round(rounds.reduce((a, r) => a + r.timeMs, 0) / rounds.length)
  const grade = pct >= 90 ? '🏆' : pct >= 70 ? '💪' : pct >= 50 ? '📈' : '🔁'

  return (
    <div style={{ padding: '24px 20px', maxWidth: 440, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 52, marginBottom: 8 }}>{grade}</div>
        <div style={{
          fontSize: 26,
          fontWeight: 800,
          color: T.primary,
          fontFamily: T.fontDisplay,
        }}>
          {pct}%
        </div>
        <div style={{ fontSize: 14, color: T.textSub, marginTop: 4 }}>
          {correct} of {rounds.length} correct · avg {(avgMs / 1000).toFixed(1)}s
        </div>
      </div>

      <div style={{
        ...T.glass,
        borderRadius: T.r.lg,
        padding: 16,
        marginBottom: 24,
        boxShadow: T.shadow.sm,
      }}>
        {rounds.map((r, i) => (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
            paddingBottom: i < rounds.length - 1 ? 12 : 0,
            marginBottom: i < rounds.length - 1 ? 12 : 0,
            borderBottom: i < rounds.length - 1 ? `1px solid ${T.border}` : 'none',
          }}>
            <span style={{ fontSize: 14, flexShrink: 0 }}>{r.correct ? '✅' : '❌'}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 12,
                fontWeight: 700,
                color: T.text,
                lineHeight: 1.3,
              }}>
                {r.scenario.brand}
              </div>
              <div style={{ fontSize: 11, color: r.correct ? '#84CC16' : '#F43F5E', marginTop: 2 }}>
                {r.chosen} {!r.correct && <span style={{ color: T.textSub }}>→ {r.correct_fw}</span>}
              </div>
            </div>
            <span style={{ fontSize: 11, color: T.textMuted, flexShrink: 0 }}>
              {(r.timeMs / 1000).toFixed(1)}s
            </span>
          </div>
        ))}
      </div>

      <button
        onClick={onRestart}
        style={{
          width: '100%',
          padding: '16px',
          borderRadius: T.r.lg,
          border: 'none',
          background: `linear-gradient(135deg, ${T.primary}, ${T.primaryContainer})`,
          color: '#fff',
          fontSize: 16,
          fontWeight: 800,
          fontFamily: T.fontDisplay,
          cursor: 'pointer',
          boxShadow: T.shadow.primary,
        }}
      >
        Play Again →
      </button>
    </div>
  )
}

export default function GamePage() {
  const { progress, recordGameResult } = useProgress()
  const [gameState, setGameState] = useState('start') // 'start' | 'playing' | 'session_end'
  const [scenarios, setScenarios] = useState([])
  const [roundIndex, setRoundIndex] = useState(0)
  const [options, setOptions] = useState([])
  const [chosen, setChosen] = useState(null)     // chosen framework name
  const [revealed, setRevealed] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(TIMER_SECONDS)
  const [rounds, setRounds] = useState([])        // completed round results
  const startTimeRef = useRef(null)
  const timerRef = useRef(null)

  const scenario = scenarios[roundIndex]

  const finishRound = useCallback((chosenName, timedOut) => {
    if (!scenario) return
    clearInterval(timerRef.current)
    const timeMs = Date.now() - startTimeRef.current
    const correctFrameworks = scenario.correctFrameworks || []
    const isCorrect = !timedOut && correctFrameworks.includes(chosenName)

    recordGameResult({
      scenarioId: scenario.id,
      scenarioType: scenario.scenarioType,
      frameworks: chosenName ? [chosenName] : [],
      correct: isCorrect,
      timeMs,
    })
    if (timedOut) track('game_timed_out', { scenario_type: scenario.scenarioType, round: roundIndex + 1 })

    setRounds(prev => [...prev, {
      scenario,
      chosen: timedOut ? '(time up)' : chosenName,
      correct: isCorrect,
      correct_fw: correctFrameworks[0],
      timeMs,
    }])
    setChosen(timedOut ? null : chosenName)
    setRevealed(true)
  }, [scenario, recordGameResult])

  // Keep a ref to the latest finishRound so the timer effect doesn't
  // need it as a dependency (avoids resetting the timer on every render)
  const finishRoundRef = useRef(finishRound)
  useEffect(() => { finishRoundRef.current = finishRound }, [finishRound])

  useEffect(() => {
    if (gameState !== 'playing' || revealed) return
    startTimeRef.current = Date.now()
    setSecondsLeft(TIMER_SECONDS)
    timerRef.current = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) {
          clearInterval(timerRef.current)
          finishRoundRef.current(null, true)
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [gameState, roundIndex, revealed])

  const startGame = () => {
    const picked = pickScenarios()
    setScenarios(picked)
    setRoundIndex(0)
    setOptions(pickOptions(picked[0].correctFrameworks || []))
    setChosen(null)
    setRevealed(false)
    setRounds([])
    setGameState('playing')
    track('game_started')
  }

  const handleChoice = (name) => {
    if (revealed) return
    const correctFrameworks = scenario?.correctFrameworks || []
    track('game_answer_selected', { chosen: name, correct: correctFrameworks.includes(name), scenario_type: scenario?.scenarioType, round: roundIndex + 1 })
    finishRound(name, false)
  }

  const nextRound = () => {
    const next = roundIndex + 1
    if (next >= ROUND_COUNT) {
      const correct = rounds.filter(r => r.correct).length + (rounds.length < ROUND_COUNT ? 0 : 0)
      track('game_completed', { correct_count: rounds.filter(r => r.correct).length, total: ROUND_COUNT, accuracy_pct: Math.round((rounds.filter(r => r.correct).length / ROUND_COUNT) * 100) })
      setGameState('session_end')
      return
    }
    setRoundIndex(next)
    setOptions(pickOptions(scenarios[next].correctFrameworks || []))
    setChosen(null)
    setRevealed(false)
  }

  if (gameState === 'start') {
    return <StartScreen progress={progress} onStart={startGame} />
  }

  if (gameState === 'session_end') {
    return <SessionEnd rounds={rounds} onRestart={() => setGameState('start')} />
  }

  if (!scenario) return null

  const correctFrameworks = scenario.correctFrameworks || []
  const primaryCorrect = correctFrameworks[0]

  const timerColor =
    secondsLeft <= 3 ? T.pink :
    secondsLeft <= 6 ? T.amber :
    T.primary

  return (
    <div style={{ padding: '16px 20px 32px', maxWidth: 440, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{
          fontSize: 12,
          fontWeight: 700,
          color: T.textMuted,
          fontFamily: T.fontBody,
          letterSpacing: 1,
        }}>
          ROUND {roundIndex + 1} / {ROUND_COUNT}
        </div>
        <div style={{
          fontSize: 13,
          fontWeight: 800,
          color: timerColor,
          fontFamily: T.fontBody,
          transition: 'color 0.3s',
        }}>
          {secondsLeft}s
        </div>
      </div>

      {/* Timer bar */}
      <TimerBar secondsLeft={secondsLeft} total={TIMER_SECONDS} />

      {/* Round progress dots */}
      <div style={{ display: 'flex', gap: 5, marginBottom: 20, justifyContent: 'center' }}>
        {scenarios.map((_, i) => {
          const done = rounds[i]
          const color =
            done ? (done.correct ? T.green : T.pink) :
            i === roundIndex ? T.primary :
            T.border
          return (
            <div
              key={i}
              style={{
                width: i === roundIndex ? 18 : 6,
                height: 6,
                borderRadius: 3,
                background: color,
                transition: 'all 0.2s',
              }}
            />
          )
        })}
      </div>

      {/* Scenario card */}
      <div style={{
        ...T.glass,
        borderRadius: T.r.lg,
        padding: '16px 16px',
        marginBottom: 20,
        borderLeft: `4px solid ${T.primary}`,
        boxShadow: T.shadow.sm,
      }}>
        <div style={{
          fontSize: 10,
          fontWeight: 700,
          color: T.primary,
          letterSpacing: 1,
          marginBottom: 8,
          fontFamily: T.fontBody,
        }}>
          {scenario.scenarioType?.toUpperCase() || 'SCENARIO'}
        </div>
        <div style={{
          fontSize: 13,
          fontWeight: 700,
          color: T.text,
          marginBottom: 8,
          fontFamily: T.fontDisplay,
        }}>
          {scenario.brand}
        </div>
        <div style={{
          fontFamily: T.fontDisplay,
          fontSize: 18,
          color: T.textSub,
          lineHeight: 1.5,
        }}>
          {scenario.prompt}
        </div>
      </div>

      {/* Framework options */}
      <div style={{ marginBottom: 16 }}>
        {options.map(name => {
          let state = 'idle'
          if (revealed) {
            if (correctFrameworks.includes(name)) state = 'correct'
            else if (name === chosen) state = 'wrong'
            else state = 'idle'
          }
          return (
            <OptionCard
              key={name}
              label={name}
              state={state}
              onClick={() => handleChoice(name)}
            />
          )
        })}
      </div>

      {/* Reveal / explanation */}
      {revealed && (
        <div style={{
          background: T.surfaceContainer,
          borderRadius: T.r.lg,
          padding: '14px 16px',
          marginBottom: 16,
        }}>
          {chosen === null ? (
            <div style={{
              fontSize: 13,
              color: T.pink,
              fontWeight: 700,
              marginBottom: 6,
              fontFamily: T.fontBody,
            }}>
              ⏱ Time's up!
            </div>
          ) : null}
          <div style={{
            fontSize: 11,
            fontWeight: 700,
            color: T.green,
            letterSpacing: 1,
            marginBottom: 4,
            fontFamily: T.fontBody,
          }}>
            CORRECT: {primaryCorrect}
          </div>
          <div style={{
            fontSize: 12,
            color: T.textSub,
            lineHeight: 1.5,
            fontFamily: T.fontBody,
          }}>
            {scenario.whyThisFramework || 'Review this framework in the Frameworks tab.'}
          </div>
        </div>
      )}

      {revealed && (
        <button
          onClick={nextRound}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: T.r.lg,
            border: 'none',
            background: `linear-gradient(135deg, ${T.primary}, ${T.primaryContainer})`,
            color: '#fff',
            fontSize: 15,
            fontWeight: 800,
            fontFamily: T.fontDisplay,
            cursor: 'pointer',
            boxShadow: T.shadow.primary,
          }}
        >
          {roundIndex + 1 >= ROUND_COUNT ? 'See Results →' : 'Next Round →'}
        </button>
      )}
    </div>
  )
}
