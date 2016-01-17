define({
	_oCloneView : undefined,

	configure : function(mConfig) {
		this._aStyles = mConfig.styles;
		if (this._aStyles) {
			this.context.service.resource.includeStyles(this._aStyles).done();
		}
	},

	getContent : function() {
		if (!this._oCloneView) {
			this._oCloneView = sap.ui.view({
				viewName : "sap.watt.ideplatform.plugin.gitclient.view.GitCloneDialog",
				type : sap.ui.core.mvc.ViewType.JS,
				viewData : {
					service : this.context.service,
					context : this.context
				}
			});
		}

		return this._oCloneView;
	},

	getFocusElement : function() {
		return this.getContent();
	},

	doClone : function(sUrl, bGerritConfiguration) {
		if (!this._oCloneView) {
			this.getContent();
		}

		return this._oCloneView.getController().open(sUrl, bGerritConfiguration);
	}
});