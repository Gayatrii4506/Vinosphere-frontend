import { db } from '../../adapters/database';

export class ExperienceRepository {
  private readonly tableName = 'experiences';

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

export const experienceRepository = new ExperienceRepository();
