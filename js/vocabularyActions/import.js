let isZipCurrentFileFormat = false;

const hideLoader = () => {
	//waiting 0.5 seconds to avoid infinite loader
	sleep(500).then(() => {
		$("#modal-loader").modal("hide");
	});
}
const onAllSettled = () => {
	voc.save();
	voc.print();
	hideLoader();
}
const getFileFormat = file => file.split(".").pop();
const removeAbsolutePath = rawFileName => rawFileName.split("/").at(-1);

const readTextFileData = file => {
	return new Promise((resolve, reject) => {
		let reader = new FileReader();
		reader.onload = event => {
			resolve(event.target.result);
		}
		reader.onerror = reject;
		reader.readAsText(file);
	});
}
const parseAsTxt = (file, fileDataPromise, props = {}) => {
	return new Promise((resolve, reject) => {
		const fileName = removeAbsolutePath(file.name);
		if(getFileFormat(fileName) !== "txt"){
			reject(`Файл <b>${fileName}</b> має недопустимий формат!`);
		}

		const wordSeparator = props.wordSeparator || ">";

		//reading lines from text file
		fileDataPromise.then(fileData => {
			const lines = fileData.replace(/\r\n/g,'\n').split("\n");
			const nonEmptyLines = lines.filter(item => item.trim());
			//creating pairs of word and translate by spliting it by comma separator and checking for parsing errors
			let pairs = nonEmptyLines.map((line, lineIndex) => {
				if(!line.includes(wordSeparator)){
					reject(`У ${lineIndex+1} рядку немає роздільника "${wordSeparator}"! (Файл <b>${fileName}</b>)`);
				}
				else if(muptipleCharOccurence(line, wordSeparator) > 1){
					reject(`У ${lineIndex+1} рядку присутній більше як 1 роздільник! (Файл <b>${fileName}</b>)`);
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
						if(!translates.length){
							reject(`У ${lineIndex+1} рядку відсутні переклади! (Файл <b>${fileName}</b>)`);
						}
					}
					else{
						translates = [translateString];
					}
					return [word, translates];
				}
			});
			resolve({result: pairs, file: file, ...props});
		});
	});
}
const readAsZip = zipFile => {
	return new Promise((resolve, reject) => {
		let zipHandler = new JSZip();
		zipHandler.loadAsync(zipFile).then(zip => {
			const files = zip.files;
			try{
				const filePromises = [];
				for(const fileName in files){
					const file = files[fileName];
					const parsedTxt = parseAsTxt(file, file.async('string'), {
						archiveName: removeAbsolutePath(zipFile.name),
						wordSeparator: ">"
					});
					filePromises.push(parsedTxt);
				}
				resolve(filePromises);
			}
			catch(error){
				reject(error);
			}
		});
	});
}
const readAsUnit = file => {
	const fileName = removeAbsolutePath(file.name);
	const fileFormat = fileName.split(".").pop();

	switch(fileFormat){
		case "txt":
			isZipCurrentFileFormat = false;
			const fileTextContentLoad = readTextFileData(file);
			return parseAsTxt(file, fileTextContentLoad);
		case "zip":
			isZipCurrentFileFormat = true;
			return readAsZip(file);
		default:
			return new Promise((_, reject) => reject(`Файл <b>${fileName}</b> має недопустимий формат!`));
	}
}
const convertToUnit = filePromise => {
	const log = $("#form-add-many-file-log");
	
	filePromise.then(resultInfo => {
		//if resultInfo don`t have file property, it means, that it is array of promises.
		//we have to call this function recursively to handle each file in zip
		if(!resultInfo.file){
			for(let filePromise of resultInfo){
				convertToUnit(filePromise);
			}
			//allSettle function only for handling .rar files
			Promise.allSettled(resultInfo).then(onAllSettled);
		}
		else{
			const {result, file, archiveName = ""} = resultInfo;

			const fileName = removeAbsolutePath(file.name);

			const unitName = fileName.split(".")[0];

			if(unitName.replace(/[^іІїЇєЄґҐа-яА-Я\w ]/g, "").trim() === ""){
				throw `Некоректне ім'я файлу у архіві <b>${archiveName}</b>! (Файл <b>${fileName}</b>). Завантажуйте лише архіви, які були експортовані з цієї програми, щоб уникнути помилок!`;
			}

			for(let couple of result){
				voc.add(...couple, unitName, {save: false});
			}
			log.append(`<div class="bg-success-light"><i class="fas fa-file"></i> Файл <b>${fileName}</b> успішно завантажений!</div>`);
		}
	})
	.catch(error => {
		log.append(`<div class="bg-danger-light"><i class="fas fa-file"></i> ${error}</div>`);
		hideLoader();
	});
}
const importFromTxtAndZip = event => {
	//clear vocabulary import log
	$("#form-add-many-file-log").children().remove();

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
	for(const file of files){
		const fileInProcess = readAsUnit(file);
		fileInProcessList.push(fileInProcess);
		//adding parsed words to vocabulary
		convertToUnit(fileInProcess);
	}
	//in order to optimise app, we print vocabulary one time after all promises are settled
	if(!isZipCurrentFileFormat){
		Promise.allSettled(fileInProcessList).then(onAllSettled);
	}
}