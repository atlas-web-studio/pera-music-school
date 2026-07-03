import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/api";
import "../styles/pages/trial-session.css";

const instrumentOptions = [
  "Piano",
  "Voice",
  "Guitar",
  "Violin",
  "Viola",
  "Cello",
  "Drums",
  "Ukulele",
];

const lessonLengthOptions = ["30 minutes", "45 minutes", "60 minutes"];
const yesNoOptions = ["Yes", "No"];
const musicReadingOptions = ["Yes", "A little", "No"];
const participationOptions = [
  "Recitals",
  "Competitions",
  "School Band/Choir",
  "Exams (ABRSM, Trinity, RCM, etc.)",
  "None",
];

const initialForm = {
  studentName: "",
  dateOfBirth: "",
  studentAge: "",
  grade: "",
  school: "",
  parentName: "",
  phone: "",
  email: "",
  address: "",
  trialDate: "",
  teacher: "",
  instrument: "",
  lessonLength: "30 minutes",
  lessonTime: "",
  hasPreviousLessons: "",
  previousInstruments: "",
  previousLessonYears: "",
  previousTeacherSchool: "",
  musicReadingLevel: "",
  practicesAnotherInstrument: "",
  participation: [],
};

function ChoiceGroup({
  name,
  value,
  onChange,
  options,
  type = "radio",
}) {
  return (
    <div className="trial-choice-grid">
      {options.map((option) => (
        <label key={option} className="trial-choice-item">
          <input
            type={type}
            name={name}
            value={option}
            checked={type === "radio" ? value === option : value.includes(option)}
            onChange={onChange}
          />
          <span>{option}</span>
        </label>
      ))}
    </div>
  );
}

export default function TrialSession() {
  const [form, setForm] = useState(initialForm);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    const { name, value } = event.target;

    if (statusMessage) {
      setStatusMessage("");
      setStatusType("");
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleParticipationChange = (event) => {
    const { value, checked } = event.target;

    if (statusMessage) {
      setStatusMessage("");
      setStatusType("");
    }

    setForm((prev) => {
      if (value === "None") {
        return {
          ...prev,
          participation: checked ? ["None"] : [],
        };
      }

      const nextValues = checked
        ? [...prev.participation.filter((item) => item !== "None"), value]
        : prev.participation.filter((item) => item !== value);

      return {
        ...prev,
        participation: nextValues,
      };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatusMessage("");
    setStatusType("");

    setIsSubmitting(true);

    try {
      const response = await api.post("/api/trial-sessions", form);
      setStatusMessage(
        response.data?.message ||
          "Your trial session request has been sent. The Pera team will be in touch soon."
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
      setIsSubmitting(false);
    }
  };

  return (
    <main>
      <section className="section trial-session-intro">
        <p className="section-kicker">Trial Session</p>
        <h2>Book a first lesson and let us guide the next step.</h2>
        <p className="section-text">
          Share the student&apos;s details, background, and trial lesson
          preferences. We&apos;ll use this information to help coordinate the
          best first experience.
        </p>
      </section>

      <section className="section contact-single-section trial-session-content">
        <article className="contact-card contact-card-wide trial-session-form-card">
          <form className="trial-form" onSubmit={handleSubmit}>
            <div className="trial-form-section">
              <div className="trial-form-section-head">
                <p className="section-kicker">Student Information</p>
              </div>

              <div className="trial-form-grid">
                <label>
                  Student&apos;s Full Name *
                  <input
                    type="text"
                    name="studentName"
                    value={form.studentName}
                    onChange={handleChange}
                    placeholder="Student full name"
                    required
                  />
                </label>

                <label>
                  Date of Birth
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={form.dateOfBirth}
                    onChange={handleChange}
                  />
                </label>

                <label>
                  Age
                  <input
                    type="text"
                    name="studentAge"
                    value={form.studentAge}
                    onChange={handleChange}
                    placeholder="Student age"
                  />
                </label>

                <label>
                  Grade
                  <input
                    type="text"
                    name="grade"
                    value={form.grade}
                    onChange={handleChange}
                    placeholder="Current grade"
                  />
                </label>

                <label>
                  School
                  <input
                    type="text"
                    name="school"
                    value={form.school}
                    onChange={handleChange}
                    placeholder="School name"
                  />
                </label>

                <label>
                  Parent/Guardian Name
                  <input
                    type="text"
                    name="parentName"
                    value={form.parentName}
                    onChange={handleChange}
                    placeholder="Parent or guardian"
                  />
                </label>

                <label>
                  Phone Number *
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="(555) 555-5555"
                    required
                  />
                </label>

                <label>
                  Email *
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    required
                  />
                </label>

                <label className="trial-form-span-2">
                  Address
                  <input
                    type="text"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="Street address"
                  />
                </label>
              </div>
            </div>

            <div className="trial-form-section">
              <div className="trial-form-section-head">
                <p className="section-kicker">Trial Lesson Information</p>
              </div>

              <div className="trial-form-grid">
                <label>
                  Date
                  <input
                    type="date"
                    name="trialDate"
                    value={form.trialDate}
                    onChange={handleChange}
                  />
                </label>

                <label>
                  Teacher
                  <input
                    type="text"
                    name="teacher"
                    value={form.teacher}
                    onChange={handleChange}
                    placeholder="If already assigned"
                  />
                </label>

                <label>
                  Instrument *
                  <select
                    name="instrument"
                    value={form.instrument}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select instrument</option>
                    {instrumentOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Lesson Length
                  <select
                    name="lessonLength"
                    value={form.lessonLength}
                    onChange={handleChange}
                  >
                    {lessonLengthOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Time
                  <input
                    type="time"
                    name="lessonTime"
                    value={form.lessonTime}
                    onChange={handleChange}
                  />
                </label>
              </div>
            </div>

            <div className="trial-form-section">
              <div className="trial-form-section-head">
                <p className="section-kicker">Student Background</p>
              </div>

              <div className="trial-question-card">
                <p className="trial-question-title">
                  Has the student taken music lessons before?
                </p>
                <ChoiceGroup
                  name="hasPreviousLessons"
                  value={form.hasPreviousLessons}
                  onChange={handleChange}
                  options={yesNoOptions}
                />

                {form.hasPreviousLessons === "Yes" ? (
                  <div className="trial-form-grid trial-followup-grid">
                    <label>
                      Instrument(s)
                      <input
                        type="text"
                        name="previousInstruments"
                        value={form.previousInstruments}
                        onChange={handleChange}
                        placeholder="Previous instruments"
                      />
                    </label>

                    <label>
                      How many years?
                      <input
                        type="text"
                        name="previousLessonYears"
                        value={form.previousLessonYears}
                        onChange={handleChange}
                        placeholder="Example: 2 years"
                      />
                    </label>

                    <label className="trial-form-span-2">
                      Previous teacher/school
                      <input
                        type="text"
                        name="previousTeacherSchool"
                        value={form.previousTeacherSchool}
                        onChange={handleChange}
                        placeholder="Teacher or school name"
                      />
                    </label>
                  </div>
                ) : null}
              </div>

              <div className="trial-question-card">
                <p className="trial-question-title">Can the student read music?</p>
                <ChoiceGroup
                  name="musicReadingLevel"
                  value={form.musicReadingLevel}
                  onChange={handleChange}
                  options={musicReadingOptions}
                />
              </div>

              <div className="trial-question-card">
                <p className="trial-question-title">
                  Does the student practice another instrument?
                </p>
                <ChoiceGroup
                  name="practicesAnotherInstrument"
                  value={form.practicesAnotherInstrument}
                  onChange={handleChange}
                  options={yesNoOptions}
                />
              </div>

              <div className="trial-question-card">
                <p className="trial-question-title">Has the student participated in:</p>
                <ChoiceGroup
                  name="participation"
                  value={form.participation}
                  onChange={handleParticipationChange}
                  options={participationOptions}
                  type="checkbox"
                />
              </div>
            </div>

            <div className="trial-highlight-note">
              <p>
                Enjoy a complimentary 20-minute trial lesson where you&apos;ll
                meet your teacher, ask questions, and take part in fun
                introductory activities. It&apos;s a great opportunity for both
                you and your teacher to determine the best path for your musical
                journey.
              </p>
            </div>

            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Request Trial Session"}
            </button>

            <p className="trial-form-note">
              By submitting this form, you agree that Pera Music School may use
              the information you provide to coordinate your trial lesson and
              contact you. See our <Link to="/privacy-policy">Privacy Policy</Link>.
            </p>

            {statusMessage ? <p className="form-status">{statusMessage}</p> : null}
          </form>
        </article>

        <article className="contact-card contact-card-wide trial-session-side-card">
          <p className="section-kicker">What to Expect</p>
          <h3>Your first visit should feel simple and encouraging.</h3>
          <div className="trial-session-checklist">
            <p>1. Meet your teacher and get comfortable in the space.</p>
            <p>2. Ask questions about instruments, goals, and next steps.</p>
            <p>3. Try a few fun introductory activities together.</p>
            <p>4. Decide on the best path for the student&apos;s musical journey.</p>
          </div>

          <div className="contact-info-list">
            <p>
              <strong>Email:</strong>{" "}
              <a href="mailto:info@peramusicschool.com">info@peramusicschool.com</a>
            </p>
            <p>
              <strong>Phone:</strong>{" "}
              <a href="tel:+15716234472">+1 (571) 623-4472</a>
            </p>
          </div>
        </article>
      </section>
    </main>
  );
}
