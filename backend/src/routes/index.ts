import { Router } from "express";
import profileRouter from "./profile.routes";

const router = Router();

router.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend is running"
  });
});

router.use("/api/v1/profile", profileRouter);

export default router;
