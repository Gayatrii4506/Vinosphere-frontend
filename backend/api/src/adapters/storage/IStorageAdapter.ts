export interface IStorageAdapter {
  /**
   * Uploads a file (from a local path or buffer) to remote storage.
   * @param filePath The local path to the file or a base64 string
   * @param folder The target folder in the storage bucket
   * @returns The remote URL and unique public ID
   */
  uploadFile(filePath: string, folder: string): Promise<{ url: string; publicId: string }>;

  /**
   * Deletes a file from remote storage using its public ID.
   */
  deleteFile(publicId: string): Promise<boolean>;
}
