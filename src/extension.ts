import { type ExtensionContext, window } from 'vscode';
import saveTokenCommand from './Token/saveTokenCommand';
import showPageListCommand from './PageList/showPageListCommand';
import showContentCommand from './PageContent/showContentCommand';
import saveUrlCommand from './Token/saveUrlCommand';
import showEditViewCommand from './PageEditView/showEditViewCommand';

export function activate(context: ExtensionContext) {
	const channel = window.createOutputChannel('growi-todo-list')
	saveUrlCommand(context);
	saveTokenCommand(context);
	showPageListCommand(context, channel);
	showContentCommand(context, channel);
	showEditViewCommand(context, channel);
}

export function deactivate() { }