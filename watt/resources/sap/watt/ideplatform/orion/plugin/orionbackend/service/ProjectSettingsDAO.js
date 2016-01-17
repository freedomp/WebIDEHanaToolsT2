//TODO consider the location of this service, since it does not access the orion BE
define(["sap/watt/lib/lodash/lodash"], function(_) {
    
	"use strict";
	
	var CREATE_IF_NOT_THERE = true;

	return sap.ui.base.Object.extend("sap.watt.ideplatform.orion.orionbackend.service.ProjectSettingsDAO", {
		
		_oIgnoreService : null,
		SETTINGS_FILE_NAME: ".project.json",
		_FILE_CREATED: false,
		_FILE_EMPTY_VALUE : {},

		set: function(sSettingsName, vSettings, oDocument) {
			var that = this;
		    //perform the actual setting
	        return that._set(sSettingsName, vSettings, oDocument).then(function(oSettingsDocument) {
	            if (that._oIgnoreService && that._FILE_CREATED && oDocument.getEntity().getBackendData().git) {
	                that._FILE_CREATED = false;
	    	
		            return that._oIgnoreService.setIgnore(oSettingsDocument.getEntity());
	            }
		    });
		},

		get: function(sSettingsName, oDocument, bReturnEmptyOnError) {
			if (typeof bReturnEmptyOnError !== "boolean") {
				bReturnEmptyOnError = true;
			}
			
			return this._getSettings(oDocument, false, bReturnEmptyOnError).spread(function(oSettingsDocument, mSettings) {
				return mSettings[sSettingsName];
			});
		},

		_set: function(sSettingsName, vSettings, oDocument) {
			var that = this;
			return this._getSettings(oDocument, CREATE_IF_NOT_THERE, false).spread(function(oSettingsDocument, mSettings) {
				mSettings[sSettingsName] = vSettings;
				return that._saveSettings(oSettingsDocument, mSettings);
			});
		},

		/**
		 * @return {[object]} Array with settings document and settings content
		 */
		_getSettings: function(oDocument, bCreate, bReturnEmptyOnError) {
			var that = this;
			return that._getSettingsDocument(oDocument, bCreate).then(function(oSettingsDocument) {
				return that._getJSONContent(oSettingsDocument, bReturnEmptyOnError).then(function(mSettings) {
					return [oSettingsDocument, mSettings];
				});
			});
		},

		_getJSONContent: function(oDocument, bReturnEmptyOnError) {
			if (!oDocument) {
				return Q(_.cloneDeep(this._FILE_EMPTY_VALUE));
			}
			
			var that = this;
			return oDocument.getContent().then(function(sContent) {
				if (sContent !== null && sContent !== undefined && sContent.trim() === "") {
					return _.cloneDeep(that._FILE_EMPTY_VALUE);
				} 
				
				try {
					return JSON.parse(sContent);
				} catch (oError) {
					if (bReturnEmptyOnError) {
						return _.cloneDeep(that._FILE_EMPTY_VALUE);
					}
					
					return oDocument.getProject(true).then(function(oProjectDocument) {
						var errorMessage = that.context.i18n.getText("i18n", "invalid_content", [oProjectDocument.getEntity().getName(), that.SETTINGS_FILE_NAME]);
						that.context.service.log.error("settings", errorMessage, ["user"]).done();
						throw new Error(errorMessage);
					});
				}
			});
		},

		_getSettingsDocument: function(oDocument, bCreate) {
			var that = this;
			if (!oDocument) {
				throw new Error("No project selected. Can not process settings.");
			}
			
			//Guard reentrance (we can only create the file once)
			return oDocument.getProject().then(function(oProjectDocument) {
				oProjectDocument.oAccessPromise = oProjectDocument.oAccessPromise.then(function() {
					return that._getFileCreateIfRequested(oProjectDocument, that.SETTINGS_FILE_NAME, bCreate);
				});
				return oProjectDocument.oAccessPromise;
			});
		},

		_getFileCreateIfRequested: function(oParentDocument, sName, bCreate) {
			if (!oParentDocument) {
				return null;
			}
			
			var sPath = oParentDocument.getEntity().getFullPath() + "/" + sName;
			if (bCreate) {
				var that = this;
				return this.context.service.document.getDocumentByPath(sPath).then(function(oDocument) {
					that._FILE_CREATED = !oDocument;
					if (oDocument) {
						return oDocument;
					} 
					
					return oParentDocument.createFile(sName).then(function(oDoc) {
						return oDoc;
					}, function() {
						return null;
					});
				});
			}

			return this.context.service.document.getDocumentByPath(sPath);
		},

		_saveSettings: function(oSettingsDocument, mSettings) {
			if (oSettingsDocument) {
				return oSettingsDocument.setContent(JSON.stringify(mSettings, undefined, 2)).then(function() {
					return oSettingsDocument.save().thenResolve(oSettingsDocument);
				});
			}
		}
	});
});