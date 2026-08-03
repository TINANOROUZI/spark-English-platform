import Reveal from "../components/Reveal.jsx";
import { useI18n } from "../i18n/I18nContext.jsx";

export default function Pricing() {
  const { t } = useI18n();
  return (
    <section id="pricing" className="section">
      <div className="container">
        <Reveal as="h2">{t("pricing_title")}</Reveal>
        <Reveal as="p" className="section-lead">{t("pricing_sub")}</Reveal>
        <div className="price-grid">
          <Reveal as="div" className="price-card">
            <h3>Starter</h3>
            <div className="price">€19<span>/25m</span></div>
            <ul><li>1:1 session</li><li>Placement + plan</li><li>Homework tips</li></ul>
            <a href="#contact" className="btn small">Choose</a>
          </Reveal>
          <Reveal as="div" className="price-card highlight">
            <div className="ribbon">Popular</div>
            <h3>Mini-Group</h3>
            <div className="price">€16<span>/50m</span></div>
            <ul><li>Max 4 learners</li><li>Projects + games</li><li>Monthly progress</li></ul>
            <a href="#contact" className="btn small">Choose</a>
          </Reveal>
          <Reveal as="div" className="price-card">
            <h3>Camp</h3>
            <div className="price">€—</div>
            <ul><li>1 week immersion</li><li>Activities &amp; trips</li><li>Ask for details</li></ul>
            <a href="#contact" className="btn small">Ask info</a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
