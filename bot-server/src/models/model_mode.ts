import mongoose from 'mongoose'

const ModeSchema = new mongoose.Schema({
    customer_id: { type: String, required: true, index: true },
    bot_id: { type: String, required: true, index: true },
    chat_id: { type: String, required: true, index: true },
    title: { type: String },
    mode: { type: [String], default: [] },
    active: { type: Boolean, default: true },
    verified: { type: Boolean, default: false },
}, { timestamps: true })

export const ModeModel = mongoose.model('mod_action', ModeSchema)
