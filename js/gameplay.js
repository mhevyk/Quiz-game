function* createQuestionGenerator(questions = []){ //question generator
	if(!questions.length) return "There are no questions to ask!";
	for(let question of questions){
		yield question;
	}
};

const getQuestionText = question => {
	const questionVariants = [
		`Відтворіть слово по таких перекладах: <b>${question.translates.join(", ")}</b>`,
		`Введіть переклад слова <b>${question.word}</b>:`
	];
	//if guessType is translate, we must ask for word, so generates 1 and gets appropriate question
	return questionVariants[Number(question.guessType === "translate")];
};

//"guess-translate" means that we guess translate of the word, "guess-word" - we guess word using its translates
const generateGuessType = () => {
	return (voc.flags._questionReverse) ? getRandomArrayItem(["translate", "word"]) : "translate";
};

const checkIfAnswerIsRight = (question, answer) => {
	switch(question.guessType){
		case "translate": return question.translates.includes(answer);
		case "word": return (answer == question.word);
	}
};

const getRightAnswer = question => {
	return (question.guessType === "translate") ? question.translates.join(", ") : question.word;
};

const submitWithEnterButton = event => {
	//if user presses enter key
	if(event.keyCode === 13){
		$("#modal-confirm-submit").trigger("click");
	}
};

const getNextQuestionData = questionGenerator => {
	let gItem = questionGenerator.next();
	return {...gItem.value, guessType: generateGuessType()};
};

$("#form-game-submit").click(function(){ 
	//gets selected option value, which becomes unit, which will be selected from vocabulary
	const unitFromSelect = $("#form-game-unit").find(":selected").val();

	//value of range, that determines number of questions
	const generalQuestionsCount = parseInt($("#form-game-questions-count-range").val());
	let currentQuestionsCount = 1;

	//shuffled words, that will be included into test
	const questionary = shuffle(voc.select(unitFromSelect));

	//generator, that yields question
	const questionGenerator = createQuestionGenerator(questionary);

	//executed from generator question object with additionary field guessType, which determines if we guess word or translate
	let question = getNextQuestionData(questionGenerator);

	const resultsOfTest = new ResultStorage();

	//create event, that used to go to another question by pressing enter
	$(document).keyup(submitWithEnterButton);

	//is used to avoid generating questions after game finish
	let gameOver = false;

	//when clicking enter we trigger click and then calls confirm`s onSubmit method, so onSubmit calls twice. To avoid this we use skipClick variable
	let skipClick = false;

	/*$("#modal-confirm").find(".modal-body").children().remove();
			$(`<p>${createQuestionText(question)}</p> <input type="text" id="game-answer" placeholder="Переклад..."/>`)
			.appendTo($("#modal-confirm").find(".modal-body")).focus();*/

	confirm.customShow({
		title: `Питання ${currentQuestionsCount}/${generalQuestionsCount}`,
		body: `<p>${getQuestionText(question)}</p> <input type="text" id="game-answer" placeholder="Переклад..."/>`,
		submitButtonText: "Наступне слово",
		onSubmitHide: false,
		//event for clicking on "next question" button
		onSubmit: event => {
			if(gameOver) return "Game over!";

			//true if click was triggered by computer (trigger() method) and false if user clicked on confirm submit button
			const isClickTriggered = (event.originalEvent === undefined);

			//if user clicked the button, the one of next clicks must be skipped
			if(!isClickTriggered){
				skipClick = true;
			}
			//here one of click catches and skips
			if(isClickTriggered && skipClick){
				skipClick = false;
				return "Prevent question skipping!";
			}

			//text, which was typed by user as answer to the question
			const userAnswer = $("#game-answer").val().trim();

			const isAnswerRight = checkIfAnswerIsRight(question, userAnswer);

			//add results of previous question to resultsOfTest storage
			resultsOfTest.add({
				...question,
				answer: isAnswerRight,
				userAnswer
			});

			if(voc.flags._colorHighlight){
				const colorsRGB = {
					green: "0, 128, 0",
					red: "255, 0, 0"
				};
	
				confirm.link.css("background-color", `rgba(${isAnswerRight ? colorsRGB.green : colorsRGB.red}, 0.4)`);
			}

			const goToNextQuestion = () => {
				if(currentQuestionsCount === generalQuestionsCount){
					gameOver = true;
					voc.flags._colorHighlight && confirm.link.css("background-color", "");
					resultsOfTest.summarise();
					$(document).unbind("keyup");
					return "Game over, questions ran out!";
				}
				voc.flags._colorHighlight && confirm.link.css("background-color", "");

				question = getNextQuestionData(questionGenerator);

				++currentQuestionsCount;

				confirm.header(`Питання ${currentQuestionsCount}/${generalQuestionsCount}`);
				confirm.body(`<p>${getQuestionText(question)}</p> <input type="text" id="game-answer" placeholder="Переклад..."/>`);
			}

			const deboundedGoToNextQuestion = debounce(goToNextQuestion, 400);

			voc.flags._colorHighlight ? deboundedGoToNextQuestion() : goToNextQuestion();
		},
		onHide: () => {
			//then we quit confirm, we have to delete keyup event, because other confirms will have wrong keyup
			$(document).unbind("keyup");
		}
	});
});
