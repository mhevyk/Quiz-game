class Settings{
	constructor(selector = "settings-checkbox"){
		this.checkboxes = $(`.${selector}`);
		this.checkboxes.change(event => {
			this.save();
			voc.flags[event.target.id] = event.target.checked;
			voc.print();
			voc.update();
		})
	}
	load(){
		let JSONData = localStorage.getItem("_settingsData");
		if(JSONData){
			const data = JSON.parse(JSONData);
			let exportObj = {};
			for(let key of Object.keys(data)){
				exportObj[key] = data[key];
				$(`#${key}`).attr("checked", data[key]);
			}
			voc.flags = exportObj;
		}
		else{
			//set flags as checkboxes are cheched now
			for(let checkbox of this.checkboxes){
				const flagName = checkbox.id;
				voc.flags[flagName] = checkbox.checked;
			}
		}
		voc.update();
	}
	save(){
		let data = {};
		for(let i = 0; i < this.checkboxes.length; i++){
			let item = this.checkboxes[i];
			data[item.id] = item.checked;
		}
		let JSONData = JSON.stringify(data);
		localStorage.setItem("_settingsData", JSONData);
		return data;
	}
}
