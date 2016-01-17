/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define([/*"../../hdbcalculationview/viewmodel/model",
        "../../hdbcalculationview/base/modelbase"*/
        "sap/watt/hanaplugins/editor/plugin/hdbcalculationview/viewmodel/model",
        "sap/watt/hanaplugins/editor/plugin/hdbcalculationview/base/modelbase"
        ],
        function(
        		Model,
        		modelbase
        ) {
	"use strict";

	var AbstractModelClass = modelbase.AbstractModelClass;
	var ObjectAlreadyExistsException = modelbase.ObjectAlreadyExistsException;

	/**
	 * @class
	 */
	var CDSModel = modelbase.AbstractModel.extend("CDSModel", {

		$features: {
			containments: {
				"root": {},
				"_entities": {
					"isMany": true
				}
			}
		},

		createOrMergeExternalEntity: function(attributes) {
			var entity;
			var proxyObjectsNameSpaceArray = [];
			//add first element directly
			if(this._entities.count() === 0){
				//create a new proxy entity object
				entity = new Model.Entity(attributes);
				entity.isProxy = true;
				var key = entity.$getKeyAttributeValue();
				if (this._entities.get(key)) {
					entity.$rename(this._entities.getUniqueKey(key));
				}
				this._entities.add(entity);

			} else{
				//create an array which holds namespace of existing proxy entities
				for (var i = 0; i < this._entities.count(); i++) {
					var currentEntity = this._entities.getAt(i);
					var entityName = currentEntity.name;
					var entityAlias = currentEntity.alias;
					var entityNameSpace = currentEntity.id;
					var fullNameSpace = entityNameSpace;
					if(entityAlias){
						fullNameSpace = fullNameSpace + " as " + entityAlias;
					}

					proxyObjectsNameSpaceArray.push(fullNameSpace.replace(/ /g, "")); //add all existing namespaces alongwith alias in an array, after removing each adn every whitespace
				}

				var currentEntityName = attributes.name;
				var currentEntityId = attributes.id;
				var currentEntityAlias = attributes.alias;
				var currentEntityFullNameSpace = currentEntityId;
				if(currentEntityAlias){
					currentEntityFullNameSpace = currentEntityFullNameSpace + " as " + currentEntityAlias;
				}

				//check if current entity is already present in array of namesapces
				if(proxyObjectsNameSpaceArray.indexOf(currentEntityFullNameSpace.replace(/ /g, "")) === -1){
					//means it is not present, create a proxy object
					entity = new Model.Entity(attributes);
					entity.isProxy = true;
					var key = entity.$getKeyAttributeValue();
					if (this._entities.get(key)) {
						entity.$rename(this._entities.getUniqueKey(key));
					}
					this._entities.add(entity);
				} 
			}

			return entity;
		},

		createOrMergeEntity: function(attributes) {
			var entity = this.createEntity(attributes);
			return entity;
		},

		createEntity: function(attributes) {
			var entity = new Model.Entity(attributes);
			this.root = entity;
			this.root.artifactType = "Entity";
			return entity;
		},

		createContext: function(attributes) {
			var context = new Model.Context(attributes);
			this.root = context;
			this.root.artifactType = "Context";
			return context;
		}

	});

	/**
	 * @class
	 *
	 *  @property {ModelCollection}      children           -  List of children
	 */
	var Context = AbstractModelClass.extend("Context", {

		$features: {
			containments: {
				"children": {
					isMany: true
				}
			}
		},

		createEntity: function(attributes) {
			var entity = new Model.Entity(attributes);
			this.children.add(entity);
			return entity;
		},

		createOrMergeEntity: function(attributes) {
			var entity = this.children.get(attributes.name);
			if (!entity) {
				entity = this.createEntity(attributes);
			} else {
				entity.isProxy = false;
			}

			return entity;
		},

		createContext: function(attributes) {
			var context = new Model.Context(attributes);
			this.children.add(context);
			return context;
		},

		createView: function(attributes) {
			var view = new Model.View(attributes);
			this.children.add(view.name, view);
			return view;
		},

		createType: function(attributes) {
			var type = new Model.Type(attributes);
			this.children.add(type.name, type);
			return type;
		},

		getNextName: function(type) {
			var reg = new RegExp("_([0-9]+)$");
			var match, max = 0;

			this.children.foreach(function(child) {
				if (child.$$className === type) {
					match = reg.exec(child.name);
					if (match && match.length === 2) {
						max = Math.max(max, parseInt(match[1], 10));
					}
				}
			});
			return type + "_" + (max + 1).toString();
		}

	});

	/**
	 * @class
	 *
	 */
	var View = AbstractModelClass.extend("View", {

		$features: {
			containments: {}
		}

	});

	/**
	 * @class
	 *
	 */
	var Type = AbstractModelClass.extend("Type", {
		$features: {
			containments: {
				"elements": {
					isMany: true
				}
			}
		},

		createTypeAttribute: function(attributeProps) {
			var typeAttr = this.elements.get(attributeProps.name);
			if (typeAttr) {
				throw new ObjectAlreadyExistsException(this, attributeProps.name, this.name);
			}
			return this.createOrMergeTypeAttribute(attributeProps);
		},

		createOrMergeTypeAttribute: function(attributeProps) {
			var attribute = new Model.TypeAttribute(attributeProps);
			this.elements.add(attribute);
			return attribute;
		}

	});

	/**
	 * class
	 * */
	var TypeAttribute = AbstractModelClass.extend("TypeAttribute", {
		$features: {
			keyAttribute: "name"
		}
	});

	/**
	 * @class
	 */
	var Association = AbstractModelClass.extend("Association", {
		$features: {
			keyAttribute: "name",
			containments: {
				"associationKeys": {
					isMany: true
				}
			},
			references : {
				"targetEntity" : { },
				"targetContext" : { }
			}
		},

		createKey: function(keyProps) {
			var associationKey = this.associationKeys.get(keyProps.name);
			if (associationKey) {
				throw new ObjectAlreadyExistsException(this, keyProps.name, this.name);
			}
			return this.createOrMergeAssociationKey(keyProps);
		},

		createOrMergeAssociationKey: function(keyProps) {
			var associationKey = new Model.AssociationKey(keyProps);
			this.associationKeys.add(associationKey);
			associationKey.keyElement = keyProps.element;
			return associationKey;
		}
	});

	/**
	 * class
	 * */
	var AssociationKey = AbstractModelClass.extend("AssociationKey", {
		$features: {
			keyAttribute: "name",
			references: {
				"keyElement": { }
			}
		} 
	});

	Model.CDSModel = CDSModel;
	Model.Context = Context;
	Model.View = View;
	Model.Association = Association;
	Model.AssociationKey = AssociationKey;
	Model.Type = Type;
	Model.TypeAttribute = TypeAttribute;

	Model.Entity.prototype.createAssociation = function(attributes, skippedNodes, nextElementName) {
		var association = this.elements.get(attributes.name);
		if (association) {
			throw new ObjectAlreadyExistsException(this, attributes.name, this.name);
		}
		return this.createOrMergeAssociation(attributes, skippedNodes, nextElementName);
	};

	Model.Entity.prototype.createOrMergeAssociation = function(attributes, skippedNodes, nextElementName) {
		var association = this.elements.get(attributes.name);
		if (association) {
			association.$setAttributes(attributes, skippedNodes);
		} else {
			association = new Model.Association(attributes, skippedNodes);
			if (attributes.selectedAttributes) {
				for (var i = 0; i < attributes.selectedAttributes.length; i++) {
					association.createKey(attributes.selectedAttributes[i]);
				}
			}
			this.elements.add(association, nextElementName);
		}
		return association;
	};

	return Model;
});