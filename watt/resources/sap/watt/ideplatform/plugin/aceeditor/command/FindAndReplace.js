define({
	isEnabled: function () {
		return this._getCodeEditor().then(function(oEditor) {
			if (oEditor) {
				return Q(true);
			}
			return Q(false);
		});
	},
	execute : function() {
		return this._getCodeEditor().then(function(oCurrentEditorInstance) {
			if (oCurrentEditorInstance) {
				return oCurrentEditorInstance.showReplace();
			} else {
				return Q();
			}
		});
	},
	_getCodeEditor: function(){
		return this.context.service.selection.getOwner().then(function(oCurrentEditorInstance) {					
			if (oCurrentEditorInstance && oCurrentEditorInstance.instanceOf && oCurrentEditorInstance.instanceOf("sap.watt.common.plugin.aceeditor.service.Editor")) {
				return oCurrentEditorInstance;
			} else {
				return null;
			}			
		});
	}	
});
