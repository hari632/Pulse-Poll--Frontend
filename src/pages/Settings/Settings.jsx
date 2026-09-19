import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Settings.css";
import { authApi, pollApi } from "../../services/api";

const DEFAULT_PROFILE = {
  name: "PulsePoll Host",
  email: "host@example.com",
};

function Settings() {
  const navigate = useNavigate();

  const currentUser = authApi.getUser();

  const [name, setName] = useState(currentUser?.name || DEFAULT_PROFILE.name);
  const [email, setEmail] = useState(currentUser?.email || DEFAULT_PROFILE.email);

  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  const [pollActivity, setPollActivity] = useState(true);
  const [weeklyRecap, setWeeklyRecap] = useState(false);

  const [message, setMessage] = useState("");
  const [targetPollId, setTargetPollId] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const u = await authApi.getMe();
        if (u) {
          if (u.name) setName(u.name);
          if (u.email) setEmail(u.email);
        }
      } catch {
        // Keep current state
      }

      try {
        const polls = await pollApi.getMyPolls();
        if (Array.isArray(polls) && polls.length > 0) {
          const active = polls.find((p) => p.status === "active") || polls[0];
          setTargetPollId(active.id);
        }
      } catch {
        // Keep current state
      }
    }
    loadData();
  }, []);

  function handleEditProfile() {
    setEditing((current) => !current);
    setSaved(false);
  }

  function handleSaveProfile(event) {
    event.preventDefault();

    setSaved(true);
    setEditing(false);
    setMessage("Profile updated successfully.");

    window.setTimeout(() => {
      setMessage("");
    }, 2200);
  }

  function handlePasswordChange() {
    setMessage("Password reset flow coming soon.");

    window.setTimeout(() => {
      setMessage("");
    }, 2200);
  }

  function handleSignOut() {
    authApi.logout();
    setMessage("Signed out successfully.");

    window.setTimeout(() => {
      navigate("/login");
    }, 700);
  }

  return (
    <main className="settings-page">
      {/* =========================================
          DECORATIVE BLOBS
      ========================================= */}

      <div
        className="settings-page__blob settings-page__blob--pink"
        aria-hidden="true"
      />

      <div
        className="settings-page__blob settings-page__blob--purple"
        aria-hidden="true"
      />

      <div
        className="settings-page__blob settings-page__blob--peach"
        aria-hidden="true"
      />

      {/* =========================================
          NAVBAR
      ========================================= */}

      <header className="settings-page__navbar">
        <Link to="/" className="settings-page__brand">
          ◉ PULSEPOLL
        </Link>

        <nav className="settings-page__nav">
          <Link to="/mypolls">My polls</Link>

          <Link
            to={
              targetPollId
                ? `/poll-details/${targetPollId}`
                : "/mypolls"
            }
          >
            Analytics
          </Link>

          <Link
            to="/settings"
            className="settings-page__nav-active"
          >
            Settings
          </Link>

          <Link
            to="/create"
            className="settings-page__create"
            aria-label="Create a poll"
          >
            +
            <span>Create a poll</span>
          </Link>
        </nav>
      </header>

      {/* =========================================
          PAGE HEADER
      ========================================= */}

      <section className="settings-page__header">
        <p className="settings-page__eyebrow">
          YOUR SPACE
        </p>

        <h1>Settings</h1>

        <p>
          Make PulsePoll feel like yours.
        </p>
      </section>

      {/* =========================================
          PROFILE SUMMARY
      ========================================= */}

      <section className="settings-page__profile-card">
        <div className="settings-page__avatar">
          {name
            .split(" ")
            .map((part) => part[0])
            .join("")
            .slice(0, 2)
            .toUpperCase() || "PP"}
        </div>

        <div className="settings-page__identity">
          <h2>{name}</h2>
          <p>{email}</p>
        </div>

        <button
          type="button"
          className={`settings-page__edit-button ${
            editing ? "is-editing" : ""
          }`}
          onClick={handleEditProfile}
        >
          {editing ? "Cancel" : "Edit profile"}
        </button>
      </section>

      {/* =========================================
          CONTENT GRID
      ========================================= */}

      <section className="settings-page__grid">
        {/* =========================================
            ACCOUNT CARD
        ========================================= */}

        <article className="settings-page__card settings-page__account-card">
          <p className="settings-page__card-label">
            ACCOUNT
          </p>

          <h2>Your profile</h2>

          <form onSubmit={handleSaveProfile}>
            <label htmlFor="settings-name">
              Name
            </label>

            <input
              id="settings-name"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              disabled={!editing}
            />

            <label htmlFor="settings-email">
              Email
            </label>

            <input
              id="settings-email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              disabled={!editing}
            />

            {editing && (
              <button
                type="submit"
                className="settings-page__save-button"
              >
                Save changes ✓
              </button>
            )}
          </form>

          <button
            type="button"
            className="settings-page__password"
            onClick={handlePasswordChange}
          >
            Change password →
          </button>
        </article>

        {/* =========================================
            PREFERENCES CARD
        ========================================= */}

        <article className="settings-page__card settings-page__preferences-card">
          <p className="settings-page__card-label settings-page__card-label--purple">
            PREFERENCES
          </p>

          <h2>Notifications</h2>

          {/* Poll activity */}

          <div className="settings-page__preference-row">
            <div>
              <strong>Poll activity</strong>

              <span>
                Get updates when people vote.
              </span>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={pollActivity}
              className={`settings-page__toggle ${
                pollActivity ? "is-on" : ""
              }`}
              onClick={() =>
                setPollActivity((current) => !current)
              }
            >
              <span />
            </button>
          </div>

          {/* Weekly recap */}

          <div className="settings-page__preference-row">
            <div>
              <strong>Weekly recap</strong>

              <span>
                A tiny summary of your polls.
              </span>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={weeklyRecap}
              className={`settings-page__toggle ${
                weeklyRecap ? "is-on" : ""
              }`}
              onClick={() =>
                setWeeklyRecap((current) => !current)
              }
            >
              <span />
            </button>
          </div>

          {/* Appearance */}

          <div className="settings-page__appearance">
            <strong>Appearance</strong>

            <button
              type="button"
              className="settings-page__appearance-value"
            >
              Light
            </button>
          </div>

          {/* Privacy */}

          <button
            type="button"
            className="settings-page__privacy"
            onClick={() =>
              setMessage(
                "Privacy settings are ready for backend integration.",
              )
            }
          >
            <span>
              <strong>Privacy &amp; sharing</strong>

              <small>
                Manage who can see your poll links.
              </small>
            </span>

            <b>→</b>
          </button>
        </article>
      </section>

      {/* =========================================
          BOTTOM ACTIONS
      ========================================= */}

      <div className="settings-page__bottom">
        <button
          type="button"
          className="settings-page__signout"
          onClick={handleSignOut}
        >
          Sign out
        </button>

        <span>
          You can change these anytime.
        </span>
      </div>

      {/* =========================================
          FEEDBACK TOAST
      ========================================= */}

      {message && (
        <div className="settings-page__toast">
          <span>✓</span>
          {message}
        </div>
      )}

      {saved && !message && (
        <div className="settings-page__saved">
          Saved ✓
        </div>
      )}
    </main>
  );
}

export default Settings;