define(["sap/watt/lib/lodash/lodash", "sap/watt/lib/jszip/jszip-shim"], function(_, JSZip) {
	return {

		TEMPLATENAME: "sap.suite.ui.generic.template.ObjectPage",
		VIEWNAME : "sap.suite.ui.generic.template.ObjectPage.view.Details",

		configWizardSteps: function(oTemplateCustomizationStep) {},

		onBeforeTemplateGenerate: function(templateZip, model) {
			var that = this;
			return this.context.service.ui5projecthandler.getAppNamespace(model.selectedDocument).then(function(sAppNamespace) {
				model.namespace = sAppNamespace;
				return that._buildFileName(model).then(function(sFileName) {
					model.filename = sFileName;
					var oNewZip = that._handleResourcesFiles(templateZip, model);
					return [oNewZip, model];
				});
			});
		},

		onAfterGenerate: function(projectZip, model) {
			var that = this;
			var oUIModel = model.UIModel;
			var iSelectedEP = oUIModel.getProperty("/extensionPointIndex");
			var sExtensionPoint = oUIModel.getProperty("/extensionPoints/" + iSelectedEP + "/key");
			var sEntitySet = oUIModel.getProperty("/entitySet");
			var sFacetId = oUIModel.getProperty("/facet");
			var iSelectedVT = oUIModel.getProperty("/viewTypeIndex");
			var sViewType = oUIModel.getProperty("/viewTypes/" + iSelectedVT + "/text");
			var sFacetTitle = oUIModel.getProperty("/facetTitle");
			var bOverwrite = model.overwrite;

			sFacetTitle = sFacetTitle || "Untitled";
			var	oExtensionContent = {
				"type": "XML"
			};
			if(sViewType === "View"){
				oExtensionContent.className = "sap.ui.core.mvc.View";
				oExtensionContent.viewName = model.namespace + ".ext.view." + model.filename;
				model.sViewFile = model.selectedDocument.getEntity().getFullPath() + "/webapp/ext/view/" + model.filename + ".view.xml";
			} else { //sViewType === "Freagment"
				oExtensionContent.className = "sap.ui.core.Fragment";
				oExtensionContent.fragmentName = model.namespace + ".ext.fragment." + model.filename;
				model.sViewFile = model.selectedDocument.getEntity().getFullPath() + "/webapp/ext/fragment/" + model.filename + ".fragment.xml";
			}
			if (sExtensionPoint !== "ReplaceFacet") {
				oExtensionContent["sap.ui.generic.app"] = {
					"title": "{@i18n>" + sFacetTitle + "}"
				};
			}
			return this.context.service.smartTemplateHelper.createNewViewExtensionEntry(model.selectedDocument, this.VIEWNAME,
				sExtensionPoint, sEntitySet, oExtensionContent, sFacetId, bOverwrite).then(function(){
					var aTexts = [];
					aTexts.push(sFacetTitle);
					return that.context.service.smartTemplateHelper.writeToI18n(model.selectedDocument, aTexts).then(function(){
						return [projectZip, model];
					});
				});
		},

		customValidation: function(model) {
			var that = this;
			return this.context.service.smartTemplateHelper.validateOnSelection(model.selectedDocument, this.TEMPLATENAME).fail(function(oError){
				if(oError.name === "TemplateDoesNotExist"){
					throw new Error(that.context.i18n.getText("i18n", "smart_extension_err", "Object Page"));
				} else {
					throw oError;
				}
			});
		},

		_buildFileName: function(model) {
			var that = this;
			var oUIModel = model.UIModel;
			var sViewName = oUIModel.getProperty("/viewName");
			if(!sViewName){
				return this.context.service.ui5projecthandler.getAllExtensions(model.selectedDocument).then(function(oExtensions) {
					return that._buildFileNameFromExistingExtensions(oExtensions);
				});
			} else {
				return Q(sViewName);
			}
		},

		_buildFileNameFromExistingExtensions : function(oExtensions){
			var iTopFacetFile = -1;
			if (oExtensions && oExtensions["sap.ui.viewExtensions"]) {
				var oAllViewExtension = oExtensions["sap.ui.viewExtensions"];
				var oObjectPageExtensions;
				_.forIn(oAllViewExtension, function(oExtendedViewValue, sExtendedViewKey) { // iterates on all extended views (e.g list report or object page)
					if (sExtendedViewKey === this.VIEWNAME) {
						oObjectPageExtensions = oAllViewExtension[sExtendedViewKey];
						var oExtensionPoint;
						_.forIn(oObjectPageExtensions, function(oExtensionPointsValue, sExtensionPointsKey) { // iterates on all extension points in Object Page
							oExtensionPoint = oObjectPageExtensions[sExtensionPointsKey];
							var sFileName = oExtensionPoint.fragmentName || oExtensionPoint.viewName;
							if (sFileName && sFileName.indexOf("newFacet") > -1) {
								var sEndOfFileName = sFileName.substr(sFileName.indexOf("newFacet") + "newFacet".length);
								sEndOfFileName = sEndOfFileName || "0";
								var iFacetFileCounter = parseInt(sEndOfFileName);
								if (!isNaN(iFacetFileCounter)) {
									iTopFacetFile = Math.max(iTopFacetFile, iFacetFileCounter);
								}
							}
						});
					}
				}, this);
			}
			return iTopFacetFile > -1 ? "newFacet" + (iTopFacetFile + 1) : "newFacet";
		},

		_handleResourcesFiles: function(templateZip, model) {
			var oUIModel = model.UIModel;
			var iSelectedVT = oUIModel.getProperty("/viewTypeIndex");
			var sViewType = oUIModel.getProperty("/viewTypes/" + iSelectedVT + "/text");
			var oNewZip = new JSZip();
			if (sViewType === "Fragment") {
				this._changeFileName(templateZip, model, "fragment", ".xml", oNewZip);
			} else { //sViewType === "View"
				this._changeFileName(templateZip, model, "controller", ".js.tmpl", oNewZip);
				this._changeFileName(templateZip, model, "view", ".xml.tmpl", oNewZip);
			}
			return oNewZip;
		},

		_changeFileName: function(templateZip, model, sOldFileName, sOldFileExtension, oNewZip) {
			var oNewFolder = oNewZip.folder("webapp/ext/" + sOldFileName);
			var oOldFragmentFile = templateZip.file(sOldFileName);
			var sFragmentName = model.filename + "." + sOldFileName + sOldFileExtension;
			var sFragmentData = oOldFragmentFile._data;
			var oFragmentOptions = oOldFragmentFile.options;
			oNewFolder.file(sFragmentName, sFragmentData, oFragmentOptions);
		}
	};
});