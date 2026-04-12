const topCreators = [
  {
    id: 1,
    name: 'Ayesha Khan',
    niche: 'Lifestyle',
    followers: '210K',
    engagement: '8.9%',
    rate: '$420/campaign',
  },
  {
    id: 2,
    name: 'Ray Verma',
    niche: 'Tech',
    followers: '340K',
    engagement: '7.4%',
    rate: '$680/campaign',
  },
  {
    id: 3,
    name: 'Mina Joseph',
    niche: 'Travel',
    followers: '180K',
    engagement: '10.2%',
    rate: '$510/campaign',
  },
]

const featureCards = [
  {
    id: 1,
    title: 'Smart Matching',
    text: 'Get matched by niche, budget, location, and audience quality.',
  },
  {
    id: 2,
    title: 'Built-in Chat',
    text: 'Discuss campaign scope, revisions, and approvals in one thread.',
  },
  {
    id: 3,
    title: 'Secure Payments',
    text: 'Track milestones and payouts with a transparent project timeline.',
  },
]

function App() {
  return (
    <div className="page">
      <header className="navbar">
        <p className="brand">Sponsorly</p>
        <nav className="nav-links">
          <a href="#features">Features</a>
          <a href="#creators">Creators</a>
          <a href="#dashboard">Dashboard</a>
        </nav>
        <button className="btn btn-ghost">Sign In</button>
      </header>

      <main>
        <section className="hero">
          <div className="hero-content">
            <p className="eyebrow">Creator x Brand Marketplace</p>
            <h1>Launch Better Campaigns With The Right Creators</h1>
            <p className="subtitle">
              Discover creators, shortlist talent, negotiate deliverables, and ship campaigns
              from one clean workspace.
            </p>
            <div className="hero-actions">
              <button className="btn btn-primary">Get Started</button>
              <button className="btn btn-secondary">View Demo</button>
            </div>
          </div>
          <div className="hero-panel" id="dashboard">
            <p className="panel-title">Live Campaign Snapshot</p>
            <div className="metric-grid">
              <article>
                <p className="metric-value">28</p>
                <p className="metric-label">Active Campaigns</p>
              </article>
              <article>
                <p className="metric-value">94%</p>
                <p className="metric-label">On-time Delivery</p>
              </article>
              <article>
                <p className="metric-value">$42K</p>
                <p className="metric-label">This Month Spend</p>
              </article>
              <article>
                <p className="metric-value">4.8</p>
                <p className="metric-label">Avg Collaboration Rating</p>
              </article>
            </div>
          </div>
        </section>

        <section className="features" id="features">
          {featureCards.map((feature) => (
            <article className="card" key={feature.id}>
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </article>
          ))}
        </section>

        <section className="creator-section" id="creators">
          <div className="section-head">
            <h2>Top Creators This Week</h2>
            <button className="btn btn-ghost">Browse All</button>
          </div>

          <div className="creator-grid">
            {topCreators.map((creator) => (
              <article className="creator-card" key={creator.id}>
                <div className="avatar" aria-hidden="true">
                  {creator.name
                    .split(' ')
                    .map((chunk) => chunk[0])
                    .join('')}
                </div>
                <div>
                  <h3>{creator.name}</h3>
                  <p className="muted">{creator.niche} Creator</p>
                </div>
                <dl>
                  <div>
                    <dt>Followers</dt>
                    <dd>{creator.followers}</dd>
                  </div>
                  <div>
                    <dt>Engagement</dt>
                    <dd>{creator.engagement}</dd>
                  </div>
                  <div>
                    <dt>Rate</dt>
                    <dd>{creator.rate}</dd>
                  </div>
                </dl>
                <button className="btn btn-primary">Start Chat</button>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
