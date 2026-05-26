import { useState } from 'react'
import { FRAMEWORKS } from '../data/frameworks'
import { useProgress } from '../hooks/useProgress'
import { track } from '../utils/analytics'
import { T } from '../theme'

const CATEGORIES = [
  { key: 'framework', label: 'Frameworks' },
  { key: 'model',     label: 'Models' },
  { key: 'formula',   label: 'Formulas' },
  { key: 'approach',  label: 'Interview Approaches' },
]

const RATINGS = [
  { key: 'know',   label: 'Know It',  emoji: '✅', color: '#84CC16' },
  { key: 'unsure', label: 'Unsure',   emoji: '🤔', color: '#F59E0B' },
  { key: 'again',  label: 'Again',    emoji: '🔁', color: '#F43F5E' },
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
            background: i < cardIndex ? '#84CC16' : i === cardIndex ? framework.color : 'rgba(255,255,255,0.20)',
            transition: 'all 0.2s',
          }} />
        ))}
      </div>

      {/* Card counter */}
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', fontWeight: 700, letterSpacing: 1, marginBottom: 10, fontFamily: T.fontBody }}>
        {framework.name} — CARD {cardIndex + 1} OF {cards.length}
      </div>

      {/* Card face */}
      <div
        onClick={() => setFlipped(f => !f)}
        style={{
          width: '100%', maxWidth: 420,
          background: flipped ? '#ffffff' : framework.color,
          borderRadius: 20,
          padding: 28,
          cursor: 'pointer',
          minHeight: 200,
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          transition: 'background 0.2s',
        }}
      >
        <div style={{
          fontSize: 11, fontWeight: 700, letterSpacing: 2,
          color: flipped ? T.textMuted : 'rgba(255,255,255,0.6)',
          marginBottom: 12,
          fontFamily: T.fontBody,
        }}>
          {flipped ? 'ANSWER' : 'QUESTION'} — tap to flip
        </div>
        <div style={{
          fontSize: flipped ? 15 : 16,
          color: flipped ? T.text : '#fff',
          lineHeight: 1.6,
          fontWeight: flipped ? 400 : 600,
          fontFamily: T.fontBody,
        }}>
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
                fontFamily: T.fontBody,
              }}
            >
              Next Card →
            </button>
          ) : (
            <div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', textAlign: 'center', marginBottom: 10, fontFamily: T.fontBody }}>
                All {cards.length} cards done — rate yourself:
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {RATINGS.map(r => (
                  <button
                    key={r.key}
                    onClick={() => { track('framework_rated', { framework_name: framework.name, rating: r.key }); onRate(framework.id, r.key); onClose() }}
                    style={{
                      flex: 1, padding: '10px 6px',
                      borderRadius: 12,
                      border: currentRating === r.key ? `2px solid ${r.color}` : '2px solid rgba(255,255,255,0.15)',
                      background: currentRating === r.key ? r.color + '33' : 'rgba(0,0,0,0.85)',
                      color: '#fff',
                      fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      fontFamily: T.fontBody,
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
        style={{
          marginTop: 14, color: 'rgba(255,255,255,0.40)', background: 'none', border: 'none',
          fontSize: 14, cursor: 'pointer', fontFamily: T.fontBody,
        }}
      >
        Close
      </button>
    </div>
  )
}

function FrameworkCard({ framework, rating, onExpand, onFlashcard, onRate, showBadge = false }) {
  const [expanded, setExpanded] = useState(false)

  const ratingColor = rating === 'know' ? '#84CC16' : rating === 'unsure' ? '#F59E0B' : rating === 'again' ? '#F43F5E' : null

  return (
    <div style={{
      background: 'rgba(255,255,255,0.80)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: ratingColor ? `1.5px solid ${ratingColor}33` : '1px solid rgba(255,255,255,0.55)',
      boxShadow: '0 4px 20px rgba(70,72,212,0.10)',
      borderRadius: 16,
      marginBottom: 12,
      overflow: 'hidden',
    }}>
      {/* Card header — always visible */}
      <button
        onClick={() => { if (!expanded) track('framework_expanded', { framework_name: framework.name }); setExpanded(e => !e) }}
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
          fontFamily: T.fontDisplay,
        }}>
          {framework.name.split('')[0]}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: T.text, fontFamily: T.fontBody }}>{framework.name}</span>
            {rating && (
              <span style={{ fontSize: 10, color: ratingColor, fontWeight: 700, letterSpacing: 0.5 }}>
                {rating === 'know' ? '✅' : rating === 'unsure' ? '🤔' : '🔁'}
              </span>
            )}
          </div>
          <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2, fontFamily: T.fontBody }}>{framework.subtitle}</div>
          {showBadge && framework.category && (
            <span style={{
              fontSize: 9, fontWeight: 700, letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: T.textMuted,
              background: T.surfaceContainer,
              borderRadius: 999,
              padding: '2px 7px',
              marginTop: 3,
              display: 'inline-block',
              fontFamily: T.fontBody,
            }}>
              {CATEGORIES.find(c => c.key === framework.category)?.label}
            </span>
          )}
        </div>

        <div style={{ color: T.textMuted, fontSize: 18, flexShrink: 0 }}>
          {expanded ? '▲' : '▼'}
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div style={{ padding: '0 16px 16px' }}>
          {/* When to use */}
          <div style={{
            background: framework.color + '15',
            border: `1px solid ${framework.color}30`,
            borderRadius: 10,
            padding: '10px 14px',
            marginBottom: 14,
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: framework.color, letterSpacing: 1, marginBottom: 4, fontFamily: T.fontBody }}>WHEN TO USE</div>
            <div style={{ fontSize: 13, color: T.textSub, lineHeight: 1.5, fontFamily: T.fontBody }}>{framework.whenToUse}</div>
          </div>

          {/* Components */}
          {framework.components.map((comp, i) => (
            <div key={i} style={{
              marginBottom: 14,
              paddingBottom: 14,
              borderBottom: i < framework.components.length - 1 ? '1px solid #efecf8' : 'none',
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: framework.color, marginBottom: 6, letterSpacing: 0.3, fontFamily: T.fontBody }}>{comp.label}</div>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {comp.points.map((pt, j) => (
                  <li key={j} style={{ fontSize: 13, color: T.textMuted, lineHeight: 1.7, marginBottom: 2, fontFamily: T.fontBody }}>{pt}</li>
                ))}
              </ul>
            </div>
          ))}

          {/* Example prompts */}
          {framework.examplePrompts && framework.examplePrompts.length > 0 && (
            <div style={{
              background: T.surfaceContainer,
              borderRadius: 10,
              padding: '10px 14px',
              marginBottom: 14,
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, letterSpacing: 1, marginBottom: 8, fontFamily: T.fontBody }}>
                YOU'D HEAR THIS WHEN...
              </div>
              {framework.examplePrompts.map((prompt, i) => (
                <div key={i} style={{
                  fontSize: 13,
                  color: T.textSub,
                  lineHeight: 1.5,
                  marginBottom: i < framework.examplePrompts.length - 1 ? 8 : 0,
                  paddingLeft: 10,
                  borderLeft: `2px solid ${framework.color}55`,
                  fontStyle: 'italic',
                  fontFamily: T.fontBody,
                }}>
                  {prompt}
                </div>
              ))}
            </div>
          )}

          {/* Source tag */}
          <div style={{ fontSize: 11, color: T.textMuted, marginTop: 8, marginBottom: 14, fontFamily: T.fontBody }}>
            Source: {framework.source}
          </div>

          {/* Flash card button */}
          <button
            onClick={() => { track('flashcard_opened', { framework_name: framework.name }); onFlashcard(framework) }}
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
              fontFamily: T.fontBody,
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
    <div style={{ padding: '16px 20px 24px', maxWidth: 520, margin: '0 auto' }}>
      {/* Progress summary */}
      <div style={{
        background: 'rgba(255,255,255,0.80)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.55)',
        boxShadow: '0 4px 20px rgba(70,72,212,0.10)',
        borderRadius: 16,
        padding: '14px 16px',
        marginBottom: 16,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <div style={{ fontSize: 13, color: T.textMuted, marginBottom: 2, fontFamily: T.fontBody }}>Frameworks mastered</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: T.text, fontFamily: T.fontDisplay }}>
            {knowCount} <span style={{ fontSize: 14, color: T.textMuted, fontWeight: 400, fontFamily: T.fontBody }}>/ {FRAMEWORKS.length}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#84CC16', fontFamily: T.fontDisplay }}>{knowCount}</div>
            <div style={{ fontSize: 10, color: T.textMuted, fontFamily: T.fontBody }}>Know</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#F59E0B', fontFamily: T.fontDisplay }}>{unsureCount}</div>
            <div style={{ fontSize: 10, color: T.textMuted, fontFamily: T.fontBody }}>Unsure</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#F43F5E', fontFamily: T.fontDisplay }}>{againCount}</div>
            <div style={{ fontSize: 10, color: T.textMuted, fontFamily: T.fontBody }}>Again</div>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ background: T.border, borderRadius: 999, height: 6, marginBottom: 16, overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 999,
          width: `${(knowCount / FRAMEWORKS.length) * 100}%`,
          background: 'linear-gradient(90deg, #4648d4, #84CC16)',
          transition: 'width 0.4s ease',
        }} />
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none', msOverflowStyle: 'none' }} className="hide-scrollbar">
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
              padding: '2px 10px',
              borderRadius: 999,
              border: 'none',
              background: filter === tab.key ? T.primary : T.surfaceContainer,
              color: filter === tab.key ? '#fff' : T.textMuted,
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              fontFamily: T.fontBody,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Framework cards */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', color: T.textMuted, padding: 40, fontSize: 14, fontFamily: T.fontBody }}>
          No frameworks in this filter.
        </div>
      ) : filter === 'all' ? (
        // Grouped by category with section headers
        CATEGORIES.map(cat => {
          const group = filtered.filter(fw => fw.category === cat.key)
          if (group.length === 0) return null
          return (
            <div key={cat.key}>
              <div style={{
                fontSize: 10, fontWeight: 800, letterSpacing: '0.12em',
                textTransform: 'uppercase', color: T.primary,
                fontFamily: T.fontBody,
                marginBottom: 10, marginTop: 8,
                paddingLeft: 4,
              }}>
                {cat.label}
              </div>
              {group.map(fw => (
                <FrameworkCard
                  key={fw.id}
                  framework={fw}
                  rating={cardProgress[fw.id]}
                  onFlashcard={setFlashcard}
                  onRate={rateFrameworkCard}
                />
              ))}
            </div>
          )
        })
      ) : (
        // Flat list with category badge
        filtered.map(fw => (
          <FrameworkCard
            key={fw.id}
            framework={fw}
            rating={cardProgress[fw.id]}
            onFlashcard={setFlashcard}
            onRate={rateFrameworkCard}
            showBadge
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
