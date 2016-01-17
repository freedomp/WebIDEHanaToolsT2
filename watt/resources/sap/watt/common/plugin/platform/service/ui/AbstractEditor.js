define(["sap/watt/common/plugin/platform/service/ui/AbstractPart"], function(AbstractPart) {
	"use strict";

	var AbstractEditor = AbstractPart.extend("sap.watt.common.plugin.platform.service.ui.AbstractEditor", {
		constructor : function() {
			this._oDocument = null;
		},

		getSelection : function(){
			return {document : this._oDocument};
		},

		getState : function() {
			// default state, means "OK"
			return null;
		},

		open : function(oDocument){
			this._oDocument = oDocument;
		},
		
		isRestorable : function() {
			return true;
		},

		isAvailable : function() {
			// TODO: Discuss: Should all UIParts have this check?
			return true;
		},

		close : function(){
			return this.context.event.fireClosed({
				document : this._oDocument
			});
		}
	});

	return AbstractEditor;
});
