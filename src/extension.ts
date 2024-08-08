import { type ExtensionContext } from 'vscode';
import saveTokenCommand from './Token/saveTokenCommand';
import showDocumentListCommand from './DocumentList/showDocumentListCommand';
import showContentCommand from './DocumentContent/showContentCommand';
import saveUrlCommand from './Token/saveUrlCommand';

export function activate(context: ExtensionContext) {
	saveUrlCommand(context);
	saveTokenCommand(context);
	showDocumentListCommand(context);
	showContentCommand(context);
}

export function deactivate() { }