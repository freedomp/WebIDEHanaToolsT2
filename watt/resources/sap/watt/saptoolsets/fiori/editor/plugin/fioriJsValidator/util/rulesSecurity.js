define([], {

	scan: function(sRulesString) {
		var index;
		var forbid = '';
		var stopList = [
						"eval",
						"ajax",
						"ActiveXObject",
						"XMLHttpRequest",
						"XHR",
						"require",
						"src",
						"alert\\.",
						"alert\\("
					];
		for (index = 0; index < stopList.length; index++) {
			forbid +=
				"\\b" +
				stopList[index] +
				"\\b";
			if(index !== stopList.length -1){
				forbid += "|";
			}
		}
		forbid += '';
		var re = new RegExp(forbid, "i"); // i =case insensetive, g - allows interactive searches, returns the index of the last mathc
		var match = re.test(sRulesString); //The constructor function is used because it provides runtime compilation of the
// regular expression. It is used when a user inputs smth.


		return !match;

//		if (forbid !== (-1)) {
//// -1 means there no mathces 0 and more - mathches found
//			return false;
//		}
//		else {
//		    return true;
//		}
//	}
	}
});