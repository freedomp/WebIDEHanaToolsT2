define({
	execute: function () {
		var that = this;
		return this._getCodeEditor().then(function(oEditor) {
			if (oEditor) {
				return oEditor.toggleComment().then(function(){
					that.context.service.focus.setFocus(oEditor);
				});		
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
						return oEditor.getSelectionRange().then(function(range) {
							if (range){
								return true;
							} else {
								return false;
							}
						});
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