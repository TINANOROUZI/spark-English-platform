import Reveal from "../components/Reveal";
import { useI18n } from "../i18n/I18nContext";
import type { CopyKey } from "../i18n/copy";

const TRACKS: { title: CopyKey; text: CopyKey }[] = [
  { title: "a1_title", text: "a1_text" }, { title: "a2_title", text: "a2_text" },
  { title: "a3_title", text: "a3_text" }, { title: "a4_title", text: "a4_text" },
];

export default function Ages() {
  const { t } = useI18n();
  return (
    <section id="ages" className="section">
      <div className="container">
        <Reveal as="h2">{t("ages_title")}</Reveal>
        <div className="tracks">
          {TRACKS.map((x) => (
            <Reveal className="track-card" key={x.title}><h3>{t(x.title)}</h3><p>{t(x.text)}</p></Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
