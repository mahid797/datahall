export { authService } from './auth/authService';
export type { StorageProvider, FileMetadata, UploadResult } from './storage/storageService';
export { uploadFile, deleteFile, listFiles } from './storage/storageService';

// Fix the storageService import to use the correct path
// export {storageService} from './storage/storageService';

export { documentService } from './documentService';
export { createErrorResponse, ServiceError } from './errorService';
export { linkService } from './linkService';
export { emailService } from './email/emailService';
export { analyticsService } from './analyticsService';
