import * as vscode from 'vscode';
import ListItemNode from './ListItemNode';
import GrowiAPI from '../GrowiAPI/GrowiAPI';
import getToken from '../Token/getToken';
import PageContent from '../GrowiAPI/PageContent';
// @ts-expect-error esm module error
import { remark } from 'remark';
import { ListItem, Root } from 'mdast';
import ListNode from './ListNode';
export default class PageContentProvider implements vscode.TreeDataProvider<ListItemNode<ListItem>> {
	private _onDidChangeTreeData = new vscode.EventEmitter<ListItemNode<ListItem> | undefined | void>();
	public readonly onDidChangeTreeData = this._onDidChangeTreeData.event;
	public path: string = '';
	private api: GrowiAPI;
	private hasChanged = false;
	private page: PageContent | undefined;
	private content: Root | undefined; //VFile;
	constructor(private context: vscode.ExtensionContext) {
		this.api = new GrowiAPI(this.context);
		console.log('DocumentContentProvider created', {
			api: this.api,
		});
	}
	dispose() { }
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
		const body = result.page.revision.body ?? '';
		this.content = remark().parse(body);
		this.path = path;
		this._onDidChangeTreeData.fire();
		console.log('content', body, 'parsed', this.content);
	}
	public async saveChanges() {
		if (this.hasChanged) {
			console.log('saveChanges started');
			const body = this.page?.revision.body ?? ''; // FIXME
			await this.api.savePageContetnt(this.path, body);
		}
		this.hasChanged = false;
		this._onDidChangeTreeData.fire();
	}

	getTreeItem(element: ListItemNode<ListItem | Root> | ListNode): vscode.TreeItem {
		return element;
	}

	getChildren(element?: ListItemNode<ListItem> | ListNode): Thenable<(ListItemNode<ListItem> | ListNode)[]> {
		if (element && !!element.children?.length) {
			console.log('getChildren', element, "children", element.children);
			return Promise.resolve(element.children);
		}
		if (!this.content) { return Promise.resolve([]); }
		console.log('getChildren', element, "children", new ListItemNode(this.content).children);
		return Promise.resolve(
			new ListItemNode(this.content).children
		);
	}

	// public insertNode(node: ListItemNode<ListItem> | undefined, content: string) {
	// 	const index = node ? this.content.findIndex(n => n.id === node.id) : 0;
	// 	if (index === -1) { return; }
	// 	const parent = node ? this.content.find(n => !!n.children?.includes(node.id)) : this.content.find(n => n.id === 'root');
	// 	if (!parent) { return; }
	// 	const tmpId = Math.random().toString(36).substring(2, 15);
	// 	this.content = this.content.map(n => (n.id === parent.id)
	// 		? ({ ...n, children: n.children?.toSpliced(index + 1, 0, tmpId) })
	// 		: n).concat({
	// 			id: tmpId,
	// 			content,
	// 			note: '',
	// 			checked: false,
	// 			collapsed: false,
	// 			children: [],
	// 			created: Date.now(),
	// 			modified: Date.now(),
	// 		});
	// 	this.updateData({
	// 		action: 'insert',
	// 		parent_id: parent.id,
	// 		index: index + 1,
	// 		content,
	// 	});
	// 	console.log('inserted', this.content);
	// 	this._onDidChangeTreeData.fire();
	// }

	// public editNode(node: ListItemNode<ListItem>, content: string) {
	// 	this.content = this.content.map(n => n.id === node.id ? ({
	// 		...n,
	// 		content: content,
	// 	}) : n);
	// 	this.updateData({
	// 		action: 'edit',
	// 		node_id: node.id,
	// 		content,
	// 	});
	// 	this._onDidChangeTreeData.fire();
	// }

	// public deleteNode(node: ListItemNode<ListItem>) {
	// 	console.log("delete", { node });
	// 	const n = this.content.find(n => n.id === node.id);
	// 	if (!n) { return; }
	// 	this.content = this.content
	// 		.filter(item => (item.id !== node.id))
	// 		.map(item => ({ ...item, children: item.children?.filter(i => i !== node.id) }));
	// 	this.updateData({
	// 		action: 'delete',
	// 		node_id: n.id
	// 	});
	// 	this._onDidChangeTreeData.fire();
	// }
	// public toggleCheck(node: ListItemNode<ListItem>) {
	// 	const checked = node.checkboxState === vscode.TreeItemCheckboxState.Checked ? true : false;
	// 	this.content = this.content.map(n => n.id === node.id ? ({ ...n, checked }) : n);
	// 	this.updateData({
	// 		action: 'edit',
	// 		node_id: node.id,
	// 		checked,
	// 	});
	// 	console.log('toggleCheck', node, this.content);
	// }
	// public indentNode(node: ListItemNode<ListItem>) {
	// 	const parent = this.content.find(n => n.children?.includes(node.id));
	// 	if (!parent || !parent.children) {
	// 		return;
	// 	}
	// 	const index = parent.children.findIndex(c => c === node.id);
	// 	if (index === -1 || index === 0) {
	// 		return;
	// 	}
	// 	const previousSibling = this.content.find(n => n.id === parent.children?.[index - 1]);
	// 	if (!previousSibling) {
	// 		return;
	// 	}
	// 	this.content = this.content
	// 		.map(n => (n.id === parent.id)
	// 			? ({ ...n, children: n.children?.filter(c => c !== node.id) })
	// 			: n)
	// 		.map(n => (n.id === previousSibling.id)
	// 			? ({ ...n, children: (n.children ?? []).concat([node.id]) })
	// 			: n)
	// 		;
	// 	this.updateData({
	// 		action: 'move',
	// 		node_id: node.id,
	// 		parent_id: previousSibling.id,
	// 		index: previousSibling.children?.length ?? 0,
	// 	});
	// 	this._onDidChangeTreeData.fire();
	// }
	// public outdentNode(node: ListItemNode<ListItem>) {
	// 	const parent = this.content.find(n => n.children?.includes(node.id));
	// 	if (!parent || !parent.children) {
	// 		return;
	// 	}
	// 	const grandParent = this.content.find(n => n.children?.includes(parent.id));
	// 	if (!grandParent || !grandParent.children) {
	// 		return;
	// 	}
	// 	const parentIndex = grandParent.children.findIndex(c => c === parent.id);
	// 	if (parentIndex === -1) {
	// 		return;
	// 	}
	// 	this.content = this.content
	// 		.map(n => (n.id === parent.id)
	// 			? ({ ...n, children: n.children?.filter(c => c !== node.id) })
	// 			: n)
	// 		.map(n => (n.id === grandParent.id)
	// 			? ({ ...n, children: n.children?.toSpliced(parentIndex + 1, 0, node.id) })
	// 			: n)
	// 		;
	// 	this.updateData({
	// 		action: 'move',
	// 		node_id: node.id,
	// 		parent_id: grandParent.id,
	// 		index: parentIndex + 1,
	// 	});
	// 	this._onDidChangeTreeData.fire();
	// }

}