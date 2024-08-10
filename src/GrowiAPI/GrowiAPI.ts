import * as vscode from 'vscode';
import File from './PageContent';
import getToken from '../Token/getToken';
import PageListResponse from './PageListResponse';
import PageContent from './PageContent';
import getUrl from '../Token/getUrl';

export default class GrowiAPI {
	baseurl: string | null = null;
	token: string | null = null;
	constructor(private context: vscode.ExtensionContext) {
		this.checkBaseUrlAndToken();
	}
	private async checkBaseUrlAndToken() {
		if (!this.baseurl) {
			this.baseurl = await getUrl(this.context.secrets) ?? null;
			if (!this.baseurl) {
				const action = await vscode.window.showInformationMessage('API url not set. Please input your growi url.', 'Input Url');
				if (action === 'Input Url') {
					vscode.commands.executeCommand('growi-list-view.save-url');
				}
				throw new Error('url not set.');
			}
		}
		if (!this.token) {
			this.token = await getToken(this.context.secrets) ?? null;
			if (!this.token) {
				const action = await vscode.window.showInformationMessage('API token not set. Please input your growi token.', 'Input token');
				if (action === 'Input token') {
					vscode.commands.executeCommand('growi-list-view.save-token');
				}
				throw new Error('Token not set.');
			}
		}
	}
	private async fetch<T>(url: string, method: 'GET' | 'POST', body?: object): Promise<T> {
		const result = await fetch(url, {
			method: method,
			body: JSON.stringify(body)
		});
		if (!result.ok) {
			throw new Error(`Fetch error. ${result.statusText}`);
		}
		// const text = await result.text();

		// console.log("fetch result", text, 'url', url);
		return await result.json() as T;
	}
	async fetchDocuments() {
		await this.checkBaseUrlAndToken();
		const pages = await this.fetch<PageListResponse>(`${this.baseurl}_api/v3/pages/recent?access_token=${encodeURI(this.token ?? '')}`, 'GET');

		console.log(pages);
		return pages.pages;
	}
	async fetchDocumentContent(path: string) {
		console.log('fetchDocumentContent, path:', path);
		await this.checkBaseUrlAndToken();
		const response = await this.fetch<{page:PageContent}>(`${this.baseurl}_api/v3/page?access_token=${encodeURI(this.token ?? '')}&path=${encodeURI(path)}`, 'GET');
		return response;
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
