define({

	init : function() {
	},

	method01 : function(sParam01) {
		return "something";
	},

	method02 : function(sParam01) {
		return "something else";
	},

	triggerFireEvent01 : function() {
		this.context.event.fire("event01", {
			param01 : "aValueForParam01"
		});
	},

	triggerFireEvent02 : function(Param01) {
		this.context.event.fireEvent02({
			param01 : "aValueForParam01",
			param02 : "aValueForParam02"
		});
	}

});