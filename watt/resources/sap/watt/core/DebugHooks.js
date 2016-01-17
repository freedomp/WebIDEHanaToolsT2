define([], function() {

	var Promise = null;

	function ieAttachStack(oError) {
		//IE support, error has to be thrown to get stack
		// As try catch is not optimizable this is detached to optimize other browsers
		try {
			throw oError;
		} catch (ex) {
			// Now the error should have a stack
		}
	}

	var has = {}.hasOwnProperty;
	
	function getObjectKeys (o) {
        var ret = [];
        for (var key in o) {
            if (has.call(o, key)) {
                ret.push(key);
            }
        }
        return ret;
    }
	
	// Promise monitoring
	var pendingPromises = {};
	var promiseIdCounter = 0;

	function registerPromise() {
		if (Promise.monitor) {
			promiseIdCounter++;
			this._promiseId = promiseIdCounter;
			pendingPromises[promiseIdCounter] = this;
		}
	}

	function unregisterPromise() {
		if (Promise.monitor) {
			delete pendingPromises[this._promiseId];
		}
	}

	function enableMonitoring() {
		if (!Promise.monitor) {
			// Property that holds monitoring related info,
			// existence of it means that monitoring feature is currently enabled
			Promise.monitor = {};
			Promise.on("created", registerPromise, true);
			Promise.on("fulfilled", unregisterPromise, true);
			Promise.on("rejected", unregisterPromise, true);
			Promise.on("resolved", unregisterPromise, true);
			Promise.on("cancelled", unregisterPromise, true);
			Promise.monitor.getPendingPromises = function() {
				var result = [];
				var keys = getObjectKeys(pendingPromises);
				for (var i = 0; i < keys.length; i++) {
					result.push(pendingPromises[keys[i]]);
				}
				return result;
			};

			Promise.monitor.getLeafPendingPromises = function() {
				var pendingPromises = Promise.monitor.getPendingPromises();
				var leafPromises = [];
				for (var i = 0; i < pendingPromises.length; i++) {
					var currentPromise = pendingPromises[i];
					if (typeof currentPromise._promise0 === "undefined" &&
						typeof currentPromise._receiver0 === "undefined") {
						leafPromises.push(currentPromise);
					}
				}
				return leafPromises;
			};
		}
	}

	function disableMonitoring() {
		if (Promise.monitor) {
			// No reason to clean up the id's from pending promises
			Promise.off("created", registerPromise);
			Promise.off("fulfilled", unregisterPromise);
			Promise.off("rejected",	unregisterPromise);
			Promise.off("resolved",	unregisterPromise);
			Promise.off("cancelled", unregisterPromise);
			Promise.monitor = null;
			pendingPromises = null;
		}
	}

	// Chain length limit
	var chainLengthLimit = null;
	var exceptionChainLengthLimitHandler = function() {
		throw new Error("Promises chain is too long, it reached " +
			"limit of " + chainLengthLimit + " promises");
	};
	var chainLengthLimitHandler = exceptionChainLengthLimitHandler;

	function incrementChainLength(next) {
		if (typeof this._chainLength === "undefined") {
			this._chainLength = 0;
		}
		next._chainLength = this._chainLength + 1;
		if (next._chainLength > chainLengthLimit) {
			chainLengthLimitHandler();
		}
	}

	function enableChainLengthLimit(limit) {
		if (!chainLengthLimit) {
			chainLengthLimit = limit;
			Promise.on("chained", incrementChainLength, true);
			Promise.onChainLengthLimitExceeded =
				function(fn) {
					chainLengthLimitHandler = fn;
			};
		}
	}

	function disableChainLengthLimit() {
		if (chainLengthLimit > 0) {
			Promise.off("chained",
				incrementChainLength);
			chainLengthLimitHandler = exceptionChainLengthLimitHandler;
			chainLengthLimit = null;
		}
	}

	// Pending promises limit
	var pendingPromisesLimit = null;
	var pendingPromisesNumber = 0;
	var exceptionPendingPromisesLimitHandler = function() {
		throw new Error("Too many pending promises, it reached limit" +
			" of " + pendingPromisesLimit + " promises");
	};
	var pendingPromisesLimitHandler = exceptionPendingPromisesLimitHandler;

	function incrementPending() {
		if (pendingPromisesLimit > 0) {
			pendingPromisesNumber++;
			if (pendingPromisesNumber > pendingPromisesLimit) {
				pendingPromisesLimitHandler();
			}
		}
	}

	function decrementPending() {
		if (pendingPromisesLimit) {
			pendingPromisesNumber--;
		}
	}

	function enableMaxPendingPromises(limit) {
		if (pendingPromisesLimit) { return; }
		pendingPromisesLimit = limit;
		Promise.on("created", incrementPending, true);
		Promise.on("fulfilled", decrementPending, true);
		Promise.on("rejected", decrementPending, true);
		Promise.on("resolved", decrementPending, true);
		Promise.on("cancelled", decrementPending, true);
		Promise.onPendingPromisesLimitExceeded =
			function(fn) {
				pendingPromisesLimitHandler = fn;
		};
	}

	function disableMaxPendingPromises() {
		if (!pendingPromisesLimit) { return; }
		pendingPromisesLimit = null;
		pendingPromisesNumber = 0;
		pendingPromisesLimitHandler = exceptionPendingPromisesLimitHandler;
		Promise.off("created", incrementPending);
		Promise.off("fulfilled", decrementPending);
		Promise.off("rejected", decrementPending);
		Promise.off("resolved", decrementPending);
		Promise.off("cancelled", decrementPending);
	}

	// Promises tracing
	var tracingEnabled = false;
	var promiseTraceIdCounter = 0;

	function addTracingInfo(next) {
		if (!this._promiseId) {
			promiseTraceIdCounter++;
			this._promiseId = promiseTraceIdCounter;
		}
		if (!next._promiseId) {
			promiseTraceIdCounter++;
			next._promiseId = promiseTraceIdCounter;
		}
		if (!this._tracks) {
			this._tracks = [];
		}
		if (!next._trackedBy) {
			next._trackedBy = [];
		}
		this._tracks.push(next);
		next._trackedBy.push(this);
	}

	function findRootPromise(promise) {
		if (!promise._trackedBy || promise._trackedBy.length === 0) {
			return promise;
		} else if (promise._trackedBy.length !== 1) {
			console.warn("Promise " + promise._promiseId + " is tracked by more than one promise");
		}
		return findRootPromise(promise._trackedBy[0]);
	}

	// Recursive depth of this function is limited so it would produce
	// human-readable input and would not care about circles
	function getDOTGraphInternal(promise, depth) {
		var result = [];
		depth++;
		if (depth > 100) {
			return null;
		}

		var nodeName = null;
		var tooltip = "";
		if (promise._trace) {
			var stack = promise._trace.stack;
			tooltip = ",tooltip=\"" + stack.replace(/(?:\r\n|\r|\n)/g, '&#13;&#10;') + "\"";
			// Parse useful node name from stack
			// TODO: Get rid of library related frames in the beginning of stack
			var firstLine = stack.split("\n")[4].trim();
			var functionNameAndLocation = /at (.*) \(.*[\\\/](.*:.*:.*)\)/g;
			var match = functionNameAndLocation.exec(firstLine);
			if (!match || match.length !== 3) {
				nodeName = promise._promiseId;
			} else {
				nodeName = promise._promiseId + ": " + match[1] + " at " + match[2];
			}
		} else {
			nodeName = promise._promiseId;
		}
		var color = "";
		if (promise.isRejected()) { color = ",color=blue"; }
		if (promise.isPending()) { color = ",color=red"; }
		if (promise.isCancelled()) { color = ",color=gray"; }
		result.push(promise._promiseId + "[label=\"" + nodeName + "\"" + color + tooltip + "];");
		if (promise._tracks) {
			for (var i = 0; i < Math.min(promise._tracks.length, 1000); i++) {
				result.push(
					promise._promiseId + "->" + promise._tracks[i]._promiseId + ";");
				result = result.concat(getDOTGraphInternal(promise._tracks[i], depth));
			}
		}
		return result;
	}
	
	function getDOTGraph() {
		return "digraph promises {" +
			getDOTGraphInternal(findRootPromise(this), 0).join("\n") + "}";
	}

	function findWaitingFor() {
		if (!this.isPending()) {
			throw new Error("This promise is not waiting " +
				"for any other promise");
		}
		if (!this._tracks || this._tracks.length == 0) {
			return [this];
		} else {
			var foundWaitingFor = [];
			for (var i = 0; i < this._tracks.length; i++) {
				if (this.isPending()) {
					foundWaitingFor = foundWaitingFor.concat(
						this._tracks[i].findWaitingFor());
				}
			}
			return foundWaitingFor;
		}
	}

	function enableTracing() {
		if (!chainLengthLimit) {
			tracingEnabled = true;
			Promise.on("chained", addTracingInfo, true);
			Promise.prototype.findWaitingFor = findWaitingFor;
			Promise.prototype.getDOTGraph = getDOTGraph;
		}
	}

	function disableTracing() {
		if (chainLengthLimit) {
			tracingEnabled = false;
			promiseTraceIdCounter = 0;
			Promise.off("chained", addTracingInfo);
			Promise.prototype.findWaitingFor = null;
			Promise.prototype.getDOTGraph = null;
		}
	}

	function hookToBluebird(promise, opts) {
		Promise = promise;
		if ("monitor" in opts) {
			if (opts.monitor) {
				enableMonitoring();
			} else {
				disableMonitoring();
			}
		}
		if ("tracing" in opts) {
			if (opts.tracing) {
				enableTracing();
			} else {
				disableTracing();
			}
		}
		if ("maxChainLength" in opts) {
			if (opts.maxChainLength) {
				if (typeof opts.maxChainLength === "number") {
					enableChainLengthLimit(opts.maxChainLength);
				} else {
					enableChainLengthLimit(100000);
				}
			} else {
				disableChainLengthLimit();
			}
		}
		if ("maxPendingPromises" in opts) {
			if (opts.maxPendingPromises) {
				if (typeof opts.maxPendingPromises === "number") {
					enableMaxPendingPromises(opts.maxPendingPromises);
				} else {
					enableMaxPendingPromises(100000);
				}
			} else {
				disableMaxPendingPromises();
			}
		}
	}

	return {
		createStack: function createStack(iDropCount) {
			iDropCount = iDropCount || 0;
			iDropCount += 2;
			var ex = new Error();
			if (!ex.stack) {
				ieAttachStack(ex);
				iDropCount++;
			}
			var stack = ex.stack.split("\n");
			for (var i = 0; i < iDropCount; i++) {
				stack.shift();
			}
			return stack.join("\n");
		},
		hookToBluebird: hookToBluebird
	};
});