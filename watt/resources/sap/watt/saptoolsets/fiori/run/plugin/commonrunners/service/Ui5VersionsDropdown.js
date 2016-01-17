define(["sap/watt/lib/lodash/lodash"], function(_) {

	"use strict";

	return {
		_neoappUi5Version: null,
		// Flag indicator to know if we already loaded the ui5 versions list
		_isUi5VersionsLoaded: null,
		// UI5 Versions list that loaded from service by demand and kept for a session
		_aUi5Versions: null,

		initDropdown: function(oDocument) {
			var that = this;
			this._isUi5VersionsLoaded = false;
			return this._getNeoappVersion(oDocument).then(function(neoappUi5Version) {
				// Use version in application neo-app.json file if specified; otherwise, use SAP Web IDE UI5 version
				that._neoappUi5Version = neoappUi5Version;
				return;
			});
		},
		
		getUi5VersionsList: function(oDocument) {
			var that = this;
			if (that._aUi5Versions === null) { 
				this._getUi5Versions().then(function(aUi5Versions) {
					that._aUi5Versions = aUi5Versions;
				}).done();
			}
			return that.context.service.ui5versions.getUI5VersionFromAppDescriptor(oDocument).then(function(sUI5MinimalVersion) {
				if (sUI5MinimalVersion) {
					return that.context.service.ui5versions.sortOutVersionsBelowAppDescriptorVersion(sUI5MinimalVersion, that._aUi5Versions);
				} else {
					return that._aUi5Versions;
				}
			});
		},

		handleDropDownVersions: function(oDocument, oDropDown) {
			var that = this;
			// Set dropdown to be enabled and busy
			oDropDown.setBusy(true);
			oDropDown.setEnabled(true);
			if (this._aUi5Versions === null) {
				this._getUi5Versions().then(function(aUi5Versions) {
					that._aUi5Versions = aUi5Versions;
				}).done();
			}
			this.context.service.ui5versions.getUI5VersionFromAppDescriptor(oDocument).then(function(sUI5MinimalVersion) {
				if (sUI5MinimalVersion) {
					return that.context.service.ui5versions.sortOutVersionsBelowAppDescriptorVersion(sUI5MinimalVersion, that._aUi5Versions).then(
						function(aSlicedUI5Version) {
							return that._fillDropDownVersions(oDropDown, aSlicedUI5Version);
						});
				} else {
					return that._fillDropDownVersions(oDropDown, that._aUi5Versions);
				}
			}).done(function() {
				oDropDown.setBusy(false);
			});
		},

		_fillDropDownVersions: function(oDropDown, aUI5VersionsToShow) {
			// Load versions into dropdown if they aren't loaded yet
			var oModel = oDropDown.getModel();
			if (!this._isUi5VersionsLoaded) {
				this._isUi5VersionsLoaded = true;
				var sUi5ActiveVersion = oModel.getProperty("/ui5ActiveVersion");
				if (sUi5ActiveVersion === null) {
					if ((_.findIndex(aUI5VersionsToShow, "value", this._neoappUi5Version)) >= 0) {
						sUi5ActiveVersion = this._neoappUi5Version;
					} else {
						sUi5ActiveVersion = aUI5VersionsToShow[0].value;
					}
					this.updateModel(oModel, sUi5ActiveVersion);
				}
				for (var i = 0; i < aUI5VersionsToShow.length; i++) {
					var oItem = new sap.ui.core.ListItem({
						key: aUI5VersionsToShow[i].value,
						text: aUI5VersionsToShow[i].display
					});
					oDropDown.addItem(oItem);
				}
				oDropDown.setValue(sUi5ActiveVersion);
			}
		},

		clearDropdown: function() {
			// Clear the dropdown to load it's values next time it is loaded
			this._isUi5VersionsLoaded = false;
		},

		updateModel: function(oModel, sUi5ActiveVersion) {
			oModel.setProperty("/ui5ActiveVersion", sUi5ActiveVersion);
			oModel.setProperty("/ui5VerSource", this._getUi5VersionSource(sUi5ActiveVersion, this._aUi5Versions));
		},

		_getUi5Versions: function(oDocument) {
			return this.context.service.ui5versions.getUI5Versions(oDocument).then(function(aUi5Versions) {
				return aUi5Versions;
			});
		},

		//get the source of the version--> "internal" or "external"
		_getUi5VersionSource: function(sUI5VersionValue, aUi5Versions) {
			var aUI5version = $.grep(aUi5Versions, function(e) {
				return e.value === sUI5VersionValue;
			});
			if (aUI5version.length > 0) {
				return aUI5version[0].source;
			} else {
				return null;
			}

		},

		_getNeoappVersion: function(oDocument) {
			return this.context.service.ui5versions.getUI5CurrentVersion(oDocument).then(function(sUi5CurrentVersion) {
				return sUi5CurrentVersion;
			});
		}
	};
});