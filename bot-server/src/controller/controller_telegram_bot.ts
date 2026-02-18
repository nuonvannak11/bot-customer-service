import { Context } from "grammy";
import type { Message } from "grammy/types";
import Platform from "../models/model_platform";
import Setting from "../models/model_settings";

import { get_env } from "../utils/get_env";
import { empty, eLog, str_lower, build_url, str_val, expiresAt, formatDateTime } from "../utils/util";
import { ProtectController } from "./controller_protect";
import FileStore from "../models/model_file_store";
import { response_data } from "../libs/lib";
import controller_user from "./controller_user";
import model_settings_bot_telegram from "../models/model_setting_bot_telegram";
import model_bot from "../models/model_bot";
import model_temp_store from "../models/model_temp_store";
import model_telegram_group_chanel from "../models/model_telegram_group_chanel";
import { BotSettingDTO, SenderFullInfo } from "../interface";
import { default_settings_bot } from "../constants/constant.setting";
import hash_data from "../helper/hash_data";
import RedisPublish from "../connection/connection.redis.publish";
import { get_url } from "../libs/get_urls";
import model_message_alert from "../models/model_message_alert";

class ControllerTelegramBot extends ProtectController {
    private botTelegramSetting?: BotSettingDTO;

    private getSenderFullInfo(ctx: Context): SenderFullInfo {
        const msg = ctx.message || (ctx.channelPost) || ('channel_post' in ctx.update ? ctx.update.channel_post : undefined);
        const channel = msg && "sender_chat" in msg ? msg.sender_chat : undefined;
        if (channel) {
            return {
                id: channel.id ?? null,
                username: channel.username ? `@${channel.username}` : null,
                firstName: null,
                lastName: null,
                fullName: channel.title ?? null,
                title: channel.title ?? null,
                isBot: null,
                languageCode: null,
                type: "channel",
            };
        }

        const user = ctx.from;
        const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(" ") || null;

        return {
            id: user?.id ?? null,
            username: user?.username ? `@${user.username}` : null,
            firstName: user?.first_name ?? null,
            lastName: user?.last_name ?? null,
            fullName: fullName,
            title: null,
            isBot: user?.is_bot ?? null,
            languageCode: user?.language_code ?? null,
            type: "user",
        };
    }

    public async bot_setting(init?: boolean): Promise<BotSettingDTO> {
        let settings = this.botTelegramSetting;
        if (!settings || init) {
            const bot_settings = await model_settings_bot_telegram
                .findOne().sort({ createdAt: -1 })
                .select("max_download_size max_upload_size max_retry_download")
                .lean();
            if (bot_settings) {
                settings = {
                    max_download_size: bot_settings.max_download_size,
                    max_upload_size: bot_settings.max_upload_size,
                    max_retry_download: bot_settings.max_retry_download,
                };
            } else {
                settings = default_settings_bot;
            }
            this.botTelegramSetting = settings;
        }
        return settings;
    }

    public async channel_post(ctx: Context, user_id: string, bot_token: string, post: Message) {
        return this.message(ctx, user_id, bot_token, post as unknown as Message);
    }

    public async message(ctx: Context, user_id: string, bot_token: string, msg: Message) {
        if ("text" in msg) return this.onText(ctx, user_id, bot_token, msg as Message.TextMessage);
        if ("photo" in msg) return this.onPhoto(ctx, user_id, msg as Message.PhotoMessage);
        if ("document" in msg) return this.onDocument(ctx, user_id, msg as Message.DocumentMessage);
        if ("audio" in msg) return this.onAudio(ctx, user_id, msg as Message.AudioMessage);
        if ("video" in msg) return this.onVideo(ctx, user_id, msg as Message.VideoMessage);
        if ("voice" in msg) return this.onVoice(ctx, user_id, msg as Message.VoiceMessage);
        if ("sticker" in msg) return this.onSticker(ctx, user_id, msg as Message.StickerMessage);
        if ("animation" in msg) return this.onAnimation(ctx, user_id, msg as Message.AnimationMessage);
        if ("contact" in msg) return this.onContact(ctx, user_id, msg as Message.ContactMessage);
        if ("location" in msg) return this.onLocation(ctx, user_id, msg as Message.LocationMessage);
        if ("poll" in msg) return this.onPoll(ctx, user_id, msg as Message.PollMessage);
        if ("dice" in msg) return this.onDice(ctx, user_id, msg as Message.DiceMessage);
        if ("new_chat_members" in msg) return this.onNewMembers(ctx, user_id, msg as Message.NewChatMembersMessage);
        if ("left_chat_member" in msg) return this.onLeftMember(ctx, user_id, msg as Message.LeftChatMemberMessage);
        return this.onOther(ctx, user_id, msg);
    }

    private async onText(ctx: Context, user_id: string, bot_token: string, msg: Message.TextMessage) {
        try {
            const chat_message = msg.text || "";
            if (!chat_message.startsWith("@")) return;

            const chat_id = ctx.chat?.id?.toString();
            const chatType = ctx.chat?.type;

            if (!chat_id || !user_id) return;

            const existingGroup = await model_telegram_group_chanel.findOne({ chatId: chat_id }).lean();
            if (existingGroup) return;

            const bot_token_enc = hash_data.encryptData(bot_token);
            const botData = await model_bot.findOne({ user_id, bot_token: bot_token_enc }).lean();

            const botUsername = botData?.username || "unknown_bot";
            if (!botData || str_lower(chat_message) !== str_lower(`@${botUsername}`)) {
                return;
            }

            const senderInfo = this.getSenderFullInfo(ctx);
            const dataTime = formatDateTime();

            const sharedPayload = {
                data_time: dataTime,
                sender: {
                    sender_id: str_val(senderInfo.id),
                    full_name: str_val(senderInfo.fullName),
                    user_name: str_val(senderInfo.username),
                    type: str_val(senderInfo.type)
                },
                group_chanel: {
                    chatId: chat_id,
                    name: ctx.chat?.title,
                    type: chatType,
                }
            };

            await Promise.all([
                model_temp_store.updateOne(
                    { key: `confirm_${chat_id}` },
                    {
                        $set: {
                            data: {
                                user_id,
                                bot_token: bot_token_enc,
                                chatId: chat_id,
                                name: ctx.chat?.title,
                                type: chatType,
                                avatar: "",
                            },
                            expireAt: expiresAt(5),
                        },
                        $setOnInsert: { key: `confirm_${chat_id}` }
                    },
                    { upsert: true }
                ),

                model_message_alert.updateOne(
                    { user_id, chatId: chat_id },
                    {
                        $set: {
                            user_id,
                            chatId: chat_id,
                            type: "confirm_group_chanel",
                            payload: sharedPayload
                        },
                        $setOnInsert: { user_id, chatId: chat_id }
                    },
                    { upsert: true }
                ),

                RedisPublish.fallbackPublish({
                    url: get_url("confirm_group_chanel", get_env("SERVER_SOCKET")),
                    channel: "socket:control:emit",
                    message: {
                        user_id,
                        event: "confirm:group-chanel",
                        payload: {
                            ...sharedPayload,
                            user_id,
                            event: "confirm:group-chanel"
                        }
                    }
                })
            ]);
            eLog("TEXT:", msg);
        } catch (err: unknown) {
            eLog("error:", err);
        }
    }

    private async onPhoto(ctx: Context, user_id: string, msg: Message.PhotoMessage) {
        eLog("PHOTO:", msg.photo);
    }

    private async onDocument(ctx: Context, user_id: string, msg: Message.DocumentMessage) {
        try {
            const doc = msg.document;
            const file_size = doc.file_size || 0;
            const settings_bot = await this.bot_setting();
            if (!ctx.chat || !ctx.message || file_size > settings_bot.max_download_size) return;

            const chat_id = ctx.chat?.id?.toString();
            if (!chat_id) return;

            const get_check_file = await controller_user.get_user_settings(user_id);
            if (!get_check_file) return;

            const chatSetting = get_check_file.find(item => item.chat_id === chat_id);
            if (!chatSetting) return;

            const fileName = (doc.file_name || "").toLowerCase();
            if (!fileName) return;

            const badExts = chatSetting.files.map(ext => ext.toLowerCase().trim());
            const blocked = badExts.some(ext => fileName.endsWith(ext));

            if (blocked) {
                await ctx.deleteMessage();
                eLog(`🚨 Blocked file: ${fileName}`);
                return;
            }
            const add_file = await FileStore.create({
                user_id: user_id,
                telegram_file_id: doc.file_id,
                telegram_unique_id: doc.file_unique_id,
                telegram_chat_id: chat_id,
                telegram_message_id: ctx.message.message_id,
                file_name: doc.file_name,
                mime_type: doc.mime_type,
                file_size: doc.file_size,
                bot_token_id: ctx.api.token
            });
            if (add_file) {
                await RedisPublish.fallbackPublish({
                    url: get_url("scan_file"),
                    channel: "scan_file",
                    message: {
                        server_ip: str_val(get_env("IP")),
                        port: str_val(get_env("PORT")),
                        user_id: user_id,
                        chat_id: str_val(ctx.chat.id),
                        message_id: ctx.message.message_id,
                    }
                });
            }
        } catch (error) {
            eLog("❌ onDocument Error:", error);
        }
    }

    private async onAudio(ctx: Context, user_id: string, msg: Message.AudioMessage) {
        eLog("AUDIO:", msg.audio);
    }
    private async onVideo(ctx: Context, user_id: string, msg: Message.VideoMessage) {
        eLog("VIDEO:", msg.video);
    }
    private async onVoice(ctx: Context, user_id: string, msg: Message.VoiceMessage) {
        eLog("VOICE:", msg.voice);
    }
    private async onSticker(ctx: Context, user_id: string, msg: Message.StickerMessage) {
        if (msg.sticker.is_animated) {
            eLog("ANIMATED STICKER:", msg.sticker);
        }
        if (msg.sticker.is_video) {
            eLog("VIDEO STICKER:", msg.sticker);
        }
        if (msg.sticker.type === "custom_emoji") {
            eLog("CUSTOM EMOJI STICKER:", msg.sticker);
        }
    }
    private async onAnimation(ctx: Context, user_id: string, msg: Message.AnimationMessage) {
        eLog("ANIMATION:", msg.animation);
    }
    private async onContact(ctx: Context, user_id: string, msg: Message.ContactMessage) {
        eLog("CONTACT:", msg.contact);
    }
    private async onLocation(ctx: Context, user_id: string, msg: Message.LocationMessage) {
        eLog("LOCATION:", msg.location);
    }
    private async onPoll(ctx: Context, user_id: string, msg: Message.PollMessage) {
        eLog("POLL:", msg.poll);
    }
    private async onDice(ctx: Context, user_id: string, msg: Message.DiceMessage) {
        eLog("DICE:", msg.dice);
    }
    private async onNewMembers(ctx: Context, user_id: string, msg: Message.NewChatMembersMessage) {
        eLog("NEW MEMBERS:", msg.new_chat_members);
    }
    private async onLeftMember(ctx: Context, user_id: string, msg: Message.LeftChatMemberMessage) {
        eLog("LEFT MEMBER:", msg.left_chat_member);
    }
    private async onOther(ctx: Context, user_id: string, msg: Message) {
        eLog("OTHER:", msg);
    }

    public async command(ctx: Context, user_id: string, command?: string) {
        return;
        if (!command) return;
        if (command === "start") {
            ctx.reply("Welcome to the bot!");
        }
        if (command === "help") {
            ctx.reply("Here are the available commands:\n/start - Start the bot\n/help - Show this help message");
        }
    }
}

export default new ControllerTelegramBot;
