import { AssetType } from "@/types/type.telegram";
import { SetStateProps } from "@/interface";

export interface GroupManagementProps {
  managedAssets: GroupChannel[];
  activeId: number | null;
  onSelect: (id: number) => void;
  active: GroupChannel[];
  onAdd: (asset: GroupChannel) => void;
  onRemove: (id: number) => void;
}

export interface ManagedAsset {
  id: number;
  name: string;
  type: AssetType;
}

export interface LinkSentryProps {
  contextLabel?: string;
  domains: string[];
  newDomain: string;
  onNewDomainChange: (value: string) => void;
  onAdd: () => void;
  onRemove: (domain: string) => void;
  onBlockAllLinksFromNoneAdmin: (value: boolean) => void;
  onSave?: () => void;
  blockAllLinksFromNoneAdmin: boolean;
}

export interface SpamConfigState {
  rateLimit: number;
  duplicateSensitivity: number;
  newUserRestriction: number;
}

export interface TransformedConfig {
  rateLimit: number;
  duplicateSensitivity: string;
  newUserRestriction: string;
}

export interface SpamAegisProps {
  contextLabel?: string;
  initialData?: SpamConfigState;
  onSave?: (data: TransformedConfig) => void;
}

export interface ProtectData {
  exceptionLinks: string[];
  exceptionFiles: string[];
  groupChannel: GroupChannel[];
  threatLogs: ThreatLog[];
}

export interface GroupChannel {
  chatId: string;
  name: string;
  avartar: string;
  type: "Group" | "Channel";
  allowScan: boolean;
  upTime: number;
  threatsBlocked: number;
  safeFiles: number;
  config: ChannelConfig;
}

export interface ChannelConfig {
  blockedExtensions: string[];
  blacklistedDomains: string[];
  spam: SpamConfig;
  rulesCount: number;
  blockAllLinksFromNoneAdmin: boolean;
  blockAllExstationFromNoneAdmin: boolean,
}

export interface SpamConfig {
  rateLimit: number;
  duplicateSensitivity: number;
  newUserRestriction: number;
}

export interface ThreatLog {
  id: number;
  user: string;
  type: "File" | "Link" | "Spam" | "Injection";
  content: string;
  action: string;
  time: string;
}

export interface PreparedData {
  exceptionLinks: string[];
  exceptionFiles: string[];
  group: GroupChannel[];
  channel: GroupChannel[];
  active: GroupChannel[];
  threatLogs: ThreatLog[];
}

export interface setFileGuardProps {
  blockUrlNoneAdmin: boolean,
  blockExtNoneAdmin: boolean,
}

export interface FileGuardProps extends SetStateProps<setFileGuardProps> {
  contextLabel?: string;
  extensions: string[];
  newExt: string;
  onNewExtChange: (value: string) => void;
  onAdd: () => void;
  onRemove: (ext: string) => void;
  onSave: () => void;
  t: (key: string) => string;
}

export interface TelegramContact {
  id: number;
  name: string;
  username: string;
  avatar: string;
  time: string;
  msg: string;
  unread: number,
  status: string;
  category: string;
}