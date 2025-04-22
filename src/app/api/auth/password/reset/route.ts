import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/services';

/** POST /api/auth/password/reset  { token, newPassword } */
export async function POST(req: NextRequest) {
	if (!authService.resetPassword) {
		/* Auth0 mode – handled by Auth0 e‑mail */
		return NextResponse.json({ message: 'Not found' }, { status: 404 });
	}

	try {
		const { token, newPassword } = await req.json();
		if (!token || !newPassword) {
			return NextResponse.json({ message: 'Token and password required' }, { status: 400 });
		}

		const result = await authService.resetPassword({ token, newPassword });
		if (!result.success) {
			return NextResponse.json({ message: result.message }, { status: 400 });
		}

		return NextResponse.json({ message: result.message }, { status: 200 });
	} catch (err) {
		console.error('[reset]', err);
		return NextResponse.json({ message: 'Server error' }, { status: 500 });
	}
}
