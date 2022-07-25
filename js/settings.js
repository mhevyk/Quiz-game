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
			//fill vocabulary flags object with stored data in browser, and setting inputs checked attr
			const data = JSON.parse(JSONData);
			const exportObj = {};
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
		const data = {};
		//convert inputs "checked" to object with structure: [id] : [itemById.checked]
		for(let checkbox of this.checkboxes){
			data[checkbox.id] = checkbox.checked;
		}
		const JSONData = JSON.stringify(data);
		localStorage.setItem("_settingsData", JSONData);
		return data;
	}
}
