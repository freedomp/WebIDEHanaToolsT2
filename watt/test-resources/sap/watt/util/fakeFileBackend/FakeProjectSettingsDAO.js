//TODO consider the location of this service, since it does not access the orion BE
define([], function() {
	"use strict";
	var CREATE_IF_NOT_THERE = true;

	return {
		SETTINGS_FILE_NAME: ".project.json",
		FILE_CREATED: false,

		_oOpenQueue: new Q.sap.Queue(),
		_oCreateQueue: new Q.sap.Queue(),

		set: function(sSettingsName, vSettings, oDocument) {
			var that = this;
			//Guard reentrance (we can only save one settings per time, as orion otherwise sends a 412)
			return this._oOpenQueue.next(function() {
				//perform the actual setting
				return that._set(sSettingsName, vSettings, oDocument);
			});
		},

		get: function(sSettingsName, oDocument) {
			return this._getSettings(oDocument).spread(function(oSettingsDocument, mSettings) {
				return mSettings[sSettingsName];
			});
		},

		_set: function(sSettingsName, vSettings, oDocument) {
			var that = this;
			return this._getSettings(oDocument, CREATE_IF_NOT_THERE).spread(function(oSettingsDocument, mSettings) {
				mSettings[sSettingsName] = vSettings;
				return that._saveSettings(oSettingsDocument, mSettings);
			});
		},

		/**
		 * @return {[object]} Array with settings document and settings content
		 */
		_getSettings: function(oDocument, bCreate) {
			var that = this;
			return this._getSettingsDocument(oDocument, bCreate).then(function(oSettingsDocument) {
				return that._getJSONContent(oSettingsDocument).then(function(mSettings) {
					return [oSettingsDocument, mSettings];
				});
			});
		},

		_getJSONContent: function(oDocument) {
			if (!oDocument) {
				return Q({});
			}
			return oDocument.getContent().then(function(sContent) {
				var fnWriteEmptyContent = function() {
					return oDocument.setContent("{\n\n}").then(function() {
						return oDocument.save().then(function() {
							return {};
						});
					});

				};
				if (sContent !== null && sContent !== undefined && sContent.trim() === "") {
					return {};
				} else {
					try {
						return JSON.parse(sContent);
					} catch (e) {
						console.error(e);
						return fnWriteEmptyContent();
					}
				}
			});
		},

		_getProject: function(oDocument) {
			return oDocument.getProject();
		},

		_getSettingsDocument: function(oDocument, bCreate) {
			var that = this;
			if (!oDocument) {
				throw new Error("No project selected. Can not process settings.");
			}
			return this._getProject(oDocument).then(function(oProjectDocument) {
				//Guard reentrance (we can only create the file once)
				return that._oCreateQueue.next(function() {
					return that._getFileCreateIfRequested(oProjectDocument, that.SETTINGS_FILE_NAME, bCreate);
				});
			});
		},

		_getFileCreateIfRequested: function(oParent, sName, bCreate) {
			var sPath = oParent.getEntity().getFullPath() + "/" + sName;
			if (bCreate) {
				var that = this;
				return this.context.service.document.getDocumentByPath(sPath).then(function(oDocument) {
					that.FILE_CREATED = !oDocument;
					if (oDocument) {
						return oDocument;
					} else {
						return oParent.createFile(sName).then(function(oDoc) {
							return oDoc;
						}, function() {
							return null;
						});
					}
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
	};
});