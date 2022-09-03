const voc = new Vocabulary();
const opts = new Settings();

const accordionVocabularyActions = new Accordion("vocabulary-actions");
const tabsAdd = new NavigationTabs("tabs-action-add");
const tabsEdit = new NavigationTabs("tabs-action-edit");
const tabsRemove = new NavigationTabs("tabs-action-remove");

const confirm = new Modal("modal-confirm");

//variable to count game count
let gameCounter = counter(0);

const gameTogglers = [];

$(document).ready(() => {
	//hide all pages and navigation arrows
	$("#arrow-top, #arrow-extra-back, #arrow-back, .main-menu-content").hide();

	$(`[data-bs-toggle="tooltip"]`).tooltip();
	$(".current-year").text(getCurrentYear());

	voc.load();
	opts.load();

	updateRangeForQuestionsCountInGame();
	
	voc.print();

});

//hide and show navigation arrows while scrolling
$(window).scroll(function(){
	const currentScroll = $(this).scrollTop();
	if(currentScroll > 180){
		$("#arrow-top, #arrow-extra-back").fadeIn();
	}
	else{
		$("#arrow-top, #arrow-extra-back").fadeOut();
	}
});

//scroll to top
$("#arrow-top").click(event => {
	window.scrollTo({top: 0, behavior: "smooth"});
});

//switch pages
function linkToPage(event){
	//closing main page
	$("header, #main-menu").hide();
	$(".main-menu-content").hide();

	//opening page by link
	$("#arrow-back").show();
	//if event.target do not exists, it means that in is not any event and now event is string link name passed to function
	let newPageLink = event.target ? $(event.target).data("link") : event;
	$(`#${newPageLink}`).show();
}

$(".main-menu-link").click(linkToPage);

$("#arrow-back, #arrow-extra-back").click(event => {
	//hiding current page
	$("#arrow-back, .main-menu-content").hide();

	//opening main menu
	$("header, #main-menu").show();
});

$("#_quit").click(function(event){
	confirm.customShow({
		title: "Вихід з програми",
		body: `Справді вийти з програми?`,
		submitButtonText: "Вийти",
		onSubmitHide: false,
		onSubmit: () => {
			window.open(location, '_self').close();
		}
	});
});
