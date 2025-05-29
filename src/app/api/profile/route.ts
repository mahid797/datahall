import { NextRequest, NextResponse } from 'next/server';

import { authService } from '@/services';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
	try {
		// Authenticate the user
		const userId = await authService.authenticate();

		// Get the user’s info from the database
		const user = await prisma.user.findUnique({
			where: { userId },
			select: {
				email: true,
				firstName: true,
				lastName: true,
			},
		});

		if (!user) {
			return NextResponse.json({ error: 'User not found' }, { status: 404 });
		}

		// Return the user’s info
		return NextResponse.json(
			{
				email: user.email,
				firstName: user.firstName,
				lastName: user.lastName,
			},
			{ status: 200 },
		);
	} catch (error) {
		console.error('Error fetching user info:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
