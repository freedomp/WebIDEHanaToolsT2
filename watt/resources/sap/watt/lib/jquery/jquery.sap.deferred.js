/*!
 * @copyright@
 */

/*
 * Provides convenience functions for deferred function executions, based on the jQuery.Deferred() function.
 */
jQuery.sap.declare("jquery.sap.deferred", false);

(function() {

	/**
	 * Convenience wrapper around <code>jQuery.Deferred()</code> that avoids the need for creation and handling of the
	 * deferred object. The original callback method is wrapped and when invoked called with the original arguments, plus the
	 * the jQuery.Deferred() object as the last argument. The return value of the wrapped method is the promise of the deferred
	 * object.
	 *
	 * @param {function} fnCallback the callback function. Called with the original arguments, plus the jQuery.Deferred() object
	 * 					 as the last argument. The return value is the promise of the deferred object.
	 * @return {function} a wrapper function for the callback function 
	 *
	 * @public
	 */
	jQuery.sap.deferred = function deferred(fnCallback) {
		return function() {
			var oDeferred = jQuery.Deferred();
			var aArgs = Array.prototype.slice.call(arguments);
			aArgs.push(oDeferred);
			fnCallback.apply(this, aArgs);
			return oDeferred.promise();
		};
	};

}());