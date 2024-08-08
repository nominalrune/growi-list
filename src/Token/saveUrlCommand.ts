import { commands, window, type ExtensionContext } from 'vscode';
import { URL_KEY } from '../constants';
const saveUrlCommand = (context: ExtensionContext) => {
	const saveCommand = commands.registerCommand('growi-list-view.save-url', () => store(context));
	const deleteCommand = commands.registerCommand('growi-list-view.delete-url', () => destroy(context));
	context.subscriptions.push(saveCommand, deleteCommand);
};

async function store(context: ExtensionContext) {
	const url = await window.showInputBox({
		prompt: 'Enter your Growi Url',
		ignoreFocusOut: true,
		password: true,
	});
	if (url) {
		try {
			await context.secrets.store(URL_KEY, url);
			window.showInformationMessage('Url saved successfully.');
			commands.executeCommand('growi-list-view.show-document-list');
		} catch (error) {
			window.showErrorMessage('Failed to save url.');
		}
	}
	return;
}
function destroy(context: ExtensionContext) {
	context.secrets.delete(URL_KEY);
}

export default saveUrlCommand;