import { workspace, ExtensionContext, ConfigurationTarget, EventEmitter, Event, Disposable, WorkspaceConfiguration } from 'vscode';
import { TOKEN_KEY } from '../constants';

export class Setting {
	private _onDidChange: EventEmitter<'url' | 'token'> = new EventEmitter();
	readonly onDidChange: Event<'url' | 'token'> = this._onDidChange.event;
	private disposables: Disposable[] = [];
	constructor(private context: ExtensionContext) {
		this.init();
		this.disposables.push(
			workspace.onDidChangeConfiguration(e => {
				if (e.affectsConfiguration(`growi-list-view.url`)) this._onDidChange.fire('url');
			})
		);
	}
	dispose(): void {
		this.disposables.forEach(d => d.dispose());
	}
	private get config(): WorkspaceConfiguration {
		return workspace.getConfiguration('growi-list-view');
	}
	get url(): string | undefined {
		return this.config.get<string>('url');
	}
	set url(url: string | undefined) {
		this.config.update('url', url ? encodeURI(url.trim()) : undefined, ConfigurationTarget.Global);
		this._onDidChange.fire('url');
	}
	#token: string | undefined;
	get token() {
		return this.#token;
	}
	set token(value: string | undefined) {
		if (value === undefined) { return; }
		this.context.secrets.store(TOKEN_KEY, value).then(()=>{
			this._onDidChange.fire('token');
		});
	}
	async init() {
		this.#token = await this.context.secrets.get(TOKEN_KEY);
	}
}
