const addHighlight = (container, searchedText) => {
	const text = container.innerHTML;
	const seachedTextWithoutRegister = new RegExp(searchedText, "i");
	const indexOfSeached = text.search(seachedTextWithoutRegister);
	const searchedTextWithCase = text.slice(indexOfSeached, indexOfSeached + searchedText.length);
    container.innerHTML = text.replace(seachedTextWithoutRegister, `<mark>${searchedTextWithCase}</mark>`, "i");
}
const removeHighlight = (container) => {
    container.innerHTML = container.innerHTML.replace("<mark>", "");
    container.innerHTML = container.innerHTML.replace("</mark>", "");
}

const search = event => {
	const subheaders = voc.getHTML("subheaders");
	event.target.value ? subheaders.hide() : subheaders.show();

	const records = voc.getHTML("records");
	const searchedToken = $(event.target).val().toLowerCase();

	const noRecordFoundBlock = $("#voc-search-error");
	noRecordFoundBlock.remove();

	$("#search-result").remove();

	let filteredRecordsCount = 0;
	//each method can work with rows using $(this), because its first argument is index
	records.each(function(){
		let row = $(this);
		let record = row.children(".col");
		const [wordContainer, translatesContainer] = record;

		removeHighlight(wordContainer);
		removeHighlight(translatesContainer);

		let recordText = (wordContainer.textContent + translatesContainer.textContent).toLowerCase();

		//words are found only by start of the word
		if(recordText.includes(searchedToken)){
			if(searchedToken){
				addHighlight(wordContainer, searchedToken);
				addHighlight(translatesContainer, searchedToken);
			}
			row.show();
			filteredRecordsCount++;
		}
		else{
			row.hide();
		}
	});
	if(!filteredRecordsCount){
		voc.vocHTML.append(
			`<div id="voc-search-error" class="row empty-vocabulary-placeholder border-0">
				<div class="col">За вашим запитом нічого не знайдено!</div>
			</div>`
		);
	}
	else if(event.target.value){
		voc.vocHTML.append(`<div id="search-result" class="row empty-vocabulary-placeholder">
			<div class="col">За вашим запитом знайдено <b>${filteredRecordsCount}</b> записів!</div>
		</div>`)
	}
};