import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "./PollDetails.css";
import { pollApi } from "../../services/api";

const DEFAULT_POLL = {
  question: "Loading poll...",
  totalVotes: 0,
  peakActivity: "No activity yet",
  activity: "No votes yet",
  options: [],
};

function formatPeakTime(timeVal) {
  if (!timeVal || timeVal === "No activity yet") {
    return "No activity yet";
  }

  const date = new Date(timeVal);
  if (!isNaN(date.getTime()) && (timeVal.includes("T") || timeVal.includes("-"))) {
    return date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  return timeVal;
}

function PollDetails() {
  const navigate = useNavigate();
  const { pollId } = useParams();

  const [poll, setPoll] = useState(null);
  const [copied, setCopied] = useState(false);
  const [closed, setClosed] = useState(false);

  const code = pollId?.toUpperCase() || "PULSE7";

  useEffect(() => {
    if (!pollId) return undefined;

    let isMounted = true;
    let unsubscribe = () => {};

    /*
     * --------------------------------------------------
     * REALTIME WEBSOCKET
     * --------------------------------------------------
     *
     * Start the WebSocket immediately.
     * It should not depend on the REST API request finishing.
     */
    unsubscribe = pollApi.subscribeToResults(
      pollId,
      (update) => {
        if (!isMounted || !update) {
          return;
        }

        const updatedPoll = update?.poll || update;

        if (!updatedPoll) {
          return;
        }

        if (updatedPoll.status === "closed") {
          navigate(`/poll-closed/${code}`);
          return;
        }

        setPoll((currentPoll) => {
          const nextPoll = {
            ...(currentPoll || {}),
            ...updatedPoll,
          };

          if (updatedPoll.peakActivity) {
            nextPoll.peakActivity = updatedPoll.peakActivity;
          }

          if (updatedPoll.activity) {
            nextPoll.activity = updatedPoll.activity;
          }

          if (updatedPoll.totalVotes != null) {
            nextPoll.totalVotes = updatedPoll.totalVotes;
          }

          if (Array.isArray(updatedPoll.votes)) {
            nextPoll.votes = updatedPoll.votes;
          }

          if (Array.isArray(updatedPoll.percentages)) {
            nextPoll.percentages = updatedPoll.percentages;
          }

          return nextPoll;
        });
      }
    );

    /*
     * --------------------------------------------------
     * INITIAL REST DATA
     * --------------------------------------------------
     */
    async function loadPoll() {
      try {
        const data = await pollApi.getPoll(pollId);

        if (!isMounted) {
          return;
        }

        if (!data) {
          navigate("/poll-not-found");
          return;
        }

        if (data.status === "closed") {
          navigate(`/poll-closed/${code}`);
          return;
        }

        setPoll(data);
      } catch (err) {
        if (!isMounted) {
          return;
        }

        if (
          err?.status === 404 ||
          err?.message?.includes("not found")
        ) {
          navigate("/poll-not-found");
        }
      }
    }

    loadPoll();

    /*
     * --------------------------------------------------
     * CLEANUP
     * --------------------------------------------------
     */
    return () => {
      isMounted = false;
      unsubscribe();
      unsubscribe = () => {};
    };
  }, [pollId, code, navigate]);

  const currentQuestion =
    poll?.question || DEFAULT_POLL.question;

  const currentTotalVotes =
    poll?.totalVotes ??
    (Array.isArray(poll?.votes)
      ? poll.votes.reduce(
          (sum, count) => sum + count,
          0
        )
      : 0);

  const colors = [
    "coral",
    "coral",
    "purple",
    "yellow",
    "coral",
    "purple",
  ];

  const currentOptions =
    Array.isArray(poll?.options) &&
    poll.options.length > 0
      ? poll.options.map((optionItem, index) => {
          const label =
            typeof optionItem === "string"
              ? optionItem
              : optionItem?.text || optionItem?.label || `Option ${index + 1}`;

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
      : [];

  const pollLink =
    `${window.location.origin}/poll/${code}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(
        pollLink
      );
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
    try {
      setClosed(true);
      await pollApi.closePoll(code);
      window.setTimeout(() => {
        navigate(`/poll-closed/${code}`);
      }, 700);
    } catch {
      setClosed(false);
    }
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
            ●&nbsp;{" "}
            {closed ? "CLOSING..." : "LIVE NOW"}
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
                {formatPeakTime(poll?.peakActivity)}
              </strong>

              <span>PEAK ACTIVITY</span>
            </div>

          </div>

          <div className="poll-details__divider" />

          <div className="poll-details__activity">
            <strong>Activity</strong>

            <span>
              {poll?.activity || "No votes yet"}
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