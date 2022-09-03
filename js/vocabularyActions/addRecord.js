const setInvalidFeedback = (input, feedback) => {
	input.parentNode.querySelector(`.invalid-feedback`).textContent = feedback;
	input.setCustomValidity(feedback);
};

const findRepeatedMoreThanOnce = array => {
	return array.reduce((accumulator, current) => {
		//if value is null string (""), we skip iteration by returning acc
		if(!current) return accumulator;

		accumulator[current] = accumulator[current] ? (accumulator[current] + 1) : 1;
		return accumulator;
	}, {});
}
function validateInputs(){
	const wordInput = document.querySelector("#form-add-one-word-input");
	const allTextInputs = this.querySelectorAll("input[type='text']");

	const inputValuesList = Array.from(allTextInputs, input => input.value);
	const inputValuesRepeatCount = findRepeatedMoreThanOnce(inputValuesList);

	for(const input of allTextInputs){
		let feedback = "";

		if(!input.value){
			const inputType = (input.name === "word") ? "слово" : "переклад";
			feedback = `Введіть ${inputType}!`;
		}
		else if(inputValuesRepeatCount[input.value] > 1){
			const whatMatches = (wordInput.value === input.value) ? "Слово та переклад" : "Переклади";
			feedback = `${whatMatches} співпадають!`;
		}
		setInvalidFeedback(input, feedback);
	}	
}
function addTranslate(){
	const translatesInputGroups = $(".form-add-one-translates-group");

	//create dom structure of new translate input and then putting it after last translate input
	const newTranslateInput = $(
		`<div class="form-add-one-translates-group">
			<input type="text" name="translate" class="form-control translate" placeholder="Переклад" value="" required>
			<i class="fas fa-times"></i>
			<div class="translate-feedback invalid-feedback mb-2">
				Введіть переклад!
			</div>
		</div>`
	);
	
	newTranslateInput.find("input").on("input", forbidTypingIncorrectSymbols);
	translatesInputGroups.eq(-1).after(newTranslateInput);

	//printing length of input fields
	const translateInputsCount = $(".form-add-one-translates-group").length;
	$("#form-add-one-translates-count").text(translateInputsCount);
};
const removeTranslate = event => {
	//if button is cross icon (has class "fa-times"), remove block of translates
	const button = $(event.target);
	if(button.hasClass("fa-times")){
		button.parent().remove();
		const formAddOne = document.querySelector("#form-add-one");
		const bindedToAddOneForm = validateInputs.bind(formAddOne);
		bindedToAddOneForm();
	}

	$("#form-add-one-translates-count").text($(".form-add-one-translates-group").length);
}

const resetFeedback = (form, feedbackSelector, defaultText) => {
	const feedbacks = $(form).find(feedbackSelector);
	feedbacks.text(defaultText);
}

function reset(form){
	form.reset();

	$(form.translate).parent().not(":first").remove();
	$("#form-add-one-translates-count").text(1);

	resetFeedback(form, ".word-feedback", "Введіть слово!");
	resetFeedback(form, ".translate-feedback", "Введіть переклад!");
	resetFeedback(form, ".unit-feedback", "Виберіть розділ зі списку!");
}
const resetWithConfirm = event => {
	event.preventDefault();
	confirm.customShow({
		title: "Очистка форми",
		body: `Справді очистити форму?`,
		submitButtonText: "Так",
		onSubmitHide: true,
		onSubmit: () => {
			reset(document.querySelector("#form-add-one"));
		}
	})
}