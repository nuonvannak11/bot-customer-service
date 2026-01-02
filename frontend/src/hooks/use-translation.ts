"use client";

import { useTranslation as useTranslationOrg } from "react-i18next";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import i18nConfig from "../../../i18nConfig";
import { AppLocale } from "../../../i18nConfig";

export function useTranslation() {
  const { i18n, t } = useTranslationOrg();
  const router = useRouter();
  const pathname = usePathname();

  const changeLanguage = (locale: AppLocale) => {
    i18n.changeLanguage(locale);
    Cookies.set("NEXT_LOCALE", locale, {
      expires: 365,
      path: "/",
    });
    router.push(pathname);
  };

  return {
    t,
    locale: i18n.language as AppLocale,
    changeLanguage,
  };
}
