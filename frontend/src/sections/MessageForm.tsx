import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Field from "../components/Field";
import Reveal from "../components/Reveal";
import { useSubmitMessage } from "../api/hooks";
import { useAuth } from "../context/AuthContext";
import { errorMessage, useI18n } from "../i18n/I18nContext";
import type { CopyKey } from "../i18n/copy";
import { fireConfetti } from "../lib/confetti";

const schema = z.object({
  name: z.string().trim().min(1, "err_required").max(100),
  email: z.email("err_email"),
  message: z.string().trim().min(1, "err_required").max(4000),
});
type Values = z.infer<typeof schema>;

export default function MessageForm() {
  const { t } = useI18n();
  const { auth } = useAuth();
  const submit = useSubmitMessage(auth?.token);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(schema) });
  const tr = (m?: string) => (m ? t(m as CopyKey) : undefined);

  const onSubmit = handleSubmit(async (v) => {
    setResult(null);
    try {
      await submit.mutateAsync(v);
      setResult({ ok: true, text: t("msg_ok_back") });
      reset({ name: "", email: "", message: "" });
      fireConfetti();
    } catch (err) {
      setResult({ ok: false, text: errorMessage(err, t) });
    }
  });

  return (
    <section id="message" className="section">
      <div className="container">
        <Reveal as="h2">{t("msg_title")}</Reveal>
        <Reveal as="p" className="section-lead">{t("msg_sub")}</Reveal>
        <form className="form" onSubmit={onSubmit} noValidate>
          <div className="row">
            <Field label={t("msg_name")} error={tr(errors.name?.message)}><input type="text" autoComplete="name" {...register("name")} /></Field>
            <Field label={t("msg_email")} error={tr(errors.email?.message)}><input type="email" autoComplete="email" {...register("email")} /></Field>
          </div>
          <Field className="full" label={t("msg_message")} error={tr(errors.message?.message)}><textarea rows={5} {...register("message")} /></Field>
          <button className="btn big" type="submit" disabled={isSubmitting}>{isSubmitting ? t("msg_sending") : t("msg_send")}</button>
        </form>
        <p className={`form-result ${result && !result.ok ? "error" : ""}`} role="status" aria-live="polite">{result?.text}</p>
      </div>
    </section>
  );
}
