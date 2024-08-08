export default interface Node {
	"id": string,
	"content": string,
	"note": string,
	"checked"?: boolean,
	"checkbox"?: boolean, // whether this item has checkbox
	"color"?: number, // color label, 0~6
	"heading"?: number, // heading level, 0~3
	"created": number,
	"modified": number,
	"collapsed"?: boolean,
	"children"?: string[];
}