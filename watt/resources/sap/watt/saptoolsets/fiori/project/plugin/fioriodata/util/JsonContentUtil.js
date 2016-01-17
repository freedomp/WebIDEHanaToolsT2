define(function() {

	var startJsonIndex = -1;
	var endJsonIndex = -1;
	var jsContent = "";
// 	var customizingJson = {};

    var getJsonBlock = function(fileContent, blockType) {
		jsContent = fileContent;
		var jsonString = "{}";

		var customizigPattern = "\\s*" + blockType + "\\s*:\\s*{";

		startJsonIndex = getStartJsonIndex(jsContent, customizigPattern);
		if (startJsonIndex == -1) {
			console.log("start index of " + blockType + " json was not found");
			return "{}";
		}

		endJsonIndex = getEndJsonIndex(jsContent, customizigPattern, startJsonIndex);
		if (endJsonIndex == -1) {
			console.log("end index of " + blockType + " json was not found");
			return "{}";
		}

		jsonString = jsContent.substring(startJsonIndex, endJsonIndex);
        return jsonString;            
    };
    
    var getStartEnd = function(){
        return {start : startJsonIndex , end : endJsonIndex};
    };


	// returns json object as string according to the pattern
	var _jsonObjectAsString = function(fileContent, blockType) {
        var jsonString = getJsonBlock(fileContent, blockType);
        
		// remove line comments
		jsonString = _removeLineComments(jsonString);

		jsonString = jsonString.replace(/{\s*}/g, "{}"); // replace any empty json string (like "{     }") to "{}" string
		if (jsonString !== "{}") {

// 			var reg2 = new RegExp(/(,)(\s*[^:]*\s*)(:)/g);
// 			var result = null;
// 			while ((result = reg2.exec(jsonString)) !== null) {
// 				var match3 = result[2];
// 				try{
//                       jsonString = jsonString.replace(new RegExp(match3, "g"), '"' + match3 + '"');
//                 } catch (err) {
//                       //invalid regex. how to handle?
//                 }
// 			}
            // Wrap keys in qoutes (all keys except those which are first in a {} block)
            jsonString = jsonString.replace(/(,)(\s*[^":]*\s*)(:)/g, "$1\"$2\"$3");			

// 			var reg = new RegExp(/({)(\s*[^:]*\s*)(:)/g);
// 			result = null;
// 			while ((result = reg.exec(jsonString)) !== null) {
// 				match3 = result[2];
// 				try{
// 					jsonString = jsonString.replace(new RegExp(match3, "g"), '"' + match3 + '"');
// 				} catch (err) {
// 					//invalid regex. how to handle?
// 				}
// 			}
            // Wrap keys in qoutes (only keys which are first in a {} block)
            jsonString = jsonString.replace(/({)(\s*[^":]*\s*)(:)/g, "$1\"$2\"$3");

			jsonString = jsonString.replace(/"\s*"/g, "\"").replace(/\s*/g, ""); // clear white spaces
			jsonString = jsonString.replace(/:URI\("/g, ":\"").replace(/"\).directory\(\)/g, "\"").replace(/\"{2,}/g, "\"");
	        jsonString = jsonString.replace(/:",/g, ":\"\",");
	        jsonString = jsonString.replace(/:"}/g, ":\"\"}");
		}
		return jsonString;
	};

    // blockType - if given, treate 'fileContent' as JS code from which the block type should
    // be extracted (with _jsonObjectAsString()). If missing, treate 'fileContent' as valid json string,
    // and simply parse it
	var _getJsonObject = function(fileContent, blockType) {
        var customizingJson = {};
        
		var jsonString = fileContent;
		if (blockType) {
		    jsonString = _jsonObjectAsString(fileContent, blockType);
		}
		
		try {
			customizingJson = JSON.parse(jsonString);
		} catch (err) {
			throw new Error("js file is not valid");
		}
		
		return customizingJson;
	};

	// remove line comments
	var _removeLineComments = function(string) {

		var stringWithoutComments = "";

		var lines = string.split("\n");
		for (var i = 0; i < lines.length; i++) {
			var line = lines[i].trim();

			var lineCommentIndex = line.indexOf("//");
			var skipStringIndex = line.indexOf("://");

			if (lineCommentIndex === -1) {
				stringWithoutComments = stringWithoutComments + line;
			} else if (skipStringIndex === -1) {
				stringWithoutComments = stringWithoutComments + line.substring(0, lineCommentIndex);
			} else if (lineCommentIndex !== 0) {
				lineCommentIndex = line.indexOf("//", skipStringIndex + 3);
				if (lineCommentIndex === -1) { // only :// was found, leave the line intact
					stringWithoutComments = stringWithoutComments + line;
				} else { // remove comments after ://
					stringWithoutComments = stringWithoutComments + line.substring(0, lineCommentIndex);
				}
			}
		}

		return stringWithoutComments;
	};
	// finds start json object index in the fileContent, according to the pattern
	var getStartJsonIndex = function(fileContent, pattern) {
		var startPatternIndex = fileContent.search(pattern);
		if (startPatternIndex == -1) {
			return -1;
		}

		startPatternIndex = fileContent.indexOf("\{", startPatternIndex);
		return startPatternIndex;
	};

	// finds start json object index in the fileContent, according to the pattern
	var getEndJsonIndex = function(fileContent, pattern, startJsonIndex) {
		if (startJsonIndex == -1) {
			return -1;
		}

		var curlyBracesPattern = "\{|\}";

		var tempString = fileContent.substr(startJsonIndex, fileContent.length);

		var countLeft = 0;
		var countRight = 0;
		var endJsonIndex = 0;

		do {
			var tempIndex = tempString.search(curlyBracesPattern);
			if (tempIndex === -1) {
				return -1;
			}

			if (tempString[tempIndex] === "{") {
				countLeft++;
			}

			if (tempString[tempIndex] === "}") {
				countRight++;
			}

			endJsonIndex = endJsonIndex + tempIndex + 1;
			tempString = fileContent.substr(endJsonIndex + startJsonIndex, fileContent.length);
		} while (countLeft > countRight);

		return startJsonIndex + endJsonIndex;
	};

	// removes left and right quotes from the reserved words found in keys
	var _convertReservedWords = function(jsonString, reservedWords) {
		for ( var index = 0; index < reservedWords.length; index++) {
			jsonString = jsonString.replace(new RegExp("\"" + reservedWords[index] + "\"", "gm"), reservedWords[index]);
		}

		return jsonString;
	};
	
		// return an updated file content
	var _updateJsonContent = function(jsonString, reservedWords) {
		if (startJsonIndex === -1 || endJsonIndex === -1) {
			return jsContent; // return the same Component.js content if start or end curly brace was not found
		}

		var firstPartString = jsContent.substr(0, startJsonIndex);

		var secondPartString = jsContent.substr(endJsonIndex, jsContent.length);

		jsonString = _convertReservedWords(jsonString, reservedWords);
		var updatedFileContent = firstPartString + jsonString + secondPartString;

		return updatedFileContent;
	};

	return {
		jsonObjectAsString: _jsonObjectAsString,
		getJsonObject: _getJsonObject,
		updateJsonContent : _updateJsonContent,
		removeLineComments : _removeLineComments,
		getStartJsonIndex : getStartJsonIndex,
		getEndJsonIndex : getEndJsonIndex,
		getJsonBlock : getJsonBlock,
		getStartEnd : getStartEnd
	};
});