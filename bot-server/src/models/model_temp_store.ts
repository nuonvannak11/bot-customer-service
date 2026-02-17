import mongoose, { Schema, Document } from "mongoose";

export interface ITempStore extends Document {
    key: string;
    data: any;
    expireAt: Date;
}

const TempStoreSchema = new Schema<ITempStore>(
    {
        key: { type: String, required: true, index: true },
        data: { type: Schema.Types.Mixed },
        expireAt: { type: Date, required: true }
    },
    { timestamps: true }
);
TempStoreSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<ITempStore>("temp_store", TempStoreSchema);