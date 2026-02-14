import { Request, Response } from "express";
import model_server_data, { IServerData } from "../models/model_server_data";
import { response_data } from "../libs/lib";
import { eLog } from "../utils/util";
import { request_get } from "../helper/helper.request";

type ServerApiResponse = Omit<IServerData, 'bot_run' | 'created_at' | 'updated_at'>;

class ServerManagement {
    public async init_server(ip: string): Promise<ServerApiResponse | null> {
        try {
            if (!ip) return null;
            const url = "http://" + ip + ":9000";
            const response = await request_get<ServerApiResponse>({ url, timeout: 10000 });
            if (response.success === false) return null;
            return response.data;
        } catch (err) {
            eLog("❌ init_server error:", err);
            return null;
        }
    }

    public async get_servers(ip?: string): Promise<IServerData | IServerData[] | null> {
        try {
            const query = ip
                ? model_server_data.findOne({ ip }).lean()
                : model_server_data.find().lean();
            const result = await query;
            if (!result) return null;
            return result;
        } catch (err) {
            eLog("❌ get_servers error:", err);
            return null;
        }
    }

    public async add_server(option: Partial<IServerData>): Promise<IServerData | null> {
        try {
            const { ip, server_id, port } = option;
            if (!ip || !server_id || !port) return null;
            const existingServer = await model_server_data.findOne({ ip }).lean();
            if (existingServer) return existingServer;
            const init_server_data = await this.init_server(ip);
            if (!init_server_data) return null;
            const { port: _port, ...data } = init_server_data;
            return await model_server_data.create({
                ...data,
                port,
                server_id,
                bot_run: 0,
            });
        } catch (err) {
            eLog("❌ add_server error:", err);
            return null;
        }
    }

    public async delete_server(ip: string): Promise<boolean> {
        try {
            if (!ip) return false;
            const result = await model_server_data.deleteOne({ ip });
            return result.deletedCount === 1;
        } catch (err) {
            eLog("❌ delete_server error:", err);
            return false;
        }
    }

    public async update_server(ip: string, option: Partial<IServerData>): Promise<IServerData | null> {
        try {
            if (!ip) return null;
            return await model_server_data.findOneAndUpdate(
                { ip },
                { $set: option },
                { new: true }
            ).lean();
        } catch (err) {
            eLog("❌ update_server error:", err);
            return null;
        }
    }

    public async get_server_run_bot(): Promise<IServerData | null> {
        try {
            const servers = await this.get_servers();
            if (!servers || !Array.isArray(servers)) return null;
            const availableServer = servers.find((server) => {
                const free_ram = server.free_ram?.replace(/mb/i, "").trim() || "0";
                const free_cpu = server.free_cpu?.replace(/%/i, "").trim() || "0";
                const freeRamNumber = Number(free_ram);
                const freeCpuNumber = Number(free_cpu);
                return freeRamNumber > 100 && freeCpuNumber > 70;
            });
            return availableServer || null;
        } catch (err) {
            eLog("❌ get_server_run_bot error:", err);
            return null;
        }
    }
    
}

const server = new ServerManagement();
export default server;