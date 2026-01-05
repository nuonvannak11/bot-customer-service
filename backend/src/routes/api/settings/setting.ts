import { Router } from "express";
import setting_telegram from "./setting_telegram";
const router = Router();

router.use("/setting/telegram", setting_telegram);

export default router;