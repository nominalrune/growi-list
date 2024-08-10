export default interface User {
	_id: string;
	imageUrlCached: string;
	isGravatarEnabled: boolean;
	isEmailPublished: boolean;
	name: string;
	username: string;
	email: string;
	lang: string; // Language code
	status: number;
	lastLoginAt: string; // ISO 8601 date string
	admin: boolean;
	createdAt: string; // ISO 8601 date string
}