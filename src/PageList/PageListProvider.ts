import * as vscode from 'vscode';
import PageItem from './PageItem';
import GrowiAPI from '../GrowiAPI/GrowiAPI';
import PageContent from '../GrowiAPI/PageContent';
import Page from '../GrowiAPI/Page';
export default class PageListProvider implements vscode.TreeDataProvider<PageItem> {
	private _onDidChangeTreeData: vscode.EventEmitter<PageItem | undefined | void> = new vscode.EventEmitter<PageItem | undefined | void>();
	readonly onDidChangeTreeData: vscode.Event<PageItem | undefined | void> = this._onDidChangeTreeData.event;
	private pages: Page[] | null = null;
	private api: GrowiAPI;

	constructor(context: vscode.ExtensionContext) {
		this.api = new GrowiAPI(context);
		this.reload()
			.catch((e) => {
				if (e instanceof Error) {
					vscode.window.showWarningMessage(e.message);
					return;
				}
			});
	}

	async reload() {
		this.api.fetchDocuments().then(
			(pages) => {
				this.pages = pages;
				this._onDidChangeTreeData.fire();
			}
		);
	}

	getTreeItem(element: PageItem): vscode.TreeItem {
		return element;
	}

	getChildren(element?: PageItem): Thenable<PageItem[]> {
		if (element) {
			return Promise.resolve([]);
		} else {
			return Promise.resolve(this.pages?.map(p => new PageItem(p.path.split('/').at(-1) ?? "", p.id, p.path)) ?? []);
		}
	}
}