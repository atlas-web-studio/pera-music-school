import MyMusicStaffEmbed from "../components/MyMusicStaffEmbed.jsx";
import "../styles/pages/registration.css";

export default function Registration() {
  return (
    <main>
      <section className="section registration-intro-section">
        <p className="section-kicker">Registration</p>
        <h2>Begin your registration with Pera Music School.</h2>
        <p className="section-text">
          Complete the form below to begin the enrollment process and share
          your initial information with the school.
        </p>
      </section>

      <section className="section contact-single-section registration-content-section">
        <article className="contact-card contact-card-wide contact-card-plain">
          <div className="registration-widget-card">
            <MyMusicStaffEmbed
              title="Student Registration Form"
              src="/mymusicstaff-registration.html"
              className="registration-widget-frame"
            />
          </div>
        </article>

        <article className="contact-card contact-card-wide registration-find-us-card">
          <p className="section-kicker">Find Us</p>
          <h3>We would love to hear from you.</h3>
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
      </section>
    </main>
  );
}
