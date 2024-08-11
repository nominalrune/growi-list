import { window, commands, type ExtensionContext } from 'vscode';
import PageContentProvider from './PageContentProvider.js';
const showContentCommand = (context: ExtensionContext) => {
	try {
		const provider = new PageContentProvider(context);
		const treeView = window.createTreeView('growi-list-page-content', { treeDataProvider: provider });
		treeView.onDidChangeCheckboxState((e) => {
			const item = e.items[0][0];
			provider.toggleCheck(item);
		});
		const showContentCommand = commands.registerCommand('growi-list-view.show-content', (path?: string) => {
			provider.load(path);
		});
		// const editCommand = commands.registerCommand('growi-list-view.page.edit', async (node: ListItemNode) => {
		// 	const content = await window.showInputBox({
		// 		prompt: 'Edit the content',
		// 		value: node.label?.toString(),
		// 		ignoreFocusOut: true,
		// 	});
		// 	if (content) {
		// 		provider.editNode(node, content);
		// 	}
		// });

		context.subscriptions.push(
			treeView,
			showContentCommand,
			// editCommand,
		);
	} catch (error) {
		window.showErrorMessage('Failed to register the commands.');
	}
};
export default showContentCommand;