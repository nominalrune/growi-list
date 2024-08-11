import { type ExtensionContext } from 'vscode';
import saveTokenCommand from './Token/saveTokenCommand';
import showPageListCommand from './PageList/showPageListCommand';
import showContentCommand from './PageContent/showContentCommand';
import saveUrlCommand from './Token/saveUrlCommand';
import showEditViewCommand from './PageEditView/showEditViewCommand';

export function activate(context: ExtensionContext) {
	saveUrlCommand(context);
	saveTokenCommand(context);
	showPageListCommand(context);
	showContentCommand(context);
	showEditViewCommand(context);
}

export function deactivate() { }