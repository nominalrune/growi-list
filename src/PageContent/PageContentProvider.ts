import * as vscode from 'vscode';
import ListItemNode from './ListItemNode';
import GrowiAPI from '../GrowiAPI/GrowiAPI';
import { List, ListItem, Node, Root } from 'mdast';
import MarkdownService from '../MarkdownService';
import PageContent from '../GrowiAPI/PageContent';
export default class PageContentProvider implements vscode.TreeDataProvider<ListItemNode<ListItem>> {
	private _onDidChangeTreeData = new vscode.EventEmitter<ListItemNode<ListItem> | undefined | void>();
	public readonly onDidChangeTreeData = this._onDidChangeTreeData.event;
	public get path() {
		if (!this.page) { return ''; }
		return this.page.path;
	};
	private page: PageContent | undefined;
	private api: GrowiAPI;
	private hasChanged = false;
	#content: Root | undefined;
	private get content() {
		return this.#content;
	}
	private set content(value: Root | undefined) {
		this.hasChanged = true;
		this.#content = value;
		if (this.page && value) {
			this.page.revision.body = this.markdown.stringify(value);
		}
	}
	private interval_id: NodeJS.Timeout | undefined;
	private markdown: MarkdownService;
	constructor(private context: vscode.ExtensionContext, private channel: vscode.OutputChannel) {
		this.api = new GrowiAPI(this.context, channel);
		this.markdown = new MarkdownService();
		this.interval_id = setInterval(() => {
			console.log("interval");
			this.saveChanges();
		}, 5000);
	}

	dispose() {
		this.saveChanges();
		clearInterval(this.interval_id);
		this.interval_id = undefined;
	}

	getTreeItem(element: ListItemNode<ListItem | Root>): vscode.TreeItem {
		return element;
	}

	getChildren(element?: ListItemNode<ListItem | Root>): Thenable<(ListItemNode<ListItem>)[]> {
		// no content set
		if (!this.content) { return Promise.resolve([]); }
		// element is not set - it's root
		if (!element) {
			return Promise.resolve(
				new ListItemNode(`root`, this.content).children
			);
		}
		// element has children (or not)
		return Promise.resolve(element.children ?? []);
	}

	async load(path?: string) {
		this.channel.appendLine('load: ' + path);
		// save changes before loading other document
		if (this.hasChanged) {
			await this.saveChanges();
		}

		path ??= this.path;
		if (!path) { return; }
		const result = await this.api.fetchDocumentContent(path);
		this.page = result.page;
		const body = result.page.revision.body ?? '';

		this.content = this.markdown.parse(body);
		this._onDidChangeTreeData.fire();
	}

	public async saveChanges() {
		if (this.hasChanged && !!this.page) {
			console.log('saving current page.');
			const result = await this.api.savePageContetnt(this.page);
			this.page = { ...result.page, revision: result.revision };
			this.channel.appendLine(`${this.path}: checkboxes saved.`);
		}
		this.hasChanged = false;
	}

	public toggleCheck(node: ListItemNode<ListItem>) {
		if (!this.content) { return; }
		const route = node.id.split('-').map(i => Number(i)).filter(item => isFinite(item));
		const checked = node.checkboxState === vscode.TreeItemCheckboxState.Checked ? true : false;

		const toEval = `${route.reduce((acc, path) => `${acc}.children[${path}]`, 'this.content')}.checked = ${checked}`;
		eval(toEval);
		this.hasChanged = true;
		console.log("checkbox change", this.content);
	}
}