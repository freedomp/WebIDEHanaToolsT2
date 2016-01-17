define([ "../ui/TermServiceUI", "../ui/TranslationServiceUI", "sap/watt/lib/lodash/lodash"],

	function(TermServiceUI, TranslationServiceUI, _) {

		return {

			//variables for Term servies
			//_sDomain : undefined,

			// Use default text type xmsg
			_sTextType : undefined,
			_oTermsUI : undefined,
			_sFilePrefix : undefined,

			//Variables for Translation services
			_oSourceLanguage : undefined, //could be {id:"de", name:"German"}
			_oTargetLanguages : undefined, //could be [{id:"de", name:"German"}]
			_sUUID : undefined,
			_oTranslationUI : undefined,

			_oi18nEntry : undefined,
			//Variables for property file manipulation
			_oFileService : undefined,

			//Error message
			ERROR_FOLDER_NOT_EXIST : "The folder {0} doesn't exist",
			ERROR_FILE_NOT_EXIST : "The file {0} doesn't exist",
			ERROR_FILE_EXIST : "The file {0} already exists",
			ERROR_KEY_NOT_EXIST : "The key {0} doesn't exists",
			ERROR_KEY_EXIST : "The key {0} already exists",

			init : function() {
				if (this._oFileService === undefined) {
					this._oFileService = this.context.service.filesystem.documentProvider;
				}
			},

			configure: function (mConfig) {
				this._aStyles = mConfig.styles;
				if (this._aStyles) {
					this.context.service.resource.includeStyles(this._aStyles).done();
				}
			},

			// *******************************************************
			// public  functions for Term services
			// *******************************************************

			/**
			 * Get all term domains supported by the Term/Translation Server
			 * <p>
			 * A Promise will be returned immediately. And the result will be back asynchronously. The users need to use ".then" to get the result.
			 * oPromise = getDomains();
			 * oPromise.then(
			 * 	function(result) {
				 * 		//success
				 * 		// result will be an object. { domains: [{name: "", id:""}, {}] }
				 * 	},
			 * 	function(error) {
				 *		//fail
				 * 	});
			 *
			 * @return 	a Promise object.
			 */
			getDomains : function() {
				return $.ajax({
					type : 'Get',
					url : '/translation/api/v1/domains'
				});
			},

			/**
			 * Get all text types supported by the Term/Translation Server
			 * <p>
			 * A Promise will be returned immediately. And the result will be back asynchronously. The users need to use ".then" to get the result.
			 * oPromise = getTextTypes();
			 * oPromise.then(
			 * 	function(result) {
				 * 		//success
				 * 		// result will be an object. { texttypes: [{name: "", id:""}, {}] }
				 * 	},
			 * 	function(error) {
				 *		//fail
				 * 	});
			 *
			 * @return 	a Promise object.
			 */
			getTextTypes : function() {
				return $.ajax({
					type : 'Get',
					url : '/translation/api/v1/texttypes'
				});
			},


			/**
			 * Set domain to be used for searching the term for current project
			 *
			 * @param 	{object} 			oDomain				the domain to be used. If you want to clear existing domain, pass an empty string , null, or undefined to this method.
			 * @param 	{object}			oTargetDocument 	the target document.
			 */
			setCurrentDomain : function(oDomain, oTargetDocument) {
				var sDomain = "";
				if (oDomain && oDomain.id) {
					sDomain = oDomain.id;
				}

				var oProject = this.context.service.setting.project;
				var oTranslation = this.context.self;
				return oProject.get(this.context.service.translation, oTargetDocument).then(function(mSettings) {
					var oSettings = {};
					if (mSettings) {
						oSettings = mSettings;
					}

					oSettings.translationDomain = sDomain;
					if (oSettings.supportedLanguages == null || oSettings.supportedLanguages === "") {
						oSettings.supportedLanguages = "en,fr,de";
					}
					if (oSettings.defaultLanguage == null || oSettings.defaultLanguage === "") {
						oSettings.defaultLanguage = "en";
					}
					if (oSettings.defaultI18NPropertyFile == null || oSettings.defaultI18NPropertyFile === "") {
						oSettings.defaultI18NPropertyFile = "i18n.properties";
					}
					if (oSettings.resourceModelName == null || oSettings.resourceModelName === "") {
						oSettings.resourceModelName = "i18n";
					}
					//var sSettings = JSON.stringify(oSettings);

					return oProject.set(oTranslation, oSettings, oTargetDocument);
				});
			},

			onAfterGenerate : function(oEvent) {
				// check if project
				if ((oEvent.params.selectedTemplate.getType() !== "project")
					&& (oEvent.params.selectedTemplate.getType() !== "Fiori_project")) {
					return;
				}

				this.setCurrentDomain(oEvent.params.model.domain, oEvent.params.targetDocument).done();
			},

			/**
			 * Gets currently used Text Type, which the term will be searched from.
			 *
			 * @return 	the current Text Type (string). If the Text Type was not set, empty string will be returned.
			 */
			getCurrentTextType : function() {
				return this._sTextType;
			},

			/**
			 * Sets Text Type to be used for searching the term
			 *
			 * @param 	{string}		sTextTypeID  	the Text Type to be used. If you want to clear existing Text Type, pass an empty string, null, or undefined to this method.
			 */
			setCurrentTextType : function(sTextTypeID) {
				if (sTextTypeID && (sTextTypeID !== "")) {
					this._sTextType = sTextTypeID;
				} else {
					this._sTextType = "";
				}
			},

			/**
			 * Gets suggestions of terms for the particular word.
			 * <p>
			 * This method will search the Term server to get all the suggestions for the term based on currently used domain and Text Type.
			 * If the domain and Text Type were not set, the method will get the suggestions from all domains with all Text Types.
			 * It is a asynchronous call. A Promise will be returned immediately. And the result will be back asynchronously. The users need to use ".then" to get the result.
			 * oPromise = getTerms();
			 * oPromise.then(
			 * 	function(result) {
				 * 		//success
				 * 		// result will be an object. "{ suggestions: [
				 * 													{id: 854788, value: "xxx", domainId: "1C", domainName: "Business", texttypeId: "XFLD", texttypeName: "Label",availableLanguages: 5}, 
				 * 													{}
				 * 													] 
				 * 									}"
				 * 	},
			 * 	function(error) {
				 *		//fail
				 * 	});
			 *
			 * @param 	{string}		sText 			the term, which needs suggestions for standard term. It could be a whole word or partial word.
			 * @param 	{string}		sDomainID 		the domain, define the domain, which the term belong to.
			 * @param 	{string}		sTextTypeID	 	the TextType, define the texttype, which the term belong to.
			 * @return 	{Array}			an array of terms. [{id:123456, value:"", domainId:"", domainName:"", texttypeId:"", texttypeName:"", availableLanguages:5}]
			 */
			getTerms : function(sText, sDomainID, sTextTypeID) {
				var that = this;
				var oDeferred = Q.defer();

				if ((sText === undefined) || (sText == null) || (sText === "")) {
					//in this case, will simply return empty array.
					//even it is easier to return it synchronously, we still prefer to use asynchronous way to make it consistent to the retrieval of data from server
					setTimeout(function() {
						oDeferred.resolve([]);
					}, 50);

					return oDeferred.promise;
				}

				var texttype = sTextTypeID || that.getCurrentTextType();
				if ((sDomainID === "") || (sDomainID === "@ALL@")) {
					sDomainID = undefined;
				}
				if ((texttype === "") || (texttype === "@ALL@")) {
					texttype = undefined;
				}

				var encodedText = encodeURIComponent(sText);
				var url = "/translation/api/v1/suggestions?search=" + encodedText;
				if (sDomainID) {
					url = url + "&" + "domain=" + sDomainID.toUpperCase();
				}
				if (texttype) {
					url = url + "&" + "texttype=" + texttype.toUpperCase();
				}

				$.ajax({
					type : 'Get',
					url : url
				}).then(function(result) {

					// Filter duplicate values
					var terms = result.suggestions;
					result.suggestions = _.uniq(terms, function (e) {
						return e.value;
					});

					oDeferred.resolve(result);

				}, function() {
					oDeferred.resolve([]);
				});

				return oDeferred.promise;

			},

			/**
			 * Show a UI element to show all suggested terms for the specific text.
			 * <p>
			 * This method will list all suggested term in a UI element for users to choose. Before show the suggestion to users,
			 * it will use current domain and current text type as filters. By default, it provide a way for users to change
			 * text type in the UI.
			 * The users can choose any suggestion and press enter key to use it. the UI will disappear once the users select any term.
			 * @param 	{function}		callback 				the the callback function once the term was selected.
			 * @param 	{string}		sText 					the term string, which needs suggestions for standard term. It could be a plain text or a reference to a mode /key from the property file i nformat of  {model>key}.
			 * @param 	{boolean}		bShowDomain  			whether to show the domain text. true by default.
			 * @param 	{boolean}		bShowTextType 			whether allow users to change domain. If it is missing, assume it is allowed.
			 * @param 	{boolean}		bAllowChangeTextType 	whether allow users to change text type. If it is missing, assume it is allowed.
			 * @param 	{object}		oPlaceAt 				a HTML element (placeholder) where this UI will be shown in. If it is missing, assume it is a top level UI.
			 * @param 	{object}		oCurrentStatus 			the extra data the caller want to passed in.
			 *
			 */
			showGetTermsUI : function(callback, sText, bShowDomain, bShowTextType, bAllowChangeTextType, oPlaceAt, oCurrentStatus) {
				var that = this;
				this._callback = callback;

				return this._getModelKey(sText).then(
					function(oKey) {
						var oKeyValue = {};

						if (oKey) {
							//sText is just a reference to the key in property file, like {model>key}
							oKeyValue.sModel = oKey.sModel;
							oKeyValue.sKey = oKey.sKey;

							return that.getPropertyKey(undefined, oKeyValue.sModel, oKeyValue.sKey, oCurrentStatus ? oCurrentStatus.document: null).then(
								function(oProp) {
									if (oProp) {
										oKeyValue.sValue = oProp.value;
										that._oTermsUI = TermServiceUI;

										return that._getProjectInfo().then(
											function(oPrj) {
												return that._oTermsUI.showTermsUI(function(oOrigValue, oTerm) {
														that._termSelected(oOrigValue, oTerm, oCurrentStatus ? oCurrentStatus.document: null);
													}, that, oKeyValue, bShowDomain, oPrj.domain, bShowTextType, that
														.getCurrentTextType(), bAllowChangeTextType, oPlaceAt,
													oCurrentStatus);
											});

									} else {
										if (this._callback) {
											this._callback(null).done();
										}
									}
								});

						} else {
							//hardcode text
							return that._getProjectInfo().then( function(oPrj){
								oKeyValue.sModel = oPrj.model;
								oKeyValue.sKey = null;
								oKeyValue.sValue = sText;
								that._oTermsUI = TermServiceUI;


								that._oTermsUI.showTermsUI(function(oOrigValue, oTerm) {
										that._termSelected(oOrigValue, oTerm, oCurrentStatus ? oCurrentStatus.document: null);
									}, that, oKeyValue, bShowDomain, oPrj.domain, bShowTextType, that.getCurrentTextType(),
									bAllowChangeTextType, oPlaceAt, oCurrentStatus);

							});
						}
					});

			},

			/**
			 * Get currently used domain, which the term will be searched from. It is asynchronous call and a Promise will be returned immediately.
			 * The users need to use .then() to get the result
			 * @return 	the current domain (string) for the current project. If the domain was not set, "BC" will be returned.
			 */
			getCurrentDomain : function() {
				var oProject = this.context.service.setting.project;
				return oProject.get(this.context.service.translation).then(function(mSettings) {
					if (mSettings && mSettings.translationDomain) {
						return mSettings.translationDomain;
					} else {
						return "BC";
					}
				}).fail(function() {
					return "BC";
				});
			},

			_getProjectInfo : function() {
				var oProject = this.context.service.setting.project;
				var sDomain="BC", sModel="i18n",iIndex;
				var that = this;
				return oProject.get(this.context.service.translation).then(function(mSettings) {
					if (mSettings && mSettings.translationDomain) {
						sDomain=mSettings.translationDomain;
					}

					if (mSettings && mSettings.defaultI18NPropertyFile) {
						var fileName = mSettings.defaultI18NPropertyFile;
						iIndex = fileName.indexOf('.');
						if (iIndex>0){
							that._sFilePrefix = fileName.substring(0,iIndex);
							sModel = that._sFilePrefix;
						}
					}

					if (mSettings && mSettings.resourceModelName) {
						sModel = mSettings.resourceModelName;
					}

					return {"domain":sDomain,"model":sModel};
				}).fail(function() {
					return {"domain":sDomain,"model":sModel};
				});
			},

			/**
			 * Hides the terms UI
			 */
			hideTermUI : function() {
				if (this._oTermsUI) {
					this._oTermsUI.hideTermUI();
				}
			},

			// *******************************************************
			// public  functions for Translation services
			// *******************************************************

			/**
			 * Gets all languages supported by the Term/Translation Server
			 * <p>
			 * It is a asynchronous call. A Promise will be returned immediately. And the result will be back asynchronously. The users need to use ".then" to get the result.
			 * oPromise = getLanguages();
			 * oPromise.then(
			 * 	function(result) {
				 * 		//success
				 * 		// result will be an object. { languages: [{id:"", name: ""}, {}] }
				 * 	},
			 * 	function(error) {
				 *		//fail
				 * 	});
			 *
			 * @return 	an array of languages in format of [{id:"", name:""}].
			 */
			getLanguages : function() {
				return $.ajax({
					type : 'Get',
					url : '/translation/api/v1/languages'
				});
			},

			/**
			 * Get source language for translation.
			 *
			 * @return 	the current used source language in format of {id:"de", name:"German"}.
			 */
			getSourceLanguage : function() {
				return this._oSourceLanguage;
			},

			/**
			 * Set source language
			 *
			 * @param 	{object}		oLanguage 		the source language code for translation in format of {id:"de", name:"German"}
			 */
			setSourceLanguage : function(oLanguage) {
				if (oLanguage && (oLanguage !== "")) {
					this._oSourceLanguage = oLanguage;
				} else {
					this._oSourceLanguage = undefined;
				}
			},

			/**
			 * Gets target language for translation.
			 *
			 * @return 	{Array} an array of the current used target languages in format of [ {id:"de", name:"German"}, {}]
			 */
			getTargetLanguages : function() {
				if (this._oTargetLanguages) {
					return this._oTargetLanguages;
				} else {
					//supposed to get it from project level settings, which is not available yet
					//return hardcoded default languages
					var langs = [];
					var lang1 = {};
					lang1.id = "en";
					lang1.name = "English";
					langs.push(lang1);
					return langs;
				}
			},

			/**
			 * Set target languages
			 *
			 * @param 	{Array}		oLanguages		the target languages in format of [ {id:"de", name:"German"}, {}]
			 */
			setTargetLanguages : function(oLanguages) {
				if (oLanguages) {
					if (Object.prototype.toString.call(oLanguages) === '[object Array]') {
						//passed-in array
						this._oTargetLanguages = oLanguages;
					} else {
						//passed-in one object
						this._oTargetLanguages = [];
						this._oTargetLanguages.push(oLanguages);
					}
				} else {
					this._oTargetLanguages = undefined;
				}
			},

			/**
			 * Gets suggestions of translation for the particular term for specific languages.
			 * <p>
			 * This method will search the Translation server to get all the translations for the term based on specified target languages
			 * If the target language was not set, the method will get the suggestions from all available languages.
			 * It is a asynchronous call. A Promise will be returned immediately. And the result will be back asynchronously. The users need to use ".then" to get the result.
			 * @param 	{Array}				oKeyValues	 			the values to be translation. It should be in the format of [{key:"", value:"", texttypes:"", extraInfo:""}, ]
			 * @param 	{object}			sTargetLanguages	 	target languages to be translated to. in format of [{id:"", name:"German"}]
			 * @param 	{string}			sBundleID	 			a file-based or bundle-based uuid to represent the unique id, which the terms belong to
			 * @param 	{boolean}			bCanCancel  			display a dialog for user to cancel the web service call if true
			 * @return 	an array of translated words. it should be in format of
			 * [
			 *   {
				 *	  "textType":"XFLD",
				 *	  "key":"TEST_KEY",
				 *	  "value":"Username for CAFUSER",
				 *	  "translations":[
				 *		  {"language":"en","value":"Username for CAFUSER"},
				 *		  {"language":"fr","value":"Nom utilisateur pour CAFUSER"},
				 *		  {"language":"de","value":"Benutzername für CAFUSER"}
				 *	   ]
				 *   },
			 *   {
				 *   ...
				 *   }
			 *]
			 */
			getTranslations : function(oKeyValues, sDomain, oTargetLanguages, sBundleID, bCanCancel) {
				var oDialog;
				var oDeferred = Q.defer();
				var languages = oTargetLanguages ? oTargetLanguages : this.getTargetLanguages();

				if (!oKeyValues || !languages) {
					oDeferred.resolve(null);
					return oDeferred.promise;
				}

				var bundleID = sBundleID ? sBundleID : this.getUUID();
				var i;
				var oData = {};

				//languages
				oData.targetLanguages = [];
				if (languages && languages.length > 0) {
					for (i = 0; i < languages.length; i++) {
						oData.targetLanguages.push(languages[i].id);
					}
				}

				//bundles
				oData.bundles = [];

				var oBundle = {};
				oBundle.id = bundleID;
				oBundle.domain = sDomain;
				oBundle.units = [];

				for (i = 0; i < oKeyValues.length; i++) {
					var oKeyValue = oKeyValues[i];
					var unit = {};
					unit.textType = oKeyValue.textType;
					unit.key = oKeyValue.key;
					unit.value = oKeyValue.value;
					oBundle.units.push(unit);
				}

				oData.bundles.push(oBundle);
				var sData = JSON.stringify(oData);

				$.ajax({
					type : "POST",
					url : "/translation/api/v1/translate",
					data : sData,
					dataType : 'json',
					headers : {
						'Accept' : 'application/json',
						'Content-Type' : 'application/json' + ((typeof InstallTrigger !== 'undefined') ? '; charset=utf-8' : '')
					}
				}).done(function(response) {
					try {
						var units = response.bundles[0].units; //response.bundles[0].units[0].translations;
						oDeferred.resolve(units);
					} catch (e) {
						oDeferred.reject(e);
					}
				}).fail(function(jqXHR, textStatus, errorThrown) {
					oDeferred.reject(errorThrown);
				}).always(function() {
					if (bCanCancel && oDialog.isOpen()) {
						oDialog.close();
					}
				});

				if (bCanCancel) {
					oDialog = new sap.ui.commons.Dialog({
						title : this.context.i18n.getText("i18n", "dlg_getTranslationMsg"),
						showCloseButton : false,
						modal : true
					});
					oDialog.addButton(new sap.ui.commons.Button({
						text : this.context.i18n.getText("i18n", "dlg_getTranslationCancel")
					}).attachPress(function() {
							oDialog.isCancelled = true;
							oDialog.close();
						}));
					oDialog.attachClosed(function() {
						if (oDialog.isCancelled) {
							oDeferred.reject();
						}
					});
					oDialog.open();
				}

				return oDeferred.promise;
			},

			/**
			 * Returns the current uuid
			 * @returns {string} uuid
			 */
			getUUID : function() {
				if (this._sUUID && (this._sUUID !== "")) {
					return this._sUUID;
				} else {
					return this._generateNewUUID();
				}

			},

			/**
			 * Sets uuid for translation bundle
			 * @param {string} 	sUUID
			 */
			setUUID : function(sUUID) {
				this._sUUID = sUUID;
			},

			/**
			 * Checks if an document entity is translatable.
			 * <p>
			 * @param 	{object}	oEntity  	a document entity
			 * @returns {boolean} 				true if the entity can be translated and false if not
			 */
			isEntityTranslatable : function(oEntity) {
				var bIsTranslatable = false;
				var sFilename, iIndex;

				if (oEntity.getType() === "file") {
					sFilename = oEntity.getName();
					iIndex = sFilename.lastIndexOf(".properties");
					sFilename = sFilename.substring(0, iIndex); // get filename without ext

					if (sFilename.length > 0) {
						iIndex = sFilename.lastIndexOf("_");
						bIsTranslatable = iIndex <= 0 || (iIndex > 0 && iIndex === sFilename.length - 1);
					}
				}

				this._sFilename = bIsTranslatable ? sFilename : "";

				return bIsTranslatable;
			},

			_saveProperties : function(oDocument, aProperties, oDeferred) {
				var that = this;

				oDocument.getContent().then(
					function(oContent) {
						var separator = oContent.indexOf("\r\n") >= 0 ? "\r\n" : "\n";
						var i, len;
						var oProperty;
						var result;

						if (aProperties) {
							for (i = 0, len = aProperties.length; i < len; i++) {
								oProperty = aProperties[i];
								result = that._findPropKey(oContent, oProperty.key);
								var sExtra;
								if (result && result.iKeyline !== -1) {
									//key exists already, so update it
									result.oLines[result.iKeyline] = oProperty.key + "=" + oProperty.value;
									if (result.iCommentline>=0) {
										sExtra = oProperty.extraInfo ? oProperty.extraInfo : "";
										result.oLines[result.iCommentline] = "# " + oProperty.textType + ":" + sExtra;
									} else {
										result.oLines.splice(result.iKeyline, 0,
											"# " + oProperty.textType + ":" + oProperty.extraInfo ? oProperty.extraInfo : "");
									}
								} else {
									//not exists
									sExtra = oProperty.extraInfo ? oProperty.extraInfo : "";
									result.oLines.push(" ");
									result.oLines.push("# " + oProperty.textType + ":" + sExtra);
									result.oLines.push(oProperty.key + "=" + oProperty.value);
								}

								//convert oLines array back to content string
								oContent = result.oLines.join(separator);
							}
							oDocument.setContent(oContent).done(function() {
								oDocument.save().then(function() {
									sap.ui.core.BusyIndicator.hide();
									oDeferred.resolve(oDocument);
								}, function(write_error) {
									sap.ui.core.BusyIndicator.hide();
									oDeferred.reject(write_error);
								});

								sap.ui.core.BusyIndicator.show();
							});
						} else {
							oDeferred.reject("aProperties is not defined");
						}
					}, function(error_read) {
						oDeferred.reject(error_read);
					}).done();
			},

			/**
			 * Writes the an array of properties (key and value) and their comments for specific language into the property file under i18n folder.
			 * The property file name will be "sMode_sLanguage.properties"
			 * If the key exists, then update it.
			 * If the key doesn't exist, add it.
			 * the property file to be updated will be "sModel_sLanguage.properties"
			 * <p>
			 * A Promise will be returned immediately. And the file will be created asynchronously. The users need to use ".then" to get the file entry.
			 * @param {string}		sLanguage  		the language code such as "de"
			 * @param {string}		sModel 			model or bundle name, which will be first part of the property file name
			 * @param [object]		oProperties  	the property information, which will be written to the property file. It is a JS object in following format:
			 * [{
				 * 	key: "",
				 * 	value: "",
				 * 	textType:"",
				 * 	extraInfo:""
				 * }]
			 * @returns the property file entry object
			 */
			updatePropertyKeys : function(sLanguage, sModel, aProperties, oDocument) {
				var that = this;
				var oDeferred = Q.defer();

				if (!oDocument) {
					oDeferred.reject("oDocument is not defined");
				} else {
					this._getI18NFolderEntry(oDocument).then(function(i18nDocument) {
						that._getPropertyFileEntry(i18nDocument, sLanguage, sModel).then(function(fileDocument) {

							if (fileDocument) {
								that._saveProperties(fileDocument, aProperties, oDeferred);
							} else {
								//create a new file
								that._createOnePropertyFile(i18nDocument, sLanguage, sModel).then(function(newFileDocument) {
									that._saveProperties(newFileDocument, aProperties, oDeferred);
								}, function(error) {
									oDeferred.reject(error);
								});

							}

						}, function(error_get_prop_file) {
							oDeferred.reject(error_get_prop_file);
						});

					}, function(error_geti18n) {
						oDeferred.reject(error_geti18n);
					});
				}
				return oDeferred.promise;
			},

			/**
			 * Write the property (key and value) and its comments for specific language into the property file under i18n folder.
			 * The property file name will be "sMode_sLanguage.properties"
			 * If the key exists, then update it.
			 * If the key doesn't exist, add it.
			 * the property file to be updated will be "sModel_sLanguage.properties"
			 * <p>
			 * A Promise will be returned immediately. And the file will be created asynchronously. The users need to use ".then" to get the file entry.
			 * @param {string}		sLanguage  		the language code such as "de"
			 * @param {string}		sModel 			model or bundle name, which will be first part of the property file name
			 * @param {object}		oProperty  		the property information, which will be written to the property file. It is a JS object in following format:
			 * {
				 * 	key: "",
				 * 	value: "",
				 * 	textType:"",
				 * 	extraInfo:""
				 * }
			 * @returns the property file entry object
			 * @throw error when oProperty is corrupted
			 */
			updatePropertyKey : function(sLanguage, sModel, oProperty, oDocument) {
				if ((oProperty && ("key" in oProperty)
					&& ("value" in oProperty) && ("textType" in oProperty) && ("extraInfo" in oProperty))) {
					return this.updatePropertyKeys(sLanguage, sModel, [ oProperty ], oDocument);
				} else {
					var oError = new Error("The oProperty that provided is malformed (missing required attributes)");
					oError.name = "TranslationImplSrvOPropIsMalformed";
					throw oError;
				}
			},

			/**
			 * Gets all properties (key and value) and its comments for specific language from the property file under i18n folder.
			 * The property file name will be "sModel_sLanguage.properties"
			 * If any key exists, return an array of keys.
			 * If the no key exists, return null or empty array.
			 * <p>
			 * A Promise will be returned immediately. And the file will be created asynchronously. The users need to use ".then" to get the file entry.
			 * @param {string}		sLanguage  		the language code such as "de"
			 * @param {string}		sModel  		the model/bundle to be used for property fie name
			 * @returns the property items in following format
			 * [{
				 * 	key: "",
				 * 	value: "",
				 * 	textType:"",
				 * 	extraInfo:""
				 * },
			 * {
				 * }]
			 */
			getAllPropertyKeys : function(sLanguage, sModel, oDocument) {
				var that = this;
				var oDeferred = Q.defer();

				this._getI18NFolderEntry(oDocument).then(function(i18Document) {
					that._getPropertyFileEntry(i18Document, sLanguage, sModel).then(function(fileDocument) {
						if (fileDocument) {
							//file exists, read
							fileDocument.getContent().then(function(oContent) { //that._oFileService.readFileContent(fileDocument).then(function(oContent) {
								var aProperties = [];

								var oNewContent = oContent.replace(/\r\n/g, "\n");
								var aLines = oNewContent.split("\n");

								if (aLines) {
									for ( var i = 0; i < aLines.length; i++) {
										var sLine = aLines[i];
										sLine = sLine.replace(/^\s+/, ""); //remove beginning space
										if (sLine && (sLine !== "") && (sLine.search(/\w/) === 0)) {
											//the candidate for key/value
											if (sLine.search(/=/) > 0) {
												var aKeyValue = sLine.replace(/\s+=/g, "=").replace(/=\s+/g, "=").split("=");
												var oProp = {};
												oProp.key = aKeyValue[0];
												var value = aKeyValue[1].split(/\/\//);
												oProp.value = value[0];
												if (i > 0) {
													//get comment
													var sCLine = aLines[i - 1];
													if (sCLine.substring(0, 1) === "#") {
														var ott_extra = sCLine.split(":");
														oProp.textType = ott_extra[0].replace(/\W/g, "");
														if (ott_extra.length > 0) {
															oProp.extraInfo = ott_extra[1];
														}
													}
												}
												aProperties.push(oProp);
											}

										}

									}
								}
								oDeferred.resolve(aProperties);

							}, function() {
								oDeferred.resolve(null);
							});
						} else {
							oDeferred.resolve(null);
						}
					}, function() {
						oDeferred.resolve(null);
					});

				}, function() {
					oDeferred.resolve(null);
				});

				return oDeferred.promise;
			},

			/**
			 * Gets a property (key and value) and its comments for specific language into the property file under i18n folder.
			 * The property file name will be "sModel_sLanguage.properties"
			 * If the key exists, then get it.
			 * If the key doesn't exist, return null.
			 * <p>
			 * A Promise will be returned immediately. And the file will be created asynchronously. The users need to use ".then" to get the file entry.
			 * @param 	{string}		sLanguage  the language code such as "de"
			 * @param 	{string}		sModel  	the model/bundle to be used for property file name
			 * @param 	{string}		sKey  		the key to be searched
			 * @returns the property item in following format
			 * {
				 * 	key: "",
				 * 	value: "",
				 * 	textType:"",
				 * 	extraInfo:""
				 * }
			 */
			getPropertyKey : function(sLanguage, sModel, sKey, oDocument) {
				var that = this;
				var oDeferred = Q.defer();

				this._getI18NFolderEntry(oDocument).then(function(i18Document) {
					that._getPropertyFileEntry(i18Document, sLanguage, sModel).then(function(fileDocument) {
						if (fileDocument) {
							//file exists, read
							fileDocument.getContent().then(function(oContent) { //that._oFileService.readFileContent(fileDocument).then(function(oContent) {
								var result = that._findPropKey(oContent, sKey);
								if (result && result.iKeyline !== -1) {
									//key exists already, delete it
									var oProperty = null;
									oProperty = {};

									var sProp = result.oLines[result.iKeyline];
									if (sProp) {
										var oKey_values = sProp.replace(/\s+=/g, "=").replace(/=\s+/g, "=").split("=");

										oProperty.key = oKey_values[0];
										oProperty.value = oKey_values[1].split(/\/\//)[0]; //remove inline comment

										if (result.iCommentline >= 0) {
											var sComment = result.oLines[result.iCommentline];
											var ott_extra = sComment.split(":");

											oProperty.textType = ott_extra[0].replace(/\W/g, "");
											if (ott_extra.length > 0) {
												oProperty.extraInfo = ott_extra[1];
											}

										}
										oDeferred.resolve(oProperty);
									} else {
										oDeferred.resolve(null);
									}
								} else {
									//key does not exist
									oDeferred.resolve(null);
								}

							}, function() {
								oDeferred.resolve(null);
							});
						} else {
							oDeferred.resolve(null);
						}
					}, function() {
						oDeferred.resolve(null);
					});

				}, function() {
					oDeferred.resolve(null);
				});

				return oDeferred.promise;

			},

			/**
			 * Deletes a property (key and value) and its comments for specific language/bundle from the property file under i18n folder.
			 * The property file name will be "sModel_sLanguage.properties"
			 * If the key exists, then delete it.
			 * If the key doesn't exist, come back with error.
			 * <p>
			 * A Promise will be returned immediately. And the file will be created asynchronously. The users need to use ".then" to get the file entry.
			 * @param 	{string}		sLanguage  		the language code such as "de"
			 * @param 	{string}		sModel  		the model/bundle to be used as the property file name (first part)
			 * @param 	{string}		sKey	 		the key to be deleted
			 * @returns the property file entry object
			 */
			deletePropertyKey : function(sLanguage, sModel, sKey, oDocument) {
				var that = this;
				var oDeferred = Q.defer();

				this._getI18NFolderEntry(oDocument).then(function(i18Document) {
					that._getPropertyFileEntry(i18Document, sLanguage, sModel).then(function(fileDocument) {
						//read
						fileDocument.getContent().then(function(oContent) { //that._oFileService.readFileContent(fileDocument).then(function(oContent) {
							var result = that._findPropKey(oContent, sKey);
							if (result) {
								//key exists already, delete it
								result.oLines.splice(result.iKeyline, 1);
								if (result.iCommentline>=0) {
									result.oLines.splice(result.iCommentline, 1);
								}

							} else {
								//key does not exist
								oDeferred.reject(that._errorMessage(ERROR_KEY_NOT_EXIST, sKey));
							}

							//convert oLines array back to content string
							var separator = "\n";
							if (oContent.indexOf("\r\n") >= 0) {
								separator = "\r\n";
							}

							var oNewContent = result.oLines.join(separator);

							fileDocument.setContent(oNewContent).then(function() {
								fileDocument.save().then(function() {
									oDeferred.resolve(fileDocument);
								}, function() {
									oDeferred.resolve(null);
								});

							});

						}, function() {
							oDeferred.resolve(null);//oDeferred.reject(error_read);
						});

					}, function() {
						oDeferred.resolve(null);//oDeferred.reject(error_get_prop_file);
					});

				}, function() {
					oDeferred.resolve(null);//oDeferred.reject(error_geti18n);
				});

				return oDeferred.promise;
			},

			// *******************************************************
			// private  functions
			// *******************************************************

			//format the message
			_errorMessage : function(msg, arg) {
				return MessageFormat.format(msg, arg);
			},

			// Assumes that the top level folder is the project folder
			// if any file or folder was selected, gets its top most folder entry,
			// then gets i18n entry if it exists, else create it.
			// if webapp folder exist creates the i18n folder under it
			_getI18NFolderEntry : function(document) {
				var that = this;
				// Retrieve i18n folder name from project.json "resourceModelName" value
				return this._getI18nFolderName().then(function(i18nFolderName) {
					return that._getSelectedDocument(document).then(function(oDocument) {
						if (oDocument) {
							return that._getRootContent(oDocument).then(function(aFolderMetadataContent) {
								var webAppDocumentsMetadata = that._getFolders(aFolderMetadataContent, "webapp");
								if (webAppDocumentsMetadata && webAppDocumentsMetadata.length > 0) {
									//Found webapp folder, takes the top most one in the project -
									// now searches for i18n under it
									return that._handleFolderExistence(aFolderMetadataContent, webAppDocumentsMetadata[0],
                                        i18nFolderName, "webapp");
								} else {
									//webapp folder does not exist - searches for i18n in the root project
									//if not found - creates it under the root project
                                    //if src folder exist - create it under it
									return that._handleWebappFolderAbsent(aFolderMetadataContent, oDocument, i18nFolderName);
								}
							});
						}
					});

				});
			},

			_getI18nFolderName : function() {
				var oProject = this.context.service.setting.project;
				//Default name
				var name = "i18n";
				return oProject.get(this.context.service.translation).then(function(mSettings) {
					if (mSettings && mSettings.resourceModelName) {
						name = mSettings.resourceModelName;
					}
					return name;
				}).fail(function() {
					return name;
				});
			},

			// Returns the selected document
			// If nothing is selected returns null
			_getSelectedDocument : function(document){
				var oDocument = null;
				if (document){
					oDocument = document;
				} else {
					var selectionService = this.context.service.selection;
					return selectionService.getSelection().then(function(aSelection) {
						var oSelection = aSelection[0];
						if (oSelection && oSelection.document) {
							return oSelection.document;
						}
					});
				}
				return Q(oDocument);
			},

			// Returns the root content recursively of the given document
			_getRootContent : function(oDocument){
				return this._getRootProject(oDocument).then(function(oProjectDocument) {
					return oProjectDocument.getCurrentMetadata(true).then(function(aFolderMetadataContent) {
						return aFolderMetadataContent;
					});
				});
			},

			// Returns the Folder document by a given folder name and root folder content
			// Returns null otherwise
			_getFolders : function(aFolderMetadataContent, folderName) {
				var oFolders = [];
				if (aFolderMetadataContent && folderName) {
					oFolders = _.filter(aFolderMetadataContent, function (oElement) {
						return oElement.name === folderName && oElement.folder;
					});
				}
				return oFolders;
			},

			// Returns the root project of the given document
			// Returns null otherwise
			_getRootProject : function(document){
				var that = this;
				if(document.getEntity().isRoot()){
					return null;
				} else{
					return document.getParent().then(function(oParent){
						if(!oParent){
							return null;
						} else{
							if(oParent.getEntity().isRoot()){
								return document;
							} else {
								return that._getRootProject(oParent);
							}
						}
					});
				}
			},

            _handleWebappFolderAbsent: function (aFolderMetadataContent, oDocument, i18nFolderName) {
                var aSRCDocumentsMetadata = this._getFolders(aFolderMetadataContent, "src");
                if (aSRCDocumentsMetadata && aSRCDocumentsMetadata.length > 0) {
                    //Found src folder, takes the top most one in the project -
                    // now searches for i18n under it
                    return this._handleFolderExistence(aFolderMetadataContent, aSRCDocumentsMetadata[0], i18nFolderName, "src");
                } else {
                    //src folder does not exist - searches for i18n in the root project
                    //if not found - creates it under the root project
                    var aI18nDocumentsMetadata = this._getFolders(aFolderMetadataContent, i18nFolderName);
                    if (aI18nDocumentsMetadata && aI18nDocumentsMetadata.length > 0) {
                        return this._getI18RootFolder(oDocument, aI18nDocumentsMetadata, i18nFolderName);
                    } else {
                        //Not exists, create it in root folder
                        return this._createI18nOnRoot(oDocument, i18nFolderName);
                    }
                }
			},

            _handleFolderExistence: function (aFolderMetadataContent, oFolderMetadataDocument, i18nFolderName) {
                var i18nDocumentsMetadata = this._getFolders(aFolderMetadataContent, i18nFolderName);
				var that = this;
                if (i18nDocumentsMetadata && i18nDocumentsMetadata.length > 0) {
                    var sFolderName = oFolderMetadataDocument.name;
                    var oI18SubFolderMetadata = _.find(i18nDocumentsMetadata, function (oElement) {
                        return oElement.path.indexOf(sFolderName) > -1 && oElement.folder;
                    });
                    if (oI18SubFolderMetadata) {
						return this.context.service.filesystem.documentProvider.getDocument(oI18SubFolderMetadata.path).
							then(function(oI18SubFolder) {
								return oI18SubFolder;
						});
                    } else {
                        //i18n does not exist - get folder root and creates i18n under it
						return this.context.service.filesystem.documentProvider.getDocument(oFolderMetadataDocument.path).
							then(function(oFolderDocument) {
								return that._createI18nOnFolder(oFolderDocument, i18nFolderName);
						});
                    }
                } else {
                    //i18n does not exist - get folder root and creates i18n under it
					return this.context.service.filesystem.documentProvider.getDocument(oFolderMetadataDocument.path).
						then(function(oFolderDocument) {
							return that._createI18nOnFolder(oFolderDocument, i18nFolderName);
					});
                }
            },

            _getI18RootFolder: function (oDocument, aI18nDocumentsMetadata, i18nFolderName) {
                var that = this;
                return this._getRootProject(oDocument).then(function (root) {
                    var oI18RootFolderMetadata = null;
                    if (root) {
                        oI18RootFolderMetadata = _.find(aI18nDocumentsMetadata, function (oElement) {
                            return oElement.path === root.getEntity().getFullPath() + "/" + i18nFolderName && oElement.folder;
                        });
                    }
                    if (oI18RootFolderMetadata) {
						return that.context.service.filesystem.documentProvider.getDocument(oI18RootFolderMetadata.path).
							then(function(oI18RootFolder) {
								return oI18RootFolder;
							});
                    } else {
                        //Not exists under the root - creates its
                        return that._createI18nOnRoot(oDocument, i18nFolderName);
                    }
                });
            },

			_createI18nOnFolder: function (folder, sFolderName) {
				if (folder && sFolderName) {
					return folder.createFolder(sFolderName).then(function (result) {
						return result;
					}, function () {
						return null;
					});
				} else {
					return null;
				}
			},

			_createI18nOnRoot: function (oDocument, i18nFolderName) {
				var that = this;
				return this._getRootProject(oDocument).then(function (root) {
					return that._createI18nOnFolder(root, i18nFolderName);
				});
			},

			_getPropertyFileName: function (sModel, sLanguage) {
				var _sFilename = this._sFilePrefix ? this._sFilePrefix : (sModel || "i18n");
				if (sLanguage) {
					_sFilename = _sFilename + "_" + sLanguage;
				}
				_sFilename = _sFilename + ".properties";
				return _sFilename;
			},

			//create one property file under the folder represented by oParentEntry in specific language.
			//sLanguage must represent one language such as "de". It cannot be for multiple languages such as "de, fr"
			//if the property file exists, simply return the file entry. If not exists, create it and return the newly created file entry.
			//i support Deferred/promise
			_createOnePropertyFile : function(oParentDocument, sLanguage, sModel) {
				var _sFilename = this._getPropertyFileName(sModel, sLanguage);
				return oParentDocument.createFile(_sFilename);
			},

			_getAbsolutePropertyFilePath : function (sModel, sLanguage, oParenDocument) {
				var _sFilename = this._getPropertyFileName(sModel, sLanguage);
				var absPath = oParenDocument ? oParenDocument.getEntity().getFullPath() + "/" + _sFilename : "";
				return absPath;
			},

			//get the FileEntry for the property for the language represented by sLanguage (under oParentEntry)
			//only one language can be given
			//support Deferred/Promise
			_getPropertyFileEntry : function(oParenDocument, sLanguage, sModel) {
				var absPath = this._getAbsolutePropertyFilePath(sModel, sLanguage, oParenDocument);
				return this._oFileService.getDocument(absPath).then( function (oDocument) {
					return oDocument;
				});

			},

			//find whether the key(sPropKey) exists in the oContent.
			//if exists, a js object will be returned. the object will be {oLines: [], iKeyline:12, iCommentline: 11}
			//if not exists, return undefined.
			_findPropKey : function(oContent, sPropKey) {
				var i;
				var oResult = {};
				oResult.oLines = [];
				oResult.iKeyline = -1;
				oResult.iCommentline = -1;

				if (oContent) {
					var oNewContent = oContent.replace(/\r\n/g, "\n");
					var lines = oNewContent.split("\n");

					oResult.oLines = lines;

					if ((lines === undefined) || (lines == null) || (lines.length <= 0)) {
						return oResult;
					} else {
						for (i = 0; i < lines.length; i++) {
							var line = lines[i];
							//separate the key from others
							var items = line.replace(/[\s=]/g, "=").replace(/=+/g, "=").split("=");
							if (items[0] === sPropKey) {
								//found
								oResult.iKeyline = i;
								//check whether there is comment for this key
								if (i > 0) {
									var cline = lines[i - 1].replace(/\s/g, "");
									if (cline.substring(0, 1) === "#") {
										oResult.iCommentline = i - 1;
									}
								}
								return oResult;
							}
						}

					}

				} else {
					return oResult;
				}

				return oResult;
			},

			//analyze the text to see whether it is in model/key reference like {model>key}, which refer to a key/value in the property (model) file
			// if it is, return a {sModel: "", sKey: ""}
			_getModelKey : function(sText) {
				var oDeferred = Q.defer();

				setTimeout(function() {
					if (sText && sText !== "") {
						var sNewText = sText.replace(/\s/g, "");
						var sFirstChar = sNewText.substring(0, 1);
						var sLastChar = sNewText.substring(sNewText.length - 1);
						if ((sFirstChar === "{") && (sLastChar === "}")) {
							var aModelKeys = sNewText.substring(1, sNewText.length - 1).split(">");
							if (aModelKeys && aModelKeys.length === 2) {
								var key = {};
								key.sModel = aModelKeys[0];
								key.sKey = aModelKeys[1];
								oDeferred.resolve(key);
							} else {
								oDeferred.resolve(null);
							}
						} else {
							oDeferred.resolve(null);
						}

					} else {
						oDeferred.resolve(null);
					}
				}, 500);

				return oDeferred.promise;
			},

			//generate a new uuid for use
			_generateNewUUID : function() {
				return "984084ea-ab4d-48e6-e800-49d3bf1e917b";
			},

			//generate a key (for property item) based on the value and term ID
			_generateNewKey : function(sValue, sTermID) {
				if (!sValue) {
					return null;
				}

				var key = sValue.replace(/\W/g, "_").replace("./g", "_");
				if (key.length > 16) {
					key = key.substring(0, 16);
				}

				if (sTermID) {
					key = key + "_" + sTermID;
				}

				return key;
			},

			// *******************************************************
			// callback function from UI
			// *******************************************************
			_callback : undefined,

			//call back function
			//oOrigValue: {sModel:"", sKey: "", sValue: ""}
			//oTerm: {id:123456, value:"", domainId:"", domainName:"", texttypeId:"", texttypeName:"", availableLanguages:5}
			_termSelected : function(oOrigValue, oTerm, document) {
				if ((oOrigValue == null) && (oTerm == null)) {
					//the ESC was pressed, and the term UI was hidden
					if (this._callback) {
						this._callback().done();
					}

				}

				var that = this;

				var term4PropFile = {};

				if (oOrigValue.sKey) {
					term4PropFile.key = oOrigValue.sKey;
				} else {
					term4PropFile.key = this._generateNewKey(oTerm.value, oTerm.id);
				}

				//update default property file
				term4PropFile.value = oTerm.value;
				term4PropFile.textType = oTerm.texttypeId;
				term4PropFile.extraInfo = oTerm.id + "(" + oTerm.domainName + "(" + oTerm.domainId + ")" + ")";

				this.updatePropertyKey("", oOrigValue.sModel, term4PropFile, document).then(function() {
					//calback
					if (that._callback) {
						that._callback("{" + oOrigValue.sModel + ">" + term4PropFile.key + "}");
					}

				}, function() {
					//cannot update default property file, so return original text and skip the localized property files
					console.log("The returned text for Code Editor is: " + oTerm.value);
					if (that._callback) {
						that._callback(oTerm.value);
					}
				}).done();

			},

			/**
			 * Returns true if the terms popup is open and visible
			 * @returns 	{boolean}	true if the terms popup is open and visible
			 */
			isShowPopup	: function() {
				if (this._oTermsUI && this._oTermsUI.isVisible()){
					return true;
				} else {
					return false;
				}
			}
		};
	});
