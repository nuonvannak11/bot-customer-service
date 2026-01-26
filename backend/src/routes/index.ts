import { Router, Application } from "express";
import api from "./api/api";
import authRoutes from "./auth/auth";

const router = Router();
router.use("/api", api);
router.use("/auth", authRoutes);

export default function setUpRoutes(app: Application) {
    app.use(router);
}
