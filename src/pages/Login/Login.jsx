import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./Login.css";
import { authApi } from "../../services/api";

const POLL_PREVIEW = [
  { label: "Weekend plans", percentage: 68 },
  { label: "Favorite food", percentage: 52 },
  { label: "Next trip", percentage: 38 },
  { label: "Movie night", percentage: 25 },
];

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const [message, setMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      setMessage("Please enter your email and password.");
      return;
    }

    setMessage("");
    setIsLoading(true);

    try {
      await authApi.login({ email, password });
      const fromPath = location.state?.from?.pathname || "/mypolls";
      navigate(fromPath);
    } catch (err) {
      const errorText =
        err instanceof Error
          ? err.message
          : "Invalid email or password.";

      if (errorText.toLowerCase().includes("invalid email or password")) {
        setMessage(
          "Invalid email or password. If you recently connected to MongoDB Atlas, please register a new account on the Sign Up page first."
        );
      } else {
        setMessage(errorText);
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setMessage("");
    setGoogleLoading(true);

    /*
     * Temporary frontend simulation.
     * Google OAuth will be connected to the backend later.
     */
    await new Promise((resolve) => setTimeout(resolve, 900));

    setGoogleLoading(false);
    setMessage("Google sign-in will be connected to the backend.");
  }

  function handleForgotPassword() {
    setMessage(
      "Password recovery will be connected when authentication is integrated.",
    );
  }

  return (
    <main className="login-page">
      {/* =================================================
          LEFT VISUAL PANEL
      ================================================= */}

      <section className="login-page__brand-panel">
        <div
          className="login-page__decor login-page__decor--orange"
          aria-hidden="true"
        />

        <div
          className="login-page__decor login-page__decor--lime"
          aria-hidden="true"
        />

        <div
          className="login-page__decor login-page__decor--coral-dot"
          aria-hidden="true"
        />

        <div
          className="login-page__decor login-page__decor--yellow-dot"
          aria-hidden="true"
        />

        <Link to="/" className="login-page__brand">
          ◉ PULSEPOLL
        </Link>

        <div className="login-page__welcome">
          <span>WELCOME BACK</span>

          <h1>
            Good questions
            <br />
            start great conversations.
          </h1>

          <p>
            Sign in to create polls, share them fast, and watch
            responses roll in live.
          </p>
        </div>

        <div className="login-preview">
          <span className="login-preview__label">● LIVE POLL</span>

          <h2>
            What should we
            <br />
            ask the group?
          </h2>

          <p className="login-preview__description">
            Pick a prompt and get the room talking.
          </p>

          <div className="login-preview__results">
            {POLL_PREVIEW.map((option) => (
              <div className="login-preview__result" key={option.label}>
                <div className="login-preview__result-header">
                  <span>{option.label}</span>
                  <strong>{option.percentage}%</strong>
                </div>

                <div className="login-preview__bar">
                  <span
                    style={{
                      width: `${option.percentage}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <p className="login-preview__votes">
            Live results • 1,284 votes
          </p>
        </div>
      </section>

      {/* =================================================
          RIGHT LOGIN PANEL
      ================================================= */}

      <section className="login-page__form-panel">
        <div className="login-form">
          <Link to="/" className="login-form__brand">
            ◉ PULSEPOLL
          </Link>

          <div className="login-form__heading">
            <span>YOUR POLLS ARE WAITING</span>

            <h2>Welcome back.</h2>

            <p>Sign in to continue to PulsePoll.</p>
          </div>

          <button
            type="button"
            className="login-form__google"
            onClick={handleGoogleLogin}
            disabled={googleLoading || isLoading}
          >
            <strong>G</strong>

            <span>
              {googleLoading
                ? "Connecting..."
                : "Continue with Google"}
            </span>
          </button>

          <div className="login-form__divider">
            <span>or</span>
          </div>

          <form onSubmit={handleSubmit}>
            <label htmlFor="login-email">Email</label>

            <input
              id="login-email"
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

            <div className="login-form__password-label">
              <label htmlFor="login-password">Password</label>

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
              id="login-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setMessage("");
              }}
              placeholder="••••••••••••"
              autoComplete="current-password"
              disabled={isLoading}
              required
            />

            <button
              type="submit"
              className="login-form__submit"
              disabled={isLoading || googleLoading}
            >
              {isLoading ? "Signing in..." : "Sign in  →"}
            </button>
          </form>

          <button
            type="button"
            className="login-form__forgot"
            onClick={handleForgotPassword}
            disabled={isLoading || googleLoading}
          >
            Forgot password?
          </button>

          {message && (
            <p
              className="login-form__message"
              role="status"
              aria-live="polite"
            >
              {message}
            </p>
          )}

          <p className="login-form__signup">
            New here?{" "}
            <Link to="/signup">Create a free account</Link>
          </p>
        </div>

        
      </section>
    </main>
  );
}

export default Login;