import { experienceRepository } from './experience.repository';

export class ExperienceService {
  async getAllExperiences() {
    return await experienceRepository.findAll();
  }

  async getExperienceById(id: string) {
    const experience = await experienceRepository.findById(id);
    if (!experience) throw new Error(`Experience with ID ${id} not found`);
    return experience;
  }

  async createExperience(data: any) {
    return await experienceRepository.create(data);
  }

  async updateExperience(id: string, data: any) {
    await this.getExperienceById(id);
    return await experienceRepository.update(id, data);
  }

  async deleteExperience(id: string) {
    await this.getExperienceById(id);
    return await experienceRepository.delete(id);
  }
}

export const experienceService = new ExperienceService();
