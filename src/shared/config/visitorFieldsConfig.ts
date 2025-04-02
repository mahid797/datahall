const visitorFieldKeys = ['name', 'email'] as const;

type VisitorFieldKey = (typeof visitorFieldKeys)[number];

export interface VisitorField {
	key: VisitorFieldKey;
	label: string;
	placeholder: string;
}

export const visitorFieldsConfig: VisitorField[] = [
	{ key: 'name', label: 'Name', placeholder: 'Your Name' },
	{ key: 'email', label: 'Email', placeholder: 'your_email@bluewave.com' },
];

export const visitorFieldsConfigByKey = Object.groupBy(visitorFieldsConfig, (item) => item.key);
