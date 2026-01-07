const i18nConfig = {
  locales: ['kh', 'en'] as const,
  defaultLocale: 'kh' as const
};

export type AppLocale = (typeof i18nConfig.locales)[number];

export default i18nConfig;
