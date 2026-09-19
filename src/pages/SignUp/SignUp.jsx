import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./SignUp.css";
import { authApi } from "../../services/api";

const POLL_PREVIEW = [
  { label: "Beach day", percentage: 64 },
  { label: "Movie night", percentage: 48 },
  { label: "Cafe hopping", percentage: 31 },
  { label: "Game night", percentage: 19 },
];

function SignUp() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    if (!name.trim() || !email.trim() || !password.trim()) {
      setMessage("Please complete all fields.");
      return;
    }

    if (password.length < 8) {
      setMessage("Password must be at least 8 characters.");
      return;
    }

    setMessage("");
    setIsLoading(true);

    try {
      await authApi.register({ name, email, password });
      navigate("/mypolls");
    } catch (err) {
      setMessage(
        err instanceof Error
          ? err.message
          : "Failed to create account. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleSignup() {
    setMessage("");
    setGoogleLoading(true);

    // Temporary frontend simulation.
    // Replace with Google OAuth later.
    await new Promise((resolve) => setTimeout(resolve, 900));

    setGoogleLoading(false);
    setMessage("Google sign-up will be connected to the backend.");
  }

  return (
    <main className="signup-page">
      {/* LEFT VISUAL SIDE */}

      <section className="signup-page__visual">
        <div
          className="signup-page__blob signup-page__blob--coral"
          aria-hidden="true"
        />

        <div
          className="signup-page__blob signup-page__blob--purple"
          aria-hidden="true"
        />

        <div
          className="signup-page__dot signup-page__dot--yellow"
          aria-hidden="true"
        />

        <div
          className="signup-page__dot signup-page__dot--lime"
          aria-hidden="true"
        />

        <Link to="/" className="signup-page__brand">
          ◉ PULSEPOLL
        </Link>

        <div className="signup-page__intro">
          <span>MAKE YOUR VOICE COUNT</span>

          <h1>
            Ask better.
            <br />
            Decide together.
          </h1>

          <p>
            Create live polls, share them instantly, and see
            what everyone thinks in real time.
          </p>
        </div>

        <div className="signup-preview">
          <div className="signup-preview__top">
            <span>● LIVE POLL</span>
            <small>NOW</small>
          </div>

          <h2>
            Where should we
            <br />
            go this weekend?
          </h2>

          <p>4 options • Voting live</p>

          <div className="signup-preview__results">
            {POLL_PREVIEW.map((option) => (
              <div
                className="signup-preview__result"
                key={option.label}
              >
                <div className="signup-preview__result-heading">
                  <span>{option.label}</span>
                  <strong>{option.percentage}%</strong>
                </div>

                <div className="signup-preview__track">
                  <span
                    style={{
                      width: `${option.percentage}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="signup-preview__footer">
            <span>1,284 votes</span>
            <span>Updating live</span>
          </div>
        </div>
      </section>

      {/* RIGHT FORM SIDE */}

      <section className="signup-page__form-panel">
        <div className="signup-form">
          <Link to="/" className="signup-form__brand">
            ◉ PULSEPOLL
          </Link>

          <div className="signup-form__heading">
            <span>START SOMETHING</span>

            <h2>Create your account.</h2>

            <p>
              Join PulsePoll and start creating live polls.
            </p>
          </div>

          <button
            type="button"
            className="signup-form__google"
            onClick={handleGoogleSignup}
            disabled={isLoading || googleLoading}
          >
            <strong>G</strong>

            <span>
              {googleLoading
                ? "Creating account..."
                : "Continue with Google"}
            </span>
          </button>

          <div className="signup-form__divider">
            <span>or</span>
          </div>

          <form onSubmit={handleSubmit}>
            <label htmlFor="signup-name">Name</label>

            <input
              id="signup-name"
              type="text"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setMessage("");
              }}
              placeholder="Your name"
              autoComplete="name"
              disabled={isLoading}
              required
            />

            <label
              htmlFor="signup-email"
              className="signup-form__email-label"
            >
              Email
            </label>

            <input
              id="signup-email"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setMessage("");
              }}
              placeholder="you@example.com"
              autoComplete="email"
              disabled={isLoading}
              required
            />

            <div className="signup-form__password-label">
              <label htmlFor="signup-password">
                Password
              </label>

              <button
                type="button"
                onClick={() =>
                  setShowPassword((current) => !current)
                }
                disabled={isLoading}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <input
              id="signup-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setMessage("");
              }}
              placeholder="Create a password"
              autoComplete="new-password"
              disabled={isLoading}
              required
            />

            <p className="signup-form__hint">
              Use at least 8 characters.
            </p>

            <button
              type="submit"
              className="signup-form__submit"
              disabled={isLoading || googleLoading}
            >
              {isLoading
                ? "Creating account..."
                : "Create account  →"}
            </button>
          </form>

          {message && (
            <p
              className="signup-form__message"
              role="status"
              aria-live="polite"
            >
              {message}
            </p>
          )}

          <p className="signup-form__login">
            Already have an account?{" "}
            <Link to="/login">Sign in</Link>
          </p>
        </div>

      
      </section>
    </main>
  );
}

export default SignUp;