import Reveal from "../components/Reveal.jsx";
import { useI18n } from "../i18n/I18nContext.jsx";

export default function Teachers() {
  const { t } = useI18n();
  return (
    <section id="teachers" className="section section-alt">
      <div className="container">
        <Reveal as="h2">{t("teach_title")}</Reveal>
        <div className="teachers">
          <Reveal as="div" className="teacher" tabIndex={0}>
            <div className="flip">
              <div className="front">
                <div className="avatar">👩‍🏫</div>
                <h4>Ms. Tina</h4>
                <p>4 years experience • Starters &amp; Explorers</p>
              </div>
              <div className="back">
                <p>4 years online. Phonics, songs &amp; crafts. Patient and playful.</p>
              </div>
            </div>
          </Reveal>
          <Reveal as="div" className="teacher" tabIndex={0}>
            <div className="flip">
              <div className="front">
                <div className="avatar">👨‍🏫</div>
                <h4>Mr. Aria</h4>
                <p>6 years experience • Makers &amp; Achievers</p>
              </div>
              <div className="back">
                <p>6 years online. Project-based learning and A2–B2 exam prep.</p>
              </div>
            </div>
          </Reveal>
        </div>
        <p className="note">{t("teach_note")}</p>
      </div>
    </section>
  );
}
