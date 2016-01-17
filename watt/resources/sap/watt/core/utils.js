/** reusable utils and instrumental functions
*/
define(function() {

	return {
		/** debounce function
			Debounced function fn will be invoked just once for multiple calls
			withing interval iWait
		*/
		debounce : function(fn, iWait, bNoWait) {
			var oTimeout,
				oRes;
			return function() {
				var oContext = this,
					args = arguments,
					fnCall = function() {
						// if returns promise, must be finalized here
						oRes = fn.apply(oContext, args);
						if (Q && Q.isPromise && Q.isPromise(oRes)) {
							oRes.done();
						}
					},
					fnDelayed = function() {
						oTimeout = null;
						if (!bNoWait) { 
							fnCall();
						}
					},
					bInvokeNow = bNoWait && !oTimeout;

				clearTimeout(oTimeout);
				oTimeout = setTimeout(fnDelayed, iWait);
				if (bInvokeNow) { 
					fnCall();
				}
			};
		}
	};

});