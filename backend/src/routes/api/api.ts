import { Router } from "express";
import { checkToken } from "../../middleware/check_token";
import setting from "./settings/setting";
import upload from "./upload/upload";

const router = Router();
router.use("/setting", checkToken, setting);
router.use("/upload", checkToken, upload);
export default router;