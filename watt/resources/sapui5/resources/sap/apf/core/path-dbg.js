/*!
 * SAP APF Analysis Path Framework
 * 
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */

jQuery.sap.declare("sap.apf.core.path");

/**
 * @private
 * @class Holds the order and state of the Step instances within the analysis path. The methods, that change the path or get state of the path
 * shall be called through the APF api (@see sap.apf.Api). The path is automatically created at startup of the APF.
 * @param oInject.messageHandler {sap.apf.core.MessageHandler} MessageHandler
 * @param oInject.coreApi {sap.apf.core.Instance} core API
 * @name sap.apf.core.Path
 */
sap.apf.core.Path = function(oInject) {

	// Public vars
	this.type = "path";

	// Private vars
    var oMessageHandler = oInject.messageHandler;
    var oCoreApi = oInject.coreApi;
	var that = this;
	var aStepInstances = [];
	var aActiveSteps = [];
	var nUpdateCounter = 0;

	this.destroy = function() {
		aActiveSteps = [];
		aStepInstances.forEach(function(step){
			step.destroy();
		});
		aStepInstances = [];
		that = undefined;
	};
	// Public functions
	/**
	 * @function
	 * @name sap.apf.core.Path.getSteps
	 * @description Gets the ordered sequence of all steps in an analysis path.
	 * The array is cloned such that the internal state of the path cannot be manipulated directly.
	 * Each step return a referenced to the object in the path. 
	 * Each step shall always be identified by the reference to its step object, 
	 * e.g. in methods like removeStep, moveStepToPosition, setActiveSteps, etc.
	 * @return copied array of steps
	 */
	this.getSteps = function() {
		return jQuery.extend(true, [], aStepInstances);
	};
	/**
	 * @function
	 * @name sap.apf.core.Path.addStep
	 * @description Adds a step to the analysis path. Has to be called by APF api.
	 * @param oStep
	 *            reference of the step which shall be added to the analysis
	 *            path
	 */
	this.addStep = function(oStep, fnStepProcessedCallback) {
		aStepInstances.push(oStep);
		that.update(fnStepProcessedCallback);
	};

	/**
	 * @description Sets a step as an active step in the path.
	 * @param oStep The step to be set active. The step has to be a member of the path, if not, an error will be thrown. A step may already be active. 
	 */
	this.makeStepActive = function(oStep) {
		var bStepIsInPath = this.stepIsInPath(oStep);
		oMessageHandler.check(bStepIsInPath, "An unknown step can't be an active step.", sap.apf.core.constants.message.code.errorCheckWarning);
		if (bStepIsInPath) {
			if (this.stepIsActive(oStep) === false) {
				aActiveSteps.push(oStep);
			}
		}
	};

	/**
	 * @description removes an active step
	 * @param oStep
	 *            step reference of step which shall become inactive
	 */
	this.makeStepInactive = function(oStep) {
		var bStepIsActive = this.stepIsActive(oStep);
		oMessageHandler.check(bStepIsActive, "Only an active step can be removed from the active steps.", sap.apf.core.constants.message.code.errorCheckWarning);

		if (bStepIsActive) {
			var indexOfStep = jQuery.inArray(oStep, aActiveSteps);
			aActiveSteps.splice(indexOfStep, 1);
		}
	};

	/**
	 * @description Checks whether a step is active
	 * @param oStep Step reference
	 * @returns boolean
	 */
	this.stepIsActive = function(oStep) {
		var indexOfStep = jQuery.inArray(oStep, aActiveSteps);
		if (indexOfStep >= 0) {
			return true;
		}
		return false;
	};

	/**
	 * @description checks whether a step is in the path
	 * @param oStep
	 *            step reference
	 * @returns boolean
	 */
	this.stepIsInPath = function(oStep) {
		var indexOfStep = jQuery.inArray(oStep, aStepInstances);
		if (indexOfStep >= 0) {
			return true;
		}
		return false;
	};
	/**
	 * @description Gets all active steps in an analysis path. 
	 * @return array of steps
	 */
	this.getActiveSteps = function() {
		return jQuery.extend(true, [], aActiveSteps);
	};
	/**
	 * @description The cumulative filter up to the active step (inclusive) is returned
	 * @returns {sap.apf.core.utils.Filter} cumulativeFilter
	 */
	this.getCumulativeFilterUpToActiveStep = function() {
		var deferred = jQuery.Deferred();
		oCoreApi.getCumulativeFilter().done(function(oContextFilter){
			var oCumulatedFilter = oContextFilter.copy();
			var i, len = aStepInstances.length;
			for (i = 0; i < len; i++) {
				
				oCumulatedFilter = oCumulatedFilter.addAnd(aStepInstances[i].getFilter());
				if (that.stepIsActive(aStepInstances[i])) {
					deferred.resolve(oCumulatedFilter);
					return;
				}
			}
			deferred.resolve(oCumulatedFilter);  
		});
		return deferred.promise();
	};
	/**
	 * @description Moves a step in the analysis path to the specified target position. 
	 * @param oStep The step object to be moved
	 * @param nPosition The target position. Must be a valid position in the path, between zero and length-1.
	 * @param fnStepProcessedCallback Callback for update of steps.
	 */
	this.moveStepToPosition = function(oStep, nPosition, fnStepProcessedCallback) {
		var nIndexOfStep = jQuery.inArray(oStep, aStepInstances);
		var targetPosition = nPosition;
		// the step to be moved must be a step of the path
		oMessageHandler.check(typeof nPosition === "number" && nPosition >= 0 && nPosition < aStepInstances.length, "Path: moveStepToPosition invalid argument for nPosition");
		oMessageHandler.check(nIndexOfStep >= 0 && nIndexOfStep < aStepInstances.length, "Path: moveStepToPosition invalid step");
		if (nIndexOfStep === nPosition) {
			return;
		}

		aStepInstances.splice(nIndexOfStep, 1);
		aStepInstances.splice(targetPosition, 0, oStep);
		this.update(fnStepProcessedCallback);
	};

	/**
	 * @description Removes a step from the analysis path.  
	 * @param oStep The step object to be removed. The reference must be an object contained in the path. Otherwise, an error will be thrown.  
	 * @param fnStepProcessedCallback Callback for update of steps.
	 */
	this.removeStep = function(oStep, fnStepProcessedCallback) {
		var bStepIsInPath = this.stepIsInPath(oStep);
		var bStepIsActive = this.stepIsActive(oStep);
		var nIndexOfStep = jQuery.inArray(oStep, aStepInstances);

		// the step to be removed must be a step of the path
		oMessageHandler.check(bStepIsInPath, "Path: remove step - invalid step");
		aStepInstances.splice(nIndexOfStep, 1);
		if (bStepIsActive) {
			this.makeStepInactive(oStep);
		}
		this.update(fnStepProcessedCallback);
		oStep.destroy();
	};

	/**
	 * @description The steps in the path will be updated. First it is detected,  whether a representation (chart) of a step 
	 * has changed its selection. If yes, then all subsequent steps will get  a new (cumulated) selection for retrieving data. 
	 * If a step has a new cumulated selection for retrieving data, then
	 * an OData request is executed for the particular step and the representation receives new data.
	 * @param {function} fnStepProcessedCallback is a callback function. This callback function is executed for every step in the path.
	 * The first argument of the callback function is the step instance. The second argument is a flag, that indicates, whether there was 
	 * an update or not.
	 * @param {boole} bContextChanged indicates, that the context has been changed
	 */
	this.update = function(fnStepProcessedCallback, bContextChanged) {
		if (!aStepInstances[0]) {
			return;
		}
		var nCurrentUpdateCount;
		var oCurrentStep = aStepInstances[0];
		oCoreApi.getCumulativeFilter().done(function(oContextFilter){
			var oCumulatedFilter = oContextFilter.copy();

			if (bContextChanged === true) {
				return;
			}

			nUpdateCounter++;
			nCurrentUpdateCount = nUpdateCounter;
			oCurrentStep.update(oCumulatedFilter, callbackAfterRequest);

			function callbackAfterRequest(oResponse, bStepNotUpdated) {
				var nIndexOfCurrentStep = jQuery.inArray(oCurrentStep, aStepInstances);
				var oMessageObject;

				if (nCurrentUpdateCount === nUpdateCounter) {
					// handle the error
					if (oResponse instanceof Error) {

						var nStepNumberForDisplay = nIndexOfCurrentStep + 1;
						oMessageObject = oMessageHandler.createMessageObject({
							code : "5002",
							aParameters : [ nStepNumberForDisplay ],
							callingObject : oCurrentStep
						});
						oMessageObject.setPrevious(oResponse);

						oMessageHandler.putMessage(oMessageObject);
						oCurrentStep.setData({ data : [], metadata : undefined}, oCumulatedFilter);
						fnStepProcessedCallback(oCurrentStep, true);
						nIndexOfCurrentStep++;
						oCurrentStep = aStepInstances[nIndexOfCurrentStep];
						while (oCurrentStep) {
							oCurrentStep.setData({ data : [], metadata : undefined}, oCumulatedFilter);
							fnStepProcessedCallback(oCurrentStep, true);
							nIndexOfCurrentStep++;
							oCurrentStep = aStepInstances[nIndexOfCurrentStep];
						}
						return;
					}

					if (!bStepNotUpdated) {
						oCurrentStep.setData(oResponse, oCumulatedFilter);
					}
					fnStepProcessedCallback(oCurrentStep, !bStepNotUpdated);
					// callback fnStepProcessedCallback could trigger a new path update. So the condition
					// for processing the step update has to be checked again
					if (nCurrentUpdateCount !== nUpdateCounter) {
						return;
					}
					oCurrentStep.determineFilter(oCumulatedFilter.copy(), callbackFromStepFilterProcessing);
					
				}
			}
				
			function callbackFromStepFilterProcessing(oFilter)	 {
				var nIndexOfCurrentStep = jQuery.inArray(oCurrentStep, aStepInstances);
				
			    oCumulatedFilter.addAnd(oFilter);
					
				oCurrentStep = aStepInstances[nIndexOfCurrentStep + 1];
				if (oCurrentStep) {
					oCurrentStep.update(oCumulatedFilter, callbackAfterRequest);
				} else {
					oCumulatedFilter = undefined;
				}
			}
		});
	};
	/**
	 * @description Returns the path as serializable object containing the steps,  and the indices of the active steps. 
	 * @returns {object} Serializable path in the following format: { path : { steps: [serializableSteps],  indicesOfActiveStep:[num] }, context:serializableFilter}.
	 */
	this.serialize = function() {
		return {
			path : {
				steps : getSerializedSteps(),
				indicesOfActiveSteps : getIndicesOfActiveSteps()
			}	
		}; 
	};
	/**
	 * @description Restores a path with the information given in a serializable path object. 
	 * @param {object} oSerializablePath Serializable path in the following format: { path : { steps: [serializableSteps],  indicesOfActiveStep:[num] }, context:serializableFilter}.
	 * @returns undefined
	 */
	this.deserialize = function(oSerializablePath) {
		var oContextFilter;
		if(oSerializablePath.context) {
		    oContextFilter = new sap.apf.utils.Filter(oMessageHandler);
		    oContextFilter.deserialize(oSerializablePath.context);
		    oCoreApi.setContext(oContextFilter);
		}
		addStepsToPathAndDeserialize(oSerializablePath.path.steps, this);
		makeStepsActive(oSerializablePath.path.indicesOfActiveSteps, this);
	};

	// private functions
	function getIndicesOfActiveSteps() {
		var aIndicesOfActiveSteps = [];
		for( var i = 0; i < aStepInstances.length; i++) {
			for( var j = 0; j < aActiveSteps.length; j++) {
				if (aStepInstances[i] === aActiveSteps[j]) {
					aIndicesOfActiveSteps.push(i);
				}
			}
		}
		return aIndicesOfActiveSteps;
	}

	function getSerializedSteps() {
		var aSerializedSteps = [];
		for( var i = 0; i < aStepInstances.length; i++) {
			aSerializedSteps.push(aStepInstances[i].serialize());
		}
		return aSerializedSteps;
	}

	function addStepsToPathAndDeserialize(aSerializedSteps, oContext) {
		//deactivate update during deserialization
		var fnSave = oContext.update;
		oContext.update = function() {
		};
		var i = 0;
		for(i = 0; i < aSerializedSteps.length; i++) {
			oCoreApi.createStep(aSerializedSteps[i].stepId);
		}
		for(i = 0; i < aStepInstances.length; i++) {
			aStepInstances[i].deserialize(aSerializedSteps[i]);
		}

		//activate update after deserialization
		oContext.update = fnSave; 
	}
	function makeStepsActive(aIndicesOfActiveSteps, oContext) {
		for( var i = 0; i < aIndicesOfActiveSteps.length; i++) {
			var nIndex = aIndicesOfActiveSteps[i];
			oContext.makeStepActive(aStepInstances[nIndex]);
		}
	}
};
