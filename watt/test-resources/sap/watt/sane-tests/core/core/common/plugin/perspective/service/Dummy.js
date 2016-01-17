define(
		["sap/watt/common/plugin/platform/service/ui/AbstractPart"],
	function(AbstractPart) {
		"use strict";

		return  AbstractPart.extend("dummy", {
			getContent : function(){
				 return new sap.ui.core.HTML({});
			}
			
		});
	});