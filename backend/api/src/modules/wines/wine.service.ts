import { wineRepository } from './wine.repository';
import { cacheService } from '../../shared/cache.service';

export class WineService {
  async getAllWines() {
    const cached = cacheService.get<any[]>('raw_wines_catalog');
    if (cached) return cached;

    const wines = await wineRepository.findAll();
    cacheService.set('raw_wines_catalog', wines || [], 30);
    return wines || [];
  }

  async getWineById(id: string) {
    const cached = cacheService.get<any>(`wine:${id}`);
    if (cached) return cached;

    const catalog = cacheService.get<any[]>('raw_wines_catalog');
    if (catalog) {
      const found = catalog.find((w: any) => String(w.id) === String(id));
      if (found) {
        cacheService.set(`wine:${id}`, found, 60);
        return found;
      }
    }

    const wine = await wineRepository.findById(id);
    if (!wine) throw new Error(`Wine with ID ${id} not found`);
    cacheService.set(`wine:${id}`, wine, 60);
    return wine;
  }

  async createWine(data: any) {
    const created = await wineRepository.create(data);
    cacheService.invalidate('raw_wines_catalog');
    cacheService.invalidateWines();
    return created;
  }

  async updateWine(id: string, data: any) {
    await this.getWineById(id);
    const updated = await wineRepository.update(id, data);
    cacheService.invalidate('raw_wines_catalog');
    cacheService.invalidate(`wine:${id}`);
    cacheService.invalidateWines();
    return updated;
  }

  async deleteWine(id: string) {
    await this.getWineById(id);
    const deleted = await wineRepository.delete(id);
    cacheService.invalidate('raw_wines_catalog');
    cacheService.invalidate(`wine:${id}`);
    cacheService.invalidateWines();
    return deleted;
  }
}

export const wineService = new WineService();

