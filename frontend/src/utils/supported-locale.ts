import i18nConfig, { AppLocale } from "../../i18nConfig";

const isSupportedLocale = (locale: string): locale is AppLocale => {
  return i18nConfig.locales.includes(locale as AppLocale);
};

export default isSupportedLocale;
