import { Request, Response } from 'express';
import { AppError } from '../../shared/errors/AppError';
import { storage } from '../../adapters/storage';

export class UploadController {
  
  /**
   * Handles the file upload. 
   * Note: The actual upload to Cloudinary was already handled by the Multer middleware!
   * The file info is attached to `req.file`.
   */
  async uploadFile(req: Request, res: Response) {
    const file = (req as any).file;
    if (!file) {
      throw new AppError('No file was uploaded', 400);
    }

    // req.file contains the Cloudinary URL and public ID
    res.status(200).json({
      status: 'success',
      data: {
        url: file.path,
        publicId: file.filename,
      },
    });
  }

  /**
   * Deletes a file directly from Cloudinary using the Storage Adapter
   */
  async deleteFile(req: Request, res: Response) {
    const { publicId } = req.body;
    
    if (!publicId) {
      throw new AppError('publicId is required to delete a file', 400);
    }

    await storage.deleteFile(publicId);
    
    res.status(200).json({
      status: 'success',
      message: 'File deleted successfully',
    });
  }
}

export const uploadController = new UploadController();
