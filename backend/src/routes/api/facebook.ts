import { Router } from "express";
const router = Router();

router.get("/callback", (req, res) => {
  res.send("Facebook callback");
});

export default router;
