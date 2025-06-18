/**
 * routeSchemas.ts
 * --------------------------------------------------
 * Tiny helpers for validating dynamic route params.
 */
import { z } from 'zod';

/** Ensures a string is a valid v4/v5 UUID. */
export const UuidParam = z.string().uuid();
