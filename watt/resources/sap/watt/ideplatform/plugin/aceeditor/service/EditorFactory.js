define({

	create : function(sName, mConfig) {
		sName = sName || "aceeditor";
		mConfig = jQuery.extend(mConfig || {}, {
			"implements" : "sap.watt.common.plugin.aceeditor.service.Editor",
			"module" : "sap.watt.ideplatform.aceeditor/service/EditorImpl"
		});
		return this.context.create(sName, mConfig);
	}
	
});