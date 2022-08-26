class Modal{
	constructor(id){
		this.link = $(`#${id}`);
		this.modalParts = {
			header: this.link.find(".modal-title"),
			body: this.link.find(".modal-body"),
			submitBtn: this.link.find(".modal-submit"),
			cancelBtn: this.link.find(".modal-cancel"),
			closeBtn: this.link.find("[aria-label='Close']")
		};
	}
	/* all possible props
		props = {
			title: "Заголовок модального вікна",
			body: "Наповнення модального вікна",
			submitButtonText: "Кпопка для підтвердження форми",
			onSubmitHide: true,
			onSubmit: () => {},
			onHide: () => {},
			onShow: () => {}
		}
	*/
	customShow(props = {
			title: "Повідомлення з цієї сторінки",
			body: "",
			submitButtonText: "Так",
			onSubmitHide: true,
		}){

		this.show();
		this.header(props.title);
		if(props.body){
			this.body(props.body);
		}
		this.submitBtn(props.submitButtonText);

		this.modalParts.submitBtn.click(event => {
			if(props.onSubmit && typeof props.onSubmit === "function"){
				props.onSubmit(event);
			}
			if(props.onSubmitHide){
				this.hide();
			}
		});
		this.link.on("shown.bs.modal", () => {
			console.log("ON SHOW")
			if(props.onShow && typeof props.onShow === "function"){
				props.onShow();
			}
		});
		this.link.on("hide.bs.modal", () => {
			this.modalParts.submitBtn.unbind();
			if(props.onHide && typeof props.onHide === "function"){
				props.onHide();
			}
			//removing content of modal
			this.modalParts.body.html("");
		});
	}
	show(part){
		if(part in this.modalParts){
			this.modalParts[part].show();
			return `Part ${part} was shown!`;
		}
		this.link.modal("show");
	}
	hide(part, delayTime = 0){
		if(part in this.modalParts){
			this.modalParts[part].hide();
			return `Part ${part} was hidden!`;
		}
		this.link.modal("hide");
	}
	header(text){
		this.modalParts.header.html(text);
	}
	body(text){
		this.modalParts.body.html(text);
	}
	submitBtn(text){
		this.modalParts.submitBtn.text(text);
	}
	cancelBtn(text){
		this.modalParts.calcelBtn.text(text);
	}
	disable(part, delayTime = 0){
		if(part in this.modalParts && part.includes("Btn")){
			sleep(delayTime).then(() => {
				makeDisabled(this.modalParts[part]);
			});
		}
		return this;
	}
	enable(part, delayTime = 0){
		if(part in this.modalParts && part.includes("Btn")){
			sleep(delayTime).then(() => {
				makeEnabled(this.modalParts[part]);
			});
		}
		return this;
	}
}