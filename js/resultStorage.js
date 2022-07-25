let gameCounter = counter(0);

class ResultStorage{
	constructor(){
		this.questions = [];
	}
	add(word){
		this.questions.push(word);
	}
	getByAnswer(rightFlag){
		return this.questions.filter(word => word.answer === rightFlag);
	}
	printHTML(gameCounter, listWithResults){
		let result = "";
		this.questions.forEach((question, index) => {
			let colorPart = (question.answer) ? "success" : "danger";
			result += `
				<div id="game${gameCounter}-question-${index + 1}" class="question">
					<div class="tab-header bg-${colorPart}-light text-dark active">
						<i class="fa fa-${question.answer ? "check" : "close"} text-${colorPart} pe-2" aria-hidden="true"></i> Питання ${index + 1}
					</div>
					<div class="tab-content p-0">
						<div class="row border-bottom">
							<div class="col-3 border-end bg-lightgrey py-1">Питання</div>
							<div class="col text-start py-1">${getQuestionText(question)}</div>
						</div>
						<div class="row border-bottom">
							<div class="col-3 border-end bg-lightgrey py-1">Ваш ввід</div>
							<div class="col fw-bold text-start py-1">${question.userAnswer.trim() || "(немає)"}</div>
						</div>
						<div class="row border-bottom">
							<div class="col-3 border-end bg-lightgrey py-1">Правильно</div>
							<div class="col fw-bold text-start py-1">${getRightAnswer(question)}</div>
						</div>
					</div>
				</div>
			`;
		});
		result += `
			<div id="game${gameCounter}-info" class="game-info border-0">
				<button class="container-fluid tab-header active bg-dimgray text-white">Загальна інформація</button>
				<div class="tab-content text-start">
				<ul class="mb-0">
					<li>Кількість питань: <b>${listWithResults.gqc}</b></li>
					${listWithResults.mr}
				</ul>
				</div>
			</div>
		`;
		return result;
	}
	summarise(){
		let rightAnswersCount = this.getByAnswer(true).length;

		//input for result in percent form or in 12-point form
		let resultFormat = $('input[name=game-result-format]:checked', '#form-game').val();

		//text for game confirm result
		let resultText = `<p class="fw-bold">Результат:</p>`;

		//<li> tags for statistic
		let listWithResults;

		//binding first two parameters with null context of function calculateMarkByScale, so getMarkWithScale functions will depend only from scale (max mark)
		let getMarkWithScale = calculateMarkByScale.bind(null, rightAnswersCount, this.questions.length);

		switch(resultFormat){
			case "percent":
				let percentOfRightAnswers = getMarkWithScale(100);
				listWithResults = `
					<li>Відсоток правильних відповідей: <b class="text-success">${percentOfRightAnswers}%</b></li>
					<li>Відсоток неправильних відповідей: <b class="text-danger">${100 - percentOfRightAnswers}%</b></li>`;
				break;
			case "twelve":
				let mark12 = getMarkWithScale(12);
				listWithResults = `<li>Отриманий бал: <b>${mark12}</b></li>`;
				break;
		}

		//list of results in selected format
		resultText += `<ul>${listWithResults}</ul>`;

		//additionary text, that reminds to watch statistic page to check answers and results
		resultText += `
				<div class="text-center pt-2 text-muted">
					<small>Детальну інформацію можна переглянути у розділі <b>"Статистика"</b></small>
				</div>`;

		let statisticTable = $("#statistic-table");

		//remove placeholder "there is no games played"
		if(!gameCounter.value){
			statisticTable.find(".empty-vocabulary-placeholder").remove();
		}

		const gameNumber = gameCounter.next().value;

		//append game wrapper
		statisticTable.append(`
			<div id="game${gameNumber}" class="game">
				<button class="container-fluid tab-header active">Тестування №${gameNumber}</button>
				<div class="tab-content p-0">${this.printHTML(gameNumber, {mr: listWithResults, gqc: this.questions.length})}</div>
			</div>
		`);
		//init game wrapper as toggleTabs
		let gameToggleTabs = new ToggleTabs(`game${gameNumber}`);

		//making toggle tabs of blocks
		let questionToggleTabs;
		for(let i = 0; i < this.questions.length; i++){
			questionToggleTabs = new ToggleTabs(`game${gameNumber}-question-${i + 1}`);
		}

		//init gameInfo as ToggleTabs
		let infoToggleTabs = new ToggleTabs(`game${gameNumber}-info`);

		confirm.hide("cancelBtn");
		confirm.disable("submitBtn").enable("submitBtn", 1000);

		confirm.customShow({
			title: "Тестування закінчено!",
			body: `${resultText}`,
			submitButtonText: "Добре",
			onSubmitHide: true,
			onHide: () => {
				confirm.show("cancelBtn");
			}
		});
	}
}