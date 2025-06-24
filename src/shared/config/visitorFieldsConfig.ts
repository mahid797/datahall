export type VisitorFieldKey = (typeof visitorFieldsConfig)[number]['key'];

type VisitorFieldsConfigByKey = Record<VisitorFieldKey, VisitorField[]>;

export interface VisitorField {
	key: VisitorFieldKey;
	label: string;
	placeholder: string;
}

export const visitorFieldsConfig = [
	{ key: 'name', label: 'Name', placeholder: 'Your full name' },
	{ key: 'email', label: 'Email', placeholder: 'your_email@bluewave.com' },
	{ key: 'address', label: 'Address', placeholder: '123 Main St, City, Country' },
	{ key: 'company', label: 'Company', placeholder: 'Your Company Name' },
	{ key: 'phone', label: 'Phone', placeholder: '+1 647 123 4567' },
	{ key: 'jobTitle', label: 'Job Title', placeholder: 'e.g. Product Manager' },
	// Add more fields as needed
] as const;

export const visitorFieldKeys = visitorFieldsConfig.map((f) => f.key) as unknown as readonly [
	(typeof visitorFieldsConfig)[number]['key'],
	...(typeof visitorFieldsConfig)[number]['key'][],
];

export const visitorFieldsConfigByKey: VisitorFieldsConfigByKey = visitorFieldsConfig.reduce(
	(acc, field) => {
		(acc[field.key] ||= []).push(field);
		return acc;
	},
	{} as VisitorFieldsConfigByKey,
);
