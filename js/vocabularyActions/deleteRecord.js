const findRecord = event => {
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
const findBothRecords = event => {
	const word1Input = document.querySelector("#form-remove-range-word1-input");
	const word2Input = document.querySelector("#form-remove-range-word2-input");

	let word1 = word1Input.value.toLowerCase();
	let word2 = word2Input.value.toLowerCase();

	findRecord(event);

	if(word1 === word2){
		word2Input.setCustomValidity("Слова співпадають!");
		$(word2Input).parent().find(".invalid-feedback").text("Слова співпадають!");
	}
};