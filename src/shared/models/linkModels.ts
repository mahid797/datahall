// =========== LINK TYPE ===========

export interface DocumentLink {
	id: number;
	documentLinkId: string;
	documentId: string;
	createdByUserId: string;
	alias: string | null;
	isPublic: boolean;
	expirationTime: string | null; // ISO 8601
	password: string | null; // hashed in DB – never sent to client
	visitorFields: string[]; // e.g. ["name","email"]
	linkUrl: string; // convenience field (built server-side)
	createdAt: string; // ISO 8601
	updatedAt: string; // ISO 8601
}

// =========== LINK FORM VALUES ===========

export interface LinkFormValues {
	/* basic */
	isPublic: boolean;
	alias?: string;
	/* password protection */
	requirePassword: boolean;
	password?: string;
	/* expiry */
	expirationEnabled: boolean;
	expirationTime?: string; // ISO 8601
	/* visitor info */
	requireUserDetails: boolean;
	visitorFields: string[];
	/* sending options */
	selectFromContact: boolean;
	contactEmails?: { label: string; id: number }[];
	sendToOthers: boolean;
	otherEmails?: string;
}

export interface CreateDocumentLinkPayload {
	alias?: string;
	isPublic: boolean;
	expirationTime?: string;
	password?: string;
	visitorFields?: string[];
	/* emailing */
	contactEmails?: { label: string; id: number }[];
	otherEmails?: string;
}

export interface PublicLinkMeta {
	isPasswordProtected: boolean;
	visitorFields: string[]; // required visitor inputs
	signedUrl?: string; // only present when link is truly public
}

export interface FileDisplayPayload {
	signedUrl: string;
	fileName: string;
	size: number; // bytes
	fileType: string; // MIME
	documentId: string;
	documentLinkId?: string;
}

// =========== LINK PAYLOAD ===========

export interface CreateDocumentLinkPayload {
	documentId: string;
	alias?: string; // Alias for the link
	isPublic: boolean;
	expirationTime?: string; // ISO string format
	expirationEnabled?: boolean;
	requirePassword?: boolean;
	password?: string;
	requireUserDetails?: boolean;
	visitorFields?: string[]; // Array of required visitor details
	contactEmails?: { label: string; id: number }[];
	selectFromContact: boolean;
	otherEmails?: string;
	sendToOthers: boolean;
}

// =========== INVITE RECIPIENTS PAYLOAD ===========

export interface InviteRecipientsPayload {
	linkUrl: string;
	recipients: string[];
}

// =========== LINK DETAIL ===========
export interface LinkDetailRow {
	linkId: string;
	alias: string | null;
	documentId: string;
	createdLink: string; // same as linkUrl
	lastActivity: string; // ISO date
	linkViews: number; // aggregated analytics
}
