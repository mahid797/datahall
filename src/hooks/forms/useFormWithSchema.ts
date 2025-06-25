import { useForm, UseFormSetError } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';

/* -------------------------------------------------------------------------- */
/*  Internal validation‐abort sentinel                                        */
/* -------------------------------------------------------------------------- */
export class ValidationAbortError extends Error {
	constructor() {
		super('Client-side validation failed.');
		this.name = 'ValidationAbortError';
	}
}

/* -------------------------------------------------------------------------- */
/*  Shared helper:                       form.buildPayload()                  */
/* -------------------------------------------------------------------------- */
function buildPayload<TSchema extends z.ZodTypeAny>(
	schema: z.ZodTypeAny,
	values: unknown,
	setError: UseFormSetError<z.infer<TSchema>>,
) {
	const result = schema.safeParse(values);
	if (result.success) return result.data;

	/* map Zod issues → RHF field errors */
	result.error.issues.forEach(({ path, message }) =>
		setError(path[0] as any, { type: 'manual', message }),
	);
	throw new ValidationAbortError();
}

/**
 * Generic helper – plug a Zod schema into react-hook-form with defaults.
 *
 * @example
 * const form = useFormWithSchema(MySchema, myDefaults);
 */
export function useFormWithSchema<TSchema extends z.ZodTypeAny>(
	schema: TSchema,
	defaults: z.infer<TSchema>,
	mode: 'onBlur' | 'onChange' | 'onSubmit' = 'onBlur',
) {
	const form = useForm<z.infer<TSchema>>({
		resolver: zodResolver(schema),
		defaultValues: defaults,
		mode,
	});

	/* attach the helper */
	return {
		...form,
		/** Parse with the provided schema (or the original one if omitted). */
		buildPayload: (overrideSchema?: z.ZodTypeAny) =>
			buildPayload(overrideSchema ?? schema, form.getValues(), form.setError),
	};
}
