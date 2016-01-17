define({

	create : function(sName, mConfig) {
		// TODO: Add name to config
		sName = sName || "imageviewer";
		mConfig = jQuery.extend(mConfig || {}, {
			"implements" : "sap.watt.common.plugin.imageviewer.service.ImageViewer",
			"module" : "sap.watt.ideplatform.imageviewer/service/ImageViewerImpl"
		});
		return this.context.create(sName, mConfig);
	}

});