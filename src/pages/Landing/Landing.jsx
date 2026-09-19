import { Link } from "react-router-dom";
import "./Landing.css";

function Landing() {
  return (
    <main className="landing">
      {/* Decorative shapes */}
      <div className="landing__pink-blob" />
      <div className="landing__purple-blob" />

      {/* Navbar */}
      <nav className="navbar">
        <Link to="/" className="navbar__brand">
          ◉ PULSEPOLL
        </Link>

        <div className="navbar__links">
          
          <Link to="/login" className="navbar__signin">
            Sign in
          </Link>

          <Link to="/signup" className="button button--primary navbar__cta">
            Create a Poll&nbsp; →
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero__content">
          <div className="live-badge">
            <span>●</span>
            LIVE POLLING
          </div>

          <h1>
            Ask anything.
            <br />
            See what everyone
            <br />
            thinks.
          </h1>

          <p className="hero__description">
            Create live polls in seconds. Share a link. Watch the room respond
            in real time.
          </p>

          <div className="hero__actions">
            <Link to="/signup" className="button button--primary">
              Create a Poll&nbsp; →
            </Link>

            <Link to="/join" className="button button--outline">
              Join a Poll
            </Link>
          </div>

          <p className="hero__note">
            No signup needed to vote&nbsp; • &nbsp;Free to start
          </p>
        </div>

        {/* Poll preview */}
        <div className="poll-preview">
          <div className="poll-preview__top">
            <span className="poll-preview__label">LIVE POLL</span>

            <span className="votes-badge">
              <span>●</span>
              1,284 votes
            </span>
          </div>

          <h2>What’s your favorite stack?</h2>

          <p className="poll-preview__description">
            Choose one — results update instantly.
          </p>

          <PollOption label="React" percentage="52%" width="52%" />
          <PollOption label="Vue" percentage="24%" width="24%" />
          <PollOption
            label="Svelte"
            percentage="15%"
            width="15%"
            purple
          />
          <PollOption label="Angular" percentage="9%" width="9%" />

          <div className="poll-preview__divider" />

          <p className="poll-preview__activity">
            ↗ &nbsp;128 people voted in the last minute
          </p>
        </div>

        {/* LIVE NOW sticker */}
        <div className="live-sticker">LIVE NOW</div>
      </section>

      {/* Trust strip */}
      <section className="trust-strip">
        <div className="trust-item">
          <span className="trust-badge trust-badge--pink">FAST</span>

          <strong>Create in seconds</strong>

          <p>One question. One link. Done.</p>
        </div>

        <div className="trust-item">
          <span className="trust-badge trust-badge--purple">LIVE</span>

          <strong>Results update live</strong>

          <p>Watch opinions move in real time.</p>
        </div>
      </section>
    </main>
  );
}

function PollOption({ label, percentage, width, purple = false }) {
  return (
    <div className="poll-option">
      <div className="poll-option__header">
        <span>{label}</span>
        <strong className={purple ? "percentage--purple" : ""}>
          {percentage}
        </strong>
      </div>

      <div className="poll-option__bar">
        <div
          className="poll-option__fill"
          style={{ width }}
        />
      </div>
    </div>
  );
  
}

export default Landing;