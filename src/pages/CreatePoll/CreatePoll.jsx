import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CreatePoll.css";
import { pollApi } from "../../services/api";

const INITIAL_OPTIONS = [
  "Weekend plans",
  "Favorite food",
  "Next trip",
];

function CreatePoll() {
  const navigate = useNavigate();

  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(INITIAL_OPTIONS);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  function updateOption(index, value) {
    setOptions((currentOptions) =>
      currentOptions.map((option, optionIndex) =>
        optionIndex === index ? value : option,
      ),
    );
  }

  function addOption() {
    if (options.length >= 6) {
      return;
    }

    setOptions((currentOptions) => [
      ...currentOptions,
      "",
    ]);
  }

  function removeOption(index) {
    if (options.length <= 2) {
      return;
    }

    setOptions((currentOptions) =>
      currentOptions.filter(
        (_, optionIndex) => optionIndex !== index,
      ),
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const cleanQuestion = question.trim();

    const cleanOptions = options
      .map((option) => option.trim())
      .filter(Boolean);

    if (!cleanQuestion) {
      setError("Please enter a question.");
      return;
    }

    if (cleanOptions.length < 2) {
      setError("Please add at least two options.");
      return;
    }

    setError("");
    setIsCreating(true);

    try {
      const poll = await pollApi.createPoll({
        question: cleanQuestion,
        options: cleanOptions,
      });

      const targetId = poll.code || poll.id;
      navigate(`/share/${targetId}`, { state: { poll } });
    } catch (err) {
      if (err?.status === 401) {
        setError("Your session has expired or you need to sign in first. Redirecting to sign in...");
        setTimeout(() => {
          navigate("/login", { state: { from: { pathname: "/create" } } });
        }, 1200);
        return;
      }
      setError(
        err instanceof Error && err.message
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsCreating(false);
    }
  }

  const previewQuestion =
    question.trim() || "What should we ask the group?";

  return (
    <main className="create-poll">
      {/* NAVBAR */}
      <header className="create-poll__navbar">
        <a href="/" className="create-poll__brand">
          ◉ PULSEPOLL
        </a>
      </header>

      {/* PAGE INTRO */}
      <section className="create-poll__intro">
        <h1>Create a poll</h1>

        <p>
          Ask a question, add a few options, and go live in
          seconds.
        </p>
      </section>

      {/* WORKSPACE */}
      <section className="create-poll__workspace">
        {/* FORM */}
        <form
          className="poll-form"
          onSubmit={handleSubmit}
        >
          {/* QUESTION */}
          <div className="poll-form__field">
            <label htmlFor="question">
              YOUR QUESTION
            </label>

            <input
              id="question"
              type="text"
              value={question}
              onChange={(event) =>
                setQuestion(event.target.value)
              }
              placeholder="What should we ask the group?"
              maxLength={120}
            />
          </div>

          {/* ANSWER OPTIONS */}
          <div className="poll-form__field">
            <div className="poll-form__options-heading">
              <label htmlFor="poll-option-0">
                ANSWER OPTIONS
              </label>

              <span>{options.length}/6</span>
            </div>

            <div className="poll-options">
              {options.map((option, index) => (
                <div
                  className={`poll-option-input ${
                    index === 2
                      ? "poll-option-input--purple"
                      : ""
                  }`}
                  key={index}
                >
                  <input
                    id={`poll-option-${index}`}
                    type="text"
                    value={option}
                    onChange={(event) =>
                      updateOption(
                        index,
                        event.target.value,
                      )
                    }
                    placeholder={`Option ${index + 1}`}
                    maxLength={60}
                  />

                  {options.length > 2 && (
                    <button
                      type="button"
                      className="poll-option-input__remove"
                      onClick={() =>
                        removeOption(index)
                      }
                      aria-label={`Remove option ${
                        index + 1
                      }`}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* ADD OPTION */}
            {options.length < 6 && (
              <button
                type="button"
                className="add-option"
                onClick={addOption}
              >
                + Add option
              </button>
            )}
          </div>

          {/* ERROR */}
          {error && (
            <p
              className="poll-form__error"
              role="alert"
            >
              {error}
            </p>
          )}

          {/* SUBMIT */}
          <button
            type="submit"
            className="go-live-button"
            disabled={isCreating}
          >
            {isCreating ? "Creating..." : "Go live →"}
          </button>
        </form>

        {/* LIVE PREVIEW */}
        <aside className="live-preview">
          <span className="live-preview__label">
            ● LIVE PREVIEW
          </span>

          <h2>{previewQuestion}</h2>

          <p>
            Pick an option and see results live.
          </p>

          <div className="live-preview__options">
            {options
              .filter((option) => option.trim())
              .map((option, index) => (
                <button
                  type="button"
                  className="preview-option"
                  key={`${option}-${index}`}
                >
                  <span>{option}</span>

                  <span>0%</span>
                </button>
              ))}
          </div>
        </aside>
      </section>
    </main>
  );
}

export default CreatePoll;