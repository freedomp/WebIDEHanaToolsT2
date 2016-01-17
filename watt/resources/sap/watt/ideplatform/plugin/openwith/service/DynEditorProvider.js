/**
 * DynEditorProvider
 *
 * This service delivers all the editors which are registered
 * for the given File-extention
 * Returns an array containing the Items of the contextmenu
 *
 **/
define([ "sap.watt.platform.commandgroup/module/ActionItem" ], function(ActionItem) {
	"use strict";
	return {
		getItems : function() {
			var that = this;
			var aEditors;
			return that.context.service.selection.assertNotEmpty()
                    .then(function(aSelection) {
                        // do not show the "open with" menu in the context menu for multi selection
                        if (aSelection.length > 1){
                            return [];
                        }
                        else{ // single selection
                            var oD = aSelection[0].document;
                            return that.context.service.editor.getAllEditors(oD)
                                .then(function(_aEditors) {
                                        aEditors = _aEditors;
                                        return that.context.service.command.getCommand("openwith");
                                    })
                                .then(function(oCommand) {
                                    if (aEditors) {
                                        var aItems = [];
                                        for ( var i = 0; i < aEditors.length; i++) {
                                            var sId = aEditors[i].service.getProxyMetadata().getName();
                                            oCommand.setValue(aEditors[i], sId);
                                            aItems[i] = new ActionItem({
                                                "id" : sId,
                                                "label" : aEditors[i].name
                                            }, oCommand);
                                        }
                                        return aItems;
                                    } else {
                                        return ([]);
                                    }
                                });
                        }
                    });
		}
	};
});