import { T } from '../theme'

const SECTION = ({ title, children }) => (
  <div style={{ marginBottom: 28 }}>
    <div style={{
      fontSize: 10, fontWeight: 800, color: T.primary,
      letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10,
      fontFamily: T.fontBody,
    }}>
      {title}
    </div>
    {children}
  </div>
)

const Card = ({ children, accent }) => (
  <div style={{
    ...T.glass,
    border: `1px solid ${accent || T.border}`,
    borderRadius: T.r.lg,
    padding: '14px 16px',
    marginBottom: 10,
  }}>
    {children}
  </div>
)

const Body = ({ children }) => (
  <p style={{ margin: 0, fontSize: 13, color: T.textSub, lineHeight: 1.7, fontFamily: T.fontBody }}>{children}</p>
)

export default function InfoPage() {
  return (
    <div style={{ padding: '20px 16px 40px', fontFamily: T.fontBody }}>

      {/* Hero */}
      <div style={{ marginBottom: 28, textAlign: 'center' }}>
        <div style={{
          fontSize: 26, fontWeight: 800, color: T.primary,
          letterSpacing: '-0.5px', fontFamily: T.fontDisplay,
        }}>
          MBAce
        </div>
        <div style={{ fontSize: 13, color: T.textMuted, marginTop: 4 }}>
          Marketing Case Interview Prep
        </div>
      </div>

      {/* Creator */}
      <SECTION title="The Creator">
        <div style={{
          background: `linear-gradient(135deg, ${T.primaryLight}, rgba(70,72,212,0.04))`,
          border: `1px solid ${T.primaryBorder}`,
          borderRadius: T.r.xl,
          padding: '20px 18px',
          marginBottom: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
            <img
              src="/kim.png"
              alt="Kim McMillian"
              style={{
                width: 64, height: 64, borderRadius: '50%',
                objectFit: 'cover', objectPosition: 'center top',
                border: `2px solid ${T.primary}`,
                flexShrink: 0,
              }}
            />
            <div>
              <div style={{
                fontSize: 17, fontWeight: 800, color: T.text,
                letterSpacing: '-0.3px', fontFamily: T.fontDisplay,
              }}>
                Kim McMillian
              </div>
              <div style={{ fontSize: 12, color: T.primary, marginTop: 2, fontWeight: 600 }}>
                MBA Candidate · Cornell University
              </div>
            </div>
          </div>

          <p style={{ margin: '0 0 16px', fontSize: 13, color: T.textSub, lineHeight: 1.8 }}>
            I'm a creative who needs to see things in color, have them at my fingertips, and
            learn on my own terms. So when I couldn't find a prep tool that was fast,
            mobile-first, and actually built for marketing cases, I made one. From scratch.
            While recruiting.
          </p>
          <p style={{ margin: '0 0 16px', fontSize: 13, color: T.textSub, lineHeight: 1.8 }}>
            As I started using it, I realized it might matter to others too. So I opened it up,
            because whether you're at Cornell, MLT, Consortium, or anywhere in between, we're
            all in this together. This is my way of contributing to the community that's
            cheering all of us on.
          </p>
          <p style={{ margin: '0 0 16px', fontSize: 13, color: T.textSub, lineHeight: 1.8 }}>
            If you find value here, I'd love to hear about it. Connect with me on LinkedIn and
            share your experience. It means more than you know. 🤍
          </p>

          <a
            href="https://www.linkedin.com/in/kimberlymcmillian/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '11px 14px', borderRadius: T.r.md,
              background: 'rgba(0,119,181,0.08)', border: '1px solid rgba(0,119,181,0.25)',
              color: '#0077b5', fontSize: 13, fontWeight: 700,
              textDecoration: 'none', fontFamily: T.fontBody,
            }}
          >
            <span style={{ fontSize: 16 }}>💼</span> Connect on LinkedIn
          </a>
        </div>
      </SECTION>

      {/* What this is + Who it's for */}
      <SECTION title="What This Is & Who It's For">
        <Card accent={T.primaryBorder}>
          <Body>
            MBAce is a personal learning tool built for students and young professionals
            preparing for marketing MBA internship recruiting, and anyone genuinely committed
            to sharpening their casing skills. It's not a course, not a paid product. Just a
            focused, mobile-friendly resource you can use anywhere to sharpen your instincts,
            practice your frameworks, and feel more confident walking into an interview room.
          </Body>
          <div style={{ marginTop: 10 }}>
            <Body>
              The app covers 100 marketing case scenarios across 8 core case types, a framework
              flashcard game, math drills, self-assessment recording, and progress tracking. All
              running locally on your device with no account required. If you're putting in the
              work, this was built for you.
            </Body>
          </div>
        </Card>
      </SECTION>

      {/* What was built */}
      <SECTION title="What's Under the Hood">
        <Card>
          <div style={{
            fontSize: 12, fontWeight: 700, color: T.text,
            marginBottom: 10, fontFamily: T.fontBody,
          }}>
            Built as a full PWA: installable, offline-capable, no backend
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { label: '100 case scenarios', detail: 'across 8 core marketing case types' },
              { label: 'Framework flashcard game', detail: 'spaced-repetition style, timed rounds' },
              { label: 'Math drill engine', detail: '3 levels, 12 problem types, accuracy tracking' },
              { label: 'AI coaching per case', detail: '7 toggle sections from clarification to sample response' },
              { label: 'Audio practice recording', detail: 'saves to your device via IndexedDB' },
              { label: 'Progress tracking', detail: 'CSAI self-ratings, streaks, weak spot analysis' },
            ].map(({ label, detail }) => (
              <div key={label} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{
                  width: 6, height: 6, borderRadius: '50%', background: T.primary,
                  flexShrink: 0, marginTop: 5,
                }} />
                <div>
                  <span style={{ fontSize: 13, color: T.text, fontWeight: 600, fontFamily: T.fontBody }}>{label}</span>
                  <span style={{ fontSize: 12, color: T.textMuted, fontFamily: T.fontBody }}>: {detail}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </SECTION>

      {/* Sources */}
      <SECTION title="Sources & Content">
        <Card>
          <Body>
            The content in MBAce was shaped by some of the best resources in MBA recruiting prep.
            A huge thank you to the communities and materials that made this possible:
          </Body>
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { name: 'MLT (Management Leadership for Tomorrow)', detail: 'Career prep frameworks, recruiting strategy, and community guidance that keeps so many of us on track.' },
              { name: 'Crack the Case', detail: 'Case structure, interview flow, and the building blocks of how to think through a business problem out loud.' },
              { name: 'The Consortium', detail: 'Recruiting insight and community support for MBA candidates navigating competitive marketing roles.' },
              { name: 'MBA Marketing Curriculum', detail: "Core frameworks including 3C's, 4C's, STP, 4P's, and Growth and Profit equations drawn from standard b-school coursework." },
            ].map(({ name, detail }) => (
              <div key={name} style={{ paddingBottom: 10, borderBottom: `1px solid ${T.border}` }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 3, fontFamily: T.fontBody }}>{name}</div>
                <div style={{ fontSize: 12, color: T.textMuted, lineHeight: 1.6, fontFamily: T.fontBody }}>{detail}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 10 }}>
            <Body>
              All 100 scenarios are illustrative practice cases built with real-world brand
              context, not based on proprietary or confidential company data.
            </Body>
          </div>
        </Card>
      </SECTION>

      {/* AI Disclaimer */}
      <SECTION title="AI & Accuracy">
        <Card accent="rgba(245,158,11,0.30)">
          <div style={{
            fontSize: 12, fontWeight: 700, color: T.amber,
            marginBottom: 8, fontFamily: T.fontBody,
          }}>
            ⚠️ Built with AI Assistance
          </div>
          <Body>
            This app was built with the assistance of AI tools. Scenarios, coaching content,
            sample responses, and math walkthroughs were generated and then reviewed through
            dedicated fact-checking and QA passes. No AI output is perfect.
          </Body>
          <div style={{ marginTop: 10 }}>
            <Body>
              Use this as a learning aid and starting point. Double-check math, verify framework
              definitions, and apply your own judgment. This is a prep tool, not a
              definitive source of truth.
            </Body>
          </div>
        </Card>
      </SECTION>

      {/* Feedback */}
      <SECTION title="Feedback & Suggestions">
        <Card accent={T.primaryBorder}>
          <Body>
            Found an error? Have a case type you'd like added? Want to suggest a framework or
            flag something that doesn't look right? Every bit of feedback makes this better
            for everyone. Don't hesitate to reach out.
          </Body>
          <a
            href="mailto:knm74@cornell.edu"
            style={{
              display: 'block', marginTop: 12,
              padding: '10px 14px', borderRadius: T.r.md,
              background: T.primaryLight, border: `1px solid ${T.primaryBorder}`,
              color: T.primary, fontSize: 13, fontWeight: 700,
              textDecoration: 'none', textAlign: 'center', fontFamily: T.fontBody,
            }}
          >
            ✉️ Email Me
          </a>
        </Card>
      </SECTION>

    </div>
  )
}
