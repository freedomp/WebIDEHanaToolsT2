/*!
 * SAP APF Analysis Path Framework
 * 
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */
jQuery.sap.declare('sap.apf.modeler.ui.utils.textPoolHelper');
/**
 * @private
 * @class Text Pool Helper
 * @description Helps UI Controllers in handling Text Pool related operations (AutoFill, setText etc.).
 * @param {sap.apf.modeler.core.TextPool} oTextPool - Text Pool instance used in the controller context.
 * @name sap.apf.modeler.ui.utils.TextPoolHelper
 */
sap.apf.modeler.ui.utils.TextPoolHelper = function(oTextPool) {
	this.oTextPool = oTextPool;
};
sap.apf.modeler.ui.utils.TextPoolHelper.prototype = {
	/**
	 * @private
	 * @function
	 * @name sap.apf.modeler.ui.utils.TextPoolHelper#setAutoCompleteOn
	 * @param {sap.m.Input} oInputControl - Input Control on which suggestions has to be shown.
	 * @param {sap.apf.modeler.ui.utils.TranslationFormatMap} oTranslationFormat - Translation format of the input control.
	 * @description Sets 'Auto Complete Feature' on the given input control with relevant suggestion items based on translation format.
	 * */
	setAutoCompleteOn : function(oInputControl, oDependencies) {
		// Set showSuggestion to true.
		oInputControl.setShowSuggestion(true);
		var aSuggestionItems = [];
		// Fetch all Suggestion Items according to translation format.
		if (oDependencies.type === "text") {
			var aExistingItems = this._getSuggestionItems(oDependencies.oTranslationFormat);
			aExistingItems.forEach(function(oText) {
				var object = {};
				object.suggetionText = oText.TextElementDescription;
				aSuggestionItems.push(object);
			});
		} else if (oDependencies.type === "service") {
			var aExistingSerices = oDependencies.oConfigurationEditor.getAllServices();
			aExistingSerices.forEach(function(service) {
				var object = {};
				object.suggetionText = service;
				aSuggestionItems.push(object);
			});
		}
		// Prepare and set the JSONModel.
		var oInputControlModel = oInputControl.getModel();
		var oModel = oInputControlModel || new sap.ui.model.json.JSONModel({});
		if (!oModel.getData().suggestions) {
			oModel.getData().suggestions = aSuggestionItems;
		}
		if (!oInputControlModel) {
			oInputControl.setModel(oModel);
		}
		/*
		var oSuggestionModel = new sap.ui.model.json.JSONModel({
			suggestions : aSuggestionItems
		});
		oInputControl.setModel(oSuggestionModel);*/
		// Bind 'suggestionItems' aggregation.
		oInputControl.bindAggregation("suggestionItems", {
			path : "/suggestions",
			template : new sap.ui.core.Item({
				text : "{suggetionText}"
			})
		});
		// Attach Listener to 'suggest' event.
		oInputControl.attachSuggest(this._handleSuggestion);
	},
	/**
	 * @private
	 * @function
	 * @name sap.apf.modeler.ui.utils.TextPoolHelper#_handleSuggestion
	 * @param {oControlEvent} oEvent - Suggest Event.
	 * @description Handler for 'suggest' event triggered on input control.
	 * */
	_handleSuggestion : function(oEvent) {
		var sValue = oEvent.getParameter("suggestValue");
		var oFilter = new sap.ui.model.Filter("suggetionText", sap.ui.model.FilterOperator.Contains, sValue);
		oEvent.getSource().getBinding("suggestionItems").filter([ oFilter ]);
	},
	/**
	 * @private
	 * @function
	 * @name sap.apf.modeler.ui.utils.TextPoolHelper#_getSuggestionItems
	 * @param {sap.apf.modeler.ui.utils.TranslationFormatMap} oTranslationFormat - Translation format of the input control.
	 * @description Handler for 'suggest' event triggered on input control.
	 * @returns {object[]} Array of Translation Text Objects
	 * */
	_getSuggestionItems : function(oTranslationFormat) {
		return this.oTextPool.getTextsByTypeAndLength(oTranslationFormat.TextElementType, oTranslationFormat.MaximumLength);
	}
};
/**
 * @private
 * @name sap.apf.modeler.ui.utils.TranslationFormatMap
 * @description Look up map for Translation Format from Input Type
 */
sap.apf.modeler.ui.utils.TranslationFormatMap = {
	APPLICATION_TITLE : {
		TextElementType : "XTIT",
		MaximumLength : 250
	},
	CATEGORY_TITLE : {
		TextElementType : "XTIT",
		MaximumLength : 60
	},
	FACETFILTER_LABEL : {
		TextElementType : "XFLD",
		MaximumLength : 50
	},
	STEP_TITLE : {
		TextElementType : "XTIT",
		MaximumLength : 100
	},
	STEP_LONG_TITLE : {
		TextElementType : "XTIT",
		MaximumLength : 200
	},
	STEP_CORNER_TEXT : {
		TextElementType : "XFLD",
		MaximumLength : 25
	},
	REPRESENTATION_LABEL : {
		TextElementType : "XTIT",
		MaximumLength : 80
	},
	REPRESENTATION_CORNER_TEXT : {
		TextElementType : "XFLD",
		MaximumLength : 25
	}
};