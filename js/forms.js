const formSubmitCallbacks = {
	"form-add-one": function(event){
		const wordInput = event.target.word;
		const translateInputs = $(event.target.translate);
		const unitSelect = event.target.unit;

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
		const recordToEdit = voc.voc.find(record => record.word === word);
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
	$(event.target).addClass("was-validated");
	if(event.target.checkValidity()){
		let validateFunction = formSubmitCallbacks[event.target.id];
		if(validateFunction && typeof validateFunction === "function"){
			validateFunction(event);
		}
	}
});
$("form").find("input").on("input", event => {
	let text = event.target.value;
	if(!text.trim()){
		let errorText = "Назва розділу не може бути пробілами!";
		event.target.setCustomValidity(errorText);//validation failed with errorText
	}
	else{
		event.target.setCustomValidity("");//validation successfull
	}
});
$("#form-unit-add-submit").click(event => {
	$("#form-unit-add").trigger("submit");
});
$("#form-add-one-translates-add").click(event => {
	const translatesInputGroups = $(".form-add-one-translates-group");

	//create dom structure of new translate input and then putting it after last translate input
	const newTranslateInput = $(
		`<div class="form-add-one-translates-group">
			<input type="text" name="translate" class="form-control" placeholder="Переклад" value="" required>
			<i class="fas fa-times"></i>
			<div class="invalid-feedback mb-2">
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
	if($(event.target).hasClass("fa-times")){
		$(event.target).parent().remove();
	}
	$("#form-add-one-translates-count").text($(".form-add-one-translates-group").length);
});
$("#form-add-one").on("input", function(event){
	let word = $("#form-remove-one-input");
	let translateInputs = $(this).find("input[type=text]:not(:focus)");
	let currentValue = $(event.target).val();
	let invalidFeedback = $(event.target).parent().find(".invalid-feedback");
	translateInputs.each(function(i){
		if($(this).val() === currentValue && currentValue.trim() && $(this).val().trim()){
			if(event.target.name === this.name){
				event.target.setCustomValidity("Переклади співпадають!");
				invalidFeedback.text("Переклади співпадають!");
			}
			else{
				event.target.setCustomValidity("Слово і переклад співпадають!");
				invalidFeedback.text("Слово і переклад співпадають!");
			}
			return false;
		}
		else if(currentValue.trim() === ""){
			event.target.setCustomValidity("Введіть переклад!");
			invalidFeedback.text("Введіть переклад!");
		}
		else{
			event.target.setCustomValidity("");
		}
	});
})
function checkIfWordIsInVocabulary(event){
	let word = voc.voc.find(a => a.word === event.target.value.toLowerCase());
	let invalidFeedback = $(event.target).parent().find(".invalid-feedback");
	let validFeedback = $(event.target).parent().find(".valid-feedback");
	if(word){
		event.target.setCustomValidity("");
		validFeedback.html(`Знайдено слово <b>${word.word}</b> з такими перекладами: ${word.translates.join(", ")}`);
	}
	else if(!word && event.target.value.trim().length > 0){
		event.target.setCustomValidity("Такого слова немає у словнику!");
		invalidFeedback.text("Такого слова немає у словнику!");
	}
	else{
		event.target.setCustomValidity("Введіть слово!");
		invalidFeedback.text("Введіть слово!");
	}
}
$("#form-remove-one-input").on("input", checkIfWordIsInVocabulary);
$("#form-remove-range").on("input", function(event){
	let word1 = $("#form-remove-range-word1-input").val().toLowerCase();
	let word2 = $("#form-remove-range-word2-input").val().toLowerCase();

	checkIfWordIsInVocabulary(event);
	if(word1 === word2){
		document.querySelector("#form-remove-range-word2-input").setCustomValidity("Слова співпадають!");
		$("#form-remove-range-word2-input").parent().find(".invalid-feedback").text("Слова співпадають!");
	}
});

$("#search-input").on("input", event => {
	const records = voc.vocHTML.find(".row");
	const searchedToken = $(event.target).val().toLowerCase();

	const noRecordFoundBlock = $("#voc-search-error");
	noRecordFoundBlock.remove();

	let filteredRecordsCount = 0;
	//each method can work with rows using $(this), because its first argument is index
	records.each(function(){
		let row = $(this);
		let record = row.children(".col");
		let word = record.eq(0).text().toLowerCase();

		//words are found only by start of the word
		if(word.startsWith(searchedToken)){
			row.show();
			filteredRecordsCount++;
		}
		else{
			row.hide();
		}
	});
	if(!filteredRecordsCount){
		voc.vocHTML.append(
			`<div id="voc-search-error" class="row empty-vocabulary-placeholder border-0" style="">
				<div class="col">За вашим запитом нічого не знайдено!<br>Слово шукається за його початком по стовпцю "Слово"!</div>
			</div>`
		);
	}
});
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