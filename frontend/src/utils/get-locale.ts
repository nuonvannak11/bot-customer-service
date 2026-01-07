import { cookies } from "next/headers";
import i18nConfig, { AppLocale } from "../../i18nConfig";
import isSupportedLocale from "./supported-locale";

export async function getLocale(): Promise<AppLocale> {
  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value;

  if (locale && isSupportedLocale(locale)) {
    return locale;
  }

  return i18nConfig.defaultLocale;
}
