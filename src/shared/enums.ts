export enum AuthProvider {
	Credentials = 'CREDENTIALS',
	Auth0 = 'AUTH0',
	Google = 'GOOGLE',
}

export enum UserStatus {
	Active = 'ACTIVE',
	Archived = 'ARCHIVED',
	Unverified = 'UNVERIFIED',
}

export enum UserRole {
	Admin = 'ADMIN',
	User = 'USER',
	Guest = 'GUEST',
}

export enum AnalyticsEventType {
	VIEW = 'VIEW',
	DOWNLOAD = 'DOWNLOAD',
}
