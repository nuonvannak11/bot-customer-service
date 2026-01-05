import { Router, Application } from "express";
import tiktokRoutes from "./api/tiktok";
import facebookRoutes from "./api/facebook";
import telegramRoutes from "./api/telegram";
import authRoutes from "./auth/auth";

const router = Router();

router.use("/auth", authRoutes);
router.use("/tiktok", tiktokRoutes);
router.use("/facebook", facebookRoutes);
router.use("/telegram", telegramRoutes);

export default function setUpRoutes(app: Application) {
    app.use(router);
}
