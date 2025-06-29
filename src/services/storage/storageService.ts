import { SupabaseProvider } from '@/services/storage/supabase/supabaseStorageProvider';

/**
 * Metadata for a file upload.
 * Describes additional information passed during file upload.
 */
export type FileMetadata = {
	fileName: string; // Name of the file
	userId: string; // User ID of the uploader
	fileType: string; // MIME type of the file
};

/**
 * Result of a file upload operation.
 * Represents the URL of the uploaded file.
 */
export type UploadResult = {
	filePath: string; // Public URL of the uploaded file
};

/**
 * Interface for storage providers.
 * Abstracts upload and delete operations for flexibility.
 */
export interface StorageProvider {
	/**
	 * Uploads a file to the storage provider.
	 * @param fileBuffer - Buffer of the file to upload
	 * @param metadata - Metadata for the upload
	 * @returns A promise resolving to the public URL of the uploaded file
	 */
	upload(fileBuffer: Buffer, metadata: FileMetadata, bucket?: string): Promise<UploadResult>;

	/**
	 * Deletes a file from the storage provider.
	 * @param filePath - The path of the file to delete
	 * @returns A promise resolving when the file is deleted
	 */
	delete(filePath: string, bucket?: string): Promise<void>;

	/**
	 * Lists file paths in the storage bucket.
	 * Optionally filters files under a specific prefix.
	 * @param {string} [prefix] - The prefix to filter files by. Optional.
	 * @returns {Promise<string[]>} - A promise resolving to an array of file paths.
	 */
	list(prefix?: string, bucket?: string): Promise<string[]>;

	/**
	 * Generates a signed URL for a file.
	 * @param filePath - The path of the file to generate a signed URL for
	 * @param expiresIn - Expiration time in seconds for the signed URL
	 * @returns A promise resolving to the signed URL
	 */
	generateSignedUrl(filePath: string, expiresIn: number, bucket?: string): Promise<string>;
}

//TODO: Add a local storage provider, move the below to a separate file
export class PlaceholderProvider implements StorageProvider {
	async upload(
		fileBuffer: Buffer,
		metadata: FileMetadata,
		_bucket?: string,
	): Promise<UploadResult> {
		console.warn('PlaceholderProvider: Upload called.');
		return { filePath: 'https://example.com/placeholder-url' }; // Placeholder URL
	}

	async delete(filePath: string, _bucket?: string): Promise<void> {
		console.warn('PlaceholderProvider: Delete called.');
	}

	async list(prefix: string, _bucket?: string): Promise<string[]> {
		console.warn('PlaceholderProvider: List called.');
		return [];
	}

	async generateSignedUrl(filePath: string, expiresIn: number, _bucket?: string): Promise<string> {
		console.warn('PlaceholderProvider: Generate signed URL called.');
		return `https://example.com/signed-url?file=${filePath}&expires_in=${expiresIn}`;
	}
}

/**
 * Determines the storage provider based on the STORAGE_PROVIDER environment variable.
 * @returns {StorageProvider} - An instance of the selected storage provider.
 */
function selectStorageProvider(): StorageProvider {
	const provider = process.env.STORAGE_PROVIDER;

	switch (provider) {
		case 'supabase':
			return new SupabaseProvider();
		// case 'local':
		//   // PlaceholderProvider can be replaced with an actual LocalProvider later
		//   return new PlaceholderProvider();
		default:
			throw new Error(`Unsupported storage provider specified in STORAGE_PROVIDER: ${provider}`);
	}
}

// Initialize the storage provider based on the environment variable
const storageProvider: StorageProvider = selectStorageProvider();

export const storageService = {
	/**
	 * Uploads a file using the configured storage provider.
	 * @param {Buffer} fileBuffer - Buffer of the file to upload.
	 * @param {FileMetadata} metadata - Metadata for the file upload.
	 * @returns {Promise<string>} - The public URL of the uploaded file.
	 */
	async uploadFile(fileBuffer: Buffer, metadata: FileMetadata, bucket?: string): Promise<string> {
		try {
			const result = await storageProvider.upload(fileBuffer, metadata, bucket);
			return result.filePath;
		} catch (error) {
			console.error('Error uploading file:', error);
			throw new Error('File upload failed.');
		}
	},

	/**
	 * Lists file paths using the configured storage provider.
	 * Optionally filters files under a specific prefix.
	 * @param {string} [prefix=''] - The prefix to filter files by. Defaults to an empty string.
	 * @returns {Promise<string[]>} - A promise resolving to an array of file paths.
	 */
	async listFiles(prefix = '', bucket?: string): Promise<string[]> {
		return storageProvider.list(prefix, bucket);
	},

	/**
	 * Generates a time-limited signed URL for a stored object.
	 * @param {string} filePath - The path of the file to generate a signed URL for.
	 * @param {number} [expiresIn=3600] - Expiration time in seconds
	 * @returns {Promise<string>} - A promise resolving to the signed URL.
	 */
	async generateSignedUrl(filePath: string, expiresIn = 60 * 60, bucket?: string): Promise<string> {
		return storageProvider.generateSignedUrl(filePath, expiresIn, bucket);
	},

	/**
	 * Deletes a file using the configured storage provider.
	 * @param {string} filePath - The path of the file to delete.
	 * @returns {Promise<void>} - Resolves when the file is deleted.
	 */
	async deleteFile(filePath: string, bucket?: string): Promise<void> {
		try {
			await storageProvider.delete(filePath, bucket);
		} catch (error) {
			console.error('Error deleting file:', error);
			throw new Error('File deletion failed.');
		}
	},
};
