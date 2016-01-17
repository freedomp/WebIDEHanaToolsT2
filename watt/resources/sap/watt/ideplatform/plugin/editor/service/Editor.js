define(function() {
	"use strict";
	return {
		_mRegistry : {},
		_mConfig : {},
		_defEditor : [],

		/**
		 * Configures the plugin
		 *
		 * This method reads the configuration and configures the plugin: 		 		 
		 * - collect registered editors 		 
		 * - collects default editors
		 * 
		 */
		configure : function(mConfig) {
			// TODO: Add contentType service
			var that = this;
			that._mConfig = mConfig;

			// collect registered editors
			jQuery.each(mConfig.editors, function(iIndex, mSettings) {
				var aFileTypes = [];
				var oEditor = {
					service : mSettings.service,
					name : mSettings.name
				};

				if (typeof mSettings.fileExtension === "string") {
					aFileTypes.push(mSettings.fileExtension);
				} else if (mSettings.fileExtension) {
					aFileTypes = mSettings.fileExtension;
				} else {
					throw new Error("No file type key provided");
				}

				// File-extensions <-> editors connection
				jQuery.each(aFileTypes, function(iIndex, sFileExtension) {
					if (!that._mRegistry[sFileExtension]) {
						var aEditors = new Array();
						aEditors.push(oEditor);
						that._mRegistry[sFileExtension] = aEditors;
					} else {
						that._mRegistry[sFileExtension].push(oEditor);
					}
				});
			});

			// set the default editor according configuration
			jQuery.each(mConfig.defaultEditors, function(iIndex, oDef) {
				var aEditors = that._mConfig.editors;
				for ( var i = 0; i < aEditors.length; i++) {
					if (aEditors[i].id === oDef.editorId) {
						that._defEditor[oDef.extention] = aEditors[i];
						break;
					}
				}
			});
		},

		getSpecificEditor : function(oDocument, sEditorId) {
			return this.getAllEditors(oDocument).then(function(aEditors) {
				var oEditor = null;
				for ( var i = 0; i < aEditors.length; i++) {
					if (aEditors[i].service._sName === sEditorId || aEditors[i].name === sEditorId) {
						oEditor = aEditors[i]; 
						break;
					}
				}
				return oEditor;
			});
		},


		/**
		 * Get all editors by document object. 
		 * <p>
		 * This method will search the plugin configuration to get the matched editors. 		 		 
		 * @param 	oDocument {object} the current document to be opened. 		 
		 * @return 	array containing the editor objects.
		 */
		getAllEditors : function(oDocument) {
			var aEditors = [];
			if (oDocument.getType() === "file") {
				var sTitle = oDocument.getTitle();
				sTitle = sTitle.toLowerCase();
				aEditors = this._getAllEditorsForFileExtension(sTitle);
			}

			return Q.all(aEditors.map(function(oEditor) {
				return oEditor.service.isAvailable();
			})).then(function(aAvailable) {
				return aEditors.filter(function(bAvailable, iIndex) {
					return aAvailable[iIndex];
				});
			});
		},

		_getAllEditorsForFileExtension : function(sTitle) {
			var extensionSeperator = '.';
			var aEditors = [];
			var aRegisteredFileTypes = Object.keys(this._mRegistry);
			var aFileTypes = this._getAllExtensions(sTitle, extensionSeperator, aRegisteredFileTypes);
			// //FIXME -Quick solution for appdesriptor editor - find a better solution
			if (sTitle === "manifest.json" && this._defEditor["manifest.json"]) {
			 	aFileTypes.push("manifest.json");
			}
			var size = aFileTypes.length;
			for (var i=0; i<size; i++) {
				var sFileType = aFileTypes[i];
				var aRegEditors = this._mRegistry[sFileType];
				var iSize = aRegEditors.length;
				for (var j=0; j<iSize; j++) {
					aEditors.push(aRegEditors[j]);
				}
			}
			if ( aEditors.length < 1 ) {
				aEditors = this._mRegistry["*"];
			}
			if (!aEditors && (aEditors.length < 1)) {
				throw new Error("No editor available");
			}
			return aEditors;
		},
		_getAllExtensions: function(word, str, aValidateRange) {
			var aExtensions = [];
			var aSections = word.split(str);
			var iSize = aSections.length-1;
			var rest = word;
			var iLength = word.length;
			var sExtension = "";
			for (var i=0; i<iSize; i++) {
				var position = rest.lastIndexOf(str);
				var sSub = rest.substring(position+1, iLength);
				if (i> 0 ) {
					sExtension = str + sExtension;
				}
				sExtension = sSub + sExtension;
				rest = word.substring(0, position);
				if ( $.inArray(sExtension, aValidateRange) > -1 ) {
					aExtensions.push(sExtension);
				}
			}
			return aExtensions;			
		},
		
		_getEndAfter : function(word, str) {
			return word.substring(word.lastIndexOf(str)+1, word.length);
		},
		
		_endWith : function(word, str) {
			var wordlength = word.length;
			var beginIndex = wordlength - str.length;
			var endIndex = wordlength;
			var ending = word.substring(beginIndex, endIndex);
			return str == ending;
		},
		
		/**
		 * Get Default editor by document object. 
		 * <p>
		 * This method will search the plugin configuration to get the default editor. 		 		 
		 * @param 	oDocument {object} the current document to be opened. 		 
		 * @return 	the editor object.
		 */
		getDefaultEditor : function(oDocument) {
			var oEditor = null;
			if (oDocument) {
				var sFileExtension = oDocument.getEntity().getFileExtension();
				sFileExtension = sFileExtension.toLowerCase();
				var sTitle = oDocument.getTitle();
				if (sTitle === "manifest.json" && this._defEditor["manifest.json"]) {
				 	oEditor = this._defEditor["manifest.json"];
				} else {
					//check if editor for file extension is defined and use it, else take editor for "*"
					if (!this._defEditor[sFileExtension]) {
						oEditor = this._defEditor["*"];
					} else {
						oEditor = this._defEditor[sFileExtension];
					}
				}
			}
			if (oEditor) {
				return oEditor.service.isAvailable().then(function(bAvailable) {
					if (bAvailable) {
						return oEditor;
					}
				});
			}
		}

	};

});