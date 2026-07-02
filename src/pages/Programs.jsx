import { useEffect, useState } from "react";
import api from "../api/api";
import "../styles/pages/programs.css";
import { getProgramAnchor, sortPrograms } from "../utils/content.js";

export default function Programs() {
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

  return (
    <main>
      <section className="section">
        <p className="section-kicker">Programs</p>
        <h2>Music education thoughtfully structured for every stage of growth.</h2>
        <p className="section-text">
          Our programs include piano, voice, guitar, violin, viola, cello, and drums, along with early
          childhood music education designed to build a strong musical foundation from a young age.
          Each program is thoughtfully structured to support students at every stage—from beginners
          discovering their first notes to advanced musicians refining their technique and artistry. Through
          personalized instruction and a supportive environment, we nurture creativity, confidence, and a
          lifelong love for music.
        </p>
      </section>

      <section className="section programs-section">
        <div className="section-heading">
          <p className="section-kicker">What we offer</p>
          <h2>Programs designed to grow with each student.</h2>
        </div>

        {programs.length > 0 ? (
          <div className="programs-page-grid">
            {programs.map((program) => (
              <article
                className="program-detail-card"
                id={getProgramAnchor(program.title)}
                key={program._id}
              >
                <div className="program-detail-image-wrap">
                  {program.imageUrl ? (
                    <img
                      src={program.imageUrl}
                      alt={`${program.title} program at Pera Music School`}
                      className="program-detail-image"
                    />
                  ) : (
                    <div className="program-detail-image placeholder">
                      {program.title}
                    </div>
                  )}
                </div>

                <div className="program-detail-content">
                  {program.level ? (
                    <p className="program-detail-level">{program.level}</p>
                  ) : null}

                  <h3>{program.title}</h3>

                  <p>{program.description}</p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="section-text">
            {programsError || "Programs will be listed here soon."}
          </p>
        )}
      </section>
    </main>
  );
}
