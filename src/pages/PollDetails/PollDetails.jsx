import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "./PollDetails.css";
import { pollApi } from "../../services/api";

const DEFAULT_POLL = {
  question: "What’s your favorite stack?",
  totalVotes: 1284,
  peakActivity: "8:42 PM",
  activity: "+124 votes in the last hour",
  options: [
    { label: "React", percentage: 46, color: "coral" },
    { label: "Vue", percentage: 28, color: "coral" },
    { label: "Angular", percentage: 16, color: "purple" },
    { label: "Svelte", percentage: 10, color: "yellow" },
  ],
};

function PollDetails() {
  const navigate = useNavigate();
  const { pollId } = useParams();

  const [poll, setPoll] = useState(null);
  const [copied, setCopied] = useState(false);
  const [closed, setClosed] = useState(false);

  const code = pollId?.toUpperCase() || "PULSE7";

  useEffect(() => {
    let isMounted = true;
    let unsubscribe = () => {};

    async function loadPoll() {
      if (!pollId) return;

      try {
        const data = await pollApi.getPoll(pollId);

        if (!isMounted) return;

        if (!data) {
          navigate("/poll-not-found");
          return;
        }

        if (data.status === "closed") {
          navigate(`/poll-closed/${code}`);
          return;
        }

        // Initial poll data
        setPoll(data);

        // =========================================
        // REALTIME LIVE RESULTS
        // =========================================
        unsubscribe = pollApi.subscribeToResults(
          pollId,
          (update) => {
            if (!isMounted) return;

            const updatedPoll = update?.poll || update;

            if (!updatedPoll) return;

            // If poll is closed while watching
            if (updatedPoll.status === "closed") {
              navigate(`/poll-closed/${code}`);
              return;
            }

            // =========================================
            // UPDATE LIVE POLL DATA
            // =========================================
            setPoll((currentPoll) => ({
              ...(currentPoll || {}),
              ...updatedPoll,

              // Live vote data
              votes:
                updatedPoll.votes ??
                currentPoll?.votes,

              totalVotes:
                updatedPoll.totalVotes ??
                currentPoll?.totalVotes,

              percentages:
                updatedPoll.percentages ??
                currentPoll?.percentages,

              // Live activity data
              peakActivity:
                updatedPoll.peakActivity ??
                currentPoll?.peakActivity,

              activity:
                updatedPoll.activity ??
                currentPoll?.activity,
            }));
          }
        );
      } catch (err) {
        if (!isMounted) return;

        if (
          err?.status === 404 ||
          err?.message?.includes("not found")
        ) {
          navigate("/poll-not-found");
        }
      }
    }

    loadPoll();

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [pollId, code, navigate]);

  const currentQuestion =
    poll?.question || DEFAULT_POLL.question;

  // =========================================
  // LIVE TOTAL VOTES
  // =========================================
  const currentTotalVotes =
    poll?.totalVotes ??
    (Array.isArray(poll?.votes)
      ? poll.votes.reduce(
          (sum, count) => sum + count,
          0
        )
      : DEFAULT_POLL.totalVotes);

  const colors = [
    "coral",
    "coral",
    "purple",
    "yellow",
    "coral",
    "purple",
  ];

  // =========================================
  // LIVE OPTIONS + PERCENTAGES
  // =========================================
  const currentOptions =
    Array.isArray(poll?.options) &&
    poll.options.length > 0
      ? poll.options.map((label, index) => {
          const voteCount =
            poll.votes?.[index] || 0;

          const percentage =
            Array.isArray(poll?.percentages) &&
            poll.percentages[index] != null
              ? poll.percentages[index]
              : currentTotalVotes > 0
                ? Math.round(
                    (voteCount / currentTotalVotes) * 100
                  )
                : 0;

          return {
            label,
            percentage,
            color:
              colors[index % colors.length],
          };
        })
      : DEFAULT_POLL.options;

  const pollLink =
    `${window.location.origin}/poll-details/${code}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(pollLink);
    } catch {}

    setCopied(true);

    window.setTimeout(
      () => setCopied(false),
      1800
    );
  }

  function handleVote() {
    navigate(`/poll/${code}`);
  }

  async function handleClosePoll() {
    setClosed(true);

    try {
      await pollApi.closePoll(code);
    } catch {}

    window.setTimeout(() => {
      navigate(`/poll-closed/${code}`);
    }, 700);
  }

  return (
    <main className="poll-details">

      {/* =========================================
          DECORATIVE BLOBS
      ========================================= */}

      <div className="poll-details__blob poll-details__blob--coral" />
      <div className="poll-details__blob poll-details__blob--purple" />
      <div className="poll-details__blob poll-details__blob--peach" />

      {/* =========================================
          NAVBAR
      ========================================= */}

      <header className="poll-details__navbar">
        <Link
          to="/"
          className="poll-details__brand"
        >
          ◉ PULSEPOLL
        </Link>

        <nav>
          <Link
            to="/mypolls"
            className="poll-details__active-link"
          >
            My polls
          </Link>

          <Link to="/archive">
            Archive
          </Link>

          <Link
            to={`/poll/${code}`}
            className="poll-details__create"
          >
            Vote now →
          </Link>
        </nav>
      </header>

      {/* =========================================
          HEADER
      ========================================= */}

      <section className="poll-details__header">
        <div>
          <p className="poll-details__eyebrow">
            POLL DETAILS
          </p>

          <h1>{currentQuestion}</h1>

          <p className="poll-details__subtitle">
            A quick look at how your poll is performing.
          </p>
        </div>

        <div className="poll-details__status">
          <span>
            ●&nbsp; {closed ? "CLOSING..." : "LIVE NOW"}
          </span>

          <strong>
            {currentTotalVotes.toLocaleString()} votes
          </strong>
        </div>
      </section>

      {/* =========================================
          DASHBOARD
      ========================================= */}

      <section className="poll-details__dashboard">

        {/* =========================================
            RESULTS CARD
        ========================================= */}

        <article className="poll-details__results-card">
          <div className="poll-details__card-heading">
            <p>LIVE RESULTS</p>

            <h2>{currentQuestion}</h2>

            <span>Updated just now</span>
          </div>

          <div className="poll-details__results">
            {currentOptions.map((option, index) => (
              <div
                className="poll-details__result"
                key={option.label}
                onClick={handleVote}
                style={{
                  "--result-delay": `${index * 120}ms`,
                  cursor: "pointer",
                }}
              >
                <div className="poll-details__result-label">
                  <strong>{option.label}</strong>

                  <span>
                    {option.percentage}%
                  </span>
                </div>

                <div className="poll-details__track">
                  <i
                    className={`poll-details__fill poll-details__fill--${option.color}`}
                    style={{
                      width: `${option.percentage}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>

        {/* =========================================
            STATS CARD
        ========================================= */}

        <article className="poll-details__stats-card">
          <p className="poll-details__card-label">
            AT A GLANCE
          </p>

          <div className="poll-details__stats">

            <div className="poll-details__stat">
              <strong>
                {currentTotalVotes.toLocaleString()}
              </strong>

              <span>TOTAL VOTES</span>
            </div>

            <div className="poll-details__stat">
              <strong>
                {poll?.peakActivity ||
                  DEFAULT_POLL.peakActivity}
              </strong>

              <span>PEAK ACTIVITY</span>
            </div>

          </div>

          <div className="poll-details__divider" />

          <div className="poll-details__activity">
            <strong>Activity</strong>

            <span>
              {poll?.activity ||
                DEFAULT_POLL.activity}
            </span>
          </div>
        </article>

        {/* =========================================
            ACTIONS CARD
        ========================================= */}

        <article className="poll-details__actions-card">
          <p className="poll-details__card-label">
            SHARE &amp; MANAGE
          </p>

          <h2>
            Keep the conversation going.
          </h2>

          <p className="poll-details__actions-description">
            Share this live poll or close it when
            you’re ready.
          </p>

          <button
            type="button"
            className="poll-details__share-button"
            onClick={handleVote}
          >
            Vote in this poll →
          </button>

          <div className="poll-details__secondary-actions">

            <button
              type="button"
              className="poll-details__close-button"
              onClick={handleClosePoll}
              disabled={closed}
            >
              {closed
                ? "Closing..."
                : "Close poll"}
            </button>

            <button
              type="button"
              className="poll-details__copy-button"
              onClick={handleCopy}
            >
              {copied
                ? "Copied ✓"
                : "Copy link"}
            </button>

          </div>
        </article>

      </section>

      {/* =========================================
          FOOTER NOTE
      ========================================= */}

      <p className="poll-details__footer">
        Results update automatically while your poll
        is live.
      </p>

    </main>
  );
}

export default PollDetails;