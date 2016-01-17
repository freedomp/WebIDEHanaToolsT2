define({

	handlerForEvent01called : null,

	aEventsForEvent02 : [],

	init : function() {
	},

	eventHandlerMethod01 : function(oEvent) {
		this.handlerForEvent01called = oEvent;
	},

	eventHandlerMethod02_01 : function(oEvent) {
		var mEvent = {
			"handlerMethod" : "eventHandlerMethod02_01",
			"event" : oEvent
		};

		this.aEventsForEvent02.push(mEvent);

	},

	eventHandlerMethod02_02 : function(oEvent) {
		var mEvent = {
			"handlerMethod" : "eventHandlerMethod02_02",
			"event" : oEvent
		};

		this.aEventsForEvent02.push(mEvent);
	},

	eventHandlerMethod02_03 : function(oEvent) {
		var mEvent = {
			"handlerMethod" : "eventHandlerMethod02_03",
			"event" : oEvent
		};

		this.aEventsForEvent02.push(mEvent);
	},

	wasHandlerForEvent01called : function() {
		return this.handlerForEvent01called;
	},

	wereHandlerForEvent02called : function() {
		return this.aEventsForEvent02;
	}

});