console.log("main.js,this:", this);
// this.document.addEventLister('DOMContentLoaded', () => {
	const source=this.document.getElementById("source");
	const target=this.document.getElementById("editor");
	const simpleMde = new SimpleMDE({ element: target, autoDownloadFontAwesome:false, spellChecker:false,});
	simpleMde.value(source.value);
// });