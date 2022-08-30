const formSubmitCallbacks = {
	"form-add-one": function(event){
		const form = event.target;

		const wordInput = form.word;
		const translateInputs = $(form.translate);
		const unitSelect = form.unit;

		const word = wordInput.value.trim();
		const translates = Array.from(translateInputs, input => input.value.trim());//Array.from() другим параметром може приймати функцію для опрацювання нового масиву
		const unit = unitSelect.selectedOptions[0].value;

		confirm.customShow({
			title: "Додавання слова",
			body: `Справді додати слово <b>${word}</b> (переклади: <i>${translates.join(", ")}</i>) до розділу <b>${unit}</b>?`,
			submitButtonText: "Додати",
			onSubmitHide: true,
			onSubmit: () => {
				voc.add(word, translates, unit);

				//reset form and remove a lot of translates
				resetFormAddOne(form);

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
		const word = $("#form-edit-manually-word").find(":selected").val();
		const recordToEdit = voc.findRecordByWord(word);
		//0 if we want to edit word, 1 if translate
		const editType = parseInt($('input[name=form-edit-manually-type]:checked', '#form-edit-manually').val());
		const whatToEdit = editType ? recordToEdit.translates.join(", ") : recordToEdit.word;

		confirm.body(`<input type="text" id="manual-edit" value="${whatToEdit}"}>`);

		if(!editType){
			$("#manual-edit").on("input", commaWriteEvent => {
				const input = $(commaWriteEvent.target);
				const valueWithousCommas = input.val().replace(/\,/g, "");
				input.val(valueWithousCommas);
			});
		}

		confirm.customShow({
			title: `Редагування ${editType ? "перекладів" : "слова"}`,
			submitButtonText: "Зберегти зміни",
			onSubmitHide: true,
			onSubmit: () => {
				const typedText = $("#manual-edit").val();
				//if we edit translate, we must validate value, if it is word, we remain user typed test, because commas are removed by event
				const newText = (editType) ? (validateTranslates(typedText) || whatToEdit) : typedText;
				
				if(!newText) return "Impossible to edit!";

				voc.updateRecord(whatToEdit, newText, editType);
				voc.print();
				voc.update();
				$("#manual-edit").unbind("change");
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
$("#form-unit-add-submit").click(() => $("#form-unit-add").trigger("submit"));

$("#form-add-one-translates-add").click(() => {
	const translatesInputGroups = $(".form-add-one-translates-group");

	//create dom structure of new translate input and then putting it after last translate input
	const newTranslateInput = $(
		`<div class="form-add-one-translates-group">
			<input type="text" name="translate" class="form-control" placeholder="Переклад" value="" required>
			<i class="fas fa-times"></i>
			<div class="translate-feedback invalid-feedback mb-2">
				Введіть переклад!
			</div>
		</div>`);
	
	newTranslateInput.find("input").on("input", replaceCommasInInput);
	translatesInputGroups.eq(-1).after(newTranslateInput);

	//printing length of input fields
	const translateInputsCount = $(".form-add-one-translates-group").length;
	$("#form-add-one-translates-count").text(translateInputsCount);
});
$("#form-add-one-translates").click(event => {
	//if button is cross icon (has class "fa-times"), remove block of translates
	const button = $(event.target);
	button.hasClass("fa-times") && button.parent().remove();

	$("#form-add-one-translates-count").text($(".form-add-one-translates-group").length);
});
$("#form-add-one-reset").click(function(event){
	event.preventDefault();
	confirm.customShow({
		title: "Очистка форми",
		body: `Справді очистити форму?`,
		submitButtonText: "Так",
		onSubmitHide: true,
		onSubmit: () => {
			resetFormAddOne(document.querySelector("#form-add-one"));
		}
	})
});
$("#form-add-one").on("input", function(event){
	const currentForm = $(this);
	const currentInput = $(event.target);
	const currentValue = currentInput.val();

	const translateInputs = currentForm.find("input[type='text']:not(:focus)");
	const invalidFeedback = currentInput.parent().find(".invalid-feedback");

	let feedbackText = "";
	translateInputs.each(function(){
		const inputValue = $(this).val();

		if(inputValue.trim() === currentValue){
			feedbackText = (currentInput.name === this.name) ? "Переклади співпадають!" : "Слово і переклад співпадають!";
		}
		else if(!currentValue.trim()){
			const isWordFeedback = invalidFeedback.hasClass("word-feedback");
			feedbackText = `Введіть ${(isWordFeedback ? "слово" : "переклад")}!`;
		}
		else{
			feedbackText = "";
		}
		event.target.setCustomValidity(feedbackText);
		invalidFeedback.text(feedbackText);
	});
})
function checkIfWordIsInVocabulary(event){
	const currentInput = event.target;
	const currentValue = currentInput.value;

	const currentFormGroup = $(currentInput).parent();
	const invalidFeedback = currentFormGroup.find(".invalid-feedback");
	const validFeedback = currentFormGroup.find(".valid-feedback");

	const foundRecord = voc.findRecordByWord(currentValue);

	if(foundRecord){
		currentInput.setCustomValidity("");
		validFeedback.html(`Знайдено слово <b>${foundRecord.word}</b> з такими перекладами: ${foundRecord.translates.join(", ")}`);
	}
	else if(currentValue.trim()){
		currentInput.setCustomValidity("Такого слова немає у словнику!");
		invalidFeedback.text("Такого слова немає у словнику!");
	}
	else{
		currentInput.setCustomValidity("Введіть слово!");
		invalidFeedback.text("Введіть слово!");
	}
}

const debouncedCheckIfWordIsInVocabulary = debounce(checkIfWordIsInVocabulary, 400);

$("#form-remove-one-input").on("input", debouncedCheckIfWordIsInVocabulary);
$("#form-remove-range").on("input", function(event){
	const word1Input = document.querySelector("#form-remove-range-word1-input");
	const word2Input = document.querySelector("#form-remove-range-word2-input");

	let word1 = word1Input.value.toLowerCase();
	let word2 = word2Input.value.toLowerCase();

	debouncedCheckIfWordIsInVocabulary(event);

	if(word1 === word2){
		word2Input.setCustomValidity("Слова співпадають!");
		$(word2Input).parent().find(".invalid-feedback").text("Слова співпадають!");
	}
});

const searchHandler = event => {
	const subheaders = voc.getHTML("subheaders");
	event.target.value ? subheaders.hide() : subheaders.show();

	const records = voc.getHTML("records");
	const searchedToken = $(event.target).val().toLowerCase();

	const noRecordFoundBlock = $("#voc-search-error");
	noRecordFoundBlock.remove();

	$("#search-result").remove();

	const highlight = (container, searchedText) => {
		container.innerHTML = container.innerHTML.replace(searchedText, `<mark>${searchedText}</mark>`)
	}
	const removeHighlight = (container) => {
		container.innerHTML = container.innerHTML.replace("<mark>", "");
		container.innerHTML = container.innerHTML.replace("</mark>", "");
	}

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
				highlight(wordContainer, searchedToken);
				highlight(translatesContainer, searchedToken);
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

$("#search-input").on("input", debounce(searchHandler, 400));

$("#form-export-submit").click(function(event){
	confirm.customShow({
		title: "Експорт словника",
		body: "Справді завантажити архів зі всіма розділами словника?",
		submitButtonText: "Так",
		onSubmitHide: true,
		onSubmit: () => {
			let zip = new JSZip();
			const wordAndTranslatesSeparator = ">";

			for(let unit of voc.units){
				let recordsByUnit = voc.select(unit);
				let fileText = "";
				for(let record of recordsByUnit){
					//using \r\n because fileReader functions parse lines of txt file by this separator
					fileText += `${record.word} ${wordAndTranslatesSeparator} ${record.translates.join(", ")}\r\n`;
				}
				zip.file(`${unit}.txt`, fileText);
			}
			zip.generateAsync({type: "blob"}).then(function(content){
			    saveAs(content, "vocabulary.zip");
			});
		}
	});
});
$("#vocabulary-content").dblclick(event => {
	const editedField = $(event.target);
	const editedRecord = editedField.parent();
	if(editedRecord.hasClass("table-row") && !editedField.hasClass("table-counter")){
		const oldText = editedField.text().trim();
		const isFieldTranslate = !!(editedField.index() - 1); //0 if we edit word, 1 if translate, !! convertes any type to boolean
		//add input
		editedField.html(`<input type="text" id="edit" value="${oldText}" class="text-center p-0">`);

		const editInput = $("#edit");

		//if we edit word, it can`t contain commas because in this app word must be only one
		if(!isFieldTranslate){
			editInput.on("input", commaWriteEvent => {
				const valueWithousCommas = editInput.val().replace(/\,/g, "");
				editInput.val(valueWithousCommas);
			});
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
				editedField.text(newText);

				//don`t forget to remove body click handler
				$("body").unbind("click");
			}
		});
	}
});
//avoid to type comma
$(`[data-comma-avoid="true"]`).on("input", replaceCommasInInput);

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