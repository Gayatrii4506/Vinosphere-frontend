import { db } from '../../adapters/database';

export class WishlistRepository {
  private readonly tableName = 'wishlist';

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

export const wishlistRepository = new WishlistRepository();
