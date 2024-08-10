import * as vscode from 'vscode';
import { Node, List, ListItem, Root } from 'mdast';
import ListItemNode from './ListItemNode';
export default class RootNode extends vscode.TreeItem {
	public children: ListItemNode[][];
	constructor(public readonly node: Root) {
		super('root', vscode.TreeItemCollapsibleState.Collapsed);
		const lists = node.children.filter(n=>n.type==='list');
		this.children = lists.map(list => list.children.map(li=>new ListItemNode(li)));
	}
}
