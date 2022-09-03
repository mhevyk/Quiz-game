const withDoubleClick = event => {
	const editedField = $(event.target);
	const editedRecord = editedField.parent();
	if(editedRecord.hasClass("table-row") && !editedField.hasClass("table-counter")){
		const oldText = editedField.text().trim();
		const oldTextWithMarks = editedField.html().trim();
		const isFieldTranslate = !!(editedField.index() - 1); //0 if we edit word, 1 if translate, !! convertes any type to boolean
		//add input
		editedField.html(`<input type="text" id="edit" value="${oldText}" class="text-center p-0" 
			data-bs-toggle="tooltip"
			data-bs-placement="${isFieldTranslate ? "right" : "left"}"
			title="Для відміни редагування видаліть вміст текстового поля або залишіть його так як є,
			а для виходу з режиму редагування натисніть поза ним"
		>`);

		const editInput = $("#edit");
		editInput.tooltip();

		//if we edit word, it can`t contain commas because in this app word must be only one
		if(!isFieldTranslate){
			editInput.on("input", forbidTypingIncorrectSymbols);
		}
		//event for deleting edit input, when clicking apart from input and saving results
		$("body").click(function(deleteEvent){
			const deleteTarget = $(deleteEvent.target);
			if(deleteTarget.attr("id") !== "edit"){
				//new text removes extra spaces, extra commas and repeated translates 
				const newText = validateTranslates(editInput.val()) || oldText;
				voc.updateRecord(oldText, newText, isFieldTranslate);
				//remove input and write newText
				editInput.remove();
				editedField.html(oldTextWithMarks);

				//don`t forget to remove body click handler
				$("body").unbind("click");
			}
		});
	}
}