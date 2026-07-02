import { Link } from "react-router-dom";
import "../styles/pages/about.css";

export default function About() {
  return (
    <main>
      <section className="section about-intro-section">
        <div className="about-story-flow">
          <div className="about-story-intro">
            <p className="section-kicker">About</p>
            <h2>A global approach to music education, rooted in care and community.</h2>
          </div>

          <div id="how-it-all-started" className="about-story-bridge">
            <p className="section-kicker">How did it all start?</p>
            <div className="about-story-grid">
              <div className="about-story-card about-story-card-wide">
                <p>
                  As Ludwig van Beethoven once said, &quot;Music can change the
                  world because it can change people&quot;. <br />Pera Music School was
                  founded in 2017 with a simple but meaningful vision: to share the
                  gift of music with the next generation. What started as a small
                  school has grown into a welcoming community where students of all
                  ages can discover, learn, and grow through music.
                </p>
                <p>
                  Our founder and director, Ms. Sibel, has always believed that art
                  is one of the most powerful ways to nurture both individuals and
                  the world around us. For her, a music school should be more than
                  just a place for lessons, it should feel like a second home. A
                  place where students, families, and teachers come together, build
                  connections, and grow side by side. Because music isn&apos;t just
                  about notes, it&apos;s about impact, it&apos;s about touching
                  lives across generations. At Pera Music School, we&apos;re proud
                  to be part of that journey. And our doors are always open.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="trinity-info" className="section about-trinity-section">
        <div className="trinity-panel about-trinity-panel">
          <div className="trinity-copy">
            <p className="section-kicker">Trinity Registered Exam Centre</p>
            <h2 className="trinity-title">
              A structured path for students seeking recognized musical growth.
            </h2>

            <p className="trinity-text">
              Pera Music School is proud to be a registered exam center for
              Trinity College London, an internationally recognized institution
              offering graded music exams.
            </p>

            <p className="trinity-text">
              Trinity&apos;s graded exams provide a structured and motivating
              pathway for students who want to:
            </p>

            <ul className="trinity-list">
              <li>develop their musical skills in a goal-oriented way</li>
              <li>build confidence through performance</li>
              <li>work toward an internationally recognized certification</li>
              <li>
                strengthen their academic and professional music portfolio
              </li>
            </ul>

            <p className="trinity-text">
              In addition, Trinity College London certifications are recognized
              internationally and can be a valuable addition to a student&apos;s
              academic profile. They help demonstrate commitment, discipline,
              and long-term dedication which are qualities that are especially
              meaningful in college applications, even for students who do not
              plan to major in music.
            </p>

            <p className="trinity-text">
              These exams are completely optional but highly beneficial for
              students who are looking to challenge themselves and track their
              progress over time.
            </p>

            <p className="trinity-text">
              As an official exam center, we support our students throughout
              the entire process, from preparation to exam day, ensuring they
              feel confident and ready.
            </p>

            <p className="trinity-text">
              For additional information, please visit{" "}
              <a
                className="trinity-inline-link"
                href="https://www.trinitycollege.com"
                target="_blank"
                rel="noreferrer"
              >
                trinitycollege.com
              </a>
              .
            </p>
          </div>

          <div className="trinity-brand-card">
            <Link
              to="/programs#trinity-college-london-certification-program"
              className="trinity-logo-link"
            >
              <img
                src="/trinity-logo.png"
                alt="Trinity College London"
                className="trinity-logo"
              />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
