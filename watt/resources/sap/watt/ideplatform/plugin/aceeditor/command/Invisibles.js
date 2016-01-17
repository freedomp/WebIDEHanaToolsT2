define({
	execute: function () {
		return this._getCodeEditor().then(function(oEditor) {
			if (oEditor) {
				return oEditor.toggleShowInvisibles();		
			} else {
				return Q();
			}
		});		
	},

	isAvailable: function () {
		return true;
	},

	isEnabled: function () {		
		return this._getCodeEditor().then(function(oEditor) {
			if (oEditor) {
				return oEditor.getVisible().then(function(visible) {
					if (visible){
						return visible;
					} else {
						return false;
					}
				});			
			} else {
				return false;
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