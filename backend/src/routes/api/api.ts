import { Router } from "express";
import setting from "./settings/setting";
import { checkToken } from "../../middleware/check_token";
const router = Router();
router.use("/setting", checkToken, setting);

export default router;