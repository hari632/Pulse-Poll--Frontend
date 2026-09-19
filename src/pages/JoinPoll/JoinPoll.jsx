import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./JoinPoll.css";
import { pollApi } from "../../services/api";

function JoinPoll() {
  const navigate = useNavigate();

  const [pollCode, setPollCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [message, setMessage] = useState("");

  function handleCodeChange(event) {
    const value = event.target.value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 6);

    setPollCode(value);
    setMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (pollCode.length !== 6) {
      setMessage("Enter the 6-character poll code.");
      return;
    }

    setMessage("");
    setIsJoining(true);

    try {
      const poll = await pollApi.getPoll(pollCode);

      if (!poll) {
        throw new Error("Poll not found.");
      }

      if (poll.status !== "active") {
        throw new Error("This poll is no longer active.");
      }

      navigate(`/poll/${poll.id}`, {
        state: {
          question: poll.question,
          options: poll.options,
        },
      });
    } catch (joinError) {
      setMessage(
        joinError instanceof Error
          ? joinError.message
          : "Unable to find this poll. Please check the code.",
      );
    } finally {
      setIsJoining(false);
    }
  }

  return (
    <main className="join-poll">
      {/* =================================================
          DECORATIVE BACKGROUND
      ================================================= */}

      <div
        className="join-poll__blob join-poll__blob--coral"
        aria-hidden="true"
      />

      <div
        className="join-poll__blob join-poll__blob--purple"
        aria-hidden="true"
      />

      <div
        className="join-poll__blob join-poll__blob--lime"
        aria-hidden="true"
      />

      <div
        className="join-poll__dot join-poll__dot--yellow"
        aria-hidden="true"
      />

      <div
        className="join-poll__dot join-poll__dot--small"
        aria-hidden="true"
      />

      {/* =================================================
          NAVBAR
      ================================================= */}

      <header className="join-poll__navbar">
        <Link to="/" className="join-poll__brand">
          ◉ PULSEPOLL
        </Link>

        <nav className="join-poll__nav">
          <Link to="/create">Create Poll</Link>

          <Link to="/login">Sign in</Link>
        </nav>
      </header>

      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <section className="join-poll__content">
        <div className="join-poll__eyebrow">
          <span className="join-poll__live-dot" />
          JOIN A LIVE POLL
        </div>

        <h1>
          Got a poll code?
          <br />
          <span>Jump right in.</span>
        </h1>

        <p className="join-poll__description">
          Enter the code shared by your host and cast your
          vote. No account needed.
        </p>

        {/* =================================================
            JOIN CARD
        ================================================= */}

        <div className="join-poll__card">
          <div className="join-poll__card-top">
            <div>
              <span className="join-poll__card-label">
                POLL CODE
              </span>

              <h2>Enter your code</h2>
            </div>

            <div className="join-poll__code-icon">
              #
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <label htmlFor="poll-code">
              6-character code
            </label>

            <input
              id="poll-code"
              type="text"
              value={pollCode}
              onChange={handleCodeChange}
              placeholder="ABC123"
              maxLength={6}
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck="false"
              aria-describedby="poll-code-help"
              aria-invalid={Boolean(message)}
              disabled={isJoining}
            />

            <div className="join-poll__input-meta">
              <span id="poll-code-help">
                Usually shared by your poll host.
              </span>

              <strong>{pollCode.length}/6</strong>
            </div>

            <button
              type="submit"
              className="join-poll__submit"
              disabled={
                isJoining || pollCode.length !== 6
              }
            >
              <span>
                {isJoining
                  ? "Finding poll..."
                  : "Join poll"}
              </span>

              <strong>→</strong>
            </button>
          </form>

          {message && (
            <p
              className="join-poll__message"
              role="alert"
              aria-live="polite"
            >
              {message}
            </p>
          )}

          <div className="join-poll__divider">
            <span>or</span>
          </div>

          <Link
            to="/create"
            className="join-poll__create-link"
          >
            Want to host instead?
            <strong>Create a poll →</strong>
          </Link>
        </div>

        {/* =================================================
            LIVE INFO
        ================================================= */}

        <div className="join-poll__live-info">
          <div className="join-poll__live-avatar">
            <span />
            <span />
            <span />
          </div>

          <div>
            <strong>Voting happens live</strong>

            <p>
              Results update instantly as everyone votes.
            </p>
          </div>
        </div>
      </section>

      <footer className="join-poll__footer">
        PulsePoll makes group decisions quick, playful, and
        live.
      </footer>
    </main>
  );
}

export default JoinPoll;