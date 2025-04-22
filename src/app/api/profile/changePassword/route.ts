import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

import { authOptions } from '@/lib/authOptions';
import { authService } from '@/services';

/** PATCH /api/profile/changePassword  { oldPassword, newPassword } */
export async function PATCH(req: NextRequest) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.email) {
			return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
		}

		const { oldPassword, newPassword } = await req.json();
		if (!oldPassword || !newPassword) {
			return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
		}

		const result = await authService.changePassword({
			email: session.user.email,
			oldPassword,
			newPassword,
		});

		if (!result.success) {
			return NextResponse.json({ message: result.message }, { status: 400 });
		}

		return NextResponse.json({ message: result.message }, { status: 200 });
	} catch (err) {
		console.error('[changePassword]', err);
		return NextResponse.json({ message: 'Server error' }, { status: 500 });
	}
}
