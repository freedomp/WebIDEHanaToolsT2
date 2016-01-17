define({

	/**
	 * Returns Schemata tree nodes where each node contains EntitySets tree Nodes and Action tree node with Function imports  
	 * @param oServiceMetadata object
	 * @returns the required Schemata tree nodes of the service
	 */
	getApplicationDetailsTreeNodes : function(oParsedAST, oContext) {

		return this._getApplicationDetailsNodes(oParsedAST, false, oContext);
	},

	/**
	 * Returns Schemata tree nodes where each schema node contains EntitySets Nodes with properties and Action node with Function imports  
	 * @param oServiceMetadata object
	 * @returns the required Schemata tree nodes of the service
	 */
	getCatalogApplicationTreeNodes : function(oParsedAST, oContext) {

		return this._getApplicationDetailsNodes(oParsedAST, true, oContext);

	},

	_getApplicationDetailsNodes : function(oParsedAST, bPopulatedNestedEntitiesNodes, oContext) {
		var aNamespaces = [];
		var that = this;
		var oRoot = oParsedAST.getRoots()[0];
		var oNameSpaces = oRoot.getNestedContexts();

		if (oNameSpaces) {
			oNameSpaces.forEach(function(oNameSpace) {
				var oNamespaceNode = new sap.ui.commons.TreeNode({
					text : oNameSpace.name,
					hasExpander : true,
					expanded : true,
					icon : require.toUrl("sap.watt.saptoolsets.fiori.project.servicecatalog/img/folder_grey_16.png")
				//"sap-icon://folder",			
				});

				that._populateNameSpace(oNamespaceNode, oNameSpace, bPopulatedNestedEntitiesNodes);

				aNamespaces.push(oNamespaceNode);
			});
		} else {
			this._errorHandler(oContext.i18n.getText("i18n", "invalid_RDL_application"));
		}
		return aNamespaces;
	},

	_populateNameSpace : function(oNamespaceNode, oNameSpace, bPopulatedNestedEntitiesNodes) {
		var that = this;
		var aNestedEntities = oNameSpace.getNestedEntities();
		if (aNestedEntities && aNestedEntities.length > 0) {
			this._populateNode(oNamespaceNode, this._getNestedEntitiesNodes(aNestedEntities, bPopulatedNestedEntitiesNodes));
		}

		var aNestedActions = oNameSpace.getActions();
		if (aNestedActions && aNestedActions.length > 0) {
			this._populateNode(oNamespaceNode, this._getActionNodes(aNestedActions));
		}

		var aNestedNamespaces = oNameSpace.getNestedContexts();
		if (aNestedNamespaces && aNestedNamespaces.length > 0) {
			aNestedNamespaces.forEach(function(oNestedNamespace) {
				var oNestedNamespaceNode = new sap.ui.commons.TreeNode({
					text : oNestedNamespace.name,
					hasExpander : true,
					expanded : false,
					icon : require.toUrl("sap.watt.saptoolsets.fiori.project.servicecatalog/img/folder_grey_16.png")
				//"sap-icon://folder",			
				});
				oNamespaceNode.addNode(oNestedNamespaceNode);
				that._populateNameSpace(oNestedNamespaceNode, oNestedNamespace, bPopulatedNestedEntitiesNodes);
			});

		}
	},

	_getActionNodes : function(aActions) {

		var oActionNode = new sap.ui.commons.TreeNode({
			text : "Actions",
			hasExpander : true,
			expanded : false,
			icon : require.toUrl("sap.watt.saptoolsets.fiori.project.servicecatalog/img/function.png")
		//"sap-icon://open-command-field",
		});

		aActions.forEach(function(oAction) {
			oActionNode.addNode(new sap.ui.commons.TreeNode({
				hasExpander : false,
				text : oAction.name,
				expanded : false,
				icon : require.toUrl("sap.watt.saptoolsets.fiori.project.servicecatalog/img/function.png")
			//"sap-icon://open-command-field",
			}));
		});

		return [ oActionNode ];
	},

	_getNestedEntitiesNodes : function(aNestedEntities, bPopulateNestedEntitiesNodes) {
		var aNestedEntitiesNodes = [];
		var that = this;

		if (aNestedEntities) {
			aNestedEntities.forEach(function(oNestedEntity) {
				var oNestedEntityNode = new sap.ui.commons.TreeNode({
					hasExpander : bPopulateNestedEntitiesNodes,
					expanded : false,
					text : oNestedEntity.name,
					icon : require.toUrl("sap.watt.saptoolsets.fiori.project.servicecatalog/img/entity-set.png")
				//"sap-icon://multiselect",
				});
				if (bPopulateNestedEntitiesNodes) {
					var aElements = oNestedEntity.getElements();
					if (aElements && aElements.length > 0) {
						that._populateNode(oNestedEntityNode, that._getElementNodesOfNestedEntity(aElements));
					}
					var aNestedActions = oNestedEntity.getActions();
					if (aNestedActions && aNestedActions.length > 0) {
						that._populateNode(oNestedEntityNode, that._getActionNodes(aNestedActions));
					}
				}

				aNestedEntitiesNodes.push(oNestedEntityNode);
			});
		}
		return aNestedEntitiesNodes;
	},

	_populateNode : function(oNode, aChildNodes) {
		aChildNodes.forEach(function(oChildNode) {
			oNode.addNode(oChildNode);
		});
	},

	_getElementNodesOfNestedEntity : function(aElements) {
		var aElementsNodes = [];
		var aSimpleElementsNodes = [];

		aElements.forEach(function(oElement) {
			if (oElement.isKey) {
				aElementsNodes.push(new sap.ui.commons.TreeNode({
					text : oElement.name,
					hasExpander : false,
					icon : require.toUrl("sap.watt.saptoolsets.fiori.project.servicecatalog/img/key.gif")
				//"sap-icon://documents",//'plugin/servicecatalog/img/property.png'
				}));
			} else {
				aSimpleElementsNodes.push(new sap.ui.commons.TreeNode({
					text : oElement.name,
					hasExpander : false,
					icon : require.toUrl("sap.watt.saptoolsets.fiori.project.servicecatalog/img/property.png")
				//"sap-icon://documents",//'plugin/servicecatalog/img/property.png'
				}));
			}
		});
		aElementsNodes.push.apply(aElementsNodes, aSimpleElementsNodes);
		return aElementsNodes;
	},

	_errorHandler : function(oError) {
		throw new Error(oError);
	}

});
