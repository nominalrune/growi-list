import * as vscode from 'vscode';
import File from './PageContent';
import getToken from '../Token/getToken';
import PageListResponse from './PageListResponse';
import PageContent from './PageContent';
import getUrl from '../Token/getUrl';

export default class GrowiAPI {
	private baseurl: string | null = null;
	private token: string | null = null;
	constructor(private context: vscode.ExtensionContext) {
		this.check('baseurl').then(() => this.check('token'));
	}
	private async check(type: 'token' | 'baseurl') {
		if (this[type]) { return; }
		this[type] = await (type === "token" ? getToken : getUrl)(this.context.secrets) ?? null;
		if (this[type]) { return; }
		const action = await vscode.window.showInformationMessage(`API ${type} not set. Please input your growi ${type}.`, `Input ${type}`);
		if (action === `Input ${type}`) {
			vscode.commands.executeCommand(`growi-list-view.save-${type}`);
		}
		throw new Error(`${type} not set.`);
	}
	private async fetch<T>(url: string, method: 'GET' | 'POST', body?: object): Promise<T> {
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
		const result = await this.fetch<PageListResponse>(`${this.baseurl}_api/v3/pages/recent?access_token=${encodeURI(this.token ?? '')}`, 'GET');
		console.log(result);
		return result.pages;
	}
	async fetchDocumentContent(path: string) {
		console.log('fetchDocumentContent, path:', path);
		const response = await this.fetch<{ page: PageContent; }>(`${this.baseurl}_api/v3/page?access_token=${encodeURI(this.token ?? '')}&path=${encodeURI(path)}`, 'GET');
		return response;
	}
	async savePageContetnt(url:string, body:string) {
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
	}
}
