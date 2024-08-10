import * as vscode from 'vscode';
import File from './PageContent';
import getToken from '../Token/getToken';
import PageListResponse from './PageListResponse';
import PageContent from './PageContent';

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
		const pages = await this.fetch<PageListResponse>(`${this.url}/_api/v3/pages/recent?access_token=${this.token}`,'GET');
		
		console.log(pages);
		return pages.pages;
	}
	async fetchDocumentContent(path: string) {
		console.log('fetchDocumentContent, path:', path);
		const response = await this.fetch<PageContent>(`${this.url}_api/v3/page?access_token=${this.token}&path=${encodeURI(path)}`, 'GET');
		return response;
		// 	if (response._code !== 'Ok') {
	// 		console.error({ response });
	// 		throw new Error(`Failed to fetch content. ${response._msg}, document_id:${fileId}`);
	// 	}
	// 	return response;
	}
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
