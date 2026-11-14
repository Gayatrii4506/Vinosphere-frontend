import { SupabaseClient } from '@supabase/supabase-js';
import { IDatabaseAdapter } from './IDatabaseAdapter';

export class SupabaseAdapter implements IDatabaseAdapter {
  public readonly client: SupabaseClient;

  constructor(client: SupabaseClient) {
    this.client = client;
  }

  async find<T = any>(table: string, filters?: Record<string, any>): Promise<T[]> {
    let query = this.client.from(table).select('*');
    
    if (filters) {
      // Apply simple equality filters
      for (const [key, value] of Object.entries(filters)) {
        query = query.eq(key, value);
      }
    }

    const { data, error } = await query;
    
    if (error) throw new Error(`[SupabaseAdapter.find] ${error.message}`);
    return data as T[];
  }

  async findWithRelations<T = any>(table: string, select: string, filters?: Record<string, any>): Promise<T[]> {
    let query = this.client.from(table).select(select);
    
    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        query = query.eq(key, value);
      }
    }

    const { data, error } = await query;
    if (error) throw new Error(`[SupabaseAdapter.findWithRelations] ${error.message}`);
    return data as T[];
  }

  async findOne<T = any>(table: string, filters: Record<string, any>): Promise<T | null> {
    let query = this.client.from(table).select('*');
    
    for (const [key, value] of Object.entries(filters)) {
      query = query.eq(key, value);
    }

    // Limit to 1 and use maybeSingle to safely return null if not found
    const { data, error } = await query.limit(1).maybeSingle();
    
    if (error) throw new Error(`[SupabaseAdapter.findOne] ${error.message}`);
    return data as T | null;
  }

  async create<T = any>(table: string, data: Partial<T>): Promise<T> {
    const { data: createdData, error } = await this.client
      .from(table)
      .insert(data as any)
      .select()
      .single();
      
    if (error) throw new Error(`[SupabaseAdapter.create] ${error.message}`);
    return createdData as T;
  }

  async update<T = any>(table: string, id: string, data: Partial<T>): Promise<T> {
    const { data: updatedData, error } = await this.client
      .from(table)
      .update(data as any)
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw new Error(`[SupabaseAdapter.update] ${error.message}`);
    return updatedData as T;
  }

  async delete(table: string, id: string): Promise<boolean> {
    const { error } = await this.client
      .from(table)
      .delete()
      .eq('id', id);
      
    if (error) throw new Error(`[SupabaseAdapter.delete] ${error.message}`);
    return true;
  }

  async deleteWhere(table: string, filters: Record<string, any>): Promise<boolean> {
    let query = this.client.from(table).delete();
    for (const [key, value] of Object.entries(filters)) {
      query = query.eq(key, value);
    }
    const { error } = await query;
    if (error) throw new Error(`[SupabaseAdapter.deleteWhere] ${error.message}`);
    return true;
  }

  async insert<T = any>(table: string, data: Partial<T>): Promise<T> {
    return this.create<T>(table, data);
  }
}
