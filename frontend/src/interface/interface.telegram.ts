import { AssetType } from "../../types/type.telegram";
import { SetStateProps } from "@/interface";

export interface ApiResponse<T = unknown> {
    code: number;
    message: string;
    data: T;
}

export interface ManagedAsset {
  id: number;
  name: string;
  type: AssetType;
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
  type: "private" | "group" | "supergroup" | "channel";
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
  blockAllExstationFromNoneAdmin: boolean;
  badWords: string[];
  blockBadWordsEnabled: boolean;
}

export interface SpamConfig {
  rateLimit: number;
  duplicateSensitivity: number;
  newUserRestriction: number;
}

export interface ThreatLog {
  chatId: string;
  offenderName: string;
  threatType: string;
  content: string;
  action: string;
  createdAt: string;
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
  blockUrlNoneAdmin: boolean;
  blockExtNoneAdmin: boolean;
}

export interface TelegramContact {
  id: number;
  name: string;
  username: string;
  avatar: string;
  time: string;
  msg: string;
  unread: number;
  status: string;
  category: string;
}

export interface SpamSettingCardProps {
  label: string;
  valueDisplay: string;
  isActive?: boolean;
  children: React.ReactNode;
  description?: string;
}

export interface ActionButtonProps {
  disabled: boolean;
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
  colorClass: "indigo" | "purple";
}

export interface TelegramProtectPageProps {
  protects: PreparedData;
  hash_key: string;
};

export interface TelegramProtectPageState {
  managedAssets: Omit<
    PreparedData,
    "threatLogs" | "exceptionFiles" | "exceptionLinks"
  >;
  exceptionFiles: string[];
  exceptionLinks: string[];
  activeAsset: GroupChannel;
}

export interface GroupManagementProps extends SetStateProps<TelegramProtectPageState> {
  loading: boolean;
  handlers: {
    onAdd: (asset: GroupChannel) => void;
    onRemove: (asset: GroupChannel) => void;
    onSave: (asset: GroupChannel) => void;
  };
  t: (key: string) => string;
}

export interface ProtectChildProps extends Omit<
  GroupManagementProps,
  "handlers"
> {
  handlers: {
    onSave: (asset: GroupChannel) => void;
  };
}

export interface ConfrimGroupChanel {
  data_time: string;
  sender: {
    sender_id: string;
    full_name: string;
    user_name: string;
    type: string;
  };
  group_chanel: {
    chatId: string,
    name: string,
    type: string,
  }
}

export interface ConfirmGroupModalProps {
  t: (key: string) => string;
  event_data: ConfrimGroupChanel | null;
  setConfirmGroupEvent: (data: ConfrimGroupChanel | null) => void;
  onApprove: (data: ConfrimGroupChanel) => void;
}