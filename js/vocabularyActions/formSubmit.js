//Array.from() другим параметром може приймати функцію для опрацювання нового масиву
const getAllInputValues = inputCollection => Array.from(inputCollection, input => input.value.trim());

const formSubmitCallbacks = {
	"form-add-one": function(event){
		const form = event.target;

		const wordInput = form.word;
		const translateInputs = $(form.translate);
		const unitSelect = form.unit;

		const word = wordInput.value.trim();
		const translates = getAllInputValues(translateInputs);
		const unit = getSelectedOptionValue(unitSelect);

		confirm.customShow({
			title: "Додавання слова",
			body: `Справді додати слово <b>${word}</b> (переклади: <i>${translates.join(", ")}</i>) до розділу <b>${unit}</b>?`,
			submitButtonText: "Додати",
			onSubmitHide: true,
			onSubmit: () => {
				voc.add(word, translates, unit);

				//reset form and remove a lot of translates
				reset(form);

				voc.print();
			}
		});
	},
	"form-unit-add": function(event){
		const addSelect = $("#form-add-one-unit");
		const unitInput = $("#form-unit-add-input");
		const unit = unitInput.val().trim();
		
		resetTextInput(unitInput);
		$(event.target).removeClass("was-validated");//reset colorful form validation

		$('#modal-unit-add').modal("hide");

		confirm.customShow({
			title: "Додавання розділу",
			body: `Справді додати розділ <b>${unit}</b>?`,
			submitButtonText: "Додати",
			onSubmitHide: true,
			onSubmit: () => {
				addSelect.append(`<option value="${unit}">${unit}</option>`);
				addSelect.find("option").eq(-1).attr("selected", true); //makes last option active
			}
		});
	},
	"form-edit-manually": function(event){
		const form = event.target;
		
		const word = getSelectedOptionValue(form.word);
		const recordToEdit = voc.findRecordByWord(word);
		console.log(recordToEdit.translates)
		//0 if we want to edit word, 1 if translate
		const checkboxValue = form.querySelector("input[name=form-edit-manually-type]:checked").value;
		const editType = parseInt(checkboxValue);
		const whatToEdit = editType ? recordToEdit.translates.join(", ") : recordToEdit.word;

		let manualEditInput;

		if(!editType){
			manualEditInput = $(`<input type="text" id="manual-edit" value="${whatToEdit}"}>`);
			manualEditInput.on("input", forbidTypingIncorrectSymbols);
		}
		else{
			manualEditInput = recordToEdit.translates.reduce((acc, cur) => acc + `<input type="text" class="d-block" value="${cur}">`, "");
		}

		confirm.body(manualEditInput);

		confirm.customShow({
			title: `Редагування ${editType ? "перекладів" : "слова"}`,
			submitButtonText: "Зберегти зміни",
			onSubmitHide: true,
			onSubmit: () => {
				const typedText = manualEditInput.val();
				//if we edit translate, we must validate value, if it is word, we remain user typed test, because commas are removed by event
				const newText = (editType) ? (validateTranslates(typedText) || whatToEdit) : typedText;
				
				if(!newText) return "Impossible to edit!";

				voc.updateRecord(whatToEdit, newText, editType);
				voc.print();
				voc.update();
				manualEditInput.unbind("change");
			}
		});
	},
	"form-remove-one": function(event){
		const wordInput = $(event.target).find("input[name=word]");
		const word = wordInput.val().toLowerCase();

		confirm.customShow({
			title: "Видалення слова",
			body: `Справді видалити слово <b>${word}</b>?`,
			submitButtonText: "Видалити",
			onSubmitHide: true,
			onSubmit: () => {
				voc.remove(word);
				voc.print();
				resetTextInput(wordInput);
			}
		});
	},
	"form-remove-range": function(event){
		const word1Input = $("#form-remove-range-word1-input");
		const word2Input = $("#form-remove-range-word2-input");

		const word1 = word1Input.val().toLowerCase();
		const word2 = word2Input.val().toLowerCase();

		const wordsThatWillBeDeleted = voc.getRemoveRangeData(word1, word2).wordsToDelete;//list of deleted words
		const wordsThatWillBeDeletedBold = wordsThatWillBeDeleted.map(word => word.bold());//list of deleted words, but in <b> tag

		confirm.customShow({
			title: "Видалення діапазону слів",
			body: `Справді видалити наступні слова: ${wordsThatWillBeDeletedBold.join(", ")}?`,
			submitButtonText: "Видалити",
			onSubmitHide: true,
			onSubmit: () => {
				voc.removeRange(word1, word2);
				voc.print();
				resetTextInput(word1Input);//очитка input word1Input
				resetTextInput(word2Input);//очитка input word1Input
			}
		});
	},
	"form-remove-unit": function(event){
		const removeSelect = event.target.unit;
		const unit = removeSelect.selectedOptions[0].value;

		confirm.customShow({
			title: "Видалення розділу слів",
			body: `Справді видалити розділ <b>${unit}</b>?`,
			submitButtonText: "Видалити",
			onSubmitHide: true,
			onSubmit: () => {
				voc.removeUnit(unit);
				voc.print();
				event.target.reset();
			}
		});
	},
	"form-clear": function(){
		confirm.customShow({
			title: "Очистка словника",
			body: "Справді очистити словник?",
			submitButtonText: "Очистити",
			onSubmitHide: true,
			onSubmit: () => {
				voc.clear();
			}
		});
	},
}

$("form").submit(event => {
	//avoid sending form if it is not validated
	event.preventDefault();

	const target = event.target;
	$(target).addClass("was-validated");

	//if form typed values are valid, we call validateFunction from formSubmitCallbacks if it exists
	target.checkValidity() && formSubmitCallbacks[target.id]?.(event);
});