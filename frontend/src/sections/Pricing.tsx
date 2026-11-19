import Reveal from "../components/Reveal";
import { useI18n } from "../i18n/I18nContext";
import { FORMAT_PRICE_BULLETS, chooseCourse, courseTitle } from "../lib/courses";
import { useCourseList } from "../lib/useCourseList";

export default function Pricing() {
  const { t, lang } = useI18n();
  const { courses, isLoading } = useCourseList();
  return (
    <section id="pricing" className="section">
      <div className="container">
        <Reveal as="h2">{t("pricing_title")}</Reveal>
        <Reveal as="p" className="section-lead">{t("pricing_sub")}</Reveal>
        <div className="price-grid" aria-busy={isLoading}>
          {isLoading && [0, 1, 2].map((i) => <div key={i} className="price-card skeleton" aria-hidden="true" />)}
          {courses.map((c) => (
            <Reveal as="div" className={`price-card ${c.isPopular ? "highlight" : ""}`} key={c.id}>
              {c.isPopular && <div className="ribbon">{t("price_popular")}</div>}
              <h3>{courseTitle(c, lang)}</h3>
              <div className="price">
                {c.priceEur != null ? <>€{c.priceEur}{c.format !== "Camp" && <span>{t("price_per")}{c.durationMinutes}m</span>}</> : "€—"}
              </div>
              <ul>{FORMAT_PRICE_BULLETS[c.format].map((k) => <li key={k}>{t(k)}</li>)}</ul>
              <button className="btn small" onClick={() => chooseCourse(c.id)}>{c.priceEur != null ? t("price_choose") : t("price_ask")}</button>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
