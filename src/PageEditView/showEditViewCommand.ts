import { window, commands, type ExtensionContext, type WebviewPanel } from 'vscode';
import PageEditViewProvider from './PageEditViewProvider.js';
const showEditViewCommand = (context: ExtensionContext) => {
	const editCommand = commands.registerCommand('growi-list-view.page.edit', (content:string) => {
			PageEditViewProvider.createOrShow(context.extensionUri, content);
		})
	context.subscriptions.push(editCommand);

	if (window.registerWebviewPanelSerializer) {
		window.registerWebviewPanelSerializer(PageEditViewProvider.viewType, {
			async deserializeWebviewPanel(webviewPanel: WebviewPanel, state: any) {
				console.log(`Got state: ${state}`);
				// Reset the webview options so we use latest uri for `localResourceRoots`.
				webviewPanel.webview.options = {enableScripts: true};
				PageEditViewProvider.revive(webviewPanel, context.extensionUri, ''); // FIXME
			}
		});
	}
};
export default showEditViewCommand;