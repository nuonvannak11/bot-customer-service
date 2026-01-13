import { Router } from "express";
import upload_r2 from "./upload_r2";
const router = Router();

router.use("/r2", upload_r2);

export default router;