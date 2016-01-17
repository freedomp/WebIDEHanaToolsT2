define(["sap/watt/lib/isJsonValid/isMyJsonValid"], function (validator) {

	var DATA_BRACKET_PREFIX = "data[";
	var DATA_BRACKET_SUFFIX = "]";
	var DATA_DOT_PREFIX = "data.";

	return {

		_getSrcText: function (sField) {
			var sCopy = sField;
			var nIndexOfData = sField.indexOf(DATA_DOT_PREFIX);
			if (nIndexOfData === 0) {
				sCopy = sCopy.substr(DATA_DOT_PREFIX.length);
			} else {
				var nIndexOfDataBracketBegin = sCopy.indexOf(DATA_BRACKET_PREFIX);
				var nIndexOfDataBracketEnd = sCopy.indexOf(DATA_BRACKET_SUFFIX);
				if (nIndexOfDataBracketBegin === 0 && nIndexOfDataBracketEnd !== -1) {
					sCopy = sCopy.substr(DATA_BRACKET_PREFIX.length);
					nIndexOfDataBracketEnd = nIndexOfDataBracketEnd - DATA_BRACKET_PREFIX.length;
					sCopy = sCopy.substr(0, nIndexOfDataBracketEnd) + sCopy.substr(nIndexOfDataBracketEnd + DATA_BRACKET_SUFFIX.length);
				}
			}
			var srcText = {
				"fullPath": sCopy,
				"lastField": this._getSourceForInlineLinting(sCopy)
			};
			return srcText;
		},


		_isUnnecessaryMessage: function (sMessage) {
			return sMessage === "no (or more than one) schemas match";
		},

		_convertPath: function (oJsonWithLocations, fullPath, srcText) {
			while (!oJsonWithLocations[fullPath] && fullPath !== "") {
				var iIndexOfDot = fullPath.lastIndexOf(".");
				var iIndexOfCloseLabel = fullPath.lastIndexOf("]");
				if (iIndexOfCloseLabel > iIndexOfDot) {
					var iIndexOfOpenLabel = fullPath.lastIndexOf("[");
					fullPath = fullPath.substring(0, iIndexOfOpenLabel - 1);
				} else {
					fullPath = fullPath.substring(0, iIndexOfDot);
				}
			}
			if (srcText.fullPath !== fullPath) {
				srcText.fullPath = fullPath;
				srcText.lastField = this._getSourceForInlineLinting(fullPath);
			}
			return srcText;
		},
		_convert: function (aIssues, oJsonWithLocations, sOriginalFileFullPath) {
			var line, column, source;
			var oResult = {
				"root": {},
				"issues": []
			};
			for (var ii = 0; ii < aIssues.length; ii++) {
				var oIssue = aIssues[ii];
				//filter out messages from open source that are not helpful
				var srcText = this._getSrcText(oIssue.field);
				if (!this._isUnnecessaryMessage(oIssue.message, srcText)) {
					var message = srcText.fullPath + "- " + oIssue.message;
					var category = "Schema Error";
					var fullPath = srcText.fullPath;
					srcText = this._convertPath(oJsonWithLocations, fullPath, srcText);
					if (oJsonWithLocations[srcText.fullPath]) {
						line = oJsonWithLocations[srcText.fullPath].line;
						source = this._getSourceForInlineLinting(srcText.lastField);
						column = this._getColumnForIssue(source, oJsonWithLocations[srcText.fullPath]);
						if(column === undefined ){
							column=0;
						}
					} else {
						line = 1;
						column = 0;
					}
					oResult.issues.push({
						category: category,
						checker: "",
						helpUrl: "",
						line: line,
						column: column,
						message: message,
						path: sOriginalFileFullPath,
						severity: "error",
						source: source,
						ruleId: ""
					});
				}
			}
			return oResult;
		},

		_getColumnForIssue: function (sourceForIssue, oLocationInJson) {
			if (sourceForIssue.indexOf("\"") === -1) {
				return oLocationInJson.column;
			} else {
				return oLocationInJson.column - 1;
			}
		},

		_getSourceForInlineLinting: function (srcText) {
			var start, tmpsrcText = srcText;
			if (_.endsWith(srcText, "\"")) {
				//The schema error is on a field in the form of "x.y" 
				tmpsrcText = _.trimRight(tmpsrcText, "\"");
				start = tmpsrcText.lastIndexOf("\"");
				return srcText.substring(start);
			} else {
				start = srcText.lastIndexOf(".");
				if (start !== -1) {
					//The schema error is on the last object field (a.b.c)
					return srcText.substring(start + 1);
				} else {
					//The schema error doesn't have any quates or dots - single field.
					return srcText;
				}
			}
		},

		_validateJsonWithSchema: function (oJson, oSchemByVersion) {
			var validate = validator(oSchemByVersion, {
				greedy: true,
				verbose: true
			});
			validate(oJson);
			return validate;
		},


		getIssues: function (oJson, oServiceResult, oJsonWithLocations, sFullPath) {
			var that = this;
			// need to dynamicly get the exact version, because user can change the version declared any time
			return oServiceResult.getSchema(oJson).then(function (oSchemByVersion) {
				var validate = that._validateJsonWithSchema(oJson, oSchemByVersion);
				return that._convert(validate.errors || [], oJsonWithLocations, sFullPath);
			});
		}
	};
});
