import { type ExtensionContext } from 'vscode';
import saveTokenCommand from './Token/saveTokenCommand';
import showPageListCommand from './PageList/showPageListCommand';
import showContentCommand from './DocumentContent/showContentCommand';
import saveUrlCommand from './Token/saveUrlCommand';

export function activate(context: ExtensionContext) {
	saveUrlCommand(context);
	saveTokenCommand(context);
	showPageListCommand(context);
	showContentCommand(context);
}

export function deactivate() { }