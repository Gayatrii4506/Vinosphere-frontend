import profileRepository, { ProfileRepository } from "../repositories/ProfileRepository";
import { Profile, Role } from "@prisma/client";

export interface CreateProfileDTO {
  email: string;
  fullName?: string;
  role?: Role;
}

export interface UpdateProfileDTO {
  fullName?: string;
  role?: Role;
}

export class ProfileService {
  constructor(private repo: ProfileRepository = profileRepository) {}

  async createProfile(dto: CreateProfileDTO): Promise<Profile> {
    if (!dto.email || !dto.email.includes("@")) {
      throw new Error("Invalid or missing email address");
    }

    const existing = await this.repo.findByEmail(dto.email);
    if (existing) {
      throw new Error("Profile with this email already exists");
    }

    return this.repo.create({
      email: dto.email,
      fullName: dto.fullName,
      role: dto.role || Role.USER
    });
  }

  async getProfileById(id: string): Promise<Profile> {
    const profile = await this.repo.findById(id);
    if (!profile) {
      throw new Error("Profile not found");
    }
    return profile;
  }

  async getAllProfiles(): Promise<Profile[]> {
    return this.repo.findAll();
  }

  async updateProfile(id: string, dto: UpdateProfileDTO): Promise<Profile> {
    await this.getProfileById(id);
    return this.repo.update(id, dto);
  }

  async deleteProfile(id: string): Promise<Profile> {
    await this.getProfileById(id);
    return this.repo.delete(id);
  }
}

export default new ProfileService();
