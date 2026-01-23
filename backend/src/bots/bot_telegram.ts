import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";

type BotInfo = {
    id: number;
    username: string;
    client: TelegramClient;
};

export class BotTelegram {
    private bots = new Map<number, BotInfo>();
}
