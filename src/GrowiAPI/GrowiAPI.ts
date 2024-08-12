import * as vscode from 'vscode';
import File from './PageContent';
import getToken from '../Token/getToken';
import PageListResponse from './PageListResponse';
import PageContent from './PageContent';
import getUrl from '../Token/getUrl';

export default class GrowiAPI {
	private url: string | null = null;
	private token: string | null = null;
	constructor(private context: vscode.ExtensionContext, private channel: vscode.OutputChannel) {
	}
	private async check(type: 'token' | 'url') {
		if (!!this[type]) { return; }
		this[type] = encodeURI(await (type === "token" ? getToken : getUrl)(this.context) ?? '');
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
	private async fetch<T>(url: string, method: 'GET' | 'POST', urlParam?: object, body?: object): Promise<T> {
		await this.checkAll();
		const _url = new URL(this.url ?? '');
		_url.pathname = `_api/v3/${url}`;
		_url.searchParams.set('access_token', this.token ?? '');
		if (urlParam) {
			Object.entries(urlParam).forEach(([k, v]) => {
				_url.searchParams.set(k, v);
			});
		}
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
		const response = await this.fetch<{ page: PageContent; }>(`page`, 'GET', { path: encodedPath });
		return response;
	}
	async savePageContetnt(page: PageContent) {
		const response = await this.fetch('pages.update', 'POST', undefined, {
			page_id: page.id,
			revision_id: page.revision._id,
			body: page.revision.body,
		});
		console.log('saveDocumentContetnt response:', response);
		return response;
	}
}
