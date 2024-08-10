import * as vscode from 'vscode';
import { Node, List, ListItem, Root, Paragraph, Image } from 'mdast';
import ListNode from './ListNode';
export default class ListItemNode<T extends ListItem | Root> extends vscode.TreeItem {
	public children: ListItemNode<ListItem>[];
	constructor(node: T) {
		const content = (node?.type === 'root' ? 'root' : ListItemNode.getContent(node.children)) ?? 'root';
		super(content, vscode.TreeItemCollapsibleState.Collapsed);
		const lists = node.children.filter(n => n.type === 'list') as List[];
		this.children = lists.map((list, i) => list.children.map(li=>new ListItemNode(li))).flat();
		if (node.type === 'listItem') {
			this.checkboxState = 'checked' in node && node.checked ? vscode.TreeItemCheckboxState.Checked : vscode.TreeItemCheckboxState.Unchecked;
		}
	}
	/** 
	 * get list's title text. it's in the first node, which is type of paragraph.
	 */
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
