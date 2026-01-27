"use client";

import { useState, useCallback } from "react";

export type AssetType = "Group" | "Channel";

export interface ManagedAsset {
  id: number;
  name: string;
  type: AssetType;
}

interface ProtectConfig {
  blockedExtensions: string[];
  blacklistedDomains: string[];
}

const DEFAULT_EXTENSIONS = [".exe", ".bat", ".sh", ".vbs", ".jar"];
const DEFAULT_BLACKLISTED_DOMAINS = [
  "scam-site.com",
  "free-money.org",
  "phishing.net",
];

const INITIAL_MANAGED_ASSETS: ManagedAsset[] = [
  { id: 1, name: "VIP Traders", type: "Group" },
  { id: 2, name: "Announcements", type: "Channel" },
];

const createDefaultConfig = (asset?: ManagedAsset): ProtectConfig => {
  // IMPORTANT: make each asset start DIFFERENT so switching is visible
  const base: ProtectConfig = {
    blockedExtensions: [...DEFAULT_EXTENSIONS],
    blacklistedDomains: [...DEFAULT_BLACKLISTED_DOMAINS],
  };

  if (!asset) return base;

  // By type
  if (asset.type === "Group") {
    base.blockedExtensions.push(".apk");
    base.blacklistedDomains.unshift("invite-spam.tld");
  } else {
    base.blockedExtensions.push(".scr");
    base.blacklistedDomains.unshift("promo-link.tld");
  }

  // By id (extra variation)
  if (asset.id % 2 === 0) {
    base.blockedExtensions.push(".msi");
    base.blacklistedDomains.push("short-url.tld");
  } else {
    base.blockedExtensions.push(".dmg");
    base.blacklistedDomains.push("giveaway-fake.tld");
  }

  // Remove duplicates
  base.blockedExtensions = Array.from(new Set(base.blockedExtensions));
  base.blacklistedDomains = Array.from(new Set(base.blacklistedDomains));

  return base;
};

export function useTelegramProtect() {
  const [managedAssets, setManagedAssets] = useState<ManagedAsset[]>(
    INITIAL_MANAGED_ASSETS
  );
  const [activeAssetId, setActiveAssetId] = useState<number | null>(
    INITIAL_MANAGED_ASSETS[0]?.id ?? null
  );
  const [configs, setConfigs] = useState<Record<number, ProtectConfig>>(() => {
    const map: Record<number, ProtectConfig> = {};
    for (const asset of INITIAL_MANAGED_ASSETS) {
      map[asset.id] = createDefaultConfig(asset);
    }
    return map;
  });

  const [newExt, setNewExt] = useState("");
  const [newDomain, setNewDomain] = useState("");

  const updateActiveConfig = useCallback(
    (updater: (config: ProtectConfig) => ProtectConfig) => {
      if (activeAssetId == null) return;
      setConfigs((prev) => {
        const current = prev[activeAssetId] ?? createDefaultConfig();
        return {
          ...prev,
          [activeAssetId]: updater(current),
        };
      });
    },
    [activeAssetId]
  );

  const addExtension = useCallback(() => {
    if (!newExt || activeAssetId == null) return;
    updateActiveConfig((config) => {
      if (config.blockedExtensions.includes(newExt)) return config;
      const value = newExt.startsWith(".") ? newExt : `.${newExt}`;
      return {
        ...config,
        blockedExtensions: [...config.blockedExtensions, value],
      };
    });
    setNewExt("");
  }, [newExt, activeAssetId, updateActiveConfig]);

  const addDomain = useCallback(() => {
    if (!newDomain || activeAssetId == null) return;
    updateActiveConfig((config) => {
      if (config.blacklistedDomains.includes(newDomain)) return config;
      return {
        ...config,
        blacklistedDomains: [...config.blacklistedDomains, newDomain],
      };
    });
    setNewDomain("");
  }, [newDomain, activeAssetId, updateActiveConfig]);

  const removeExtension = useCallback(
    (ext: string) => {
      if (activeAssetId == null) return;
      updateActiveConfig((config) => ({
        ...config,
        blockedExtensions: config.blockedExtensions.filter((e) => e !== ext),
      }));
    },
    [activeAssetId, updateActiveConfig]
  );

  const removeDomain = useCallback(
    (domain: string) => {
      if (activeAssetId == null) return;
      updateActiveConfig((config) => ({
        ...config,
        blacklistedDomains: config.blacklistedDomains.filter(
          (d) => d !== domain
        ),
      }));
    },
    [activeAssetId, updateActiveConfig]
  );

  const addManagedAsset = useCallback((asset: ManagedAsset) => {
    setManagedAssets((prev) => {
      if (prev.find((g) => g.id === asset.id)) return prev;
      return [...prev, asset];
    });
    setConfigs((prev) => {
      if (prev[asset.id]) return prev;
      return {
        ...prev,
        [asset.id]: createDefaultConfig(asset),
      };
    });
    setActiveAssetId(asset.id);
  }, []);

  const removeManagedAsset = useCallback((id: number) => {
    setManagedAssets((prev) => prev.filter((g) => g.id !== id));
    setConfigs((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setActiveAssetId((current) => {
      if (current !== id) return current;
      const nextList = managedAssets.filter((g) => g.id !== id);
      return nextList[0]?.id ?? null;
    });
  }, [managedAssets]);

  const activeAsset =
    activeAssetId != null
      ? managedAssets.find((a) => a.id === activeAssetId) ?? null
      : null;

  const activeConfig: ProtectConfig =
    activeAssetId != null && configs[activeAssetId]
      ? configs[activeAssetId]
      : createDefaultConfig(activeAsset ?? undefined);

  const rulesCount =
    activeConfig.blockedExtensions.length +
    activeConfig.blacklistedDomains.length +
    4;

  return {
    // assets / selection
    managedAssets,
    activeAssetId,
    activeAsset,
    setActiveAssetId,
    addManagedAsset,
    removeManagedAsset,
    // File Guard
    blockedExtensions: activeConfig.blockedExtensions,
    newExt,
    setNewExt,
    addExtension,
    removeExtension,
    // Link Sentry
    blacklistedDomains: activeConfig.blacklistedDomains,
    newDomain,
    setNewDomain,
    addDomain,
    removeDomain,
    // Stats
    rulesCount,
  };
}
