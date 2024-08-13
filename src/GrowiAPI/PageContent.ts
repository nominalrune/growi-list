import Page from './Page';
import Revision from './Revision';
import User from './User';

export default PageContent;

type PageContent = Omit<Page, 'revision'>&{
	_id: string;
	parent: string;
	descendantCount: number;
	isEmpty: boolean;
	status: string; // You could use a union type if there are other statuses
	grant: number;
	grantedUsers: string[]; // Assuming it's an array of user IDs
	liker: string[]; // Assuming it's an array of user IDs
	seenUsers: string[]; // Assuming it's an array of user IDs
	commentCount: number;
	grantedGroups: string[]; // Assuming it's an array of group IDs
	updatedAt: string; // ISO 8601 date string
	path: string;
	creator: User;
	lastUpdateUser: User;
	createdAt: string; // ISO 8601 date string
	__v: number;
	latestRevisionBodyLength: number;
	revision: Revision;
	id: string;
}
