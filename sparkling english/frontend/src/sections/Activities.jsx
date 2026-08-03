import Reveal from "../components/Reveal.jsx";
import { useI18n } from "../i18n/I18nContext.jsx";

const ITEMS = [
  { icon: "🎵", titleKey: "act1_t", textKey: "act1_d" },
  { icon: "🎲", titleKey: "act2_t", textKey: "act2_d" },
  { icon: "🎭", titleKey: "act3_t", textKey: "act3_d" },
  { icon: "🎥", titleKey: "act4_t", textKey: "act4_d" },
];

export default function Activities() {
  const { t } = useI18n();
  return (
    <section id="activities" className="section section-alt">
      <div className="container">
        <Reveal as="h2">{t("act_title")}</Reveal>
        <div className="why-grid">
          {ITEMS.map((item) => (
            <Reveal as="div" className="why-item" key={item.titleKey}>
              <div className="why-icon">{item.icon}</div>
              <h4>{t(item.titleKey)}</h4>
              <p>{t(item.textKey)}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
