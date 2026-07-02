import { Link } from "react-router-dom";
import "../styles/pages/terms-and-conditions.css";

const effectiveDate = "May 17, 2026";

export default function TermsAndConditions() {
  return (
    <main className="terms-page">
      <section className="section terms-hero">
        <p className="section-kicker">Terms &amp; Conditions</p>
        <h1>Website terms for using Pera Music School online services.</h1>
        <p className="terms-effective-date">Effective date: {effectiveDate}</p>
        <p className="section-text">
          These Terms &amp; Conditions govern your use of the Pera Music School
          website, including our informational pages, inquiry forms, and
          third-party registration tools.
        </p>
      </section>

      <section className="section terms-sections">
        <article className="terms-card">
          <h2>Acceptance of These Terms</h2>
          <p>
            By accessing or using this website, you agree to these Terms &amp;
            Conditions. If you do not agree, please do not use the website.
          </p>
        </article>

        <article className="terms-card">
          <h2>Use of This Website</h2>
          <p>
            You may use this website to learn about Pera Music School, contact
            us, submit inquiries, and access registration-related resources.
            You agree not to misuse the website, interfere with its operation,
            or attempt unauthorized access to any part of the site or related
            systems.
          </p>
        </article>

        <article className="terms-card">
          <h2>Information Only</h2>
          <p>
            Content on this website is provided for general informational
            purposes. Program details, scheduling, lesson formats, faculty
            availability, and other offerings may change from time to time.
          </p>
        </article>

        <article className="terms-card">
          <h2>Forms, Registration, and Inquiries</h2>
          <p>
            Submitting a contact form, teaching inquiry, or registration form
            does not by itself create a student enrollment agreement,
            employment relationship, guaranteed lesson placement, or guaranteed
            acceptance into any program.
          </p>
          <p>
            Pera Music School may review submissions and follow up as
            appropriate based on availability, scheduling, and school needs.
          </p>
        </article>

        <article className="terms-card">
          <h2>Third-Party Services</h2>
          <p>
            Parts of this website may rely on third-party tools or embedded
            services, including MyMusicStaff for registration-related
            experiences and related verification or security services. Your use
            of those services may also be subject to the terms, policies, and
            practices of those third parties.
          </p>
        </article>

        <article className="terms-card">
          <h2>Intellectual Property</h2>
          <p>
            Unless otherwise stated, the content on this website, including
            text, design elements, branding, logos, and images, belongs to Pera
            Music School or is used with permission. You may not reproduce,
            distribute, or reuse website content for commercial purposes
            without prior written permission.
          </p>
        </article>

        <article className="terms-card">
          <h2>Links to Other Websites</h2>
          <p>
            This website may include links to third-party sites for convenience,
            including maps, portal tools, or external services. Pera Music
            School is not responsible for the content, availability, or
            practices of third-party websites.
          </p>
        </article>

        <article className="terms-card">
          <h2>Disclaimer of Warranties</h2>
          <p>
            This website is provided on an &quot;as is&quot; and &quot;as
            available&quot; basis. While we aim to keep information current and
            the site functioning properly, we do not guarantee uninterrupted
            access, complete accuracy, or error-free operation.
          </p>
        </article>

        <article className="terms-card">
          <h2>Limitation of Liability</h2>
          <p>
            To the extent permitted by applicable law, Pera Music School will
            not be liable for indirect, incidental, special, or consequential
            damages arising out of or related to your use of this website.
          </p>
        </article>

        <article className="terms-card">
          <h2>Privacy</h2>
          <p>
            Your use of forms and other website features is also subject to our{" "}
            <Link to="/privacy-policy">Privacy Policy</Link>, which explains how
            personal information may be collected and used.
          </p>
        </article>

        <article className="terms-card">
          <h2>Changes to These Terms</h2>
          <p>
            We may update these Terms &amp; Conditions from time to time. When
            we do, we will update the effective date on this page. Continued
            use of the website after changes are posted means you accept the
            updated terms.
          </p>
        </article>

        <article className="terms-card">
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
      </section>
    </main>
  );
}
