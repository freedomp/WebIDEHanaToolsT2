define(function() {

	var DiffParser = {

		parse: function(sContent, bIncome) {
		    var sLineDelimiter =  "\n";
			var sNewContent = "";
			var bSkip = false;
			var aLines = sContent.split(sLineDelimiter);
			for (var i = 0; i < aLines.length; i++) {
				if (aLines[i].match("^<<<<<<<")) {
					bSkip = !bIncome;
					continue;
				}
				if (aLines[i] === "=======") {
					bSkip = !!bIncome;
					continue;
				}
				if (aLines[i].match("^>>>>>>>")) {
					bSkip = false;
					continue;
				}
				if (!bSkip) {
					sNewContent = sNewContent ? sNewContent + sLineDelimiter + aLines[i] : aLines[i];
				}
			}
			return sNewContent;
		}

	};

	return DiffParser;
});