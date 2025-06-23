/**
 * @deprecated Superseded by `react-hook-form` + `Zod` integration. Use `useFormWithSchema()` instead.
 * This hook will be removed in future commits.
 */
import { ChangeEvent, FocusEvent, useState } from 'react';
import { ValidationRule } from '@/shared/utils';

/**
 * @deprecated
 * @description Use RHF form state instead.
 * Shape for the config you pass into useValidatedFormData
 */
interface UseValidatedFormDataProps<T extends object> {
	initialValues: T;
	validationRules?: {
		[K in keyof T]?: ValidationRule[];
	};
}

/** Generic type for an object of strings, keyed by the fields in T */
/** @deprecated */
type ErrorMap<T> = { [K in keyof T]: string };
/** Generic type for a touched map (which fields the user has interacted with) */
/** @deprecated */
type TouchedMap<T> = { [K in keyof T]: boolean };

/**
 * @deprecated Superseded by `react-hook-form` + `Zod`. Use `useFormWithSchema()` instead.
 */
export function useValidatedFormData<T extends object>({
	initialValues,
	validationRules = {},
}: UseValidatedFormDataProps<T>) {
	// Store current values
	const [values, setValues] = useState<T>(initialValues);

	// Track which fields have been "touched"
	const [touched, setTouched] = useState<TouchedMap<T>>(() => {
		const initialTouched = {} as TouchedMap<T>;
		for (const key in initialValues) {
			initialTouched[key] = false;
		}
		return initialTouched;
	});

	// Whether we want to show all errors (e.g., after a failed submission)
	const [showAllErrors, setShowAllErrors] = useState(false);

	/** Update values on input change (including checkboxes) */
	const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
		const { name, value, checked, type } = event.target;
		setValues((prev) => ({
			...prev,
			[name]: type === 'checkbox' ? checked : value,
		}));
	};

	/** Mark the field as touched on blur */
	const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
		const { name } = event.target;
		setTouched((prev) => ({
			...prev,
			[name]: true,
		}));
	};

	/**
	 * Returns the FIRST failing rule's message for a given field,
	 * or '' if all rules pass or if not touched yet (and we're not forcing all errors).
	 */
	const getError = (fieldName: keyof T): string => {
		// If not touched and not forcing all errors, no error
		if (!touched[fieldName] && !showAllErrors) return '';

		const fieldValue = values[fieldName];
		const rules = validationRules[fieldName] || [];
		for (const { rule, message } of rules) {
			if (!rule(String(fieldValue))) {
				// Handle both string and function types for message
				if (typeof message === 'function') {
					return message(String(fieldValue)); // Call the function with the value
				}
				return message; // Return the string directly
			}
		}
		return '';
	};

	/**
	 * Validate all fields at once, mark them all as touched.
	 * Returns true if there's ANY failing rule in the entire form.
	 */
	const validateAll = (): boolean => {
		setTouched((prev) => Object.fromEntries(Object.keys(prev).map((k) => [k, true])) as any);
		setShowAllErrors(true);

		let hasError = false;
		for (const key in validationRules) {
			const errorMsg = getError(key as keyof T);
			if (errorMsg) {
				hasError = true;
			}
		}
		// Mark all as touched so we display errors
		setTouched((prev) => {
			const newTouched = { ...prev };
			for (const k in newTouched) {
				newTouched[k] = true;
			}
			return newTouched;
		});
		// Also set showAllErrors to true
		setShowAllErrors(true);

		return hasError;
	};

	return {
		values,
		touched,
		handleChange,
		handleBlur,
		getError,
		validateAll,
		showAllErrors,
		setShowAllErrors,
		setValues,
		setTouched,
		hasErrors: Object.values(validationRules).some((_rules, k) => !!getError(k as keyof T)),
	};
}
