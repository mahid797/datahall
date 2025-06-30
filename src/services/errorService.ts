import { NextResponse } from 'next/server';

/**
 * Creates a consistent JSON error response for API routes.
 *
 * @param message - The error message to return in the response.
 * @param status - The HTTP status code for the response.
 * @param details - Optional error details for logging.
 * @returns A NextResponse object containing the error message and status.
 */
export function createErrorResponse(message: string, status: number, details?: any) {
	console.error(`[${new Date().toISOString()}] ${message}`, details);
	return NextResponse.json({ message }, { status });
}

/**
 * Custom error class for service-level errors that API routes can translate into HTTP codes.
 */
export class ServiceError extends Error {
	/**
	 * Constructs a new ServiceError.
	 *
	 * @param message - The error message.
	 * @param status - The HTTP status code (default: 500).
	 */
	constructor(
		message: string,
		public status: number = 500,
	) {
		super(message);
		this.name = 'ServiceError';
	}
}
