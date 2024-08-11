import { Root } from 'mdast';
import { window, commands, type ExtensionContext, type WebviewPanel } from 'vscode';
import PageEditViewProvider from './PageEditViewProvider.js';
import PageItem from '../PageList/PageItem.js';
import ListItemNode from '../PageContent/ListItemNode.js';
const showEditViewCommand = (context: ExtensionContext) => {
	const editCommand = commands.registerCommand('growi-list-view.page.edit', (node: PageItem) => {
		// console.log("editCommand", node);
		// const content = ListItemNode.nodesToString(node.node.children);
		PageEditViewProvider.createOrShow(context.extensionUri, node, context);
	});
	context.subscriptions.push(editCommand);

	if (window.registerWebviewPanelSerializer) {
		window.registerWebviewPanelSerializer(PageEditViewProvider.viewType, {
			async deserializeWebviewPanel(webviewPanel: WebviewPanel, state: any) {
				console.log(`deserializeWebviewPanel: Got state: ${state}`);
				// Reset the webview options so we use latest uri for `localResourceRoots`.
				webviewPanel.webview.options = { enableScripts: true };
				PageEditViewProvider.revive(webviewPanel, context.extensionUri, new PageItem("","",""), context); // FIXME
			}
		});
	}
};
export default showEditViewCommand;