"use client";

import React, { useState, useEffect, useRef } from "react";
import { Smartphone, ArrowRight } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import gsap from "gsap";
import axios from "axios";
import { sweet_request } from "./alerts/SweetAlertPop";
import { empty } from "@/utils/util";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";

type OTPArray = string[];

type Props = {
  hash_key: string;
  phone: string;
  phone_mask: string;
};

export default function VerifyPhone({ hash_key, phone, phone_mask }: Props) {
  const { t } = useTranslation();
  const [otp, setOtp] = useState<OTPArray>(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState<number>(180);
  const [isTimerActive, setIsTimerActive] = useState<boolean>(true);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".verify-card",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
      );

      gsap.fromTo(
        ".icon-container",
        { scale: 0, rotation: -45, opacity: 0 },
        {
          scale: 1,
          rotation: 0,
          opacity: 1,
          duration: 0.6,
          delay: 0.2,
          ease: "back.out(1.7)",
        }
      );

      gsap.fromTo(
        ".otp-input",
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.05,
          delay: 0.4,
          ease: "power2.out",
        }
      );

      gsap.to(".bg-glow", {
        scale: 1.2,
        opacity: 0.8,
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsTimerActive(false);
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerActive, timeLeft]);

  const handleResend = () => {
    if (empty(phone)) {
      return toast.error(t("Phone number is required"), {
        position: "top-center",
      });
    } else if (empty(hash_key)) {
      return toast.error(t("Hash key is required"), {
        position: "top-center",
      });
    }
    sweet_request(
      { title: t("Sending..."), text: t("Please wait") },
      async () => {
        const response = await axios.post(
          "/api/auth/resend-otp",
          { phone, hash_key },
          {
            timeout: 10_000,
            headers: { "Content-Type": "application/json" },
          }
        );
        const data = response.data;
        if (data.code === 200) {
          toast.success(data.message, {
            position: "top-center",
          });
          setTimeLeft(300);
          setIsTimerActive(true);
          gsap.fromTo(
            "#timer-text",
            { x: -5 },
            { x: 0, duration: 0.1, repeat: 3, yoyo: true }
          );
        } else {
          toast.error(data.message, {
            position: "top-center",
          });
        }
      },
      (err) => {
        toast.error(err.response.data.message, {
          position: "top-center",
        });
      }
    );
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const value = e.target.value;
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6).split("");
    const newOtp = [...otp];
    pastedData.forEach((char, i) => {
      if (i < 6 && !isNaN(Number(char))) newOtp[i] = char;
    });
    setOtp(newOtp);
    const nextIndex = pastedData.length < 6 ? pastedData.length : 5;
    inputRefs.current[nextIndex]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const firstEmptyIndex = otp.findIndex((digit) => digit.trim() === "");
    const code = otp.join("");
    if (empty(phone)) {
      return toast.error(t("Phone number is required"), {
        position: "top-center",
      });
    } else if (empty(hash_key)) {
      return toast.error(t("Hash key is required"), {
        position: "top-center",
      });
    }
    if (firstEmptyIndex === -1) {
      gsap.to(".verify-btn", {
        scale: 0.95,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
      });
      sweet_request(
        { title: t("Sending..."), text: t("Please wait") },
        async () => {
          const response = await axios.post(
            "/api/auth/verify-otp",
            { phone, code, hash_key },
            {
              timeout: 10_000,
              headers: { "Content-Type": "application/json" },
            }
          );
          const data = response.data;
          if (data.code === 200) {
            toast.success(data.message, {
              position: "top-center",
            });
            router.push("/dashboard");
          } else {
            toast.error(data.message, {
              position: "top-center",
            });
          }
        },
        (err) => {
          toast.error(err.response.data.message, {
            position: "top-center",
          });
        }
      );
    } else {
      gsap.to(".otp-container", {
        x: 10,
        duration: 0.1,
        repeat: 5,
        yoyo: true,
      });
      toast.error("Please enter the full 6-digit code.", {
        position: "top-center",
      });
      inputRefs.current[firstEmptyIndex]?.focus();
    }
  };

  return (
    <div
      ref={containerRef}
      className="bg-gray-50 text-gray-900 dark:bg-slate-900 dark:text-gray-100 transition-colors duration-300 min-h-screen flex items-center justify-center relative overflow-hidden font-sans">
      <Toaster />
      <div className="bg-glow absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#6366f1]/20 dark:bg-[#6366f1]/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
      <div className="verify-card w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8 mx-4 border border-gray-100 dark:border-slate-700 relative z-10 opacity-0">
        <div className="flex justify-center mb-6">
          <div className="icon-container w-16 h-16 bg-[#6366f1]/10 rounded-full flex items-center justify-center text-[#6366f1] opacity-0">
            <Smartphone className="w-8 h-8" />
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">{t("Verify your phone")}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            We've sent a 6-digit code to <br />
            <span className="font-semibold text-gray-800 dark:text-gray-200">
              {phone_mask}
            </span>
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="otp-container flex justify-between gap-2 mb-6">
            {otp.map((data, index) => (
              <input
                key={index}
                className="otp-input w-12 h-14 text-center text-2xl font-bold rounded-xl border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all duration-300 focus:border-[#6366f1] focus:ring-4 focus:ring-[#6366f1]/20 focus:shadow-[0_0_15px_rgba(99,102,241,0.5)] caret-[#6366f1] text-[#6366f1] opacity-0"
                type="text"
                maxLength={1}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                value={data}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onPaste={index === 0 ? handlePaste : undefined}
              />
            ))}
          </div>

          <div className="flex items-center justify-between text-sm mb-8">
            <span className="text-gray-500 dark:text-gray-400">
              Don't receive code?
            </span>
            <button
              type="button"
              id="timer-text"
              onClick={handleResend}
              disabled={isTimerActive}
              className={`font-medium transition-colors ${
                isTimerActive
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-[#6366f1] hover:text-indigo-600 cursor-pointer"
              }`}>
              {isTimerActive
                ? `${t("Resend")} ${formatTime(timeLeft)}`
                : t("Resend Code")}
            </button>
          </div>

          <button
            type="submit"
            className="verify-btn w-full cursor-pointer bg-[#6366f1] hover:bg-indigo-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-500/40 hover:shadow-indigo-500/60 transition-all duration-300 flex items-center justify-center gap-2">
            <span>Verify Account</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
