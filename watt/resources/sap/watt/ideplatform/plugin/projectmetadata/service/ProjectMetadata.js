define([], function() {
	"use strict";
	return {

		_mProviders: {},

		configure: function(mConfig) {
			var that = this;
			mConfig.providers.forEach(function(mEntry) {
				that._mProviders[mEntry.projectType] = {
					provider: mEntry.provider
				};
			});

		},

		getDependencies: function(oDocument) {
			var that = this;
			var aPromises = [];
			return this.context.service.projectType.getProjectTypes(oDocument).then(function(aProjectTypes) {
				for (var i = 0; i < aProjectTypes.length; i++) {
					var sProjectType = aProjectTypes[i].id;
					if (that._mProviders[sProjectType]) {
						aPromises.push(that._mProviders[sProjectType].provider.getDependencies(oDocument));
					}
				}
				return Q.all(aPromises).then(function (aResult) {
					var oFlattenResult = [];
					for (i=0; i<aResult.length; i++) {
						oFlattenResult = oFlattenResult.concat(aResult[i]);
					}
					return oFlattenResult;
				});
			});

		}
	};
});