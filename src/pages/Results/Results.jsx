import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import "./Results.css";
import { pollApi } from "../../services/api";

const DEFAULT_RESULTS = {
  question: "What should we ask the group?",
  options: [
    "Weekend plans",
    "Favorite food",
    "Next trip",
    "Something random",
  ],
  percentages: [52, 28, 14, 6],
  selectedOption: 0,
  voteCount: 1284,
};

function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const { pollId } = useParams();

  const state = location.state;

  const initialResults = useMemo(() => {
    if (!state?.options) {
      return DEFAULT_RESULTS;
    }

    return {
      question:
        state.question || DEFAULT_RESULTS.question,

      options:
        state.options || DEFAULT_RESULTS.options,

      percentages:
        state.percentages?.length
          ? state.percentages
          : DEFAULT_RESULTS.percentages,

      selectedOption:
        state.selectedOption ?? 0,

      voteCount:
        state.voteCount ?? DEFAULT_RESULTS.voteCount,
    };
  }, [state]);

  const [results, setResults] = useState(initialResults);

  const [copied, setCopied] = useState(false);

  const [isSharing, setIsSharing] =
    useState(false);

  /*
   * Realtime live-result updates via Redis & WebSocket.
   */
  useEffect(() => {
    let isMounted = true;

    async function fetchInitial() {
      if (!pollId || pollId === "demo") return;
      try {
        const poll = await pollApi.getPoll(pollId);
        if (!isMounted || !poll) return;

        const options = Array.isArray(poll.options) ? poll.options : [];
        const votes = Array.isArray(poll.votes) ? poll.votes : [];
        const totalVotes = poll.totalVotes ?? votes.reduce((s, c) => s + c, 0);

        let percentages = poll.percentages;
        if (!Array.isArray(percentages) || percentages.length === 0) {
          if (totalVotes > 0) {
            percentages = votes.map((c) => Math.round((c / totalVotes) * 100));
          } else {
            percentages = options.map(() => 0);
          }
        }

        setResults((curr) => ({
          ...curr,
          question: poll.question || curr.question,
          options: options.length > 0 ? options : curr.options,
          percentages: percentages.length > 0 ? percentages : curr.percentages,
          voteCount: totalVotes,
        }));
      } catch {
        // Keep current state
      }
    }

    fetchInitial();

    if (!pollId || pollId === "demo") return undefined;

    const unsubscribe = pollApi.subscribeToResults(pollId, (data) => {
      if (!isMounted || !data) return;

      setResults((current) => {
        const totalVotes =
          data.totalVotes ??
          (Array.isArray(data.votes)
            ? data.votes.reduce((sum, count) => sum + count, 0)
            : current.voteCount);

        let percentages = current.percentages;
        if (Array.isArray(data.percentages) && data.percentages.length > 0) {
          percentages = data.percentages;
        } else if (Array.isArray(data.votes) && totalVotes > 0) {
          percentages = data.votes.map((c) =>
            Math.round((c / totalVotes) * 100),
          );
        }

        return {
          ...current,
          voteCount: totalVotes,
          percentages,
        };
      });
    });

    const interval = setInterval(fetchInitial, 2500);

    return () => {
      isMounted = false;
      clearInterval(interval);
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [pollId]);

  const shareUrl =
    `${window.location.origin}/poll-details/${pollId || "7K4Q"}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(
        shareUrl,
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch {
      /*
       * Clipboard can fail in some browsers /
       * non-secure local environments.
       */
      setCopied(false);
    }
  }

  async function handleShare() {
    setIsSharing(true);

    try {
      if (
        navigator.share
      ) {
        await navigator.share({
          title: "PulsePoll",
          text: results.question,
          url: shareUrl,
        });
      } else {
        await handleCopy();
      }
    } catch {
      // User cancelled native share.
    } finally {
      setIsSharing(false);
    }
  }

  function createAnotherPoll() {
    navigate("/create");
  }

  return (
    <main className="results-page">

      {/* ============================================
          DECORATIVE BACKGROUND
      ============================================ */}

      <div
        className="results-decoration results-decoration--coral"
        aria-hidden="true"
      />

      <div
        className="results-decoration results-decoration--purple"
        aria-hidden="true"
      />

      {/* ============================================
          NAVBAR
      ============================================ */}

      <header className="results-navbar">

        <Link
          to="/"
          className="results-navbar__brand"
        >
          ◉ PULSEPOLL
        </Link>

        <nav className="results-navbar__links">

          <span className="results-navbar__active">
            Results
          </span>

          <button
            type="button"
            className="results-navbar__create"
            onClick={createAnotherPoll}
          >
            Create Poll
          </button>

          <Link
            to="/login"
            className="results-navbar__signin"
          >
            Sign in
          </Link>

        </nav>
      </header>

      {/* ============================================
          PAGE HEADER
      ============================================ */}

      <section className="results-header">

        <p className="results-header__eyebrow">
          VOTE COMPLETE&nbsp; • &nbsp;LIVE RESULTS
        </p>

        <h1>
          Your vote is in!
        </h1>

        <p>
          The group is already voting.
          Watch the results change live.
        </p>

      </section>

      {/* ============================================
          MAIN GRID
      ============================================ */}

      <section className="results-layout">

        {/* ==========================================
            RESULTS CARD
        ========================================== */}

        <article className="results-card">

          <p className="results-card__label">
            LIVE POLL
          </p>

          <h2>
            {results.question}
          </h2>

          <p className="results-card__meta">
            {results.voteCount.toLocaleString()}
            {" votes "}
            <span>•</span>
            {" updating live"}
          </p>

          <div className="results-options">

            {results.options.map(
              (option, index) => {
                const percentage =
                  results.percentages[index] ?? 0;

                const isSelected =
                  index ===
                  results.selectedOption;

                return (
                  <div
                    className={`result-option ${
                      isSelected
                        ? "result-option--selected"
                        : ""
                    }`}
                    key={`${option}-${index}`}
                  >

                    <div className="result-option__top">

                      <span className="result-option__name">
                        {option}
                      </span>

                      <div className="result-option__right">

                        {isSelected && (
                          <span className="result-option__voted">
                            ✓ You voted
                          </span>
                        )}

                        <span className="result-option__percentage">
                          {percentage}%
                        </span>

                      </div>

                    </div>

                    <div className="result-option__track">
                      <div
                        className={`result-option__fill ${
                          index === 2
                            ? "result-option__fill--purple"
                            : ""
                        } ${
                          index === 3
                            ? "result-option__fill--green"
                            : ""
                        }`}
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>

                  </div>
                );
              },
            )}

          </div>

        </article>

        {/* ==========================================
            SHARE CARD
        ========================================== */}

        <aside className="share-card">

          <p className="share-card__eyebrow">
            KEEP THE CONVO GOING
          </p>

          <h2>
            Share this poll
            <br />
            with your friends.
          </h2>

          <p className="share-card__description">
            More votes make the live results
            more fun.
          </p>

          {/* Poll link */}

          <div className="share-link">

            <span>
              pulsepoll.app/p/
              {pollId || "7K4Q"}
            </span>

            <button
              type="button"
              onClick={handleCopy}
            >
              {copied ? "Copied!" : "Copy"}
            </button>

          </div>

          {/* Share */}

          <button
            type="button"
            className="share-card__share"
            onClick={handleShare}
            disabled={isSharing}
          >
            {isSharing
              ? "Opening..."
              : "Share poll  →"}
          </button>

          {/* Create another */}

          <button
            type="button"
            className="share-card__new"
            onClick={createAnotherPoll}
          >
            Create another poll
          </button>

          <p className="share-card__footer">
            Live results stay open while the
            poll is active.
          </p>

        </aside>

      </section>

      {/* ============================================
          FOOTER
      ============================================ */}

      <p className="results-footer">
        PulsePoll makes group decisions quick,
        playful, and live.
      </p>

    </main>
  );
}

export default Results;