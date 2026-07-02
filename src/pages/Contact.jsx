import { Link } from "react-router-dom";
import MyMusicStaffEmbed from "../components/MyMusicStaffEmbed.jsx";
import "../styles/pages/contact.css";

export default function Contact() {
  return (
    <main>
      <section className="section">
        <p className="section-kicker">Contact</p>
        <h2>Get in touch with Pera Music School.</h2>
        <p className="section-text">
          Explore registration, visit information, teaching opportunities, and
          frequently asked questions in one place.
        </p>
      </section>

      <section className="contact-overview-grid">
        <article id="registration" className="contact-card contact-card-wide-panel">
          <p className="section-kicker">Registration</p>
          <h3>Student Registration Form</h3>
          <p>
            Complete the registration form below to begin the enrollment
            process.
          </p>

          <div className="form-embed-shell">
            <MyMusicStaffEmbed
              title="Student Registration Form"
              src="/mymusicstaff-registration.html"
              className="form-embed"
            />
          </div>
        </article>

        <article className="contact-card contact-info-card">
          <p className="section-kicker">Find Us</p>
          <p>
            We would love to hear from you.
          </p>
          <div className="contact-info-list">
            <p>
              <strong>Email:</strong>{" "}
              <a href="mailto:info@peramusicschool.com">info@peramusicschool.com</a>
            </p>
            <p>
              <strong>Phone:</strong>{" "}
              <a href="tel:+15716234472">+1 (571) 623-4472</a>
            </p>
            <p>
              <strong>Address:</strong>{" "}
              <a
                href="https://maps.google.com/?q=14120+Newbrook+Dr+Suite+210+Chantilly+VA+20151"
                target="_blank"
                rel="noreferrer"
              >
                14120 Newbrook Dr Suite 210, Chantilly, VA 20151
              </a>
            </p>
          </div>
        </article>

        <article id="work-with-us" className="contact-card contact-link-card">
          <p className="section-kicker">Work With Us</p>
          <h3>Teaching Inquiry</h3>
          <p>
            Learn more about teaching opportunities and access the inquiry form.
          </p>
          <Link to="/work-with-us" className="programs-link">
            Open work with us
          </Link>
        </article>

        <article id="faq" className="contact-card contact-link-card">
          <p className="section-kicker">FAQ</p>
          <h3>Helpful Information</h3>
          <p>
            Find answers to common questions about ages, programs, Trinity
            exams, and next steps.
          </p>
          <Link to="/faq" className="programs-link">
            Open FAQ
          </Link>
        </article>
      </section>
    </main>
  );
}
