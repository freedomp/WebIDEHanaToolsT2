define({

	sProjectName : "projectName",
	sComponentPath : "componentPath",
	sConnectionData : "connectionData",
	sConnectionDataUrl : "connectionData.url",
	sConnectionDataMDContent : "connectionData.metadataContent",
	sConnectionDataRuntimeUrl : "connectionData.runtimeUrl",
	sConnectionDataDest : "connectionData.destination",
	sConnectionDataDestPath : "connectionData.destination.path",
	sConnectionDataDestUrl : "connectionData.destination.url",
	sValue : "value",
	sDatasource : "datasource",
	sResources : "resources",
	sModelJson : "model.json",
	sHelpUrl : "",
	sHelpTarget : "sap.ui",

	init : function() {
		this._oFileService = this.context.service.filesystem.documentProvider;
		this._oJSCodeCompletionService = this.context.service.jscodecompletion;
		this._oXMLCodeCompletionService = this.context.service.xmlcodecompletion;
		this._oLogger = this.context.service.log;
		var that = this;
		this.context.service.help.getHelpUrl().then(function(sUrl) {
			that.sHelpUrl = sUrl;
		}).done();
	},

	/**
	 * Returns suggestions object according to the content status object
	 *
	 * @param 	{object}		oContentStatus		content status object which contains metadata on target file and positions
	 * @returns {object}		suggestions object
	 */
	getWordSuggestions : function(oContentStatus) {
		if (oContentStatus) {
			var info = [];
			var that = this;
			that.oContentStatus = oContentStatus;

			var sBuffer = that.oContentStatus.buffer;
			var iOffset = that.oContentStatus.offset;
			var sAutoCompletePrefix = "";

			// If there is "\n" or white space in the buffer before the prefix --> the sAutoCompletePrefix
			// should be from this white space or  "\n" till the offset , otherwise the sAutoCompletePrefix
			// should be the buffer.

			var iLastIndexOfTwoCurlyBrackets = sBuffer.substring(0, iOffset).lastIndexOf("{{");

			if (iLastIndexOfTwoCurlyBrackets !== -1 && sBuffer.substring(iLastIndexOfTwoCurlyBrackets, iOffset).lastIndexOf("\n") === -1
				&& sBuffer.substring(iLastIndexOfTwoCurlyBrackets, iOffset).lastIndexOf(" ") === -1) {

				var sModelPath = oContentStatus.targetFile.substring(0, oContentStatus.targetFile.lastIndexOf(that.sResources))
					+ that.sModelJson;

				if (that.oModelJsonAsHash !== undefined && that.sPreviousModelPath === sModelPath) {
					that.sPreviousModelPath = sModelPath;
					return that._extractProposalsFromModel(sAutoCompletePrefix, sBuffer, iLastIndexOfTwoCurlyBrackets, iOffset, info);
				} else {
					that.sPreviousModelPath = sModelPath;
					//get the proposals as suggestions
					return that._oFileService.getDocument(sModelPath).then(
						function(oDoc) {
							if (oDoc === null) {
								return that._handleNoModel(sAutoCompletePrefix, sBuffer,
									iLastIndexOfTwoCurlyBrackets, iOffset, info);
							} else {
								return oDoc.getContent().then(
									function(oContent) {

										var oContentAsJson = JSON.parse(oContent);
										that.oModelJsonAsHash = that._convertModelJsonObjectToHash(oContentAsJson);

										return that._extractProposalsFromModel(sAutoCompletePrefix, sBuffer,
											iLastIndexOfTwoCurlyBrackets, iOffset, info);
									});
							}
						});
				}
			} else if (that._templateBaseType(that.oContentStatus.targetFile) === "js") {
				return that._oJSCodeCompletionService.getWordSuggestions(that.oContentStatus);
			} else if (that._templateBaseType(that.oContentStatus.targetFile) === "xml") {
				return that._oXMLCodeCompletionService.getWordSuggestions(that.oContentStatus);
			} else {
				var emptyProposalsResult = {
					proposals : info
				};
				return emptyProposalsResult;
			}
		}
	},

	/**
	 * Returns the prefix of the given content status object
	 * @param 	{object}		oContentStatus		content status object which contains metadata on target file and positions
	 * @returns {string}		prefix of content status object
	 */
	getCalculatedPrefix: function(oContentStatus) {
		var sPrefix = "";
		if (oContentStatus.token && oContentStatus.token.value) {
			sPrefix = oContentStatus.token.value.substr(0, oContentStatus.cursorPosition.column - oContentStatus.token.start);
		}
		var wordRegex = /[^a-zA-Z_0-9\$\u00A2-\uFFFF]+/;
		return sPrefix.split(wordRegex).slice(-1)[0];
	},
	
	_onAfterDocumentChanged : function(oEvent) {
		var sChangedFilePath = oEvent.params.document.getEntity()._sParentPath +"/"+ oEvent.params.document.getEntity()._sName;
		if(this.sPreviousModelPath === sChangedFilePath){
			this.sPreviousModelPath = "";
			this.oModelJsonAsHash = undefined;
		}
	},

	_handleNoModel : function(sAutoCompletePrefix, sBuffer, iLastIndexOfTwoCurlyBrackets, iOffset, info) {
		this._oLogger.error("Template Code Completion", "model.json file was not found", [ "user" ]).done();
		this.oModelJsonAsHash = undefined;
		return this._extractProposalsFromModel(sAutoCompletePrefix, sBuffer,
			iLastIndexOfTwoCurlyBrackets, iOffset, info);
	},

	_extractProposalsFromModel : function(sAutoCompletePrefix, sBuffer, iLastIndexOfTwoCurlyBrackets, iOffset, info) {
		sAutoCompletePrefix = sBuffer.substring(iLastIndexOfTwoCurlyBrackets + 2, iOffset);
		this._addSuggestionsFromSteps(info, sAutoCompletePrefix);

		for ( var proposal in this.oModelJsonAsHash) {
			if ((proposal.indexOf(sAutoCompletePrefix) === 0)
				&& ((proposal.indexOf("parameters.") !== -1) || (proposal.indexOf(this.sDatasource) === 0))) {

				// Take the proposal from the beginning until one word after the "parameters" word
				// e.g listList.parameters.List1Title.type --> listList.parameters.List1Title
				var editedProposal = proposal;
				if (proposal.indexOf("parameters") !== -1) {
					var indexofParameters = proposal.indexOf(".parameters.");
					var indexOfSecondDotAfterParametersWord = proposal.indexOf(".", indexofParameters + 12);

					editedProposal = proposal.substring(0, indexOfSecondDotAfterParametersWord);
					editedProposal = editedProposal + ".value";
				}

				var sTitle = this.oModelJsonAsHash[editedProposal.substring(0, editedProposal.length - 6) + ".wizard.title"];

				var sTooltip = this.oModelJsonAsHash[editedProposal.substring(0, editedProposal.length - 6) + ".wizard.tooltip"];

				var sAPIReferencePaneDesc = this.context.i18n.getText("i18n", "tmplAutoComplete_model_parameter");

				if (sTitle !== undefined) {
					sAPIReferencePaneDesc += 'The parameter title is "' + sTitle + '".';
				}

				if (sTooltip !== undefined) {
					sAPIReferencePaneDesc += 'The parameter tooltip is "' + sTooltip + '".';
				}

				var sProposal = this._getSingleWordProposal(editedProposal, sAutoCompletePrefix);
				this._addSuggestion(info, sProposal, true, sProposal, sAPIReferencePaneDesc, this.sHelpTarget, "1");
			}
		}

		info.sort(function(proposal1, proposal2) {
			var firstProposal = proposal1.proposal.toLowerCase();
			var secondProposal = proposal2.proposal.toLowerCase();
			if (firstProposal < secondProposal) {
				return -1;
			}
			if (firstProposal > secondProposal) {
				return 1;

			}
			return 0;
		});

		var proposalsResult = {
			proposals : info
		};

		return proposalsResult;
	},

	_templateBaseType : function(sTragetFilePath) {
		var lastDot = sTragetFilePath.lastIndexOf(".");
		var fileNameWithoutTmplExt = sTragetFilePath.substring(0, lastDot);
		var sTemplateBaseType = fileNameWithoutTmplExt.substring(fileNameWithoutTmplExt.lastIndexOf(".") + 1);

		return sTemplateBaseType;
	},

	_addSuggestionsFromSteps : function(oProposalsHash, sAutoCompletePrefix) {
		var aStepsProposals = [];
		this._addSuggestion(aStepsProposals, this.sComponentPath, true, this.sComponentPath, this.context.i18n.getText("i18n",
			"tmplAutoComplete_component_path_help_description"), this.sHelpTarget, "1");

		this._addSuggestion(aStepsProposals, this.sConnectionData, true, this.sConnectionData, this.context.i18n.getText("i18n",
			"tmplAutoComplete_connection_data_help_description"), this.sHelpTarget, "1");

		this._addSuggestion(aStepsProposals, this.sConnectionDataDest, true, this.sConnectionDataDest, this.context.i18n.getText("i18n",
			"tmplAutoComplete_connection_data_help_description"), this.sHelpTarget, "1");

		this._addSuggestion(aStepsProposals, this.sConnectionDataDestPath, true, this.sConnectionDataDestPath, this.context.i18n.getText(
			"i18n", "tmplAutoComplete_connection_data_help_description"), this.sHelpTarget, "1");

		this._addSuggestion(aStepsProposals, this.sConnectionDataDestUrl, true, this.sConnectionDataDestUrl, this.context.i18n.getText(
			"i18n", "tmplAutoComplete_connection_data_help_description"), this.sHelpTarget, "1");

		this._addSuggestion(aStepsProposals, this.sConnectionDataMDContent, true, this.sConnectionDataMDContent, this.context.i18n.getText(
			"i18n", "tmplAutoComplete_connection_data_help_description"), this.sHelpTarget, "1");

		this._addSuggestion(aStepsProposals, this.sConnectionDataRuntimeUrl, true, this.sConnectionDataRuntimeUrl, this.context.i18n
			.getText("i18n", "tmplAutoComplete_connection_data_help_description"), this.sHelpTarget, "1");

		this._addSuggestion(aStepsProposals, this.sConnectionDataUrl, true, this.sConnectionDataUrl, this.context.i18n.getText("i18n",
			"tmplAutoComplete_connection_data_help_description"), this.sHelpTarget, "1");

		this._addSuggestion(aStepsProposals, this.sProjectName, true, this.sProjectName, this.context.i18n.getText("i18n",
			"tmplAutoComplete_project_name_help_description"), this.sHelpTarget, "1");

		for ( var index = 0; index < aStepsProposals.length; index++) {

			var oProposal = aStepsProposals[index];
			if (oProposal.proposal.indexOf(sAutoCompletePrefix) === 0) {

				var sProposal = this._getSingleWordProposal(oProposal.proposal, sAutoCompletePrefix);
				this._addSuggestion(oProposalsHash, sProposal, true, sProposal, oProposal.helpDescription, oProposal.helpTarget, "1");
			}
		}
	},

	_getSingleWordProposal : function(sProposal, sAutoCompletePrefix) {
		var sPrposalAfterBuffer = sProposal.substring(sAutoCompletePrefix.length);
		var sPrposalBeforeBuffer = sProposal.substring(0, sProposal.length - sPrposalAfterBuffer.length);
		var sFromDot = sPrposalBeforeBuffer.substring(sPrposalBeforeBuffer.lastIndexOf(".") + 1);
		var sTillDot = sPrposalAfterBuffer.substring(0, sPrposalAfterBuffer.indexOf("."));

		if (sTillDot === "") {
			sTillDot = sPrposalAfterBuffer;
		}
		return sFromDot + sTillDot;
	},

	_addSuggestion : function(oProposalsHash, sDescription, bOverwrite, oProposal, sHelpDescription, sHelpTarget, sCategory) {
		if (!this._checkIfProposalExists(oProposalsHash, sDescription, oProposal)) {

			oProposalsHash.push({
				// Description to be displayed in the suggestions pop-up
				description : sDescription,

				// If it is true,  the editor will replace the prefix word with the content of the proposal,
				// Otherwise the editor will just add the content after the prefix.
				overwrite : bOverwrite,

				// The value of the selected suggestion
				proposal : oProposal,

				// Description to be displayed in the API Reference Pane
				helpDescription : sHelpDescription,

				// A keyword for help, And then intellisence will  use it to generate appropriate URL of online help.
				helpTarget : sHelpTarget,
				helpUrl : this.sHelpUrl,

				// Every proposal belong to a specific category, and each category has its own icon in the proposal pop-up.
				category : sCategory
			});
		}
	},

	_checkIfProposalExists : function(aProposals, sProposalDesc, sProposal) {
		for ( var i = 0; i < aProposals.length; i++) {
			if ((aProposals[i].description === sProposalDesc) && (aProposals[i].proposal === sProposal)) {
				return true;
			}
		}
		return false;
	},

	_convertModelJsonObjectToHash : function(data) {
		var result = {};
		function recurse(cur, prop) {
			if (Object(cur) !== cur) {
				result[prop] = cur;
			} else if (Array.isArray(cur)) {
				for ( var i = 0, l = cur.length; i < l; i++) {
					recurse(cur[i], prop + "[" + i + "]");
				}
				if (l === 0) {
					result[prop] = [];
				}
			} else {
				var isEmpty = true;
				for ( var p in cur) {
					isEmpty = false;
					recurse(cur[p], prop ? prop + "." + p : p);
				}
				if (isEmpty && prop) {
					result[prop] = {};
				}
			}
		}
		recurse(data, "");
		return result;
	}
});