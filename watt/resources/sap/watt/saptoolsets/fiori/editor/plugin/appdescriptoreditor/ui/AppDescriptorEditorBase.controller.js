sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("sap.watt.saptoolsets.fiori.editor.plugin.appdescriptoreditor.ui.AppDescriptorEditorBase", {
		_context: undefined,
		_Utilities: undefined,
		_oManifestContent: undefined,
		_: undefined,

		//Build the correct path for the property inserted in the manifest.json if it does not exist
		_createManifstSpecificSkeleton: function(aValues, sType, oValue) {
			this._oManifestContent = this.getView().getModel("manifest").getData();
			if (!this._) {
				this._ = require("sap/watt/lib/lodash/lodash"); //Already uploaded in the service
			}
			var oCurrentSkeleton = this._oManifestContent;
			var that = this;
			this._.forEach(aValues, function(oElement, iKey) {
				if (!oCurrentSkeleton[oElement]) {
					if (sType === "array" && oElement === that._.last(aValues)) {
						oCurrentSkeleton[oElement] = [];
					} else {
						oCurrentSkeleton[oElement] = {};
					}
				}
				if (oElement === that._.last(aValues) && oValue !== undefined && oValue !== null) {
					if (sType === "array") {
						oCurrentSkeleton[oElement].push(oValue);
					} else {
					oCurrentSkeleton[oElement] = oValue; }
				}
				oCurrentSkeleton = oCurrentSkeleton[oElement];
			});
		},


		_deleteEntryFromManifest: function(aValues, sKey, sValue) {
			var that = this;
			var oManifestContent = this.getView().getModel("manifest").getData();
			if (sKey) {
				delete this._getManifestLeafToUpdate(aValues, oManifestContent)[sKey];
			}

			if (sValue) {
				this._createManifstSpecificSkeleton(aValues,"", this._getManifestLeafToUpdate(aValues, oManifestContent).filter(function(oElement) {
					return !that._.isEqual(oElement, sValue);
				}));
			}
		},

		_replaceExistingManifestProperty: function(aSourceValue, sKey, aTargetValues) {
			var oldSignature;
			if (!this._) {
				this._ = require("sap/watt/lib/lodash/lodash"); //Already uploaded in the service
			}
			var oManifestContent = this.getView().getModel("manifest").getData();

			if (this._getManifestLeafToUpdate(aSourceValue, oManifestContent).hasOwnProperty(sKey)) {
				//Save the data of the entry to be replaced
				oldSignature = this._.cloneDeep(this._getManifestLeafToUpdate(aSourceValue, oManifestContent).sKey);
				//delete the entry from the manifest
				this._deleteEntryFromManifest(aSourceValue, sKey);
				//create the entry in the manifest with the old data
				this._createManifstSpecificSkeleton(aTargetValues, "", oldSignature);
			}

		},

		_checkValidation: function(oTextField, sPattern) {
			if (!this._) {
				this._ = require("sap/watt/lib/lodash/lodash"); //Already uploaded in the service
			}
			if (!sPattern) {
				var sPath = oTextField.getBindingPath("value");
				var sPatternLocation = sPath.substr(0, sPath.lastIndexOf("/"));
				var oModel = oTextField.getModel();
				var oProperty = oModel.getProperty(sPatternLocation);
				if (this._.isEmpty(oProperty)) {
					return true;
				}
				sPattern = oProperty.pattern;
			}
			var oRegex = new RegExp(sPattern);
			var sValue = oTextField.getValue().trim();
			var bIsValid = oRegex.test(sValue);
			if (sValue.length === 0 && oTextField.getRequired()) {
				bIsValid = false;
			}
			if (bIsValid || (sValue.length === 0 && !oTextField.getRequired())) {
				oTextField.setValueState(sap.ui.core.ValueState.None);
				return true;
			} else {
				oTextField.setValueState(sap.ui.core.ValueState.Error);
				return false;
			}
		},

		_updateManifestSchemaFromAddRemoveListBox: function(oListToUpdate, oEvent, sType, oCurrManifest, oRoute) {
			var sAction = oEvent.getParameter("action");
			var oItem = oEvent.getParameter("item");
			var oActionItem = sType === "textObject" ? oItem.item.text : oItem.item;
			var that = this;
			this._oManifestContent = this.getView().getModel("manifest").getData();
			if (!this._) {
				this._ = require("sap/watt/lib/lodash/lodash"); //Already uploaded in the service
			}

			var oManifestLocationToUpdate = this._getManifestLeafToUpdate(oListToUpdate, this._oManifestContent);
			var oCurrManifestToUpdate = this._getManifestLeafToUpdate(oCurrManifest, this._oManifestContent);

			if (!this._.isEmpty(oItem)) {
				switch (sAction) {
					case "add":
						if (this._.isArray(oManifestLocationToUpdate)) {
							oManifestLocationToUpdate.push(oActionItem);
						} else {
							if (!this._.isArray(oRoute)) {
								oCurrManifestToUpdate[oRoute] = this._.merge(oCurrManifestToUpdate[oRoute], oActionItem);
							} else {
								this._.forEach(oRoute, function(oElement, sKey) {
									if (oElement !== that._.last(oRoute)) {
										oCurrManifestToUpdate = oCurrManifestToUpdate[oElement];
									} else {
										oCurrManifestToUpdate = that._.merge(oCurrManifestToUpdate[oElement], oActionItem);
									}
								});
							}
						}
						break;
					case "remove":
						if (this._.isArray(oManifestLocationToUpdate)) {
							this._.remove(oManifestLocationToUpdate, function(oElement) {
								return that._.isEqual(oElement, oActionItem);
							});
						} else {
							if (!this._.isArray(oRoute)) {
								oCurrManifestToUpdate[oRoute] = this._.omit(oManifestLocationToUpdate, oItem.type);
							} else {
								this._.forEach(oRoute, function(oElement, sKey) {
									oCurrManifestToUpdate = oCurrManifestToUpdate[oElement];
									if (oElement === that._.last(oRoute)) {
										delete oCurrManifestToUpdate[Object.keys(oActionItem)[0]];
									}
								});
							}
						}
						break;
					default:
				}
			}
		},

		_getManifestLeafToUpdate: function(aListToUpdate, oManifestContent) {
			var oManifestLocationToUpdate;

			for (var i = 0; this._.isArray(aListToUpdate) && i < aListToUpdate.length; i++) {
				if (oManifestContent[aListToUpdate[i]]) {
					oManifestLocationToUpdate = oManifestContent[aListToUpdate[i]];
				}
				oManifestContent = oManifestLocationToUpdate;
			}
			return oManifestLocationToUpdate;
		},

		_getNextAvailableFieldValue: function(aManifestPath, sFieldTemplate, sFieldName) {
			var obj = this.getView().getModel("manifest").getData();
			
			if (!this._) {
				this._ = require("sap/watt/lib/lodash/lodash"); //Already uploaded in the service
			}

			for (var i = 0; i < aManifestPath.length; i++) {
				obj = obj[aManifestPath[i]];
				if (!obj) {
					return sFieldTemplate + "1";
				}
			}
			
			var aValues;
			if (sFieldName) {
				// If need to generate values for a regular field
				aValues = this._.pluck(obj, sFieldName);
			} else {
				// If need to generate values for a key field
				aValues = Object.keys(obj);
			}
			var sPattern = new RegExp("^" + sFieldTemplate + "\\d+$");
			var aFilteredValues = this._.filter(aValues, function(sValue) {
				return sPattern.test(sValue);
			});

			if (aFilteredValues.length === 0) {
				return sFieldTemplate + "1";
			}

			var aIndexes = this._.map(aFilteredValues, function(sValue) {
				return Number(sValue.replace(sFieldTemplate, ""));
			});

			return sFieldTemplate + String(this._.max(aIndexes) + 1);
		}

	});
});