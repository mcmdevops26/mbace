import { useState, useRef, useEffect } from 'react'
import SCENARIOS from '../data/scenarios.json'
import { useProgress } from '../hooks/useProgress'

const DIFFICULTY_COLOR = { easy: '#22c55e', medium: '#f59e0b', hard: '#ef4444' }

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
function AudioRecorder({ scenarioId }) {
  const [state, setState] = useState('idle') // idle | recording | stopped
  const [audioUrl, setAudioUrl] = useState(null)
  const [seconds, setSeconds] = useState(0)
  const mediaRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)

  useEffect(() => () => {
    clearInterval(timerRef.current)
    if (audioUrl) URL.revokeObjectURL(audioUrl)
  }, [])

  const startRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      alert('Recording is not supported in this browser. Try Chrome or Safari 14.3+.')
      return
    }
    if (typeof MediaRecorder === 'undefined') {
      alert('Recording is not supported in this browser. Try Chrome or Safari 14.3+.')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      // Pick a MIME type the browser supports — iOS Safari needs mp4, Chrome prefers webm
      const mimeType =
        MediaRecorder.isTypeSupported('audio/mp4')  ? 'audio/mp4'  :
        MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : ''
      const mr = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream)
      mediaRef.current = mr
      chunksRef.current = []
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mr.mimeType || 'audio/mp4' })
        setAudioUrl(URL.createObjectURL(blob))
        stream.getTracks().forEach(t => t.stop())
        setState('stopped')
      }
      mr.start(250) // collect chunks every 250ms — required on some iOS versions
      setState('recording')
      setSeconds(0)
      timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000)
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

  const reset = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl)
    setAudioUrl(null)
    setState('idle')
    setSeconds(0)
  }

  const fmt = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  return (
    <div style={{
      background: '#0f172a',
      borderRadius: 12,
      padding: '12px 14px',
      marginTop: 14,
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: 1, marginBottom: 10 }}>
        🎙 SELF ASSESSMENT RECORDING
      </div>

      {state === 'idle' && (
        <button
          onClick={startRecording}
          style={{
            width: '100%', padding: '10px', borderRadius: 10,
            border: '2px solid #3b82f6', background: '#3b82f622',
            color: '#3b82f6', fontSize: 13, fontWeight: 700, cursor: 'pointer',
          }}
        >
          Start Recording
        </button>
      )}

      {state === 'recording' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444', animation: 'pulse 1s infinite' }} />
          <span style={{ color: '#ef4444', fontWeight: 700, fontSize: 13, flex: 1 }}>Recording {fmt(seconds)}</span>
          <button
            onClick={stopRecording}
            style={{
              padding: '8px 16px', borderRadius: 8,
              border: 'none', background: '#ef4444',
              color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
            }}
          >
            Stop
          </button>
        </div>
      )}

      {state === 'stopped' && audioUrl && (
        <div>
          <audio controls src={audioUrl} style={{ width: '100%', marginBottom: 8 }} />
          <button
            onClick={reset}
            style={{
              width: '100%', padding: '8px', borderRadius: 8,
              border: '1px solid #334155', background: 'none',
              color: '#64748b', fontSize: 12, cursor: 'pointer',
            }}
          >
            Record Again
          </button>
        </div>
      )}
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
  }

  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: 1, marginBottom: 10 }}>
        CSAI SELF-RATING
      </div>

      {Object.entries(CSAI_LABELS).map(([key, label]) => (
        <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{ width: 80, fontSize: 12, color: '#94a3b8' }}>
            <span style={{ fontWeight: 700, color: '#60a5fa' }}>{key}</span> {label}
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {[1, 2, 3].map(v => (
              <button
                key={v}
                onClick={() => { setRatings(r => ({ ...r, [key]: v })); setSaved(false) }}
                style={{
                  width: 30, height: 30, borderRadius: 8,
                  border: ratings[key] === v ? '2px solid #60a5fa' : '2px solid #334155',
                  background: ratings[key] === v ? '#60a5fa22' : 'transparent',
                  color: ratings[key] === v ? '#60a5fa' : '#475569',
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
        <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>Overall confidence</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { v: 1, label: 'Struggled', color: '#ef4444' },
            { v: 2, label: 'OK', color: '#f59e0b' },
            { v: 3, label: 'Nailed It', color: '#22c55e' },
          ].map(({ v, label, color }) => (
            <button
              key={v}
              onClick={() => { setOverall(v); setSaved(false) }}
              style={{
                flex: 1, padding: '8px 4px', borderRadius: 10,
                border: overall === v ? `2px solid ${color}` : '2px solid #334155',
                background: overall === v ? color + '22' : 'transparent',
                color: overall === v ? color : '#475569',
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
            background: overall ? '#22c55e' : '#1e293b',
            color: overall ? '#fff' : '#475569',
            fontSize: 13, fontWeight: 700, cursor: overall ? 'pointer' : 'default',
          }}
        >
          Save Rating
        </button>
      )}
      {saved && (
        <div style={{ textAlign: 'center', fontSize: 13, color: '#22c55e', fontWeight: 700 }}>
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
      background: '#0f172a',
      borderRadius: 12,
      marginBottom: 12,
      overflow: 'hidden',
      border: `1px solid ${color}33`,
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
        <span style={{ fontSize: 12, color: '#475569' }}>{expanded ? '▲ collapse' : '▼ show'}</span>
      </button>

      {expanded && (
        <div style={{ padding: '0 14px 14px' }}>
          {response.map((section, i) => (
            <div key={i} style={{
              marginBottom: i < response.length - 1 ? 16 : 0,
              paddingBottom: i < response.length - 1 ? 16 : 0,
              borderBottom: i < response.length - 1 ? '1px solid #1e293b' : 'none',
            }}>
              <div style={{
                fontSize: 10, fontWeight: 800, color, letterSpacing: 1,
                marginBottom: 6, textTransform: 'uppercase',
              }}>
                {section.label}
              </div>
              <div style={{
                fontSize: 13, color: '#e2e8f0', lineHeight: 1.7,
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
        border: open ? `1.5px solid ${color}` : '1.5px solid #334155',
        background: open ? color + '18' : '#0f172a',
        color: open ? color : '#64748b',
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
    if (!isOpen && !viewed) onView(scenario.id)
    setIsOpen(o => !o)
  }

  const toggleSection = key =>
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }))

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

  return (
    <div style={{
      background: '#1e293b',
      borderRadius: 16,
      marginBottom: 12,
      overflow: 'hidden',
      border: selfRating
        ? `1.5px solid ${selfRating.overall === 3 ? '#22c55e33' : selfRating.overall === 2 ? '#f59e0b33' : '#ef444433'}`
        : '1.5px solid transparent',
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
              fontSize: 10, fontWeight: 700, color,
              background: color + '22', borderRadius: 4, padding: '2px 6px',
            }}>
              {scenario.type}
            </span>
            <span style={{ fontSize: 10, color: diffColor, fontWeight: 700 }}>
              {scenario.difficulty}
            </span>
            {viewed && <span style={{ fontSize: 10, color: '#475569' }}>viewed</span>}
            {selfRating && (
              <span style={{ fontSize: 10, fontWeight: 700, color: selfRating.overall === 3 ? '#22c55e' : selfRating.overall === 2 ? '#f59e0b' : '#ef4444' }}>
                {selfRating.overall === 3 ? '✅' : selfRating.overall === 2 ? '🤔' : '🔁'}
              </span>
            )}
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', lineHeight: 1.3 }}>{scenario.title}</div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{scenario.company}</div>
        </div>

        <div style={{ color: '#475569', fontSize: 16, flexShrink: 0, paddingTop: 4 }}>
          {isOpen ? '▲' : '▼'}
        </div>
      </button>

      {/* Expanded content */}
      {isOpen && (
        <div style={{ padding: '0 16px 16px' }}>

          {/* Prompt */}
          <div style={{
            background: color + '18', border: `1px solid ${color}44`,
            borderRadius: 12, padding: '12px 14px', marginBottom: 12,
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, color, letterSpacing: 1, marginBottom: 6 }}>THE PROMPT</div>
            <div style={{ fontSize: 13, color: '#e2e8f0', lineHeight: 1.6 }}>{scenario.prompt}</div>
          </div>

          {/* Context */}
          <div style={{
            background: '#0f172a', borderRadius: 10,
            padding: '10px 14px', marginBottom: 16,
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b', letterSpacing: 1, marginBottom: 4 }}>CONTEXT</div>
            <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6 }}>{scenario.context}</div>
          </div>

          {/* ── 7 coaching toggle buttons + content ── */}
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
                  background: '#0f172a', borderRadius: 12,
                  padding: '14px', marginBottom: 12, marginTop: -4,
                  border: `1px solid ${sColor}33`,
                }}>
                  {/* CLARIFICATION */}
                  {key === 'clarify' && scenario.clarifyingQuestions?.map((q, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, marginBottom: i < scenario.clarifyingQuestions.length - 1 ? 10 : 0 }}>
                      <span style={{ color: sColor, fontWeight: 800, fontSize: 13, flexShrink: 0 }}>{i + 1}.</span>
                      <span style={{ fontSize: 13, color: '#c7d2fe', lineHeight: 1.5 }}>{q}</span>
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
                          <li key={j} style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6, marginBottom: 2 }}>{sub}</li>
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
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0', marginBottom: 3 }}>{s.title}</div>
                        <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6 }}>{s.detail}</div>
                      </div>
                    </div>
                  ))}

                  {/* KEY TERMS */}
                  {key === 'keyTerms' && scenario.keyTerms?.map((kt, i) => (
                    <div key={i} style={{ marginBottom: i < scenario.keyTerms.length - 1 ? 10 : 0 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#fbbf24' }}>{kt.term}: </span>
                      <span style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>{kt.definition}</span>
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
                        <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6 }}>
                          {scenario.whyThisFramework}
                        </div>
                      )}
                    </>
                  )}

                  {/* NORTH STAR */}
                  {key === 'northStar' && (
                    <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6, fontStyle: 'italic' }}>
                      {scenario.interviewerExpectations}
                    </div>
                  )}

                  {/* SAMPLE RESPONSE */}
                  {key === 'sample' && scenario.sampleResponse?.map((section, i) => (
                    <div key={i} style={{
                      marginBottom: i < scenario.sampleResponse.length - 1 ? 16 : 0,
                      paddingBottom: i < scenario.sampleResponse.length - 1 ? 16 : 0,
                      borderBottom: i < scenario.sampleResponse.length - 1 ? '1px solid #1e293b' : 'none',
                    }}>
                      <div style={{
                        fontSize: 10, fontWeight: 800, color: sColor, letterSpacing: 1,
                        marginBottom: 6, textTransform: 'uppercase',
                      }}>
                        {section.label}
                      </div>
                      <div style={{
                        fontSize: 13, color: '#e2e8f0', lineHeight: 1.7,
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
                color="#f59e0b"
                open={!!openSections['considerations']}
                onToggle={() => toggleSection('considerations')}
                hasContent={true}
              />
              {openSections['considerations'] && (
                <div style={{
                  background: '#0f172a', borderRadius: 12,
                  padding: '14px', marginBottom: 12, marginTop: -4,
                  border: '1px solid #f59e0b33',
                }}>
                  {scenario.keyConsiderations.map((c, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, marginBottom: i < scenario.keyConsiderations.length - 1 ? 8 : 0 }}>
                      <span style={{ color: '#f59e0b', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>•</span>
                      <span style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.5 }}>{c}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* CSAI + Audio always at bottom */}
          <CSAIRating scenarioId={scenario.id} existing={selfRating} onRate={onRate} />
          <AudioRecorder scenarioId={scenario.id} />
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

  return (
    <div style={{ padding: '16px 16px 24px', maxWidth: 520, margin: '0 auto' }}>

      {/* Stats bar — always visible */}
      <div style={{
        background: '#1e293b', borderRadius: 16, padding: '12px 16px',
        marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <div style={{ fontSize: 11, color: '#64748b', marginBottom: 1 }}>Cases studied</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#f1f5f9' }}>
            {viewedCount} <span style={{ fontSize: 13, color: '#64748b', fontWeight: 400 }}>/ {SCENARIOS.length}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          {LEVELS.map(l => (
            <div key={l.key} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: l.color }}>{viewedByLevel(l.key)}</div>
              <div style={{ fontSize: 9, color: '#64748b' }}>{l.label}</div>
            </div>
          ))}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#22c55e' }}>{nailedCount}</div>
            <div style={{ fontSize: 9, color: '#64748b' }}>Nailed</div>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ background: '#1e293b', borderRadius: 999, height: 5, marginBottom: 20, overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 999,
          width: `${(viewedCount / SCENARIOS.length) * 100}%`,
          background: 'linear-gradient(90deg, #6366f1, #22c55e)',
          transition: 'width 0.4s ease',
        }} />
      </div>

      {/* ── STEP 1: Level picker ── */}
      {!selectedLevel && (
        <>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', letterSpacing: 1, marginBottom: 12 }}>
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
                  background: '#1e293b', borderRadius: 16, padding: '16px 18px',
                  border: `1.5px solid ${level.color}33`, marginBottom: 10,
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
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#f1f5f9', marginBottom: 2 }}>
                    {level.label}
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>{level.desc}</div>
                  <div style={{ background: '#0f172a', borderRadius: 999, height: 4, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 999, width: `${pct}%`,
                      background: level.color, transition: 'width 0.4s',
                    }} />
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: level.color }}>{studied}</div>
                  <div style={{ fontSize: 10, color: '#475569' }}>/ {total}</div>
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
                background: '#1e293b', color: '#94a3b8', fontSize: 12, fontWeight: 600, cursor: 'pointer',
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

          <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', letterSpacing: 1, marginBottom: 10 }}>
            CHOOSE A CASE TYPE
          </div>

          {/* All cases option */}
          <button
            onClick={() => setSelectedType('all')}
            style={{
              width: '100%', padding: '12px 16px', borderRadius: 14, marginBottom: 14,
              border: '1.5px solid #334155', background: '#1e293b',
              color: '#f1f5f9', fontSize: 13, fontWeight: 700, cursor: 'pointer', textAlign: 'left',
            }}
          >
            📋 All {currentLevel.label} Cases ({countByLevel(selectedLevel)})
          </button>

          {/* Core case categories */}
          {coreTypesForLevel.length > 0 && (
            <>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#3b82f6', letterSpacing: 1, marginBottom: 8 }}>
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
                      padding: '12px 16px', borderRadius: 14, marginBottom: 8,
                      border: `1.5px solid ${color}44`, background: color + '12',
                      color: '#f1f5f9', fontSize: 13, fontWeight: 600, cursor: 'pointer', textAlign: 'left',
                    }}
                  >
                    <span style={{ color }}>{type}</span>
                    <span style={{ fontSize: 11, color: '#64748b' }}>{done}/{count}</span>
                  </button>
                )
              })}
            </>
          )}

          {/* Other types */}
          {otherTypesForLevel.length > 0 && (
            <>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#475569', letterSpacing: 1, marginBottom: 8, marginTop: 14 }}>
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
                      padding: '11px 16px', borderRadius: 14, marginBottom: 8,
                      border: '1.5px solid #334155', background: '#1e293b',
                      color: '#f1f5f9', fontSize: 13, fontWeight: 600, cursor: 'pointer', textAlign: 'left',
                    }}
                  >
                    <span style={{ color: '#94a3b8' }}>{type}</span>
                    <span style={{ fontSize: 11, color: '#475569' }}>{done}/{count}</span>
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
                background: '#1e293b', color: '#94a3b8', fontSize: 11, fontWeight: 600, cursor: 'pointer',
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
            <span style={{ color: '#334155', fontSize: 11 }}>›</span>
            <span style={{
              fontSize: 11, fontWeight: 700, color: getTypeColor(selectedType),
              background: getTypeColor(selectedType) + '22', borderRadius: 999, padding: '5px 10px',
            }}>
              {selectedType === 'all' ? 'All Cases' : selectedType}
            </span>
            <span style={{ fontSize: 11, color: '#475569', marginLeft: 'auto' }}>
              {filtered.length} case{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Cases */}
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#475569', padding: 40, fontSize: 14 }}>
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
