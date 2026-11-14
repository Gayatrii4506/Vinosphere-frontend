import { CloudinaryAdapter } from './CloudinaryAdapter';
import { IStorageAdapter } from './IStorageAdapter';

// Instantiate the Storage Adapter
const storage: IStorageAdapter = new CloudinaryAdapter();

export { storage };
