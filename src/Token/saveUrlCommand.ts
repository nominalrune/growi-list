import { commands, window, type ExtensionContext } from 'vscode';
import { URL_KEY } from '../constants';
import { Setting } from '../Setting/Setting';
const saveUrlCommand = (context: ExtensionContext) => {
	const saveCommand = commands.registerCommand('growi-list-view.save-url', () => store(context));
	const deleteCommand = commands.registerCommand('growi-list-view.delete-url', () => destroy(context));
	context.subscriptions.push(saveCommand, deleteCommand);
};

async function store(context: ExtensionContext) {
	const url = await window.showInputBox({
		prompt: 'Enter your Growi Url',
		ignoreFocusOut: true,
		password: false,
	});
	if (url) {
		try {
			const setting = new Setting(context);
			setting.url = url;
			// await context.secrets.store(URL_KEY, url);
			window.showInformationMessage('Url saved successfully.');
			commands.executeCommand('growi-list-view.show-page-list');
		} catch (error) {
			window.showErrorMessage('Failed to save url.');
		}
	}
	return;
}
function destroy(context: ExtensionContext) {
	const setting = new Setting(context);
	setting.url = undefined;
	// context.secrets.delete(URL_KEY);
}

export default saveUrlCommand;