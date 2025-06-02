import { useRef } from 'react';
import { useWatch } from 'react-hook-form';

import { useFormWithSchema } from '@/hooks/forms/useFormWithSchema';
import {
	DocumentLinkFormSchema,
	documentLinkDefaults,
	DocumentLinkPayloadSchema,
	DocumentLinkFormValues,
} from '@/shared/validation/documentLinkSchemas';
import { VisitorFieldKey } from '@/shared/config/visitorFieldsConfig';

/**
 * UI-state + helpers specific to the Create-Link dialog.
 */
export function useCreateLinkForm() {
	const form = useFormWithSchema(DocumentLinkFormSchema, documentLinkDefaults, 'onBlur');

	/** Build an API-ready payload (Zod `.transform()` handles field pruning) */
	const getPayload = () => DocumentLinkPayloadSchema.parse(form.getValues());

	/** Reset *all* advanced options when user re-activates “Public link” */
	const secureCache = useRef<Partial<DocumentLinkFormValues>>({});

	const toggleIsPublic = (checked: boolean) => {
		if (checked) {
			// save current secure settings before wipe
			secureCache.current = form.getValues([
				'requireUserDetails',
				'visitorFields',
				'requirePassword',
				'password',
				'expirationEnabled',
				'expirationTime',
				'selectFromContact',
				'contactEmails',
				'sendToOthers',
				'otherEmails',
			]) as Partial<DocumentLinkFormValues>;

			form.reset(
				{ ...documentLinkDefaults, isPublic: true, alias: form.getValues('alias') },
				{ keepDirty: true },
			);
		} else {
			// restore the cache when making it private again
			form.reset(
				{
					...documentLinkDefaults,
					...secureCache.current,
					isPublic: false,
					alias: form.getValues('alias'),
				},
				{ keepDirty: true },
			);
		}
	};

	/** Update visitor fields with de-duplication & alphabetical sort */
	const updateVisitorFields = (fields: string[]) => {
		const unique = Array.from(new Set(fields)) as VisitorFieldKey[];
		unique.sort();
		form.setValue('visitorFields', unique, { shouldValidate: true });
	};

	/** Convenience wrapper for the DateTimePicker */
	const setExpirationTime = (isoString: string | null) => {
		form.setValue('expirationTime', isoString ?? '', { shouldValidate: true });
	};

	const requirePassword = useWatch({ control: form.control, name: 'requirePassword' });
	const expirationEnabled = useWatch({ control: form.control, name: 'expirationEnabled' });

	/* ----------------------------------------------------------------------- */
	return {
		...form,
		getPayload,
		toggleIsPublic,
		updateVisitorFields,
		setExpirationTime,
		requirePassword,
		expirationEnabled,
	};
}
