import { Router } from "express";
import setting from "./settings/setting";
import { checkToken } from "../../middleware/check_token";
const router = Router();
router.use("/api", checkToken, setting);

export default router;