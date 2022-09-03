const exportToTxt = () => {
	confirm.customShow({
		title: "Експорт словника",
		body: "Справді завантажити архів зі всіма розділами словника?",
		submitButtonText: "Так",
		onSubmitHide: true,
		onSubmit: () => {
			let zip = new JSZip();
			const wordAndTranslatesSeparator = ">";

			for(let unit of voc.units){
				let recordsByUnit = voc.select(unit);
				let fileText = "";
				for(let record of recordsByUnit){
					//using \r\n because fileReader functions parse lines of txt file by this separator
					fileText += `${record.word} ${wordAndTranslatesSeparator} ${record.translates.join(", ")}\r\n`;
				}
				zip.file(`${unit}.txt`, fileText);
			}
			zip.generateAsync({type: "blob"}).then(function(content){
			    saveAs(content, "vocabulary.zip");
			});
		}
	});
}