import { useState } from 'react'
import { FRAMEWORKS } from '../data/frameworks'
import { useProgress } from '../hooks/useProgress'

const RATINGS = [
  { key: 'know',   label: 'Know It',  emoji: '✅', color: '#22c55e' },
  { key: 'unsure', label: 'Unsure',   emoji: '🤔', color: '#f59e0b' },
  { key: 'again',  label: 'Again',    emoji: '🔁', color: '#ef4444' },
]

function FlashCard({ framework, onClose, onRate, currentRating }) {
  const cards = framework.flashCards || [{ q: framework.flashQ, a: framework.flashA }]
  const [cardIndex, setCardIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)

  const card = cards[cardIndex]
  const isLast = cardIndex === cards.length - 1

  const nextCard = () => {
    setCardIndex(i => i + 1)
    setFlipped(false)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: 'rgba(0,0,0,0.88)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }}>
      {/* Progress dots */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {cards.map((_, i) => (
          <div key={i} style={{
            width: i === cardIndex ? 20 : 6, height: 6, borderRadius: 3,
            background: i < cardIndex ? '#22c55e' : i === cardIndex ? framework.color : '#334155',
            transition: 'all 0.2s',
          }} />
        ))}
      </div>

      {/* Card counter */}
      <div style={{ fontSize: 11, color: '#475569', fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>
        {framework.name} — CARD {cardIndex + 1} OF {cards.length}
      </div>

      {/* Card face */}
      <div
        onClick={() => setFlipped(f => !f)}
        style={{
          width: '100%', maxWidth: 420,
          background: flipped ? '#1e293b' : framework.color,
          borderRadius: 20,
          padding: 28,
          cursor: 'pointer',
          minHeight: 200,
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          transition: 'background 0.2s',
        }}
      >
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: 'rgba(255,255,255,0.6)', marginBottom: 12 }}>
          {flipped ? 'ANSWER' : 'QUESTION'} — tap to flip
        </div>
        <div style={{ fontSize: flipped ? 15 : 16, color: '#fff', lineHeight: 1.6, fontWeight: flipped ? 400 : 600 }}>
          {flipped ? card.a : card.q}
        </div>
      </div>

      {/* Actions */}
      {flipped && (
        <div style={{ width: '100%', maxWidth: 420, marginTop: 16 }}>
          {!isLast ? (
            <button
              onClick={nextCard}
              style={{
                width: '100%', padding: '12px', borderRadius: 14, border: 'none',
                background: framework.color, color: '#fff',
                fontSize: 14, fontWeight: 700, cursor: 'pointer', marginBottom: 10,
              }}
            >
              Next Card →
            </button>
          ) : (
            <div>
              <div style={{ fontSize: 12, color: '#64748b', textAlign: 'center', marginBottom: 10 }}>
                All {cards.length} cards done — rate yourself:
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {RATINGS.map(r => (
                  <button
                    key={r.key}
                    onClick={() => { onRate(framework.id, r.key); onClose() }}
                    style={{
                      flex: 1, padding: '10px 6px',
                      borderRadius: 12,
                      border: currentRating === r.key ? `2px solid ${r.color}` : '2px solid transparent',
                      background: currentRating === r.key ? r.color + '33' : '#1e293b',
                      color: '#fff',
                      fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    {r.emoji} {r.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <button
        onClick={onClose}
        style={{ marginTop: 14, color: '#475569', background: 'none', border: 'none', fontSize: 14, cursor: 'pointer' }}
      >
        Close
      </button>
    </div>
  )
}

function FrameworkCard({ framework, rating, onExpand, onFlashcard }) {
  const [expanded, setExpanded] = useState(false)

  const ratingColor = rating === 'know' ? '#22c55e' : rating === 'unsure' ? '#f59e0b' : rating === 'again' ? '#ef4444' : null

  return (
    <div style={{
      background: '#1e293b',
      borderRadius: 16,
      marginBottom: 12,
      overflow: 'hidden',
      border: ratingColor ? `1.5px solid ${ratingColor}33` : '1.5px solid transparent',
    }}>
      {/* Card header — always visible */}
      <button
        onClick={() => setExpanded(e => !e)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 14,
          padding: '16px 16px',
          background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
        }}
      >
        {/* Color dot */}
        <div style={{
          width: 44, height: 44, borderRadius: 12, flexShrink: 0,
          background: framework.color + '22',
          border: `2px solid ${framework.color}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 800, color: framework.color, letterSpacing: -0.5,
        }}>
          {framework.name.split('')[0]}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>{framework.name}</span>
            {rating && (
              <span style={{ fontSize: 10, color: ratingColor, fontWeight: 700, letterSpacing: 0.5 }}>
                {rating === 'know' ? '✅' : rating === 'unsure' ? '🤔' : '🔁'}
              </span>
            )}
          </div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{framework.subtitle}</div>
        </div>

        <div style={{ color: '#475569', fontSize: 18, flexShrink: 0 }}>
          {expanded ? '▲' : '▼'}
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div style={{ padding: '0 16px 16px' }}>
          {/* When to use */}
          <div style={{
            background: framework.color + '18',
            border: `1px solid ${framework.color}44`,
            borderRadius: 10,
            padding: '10px 14px',
            marginBottom: 14,
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: framework.color, letterSpacing: 1, marginBottom: 4 }}>WHEN TO USE</div>
            <div style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.5 }}>{framework.whenToUse}</div>
          </div>

          {/* Components */}
          {framework.components.map((comp, i) => (
            <div key={i} style={{
              marginBottom: 14,
              paddingBottom: 14,
              borderBottom: i < framework.components.length - 1 ? '1px solid #0f172a' : 'none',
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: framework.color, marginBottom: 6, letterSpacing: 0.3 }}>{comp.label}</div>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {comp.points.map((pt, j) => (
                  <li key={j} style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.7, marginBottom: 2 }}>{pt}</li>
                ))}
              </ul>
            </div>
          ))}

          {/* Example prompts */}
          {framework.examplePrompts && framework.examplePrompts.length > 0 && (
            <div style={{
              background: '#0f172a',
              borderRadius: 10,
              padding: '10px 14px',
              marginBottom: 14,
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b', letterSpacing: 1, marginBottom: 8 }}>
                YOU'D HEAR THIS WHEN...
              </div>
              {framework.examplePrompts.map((prompt, i) => (
                <div key={i} style={{
                  fontSize: 13,
                  color: '#94a3b8',
                  lineHeight: 1.5,
                  marginBottom: i < framework.examplePrompts.length - 1 ? 8 : 0,
                  paddingLeft: 10,
                  borderLeft: `2px solid ${framework.color}55`,
                  fontStyle: 'italic',
                }}>
                  {prompt}
                </div>
              ))}
            </div>
          )}

          {/* Source tag */}
          <div style={{ fontSize: 11, color: '#475569', marginTop: 8, marginBottom: 14 }}>
            Source: {framework.source}
          </div>

          {/* Flash card button */}
          <button
            onClick={() => onFlashcard(framework)}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 12,
              border: `2px solid ${framework.color}`,
              background: framework.color + '18',
              color: framework.color,
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              letterSpacing: 0.3,
            }}
          >
            🃏 Flash Card Quiz
          </button>
        </div>
      )}
    </div>
  )
}

export default function FrameworksPage() {
  const { progress, rateFrameworkCard } = useProgress()
  const [flashcard, setFlashcard] = useState(null)
  const [filter, setFilter] = useState('all') // 'all' | 'know' | 'unsure' | 'again' | 'unrated'

  const cardProgress = progress.frameworks.cardProgress
  const knowCount   = FRAMEWORKS.filter(f => cardProgress[f.id] === 'know').length
  const unsureCount = FRAMEWORKS.filter(f => cardProgress[f.id] === 'unsure').length
  const againCount  = FRAMEWORKS.filter(f => cardProgress[f.id] === 'again').length
  const totalRated  = knowCount + unsureCount + againCount

  const filtered = FRAMEWORKS.filter(f => {
    if (filter === 'all') return true
    if (filter === 'unrated') return !cardProgress[f.id]
    return cardProgress[f.id] === filter
  })

  return (
    <div style={{ padding: '16px 16px 24px', maxWidth: 520, margin: '0 auto' }}>
      {/* Progress summary */}
      <div style={{
        background: '#1e293b',
        borderRadius: 16,
        padding: '14px 16px',
        marginBottom: 16,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <div style={{ fontSize: 13, color: '#64748b', marginBottom: 2 }}>Frameworks mastered</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#f1f5f9' }}>
            {knowCount} <span style={{ fontSize: 14, color: '#64748b', fontWeight: 400 }}>/ {FRAMEWORKS.length}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#22c55e' }}>{knowCount}</div>
            <div style={{ fontSize: 10, color: '#64748b' }}>Know</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#f59e0b' }}>{unsureCount}</div>
            <div style={{ fontSize: 10, color: '#64748b' }}>Unsure</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#ef4444' }}>{againCount}</div>
            <div style={{ fontSize: 10, color: '#64748b' }}>Again</div>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ background: '#1e293b', borderRadius: 999, height: 6, marginBottom: 16, overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 999,
          width: `${(knowCount / FRAMEWORKS.length) * 100}%`,
          background: 'linear-gradient(90deg, #3b82f6, #22c55e)',
          transition: 'width 0.4s ease',
        }} />
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
        {[
          { key: 'all',     label: `All (${FRAMEWORKS.length})` },
          { key: 'unrated', label: `Unrated (${FRAMEWORKS.length - totalRated})` },
          { key: 'know',    label: `✅ Know (${knowCount})` },
          { key: 'unsure',  label: `🤔 Unsure (${unsureCount})` },
          { key: 'again',   label: `🔁 Again (${againCount})` },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            style={{
              padding: '6px 12px',
              borderRadius: 999,
              border: 'none',
              background: filter === tab.key ? '#3b82f6' : '#1e293b',
              color: filter === tab.key ? '#fff' : '#64748b',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Framework cards */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#475569', padding: 40, fontSize: 14 }}>
          No frameworks in this filter.
        </div>
      ) : (
        filtered.map(fw => (
          <FrameworkCard
            key={fw.id}
            framework={fw}
            rating={cardProgress[fw.id]}
            onFlashcard={setFlashcard}
            onRate={rateFrameworkCard}
          />
        ))
      )}

      {/* Flash card overlay */}
      {flashcard && (
        <FlashCard
          framework={flashcard}
          currentRating={cardProgress[flashcard.id]}
          onRate={rateFrameworkCard}
          onClose={() => setFlashcard(null)}
        />
      )}
    </div>
  )
}
