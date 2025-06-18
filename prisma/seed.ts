import { PrismaClient } from '@prisma/client';

import { makeUsers } from './data/users';
import { makeDocuments } from './data/documents';
import { makeLinks } from './data/links';
import { makeVisitors } from './data/visitors';
import { makeAnalytics } from './data/analytics';
import { emptyStorageBucket } from './data/media';

const prisma = new PrismaClient();

const IS_PROD = process.env.NODE_ENV === 'production';
const SHOULD_UPLOAD = true;

async function main() {
	console.log('🌱  Begin Seeding…');

	if (SHOULD_UPLOAD && !IS_PROD) {
		console.warn('⚠️ Attempting to clear the storage bucket...');
		await emptyStorageBucket();
	}
	console.log('🌱  Seeding database…');

	// 1) Users
	const users = await makeUsers(1);
	await prisma.user.createMany({ data: users });
	console.log(`➤ seeded ${users.length} users`);

	// 2) Documents
	const documents = await makeDocuments(users, SHOULD_UPLOAD);
	await prisma.document.createMany({ data: documents });
	console.log(`➤ seeded ${documents.length} documents`);

	// 3) Links
	const links = await makeLinks(documents);
	await prisma.documentLink.createMany({ data: links });
	console.log(`➤ seeded ${links.length} links`);

	// 4) Visitors
	const visitorsInput = makeVisitors(links);
	const visitors = await Promise.all(
		visitorsInput.map((v) => prisma.documentLinkVisitor.create({ data: v })),
	);
	console.log(`➤ seeded ${visitors.length} visitors`);

	// 5) Analytics
	const analytics = makeAnalytics({ documents, links, visitors });
	await prisma.documentAnalytics.createMany({ data: analytics });
	console.log(`➤ seeded ${analytics.length} analytics rows`);

	console.log('🌱  Seeded demo data');
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => prisma.$disconnect());
