import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISystemSetting<T = Record<string, unknown>> extends Document {
    key: string;
    data: T;
    createdAt: Date;
    updatedAt: Date;
}

const SystemSettingSchema = new Schema(
    {
        key: { type: String, required: true, unique: true },
        data: { type: Schema.Types.Mixed, default: {} },
    },
    {
        timestamps: true,
        minimize: false
    }
);

export const getSystemSettingModel = <T = Record<string, unknown>>(): Model<ISystemSetting<T>> => {
    return (mongoose.models.setting_system as Model<ISystemSetting<T>>) ||
        mongoose.model<ISystemSetting<T>>(
            "setting_system",
            SystemSettingSchema
        );
};