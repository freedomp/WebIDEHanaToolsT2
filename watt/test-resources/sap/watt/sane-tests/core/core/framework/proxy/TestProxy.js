define(function() {
	var TestImpl = function() {
		this._sFoo = "foo";
	};

	TestImpl.prototype.methodWhichFiresEventWithNoParams = function() {
		return this.context.event.fireEventWithNoParams({
			foo : "eventWithNoParams"
		});
	};

	TestImpl.prototype.methodWhichFiresEventWithParams = function() {
		return this.context.event.fireEventWithParams({
			"foo" : "foo",
			"bar" : "bar",
			"fooBar" : "fooBar"
		});
	};

	TestImpl.prototype.methodWhichFiresEventWithDeferredHandlers = function() {
		return this.context.event.fireEventWithDeferredHandlers().then(function() {
			return "promise resolved";
		});
	};

	TestImpl.prototype.getFoo = function() {
		return this._sFoo;
	};

	TestImpl.prototype.getProxyWithSyncMethods = function() {
		return this.context.create("testProxyWithSyncMethods", {
			"module" : "core/core/framework/proxy/TestProxyWithSyncMethods",
			"implements" : "core.core.framework.proxy.TestProxyWithSyncMethods"
		});
	};

	TestImpl.prototype.getFooPromise = function() {
		var oDeferred = Q.defer();
		var that = this;
		setTimeout(function() {
			oDeferred.resolve(that._sFoo);
		});
		return oDeferred.promise;
	};
	
	TestImpl.prototype.getFooPromisesArray = function() {
		var promissesArray = [];
		var defferedsArray = [];
		for (var i = 0; i < 5; i++) {
			defferedsArray[i] = Q.defer();
			promissesArray[i] = defferedsArray[i].promise;
			var that = this;
			setTimeout(function(j) { 
				return function() {
					defferedsArray[j].resolve(that._sFoo);
				};
			}(i));			
		}
		return promissesArray;
	};
	
	return TestImpl;
});