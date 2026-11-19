import Reveal from "../components/Reveal";
import { useI18n } from "../i18n/I18nContext";
import type { CopyKey } from "../i18n/copy";

const TEACHERS: { avatar: string; name: string; exp: CopyKey; back: CopyKey }[] = [
  { avatar: "👩‍🏫", name: "Ms. Tina", exp: "teach1_exp", back: "teach1_back" },
  { avatar: "👨‍🏫", name: "Mr. Aria", exp: "teach2_exp", back: "teach2_back" },
];

export default function Teachers() {
  const { t } = useI18n();
  return (
    <section id="teachers" className="section section-alt">
      <div className="container">
        <Reveal as="h2">{t("teach_title")}</Reveal>
        <div className="teachers">
          {TEACHERS.map((x) => (
            <Reveal className="teacher" tabIndex={0} key={x.name}>
              <div className="flip">
                <div className="front">
                  <div className="avatar" aria-hidden="true">{x.avatar}</div>
                  <h4>{x.name}</h4>
                  <p>{t(x.exp)}</p>
                </div>
                <div className="back"><p>{t(x.back)}</p></div>
              </div>
            </Reveal>
          ))}
        </div>
        <p className="note">{t("teach_note")}</p>
      </div>
    </section>
  );
}
