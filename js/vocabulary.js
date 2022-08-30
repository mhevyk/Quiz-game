class Vocabulary{
	constructor(data = [], vocabularyId = "vocabulary-content"){
		this.voc = data;
		this.flags = {
			_unit: false,
			_sort: false,
			_questionReverse: false,
			_colorHighlight: false
		}
		this.vocHTML = $(`#${vocabularyId}`);
		this.units = [];
	}
	findRecordByWord(word){
		return this.voc.find(record => record.word.toLowerCase() === word.toLowerCase());
	}
	getHTML(part){
		switch(part){
			case "records": return this.vocHTML.find(".table-row");
			case "subheaders": return this.vocHTML.find(".table-subheader");
		}
	}
	length(){
		return this.voc.length;
	}
	getUnitsWithSort(){
		return (this.flags._sort) ? sortASC(this.units) : this.units;
	}
	getAllWordsWithSort(){
		return (this.flags._sort) 
			? sortASC(this.voc, (record1, record2) => record1.word.localeCompare(record2.word))
			: this.voc
	}
	select(unit = null){
		if(unit){
			return this.voc.filter(record => record.unit === unit) || this.voc;
		}
		return this.voc;
	}
	update(){
		//delete placeholder if vocabalary is not empty
		if(this.length()){
			let gamePlaceholder = $("#form-game").parent().children(`.empty-vocabulary-placeholder`);
			gamePlaceholder.remove();
			
			$("#form-game").show();
		}

		//update units by selecting unique names from unit names
		this.units = unique(this.voc.map(record => record.unit));

		//updating first mode max value
		updateRangeForQuestionsCountInGame();
		updateAllSelects();

		if(!this.units.length){
			makeDisabled("#search > input");
			makeDisabled("#form-game-submit");
			resetAllForms();
		}
		else{
			makeEnabled("#search > input");
			makeEnabled("#form-game-submit");
		}
	}
	//props.save is used for optimisation, because if for example we load 100 files, voc.saves 100 times, but we can save at the end of loading
	add(word, translates, unit, props = {save: true}){
		const repeatOfWord = this.voc.find(record => record.word === word);

		//fill in array if it is not array, because spread operator (...) wil make from word "cat" translates "c", "a", "t"
		const translatesInArray = (Array.isArray(translates)) ? translates : [translates];

		//if word is new in vocabulary, pushing it in the voc
		if(!repeatOfWord){
			this.voc.push({
				word,
				//if the word had many translates when adding (and is array type), we leave it as it is, otherwise we put single translate in array
				translates: unique(translatesInArray),
				unit
			});
		}
		else{
			//if word is not new, but there are new translates, unique elements are selected and are set to repeatOfWord.translates
			const newTranslatesOfWord = unique([...repeatOfWord.translates, ...translatesInArray]);
			repeatOfWord.translates = newTranslatesOfWord;
		}
		this.update();
		if(props.save){
			this.save();
		}
	}
	updateRecord(oldValue, newValue, indexInVocabulary){
		const selectType = record => {
			return (indexInVocabulary) ? (record.translates.join(", ") === oldValue) : (record.word === oldValue);
		};
		let found = this.voc.find(record => selectType(record));

		if(indexInVocabulary){
			//extract only valid words, using filter(Boolean)
			const newTranslates = newValue.split(", ");
			found.translates = newTranslates;
		}
		else{
			found.word = newValue;
		}
		this.save();
	}
	remove(word){
		let removedWordIndex = this.voc.findIndex(record => record.word === word);
		this.voc.splice(removedWordIndex, 1);
		this.update();
		this.save();
		return "Word was successfully removed!";
	}
	//this function was created to both be used to removeRange and to generate remove range in confirm
	getRemoveRangeData(word1, word2){
		let onlyWords = this.voc.map(record => record.word);
		
		let indexOfWord1 = onlyWords.indexOf(word1);
		let indexOfWord2 = onlyWords.indexOf(word2);

		let startIndex = Math.min(indexOfWord1, indexOfWord2);
		let wordsToDeleteCount = Math.abs(indexOfWord1 - indexOfWord2) + 1;

		return {
			firstWord: startIndex,
			length: wordsToDeleteCount, 
			wordsToDelete: onlyWords.slice(startIndex, startIndex + wordsToDeleteCount)
		};
	}
	removeRange(word1, word2){
		let range = this.getRemoveRangeData(word1, word2);
		this.voc.splice(range.firstWord, range.length);
		this.update();
		this.save();
		return "Range was removed successfully!";
	}
	removeUnit(unit){
		this.voc = this.voc.filter(record => record.unit !== unit);
		this.update();
		this.save();
		return "Unit was removed successfully!";
	}
	print(){
		if(this.length() <= 0){
			this.clear();
			return "Vocabulary is empty!";
		}
		else{
			//make enabled all headers of accordion
			accordionVocabularyActions.editAllHeadersExcept([], makeEnabled);
		}

		//clear all rows in vocabulary
		this.vocHTML.find(".row").remove();

		let out = "";

		if(this.flags._unit){
			//sort units, depending on "_sort" flag
			const unitsWithSort = this.getUnitsWithSort();

			unitsWithSort.forEach((unit, unitCounter) => {
				//print unit name
				out += `<div class="row table-subheader">
							<div class="table-counter"></div>
							<div class="col bg-dimgray">${capitaliseFirstLetter(unit)}</div>
						</div>
				`;

				const recordsFromUnit = this.select(unit);

				//print records from unit
				recordsFromUnit.forEach((record, recordCounter) => {
					out += `<div class="row table-row">
						<div class="table-counter text-center">${unitCounter + 1}.${recordCounter + 1}</div>
						<div class="col text-truncate">${record.word}</div>
						<div class="col text-truncate">${record.translates.join(", ")}</div>
					</div>`;
				});
			});
		}
		else{
			//sort all words, depending on "_sort" flag
			//sortASC allows to pass a callback, which compares two objects
			const recordsWithSort = this.getAllWordsWithSort();

			recordsWithSort.forEach((record, recordCounter) => {
				out += `<div class="row table-row">
					<div class="table-counter text-center">${recordCounter + 1}</div>
					<div class="col text-truncate">${record.word}</div>
					<div class="col text-truncate">${record.translates.join(", ")}</div>
				</div>`;
			});
		}
		
		this.vocHTML.append(out);
	}
	save(){
		const data = {
			voc: this.voc,
			flags: this.flags
		};
		const JSONData = JSON.stringify(data);
		localStorage.setItem("_vocabularyData", JSONData);
	}
	load(){
		const JSONData = localStorage.getItem("_vocabularyData");
		if(JSONData){
			const data = JSON.parse(JSONData);
			for(let key of Object.keys(data)){
				this[key] = data[key];
			}
		}
	}
	clear(){
		//reset text on unit import (input type=file)
		$("#form-add-many-file-input").next().find("span").text("Імпортувати");

		accordionVocabularyActions.setActive(0);

		//make disabled all headers of accordion except 0-position (first)
		accordionVocabularyActions.editAllHeadersExcept([0], makeDisabled);

		this.voc = [];

		//remove all records in dom vocabulary
		this.vocHTML.find(".row").remove();

		$(document).ready(() => {
			const gameForm = $("#form-game");
			if(!$("#_game .empty-vocabulary-placeholder").length){
				gameForm.before(`
					<div class="empty-vocabulary-placeholder">
						<div class="col">Додайте слова у <span class="link fw-bold" onclick="linkToPage('_vocabulary')">словник</span>, щоб почати тестування!</div>
					</div>
				`);
				gameForm.hide();
			}
		})

		//add div with text, that informs about empty vocabulary
		this.vocHTML.append(`
			<div class="row empty-vocabulary-placeholder border-0">
				<div class="col">Словник порожній! Додайте слова вручну або з текстового файлу!</div>
			</div>
		`);

		localStorage.removeItem("_vocabularyData");
		this.update();
	}
}