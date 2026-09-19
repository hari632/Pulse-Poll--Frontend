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

        setPoll(data);

        // -----------------------------------------
        // REALTIME POLL UPDATES
        // -----------------------------------------
        unsubscribe = pollApi.subscribeToResults(pollId, (update) => {
          if (!isMounted) return;

          const updatedPoll = update?.poll || update;

          if (!updatedPoll) return;

          // If the poll was closed while we are watching it
          if (updatedPoll.status === "closed") {
            navigate(`/poll-closed/${code}`);
            return;
          }

          // Update the poll state with the latest vote data
          setPoll((currentPoll) => ({
            ...(currentPoll || {}),
            ...updatedPoll,
          }));
        });
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

  const currentOptions =
    Array.isArray(poll?.options) &&
    poll.options.length > 0
      ? poll.options.map((label, index) => {
          const voteCount = poll.votes?.[index] || 0;

          const percentage =
            currentTotalVotes > 0
              ? Math.round(
                  (voteCount / currentTotalVotes) * 100
                )
              : 0;

          return {
            label,
            percentage,
            color: colors[index % colors.length],
          };
        })
      : DEFAULT_POLL.options;

  const pollLink = `${window.location.origin}/poll-details/${code}`;

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

                <span>{option.percentage}%</span>
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

      <article className="poll-details__stats-card">
        <div>
          <strong>
            {currentTotalVotes.toLocaleString()}
          </strong>

          <span>TOTAL VOTES</span>
        </div>

        <div>
          <strong>
            {poll?.peakActivity ||
              DEFAULT_POLL.peakActivity}
          </strong>

          <span>PEAK ACTIVITY</span>
        </div>

        <div>
          <strong>
            {poll?.activity ||
              DEFAULT_POLL.activity}
          </strong>

          <span>ACTIVITY</span>
        </div>
      </article>

      <button
        type="button"
        className="poll-details__close-button"
        onClick={handleClosePoll}
        disabled={closed}
      >
        {closed ? "Closing..." : "Close poll"}
      </button>

      <p className="poll-details__footer">
        Results update automatically while your poll is live.
      </p>
    </main>
  );
}

export default PollDetails;