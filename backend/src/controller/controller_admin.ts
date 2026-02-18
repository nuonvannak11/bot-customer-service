import { Request, Response } from "express";
import { response_data } from "../libs/lib";
import { ProtectController } from "./controller_protect";
import { empty } from "../utils/util";
import { eLog } from "../libs/lib";
import { AddServerRequest } from "../interface";
import { GetSeverRequest } from "../interface/interface_user";
import { addIpToWhitelist, removeIpFromWhitelist } from "../middleware/middleware.allow_ip";
import controller_server from "./controller_server";

class AdminController extends ProtectController {
    public async check_admin(req: Request, res: Response) {
        try {
            const check_token = await this.protect_get(req, res);
            if (!check_token) return;
            return response_data(res, 200, "Admin verified", { isAdmin: true });
        } catch (error) {
            return response_data(res, 500, "Internal server error", []);
        }
    }

    public async request_get_servers(req: Request, res: Response): Promise<Response | void> {
        try {
            const result = await this.protect_get<GetSeverRequest>(req, res, false);
            if (!result) return;
            const { user_id, token, server_ip } = result;
            if (!user_id || !token) {
                return response_data(res, 401, "Unauthorized", []);
            }

            const targetIp = empty(server_ip) ? undefined : server_ip;
            const servers = await controller_server.get_servers(targetIp);
            if (targetIp && !servers) {
                return response_data(res, 404, "Server not found", []);
            }
            return response_data(res, 200, "Success", servers || []);
        } catch (err) {
            eLog("❌ request_get_servers error:", err);
            return response_data(res, 500, "Internal server error", []);
        }
    }

    public async request_add_server(req: Request, res: Response): Promise<Response | void> {
        try {
            const result = await this.protect_post<AddServerRequest>(req, res, true);
            if (!result) return;
            const { server_id, server_ip, server_port } = result;
            if (!server_id || !server_ip || !server_port) {
                return response_data(res, 400, "Invalid request", []);
            }
            const check_server = await controller_server.get_servers(server_ip);
            if (check_server) {
                return response_data(res, 400, "Server already exists", []);
            }
            const add_server = await controller_server.add_server({
                server_id,
                ip: server_ip,
                port: Number(server_port)
            });
            if (!add_server) {
                return response_data(res, 400, "Failed to add server", []);
            }
            return response_data(res, 200, "Server added successfully", add_server);
        } catch (err) {
            eLog("❌ request_add_server error:", err);
            return response_data(res, 500, "Internal server error", []);
        }
    }

    public async request_delete_server(req: Request, res: Response): Promise<Response | void> {
        try {
            const result = await this.protect_post<GetSeverRequest>(req, res, true);
            if (!result) return;
            const { server_ip } = result;
            if (!server_ip) {
                return response_data(res, 400, "Invalid request", []);
            }
            const delete_server = await controller_server.delete_server(server_ip);
            if (!delete_server) {
                return response_data(res, 400, "Failed to delete server", []);
            }
            return response_data(res, 200, "Server deleted successfully", []);
        } catch (err) {
            eLog("❌ request_delete");
            return response_data(res, 500, "Internal server error", []);
        }
    }

    public async handleIp(req: Request, res: Response): Promise<Response | void> {
        try {
            const result = await this.protect_post<GetSeverRequest>(req, res, true);
            if (!result) return;
            const { server_ip } = result;
            if (!server_ip) {
                return response_data(res, 400, "Invalid request", []);
            }

        } catch (err) {
            eLog("❌ handleIp error:", err);
            return response_data(res, 500, "Internal server error", []);
        }
    }
}
const admin = new AdminController();
export default admin;