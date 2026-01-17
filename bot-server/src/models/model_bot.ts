import mongoose from 'mongoose'

const BotSchema = new mongoose.Schema({
    customer_id: { type: String, required: true, index: true },
    bot_id: { type: String, required: true, unique: true },
    token_enc: { type: String, required: true },
    username: { type: String },
    worker_id: { type: String, required: true },
    status: { type: String, enum: ['active', 'stopped'], default: 'active' },
}, { timestamps: true })

export const BotModel = mongoose.model('bots', BotSchema)

