import { ExtensionContext, type SecretStorage } from 'vscode';
import { Setting } from '../Setting/Setting';

export default async function getUrl(context:ExtensionContext) {
	const setting = new Setting(context);
	const url = setting.url;
	// const url = await secretStorage.get(URL_KEY);
	return url;
}