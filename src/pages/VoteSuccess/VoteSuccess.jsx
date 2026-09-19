import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import "./VoteSuccess.css";
import { pollApi } from "../../services/api";

function VoteSuccess() {
  const { pollId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const code = pollId?.toUpperCase() || "PULSE7";

  const selectedIndex = location.state?.selectedOption ?? 0;
  const [selectedOption, setSelectedOption] = useState(
    location.state?.selectedOptionLabel || "React"
  );

  const [percentage, setPercentage] = useState(
    location.state?.percentage ?? 46
  );

  const [poll, setPoll] = useState({
    question: location.state?.question || "What’s your favorite stack?",
    options: location.state?.options || ["React", "Vue", "Svelte", "Angular"],
    percentages: location.state?.percentages || [46, 24, 21, 9],
    selectedOption: selectedIndex,
    voteCount: location.state?.voteCount ?? 1,
  });

  /*
   * Live realtime vote updates via Redis & WebSocket
   */
  useEffect(() => {
    let isMounted = true;

    async function fetchInitial() {
      if (!pollId || pollId === "demo") return;
      try {
        const data = await pollApi.getPoll(pollId);
        if (!isMounted || !data) return;

        const options = Array.isArray(data.options) ? data.options : [];
        const votes = Array.isArray(data.votes) ? data.votes : [];
        const totalVotes =
          data.totalVotes ?? votes.reduce((sum, count) => sum + count, 0);

        let pcts = data.percentages;
        if (!Array.isArray(pcts) || pcts.length === 0) {
          if (totalVotes > 0) {
            pcts = votes.map((c) => Math.round((c / totalVotes) * 100));
          } else {
            pcts = options.map(() => 0);
          }
        }

        if (options[selectedIndex]) {
          setSelectedOption(options[selectedIndex]);
        }

        if (Array.isArray(pcts) && pcts[selectedIndex] !== undefined) {
          setPercentage(pcts[selectedIndex]);
        }

        setPoll((current) => ({
          ...current,
          question: data.question || current.question,
          options: options.length > 0 ? options : current.options,
          percentages: pcts.length > 0 ? pcts : current.percentages,
          voteCount: totalVotes,
        }));
      } catch {
        // Keep initial state
      }
    }

    fetchInitial();

    if (!pollId || pollId === "demo") return undefined;

    const unsubscribe = pollApi.subscribeToResults(pollId, (data) => {
      if (!isMounted || !data) return;

      const votes = Array.isArray(data.votes) ? data.votes : [];
      const totalVotes =
        data.totalVotes ??
        (votes.length > 0
          ? votes.reduce((sum, count) => sum + count, 0)
          : undefined);

      let pcts = data.percentages;
      if (!Array.isArray(pcts) || pcts.length === 0) {
        if (votes.length > 0 && typeof totalVotes === "number" && totalVotes > 0) {
          pcts = votes.map((c) => Math.round((c / totalVotes) * 100));
        }
      }

      if (Array.isArray(pcts) && pcts[selectedIndex] !== undefined) {
        setPercentage(pcts[selectedIndex]);
      }

      setPoll((current) => ({
        ...current,
        percentages: pcts && pcts.length > 0 ? pcts : current.percentages,
        voteCount: totalVotes ?? current.voteCount,
      }));
    });

    const interval = setInterval(fetchInitial, 2500);

    return () => {
      isMounted = false;
      clearInterval(interval);
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [pollId, selectedIndex]);

  function viewResults() {
    navigate(`/results/${code}`, {
      state: {
        question: poll.question,
        options: poll.options,
        percentages: poll.percentages,
        selectedOption: selectedIndex,
        voteCount: poll.voteCount,
      },
    });
  }

  return (
    <main className="vote-success">
      {/* =========================================
          DECORATIVE SHAPES
      ========================================= */}

      <div
        className="vote-success__decor vote-success__decor--coral"
        aria-hidden="true"
      />

      <div
        className="vote-success__decor vote-success__decor--purple"
        aria-hidden="true"
      />

      <div
        className="vote-success__decor vote-success__decor--dot"
        aria-hidden="true"
      />

      {/* =========================================
          NAVBAR
      ========================================= */}

      <header className="vote-success__navbar">
        <Link to="/" className="vote-success__brand">
          ◉ PULSEPOLL
        </Link>

        <nav>
          <Link to="/mypolls">My polls</Link>

          <Link to={`/results/${code}`}>Analytics</Link>

          <Link to="/settings">Settings</Link>

          <Link
            to="/create"
            className="vote-success__create"
          >
            + Create poll
          </Link>
        </nav>
      </header>

      {/* =========================================
          SUCCESS CONTENT
      ========================================= */}

      <section className="vote-success__content">
        <p className="vote-success__eyebrow">
          VOTE RECORDED
        </p>

        {/* Animated success icon */}

        <div className="vote-success__circle">
          <div className="vote-success__inner">
            <span className="vote-success__check">
              ✓
            </span>
          </div>

          <span className="vote-success__ring vote-success__ring--one" />
          <span className="vote-success__ring vote-success__ring--two" />
        </div>

        <h1>Thanks for voting! 🎉</h1>

        <p className="vote-success__message">
          Your vote for{" "}
          <strong>{selectedOption}</strong>{" "}
          has been recorded.
        </p>

        <p className="vote-success__live">
          The results are updating live for everyone.
          <span className="vote-success__live-dot" />
        </p>

        {/* =========================================
            RESULT CARD
        ========================================= */}

        <article className="vote-success__result-card">
          <div className="vote-success__result-copy">
            <p>YOUR CHOICE</p>

            <strong>{selectedOption}</strong>
          </div>

          <div className="vote-success__percentage">
            <span />

            <strong>{percentage}% of votes</strong>
          </div>

          <p className="vote-success__note">
            You can close this page — no account needed.
          </p>
        </article>

        {/* =========================================
            ACTIONS
        ========================================= */}

        <div className="vote-success__actions">
          <button
            type="button"
            onClick={viewResults}
          >
            Watch live results →
          </button>

          <Link to={`/poll/${code}`}>
            Vote again
          </Link>
        </div>
      </section>
    </main>
  );
}

export default VoteSuccess;