import { window, commands, type ExtensionContext } from 'vscode';
import DocumentListProvider from './DocumentListProvider';
const showDocumentListCommand = (context: ExtensionContext) => {
	const provider = new DocumentListProvider(context);
	const treeView = window.registerTreeDataProvider('growi-list-document-list', provider);
	const showDocumentCommand = commands.registerCommand('growi-list-view.show-document-list', () => provider.reload());
	context.subscriptions.push(treeView, showDocumentCommand);
};
export default showDocumentListCommand;