import { db } from '../../adapters/database';

export class WineRepository {
  private readonly tableName = 'wines';

  async findAll() {
    return await db.find(this.tableName);
  }

  async findById(id: string) {
    return await db.findOne(this.tableName, { id });
  }

  async create(data: any) {
    return await db.create(this.tableName, data);
  }

  async update(id: string, data: any) {
    return await db.update(this.tableName, id, data);
  }

  async delete(id: string) {
    return await db.delete(this.tableName, id);
  }
}

export const wineRepository = new WineRepository();
