import { Link } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import api from "../api/api";
import TurnstileWidget from "../components/TurnstileWidget";
import "../styles/pages/work-with-us.css";

const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

const initialForm = {
  fullName: "",
  email: "",
  phone: "",
  instruments: [],
};

export default function WorkWithUs() {
  const [form, setForm] = useState(initialForm);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const turnstileRef = useRef(null);
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    if (statusType !== "success" || !statusMessage) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setStatusMessage("");
      setStatusType("");
    }, 4000);

    return () => window.clearTimeout(timeoutId);
  }, [statusMessage, statusType]);

  const handleChange = (event) => {
    if (statusMessage) {
      setStatusMessage("");
      setStatusType("");
    }

    setForm((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleInstrumentChange = (event) => {
    const { value, checked } = event.target;

    if (statusMessage) {
      setStatusMessage("");
      setStatusType("");
    }

    setForm((prev) => ({
      ...prev,
      instruments: checked
        ? [...prev.instruments, value]
        : prev.instruments.filter((item) => item !== value),
    }));
  };

  const handleTurnstileError = useCallback(() => {
    setTurnstileToken("");
    setStatusMessage(
      "The security check could not be completed. Please try again."
    );
    setStatusType("error");
  }, []);

  const handleTurnstileExpire = useCallback(() => {
    setTurnstileToken("");
    setStatusMessage(
      "The security check expired. Please complete it again before submitting."
    );
    setStatusType("error");
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmittingRef.current) {
      return;
    }

    setStatusMessage("");
    setStatusType("");

    if (!turnstileToken) {
      setStatusMessage("Please complete the security check before submitting.");
      setStatusType("error");
      return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);

    try {
      const response = await api.post("/api/work-applications", {
        ...form,
        turnstileToken,
      });

      setStatusMessage(
        response.data?.message || "Your inquiry has been submitted successfully."
      );
      setStatusType("success");
      setForm(initialForm);
    } catch (error) {
      console.error(error);
      setStatusMessage(
        error.response?.data?.message || "Something went wrong. Please try again."
      );
      setStatusType("error");
    } finally {
      isSubmittingRef.current = false;
      setTurnstileToken("");
      turnstileRef.current?.reset();
      setIsSubmitting(false);
    }
  };

  return (
    <main>
      <section className="section work-with-us-intro">
        <p className="section-kicker">Work With Us</p>
        <h2>Teaching opportunities at Pera Music School.</h2>
        <p className="section-text">
          We are always looking for passionate educators who value student
          growth, creativity, and a supportive teaching environment.
        </p>
      </section>

      <section className="section contact-single-section work-with-us-content">
        <div className="work-form-card">
          <article className="contact-card">
            <form className="work-form" onSubmit={handleSubmit}>
              <label>
                Full Name *
                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Your answer"
                  required
                />
              </label>

              <label>
                Email Address *
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Your answer"
                  required
                />
              </label>

              <label>
                Phone Number *
                <input
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Your answer"
                  required
                />
              </label>

              <label>What instruments you can teach? (Check all that apply) *</label>

              <div className="work-question-card work-question-group">
                <div className="work-checkbox-list">
                  {[
                    "Piano",
                    "Guitar",
                    "Violin",
                    "Drums",
                    "Voice",
                    "Group Piano",
                    "Group Guitar",
                    "Choir",
                  ].map((instrument) => (
                    <label key={instrument} className="work-checkbox-item">
                      <input
                        type="checkbox"
                        name="instruments"
                        value={instrument}
                        checked={form.instruments.includes(instrument)}
                        onChange={handleInstrumentChange}
                      />
                      <span>{instrument}</span>
                    </label>
                  ))}
                </div>
              </div>

              <TurnstileWidget
                ref={turnstileRef}
                siteKey={turnstileSiteKey}
                action="work_application"
                onTokenChange={setTurnstileToken}
                onError={handleTurnstileError}
                onExpire={handleTurnstileExpire}
              />

              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting || !turnstileToken}
              >
                {isSubmitting ? "Sending..." : "Send Inquiry"}
              </button>

              <p className="work-form-note">
                By submitting this form, you agree that Pera Music School may use
                the information you provide to review your inquiry and contact you.
                See our <Link to="/privacy-policy">Privacy Policy</Link>.
              </p>

              {statusMessage ? <p className="form-status">{statusMessage}</p> : null}
            </form>
          </article>
        </div>
      </section>
    </main>
  );
}
