"use client";

import React, { useRef, useEffect } from "react";
import gsap from "gsap";

const InlineLoader = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const outerRingRef = useRef<HTMLDivElement | null>(null);
  const middleRingRef = useRef<HTMLDivElement | null>(null);
  const innerRingRef = useRef<HTMLDivElement | null>(null);
  const coreRef = useRef<HTMLDivElement | null>(null);

  const particlesRef = useRef<(HTMLDivElement | null)[]>([]);
  const dotsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const textRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(outerRingRef.current, {
        rotation: 360,
        duration: 4,
        repeat: -1,
        ease: "none",
      });

      gsap.to(middleRingRef.current, {
        rotation: -360,
        duration: 2.5,
        repeat: -1,
        ease: "none",
      });

      gsap.to(innerRingRef.current, {
        rotation: 360,
        duration: 1.5,
        repeat: -1,
        ease: "none",
      });

      gsap.to(coreRef.current, {
        scale: 1.5,
        opacity: 1,
        boxShadow:
          "0 0 25px rgba(6, 182, 212, 0.8), inset 0 0 10px rgba(255,255,255,0.5)",
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      particlesRef.current.forEach((particle, i) => {
        if (particle) {
          gsap.to(particle, {
            opacity: 1,
            scale: 1.8,
            boxShadow: "0 0 15px rgba(6, 182, 212, 1)",
            duration: 1,
            repeat: -1,
            yoyo: true,
            delay: i * 0.2,
            ease: "sine.inOut",
          });
        }
      });

      if (textRef.current) {
        const textChars = textRef.current.children;
        gsap.to(textChars, {
          color: "#22d3ee",
          textShadow: "0 0 10px rgba(34, 211, 238, 0.6)",
          stagger: {
            each: 0.1,
            repeat: -1,
            yoyo: true,
          },
          duration: 1,
          ease: "sine.inOut",
        });
      }

      gsap.to(dotsRef.current, {
        opacity: 1,
        stagger: {
          each: 0.2,
          repeat: -1,
          yoyo: true,
        },
        duration: 0.5,
        ease: "power1.inOut",
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="inline-flex flex-col items-center justify-center p-10 w-full">
      <div className="relative w-24 h-24 flex items-center justify-center">
        <div className="absolute inset-0 bg-linear-to-tr from-cyan-500/30 via-blue-600/30 to-purple-600/30 blur-2xl rounded-full animate-pulse"></div>
        <div
          ref={outerRingRef}
          className="absolute inset-0 rounded-full mix-blend-screen"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 270deg, #06b6d4 360deg)",
            mask: "radial-gradient(circle, transparent 40px, black 41px)",
            WebkitMask: "radial-gradient(circle, transparent 40px, black 41px)",
            filter: "drop-shadow(0 0 5px rgba(6,182,212,0.5))",
          }}></div>

        <div
          ref={middleRingRef}
          className="absolute inset-2 rounded-full mix-blend-screen"
          style={{
            background:
              "conic-gradient(from 180deg, transparent 180deg, #3b82f6 270deg, transparent 360deg)",
            mask: "radial-gradient(circle, transparent 32px, black 33px)",
            WebkitMask: "radial-gradient(circle, transparent 32px, black 33px)",
            filter: "drop-shadow(0 0 5px rgba(59,130,246,0.5))",
          }}></div>

        <div
          ref={innerRingRef}
          className="absolute inset-4 rounded-full mix-blend-screen"
          style={{
            background:
              "conic-gradient(from 0deg, #8b5cf6 90deg, transparent 180deg)",
            mask: "radial-gradient(circle, transparent 23px, black 24px)",
            WebkitMask: "radial-gradient(circle, transparent 23px, black 24px)",
            filter: "drop-shadow(0 0 5px rgba(139,92,246,0.5))",
          }}></div>

        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            ref={(el) => {
              particlesRef.current[i] = el;
            }}
            className="absolute w-1.5 h-1.5 rounded-full bg-cyan-300"
            style={{
              top: "50%",
              left: "50%",
              transform: `rotate(${i * 90}deg) translateX(34px) translateY(-50%)`, // Adjusted distance
              boxShadow: "0 0 10px rgba(6, 182, 212, 0.8)",
              opacity: 0.5,
            }}></div>
        ))}

        <div
          ref={coreRef}
          className="w-4 h-4 rounded-full bg-cyan-100 relative z-10"
          style={{
            background: "radial-gradient(circle at 30% 30%, #ffffff, #22d3ee)",
            boxShadow: "0 0 20px rgba(6, 182, 212, 0.6)",
          }}></div>
      </div>

      <div className="mt-6 flex items-center gap-1">
        <div
          ref={textRef}
          className="flex space-x-px text-xs font-bold tracking-widest text-slate-500 uppercase">
          {"PROCESSING".split("").map((char, index) => (
            <span key={index} className="inline-block">
              {char}
            </span>
          ))}
        </div>
        <div className="flex gap-1 ml-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              ref={(el) => {
                dotsRef.current[i] = el;
              }}
              className="w-1 h-1 rounded-full bg-cyan-500 opacity-20"></span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InlineLoader;
