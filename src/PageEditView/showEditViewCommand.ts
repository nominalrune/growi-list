import { Root } from 'mdast';
import { window, commands, Uri, type ExtensionContext, type WebviewPanel, type OutputChannel } from 'vscode';
import PageEditViewProvider from './PageEditViewProvider.js';
import PageItem from '../PageList/PageItem.js';
import ListItemNode from '../PageContent/ListItemNode.js';
const showEditViewCommand = (context: ExtensionContext, channel: OutputChannel) => {
	const editCommand = commands.registerCommand('growi-list-view.page.edit', (node: PageItem) => {
		// console.log("editCommand", node);
		// const content = ListItemNode.nodesToString(node.node.children);
		PageEditViewProvider.createOrShow(context.extensionUri, node, context, channel);
	});
	context.subscriptions.push(editCommand);

	if (window.registerWebviewPanelSerializer) {
		window.registerWebviewPanelSerializer(PageEditViewProvider.viewType, {
			async deserializeWebviewPanel(webviewPanel: WebviewPanel, state: any) {
				console.log(`deserializeWebviewPanel: Got state: ${state}`);
				// Reset the webview options so we use latest uri for `localResourceRoots`.
				webviewPanel.webview.options = PageEditViewProvider.getPanelOptions(Uri.joinPath(context.extensionUri, 'media'));
				PageEditViewProvider.revive(webviewPanel, context.extensionUri, new PageItem("", "", ""), context, channel); // FIXME
			}
		});
	}
};
export default showEditViewCommand;