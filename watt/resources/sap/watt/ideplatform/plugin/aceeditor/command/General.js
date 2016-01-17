define(function () {
	return {
		execute: function (name,context) {
			this.context=context;
			return this._getCodeEditor().then(function(oEditor) {
				if (oEditor) {
					return oEditor.executeCommand(name);		
				} else {
					return Q();
				}
			});		
		},

		isAvailable: function (context) {
			return true;
		},

		isEnabled: function (context) {	
			this.context=context;		
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
	};
});