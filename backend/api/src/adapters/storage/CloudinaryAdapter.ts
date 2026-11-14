import cloudinary from '../../config/cloudinary';
import { IStorageAdapter } from './IStorageAdapter';

export class CloudinaryAdapter implements IStorageAdapter {
  async uploadFile(filePath: string, folder: string): Promise<{ url: string; publicId: string }> {
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: `vinosphere/${folder}`,
        resource_type: 'auto',
      });
      
      return {
        url: result.secure_url,
        publicId: result.public_id,
      };
    } catch (error: any) {
      throw new Error(`[CloudinaryAdapter.uploadFile] Failed to upload image: ${error.message}`);
    }
  }

  async deleteFile(publicId: string): Promise<boolean> {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result.result === 'ok';
    } catch (error: any) {
      throw new Error(`[CloudinaryAdapter.deleteFile] Failed to delete image: ${error.message}`);
    }
  }
}
