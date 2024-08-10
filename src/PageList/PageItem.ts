import * as vscode from 'vscode';

export default class PageItem extends vscode.TreeItem {
	// children: PageItem[];
	iconPath: vscode.ThemeIcon;
	constructor(public readonly title: string, public readonly id: string, private path: string) {
		super(
			title,
			vscode.TreeItemCollapsibleState.None
		);
		this.iconPath = vscode.ThemeIcon.File;
		// this.command = this.type === 'document' ? {
		// 	command: 'dynalist-plugin.show-content',
		// 	title: 'Show Content',
		// 	arguments: [this.id]
		// } : undefined;
	}
}