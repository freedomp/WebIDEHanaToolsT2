/**
 * DynSnippetProvider
 *
 * This service delivers all the snippets which are registered
 * for the given File-extention
 * Returns an array containing the Items of the contextmenu
 *
 **/
define([ "sap.watt.platform.commandgroup/module/ActionItem" ], function(ActionItem) {
	"use strict";
	return {

		_mCommandsValues : {},

		getItems : function() {
			var that = this;
			return this._getCodeEditor().then(function(oEditor) {
				if (!oEditor) {
					return [];
				}
				var oCurrentDocument;
				var sFileExtension;
				return oEditor.getSelection().then(function(oSelection) {
					oCurrentDocument = oSelection.document;
					sFileExtension = oCurrentDocument.getEntity().getFileExtension();
					return that.context.service.snippet.getAllSnippets(sFileExtension);
				}).then(function(aSnippets) {
					if (!aSnippets) {
						return [];
					}
					return that.context.service.command.getCommand("sap.watt.ideplatform.snippet.insertSnippet").then(function(oCommand) {
						var aItems = [];
						if (!that._mCommandsValues[sFileExtension]) {
							that._mCommandsValues[sFileExtension] = {};
						}
						for ( var i = 0; i < aSnippets.length; i++) {
							if (!that._mCommandsValues[sFileExtension][aSnippets[i].id]) {
								that._mCommandsValues[sFileExtension][aSnippets[i].id] = {
									snippetContent : aSnippets[i].content,
									preSnippetInsertionHandler : aSnippets[i].preSnippetInsertionHandler
								};
							}
							that._mCommandsValues[sFileExtension][aSnippets[i].id].currentDocument = oCurrentDocument;
							that._mCommandsValues[sFileExtension][aSnippets[i].id].currentEditor = oEditor;
							oCommand.setValue(that._mCommandsValues[sFileExtension][aSnippets[i].id], aSnippets[i].id);
							var aItem = new ActionItem({
								"id" : aSnippets[i].id,
								"label" : aSnippets[i].title
							}, oCommand);
							aItems.push(aItem);
						}
						return aItems;
					});
				});
			});
		},

		_getCodeEditor: function() {
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