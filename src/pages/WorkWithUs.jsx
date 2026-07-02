import { Link } from "react-router-dom";
import { useState } from "react";
import api from "../api/api";
import "../styles/pages/work-with-us.css";

export default function WorkWithUs() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    instruments: [],
  });
  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    setForm((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleInstrumentChange = (event) => {
    const { value, checked } = event.target;

    setForm((prev) => ({
      ...prev,
      instruments: checked
        ? [...prev.instruments, value]
        : prev.instruments.filter((item) => item !== value),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatusMessage("");
    setIsSubmitting(true);

    try {
      const response = await api.post("/api/work-applications", form);

      setStatusMessage(
        response.data?.message || "Your inquiry has been submitted successfully."
      );
      setForm({
        fullName: "",
        email: "",
        phone: "",
        instruments: [],
      });
    } catch (error) {
      console.error(error);
      setStatusMessage(
        error.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
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

              <button type="submit" className="btn-primary" disabled={isSubmitting}>
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
