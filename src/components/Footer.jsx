import { Link } from "react-router-dom";
import "../styles/components/footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-main">
        <div className="footer-brand">
          <img
            src="/pera-logo.png"
            alt="Pera Music School logo"
            className="footer-logo"
          />

          <div className="footer-brandText">
            <h3 className="footer-title">Pera Music School</h3>
            <p className="footer-subtitle">
              "Where talents meet passion"
            </p>

            <div className="footer-socials">
              <a href="https://www.instagram.com/peramusicschool/" aria-label="Instagram">Instagram</a>
              {/* <a href="#" aria-label="Facebook">Facebook</a>
              <a href="#" aria-label="YouTube">YouTube</a> */}
            </div>
          </div>
        </div>

        <div className="footer-info">
          <p>
            <a
              href="https://maps.google.com/?q=14120+Newbrook+Dr+Chantilly+VA"
              target="_blank"
              rel="noreferrer"
            >
             14120 Newbrook Dr Suite 210, Chantilly, VA 20151
            </a>
          </p>
          <p>
            <a href="tel:+15716234472">+1 (571) 623-4472</a>
          </p>
          <p>
            <a href="mailto:info@peramusicschool.com">info@peramusicschool.com</a>
          </p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          © 2026 Pera Music School · <Link to="/privacy-policy">Privacy Policy</Link> ·{" "}
          <Link to="/terms-and-conditions">Terms &amp; Conditions</Link>
        </p>
      </div>
    </footer>
  );
}
