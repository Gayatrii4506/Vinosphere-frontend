import { Router } from "express";
import profileController from "../controllers/ProfileController";

const router = Router();

router.post("/", profileController.createProfile);
router.get("/", profileController.getAllProfiles);
router.get("/:id", profileController.getProfileById);
router.put("/:id", profileController.updateProfile);
router.delete("/:id", profileController.deleteProfile);

export default router;
