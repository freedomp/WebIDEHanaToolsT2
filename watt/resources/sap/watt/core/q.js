define(["sap/watt/lib/q/q", "./DebugHooks"], function(Q, debugHooks) {
	"use strict";

	if (Q.sap) {
		throw new Error("Q.sap namespace is already defined");
	}
	
	Q.sap = {};
	
	Q.sap.getURLParameter = function (name) {
		// We are not allowed to use URI.js (from UI5) in core, so parse the params by hand 
		return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [null , "" ])[1].replace(
				/\+/g, '%20'))
				|| null;
	};

	function disableMethods (disabledMethods, currentPrototype) {
		for (var i = 0; i < disabledMethods.length; i ++) {
			var currentMethod = disabledMethods[i];
			if (typeof currentPrototype[currentMethod] === "function") {
				currentPrototype[currentMethod] = function () {
					throw new Error("The method " + currentMethod + " of "+ currentPrototype.constructor.name + " was disabled by Web IDE core team. If you have some use case that needs this method please inform us.");
				};
			} else {
				throw new Error("Trying to disable non-existent functionality");
			}
		}
	}

	if (typeof Q.getBluebirdPromise === "function") {
		var Promise = Q.getBluebirdPromise();
		// Disable unwanted bluebird core features
		disableMethods(['bind','break','call','cancel','catchReturn','catchThrow','error'], Promise.prototype);
		disableMethods(['deferred','fulfilled','pending'], Q);
		
		// Configure bluebird
		var debugMode = !!Q.sap.getURLParameter("sap-ide-debug-async") || !!Q.sap.getURLParameter("debugAsync");
		if (debugMode) {
			Q.getBluebirdPromise().config({
			    warnings: false,
			    longStackTraces: debugMode
			});
			// TODO: DebugHooks can not be optionally loaded because requirejs is not configured at this stage
			// when this functionality will be moved to Global.js it could be done
			//require(["./DebugHooks"], function (debugHooks) {
			debugHooks.hookToBluebird(Promise, {
			    maxChainLength: debugMode ? 1000 : false,
			    maxPendingPromises: debugMode ? 10000 : false,
			    tracing: debugMode,
			    monitor: debugMode
			});
			//});
		}
	} else {
		throw new Error("bluebird-q adapter is missing in lib/q.js");
	}
	
	//Queue utility, it will take operations and queue them, 
	//even if an error occurs it will continue with the next
	Q.sap.Queue = function() {
		this._oPromise = Q();
	};
	Q.sap.Queue.prototype.next = function(fnOperation) {
		this._oPromise = this._oPromise.then(fnOperation, fnOperation);
		return this._oPromise;
	};

	/**
	 * Wrapper function for JQuery.ajax. Errors are properly converted into an Error object
	 * @param {string} sUri The URL to call
	 * @param {Object} mOptions Additional options
	 * @returns {Promise} Promise which returns an array with the return data & the xhr object (use spread)
	 */
	Q.sap.ajax = function(sUri, mOptions) {
		if (mOptions && (mOptions.data && (mOptions.data instanceof Blob || mOptions.data instanceof ArrayBuffer) ||
			mOptions.responseType && (mOptions.responseType !== "text" && mOptions.responseType !== "json"))) {
			// jQuery.ajax does not support binary data transfer, so we need to use the direct API
			var oRequest;
			//FIXME Current Sinon version does not handle responseType and response attributes properly so BLOBs are not working at all
			//In case Sinon is loaded we have to bypass it immediately
			if (window.sinon && window.sinon.xhr && window.sinon.xhr.workingXHR) {
				oRequest = new window.sinon.xhr.workingXHR();
			} else {
				oRequest = new XMLHttpRequest();
			}
			var sMethod = (mOptions && mOptions.stype || "GET").toUpperCase();
			oRequest.open(sMethod, sUri, true);
			var mHeader = mOptions.headers || {};
			if (mOptions.data instanceof Blob && mOptions.data.type) {
				mHeader["Content-Type"] = oData.type;
			}
			for (var header in mHeader) {
				oRequest.setRequestHeader(header, mHeader[header]);
			}

			if (mOptions.responseType) {
				oRequest.responseType = mOptions.responseType;
			}

			var that = this;
			var oDeferred = Q.defer();

			// - actual sinon.js version in sapui5 is not capable of onload.
			oRequest.onreadystatechange = function() {
				if (this.readyState !== 4) {
					return;
				}

				if (this.status < 300 && this.status >= 200) {
					oDeferred.resolve([this.response, oRequest, oRequest.statusText]);
				} else {
					oDeferred.reject(this.response);
				}
			};

			oRequest.send(mOptions.data);
			return oDeferred.promise;

		} else {
			var oXHR = jQuery.ajax(sUri, mOptions);
			var oDefer = Q.defer();
			//jQuery.then returns more fields which violates promise spec and rejects without a real error
			//So we need a defer to convert properly
			oXHR.then(function(data, textStatus, jqXHR) {
				delete oXHR.then; //Prevent that Q thinks this is a promise
				oDefer.resolve([data, oXHR, textStatus]);
			}, function(jqXHR, textStatus, errorThrown) {
				//Turn the XHR into an exception with a message
				var sMessage = (oXHR.responseJSON && oXHR.responseJSON.Message) ? "\n\nMessage: " + oXHR.responseJSON.Message : "";
				var oError = new Error("Request failed: " + oXHR.statusText + " URI: " + sUri + sMessage);
				oError.status = oXHR.status;
				oError.statusText = oXHR.statusText;
				oError.responseText = oXHR.responseText;
				oError.responseJSON = oXHR.responseJSON;
				oError.textStatus = textStatus;
				oError.errorThrown = errorThrown;
				oDefer.reject(oError);
			});
			return oDefer.promise;
		}
	};

	/**
	 * Wrapper function for require.js. Works on a single dependency only to allow better error tracking.
	 * Use Q.all( ).spread( ) to require several modules
	 * @param {string} sModule The module to require
	 * @param {boolean] bNoVerify Suppress verification for cases where no module is defined
	 * @returns {Promise} Promise which returns the module
	 */
	Q.sap.require = function(sModule, bNoVerify) {
		var oDeferred = Q.defer();
		require([sModule], function(oModule) {
			if (!oModule && !bNoVerify) {
				oDeferred.reject(new Error(sModule + " could not be loaded. The file exists," +
					" but is either defining a module with a different name or not defining anything. Please remove the module name or add the missing define."
				));
			} else {
				oDeferred.resolve(oModule);
			}
		}, function(oError) {
			oDeferred.reject(new Error("Error loading module from path '" + sModule + "'" + "\nOriginal error message: " + oError.message +
				"\nError stack: " + oError.stack + "\n -----------"));
		});
		return oDeferred.promise;
	};
	
	/**
	 * Wrapper function for sap.ui.define. Works on a single dependency only to allow better error tracking.
	 * Use Q.all( ).spread( ) for several modules
	 * @param {string} sModule The module to require
	 * @returns {Promise} Promise which returns the module
	 */
	Q.sap.ui = Q.sap.ui || {};
	Q.sap.ui.define = function(sModule) {
		var oDeferred = Q.defer();
		sap.ui.define([sModule], function(oModule) {
			if (!oModule) {
				oDeferred.reject(new Error(sModule + " could not be loaded. The file exists," +
					" but is either defining a module with a different name or not defining anything. Please remove the module name or add the missing define."
				));
			} else {
				oDeferred.resolve(oModule);
			}
		}, false);
		return oDeferred.promise;
	};
	
	return Q;
});