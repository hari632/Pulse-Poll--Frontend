import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import "./QrCode.css";

const POLL = {
  code: "PULSE7",
  question: "What’s your favorite stack?",
  votes: 1284,
  options: [
    ["React", 52],
    ["Vue", 24],
    ["Svelte", 15],
    ["Angular", 9],
  ],
};

function QrCode() {
  const { pollId } = useParams();
  const navigate = useNavigate();

  const code = pollId?.toUpperCase() || POLL.code;
  const [copied, setCopied] = useState(false);

  const voteUrl = `${window.location.origin}/poll/${code}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(voteUrl);
    } catch {
      // Clipboard may be unavailable in some browsers.
    }

    setCopied(true);

    window.setTimeout(() => {
      setCopied(false);
    }, 1800);
  }

  function openPoll() {
    navigate(`/poll/${code}`);
  }

  return (
    <main className="qr-page">
      {/* =========================
          NAVBAR
      ========================= */}

      <header className="qr-page__navbar">
        <Link to="/" className="qr-page__brand">
          ◉&nbsp;&nbsp;PULSEPOLL
        </Link>

        <nav>
          <Link to="/mypolls">My polls</Link>
          <Link to={`/results/${code}`}>Analytics</Link>
          <Link to="/settings">Settings</Link>

          <Link to="/create" className="qr-page__create">
            +&nbsp;&nbsp;Create poll
          </Link>
        </nav>
      </header>

      {/* =========================
          INTRO
      ========================= */}

      <section className="qr-page__intro">
        <p>SHARE YOUR POLL</p>

        <h1>Scan to join the poll</h1>

        <span>
          Point your camera at the code and start voting.
        </span>
      </section>

      {/* =========================
          CONTENT
      ========================= */}

      <section className="qr-page__grid">
        {/* QR PANEL */}

        <article className="qr-page__scanner">
          <p className="qr-page__scanner-label">
            SCAN WITH YOUR PHONE
          </p>

          <div className="qr-page__qr-wrap">
            <div className="qr-page__qr-glow" />

            <div className="qr-code">
              <QRCodeSVG
                value={voteUrl}
                size={360}
                bgColor="#ffffff"
                fgColor="#211a1d"
                level="H"
                includeMargin={true}
              />
            </div>

            <div className="qr-page__scan-line" />
          </div>

          <div className="qr-page__code-row">
            <div>
              <strong>{code}</strong>

              <p>No account needed to vote.</p>
            </div>

            <button type="button" onClick={copyLink}>
              {copied ? "Copied!" : "Copy link"}
            </button>
          </div>
        </article>

        {/* POLL PREVIEW */}

        <article className="qr-page__preview">
          <p className="qr-page__preview-label">
            LIVE POLL
          </p>

          <h2>{POLL.question}</h2>

          <p className="qr-page__votes">
            {POLL.votes.toLocaleString()} votes • Live now
          </p>

          <div className="qr-page__options">
            {POLL.options.map(([option, percentage], index) => (
              <div
                className="qr-page__option"
                key={option}
                style={{
                  "--option-delay": `${index * 100}ms`,
                }}
              >
                <div>
                  <span>{option}</span>
                  <strong>{percentage}%</strong>
                </div>

                <div className="qr-page__bar">
                  <i style={{ width: `${percentage}%` }} />
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="qr-page__vote-button"
            onClick={openPoll}
          >
            Open poll →
          </button>
        </article>
      </section>
    </main>
  );
}

export default QrCode;