import { wineryRepository } from './winery.repository';

export class WineryService {
  async getAllWineries() {
    return await wineryRepository.findAll();
  }

  async getWineryById(id: string) {
    const winery = await wineryRepository.findBySlugOrId(id);
    if (!winery) throw new Error(`Winery with ID or slug "${id}" not found`);
    return winery;
  }

  async createWinery(data: any) {
    return await wineryRepository.create(data);
  }

  async updateWinery(id: string, data: any) {
    await this.getWineryById(id);
    return await wineryRepository.update(id, data);
  }

  async deleteWinery(id: string) {
    await this.getWineryById(id);
    return await wineryRepository.delete(id);
  }
}

export const wineryService = new WineryService();
