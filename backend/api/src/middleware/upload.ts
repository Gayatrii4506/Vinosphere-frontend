// @ts-ignore
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary';
import { AppError } from '../shared/errors/AppError';

// Configure Multer to use Cloudinary as the storage engine
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req: any, file: any) => {
    // We can extract a folder name from the request body or default to 'misc'
    const folderName = req.body?.folder || 'misc';
    
    return {
      folder: `vinosphere/${folderName}`,
      // Cloudinary allows automatic resource type detection
      resource_type: 'auto', 
      allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'pdf', 'avif', 'gif', 'jfif', 'JPG', 'PNG', 'JPEG', 'WEBP'],
    };
  },
});

// Create the multer middleware
const upload = (multer as any)({
  storage: storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB Limit to allow high quality images
  },
  fileFilter: (req: any, file: any, cb: any) => {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new AppError('Not an image or PDF! Please upload only supported files.', 400));
    }
  }
});

export default upload;
