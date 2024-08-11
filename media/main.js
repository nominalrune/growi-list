document.addEventLister('DOMContentLoaded', () => {
	const simplemde = new SimpleMDE({ element: document.getElementById("root") });
	console.log({simplemde});
});