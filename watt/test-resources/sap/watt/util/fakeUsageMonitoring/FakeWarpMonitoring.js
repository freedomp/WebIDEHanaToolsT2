define([], function() {

	"use strict";

	return {

		setCustomProperties: function(oIDEData) {
            return oIDEData;
		},

		report: function(sEventComponent, sEventType, sEventValue, e2eTime) {
            return {
                eventComponent : sEventComponent,
                eventType : sEventType,
                eventValue : sEventValue,
                e2eTime : e2eTime
            };
		}
	};
});