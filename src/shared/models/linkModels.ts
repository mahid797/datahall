// =========== LINK TYPE ===========

export interface LinkFormValues {
	password?: string;
	isPublic: boolean;
	otherEmails: string;
	friendlyName?: string;
	expirationTime?: string;
	requirePassword: boolean;
	expirationEnabled: boolean;
	requireUserDetails: boolean;
	visitorFields?: string[]; // Array of required visitor details
}

// =========== LINK PAYLOAD ===========

export interface CreateDocumentLinkPayload {
	documentId: string;
	friendlyName?: string; // Alias for the link
	isPublic: boolean;
	expirationTime?: string; // ISO string format
	expirationEnabled?: boolean;
	requirePassword?: boolean;
	password?: string;
	requireUserDetails?: boolean;
	visitorFields?: string[]; // Array of required visitor details
}

// =========== LINK DATA ===========

export interface LinkData {
	isPasswordProtected?: boolean;
	requiredUserDetailsOption?: number;
	signedUrl?: string;
	fileName?: string;
	size?: number;
}

// =========== LINK DETAIL ===========

export interface LinkDetail {
	linkId: string; // unique string
	friendlyName: string; // The links's friendly name
	document_id: string; // The document_id from DB
	createdLink: string; // The linkUrl from DB
	lastActivity: Date; // The link's updatedAt
	linkViews: number; // If you track actual link views, you can use a real value
}
