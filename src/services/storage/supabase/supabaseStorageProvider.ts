import { createClient } from '@supabase/supabase-js';

import { FileMetadata, ServiceError, StorageProvider, UploadResult } from '@/services';

const DEFAULT_BUCKET = process.env.SUPABASE_STORAGE_BUCKET as string;

export class SupabaseProvider implements StorageProvider {
	private supabase;

	constructor() {
		this.supabase = createClient(
			process.env.SUPABASE_URL as string,
			process.env.SUPABASE_SERVICE_ROLE_KEY as string,
		);
	}

	/**
	 * Uploads a file to the Supabase storage bucket.
	 * @param fileBuffer - Buffer containing the file's data.
	 * @param metadata - Metadata for the upload (userId, fileName, fileType).
	 * @param bucket - Optional bucket name (defaults to DEFAULT_BUCKET).
	 * @returns A promise resolving to the file's public URL (if bucket is public) or file path (if bucket is private).
	 */
	async upload(
		fileBuffer: Buffer,
		metadata: FileMetadata,
		bucket: string = DEFAULT_BUCKET,
	): Promise<UploadResult> {
		const filePath = `${metadata.userId}/${metadata.fileName}`;

		const { error } = await this.supabase.storage.from(bucket).upload(filePath, fileBuffer, {
			contentType: metadata.fileType,
			upsert: true,
		});

		if (error) {
			console.error('Supabase upload error:', error);
			throw new ServiceError('File upload failed.', 500);
		}

		return { filePath: filePath };
	}

	/**
	 * Deletes a file from the Supabase storage bucket.
	 * @param filePath - The path of the file to delete within the bucket.
	 * @param bucket - Optional bucket name (defaults to DEFAULT_BUCKET).
	 */
	async delete(filePath: string, bucket: string = DEFAULT_BUCKET): Promise<void> {
		const { error } = await this.supabase.storage.from(bucket).remove([filePath]);

		if (error) {
			console.error('Supabase delete error:', error);
			throw new ServiceError('File deletion failed.', 500);
		}
	}

	/**
	 * Lists file paths in the Supabase storage bucket.
	 * Optionally filters files under a specific prefix.
	 * @param prefix - The prefix to filter files by. Defaults to an empty string.
	 * @param bucket - Optional bucket name (defaults to DEFAULT_BUCKET).
	 * @returns A promise resolving to an array of file paths.
	 */
	async list(prefix: string = '', bucket: string = DEFAULT_BUCKET): Promise<string[]> {
		const recurse = async (dir: string): Promise<string[]> => {
			const { data, error } = await this.supabase.storage.from(bucket).list(dir, { limit: 10_000 });

			if (error) {
				console.error('Supabase list error:', error);
				throw new ServiceError('File list failed.', 500);
			}

			const paths: string[] = [];
			for (const entry of data ?? []) {
				const fullPath = dir ? `${dir}/${entry.name}` : entry.name;

				// entry.metadata === null  ⇒  it's a "folder" placeholder
				if (entry.metadata === null) {
					paths.push(...(await recurse(fullPath)));
				} else {
					paths.push(fullPath);
				}
			}
			return paths;
		};

		return recurse(prefix);
	}

	/**
	 * Generates a signed URL for a file in the Supabase storage bucket.
	 * @param filePath - The path of the file within the bucket.
	 * @param expiresIn - The number of seconds until the signed URL expires.
	 * @param bucket - Optional bucket name (defaults to DEFAULT_BUCKET).
	 * @returns - A promise resolving to the signed URL.
	 */
	async generateSignedUrl(
		filePath: string,
		expiresIn: number,
		bucket: string = DEFAULT_BUCKET,
	): Promise<string> {
		const { data, error } = await this.supabase.storage
			.from(bucket)
			.createSignedUrl(filePath, expiresIn);

		if (error) {
			throw new ServiceError(`Error generating signed URL: ${error.message}`, 500);
		}

		return data.signedUrl;
	}
}
