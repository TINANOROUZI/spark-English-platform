import Reveal from "../components/Reveal";
import { useI18n } from "../i18n/I18nContext";
import type { CopyKey } from "../i18n/copy";

const ITEMS: { icon: string; title: CopyKey; text: CopyKey }[] = [
  { icon: "🎵", title: "act1_t", text: "act1_d" },
  { icon: "🎲", title: "act2_t", text: "act2_d" },
  { icon: "🎭", title: "act3_t", text: "act3_d" },
  { icon: "🎥", title: "act4_t", text: "act4_d" },
];

export default function Activities() {
  const { t } = useI18n();
  return (
    <section id="activities" className="section section-alt">
      <div className="container">
        <Reveal as="h2">{t("act_title")}</Reveal>
        <div className="why-grid">
          {ITEMS.map((i) => (
            <Reveal className="why-item" key={i.title}>
              <div className="why-icon" aria-hidden="true">{i.icon}</div>
              <h4>{t(i.title)}</h4>
              <p>{t(i.text)}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
