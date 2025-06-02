import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';

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
	return useForm<z.infer<TSchema>>({
		resolver: zodResolver(schema),
		defaultValues: defaults,
		mode,
	});
}
