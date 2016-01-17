sap.ui.define([
	"./AppDescriptorEditorBase.controller"
], function(Controller) {
	"use strict";

	return Controller.extend("sap.watt.saptoolsets.fiori.editor.plugin.appdescriptoreditor.ui.AppDescriptorEditor", {

		onInit: function() {
			var oMainModel;
			var oUiModel;
			var oManifestModel;
			this._ = require("sap/watt/lib/lodash/lodash"); //Already uploaded in the service
			this._oUtilities = this.getView().getViewData().oUtil;
			this._oContext = this.getView().getViewData().oContext;
			this._aExtensionFilters = this.getView().getViewData().aExtentionFilters;
			if (!this._oAppDescriptorEditorSettingsTabView) {
				oMainModel = new sap.ui.model.json.JSONModel();
				oUiModel = new sap.ui.model.json.JSONModel();
				oManifestModel = new sap.ui.model.json.JSONModel();
				this.getView().setModel(oMainModel);
				this.getView().setModel(oUiModel, "AppDescriptorUI");
				this.getView().setModel(oManifestModel, "manifest");
				this._oAppDescriptorEditorSettingsTabView = sap.ui.view({
					viewName: "sap.watt.saptoolsets.fiori.editor.plugin.appdescriptoreditor.ui.AppDescriptorSettingsTab",
					type: sap.ui.core.mvc.ViewType.XML,
					viewData: {
						oContext: this._oContext,
						oUtil: this._oUtilities,
						aExtentionFilters: this._aExtensionFilters
					}
				});

				this._oAppDescriptorEditorSettingsTabView.getController().attachEvent("manifestChanged", this._onManifestChanged, this);
			}
			if (!this._oAppDescriptorEditorNavigationTabView) {
				this._oAppDescriptorEditorNavigationTabView = sap.ui.view({
					viewName: "sap.watt.saptoolsets.fiori.editor.plugin.appdescriptoreditor.ui.AppDescriptorNavigationTab",
					type: sap.ui.core.mvc.ViewType.XML,
					viewData: {
						oContext: this._oContext,
						oUtil: this._oUtilities
					}
				});
				this._oAppDescriptorEditorNavigationTabView.getController().attachEvent("manifestChanged", this._onManifestChanged, this);
			}
			if (!this._oAppDescriptorEditorRoutingTabView) {
				this._oAppDescriptorEditorRoutingTabView = sap.ui.view({
					viewName: "sap.watt.saptoolsets.fiori.editor.plugin.appdescriptoreditor.ui.AppDescriptorRoutingTab",
					type: sap.ui.core.mvc.ViewType.XML,
					viewData: {
						oContext: this._oContext,
						oUtil: this._oUtilities
					}
				});
				this._oAppDescriptorEditorRoutingTabView.getController().attachEvent("manifestChanged", this._onManifestChanged, this);
			}
			if (!this._oAppDescriptorEditorDataSourcesTabView) {	
				this._oAppDescriptorEditorDataSourcesTabView = sap.ui.view({
					viewName: "sap.watt.saptoolsets.fiori.editor.plugin.appdescriptoreditor.ui.AppDescriptorDataSourcesTab",
					type: sap.ui.core.mvc.ViewType.XML,
					viewData: {
						oContext: this._oContext,
						oUtil: this._oUtilities
					}
				});
				this._oAppDescriptorEditorDataSourcesTabView.getController().attachEvent("manifestChanged", this._onManifestChanged, this);
			}

			var oTabStrip = this.byId("appDescriptorTabStrip");
			oTabStrip.getTabs()[0].addContent(this._oAppDescriptorEditorSettingsTabView);
			oTabStrip.getTabs()[1].addContent(this._oAppDescriptorEditorDataSourcesTabView);
			oTabStrip.getTabs()[2].addContent(this._oAppDescriptorEditorRoutingTabView);
			oTabStrip.getTabs()[3].addContent(this._oAppDescriptorEditorNavigationTabView);
		},

		_onManifestChanged: function() {
			this.fireEvent("manifestChanged");
		},

		setParsingErrorPage: function(bError) {
			this.getView().getModel("AppDescriptorUI").setProperty("/bTabGridVisible", !bError);
		},

		setManifestAndSchema: function(oSchema, oManifest, oDocument) {
			this._oManifest = oManifest;
			this._oSchema = oSchema;
			this._oDocument = oDocument;
			var oSchemaModel;
			var bSapAppVersion1_1_0 = (oManifest["sap.app"] && oManifest["sap.app"]._version === "1.1.0");
			if (bSapAppVersion1_1_0) {
				console.log(this._oContext.i18n.getText("AppDescriptor_navigation_schema"));
			}
			this.getView().getModel("AppDescriptorUI").setProperty("/bSapAppVersion1_1_0", bSapAppVersion1_1_0);
			//Init all the fields in the model from manifest.json document
			oSchemaModel = this._updateDataModelFromManifest(oSchema, oManifest);
			this.getView().getModel().setData(oSchemaModel);
			this.getView().getModel("AppDescriptorUI").setProperty("/oSchema", oSchema);
			this.getView().getModel("AppDescriptorUI").setProperty("/oDocument", oDocument);

			this._InitManifestModel(oManifest);
		},

		_InitManifestModel: function(oManifest) {
			var oManifestModel = this.getView().getModel("manifest");
			if (!this._oManifestBinding) {
				this._oManifestBinding = new sap.ui.model.PropertyBinding(oManifestModel, "", oManifestModel.getContext("/"));
			}

			// Unregister model change listener to avoid event raising on setData
			this._oManifestBinding.detachChange(this._onManifestChanged, this);

			// Update model with manifest content
			oManifestModel.setData(oManifest);

			// Register model change listener 
			this._oManifestBinding.attachChange(this._onManifestChanged, this);
		},

		//Update the relevant dummy field in the schema from the data in the manifest json file
		_updateDataModelFromManifest: function(oFlatSchema, oManifestContent) {

			var oSchema = this._updateSchemaForUI5Model(oFlatSchema);

			//Set metadata for tags dialog
			oSchema["sap.app"].properties.tags.properties.oDialogMetadata = {
				comboBoxLabel: this._oContext.i18n.getText("AppDescriptor_Tag_Type"),
				visible: false,
				types: [{
					techType: "keywords",
					type: this._oContext.i18n.getText("AppDescriptor_Tags_Keywords"),
					fields: [{
						name: this._oContext.i18n.getText("AppDescriptor_Tags_Keywords"),
						placeholder: this._oContext.i18n.getText("AppDescriptor_Tags_Keywords_Placeholder"),
						tech: "text",
						required: true,
						labelVisible: true,
						visible: true,
						value: "",
						pattern: oSchema["sap.app"].properties.tags.properties.keywords.items.pattern,
						valueState: sap.ui.core.ValueState.None
					}]
				}]
			};
			
			//Set metadata for data sources dialog
			oSchema["sap.app"].properties.dataSources.oDialogMetadata = {
				comboBoxLabel: "Data Sources",
				visible: false,
				types: [{
					techType: "dataSources",
					type: "dataSources",
					isHierarchy: true, //Pattetern proerty
					fields: [{
						name: this._oContext.i18n.getText("AppDescriptor_DataSources_service_name"),
						placeholder: "",
						tech: "", //This is the name of the property that _updateManifestSchemaFromAddRemoveListBox will update in the manifest.json
						required: true,
						labelVisible: true,
						visible: true,
						value: "",
						pattern: Object.keys(oSchema["sap.app"].properties.dataSources.patternProperties)[0],
						valueState: sap.ui.core.ValueState.None
					},
					{
						name: this._oContext.i18n.getText("AppDescriptor_DataSources_service_uri"),
						placeholder: "",
						tech: "uri", //This is the name of the property that _updateManifestSchemaFromAddRemoveListBox will update in the manifest.json
						required: true,
						labelVisible: true,
						visible: true,
						value: "",
						pattern: "",
						valueState: sap.ui.core.ValueState.None
					},
					{
						name: "type",
						placeholder: "",
						tech: "type", //This is the name of the property that _updateManifestSchemaFromAddRemoveListBox will update in the manifest.json
						required: false,
						labelVisible: false,
						visible: false,
						value: "OData",
						defaultValue:"OData",  //when cleaning the metadata what will be the default value
						pattern: "",
						valueState: sap.ui.core.ValueState.None
					},
					{
						name: "settings",
						placeholder: "",
						tech: "settings", //This is the name of the property that _updateManifestSchemaFromAddRemoveListBox will update in the manifest.json
						required: false,
						labelVisible: false,
						visible: false,
						value: {},
						defaultValue: {},
						pattern: "",
						valueState: sap.ui.core.ValueState.None
					},
					{
						name: "annotations",
						placeholder: "",
						tech: "annotations", //This is the name of the property that _updateManifestSchemaFromAddRemoveListBox will update in the manifest.json
						required: false,
						labelVisible: false,
						visible: false,
						value: [],
						defaultValue: [],
						parentTech: "settings",
						pattern: "",
						valueState: sap.ui.core.ValueState.None
					},
					{
						name: "odataVersion",
						placeholder: "",
						tech: "odataVersion", //This is the name of the property that _updateManifestSchemaFromAddRemoveListBox will update in the manifest.json
						required: false,
						labelVisible: false,
						visible: false,
						value: "2.0",
						defaultValue: "2.0",
						parentTech: "settings",
						pattern: "",
						valueState: sap.ui.core.ValueState.None
					},
					{
						name: "localUri",
						placeholder: "",
						tech: "localUri", //This is the name of the property that _updateManifestSchemaFromAddRemoveListBox will update in the manifest.json
						required: false,
						labelVisible: false,
						visible: false,
						value: "",
						parentTech: "settings",
						pattern: "",
						valueState: sap.ui.core.ValueState.None
					}]
				}]
			};

			if (oSchema["sap.app"] && oManifestContent["sap.app"]) {
				//Add validation according to schema

				//Add defualt value for sap app sub schema fields
				oSchema["sap.app"].properties.id.sValue = this._.isEmpty(oManifestContent["sap.app"].id) ? "" : oManifestContent["sap.app"].id;
				oSchema["sap.app"].properties.type.sSelectedKey = this._.isEmpty(oManifestContent["sap.app"].type) ? "" : oManifestContent["sap.app"]
					.type;
				oSchema["sap.app"].properties.title.sValue = this._.isEmpty(oManifestContent["sap.app"].title) ? "" : oManifestContent["sap.app"].title;
				oSchema["sap.app"].properties.description.sValue = this._.isEmpty(oManifestContent["sap.app"].description) ? "" : oManifestContent[
					"sap.app"].description;
				oSchema["sap.app"].properties.i18n.sValue = this._.isEmpty(oManifestContent["sap.app"].i18n) ? oSchema["sap.app"].properties.i18n.default :
					oManifestContent["sap.app"].i18n;

				//source template
				if (oManifestContent["sap.app"].sourceTemplate) {
					oSchema["sap.app"].properties.sourceTemplate.properties.id.sValue = this._.isEmpty(oManifestContent["sap.app"].sourceTemplate.id) ?
						"" : oManifestContent["sap.app"].sourceTemplate.id;
					oSchema["sap.app"].properties.sourceTemplate.properties.version.sValue = this._.isEmpty(oManifestContent["sap.app"].sourceTemplate.version) ?
						"" : oManifestContent["sap.app"].sourceTemplate.version;
				} else {
					oSchema["sap.app"].properties.sourceTemplate.properties.id.sValue = "";
					oSchema["sap.app"].properties.sourceTemplate.properties.version.sValue = "";
				}

				//application version
				if (oManifestContent["sap.app"].applicationVersion && oManifestContent["sap.app"].applicationVersion.version) {
					oSchema["sap.app"].properties.applicationVersion.properties.version.sValue = this._.isEmpty(oManifestContent["sap.app"].applicationVersion
						.version) ?
						"" : oManifestContent["sap.app"].applicationVersion.version;
				} else {
					oSchema["sap.app"].properties.applicationVersion.properties.version.sValue = "";
				}

				//ach
				oSchema["sap.app"].properties.ach.sValue = this._.isEmpty(oManifestContent["sap.app"].ach) ? "" : oManifestContent["sap.app"].ach;

				//Set default value for keywords
				if (oManifestContent["sap.app"].tags) {
					oSchema["sap.app"].properties.tags.properties.keywords.aValues = this._.isEmpty(oManifestContent["sap.app"].tags.keywords) ? [] :
						this._.cloneDeep(
							this._oUtilities._convertObjectItemToMap(this._oUtilities._convertEnumToMap(oManifestContent["sap.app"].tags.keywords),
								"keywords")
					);
				} else {
					oSchema["sap.app"].properties.tags.properties.keywords.aValues = [];
				}

				if (!this._bSchemaVersion_1_1_0 && oManifestContent["sap.app"].crossNavigation) {
					oSchema["sap.app"].properties.crossNavigation.properties.inbounds.aTiles = this._.isEmpty(oManifestContent["sap.app"].crossNavigation
						.inbounds) ? [] :
						this._.cloneDeep(this._oUtilities._convertFromManifestObjectCrossNavigationToArray(oManifestContent["sap.app"].crossNavigation.inbounds));
					for (var i = 0; i < oSchema["sap.app"].properties.crossNavigation.properties.inbounds.aTiles.length; i++) {
						if (!oSchema["sap.app"].properties.crossNavigation.properties.inbounds.aTiles[i].indicatorDataSource) {
							oSchema["sap.app"].properties.crossNavigation.properties.inbounds.aTiles[i].indicatorDataSource = {};
						}
					}
				}
				
				if (oManifestContent["sap.app"].dataSources) {
					//FIXME conversion of nested type is incorrect
					oSchema["sap.app"].properties.dataSources.aValues = this._.isEmpty(oManifestContent["sap.app"].dataSources) ? [] :
							this._oUtilities._converMapToItemArray(this._.cloneDeep(oManifestContent["sap.app"].dataSources), "odataServices");
					oSchema["sap.app"].properties.dataSources.bOdataServiceSelected = false;
					oSchema["sap.app"].properties.dataSources.aAnnotValues = []; 
				} else {
					oSchema["sap.app"].properties.dataSources.aValues = [];
				}
			}

			oSchema["sap.ui"].properties.supportedThemes.oDialogMetadata = {
				comboBoxLabel: this._oContext.i18n.getText("AppDescriptor_Supported_Themes_type"),
				visible: false,
				types: [{
					techType: "supportedThemes",
					type: this._oContext.i18n.getText("AppDescriptor_Supported_Themes"),
					fields: [{
						name: this._oContext.i18n.getText("AppDescriptor_Supported_Theme"),
						tech: "text",
						required: true,
						placeholder: this._oContext.i18n.getText("AppDescriptor_Supported_Theme_Placeholder"),
						labelVisible: true,
						visible: true,
						value: "",
						valueState: sap.ui.core.ValueState.None
					}]
				}]
			};

			//Set defaults for sap ui fields
			if (oSchema["sap.ui"] && oManifestContent["sap.ui"]) {
				oSchema["sap.ui"].properties.technology.sSelectedKey = this._.isEmpty(oManifestContent["sap.ui"].technology) ? oSchema["sap.ui"].properties
					.technology.default : oManifestContent["sap.ui"].technology;
				if (oManifestContent["sap.ui"].icons) {
					oSchema["sap.ui"].properties.icons.properties.icon.sValue = this._.isEmpty(oManifestContent["sap.ui"].icons.icon) ? "" :
						oManifestContent["sap.ui"].icons.icon;
					oSchema["sap.ui"].properties.icons.properties.favIcon.sValue = this._.isEmpty(oManifestContent["sap.ui"].icons.favIcon) ? "" :
						oManifestContent["sap.ui"].icons.favIcon;
					oSchema["sap.ui"].properties.icons.properties.phone.sValue = this._.isEmpty(oManifestContent["sap.ui"].icons.phone) ? "" :
						oManifestContent["sap.ui"].icons.phone;
					oSchema["sap.ui"].properties.icons.properties["phone@2"].sValue = this._.isEmpty(oManifestContent["sap.ui"].icons["phone@2"]) ? "" :
						oManifestContent["sap.ui"].icons["phone@2"];
					oSchema["sap.ui"].properties.icons.properties.tablet.sValue = this._.isEmpty(oManifestContent["sap.ui"].icons.tablet) ? "" :
						oManifestContent["sap.ui"].icons.tablet;
					oSchema["sap.ui"].properties.icons.properties["tablet@2"].sValue = this._.isEmpty(oManifestContent["sap.ui"].icons["tablet@2"]) ?
						"" :
						oManifestContent["sap.ui"].icons["tablet@2"];
				} else {
					oSchema["sap.ui"].properties.icons.properties.icon.sValue = "";
					oSchema["sap.ui"].properties.icons.properties.favIcon.sValue = "";
					oSchema["sap.ui"].properties.icons.properties.phone.sValue = "";
					oSchema["sap.ui"].properties.icons.properties["phone@2"].sValue = "";
					oSchema["sap.ui"].properties.icons.properties.tablet.sValue = "";
					oSchema["sap.ui"].properties.icons.properties["tablet@2"].sValue = "";
				}

				//Set default value for device type fields
				if (oManifestContent["sap.ui"].deviceTypes) {
					oSchema["sap.ui"].properties.deviceTypes.properties.phone.bValue = oManifestContent["sap.ui"].deviceTypes.phone;
					oSchema["sap.ui"].properties.deviceTypes.properties.phone.sIcon = oSchema["sap.ui"].properties.deviceTypes.properties.phone.bValue ?
						"sap-icon://accept" : "sap-icon://iphone";
					oSchema["sap.ui"].properties.deviceTypes.properties.tablet.bValue = oManifestContent["sap.ui"].deviceTypes.tablet;
					oSchema["sap.ui"].properties.deviceTypes.properties.tablet.sIcon = oSchema["sap.ui"].properties.deviceTypes.properties.tablet.bValue ?
						"sap-icon://accept" : "sap-icon://ipad";
					oSchema["sap.ui"].properties.deviceTypes.properties.desktop.bValue = oManifestContent["sap.ui"].deviceTypes.desktop;
					oSchema["sap.ui"].properties.deviceTypes.properties.desktop.sIcon = oSchema["sap.ui"].properties.deviceTypes.properties.desktop.bValue ?
						"sap-icon://accept" : "sap-icon://laptop";
				} else {
					oSchema["sap.ui"].properties.deviceTypes.properties.phone.bValue = "";
					oSchema["sap.ui"].properties.deviceTypes.properties.tablet.bValue = "";
					oSchema["sap.ui"].properties.deviceTypes.properties.desktop.bValue = "";
				}

				if (oManifestContent["sap.ui"].supportedThemes) {
					oSchema["sap.ui"].properties.supportedThemes.aValues = this._.isEmpty(oManifestContent["sap.ui"].supportedThemes) ? [] : this._.cloneDeep(
						this._oUtilities._convertObjectItemToMap(this._oUtilities._convertEnumToMap(oManifestContent["sap.ui"].supportedThemes),
							"supportedThemes"));
				} else {
					oSchema["sap.ui"].properties.supportedThemes.aValues = [];
				}

			}
			// Set defaults for sap ui5 fields

			//Set metadata for resource dialog
			oSchema["sap.ui5"].properties.resources.properties.oDialogMetadata = {
				comboBoxLabel: this._oContext.i18n.getText("AppDescriptor_Resource_Type"),
				types: [{
					techType: "js",
					type: this._oContext.i18n.getText("AppDescriptor_Resource_JS"),
					fields: [{
						name: this._oContext.i18n.getText("AppDescriptor_Resource_Uri"),
						tech: "uri",
						required: true,
						labelVisible: true,
						visible: true,
						value: "",
						pattern: oSchema["sap.ui5"].properties.resources.properties.js.items.pattern
					}]
				}, {
					techType: "css",
					type: this._oContext.i18n.getText("AppDescriptor_Resource_Css"),
					fields: [{
						name: this._oContext.i18n.getText("AppDescriptor_Resource_Uri"),
						tech: "uri",
						required: true,
						labelVisible: true,
						visible: true,
						value: "",
						pattern: oSchema["sap.ui5"].properties.resources.properties.css.items.pattern
					}, {
						name: this._oContext.i18n.getText("AppDescriptor_Resource_ID"),
						tech: "id",
						labelVisible: true,
						visible: true,
						value: "",
						pattern: oSchema["sap.ui5"].properties.resources.properties.css.items.pattern
					}]
				}]
			};

			//Set metadata for Manage Targets dialog
			oSchema["sap.ui5"].properties.routing.properties.targets.oDialogMetadata = {
				comboBoxLabel: "Targets",
				visible: false,
				types: [{
					techType: "targets",
					type: "targets",
					isHierarchy: true, //Pattetern proerty
					fields: [{
						name: this._oContext.i18n.getText("AppDescriptor_routing_TargetName"),
						placeholder: "",
						tech: "", //This is the name of the property that _updateManifestSchemaFromAddRemoveListBox will update in the manifest.json
						required: true,
						labelVisible: true,
						visible: true,
						value: "",
						pattern: Object.keys(oSchema["sap.ui5"].properties.routing.properties.targets.patternProperties)[0],
						valueState: sap.ui.core.ValueState.None
					},
					{
						name: "viewType",
						placeholder: "",
						tech: "viewType", //This is the name of the property that _updateManifestSchemaFromAddRemoveListBox will update in the manifest.json
						required: false,
						labelVisible: false,
						visible: false,
						value: "XML",
						defaultValue: "XML",
						pattern: "",
						valueState: sap.ui.core.ValueState.None
					},
					{
						name: "transition",
						placeholder: "",
						tech: "transition", //This is the name of the property that _updateManifestSchemaFromAddRemoveListBox will update in the manifest.json
						required: false,
						labelVisible: false,
						visible: false,
						value: "slide",
						defaultValue: "slide",
						pattern: "",
						valueState: sap.ui.core.ValueState.None
					},
					{
						name: "clearAggregation",
						placeholder: "",
						tech: "clearAggregation", //This is the name of the property that _updateManifestSchemaFromAddRemoveListBox will update in the manifest.json
						required: false,
						labelVisible: false,
						visible: false,
						value: "true",
						defaultValue: "true",
						pattern: "",
						valueState: sap.ui.core.ValueState.None
					}]
				}]
			};

			oSchema["sap.ui5"].properties.dependencies.properties.oDialogMetadata = {
				comboBoxLabel: this._oContext.i18n.getText("AppDescriptor_Dependency_Type"),
				types: [{
					techType: "libs",
					type: this._oContext.i18n.getText("AppDescriptor_Dependencies_Libraries"),
					isHierarchy: true,
					fields: [{
						name: this._oContext.i18n.getText("AppDescriptor_Dependencies_Name"),
						tech: "",
						required: true,
						visible: true,
						value: "",
						pattern: Object.keys(oSchema["sap.ui5"].properties.dependencies.properties.libs.patternProperties)[0]
					}, {
						name: this._oContext.i18n.getText("AppDescriptor_Dependencies_Min_Version"),
						tech: "minVersion",
						labelVisible: true,
						visible: true,
						value: "",
						pattern: ""
					}]
				}, {
					techType: "components",
					isHierarchy: true,
					type: this._oContext.i18n.getText("AppDescriptor_Dependencies_Components"),
					fields: [{
						name: this._oContext.i18n.getText("AppDescriptor_Dependencies_Name"),
						tech: "",
						required: true,
						labelVisible: true,
						visible: true,
						value: "",
						pattern: Object.keys(oSchema["sap.ui5"].properties.dependencies.properties.components.patternProperties)[0]
					}, {
						name: this._oContext.i18n.getText("AppDescriptor_Dependencies_Min_Version"),
						tech: "minVersion",
						labelVisible: true,
						visible: true,
						value: "",
						pattern: ""
					}]
				}]
			};

			if (oSchema["sap.ui5"] && oManifestContent["sap.ui5"]) {
				if (oManifestContent["sap.ui5"].resources) {
					var aJsValues = this._.isEmpty(oManifestContent["sap.ui5"].resources.js) ? [] :
						this._oUtilities._convertObjectItemToMap(this._.cloneDeep(oManifestContent["sap.ui5"].resources.js), "js");
					var aCssValues = this._.isEmpty(oManifestContent["sap.ui5"].resources.css) ? [] :
						this._oUtilities._convertObjectItemToMap(this._.cloneDeep(oManifestContent["sap.ui5"].resources.css), "css");
					oSchema["sap.ui5"].properties.resources.properties.aValues = aJsValues.concat(aCssValues);
				} else {
					oSchema["sap.ui5"].properties.resources.properties.aValues = [];
				}

				if (oManifestContent["sap.ui5"].dependencies) {
					oSchema["sap.ui5"].properties.dependencies.properties.sValue = !this._.isEmpty(oManifestContent["sap.ui5"].dependencies.minUI5Version) ?
						oManifestContent["sap.ui5"].dependencies.minUI5Version : "";
					var aLibraries = this._.isEmpty(oManifestContent["sap.ui5"].dependencies.libs) ? [] :
						this._oUtilities._converMapToItemArray(this._.cloneDeep(oManifestContent["sap.ui5"].dependencies.libs), "libs");
					var aComponents = this._.isEmpty(oManifestContent["sap.ui5"].dependencies.components) ? [] :
						this._oUtilities._converMapToItemArray(this._.cloneDeep(oManifestContent["sap.ui5"].dependencies.components), "components");
					oSchema["sap.ui5"].properties.dependencies.properties.aValues = aLibraries.concat(aComponents);

				} else {
					oSchema["sap.ui5"].properties.dependencies.properties.aValues = [];
				}

				//Routing targets
				if (oManifestContent["sap.ui5"].routing && oManifestContent["sap.ui5"].routing.targets) {

					oSchema["sap.ui5"].properties.routing.properties.targets.aBooleanValues = [{
						key: "true",
						text: "true"
					}, {
						key: "false",
						text: "false"
					}];
					oSchema["sap.ui5"].properties.routing.properties.targets.aValues = this._.isEmpty(oManifestContent["sap.ui5"].routing.targets) ? [] :
						this._oUtilities._converMapToItemArray(this._.cloneDeep(oManifestContent["sap.ui5"].routing.targets), "targets");

				} else {
					oSchema["sap.ui5"].properties.routing.properties.targets.aValues = [];
				}

				if (oManifestContent["sap.ui5"].routing && oManifestContent["sap.ui5"].routing.config && oManifestContent["sap.ui5"].routing.config.bypassed) {
					oSchema["sap.ui5"].properties.routing.properties.config.bypassed.target.aValues = this._.isEmpty(
						oManifestContent["sap.ui5"].routing.config.bypassed.target) ? [] : this._.cloneDeep(
						this._oUtilities._convertObjectItemToMap(this._oUtilities._convertEnumToMap(oManifestContent["sap.ui5"].routing.config.bypassed.target),
							"target"));
				} else {
					oSchema["sap.ui5"].properties.routing.properties.config.bypassed.target.aValues = [];
				}

				if (oManifestContent["sap.ui5"].contentDensities) {
					oSchema["sap.ui5"].properties.contentDensities.cozy = oManifestContent["sap.ui5"].contentDensities.cozy;
					oSchema["sap.ui5"].properties.contentDensities.compact = oManifestContent["sap.ui5"].contentDensities.compact;
				}

				if (oManifestContent["sap.ui5"].routing && oManifestContent["sap.ui5"].routing.config) {
					oSchema["sap.ui5"].properties.routing.properties.config.viewPath.sValue = oManifestContent["sap.ui5"].routing.config.viewPath;
					oSchema["sap.ui5"].properties.routing.properties.config.viewType.sSelectedKey = oManifestContent["sap.ui5"].routing.config.viewType;
					oSchema["sap.ui5"].properties.routing.properties.config.controlId.sValue = oManifestContent["sap.ui5"].routing.config.controlId;
					oSchema["sap.ui5"].properties.routing.properties.config.viewLevel.iValue = oManifestContent["sap.ui5"].routing.config.viewLevel;
					oSchema["sap.ui5"].properties.routing.properties.config.controlAggregation.sValue = oManifestContent["sap.ui5"].routing.config.controlAggregation;
					oSchema["sap.ui5"].properties.routing.properties.config.transition.sSelectedKey = oManifestContent["sap.ui5"].routing.config.transition;
					oSchema["sap.ui5"].properties.routing.properties.config.targetParent.sValue = oManifestContent["sap.ui5"].routing.config.targetParent;
					oSchema["sap.ui5"].properties.routing.properties.config.parent.sValue = oManifestContent["sap.ui5"].routing.config.parent;
					oSchema["sap.ui5"].properties.routing.properties.config.clearAggregation.sSelectedKey = oManifestContent["sap.ui5"].routing.config.clearAggregation;
				}

			}

			return oSchema;
		},

		_updateSchemaForUI5Model: function(oSchema) {
			oSchema["sap.app"] = this._buildSapAppSchemaProperty(oSchema["sap.app"]);
			oSchema["sap.ui"] = this._buildSapUiSchemaProperty(oSchema["sap.ui"]);
			oSchema["sap.ui5"] = this._buildSapUI5SchemaProperty(oSchema["sap.ui5"]);
			return oSchema;
		},

		// Add dummy fields to sap app schema so that the ui-model could update and be updated from it.
		_buildSapAppSchemaProperty: function(oSapAppSchema) {
			oSapAppSchema.properties.id.sValue = "";
			oSapAppSchema.properties.type.mConvertedEnum = this._oUtilities._convertEnumToMap(oSapAppSchema.properties.type.enum);
			oSapAppSchema.properties.type.sSelectedKey = oSapAppSchema.properties.type.mConvertedEnum[0].text;
			oSapAppSchema.properties.title.sValue = "";
			oSapAppSchema.properties.tags.properties.keywords.aValues = [];
			oSapAppSchema.properties.description.sValue = "";
			//crossNavigation- will not be loaded in case the version is less than 1.2.0
			var bSchemaVersion_1_1_0 = this.getView().getModel("AppDescriptorUI").getProperty("/bSapAppVersion1_1_0");
			if (!bSchemaVersion_1_1_0) {
				oSapAppSchema.properties.crossNavigation.properties.inbounds.aTiles = [];
				var oPatternProps = oSapAppSchema.properties.crossNavigation.properties.inbounds.patternProperties;
				oSapAppSchema.properties.crossNavigation.properties.inbounds.aTilesAllowAddmConvertedEnum = this._oUtilities._convertEnumToMap(
					oPatternProps[
						Object.keys(oPatternProps)[0]].properties.signatures.properties.additionalParameters.enum);
				var oSigPatternProps = oPatternProps[Object.keys(oPatternProps)[0]].properties.signatures.properties.parameters.patternProperties;
				oSapAppSchema.properties.crossNavigation.properties.inbounds.aTilesValueFormatmConvertedEnum = this._oUtilities._convertEnumToMap(
					oSigPatternProps[Object.keys(oSigPatternProps)[0]].properties.defaultValue.properties.format.enum);
				oSapAppSchema.properties.crossNavigation.properties.inbounds.aTilesFilterValuemConvertedEnum = this._oUtilities._convertEnumToMap(
					oSigPatternProps[Object.keys(oSigPatternProps)[0]].properties.filter.properties.format.enum);
			}

			oSapAppSchema.properties.applicationVersion.properties.version.sValue = "";
			oSapAppSchema.properties.i18n.sValue = "";
			oSapAppSchema.properties.sourceTemplate.properties.id.sValue = "";
			oSapAppSchema.properties.sourceTemplate.properties.version.sValue = "";
			oSapAppSchema.properties.ach.sValue = "";
			oSapAppSchema.properties.ach.bVisibility = this._bVisibility;
			
			var oDataSourcesPattern = oSapAppSchema.properties.dataSources.patternProperties;
			oSapAppSchema.properties.dataSources.aOdataVersionConvertedEnum = this._oUtilities._convertEnumToMap(
				oDataSourcesPattern[Object.keys(oDataSourcesPattern)[0]].properties.settings.properties.odataVersion.enum);
			
			return oSapAppSchema;
		},

		// Add dummy fields to sap ui schema so that the ui-model could update and be updated from it.
		_buildSapUiSchemaProperty: function(oSapUiSchema) {
			oSapUiSchema.properties.technology.mConvertedEnum = this._oUtilities._convertEnumToMap(oSapUiSchema.properties.technology.enum);
			oSapUiSchema.properties.icons.properties.icon.sValue = "";
			oSapUiSchema.properties.icons.properties.favIcon.sValue = "";
			oSapUiSchema.properties.icons.properties.phone.sValue = "";
			oSapUiSchema.properties.icons.properties["phone@2"].sValue = "";
			oSapUiSchema.properties.icons.properties.tablet.sValue = "";
			oSapUiSchema.properties.icons.properties["tablet@2"].sValue = "";
			oSapUiSchema.properties.deviceTypes.properties.phone.bValue = false;
			oSapUiSchema.properties.deviceTypes.properties.phone.sIcon = "sap-icon://iphone";
			oSapUiSchema.properties.deviceTypes.properties.tablet.bValue = false;
			oSapUiSchema.properties.deviceTypes.properties.tablet.sIcon = "sap-icon://ipad";
			oSapUiSchema.properties.deviceTypes.properties.desktop.bValue = false;
			oSapUiSchema.properties.deviceTypes.properties.desktop.sIcon = "sap-icon://laptop";
			return oSapUiSchema;
		},

		// Add dummy fields to sap ui5 schema so that the ui-model could update and be updated from it.
		_buildSapUI5SchemaProperty: function(oSapUI5Schema) {
			oSapUI5Schema.properties.resources.properties.aValues = [];
			oSapUI5Schema.properties.resources.properties.bVisibility = this._bVisibility;
			oSapUI5Schema.properties.routing.properties.config.viewPath = {
				"sValue": ""
			};
			oSapUI5Schema.properties.routing.properties.config.viewType = {
				"mConvertedEnum": this._oUtilities._convertEnumToMap(oSapUI5Schema.properties.routing.properties.config.allOf[1].properties.viewType.enum)
			};
			oSapUI5Schema.properties.routing.properties.config.viewType.sSelectedKey = oSapUI5Schema.properties.routing.properties.config.viewType.mConvertedEnum[0].text;
			oSapUI5Schema.properties.routing.properties.config.controlId = {
				"sValue": ""
			};
			oSapUI5Schema.properties.routing.properties.config.showMoreProperties = {
				"bValue": false
			};
			oSapUI5Schema.properties.routing.properties.config.viewLevel = {
				"iValue": ""
			};
			oSapUI5Schema.properties.routing.properties.config.controlAggregation = {
				"sValue": ""
			};
			oSapUI5Schema.properties.routing.properties.config.transition = {
				"mConvertedEnum": this._oUtilities._convertEnumToMap(oSapUI5Schema.properties.routing.properties.config.allOf[1].properties.transition.anyOf[1].enum)
			 };
			oSapUI5Schema.properties.routing.properties.config.transition.sSelectedKey = oSapUI5Schema.properties.routing.properties.config.transition.mConvertedEnum[0].text;
			oSapUI5Schema.properties.routing.properties.config.targetParent = {
				"sValue": ""
			};
			oSapUI5Schema.properties.routing.properties.config.parent = {
				"sValue": ""
			};
			oSapUI5Schema.properties.routing.properties.config.clearAggregation = {
				"aBoolValues":	[{
					key: "true",
					text: "true"
				},
				{
					key: "false",
					text: "false"
				}]};
			oSapUI5Schema.properties.routing.properties.config.clearAggregation.sSelectedKey = oSapUI5Schema.properties.routing.properties.config.clearAggregation.aBoolValues[0];
			
			var oPatternProps = oSapUI5Schema.properties.routing.properties.targets.patternProperties;
			oSapUI5Schema.properties.routing.properties.targets.aTransitionmConvertedEnum = this._oUtilities._convertEnumToMap(
				oPatternProps[Object.keys(oPatternProps)[0]].allOf[0].properties.transition.anyOf[1].enum);
			
			oSapUI5Schema.properties.routing.properties.targets.aViewTypemConvertedEnum = this._oUtilities._convertEnumToMap(
				oPatternProps[Object.keys(oPatternProps)[0]].allOf[0].properties.viewType.enum);
			
			oSapUI5Schema.properties.routing.properties.config.bypassed = {
				"target": {
					aTargets: []
				}
			};
			return oSapUI5Schema;
		},
		
		getSelectedTabName: function() {
			var iSelectedTabIndex = this.byId("appDescriptorTabStrip").getSelectedIndex();
			return this.byId("appDescriptorTabStrip").getTabs()[iSelectedTabIndex].getText();
		},
		
		OnTabSelect: function(oEvent) {
			this._oContext.service.usagemonitoring.report("appDescriptor", "tab_select", this.getSelectedTabName()).done();
		}
		
	});
});