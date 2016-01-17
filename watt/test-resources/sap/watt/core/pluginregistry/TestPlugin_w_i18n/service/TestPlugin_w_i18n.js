define( {
	
	_oView : null,
	
	_sLocalizedConfig : null,
	
	configure : function(mConfig) {		
		_sLocalizedConfig= mConfig.configProperty[0];
	},
	
	getLocalizedConfigString : function() {
		return _sLocalizedConfig;
	},
	
	getTextFromSpecifiedI18nProperty : function(sKey) {
		return this.context.i18n.getText("i18n", sKey);
	},
	
	getTextFromDefaultI18nProperty : function(sKey) {
		return this.context.i18n.getText(sKey);
	},
	
	getTextWithPlaceHolder: function(sKey, aArray) {
		return this.context.i18n.getText("i18n", sKey, aArray);
	},

	getContent: function() {
		this._initView();
		
		this.context.i18n.applyTo(this._oView);
		return this._oView;
	},
	
	getApplyToContent: function() {
		this._initView();
		this.context.i18n.applyTo(this._oView);
		return this._oView;
	},
	
	_initView: function() {
		if ( this._oView === null ) {
			this._oView = sap.ui.view({
				viewName : "test.watt.TestPlugin_w_i18n.view.I18n",
				type : sap.ui.core.mvc.ViewType.XML
			});
		}
	}
});