/** Copyright © 2015 SAP SE or an affiliate company. All rights reserved.**/

define(["sap.watt.ideplatform.intellisence/service/Config"],

    function(Config) {

        "use strict";

    jQuery.extend(Config.prototype, {
        // @changed: overwrite getUserSetting to set hintCode = false for SqlCodeCompletion
		getUserSetting : function(){
		    var that = this;
		    return this.checkSqlCodeCompletion().then(function(bIsSqlCodeCompletion){
		        var oSqlSetting = {};
		        if(bIsSqlCodeCompletion){
	                oSqlSetting.hintCode = false;
		        }
    			if (that._oSetting) {
    			    jQuery.extend(that._oSetting, oSqlSetting);
    				return that._oSetting;
    			} else {
    				return that._oPreferenceModel.beginSession().then(function(oSetting){
    					if (!oSetting) {
    						return that.context.service.intellisence.getSetting().then(function(oSetting){								
    							that._oSetting = oSetting;
    							jQuery.extend(that._oSetting, oSqlSetting);
    							return that._oSetting;
    						});
    					} else {
    						that._oSetting = oSetting;
    						jQuery.extend(that._oSetting, oSqlSetting);
    						return that._oSetting;
    					}
    				});
    			}
		    });
		},
		
		checkSqlCodeCompletion: function(){
		    return this.context.service.intellisence.getCodeCompletion().then(function(oCodeCompletionServ) {
        	    return oCodeCompletionServ && oCodeCompletionServ.instanceOf("sap.hana.cst.common.sqlcodecompletion.interface.SqlCodeCompletion");
		    });
		}
	});
	
	return Config;
});
