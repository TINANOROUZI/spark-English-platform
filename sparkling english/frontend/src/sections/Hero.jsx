import { useEffect, useRef } from "react";
import Reveal from "../components/Reveal.jsx";
import { useI18n } from "../i18n/I18nContext.jsx";

export default function Hero() {
  const { t } = useI18n();
  const trackRef = useRef(null);

  useEffect(() => {
    const track = trackRef.current;
    if (track && !track.dataset.repeated) {
      track.innerHTML = (track.textContent + " ").repeat(6);
      track.dataset.repeated = "true";
    }
  }, []);

  return (
    <section id="home" className="hero section">
      <div className="container hero-grid">
        <Reveal className="hero-text">
          <h1>{t("hero_title")}</h1>
          <p className="lead">{t("hero_sub")}</p>
          <div className="cta">
            <a href="#contact" className="btn big">{t("hero_cta")}</a>
            <a href="#courses" className="btn ghost">{t("hero_secondary")}</a>
          </div>
          <div className="badges">
            <span className="badge">{t("hero_badge1")}</span>
            <span className="badge">{t("hero_badge2")}</span>
            <span className="badge">{t("hero_badge3")}</span>
          </div>
        </Reveal>
        <Reveal className="hero-art">
          <svg className="kid-svg" viewBox="0 0 420 320" aria-hidden="true">
            <defs>
              <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0%" stopColor="#ffd36e" />
                <stop offset="100%" stopColor="#7aa2ff" />
              </linearGradient>
            </defs>
            <rect x="70" y="150" rx="18" width="280" height="120" fill="url(#g)" />
            <rect x="85" y="165" rx="12" width="250" height="90" fill="#fff" opacity=".9" />
            <polygon className="float-star" points="210,34 225,76 270,76 232,100 246,142 210,118 174,142 188,100 150,76 195,76" />
            <circle className="doodle" cx="125" cy="116" r="10" />
            <circle className="doodle" cx="295" cy="116" r="10" />
            <path d="M140 222 C 190 198, 230 198, 280 222" className="smile" />
          </svg>
          <p className="caption">{t("hero_caption")}</p>
        </Reveal>
      </div>
      <div className="marquee" aria-hidden="true">
        <div ref={trackRef} className="track">🎈 Fun • 🎵 Songs • 🎲 Games • 🎭 Role-play • 🎥 Projects • 🗣️ Speaking • ✨ Confidence • </div>
      </div>
    </section>
  );
}
