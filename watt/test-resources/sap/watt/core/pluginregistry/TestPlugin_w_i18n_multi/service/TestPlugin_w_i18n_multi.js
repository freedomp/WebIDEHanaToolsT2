define( {
	
	_oView : null,
	
	_sLocalizedConfig : null,
	
	configure : function(mConfig) {		
		_sLocalizedConfig= mConfig.configProperty[0];
	},
	
	getLocalizedConfigString : function() {
		return _sLocalizedConfig;
	},
	
	getTextFromSpecifiedI18nProperty : function(sName, sKey) {
		return this.context.i18n.getText(sName, sKey);
	}
});