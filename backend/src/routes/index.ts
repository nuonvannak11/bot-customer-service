import { Router, Application } from "express";
import api from "./api/api";
import authRoutes from "./auth/auth";
import { IpManager } from "../middleware/ip_manager";

const router = Router();
router.use("/api", IpManager.allowIp, api);
router.use("/auth", IpManager.allowIp, authRoutes);

export default function setUpRoutes(app: Application) {
    app.use(router);
}
