import * as vscode from 'vscode';
import { Node, List, ListItem, Root, Paragraph, Image } from 'mdast';
export default class ListItemNode<T extends ListItem | Root> extends vscode.TreeItem {
	public children: ListItemNode<ListItem>[][];
	constructor(public readonly node: T) {
		let content = '';
		if (node.type === 'root') {
			content = 'root';
		} else {
			content = ListItemNode.getContent(node.children);
		}
		super(content, vscode.TreeItemCollapsibleState.Collapsed);
		const lists = node.children.filter(n => n.type === 'list') as List[];
		this.children = lists.map(list => list.children.map(li => new ListItemNode(li)));
		if (node.type === 'listItem') {
			this.checkboxState = 'checked' in node && node.checked ? vscode.TreeItemCheckboxState.Checked : vscode.TreeItemCheckboxState.Unchecked;
		}
	}
	// get list's title text. it's in the first node, which is type of paragraph.
	static getContent(nodes: Node[]) {
		const paragraph = nodes.at(0)?.type === 'paragraph' ? nodes.at(0) as Paragraph : null;
		if (!paragraph) {
			return "";
		}
		const content = ListItemNode.nodesToString(paragraph.children);
		return content;
	}
	static getChildLists(nodes: Node[]) {
		return nodes.filter(n => n.type === "list") as List[];
	}
	static nodesToString(nodes: Node[]) {
		const contents: string[] = [];
		nodes.forEach(node => {
			if ('value' in node && typeof node.value === 'string') {
				contents.push(node.value);
			}
			if ('title' in node && typeof node.title === 'string') {
				contents.push(node.title);
			}
			if (node.type === 'image') {
				contents.push(`(image:${(node as Image).url})`);
			}
			if ('children' in node && Array.isArray(node.children)) {
				const childContent = ListItemNode.nodesToString(node.children);
				contents.push(childContent);
			}
		});
		return contents.join(' ');
	}
}
