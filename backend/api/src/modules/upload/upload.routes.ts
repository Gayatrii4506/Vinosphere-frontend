import { Router } from 'express';
import { uploadController } from './upload.controller';
import upload from '../../middleware/upload';
import { protect } from '../../middleware/authMiddleware';
import { catchAsync } from '../../shared/utils/catchAsync';

const router = Router();

// Protect upload routes - authentication required for asset creation & deletion
router.use(protect);

// Endpoint for uploading a file
// Notice we use the `upload.single('file')` middleware here BEFORE the controller.
// This intercepts the multipart/form-data, uploads it to Cloudinary, and attaches the result to req.file
router.post('/', upload.single('file'), catchAsync(uploadController.uploadFile));

// Endpoint for deleting a file
router.delete('/', catchAsync(uploadController.deleteFile));

export default router;
