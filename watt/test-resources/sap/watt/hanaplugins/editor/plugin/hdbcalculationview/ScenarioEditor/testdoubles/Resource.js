define(function() {
	"use strict";
	return {
		_mIncludedStyles : {},
		_sDefaultStyleType : "css",
		_mIncludeStyleType : {
			"css" : function(sUri) {
				var oDefered = Q.defer();
				oDefered.resolve();  // on PhantomJS includeStyleSheet never triggers a callback
				jQuery.sap.includeStyleSheet(sUri, null, function() {
				// 	oDefered.resolve();
				}, function() {
				// 	oDefered.reject(new Error("Could not load the CSS file from " + sUri));
				});
				return oDefered.promise;
			},
			"less" : function(sUri) {
				throw new Error("Less support is not yet implemented");
			}
		},

		includeStyles : function(aStyles) {
			var that = this;
			var aPromises = [];
			jQuery.each(aStyles, function(iIndex, mStyle) {
				var sUri = require.toUrl(mStyle.uri);
				if (!that._mIncludedStyles[sUri]) {
					that._mIncludedStyles[sUri] = mStyle;
					var sType = mStyle.type || that._sDefaultStyleType;
					aPromises.push(that._mIncludeStyleType[sType].call(that, sUri));
				}
			});
			return Q.all(aPromises);
		}
	};
});