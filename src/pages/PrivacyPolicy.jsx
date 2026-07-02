import "../styles/pages/privacy-policy.css";

const effectiveDate = "May 17, 2026";

export default function PrivacyPolicy() {
  return (
    <main className="privacy-page">
      <section className="section privacy-hero">
        <p className="section-kicker">Privacy Policy</p>
        <h1>How Pera Music School handles personal information.</h1>
        <p className="privacy-effective-date">Effective date: {effectiveDate}</p>
        <p className="section-text">
          This Privacy Policy explains how Pera Music School may collect, use,
          store, and share personal information through our website, including
          our Work With Us inquiry form and third-party registration tools.
        </p>
      </section>

      <section className="section privacy-sections">
        <article className="privacy-card">
          <h2>Information We Collect</h2>
          <p>
            We may collect personal information that you choose to submit to us,
            such as your name, email address, phone number, and the details you
            include in forms on our website.
          </p>
          <p>
            For example, our Work With Us form currently collects a full name,
            email address, phone number, and teaching instrument selections.
          </p>
          <p>
            If we add similar inquiry, contact, application, or scheduling
            forms in the future, this policy also applies to the information
            submitted through those forms unless we provide a separate notice.
          </p>
        </article>

        <article className="privacy-card">
          <h2>Registration And Third-Party Tools</h2>
          <p>
            Our student registration flow is currently provided through
            MyMusicStaff. When you use that registration form, information may
            be collected and processed by MyMusicStaff and its service providers
            as part of that registration experience.
          </p>
          <p>
            Third-party tools used in embedded forms may also rely on related
            security and verification services, such as Google reCAPTCHA or
            similar anti-spam technologies.
          </p>
        </article>

        <article className="privacy-card">
          <h2>How We Use Information</h2>
          <ul>
            <li>To respond to inquiries and communicate with you.</li>
            <li>To review teaching applications and staffing inquiries.</li>
            <li>To process student registration and enrollment-related requests.</li>
            <li>To maintain internal records and operate our school services.</li>
            <li>To protect our website, forms, and systems from misuse.</li>
          </ul>
        </article>

        <article className="privacy-card">
          <h2>How We May Share Information</h2>
          <p>
            We do not sell personal information. We may share information with
            trusted service providers who help us operate our website or school
            systems, such as MyMusicStaff for registration-related workflows.
          </p>
          <p>
            We may also disclose information when reasonably necessary to comply
            with applicable law, protect our rights, or respond to lawful
            requests.
          </p>
        </article>

        <article className="privacy-card">
          <h2>Children&apos;s Information</h2>
          <p>
            Some of our programs are designed for children. If registration or
            enrollment information is submitted for a child, we expect that it
            will be submitted by a parent or legal guardian or with appropriate
            parental involvement.
          </p>
          <p>
            If you believe personal information about a child was submitted to
            us in error, please contact us and we will review the request.
          </p>
        </article>

        <article className="privacy-card">
          <h2>Retention</h2>
          <p>
            We may retain personal information for as long as reasonably
            necessary to respond to your inquiry, review an application,
            maintain records, or satisfy legal or operational requirements.
          </p>
        </article>

        <article className="privacy-card">
          <h2>Your Choices</h2>
          <p>
            You may contact us to ask questions about the personal information
            you have submitted through our website or to request updates where
            appropriate.
          </p>
        </article>

        <article className="privacy-card">
          <h2>Contact Us</h2>
          <p>
            Pera Music School
            <br />
            14120 Newbrook Dr Suite 210, Chantilly, VA 20151
            <br />
            <a href="mailto:info@peramusicschool.com">info@peramusicschool.com</a>
            <br />
            <a href="tel:+15716234472">+1 (571) 623-4472</a>
          </p>
        </article>

        <article className="privacy-card">
          <h2>Changes To This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. When we make
            material changes, we will update the effective date shown on this
            page.
          </p>
        </article>
      </section>
    </main>
  );
}
