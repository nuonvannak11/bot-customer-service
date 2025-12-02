"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useTranslation } from "react-i18next";

const LoginRegister = () => {
  const { t } = useTranslation();
  const [formType, setFormType] = useState<"login" | "register">("login");

  const handleGoogleLogin = () => {
    signIn("google");
  };

  return (
    <div className="w-full max-w-xl mx-auto">
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

          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1 text-sm font-semibold">
            <button
              id="login-tab"
              className={`flex-1 rounded-full px-4 py-2 transition-all duration-200 cursor-pointer ${
                formType === "login"
                  ? "bg-white text-slate-900 shadow-lg"
                  : "text-slate-200 hover:text-white"
              }`}
              onClick={() => setFormType("login")}
            >
              {t("login")}
            </button>
            <button
              id="register-tab"
              className={`flex-1 rounded-full px-4 py-2 transition-all duration-200 cursor-pointer ${
                formType === "register"
                  ? "bg-white text-slate-900 shadow-lg"
                  : "text-slate-200 hover:text-white"
              }`}
              onClick={() => setFormType("register")}
            >
              {t("register")}
            </button>
          </div>

          {formType === "login" && (
            <form id="login-form" className="space-y-5">
              <div className="space-y-2">
                <label
                  htmlFor="login-email"
                  className="block text-sm font-medium text-slate-200"
                >
                  {t("email_address")}
                </label>
                <input
                  type="email"
                  id="login-email"
                  name="email"
                  required
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="login-password"
                  className="block text-sm font-medium text-slate-200"
                >
                  {t("password")}
                </label>
                <input
                  type="password"
                  id="login-password"
                  name="password"
                  required
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-linear-to-r from-indigo-500 via-purple-500 to-cyan-400 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-900/40 transition hover:brightness-110 cursor-pointer"
              >
                {t("log_in")}
              </button>
            </form>
          )}

          {formType === "register" && (
            <form id="register-form" className="space-y-5">
              <div className="space-y-2">
                <label
                  htmlFor="register-name"
                  className="block text-sm font-medium text-slate-200"
                >
                  {t("full_name")}
                </label>
                <input
                  type="text"
                  id="register-name"
                  name="name"
                  required
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="register-email"
                  className="block text-sm font-medium text-slate-200"
                >
                  {t("email_address")}
                </label>
                <input
                  type="email"
                  id="register-email"
                  name="email"
                  required
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="register-password"
                  className="block text-sm font-medium text-slate-200"
                >
                  {t("password")}
                </label>
                <input
                  type="password"
                  id="register-password"
                  name="password"
                  required
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-linear-to-r from-emerald-400 via-teal-400 to-cyan-400 px-4 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-emerald-900/30 transition hover:brightness-110 cursor-pointer"
              >
                {t("register_account")}
              </button>
            </form>
          )}

          <div className="space-y-3 pt-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-300">
              <span className="h-px flex-1 bg-linear-to-r from-transparent via-white/25 to-transparent" />
              <span>{t("or_continue")}</span>
              <span className="h-px flex-1 bg-linear-to-r from-transparent via-white/25 to-transparent" />
            </div>
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:border-white/40 cursor-pointer"
            >
              <span className="absolute inset-0 bg-white/5 opacity-0 transition duration-200 group-hover:opacity-100" />
              <span className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-white">
                <span className="text-base font-semibold text-slate-900">G</span>
              </span>
              <span className="relative">{t("google_login")}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginRegister;
