(function() {

	"use strict";
	sap.ui.controller("sap.watt.toolsets.plugin.javascript.view.JSOutlineTree", {

		_oContext: undefined,
		_oModel: new sap.ui.model.json.JSONModel(),
		_oEditor: null,
		_lastNodeSelected: null,
		_lastNodeDataSelected: null,

		onInit: function() {
 
		},

		init: function() {

		},

		initOutline: function(oAST, oEditor) {
			var oView = this.getView();
			oView.setModel(this._oModel);
			// set the data to the model
			this._oModel.setData(oAST);
			this._oEditor = oEditor;

		},

		cleanOutline: function() {
			this._oModel.setData(null);
		},

		onAfterRendering: function() {

		},
		_changeIcon: function(node, nodeData, lastNodeSelected, lastNodeData) {
			if (nodeData && node) {
				if (nodeData.type === "object" || nodeData.type === "var") {
					node.setProperty("icon", null);
				}
				if (nodeData.type === "function") {
					node.setProperty("icon", "resources/sap/watt/toolsets/plugin/javascript/images/funcSelected.png");
				}

			}

			if (lastNodeSelected && lastNodeSelected !== null && lastNodeData && lastNodeData !== null && node.sId !== lastNodeSelected.sId) {
				if (lastNodeData.type === "object" || lastNodeData.type === "var") {
					lastNodeSelected.setProperty("icon", null);
				}
				if (lastNodeData.type === "function") {
					lastNodeSelected.setProperty("icon", "resources/sap/watt/toolsets/plugin/javascript/images/func.png");
				}

			}

		},
		selectNode: function(oEvent) {

			var nodeSelected = oEvent.oSource.getSelection();

			var context = oEvent.getParameter("nodes")[0].getBindingContext();
			var path = context.sPath;
			var pathData = context.getProperty(path);

			this._changeIcon(nodeSelected, pathData, this._lastNodeSelected, this._lastNodeDataSelected);
			this._lastNodeSelected = nodeSelected;
			this._lastNodeDataSelected = pathData;

			if (this._oEditor && this._oEditor !== null) {
				var oSelection = this._oEditor.getSelection();
				var oRange = {
					start: {
						row: pathData.startRow - 1,
						column: pathData.startColumn
					},
					end: {
						row: pathData.endRow - 1,
						column: pathData.endColumn
					}
				};

				oSelection.setSelectionRange(oRange);
			}
			this._oEditor.oEditor.scrollToLine(pathData.startRow - 1, true, true, null);

		}

	});
}());