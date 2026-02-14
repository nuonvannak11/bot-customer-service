import { Router } from "express";
import { checkToken } from "../../middleware/check_token";
import admin from "./admin/route.admin";
import setting from "./settings/setting";
import route_telegram from "./telegram/route.telegram";
import upload from "./upload/upload";
import route_user from "./user/index";

const router = Router();
router.use("/admin", checkToken, admin);
router.use("/setting", checkToken, setting);
router.use("/telegram",checkToken, route_telegram);
router.use("/upload", checkToken, upload);
router.use("/user", checkToken, route_user);
export default router;