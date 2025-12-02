import { redirect } from "next/navigation";
import i18nConfig from "../../i18nConfig";

export default function RootRedirect() {
  redirect(`/${i18nConfig.defaultLocale}`);
}
