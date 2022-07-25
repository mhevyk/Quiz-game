function readAsUnit(file, wordSeparator = ">"){
	return new Promise((resolve, reject) => {
		//checking if file format is .txt
		const fileName = file.name;
		const fileFormat = fileName.split(".").pop();
		if(fileFormat !== "txt"){
			reject(`Файл <b>${fileName}</b> має недопустимий формат!`);
			return;
		}
		let reader = new FileReader();
		reader.onload = event => {
			let readingResult = event.target.result;
			//reading lines from text file
			const lines = readingResult.replace(/\r\n/g,'\n').split("\n");
			const nonEmptyLines = lines.filter(item => item.trim());
			//creating pairs of word and translate by spliting it by comma separator and checking for parsing errors
			let pairs = nonEmptyLines.map((line, lineIndex) => {
				if(!line.includes(wordSeparator)){
					reject(`У ${lineIndex+1} рядку немає роздільника "${wordSeparator}"! (Файл <b>${fileName}</b>)`);
				}
				let [word, translateString] = line.split(wordSeparator).map(a => a.trim());

				if(!word){
					reject(`У ${lineIndex+1} рядку відсутнє слово! (Файл <b>${fileName}</b>)`);
				}
				else if(!translateString){
					reject(`У ${lineIndex+1} рядку відсутні переклади! (Файл <b>${fileName}</b>)`);
				}
				else if(word === translateString){
					reject(`Слово і переклад співпадають у рядку ${lineIndex+1}!`);
				}
				else{
					let translates;
					if(translateString.includes(",")){
						translates = translateString.split(",")
							.map(translate => translate.trim())
							.filter(Boolean);
					}
					else{
						translates = [translateString];
					}
					return [word, translates];
				}
			});
			resolve(pairs);
		};
		reader.onerror = reject;
		reader.readAsText(file);
	});
}
$("#form-add-many-file-input").change(event => {
	//clear vocabulary import log
	$("#form-add-many-file-log").children().remove();

	const log = $("#form-add-many-file-log");
	const files = event.target.files;
	const fileButtonCaption = $(event.target).next().find("span");
	const filesCount = files.length;

	if(!filesCount) return "No files!";

	$("#modal-loader").modal("show");

	//styling the caption text depending on loaded files count
	if(filesCount > 1){
		let fileEnding = "";
		const lastDigit = filesCount % 10;
		if(lastDigit === 1 && filesCount !== 11){
			fileEnding = "файл";
		}
		else if((lastDigit === 2 || lastDigit === 3 || lastDigit === 4) && !(10 < filesCount && filesCount < 20)){
			fileEnding = "файли";
		}
		else{
			fileEnding = "файлів";
		}
		fileButtonCaption.text(`Завантажено ${filesCount} ${fileEnding}`);
	}
	else{
		fileButtonCaption.text(`Завантажений ${files[0].name}`);
	}

	//looping through all files and saving all promises in array called fileInProcessList
	let fileInProcessList = [];
	for(let file of files){
		const fileInProcess = readAsUnit(file);
		fileInProcessList.push(fileInProcess);
		//adding parsed words to vocabulary
		const unitName = file.name.split(".")[0];
		fileInProcess.then(data => {
			for(let couple of data){
				voc.add(...couple, unitName, {save: false});
			}
			log.append(`<div class="bg-success-light"><i class="fas fa-file"></i> Файл <b>${file.name}</b> успішно завантажений!</div>`);
			return false;
		})
		.catch(error => {
			log.append(`<div class="bg-danger-light"><i class="fas fa-file"></i> ${error}</div>`);
			return true;
		});
	}
	
	//in order to optimise app, we print vocabulary one time after all promises are settled
	Promise.allSettled(fileInProcessList).then(() => {
		voc.save();
		voc.print();
		//waiting 0.7 seconds to avoid infinite loader
		sleep(500).then(() => {
			$("#modal-loader").modal("hide");
		});
	});
});