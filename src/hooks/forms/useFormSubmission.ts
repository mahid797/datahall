/**
 * @deprecated (partial) – The legacy `onSubmit` fallback is deprecated.
 * Prefer the **adapter mode** using a `mutation`, which offers better integration with React Query DevTools,
 * error boundaries, and loading state handling.
 *
 * This hook itself is still supported for compatibility.
 * =============================================================================
 * A unified form‐submission hook that supports:
 *
 * 1️⃣ **Adapter mode** (preferred):
 *    – Pass a React-Query `mutation` (UseMutationResult).
 *    – `loading` and `error` mirror `mutation.isPending` / `mutation.error`.
 *    – You do **not** call `mutation.mutateAsync()` yourself.
 *    – Ideal for simple forms whose values map directly to the API payload.
 *
 * 2️⃣ **Legacy mode** (fallback):
 *    – Omit `mutation` and supply `onSubmit: async () => { … }`.
 *    – Hook manages its own `loading` / `error` via internal state.
 *    – Use when you need to transform values, set per-field errors,
 *      or chain multiple API calls before the final toast.
 *
 * **Example: CreateLink (legacy mode)**
 * ```ts
 * // needs payload transform + server-side alias conflict handling
 * const { loading, handleSubmit } = useFormSubmission({
 *   validate: () => isValid,
 *   onSubmit: async () => {
 *     try {
 *       const payload = getPayload();
 *       await createLink.mutateAsync({ documentId, payload });
 *     } catch (e) {
 *       // set field‐level errors, then rethrow for generic toast
 *       form.setError('alias', { message: e.message });
 *       throw e;
 *     }
 *   },
 *   successMessage: 'Link created!',
 *   errorMessage: 'Failed to create link.',
 * });
 * ```
 *
 * **Example: PasswordFormModal (adapter mode)**
 * ```ts
 * // form values pass straight through to the mutation
 * const { loading, handleSubmit } = useFormSubmission({
 *   mutation: changePassword,
 *   validate: () => isValid,
 *   successMessage: 'Password updated!',
 *   onError: (msg) => toast.showToast({ message: msg, variant: 'error' }),
 *   skipDefaultToast: true,
 * });
 * ```
 *
 * @param mutation       A TanStack Query `UseMutationResult`. When provided, the hook wires `loading` / `error` directly.
 * @param onSubmit       Fallback async callback (ignored if `mutation` is set).
 * @param validate       Optional synchronous predicate. Return `false` to abort.
 * @param getVariables   Optional function to retrieve variables for the mutation (if needed).
 * @param onSuccess      Optional callback after a successful submit.
 * @param onError        Optional callback on error (receives error message).
 * @param successMessage Optional toast text on success (unless `skipDefaultToast`).
 * @param errorMessage   Optional fallback toast text if the error is unstructured.
 * @param skipDefaultToast When `true`, the hook will not show automatic toasts.
 *
 * @returns `{ loading, error, handleSubmit, toast }`
 *  – `loading`: boolean
 *  – `error`: string
 *  – `handleSubmit`: attach to your `<form onSubmit={handleSubmit}>`
 *  – `toast`: the `useToast` instance for any additional notifications
 * =============================================================================
 */
import { FormEvent, useState } from 'react';
import type { UseMutationResult } from '@tanstack/react-query';
import { useToast } from '@/hooks';
import { ValidationAbortError } from './useFormWithSchema';

interface UseFormSubmissionProps {
	/** TanStack Query mutation; enables adapter mode when supplied. */
	mutation?: UseMutationResult<any, unknown, any, unknown>;
	/**
	 * @deprecated Legacy fallback; avoid using this unless mutation cannot be used.
	 * Prefer passing a TanStack `mutation` instead.
	 */
	onSubmit?: () => Promise<void>;
	/** Client-side validator – return `true` to proceed. */
	validate?: () => boolean;
	getVariables?: () => any;
	onSuccess?: () => void;
	onError?: (message: string) => void;
	/** Pre-canned toast messages on success/failure. */
	successMessage?: string;
	errorMessage?: string;
	/** Disable automatic toasts if you handle them manually. */
	skipDefaultToast?: boolean;
}

export const useFormSubmission = ({
	mutation,
	onSubmit,
	getVariables,
	validate,
	onSuccess,
	onError,
	successMessage,
	errorMessage,
	skipDefaultToast = false,
}: UseFormSubmissionProps) => {
	const [localLoading, setLocalLoading] = useState(false);
	const [localError, setLocalError] = useState('');
	const toast = useToast();

	const loading = mutation ? mutation.isPending : localLoading;
	const error = mutation ? ((mutation.error as any)?.message ?? '') : localError;

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		if (validate && !validate()) return;

		try {
			if (mutation) {
				/* ---------- adapter mode (tanstack-query) ---------- */
				const variables = getVariables ? getVariables() : undefined;
				await mutation.mutateAsync(variables);
			} else if (onSubmit) {
				/** @deprecated Legacy fallback mode */
				setLocalLoading(true);
				await onSubmit();
			}

			if (successMessage && !skipDefaultToast) {
				toast.showToast({ message: successMessage, variant: 'success' });
			}
			onSuccess?.();
		} catch (err: any) {
			if (err instanceof ValidationAbortError) return;

			const message =
				err?.response?.data?.message || err?.message || 'An unexpected error occurred.';

			if (!skipDefaultToast) {
				toast.showToast({
					message: `Error: ${errorMessage || message}`,
					variant: 'error',
				});
			}

			if (!mutation) setLocalError(message); // mutation already exposes its own error
			onError?.(message);
		} finally {
			if (!mutation) setLocalLoading(false);
		}
	};

	return { loading, error, handleSubmit, toast };
};
