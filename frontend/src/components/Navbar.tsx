import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../i18n/I18nContext";
import type { CopyKey, Lang } from "../i18n/copy";
import { fireConfetti } from "../lib/confetti";
import AuthModal from "./AuthModal";

const LINKS: [string, CopyKey][] = [
  ["#courses", "nav_courses"], ["#activities", "nav_activities"], ["#ages", "nav_ages"],
  ["#teachers", "nav_teachers"], ["#pricing", "nav_pricing"], ["#faq", "nav_faq"],
];

export default function Navbar() {
  const { t, lang, setLang } = useI18n();
  const { auth, isAdmin, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const closeAuth = useCallback(() => setAuthOpen(false), []);

  useEffect(() => {
    document.body.classList.toggle("no-scroll", menuOpen);
    return () => document.body.classList.remove("no-scroll");
  }, [menuOpen]);

  const switchLang = (next: Lang) => { if (next !== lang) { setLang(next); fireConfetti(); } };
  const close = () => setMenuOpen(false);

  return (
    <>
      <a className="skip-link" href="#home">{t("skip")}</a>
      <header className="navbar">
        <div className="nav-inner">
          <Link className="brand" to="/" aria-label={t("brand_alt")}>
            <span className="logo" />
            <span className="brand-text">Spark <strong>English</strong> Kids</span>
          </Link>
          <nav id="main-nav" className={`links ${menuOpen ? "open" : ""}`} aria-label="Main">
            {LINKS.map(([href, key]) => <a key={href} href={href} onClick={close}>{t(key)}</a>)}
            <a href="#contact" className="btn small" onClick={close}>{t("nav_trial")}</a>
          </nav>
          <div className="right">
            <div className="lang" role="group" aria-label="Language">
              {(["en", "it"] as const).map((l) => (
                <button key={l} className={`chip ${lang === l ? "chip-active" : ""}`} aria-pressed={lang === l} onClick={() => switchLang(l)}>{l.toUpperCase()}</button>
              ))}
            </div>
            <div className="right-auth">
              {!auth && <button className="chip" onClick={() => setAuthOpen(true)}>{t("login")}</button>}
              {auth && (
                <>
                  {isAdmin && <Link className="chip" to="/admin">{t("admin_link")}</Link>}
                  <span className="chip chip-name">{t("hi")} {auth.name}</span>
                  <button className="chip" onClick={logout}>{t("logout")}</button>
                </>
              )}
            </div>
            <button className="hamb" aria-label={t("menu")} aria-expanded={menuOpen} aria-controls="main-nav" onClick={() => setMenuOpen((o) => !o)}>
              <span /><span /><span />
            </button>
          </div>
        </div>
      </header>
      {authOpen && <AuthModal onClose={closeAuth} />}
    </>
  );
}
