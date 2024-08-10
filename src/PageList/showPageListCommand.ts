import { window, commands, type ExtensionContext } from 'vscode';
import PageListProvider from './PageListProvider';
const showPageListCommand = (context: ExtensionContext) => {
	const provider = new PageListProvider(context);
	const treeView = window.registerTreeDataProvider('growi-list-page-list', provider);
	const showPagesCommand = commands.registerCommand('growi-list-view.show-page-list', () => provider.reload());
	context.subscriptions.push(treeView, showPagesCommand);
};
export default showPageListCommand;