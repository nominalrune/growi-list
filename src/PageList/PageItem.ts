import * as vscode from 'vscode';

export default class PageItem extends vscode.TreeItem {
	// children: PageItem[];
	iconPath: vscode.ThemeIcon;
	constructor(public readonly title: string, public readonly id: string, public path: string) {
		super(
			title,
			vscode.TreeItemCollapsibleState.None
		);
		this.iconPath = vscode.ThemeIcon.File;
		this.command =  {
			command: 'growi-list-view.show-content',
			title: 'Show Content',
			arguments: [this.path]
		};
	}
}