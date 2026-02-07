"use client";

import React, { useRef } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { MoreVertical, Trash2, SkipForward } from "lucide-react";

export default function ChatActionDropdown() {
  const contentRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {}, { scope: contentRef });

  const animateIn = React.useCallback(() => {
    if (!contentRef.current) return;

    gsap.fromTo(
      contentRef.current,
      { opacity: 0, y: -10, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.2, ease: "power2.out" },
    );
  }, []);

  return (
    <DropdownMenu.Root
      onOpenChange={(open) => {
        if (open) {
          setTimeout(animateIn, 10);
        }
      }}>
      <DropdownMenu.Trigger asChild>
        <button className="outline-none">
          <MoreVertical
            size={22}
            className="text-[#707579] hover:text-[#e5e5e5] cursor-pointer transition-colors"
          />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          ref={contentRef}
          sideOffset={5}
          align="end"
          className="z-100 min-w-40 bg-[#17212b] border border-black/20 rounded-lg shadow-xl p-1.5 origin-top-right will-change-transform">
          <DropdownMenu.Item
            className="group flex items-center gap-3 px-3 py-2.5 text-[14px] text-white rounded-md outline-none cursor-pointer hover:bg-[#202b36] transition-colors"
            onClick={() => console.log("Skipped")}>
            <SkipForward
              size={16}
              className="text-[#707579] group-hover:text-[#64b5ef]"
            />
            <span>Skip</span>
          </DropdownMenu.Item>
          <DropdownMenu.Item
            className="group flex items-center gap-3 px-3 py-2.5 text-[14px] text-[#ef5b5b] rounded-md outline-none cursor-pointer hover:bg-[#2b1a1c] transition-colors"
            onClick={() => console.log("Deleted")}>
            <Trash2 size={16} className="text-[#ef5b5b]" />
            <span>Delete</span>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
