class Tabs{
	constructor(id){
		this.link = $(`#${id}`);
		this.link.addClass("tabs");
	}
	init(){
		//create tab-index attribute
		for(let index = 0; index < this.headers.length; index++){
			this.headers.eq(index).attr("tab-index", index);
		}
		this.setActive(0);//sets first tab active
		this.headers.click(event => {
			let clickedBlock = $(event.target);
			if(!clickedBlock.hasClass("tab-header")){
				clickedBlock = clickedBlock.parent();
			}
			let tab = parseInt(clickedBlock.attr("tab-index"));
			if(!this.isActive(tab)){
				this.setActive(tab);
			}
		});
	}
}
class Accordion extends Tabs{
	constructor(id){
		super(id);
		this.headers = this.link.children(".tab-header");
		this.contents = this.link.children(".tab-content");

		this.link.addClass("tabs-accordion");
		this.headers.append(`<i class="fa fa-caret-down" aria-hidden="true"></i>`);

		super.init();
	}
	setActive(index){
		this.headers.removeClass("active");
		this.headers.eq(index).addClass("active");

		this.contents.slideUp(0);//instantly slideUp all headers
		this.contents.eq(index).slideDown();
	}
	isActive(index){
		return this.headers.eq(index).hasClass("active");
	}
	editAllHeadersExcept(indexes, headerChangeFunction){
		for(let header of this.headers){
			const tabIndex = parseInt($(header).attr("tab-index"));
			if(!indexes.includes(tabIndex)){
				headerChangeFunction(header);
			}
		}
	}
}
class NavigationTabs extends Tabs{
	constructor(id){
		super(id);
		this.headers = this.link.children(".tab-headers").children(`.tab-header`);
		this.contents = this.link.children(".tab-contents").children(`.tab-content`);

		this.link.addClass("tabs-navigation");

		super.init();
	}
	setActive(index){
		this.headers.removeClass("active");
		this.headers.eq(index).addClass("active");

		this.contents.hide();
		this.contents.eq(index).show();
	}
	isActive(index){
		return this.headers.eq(index).hasClass("active");
	}
}
class ToggleTabs extends Tabs{
	constructor(id){
		super(id);
		this.headers = this.link.children(".tab-header");
		this.contents = this.link.children(".tab-content");

		this.link.addClass("tabs-toggle");
		this.headers.append(`<i class="fa fa-caret-down" aria-hidden="true"></i>`);

		super.init();
	}
	setActive(index){
		this.headers.toggleClass("active");
		this.contents.slideToggle();

		this.contents.hide();
		this.contents.eq(index).show();
	}
	isActive(index){
		return false;
	}
}