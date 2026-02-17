import { Request, Response } from "express";
import { ConfirmGroupChanelSchema, ScanFileSchema } from "../schema";
import { getErrorMessage } from "../helper/errorHandling";
import processor from "../controller/controller_process_file";
import controller_telegram from "./controller_telegram";
import { eLog } from "../libs/lib";


class ControllerFallback {
    public async scan_file(req: Request, res: Response): Promise<Response> {
        try {
            const data = ScanFileSchema.parse(req.body);
            await processor.addTask(data);
            return res.status(200).json({ success: true });
        } catch (error) {
            eLog("Error in scan_file:", getErrorMessage(error));
            return res.status(500).json({ error: "Server error" });
        }
    }

    public async confirm_group_chanel(req: Request, res: Response): Promise<Response> {
        try {
            const data = ConfirmGroupChanelSchema.parse(req.body);
            await controller_telegram.confirmGroupChanel(data);
            return res.status(200).json({ success: true });
        } catch (error) {
            eLog("Error in confirm_group_chanel:", getErrorMessage(error));
            return res.status(500).json({ error: "Server error" });
        }
    }
}

const controllerFallback = new ControllerFallback();
export default controllerFallback;