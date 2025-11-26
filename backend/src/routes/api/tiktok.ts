import { Router } from "express";
const router = Router();

router.get("/callback", (req, res) => {
  res.send("TikTok callback");
});

export default router;
