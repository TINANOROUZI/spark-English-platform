import Reveal from "../components/Reveal";
import Mascot from "../components/Mascot";
import { useI18n } from "../i18n/I18nContext";

const MARQUEE = "🎈 Fun • 🎵 Songs • 🎲 Games • 🎭 Role-play • 🎥 Projects • 🗣️ Speaking • ✨ Confidence • ";

export default function Hero() {
  const { t } = useI18n();
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
          <Mascot />
          <p className="caption">{t("hero_caption")}</p>
        </Reveal>
      </div>
      <div className="marquee" aria-hidden="true">
        <div className="track">{MARQUEE.repeat(6)}</div>
      </div>
    </section>
  );
}
