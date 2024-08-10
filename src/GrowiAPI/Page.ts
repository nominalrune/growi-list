import User from './User';

export default interface Page {
	"_id": string,
	"parent": string,
	"descendantCount": number,
	"isEmpty": false,
	"status": string,
	"grant": number,
	"grantedUsers": string[],
	"liker": string[],
	"seenUsers": string[],
	"commentCount": number,
	"grantedGroups": [],
	"updatedAt": string,
	"path": string,
	"creator": string,
	"lastUpdateUser": User,
	"createdAt": string,
	"__v": number,
	"latestRevisionBodyLength": number,
	"revision": string,
	"id": string,
	"tags": string[];
}