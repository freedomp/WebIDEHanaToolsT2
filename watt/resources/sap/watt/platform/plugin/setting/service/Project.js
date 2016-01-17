define(function() {
	"use strict";

	return sap.ui.base.Object.extend("sap.watt.plarform.setting.service.Project", {

		_oFile : null,
		_oSelectedDocument : null,
		_oDao : null,

		init : function() {
			this._oFile = this.context.service.filesystem.documentProvider;
		},
		
		configure : function(mConfig) {
            if (mConfig && mConfig.dao) {
                this._oDao = mConfig.dao.service;
            }
			//needs for extended implementation
            return Q();
		},

		setProjectSettings : function(sSettingName, oSettings, oDocument) {
		    oDocument = oDocument || this._oSelectedDocument;
            // Storing the data
			return this._oDao.set(sSettingName, oSettings, oDocument);
		},

		set : function(oService, vSettings, oDocument) {
            return this.setProjectSettings(this._getServiceName(oService), vSettings, oDocument);
		},

		getProjectSettings : function(sSettingName, oDocument, bReturnEmptyOnError) {
			bReturnEmptyOnError = (bReturnEmptyOnError === true);
		    oDocument = oDocument || this._oSelectedDocument;
		    return this._oDao.get(sSettingName, oDocument, bReturnEmptyOnError)
				.fail(function(){
					return null;
				});
		},

		get : function(oService, oDocument, bReturnEmptyOnError) {
			return this.getProjectSettings(this._getServiceName(oService), oDocument, bReturnEmptyOnError);
		},

		_getServiceName : function(oService) {
			return oService.getProxyMetadata().getName();
		},

		onSelectionChanged : function(oEvent) {
			var oDocument = oEvent.params.selection[0] ? oEvent.params.selection[0].document : null;
			if (oDocument) {
				this._oSelectedDocument = oDocument;
			}
		}
	});
});