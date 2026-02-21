"use client";

import { useState, useRef, FormEvent } from "react";
import { useTranslation } from "react-i18next";
import GoogleLoginButton from "@/components/GoogleLoginButton";
import Script from "next/script";
import { empty, capitalize } from "@/utils/util";
import axios from "axios";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { sweet_request, showAlert } from "./alerts/SweetAlertPop";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import SettingsInput from "./SettingsInput";
import { Phone, ShieldCheck, User } from "lucide-react";

type Props = {
  hash_data: string;
};

type LoginFormData = {
  phone: string;
  password: string;
  hash_key: string;
};

type RegisterFormData = {
  username: string;
  phone: string;
  password: string;
  hash_key: string;
};

type AuthFormData = LoginFormData | RegisterFormData;

const LoginRegister = ({ hash_data }: Props) => {
  const { t } = useTranslation();
  const [formType, setFormType] = useState<"login" | "register">("login");
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const container = useRef<HTMLDivElement>(null);
  const gliderRef = useRef<HTMLDivElement>(null);
  const loginButtonRef = useRef<HTMLButtonElement>(null);
  const registerButtonRef = useRef<HTMLButtonElement>(null);
  const loginFormRef = useRef<HTMLFormElement>(null);
  const registerFormRef = useRef<HTMLFormElement>(null);

  useGSAP(
    () => {
      gsap.set(registerFormRef.current, { autoAlpha: 0, y: 20, scale: 0.98 });
      gsap.set(loginFormRef.current, { autoAlpha: 1, y: 0, scale: 1 });
      if (loginButtonRef.current) {
        gsap.set(gliderRef.current, {
          x: loginButtonRef.current.offsetLeft,
          width: loginButtonRef.current.offsetWidth,
        });
      }
    },
    { scope: container },
  );

  useGSAP(
    () => {
      const tl = gsap.timeline();
      const loginBtn = loginButtonRef.current;
      const registerBtn = registerButtonRef.current;
      const loginForm = loginFormRef.current;
      const registerForm = registerFormRef.current;

      if (
        !loginBtn ||
        !registerBtn ||
        !loginForm ||
        !registerForm ||
        !gliderRef.current
      )
        return;

      if (formType === "login") {
        tl.to(gliderRef.current, {
          x: loginBtn.offsetLeft,
          width: loginBtn.offsetWidth,
          duration: 0.4,
          ease: "power3.inOut",
        });
        tl.to(
          registerForm,
          {
            autoAlpha: 0,
            y: 20,
            scale: 0.98,
            duration: 0.3,
            ease: "power3.in",
          },
          0,
        );
        tl.to(
          loginForm,
          { autoAlpha: 1, y: 0, scale: 1, duration: 0.3, ease: "power3.out" },
          ">-0.1",
        );
      } else {
        tl.to(gliderRef.current, {
          x: registerBtn.offsetLeft,
          width: registerBtn.offsetWidth,
          duration: 0.4,
          ease: "power3.inOut",
        });
        tl.to(
          loginForm,
          {
            autoAlpha: 0,
            y: 20,
            scale: 0.98,
            duration: 0.3,
            ease: "power3.in",
          },
          0,
        );
        tl.to(
          registerForm,
          { autoAlpha: 1, y: 0, scale: 1, duration: 0.3, ease: "power3.out" },
          ">-0.1",
        );
      }
    },
    { dependencies: [formType], scope: container },
  );

  const handleValid = (form: HTMLFormElement): AuthFormData | null => {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData) as Record<string, string>;

    const isRegister = form.id === "register-form";
    const requiredFields = isRegister
      ? ["username", "phone", "password"]
      : ["phone", "password"];

    const missing = requiredFields.filter((name) => empty(data[name]));

    if (missing.length) {
      const firstField = missing[0];
      const input = form.querySelector(
        `[name="${firstField}"]`,
      ) as HTMLInputElement | null;

      input?.focus();

      showAlert({
        title: t("Error"),
        text: `${t(capitalize(firstField))} ${t("is required")}`,
        icon: "error",
      });
      return null;
    }
    return data as AuthFormData;
  };

  const handleErorr = (err: unknown) => {
    let message = "Something went wrong";
    if (axios.isAxiosError(err)) {
      message = err.response?.data?.message ?? err.message;
    } else if (err instanceof Error) {
      message = err.message;
    }
    toast.error(message, { position: "top-center" });
  };

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = handleValid(form);
    if (!formData) return;

    sweet_request(
      { title: t("Sending..."), text: t("Please wait") },
      async () => {
        const result = await axios.post(
          "/api/auth/login",
          formData as LoginFormData,
          {
            timeout: 10000,
            headers: { "Content-Type": "application/json" },
          },
        );
        const apiData = result.data;
        if (apiData.code === 200) {
          router.push("/dashboard");
        } else {
          toast.error(apiData.message ?? "Something went wrong", {
            position: "top-center",
          });
        }
      },
      (err: unknown) => {
        handleErorr(err);
      },
    );
  };

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = handleValid(form);
    if (!formData) return;

    sweet_request(
      { title: t("Sending..."), text: t("Please wait") },
      async () => {
        const result = await axios.post("/api/auth/register", formData, {
          timeout: 10000,
          headers: { "Content-Type": "application/json" },
        });
        const apiData = result.data;
        if (apiData.code === 200) {
          router.push(
            `/login/verify?phone=${(formData as RegisterFormData).phone}`,
          );
        } else {
          toast.error(apiData.message ?? "Something went wrong", {
            position: "top-center",
          });
        }
      },
      (err: unknown) => {
        handleErorr(err);
      },
    );
  };

  return (
    <div className="w-full max-w-xl mx-auto" ref={container}>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => {
          setReady(true);
        }}
      />
      <div className="relative overflow-hidden rounded-[28px]">
        <div
          className="pointer-events-none absolute inset-0 rounded-[28px] bg-linear-to-r from-indigo-500 via-purple-500 to-cyan-400 opacity-60 blur-2xl"
          aria-hidden
        />
        <div className="relative space-y-8 rounded-[28px] border border-white/10 bg-slate-900/75 p-8 backdrop-blur-xl shadow-[0_25px_80px_-40px_rgba(0,0,0,0.9)]">
          <div className="space-y-2 text-center">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center text-indigo-200">
              🔒
            </div>
            <h1 className="text-3xl font-semibold text-white tracking-tight">
              {t("welcome_back")}
            </h1>
            <p className="text-sm text-slate-300">{t("auth_tagline")}</p>
          </div>

          <div className="relative flex items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1 text-sm font-semibold">
            <div
              ref={gliderRef}
              className="absolute top-1 left-0 w-1/2 h-[calc(100%-8px)] rounded-full bg-white shadow-lg"
            />
            <button
              ref={loginButtonRef}
              id="login-tab"
              className={`relative z-10 flex-1 rounded-full px-4 py-2 transition-colors duration-300 cursor-pointer ${
                formType === "login"
                  ? "text-slate-900"
                  : "text-slate-200 hover:text-white"
              }`}
              onClick={() => setFormType("login")}
            >
              {t("login")}
            </button>
            <button
              ref={registerButtonRef}
              id="register-tab"
              className={`relative z-10 flex-1 rounded-full px-4 py-2 transition-colors duration-300 cursor-pointer ${
                formType === "register"
                  ? "text-slate-900"
                  : "text-slate-200 hover:text-white"
              }`}
              onClick={() => setFormType("register")}
            >
              {t("register")}
            </button>
          </div>

          <div className="relative h-[360px]">
            <form
              id="login-form"
              className="space-y-5 absolute top-0 left-0 w-full"
              ref={loginFormRef}
              onSubmit={handleLogin}
            >
              <SettingsInput
                id="login-phone"
                label={t("Phone number")}
                type="text"
                name="phone"
                icon={Phone}
                placeholder="0123456789"
                customStyle="w-full rounded-3xl border border-white/10 bg-white/5 px-2 py-2.5 text-white placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
              />
              <SettingsInput
                id="login-password"
                label={t("Password")}
                type="password"
                name="password"
                icon={ShieldCheck}
                placeholder="56xbvf@2345678"
                customStyle="w-full rounded-3xl border border-white/10 bg-white/5 px-2 py-2.5 text-white placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                autoComplete="current-password"
              />
              <button
                type="submit"
                className="w-full rounded-2xl bg-linear-to-r from-indigo-500 via-purple-500 to-cyan-400 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-900/40 transition hover:brightness-110 cursor-pointer"
              >
                {t("log_in")}
              </button>
              <input type="hidden" value={hash_data} name="hash_key" />
            </form>

            <form
              onSubmit={handleRegister}
              id="register-form"
              className="space-y-5 absolute top-0 left-0 w-full"
              style={{
                opacity: 0,
                visibility: "hidden",
                transform: "translateY(20px) scale(0.98)",
              }}
              ref={registerFormRef}
            >
              <SettingsInput
                id="register-name"
                label={t("Username")}
                type="text"
                name="username"
                icon={User}
                placeholder="Jonh ny"
                customStyle="w-full rounded-3xl border border-white/10 bg-white/5 px-2 py-2.5 text-white placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
              />
              <SettingsInput
                id="register-phone"
                label={t("Phone number")}
                type="text"
                name="phone"
                icon={Phone}
                placeholder="0123456789"
                customStyle="w-full rounded-3xl border border-white/10 bg-white/5 px-2 py-2.5 text-white placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
              />
              <SettingsInput
                id="register-password"
                label={t("Password")}
                type="password"
                name="password"
                icon={ShieldCheck}
                placeholder="56xbvf@2345678"
                autoComplete="current-password"
                customStyle="w-full rounded-3xl border border-white/10 bg-white/5 px-2 py-2.5 text-white placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
              />
              <button
                type="submit"
                className="w-full rounded-2xl bg-linear-to-r from-emerald-400 via-teal-400 to-cyan-400 px-4 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-emerald-900/30 transition hover:brightness-110 cursor-pointer"
              >
                {t("Register account")}
              </button>
              <input type="hidden" value={hash_data} name="hash_key" />
            </form>
          </div>

          <div className="space-y-3 pt-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-300">
              <span className="h-px flex-1 bg-linear-to-r from-transparent via-white/25 to-transparent" />
              <span>{t("or_continue")}</span>
              <span className="h-px flex-1 bg-linear-to-r from-transparent via-white/25 to-transparent" />
            </div>
            <GoogleLoginButton ready={ready} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginRegister;
