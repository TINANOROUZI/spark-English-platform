import Reveal from "../components/Reveal.jsx";
import { useI18n } from "../i18n/I18nContext.jsx";

const TRACKS = [
  { titleKey: "a1_title", textKey: "a1_text" },
  { titleKey: "a2_title", textKey: "a2_text" },
  { titleKey: "a3_title", textKey: "a3_text" },
  { titleKey: "a4_title", textKey: "a4_text" },
];

export default function Ages() {
  const { t } = useI18n();
  return (
    <section id="ages" className="section">
      <div className="container">
        <Reveal as="h2">{t("ages_title")}</Reveal>
        <div className="tracks">
          {TRACKS.map((track) => (
            <Reveal as="div" className="track-card" key={track.titleKey}>
              <h3>{t(track.titleKey)}</h3>
              <p>{t(track.textKey)}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
