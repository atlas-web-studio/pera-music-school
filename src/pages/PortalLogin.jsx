import MyMusicStaffEmbed from "../components/MyMusicStaffEmbed.jsx";
import { CalendarDays, MessageCircle, CreditCard } from "lucide-react";
import "../styles/pages/portal-login.css";

export default function PortalLogin() {
  return (
    <main className="portal-page">
      <section className="portal-hero">
        <p className="section-kicker">Student & Parent Portal</p>
        <h1>Access your Pera Music School portal.</h1>
        <p>
          Log in to view lesson schedules, assignments, billing information,
          and important updates from your teacher.
        </p>
      </section>

      <section className="portal-section">
        <div className="portal-card portal-card-plain">
          <div className="portal-widget-shell">
            <MyMusicStaffEmbed
              title="Student Portal Login"
              src="/mymusicstaff-portal-login.html"
              className="portal-widget-frame"
            />
          </div>
        </div>

        <div className="portal-info">
          <h3>What can you access?</h3>

          <div className="portal-info-item">
            <CalendarDays size={20} />
            <span>Lesson schedules and calendar updates</span>
          </div>

          <div className="portal-info-item">
            <MessageCircle size={20} />
            <span>Teacher communication and lesson notes</span>
          </div>

          <div className="portal-info-item">
            <CreditCard size={20} />
            <span>Invoices, payments, and account details</span>
          </div>

          <div className="portal-help-box">
            <h4>Need help logging in?</h4>
            <p>
              If you are having trouble accessing your account, please contact
              Pera Music School and our team will be happy to assist you.
            </p>
            <a href="mailto:info@peramusicschool.com" className="portal-help-link">
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
