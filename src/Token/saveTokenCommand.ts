import { commands, window, type ExtensionContext } from 'vscode';
import { TOKEN_KEY } from '../constants';
const saveTokenCommand = (context: ExtensionContext) => {
	const saveCommand = commands.registerCommand('growi-todo-list.save-token', () => store(context));
	const deleteCommand = commands.registerCommand('growi-todo-list.delete-token', () => destroy(context));
	context.subscriptions.push(saveCommand, deleteCommand);
};

async function store(context: ExtensionContext) {
	const token = await window.showInputBox({
		prompt: 'Enter your Growi API Token',
		ignoreFocusOut: true,
		password: true,
	});
	if (token) {
		try {
			await context.secrets.store(TOKEN_KEY, token);
			window.showInformationMessage('Token saved successfully.');
			commands.executeCommand('growi-todo-list.show-page-list');
		} catch (error) {
			window.showErrorMessage('Failed to save token.');
		}
	}
	return;
}
function destroy(context: ExtensionContext) {
	context.secrets.delete(TOKEN_KEY);
}

export default saveTokenCommand;