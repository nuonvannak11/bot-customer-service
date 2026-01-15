import { Router } from "express";
import { checkToken } from "../../middleware/check_token";
import setting from "./settings/setting";
import upload from "./upload/upload";
import route_user from "./user/index";

const router = Router();
router.use("/setting", checkToken, setting);
router.use("/upload", checkToken, upload);
router.use("/user", checkToken, route_user);
export default router;