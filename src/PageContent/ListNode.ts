import * as vscode from 'vscode';
import { ListItem, } from 'mdast';
import ListItemNode from './ListItemNode';
export default class ListNode extends vscode.TreeItem {
	public children: ListItemNode<ListItem>[];
	constructor(index: number, nodes: ListItem[]) {
		super(index.toString(), vscode.TreeItemCollapsibleState.Collapsed);
		this.children = nodes.map(li => new ListItemNode(li));
	}
}
