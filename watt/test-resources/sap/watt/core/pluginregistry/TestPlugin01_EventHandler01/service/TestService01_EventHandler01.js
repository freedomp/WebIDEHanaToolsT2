define({

	aEventsForEvent01 : [],

	aEventsForEvent02 : [],

	init : function() {
	},

	eventHandlerMethod01 : function(oEvent) {
		var mEvent = {
			"handlerMethod" : "eventHandlerMethod01",
			"event" : oEvent
		};

		this.aEventsForEvent01.push(mEvent);
	},

	eventHandlerMethod02_04 : function(oEvent) {
		var mEvent = {
			"handlerMethod" : "eventHandlerMethod02_04",
			"event" : oEvent
		};

		this.aEventsForEvent02.push(mEvent);
	},

	wasHandlerForEvent01called : function() {
		return this.aEventsForEvent01;
	},

	wereHandlerForEvent02called : function() {
		return this.aEventsForEvent02;
	}

});