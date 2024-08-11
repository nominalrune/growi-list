import * as vscode from 'vscode';
import SimpleMDE from 'simplemde';
import { jsx } from 'react/jsx-runtime';
import { createRoot } from 'react-dom/client';
export default class PageEditViewProvider {
	public static currentPanel: PageEditViewProvider | undefined;

	public static readonly viewType = 'pageEditView';

	private readonly _panel: vscode.WebviewPanel;
	private readonly _extensionUri: vscode.Uri;
	private _disposables: vscode.Disposable[] = [];
	public path = '';
	public content: string = '';

	public static createOrShow(extensionUri: vscode.Uri, content: string) {
		const column = vscode.window.activeTextEditor
			? vscode.window.activeTextEditor.viewColumn
			: undefined;

		// If we already have a panel, show it.
		if (PageEditViewProvider.currentPanel) {
			PageEditViewProvider.currentPanel._panel.reveal(column);
			return;
		}

		// Otherwise, create a new panel.
		const panel = vscode.window.createWebviewPanel(
			PageEditViewProvider.viewType,
			'Page Edit',
			column || vscode.ViewColumn.One,
			{
				// Enable javascript in the webview
				enableScripts: true,
			},
		);
		PageEditViewProvider.currentPanel = new PageEditViewProvider(panel, extensionUri, content);

	}

	public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, content: string) {
		PageEditViewProvider.currentPanel = new PageEditViewProvider(panel, extensionUri, content);
	}

	private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, content: string) {
		this._panel = panel;
		this._extensionUri = extensionUri;
		this.content = content;

		// Set the webview's initial html content
		this._update();

		// Listen for when the panel is disposed
		// This happens when the user closes the panel or when the panel is closed programmatically
		this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

		// Update the content based on view changes
		this._panel.onDidChangeViewState(
			e => {
				if (this._panel.visible) {
					this._update();
				}
			},
			null,
			this._disposables
		);

		// Handle messages from the webview
		this._panel.webview.onDidReceiveMessage(
			message => {
				switch (message.command) {
					case 'load':
						this.content = message.content;
						break;
					case 'save':
						vscode.commands.executeCommand('growi-list-view.save-page', [this.content]);
						return;
				}
			},
			null,
			this._disposables
		);
	}

	public save() {
		// Send a message to the webview webview.
		// You can send any JSON serializable data.
		this._panel.webview.postMessage({
			command: 'save',
			content: this.content,
		});
	}

	public dispose() {
		PageEditViewProvider.currentPanel = undefined;
		// Clean up our resources
		this._panel.dispose();
		while (this._disposables.length) {
			const x = this._disposables.pop();
			if (x) {
				x.dispose();
			}
		}
	}

	private _update() {
		const webview = this._panel.webview;
		this._panel.webview.html = this._getHtmlForWebview(webview);

	};

	private _getHtmlForWebview(webview: vscode.Webview) {
		// Local path to main script run in the webview
		const scriptPathOnDisk = vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js');
		const editorScriptPathOnDisk = vscode.Uri.joinPath(this._extensionUri, 'media', 'simplemde.min.js');

		// And the uri we use to load this script in the webview
		const scriptUri = webview.asWebviewUri(scriptPathOnDisk);
		const editorScriptUri = webview.asWebviewUri(editorScriptPathOnDisk);

		// Local path to css styles
		const editorStylePath = vscode.Uri.joinPath(this._extensionUri, 'media', 'simplemde.min.css');
		const stylesPathMainPath = vscode.Uri.joinPath(this._extensionUri, 'media', 'main.css');

		// Uri to load styles into webview
		const editorStylesUri = webview.asWebviewUri(editorStylePath);
		const stylesMainUri = webview.asWebviewUri(stylesPathMainPath);

		// Use a nonce to only allow specific scripts to be run
		const nonce = getNonce();

		return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">

				<!--
					Use a content security policy to only allow loading images from https or from our extension directory,
					and only allow scripts that have a specific nonce.
				-->
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; img-src ${webview.cspSource} https:; script-src 'nonce-${nonce}';">

				<meta name="viewport" content="width=device-width, initial-scale=1.0">

				<link href="${editorStylesUri}" rel="stylesheet">
				<link href="${stylesMainUri}" rel="stylesheet">

				<title>Cat Coding</title>
			</head>
			<body>
				<h1>${this.path}</h1>
				<textarea id='root' value='${this.content}'></textarea>

				<script nonce="${nonce}" src="${scriptUri}"></script>
				<script nonce="${nonce}" src="${editorScriptUri}"></script>
			</body>
			</html>`;
	}
}

function getNonce() {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}