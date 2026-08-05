import prisma from "../config/prisma";
import { Profile, Role, Prisma } from "@prisma/client";

export class ProfileRepository {
  async findById(id: string): Promise<Profile | null> {
    return prisma.profile.findUnique({
      where: { id }
    });
  }

  async findByEmail(email: string): Promise<Profile | null> {
    return prisma.profile.findUnique({
      where: { email }
    });
  }

  async findAll(): Promise<Profile[]> {
    return prisma.profile.findMany({
      orderBy: { createdAt: "desc" }
    });
  }

  async create(data: Prisma.ProfileCreateInput): Promise<Profile> {
    return prisma.profile.create({
      data
    });
  }

  async update(id: string, data: Prisma.ProfileUpdateInput): Promise<Profile> {
    return prisma.profile.update({
      where: { id },
      data
    });
  }

  async delete(id: string): Promise<Profile> {
    return prisma.profile.delete({
      where: { id }
    });
  }
}

export default new ProfileRepository();
