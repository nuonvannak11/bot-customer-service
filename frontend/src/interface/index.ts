export interface TelegramBotSettingsConfig {
  botUsername: string;
  botToken: string;
  webhookUrl: string;
  webhookEnabled: boolean;
  notifyEnabled: boolean;
  silentMode: boolean;
}