/*!
 * @copyright@
 */

/////////////////////
//// OPA - One Page Acceptance testing
//// Currently this is distributed with UI5 but it does not have dependencies to it.
//// The only dependency is jQuery. As i plan to get this into a separate repository, i did not use the UI5 naming conventions
/////////////////////
(function ($) {
	///////////////////////////////
	/// Privates
	///////////////////////////////
	var Opa,
		queue = [],
		context = {};

	function internalWait (fnCallback, oOptions, oDeferred) {
		// Increase the wait timeout in debug mode, to allow debugging the waitFor without getting timeouts
		if (window["sap-ui-debug"]){
			oOptions.timeout = 300; 
		}
		
		var startTime = new Date(),
			sId = setInterval(function () {

				var oResult = fnCallback();

				if (oResult.result) {
					clearInterval(sId);
					internalEmpty(oDeferred, sId);
				}

				var timeDiff = new Date() - startTime;

				// strip the milliseconds
				timeDiff /= 1000;

				var iPassedSeconds = Math.round(timeDiff % 60);

				if (oOptions.timeout > iPassedSeconds) {
					return;
				}

				clearInterval(sId);

				if (oOptions.error) {
					try {
						oOptions.error(oOptions, oResult.arguments);
					} finally {
						oDeferred.reject(oOptions, oResult.arguments);
					}
					return;
				}

				oDeferred.reject(oOptions);
			}, oOptions.pollingInterval);
	}

	function internalEmpty(deferred, sId) {
		if (queue.length === 0) {
			deferred.resolve();
			return true;
		}

		var queueElement = queue.shift();

		internalWait(queueElement.callback, queueElement.options, deferred);
	}

	function ensureNewlyAddedWaitForStatementsPrepended(iPreviousQueueLength){
		var iNewWaitForsCount = queue.length - iPreviousQueueLength;
		if (iNewWaitForsCount) {
			var aNewWaitFors = queue.splice(iPreviousQueueLength, iNewWaitForsCount);
			queue = aNewWaitFors.concat(queue);
		}
	}

	function createStack(iDropCount) {
		iDropCount = (iDropCount || 0) + 2;

		var oError = new Error();
		if (!oError.stack){
			//In IE an error has to be thrown first to get a stack
			try{
				throw oError()
			}catch(oError){
				//Nothing
			}
		}
		var stack = oError.stack.split("\n");
		stack.splice(0, iDropCount);
		return stack.join("\n");
	}
	///////////////////////////////
	/// Public
	///////////////////////////////


	/**
	 * @class One Page Acceptance testing.
	 * This class will help you write acceptance tests in one page or single page applications.
	 * You can wait for certain conditions to be met.
	 *
	 * @public
	 * @name sap.ui.test.Opa
	 * @author SAP SE
	 * @since 1.22
	 *
	 * @param extensionObject An object containing properties and functions. The newly created Opa will be extended by these properties and functions - see jQuery.extend.
	 */
	Opa = function(extensionObject) {

		this.and = this;
		$.extend(this, extensionObject);

	};

	Opa.prototype = {

		/**
		 * Gives access to a singleton object you can save values in.
		 *
		 * @name sap.ui.test.Opa#getContext
		 * @function
		 * @returns {object} the context object
		 * @public
		 */
		getContext : function () {
			return context;
		},

		/**
		 * Waits for a check condition to return true. Then a success function will be called.
		 * If check does not return true until timeout is reached, an error function will be called.
		 *
		 * @name sap.ui.test.Opa#waitFor
		 * @public
		 * @function
		 * @param {object} options containing check, success and error function;
		 * properties:
		 * <ul>
		 * 	<li>timeout: default 15 (seconds) specifies how long the waitFor function polls before it fails</li>
		 * 	<li>pollingInterval: default 400 (milliseconds) specifies how often the waitFor function polls</li>
		 * 	<li>check: function will get invoked in every polling interval. If it returns true, the check is successful and the polling will stop</li>
		 * 	<li>success: function will get invoked after the check function returns true. If there is no check function defined, it will be directly invoked</li>
		 * 	<li>error: function will get invoked, when the timeout is reached and check did never return a true.</li>
		 * </ul>
		 * @returns {jQuery.promise} a promise that gets resolved on success.
		 */
		waitFor : function (options) {
			var deferred = $.Deferred();
			options = $.extend({},
				Opa.config,
				options);

			var stackDropCount = options._stackDropCount || 0;
			options._stack = createStack(1 + stackDropCount);

			deferred.promise(this);

			queue.push({
				callback : jQuery.proxy(function () {
					var bResult = true;

					//no check - all ok
					if (options.check) {
						bResult = options.check.apply(this, arguments);
					}

					if (bResult) {
						if (options.success) {
							try {
								var iCurrentQueueLength = queue.length;
								options.success.apply(this, arguments);
							} finally {
								ensureNewlyAddedWaitForStatementsPrepended(iCurrentQueueLength);
								deferred.resolve();
							}
						} else {
							deferred.resolve();
						}

						return { result : true, arguments : arguments };
					}

					return {result : false, arguments : arguments };
				}, this),
				options : options
			});

			return this;
		},

		/**
		 * Calls the static extendConfig function in the Opa namespace
		 * @name sap.ui.test.Opa#extendConfig
		 * @returns
		 * @function
		 * @public
		 */
		extendConfig : function() {
			return Opa.extendConfig.apply(this, arguments);
		},

		/**
		 * Calls the static emptyQueue function in the Opa namespace
		 * @name sap.ui.test.Opa#emptyQueue
		 * @returns
		 * @public
		 * @function
		 */
		emptyQueue : function() {
			return Opa.emptyQueue.apply(this, arguments);
		}
	};

	/**
	 * Extends and overwrites default values of the Opa.config
	 * @name sap.ui.test.Opa#extendConfig
	 * @static
	 * @param {object} options the values to be added to the existion config
	 * @public
	 * @function
	 */
	Opa.extendConfig = function (options) {
		Opa.config = jQuery.extend(Opa.config, options);
	};

	/**
	 * Waits until all waitFor calls are done
	 * @name sap.ui.test.Opa#emptyQueue
	 * @static
	 * @function
	 * @returns {jQuery.promise} If the waiting was successful, the promise will be resolved. If not it will be rejected
	 * @public
	 */
	Opa.emptyQueue = function emptyQueue () {
		var deferred = $.Deferred();

		internalEmpty(deferred);

		return deferred.promise();
	};

	if (!sap) {
		sap = {};
	}
	if (!sap.ui) {
		sap.ui = {};
	}
	if (!sap.ui.test) {
		sap.ui.test = {};
	}

	sap.ui.test.Opa = Opa;

	/**
	 * the global configuration of Opa.
	 * All of the global values can be overwritten in an individual waitFor call.
	 * defaults are :
	 * <ul>
	 * 		<li>timeout : 15 seconds, is increased to 5 minutes if running in debug mode e.g. with URL parameter sap-ui-debug=true</li>
	 * 		<li>pollingIntervall: 400 milliseconds</li>
	 * </ul>
	 * @name sap.ui.test.Opa#config
	 * @function
	 * @static
	 * @public
	 */
	//create the default config
	Opa.config = {
			arrangements : new Opa(),
			actions : new Opa(),
			assertions : new Opa(),
			timeout : 15,
			pollingInterval : 400
		};
})(jQuery);
