import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/services';

/** GET /api/auth/verify?token=abc */
export async function GET(req: NextRequest) {
	if (!authService.verifyUser) {
		/* Auth0 mode: this endpoint is unused */
		return NextResponse.json({ message: 'Not found' }, { status: 404 });
	}

	const token = new URL(req.url).searchParams.get('token') ?? undefined;
	const result = await authService.verifyUser({ token });
	return NextResponse.json({ message: result.message }, { status: result.statusCode });
}
