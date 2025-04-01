const visitorFieldKeys = ['name', 'email'] as const;

type VisitorFieldKey = (typeof visitorFieldKeys)[number];

export interface VisitorField {
	key: VisitorFieldKey;
	label: string;
}

export const visitorFieldsConfig: VisitorField[] = [
	{ key: 'name', label: 'Name' },
	{ key: 'email', label: 'Email' },
];
