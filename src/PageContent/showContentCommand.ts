import { window, commands, type ExtensionContext } from 'vscode';
import PageContentProvider from './PageContentProvider.js';
import ListItemNode from './ListItemNode.js';
const showContentCommand = (context: ExtensionContext) => {
	try {
		const provider = new PageContentProvider(context);
		const treeView = window.createTreeView('growi-list-page-content', { treeDataProvider: provider });
		treeView.onDidChangeCheckboxState((e) => {
			// const item = e.items[0][0];
			// provider.toggleCheck(item);
		});
		const showContentCommand = commands.registerCommand('growi-list-view.show-content', (path?: string) => {
			provider.load(path);
		});
		// const insertCommand = commands.registerCommand('growi-list-view.node.insert', async (node?: ListItemNode) => {
		// 	const content = await window.showInputBox({
		// 		prompt: 'Enter the content for the new node',
		// 		ignoreFocusOut: true,
		// 	});
		// 	if (content) {
		// 		provider.insertNode(node, content);
		// 	}
		// });
		// const editCommand = commands.registerCommand('growi-list-view.node.edit', async (node: ListItemNode) => {
		// 	const content = await window.showInputBox({
		// 		prompt: 'Edit the content',
		// 		value: node.label?.toString(),
		// 		ignoreFocusOut: true,
		// 	});
		// 	if (content) {
		// 		provider.editNode(node, content);
		// 	}
		// });
		// const deleteCommand = commands.registerCommand('growi-list-view.node.delete', (node: ListItemNode) => {
		// 	provider.deleteNode(node);
		// });
		// const indentCommand = commands.registerCommand('growi-list-view.node.indent', (node: ListItemNode) => {
		// 	provider.indentNode(node);
		// });
		// const outdentCommand = commands.registerCommand('growi-list-view.node.outdent', (node: ListItemNode) => {
		// 	provider.outdentNode(node);
		// });

		context.subscriptions.push(
			treeView,
			showContentCommand,
			// insertCommand,
			// editCommand,
			// deleteCommand,
			// indentCommand,
			// outdentCommand,
		);
	} catch (error) {
		window.showErrorMessage('Failed to register the commands.');
	}
};
export default showContentCommand;