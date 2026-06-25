import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "../locales/en/translation.json";
import ar from "../locales/ar/translation.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: en,
      },
      ar: {
        translation: ar,
      },
    },

    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });

const setDocumentDirection = (lng) => {
  const language = lng?.startsWith("ar") ? "ar" : "en";
  document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  document.documentElement.lang = language;
};

i18n.on("languageChanged", setDocumentDirection);
setDocumentDirection(i18n.language);

export default i18n;