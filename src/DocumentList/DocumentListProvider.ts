import * as vscode from 'vscode';
import DocumentItem from './DocumentItem';
import GrowiAPI from '../GrowiAPI/GrowiAPI';
import File from '../GrowiAPI/File';
export default class GrowiDocumentProvider implements vscode.TreeDataProvider<DocumentItem> {
	private _onDidChangeTreeData: vscode.EventEmitter<DocumentItem | undefined | void> = new vscode.EventEmitter<DocumentItem | undefined | void>();
	readonly onDidChangeTreeData: vscode.Event<DocumentItem | undefined | void> = this._onDidChangeTreeData.event;
	private documentTree: File | null = null;
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
			(tree) => {
				// this.documentTree = tree;
				this._onDidChangeTreeData.fire();
			}
		);
	}

	getTreeItem(element: DocumentItem): vscode.TreeItem {
		return element;
	}

	getChildren(element?: DocumentItem): Thenable<DocumentItem[]> {
		if (element) {
			return Promise.resolve(element.children.map((child: any) => new DocumentItem(child.title, child.id, child.type, child.children || [])));
		} else {
			return Promise.resolve(this.documentTree?.children?.map((child: any) => new DocumentItem(child.title, child.id, child.type, child.children || [])) ?? []);
		}
	}
}