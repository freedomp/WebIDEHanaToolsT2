define([], function() {
	"use strict";

	return {
		settingsNode : {},
		set : function(oSettings, sNode) {
			this.settingsNode[sNode] = oSettings;
			return Q(true);
		},
		get : function(sNode) {
			return Q(this.settingsNode[sNode]);
		},
		remove : function(sNode) {
			if (sNode && this.settingsNode[sNode]) {
				delete this.settingsNode[sNode];
			}
			return Q(true);
		}
	};
});
