define({

	create : function(sName, mConfig) {
		sName = sName || "repositoryBrowser";
		mConfig = jQuery.extend(mConfig || {}, {
			"implements" : "sap.watt.common.service.ui.Browser",
			"module" : "sap.watt.platform.repositorybrowser/service/RepositoryBrowser"
		});
		return this.context.create(sName, mConfig);
	}

});
