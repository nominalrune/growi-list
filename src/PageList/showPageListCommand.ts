import { window, commands, type ExtensionContext, type OutputChannel } from 'vscode';
import PageListProvider from './PageListProvider';
const showPageListCommand = (context: ExtensionContext, channel: OutputChannel) => {
	const provider = new PageListProvider(context, channel);
	const treeView = window.registerTreeDataProvider('growi-list-page-list', provider);
	const showPagesCommand = commands.registerCommand('growi-list-view.show-page-list', () => provider.reload());
	context.subscriptions.push(treeView, showPagesCommand);
};
export default showPageListCommand;