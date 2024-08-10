import * as vscode from 'vscode';
import RootNode from './RootNode';
import GrowiAPI from '../GrowiAPI/GrowiAPI';
import getToken from '../Token/getToken';
import PageContent from '../GrowiAPI/PageContent';
// @ts-expect-error esm module error
import {remark} from 'remark';
export default class PageContentProvider implements vscode.TreeDataProvider<RootNode> {
	private _onDidChangeTreeData = new vscode.EventEmitter<RootNode | undefined | void>();
	readonly onDidChangeTreeData = this._onDidChangeTreeData.event;
	public path: string = '';
	private api: GrowiAPI;
	private hasChanged = false;
	public page: PageContent | undefined;
	public content: VFile | undefined;
	// private parser:typeof remark|undefined;
	// async import(){
	// 	this.parser=(await import('remark')).remark;
	// }
	constructor(private context: vscode.ExtensionContext) {
		this.api = new GrowiAPI(this.context);
		console.log('DocumentContentProvider created', {
			api: this.api,
		});

	}
	dispose() {
		this.saveChanges();
	}
	async load(path?: string) {
		console.log('load', path);
		// save changes before loading other document
		if (this.hasChanged) {
			await this.saveChanges();
			this.hasChanged = false;
		}

		path ??= this.path;
		if (!path) { return; }
		const result = await this.api.fetchDocumentContent(path);
		this.content = remark()
			.parse(result.revision.at(0)?.body ?? '');
	}

	getTreeItem(element: RootNode): vscode.TreeItem {
		return element;
	}

	getChildren(element?: RootNode): Thenable<RootNode[]> {
		const node = this.content.find((node: any) => element ? (node.id === element?.id) : node.id === 'root');
		if (node && !!node.children?.length) {
			return Promise.resolve(
				node.children.map((childId: string) => {
					const childNode = this.content.find((n: any) => n.id === childId);
					if (!childNode) {
						return new RootNode('Error', 'error', 'Error', false, false, false);
					}
					return new RootNode(childNode.content, childNode.id, childNode.note, !!childNode.children?.length, childNode.collapsed, childNode.checked);
				})
			);
		}
		return Promise.resolve([]);
	}

	public insertNode(node: RootNode | undefined, content: string) {
		const index = node ? this.content.findIndex(n => n.id === node.id) : 0;
		if (index === -1) { return; }
		const parent = node ? this.content.find(n => !!n.children?.includes(node.id)) : this.content.find(n => n.id === 'root');
		if (!parent) { return; }
		const tmpId = Math.random().toString(36).substring(2, 15);
		this.content = this.content.map(n => (n.id === parent.id)
			? ({ ...n, children: n.children?.toSpliced(index + 1, 0, tmpId) })
			: n).concat({
				id: tmpId,
				content,
				note: '',
				checked: false,
				collapsed: false,
				children: [],
				created: Date.now(),
				modified: Date.now(),
			});
		this.updateData({
			action: 'insert',
			parent_id: parent.id,
			index: index + 1,
			content,
		});
		console.log('inserted', this.content);
		this._onDidChangeTreeData.fire();
	}

	public editNode(node: RootNode, content: string) {
		this.content = this.content.map(n => n.id === node.id ? ({
			...n,
			content: content,
		}) : n);
		this.updateData({
			action: 'edit',
			node_id: node.id,
			content,
		});
		this._onDidChangeTreeData.fire();
	}

	public deleteNode(node: RootNode) {
		console.log("delete", { node });
		const n = this.content.find(n => n.id === node.id);
		if (!n) { return; }
		this.content = this.content
			.filter(item => (item.id !== node.id))
			.map(item => ({ ...item, children: item.children?.filter(i => i !== node.id) }));
		this.updateData({
			action: 'delete',
			node_id: n.id
		});
		this._onDidChangeTreeData.fire();
	}
	public toogleCheck(node: RootNode) {
		const checked = node.checkboxState === vscode.TreeItemCheckboxState.Checked ? true : false;
		this.content = this.content.map(n => n.id === node.id ? ({ ...n, checked }) : n);
		this.updateData({
			action: 'edit',
			node_id: node.id,
			checked,
		});
		console.log('toggleCheck', node, this.content);
	}
	public indentNode(node: RootNode) {
		const parent = this.content.find(n => n.children?.includes(node.id));
		if (!parent || !parent.children) {
			return;
		}
		const index = parent.children.findIndex(c => c === node.id);
		if (index === -1 || index === 0) {
			return;
		}
		const previousSibling = this.content.find(n => n.id === parent.children?.[index - 1]);
		if (!previousSibling) {
			return;
		}
		this.content = this.content
			.map(n => (n.id === parent.id)
				? ({ ...n, children: n.children?.filter(c => c !== node.id) })
				: n)
			.map(n => (n.id === previousSibling.id)
				? ({ ...n, children: (n.children ?? []).concat([node.id]) })
				: n)
			;
		this.updateData({
			action: 'move',
			node_id: node.id,
			parent_id: previousSibling.id,
			index: previousSibling.children?.length ?? 0,
		});
		this._onDidChangeTreeData.fire();
	}
	public outdentNode(node: RootNode) {
		const parent = this.content.find(n => n.children?.includes(node.id));
		if (!parent || !parent.children) {
			return;
		}
		const grandParent = this.content.find(n => n.children?.includes(parent.id));
		if (!grandParent || !grandParent.children) {
			return;
		}
		const parentIndex = grandParent.children.findIndex(c => c === parent.id);
		if (parentIndex === -1) {
			return;
		}
		this.content = this.content
			.map(n => (n.id === parent.id)
				? ({ ...n, children: n.children?.filter(c => c !== node.id) })
				: n)
			.map(n => (n.id === grandParent.id)
				? ({ ...n, children: n.children?.toSpliced(parentIndex + 1, 0, node.id) })
				: n)
			;
		this.updateData({
			action: 'move',
			node_id: node.id,
			parent_id: grandParent.id,
			index: parentIndex + 1,
		});
		this._onDidChangeTreeData.fire();
	}

	private updateData(change: Change) {
		this.changes.push(change);
		return this.changes;
	}
	public async saveChanges() {
		console.log('saveChanges started', this.changes);
		// this.api.saveDocumentContetnt(this.documentId, this.changes).then(() => {
		// 	this._onDidChangeTreeData.fire();
		// 	this.changes = [];
		// 	console.log('saveChanges finished', this.changes, this.content);
		// });
	}
}