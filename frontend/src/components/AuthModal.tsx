import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../context/AuthContext";
import { errorMessage, useI18n } from "../i18n/I18nContext";
import type { CopyKey } from "../i18n/copy";
import { fireConfetti } from "../lib/confetti";
import Field from "./Field";

const loginSchema = z.object({ email: z.email("err_email"), password: z.string().min(1, "err_required") });
const registerSchema = z.object({
  name: z.string().trim().min(1, "err_required").max(100),
  email: z.email("err_email"),
  password: z.string().min(8, "err_pw_min").regex(/[A-Za-z]/, "err_pw_mix").regex(/[0-9]/, "err_pw_mix"),
});
type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

export default function AuthModal({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  const { login, register } = useAuth();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [serverError, setServerError] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);

  const loginForm = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });
  const regForm = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) });
  const tr = (m?: string) => (m ? t(m as CopyKey) : undefined);

  // Escape to close, lock body scroll, focus first field, restore focus on close.
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    document.body.classList.add("no-scroll");
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && dialogRef.current) {
        const f = dialogRef.current.querySelectorAll<HTMLElement>("button, input, [href]");
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("keydown", onKey); document.body.classList.remove("no-scroll"); previous?.focus(); };
  }, [onClose]);

  useEffect(() => { dialogRef.current?.querySelector<HTMLInputElement>("input")?.focus(); setServerError(""); }, [tab]);

  const finish = () => { onClose(); fireConfetti(); };
  const onLogin = loginForm.handleSubmit(async (v) => {
    setServerError("");
    try { await login(v.email, v.password); finish(); } catch (e) { setServerError(errorMessage(e, t)); }
  });
  const onRegister = regForm.handleSubmit(async (v) => {
    setServerError("");
    try { await register(v.name, v.email, v.password); finish(); } catch (e) { setServerError(errorMessage(e, t)); }
  });

  return (
    <div className="modal open">
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal-card" role="dialog" aria-modal="true" aria-label={tab === "login" ? t("login") : t("signup")} ref={dialogRef}>
        <button className="modal-close" onClick={onClose} aria-label={t("auth_close")}>&times;</button>
        <div className="modal-tabs" role="tablist">
          <button type="button" role="tab" aria-selected={tab === "login"} className={`modal-tab ${tab === "login" ? "active" : ""}`} onClick={() => setTab("login")}>{t("login")}</button>
          <button type="button" role="tab" aria-selected={tab === "register"} className={`modal-tab ${tab === "register" ? "active" : ""}`} onClick={() => setTab("register")}>{t("signup")}</button>
        </div>

        {tab === "login" ? (
          <form className="form" onSubmit={onLogin} noValidate>
            <Field label={t("auth_email")} error={tr(loginForm.formState.errors.email?.message)}>
              <input type="email" autoComplete="email" placeholder="you@email.com" {...loginForm.register("email")} />
            </Field>
            <Field className="full" label={t("auth_password")} error={tr(loginForm.formState.errors.password?.message)}>
              <input type="password" autoComplete="current-password" placeholder="••••••••" {...loginForm.register("password")} />
            </Field>
            <button className="btn big full" type="submit" disabled={loginForm.formState.isSubmitting}>{t("login")}</button>
            <p className="form-result error" role="alert">{serverError}</p>
          </form>
        ) : (
          <form className="form" onSubmit={onRegister} noValidate>
            <Field label={t("auth_name")} error={tr(regForm.formState.errors.name?.message)}>
              <input type="text" autoComplete="name" placeholder="Alex Rossi" {...regForm.register("name")} />
            </Field>
            <Field className="full" label={t("auth_email")} error={tr(regForm.formState.errors.email?.message)}>
              <input type="email" autoComplete="email" placeholder="you@email.com" {...regForm.register("email")} />
            </Field>
            <Field className="full" label={t("auth_password")} error={tr(regForm.formState.errors.password?.message)}>
              <input type="password" autoComplete="new-password" placeholder={t("auth_pw_hint")} {...regForm.register("password")} />
            </Field>
            <button className="btn big full" type="submit" disabled={regForm.formState.isSubmitting}>{t("auth_create")}</button>
            <p className="form-result error" role="alert">{serverError}</p>
          </form>
        )}
      </div>
    </div>
  );
}
