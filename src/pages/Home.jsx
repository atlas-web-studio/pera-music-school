import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/api";
import "../styles/pages/home.css";
import { getProgramAnchor, sortPrograms } from "../utils/content.js";

const services = [
  {
    title: "K-12 Music Education",
    description:
      "Customized music instruction for schools and educational institutions, including General Music, String Orchestra, School Bands, and private afterschool programs.",
  },
  {
    title: "Daycare Music Programs",
    description:
      "Engaging, age-appropriate music experiences designed for early learners, serving local preschools, pre-Ks, and daycares.",
  },
  {
    title: "Live Event Performances",
    description:
      "Our professional musicians are available for weddings, special events, and private functions. With expertise in violin, cello, piano, guitar, and ukulele, we help create a beautiful and memorable musical atmosphere for your special day.",
  },
];

const truncateWords = (text, maxWords = 18) => {
  const words = String(text || "").trim().split(/\s+/).filter(Boolean);
  return words.slice(0, maxWords).join(" ");
};

export default function Home() {
  const [programs, setPrograms] = useState([]);
  const [programsError, setProgramsError] = useState("");

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        setProgramsError("");
        const res = await api.get("/api/programs");
        const incomingPrograms = Array.isArray(res.data) ? res.data : [];
        setPrograms(sortPrograms(incomingPrograms));
      } catch (err) {
        console.error("Programs fetch error:", err);
        setPrograms([]);
        setProgramsError(
          err.response?.data?.message ||
            "Programs are temporarily unavailable. Please check back soon."
        );
      }
    };

    fetchPrograms();
  }, []);

  const featuredPrograms = programs.filter((program) => program.showOnHome);
  const homePrograms =
    featuredPrograms.length > 0 ? featuredPrograms.slice(0, 4) : programs.slice(0, 4);

  return (
    <main>
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-copy">
            <span className="hero-eyebrow">Pera Music School</span>

            <h1 className="hero-title">
              A place where every student is seen, heard, and guided
            </h1>

            <p className="hero-description">
              Here we help you and your loved ones build confidence, discipline, and a lifelong
              connection to art.
            </p>

            <Link to="/trial-session" className="hero-button">
              Schedule Your Trial Lesson Today!
            </Link>
          </div>

          <div className="hero-glance">
            <p className="hero-glance-kicker">Pera at a Glance</p>

            <div className="hero-glance-grid">
              <Link to="/about#how-it-all-started" className="hero-glance-link">
                <article className="hero-glance-item">
                  <h3>How did it all start?</h3>
                  <p>
                    Pera Music School was founded in 2017 with a simple but meaningful vision...{" "}
                    <span className="hero-glance-read-more">Read more</span>
                  </p>
                </article>
              </Link>

              <Link to="/programs#early-music-education" className="hero-glance-link">
                <article className="hero-glance-item">
                  <h3>Start Your Musical Journey (Ages 3 and Up)</h3>
                  <p>
                    Pera Music School welcomes young learners starting as early as 3.5 years old...{" "}
                    <span className="hero-glance-read-more">Read more</span>
                  </p>
                </article>
              </Link>

              <Link to="/about#trinity-info" className="hero-glance-link">
                <article className="hero-glance-item">
                  <h3>Official Trinity College London Exam Centre</h3>
                  <p>
                    Pera Music School is proud to be a registered exam center for Trinity College London...{" "}
                    <span className="hero-glance-read-more">Read more</span>
                  </p>
                </article>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section programs-section">
        <div className="section-heading programs-showcase-heading">
          <div>
            <p className="section-kicker">Programs</p>
            <h2>Through personalized instruction, a lifelong love for music.</h2>
          </div>
        </div>

        <div className="programs-showcase">
          {homePrograms.length > 0 ? (
            <div className="program-studio-grid">
              {homePrograms.map((program) => (
                <Link
                  to={`/programs#${getProgramAnchor(program.title)}`}
                  className="program-studio-link"
                  key={program._id}
                >
                  <article className="program-studio-card">
                    <div className="program-studio-image-wrap">
                      <img
                        src={program.imageUrl}
                        alt={`${program.title} lesson at Pera Music School`}
                        className="program-studio-image"
                      />
                    </div>

                    <div className="program-studio-content">
                      <h3>{program.title}</h3>
                      <p>{truncateWords(program.description || program.shortDescription)}...</p>
                      <span className="program-studio-read-more">
                        Read more
                      </span>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          ) : (
            <p className="section-text">
              {programsError || "Programs will be listed here soon."}
            </p>
          )}
        </div>

        <div className="programs-showcase-footer">
          <Link to="/programs" className="programs-link">
            Explore all programs
          </Link>
        </div>
      </section>

      <section id="services" className="section services-section">
        <div className="section-heading services-heading">
          <div>
            <p className="section-kicker">Services</p>
            <h2>
              We are proud to extend our musical services beyond private
              lessons:
            </h2>
          </div>
        </div>

        <div className="services-grid">
          {services.map((service) => (
            <article className="service-card" key={service.title}>
              <p className="service-label">Pera Service</p>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
            </article>
          ))}
        </div>

        <div className="programs-showcase-footer">
          <Link to="/contact" className="programs-link">
            Ask about services
          </Link>
        </div>
      </section>

      <section id="trinity" className="trinity-section">
        <div className="trinity-panel">
          <div className="trinity-copy">
            <p className="section-kicker">Trinity Registered Exam Centre</p>

            <h2 className="trinity-title">
              Structured pathways for musical progress and exam preparation.
            </h2>

            <p className="trinity-text">
              Pera Music School is proud to be an official Trinity College
              London examination center, offering students access to one of the
              world&apos;s most renowned and internationally recognized
              assessment systems.
            </p>

            <Link to="/about#trinity-info" className="btn-primary trinity-button">
              Learn More
            </Link>
          </div>

          <div className="trinity-brand-card">
            <a
              href="https://www.trinitycollege.com"
              target="_blank"
              rel="noreferrer"
              className="trinity-logo-link"
            >
              <img
                src="/trinity-logo.png"
                alt="Trinity College London"
                className="trinity-logo"
              />
            </a>
          </div>
        </div>
      </section>

      <section className="home-cta-section">
        <div className="home-cta-card">
          <p className="section-kicker">Start With Pera</p>
          <h2>Join as a student or connect with us as an educator.</h2>
          <p className="home-cta-text">
            Whether you are ready to begin lessons or interested in teaching at
            Pera Music School, we would love to hear from you.
          </p>
          <div className="home-cta-actions">
            <Link to="/registration" className="btn-primary home-cta-button">
              Student registration
            </Link>
            <Link to="/work-with-us" className="btn-secondary home-cta-button">
              Work with us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
