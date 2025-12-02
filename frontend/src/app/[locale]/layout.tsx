import { notFound } from "next/navigation";
import i18nConfig, { AppLocale } from "../../../i18nConfig";

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

const isSupportedLocale = (locale: string): locale is AppLocale =>
  i18nConfig.locales.includes(locale as AppLocale);

export const dynamicParams = false;

export function generateStaticParams() {
  return i18nConfig.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({ children, params }: LayoutProps) {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    notFound();
  }

  return <>{children}</>;
}
