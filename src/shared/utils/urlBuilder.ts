export function buildLinkUrl(slug: string) {
	const host = process.env.HOST ?? 'http://localhost:3000';
	return `${host}/documentAccess/${slug}`;
}
