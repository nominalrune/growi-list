import * as vscode from 'vscode';
import Node from './Node';
import File from './File';
import { Change } from './Change';
import getToken from '../Token/getToken';

export default class GrowiAPI {
	url: string | null = null;
	token: string | null = null;
	constructor(private context: vscode.ExtensionContext) { }
	private async fetch<T>(url: string, method:'GET'|'POST', body?: object): Promise<T> {
		if (!this.url) {
			const url = await getToken(this.context.secrets);
			if (!url) {
				const action = await vscode.window.showInformationMessage('API url not set. Please input your growi url.', 'Input Url');
				if (action === 'Input Url') {
					vscode.commands.executeCommand('growi-list-view.save-url');
				}
				throw new Error('url not set.');
			}
			this.url = url;
		}
		if (!this.token) {
			const token = await getToken(this.context.secrets);
			if (!token) {
				const action = await vscode.window.showInformationMessage('API token not set. Please input your growi token.', 'Input token');
				if (action === 'Input token') {
					vscode.commands.executeCommand('growi-list-view.save-token');
				}
				throw new Error('Token not set.');
			}
			this.token = token;
		}
		const result = await fetch(url, {
			method: method,
			body: JSON.stringify(body)
		});
		if (!result.ok) {
			throw new Error(`Fetch error. ${result.statusText}`);
		}
		return await result.json() as T;
	}
	async fetchDocuments() {
		const pages = await this.fetch<ListResponse>(`${this.url}/_api/v3/pages/recent?access_token=${this.token}`,'GET');
		
		console.log(pages);
		return pages;
	}
	// async fetchDocumentContent(fileId: string) {
	// 	console.log('fetchDocumentContent, file_id:', fileId);
	// 	const response = await this.fetch<DocResponse>('https://growi.io/api/v1/doc/read', {
	// 		file_id: fileId,
	// 	});
	// 	if (response._code !== 'Ok') {
	// 		console.error({ response });
	// 		throw new Error(`Failed to fetch content. ${response._msg}, document_id:${fileId}`);
	// 	}
	// 	return response;
	// }
	// async saveDocumentContetnt(fileId: string, changes: Change[]) {
	// 	const response = await this.fetch<EditResponse>('https://growi.io/api/v1/doc/edit', {
	// 		file_id: fileId,
	// 		changes: changes,
	// 	})
	// 		.catch(e => {
	// 			if (e instanceof Error) {
	// 				throw e;
	// 			} else { throw new Error(`Failed to save content: ${String(e)}, document_id:${fileId}`); }
	// 		});
	// 	console.log('saveDocumentContetnt response:', response);
	// 	if (response._code !== 'Ok') {
	// 		throw new Error(`Failed to save content: ${response._msg}, document_id:${fileId}`);
	// 	}
	// }
}
type CommonError = "InvalidToken" | "TooManyRequests" | "Invalid" | "LockFail";
interface ListResponse {
	"_code": "Ok" | CommonError,
	"_msg": string,
	"root_file_id": string,
	"files": File[],
}

interface DocResponse {
	"_code": "Ok" | CommonError | "Unauthorized" | "NotFound",
	"_msg": string,
	"file_id": string,
	"title": string,
	"nodes": Node[];
}

interface EditResponse {
	"_code": "Ok" | CommonError | "Unauthorized" | "NotFound" | "NodeNotFound",
	"_msg": string,
}