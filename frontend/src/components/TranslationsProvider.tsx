"use client";

import { createInstance, i18n } from "i18next";
import { I18nextProvider } from "react-i18next";
import initClientTranslations from "../../i18n";
import { AppLocale } from "../../i18nConfig";

type TranslationsProviderProps = {
  children: React.ReactNode;
  locale: AppLocale;
  namespaces: string[];
  resources: any;
};

export default function TranslationsProvider({
  children,
  locale,
  namespaces,
  resources,
}: TranslationsProviderProps) {
  const i18n = createInstance();

  initClientTranslations(locale, namespaces, i18n, resources);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
