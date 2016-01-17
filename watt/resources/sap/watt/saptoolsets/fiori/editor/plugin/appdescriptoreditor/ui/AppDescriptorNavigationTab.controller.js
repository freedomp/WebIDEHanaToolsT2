sap.ui.define([
	"./AppDescriptorEditorBase.controller"
], function(BaseController) {
	"use strict";

	return BaseController.extend("sap.watt.saptoolsets.fiori.editor.plugin.appdescriptoreditor.ui.AppDescriptorNavigationTab", {

		onInit: function() {
			this._sSignaturesKeys = "";
			this._oContext = this.getView().getViewData().oContext;
			this._aExtensionFilters = this.getView().getViewData().aExtentionFilters;
			this._ = require("sap/watt/lib/lodash/lodash"); //Already uploaded in the service
		},

		/**
		 * =============================
		 * Navigation tab methods
		 * =============================
		 */
		onAfterRendering: function() {
			//Set intent details controls enabled status
			var oIntentTable = this.byId("appDescriptorIntentTable");
			this.getView().getModel("AppDescriptorUI").setProperty("/navigationTab", {
				intentDetailsEnabled: oIntentTable.getSelectedIndex() !== -1
			});
		},

		onInsertRowPress: function(oEvent) {
			var bSchemaVersion_1_1_0 = this.getView().getModel("AppDescriptorUI").getProperty("/bSapAppVersion1_1_0");
			if (!bSchemaVersion_1_1_0) {
				var oIntentTable = this.byId("appDescriptorIntentTable");
				var sRowsBindingPath = oIntentTable.getBindingPath("rows");
				var oModel = oEvent.getSource().getModel();
				var aTiles = oModel.getProperty(sRowsBindingPath);
				var sKey = this._getNextAvailableFieldValue(["sap.app", "crossNavigation", "inbounds"], "intent");
				var sSemanticObject = this._getNextAvailableFieldValue(["sap.app", "crossNavigation", "inbounds"], "object", "semanticObject");
				var sAction = this._getNextAvailableFieldValue(["sap.app", "crossNavigation", "inbounds"], "action", "action");
				aTiles.push({
					key: sKey,
					semanticObject: sSemanticObject,
					action: sAction,
					indicatorDataSource: {},
					signature: {
						parameters: [],
						additionalParameters: "allowed"
					}
				});
				oModel.setProperty(sRowsBindingPath, aTiles);
				oIntentTable.setSelectedIndex(aTiles.length - 1);
				// We are using setTimeout here because there is no event for rows change
				/*	setTimeout(function() {
					oIntentTable.getRows()[aTiles.length - 1].getCells()[0].focus();
				}, 100);*/
				this._createManifstSpecificSkeleton(["sap.app", "crossNavigation", "inbounds", sKey, "signature", "parameters"]);
				this._createManifstSpecificSkeleton(["sap.app", "crossNavigation", "inbounds", sKey, "signature", "additionalParameters"], "",
					"allowed");
				this._createManifstSpecificSkeleton(["sap.app", "crossNavigation", "inbounds", sKey, "semanticObject"], "", sSemanticObject);
				this._createManifstSpecificSkeleton(["sap.app", "crossNavigation", "inbounds", sKey, "action"], "", sAction);
				this.fireEvent("manifestChanged");
			}
		},

		onRemoveRowPress: function(oEvent) {
			var oIntentTable = this.byId("appDescriptorIntentTable");
			var sRowsBindingPath = oIntentTable.getBindingPath("rows");
			var oModel = oEvent.getSource().getModel();
			var aTiles = oModel.getProperty(sRowsBindingPath);
			var iIndex = oIntentTable.getSelectedIndex();
			if (aTiles && aTiles.length > 0 && iIndex > -1) {
				this._deleteEntryFromManifest(["sap.app", "crossNavigation", "inbounds"], aTiles[iIndex].key);
				this.fireEvent("manifestChanged");
				aTiles.splice(iIndex, 1);
				oModel.setProperty(sRowsBindingPath, aTiles);
				var iSelectedIndex;
				if (aTiles.length === 0) {
					iSelectedIndex = -1;
					this.getView().getModel("AppDescriptorUI").setProperty("/navigationTab/intentDetailsEnabled", false);
				} else {
					iSelectedIndex = iIndex === 0 ? iIndex : iIndex - 1;
				}

				oIntentTable.setSelectedIndex(iSelectedIndex);
			}
		},

		onInsertParamRowPress: function(oEvent) {
			var oIntentTableParam = this.byId("appDescriptorIntentTableParams");
			var sParametersBindingPath = oIntentTableParam.getBindingContext().getPath() + "/" + oIntentTableParam.getBindingPath("rows");
			var oModel = oEvent.getSource().getModel();
			var sPathIntentParams = oIntentTableParam.getBindingContext().getPath();
			var aParameters = oModel.getProperty(sParametersBindingPath);
			var oIntent = oModel.getProperty(sPathIntentParams);
			var sName = this._getNextAvailableFieldValue(["sap.app", "crossNavigation", "inbounds", oIntent.key, "signature", "parameters"], "name");

			aParameters.push({
				Name: sName,
				defaultValue: {
					value: "",
					format: "plain"
				},
				filter: {
					value: "",
					format: "plain"
				}
			});

			oModel.setProperty(sParametersBindingPath, aParameters);
			this._createManifstSpecificSkeleton(["sap.app", "crossNavigation", "inbounds", oIntent.key, "signature", "parameters", aParameters[
				aParameters.length - 1].Name], "", {
				defaultValue: {
					value: "",
					format: "plain"
				},
				filter: {
					value: "",
					format: "plain"
				}
			});

			this.fireEvent("manifestChanged");
			oIntentTableParam.setSelectedIndex(aParameters.length - 1);
			// We are using setTimeout here because there is no event for rows change
			/*setTimeout(function() {
				oIntentTableParam.getRows()[aSignatures.length - 1].getCells()[0].focus();
			}, 100);*/
		},

		onRemoveParamRowPress: function(oEvent) {
			var oIntentTableParam = this.byId("appDescriptorIntentTableParams");
			var intentTablePath = oIntentTableParam.getBindingContext().getPath();
			var sParametersBindingPath = intentTablePath + "/" + oIntentTableParam.getBindingPath("rows");
			var oModel = oEvent.getSource().getModel();
			var aParameters = oModel.getProperty(sParametersBindingPath);
			var iIndex = oIntentTableParam.getSelectedIndex();
			var oIntent = oModel.getProperty(intentTablePath);
			if (aParameters && aParameters.length > 0 && iIndex > -1) {
				this._deleteEntryFromManifest(["sap.app", "crossNavigation", "inbounds", oIntent.key, "signature", "parameters"], aParameters[iIndex]
					.Name);
				this.fireEvent("manifestChanged");
				this._sSignaturesKeys = {};
				aParameters.splice(iIndex, 1);
				oModel.setProperty(sParametersBindingPath, aParameters);
				if (aParameters.length > 0) {
					var iSelectedIndex = iIndex === 0 ? iIndex : iIndex - 1;
					oIntentTableParam.setSelectedIndex(iSelectedIndex);
				}
			}
		},

		onIntentSemanticObjectChange: function(oEvent) {
			var sPath = oEvent.getSource().getBindingContext().sPath;
			var oModel = oEvent.getSource().getModel();
			var oIntent = oModel.getProperty(sPath);
			var inbounds = oModel.getProperty("/sap.app/properties/crossNavigation/properties/inbounds");
			var sPattern = this._.values(inbounds.patternProperties)[0].properties.semanticObject.pattern;
			this._checkValidation(oEvent.getSource(), sPattern);
			this._createManifstSpecificSkeleton(["sap.app", "crossNavigation", "inbounds", oIntent.key, "semanticObject"], "", oEvent.getParameter(
				"newValue"));
			//raise event to update the document
			this.fireEvent("manifestChanged");
		},

		onIntentActionChange: function(oEvent) {
			var sPath = oEvent.getSource().getBindingContext().sPath;
			var oModel = oEvent.getSource().getModel();
			var oIntent = oModel.getProperty(sPath);
			var inbounds = oModel.getProperty("/sap.app/properties/crossNavigation/properties/inbounds");
			var sPattern = this._.values(inbounds.patternProperties)[0].properties.action.pattern;
			this._checkValidation(oEvent.getSource(), sPattern);
			this._createManifstSpecificSkeleton(["sap.app", "crossNavigation", "inbounds", oIntent.key, "action"], "", oEvent.getParameter(
				"newValue"));
			//raise event to update the document
			this.fireEvent("manifestChanged");
		},

		onIntentParamsCellClick: function(oEvent) {
			//get the param key = the Name of the signature as in the model
			var oIntentTableParam = this.byId("appDescriptorIntentTableParams");
			var intentTablePath = oIntentTableParam.getBindingContext().getPath();
			var sParametersBindingPath = intentTablePath + "/" + oIntentTableParam.getBindingPath("rows");
			var oModel = oEvent.getSource().getModel();
			var aParameters = oModel.getProperty(sParametersBindingPath);
			var iIndexSignature = oEvent.getParameter("rowIndex");
			if (aParameters[iIndexSignature]) {
				this._sSignaturesKeys = this._.cloneDeep(aParameters[iIndexSignature].Name);
			}
		},

		onIntentParamsNameChange: function(oEvent) {
			var oModel = oEvent.getSource().getModel();
			var oIntentTableParam = this.byId("appDescriptorIntentTableParams");
			var sPathIntentParams = oIntentTableParam.getBindingContext().getPath();
			var oIntent = oModel.getProperty(sPathIntentParams);

			//since the Name is the key of the signature inside the manifest- we need to create a new object with the new name
			this._replaceExistingManifestProperty(["sap.app", "crossNavigation", "inbounds", oIntent.key, "signature", "parameters"], this._sSignaturesKeys, [
				"sap.app", "crossNavigation", "inbounds", oIntent.key, "signature", "parameters", oEvent.getParameter("newValue")
			]);
			this.fireEvent("manifestChanged");
		},

		onIntentParamsMandatoryChange: function(oEvent) {
			var sPathSignature = oEvent.getSource().getBindingContext().sPath;
			var oModel = oEvent.getSource().getModel();
			var aParameters = oModel.getProperty(sPathSignature);
			var oIntentTableParam = this.byId("appDescriptorIntentTableParams");
			var sPathIntentParams = oIntentTableParam.getBindingContext().getPath();
			var oIntent = oModel.getProperty(sPathIntentParams);
			this._createManifstSpecificSkeleton(["sap.app", "crossNavigation", "inbounds", oIntent.key, "signature", "parameters", aParameters.Name,
				"required"
			], "", oEvent.getParameter("checked"));
			this.fireEvent("manifestChanged");
		},

		onIntentDefaultValueValueChange: function(oEvent) {
			var sPathParameters = oEvent.getSource().getBindingContext().sPath;
			var oModel = oEvent.getSource().getModel();
			var aParameters = oModel.getProperty(sPathParameters);
			var oIntentTableParam = this.byId("appDescriptorIntentTableParams");
			var sPathIntentParams = oIntentTableParam.getBindingContext().getPath();
			var oIntent = oModel.getProperty(sPathIntentParams);
			this._createManifstSpecificSkeleton(["sap.app", "crossNavigation", "inbounds", oIntent.key, "signature", "parameters", aParameters.Name,
				"defaultValue", "value"
			], "", oEvent.getParameter("newValue"));
			this.fireEvent("manifestChanged");
		},

		onIntentDefaultValueFormatChange: function(oEvent) {
			var sPathParameters = oEvent.getSource().getBindingContext().sPath;
			var oModel = oEvent.getSource().getModel();
			var aParameters = oModel.getProperty(sPathParameters);
			var oIntentTableParam = this.byId("appDescriptorIntentTableParams");
			var sPathIntentParams = oIntentTableParam.getBindingContext().getPath();
			var oIntent = oModel.getProperty(sPathIntentParams);
			this._createManifstSpecificSkeleton(["sap.app", "crossNavigation", "inbounds", oIntent.key, "signature", "parameters", aParameters.Name,
				"defaultValue", "format"
			], "", oEvent.getParameter("newValue"));
			this.fireEvent("manifestChanged");
		},

		onIntentParamsFilterValueChange: function(oEvent) {
			var sPathParameters = oEvent.getSource().getBindingContext().sPath;
			var oModel = oEvent.getSource().getModel();
			var aParameters = oModel.getProperty(sPathParameters);
			var oIntentTableParam = this.byId("appDescriptorIntentTableParams");
			var sPathIntentParams = oIntentTableParam.getBindingContext().getPath();
			var oIntent = oModel.getProperty(sPathIntentParams);
			this._createManifstSpecificSkeleton(["sap.app", "crossNavigation", "inbounds", oIntent.key, "signature", "parameters", aParameters.Name,
				"filter", "value"
			], "", oEvent.getParameter("newValue"));
			this.fireEvent("manifestChanged");
		},

		onIntentFilterFormatChange: function(oEvent) {
			var sPathParameters = oEvent.getSource().getBindingContext().sPath;
			var oModel = oEvent.getSource().getModel();
			var aParameters = oModel.getProperty(sPathParameters);
			var oIntentTableParam = this.byId("appDescriptorIntentTableParams");
			var sPathIntentParams = oIntentTableParam.getBindingContext().getPath();
			var oIntent = oModel.getProperty(sPathIntentParams);
			this._createManifstSpecificSkeleton(["sap.app", "crossNavigation", "inbounds", oIntent.key, "signature", "parameters", aParameters.Name,
				"filter", "format"
			], "", oEvent.getParameter("newValue"));
			this.fireEvent("manifestChanged");
		},

		onGeneralIntentTitleChange: function(oEvent) {
			var sPath = oEvent.getSource().getBindingContext().sPath;
			var oModel = oEvent.getSource().getModel();
			var oIntent = oModel.getProperty(sPath);
			var inbounds = oModel.getProperty("/sap.app/properties/crossNavigation/properties/inbounds");
			var sPattern1 = this._.values(inbounds.patternProperties)[0].properties.title.oneOf[0].pattern;
			var sPattern2 = this._.values(inbounds.patternProperties)[0].properties.title.oneOf[1].pattern;
			//Need to pass one of the validations: start with the first see if passes or not
			if (!this._checkValidation(oEvent.getSource(), sPattern1)) { //failed the first validation check if passes the second
				this._checkValidation(oEvent.getSource(), sPattern2);
			} 
			this._createManifstSpecificSkeleton(["sap.app", "crossNavigation", "inbounds", oIntent.key, "title"], "", oEvent.getParameter(
				"newValue"));
			this.fireEvent("manifestChanged");
		},

		onGeneralIntentSubtitleChange: function(oEvent) {
			var sPath = oEvent.getSource().getBindingContext().sPath;
			var oModel = oEvent.getSource().getModel();
			var oIntent = oModel.getProperty(sPath);
			var inbounds = oModel.getProperty("/sap.app/properties/crossNavigation/properties/inbounds");
			var sPattern1 = this._.values(inbounds.patternProperties)[0].properties.title.oneOf[0].pattern;
			var sPattern2 = this._.values(inbounds.patternProperties)[0].properties.title.oneOf[1].pattern;
			//Need to pass one of the validations: start with the first see if passes or not
			if (!this._checkValidation(oEvent.getSource(), sPattern1)) { //failed the first validation check if passes the second
				this._checkValidation(oEvent.getSource(), sPattern2);
			} 
			this._createManifstSpecificSkeleton(["sap.app", "crossNavigation", "inbounds", oIntent.key, "subTitle"], "", oEvent.getParameter(
				"newValue"));
			this.fireEvent("manifestChanged");
		},

		onIntentIconChange: function(oEvent) {
			var sPath = oEvent.getSource().getBindingContext().sPath;
			var oModel = oEvent.getSource().getModel();
			var oIntent = oModel.getProperty(sPath);
			this._createManifstSpecificSkeleton(["sap.app", "crossNavigation", "inbounds", oIntent.key, "icon"], "", oEvent.getParameter(
				"newValue"));
			this.fireEvent("manifestChanged");
		},

		onIntentIconValueHelpRequest: function(oEvent) {
			var oLocalEvent = jQuery.extend(true, {}, oEvent); //Save the ui5 event in a local parameter to be passed to the service
			this._oContext.service.ui5icons.openIconDialog().then(function(oResult) {
				if (oResult.icon) {
					oLocalEvent.getSource().setValue("sap-icon://" + oResult.icon);
					var sPath = oLocalEvent.getSource().getBindingContext().sPath;
					var oModel = oLocalEvent.getSource().getModel();
					var oIntent = oModel.getProperty(sPath);
					this._createManifstSpecificSkeleton(["sap.app", "crossNavigation", "inbounds", oIntent.key, "icon"], "", "sap-icon://" + oResult.icon);
					this.fireEvent("manifestChanged");
				}
			}.bind(this)).done();
		},

		onIntentDataSourceChange: function(oEvent) {
			var sPath = oEvent.getSource().getBindingContext().sPath;
			var oModel = oEvent.getSource().getModel();
			var oIntent = oModel.getProperty(sPath);
			this._createManifstSpecificSkeleton(["sap.app", "crossNavigation", "inbounds", oIntent.key, "indicatorDataSource", "dataSource"], "",
				oEvent.getParameter(
					"newValue"));
			this.fireEvent("manifestChanged");
		},

		onIntentPathChange: function(oEvent) {
			var sPath = oEvent.getSource().getBindingContext().sPath;
			var oModel = oEvent.getSource().getModel();
			var oIntent = oModel.getProperty(sPath);
			this._createManifstSpecificSkeleton(["sap.app", "crossNavigation", "inbounds", oIntent.key, "indicatorDataSource", "path"], "",
				oEvent.getParameter("newValue"));
			this.fireEvent("manifestChanged");
		},

		onIntentRefreshIntervalChange: function(oEvent) {
			var oTextField = oEvent.getSource();
			var interval;
			if (isNaN(oEvent.getParameter("newValue")) && oEvent.getParameter("newValue").length >= 1) {
				oTextField.setValueState(sap.ui.core.ValueState.Error);
			} else if (!(isNaN(oEvent.getParameter("newValue"))) && oEvent.getParameter("newValue").length > -1) {
				if (oEvent.getParameter("newValue").length > 0) {
					interval = parseInt(oEvent.getParameter("newValue"));
				}
				oTextField.setValueState(sap.ui.core.ValueState.None);
				var sPath = oEvent.getSource().getBindingContext().sPath;
				var oModel = oEvent.getSource().getModel();
				var oIntent = oModel.getProperty(sPath);
				this._createManifstSpecificSkeleton(["sap.app", "crossNavigation", "inbounds", oIntent.key, "indicatorDataSource", "refresh"], "",
					interval);
				this.fireEvent("manifestChanged");
			}
		},

		onIntentAdditionalParamsChange: function(oEvent) {
			var sPath = oEvent.getSource().getBindingContext().sPath;
			var oModel = oEvent.getSource().getModel();
			var oIntent = oModel.getProperty(sPath);
			this._createManifstSpecificSkeleton(["sap.app", "crossNavigation", "inbounds", oIntent.key, "signature", "additionalParameters"], "",
				oEvent.getParameter(
					"newValue"));
			this.fireEvent("manifestChanged");
		},

		onIntentChange: function(oEvent) {
			var oIntentTableParam = this.byId("appDescriptorIntentTableParams");
			var oModel = oEvent.getSource().getModel();
			var oIntentTable = oEvent.getSource();
			var iIndex = oEvent.getParameter("rowIndex");
			var oTileDetailsForm = this.byId("tileDetails");
			var oBindingContext, bIntentDetailsEnabled = false;
			if (oIntentTable.isIndexSelected(iIndex)) { // row can be selected or de-selected
				oBindingContext = oEvent.getParameter("rowContext");
				bIntentDetailsEnabled = true;
			}
			oTileDetailsForm.setBindingContext(oBindingContext);
			if (oBindingContext && oBindingContext.sPath) {
				var aParameters = oModel.getProperty(oBindingContext.sPath);
				if (aParameters && aParameters.signature.parameters && aParameters.signature.parameters.length > 0) {
					oIntentTableParam.setSelectedIndex(0);
				}
			}

			this.getView().getModel("AppDescriptorUI").setProperty("/navigationTab/intentDetailsEnabled", bIntentDetailsEnabled);
		}
	});
});