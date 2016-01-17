define([], function() {
	"use strict";
	return {

		configure: function(mConfig) {},

		getDependencies: function(oDocument) {
			var oDependencies = [
				{
					library: "mocklib",
					version: "5.5.5"
				},
				{
					library: "anotherMocklib",
					version: "9.9.9"
				}];
			return Q(oDependencies);
		}
	};
});