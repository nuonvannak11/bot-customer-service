import { Router } from "express";
const router = Router();

router.get("/callback", (req, res) => {
  res.send("Telegram callback");
});

export default router;
