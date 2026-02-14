import { Router, Application } from "express";
import api from "./api/api";
import authRoutes from "./auth/auth";
import { allowIp } from "../middleware/middleware.allow_ip";

const router = Router();
router.use("/api", allowIp, api);
router.use("/auth", allowIp, authRoutes);

export default function setUpRoutes(app: Application) {
    app.use(router);
}
