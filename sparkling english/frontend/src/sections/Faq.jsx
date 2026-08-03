import Reveal from "../components/Reveal.jsx";
import { useI18n } from "../i18n/I18nContext.jsx";

const ITEMS = [
  { qKey: "f1_q", aKey: "f1_a" },
  { qKey: "f2_q", aKey: "f2_a" },
  { qKey: "f3_q", aKey: "f3_a" },
];

export default function Faq() {
  const { t } = useI18n();
  return (
    <section id="faq" className="section section-alt">
      <div className="container">
        <Reveal as="h2">{t("faq_title")}</Reveal>
        {ITEMS.map((item) => (
          <Reveal as="details" className="faq-item" key={item.qKey}>
            <summary>{t(item.qKey)}</summary>
            <p>{t(item.aKey)}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
