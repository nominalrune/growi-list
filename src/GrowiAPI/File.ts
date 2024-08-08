export default interface File {
	id: string,
	title: string,
	type: string,
	permission: number,
	collapsed?: boolean,
	children?: string[],
}