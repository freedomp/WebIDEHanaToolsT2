define({

	_getServiceDetailsNodes : function(oServiceMetadata, bPopulatedEntitySetsNodes, oODataProvider, oI18n) {
		var aSchemata = [];
		var that = this;
		var schemata = oServiceMetadata.dataServices.schema;
		jQuery.sap.require("sap.m.Image");

		if (schemata) {
			schemata.forEach(function(oSchema) {
				var oSchemaNode = new sap.ui.commons.TreeNode({
				    selectable: false,
					text : oSchema.namespace,
					hasExpander : true,
					expanded : true,
					icon : require.toUrl("sap.watt.saptoolsets.fiori.project.servicecatalog/img/folder_grey_16.png") //"sap-icon://folder",

				});

				aSchemata.push(oSchemaNode);

				that._populateNode(oSchemaNode, that._getPopulatedEntitySetsNodes(oSchema, bPopulatedEntitySetsNodes, oServiceMetadata,
						oODataProvider));

				if (oSchema.entityContainer) {
					var aFunctionImports = oSchema.entityContainer[0].functionImport;
					if (aFunctionImports && aFunctionImports.length > 0) {
						oSchemaNode.addNode(that._getActionNode(aFunctionImports));
					}
				}

			});
		} else {
			this._errorHandler(oI18n.getText("i18n", "invalid_OData_service"));
		}
		return aSchemata;

	},

	_populateNode : function(oNode, aChileNodes) {
		aChileNodes.forEach(function(oChildNode) {
			oNode.addNode(oChildNode);
		});
	},

	/**
	 * Get entity types, properties and navigation properties 
	 */
	_getServiceEntityTypesNodes : function(aEntities) {

		var that = this;
		var aEntitieNodes = [];
		aEntities.forEach(function(oEntity) {
			var entityNode = new sap.ui.commons.TreeNode({
			    selectable: false,
				text : oEntity.name,
				hasExpander : true,
				expanded : false,
				icon : require.toUrl("sap.watt.saptoolsets.fiori.project.servicecatalog/img/entity-type.png")//"sap-icon://customer-financial-fact-sheet",
			});

			aEntitieNodes.push(entityNode);

			that._populateNode(entityNode, that._getPropertiesNodesOfEntityType(oEntity));

			// Add the navigation properties for each entity
			if (oEntity.navigationProperty) {
				oEntity.navigationProperty.forEach(function(oNavProperty) {
					entityNode.addNode(new sap.ui.commons.TreeNode({
					    selectable: false,
						text : oNavProperty.name,
						icon : "sap-icon://forward",//'plugin/servicecatalog/img/nav_prop.gif',
						hasExpander : false
					}));
				});
			}
		});

		return aEntitieNodes;
	},

	_isKeyProperty : function(property, entityKeys) {
		// Run on all keys check if equal to property name and then return the result!
		for ( var i = 0; i < entityKeys.length; i++) {
			if (entityKeys[i].name === property.name) {
				return true;
			}
		}
		return false;

	},

	_getServiceComplexTypesNodes : function(aComplexTypes) {

		var aComplexTypesNodes = [];
		aComplexTypes.forEach(function(oComplexType) {
			var complexTypeNode = new sap.ui.commons.TreeNode({
			    selectable: false,
				hasExpander : true,
				text : oComplexType.name,
				expanded : false,
				icon : require.toUrl("sap.watt.saptoolsets.fiori.project.servicecatalog/img/ComplexType.png")
			//"sap-icon://business-card"//
			});
			aComplexTypesNodes.push(complexTypeNode);

			// add the complex type properties 
			// TODO: support base type .. if base type exist it the properties will be undefine 
			if (oComplexType.property) {
				oComplexType.property.forEach(function(oProperty) {
					complexTypeNode.addNode(new sap.ui.commons.TreeNode({
					    selectable: false,
						text : oProperty.name,
						hasExpander : false,
						icon : require.toUrl("sap.watt.saptoolsets.fiori.project.servicecatalog/img/property.png")
					//"sap-icon://documents"
					}));
				});
			}
		});
		return aComplexTypesNodes;
	},

	_getServiceAssociationNodes : function(aAssociations) {
		var aAssociationNodes = [];
		aAssociations.forEach(function(oAssociation) {

			var oAssociationNode = new sap.ui.commons.TreeNode({
			    selectable: false,
				text : oAssociation.name,
				expanded : false,
				icon : require.toUrl("sap.watt.saptoolsets.fiori.project.servicecatalog/img/Association.gif")
			//"sap-icon://employee",
			});//Comment

			var end1 = oAssociation.end[0];
			var end2 = oAssociation.end[1];

			var end1Node = new sap.ui.commons.TreeNode({
			    selectable: false,
				text : end1.type,
				hasExpander : false
			});

			var end2Node = new sap.ui.commons.TreeNode({
			    selectable: false,
				text : end2.type,
				hasExpander : false
			});

			oAssociationNode.addNode(end1Node);
			oAssociationNode.addNode(end2Node);

			aAssociationNodes.push((oAssociationNode));
		});
		return aAssociationNodes;
	},

	_getEntityContainerNode : function(oSchema) {

		var oEntityContainerNode = new sap.ui.commons.TreeNode({
		    selectable: false,
			text : oSchema.entityContainer[0].name,
			hasExpander : true,
			expanded : true,
			icon : require.toUrl("sap.watt.saptoolsets.fiori.project.servicecatalog/img/folder_grey_16.png")
		//"sap-icon://folder",
		});

		if (oSchema.entityContainer[0].entitySet) {
			this._populateNode(oEntityContainerNode, this._getServiceEntitySetsNodes(oSchema.entityContainer[0].entitySet));
		}
		if (oSchema.entityContainer[0].associationSet) {
			this._populateNode(oEntityContainerNode, this._getServiceAssociationSetsNodes(oSchema.entityContainer[0].associationSet));
		}
		if (oSchema.entityContainer[0].functionImport) {
			this._populateNode(oEntityContainerNode, this._getServiceFunctionImportNodes(oSchema.entityContainer[0].functionImport));
		}
		return [ oEntityContainerNode ];
	},

	_getServiceEntitySetsNodes : function(aEntitySets) {
		var aEntitySetNodes = [];
		aEntitySets.forEach(function(oEntitySet) {
			aEntitySetNodes.push(new sap.ui.commons.TreeNode({
			    selectable: false,
				hasExpander : false,
				text : oEntitySet.name,
				icon : require.toUrl("sap.watt.saptoolsets.fiori.project.servicecatalog/img/entity-set.png")
			//"sap-icon://list",
			}));
		});
		return aEntitySetNodes;
	},

	//get association sets
	_getServiceAssociationSetsNodes : function(aAssociationSets) {
		var aAssociationSetNodes = [];
		aAssociationSets.forEach(function(oAssociationSet) {
			aAssociationSetNodes.push(new sap.ui.commons.TreeNode({
			    selectable: false,
				hasExpander : false,
				text : oAssociationSet.name,
				icon : require.toUrl("sap.watt.saptoolsets.fiori.project.servicecatalog/img/Association.gif")
			//"sap-icon://employee",
			}));
		});
		return aAssociationSetNodes;
	},
	//function imports
	_getServiceFunctionImportNodes : function(aFunctionImports) {

		var aFunctionImportNodes = [];
		aFunctionImports.forEach(function(oFunctionImport) {

			var oFunctionImportNode = new sap.ui.commons.TreeNode({
			    selectable: false,
				hasExpander : false,
				text : oFunctionImport.name,
				expanded : false,
				icon : require.toUrl("sap.watt.saptoolsets.fiori.project.servicecatalog/img/function.png")//"sap-icon://open-command-field",
			});

			// add the complex type properties 
			var aParameters = oFunctionImport.parameter;

			if (aParameters != undefined) {
				oFunctionImportNode.setHasExpander(true);
				aParameters.forEach(function(oParameter) {
					oFunctionImportNode.addNode(new sap.ui.commons.TreeNode({
					    selectable: false,
						text : oParameter.name,
						hasExpander : false,
						icon : require.toUrl("sap.watt.saptoolsets.fiori.project.servicecatalog/img/param.png")//"sap-icon://horizontal-bar-chart",
					}));
				});
			}
			aFunctionImportNodes.push(oFunctionImportNode);
		});
		return aFunctionImportNodes;
	}, //end function

	_getActionNode : function(aFunctionImports) {

		var oActionsNode = new sap.ui.commons.TreeNode({
		    selectable: false,
			text : "Actions",
			hasExpander : true,
			expanded : false,
			icon : require.toUrl("sap.watt.saptoolsets.fiori.project.servicecatalog/img/function.png") //"sap-icon://open-command-field"
		});

		var aFunctionImportNodes = [];

		aFunctionImports.forEach(function(oFunctionImport) {

			aFunctionImportNodes.push(new sap.ui.commons.TreeNode({
			    selectable: false,
				hasExpander : false,
				text : oFunctionImport.name,
				expanded : false,
				icon : require.toUrl("sap.watt.saptoolsets.fiori.project.servicecatalog/img/function.png")//"sap-icon://decision",
			}));
		});
		this._populateNode(oActionsNode, aFunctionImportNodes);

		return oActionsNode;
	},

	_getPopulatedEntitySetsNodes : function(oSchema, bPopulateProperties, oServiceMetadata, oODataProvider) {
		var aEntitySetNodes = [];
		var that = this;
		var oEntityContainer = oSchema.entityContainer[0];
		if (oEntityContainer && oEntityContainer.entitySet) {
			oEntityContainer.entitySet.forEach(function(oEntitySet) {
				var oEntityNode = new sap.ui.commons.TreeNode({
				    selectable: false,
					hasExpander : bPopulateProperties,
					expanded : false,
					text : oEntitySet.name,
					icon : require.toUrl("sap.watt.saptoolsets.fiori.project.servicecatalog/img/entity-set.png")//"sap-icon://multiselect",
				});
				if (bPopulateProperties) {
					oODataProvider.getEntityType(oServiceMetadata, oEntitySet).then(function(oEntityType) {
						that._populateNode(oEntityNode, that._getPropertiesNodesOfEntityType(oEntityType));
					}, that._errorHandler);
				}

				aEntitySetNodes.push(oEntityNode);
			});
		}
		return aEntitySetNodes;
	},

	_getPropertiesNodesOfEntityType : function(oEntity) {
		var that = this;
		var aPropertiesNodes = [];
		if (oEntity.key) {
			var aKeys = oEntity.key.propertyRef;

			// first add the key properties 
			aKeys.forEach(function(oKey) {
				aPropertiesNodes.push(new sap.ui.commons.TreeNode({
				    selectable: false,
					text : oKey.name,
					hasExpander : false,
					icon : require.toUrl("sap.watt.saptoolsets.fiori.project.servicecatalog/img/key.gif")//'plugin/servicecatalog/img/key.gif'
				}));
			});
		}
		// then add the simple properties 
		if (oEntity.property) {
			oEntity.property.forEach(function(oProperty) {
				// Check if the property is a key property 
				if (!that._isKeyProperty(oProperty, aKeys)) {
					aPropertiesNodes.push(new sap.ui.commons.TreeNode({
					    selectable: false,
						text : oProperty.name,
						hasExpander : false,
						icon : require.toUrl("sap.watt.saptoolsets.fiori.project.servicecatalog/img/property.png")//"sap-icon://documents",//'plugin/servicecatalog/img/property.png'
					}));
				}
			});
		}
		return aPropertiesNodes;
	},

	_errorHandler : function(oError) {
		throw new Error(oError);
	},

	/**
	 * Returns Schemata tree nodes where each schema node contains all tree nodes of the service   
	 * @param oServiceMetadata object
	 * @returns the required Schemata tree nodes of the service
	 */
	getAllServiceNodes : function(oServiceMetadata, oI18n) {

		var that = this;
		var aSchemata = [];
		var schemata = oServiceMetadata.dataServices.schema;

		if (schemata) {
			schemata.forEach(function(oSchema) {
				var oSchemaNode = new sap.ui.commons.TreeNode({
					text : oSchema.namespace,
					hasExpander : true,
					expanded : true,
					icon : require.toUrl("sap.watt.saptoolsets.fiori.project.servicecatalog/img/folder_grey_16.png")//"sap-icon://course-book",
				});

				aSchemata.push(oSchemaNode);

				if (oSchema.entityType) {
					that._populateNode(oSchemaNode, that._getServiceEntityTypesNodes(oSchema.entityType));
				}
				if (oSchema.complexType) {
					that._populateNode(oSchemaNode, that._getServiceComplexTypesNodes(oSchema.complexType));
				}
				if (oSchema.association) {
					that._populateNode(oSchemaNode, that._getServiceAssociationNodes(oSchema.association));
				}
				if (oSchema.entityContainer) {
					that._populateNode(oSchemaNode, that._getEntityContainerNode(oSchema));
				}

			});
		} else {
			this._errorHandler(oI18n.getText("i18n", "invalid_OData_service"));
		}

		return aSchemata;
	},

	/**
	 * Returns Schemata tree nodes where each node contains EntitySets tree Nodes and Action tree node with Function imports  
	 * @param oServiceMetadata object
	 * @returns the required Schemata tree nodes of the service
	 */
	getServiceDetailsTreeNodes : function(oServiceMetadata, oODataProvider, oI18n) {

		return this._getServiceDetailsNodes(oServiceMetadata, false, oODataProvider, oI18n);
	},

	/**
	 * Returns Schemata tree nodes where each schema node contains EntitySets Nodes with properties and Action node with Function imports  
	 * @param oServiceMetadata object
	 * @returns the required Schemata tree nodes of the service
	 */
	getCatalogServiceTreeNodes : function(oServiceMetadata, oODataProvider, oI18n) {

		return this._getServiceDetailsNodes(oServiceMetadata, true, oODataProvider, oI18n);

	}

});
