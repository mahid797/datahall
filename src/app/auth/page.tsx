import { redirect } from 'next/navigation';
export default function AuthIndex() {
	redirect('/auth/sign-in');
}
export const metadata = {
	title: 'Auth',
	description: 'Auth page',
};
export const dynamic = 'force-dynamic'; // Revalidate every time
export const revalidate = 0; // Revalidate every time
export const fetchCache = 'force-no-store'; // Do not cache
export const runtime = 'edge'; // Run on the edge
