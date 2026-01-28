import { getProtects } from "@/libs/data";
import TelegramProtectPage from "@/components/telegram/TelegramProtectPage";
import { ProtectData } from "@/interface/telegram/interface.telegram";
import { prepareProtectData } from "@/libs/lib";

export default async function TelegramPage() {
  // const protects = await getProtects();
  const MOCK_DATA: ProtectData = {
    groupChannel: [
      {
        id: 1,
        name: "Global Public Chat",
        avartar: "",
        type: "Group",
        allowScan: false,
        upTime: 0.5,
        config: {
          blockedExtensions: [".exe", ".bat", ".apk", ".scr"],
          blacklistedDomains: ["steam-gift.com", "free-nitro.net"],
          spam: {
            rateLimit: 5,
            duplicateSensitivity: 2,
            newUserRestriction: 1,
          },
          rulesCount: 6,
          blockAllLinksFromNoneAdmin: true,
        },
        threatsBlocked: 30,
        safeFiles: 2,
      },
      {
        id: 2,
        name: "VIP Signals & Whales",
        avartar: "",
        type: "Group",
        allowScan: false,
        upTime: 0.1,
        config: {
          blockedExtensions: [".exe", ".zip", ".rar", ".pdf", ".js", ".vbs"],
          blacklistedDomains: ["drainer-wallet.xyz", "fake-ledger.io", "claim-airdrop.org"],
          spam: {
            rateLimit: 2,
            duplicateSensitivity: 3,
            newUserRestriction: 3,
          },
          rulesCount: 30,
          blockAllLinksFromNoneAdmin: false,
        },
        threatsBlocked: 100,
        safeFiles: 50,
      },
      {
        id: 3,
        name: "Official Announcements",
        avartar: "",
        type: "Channel",
        allowScan: false,
        upTime: 11,
        config: {
          blockedExtensions: [],
          blacklistedDomains: ["competitor-news.com", "fud-news.net"],
          spam: {
            rateLimit: 20,
            duplicateSensitivity: 0,
            newUserRestriction: 0,
          },
          rulesCount: 3,
          blockAllLinksFromNoneAdmin: false,
        },
        threatsBlocked: 200,
        safeFiles: 20,
      },
      {
        id: 4,
        name: "Official Pubg",
        avartar: "",
        type: "Channel",
        allowScan: true,
        upTime: 8,
        config: {
          blockedExtensions: [],
          blacklistedDomains: ["competitor-news.com", "fud-news.net"],
          spam: {
            rateLimit: 20,
            duplicateSensitivity: 0,
            newUserRestriction: 0,
          },
          rulesCount: 3,
          blockAllLinksFromNoneAdmin: false,
        },
        threatsBlocked: 200,
        safeFiles: 20,
      },
    ],
    threatLogs: [
      {
        id: 1,
        user: "BadGuy_99",
        type: "File",
        content: "free_nitro.exe",
        action: "Blocked",
        time: "10:42 AM",
      },
      {
        id: 2,
        user: "SpamBot_X",
        type: "Link",
        content: "http://click-me.sus",
        action: "Blocked",
        time: "10:35 AM",
      },
      {
        id: 3,
        user: "Unknown",
        type: "Spam",
        content: "Buy Crypto!!! Buy Crypto!!!",
        action: "Muted (1h)",
        time: "09:12 AM",
      },
      {
        id: 4,
        user: "ScriptKiddie",
        type: "Injection",
        content: "<script>alert('hack')</script>",
        action: "Ban",
        time: "Yesterday",
      },
    ],
  };

  const prepareData = prepareProtectData(MOCK_DATA);

  return <TelegramProtectPage protects={prepareData} />;
}