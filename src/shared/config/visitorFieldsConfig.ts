const visitorFieldKeys = ['name', 'email'] as const;

type VisitorFieldKey = (typeof visitorFieldKeys)[number];
type VisitorFieldsConfigByKey = Record<string, VisitorField[]>;

export interface VisitorField {
	key: VisitorFieldKey;
	label: string;
	placeholder: string;
}

export const visitorFieldsConfig: VisitorField[] = [
	{ key: 'name', label: 'Name', placeholder: 'Your Name' },
	{ key: 'email', label: 'Email', placeholder: 'your_email@bluewave.com' },
];

export const visitorFieldsConfigByKey: VisitorFieldsConfigByKey = Object.groupBy(
	visitorFieldsConfig,
	(item) => item.key,
);
