import { window, commands, type ExtensionContext } from 'vscode';
import DocumentListProvider from './PageListProvider';
const showPageListCommand = (context: ExtensionContext) => {
	const provider = new DocumentListProvider(context);
	const treeView = window.registerTreeDataProvider('growi-list-page-list', provider);
	const showPagesCommand = commands.registerCommand('growi-list-view.show-page-list', () => provider.reload());
	context.subscriptions.push(treeView, showPagesCommand);
};
export default showPageListCommand;