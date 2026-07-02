import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Menu, X } from "lucide-react";
import "../styles/components/navbar.css";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState(null);

  const closeNavigation = () => {
    setIsMenuOpen(false);
    setOpenGroup(null);
  };

  const toggleGroup = (groupName) => {
    setOpenGroup((currentGroup) =>
      currentGroup === groupName ? null : groupName
    );
  };

  return (
    <header className={`site-header${isMenuOpen ? " menu-open" : ""}`}>
      <div className="site-header-inner">
        <Link to="/" className="site-brand" onClick={closeNavigation}>
          <img src="/pera-logo.png" alt="Pera Music School logo" />
          <span>Pera Music School</span>
        </Link>

        <button
          type="button"
          className="site-menu-toggle"
          aria-expanded={isMenuOpen}
          aria-controls="site-nav"
          aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
        >
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          <span>{isMenuOpen ? "Close" : "Menu"}</span>
        </button>

        <nav
          id="site-nav"
          className={`site-nav${isMenuOpen ? " is-open" : ""}`}
          aria-label="Primary navigation"
        >
          <Link to="/" onClick={closeNavigation}>Home</Link>
          <Link to="/about" onClick={closeNavigation}>About</Link>
          <Link to="/teachers" onClick={closeNavigation}>Our Team</Link>
          <div className={`nav-dropdown${openGroup === "programs" ? " is-open" : ""}`}>
            <button
              type="button"
              className="nav-dropdown-trigger nav-dropdown-button"
              aria-expanded={openGroup === "programs"}
              onClick={() => toggleGroup("programs")}
            >
              <span>Programs</span>
              <ChevronDown size={16} />
            </button>
            <div className="nav-dropdown-menu">
              <Link to="/programs" onClick={closeNavigation}>Lessons</Link>
              <Link to="/#services" onClick={closeNavigation}>Our Services</Link>
            </div>
          </div>
          <div className={`nav-dropdown${openGroup === "contact" ? " is-open" : ""}`}>
            <button
              type="button"
              className="nav-dropdown-trigger nav-dropdown-button"
              aria-expanded={openGroup === "contact"}
              onClick={() => toggleGroup("contact")}
            >
              <span>Contact</span>
              <ChevronDown size={16} />
            </button>
            <div className="nav-dropdown-menu">
              <Link to="/registration" onClick={closeNavigation}>Registration</Link>
              <Link to="/work-with-us" onClick={closeNavigation}>Work With Us</Link>
              <Link to="/faq" onClick={closeNavigation}>FAQ</Link>
            </div>
          </div>
          <Link to="/portal" className="portal-login-button" onClick={closeNavigation}>
            Portal Login
          </Link>
        </nav>
      </div>
    </header>
  );
}
