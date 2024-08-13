import { workspace, ExtensionContext, ConfigurationTarget, EventEmitter, Event, Disposable, WorkspaceConfiguration, window, commands } from 'vscode';
import { TOKEN_KEY } from '../constants';

export class Setting {
	private _onDidChange: EventEmitter<'url' | 'token'> = new EventEmitter();
	readonly onDidChange: Event<'url' | 'token'> = this._onDidChange.event;
	private disposables: Disposable[] = [];
	public static async getInstance(context: ExtensionContext) {
		const setting = new Setting(context);
		await setting.init();
		return setting;
	}
	private constructor(private context: ExtensionContext) {
		this.disposables.push(
			workspace.onDidChangeConfiguration(e => {
				if (e.affectsConfiguration(`growi-todo-list.url`)) this._onDidChange.fire('url');
			})
		);
	}
	dispose(): void {
		this.disposables.forEach(d => d.dispose());
	}
	private get config(): WorkspaceConfiguration {
		return workspace.getConfiguration('growi-todo-list');
	}
	get url(): string {
		const url = this.config.get<string>('url');
		if (!url) {
			this.promoteInput('url');
			throw new Error('url not set');
		}
		return url;
	}
	set url(url: string | undefined) {
		this.config.update('url', url ? encodeURI(url.trim()) : undefined, ConfigurationTarget.Global);
		this._onDidChange.fire('url');
	}
	#token: string | undefined;
	get token(): string {
		const token = this.#token;
		if (!token) {
			this.promoteInput('token').then(()=>{
				this.init();
			});
			throw new Error('token not set');
		}
		return token;
	}
	set token(value: string | undefined) {
		if (value === undefined) { return; }
		this.context.secrets.store(TOKEN_KEY, value).then(() => {
			this._onDidChange.fire('token');
		});
	}
	async init() {
		this.#token = await this.context.secrets.get(TOKEN_KEY);
		this.check('url');
		this.check('token');
	}
	private async check(type: 'url' | 'token') {
		if (!this[type]) {
			await this.promoteInput(type);
		}
	}
	private async promoteInput(type: 'url' | 'token') {
		const action = await window.showInformationMessage(`API ${type} not set. Please input your growi ${type}.`, `Input ${type}`);
		if (action === `Input ${type}`) {
			return await commands.executeCommand(`growi-todo-list.save-${type}`);
		}
		throw new Error(`${type} not set.`);
	}

}
