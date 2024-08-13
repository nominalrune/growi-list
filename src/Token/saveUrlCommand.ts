import { commands, window, type ExtensionContext } from 'vscode';
import { URL_KEY } from '../constants';
import { Setting } from '../Setting/Setting';
const saveUrlCommand = (context: ExtensionContext) => {
	const saveCommand = commands.registerCommand('growi-todo-list.save-url', () => store(context));
	const deleteCommand = commands.registerCommand('growi-todo-list.delete-url', () => destroy(context));
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
			const setting = await Setting.getInstance(context);
			setting.url = url;
			window.showInformationMessage('Url saved successfully.');
			commands.executeCommand('growi-todo-list.show-page-list');
		} catch (error) {
			window.showErrorMessage('Failed to save url.');
		}
	}
	return;
}
async function destroy(context: ExtensionContext) {
	const setting = await Setting.getInstance(context);
	setting.url = undefined;
}

export default saveUrlCommand;