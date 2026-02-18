import { Request, Response } from "express";
import { io } from "../server";
import { eLog, empty } from "../utils/util";
import { ProtectController } from "./controller_protect";
import { ConfrimGroupChanel } from "../interface/interface";
import userController from "./controller_user";

class ControllerApi extends ProtectController {
    public async confirmGroup(req: Request, res: Response): Promise<void> {
        try {
            const results = await this.protect_post<ConfrimGroupChanel>(req, res);
            if (!results) return;
            const { user_id, event, ...payload } = results;
            if (!user_id || !event || empty(payload)) {
                eLog('Redis control emit ignored: invalid payload');
                res.sendStatus(400);
                return;
            }
            const ok = await userController.emitUserEvent(io, user_id, event, payload);
            if (!ok) {
                res.sendStatus(400);
                eLog('Redis control emit ignored: unsupported/invalid event payload');
                return;
            }
            res.sendStatus(200);
        } catch (error: unknown) {
            eLog("Error: ", error);
            res.sendStatus(500);
        }
    }
}

const controller_api = new ControllerApi();
export default controller_api;