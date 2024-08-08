import { type SecretStorage } from 'vscode';
import { TOKEN_KEY } from '../constants';

export default async function getToken(secretStorage: SecretStorage) {
	const token = await secretStorage.get(TOKEN_KEY);
	return token;
}