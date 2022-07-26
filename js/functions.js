function getCurrentYear(){
	return new Date().getFullYear();
}
const getSelectedOptionValue = select => select.options[select.selectedIndex].value;

function unique(array){//повертає масив без повторюваних елементів
	//if(!Array.isArray(array)) return "Parameter must be an array!";
	return Array.from(new Set(array));
}
const sleep = time => new Promise(resolve => setTimeout(resolve, time));

function debounce(func, time){
	let timeout;
	return function(){
		const partlyCalledFunc = () => func.apply(this, arguments);
		clearTimeout(timeout);
		timeout = setTimeout(partlyCalledFunc, time);
	}
}
function muptipleCharOccurence(string, char){
	return string.split(char).length - 1;
}
function sortASC(array, compareCallback = null){//сортування літер за зростанням
	return array.slice().sort((word1, word2) => compareCallback ? compareCallback(word1, word2) : word1.localeCompare(word2));
}
function shuffle(array){//mix array
	return array.slice().sort(() => 0.5 - Math.random());
};
function getRandomArrayItem(array){
	return array[Math.floor(Math.random() * array.length)];
}
function validateTranslates(translateString){
	const translates = translateString.split(",");
	const trimmedTranslates = translates.map(translate => translate.trim());
	const nonEmptyAndUniqueTranslates = unique(trimmedTranslates.filter(Boolean));
	return nonEmptyAndUniqueTranslates.join(", ");
}
/*props{
	scale: 12,
	rightAnswersCount: 5
	allAnswersCount: 10
}*/
function calculateMarkByScale(rightAnswersCount, allAnswersCount, scale){
	if(rightAnswersCount > allAnswersCount) return "Count of right answers must be always less of equal general answer count!";
	return Math.round((rightAnswersCount * scale) / allAnswersCount);
}
function resetTextInput(input){
	input.val("");
}
function capitaliseFirstLetter(word){
	return word[0].toUpperCase() + word.slice(1);
}
function updateAllSelects(){
	//remove all not basic options
	for(let select of $("select")){
		$(select).find("option[value != '']").remove();
	}
	const editWordSelect = $("#form-edit-manually-word");
	const editWordPlaceholder = `<option selected disabled value="">Виберіть слово</option>`;
	editWordSelect.html(editWordPlaceholder + voc.voc.map(record => `<option value="${record.word}">${record.word}</option>`));

	const unitsWithSort = voc.getUnitsWithSort();

	//fill all selects with units options
	for(let unit of unitsWithSort){
		//checks if option has to be disabled
		const disabled = (voc.select(unit).length <= 1) ? "disabled" : "";
		for(let select of $("select[data-content='unit']")){
			//if dom-item has attr data-condition, it will be disabled if unit contains less or equal 1 word
			$(select).append(`<option value="${unit}">${unit}</option>`);
		}
	}
}
function resetAllForms(){
	for(let form of $(document.forms)){
		$(form).trigger("reset");
	}
}
function makeDisabled(selector){
	$(selector).attr("disabled", true);
}
function makeEnabled(selector){
	$(selector).removeAttr("disabled");
}
function* counter(start){
	let count = start;
	while(1){
		yield ++count;
	}
}
function forbidTypingIncorrectSymbols(event){
	const input = event.target;
	//allowed to type words width spaces only in ukrainian and english
	const valueWithousCommas = input.value.replace(/[>\,]/, "");
	input.value = valueWithousCommas;
}