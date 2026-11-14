import { v2 as cloudinary } from 'cloudinary';
import { env } from './env';

/**
 * Configure the Cloudinary SDK.
 * This is used heavily by the StorageAdapter for image uploads (e.g., wine bottles, winery logos).
 */
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export default cloudinary;
