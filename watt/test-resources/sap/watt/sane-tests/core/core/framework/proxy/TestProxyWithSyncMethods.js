define(function() {
	var TestImpl = function() {
	};

	TestImpl.prototype.configure = function() {
	};
	
	TestImpl.prototype.asyncMethod = function() {
		return "this is a async value";
	};

	TestImpl.prototype.syncMethod = function() {
		return "this is a sync value";
	};

	return TestImpl;
});