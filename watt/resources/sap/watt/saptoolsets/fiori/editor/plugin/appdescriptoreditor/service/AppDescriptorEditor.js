define(["sap/watt/common/plugin/platform/service/ui/AbstractEditor", "sap/watt/lib/lodash/lodash", "../util/Utilities"], function(
	AbstractEditor, _, Utilities) {
	"use strict";

	var Editor = AbstractEditor.extend("sap.watt.saptoolsets.fiori.editor.plugin.appdescriptoreditor.service.AppDescriptorEditor", {

		_oDocument: null,
		_oManifestContent: {},
		_oAdjustedSchema: null,
		_sSignaturesKeys: "",
		_bSchemaVersion_1_1_0: false,
		_bVisibility: false,

		/**
		 * =============================
		 * Lifecycle methods
		 * =============================
		 */

		configure: function(mConfig) {
			this.context.service.resource.includeStyles(mConfig.styles).done();

			if (mConfig.repositoryBrowserExtensionFilters.length > 0) {
				this._aExtensionFilters = mConfig.repositoryBrowserExtensionFilters;
			}
		},

		/**
		 * =======================================================
		 * sap.watt.common.service.editor.Editor interface methods
		 * =======================================================
		 */

		isAvailable: function() {
			return true;
		},

		open: function(oDocument) {
			var that = this;

			this._oDocument = oDocument;
			this._oManifestContent = {};

			var oSchema = {
				"_version": "1.2.0",
				"sap.app": {
					"_version": "1.2.0"
				}
			};
			
			var sSelectedTabName = this._oAppDescriptorEditorView.getController().getSelectedTabName();
			this.context.service.usagemonitoring.report("appDescriptor", "tab_select", sSelectedTabName).done();

			//Get the content from the file parse it
			return this._oDocument.getContent().then(function(sContent) {
				try {
					jQuery.extend(that._oManifestContent, JSON.parse(sContent));
					if (!_.isEmpty(that._oManifestContent)) {
						oSchema = that._oManifestContent;
					}
					that._oAppDescriptorEditorView.getController().setParsingErrorPage(false);
				} catch (oError) {
					that._oAppDescriptorEditorView.getController().setParsingErrorPage(true);
					console.log(that.context.i18n.getText("AppDescriptor_invalid_file"));
					return Q();
				}
				// if (oSchema["sap.app"] && oSchema["sap.app"]._version === "1.1.0") {
				// 	that._bSchemaVersion_1_1_0 = true;
				// 	console.log(that.context.i18n.getText("AppDescriptor_navigation_schema"));
				// 	//sap.ui.getCore().byId("errorNavigationGrid").setVisible(true);
				// 	//sap.ui.getCore().byId("contentNavigationGrid").setVisible(false);

				// } else {
				// 	that._bSchemaVersion_1_1_0 = false;
				// 	//sap.ui.getCore().byId("errorNavigationGrid").setVisible(false);
				// 	//sap.ui.getCore().byId("contentNavigationGrid").setVisible(true);
				// }
				return that.context.service.fioriSchemaProvider.getFlatSchema(oSchema).then(function(oFlatAppDescriptorSchema) {
					that._bVisibility = sap.watt.getEnv("internal");
					that._oAdjustedSchema = oFlatAppDescriptorSchema;

					//Create the structure of the manifest.json file
					that._fillManifestSkeleton(that._oAdjustedSchema, that._oManifestContent);

					//Forward the manifest and the schema into the editor controller
					that._oAppDescriptorEditorView.getController().setManifestAndSchema(oFlatAppDescriptorSchema.properties, that._oManifestContent, that._oDocument);

					// Set intent details controls enabled status
					// var oIntentTable = sap.ui.getCore().byId("appDescriptorIntentTable");
					// oModel.setProperty("/navigationTab", {
					// 	intentDetailsEnabled: oIntentTable.getSelectedIndex() !== -1
					// });
				});
			});
		},

		getContent: function() {
			if (!this._oAppDescriptorEditorView) {
				this._oAppDescriptorEditorView = sap.ui.view({
					viewName: "sap.watt.saptoolsets.fiori.editor.plugin.appdescriptoreditor.ui.AppDescriptorEditor",
					type: sap.ui.core.mvc.ViewType.XML,
					viewData: {
						oContext: this.context,
						oUtil: Utilities,
						aExtentionFilters : this._aExtensionFilters
					}
				});

				this.context.i18n.applyTo(this._oAppDescriptorEditorView);
				this._oAppDescriptorEditorView.getController().attachEvent("manifestChanged", this._onManifsetChanged, this);
			}
			return this._oAppDescriptorEditorView;
		},

		flush: function() {
			if (this._oDocument.isDirty()) {
				this.updateDocument();
			}
		},

		_onManifsetChanged: function() {
			this.updateDocument();
		},

		_fillManifestSkeleton: function(oProperties, oResult, oParentProperties, sCurrKey) {
			var that = this;

			var oCurrentProperties = {};
			var oCurrentPatternProperties = {};
			var sDefaultValue = null;
			var sPattern = "";
			var sCurrentType = "string";
			var aEnum = [];
			var oItems = [];
			var aRequired = [];

			//Fill the variables that will help decide what sort of handling will bee needed and where on the tree the current instance is
			jQuery.each(oProperties, function(sNextKey, oValue) {
				switch (sNextKey) {
					case "properties":
						oCurrentProperties = oValue;
						break;
						//Currently not implemented	
					case "patternProperties":
						oCurrentPatternProperties = oValue;
						break;
					case "default":
						sDefaultValue = oValue;
						break;
					case "type":
						sCurrentType = oValue;
						break;
					case "enum":
						aEnum = oValue;
						break;
					case "items":
						oItems = oValue;
						break;
					case "required":
						aRequired = oValue;
						break;
				}
			});

			//Recursion stop condition  !xor on oCurrentProps and oPatternProps
			if (!((jQuery.isEmptyObject(oCurrentProperties) && !jQuery.isEmptyObject(oCurrentPatternProperties)) ||
				(!jQuery.isEmptyObject(oCurrentProperties) && jQuery.isEmptyObject(oCurrentPatternProperties)))) {

				//There is already filled value in the manifest json exit
				if (jQuery.isPlainObject(oParentProperties[sCurrKey])) {
					if (!jQuery.isEmptyObject(oParentProperties[sCurrKey])) {
						return;
					}
				} else {
					if (oParentProperties[sCurrKey] !== undefined) {
						return;
					}
				}

				if (sCurrKey) {
					var bArray = false;
					if (oParentProperties[sCurrKey] && jQuery.isArray(oParentProperties[sCurrKey])) {
						bArray = true;
					}
					if (sDefaultValue) {
						!bArray ? oParentProperties[sCurrKey] = sDefaultValue : oParentProperties[sCurrKey].push(sDefaultValue);
						return;
					}
					//If has array and has some enum values in it
					if (jQuery.isArray(aEnum)) {
						//If only one value exist in the enum take it
						if (aEnum.length == 1) {
							!bArray ? oParentProperties[sCurrKey] = aEnum[0] : oParentProperties[sCurrKey].push(aEnum[0]);
							return;
						}
						//for _version take the latest version
						if (aEnum.length > 1 && sCurrKey === "_version") {
							!bArray ? oParentProperties[sCurrKey] = aEnum[aEnum.length - 1] : oParentProperties[sCurrKey].push(aEnum[aEnum.length - 1]);
							return;
						}
						//for all other enums take the first enum
						if (aEnum.length > 1) {
							!bArray ? oParentProperties[sCurrKey] = aEnum[0] : oParentProperties[sCurrKey].push(aEnum[0]);
							return;
						}

					}
					//add the property and set a default value to it
					switch (sCurrentType) {
						case "integer":
							!bArray ? oParentProperties[sCurrKey] = 0 : oParentProperties[sCurrKey].push(0);
							break;
						case "object":
							!bArray ? oParentProperties[sCurrKey] = {} : oParentProperties[sCurrKey].push({});
							break;
						case "array":
							!bArray ? oParentProperties[sCurrKey] = [] : oParentProperties[sCurrKey].push([]);
							that._fillManifestSkeleton(oItems, oParentProperties[sCurrKey], oParentProperties, sCurrKey);
							break;
						case "boolean":
							!bArray ? oParentProperties[sCurrKey] = false : oParentProperties[sCurrKey].push(false);
							break;
						default:
							!bArray ? oParentProperties[sCurrKey] = "" : oParentProperties[sCurrKey].push("");

					}
				}
				// break the recuresion after initial/default value is filled
				return;
			}

			//Handle recursive for all child properties
			jQuery.each(oCurrentProperties, function(sNextKey, oValue) {
				//Check if the property is required in the parent
				if (!_.isEmpty(aRequired) && _.contains(aRequired, sNextKey)) {
					//property is required but is not updated in the manifest set as empty object
					if (oResult[sNextKey] === undefined) {
						oResult[sNextKey] = {};
					}
					//Call the recursion with the child property
					that._fillManifestSkeleton(oValue, oResult[sNextKey], oResult, sNextKey);
				} else {
					if (oResult[sNextKey] !== undefined) {
						that._fillManifestSkeleton(oValue, oResult[sNextKey], oResult, sNextKey);
					}
				}
			});
		},


		

		//=====================Update document==================================
		updateDocument: function() {
			var that = this;
			this.context.service.beautifierProcessor.beautify(JSON.stringify(this._oManifestContent), "json").then(function(oContent) {
				that._oDocument.setContent(oContent, that.context.self);
			}).done();
		}
	});

	return Editor;

});