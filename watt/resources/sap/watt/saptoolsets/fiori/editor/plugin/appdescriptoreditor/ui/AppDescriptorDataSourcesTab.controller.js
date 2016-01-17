sap.ui.define([
	"./AppDescriptorEditorBase.controller",
	"sap/ui/model/Filter"
], function(BaseController, Filter) {
	"use strict";

	return BaseController.extend("sap.watt.saptoolsets.fiori.editor.plugin.appdescriptoreditor.ui.AppDescriptorDataSourcesTab", {
		aAnnotationFilter: [],

		onInit: function() {
			this._oContext = this.getView().getViewData().oContext;
			this._oUtilities = this.getView().getViewData().oUtil;
			this._ = require("sap/watt/lib/lodash/lodash"); //Already uploaded in the service
			var oList = this.getView().byId("odataServicesList");
			var oBeforeRender = {
				onBeforeRendering: function() {
					oList.removeEventDelegate(oBeforeRender);
					var oBinding = oList.getBinding("items");
					var aFilter = [];
					aFilter.push(new Filter({
						path: "item",
						test: function(oValue) {
							return oValue[Object.keys(oValue)[0]].type === "OData";
						}
					}));
					oBinding.filter(aFilter);
				}
			};
			oList.addEventDelegate(oBeforeRender);

		},

		/**
		 * =============================
		 * Data Sources tab methods
		 * =============================
		 */

		formatDataSourcesServicesText: function(oItem) {
			if (oItem) {
				return Object.keys(oItem)[0];
			}
		},

		formatDataSourcesServicesUri: function(oItem) {
			if (oItem) {
				return oItem[Object.keys(oItem)[0]].uri;
			}
		},

		formatDataSourcesServicesLocalUri: function(oItem) {
			if (oItem) {
				return oItem[Object.keys(oItem)[0]].settings.localUri;
			}
		},

		onDataSourcesChange: function(oEvent) {
			var oModel = oEvent.getSource().getModel();
			var oModelUI = oEvent.getSource().getModel("AppDescriptorUI");

			if (oEvent.getParameter("action") === "add") {
				oModel.setProperty("/sap.app/properties/dataSources/bOdataServiceSelected", true);
				oModelUI.setProperty("/sDataSourcesSelectedKey", Object.keys(oEvent.getParameter("item").item)[0]);
			}
			if (oEvent.getParameter("action") === "remove") {
				oModel.setProperty("/sap.app/properties/dataSources/aAnnotValues", []);
			}
			this._createManifstSpecificSkeleton(["sap.app", "dataSources"]);
			this._updateManifestSchemaFromAddRemoveListBox(["sap.app", "dataSources"], oEvent, undefined, ["sap.app"], ["dataSources"]);
			//raise event to update the document
			this.fireEvent("manifestChanged");
		},

		onDataSourcesSelect: function(oEvent) {
			var oModel = oEvent.getSource().getModel();
			var oParams = oEvent.getParameters();
			var bDataServiceDeatilsEnabled = false;
			var oBindCntx;
			var aAnnotValues = [];
			var oDataServiceDetailsForm = this.byId("odataServicesDetails");
			var oParameters = oParams.getParameters();
			if (oParameters.selectedItem) {
				bDataServiceDeatilsEnabled = true;
				oBindCntx = oParameters.selectedItem.getBindingContext();
				oDataServiceDetailsForm.setBindingContext(oBindCntx);
				var sODataPath = oBindCntx.getPath();
				var aAnnotations = oModel.getProperty(sODataPath + "/item/" + oParameters.selectedItem.getKey() + "/settings/annotations");
				if (aAnnotations && aAnnotations.length > 0) {
					sODataPath = sODataPath.substr(0, sODataPath.lastIndexOf("/") + 1);
					var aDataServices = oModel.getProperty(sODataPath);
					for (var j = 0; j < aAnnotations.length; j++) {
						for (var i = 0; i < aDataServices.length; i++) {
							if (aDataServices[i].name === aAnnotations[j]) {
								aAnnotValues.push(aDataServices[i]);
								break;
							}
						}
					}
				} else { //if no annotations exist we will clear the aAnnotValues
					aAnnotValues = [];
				}
				oModel.setProperty("/sap.app/properties/dataSources/aAnnotValues", aAnnotValues);
				oModel.setProperty("/sap.app/properties/dataSources/sDataSourcesSelectedKey", oParameters.selectedItem.getKey());
			} else {
				//no item was selected/item was deleted -> removes item from the list and it's binding
				if (oEvent.getParameters() && oEvent.getParameters().getParameter("action") === "remove" && oDataServiceDetailsForm && oDataServiceDetailsForm.getBindingContext()) {
					oDataServiceDetailsForm.setBindingContext(null);
				}
			}
			oModel.setProperty("/sap.app/properties/dataSources/bOdataServiceSelected", bDataServiceDeatilsEnabled);
		},

		onDataSourcesURIChange: function(oEvent) {
			var sPath = oEvent.getSource().getBindingContext().sPath;
			var oModel = oEvent.getSource().getModel();
			var oOdataServices = oModel.getProperty(sPath);
			var sNewUriValue = oEvent.getParameter("newValue");
			oOdataServices.item[Object.keys(oOdataServices.item)[0]].uri = sNewUriValue;
			this._createManifstSpecificSkeleton(["sap.app", "dataSources", Object.keys(oOdataServices.item)[0], "uri"], "", sNewUriValue);
			//raise event to update the document
			this.fireEvent("manifestChanged");
		},

		onDataSourcesLocalURIChange: function(oEvent) {
			var sPath = oEvent.getSource().getBindingContext().sPath;
			var oModel = oEvent.getSource().getModel();
			var oOdataServices = oModel.getProperty(sPath);
			var sNewUriValue = oEvent.getParameter("newValue");
			oOdataServices.item[Object.keys(oOdataServices.item)[0]].settings.localUri = sNewUriValue;
			this._createManifstSpecificSkeleton(["sap.app", "dataSources", Object.keys(oOdataServices.item)[0], "settings", "localUri"], "",
			sNewUriValue);
			//raise event to update the document
			this.fireEvent("manifestChanged");
		},

		onDataSourcesODataVersionChange: function(oEvent) {
			var sPath = oEvent.getSource().getBindingContext().sPath;
			var oModel = oEvent.getSource().getModel();
			var oOdataServices = oModel.getProperty(sPath);
			var sNewUriValue = oEvent.getParameter("newValue");
			oOdataServices.item[Object.keys(oOdataServices.item)[0]].settings.odataVersion = sNewUriValue;
			this._createManifstSpecificSkeleton(["sap.app", "dataSources", Object.keys(oOdataServices.item)[0], "settings", "odataVersion"], "",
				sNewUriValue);
			//raise event to update the document
			this.fireEvent("manifestChanged");
		},

		onAnnotNameChange: function(oEvent) {
			var sSelectedAnnotPath = oEvent.getSource().getBindingContext().sPath;
			var oModel = oEvent.getSource().getModel();
			var oSelectedAnnot = oModel.getProperty(sSelectedAnnotPath);
			var sOldName = Object.keys(oSelectedAnnot.item)[0];
			//update the Model- array of oData annotations inside the oData
			var oDataServiceDetailsForm = this.byId("odataServicesDetails");
			var oBindCntx = oDataServiceDetailsForm.getBindingContext();
			var sODataPath = oBindCntx.getPath();
			var aODataSelected = oModel.getProperty(sODataPath);
			var aODataAnnotList = oModel.getProperty(sODataPath + "/item/" + Object.keys(aODataSelected.item)[0] + "/settings/annotations");
			if (aODataAnnotList && aODataAnnotList.length > 0) {
				var index = aODataAnnotList.indexOf(Object.keys(oSelectedAnnot.item)[0]);
				if (index > -1) {
					aODataAnnotList[index] = oSelectedAnnot.name;
				}
				oModel.setProperty(sODataPath + "/item/" + Object.keys(aODataSelected.item)[0] + "/settings/annotations", aODataAnnotList);
			}
			//update the Model- the oSelectedAnnot - inside item
			var oItem = {};
			oItem[oSelectedAnnot.name] = oSelectedAnnot.item[Object.keys(oSelectedAnnot.item)[0]];
			oModel.setProperty(sSelectedAnnotPath + "/item", oItem);

			//update the manifest
			var oManifestModel = this.getView().getModel("manifest");
			var aAnnot = oManifestModel.getProperty("/sap.app/dataSources/" + sOldName);
			this._deleteEntryFromManifest(["sap.app", "dataSources"], sOldName);
			this._createManifstSpecificSkeleton(["sap.app", "dataSources", oSelectedAnnot.name], "", aAnnot);

			//update the manifest- array of oData annotations inside the oData
			var aDataSelectedAnnotInManifest = oManifestModel.getProperty("/sap.app/dataSources/" + Object.keys(aODataSelected.item)[0] +
				"/settings/annotations");
			if (aDataSelectedAnnotInManifest && aDataSelectedAnnotInManifest.length > 0) {
				index = aDataSelectedAnnotInManifest.indexOf(sOldName);
				if (index > -1) {
					aDataSelectedAnnotInManifest[index] = oSelectedAnnot.name;
				}
			}
			//raise event to update the document
			this.fireEvent("manifestChanged");
		},

		onAnnotUriChange: function(oEvent) {
			var sPath = oEvent.getSource().getBindingContext().sPath;
			var oModel = oEvent.getSource().getModel();
			var oOdataServices = oModel.getProperty(sPath);
			//update the manifest
			this._createManifstSpecificSkeleton(["sap.app", "dataSources", oOdataServices.name, "uri"], "", oEvent.getParameter("newValue"));
			//raise event to update the document
			this.fireEvent("manifestChanged");
		},

		onAnnotLocalUriChange: function(oEvent) {
			var sPath = oEvent.getSource().getBindingContext().sPath;
			var oModel = oEvent.getSource().getModel();
			var oOdataServices = oModel.getProperty(sPath);
			this._createManifstSpecificSkeleton(["sap.app", "dataSources", oOdataServices.name, "settings", "localUri"], "", oEvent.getParameter(
				"newValue"));
			//raise event to update the document
			this.fireEvent("manifestChanged");
		},

		onRemoveAnnotPress: function(oEvent) {
			var oModel = oEvent.getSource().getModel();
			var oDataServiceDetailsAnnotGrid = this.byId("appDescriptor-dataSource-annotationContainer");

			//remove from the Model- array of oData annotations
			var oBindAnnot = oEvent.getSource().getBindingContext();
			var sAnPath = oBindAnnot.getPath();
			var sAnnoName = oModel.getProperty(sAnPath + "/name");
			var oDataServiceDetailsForm = this.byId("odataServicesDetails");
			var oBindCntx = oDataServiceDetailsForm.getBindingContext();
			var sODataPath = oBindCntx.getPath();

			var sODataAllPath = sODataPath.substr(0, sODataPath.lastIndexOf("/") + 1);
			var aDataServices = oModel.getProperty(sODataAllPath);

			for (var i = 0; i < aDataServices.length; i++) {
				if (aDataServices[i].type === "ODataAnnotation" && aDataServices[i].name === sAnnoName) {
					aDataServices.splice(i, 1);
				}
			}
			oModel.setProperty(sODataAllPath, aDataServices);

			var aODataSelected = oModel.getProperty(sODataPath);
			var aODataAnnot = oModel.getProperty(sODataPath + "/item/" + Object.keys(aODataSelected.item)[0] + "/settings/annotations");
			if (aODataAnnot && aODataAnnot.length > 0) {
				var index = aODataAnnot.indexOf(sAnnoName);
				if (index > -1) {
					aODataAnnot.splice(index, 1);
				}
				oModel.setProperty(sODataPath + "/item/" + Object.keys(aODataSelected.item)[0] + "/settings/annotations", aODataAnnot);
			}
			//remove from the Model- selected object of oDataAnnotations
			var oBinding = oDataServiceDetailsAnnotGrid.getBinding("content");
			var sAnnotPath = oBinding.getPath();
			var aAnnotations = oModel.getProperty(sAnnotPath);
			aAnnotations = aAnnotations.filter(function(element) {
				return element.name !== sAnnoName;
			});
			oModel.setProperty(sAnnotPath, aAnnotations);

			//update the manifest
			var oOdataServices = oModel.getProperty(sODataPath);
			this._deleteEntryFromManifest(["sap.app", "dataSources"], sAnnoName);
			this._createManifstSpecificSkeleton(["sap.app", "dataSources", Object.keys(oOdataServices.item)[0], "settings", "annotations"], "",
				aODataAnnot);
			this.fireEvent("manifestChanged");
		},

		onAddAnnotPress: function(oEvent) {
			var sKey = this._getNextAvailableFieldValue(["sap.app", "dataSources"], "ODataAnnotation");

			var oModel = oEvent.getSource().getModel();
			var oDataServiceDetailsAnnotGrid = this.byId("appDescriptor-dataSource-annotationContainer");
			//add to the Model- array of oData annotations
			var oDataServiceDetailsForm = this.byId("odataServicesDetails");
			var oBindCntx = oDataServiceDetailsForm.getBindingContext();
			var sODataPath = oBindCntx.getPath();

			//add to the Model- new object of oDataAnnotations
			var sODataAllPath = sODataPath.substr(0, sODataPath.lastIndexOf("/") + 1);
			var aDataServices = oModel.getProperty(sODataAllPath);
			var aODataSelected = oModel.getProperty(sODataPath);

			var aODataAnnot = oModel.getProperty(sODataPath + "/item/" + Object.keys(aODataSelected.item)[0] + "/settings/annotations");
			if (!aODataAnnot) {
				aODataAnnot = [];
			}
			aODataAnnot.push(sKey);
			oModel.setProperty(sODataPath + "/item/" + Object.keys(aODataSelected.item)[0] + "/settings/annotations", aODataAnnot);

			//recreate aAnnotValues
			var oBinding = oDataServiceDetailsAnnotGrid.getBinding("content");
			var sAnnotPath = oBinding.getPath();
			var aAnnotValues = oModel.getProperty(sAnnotPath);
			var oItem = {};
			oItem[sKey] = {
				uri: "",
				type: "ODataAnnotation",
				settings: {
					"localUri": ""
				}
			};
			aDataServices.push({
				item: oItem,
				name: sKey,
				uri: "",
				type: "ODataAnnotation",
				settings: {
					"localUri": ""
				}
			});
			aAnnotValues.push({
				item: oItem,
				name: sKey,
				uri: "",
				type: "ODataAnnotation",
				settings: {
					"localUri": ""
				}
			});
			oModel.setProperty(sAnnotPath, aAnnotValues);
			oModel.setProperty(sODataAllPath, aDataServices);

			//update the manifest
			var oManifestAnnot = {
				uri: "",
				type: "ODataAnnotation",
				settings: {
					"localUri": ""
				}
			};

			this._createManifstSpecificSkeleton(["sap.app", "dataSources", Object.keys(aODataSelected.item)[0], "settings", "annotations"], "",
				aODataAnnot);
			this._createManifstSpecificSkeleton(["sap.app", "dataSources", sKey], "", oManifestAnnot);
			this.fireEvent("manifestChanged");
		},

		onMoveAnnotUpPress: function(oEvent) {
			var oModel = oEvent.getSource().getModel();
			//remove from the Model- array of oData annotations
			var oBindAnnot = oEvent.getSource().getBindingContext();
			var sAnPath = oBindAnnot.getPath();
			var sAnnoName = oModel.getProperty(sAnPath + "/name");
			//oData
			var oDataServiceDetailsForm = this.byId("odataServicesDetails");
			var oBindCntx = oDataServiceDetailsForm.getBindingContext();
			var sODataSelectedPath = oBindCntx.getPath();
			var aODataSelected = oModel.getProperty(sODataSelectedPath);

			var aODataAnnot = oModel.getProperty(sODataSelectedPath + "/item/" + Object.keys(aODataSelected.item)[0] + "/settings/annotations");

			//var aODataAnnot = oModel.getProperty(sODataSelectedPath + "/settings/annotations");
			var aAnnotValues = [];
			var sODataAllPath = sODataSelectedPath.substr(0, sODataSelectedPath.lastIndexOf("/") + 1);
			var aDataServices = oModel.getProperty(sODataAllPath);

			if (aODataAnnot && aODataAnnot.length > 0) {
				var index = aODataAnnot.indexOf(sAnnoName);
				if (index > 0) {
					var temp = aODataAnnot[index - 1];
					var temp2 = aODataAnnot[index];
					aODataAnnot[index] = temp;
					aODataAnnot[index - 1] = temp2;
					oModel.setProperty(sODataSelectedPath + "/item/" + Object.keys(aODataSelected.item)[0] + "/settings/annotations", aODataAnnot);
					if (aODataSelected && aODataSelected.settings) {
						oModel.setProperty(sODataSelectedPath + "/settings/annotations", aODataAnnot);
					}

					for (var j = 0; j < aODataAnnot.length; j++) {
						for (var i = 0; i < aDataServices.length; i++) {
							if (aDataServices[i].type === "ODataAnnotation" && aDataServices[i].name === aODataAnnot[j]) {
								aAnnotValues.push(aDataServices[i]);
							}
						}
					}
					oModel.setProperty("/sap.app/properties/dataSources/aAnnotValues", aAnnotValues);

					//update the manifest- array of oData annotations inside the oData
					this._createManifstSpecificSkeleton(["sap.app", "dataSources", Object.keys(aODataSelected.item)[0], "settings", "annotations"], "",
						aODataAnnot);

					//raise event to update the document
					this.fireEvent("manifestChanged");

				}

			}

		},

		onMoveAnnotDownPress: function(oEvent) {
			var oModel = oEvent.getSource().getModel();
			//remove from the Model- array of oData annotations
			var oBindAnnot = oEvent.getSource().getBindingContext();
			var sAnPath = oBindAnnot.getPath();
			var sAnnoName = oModel.getProperty(sAnPath + "/name");
			//oData
			var oDataServiceDetailsForm = this.byId("odataServicesDetails");
			var oBindCntx = oDataServiceDetailsForm.getBindingContext();
			var sODataSelectedPath = oBindCntx.getPath();
			var aODataSelected = oModel.getProperty(sODataSelectedPath);
			var aODataAnnot = oModel.getProperty(sODataSelectedPath + "/item/" + Object.keys(aODataSelected.item)[0] + "/settings/annotations");
			//var aODataAnnot = oModel.getProperty(sODataSelectedPath + "/settings/annotations");
			if (aODataAnnot && aODataAnnot.length > 0) {
				var index = aODataAnnot.indexOf(sAnnoName);
				if (index < aODataAnnot.length - 1) {
					var temp = aODataAnnot[index + 1];
					var temp2 = aODataAnnot[index];
					aODataAnnot[index] = temp;
					aODataAnnot[index + 1] = temp2;
					oModel.setProperty(sODataSelectedPath + "/item/" + Object.keys(aODataSelected.item)[0] + "/settings/annotations", aODataAnnot);
					if (aODataSelected && aODataSelected.settings) {
						oModel.setProperty(sODataSelectedPath + "/settings/annotations", aODataAnnot);
					}

					var aAnnotValues = [];
					var sODataAllPath = sODataSelectedPath.substr(0, sODataSelectedPath.lastIndexOf("/") + 1);
					var aDataServices = oModel.getProperty(sODataAllPath);
					for (var j = 0; j < aODataAnnot.length; j++) {
						for (var i = 0; i < aDataServices.length; i++) {
							if (aDataServices[i].type === "ODataAnnotation" && aDataServices[i].name === aODataAnnot[j]) {
								aAnnotValues.push(aDataServices[i]);
							}
						}
					}
					oModel.setProperty("/sap.app/properties/dataSources/aAnnotValues", aAnnotValues);

					//update the manifest- array of oData annotations inside the oData
					this._createManifstSpecificSkeleton(["sap.app", "dataSources", Object.keys(aODataSelected.item)[0], "settings", "annotations"], "",
						aODataAnnot);

					//raise event to update the document
					this.fireEvent("manifestChanged");
				}

			}

		}

	});
});