import { type SecretStorage } from 'vscode';
import { URL_KEY } from '../constants';

export default async function getUrl(secretStorage: SecretStorage) {
	const url = await secretStorage.get(URL_KEY);
	return url;
}