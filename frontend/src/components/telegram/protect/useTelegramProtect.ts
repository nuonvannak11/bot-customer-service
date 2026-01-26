"use client";

import { useState, useCallback } from "react";

const DEFAULT_EXTENSIONS = [".exe", ".bat", ".sh", ".vbs", ".jar"];
const DEFAULT_BLACKLISTED_DOMAINS = [
  "scam-site.com",
  "free-money.org",
  "phishing.net",
];

export function useTelegramProtect() {
  const [blockedExtensions, setBlockedExtensions] = useState(DEFAULT_EXTENSIONS);
  const [blacklistedDomains, setBlacklistedDomains] = useState(
    DEFAULT_BLACKLISTED_DOMAINS
  );
  const [newExt, setNewExt] = useState("");
  const [newDomain, setNewDomain] = useState("");

  const addExtension = useCallback(() => {
    if (newExt && !blockedExtensions.includes(newExt)) {
      setBlockedExtensions((prev) => [
        ...prev,
        newExt.startsWith(".") ? newExt : `.${newExt}`,
      ]);
      setNewExt("");
    }
  }, [newExt, blockedExtensions]);

  const addDomain = useCallback(() => {
    if (newDomain && !blacklistedDomains.includes(newDomain)) {
      setBlacklistedDomains((prev) => [...prev, newDomain]);
      setNewDomain("");
    }
  }, [newDomain, blacklistedDomains]);

  const removeExtension = useCallback((ext: string) => {
    setBlockedExtensions((prev) => prev.filter((e) => e !== ext));
  }, []);

  const removeDomain = useCallback((domain: string) => {
    setBlacklistedDomains((prev) => prev.filter((d) => d !== domain));
  }, []);

  const rulesCount = blockedExtensions.length + blacklistedDomains.length + 4;

  return {
    // File Guard
    blockedExtensions,
    newExt,
    setNewExt,
    addExtension,
    removeExtension,
    // Link Sentry
    blacklistedDomains,
    newDomain,
    setNewDomain,
    addDomain,
    removeDomain,
    // Stats
    rulesCount,
  };
}
