/* -------------------------------------------------------------------------- */
/*  Profile API DTOs                                                          */
/* -------------------------------------------------------------------------- */
export interface ProfileDto {
	email: string;
	firstName: string;
	lastName: string;
}

/* ---------- PATCH /api/profile/name ---------- */
export interface UpdateNameRequest {
	firstName: string;
	lastName: string;
}
export interface UpdateNameResponse {
	success: boolean;
	message: string;
}

/* ---------- PATCH /api/profile/password ------ */
export interface UpdatePasswordRequest {
	currentPassword: string;
	newPassword: string;
}
export interface UpdatePasswordResponse {
	success: boolean;
	message: string;
}
