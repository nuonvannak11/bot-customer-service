import LoginRegister from "@/components/LoginRegister";
import TranslationsProvider from "@/components/TranslationsProvider";
import initTranslations from "../../../i18n";
import { AppLocale } from "../../../i18nConfig";

type PageProps = {
  params: Promise<{ locale: AppLocale }>;
};

const namespaces = ["translations"];

export default async function Home({ params }: PageProps) {
  const { locale } = await params;
  const { resources } = await initTranslations(locale, namespaces);

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="pointer-events-none absolute inset-0 opacity-70 [background:radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.15),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(16,185,129,0.12),transparent_28%),radial-gradient(circle_at_50%_80%,rgba(59,130,246,0.12),transparent_32%)]" />
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12">
        <main className="w-full max-w-4xl">
          <TranslationsProvider
            namespaces={namespaces}
            locale={locale}
            resources={resources}
          >
            <LoginRegister />
          </TranslationsProvider>
        </main>
      </div>
    </div>
  );
}
