import { useState } from "react";
import Reveal from "../components/Reveal.jsx";
import { useI18n } from "../i18n/I18nContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { trialRequestApi } from "../api/client.js";
import { fireConfetti } from "../hooks/useConfetti.js";
import { OWNER } from "../constants.js";

const EMPTY_FORM = { name: "", email: "", age: "", time: "Afternoon", msg: "" };

export default function Contact() {
  const { t } = useI18n();
  const { auth } = useAuth();
  const [form, setForm] = useState(EMPTY_FORM);
  const [result, setResult] = useState("");

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setResult("");
    try {
      await trialRequestApi.submit({
        parentName: form.name,
        email: form.email,
        childAge: Number(form.age) || null,
        preferredTime: form.time,
        notes: form.msg,
      }, auth?.token);
      setResult(t("form_ok"));
      setForm(EMPTY_FORM);
      fireConfetti();
    } catch (err) {
      setResult(err.message || "Error. Please try again.");
    }
  }

  return (
    <section id="contact" className="section section-cta">
      <Reveal className="container">
        <h2>{t("contact_title")}</h2>
        <p className="section-lead">{t("contact_sub")}</p>
        <form className="form" onSubmit={handleSubmit}>
          <div className="row">
            <label><span>{t("form_name")}</span>
              <input type="text" required placeholder="Alex Rossi" value={form.name} onChange={(e) => update("name", e.target.value)} />
            </label>
            <label><span>{t("form_email")}</span>
              <input type="email" required placeholder="alex@email.com" value={form.email} onChange={(e) => update("email", e.target.value)} />
            </label>
          </div>
          <div className="row">
            <label><span>{t("form_age")}</span>
              <input type="number" min={3} max={18} required placeholder="10" value={form.age} onChange={(e) => update("age", e.target.value)} />
            </label>
            <label><span>{t("form_time")}</span>
              <select value={form.time} onChange={(e) => update("time", e.target.value)}>
                <option value="Afternoon">{t("time_afternoon")}</option>
                <option value="Evening">{t("time_evening")}</option>
                <option value="Weekend">{t("time_weekend")}</option>
              </select>
            </label>
          </div>
          <label className="full"><span>{t("form_msg")}</span>
            <textarea rows={4} placeholder="Anything important…" value={form.msg} onChange={(e) => update("msg", e.target.value)} />
          </label>
          <button className="btn big" type="submit">{t("form_send")}</button>
        </form>
        <p className="form-result" role="status" aria-live="polite">{result}</p>

        <div className="contact-direct">
          <a className="contact-card" href={`mailto:${OWNER.email}`}>
            <span className="icon">✉️</span><span>{OWNER.email}</span>
          </a>
          <a className="contact-card" href={`tel:${OWNER.phoneTel}`}>
            <span className="icon">📞</span><span>{OWNER.phoneDisplay} (Call/WhatsApp)</span>
          </a>
          <a className="contact-card" href={`https://t.me/${OWNER.telegram}`} target="_blank" rel="noopener noreferrer">
            <span className="icon">💬</span><span>@{OWNER.telegram}</span>
          </a>
        </div>
      </Reveal>
    </section>
  );
}
