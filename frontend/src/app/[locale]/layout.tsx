import { notFound } from "next/navigation";
import i18nConfig from "../../../i18nConfig";
import isSupportedLocale from "@/utils/supported-locale";

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

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
