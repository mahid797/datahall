import { ReactNode } from 'react';

// =========== USER TYPE ===========

// This is not the same as the User type in next-auth.d.ts. Needs to be the same as the DB type (currently unused).
export interface User {
	userId: number;
	name: string;
	email: string;
	role: 'Administrator' | 'Member';
	createdAt: string;
	// ... etc
}

// =========== VISITOR DETAIL ===========

export interface Contact {
	id: number;
	name: string; // Combined first + last name
	email: string; // If LinkVisitors has an email field
	documentId: string; // The documentId from DB
	lastActivity: Date; //The date/time of their last activity
	lastViewedLink: string; //The last link or friendly name they viewed
	totalVisits: number; //Total visits for that email across the user's links
	downloads: number;
	duration: string;
	completion: string;
}

// =========== LINK VISITOR DETAIL ===========

export interface LinkVisitor {
	id: number;
	linkId: string;
	name: string;
	email: string;
	visitedAt: string;
	visitorMetaData: string | null;
}
