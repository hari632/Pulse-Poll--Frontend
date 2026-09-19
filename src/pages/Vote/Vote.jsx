import { useEffect, useMemo, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import "./Vote.css";
import { pollApi } from "../../services/api";

const DEFAULT_POLL = {
  question: "Where should we go this weekend?",
  options: [
    "Beach day",
    "Movie night",
    "Cafe hopping",
    "Game night",
  ],
};

const DEFAULT_PERCENTAGES = [42, 28, 19, 11];

function Vote() {
  const navigate = useNavigate();
  const location = useLocation();
  const { pollId } = useParams();

  const hasNavigationPoll =
    Boolean(location.state?.question) &&
    Array.isArray(location.state?.options);

  const [poll, setPoll] = useState(() => {
    if (hasNavigationPoll) {
      return {
        question: location.state.question,
        options: location.state.options,
      };
    }

    return DEFAULT_POLL;
  });

  const [isLoadingPoll, setIsLoadingPoll] =
    useState(!hasNavigationPoll);

  const [pollError, setPollError] = useState("");

  const initialPercentages = useMemo(() => {
    if (hasNavigationPoll) {
      return poll.options.map(() => 0);
    }

    return DEFAULT_PERCENTAGES.slice(
      0,
      poll.options.length,
    );
  }, [hasNavigationPoll, poll.options]);

  const [selectedOption, setSelectedOption] =
    useState(null);

  const [percentages, setPercentages] = useState(
    initialPercentages,
  );

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [submitted, setSubmitted] = useState(false);

  const [error, setError] = useState("");

  const [voteCount, setVoteCount] = useState(
    hasNavigationPoll ? 0 : 1284,
  );

  /*
   * Load the poll when someone opens a direct URL.
   *
   * Example:
   * /poll/AB12CD
   *
   * Later this will call the real Go/Gin API.
   */
  useEffect(() => {
    if (hasNavigationPoll) {
      return;
    }

    let isMounted = true;

    async function loadPoll() {
      setIsLoadingPoll(true);
      setPollError("");

      try {
        const loadedPoll = await pollApi.getPoll(pollId);

        if (!isMounted) {
          return;
        }

        if (loadedPoll.status === "closed") {
          navigate(`/poll-closed/${pollId}`);
          return;
        }

        setPoll({
          question: loadedPoll.question,
          options: loadedPoll.options,
        });

        const votes = Array.isArray(loadedPoll.votes)
          ? loadedPoll.votes
          : [];

        const totalVotes = votes.reduce(
          (sum, count) => sum + count,
          0,
        );

        if (totalVotes > 0) {
          const loadedPercentages = votes.map((count) =>
            Math.round((count / totalVotes) * 100),
          );

          setPercentages(
            normalizePercentages(loadedPercentages),
          );
        } else {
          setPercentages(
            loadedPoll.options.map(() => 0),
          );
        }

        setVoteCount(totalVotes);
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        if (loadError?.status === 404 || loadError?.message?.includes("not found")) {
          navigate("/poll-not-found");
          return;
        }

        setPollError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load this poll.",
        );
      } finally {
        if (isMounted) {
          setIsLoadingPoll(false);
        }
      }
    }

    loadPoll();

    return () => {
      isMounted = false;
    };
  }, [hasNavigationPoll, pollId, navigate]);

  /*
   * Realtime vote update subscription via Redis & WebSocket.
   */
  useEffect(() => {
    if (isLoadingPoll || pollError || !pollId) {
      return undefined;
    }

    const unsubscribe = pollApi.subscribeToResults(pollId, (data) => {
      if (data && Array.isArray(data.votes)) {
        const totalVotes =
          data.totalVotes ??
          data.votes.reduce((sum, count) => sum + count, 0);

        setVoteCount(totalVotes);

        if (Array.isArray(data.percentages) && data.percentages.length > 0) {
          setPercentages(data.percentages);
        } else if (totalVotes > 0) {
          const nextPercentages = data.votes.map((count) =>
            Math.round((count / totalVotes) * 100),
          );
          setPercentages(normalizePercentages(nextPercentages));
        }
      } else if (typeof data?.totalVotes === "number") {
        setVoteCount(data.totalVotes);
      }
    });

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [isLoadingPoll, pollError, pollId]);

  function handleSelect(index) {
    if (
      isLoadingPoll ||
      isSubmitting ||
      submitted
    ) {
      return;
    }

    setError("");
    setSelectedOption(index);
  }

  async function handleVote() {
    if (
      selectedOption === null ||
      isSubmitting ||
      submitted ||
      isLoadingPoll
    ) {
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const updatedPoll = await pollApi.submitVote(
        pollId,
        selectedOption,
      );

      if (
        updatedPoll &&
        Array.isArray(updatedPoll.votes)
      ) {
        const totalVotes = updatedPoll.votes.reduce(
          (sum, count) => sum + count,
          0,
        );

        if (totalVotes > 0) {
          const nextPercentages =
            updatedPoll.votes.map((count) =>
              Math.round(
                (count / totalVotes) * 100,
              ),
            );

          setPercentages(
            normalizePercentages(nextPercentages),
          );

          setVoteCount(totalVotes);
        }
      } else {
        setVoteCount((count) => count + 1);
      }

      setSubmitted(true);

      const selectedOptionLabel = poll.options[selectedOption] || "";
      const selectedPercentage = percentages[selectedOption] ?? 0;

      navigate(`/vote-success/${pollId}`, {
        state: {
          selectedOptionLabel,
          percentage: selectedPercentage,
          selectedOption,
          question: poll.question,
          options: poll.options,
          percentages,
          voteCount: voteCount + 1,
        },
      });
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to submit your vote. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function viewResults() {
    navigate(`/results/${pollId}`, {
      state: {
        question: poll.question,
        options: poll.options,
        percentages,
        selectedOption,
        voteCount: voteCount + 1,
      },
    });
  }

  if (isLoadingPoll) {
    return (
      <main className="vote-page">
        <header className="vote-navbar">
          <Link to="/" className="vote-navbar__brand">
            ◉ PULSEPOLL
          </Link>

          <div className="vote-navbar__live">
            <span className="vote-navbar__dot" />
            LIVE NOW
          </div>
        </header>

        <section className="vote-intro">
          <div className="vote-live-badge">
            <span>●</span>
            LIVE POLL
          </div>

          <h1>Loading poll...</h1>

          <p>
            Getting the latest poll details for you.
          </p>
        </section>

        <section className="vote-layout">
          <div className="voting-card vote-loading-card">
            <span className="button-spinner" />

            <p>Loading poll...</p>
          </div>
        </section>
      </main>
    );
  }

  if (pollError) {
    return (
      <main className="vote-page">
        <header className="vote-navbar">
          <Link to="/" className="vote-navbar__brand">
            ◉ PULSEPOLL
          </Link>

          <Link
            to="/join"
            className="vote-navbar__live"
          >
            Join another poll
          </Link>
        </header>

        <section className="vote-intro">
          <div className="vote-live-badge">
            <span>●</span>
            POLL UNAVAILABLE
          </div>

          <h1>We couldn't find this poll.</h1>

          <p>{pollError}</p>
        </section>

        <section className="vote-layout">
          <div className="voting-card vote-error-card">
            <p className="vote-error" role="alert">
              {pollError}
            </p>

            <Link
              to="/join"
              className="cast-vote-button"
            >
              Join another poll →
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="vote-page">
      {/* =================================================
          NAVBAR
      ================================================= */}

      <header className="vote-navbar">
        <Link to="/" className="vote-navbar__brand">
          ◉ PULSEPOLL
        </Link>

        <div className="vote-navbar__live">
          <span className="vote-navbar__dot" />
          LIVE NOW
        </div>
      </header>

      {/* =================================================
          PAGE INTRO
      ================================================= */}

      <section className="vote-intro">
        <div className="vote-live-badge">
          <span>●</span>
          LIVE POLL
        </div>

        <h1>{poll.question}</h1>

        <p>
          Pick one. Your vote updates the room instantly.
        </p>
      </section>

      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <section className="vote-layout">
        {/* =================================================
            VOTING CARD
        ================================================= */}

        <div className="voting-card">
          <div className="voting-card__header">
            <span>YOUR CHOICE</span>

            <span>
              {selectedOption !== null
                ? "Selected"
                : "Choose one"}
            </span>
          </div>

          <div className="vote-options">
            {poll.options.map((option, index) => {
              const isSelected =
                selectedOption === index;

              const percentage =
                percentages[index] ?? 0;

              return (
                <button
                  type="button"
                  key={`${option}-${index}`}
                  className={`vote-option ${
                    isSelected
                      ? "vote-option--selected"
                      : ""
                  }`}
                  onClick={() => handleSelect(index)}
                  disabled={
                    isSubmitting || submitted
                  }
                >
                  <span className="vote-option__left">
                    <span
                      className={`vote-option__radio ${
                        isSelected
                          ? "vote-option__radio--selected"
                          : ""
                      }`}
                    >
                      {isSelected && (
                        <span className="vote-option__check">
                          ✓
                        </span>
                      )}
                    </span>

                    <span className="vote-option__name">
                      {option}
                    </span>
                  </span>

                  <span className="vote-option__percentage">
                    {percentage}%
                  </span>
                </button>
              );
            })}
          </div>

          {error && (
            <p className="vote-error" role="alert">
              {error}
            </p>
          )}

          {!submitted ? (
            <button
              type="button"
              className={`cast-vote-button ${
                selectedOption === null
                  ? "cast-vote-button--disabled"
                  : ""
              }`}
              disabled={
                selectedOption === null ||
                isSubmitting
              }
              onClick={handleVote}
            >
              {isSubmitting ? (
                <>
                  <span className="button-spinner" />
                  Casting vote...
                </>
              ) : (
                <>Cast my vote →</>
              )}
            </button>
          ) : (
            <div className="vote-submitted">
              <div className="vote-submitted__icon">
                ✓
              </div>

              <div>
                <strong>Vote submitted!</strong>

                <p>
                  Your vote has been added to the room.
                </p>
              </div>

              <button
                type="button"
                onClick={viewResults}
              >
                View results →
              </button>
            </div>
          )}
        </div>

        {/* =================================================
            LIVE RESULTS
        ================================================= */}

        <aside className="live-results">
          <div className="live-results__label">
            <span className="live-results__dot" />
            LIVE RESULTS
          </div>

          <h2>The room is voting.</h2>

          <div className="live-results__count">
            {voteCount.toLocaleString()} votes
          </div>

          <p className="live-results__description">
            Results update live as people vote.
          </p>

          <div className="result-list">
            {poll.options.map((option, index) => {
              const percentage =
                percentages[index] ?? 0;

              const isSelected =
                selectedOption === index;

              return (
                <div
                  className={`result-item ${
                    isSelected
                      ? "result-item--selected"
                      : ""
                  }`}
                  key={`${option}-result`}
                >
                  <div className="result-item__header">
                    <strong>{option}</strong>

                    <span>
                      {percentage}%
                    </span>
                  </div>

                  <div className="result-track">
                    <div
                      className={`result-fill ${
                        index === 2
                          ? "result-fill--purple"
                          : ""
                      } ${
                        index === 3
                          ? "result-fill--green"
                          : ""
                      }`}
                      style={{
                        width: `${percentage}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="live-results__divider" />

          <p className="live-results__activity">
            <span>●</span>
            {submitted
              ? " You just voted"
              : " 12 people voted in the last minute"}
          </p>
        </aside>
      </section>
    </main>
  );
}

function normalizePercentages(values) {
  if (!values.length) {
    return values;
  }

  const total = values.reduce(
    (sum, value) => sum + value,
    0,
  );

  if (total === 0) {
    return values;
  }

  const normalized = values.map((value) =>
    Math.round((value / total) * 100),
  );

  const difference =
    100 -
    normalized.reduce(
      (sum, value) => sum + value,
      0,
    );

  normalized[0] += difference;

  return normalized;
}

export default Vote;