import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./MyPolls.css";
import { pollApi } from "../../services/api";

const FILTERS = ["All polls", "Live", "Closed", "Drafts"];

function MyPolls() {
  const navigate = useNavigate();

  const [polls, setPolls] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All polls");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPolls() {
      setIsLoading(true);
      setError("");

      try {
        const result = await pollApi.getMyPolls();
        setPolls(result);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load your polls.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadPolls();
  }, []);

  const filteredPolls = useMemo(() => {
    return polls.filter((poll) => {
      const status = poll.status.toLowerCase();

      const matchesFilter =
        activeFilter === "All polls" ||
        (activeFilter === "Live" && status === "active") ||
        (activeFilter === "Closed" && status === "closed") ||
        (activeFilter === "Drafts" && status === "draft");

      const matchesSearch = poll.question
        .toLowerCase()
        .includes(search.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  }, [polls, activeFilter, search]);

  function getCardColor(poll, index) {
    if (poll.status === "active") {
      return "coral";
    }

    if (poll.status === "closed") {
      return "orange";
    }

    if (poll.status === "draft") {
      return "purple";
    }

    const colors = ["coral", "orange", "purple"];

    return colors[index % colors.length];
  }

  function getDisplayStatus(status) {
    if (status === "active") {
      return "LIVE";
    }

    return status.toUpperCase();
  }

  function getTotalVotes(poll) {
    return poll.votes.reduce(
      (total, voteCount) => total + voteCount,
      0,
    );
  }

  function getPollAction(poll) {
    if (poll.status === "draft") {
      return "Edit draft →";
    }

    return "View results →";
  }

  function handlePollAction(poll) {
    if (poll.status === "draft") {
      navigate("/create");
      return;
    }

    navigate(`/results/${poll.id}`, {
      state: {
        question: poll.question,
      },
    });
  }

  const totalVotes = polls.reduce(
    (total, poll) => total + getTotalVotes(poll),
    0,
  );

  const livePollCount = polls.filter(
    (poll) => poll.status === "active",
  ).length;

  return (
    <main className="my-polls">
      {/* Decorative shapes */}
      <div className="my-polls__blob my-polls__blob--coral" />
      <div className="my-polls__blob my-polls__blob--purple" />

      {/* Navbar */}
      <header className="my-polls__navbar">
        <Link to="/" className="my-polls__brand">
          ◉ PULSEPOLL
        </Link>

        <nav className="my-polls__nav">
          <Link className="is-active" to="/mypolls">
            My polls
          </Link>

          <Link to="/results/demo">Analytics</Link>

          <Link to="/settings">Settings</Link>

          <Link to="/create" className="my-polls__create">
            + Create poll
          </Link>
        </nav>
      </header>

      {/* Main */}
      <section className="my-polls__content">
        <div className="my-polls__eyebrow">YOUR SPACE</div>

        <h1>My polls</h1>

        <p className="my-polls__subtitle">
          Everything you’ve asked, all in one place.
        </p>

        {/* Filter bar */}
        <div className="my-polls__toolbar">
          <div className="my-polls__filters">
            {FILTERS.map((filter) => (
              <button
                key={filter}
                type="button"
                className={
                  activeFilter === filter ? "is-active" : ""
                }
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="my-polls__search">
            <span aria-hidden="true">⌕</span>

            <input
              type="search"
              placeholder="Search polls..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="my-polls__empty">
            <span>◌</span>
            <h2>Loading your polls...</h2>
            <p>Please wait a moment.</p>
          </div>
        )}

        {/* Error state */}
        {!isLoading && error && (
          <div className="my-polls__empty">
            <span>!</span>
            <h2>Unable to load polls</h2>
            <p>{error}</p>
          </div>
        )}

        {/* Poll grid */}
        {!isLoading && !error && (
          <div className="my-polls__grid">
            {filteredPolls.map((poll, index) => {
              const displayStatus = getDisplayStatus(poll.status);
              const votes = getTotalVotes(poll);
              const color = getCardColor(poll, index);
              const action = getPollAction(poll);

              return (
                <article
                  key={poll.id}
                  className={`poll-card poll-card--${color}`}
                  style={{
                    "--card-delay": `${index * 90}ms`,
                  }}
                >
                  <div className="poll-card__top">
                    <span className="poll-card__status">
                      {displayStatus}
                    </span>
                  </div>

                  <h2>{poll.question}</h2>

                  <div className="poll-card__bottom">
                    <p>
                      {poll.status === "draft"
                        ? `${poll.options.length} options • Not published`
                        : `${votes.toLocaleString()} votes`}
                    </p>

                    <button
                      type="button"
                      className="poll-card__action"
                      onClick={() => handlePollAction(poll)}
                    >
                      {action}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Empty search/filter state */}
        {!isLoading &&
          !error &&
          filteredPolls.length === 0 && (
            <div className="my-polls__empty">
              <span>◌</span>
              <h2>No polls found</h2>
              <p>Try another search or filter.</p>
            </div>
          )}

        {/* Bottom information card */}
        {!isLoading && !error && (
          <div className="my-polls__summary">
            <div className="my-polls__summary-stats">
              <strong>
                {polls.length}{" "}
                {polls.length === 1 ? "poll" : "polls"}
              </strong>

              <span>
                {totalVotes.toLocaleString()} total votes •{" "}
                {livePollCount} live{" "}
                {livePollCount === 1 ? "poll" : "polls"}
              </span>
            </div>

            <p>
              Tip: open a poll to share, view results, or close it.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}

export default MyPolls;