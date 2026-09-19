import { Link, useNavigate } from "react-router-dom";
import "./PollNotFound.css";

function PollNotFound() {
  const navigate = useNavigate();

  return (
    <main className="poll-not-found">
      {/* Decorative background */}

      <div
        className="poll-not-found__blob poll-not-found__blob--top"
        aria-hidden="true"
      />

      <div
        className="poll-not-found__blob poll-not-found__blob--bottom"
        aria-hidden="true"
      />

      <div
        className="poll-not-found__dot poll-not-found__dot--coral"
        aria-hidden="true"
      />

      <div
        className="poll-not-found__dot poll-not-found__dot--purple"
        aria-hidden="true"
      />

      {/* Navbar */}

      <header className="poll-not-found__navbar">
        <Link to="/" className="poll-not-found__brand">
          ◉ PULSEPOLL
        </Link>

        <nav>
          <Link to="/create">Create a poll</Link>

          <Link
            to="/create"
            className="poll-not-found__create"
          >
            Create →
          </Link>
        </nav>
      </header>

      {/* Main card */}

      <section className="poll-not-found__card">
        <div className="poll-not-found__icon">
          <div className="poll-not-found__icon-inner">
            ?
          </div>
        </div>

        <p className="poll-not-found__eyebrow">
          POLL NOT FOUND
        </p>

        <h1>
          Hmm… that poll
          <br />
          doesn’t exist.
        </h1>

        <p className="poll-not-found__description">
          The code may be wrong, expired, or the poll
          <br className="poll-not-found__desktop-break" />
          may have already been closed.
        </p>

        {/* Input-style action */}

        <button
          type="button"
          className="poll-not-found__try"
          onClick={() => navigate("/join")}
        >
          <span>Try another poll code</span>

          <span className="poll-not-found__arrow">
            →
          </span>
        </button>

        <button
          type="button"
          className="poll-not-found__back"
          onClick={() => navigate("/join")}
        >
          Back to join poll →
        </button>

        <p className="poll-not-found__footer">
          No account needed to vote.
        </p>
      </section>
    </main>
  );
}

export default PollNotFound;