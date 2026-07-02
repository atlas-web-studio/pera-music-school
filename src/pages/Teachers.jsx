import { useEffect, useState } from "react";
import api from "../api/api";
import "../styles/pages/teachers.css";
import { sortTeachers } from "../utils/content.js";

export default function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [teachersError, setTeachersError] = useState("");

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setTeachersError("");
        const res = await api.get("/api/teachers");
        const incomingTeachers = Array.isArray(res.data) ? res.data : [];
        setTeachers(sortTeachers(incomingTeachers));
      } catch (err) {
        console.error(err);
        setTeachers([]);
        setTeachersError(
          err.response?.data?.message ||
            "Teacher profiles are temporarily unavailable. Please check back soon."
        );
      }
    };

    fetchTeachers();
  }, []);

  return (
    <main>
      <section className="section">
        <p className="section-kicker">Teachers</p>
        <h2>Meet the educators behind the school.</h2>
        <p className="section-text">
          Our teaching philosophy is rooted in care, consistency, and artistic
          growth. Each teacher contributes to a learning environment that feels
          both supportive and inspiring.
        </p>

        {teachers.length > 0 ? (
          <div className="teacher-list">
            {teachers.map((teacher) => (
              <article className="teacher-card" key={teacher._id || teacher.name}>
                <div className="teacher-card-image-wrap">
                  <img
                    src={teacher.imageUrl}
                    alt={`${teacher.name} at Pera Music School`}
                    className="teacher-card-image"
                  />
                </div>
                <div className="teacher-card-content">
                  <h3>{teacher.name}</h3>
                  <p className="teacher-role">{teacher.role}</p>
                  <p className="teacher-bio">{teacher.bio}</p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="teachers-empty-state" role="status">
            {teachersError || "Faculty details will appear here soon..."}
          </p>
        )}
      </section>
    </main>
  );
}
