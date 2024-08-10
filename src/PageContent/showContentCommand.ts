import { window, commands, type ExtensionContext } from 'vscode';
import PageContentProvider from './PageContentProvider.js';
import RootNode from './RootNode.js';
const showContentCommand = (context: ExtensionContext) => {
	try {
		const provider = new PageContentProvider(context);
		const treeView = window.createTreeView('growi-list-document-content', { treeDataProvider: provider });
		treeView.onDidChangeCheckboxState((e) => {
			const item = e.items[0][0];
			provider.toogleCheck(item);
		});
		const showContentCommand = commands.registerCommand('growi-list-view.show-content', (documentId?: string) => {
			provider.load(documentId);
		});
		const insertCommand = commands.registerCommand('growi-list-view.node.insert', async (node?: RootNode) => {
			const content = await window.showInputBox({
				prompt: 'Enter the content for the new node',
				ignoreFocusOut: true,
			});
			if (content) {
				provider.insertNode(node, content);
			}
		});
		const editCommand = commands.registerCommand('growi-list-view.node.edit', async (node: RootNode) => {
			const content = await window.showInputBox({
				prompt: 'Edit the content',
				value: node.label?.toString(),
				ignoreFocusOut: true,
			});
			if (content) {
				provider.editNode(node, content);
			}
		});
		const deleteCommand = commands.registerCommand('growi-list-view.node.delete', (node: RootNode) => {
			provider.deleteNode(node);
		});
		const indentCommand = commands.registerCommand('growi-list-view.node.indent', (node: RootNode) => {
			provider.indentNode(node);
		});
		const outdentCommand = commands.registerCommand('growi-list-view.node.outdent', (node: RootNode) => {
			provider.outdentNode(node);
		});

		context.subscriptions.push(
			treeView,
			showContentCommand,
			insertCommand,
			editCommand,
			deleteCommand,
			indentCommand,
			outdentCommand,
		);
	} catch (error) {
		window.showErrorMessage('Failed to register the commands.');
	}
};
export default showContentCommand;