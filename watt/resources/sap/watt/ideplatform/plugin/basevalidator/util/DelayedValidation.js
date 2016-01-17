define([], function(){

	var DELAYED_VALIDATION_CYCLE = 300;


	var DelayedValidation = function(oContext){
		this.oContext = oContext;
		this._validationCycleTimeoutKeys = {}; // key = document, value = unique timeout identifier
	};


	DelayedValidation.prototype.runDelayedValidation = function(oValidatorService, oDocument, userSettings, validateHandler, validationHandlerContext){
		var that = this;
		var timeoutKey = window.setTimeout(
			$.proxy(
				function(oDocumentToValidate){
					validateHandler.call(validationHandlerContext, oValidatorService, oDocumentToValidate, userSettings).done();
					that._setValidationCycleTimeout(oDocumentToValidate, null);
				},
				that,oDocument), DELAYED_VALIDATION_CYCLE);
		this._setValidationCycleTimeout(oDocument, timeoutKey);
	};

	DelayedValidation.prototype._setValidationCycleTimeout = function(oDoc, timeoutKey){
		var fileUniqueName = oDoc.getEntity().getFullPath();
		this._validationCycleTimeoutKeys[fileUniqueName] = timeoutKey;
	};

	DelayedValidation.prototype.clearValidationCycleTimeout = function(oDoc){
		var fileUniqueName = oDoc.getEntity().getFullPath();
		var timeoutKey = this._validationCycleTimeoutKeys[fileUniqueName];
		window.clearTimeout(timeoutKey);
		this._setValidationCycleTimeout(oDoc, null);
	};


	return DelayedValidation;

});