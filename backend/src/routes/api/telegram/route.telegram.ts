import { Router } from "express";
import route_bot from "./route.bot";
const router = Router();

router.use("/bot", route_bot);

export default router;