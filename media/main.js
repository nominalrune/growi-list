console.log("main.js, this:", this);
const vscode = acquireVsCodeApi();
const source = document.getElementById("source");
const target = document.getElementById("editor");
const simpleMde = new SimpleMDE({ 
	element: target, 
	autoDownloadFontAwesome: false, 
	spellChecker: false, 
	initialValue: source.value,
});
simpleMde.value(source.value);
const messageArea = document.getElementById('message');
const saveButton = document.getElementById('save-button');
saveButton?.addEventListener('click', () => {
	vscode.postMessage({
		command: 'save',
		body: simpleMde.value()
	});
});
const closeButton = document.getElementById('close-button');
closeButton?.addEventListener('click', () => {
	vscode.postMessage({
		command: 'close'
	});
});
window.addEventListener('message', event => {
	const message = event.data;
	switch (message.command) {
		case 'saved':
			messageArea.textContent = "saved.";
			break;
		case 'saveFailed':
			messageArea.textContent = 'failed to save the page.';
			break;
	}
});
