import * as vscode from 'vscode';

export default class DocumentItem extends vscode.TreeItem {
	children: DocumentItem[];
	iconPath: vscode.ThemeIcon;
	constructor(public readonly title: string, public readonly id: string, private type: string, children: any[], collapsed: boolean = false) {
		super(
			title,
			type === "document" ? vscode.TreeItemCollapsibleState.None : collapsed ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.Expanded
		);
		this.tooltip = this.title;
		this.children = children.map((child: any) => new DocumentItem(child.title, child.id, child.type, child.children || [], child?.collapsed));
		this.iconPath = type === "document" ? vscode.ThemeIcon.File : vscode.ThemeIcon.Folder;
		this.command = this.type === 'document' ? {
			command: 'dynalist-plugin.show-content',
			title: 'Show Content',
			arguments: [this.id]
		} : undefined;
	}
}