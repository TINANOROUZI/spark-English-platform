import { createContext, useContext, useMemo, useState } from "react";
import { COPY } from "./copy.js";

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(() => localStorage.getItem("lang") || "en");

  const setLang = (next) => {
    localStorage.setItem("lang", next);
    setLangState(next);
  };

  const value = useMemo(() => {
    const dict = COPY[lang] || COPY.en;
    const t = (key) => dict[key] ?? key;
    return { lang, setLang, t, dict };
  }, [lang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
