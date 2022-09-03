//form add events
$("#form-add-one").on("input", validateInputs);
$("#form-add-one-translates-add").on("click", addTranslate);
$("#form-add-one-translates").on("click", removeTranslate);
$("#form-add-one-reset").on("click", resetWithConfirm);

//add unit event
$("#form-unit-add input").on("input", validateUnit);
$("#form-unit-add-submit").on("click", addUnit);

//import and export events
$("#form-add-many-file-input").change(importFromTxtAndZip);
$("#form-export-submit").click(exportToTxt);

//forms remove one and range events
$("#form-remove-one-input").on("input", debounce(findRecord));
$("#form-remove-range").on("input", findBothRecords);

//search events
$("#search-input").on("input", debounce(search, 400));

//edit events
$("#vocabulary-content").dblclick(withDoubleClick);
//avoid to type comma
$(`[data-comma-avoid="true"]`).on("input", forbidTypingIncorrectSymbols);

const editWordSelect = $("#form-edit-manually-word");

editWordSelect.on("change", event => {
	event.target.setCustomValidity("");
})
$("#form-edit-manually-unit").on("change", event => {
	const unitContent = voc.select($(event.target).find(":selected").val());
	const placeholder = `<option selected disabled value="">Виберіть слово</option>`;
	editWordSelect.html(placeholder + unitContent.map(a => `<option value="${a.word}">${a.word}</option>`))
	editWordSelect[0].setCustomValidity("Виберіть слово з цього розділу!");
});