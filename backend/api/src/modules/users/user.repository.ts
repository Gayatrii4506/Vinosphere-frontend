import { db } from '../../adapters/database';

export class UserRepository {
  private readonly tableName = 'users';

  async findAll() {
    return await db.find(this.tableName);
  }

  async findById(id: string) {
    return await db.findOne(this.tableName, { id });
  }

  async findByAuthId(authId: string) {
    return await db.findOne(this.tableName, { auth_id: authId });
  }

  async findByEmail(email: string) {
    return await db.findOne(this.tableName, { email });
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

export const userRepository = new UserRepository();
