function moveRangeLabel(){
	const percentPad = Number((this.value - this.min) * 100 / (this.max - this.min));
	const pixelPad = 10 - (percentPad * 0.2);
	const rangeCaption = $(this).prev();
	rangeCaption.find("span").text(this.value);
	if(this.min >= this.max){
		rangeCaption.css("left", `10px`);
		return;
	}
	rangeCaption.css("left", `calc(${percentPad}% + (${pixelPad}px))`);
};

function updateRangeForQuestionsCountInGame(props = {}){
	const range = document.querySelector("#form-game-questions-count-range");

	range.min = 1;
	//max has to be number and be bigger than min
	const max = props.max || voc.length();
	range.max = max;

	//value has to be number and between min and max, if it is not true, average value is setting
	const value = props.value || Math.floor(+range.max / 2);
	range.value = value;

	moveRangeLabel.call(range);
}

$("#form-game-questions-count-range").on("input", function(event){
	moveRangeLabel.call(event.target);
});

$("#form-game-unit").on("change", function(){
	const unitFromSelect = $(this).find(":selected").val();
	updateRangeForQuestionsCountInGame({max: voc.select(unitFromSelect).length});
});