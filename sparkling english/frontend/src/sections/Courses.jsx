import Reveal from "../components/Reveal.jsx";
import { useI18n } from "../i18n/I18nContext.jsx";

export default function Courses() {
  const { t } = useI18n();
  return (
    <section id="courses" className="section">
      <div className="container">
        <Reveal as="h2">{t("courses_title")}</Reveal>
        <Reveal as="p" className="section-lead">{t("courses_sub")}</Reveal>
        <div className="cards">
          <Reveal as="article" className="card">
            <div className="card-icon">🧑‍🏫</div>
            <h3>{t("c1_title")}</h3>
            <p>{t("c1_text")}</p>
            <ul className="ticks">
              <li>{t("c1_p1")}</li><li>{t("c1_p2")}</li><li>{t("c1_p3")}</li>
            </ul>
            <a href="#contact" className="btn small">{t("cta_try")}</a>
          </Reveal>
          <Reveal as="article" className="card">
            <div className="card-icon">👫</div>
            <h3>{t("c2_title")}</h3>
            <p>{t("c2_text")}</p>
            <ul className="ticks">
              <li>{t("c2_p1")}</li><li>{t("c2_p2")}</li><li>{t("c2_p3")}</li>
            </ul>
            <a href="#contact" className="btn small">{t("cta_try")}</a>
          </Reveal>
          <Reveal as="article" className="card">
            <div className="card-icon">🏕️</div>
            <h3>{t("c3_title")}</h3>
            <p>{t("c3_text")}</p>
            <ul className="ticks">
              <li>{t("c3_p1")}</li><li>{t("c3_p2")}</li><li>{t("c3_p3")}</li>
            </ul>
            <a href="#contact" className="btn small">{t("cta_info")}</a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
