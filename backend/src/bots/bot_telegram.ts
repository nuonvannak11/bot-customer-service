import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";

type BotInfo = {
    id: number;
    username: string;
    client: TelegramClient;
};

export class TelegramBotController {
    private bots = new Map<number, BotInfo>();

    constructor(
        private apiId: number,
        private apiHash: string
    ) { }

    async startBot(botToken: string) {
        const client = new TelegramClient(
            new StringSession(""),
            this.apiId,
            this.apiHash,
            { connectionRetries: 5 }
        );

        await client.start({
            botAuthToken: botToken,
        });

        const me = await client.getMe();

        const botId = me.id;
        const username = me.username ?? "unknown";

        if (this.bots.has(botId)) {
            await client.disconnect();
            throw new Error("Bot already running");
        }

        this.bots.set(botId, {
            id: botId,
            username,
            client,
        });

        console.log(`🤖 Bot started: ${username} (${botId})`);

        return { botId, username };
    }

    async stopBot(botId: number) {
        const info = this.bots.get(botId);
        if (!info) return false;

        await info.client.disconnect();
        this.bots.delete(botId);

        console.log(`🛑 Bot ${botId} stopped`);
        return true;
    }

    listBots() {
        return [...this.bots.values()].map(b => ({
            id: b.id,
            username: b.username,
        }));
    }

    getBot(botId: number) {
        return this.bots.get(botId)?.client;
    }
}
