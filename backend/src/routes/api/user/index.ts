import { Router } from "express";
import user_profile from "./user-profile";
const router = Router();

router.use("/profile", user_profile);

export default router;