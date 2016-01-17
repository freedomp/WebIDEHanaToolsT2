define(function() {
	return function() {
		return {
			executed : false,
			vValue : undefined,
			oWindow : undefined,
			enabled : true,
			available : true,
			throwError : "",
			isAvailableCalled : false,
			isEnabledCalled : false,

			execute : function(vValue, oWindow) {
				this.executed = true;
				this.vValue = vValue;
				this.oWindow = oWindow;
				if (this.throwError !== "") {
					throw new Error(this.throwError);
				}
			},

			isAvailable : function() {
			    this.isAvailableCalled = true;
				return this.available;
			},

			isEnabled : function() {
			    this.isEnabledCalled = true;
				return this.enabled;
			},

			reset : function() {
				this.executed = false;
				this.vValue = undefined;
				this.oWindow = undefined;
				this.enabled = true;
				this.available = true;
				this.isAvailableCalled = false;
				this.isEnabledCalled = false;
			}
		};
	};
});