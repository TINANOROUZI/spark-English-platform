import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { COPY, type CopyKey, type Lang } from "./copy";

interface I18nValue { lang: Lang; setLang: (l: Lang) => void; t: (key: CopyKey) => string }
const I18nContext = createContext<I18nValue | null>(null);

function initialLang(): Lang {
  try {
    const saved = localStorage.getItem("lang");
    if (saved === "en" || saved === "it") return saved;
  } catch { /* ignore */ }
  return navigator.language?.toLowerCase().startsWith("it") ? "it" : "en";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);
  const setLang = useCallback((l: Lang) => {
    try { localStorage.setItem("lang", l); } catch { /* ignore */ }
    setLangState(l);
  }, []);
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);

  const value = useMemo<I18nValue>(() => ({ lang, setLang, t: (key) => COPY[lang][key] ?? key }), [lang, setLang]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

/** Maps an API/network error to a localized message. */
export function errorMessage(err: unknown, t: (k: CopyKey) => string): string {
  const m = err instanceof Error ? err.message : "";
  if (m === "NETWORK") return t("err_network");
  if (m === "RATE_LIMIT") return t("err_rate");
  if (m === "Invalid email or password.") return t("err_credentials");
  if (m === "An account with this email already exists.") return t("err_exists");
  return m && !m.startsWith("Request failed") ? m : t("err_generic");
}
