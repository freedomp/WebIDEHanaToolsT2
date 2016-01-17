define({
	// Added as constants for the search service
	_iStartCriteria: 0,
	_iRowsCriteria: 100,

	//checks if 2Q is enabled in project settings - project.json file 
	is2QEnabled: function(oDocument) {
		if (!oDocument || !oDocument.getEntity || oDocument.getEntity().isRoot()) {
			return false;
		}

		var that = this;
		var oProjectSetting = this.context.service.setting.project;
		return oProjectSetting.get(that.context.service.translation, oDocument).then(function(mSettings) {
			if (!mSettings || !mSettings.supportedLanguages) {
				return false;
			}
			//2Q = en-US-sappsd, 1Q = en-US-saptrc (not yet supported by SAPUI5)
			return (mSettings.supportedLanguages.toLowerCase().indexOf("sappsd") !== -1);

		}).fail(function(oError) {
			if (oError && oError.message) {
				that.context.service.usernotification.alert(oError.message).done();
			}
		});
	},

	onSave: function(oEvent) {
		if (oEvent && oEvent.params && oEvent.params.document) {
			var oDocument = oEvent.params.document;
			if (!oDocument.getEntity) {
				return;
			}
			if (this._isDeveloperProperties(oDocument)) {
				var that = this;
				//Checks if 2Q is enabled in project settings
				this.is2QEnabled(oDocument).then(function(b2QEnabled) {
					if (!b2QEnabled) {
						return;
					}
					that.generatePseudoProperties(oDocument).then(function() {
						that.context.service.log.info("pseudo-translation", "Translation test file has been generated successfully.", ["system"]).then(
							function() {
								that.context.service.usernotification.liteInfo(that.context.i18n.getText("i18n", "pseudo_files_generated_msg"));
							});
					});
				}).done();
			}
		}
	},

	generatePseudoProperties: function(oDocument) {
		if (!oDocument || !(oDocument.getContent)) {
			return false;
		}
		var that = this;
		return oDocument.getContent().then(function(sContent) {
			// Get the pseudo content to be saved in the pseudo translation file
			var sPseudoContent = that._getPseudoContent(sContent);
			// Create the new pseudo translation file
			var sFileName = oDocument.getTitle().replace(".properties", "_en_US_sappsd.properties");
			return oDocument.getParent().then(function(oParent) {
				return oParent.touch(sFileName).then(function(oFile) {
					return oFile.setContent(sPseudoContent).then(function() {
						return oFile.save();
					});
				});
			});
		}).fail(function(oError) {
			if (oError && oError.message) {
				that.context.service.usernotification.alert(oError.message).done();
				that.context.service.log.error("pseudo-translation", oError.message, ["system", "user"]).done();
			} else {
				that.context.service.log.error("pseudo-translation", "Some error occured while generating translation test file.", ["system", "user"])
					.done();
			}
		});
	},

	//Generate pseudo properties for each found developer properties file
	generatePseudoPropertiesProject: function(oFolder) {
	    var that = this;
		that.context.service.log.info("pseudo-translation", "Starting generate translation test files...", ["system"]).done();
		if (!oFolder || !(oFolder.getEntity)) {
			return;
		}

		if (oFolder.getEntity().getType() !== "folder") {
			return;
		}
		var oFileSystem = that.context.service.filesystem.documentProvider;
		var oCriteria = {
			"bContentSearch": false,
			"nStart": that._iStartCriteria,
			"nRows": that._iRowsCriteria,
			"sFolderName": oFolder.getEntity().getFullPath() + "/",
			"sFileType": "*.properties",
			"sSearchTerm": "*"
		};
		var self = that;
		oFileSystem.search(oCriteria).then(function(aResults) {
			if (!aResults.aFileEntries.length) {
				self.context.service.log.info("pseudo-translation", "No developer properties have been found.", ["system"]).done();
				return;
			}
			var aGenerateProperties = [];
			for (var i = 0; i < aResults.aFileEntries.length; i++) {
				var oDocument = aResults.aFileEntries[i];
				if (self._isDeveloperProperties(oDocument)) {
					aGenerateProperties.push(self.generatePseudoProperties(oDocument));
				}
			}
			if (aGenerateProperties.length > 0) {
				Q.all(aGenerateProperties).then(function() {
					self.context.service.usernotification.liteInfo(that.context.i18n.getText("i18n", "pseudo_files_generated_msg")).done();
					self.context.service.log.info("pseudo-translation", "Translation test files have been generated successfully.", ["system"]).done();
				});
			}
		}).done();
	},

	//Checks if a given file name is a developer properties file (not a translated file)
	_isDeveloperProperties: function(oDocument) {
		var sFileName = oDocument.getEntity().getName();
		//developer properties file name must have extension .properties and shouldn't contain '_'
		return (sFileName.indexOf(".properties") !== -1 && sFileName.indexOf("_") === -1);
	},

	// Translate the value to pseudo translation
	_translateTo2Q: function(sSource) {
		sSource = this._addDots(sSource);
		var sPseudo = "[[[";
		for (var i = 0; i < sSource.length; i++) {
			var ch = sSource.charAt(i);
			sPseudo += this._generateCharacter(ch);
		}
		sPseudo += "]]]";
		return sPseudo;
	},

	_addDots: function(sSource) {
		var iDotsLength = this._getDotsLength(sSource.length);
		if (iDotsLength > 0) {
			sSource += Array(iDotsLength + 1).join("∙");
		}
		return sSource;
	},

	_getDotsLength: function(iSourceLength) {
		if (iSourceLength <= 4) {
			return 10 - (iSourceLength + 6);
		} else if (iSourceLength <= 10) {
			return 20 - (iSourceLength + 6);
		} else if (iSourceLength <= 15) {
			return 25 - (iSourceLength + 6);
		} else if (iSourceLength <= 20) {
			return 30 - (iSourceLength + 6);
		} else if (iSourceLength <= 80) {
			return Math.round((iSourceLength * 0.5) - 6);
		} else {
			return Math.round((iSourceLength * 0.3) - 6);
		}
	},

	// Parse the content of the developer properties file to the content of the pseudo translation file
	_getPseudoContent: function(sDeveloperContent) {
		var sPseudoContent = "";
		var sCurrChar = "";
		var sPrevChar = "";
		var bValue = false; // Boolean to identify if we are handling the key or the value. First we handle the key
		var sKey = "";
		var sValue = "";
		for (var i = 0; i < sDeveloperContent.length; i++) {
			sCurrChar = sDeveloperContent[i];
			if (sCurrChar === "\n" || sCurrChar === "\r\n" || sCurrChar === "\r") {
				/** End of line **/
				if (!sKey || sKey.charAt(0) === "#" || sKey.charAt(0) === "!") {
					// Empty or comment line - copy line as is
					sPseudoContent += sKey + sValue + sCurrChar;
					sKey = sValue = "";
					// Change current state to KEY
					bValue = false;
				} else if (sPrevChar === "\\") {
					// Backslash in the end of line - line continues to the next line
					if (!bValue) { // Current state is KEY
						sKey += sCurrChar;
					} else { // Current state is VALUE
						sValue += sCurrChar;
					}
				} else {
					// Regular line end - add key and value to the output
					if (sValue) {
						sPseudoContent += sKey + this._translateTo2Q(sValue) + sCurrChar;
					} else {
						sPseudoContent += sKey + sCurrChar;
					}
					sKey = sValue = "";
					// Set current state to KEY
					bValue = false;
				}
			} else if (sCurrChar === "=" && !bValue && sPrevChar !== "\\") {
				/** Equal sign that seperates the key and the value **/
				sKey += sCurrChar;
				// Change current state to VALUE
				bValue = true;
			} else {
				/** All other options - add current char to the key or the value **/
				if (!bValue) { // Current state is KEY
					sKey += sCurrChar;
				} else { // Current state is VALUE
					if (!sValue && sCurrChar === " ") {
						// Whitespaces at the beggining of the value will go to the key so they won't enter the 2Q string
						sKey += sCurrChar;
					} else {
						sValue += sCurrChar;
					}
				}
			}
			sPrevChar = sCurrChar;
		}
		// Handle the last line
		if (sKey) {
			sPseudoContent += sKey;
			if (sValue) {
				sPseudoContent += this._translateTo2Q(sValue);
			}
		}
		return sPseudoContent;
	},

	// Replace english/ascii character to its unicode pseudo characther
	_generateCharacter: function(sChar) {
		var sNewChar = this._mConvertMappingChar[sChar];
		if (!sNewChar) {
			return sChar;
		}
		return sNewChar;
	},

	// Codes taken from Wiki - Related+to+Pseudo-Translation
	_mConvertMappingChar: {
		"A": "\\u01000",
		"B": "\\u0181",
		"C": "\\u0108",
		"D": "\\u010E",
		"E": "\\u0114",
		"F": "\\u0191",
		"G": "\\u0122",
		"H": "\\u0124",
		"I": "\\u012C",
		"J": "\\u0134",
		"K": "\\u0136",
		"L": "\\u013B",
		"M": "\\u039C",
		"N": "\\u0143",
		"O": "\\u014E",
		"P": "\\u01A4",
		"Q": "\\u01EC",
		"R": "\\u0158",
		"S": "\\u015C",
		"T": "\\u0162",
		"U": "\\u016E",
		"V": "\\u01B2",
		"W": "\\u0174",
		"X": "\\u03A7",
		"Y": "\\u0176",
		"Z": "\\u017B",
		"a": "\\u0105",
		"b": "\\u0183",
		"c": "\\u010B",
		"d": "\\u018C",
		"e": "\\u0113",
		"f": "\\u0192",
		"g": "\\u011F",
		"h": "\\u0125",
		"i": "\\u012F",
		"j": "\\u0135",
		"k": "\\u0137",
		"l": "\\u013A",
		"m": "\\u0271",
		"n": "\\u014B",
		"o": "\\u014F",
		"p": "\\u03C1",
		"q": "\\u01A3",
		"r": "\\u0157",
		"s": "\\u015F",
		"t": "\\u0163",
		"u": "\\u0171",
		"v": "\\u028B",
		"w": "\\u0175",
		"x": "\\u03C7",
		"y": "\\u0177",
		"z": "\\u017E",
		"∙": "\\u2219"
	}
});