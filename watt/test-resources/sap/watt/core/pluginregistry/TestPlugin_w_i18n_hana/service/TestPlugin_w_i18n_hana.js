define( {
	
	_oView : null,
	
	_sLocalizedConfig : null,
	
	configure : function(mConfig) {		
		_sLocalizedConfig= mConfig.configProperty[0];
	},
	
	getLocalizedConfigString : function(sKey) {
		return _sLocalizedConfig;
	},
	
	getTextFromSpecifiedI18nProperty : function(sKey) {
		return this.context.i18n.getText("i18n", sKey);
	},
	
	getTextFromDefaultI18nProperty : function(sKey) {
		return this.context.i18n.getText(sKey);
	}
});