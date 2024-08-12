import * as vscode from 'vscode';
import File from './PageContent';
import getToken from '../Token/getToken';
import PageListResponse from './PageListResponse';
import PageContent from './PageContent';
import getUrl from '../Token/getUrl';

export default class GrowiAPI {
	private url: string | null = null;
	private token: string | null = null;
	constructor(private context: vscode.ExtensionContext) {
	}
	private async check(type: 'token' | 'url') {
		console.log('check 01:', type, this[type]);
		if (!!this[type]) { return; }
		this[type] = encodeURI(await (type === "token" ? getToken : getUrl)(this.context.secrets) ?? '');
		console.log('check 02:', type, this[type]);
		if (!!this[type]) { return; }
		const action = await vscode.window.showInformationMessage(`API ${type} not set. Please input your growi ${type}.`, `Input ${type}`);
		if (action === `Input ${type}`) {
			return await vscode.commands.executeCommand(`growi-list-view.save-${type}`);
		}
		throw new Error(`${type} not set.`);
	}
	private async checkAll() {
		await this.check('url');
		await this.check('token');
	}
	private async fetch<T>(url: string, method: 'GET' | 'POST', body?: object): Promise<T> {
		await this.checkAll();
		const _url = new URL(`${this.url}_api/v3/${url}`);
		_url.searchParams.set('access_token', this.token ?? '');
		const result = await fetch(_url.toString(), {
			method: method,
			body: JSON.stringify(body)
		});
		if (!result.ok) {
			throw new Error(`Fetch error. ${result.status} ${result.statusText}, url:${_url.toString()} | ${await result.text()}`);
		}
		return await result.json() as T;
	}
	async fetchDocuments() {
		const result = await this.fetch<PageListResponse>(`pages/recent`, 'GET');
		// console.log(result);
		return result.pages;
	}
	async fetchDocumentContent(path: string) {
		console.log('fetchDocumentContent, path:', path);
		const encodedPath = encodeURI(path);
		const response = await this.fetch<{ page: PageContent; }>(`page?path=${encodedPath}`, 'GET');
		return response;
	}
	async savePageContetnt(url: string, body: string) {
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
