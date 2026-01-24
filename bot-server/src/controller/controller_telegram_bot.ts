import { Request, Response } from "express";
import { Context } from "grammy";
import type { Message } from "grammy/types";
import mongoose, { set } from "mongoose";
import AppUser from "../models/model_user";
import Platform from "../models/model_platform";
import Setting from "../models/model_settings";

import CheckJWT from "../helper/check_jwt";
import { get_env } from "../utils/get_env";
import { empty, eLog } from "../utils/util";
import { ProtectController } from "./controller_protect";
import processor from "../bots/bot_process_bg_img";
import FileStore from "../models/model_file_store";
import { response_data } from "../libs/lib";
import controller_redis from "./controller_redis";

class ControllerTelegramBot extends ProtectController {
    public async message(ctx: Context, user_id: string, msg: Message) {
        if ("text" in msg) return this.onText(ctx, user_id, msg as Message.TextMessage);
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

    private async onText(ctx: Context, user_id: string, msg: Message.TextMessage) {
        eLog("TEXT:", msg.text);
    }
    private async onPhoto(ctx: Context, user_id: string, msg: Message.PhotoMessage) {
        eLog("PHOTO:", msg.photo);
    }
    private async onDocument(ctx: Context, user_id: string, msg: Message.DocumentMessage) {
        if (!ctx.chat || !ctx.message) return;
        const doc = msg.document;
        const fileName = doc.file_name || "unknown";
        //if (doc.file_size && doc.file_size > 300) { //3 * 1024 * 1024 3MB
        await FileStore.create({
            user_id: user_id,
            telegram_file_id: doc.file_id,
            telegram_unique_id: doc.file_unique_id,
            telegram_chat_id: ctx.chat.id.toString(),
            telegram_message_id: ctx.message.message_id,
            file_name: doc.file_name,
            mime_type: doc.mime_type,
            file_size: doc.file_size,
            bot_token_id: ctx.api.token
        });
        await controller_redis.publish("virus_alerts", {
            user_id: user_id,
            chat_id: ctx.chat.id.toString(),
            message_id: ctx.message.message_id,
        });
        //}
        // const badExts = [".exe", ".bat", ".cmd", ".sh", ".apk"];
        // if (badExts.some(ext => fileName.toLowerCase().endsWith(ext))) {
        //     await ctx.deleteMessage();
        //     eLog("🚨 File type not allowed.");
        //     return;
        // }
        // processor.addTask(ctx, doc, user_id);
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
