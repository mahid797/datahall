import { redirect } from 'next/navigation';
export default function Home() {
	redirect('/documents');
}
export const metadata = {
	title: 'Documents',
	description: 'Documents page',
};
export const dynamic = 'force-dynamic'; // Revalidate every time
export const revalidate = 0; // Revalidate every time
export const fetchCache = 'force-no-store'; // Do not cache
export const runtime = 'edge'; // Run on the edge
