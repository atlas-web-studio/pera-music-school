import { useState } from "react";
import { ChevronDown, HelpCircle, Mail, MapPin, Phone } from "lucide-react";
import "../styles/pages/faq.css";


const faqs = [
  {
    question: "What ages do you accept?",
    answer:
      "We welcome students ages 3 and up. Programs are tailored based on age and experience level to ensure each student receives appropriate instruction.",
  },
  {
    question: "Do students need prior experience?",
    answer:
      "Not at all. We offer lessons for complete beginners as well as intermediate and advanced students.",
  },
  {
    question: "What should students bring to their first lesson?",
    answer:
      "Students should bring their instrument, if applicable, and any assigned materials or books. If you are unsure what to bring, our team will guide you before your first lesson.",
  },
  {
    question: "How long are lessons?",
    answer:
      "Lesson lengths vary depending on the program, but most private lessons are offered in 30, 45, or 60-minute sessions.",
  },
  {
    question: "Are trial lessons available?",
    answer:
      "Yes, we offer trial lessons so students can experience our teaching approach before committing to a full program.",
  },
  {
    question: "How are students placed in the right level?",
    answer:
      "Students are placed based on age, experience, and a brief assessment if needed. Our goal is to ensure every student feels both comfortable and challenged.",
  },
  {
    question: "Do you offer group classes or only private lessons?",
    answer:
      "We offer both private lessons and group classes, depending on the instrument and program.",
  },
  {
    question: "What is your cancellation or make-up policy?",
    answer:
      "Make-up lessons are offered for absences when advance notice is provided. Please note that missed make-up lessons are not rescheduled, credited, or refunded.",
  },
  {
    question: "Do you offer performance opportunities?",
    answer:
      "Yes! Students have the opportunity to participate in recitals and performances throughout the year to build confidence and showcase their progress.",
  },
  {
    question: "Are Trinity College London exams required?",
    answer:
      "No, Trinity exams are completely optional. However, they are a great opportunity for students who would like to work toward an internationally recognized certification.",
  },
  {
    question: "Do you offer programs for schools or daycares?",
    answer:
      "Yes, we provide customized music programs for schools, daycares, and community organizations.",
  },
  {
    question: "Can we hire musicians for events?",
    answer:
      "Absolutely. Our professional musicians are available for weddings, private events, and special occasions.",
  },
  {
    question: "How do I register or get started?",
    answer:
      "You can register through our website or contact us directly. Our team will guide you through the next steps and help you find the best program.",
  },
  {
    question: "Do you provide recommendation letters for college or summer programs?",
    answer:
      "Yes, we provide recommendation letters for students who have been enrolled with us for at least two semesters. This allows us to accurately reflect their growth, dedication, and character.",
  },
  {
    question:
      "Do you offer internship programs or volunteer opportunities for students studying music or education?",
    answer:
      "Yes, we offer both internship and volunteer opportunities for high school and college students who are passionate about music or education and interested in gaining firsthand experience at our music school. Participants have the opportunity to learn in a supportive environment while working alongside our diverse team.",
  },
];

function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <main className="faq-page">
      <section className="faq-hero section-container">
        <p className="eyebrow">Questions & Answers</p>
        <h1>Frequently Asked Questions</h1>
        <p>
          Find answers about lessons, programs, registration, Trinity exams,
          performances, and student opportunities at Pera Music School.
        </p>
      </section>

      <section className="faq-layout section-container">
        <aside className="faq-side-card">
          <div className="faq-icon-wrap">
            <HelpCircle size={30} />
          </div>

          <h2>Find Us</h2>
          <p>
            We would love to hear from you.
          </p>

          <div className="faq-mini-list">
            <div>
              <Mail size={18} />
              <a href="mailto:info@peramusicschool.com">info@peramusicschool.com</a>
            </div>
            <div>
              <Phone size={18} />
              <a href="tel:+15716234472">+1 (571) 623-4472</a>
            </div>
            <div>
              <MapPin size={18} />
              <a
                href="https://maps.google.com/?q=14120+Newbrook+Dr+Suite+210+Chantilly+VA+20151"
                target="_blank"
                rel="noreferrer"
              >
                14120 Newbrook Dr Suite 210, Chantilly, VA 20151
              </a>
            </div>
          </div>
        </aside>

        <div className="faq-accordion">
          {faqs.map((item, index) => (
            <div
              className={`faq-item ${openIndex === index ? "active" : ""}`}
              key={item.question}
            >
              <button
                className="faq-question"
                onClick={() =>
                  setOpenIndex(openIndex === index ? null : index)
                }
              >
                <span>{item.question}</span>
                <ChevronDown className="faq-chevron" size={20} />
              </button>

              <div className="faq-answer">
                <p>{item.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

export default FAQ;
