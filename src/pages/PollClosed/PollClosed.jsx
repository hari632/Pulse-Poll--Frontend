import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import "./PollClosed.css";
import { pollApi } from "../../services/api";

const DEFAULT_RESULTS = {
  question: "What should we ask the group?",
  totalVotes: 1284,
  options: [
    { label: "Weekend plans", percentage: 52 },
    { label: "Favorite food", percentage: 27 },
    { label: "Next trip", percentage: 13 },
    { label: "Movie night", percentage: 8 },
  ],
};

function PollClosed() {
  const { pollId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [closedPoll, setClosedPoll] = useState(location.state || null);

  useEffect(() => {
    if (!closedPoll && pollId) {
      let isMounted = true;
      pollApi
        .getPoll(pollId)
        .then((data) => {
          if (!isMounted || !data) return;
          const votes = Array.isArray(data.votes) ? data.votes : [];
          const totalVotes =
            data.totalVotes ?? votes.reduce((s, c) => s + c, 0);
          const options = Array.isArray(data.options)
            ? data.options.map((opt, i) => {
                const voteCount = votes[i] || 0;
                const percentage =
                  totalVotes > 0
                    ? Math.round((voteCount / totalVotes) * 100)
                    : 0;
                return { label: opt, percentage };
              })
            : DEFAULT_RESULTS.options;

          setClosedPoll({
            question: data.question || DEFAULT_RESULTS.question,
            totalVotes,
            options,
          });
        })
        .catch(() => {});
      return () => {
        isMounted = false;
      };
    }
  }, [closedPoll, pollId]);

  const poll = {
    ...DEFAULT_RESULTS,
    ...(closedPoll || {}),
  };

  const code = pollId?.toUpperCase() || "PULSE7";
  const pollUrl = `${window.location.origin}/poll-details/${code}`;

  async function copyPollLink() {
    try {
      await navigator.clipboard.writeText(pollUrl);
    } catch {
      // Clipboard can be unavailable in some browsers.
    }

    setCopied(true);

    window.setTimeout(() => {
      setCopied(false);
    }, 1800);
  }

  async function shareResults() {
    const shareData = {
      title: "PulsePoll results",
      text: `Check out the final results for "${poll.question}"`,
      url: pollUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(pollUrl);
        setShared(true);

        window.setTimeout(() => {
          setShared(false);
        }, 1800);
      }
    } catch {
      // User cancelled the native share dialog.
    }
  }

  function createAnother() {
    navigate("/create");
  }

  return (
    <main className="poll-closed">
      {/* Decorative shapes */}

      <div
        className="poll-closed__blob poll-closed__blob--coral"
        aria-hidden="true"
      />

      <div
        className="poll-closed__blob poll-closed__blob--purple"
        aria-hidden="true"
      />

      <div
        className="poll-closed__dot poll-closed__dot--coral"
        aria-hidden="true"
      />

      <div
        className="poll-closed__dot poll-closed__dot--purple"
        aria-hidden="true"
      />

      {/* Navbar */}

      <header className="poll-closed__navbar">
        <Link to="/" className="poll-closed__brand">
          ◉ PULSEPOLL
        </Link>

        <nav>
          <Link to="/mypolls">Your polls</Link>

          <Link to="/create" className="poll-closed__create">
            Create a poll →
          </Link>
        </nav>
      </header>

      {/* Main content */}

      <div className="poll-closed__container">
        <section className="poll-closed__intro">
          <div className="poll-closed__badge">
            <span>●</span>
            POLL CLOSED
          </div>

          <h1>The results are in!</h1>

          <p>
            Thanks for voting. Here’s how everyone answered.
          </p>
        </section>

        <section className="poll-closed__grid">
          {/* Results */}

          <article className="poll-closed__results-card">
            <div className="poll-closed__results-head">
              <p>FINAL RESULTS</p>

              <h2>{poll.question}</h2>

              <span>
                {poll.totalVotes.toLocaleString()} total votes
              </span>
            </div>

            <div className="poll-closed__options">
              {poll.options.map((option, index) => (
                <div
                  className={`poll-closed__option ${
                    index === 2
                      ? "poll-closed__option--purple"
                      : index === 3
                        ? "poll-closed__option--yellow"
                        : ""
                  }`}
                  key={option.label}
                  style={{
                    "--option-delay": `${index * 120}ms`,
                  }}
                >
                  <div className="poll-closed__option-top">
                    <strong>{option.label}</strong>

                    <span>{option.percentage}%</span>
                  </div>

                  <div className="poll-closed__track">
                    <i
                      style={{
                        width: `${option.percentage}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </article>

          {/* Share */}

          <aside className="poll-closed__share-card">
            <p className="poll-closed__share-eyebrow">
              KEEP THE CONVERSATION GOING
            </p>

            <h2>Share these results</h2>

            <p className="poll-closed__share-description">
              Send the poll to your group and see what they
              think next.
            </p>

            <button
              type="button"
              className="poll-closed__share-button"
              onClick={shareResults}
            >
              {shared ? "Link copied ✓" : "Share results ↗"}
            </button>

            <button
              type="button"
              className="poll-closed__copy-button"
              onClick={copyPollLink}
            >
              {copied ? "Copied ✓" : "Copy poll link"}
            </button>

            <p className="poll-closed__saved">
              Poll closed • Results saved
            </p>

            <button
              type="button"
              className="poll-closed__new-button"
              onClick={createAnother}
            >
              Create another
            </button>
          </aside>
        </section>
      </div>
    </main>
  );
}

export default PollClosed;