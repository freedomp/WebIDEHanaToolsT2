define({
	isEnabled: function () {
		return this._getCodeEditor().then(function(oEditor) {
			if (oEditor) {
				return Q(true);
			}
			return Q(false);
		});
//		return Q(this.context.service.aceeditor.getVisible());
	},
	execute : function() {		
		return this._getCodeEditor().then(function(oCurrentEditorInstance) {			
			if (oCurrentEditorInstance) {
				return oCurrentEditorInstance.showFind();
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
