define([ "../constants/ComponentConstants",
		 "../manager/ComponentManager" ], function(ComponentConstants, ComponentManager) {
	var oComponentManager = null;
	var oContext = null;

	var CONSTANTS = {
		EmptyView : "EmptyView.xml",
		ParentView : "ParentView.xml"
	};

	var _onBeforeTemplateGenerate = function(templateZip, model) {
		oContext = this.context;
		oComponentManager = new ComponentManager(this.context);

		oComponentManager.initializeComponentModel(model, ComponentConstants.constants.components.initModel.ReplaceView);

		return onBeforeReplaceViewGenerate(templateZip, model).then(function() {
			return oComponentManager.onBeforeTemplateGenerate(templateZip, model);
		});
	};

	var _onAfterGenerate = function(projectZip, model) {
		return oComponentManager.onAfterGenerate(projectZip, model);
	};

	/**
	 * Handle model and template zip for Replace view component
	 * 
	 * @param templateZip
	 * @param model
	 * @returns promise
	 */
	var onBeforeReplaceViewGenerate = function(templateZip, model) {
		//Set the selected view document in a component viewDocument
		var selectedResourcePath = model.fiori.extensionCommon.selectedDocumentPath;

		return getViewAttributes(selectedResourcePath, model).then(function(oViewAttributes) {
			if (model.fiori.extensionCommon.extensionId === "Empty view") {
				model.fiori.replaceView.parentAttributesPrefix = oViewAttributes.parentAttributesPrefix;
				model.fiori.replaceView.parentAttributesSuffix = oViewAttributes.parentAttributesSuffix;
				templateZip.remove(CONSTANTS.ParentView + ".tmpl");
			} else {
				model.fiori.replaceView.parentViewContent = oViewAttributes.parentViewContent;
				templateZip.remove(CONSTANTS.EmptyView + ".tmpl");
			}
			// clear second drop down box selection
			model.fiori.extensionCommon.extensionId = undefined;
		});
	};

	//Get prefix and Suffix Attributes from View content and add to model
	var setModelViewAttributesByContent = function(viewContent) {

		var pattern1 = "<.*View([^<]+?)>";
		var pattern3 = "</[a-zA-Z\.\s]+:[View\s]+>";

		oViewAttributes.parentAttributesPrefix = viewContent.match(pattern1)[0];
		oViewAttributes.parentAttributesSuffix = viewContent.match(pattern3)[0];

		return oViewAttributes;
	};

	var oViewAttributes = {
		parentViewContent : "",
		parentAttributesPrefix : "",
		parentAttributesSuffix : ""
	};

	//Set the parent view attributes in the model for empty view
	//Set the content of parent view in the model for replace with existing
	var getViewAttributes = function(resourcePath, model) {
		var oDeferred = Q.defer();

		var type = model.extensibility.type;
		var system = model.extensibility.system;

		oContext.service.parentproject.getDocument(resourcePath, "file", system, type).then(function(oDocument) {
			oDocument.getContent().then(function(fileContent) {

				if (typeof fileContent !== "string") {
					fileContent = (new XMLSerializer()).serializeToString(fileContent);
				}

				setModelViewAttributesByContent(fileContent);
				oViewAttributes.parentViewContent = fileContent;

				oDeferred.resolve(oViewAttributes);
			}).fail(function(sError) {
				oDeferred.reject(sError);
			});
		}).fail(function(sError) {
			oDeferred.reject(sError);
		});

		return oDeferred.promise;
	};

	var _configWizardSteps = function(oReplaceViewStep) {
		return [ oReplaceViewStep ];
	};

	// added for testing purposes
	var _setContext = function(oInputCOntext) {
		if (oInputCOntext) {
			oContext = oInputCOntext;
		}
	};

	return {
		onBeforeTemplateGenerate : _onBeforeTemplateGenerate,
		onAfterGenerate : _onAfterGenerate,
		configWizardSteps : _configWizardSteps,
		onBeforeReplaceViewGenerate : onBeforeReplaceViewGenerate,
		setContext : _setContext
	};
});
