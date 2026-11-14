import { SupabaseClient } from '@supabase/supabase-js';

export interface IDatabaseAdapter {
  /**
   * Direct access to the underlying Supabase client.
   * Used by analytics service for view queries that need
   * advanced filtering (gte, order, etc.) beyond the adapter's find().
   */
  readonly client: SupabaseClient;
  /**
   * Fetch multiple records from a table.
   * @param table The table name
   * @param filters Key-value pairs for equality filtering (e.g. { origin: 'Nashik' })
   */
  find<T = any>(table: string, filters?: Record<string, any>): Promise<T[]>;

  /**
   * Fetch multiple records and join related tables (e.g., fetch wines with their winery details).
   * @param table The base table name
   * @param select The select query (e.g., '*, wineries(*)')
   * @param filters Key-value filters
   */
  findWithRelations<T = any>(table: string, select: string, filters?: Record<string, any>): Promise<T[]>;

  /**
   * Fetch a single record from a table.
   */
  findOne<T = any>(table: string, filters: Record<string, any>): Promise<T | null>;

  /**
   * Insert a new record.
   */
  create<T = any>(table: string, data: Partial<T>): Promise<T>;

  /**
   * Update an existing record by ID.
   */
  update<T = any>(table: string, id: string, data: Partial<T>): Promise<T>;

  /**
   * Delete a record by ID.
   */
  delete(table: string, id: string): Promise<boolean>;

  /**
   * Delete records matching specific filters (useful for tables with composite keys like wishlist).
   */
  deleteWhere(table: string, filters: Record<string, any>): Promise<boolean>;

  /**
   * Insert a record (alias for create).
   */
  insert?<T = any>(table: string, data: Partial<T>): Promise<T>;
}
