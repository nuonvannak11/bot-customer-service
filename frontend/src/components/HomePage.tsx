"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Head from "next/head";
import Image from "next/image";
import LanguageDropdown from "./LanguageDropdown";
import {
  Menu,
  X,
  Zap,
  Shield,
  Expand,
  Headphones,
  Layers,
  MessageCircle,
  Server,
  LineChart,
  Bot,
  Gauge,
  Rocket,
  Smartphone,
  Settings,
  Check,
  ChevronDown,
  Code2,
  Database,
  Github,
  Twitter,
  CreditCard,
  Bitcoin,
  ArrowRight,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { UserProfileConfig } from "@/interface";
import { empty } from "@/utils/util";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}
interface OneControlLandingProps {
  data: UserProfileConfig | null;
}
export default function OneControlLanding({ data }: OneControlLandingProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const heroRef = useRef(null);
  const floatRef1 = useRef(null);
  const floatRef2 = useRef(null);
  const codeBlockRef = useRef(null);
  const sectionsRef = useRef<HTMLElement[]>([]);

  const isLoggedIn = !empty(data);
  const addToRefs = (el: HTMLElement | null) => {
    if (el && !sectionsRef.current.includes(el)) {
      sectionsRef.current.push(el);
    }
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".hero-animate", {
        y: 50,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out",
      });

      gsap.to(floatRef1.current, {
        y: -20,
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      gsap.to(floatRef2.current, {
        y: 20,
        duration: 5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 1,
      });

      gsap.to(codeBlockRef.current, {
        y: -15,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      sectionsRef.current.forEach((section) => {
        gsap.fromTo(
          section,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: section,
              start: "top 80%",
            },
          },
        );
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const colors = {
    brand500: "#3b82f6",
    brand600: "#2563eb",
    dark950: "#020617",
    dark900: "#0f172a",
    dark800: "#1e293b",
  };

  const handleScroll = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    e.preventDefault();
    if (href === "#" || href === "/") {
      const current = { y: window.scrollY };
      gsap.to(current, {
        y: 0,
        duration: 1.5,
        ease: "power3.inOut",
        onUpdate: () => window.scrollTo(0, current.y),
      });
      return;
    }
    const targetId = href.replace("#", "");
    const elem = document.getElementById(targetId);
    if (elem) {
      const targetTop = elem.getBoundingClientRect().top + window.scrollY - 85;
      const current = { y: window.scrollY };
      gsap.to(current, {
        y: targetTop,
        duration: 1.2,
        ease: "power3.inOut",
        onUpdate: () => window.scrollTo(0, current.y),
      });
    }
  };
  return (
    <div
      className={`min-h-screen bg-[${colors.dark950}] text-slate-300 font-sans selection:bg-[${colors.brand500}] selection:text-white overflow-x-hidden scroll-smooth`}>
      <Head>
        <title>OneControl | Enterprise Web & Telegram Solutions</title>
      </Head>
      {/* --- Navbar --- */}
      <nav
        className={`fixed w-full z-50 top-0 start-0 border-b border-white/5 bg-[${colors.dark950}]/80 backdrop-blur-lg`}>
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between p-4">
          {/* Logo */}
          <a
            href="#"
            className="flex items-center space-x-2 rtl:space-x-reverse group">
            <div
              className={`w-10 h-10 rounded-xl bg-linear-to-br from-[${colors.brand600}] to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/50 transition-all duration-300`}>
              <Code2 className="text-white w-5 h-5" />
            </div>
            <span className="self-center text-2xl font-bold whitespace-nowrap text-white tracking-tight">
              One<span className={`text-[${colors.brand500}]`}>Control</span>
            </span>
          </a>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-400 rounded-lg md:hidden hover:bg-white/5 focus:outline-none">
            <span className="sr-only">Open main menu</span>
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>

          {/* Auth Section */}
          <div className="flex md:order-2 space-x-3 md:space-x-4 items-center">
            <LanguageDropdown />
            {!isLoggedIn ? (
              <div className="flex items-center gap-4">
                <Link
                  href="/login"
                  className="hidden sm:block text-slate-300 hover:text-white font-medium transition-colors text-sm">
                  Log In
                </Link>
                <button
                  className={`text-white bg-[${colors.brand600}] hover:bg-[${colors.brand500}] focus:ring-4 focus:ring-blue-500/30 font-medium rounded-lg text-sm px-5 py-2.5 transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40`}>
                  Get Started
                </button>
              </div>
            ) : (
              <Link
                href="/dashboard"
                className="flex items-center gap-3 group cursor-pointer">
                <div className="hidden sm:flex flex-col items-end text-right transition-opacity opacity-90 group-hover:opacity-100">
                  <p className="text-sm font-semibold text-white leading-tight">
                    {data?.fullName || "Guest User"}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                      PTS
                    </span>
                    <span className="text-xs font-bold text-blue-400">
                      {data?.points || 0}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className="cursor-pointer relative shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 rounded-full transition-transform active:scale-95">
                  <Image
                    src={data?.avatar || "/img/default_avatar.png"}
                    className="w-10 h-10 rounded-full object-cover border-2 border-slate-700 group-hover:border-slate-500 transition-colors bg-slate-800"
                    alt={data?.fullName || "User Avatar"}
                  />
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-slate-900 rounded-full"></span>
                </button>
              </Link>
            )}
          </div>

          {/* Desktop Menu */}
          <div
            className={`${
              isMenuOpen ? "block" : "hidden"
            } items-center justify-between w-full md:flex md:w-auto md:order-1`}>
            <ul className="flex flex-col p-4 md:p-0 mt-4 font-medium border border-white/10 rounded-lg bg-white/5 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-transparent text-sm">
              {/* Home Link */}
              <li>
                <a
                  href="#"
                  onClick={(e) => handleScroll(e, "#")}
                  className={`block py-2 px-3 text-white bg-[${colors.brand600}] rounded md:bg-transparent md:text-[${colors.brand500}] md:p-0 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)] cursor-pointer`}>
                  Home
                </a>
              </li>

              {/* Services Link */}
              <li>
                <a
                  href="#services"
                  onClick={(e) => handleScroll(e, "#services")}
                  className="block py-2 px-3 text-slate-400 rounded hover:text-white md:p-0 transition-colors cursor-pointer">
                  Services
                </a>
              </li>

              {/* Process Link */}
              <li>
                <a
                  href="#process"
                  onClick={(e) => handleScroll(e, "#process")}
                  className="block py-2 px-3 text-slate-400 rounded hover:text-white md:p-0 transition-colors cursor-pointer">
                  Process
                </a>
              </li>

              {/* Pricing Link */}
              <li>
                <a
                  href="#pricing"
                  onClick={(e) => handleScroll(e, "#pricing")}
                  className="block py-2 px-3 text-slate-400 rounded hover:text-white md:p-0 transition-colors cursor-pointer">
                  Pricing
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <header
        ref={heroRef}
        className={`relative min-h-screen flex items-center justify-center pt-20 overflow-hidden bg-[${colors.dark950}]`}>
        {/* Background Gradients & Grid */}
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
            maskImage:
              "radial-gradient(circle at center, black 40%, transparent 85%)",
          }}></div>

        {/* Animated Blobs (GSAP Controlled) */}
        <div
          ref={floatRef1}
          className={`absolute top-[-10%] left-1/4 w-[500px] h-[500px] bg-[${colors.brand600}]/20 rounded-full blur-[120px]`}></div>
        <div
          ref={floatRef2}
          className="absolute bottom-[-10%] right-1/4 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px]"></div>

        <div className="relative z-10 py-8 px-4 mx-auto max-w-7xl text-center lg:py-16 lg:px-12">
          {/* Badge */}
          <a
            href="#telegram-solutions"
            className="hero-animate inline-flex justify-between items-center py-1.5 px-1.5 pr-4 mb-8 text-sm text-slate-400 bg-white/5 rounded-full border border-white/10 hover:border-blue-500/50 backdrop-blur-md transition-all group">
            <span
              className={`text-xs bg-[${colors.brand600}] rounded-full text-white px-3 py-1 mr-3 group-hover:bg-[${colors.brand500}] transition-colors`}>
              New
            </span>
            <span className="text-sm font-medium group-hover:text-white transition-colors">
              Telegram Mini App Solutions
            </span>
            <ArrowRight className="ml-2 w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </a>

          {/* Heading */}
          <h1 className="hero-animate mb-6 text-4xl font-extrabold tracking-tight leading-tight text-white md:text-6xl lg:text-7xl">
            Scalable Web Systems. <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 via-blue-500 to-indigo-500 drop-shadow-[0_0_30px_rgba(59,130,246,0.5)]">
              Next-Gen Automation.
            </span>
          </h1>

          {/* Description */}
          <p className="hero-animate mb-10 text-lg font-normal text-slate-400 lg:text-xl sm:px-16 xl:px-48 leading-relaxed">
            We engineer high-performance{" "}
            <span className="text-white font-semibold">Next.js & Express</span>{" "}
            architectures. From complex admin dashboards to automated{" "}
            <span className="text-white font-semibold">Telegram Bots</span>, we
            build the tools that power your business growth.
          </p>

          {/* CTA */}
          <div className="hero-animate flex flex-col mb-16 space-y-4 sm:flex-row sm:justify-center sm:space-y-0 sm:space-x-6">
            <a
              href="#contact"
              className={`inline-flex justify-center items-center py-4 px-8 text-base font-bold text-center text-white rounded-xl bg-[${colors.brand600}] hover:bg-[${colors.brand500}] focus:ring-4 focus:ring-blue-500/50 shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-1`}>
              Start Your Project
              <Rocket className="ml-2 w-5 h-5" />
            </a>
            <a
              href="#services"
              className="inline-flex justify-center items-center py-4 px-8 text-base font-medium text-center text-slate-300 rounded-xl border border-white/10 hover:bg-white/5 hover:text-white hover:border-white/30 transition-all">
              Explore Services
            </a>
          </div>

          {/* Tech Stack */}
          <div className="hero-animate pt-8 border-t border-white/5">
            <p className="text-xs text-slate-500 mb-6 uppercase tracking-[0.2em] font-bold">
              Trust The Modern Stack
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 text-slate-600 grayscale hover:grayscale-0 transition-all duration-700">
              <div className="flex flex-col items-center gap-2 hover:text-white transition-colors group">
                <div className="group-hover:animate-spin transition-all duration-5000">
                  <Code2 className="w-8 h-8" />
                </div>
                <span className="text-xs font-semibold">Next.js</span>
              </div>
              <div className="flex flex-col items-center gap-2 hover:text-white transition-colors">
                <Server className="w-8 h-8" />{" "}
                <span className="text-xs font-semibold">Node/Express</span>
              </div>
              <div className="flex flex-col items-center gap-2 hover:text-blue-400 transition-colors">
                <MessageCircle className="w-8 h-8" />{" "}
                <span className="text-xs font-semibold">Telegram API</span>
              </div>
              <div className="flex flex-col items-center gap-2 hover:text-yellow-400 transition-colors">
                <Database className="w-8 h-8" />{" "}
                <span className="text-xs font-semibold">MongoDB/SQL</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* --- Why Choose Us --- */}
      <section
        ref={addToRefs}
        className={`py-24 bg-[${colors.dark900}] border-y border-white/5`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">
              Why Industry Leaders Choose Us
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              We don&apos;t just write code; we architect solutions designed for
              stability, speed, and massive scale.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Zap,
                color: "text-blue-500",
                bg: "bg-blue-900/50",
                title: "Lightning Fast",
                desc: "Optimized Server-Side Rendering (SSR) and clean code ensure your apps load instantly.",
              },
              {
                icon: Shield,
                color: "text-purple-500",
                bg: "bg-purple-900/50",
                title: "Enterprise Security",
                desc: "Best practices in API security, rate limiting, and data encryption come standard.",
              },
              {
                icon: Expand,
                color: "text-blue-500",
                bg: "bg-blue-900/50",
                title: "Fully Scalable",
                desc: "Built on modular architectures that grow effortlessly as your user base expands.",
              },
              {
                icon: Headphones,
                color: "text-green-500",
                bg: "bg-green-900/50",
                title: "24/7 Support",
                desc: "We don&apos;t disappear after launch. We offer ongoing maintenance and dedicated support.",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className={`p-6 bg-[${colors.dark950}] border border-white/5 rounded-2xl hover:border-blue-500/30 transition-colors group`}>
                <div
                  className={`w-12 h-12 ${item.bg} rounded-lg flex items-center justify-center ${item.color} mb-4`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Services --- */}
      <section
        id="services"
        ref={addToRefs}
        className={`bg-[${colors.dark950}] relative py-24`}>
        <div className="py-8 px-4 mx-auto max-w-7xl lg:px-6">
          <div className="mx-auto max-w-screen-sm text-center mb-16">
            <span
              className={`text-[${colors.brand500}] font-bold tracking-wider uppercase text-sm`}>
              Our Expertise
            </span>
            <h2 className="mt-2 text-3xl tracking-tight font-extrabold text-white sm:text-4xl">
              Comprehensive Tech Solutions
            </h2>
            <p className="mt-4 font-light text-slate-400 text-lg">
              From concept to deployment, we cover every aspect of modern
              development.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Layers,
                title: "Full-Stack Web Dev",
                desc: "Custom websites using React/Next.js and Express.js. We build responsive, interactive, and SEO-friendly platforms tailored to your brand.",
              },
              {
                icon: MessageCircle,
                title: "Telegram Ecosystems",
                desc: "We are leaders in Telegram automation. From simple chatbots to complex Mini Apps (Web Apps) that function like native applications.",
                highlight: true,
              },
              {
                icon: Server,
                title: "API Development",
                desc: "Robust RESTful APIs and GraphQL endpoints. We build the backend logic that connects your frontend, mobile apps, and third-party services securely.",
              },
              {
                icon: LineChart,
                title: "Admin Dashboards",
                desc: "Gain control over your data. We build intuitive admin panels with real-time analytics, user management, and reporting tools.",
              },
              {
                icon: Bot,
                title: "Automation Systems",
                desc: "Reduce manual work. We create scripts and bots that scrape data, automate workflows, and sync information between platforms.",
              },
              {
                icon: Gauge,
                title: "Speed Optimization",
                desc: "Slow sites lose customers. We audit, refactor, and optimize your existing codebase for maximum Core Web Vitals scores.",
              },
            ].map((service, idx) => (
              <div
                key={idx}
                className={`bg-[${colors.dark900}] border ${
                  service.highlight
                    ? `border-[${colors.brand500}]/20`
                    : "border-white/5"
                } rounded-2xl p-8 hover:shadow-[0_0_25px_rgba(59,130,246,0.25)] hover:border-blue-500/50 hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden`}>
                {service.highlight && (
                  <div
                    className={`absolute top-0 right-0 w-24 h-24 bg-[${colors.brand500}]/5 rounded-bl-[100px] transition-all group-hover:bg-[${colors.brand500}]/10`}></div>
                )}
                <div
                  className={`w-14 h-14 rounded-xl bg-[${colors.brand500}]/10 text-[${colors.brand500}] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <service.icon className="w-7 h-7" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-white">
                  {service.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">
                  {service.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Process --- */}
      <section
        id="process"
        ref={addToRefs}
        className={`py-24 bg-[${colors.dark900}] border-y border-white/5`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">How We Work</h2>
            <p className="text-slate-400">
              A transparent, streamlined workflow designed to deliver results.
            </p>
          </div>

          <div className="relative">
            {/* Connecting Line */}
            <div
              className={`hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-linear-to-r from-transparent via-[${colors.brand500}]/50 to-transparent -translate-y-1/2 z-0`}></div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
              {[
                {
                  step: 1,
                  title: "Plan & Strategy",
                  desc: "We analyze your requirements and architect the perfect technical roadmap.",
                },
                {
                  step: 2,
                  title: "Build & Code",
                  desc: "Agile development with regular updates. You see the progress as it happens.",
                },
                {
                  step: 3,
                  title: "Test & Optimize",
                  desc: "Rigorous QA testing, security checks, and speed optimization before launch.",
                },
                {
                  step: 4,
                  title: "Launch & Scale",
                  desc: "We deploy your solution and provide ongoing support to help you scale.",
                },
              ].map((p, i) => (
                <div
                  key={i}
                  className={`bg-[${colors.dark950}] p-6 rounded-xl border border-white/5 text-center transform transition hover:-translate-y-2`}>
                  <div
                    className={`w-16 h-16 mx-auto bg-[${colors.dark800}] border-2 border-[${colors.brand500}] rounded-full flex items-center justify-center text-xl font-bold text-white mb-4 shadow-lg shadow-blue-500/20`}>
                    {p.step}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    {p.title}
                  </h3>
                  <p className="text-sm text-slate-400">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="tools"
        ref={addToRefs}
        className={`py-24 bg-[${colors.dark950}] relative`}>
        <div className="py-8 px-4 mx-auto max-w-7xl lg:px-6">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            {/* Code Visual */}
            <div className="relative order-2 lg:order-1">
              <div
                className={`absolute inset-0 bg-[${colors.brand600}] blur-[90px] opacity-20 rounded-full`}></div>
              <div
                ref={codeBlockRef}
                className={`relative bg-[${colors.dark900}] border border-white/10 rounded-xl overflow-hidden shadow-2xl`}>
                <div
                  className={`flex justify-between items-center bg-[${colors.dark800}] px-4 py-3 border-b border-white/5`}>
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">
                    bot_controller.js
                  </span>
                </div>
                <div
                  className={`p-6 space-y-2 font-mono text-sm leading-6 bg-[${colors.dark900}]/90 backdrop-blur-sm`}>
                  <p className="text-purple-400">
                    const <span className="text-white">OneControl</span> =
                    require(
                    <span className="text-green-400">
                      &apos;@onecontrol/sdk&apos;
                    </span>
                    );
                  </p>
                  <p className="text-slate-500">Initialize Telegram Bot</p>
                  <p className="text-blue-400">
                    async function{" "}
                    <span className="text-yellow-300">startBot</span>() {"{"}
                  </p>
                  <p className="pl-4 text-white">
                    await OneControl.connect({"{"})
                  </p>

                  <p className="pl-8 text-sky-300">
                    mode:{" "}
                    <span className="text-green-400">&apos;turbo&apos;</span>,
                  </p>
                  <p className="pl-8 text-sky-300">
                    security:{" "}
                    <span className="text-green-400">&apos;high&apos;</span>,
                  </p>
                  <p className="pl-8 text-sky-300">
                    sync: <span className="text-purple-400">true</span>
                  </p>
                  <p className="pl-4 text-white">{"}"});</p>
                  <p className="pl-4 text-green-400">
                    console.log(&quot;System Online 🚀&quot;);
                  </p>
                  <p className="text-blue-400">{"}"}</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="order-1 lg:order-2">
              <span
                className={`text-[${colors.brand500}] font-bold uppercase tracking-wide text-xs`}>
                Real World Applications
              </span>
              <h2 className="mb-6 mt-2 text-4xl tracking-tight font-extrabold text-white">
                We Build Tools That Work
              </h2>
              <p className="mb-8 text-slate-400 text-lg">
                Our solutions are used by startups and enterprises to automate
                processes and engage users.
              </p>

              <div className="space-y-6">
                {[
                  {
                    icon: Rocket,
                    title: "Startup Landing Pages",
                    desc: "High-conversion websites optimized for speed and SEO to help you launch fast.",
                  },
                  {
                    icon: Smartphone,
                    title: "Telegram Mini Apps",
                    desc: "Full web applications running inside Telegram for e-commerce, gaming, or utility.",
                  },
                  {
                    icon: Settings,
                    title: "Custom Admin Panels",
                    desc: "Internal tools to manage your database, users, and content efficiently.",
                  },
                ].map((item, i) => (
                  <div key={i} className="flex">
                    <div className="shrink-0">
                      <div
                        className={`flex items-center justify-center h-10 w-10 rounded-md bg-[${colors.brand500}]/20 text-[${colors.brand500}]`}>
                        <item.icon className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-bold text-white">
                        {item.title}
                      </h4>
                      <p className="mt-1 text-sm text-slate-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10">
                <a
                  href="#contact"
                  className={`text-white bg-[${colors.dark800}] border border-white/10 hover:bg-[${colors.dark900}] font-bold rounded-lg text-sm px-6 py-3 transition-all inline-flex items-center`}>
                  Request a Demo
                  <ArrowRight className="ml-2 w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Pricing --- */}
      <section
        id="pricing"
        ref={addToRefs}
        className={`py-24 bg-[${colors.dark900}] border-t border-white/5`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-slate-400">
              Choose the package that fits your project needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Starter */}
            <div
              className={`bg-[${colors.dark950}] p-8 rounded-2xl border border-white/5 hover:border-blue-500/30 transition-all flex flex-col`}>
              <h3 className="text-xl font-bold text-white mb-2">Starter</h3>
              <p className="text-slate-500 text-sm mb-6">
                Perfect for landing pages and simple bots.
              </p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">$499</span>
                <span className="text-slate-500">/start</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1 text-sm text-slate-400">
                {[
                  "1 Page Website",
                  "Basic Telegram Bot",
                  "1 Month Support",
                ].map((f, i) => (
                  <li key={i} className="flex items-center">
                    <Check className="text-green-500 mr-3 w-4 h-4" /> {f}
                  </li>
                ))}
              </ul>
              <a
                href="#"
                className={`block w-full py-3 px-4 bg-[${colors.dark800}] hover:bg-slate-800 text-white text-center rounded-lg font-bold transition-colors`}>
                Choose Starter
              </a>
            </div>

            {/* Professional */}
            <div
              className={`bg-[${colors.dark900}] p-8 rounded-2xl border-2 border-[${colors.brand600}] relative transform md:scale-105 shadow-2xl shadow-blue-900/50 flex flex-col z-10`}>
              <div
                className={`absolute top-0 right-0 bg-[${colors.brand600}] text-white text-xs font-bold px-3 py-1 rounded-bl-lg`}>
                POPULAR
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Professional
              </h3>
              <p className="text-slate-400 text-sm mb-6">
                For businesses needing robust solutions.
              </p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">$1,299</span>
                <span className="text-slate-500">/start</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1 text-sm text-white">
                {[
                  "5 Page Website (Next.js)",
                  "Custom Admin Dashboard",
                  "Telegram Mini App Integration",
                  "API Development",
                  "3 Months Support",
                ].map((f, i) => (
                  <li key={i} className="flex items-center">
                    <Check
                      className={`text-[${colors.brand500}] mr-3 w-4 h-4`}
                    />{" "}
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="#"
                className={`block w-full py-3 px-4 bg-[${colors.brand600}] hover:bg-blue-500 text-white text-center rounded-lg font-bold transition-colors shadow-lg shadow-blue-500/25`}>
                Choose Professional
              </a>
            </div>

            {/* Enterprise */}
            <div
              className={`bg-[${colors.dark950}] p-8 rounded-2xl border border-white/5 hover:border-blue-500/30 transition-all flex flex-col`}>
              <h3 className="text-xl font-bold text-white mb-2">Enterprise</h3>
              <p className="text-slate-500 text-sm mb-6">
                Full scale custom architecture.
              </p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">Custom</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1 text-sm text-slate-400">
                {[
                  "Complex SaaS Platforms",
                  "High-Load Architecture",
                  "Dedicated Team",
                  "SLA & Priority Support",
                ].map((f, i) => (
                  <li key={i} className="flex items-center">
                    <Check className="text-green-500 mr-3 w-4 h-4" /> {f}
                  </li>
                ))}
              </ul>
              <a
                href="#"
                className={`block w-full py-3 px-4 bg-[${colors.dark800}] hover:bg-slate-800 text-white text-center rounded-lg font-bold transition-colors`}>
                Contact Sales
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* --- FAQ --- */}
      <section ref={addToRefs} className={`py-24 bg-[${colors.dark950}]`}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            {[
              {
                q: "What technologies do you use?",
                a: "We specialize in the JavaScript ecosystem. Our primary stack includes Next.js for the frontend, Node.js/Express for the backend, and MongoDB or SQL for databases.",
              },
              {
                q: "How long does it take to build a project?",
                a: "Timelines vary based on complexity. A standard landing page can take 3-5 days, while a complex Telegram Mini App typically takes 2-4 weeks.",
              },
              {
                q: "Do you offer maintenance after launch?",
                a: "Yes! All our packages come with a period of free support. After that, we offer monthly maintenance plans.",
              },
              {
                q: "Can you update my existing website?",
                a: "Absolutely. We can audit your current code, optimize it for speed and SEO, or completely refactor it using modern technologies.",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className={`bg-[${
                  colors.dark900
                }] rounded-lg border border-white/5 overflow-hidden transition-all duration-300 ${
                  openFaq === idx ? `border-[${colors.brand500}]/50` : ""
                }`}>
                <button
                  onClick={() => toggleFaq(idx)}
                  className="flex justify-between items-center w-full p-4 font-medium text-white text-left focus:outline-none">
                  <span>{item.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-[${
                      colors.brand500
                    }] transition-transform duration-300 ${
                      openFaq === idx ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className={`px-4 text-slate-400 text-sm leading-relaxed overflow-hidden transition-all duration-300 ease-in-out ${
                    openFaq === idx
                      ? "max-h-40 pb-4 opacity-100"
                      : "max-h-0 opacity-0"
                  }`}>
                  {item.a}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CTA --- */}
      <section
        id="contact"
        ref={addToRefs}
        className={`relative py-20 bg-[${colors.brand600}]/20 overflow-hidden`}>
        <div className={`absolute inset-0 bg-[${colors.dark950}]/90`}></div>
        <div
          className={`absolute -top-24 -right-24 w-96 h-96 bg-[${colors.brand500}]/20 rounded-full blur-3xl`}></div>

        <div className="relative max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-extrabold text-white mb-6">
            Ready to Scale Your Business?
          </h2>
          <p className="text-xl text-slate-300 mb-10">
            Stop worrying about technical limitations. Let us build the
            infrastructure you need to succeed.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="#"
              className={`py-4 px-8 bg-[${colors.brand600}] hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all transform hover:scale-105`}>
              Start Project Now
            </a>
            <a
              href="https://t.me/yourusername"
              target="_blank"
              className="py-4 px-8 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl font-bold backdrop-blur-sm transition-all flex items-center justify-center">
              <MessageCircle className="mr-2 w-5 h-5" /> Chat on Telegram
            </a>
          </div>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer
        className={`bg-[${colors.dark950}] border-t border-white/10 pt-16 pb-8`}>
        <div className="mx-auto w-full max-w-7xl px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-1">
              <a href="#" className="flex items-center space-x-2 mb-4">
                <div
                  className={`w-8 h-8 rounded bg-linear-to-br from-[${colors.brand600}] to-indigo-600 flex items-center justify-center`}>
                  <Code2 className="text-white w-4 h-4" />
                </div>
                <span className="self-center text-xl font-bold whitespace-nowrap text-white">
                  One
                  <span className={`text-[${colors.brand500}]`}>Control</span>
                </span>
              </a>
              <p className="text-slate-500 text-sm leading-relaxed">
                Empowering businesses with high-speed web solutions and advanced
                Telegram automation tools.
              </p>
            </div>

            <div>
              <h3 className="text-white font-bold mb-4 uppercase text-sm tracking-wider">
                Services
              </h3>
              <ul className="space-y-2 text-sm text-slate-400">
                {[
                  "Web Development",
                  "Telegram Mini Apps",
                  "Admin Dashboards",
                  "API Integration",
                ].map((item, i) => (
                  <li key={i}>
                    <a
                      href="#"
                      className={`hover:text-[${colors.brand500}] transition-colors`}>
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-white font-bold mb-4 uppercase text-sm tracking-wider">
                Company
              </h3>
              <ul className="space-y-2 text-sm text-slate-400">
                {["About Us", "Process", "Pricing", "Contact"].map(
                  (item, i) => (
                    <li key={i}>
                      <a
                        href="#"
                        className={`hover:text-[${colors.brand500}] transition-colors`}>
                        {item}
                      </a>
                    </li>
                  ),
                )}
              </ul>
            </div>

            <div>
              <h3 className="text-white font-bold mb-4 uppercase text-sm tracking-wider">
                Legal
              </h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <a
                    href="#"
                    className={`hover:text-[${colors.brand500}] transition-colors`}>
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className={`hover:text-[${colors.brand500}] transition-colors`}>
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/5 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <span className="text-sm text-slate-600">
                © 2025 OneControl. All Rights Reserved.
              </span>

              <div className="flex items-center gap-6">
                <div className="flex space-x-4 text-slate-600">
                  <a href="#" className="hover:text-white transition-colors">
                    <Github className="w-5 h-5" />
                  </a>
                  <a
                    href="#"
                    className={`hover:text-[${colors.brand500}] transition-colors`}>
                    <MessageCircle className="w-5 h-5" />
                  </a>
                  <a href="#" className="hover:text-blue-400 transition-colors">
                    <Twitter className="w-5 h-5" />
                  </a>
                </div>
                <div className="h-4 w-px bg-white/10"></div>
                <div className="flex space-x-3 text-slate-700">
                  <CreditCard className="w-6 h-6" />
                  <CreditCard className="w-6 h-6" />
                  <Bitcoin className="w-6 h-6 hover:text-orange-500 transition-colors cursor-pointer" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
