export interface InsertChange {
	"action": "insert",
	"parent_id": string,
	"index": number,
	"content"?: string,
	"note"?: string,
	"checked"?: boolean,
}
export interface EditChange {
	"action": "edit",
	"node_id": string,
	"checked"?: boolean,
	"content"?: string,
	"note"?: string,
}
export interface MoveChange {
	"action": "move",
	"node_id": string,
	"parent_id": string,
	"index": number;
}
export interface DeleteChange {
	"action": "delete",
	"node_id": string;
}

export type Change = InsertChange | EditChange | MoveChange | DeleteChange;