import { NextFunction, Request, Response, Router, Application } from "express";
import { safeWithTimeout } from "../utils/util";


const router = Router();

router.post("/post-emit", async (req: Request, res: Response, next: NextFunction) => {
    
});

export default function setUpRoutes(app: Application) {
    app.use(router);
}

