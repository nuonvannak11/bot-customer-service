import { Router } from "express";
import tiktokRoutes from "./api/tiktok";
import facebookRoutes from "./api/facebook";
import telegramRoutes from "./api/telegram";

const router = Router();

router.use("/tiktok", tiktokRoutes);
router.use("/facebook", facebookRoutes);
router.use("/telegram", telegramRoutes);

export default router;
