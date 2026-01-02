import { Resource, TFunction, createInstance, i18n } from "i18next";
import i18nConfig, { AppLocale } from "./i18nConfig";
import enTranslations from "@/locales/en/translations.json";
import khTranslations from "@/locales/kh/translations.json";

const defaultResources: Resource = {
  en: { translations: enTranslations },
  kh: { translations: khTranslations }
};

type InitTranslationsResult = {
  i18n: i18n;
  resources: Resource;
  t: TFunction;
  locale: AppLocale;
};

export default async function initClientTranslations(
  locale: AppLocale,
  namespaces: string[] = ["translations"],
  i18nInstance?: i18n,
  resources: Resource = defaultResources
): Promise<InitTranslationsResult> {
  const activeLocale = locale ?? i18nConfig.defaultLocale;
  const instance = i18nInstance || createInstance();

  if (!instance.isInitialized) {
    await instance.init({
      lng: activeLocale,
      resources,
      fallbackLng: i18nConfig.defaultLocale,
      supportedLngs: [...i18nConfig.locales],
      defaultNS: namespaces[0],
      fallbackNS: namespaces[0],
      ns: namespaces,
      interpolation: { escapeValue: false }
    });
  } else {
    await instance.changeLanguage(activeLocale);
  }

  return {
    i18n: instance,
    resources: instance.services.resourceStore.data,
    t: instance.t.bind(instance),
    locale: activeLocale
  };
}
