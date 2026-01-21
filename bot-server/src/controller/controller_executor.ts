import { Request, Response } from "express";
import { ProtectController } from "./controller_protect";

class ControllerExecutor extends ProtectController {
    async executor(req: Request, res: Response) {

    }
    async execute_data(req: Request, res: Response) {

    }
}
export default new ControllerExecutor();
