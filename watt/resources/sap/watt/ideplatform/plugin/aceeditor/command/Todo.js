define({
	execute: function() {
		var that = this;
		return this._getCodeEditor().then(function(oEditor) {
			if (oEditor) {
				return oEditor.addTodo().then(function(){
					that.context.service.focus.setFocus(oEditor);
				});
			} else {
				return Q();
			}
		});
	},

	_isSupported: function() {
	    var bSupported = false;
		return this._getCodeEditor().then(function(oEditor) {
		    if (oEditor) {
			    return Q.all([oEditor.getVisible(), oEditor.hasTodoTag()]).spread(function(bVisible, bTodoTag) {
    		        if (bVisible && bTodoTag) {
    		           	return oEditor.getCurrentFilePath().then(function(sFile) {
    						if (sFile && (sFile.match(/\.js$/) !== null || sFile.match(/\.xsjs$/) !== null || sFile.match(/\.xsjslib$/) !== null)) {
    							bSupported = true;
    						}
    					}); 
    		        }
			    });
		    }
		    return Q();
		}).then(function() {
		    return bSupported;
		});
		
	},

	isAvailable: function() {
		return this._isSupported();
	},

	isEnabled: function() {
		return this._isSupported();
	},
	_getCodeEditor: function() {
		return this.context.service.selection.getOwner().then(function(oCurrentEditorInstance) {
			if (oCurrentEditorInstance && oCurrentEditorInstance.instanceOf && oCurrentEditorInstance.instanceOf(
				"sap.watt.common.plugin.aceeditor.service.Editor")) {
				return oCurrentEditorInstance;
			} else {
				return null;
			}
		});
	}

});