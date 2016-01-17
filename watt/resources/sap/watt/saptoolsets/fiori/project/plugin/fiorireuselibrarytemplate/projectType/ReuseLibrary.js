define(["sap/watt/lib/lodash/lodash"], function(_) {
	"use strict";

	return {
		isAvailable: function() {
			var that = this;
			return this.context.service.selection.assertNotEmpty().then(function(aSelection) {
				var oDocument = aSelection[0].document;
				return that.context.service.projectType.getProjectTypes(oDocument).then(function(aProjectTypes){
                   return _.find(aProjectTypes, "id", "com.watt.uitools.plugin.reuselibrary") ? true : false;
				});
			});
		},

		isEnabled: function() {
           return false;
		}
	};

});