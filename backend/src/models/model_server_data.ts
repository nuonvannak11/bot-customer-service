import mongoose, { Document, Schema } from 'mongoose';

export interface IServerData extends Document {
    ip?: string;
    server_id?: string;
    port?: number;
    name?: string;
    type?: string;
    status?: string;
    version?: string;
    os?: string;
    ram?: string;
    cpu?: string;
    disk?: string;
    uptime?: string;
    free_cpu?: string;
    free_disk?: string;
    free_ram?: string;
    bot_run?: number;
}

const ServerDataSchema = new Schema<IServerData>({
    ip: { type: String, required: true, unique: true },
    port: { type: Number, default: null },
    name: { type: String, default: "" },
    server_id: { type: String, default: "" },
    type: { type: String, default: "" },
    status: { type: String, default: "" },
    version: { type: String, default: "" },
    os: { type: String, default: "" },
    ram: { type: String, default: "" },
    cpu: { type: String, default: "" },
    disk: { type: String, default: "" },
    uptime: { type: String, default: "" },
    free_disk: { type: String, default: "" },
    free_ram: { type: String, default: "" },
    free_cpu: { type: String, default: "" },
    bot_run: { type: Number, default: null },
}, {
    timestamps: true
});

const ServerData = mongoose.model<IServerData>('server_data', ServerDataSchema);

export default ServerData;
