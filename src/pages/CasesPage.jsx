import { useState, useRef, useEffect } from 'react'
import SCENARIOS from '../data/scenarios.json'
import { useProgress } from '../hooks/useProgress'
import { track } from '../utils/analytics'
import { T } from '../theme'

const DIFFICULTY_COLOR = { easy: '#84CC16', medium: '#F59E0B', hard: '#F43F5E' }

const LEVELS = [
  { key: 'easy',   label: 'Beginner',     emoji: '🟢', desc: 'Core frameworks, clean data', color: '#22c55e' },
  { key: 'medium', label: 'Intermediate', emoji: '🟡', desc: 'Multiple frameworks, some ambiguity', color: '#f59e0b' },
  { key: 'hard',   label: 'Advanced',     emoji: '🔴', desc: 'Complex math, real nuance', color: '#ef4444' },
]

// Core marketing case categories — most frequently tested
const BEENA_CORE = [
  'Private Label Competition',
  'Shrinking Category',
  'Competitive Threat',
  'Pricing Strategy',
  'New Product Launch',
  'Profit Growth/Decline',
  'Market Sizing',
  'Ad Evaluation',
]
const CSAI_LABELS = { C: 'Conclusion', S: 'Situation', A: 'Analysis', I: 'Implication' }

const TYPE_COLORS = {
  'Private Label Competition': '#6366f1',
  'Shrinking Category': '#f59e0b',
  'Competitive Threat': '#ef4444',
  'Pricing Strategy': '#3b82f6',
  'New Product Launch': '#10b981',
  'Profit Growth/Decline': '#f97316',
  'Market Sizing': '#8b5cf6',
  'Ad Evaluation': '#ec4899',
  'Growth Strategy': '#06b6d4',
  'New Market Entry': '#84cc16',
  'Profitability': '#fb923c',
  'Acquisition': '#a855f7',
  'General Strategy': '#64748b',
  'Product Management/Tech': '#14b8a6',
  'Corporate Finance': '#e11d48',
}

function getTypeColor(type) {
  return TYPE_COLORS[type] || '#475569'
}

const ALL_TYPES = [...new Set(SCENARIOS.map(s => s.type))].sort()

// ── Audio Recorder ────────────────────────────────────────────────────────────
// ── IndexedDB helpers for audio persistence ───────────────────────────────────
const openAudioDB = () => new Promise((resolve, reject) => {
  const req = indexedDB.open('mbace_audio', 1)
  req.onupgradeneeded = e => e.target.result.createObjectStore('recordings')
  req.onsuccess = e => resolve(e.target.result)
  req.onerror = reject
})
const dbSave = async (key, val) => {
  const db = await openAudioDB()
  return new Promise((res, rej) => {
    const tx = db.transaction('recordings', 'readwrite')
    tx.objectStore('recordings').put(val, key)
    tx.oncomplete = res; tx.onerror = rej
  })
}
const dbLoad = async (key) => {
  const db = await openAudioDB()
  return new Promise((res, rej) => {
    const tx = db.transaction('recordings', 'readonly')
    const req = tx.objectStore('recordings').get(key)
    req.onsuccess = e => res(e.target.result || null)
    req.onerror = rej
  })
}
const dbDelete = async (key) => {
  const db = await openAudioDB()
  return new Promise((res, rej) => {
    const tx = db.transaction('recordings', 'readwrite')
    tx.objectStore('recordings').delete(key)
    tx.oncomplete = res; tx.onerror = rej
  })
}

function AudioRecorder({ scenarioId, scenarioTitle }) {
  const [recState, setRecState] = useState('idle') // idle | recording | stopped
  const [audioUrl, setAudioUrl]   = useState(null)
  const [hasSaved, setHasSaved]   = useState(false)
  const [seconds, setSeconds]     = useState(0)
  const [note, setNote]           = useState(() => localStorage.getItem(`mbace_note_${scenarioId}`) || '')
  const mediaRef  = useRef(null)
  const chunksRef = useRef([])
  const timerRef  = useRef(null)

  // Load saved recording from IndexedDB on mount
  useEffect(() => {
    dbLoad(scenarioId).then(url => {
      if (url) { setAudioUrl(url); setHasSaved(true); setRecState('stopped') }
    }).catch(() => {})
    return () => clearInterval(timerRef.current)
  }, [scenarioId])

  const saveNote = (val) => {
    setNote(val)
    localStorage.setItem(`mbace_note_${scenarioId}`, val)
  }

  const startRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      alert('Recording is not supported in this browser. Try Safari 14.3+ or Chrome.')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mimeType =
        MediaRecorder.isTypeSupported('audio/mp4')  ? 'audio/mp4'  :
        MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : ''
      const mr = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream)
      mediaRef.current = mr
      chunksRef.current = []
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mr.mimeType || 'audio/mp4' })
        stream.getTracks().forEach(t => t.stop())
        const reader = new FileReader()
        reader.onloadend = () => {
          const dataUrl = reader.result
          setAudioUrl(dataUrl)
          setRecState('stopped')
          // Auto-save to IndexedDB
          dbSave(scenarioId, dataUrl).then(() => { setHasSaved(true); track('recording_saved', { scenario_id: scenarioId }) }).catch(() => {})
        }
        reader.readAsDataURL(blob)
      }
      mr.start(250)
      setRecState('recording')
      setSeconds(0)
      timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000)
      track('recording_started', { scenario_id: scenarioId })
    } catch (err) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        alert('Microphone access denied. Go to Settings → Safari → Microphone and allow access.')
      } else {
        alert('Could not start recording: ' + err.message)
      }
    }
  }

  const stopRecording = () => {
    clearInterval(timerRef.current)
    mediaRef.current?.stop()
  }

  const deleteRecording = () => {
    dbDelete(scenarioId).catch(() => {})
    setAudioUrl(null)
    setHasSaved(false)
    setRecState('idle')
    setSeconds(0)
  }

  const shareRecording = async () => {
    if (!audioUrl) return
    try {
      // Convert base64 data URL → Uint8Array → Blob without fetch (works on iOS)
      const [header, b64] = audioUrl.split(',')
      const mime = header.match(/:(.*?);/)?.[1] || 'audio/mp4'
      const binary = atob(b64)
      const bytes = new Uint8Array(binary.length)
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
      const blob = new Blob([bytes], { type: mime })
      const ext  = mime.includes('mp4') ? 'm4a' : 'webm'
      const name = `MBAce - ${scenarioTitle || scenarioId}.${ext}`
      const file = new File([blob], name, { type: mime })

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: name })
        track('recording_shared', { scenario_id: scenarioId, method: 'file' })
      } else if (navigator.share) {
        // Share without file (fallback for older iOS) — shares a text note instead
        await navigator.share({ title: 'MBAce Recording', text: `Practice recording for: ${scenarioTitle || scenarioId}` })
      } else {
        // Desktop fallback: trigger download
        const a = document.createElement('a')
        a.href = audioUrl
        a.download = name
        a.click()
      }
    } catch (err) {
      if (err.name !== 'AbortError') alert('Could not share: ' + err.message)
    }
  }

  const fmt = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  return (
    <div style={{
      background: 'rgba(255,255,255,0.80)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: '1px solid rgba(255,255,255,0.55)',
      boxShadow: '0 4px 20px rgba(70,72,212,0.10)',
      borderRadius: T.r.lg,
      padding: '12px 14px',
      marginTop: 12,
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: T.primary, letterSpacing: 1, marginBottom: 10, fontFamily: T.fontBody }}>
        🎙 PRACTICE RECORDING
      </div>

      {recState === 'idle' && (
        <button onClick={startRecording} style={{
          width: '100%', padding: '10px', borderRadius: 10,
          border: `2px solid ${T.primary}`, background: T.primaryLight,
          color: T.primary, fontSize: 13, fontWeight: 700, cursor: 'pointer',
        }}>
          Start Recording
        </button>
      )}

      {recState === 'recording' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            className="recording-pulse"
            style={{ background: T.green, borderRadius: '50%', width: 12, height: 12 }}
          />
          <span style={{ color: T.pink, fontWeight: 700, fontSize: 13, flex: 1 }}>Recording {fmt(seconds)}</span>
          <button onClick={stopRecording} style={{
            padding: '8px 16px', borderRadius: 8, border: 'none',
            background: T.pink, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
          }}>Stop</button>
        </div>
      )}

      {recState === 'stopped' && audioUrl && (
        <div>
          {hasSaved && (
            <div style={{ fontSize: 10, color: T.green, marginBottom: 6, fontWeight: 600 }}>
              ✓ Saved to this device
            </div>
          )}
          <div style={{ background: T.surfaceContainer, borderRadius: T.r.md, padding: '6px', marginBottom: 8 }}>
            <audio controls playsInline src={audioUrl} style={{ width: '100%' }} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={shareRecording} style={{
              flex: 1, padding: '8px', borderRadius: 8,
              border: `1px solid ${T.primary}`, background: T.primaryLight,
              color: T.primary, fontSize: 12, fontWeight: 700, cursor: 'pointer',
            }}>⬆ Share</button>
            <button onClick={startRecording} style={{
              flex: 1, padding: '8px', borderRadius: 8,
              border: `1px solid ${T.border}`, background: T.surfaceContainer,
              color: T.textSub, fontSize: 12, cursor: 'pointer',
            }}>Re-record</button>
            <button onClick={deleteRecording} style={{
              padding: '8px 12px', borderRadius: 8,
              border: `1px solid ${T.border}`, background: T.surfaceContainer,
              color: T.textMuted, fontSize: 12, cursor: 'pointer',
            }}>🗑</button>
          </div>
        </div>
      )}

      {/* Notes */}
      <div style={{ marginTop: 12 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, letterSpacing: 1, marginBottom: 6 }}>
          📝 NOTES
        </div>
        <textarea
          value={note}
          onChange={e => saveNote(e.target.value)}
          onBlur={() => { if (note.trim()) track('note_saved', { scenario_id: scenarioId }) }}
          placeholder="What would you do differently? Key terms to review..."
          rows={3}
          style={{
            width: '100%', boxSizing: 'border-box',
            background: T.softGrey, border: `1px solid ${T.border}`,
            borderRadius: T.r.md, padding: '8px 10px',
            color: T.text, fontSize: 12, lineHeight: 1.5,
            resize: 'vertical', outline: 'none', fontFamily: 'inherit',
          }}
        />
      </div>
    </div>
  )
}

// ── CSAI Self-Rating ──────────────────────────────────────────────────────────
function CSAIRating({ scenarioId, existing, onRate }) {
  const [ratings, setRatings] = useState(existing?.csai || { C: 0, S: 0, A: 0, I: 0 })
  const [overall, setOverall] = useState(existing?.overall || 0)
  const [saved, setSaved] = useState(!!existing)

  const handleSave = () => {
    if (!overall) return
    onRate(scenarioId, { csai: ratings, overall })
    setSaved(true)
    track('csai_rated', { scenario_id: scenarioId, overall, ...ratings })
  }

  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, letterSpacing: 1, marginBottom: 10 }}>
        CSAI SELF-RATING
      </div>

      {Object.entries(CSAI_LABELS).map(([key, label]) => (
        <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{ width: 80, fontSize: 12, color: T.textSub }}>
            <span style={{ fontWeight: 700, color: T.primary }}>{key}</span> {label}
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {[1, 2, 3].map(v => (
              <button
                key={v}
                onClick={() => { setRatings(r => ({ ...r, [key]: v })); setSaved(false) }}
                style={{
                  width: 30, height: 30, borderRadius: 8,
                  border: ratings[key] === v ? `2px solid ${T.primary}` : `2px solid ${T.border}`,
                  background: ratings[key] === v ? T.primaryLight : 'transparent',
                  color: ratings[key] === v ? T.primary : T.textMuted,
                  fontSize: 13, fontWeight: 700, cursor: 'pointer',
                }}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      ))}

      <div style={{ marginTop: 12, marginBottom: 10 }}>
        <div style={{ fontSize: 12, color: T.textSub, marginBottom: 6 }}>Overall confidence</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { v: 1, label: 'Struggled', color: T.pink },
            { v: 2, label: 'OK', color: T.amber },
            { v: 3, label: 'Nailed It', color: T.green },
          ].map(({ v, label, color }) => (
            <button
              key={v}
              onClick={() => { setOverall(v); setSaved(false) }}
              style={{
                flex: 1, padding: '8px 4px', borderRadius: 10,
                border: overall === v ? `2px solid ${color}` : `2px solid ${T.border}`,
                background: overall === v ? color + '22' : 'transparent',
                color: overall === v ? color : T.textMuted,
                fontSize: 12, fontWeight: 700, cursor: 'pointer',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {!saved && (
        <button
          onClick={handleSave}
          disabled={!overall}
          style={{
            width: '100%', padding: '10px', borderRadius: 10,
            border: 'none',
            background: overall ? T.green : T.surfaceContainer,
            color: overall ? '#fff' : T.textMuted,
            fontSize: 13, fontWeight: 700, cursor: overall ? 'pointer' : 'default',
          }}
        >
          Save Rating
        </button>
      )}
      {saved && (
        <div style={{ textAlign: 'center', fontSize: 13, color: T.green, fontWeight: 700 }}>
          ✓ Saved
        </div>
      )}
    </div>
  )
}

// ── Sample Response ───────────────────────────────────────────────────────────
function SampleResponse({ response, color }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div style={{
      background: 'rgba(255,255,255,0.80)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: `1px solid ${color}33`,
      boxShadow: '0 4px 20px rgba(70,72,212,0.10)',
      borderRadius: 12,
      marginBottom: 12,
      overflow: 'hidden',
    }}>
      <button
        onClick={() => setExpanded(e => !e)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 14px', background: 'none', border: 'none', cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16 }}>🎤</span>
          <span style={{ fontSize: 11, fontWeight: 700, color, letterSpacing: 1 }}>
            SAMPLE VERBAL RESPONSE
          </span>
        </div>
        <span style={{ fontSize: 12, color: T.textMuted }}>{expanded ? '▲ collapse' : '▼ show'}</span>
      </button>

      {expanded && (
        <div style={{ padding: '0 14px 14px' }}>
          {response.map((section, i) => (
            <div key={i} style={{
              marginBottom: i < response.length - 1 ? 16 : 0,
              paddingBottom: i < response.length - 1 ? 16 : 0,
              borderBottom: i < response.length - 1 ? `1px solid ${T.border}` : 'none',
            }}>
              <div style={{
                fontSize: 10, fontWeight: 800, color, letterSpacing: 1,
                marginBottom: 6, textTransform: 'uppercase',
              }}>
                {section.label}
              </div>
              <div style={{
                fontSize: 13, color: T.textSub, lineHeight: 1.7,
                fontStyle: 'italic',
                paddingLeft: 12,
                borderLeft: `2px solid ${color}55`,
              }}>
                "{section.script}"
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Section toggle button + content ──────────────────────────────────────────
const COACHING_SECTIONS = [
  { key: 'clarify',     label: 'Clarification',          emoji: '🧠', color: '#6366f1' },
  { key: 'mece',        label: 'MECE Structure',          emoji: '🗂',  color: '#8b5cf6' },
  { key: 'stepByStep',  label: 'Step by Step',            emoji: '📋', color: '#06b6d4' },
  { key: 'keyTerms',    label: 'Key Terms',               emoji: '📖', color: '#f59e0b' },
  { key: 'frameworks',  label: 'Frameworks',              emoji: '✅', color: '#22c55e' },
  { key: 'northStar',   label: 'North Star',              emoji: '🎯', color: '#3b82f6' },
  { key: 'sample',      label: 'Sample Response',         emoji: '🎤', color: '#ec4899' },
]

function SectionToggle({ sectionKey, label, emoji, color, open, onToggle, hasContent }) {
  if (!hasContent) return null
  return (
    <button
      onClick={onToggle}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        width: '100%', padding: '11px 14px',
        borderRadius: 12,
        border: open ? `1.5px solid ${color}` : `1.5px solid ${T.border}`,
        background: open ? color + '18' : T.softGrey,
        color: open ? color : T.textMuted,
        fontSize: 13, fontWeight: 700, cursor: 'pointer',
        marginBottom: 8,
        transition: 'all 0.15s',
        textAlign: 'left',
      }}
    >
      <span>{emoji} {label}</span>
      <span style={{ fontSize: 11, fontWeight: 600, opacity: 0.7 }}>{open ? '▲' : '▼'}</span>
    </button>
  )
}

// ── Case Card ─────────────────────────────────────────────────────────────────
function CaseCard({ scenario, viewed, selfRating, onView, onRate }) {
  const [isOpen, setIsOpen] = useState(false)
  const [openSections, setOpenSections] = useState({})
  const color = getTypeColor(scenario.type)
  const diffColor = DIFFICULTY_COLOR[scenario.difficulty] || '#64748b'

  const toggle = () => {
    if (!isOpen) {
      if (!viewed) onView(scenario.id)
      track('case_opened', { scenario_id: scenario.id, scenario_type: scenario.type, difficulty: scenario.difficulty })
    }
    setIsOpen(o => !o)
  }

  const toggleSection = (key) => {
    const opening = !openSections[key]
    if (opening) track('coaching_section_toggled', { section: key, scenario_id: scenario.id })
    setOpenSections(prev => ({ ...prev, [key]: opening }))
  }

  // Which sections have content?
  const hasSection = {
    clarify:    (scenario.clarifyingQuestions?.length > 0),
    mece:       (scenario.meceBlocks?.length > 0),
    stepByStep: (scenario.stepByStep?.length > 0),
    keyTerms:   (scenario.keyTerms?.length > 0),
    frameworks: !!(scenario.correctFrameworks?.length > 0 || scenario.whyThisFramework),
    northStar:  !!(scenario.interviewerExpectations),
    sample:     !!(scenario.sampleResponse?.length > 0),
  }

  const cardBorder = selfRating
    ? `1.5px solid ${selfRating.overall === 3 ? T.green + '55' : selfRating.overall === 2 ? T.amber + '55' : T.pink + '55'}`
    : '1.5px solid transparent'

  return (
    <div style={{
      background: 'rgba(255,255,255,0.80)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: cardBorder,
      boxShadow: '0 4px 20px rgba(70,72,212,0.10)',
      borderRadius: T.r.lg,
      marginBottom: 12,
      overflow: 'hidden',
    }}>
      {/* Header */}
      <button
        onClick={toggle}
        style={{
          width: '100%', display: 'flex', alignItems: 'flex-start', gap: 12,
          padding: '14px 16px',
          background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
        }}
      >
        <div style={{
          width: 40, height: 40, borderRadius: 10, flexShrink: 0,
          background: color + '22', border: `2px solid ${color}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 10, fontWeight: 800, color, letterSpacing: -0.5,
        }}>
          {scenario.id.replace('scenario_', '')}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 3 }}>
            <span style={{
              fontSize: 10, fontWeight: 700, color: '#fff',
              background: color, borderRadius: 4, padding: '2px 6px',
            }}>
              {scenario.type}
            </span>
            <span style={{ fontSize: 10, color: diffColor, fontWeight: 700 }}>
              {scenario.difficulty}
            </span>
            {viewed && <span style={{ fontSize: 10, color: T.textMuted }}>viewed</span>}
            {selfRating && (
              <span style={{ fontSize: 10, fontWeight: 700, color: selfRating.overall === 3 ? T.green : selfRating.overall === 2 ? T.amber : T.pink }}>
                {selfRating.overall === 3 ? '✅' : selfRating.overall === 2 ? '🤔' : '🔁'}
              </span>
            )}
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: T.text, lineHeight: 1.3, fontFamily: T.fontDisplay }}>{scenario.title}</div>
          <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>{scenario.company}</div>
        </div>

        <div style={{ color: T.textMuted, fontSize: 16, flexShrink: 0, paddingTop: 4 }}>
          {isOpen ? '▲' : '▼'}
        </div>
      </button>

      {/* Expanded content */}
      {isOpen && (
        <div style={{ padding: '0 16px 16px' }}>

          {/* Prompt */}
          <div style={{
            background: color + '15', border: `1px solid ${color}30`,
            borderRadius: 12, padding: '12px 14px', marginBottom: 12,
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, color, letterSpacing: 1, marginBottom: 6 }}>THE PROMPT</div>
            <div style={{ fontSize: 13, color: T.text, lineHeight: 1.6 }}>{scenario.prompt}</div>
          </div>

          {/* Context */}
          <div style={{
            background: T.surfaceContainer, borderRadius: 10,
            padding: '10px 14px', marginBottom: 16,
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, letterSpacing: 1, marginBottom: 4 }}>CONTEXT</div>
            <div style={{ fontSize: 12, color: T.textSub, lineHeight: 1.6 }}>{scenario.context}</div>
          </div>

          {/* Practice Recording — above coaching so it's the first action */}
          <AudioRecorder scenarioId={scenario.id} scenarioTitle={scenario.title} />

          {/* ── 7 coaching toggle buttons + content ── */}
          <div style={{ marginTop: 14 }}>
            {COACHING_SECTIONS.map(({ key, label, emoji, color: sColor }) => (
              <div key={key}>
                <SectionToggle
                  sectionKey={key}
                  label={label}
                  emoji={emoji}
                  color={sColor}
                  open={!!openSections[key]}
                  onToggle={() => toggleSection(key)}
                  hasContent={hasSection[key]}
                />

                {/* Section content */}
                {openSections[key] && (
                  <div style={{
                    background: '#ffffff', borderRadius: 12,
                    padding: '14px', marginBottom: 12, marginTop: -4,
                    borderLeft: `3px solid ${sColor}`,
                    border: `1px solid ${T.border}`,
                    borderLeftWidth: 3,
                    borderLeftColor: sColor,
                  }}>
                    {/* CLARIFICATION */}
                    {key === 'clarify' && scenario.clarifyingQuestions?.map((q, i) => (
                      <div key={i} style={{ display: 'flex', gap: 8, marginBottom: i < scenario.clarifyingQuestions.length - 1 ? 10 : 0 }}>
                        <span style={{ color: sColor, fontWeight: 800, fontSize: 13, flexShrink: 0 }}>{i + 1}.</span>
                        <span style={{ fontSize: 13, color: T.textSub, lineHeight: 1.5 }}>{q}</span>
                      </div>
                    ))}

                    {/* MECE */}
                    {key === 'mece' && scenario.meceBlocks?.map((block, i) => (
                      <div key={i} style={{ marginBottom: i < scenario.meceBlocks.length - 1 ? 14 : 0 }}>
                        <div style={{
                          fontSize: 12, fontWeight: 700, color: sColor,
                          marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6,
                        }}>
                          <span style={{
                            width: 20, height: 20, borderRadius: 6, background: sColor + '22',
                            border: `1px solid ${sColor}66`, display: 'flex', alignItems: 'center',
                            justifyContent: 'center', fontSize: 10, fontWeight: 800, flexShrink: 0,
                          }}>
                            {i + 1}
                          </span>
                          {block.block}
                        </div>
                        <ul style={{ margin: 0, paddingLeft: 26 }}>
                          {block.subIssues.map((sub, j) => (
                            <li key={j} style={{ fontSize: 12, color: T.textSub, lineHeight: 1.6, marginBottom: 2 }}>{sub}</li>
                          ))}
                        </ul>
                      </div>
                    ))}

                    {/* STEP BY STEP */}
                    {key === 'stepByStep' && scenario.stepByStep?.map((s, i) => (
                      <div key={i} style={{ display: 'flex', gap: 10, marginBottom: i < scenario.stepByStep.length - 1 ? 14 : 0 }}>
                        <div style={{
                          width: 22, height: 22, borderRadius: 999, background: sColor + '22',
                          border: `1px solid ${sColor}66`, display: 'flex', alignItems: 'center',
                          justifyContent: 'center', fontSize: 10, fontWeight: 800,
                          color: sColor, flexShrink: 0, marginTop: 1,
                        }}>
                          {s.step}
                        </div>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 3 }}>{s.title}</div>
                          <div style={{ fontSize: 12, color: T.textSub, lineHeight: 1.6 }}>{s.detail}</div>
                        </div>
                      </div>
                    ))}

                    {/* KEY TERMS */}
                    {key === 'keyTerms' && scenario.keyTerms?.map((kt, i) => (
                      <div key={i} style={{ marginBottom: i < scenario.keyTerms.length - 1 ? 10 : 0 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#fbbf24' }}>{kt.term}: </span>
                        <span style={{ fontSize: 12, color: T.textSub, lineHeight: 1.5 }}>{kt.definition}</span>
                      </div>
                    ))}

                    {/* FRAMEWORKS */}
                    {key === 'frameworks' && (
                      <>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                          {scenario.correctFrameworks?.map(fw => (
                            <span key={fw} style={{
                              fontSize: 12, fontWeight: 700, color: sColor,
                              background: sColor + '22', borderRadius: 6, padding: '3px 8px',
                            }}>
                              {fw}
                            </span>
                          ))}
                        </div>
                        {scenario.whyThisFramework && (
                          <div style={{ fontSize: 13, color: T.textSub, lineHeight: 1.6 }}>
                            {scenario.whyThisFramework}
                          </div>
                        )}
                      </>
                    )}

                    {/* NORTH STAR */}
                    {key === 'northStar' && (
                      <div style={{ fontSize: 13, color: T.textSub, lineHeight: 1.6, fontStyle: 'italic' }}>
                        {scenario.interviewerExpectations}
                      </div>
                    )}

                    {/* SAMPLE RESPONSE */}
                    {key === 'sample' && scenario.sampleResponse?.map((section, i) => (
                      <div key={i} style={{
                        marginBottom: i < scenario.sampleResponse.length - 1 ? 16 : 0,
                        paddingBottom: i < scenario.sampleResponse.length - 1 ? 16 : 0,
                        borderBottom: i < scenario.sampleResponse.length - 1 ? `1px solid ${T.border}` : 'none',
                      }}>
                        <div style={{
                          fontSize: 10, fontWeight: 800, color: sColor, letterSpacing: 1,
                          marginBottom: 6, textTransform: 'uppercase',
                        }}>
                          {section.label}
                        </div>
                        <div style={{
                          fontSize: 13, color: T.textSub, lineHeight: 1.7,
                          fontStyle: 'italic',
                          paddingLeft: 12,
                          borderLeft: `2px solid ${sColor}55`,
                        }}>
                          "{section.script}"
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Key Considerations (always available as a section) */}
            {scenario.keyConsiderations?.length > 0 && (
              <div>
                <SectionToggle
                  sectionKey="considerations"
                  label="Key Considerations"
                  emoji="💡"
                  color={T.amber}
                  open={!!openSections['considerations']}
                  onToggle={() => toggleSection('considerations')}
                  hasContent={true}
                />
                {openSections['considerations'] && (
                  <div style={{
                    background: '#ffffff', borderRadius: 12,
                    padding: '14px', marginBottom: 12, marginTop: -4,
                    border: `1px solid ${T.border}`,
                    borderLeftWidth: 3,
                    borderLeftColor: T.amber,
                  }}>
                    {scenario.keyConsiderations.map((c, i) => (
                      <div key={i} style={{ display: 'flex', gap: 8, marginBottom: i < scenario.keyConsiderations.length - 1 ? 8 : 0 }}>
                        <span style={{ color: T.amber, fontWeight: 700, fontSize: 13, flexShrink: 0 }}>•</span>
                        <span style={{ fontSize: 13, color: T.textSub, lineHeight: 1.5 }}>{c}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* CSAI self-rating at bottom */}
          <CSAIRating scenarioId={scenario.id} existing={selfRating} onRate={onRate} />
        </div>
      )}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function CasesPage() {
  const { progress, markCaseViewed, rateCaseSelf } = useProgress()
  const [selectedLevel, setSelectedLevel] = useState(null)  // null | 'easy' | 'medium' | 'hard'
  const [selectedType, setSelectedType]   = useState(null)  // null | type string | 'all'

  const { viewed, selfRatings } = progress.cases
  const viewedCount = viewed.length
  const ratedCount  = Object.keys(selfRatings).length
  const nailedCount = Object.values(selfRatings).filter(r => r.overall === 3).length

  // Counts by level
  const countByLevel = (lvl) => SCENARIOS.filter(s => s.difficulty === lvl).length
  const viewedByLevel = (lvl) => SCENARIOS.filter(s => s.difficulty === lvl && viewed.includes(s.id)).length

  // Types available for selected level
  const typesForLevel = selectedLevel
    ? [...new Set(SCENARIOS.filter(s => s.difficulty === selectedLevel).map(s => s.type))].sort()
    : []
  const coreTypesForLevel = BEENA_CORE.filter(t => typesForLevel.includes(t))
  const otherTypesForLevel = typesForLevel.filter(t => !BEENA_CORE.includes(t))

  // Final filtered cases
  const filtered = SCENARIOS.filter(s => {
    if (!selectedLevel) return false
    if (s.difficulty !== selectedLevel) return false
    if (selectedType && selectedType !== 'all' && s.type !== selectedType) return false
    return true
  })

  const currentLevel = LEVELS.find(l => l.key === selectedLevel)

  const glassCard = {
    background: 'rgba(255,255,255,0.80)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.55)',
    boxShadow: '0 4px 20px rgba(70,72,212,0.10)',
  }

  return (
    <div style={{ padding: '16px 20px 24px', maxWidth: 520, margin: '0 auto' }}>

      {/* Stats bar — always visible */}
      <div style={{
        ...glassCard,
        borderRadius: T.r.lg, padding: '12px 16px',
        marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 1 }}>Cases studied</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: T.text }}>
            {viewedCount} <span style={{ fontSize: 13, color: T.textMuted, fontWeight: 400 }}>/ {SCENARIOS.length}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          {LEVELS.map(l => (
            <div key={l.key} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: l.color }}>{viewedByLevel(l.key)}</div>
              <div style={{ fontSize: 9, color: T.textMuted }}>{l.label}</div>
            </div>
          ))}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: T.green }}>{nailedCount}</div>
            <div style={{ fontSize: 9, color: T.textMuted }}>Nailed</div>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ background: T.border, borderRadius: 999, height: 5, marginBottom: 20, overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 999,
          width: `${(viewedCount / SCENARIOS.length) * 100}%`,
          background: T.primaryContainer,
          transition: 'width 0.4s ease',
        }} />
      </div>

      {/* ── STEP 1: Level picker ── */}
      {!selectedLevel && (
        <>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, letterSpacing: 1, marginBottom: 12, fontFamily: T.fontBody }}>
            CHOOSE YOUR LEVEL
          </div>
          {LEVELS.map(level => {
            const total   = countByLevel(level.key)
            const studied = viewedByLevel(level.key)
            const pct     = total ? Math.round((studied / total) * 100) : 0
            return (
              <button
                key={level.key}
                onClick={() => { setSelectedLevel(level.key); setSelectedType(null) }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 14,
                  ...glassCard,
                  borderRadius: T.r.lg, padding: '16px 18px',
                  borderColor: level.color + '44',
                  marginBottom: 10,
                  cursor: 'pointer', textAlign: 'left',
                }}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                  background: level.color + '22', border: `2px solid ${level.color}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22,
                }}>
                  {level.emoji}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: T.text, marginBottom: 2, fontFamily: T.fontDisplay }}>
                    {level.label}
                  </div>
                  <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 6 }}>{level.desc}</div>
                  <div style={{ background: T.border, borderRadius: 999, height: 4, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 999, width: `${pct}%`,
                      background: level.color, transition: 'width 0.4s',
                    }} />
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: level.color }}>{studied}</div>
                  <div style={{ fontSize: 10, color: T.textMuted }}>/ {total}</div>
                </div>
              </button>
            )
          })}
        </>
      )}

      {/* ── STEP 2: Category picker ── */}
      {selectedLevel && !selectedType && (
        <>
          {/* Back + level label */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <button
              onClick={() => setSelectedLevel(null)}
              style={{
                padding: '6px 12px', borderRadius: 999, border: 'none',
                background: T.surfaceContainer, color: T.textSub, fontSize: 12, fontWeight: 600, cursor: 'pointer',
              }}
            >
              ← Back
            </button>
            <div style={{
              fontSize: 13, fontWeight: 700, color: currentLevel.color,
              background: currentLevel.color + '22', borderRadius: 999, padding: '4px 12px',
            }}>
              {currentLevel.emoji} {currentLevel.label}
            </div>
          </div>

          <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, letterSpacing: 1, marginBottom: 10, fontFamily: T.fontBody }}>
            CHOOSE A CASE TYPE
          </div>

          {/* All cases option */}
          <button
            onClick={() => setSelectedType('all')}
            style={{
              width: '100%', padding: '12px 16px', borderRadius: T.r.md, marginBottom: 14,
              ...glassCard,
              color: T.text, fontSize: 13, fontWeight: 700, cursor: 'pointer', textAlign: 'left',
            }}
          >
            📋 All {currentLevel.label} Cases ({countByLevel(selectedLevel)})
          </button>

          {/* Core case categories */}
          {coreTypesForLevel.length > 0 && (
            <>
              <div style={{ fontSize: 10, fontWeight: 700, color: T.primary, letterSpacing: 1, marginBottom: 8 }}>
                ⭐ CORE MARKETING CASE CATEGORIES
              </div>
              {coreTypesForLevel.map(type => {
                const color = getTypeColor(type)
                const count = SCENARIOS.filter(s => s.difficulty === selectedLevel && s.type === type).length
                const done  = SCENARIOS.filter(s => s.difficulty === selectedLevel && s.type === type && viewed.includes(s.id)).length
                return (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '12px 16px', borderRadius: T.r.md, marginBottom: 8,
                      background: 'rgba(255,255,255,0.80)',
                      backdropFilter: 'blur(16px)',
                      WebkitBackdropFilter: 'blur(16px)',
                      border: `1.5px solid ${color}44`,
                      boxShadow: '0 4px 20px rgba(70,72,212,0.10)',
                      color: T.text, fontSize: 13, fontWeight: 600, cursor: 'pointer', textAlign: 'left',
                    }}
                  >
                    <span style={{ color }}>{type}</span>
                    <span style={{ fontSize: 11, color: T.textMuted }}>{done}/{count}</span>
                  </button>
                )
              })}
            </>
          )}

          {/* Other types */}
          {otherTypesForLevel.length > 0 && (
            <>
              <div style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, letterSpacing: 1, marginBottom: 8, marginTop: 14 }}>
                OTHER TYPES
              </div>
              {otherTypesForLevel.map(type => {
                const color = getTypeColor(type)
                const count = SCENARIOS.filter(s => s.difficulty === selectedLevel && s.type === type).length
                const done  = SCENARIOS.filter(s => s.difficulty === selectedLevel && s.type === type && viewed.includes(s.id)).length
                return (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '11px 16px', borderRadius: T.r.md, marginBottom: 8,
                      ...glassCard,
                      color: T.text, fontSize: 13, fontWeight: 600, cursor: 'pointer', textAlign: 'left',
                    }}
                  >
                    <span style={{ color: T.textSub }}>{type}</span>
                    <span style={{ fontSize: 11, color: T.textMuted }}>{done}/{count}</span>
                  </button>
                )
              })}
            </>
          )}
        </>
      )}

      {/* ── STEP 3: Case list ── */}
      {selectedLevel && selectedType && (
        <>
          {/* Breadcrumb nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            <button
              onClick={() => { setSelectedLevel(null); setSelectedType(null) }}
              style={{
                padding: '5px 10px', borderRadius: 999, border: 'none',
                background: T.surfaceContainer, color: T.textSub, fontSize: 11, fontWeight: 600, cursor: 'pointer',
              }}
            >
              ← Levels
            </button>
            <button
              onClick={() => setSelectedType(null)}
              style={{
                padding: '5px 10px', borderRadius: 999, border: 'none',
                background: currentLevel.color + '22', color: currentLevel.color,
                fontSize: 11, fontWeight: 600, cursor: 'pointer',
              }}
            >
              {currentLevel.emoji} {currentLevel.label}
            </button>
            <span style={{ color: T.border, fontSize: 11 }}>›</span>
            <span style={{
              fontSize: 11, fontWeight: 700, color: getTypeColor(selectedType),
              background: getTypeColor(selectedType) + '22', borderRadius: 999, padding: '5px 10px',
            }}>
              {selectedType === 'all' ? 'All Cases' : selectedType}
            </span>
            <span style={{ fontSize: 11, color: T.textMuted, marginLeft: 'auto' }}>
              {filtered.length} case{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Cases */}
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', color: T.textMuted, padding: 40, fontSize: 14 }}>
              No cases match this filter.
            </div>
          ) : (
            filtered.map(scenario => (
              <CaseCard
                key={scenario.id}
                scenario={scenario}
                viewed={viewed.includes(scenario.id)}
                selfRating={selfRatings[scenario.id]}
                onView={markCaseViewed}
                onRate={rateCaseSelf}
              />
            ))
          )}
        </>
      )}
    </div>
  )
}
