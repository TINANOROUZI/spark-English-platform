import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useI18n } from "../i18n/I18nContext.jsx";
import { fireConfetti } from "../hooks/useConfetti.js";
import AuthModal from "./AuthModal.jsx";

export default function Navbar() {
  const { t, setLang } = useI18n();
  const { auth, isAdmin, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  function toggleMenu() {
    setMenuOpen((open) => {
      const next = !open;
      document.body.classList.toggle("no-scroll", next);
      return next;
    });
  }

  function switchLang(next) {
    setLang(next);
    fireConfetti();
  }

  return (
    <>
      <header className="navbar">
        <div className="nav-inner">
          <Link className="brand" to="/">
            <span className="logo" />
            <span className="brand-text">Spark <strong>English</strong> Kids</span>
          </Link>
          <nav className={`links ${menuOpen ? "open" : ""}`} aria-label="Main">
            <a href="#courses" onClick={() => setMenuOpen(false)}>{t("nav_courses")}</a>
            <a href="#activities" onClick={() => setMenuOpen(false)}>{t("nav_activities")}</a>
            <a href="#ages" onClick={() => setMenuOpen(false)}>{t("nav_ages")}</a>
            <a href="#teachers" onClick={() => setMenuOpen(false)}>{t("nav_teachers")}</a>
            <a href="#pricing" onClick={() => setMenuOpen(false)}>{t("nav_pricing")}</a>
            <a href="#faq" onClick={() => setMenuOpen(false)}>{t("nav_faq")}</a>
            <a href="#contact" className="btn small" onClick={() => setMenuOpen(false)}>{t("nav_trial")}</a>
          </nav>
          <div className="right">
            <button className="chip" onClick={() => switchLang("en")}>EN</button>
            <button className="chip" onClick={() => switchLang("it")}>IT</button>
            <div className="right-auth">
              {!auth && <button className="chip" onClick={() => setAuthOpen(true)}>Login</button>}
              {auth && (
                <>
                  {isAdmin && <Link className="chip" to="/admin">Admin</Link>}
                  <span className="chip">Hi, {auth.name}</span>
                  <button className="chip" onClick={logout}>Logout</button>
                </>
              )}
            </div>
            <button className="hamb" aria-label="Menu" aria-expanded={menuOpen} onClick={toggleMenu}>
              <span /><span /><span />
            </button>
          </div>
        </div>
      </header>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
