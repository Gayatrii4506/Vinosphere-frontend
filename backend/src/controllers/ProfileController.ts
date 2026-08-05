import { Request, Response } from "express";
import profileService, { ProfileService } from "../services/ProfileService";

export class ProfileController {
  constructor(private service: ProfileService = profileService) {}

  createProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, fullName, role } = req.body;
      const profile = await this.service.createProfile({ email, fullName, role });
      res.status(201).json({
        success: true,
        data: profile
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to create profile"
      });
    }
  };

  getAllProfiles = async (_req: Request, res: Response): Promise<void> => {
    try {
      const profiles = await this.service.getAllProfiles();
      res.status(200).json({
        success: true,
        data: profiles
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch profiles"
      });
    }
  };

  getProfileById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = String(req.params.id);
      const profile = await this.service.getProfileById(id);
      res.status(200).json({
        success: true,
        data: profile
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message || "Profile not found"
      });
    }
  };

  updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = String(req.params.id);
      const { fullName, role } = req.body;
      const updated = await this.service.updateProfile(id, { fullName, role });
      res.status(200).json({
        success: true,
        data: updated
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to update profile"
      });
    }
  };

  deleteProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = String(req.params.id);
      await this.service.deleteProfile(id);
      res.status(200).json({
        success: true,
        message: "Profile deleted successfully"
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to delete profile"
      });
    }
  };
}

export default new ProfileController();
