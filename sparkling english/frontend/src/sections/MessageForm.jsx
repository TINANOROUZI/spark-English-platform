import { useState } from "react";
import Reveal from "../components/Reveal.jsx";
import { useI18n } from "../i18n/I18nContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { contactMessageApi } from "../api/client.js";
import { fireConfetti } from "../hooks/useConfetti.js";

const EMPTY_FORM = { name: "", email: "", message: "" };

export default function MessageForm() {
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
      await contactMessageApi.submit(form, auth?.token);
      setResult(t("msg_ok_back"));
      setForm(EMPTY_FORM);
      fireConfetti();
    } catch (err) {
      setResult(err.message || "Error. Please try again.");
    }
  }

  return (
    <section id="message" className="section">
      <div className="container">
        <Reveal as="h2">{t("msg_title")}</Reveal>
        <Reveal as="p" className="section-lead">{t("msg_sub")}</Reveal>
        <Reveal as="form" className="form" onSubmit={handleSubmit}>
          <div className="row">
            <label><span>{t("msg_name")}</span>
              <input type="text" required placeholder="Your name" value={form.name} onChange={(e) => update("name", e.target.value)} />
            </label>
            <label><span>{t("msg_email")}</span>
              <input type="email" required placeholder="you@email.com" value={form.email} onChange={(e) => update("email", e.target.value)} />
            </label>
          </div>
          <label className="full"><span>{t("msg_message")}</span>
            <textarea rows={5} required placeholder="Write your message…" value={form.message} onChange={(e) => update("message", e.target.value)} />
          </label>
          <button className="btn big" type="submit">{t("msg_send")}</button>
        </Reveal>
        <p className="form-result" role="status" aria-live="polite">{result}</p>
      </div>
    </section>
  );
}
