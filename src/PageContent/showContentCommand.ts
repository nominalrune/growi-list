import { window, commands, type ExtensionContext, type OutputChannel } from 'vscode';
import PageContentProvider from './PageContentProvider.js';
import { ListItem, Root } from 'mdast';
import ListItemNode from './ListItemNode.js';
const showContentCommand = (context: ExtensionContext, channel: OutputChannel) => {
	try {
		const provider = new PageContentProvider(context, channel);
		const treeView = window.createTreeView('growi-list-page-content', { treeDataProvider: provider });
		treeView.onDidChangeCheckboxState((e) => {
			const item = e.items[0][0];
			provider.toggleCheck(item as ListItemNode<ListItem>);
		});
		const showContentCommand = commands.registerCommand('growi-todo-list.show-content', (path?: string) => {
			provider.load(path);
		});
		// const editCommand = commands.registerCommand('growi-todo-list.page.edit', async (node: ListItemNode) => {
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