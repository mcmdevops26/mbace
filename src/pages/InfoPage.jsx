const SECTION = ({ title, children }) => (
  <div style={{ marginBottom: 28 }}>
    <div style={{
      fontSize: 10, fontWeight: 800, color: '#60a5fa',
      letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10,
    }}>
      {title}
    </div>
    {children}
  </div>
)

const Card = ({ children, accent }) => (
  <div style={{
    background: '#1e293b',
    border: `1px solid ${accent || '#334155'}`,
    borderRadius: 12,
    padding: '14px 16px',
    marginBottom: 10,
  }}>
    {children}
  </div>
)

const Body = ({ children }) => (
  <p style={{ margin: 0, fontSize: 13, color: '#94a3b8', lineHeight: 1.7 }}>{children}</p>
)

export default function InfoPage() {
  return (
    <div style={{ padding: '20px 16px 40px' }}>

      {/* Hero */}
      <div style={{ marginBottom: 28, textAlign: 'center' }}>
        <div style={{ fontSize: 36, marginBottom: 8 }}>🎓</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.5px' }}>
          MBAce
        </div>
        <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
          Marketing Case Interview Prep
        </div>
      </div>

      {/* What this is */}
      <SECTION title="What This Is">
        <Card>
          <Body>
            MBAce is a personal learning tool built to help us prepare for marketing case interviews
            as part of the MBA recruiting process. It's not a course, not a paid product — just a
            focused, mobile-friendly resource you can use anywhere to sharpen your instincts,
            practice your frameworks, and feel more confident walking into an interview room.
          </Body>
        </Card>
        <Card>
          <Body>
            The app covers 100 marketing case scenarios across 8 core case types, a framework
            flashcard game, math drills, self-assessment recording, and progress tracking — all
            running locally on your device with no account required.
          </Body>
        </Card>
      </SECTION>

      {/* Who it's for */}
      <SECTION title="Who It's For">
        <Card accent="#3b82f633">
          <Body>
            This tool was built for a small group of people I've shared it with directly. It's meant
            to help all of us succeed in marketing case prep — together. Please keep it within that
            circle.
          </Body>
        </Card>
      </SECTION>

      {/* Sources */}
      <SECTION title="Sources & Inspiration">
        <Card>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0', marginBottom: 6 }}>
            Marketing Case Frameworks
          </div>
          <Body>
            Core frameworks (3C's, 4C's, STP, 4P's, Growth & Profit equations) drawn from
            standard MBA marketing curriculum and recruiting prep materials widely used across
            top business programs.
          </Body>
        </Card>
        <Card>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0', marginBottom: 6 }}>
            Case Types & Interview Structure
          </div>
          <Body>
            Case categories and interview flow informed by marketing recruiting prep sessions,
            including guidance on the 8 most frequently tested case types in marketing interviews
            at top consumer goods, retail, and financial services companies.
          </Body>
        </Card>
        <Card>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0', marginBottom: 6 }}>
            Scenarios
          </div>
          <Body>
            All 100 practice scenarios were generated and reviewed with real-world brands and
            industry context in mind. They are illustrative practice cases — not based on
            proprietary or confidential company data.
          </Body>
        </Card>
      </SECTION>

      {/* AI Disclaimer */}
      <SECTION title="AI & Accuracy Disclaimer">
        <Card accent="#f59e0b33">
          <div style={{ fontSize: 12, fontWeight: 700, color: '#fbbf24', marginBottom: 8 }}>
            ⚠️ Built with AI Assistance
          </div>
          <Body>
            This app was built with the assistance of AI tools, including AI-generated case
            scenarios, coaching content, sample responses, and math walkthroughs. Dedicated
            fact-checking and QA passes were run to improve accuracy — but no AI-generated
            content is perfect.
          </Body>
          <div style={{ marginTop: 10 }}>
            <Body>
              Please treat all content as a starting point and learning aid. Double-check
              math, verify framework definitions, and use your own judgment. This is a prep
              tool, not a definitive source of truth.
            </Body>
          </div>
        </Card>
      </SECTION>

      {/* Cost */}
      <SECTION title="Cost">
        <Card accent="#22c55e33">
          <div style={{ fontSize: 13, color: '#86efac', fontWeight: 700, marginBottom: 6 }}>
            Free. Always.
          </div>
          <Body>
            MBAce is completely free. It's not a paid educational product. There's no subscription,
            no upsell, no data collection. Everything runs on your device.
          </Body>
        </Card>
      </SECTION>

      {/* Contact */}
      <SECTION title="Feedback & Suggestions">
        <Card accent="#6366f133">
          <Body>
            Have a case type you want added? Found an error? Want to suggest a framework or
            scenario? Reach out — this tool gets better with your input.
          </Body>
          <a
            href="mailto:knm74@cornell.edu"
            style={{
              display: 'block', marginTop: 12,
              padding: '10px 14px', borderRadius: 10,
              background: '#6366f122', border: '1px solid #6366f155',
              color: '#818cf8', fontSize: 13, fontWeight: 700,
              textDecoration: 'none', textAlign: 'center',
            }}
          >
            ✉️ knm74@cornell.edu
          </a>
        </Card>
      </SECTION>

      {/* Footer */}
      <div style={{ textAlign: 'center', marginTop: 8 }}>
        <div style={{ fontSize: 11, color: '#334155' }}>
          Made with care by Kim McMillian · Cornell '28
        </div>
        <div style={{ fontSize: 10, color: '#1e293b', marginTop: 4 }}>
          MBAce is an independent learning tool, unaffiliated with any university or company.
        </div>
      </div>

    </div>
  )
}
