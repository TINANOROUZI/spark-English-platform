import Reveal from "../components/Reveal";
import { useI18n } from "../i18n/I18nContext";
import type { CopyKey } from "../i18n/copy";

const ITEMS: { q: CopyKey; a: CopyKey }[] = [
  { q: "f1_q", a: "f1_a" }, { q: "f2_q", a: "f2_a" }, { q: "f3_q", a: "f3_a" },
];

export default function Faq() {
  const { t } = useI18n();
  return (
    <section id="faq" className="section section-alt">
      <div className="container">
        <Reveal as="h2">{t("faq_title")}</Reveal>
        {ITEMS.map((i) => (
          <Reveal as="details" className="faq-item" key={i.q}><summary>{t(i.q)}</summary><p>{t(i.a)}</p></Reveal>
        ))}
      </div>
    </section>
  );
}
