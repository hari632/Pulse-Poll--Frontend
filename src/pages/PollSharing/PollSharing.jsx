import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import "./PollSharing.css";
import { pollApi } from "../../services/api";

const imgEllipse =
  "https://www.figma.com/api/mcp/asset/d2ad8857-46cd-4d82-910f-491d76c02db4.svg";

const DEFAULT_POLL = {
  code: "PULSE7",
  question: "What’s your favorite stack?",
  votes: 1284,
};

function PollSharing() {
  const navigate = useNavigate();
  const location = useLocation();
  const { pollId } = useParams();

  const code = pollId?.toUpperCase() || DEFAULT_POLL.code;

  const [poll, setPoll] = useState(location.state?.poll || null);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    if (!poll && pollId) {
      let isMounted = true;
      pollApi
        .getPoll(pollId)
        .then((data) => {
          if (isMounted && data) {
            setPoll(data);
          }
        })
        .catch(() => {});
      return () => {
        isMounted = false;
      };
    }
  }, [poll, pollId]);

  const currentQuestion = poll?.question || DEFAULT_POLL.question;
  const currentVotes =
    poll?.totalVotes ??
    (Array.isArray(poll?.votes)
      ? poll.votes.reduce((sum, count) => sum + count, 0)
      : DEFAULT_POLL.votes);

  const pollLink = `${window.location.host}/poll/${code}`;
  const shareUrl = `${window.location.origin}/poll/${code}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch {
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1800);
    }
  }

  async function handleShare() {
    const shareData = {
      title: "Join my PulsePoll",
      text: `Vote in my poll: "${currentQuestion}" using code ${code}.`,
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);

        setShared(true);

        setTimeout(() => {
          setShared(false);
        }, 1800);
      }
    } catch {
      // User cancelled native share.
    }
  }

  function handleShowQr() {
    navigate(`/qr/${code}`);
  }

  return (
    <main className="poll-sharing">
      {/* =================================================
          DECORATIVE FIGMA ELLIPSE
      ================================================= */}

      <div className="poll-sharing__ellipse" aria-hidden="true">
        <img src={imgEllipse} alt="" />
      </div>

      {/* =================================================
          NAVBAR
      ================================================= */}

      <header className="poll-sharing__navbar">
        <Link to="/" className="poll-sharing__brand">
          ◉ PULSEPOLL
        </Link>

        <nav className="poll-sharing__nav">
          <Link to="/mypolls">My polls</Link>
          <Link to={`/results/${code}`}>Analytics</Link>
          <Link to="/settings">Settings</Link>

          <Link
            to="/create"
            className="poll-sharing__create"
          >
            +&nbsp;&nbsp;Create poll
          </Link>
        </nav>
      </header>

      {/* =================================================
          HEADER
      ================================================= */}

      <section className="poll-sharing__header">
        <p>SHARE YOUR POLL</p>

        <h1>Invite people to vote</h1>

        <span>
          Send the code or link to your group and watch the
          responses roll in.
        </span>
      </section>

      {/* =================================================
          MAIN GRID
      ================================================= */}

      <section className="poll-sharing__grid">
        {/* =================================================
            SHARE CARD
        ================================================= */}

        <article className="poll-sharing__share-card">
          <div className="poll-sharing__live-badge">
            <span>●</span>
            LIVE
          </div>

          <h2>{currentQuestion}</h2>

          <p className="poll-sharing__poll-meta">
            Live poll&nbsp;&nbsp;•&nbsp;&nbsp;
            {currentVotes.toLocaleString()} votes
          </p>

          <label>POLL CODE</label>

          <div className="poll-sharing__code-box">
            <strong>{code}</strong>

            <button
              type="button"
              onClick={handleCopy}
              className={copied ? "is-copied" : ""}
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>

          <label>SHARE LINK</label>

          <div className="poll-sharing__link-box">
            <span>{pollLink}</span>
          </div>

          <div className="poll-sharing__actions">
            <button
              type="button"
              className="poll-sharing__share-button"
              onClick={handleShare}
            >
              {shared ? "Link copied!" : "Share poll →"}
            </button>

            <button
              type="button"
              className="poll-sharing__qr-button"
              onClick={handleShowQr}
            >
              Show QR
            </button>
          </div>
        </article>

        {/* =================================================
            PREVIEW CARD
        ================================================= */}

        <aside className="poll-sharing__preview">
          <p className="poll-sharing__preview-label">
            MAKE IT EASY
          </p>

          <h2>
            Your audience can
            <br />
            join in seconds.
          </h2>

          <div className="poll-sharing__hint-card">
            <strong>↗</strong>

            <div>
              <h3>Share the code</h3>

              <b>{code}</b>

              <p>No account needed to vote.</p>
            </div>
          </div>

          <p className="poll-sharing__tip">
            Tip: Drop the code into your group chat.
          </p>

          <p className="poll-sharing__live-copy">
            Results update automatically while your poll is
            live.
          </p>
        </aside>
      </section>
    </main>
  );
}

export default PollSharing;