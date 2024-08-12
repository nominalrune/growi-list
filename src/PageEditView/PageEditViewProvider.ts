import * as vscode from 'vscode';
import PageItem from '../PageList/PageItem';
import GrowiAPI from '../GrowiAPI/GrowiAPI';
import PageContent from '../GrowiAPI/PageContent';
export default class PageEditViewProvider {
	public static currentPanel: PageEditViewProvider | undefined;

	public static readonly viewType = 'pageEditView';
	private api: GrowiAPI;
	private readonly panel: vscode.WebviewPanel;
	private readonly extensionUri: vscode.Uri;
	private disposables: vscode.Disposable[] = [];
	#page: PageContent | undefined;
	private get page() {
		return this.#page;
	}
	private set page(value: PageContent | undefined) {
		this.#page = value;
		const webview = this.panel.webview;
		this.panel.webview.html = this.getHtmlForWebview(webview);
	}
	private get path() {
		return this.page?.path;
	}
	private get content() {
		return this.page?.revision.body ?? '';
	}
	private set content(value: string) {
		if (this.page) {
			this.page.revision.body = value;
		}
	}
	public static getPanelOptions(extensionUri: vscode.Uri) {
		return {
			enableScripts: true,
			retainContextWhenHidden: false,
			localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')],
		};
	};

	public static createOrShow(extensionUri: vscode.Uri, pageItem: PageItem, context: vscode.ExtensionContext, channel:vscode.OutputChannel) {
		channel.appendLine('createOrShow');

		const column = vscode.window.activeTextEditor
			? vscode.window.activeTextEditor.viewColumn
			: undefined;

		// If we already have a panel, show it.
		if (PageEditViewProvider.currentPanel) {
			PageEditViewProvider.currentPanel.update(pageItem.path).then(() => {
				PageEditViewProvider.currentPanel?.panel.reveal(column);
			});
			return;
		}

		// Otherwise, create a new panel.
		const panel = vscode.window.createWebviewPanel(
			PageEditViewProvider.viewType,
			'Page Edit',
			column || vscode.ViewColumn.One,
			PageEditViewProvider.getPanelOptions(extensionUri),
		);
		PageEditViewProvider.currentPanel = new PageEditViewProvider(panel, extensionUri, pageItem, context, channel);
	}

	public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, pageItem: PageItem, context: vscode.ExtensionContext, channel : vscode.OutputChannel) {
		console.log('revive', context);
		PageEditViewProvider.currentPanel = new PageEditViewProvider(panel, extensionUri, pageItem, context, channel);
	}

	private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, public pageItem: PageItem, context: vscode.ExtensionContext, private channel:vscode.OutputChannel) {
		console.log('constructor');
		this.panel = panel;
		this.extensionUri = extensionUri;
		this.api = new GrowiAPI(context, channel);
		this.update(pageItem.path);

		// do this when the panel is closed
		this.panel.onDidDispose(() => {
			console.log('dispose EditViewProv'); this.dispose();
		},
			null,
			this.disposables
		);

		// this.panel.onDidChangeViewState(
		// 	e => {
		// 		console.log('this._panel.onDidChangeViewState', { e });
		// 		if (this.panel.visible) {
		// 			this.update(pageItem.path);
		// 		}
		// 	},
		// 	null,
		// 	this.disposables
		// );

		// Handle messages from the webview
		this.panel.webview.onDidReceiveMessage(
			message => {
				switch (message.command) {
					case 'save':
						this.content = message.body;
						this.save();
						break;
					case 'close':
						this.dispose()
						break;
				}
			},
			null,
			this.disposables
		);
	}
	public dispose() {
		PageEditViewProvider.currentPanel = undefined;
		// Clean up our resources
		this.panel.dispose();
		while (this.disposables.length) {
			const x = this.disposables.pop();
			if (x) {
				x.dispose();
			}
		}
	}

	public async save() {
		if (!this.page) { return; }
		console.log('PageEditProvider.save', this.page);
		try {
			await this.api.savePageContetnt(this.page);
		} catch (e) {
			console.dir(e);
			this.panel.webview.postMessage({
				command: 'saveFailed',
				message: (!!e && typeof e === "object" && "message" in e) ? e.message : String(e),
			});
			return;
		}
		this.panel.webview.postMessage({
			command: 'saved',
		});
	}


	private async update(path: string) {
		this.page = (await this.api.fetchDocumentContent(path)).page;
	};

	private getHtmlForWebview(webview: vscode.Webview) {
		// Local path to main script run in the webview
		const scriptPathOnDisk = vscode.Uri.joinPath(this.extensionUri, 'media', 'main.js');
		const editorScriptPathOnDisk = vscode.Uri.joinPath(this.extensionUri, 'media', 'simplemde.min.js');

		// And the uri we use to load this script in the webview
		const scriptUri = webview.asWebviewUri(scriptPathOnDisk);
		const editorScriptUri = webview.asWebviewUri(editorScriptPathOnDisk);

		// Local path to css styles
		const editorStylePath = vscode.Uri.joinPath(this.extensionUri, 'media', 'simplemde.min.css');
		const faStylePath = vscode.Uri.joinPath(this.extensionUri, 'media', 'fa', 'css', 'fa.css');
		const faFontPath = vscode.Uri.joinPath(this.extensionUri, 'media', 'fa', 'fonts', 'fontawesome-webfont.woff2');
		const stylesPathMainPath = vscode.Uri.joinPath(this.extensionUri, 'media', 'main.css');

		// Uri to load styles into webview
		const editorStylesUri = webview.asWebviewUri(editorStylePath);
		const faStylesUri = webview.asWebviewUri(faStylePath);
		const faFontUri = webview.asWebviewUri(faFontPath);
		const stylesMainUri = webview.asWebviewUri(stylesPathMainPath);

		// Use a nonce to only allow specific scripts to be run
		const nonce = getNonce();

		return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; img-src ${webview.cspSource} https:; font-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">

				<link href="${editorStylesUri}" rel="stylesheet">
				<link href="${stylesMainUri}" rel="stylesheet">
				<link href="${faFontUri}" rel="preload" as="font" type="font/woff2">
				<link href="${faStylesUri}" rel="stylesheet">

				<title>Page Edit</title>
			</head>
			<body>
				<h1>${this.path}</h1>
				<textarea id='editor'></textarea>
				<div class='action-area'><button type="button" id="save-button">save</button></div>
				<div class='message-area'><span id='message'></span></div>

				<textarea id='source'>${this.content}</textarea>

				<script nonce="${nonce}" src="${editorScriptUri}"></script>
				<script nonce="${nonce}" src="${scriptUri}"></script>
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