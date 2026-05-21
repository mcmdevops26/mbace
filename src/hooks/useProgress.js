import { useLocalStorage } from './useLocalStorage'

const INITIAL_PROGRESS = {
  // Game stats
  game: {
    scenariosCompleted: [],   // array of scenario IDs completed
    sessionHistory: [],        // [{ date, correct, total, durationMs }]
    streakDays: 0,
    lastPlayedDate: null,
    byScenarioType: {},        // { "Private Label": { attempts, correct } }
    byFramework: {},           // { "3C's": { attempts, correct } }
  },
  // Flashcard / framework recall
  frameworks: {
    cardProgress: {},          // { frameworkId: 'know' | 'unsure' | 'again' }
    lastReviewed: {},          // { frameworkId: ISO date string }
  },
  // Cases
  cases: {
    viewed: [],                // scenario IDs opened
    selfRatings: {},           // { scenarioId: { csai: {C,S,A,I}, overall: 1|2|3, date } }
  },
  // Math drills
  math: {
    byType: {},                // { type: { attempts, correct, avgTimeMs, bestTimeMs, recentTimes: [] } }
    sessionHistory: [],        // [{ date, problems: [{id, correct, timeMs}] }]
    totalProblems: 0,
    streakDays: 0,
    lastPlayedDate: null,
  },
  // Meta
  meta: {
    installDate: null,
    version: '1.0',
  },
}

export function useProgress() {
  const [progress, setProgress] = useLocalStorage('mba_prep_progress', INITIAL_PROGRESS)

  // ── Game actions ──────────────────────────────────────────────
  const recordGameResult = ({ scenarioId, scenarioType, frameworks, correct, timeMs }) => {
    setProgress(prev => {
      const game = { ...prev.game }

      // Mark scenario as completed
      if (!game.scenariosCompleted.includes(scenarioId)) {
        game.scenariosCompleted = [...game.scenariosCompleted, scenarioId]
      }

      // By scenario type
      const typeStat = game.byScenarioType[scenarioType] || { attempts: 0, correct: 0 }
      game.byScenarioType = {
        ...game.byScenarioType,
        [scenarioType]: {
          attempts: typeStat.attempts + 1,
          correct: typeStat.correct + (correct ? 1 : 0),
        },
      }

      // By framework chosen
      const byFramework = { ...game.byFramework }
      frameworks.forEach(fw => {
        const stat = byFramework[fw] || { attempts: 0, correct: 0 }
        byFramework[fw] = {
          attempts: stat.attempts + 1,
          correct: stat.correct + (correct ? 1 : 0),
        }
      })
      game.byFramework = byFramework

      // Streak
      const today = new Date().toDateString()
      if (game.lastPlayedDate !== today) {
        const yesterday = new Date(Date.now() - 86400000).toDateString()
        game.streakDays = game.lastPlayedDate === yesterday ? game.streakDays + 1 : 1
        game.lastPlayedDate = today
      }

      return { ...prev, game }
    })
  }

  // ── Framework flashcard actions ───────────────────────────────
  const rateFrameworkCard = (frameworkId, rating) => {
    setProgress(prev => ({
      ...prev,
      frameworks: {
        ...prev.frameworks,
        cardProgress: { ...prev.frameworks.cardProgress, [frameworkId]: rating },
        lastReviewed: { ...prev.frameworks.lastReviewed, [frameworkId]: new Date().toISOString() },
      },
    }))
  }

  // ── Case actions ──────────────────────────────────────────────
  const markCaseViewed = (scenarioId) => {
    setProgress(prev => {
      if (prev.cases.viewed.includes(scenarioId)) return prev
      return { ...prev, cases: { ...prev.cases, viewed: [...prev.cases.viewed, scenarioId] } }
    })
  }

  const rateCaseSelf = (scenarioId, ratings) => {
    setProgress(prev => ({
      ...prev,
      cases: {
        ...prev.cases,
        selfRatings: {
          ...prev.cases.selfRatings,
          [scenarioId]: { ...ratings, date: new Date().toISOString() },
        },
      },
    }))
  }

  // ── Math actions ──────────────────────────────────────────────
  const recordMathResult = ({ problemId, type, correct, timeMs }) => {
    setProgress(prev => {
      const math = { ...prev.math }
      const existing = math.byType[type] || { attempts: 0, correct: 0, avgTimeMs: 0, bestTimeMs: null, recentTimes: [] }
      const recentTimes = [...existing.recentTimes.slice(-9), timeMs]
      const avgTimeMs = Math.round(recentTimes.reduce((a, b) => a + b, 0) / recentTimes.length)
      const bestTimeMs = correct ? Math.min(existing.bestTimeMs ?? Infinity, timeMs) : existing.bestTimeMs

      math.byType = {
        ...math.byType,
        [type]: {
          attempts: existing.attempts + 1,
          correct: existing.correct + (correct ? 1 : 0),
          avgTimeMs,
          bestTimeMs,
          recentTimes,
        },
      }
      math.totalProblems = (math.totalProblems || 0) + 1

      // Streak
      const today = new Date().toDateString()
      if (math.lastPlayedDate !== today) {
        const yesterday = new Date(Date.now() - 86400000).toDateString()
        math.streakDays = math.lastPlayedDate === yesterday ? (math.streakDays || 0) + 1 : 1
        math.lastPlayedDate = today
      }

      return { ...prev, math }
    })
  }

  // ── Derived stats ─────────────────────────────────────────────
  const getWeakestScenarioTypes = () => {
    const types = progress.game.byScenarioType
    return Object.entries(types)
      .filter(([, s]) => s.attempts >= 3)
      .map(([type, s]) => ({ type, accuracy: s.correct / s.attempts }))
      .sort((a, b) => a.accuracy - b.accuracy)
  }

  const getWeakestMathTypes = () => {
    const types = progress.math.byType
    return Object.entries(types)
      .filter(([, s]) => s.attempts >= 3)
      .map(([type, s]) => ({ type, accuracy: s.correct / s.attempts, avgTimeMs: s.avgTimeMs }))
      .sort((a, b) => a.accuracy - b.accuracy)
  }

  const getGameAccuracy = () => {
    const all = Object.values(progress.game.byScenarioType)
    if (!all.length) return null
    const total = all.reduce((a, s) => a + s.attempts, 0)
    const correct = all.reduce((a, s) => a + s.correct, 0)
    return total ? Math.round((correct / total) * 100) : null
  }

  const getMathAccuracy = (type) => {
    const s = progress.math.byType[type]
    if (!s || !s.attempts) return null
    return Math.round((s.correct / s.attempts) * 100)
  }

  const getScenariosRemaining = (totalScenarios = 100) => {
    return totalScenarios - progress.game.scenariosCompleted.length
  }

  return {
    progress,
    // Game
    recordGameResult,
    getWeakestScenarioTypes,
    getGameAccuracy,
    getScenariosRemaining,
    // Frameworks
    rateFrameworkCard,
    // Cases
    markCaseViewed,
    rateCaseSelf,
    // Math
    recordMathResult,
    getWeakestMathTypes,
    getMathAccuracy,
  }
}
