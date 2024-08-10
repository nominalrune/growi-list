import User from './User';

export default interface Revision {
	_id: string;
	format: 'markdown'; // You could use a union type if there are other formats
	pageId: string;
	body: string;
	author: User;
	origin: string;
	hasDiffToPrev: boolean;
	createdAt: string; // ISO 8601 date string
	__v: number;
}
