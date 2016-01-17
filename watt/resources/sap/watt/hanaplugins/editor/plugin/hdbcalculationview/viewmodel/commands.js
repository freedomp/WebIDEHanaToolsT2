/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define(["../base/modelbase", "../base/MetadataServices", "./model", "../sharedmodel/sharedmodel",
	"../view/CalcViewEditorUtil"],
	function(
		modelbase, MetadataServices, viewmodel, sharedmodel, CalcViewEditorUtil) {
		"use strict";

		var CompoundCommand = modelbase.CompoundCommand;

		var ViewModelEvents = {};
		ViewModelEvents.ALL = modelbase.ModelEvents.ALL;
		ViewModelEvents.CHANGED = modelbase.ModelEvents.CHANGED;
		ViewModelEvents.VIEWNODE_SELECTED = "viewnode_selected";
		ViewModelEvents.SEMANTICS_SELECTED = "semantics_slected";
		ViewModelEvents.COLUMNVIEW_CHANGED = "columnview_changed";
		ViewModelEvents.COLUMNVIEW_LOADING_FINISHED = "columnview_loading_finished";
		ViewModelEvents.VIEWNODE_CREATED = "viewnode_created";
		ViewModelEvents.VIEWNODE_DELETED = "viewnode_deleted";
		ViewModelEvents.VIEWNODE_CHANGED = "viewnode_changed";
		ViewModelEvents.INPUT_CREATED = "input_created";
		ViewModelEvents.INPUT_LOADED = "input_loaded";
		ViewModelEvents.INPUT_DELETED = "input_deleted";
		ViewModelEvents.INPUT_CHANGED = "input_changed";
		ViewModelEvents.ENTITY_CHANGED = "entity_changed";
		ViewModelEvents.ELEMENT_CREATED = "element_created";
		ViewModelEvents.ELEMENT_DELETED = "element_deleted";
		ViewModelEvents.ELEMENT_MOVED = "element_moved";
		ViewModelEvents.ELEMENT_CHANGED = "element_changed";
		ViewModelEvents.MAPPING_CREATED = "mapping_created";
		ViewModelEvents.MAPPING_DELETED = "mapping_deleted";
		ViewModelEvents.PARAMETER_CREATED = "parameter_created";
		ViewModelEvents.PARAMETER_DELETED = "parameter_deleted";
		ViewModelEvents.PARAMETER_MOVED = "parameter_moved";
		ViewModelEvents.PARAMETER_CHANGED = "parameter_changed";
		ViewModelEvents.PARAMETER_VALUERANGE_CREATED = "parameter_valuerange_created";
		ViewModelEvents.PARAMETER_VALUERANGE_DELETED = "parameter_valuerange_deleted";
		ViewModelEvents.PARAMETER_VALUERANGE_CHANGED = "parameter_valuerange_changed";
		ViewModelEvents.PARAMETER_DEFAULTRANGE_CREATED = "parameter_defaultrange_created";
		ViewModelEvents.PARAMETER_DEFAULTRANGE_DELETED = "parameter_defaultrange_deleted";
		ViewModelEvents.PARAMETER_DEFAULTRANGE_CHANGED = "parameter_defaultrange_changed";
		ViewModelEvents.PARAMETER_DERIVATIONRULE_CREATED = "parameter_derivationrule_created";
		ViewModelEvents.PARAMETER_DERIVATIONRULE_DELETED = "parameter_derivationrule_deleted";
		ViewModelEvents.PARAMETER_DERIVATIONRULE_CHANGED = "parameter_derivationrule_changed";
		ViewModelEvents.PARAMETER_DERIVATIONRULE_ELEMENTFILTER_CREATED = "parameter_derivationrule_elementfilter_created";
		ViewModelEvents.PARAMETER_DERIVATIONRULE_ELEMENTFILTER_DELETED = "parameter_derivationrule_elementfilter_deleted";
		ViewModelEvents.PARAMETER_DERIVATIONRULE_ELEMENTFILTER_CHANGED = "parameter_derivationrule_elementfilter_changed";
		ViewModelEvents.PARAMETER_ASSIGNEDELEMENT_CREATED = "parameter_assignedelement_created";
		ViewModelEvents.PARAMETER_ASSIGNEDELEMENT_DELETED = "parameter_assignedelement_deleted";
		ViewModelEvents.COUNTER_REFERENCEELEMENT_CREATED = "counter_referencedelement_created";
		ViewModelEvents.COUNTER_REFERENCEELEMENT_DELETED = "counter_referencedelement_deleted";
		ViewModelEvents.PARAMETERMAPPING_CREATED = "parametermapping_created";
		ViewModelEvents.PARAMETERMAPPING_DELETED = "parametermapping_deleted";
		ViewModelEvents.JOIN_CREATED = "join_created";
		ViewModelEvents.JOIN_CHANGED = "join_changed";
		ViewModelEvents.JOIN_DELETED = "join_deleted";
		ViewModelEvents.RESTRICTION_CREATED = "restriction_created";
		ViewModelEvents.RESTRICTION_CHANGED = "restriction_changed";
		ViewModelEvents.RESTRICTION_DELETED = "restriction_deleted";
		ViewModelEvents.RANKNODE_PROPERTIES_CHANGED = "ranknode_properties_changed";
		ViewModelEvents.HIERARCHY_CREATED = "hierarchy_created";
		ViewModelEvents.HIERARCHY_DELETED = "hierarchy_deleted";
		ViewModelEvents.HIERARCHY_CHANGED = "hierarchy_changed";
		ViewModelEvents.PERFORMANCE_ANALYSIS_CHANGED = "performance_analysis_changed";
		//  dummy events
		ViewModelEvents.REPLACE_ACTIONS_START = "replace_actions_start";
		ViewModelEvents.REPLACE_ACTIONS_STOP = "replace_actions_stop";
		
		//Start of GraphNode Events
		ViewModelEvents.WORKSPACE_CREATED = "workspace_created";
		ViewModelEvents.WORKSPACE_DELETED = "workspace_deleted"; 
		ViewModelEvents.WORKSPACE_LOADED = "workspace_loaded"; 
		
		modelbase.ModelEvents.registerEventTypes(viewmodel.ViewNode, {
			created: ViewModelEvents.WORKSPACE_CREATED,
			deleted: ViewModelEvents.WORKSPACE_DELETED,
			loaded: ViewModelEvents.WORKSPACE_LOADED
		});
		
		//End of GraphNode events
        
        
		modelbase.ModelEvents.registerEventTypes(viewmodel.ColumnView, {
			changed: ViewModelEvents.COLUMNVIEW_CHANGED,
			loaded: ViewModelEvents.COLUMNVIEW_LOADING_FINISHED,
			notify: ViewModelEvents.PERFORMANCE_ANALYSIS_CHANGED
		});
		modelbase.ModelEvents.registerEventTypes(viewmodel.ViewNode, {
			created: ViewModelEvents.VIEWNODE_CREATED,
			deleted: ViewModelEvents.VIEWNODE_DELETED,
			changed: ViewModelEvents.VIEWNODE_CHANGED
		});
		modelbase.ModelEvents.registerEventTypes(viewmodel.Input, {
			created: ViewModelEvents.INPUT_CREATED,
			loaded: ViewModelEvents.INPUT_LOADED,
			deleted: ViewModelEvents.INPUT_DELETED,
			change: ViewModelEvents.INPUT_CHANGED
		});
		modelbase.ModelEvents.registerEventTypes(viewmodel.Join, {
			created: ViewModelEvents.JOIN_CREATED,
			deleted: ViewModelEvents.JOIN_DELETED,
			change: ViewModelEvents.JOIN_CHANGED
		});
		modelbase.ModelEvents.registerEventTypes(viewmodel.Entity, {
			changed: ViewModelEvents.ENTITY_CHANGED
		});
		modelbase.ModelEvents.registerEventTypes(viewmodel.Element, {
			created: ViewModelEvents.ELEMENT_CREATED,
			deleted: ViewModelEvents.ELEMENT_DELETED,
			changed: ViewModelEvents.ELEMENT_CHANGED,
			moved: ViewModelEvents.ELEMENT_MOVED
		});
		modelbase.ModelEvents.registerEventTypes(viewmodel.Mapping, {
			created: ViewModelEvents.MAPPING_CREATED,
			deleted: ViewModelEvents.MAPPING_DELETED
		});
		modelbase.ModelEvents.registerEventTypes(viewmodel.Parameter, {
			created: ViewModelEvents.PARAMETER_CREATED,
			deleted: ViewModelEvents.PARAMETER_DELETED,
			changed: ViewModelEvents.PARAMETER_CHANGED,
			moved: ViewModelEvents.PARAMETER_MOVED
		});
		modelbase.ModelEvents.registerEventTypes(viewmodel.ValueRange, {
			created: ViewModelEvents.PARAMETER_VALUERANGE_CREATED,
			deleted: ViewModelEvents.PARAMETER_VALUERANGE_DELETED,
			changed: ViewModelEvents.PARAMETER_VALUERANGE_CHANGED
		});
		modelbase.ModelEvents.registerEventTypes(viewmodel.DefaultRange, {
			created: ViewModelEvents.PARAMETER_DEFAULTRANGE_CREATED,
			deleted: ViewModelEvents.PARAMETER_DEFAULTRANGE_DELETED,
			changed: ViewModelEvents.PARAMETER_DEFAULTRANGE_CHANGED
		});
		modelbase.ModelEvents.registerEventTypes(viewmodel.DerivationRule, {
			created: ViewModelEvents.PARAMETER_DERIVATIONRULE_CREATED,
			deleted: ViewModelEvents.PARAMETER_DERIVATIONRULE_DELETED,
			changed: ViewModelEvents.PARAMETER_DERIVATIONRULE_CHANGED
		});
		modelbase.ModelEvents.registerEventTypes(viewmodel.ElementFilter, {
			created: ViewModelEvents.PARAMETER_DERIVATIONRULE_ELEMENTFILTER_CREATED,
			deleted: ViewModelEvents.PARAMETER_DERIVATIONRULE_ELEMENTFILTER_DELETED,
			changed: ViewModelEvents.PARAMETER_DERIVATIONRULE_ELEMENTFILTER_CHANGED
		});
		modelbase.ModelEvents.registerEventTypes(viewmodel.InlineHierarchy, {
			created: ViewModelEvents.HIERARCHY_CREATED,
			deleted: ViewModelEvents.HIERARCHY_DELETED,
			changed: ViewModelEvents.HIERARCHY_CHANGED
		});

		/**
		 * @class Servant class to handle EndUserTexts in various commands.
		 * caller is the Command which calls this servant.
		 * container is the container in model which holds the Comment object.
		 * @parameter {object} attributes - {  objectAttributes: { label: "", labelMaxLength: <number> },
		 *                                     comment: { text: "", mimetype: "" } };
		 */
		var EndUserTextsServant = function() {};
		EndUserTextsServant.prototype = {
			initialize: function(caller, attributes) {
				if (attributes && attributes.hasOwnProperty("objectAttributes")) {
					caller.newEndUserTextsAttribtues = attributes.objectAttributes;
					caller.oldEndUserTextsAttribtues = undefined;
				}
				if (attributes && attributes.hasOwnProperty("comment")) {
					caller.newCommentAttributes = attributes.comment;
					caller.oldCommentAttributes = undefined;
					caller.isCommentCreated = false;
				}
				caller.isEndUserTextsCreated = false;
			},
			execute: function(caller, container) {
				if (container && (caller.newEndUserTextsAttribtues || caller.newCommentAttributes)) {
					if (!container.endUserTexts) {
						container.createEndUserTexts(caller.newEndUserTextsAttribtues);
						caller.isEndUserTextsCreated = true;
					} else if (caller.newEndUserTextsAttribtues) {
						caller.oldEndUserTextsAttribtues = container.endUserTexts.$getAttributesForUndo(caller.newEndUserTextsAttribtues);
						container.endUserTexts.$setAttributes(caller.newEndUserTextsAttribtues);
					}
					if (caller.newCommentAttributes) {
						if (container.endUserTexts.comment) {
							caller.oldCommentAttributes = container.endUserTexts.comment.$getAttributesForUndo(caller.newCommentAttributes);
							container.endUserTexts.comment.$setAttributes(caller.newCommentAttributes);
						} else {
							container.endUserTexts.createComment(caller.newCommentAttributes);
							caller.isCommentCreated = true;
						}
					}
				}
			},
			undo: function(caller, container) {
				if (container && container.endUserTexts && (caller.newEndUserTextsAttribtues || caller.newCommentAttributes)) {
					if (caller.isCommentCreated) {
						container.endUserTexts.comment.$remove();
					} else if (caller.oldCommentAttributes) {
						container.endUserTexts.comment.$setAttributes(caller.oldCommentAttributes);
					}
					if (caller.isEndUserTextsCreated) {
						container.endUserTexts.$remove();
					} else if (caller.oldEndUserTextsAttribtues) {
						container.endUserTexts.$setAttributes(caller.oldEndUserTextsAttribtues);
					}
				}
			}
		};

		/**
		 * @class
		 * @parameter {object} newAttributes - {  ...,
		 *                                        endUserTexts: { objectAttributes: { label: "", labelMaxLength: <number> },
		 *                                                        comment         : { text: "", mimetype: ""              } } }
		 */
		var ChangeColumnViewPropertiesCommand = function(newAttributes, endUserTexts) {
			this.newProperties = newAttributes;
			this.oldProperties = undefined;
			this.oldTypeProperties = undefined;

			this.endUserTextServant = new EndUserTextsServant();
			this.endUserTextServant.initialize(this, endUserTexts);
		};
		ChangeColumnViewPropertiesCommand.prototype = {
			execute: function(model, events) {
				if (this.newProperties) {
					// remember old properties
					this.oldProperties = model.columnView.$getAttributesForUndo(this.newProperties);
					// merge-in new attributes
					model.columnView.$setAttributes(this.newProperties);
				}

				this.endUserTextServant.execute(this, model.columnView);

				events.push({
					source: model.columnView,
					type: ViewModelEvents.COLUMNVIEW_CHANGED,
					name: model.columnView.name,
					changed: true
				});
				return model.columnView;
			},
			undo: function(model, events) {
				if (this.newProperties) {
					// reset old attributes
					model.columnView.$setAttributes(this.oldProperties);
				}

				this.endUserTextServant.undo(this, model.columnView);

				events.push({
					source: model.columnView,
					type: ViewModelEvents.COLUMNVIEW_CHANGED,
					name: model.columnView.name,
					changed: true
				});
			}
		};

		/**
		 * @class
		 * @parameter {object} newAttributes - { engine: "", preferredEngine: "", allowRelationalOptimization: true,
		 *                                       alwaysAggregateResult: true, runWithInvokerPrivileges: true,
		 *                                       generateConcatAttributes: true, cacheInvalidationPeriod: "true"",
		 *                                       countStarElementName: "" }
		 */
		var ChangeColumnViewExecutionHintsPropertiesCommand = function(newAttributes) {
			this.newProperties = newAttributes;
			this.countStarElementName = undefined;
			if (this.newProperties.hasOwnProperty("countStarElementName")) {
				this.countStarElementName = this.newProperties.countStarElementName ? this.newProperties.countStarElementName : "";
				delete this.newProperties.countStarElementName;
			}
			this.oldCountStarElementName = undefined;
			this.oldProperties = undefined;
			this.oldTypeProperties = undefined;
		};
		ChangeColumnViewExecutionHintsPropertiesCommand.prototype = {
			execute: function(model, events) {
				// remember old properties
				this.oldProperties = model.columnView.executionHints.$getAttributesForUndo(this.newProperties);
				// merge-in new attributes
				model.columnView.executionHints.$setAttributes(this.newProperties);

				// Handle reference
				if (typeof this.countStarElementName !== "undefined") {
					this.oldCountStarElementName = model.columnView.executionHints.countStarElement ?
						model.columnView.executionHints.countStarElement.name :
						"";
					var elem = model.columnView.getDefaultNode().elements.get(this.countStarElementName);
					model.columnView.executionHints.countStarElement = elem;
				}

				events.push({
					source: model.columnView.executionHints,
					type: ViewModelEvents.COLUMNVIEW_CHANGED,
					name: model.columnView.name,
					changed: true
				});
				return model.columnView;
			},
			undo: function(model, events) {
				// reset old attributes
				model.columnView.executionHints.$setAttributes(this.oldProperties);

				// Handle reference
				if (typeof this.countStarElementName !== "undefined") {
					var elem = model.columnView.getDefaultNode().elements.get(this.oldCountStarElementName);
					model.columnView.executionHints.countStarElement = elem;
				}

				events.push({
					source: model.columnView.executionHints,
					type: ViewModelEvents.COLUMNVIEW_CHANGED,
					name: model.columnView.name,
					changed: true
				});
			}
		};

		/** 
		 * @class CreateOrChangeGenericHint Command
		 * @parameter {string} name       - Name of Generic Hint (applicable only in case of change)
		 * @parameter {object} attributes - { name: "NewName", value: "" }
		 */
		var CreateOrChangeGenericHint = function(name, attributes) {
			if (typeof name === "undefined" || name === null) {
				this.isCreate = true;
			}
			this.isCreateXHints = false;
			this.name = name;
			this.newAttributes = attributes;
			this.oldAttributes = undefined;
		};
		CreateOrChangeGenericHint.prototype = {
			execute: function(model, events) {
				if (model && model.columnView) {
					if (this.isCreate) {
						if (!model.columnView.executionHints) {
							model.columnView.createExecutionHints();
							this.isCreateXHints = true;
						}
						if (model.columnView.executionHints) {
							model.columnView.executionHints.createNameValuePair(this.newAttributes);
						}
					} else {
						// change
						var nameValuePair = model.columnView.executionHints.genericHints.get(this.name);
						this.oldAttributes = nameValuePair.$getAttributesForUndo(this.newAttributes);
						if (this.newAttributes.hasOwnProperty("name") && this.newAttributes.name !== this.name) {
							// rename
							nameValuePair.$rename(this.newAttributes.name);
						}
						nameValuePair.$setAttributes(this.newAttributes);
					}
					events.push({
						source: model.columnView.executionHints,
						type: ViewModelEvents.COLUMNVIEW_CHANGED,
						name: model.columnView.name,
						changed: true
					});
					return model.columnView;

				}
			},
			undo: function(model, events) {
				if (model && model.columnView && model.columnView.executionHints && model.columnView.executionHints.genericHints) {
					if (this.isCreate) {
						model.columnView.executionHints.genericHints.remove(this.name);
						if (this.isCreateXHints) {
							model.columnView.executionHints.$remove();
						}
					} else {
						// change
						var nameValuePair;
						if (this.newAttributes.hasOwnProperty("name") && this.newAttributes.name !== this.name) {
							// rename
							nameValuePair = model.columnView.executionHints.genericHints.get(this.newAttributes.name);
							nameValuePair.$rename(this.name);
						} else {
							nameValuePair = model.columnView.executionHints.genericHints.get(this.name);
						}
						nameValuePair.$setAttributes(this.oldAttributes);
					}
					events.push({
						source: model.columnView.executionHints,
						type: ViewModelEvents.COLUMNVIEW_CHANGED,
						name: model.columnView.name,
						changed: true
					});
				}
			}
		};

		/**
		 * @class
		 */
		var CreateViewNodeCommand = function(viewNodeProperties, isDefaultNode) {
			this.viewNodeName = viewNodeProperties.objectAttributes.name;
			this.viewNodeAttributes = viewNodeProperties.objectAttributes;
			this.layoutAttributes = viewNodeProperties.layoutAttributes;
			this.inserNode = viewNodeProperties.insertNode;
			this.isDefaultNode = typeof isDefaultNode === "undefined" ? false : isDefaultNode;
		};
		CreateViewNodeCommand.prototype = {
			execute: function(model, events) {
				var that = this;
				var viewNode = model.columnView.createViewNode(this.viewNodeAttributes, null, this.isDefaultNode);
				viewNode.createLayout(this.layoutAttributes);
				//for insert new node between link
				if (this.inserNode) {
					//setting input to tartget 
					var inp;
					var list = [];
					model.columnView.viewNodes.get(that.inserNode.targetNode).inputs.foreach(function(e) {
						if (e.getSource() === model.columnView.viewNodes.get(that.inserNode.sourceNode)) {
							//	list.push(new modelbase.DeleteCommand('columnView.viewNodes["' + model.columnView.viewNodes.get(that.inserNode.targetNode).name + '"].inputs["' + e.$$defaultKeyValue + '"]'));
							inp = e.$$defaultKeyValue;
							e.setSource(viewNode);
							list.push(new CreateInputCommand(viewNode.name, model.columnView.viewNodes.get(that.inserNode.sourceNode).name));
							//	list.push(new CreateInputCommand(model.columnView.viewNodes.get(that.inserNode.targetNode).name,viewNode.name));

							events.push({
								source: model.columnView.viewNodes.get(that.inserNode.targetNode),
								type: ViewModelEvents.INPUT_CREATED,
								name: e.$$defaultKeyValue,
								changed: true
							});
						}
					});
					//creating mapings
					model.columnView.viewNodes.get(that.inserNode.sourceNode).elements.foreach(function(element) {
						var elementAttributes = CalcViewEditorUtil.createModelForElementAttributes(element);
						elementAttributes.objectAttributes.name = CalcViewEditorUtil.getUniqueNameForElement(element.name, viewNode);
						elementAttributes.objectAttributes.label = elementAttributes.objectAttributes.name;
						elementAttributes.objectAttributes.transparentFilter = element.transparentFilter;

						elementAttributes.mappingAttributes = {
							sourceName: element.name,
							targetName: elementAttributes.objectAttributes.name,
							type: "ElementMapping"
						};
						elementAttributes.inputKey = 0; //for newly created input id 0
						//	var 	command=new AddElementCommand(viewNode.name, elementAttributes);
						list.push(new AddElementCommand(viewNode.name, elementAttributes));
						//		command.execute(model, events);
					});
					this.inputComand = new modelbase.CompoundCommand(list);
					this.inputComand.execute(model, events);
				}

				events.push({
					source: model.columnView,
					type: ViewModelEvents.VIEWNODE_CREATED,
					name: viewNode.name,
					changed: true
				});
				return viewNode;
			},
			undo: function(model, events) {

				var that = this;
				var viewNode = model.columnView.viewNodes.get(this.viewNodeName);
				if (that.inserNode) {
					this.inputComand.undo(model, events);
					model.columnView.viewNodes.get(that.inserNode.targetNode).inputs.foreach(function(e) {
						if (e.getSource() === viewNode) {
							e.setSource(model.columnView.viewNodes.get(that.inserNode.sourceNode));
							events.push({
								source: model.columnView.viewNodes.get(that.inserNode.targetNode),
								type: ViewModelEvents.INPUT_CREATED,
								name: e.$$defaultKeyValue,
								changed: true
							});
						}
					});
				}
				if (viewNode) {
					if (viewNode.layout) {
						viewNode.layout.$remove();
					}
					viewNode.$remove();
				}
				events.push({
					source: model.columnView,
					type: ViewModelEvents.VIEWNODE_DELETED,
					name: viewNode.name,
					changed: true
				});
				return viewNode;
			}
		};

		/**
		 * @class ChangeViewNodeProperties
		 * @parameter {string} name          - ViewNode's name
		 * @parameter {object} newProperties - {  filterExpression: { },
		 *                                        endUserTexts    : { objectAttributes: { label: "", labelMaxLength: <number> },
		 *                                                            comment         : { text : "", mimetype      : ""       } } }
		 */
		var ChangeViewNodeCommand = function(name, newProperties) {
			this.viewNodeName = name;
			this.newViewNodeName = newProperties.name ? newProperties.name : name;
			this.newViewNodeType = newProperties.type;
			this.oldViewNodeType;
			this.viewNodeProperties = newProperties;
			this.oldViewNodeProperties = {};

			this.endUserTextsServant = new EndUserTextsServant();
			this.endUserTextsServant.initialize(this, newProperties.endUserTexts);
		};
		ChangeViewNodeCommand.prototype = {
			execute: function(model, events) {
				var viewNode = model.columnView.viewNodes.get(this.viewNodeName);
				if (viewNode) {
					// Changes fopr filter expression
					if (this.viewNodeProperties.hasOwnProperty("filterExpression")) {
						if (viewNode.filterExpression) {
							this.oldViewNodeProperties.filterExpression = viewNode.filterExpression.$getAttributesForUndo(this.viewNodeProperties.filterExpression);
						} else {
							viewNode.createFilterExpression(this.viewNodeProperties.filterExpression);
						}
						viewNode.filterExpression.$setAttributes(this.viewNodeProperties.filterExpression);
					}
					if (this.newViewNodeName && this.newViewNodeName !== this.viewNodeName) {
						model.columnView.viewNodes.rename(this.viewNodeName, this.newViewNodeName);
					}
					if (viewNode._isDefaultNode) {
						if (this.newViewNodeType) {
							this.oldViewNodeType = viewNode.type;
							viewNode.type = this.newViewNodeType;
						}
					}
					this.endUserTextsServant.execute(this, viewNode);

					events.push({
						source: model.columnView,
						type: ViewModelEvents.VIEWNODE_CHANGED,
						name: viewNode.name,
						changed: true
					});
				}
			},
			undo: function(model, events) {
				var viewNode = model.columnView.viewNodes.get(this.newViewNodeName);
				if (viewNode) {
					// Changes fopr filter expression
					if (this.oldViewNodeProperties.hasOwnProperty("filterExpression")) {
						viewNode.filterExpression.$setAttributes(this.oldViewNodeProperties.filterExpression);
					}
					if (this.newViewNodeName !== this.viewNodeName) {
						model.columnView.viewNodes.rename(this.newViewNodeName, this.viewNodeName);
					}
					if (viewNode._isDefaultNode) {
						if (this.oldViewNodeType) {
							viewNode.type = this.oldViewNodeType;
						}
					}
					this.endUserTextsServant.undo(this, viewNode);

					events.push({
						source: model.columnView,
						type: ViewModelEvents.VIEWNODE_CHANGED,
						name: viewNode.name,
						changed: true
					});
				}
			}
		};

	
		/**
		 * @class ChangeGraphNodeProperties
		 * @parameter {string} name          - GraphNode's name
		 * @parameter {object} newProperties - {  GraphExpression: { },
		 *                                        endUserTexts    : { objectAttributes: { label: "", labelMaxLength: <number> },
		 *                                                            comment         : { text : "", mimetype      : ""       } } }
		 */
		var ChangeGraphNodeCommand = function(model,name,newProperties) {
		    this.viewNodeName = name;
			this.newViewNodeName = newProperties.name ? newProperties.name : name;
			//this.newViewNodeType = newProperties.type;
			//this.oldViewNodeType;
			this.graphNodeProperties = newProperties;
			this.oldViewNodeProperties = "";
			this.oldAlgorithmValue = "";
			this.model = model;

			//this.endUserTextsServant = new EndUserTextsServant();
			//this.endUserTextsServant.initialize(this, newProperties.endUserTexts);
		};
		ChangeGraphNodeCommand.prototype = {
			execute: function(model, events) {
				var viewNode = model.columnView.viewNodes.get(this.viewNodeName);
				if (viewNode) {
					// Changes for graph expression
						this.oldViewNodeProperties = viewNode.graphExpression;
						this.oldAlgorithmValue = viewNode.action;
						viewNode.graphExpression = this.graphNodeProperties[0];
						viewNode.action = this.graphNodeProperties[1];
					//this.endUserTextsServant.execute(this, viewNode);

					events.push({
						source: viewNode,
						type: ViewModelEvents.VIEWNODE_CHANGED,
						name: viewNode.name,
						changed: true
					});
				}
			},
			undo: function(model, events) {
				var viewNode = model.columnView.viewNodes.get(this.newViewNodeName);
				if (viewNode) {
					// Changes fopr filter expression
					if (this.oldViewNodeProperties.hasOwnProperty("filterExpression")) {
						viewNode.filterExpression.$setAttributes(this.oldViewNodeProperties.filterExpression);
					}
					if (this.newViewNodeName !== this.viewNodeName) {
						model.columnView.viewNodes.rename(this.newViewNodeName, this.viewNodeName);
					}
					if (viewNode._isDefaultNode) {
						if (this.oldViewNodeType) {
							viewNode.type = this.oldViewNodeType;
						}
					}
					this.endUserTextsServant.undo(this, viewNode);

					events.push({
						source: model.columnView,
						type: ViewModelEvents.VIEWNODE_CHANGED,
						name: viewNode.name,
						changed: true
					});
				}
			}
		};
	

		/**
		 * @class Command to set and change Rank node properties.
		 * @param {string} name - Name of the Rank node
		 * @param {object} properties - Rank node properties
		 */
		var ChangeRankNodePropertiesCommand = function(name, properties) {
			this.viewNodeName = name;
			this.newProperties = properties;
			this.key;
			this.keyNextElem;
		};
		ChangeRankNodePropertiesCommand.prototype = {
			execute: function(model, events) {
				var rankNode = model.columnView.viewNodes.get(this.viewNodeName);
				var windowFunc = {};
				var element;
				if (rankNode) {
					if (rankNode.windowFunction) {
						windowFunc = rankNode.windowFunction;
					} else {
						windowFunc = rankNode.createWindowFunction();
					}

					if (this.newProperties.hasOwnProperty("dynamicPartitionElements") && typeof this.newProperties.dynamicPartitionElements !== undefined) {
						this.oldDynamicPartitionElements = windowFunc.dynamicPartitionElements === undefined ? false : windowFunc.dynamicPartitionElements;
						windowFunc.dynamicPartitionElements = this.newProperties.dynamicPartitionElements;
					}
					if (this.newProperties.hasOwnProperty("order") && typeof this.newProperties.order !== undefined) {
						//Get element reference from element name
						element = this.newProperties.order.byElement;
						var byElement = rankNode.elements.get(element);

						//Change scenario
						if (windowFunc.orders.count() > 0) {
							// Back up old values for undo
							this.oldOrder = {};
							this.oldOrder.direction = windowFunc.orders.getAt(0).direction;
							if (windowFunc.orders.getAt(0).byElement) {
								this.oldOrder.byElement = windowFunc.orders.getAt(0).byElement.name;
							}
							//Set new values
							windowFunc.orders.getAt(0).direction = this.newProperties.order.direction;
							if (byElement) {
								windowFunc.orders.getAt(0).byElement = byElement;
							}
						} else { //Create scenario
							if (byElement) {
								this.newProperties.order.byElement = byElement;
							}
							windowFunc.createOrder(this.newProperties.order);
						}
					}
					if (this.newProperties.hasOwnProperty("rankThreshold") && typeof this.newProperties.rankThreshold !== undefined) {
						//Back up old values for undo
						this.oldRankThreshold = {};
						if (windowFunc.rankThreshold) {
							if (windowFunc.rankThreshold.constantValue) {
								this.oldRankThreshold.constantValue = windowFunc.rankThreshold.constantValue;
							} else if (windowFunc.rankThreshold.parameter)
								this.oldRankThreshold.parameter = windowFunc.rankThreshold.parameter.name;
						}

						if (this.newProperties.rankThreshold.parameter) {
							if (this.newProperties.rankThreshold.parameter.name === undefined) {
								this.newProperties.rankThreshold.parameter = model.columnView.parameters.get(this.newProperties.rankThreshold.parameter);
							}
						}
						//Clear old values
						windowFunc.rankThreshold = undefined;
						windowFunc.createOrMergeRankThreshold(this.newProperties.rankThreshold);
					}
					if (this.newProperties.hasOwnProperty("partitionElement") && typeof this.newProperties.partitionElement !== undefined) {
						if (this.newProperties.partitionElement.newPartitionElement && !this.newProperties.partitionElement.oldPartitionElement) {
							//Add new partition element
							this.key = this.newProperties.partitionElement.newPartitionElement;
							element = rankNode.elements.get(this.key);
							windowFunc.partitionElements.add(this.key, element);
						} else if (!this.newProperties.partitionElement.newPartitionElement && this.newProperties.partitionElement.oldPartitionElement) {
							//Remove partition element
							this.nextElemKey = windowFunc.partitionElements.getNextKey(this.newProperties.partitionElement.oldPartitionElement);
							windowFunc.partitionElements.remove(this.newProperties.partitionElement.oldPartitionElement);
						} else if (this.newProperties.partitionElement.newPartitionElement && this.newProperties.partitionElement.oldPartitionElement) {
							//Change partition element
							//1. Remove the old element
							this.key = this.newProperties.partitionElement.oldPartitionElement;
							this.keyNextElem = windowFunc.partitionElements.getNextKey(this.key);
							windowFunc.partitionElements.remove(this.key);

							//2. Add the new element
							element = rankNode.elements.get(this.newProperties.partitionElement.newPartitionElement);
							windowFunc.partitionElements.add(this.newProperties.partitionElement.newPartitionElement, element, this.keyNextElem);
						}
					}
				}
				events.push({
					source: model.columnView,
					type: ViewModelEvents.RANKNODE_PROPERTIES_CHANGED,
					name: rankNode.name,
					changed: true
				});
			},
			undo: function(model, events) {
				var rankNode = model.columnView.viewNodes.get(this.viewNodeName);
				var windowFunc = {};
				var element;
				if (rankNode) {
					windowFunc = rankNode.windowFunction;
					if (windowFunc) {
						if (this.oldDynamicPartitionElements !== undefined) {
							windowFunc.dynamicPartitionElements = this.oldDynamicPartitionElements;
						}
						if (this.oldOrder) {
							windowFunc.orders.getAt(0).direction = this.oldOrder.direction;
							if (this.oldOrder.byElement) {
								element = rankNode.elements.get(this.oldOrder.byElement);
							}
							windowFunc.orders.getAt(0).byElement = element;
						}
						if (this.oldRankThreshold) {
							//Clear old values
							windowFunc.rankThreshold = undefined;
							if (this.oldRankThreshold.parameter) {
								this.oldRankThreshold.parameter = model.columnView.parameters.get(this.oldRankThreshold.parameter);
							}
							windowFunc.createOrMergeRankThreshold(this.oldRankThreshold);
						}
						if (this.newProperties.hasOwnProperty("partitionElement") && typeof this.newProperties.partitionElement !== undefined) {
							if (this.newProperties.partitionElement.newPartitionElement && !this.newProperties.partitionElement.oldPartitionElement) { //Add new 
								windowFunc.partitionElements.remove(this.newProperties.partitionElement.newPartitionElement);
							} else if (!this.newProperties.partitionElement.newPartitionElement && this.newProperties.partitionElement.oldPartitionElement) { //Remove
								element = rankNode.elements.get(this.newProperties.partitionElement.oldPartitionElement);
								windowFunc.partitionElements.add(this.newProperties.partitionElement.oldPartitionElement, element, this.keyNextElem);
							} else if (this.newProperties.partitionElement.newPartitionElement && this.newProperties.partitionElement.oldPartitionElement) { //Change 
								this.nextElemKey = windowFunc.partitionElements.getNextKey(this.newProperties.partitionElement.newPartitionElement);
								windowFunc.partitionElements.remove(this.newProperties.partitionElement.newPartitionElement);
								element = rankNode.elements.get(this.newProperties.partitionElement.oldPartitionElement);
								windowFunc.partitionElements.add(this.newProperties.partitionElement.oldPartitionElement, element, this.keyNextElem);
							}
						}
					}
				}
				events.push({
					source: model.columnView,
					type: ViewModelEvents.RANKNODE_PROPERTIES_CHANGED,
					name: rankNode.name,
					changed: true
				});
			}
		};

		/**
		 * @class Command to add a new Element including its mapping
		 * @param {string} viewNodeName - Name of the ViewNode
		 * @param {object} elementProperties
		 * @param {string} nextElementName
		 */
		var AddElementCommand = function(viewNodeName, elementProperties, nextElementName) {
			this.viewNodeName = viewNodeName;
			this.nextElementName = nextElementName;
			this.objectAttributes = elementProperties.objectAttributes;
			this.typeAttributes = elementProperties.typeAttributes;
			this.mappingAttributes = elementProperties.mappingAttributes;
			this.calculationAttributes = elementProperties.calculationAttributes;
			this.counter = elementProperties.counter;
			this.uniqueName = elementProperties.uniqueName;
			this.input = elementProperties.input;
			this.inputKey = elementProperties.inputKey;
			this.mappingKey = undefined;
		};
		AddElementCommand.prototype = {
			execute: function(model, events) {
				var that = this;
				var element;
				var viewNode = model.columnView.viewNodes.get(this.viewNodeName);
				if (viewNode) {
					if (this.inputKey !== undefined) {
						this.input = viewNode.inputs.get(this.inputKey);
					}
					/*var workspace = viewNode.workspace;
					if (viewNode.type === "Graph") {
						if (workspace) {
							workspace.elements.foreach(function(element) {
								
							});
						}
					}*/
					if (this.input && this.input.type !== "GRAPH_WORKSPACE") {
						var sourceElement = this.input.getSource().elements.get(this.mappingAttributes.sourceName);
						if (sourceElement) {
							if (sourceElement.aggregationBehavior && !(this.input.getSource().type === "DATA_BASE_TABLE" || this.input._source instanceof viewmodel
								.ViewNode)) {
								this.objectAttributes.aggregationBehavior = sourceElement.aggregationBehavior;
							} else {
								if (sourceElement.inlineType && viewNode.isDefaultNode()) {
									var dataType = sourceElement.inlineType.primitiveType;
									this.objectAttributes.aggregationBehavior = this.getAggregationBehavior(dataType);
								}
							}
						}
					} else if (this.typeAttributes && viewNode.isDefaultNode()) { // Script calc view
						this.objectAttributes.aggregationBehavior = this.getAggregationBehavior(this.typeAttributes.primitiveType);
					}
					if (!this.objectAttributes.aggregationBehavior || ((model.columnView.dataCategory === "DIMENSION" || model.columnView.dataCategory ===
						"DEFAULT") && viewNode.isDefaultNode())) {
						this.objectAttributes.aggregationBehavior = viewmodel.AggregationBehavior.NONE;
					}
					this.objectAttributes.aggregationBehavior = this.objectAttributes.aggregationBehavior.toLowerCase();
					if (this.objectAttributes.aggregationBehavior === viewmodel.AggregationBehavior.NONE && !this.calculationAttributes && !this.counter &&
						viewNode.isDefaultNode()) {
						this.objectAttributes.drillDownEnablement = "DRILL_DOWN";
					}
					element = viewNode.createElement(this.objectAttributes, null, this.nextElementName);
					if (this.typeAttributes) {
						if (this.calculationAttributes) {
							// For CalculatedViewAttribute isDerived will always be false
							this.typeAttributes.isDerived = false;
						}
						element.createOrMergeSimpleType(this.typeAttributes);
					}
					if (this.calculationAttributes) {
						element.createCalculationDefinition(this.calculationAttributes);
					}
					if (this.mappingAttributes) {
						if (this.mappingAttributes.length) {
							// create target in union
							this.constantMappingList = [];
							for (var i = 0; i < this.mappingAttributes.length; i++) {
								var unionMapping = this.mappingAttributes[i].input.createMapping(this.mappingAttributes[i].values);
								unionMapping.type = this.mappingAttributes[i].values.type;
								unionMapping.sourceElement = this.mappingAttributes[i].sourceName ? this.mappingAttributes[i].input.getSource().elements.get(this.mappingAttributes[
									i].sourceName) : undefined;
								unionMapping.targetElement = element;
								that.constantMappingList.push({
									inputKey: this.mappingAttributes[i].input.$getKeyAttributeValue(),
									mappingKey: unionMapping.$getKeyAttributeValue()
								});
							}

						} else if (this.input && this.input.type !== "GRAPH_WORKSPACE") {
							var mapping = this.input.createMapping();
							this.mappingKey = mapping.$getKeyAttributeValue();
							mapping.targetElement = element;
							if (this.mappingAttributes.hasOwnProperty("sourceName")) {
								mapping.sourceElement = sourceElement;
								mapping.type = "ElementMapping";
							}
							// ConstantMapping to be handled when Union is supported
							if (viewNode.type === "Union") {
								this.constantMappingList = [];
								viewNode.inputs.foreach(function(input) {
									if (that.input !== input) {
										var constantMapping = input.createMapping();
										constantMapping.type = "ConstantElementMapping";
										constantMapping.targetElement = element;
										constantMapping.value = "";
										constantMapping.isNull = true;
										that.constantMappingList.push({
											inputKey: input.$getKeyAttributeValue(),
											mappingKey: constantMapping.$getKeyAttributeValue()
										});
									}
								});
								// commentng below code to support one to many mapping in union
								/*this.input.mappings.foreach(function(obj) {
                            if (obj !== mapping && obj.sourceElement === mapping.sourceElement) {
                                // change to constant mapping
                                obj.type = "ConstantElementMapping";
                                obj.sourceElement = undefined;
                                obj.value = "";
                                obj.isNull = true;
                            }
                        });*/
							}
							// InputMapping to be supported when StarJoin is supported
						}
					}
					if (this.counter) {
						element.createExceptionAggregationStep(this.counter);
					}
					events.push({
						source: viewNode,
						type: ViewModelEvents.ELEMENT_CREATED,
						name: element.name,
						changed: true
					});
				}
				return element;
			},
			getAggregationBehavior: function(dataType) {
				if (dataType === "BIGINT" || dataType === "DECIMAL" || dataType === "DOUBLE" || dataType === "FLOAT" || dataType === "INTEGER" ||
					dataType === "REAL" || dataType === "SMALLDECIMAL" || dataType === "SMALLINT" || dataType === "TINYINT") {
					return "SUM";
				} else if (dataType === "DATE" || dataType === "TIME" || dataType === "TIMESTAMP") {
					return "MIN";
				}
			},
			undo: function(model, events) {
				var viewNode = model.columnView.viewNodes.get(this.viewNodeName);
				if (viewNode) {
					var element = viewNode.elements.remove(this.objectAttributes.name);
					if (this.mappingAttributes) {
						if (this.input) {
							this.input.mappings.remove(this.mappingKey);
						}
						// ConstantMapping to be handled when Union is supported
						if (viewNode.type === "Union") {
							for (var i = 0; i < this.constantMappingList.length; i++) {
								var inputObj = viewNode.inputs.get(this.constantMappingList[i].inputKey);
								inputObj.mappings.remove(this.constantMappingList[i].mappingKey);
							}
						}
					}
					if (element) {
						events.push({
							source: viewNode,
							type: ViewModelEvents.ELEMENT_DELETED,
							name: element.name,
							changed: true
						});
					}
				}
			}
		};

		/*
     * @class Command to add a new mapping in given Input
     * @param {string} viewNodeName - Name of the ViewNode
     * @param {object} attributes   - { input: {Input Object}, // SAMANTRAY to be changed; should accept inputId
                                        type: "",              // Type of Mapping; default: MappingType.ElementMapping
                                        targetName: "",        // will be used for all types; mapping can't be created without this
                                        mappingAttributes: { sourceName: "", targetName: "will be removed -SAMANTRAY" }, // MappingType.ElementMapping properties
                                        constantMappingAttributes: { value: "", isNull: "" },         // MappingType.ConstantElementMapping properties
                                        inputMappingAttributes: { sourceName: "", sourceInputId: "" } // MappintType.InputMapping properties
                                      }
     *
     */
		var CreateMappingCommand = function(viewNodeName, attributes) {
			this.viewNodeName = viewNodeName;
			this.mappingAttributes = attributes.mappingAttributes;
			this.input = attributes.input;
			this.mappingKey = undefined;
			this.type = "ElementMapping";
			this.merge = attributes.merge;
			if (attributes.hasOwnProperty("type")) {
				this.type = attributes.type;
			}
			if (attributes.hasOwnProperty("targetName")) {
				this.targetName = attributes.targetName;
			} else if (this.mappingAttributes) {
				this.targetName = this.mappingAttributes.targetName;
			}
			if (attributes.hasOwnProperty("constantMappingAttributes")) {
				this.constantMappingAttributes = constantMappingAttributes;
			}
		};
		CreateMappingCommand.prototype = {
			execute: function(model, events) {
				var mapping;
				var viewNode = model.columnView.viewNodes.get(this.viewNodeName);
				if (viewNode && this.targetName) {
					// Preparation
					var createAttribtues = {};
					var targetElement = viewNode.elements.get(this.targetName);
					if (!targetElement) {
						return undefined;
					}

					if (this.type === "ElementMapping") {
						if (!this.mappingAttributes.sourceName) {
							return undefined;
						}
						var sourceElement = this.input.getSource().elements.get(this.mappingAttributes.sourceName);
						if (!sourceElement) {
							return undefined;
						}

						// if mapping already exists in union - auto map 
						if (this.merge) {
							this.input.mappings.foreach(function(obj) {
								if (obj.targetElement === targetElement && obj.type === "ConstantElementMapping") {
									mapping = obj;
								}
							});
							if (mapping) {
								var mergeAttributes = {
									inputId: this.input.$getKeyAttributeValue(),
									mappingId: mapping.$getKeyAttributeValue()
								};
								mergeAttributes.mappingAttributes = {
									type: "ElementMapping",
									sourceElement: sourceElement,
									value: undefined,
									isNull: undefined
								};
								this.mergeCommand = new ChangeMappingPropertiesCommand(this.viewNodeName, mergeAttributes);
								return this.mergeCommand.execute(model, events);
							}
						}
					} else if (this.type === "ConstantElementMapping") {
						if (this.constantMappingAttributes) {
							createAttribtues = this.constantMappingAttributes;
						}
					} else if (this.type === "InputMapping") {
						// StarJoin -- TODO handle
					} else {
						return undefined; // invalid
					}

					// Preparation over; Create
					createAttribtues.type = this.type;
					mapping = this.input.createMapping(createAttribtues);
					this.mappingKey = mapping.$getKeyAttributeValue();
					mapping.targetElement = targetElement;
					if (this.type === "ElementMapping") {
						mapping.sourceElement = sourceElement;
					}
					// Constant Mapping to be handled when Union is supported
					// if (viewNode.type === "Union") {
					//     this.input.mappings.foreach(function(obj) {
					//         if (obj !== mapping && obj.sourceElement === mapping.sourceElement) {
					//             // change to constant mapping
					//             obj.type = "ConstantElementMapping";
					//             obj.sourceElement = undefined;
					//             obj.value = "";
					//             obj.isNull = true;
					//         }
					//     });
					// }

					// InputMapping to be supported when StarJoin is supported

					events.push({
						source: viewNode,
						type: ViewModelEvents.ELEMENT_CHANGED,
						name: targetElement.name,
						changed: true
					});
				}
				return mapping;
			},
			undo: function(model, events) {
				var viewNode = model.columnView.viewNodes.get(this.viewNodeName);
				if (viewNode && this.input && this.mappingKey !== undefined) {
					this.input.mappings.remove(this.mappingKey);
					events.push({
						source: viewNode,
						type: ViewModelEvents.ELEMENT_CHANGED,
						name: this.elementName,
						changed: true
					});
				}
				if (this.mergeCommand) {
					this.mergeCommand.undo();
				}
			}
		};

		/*
     * @class Command to change mapping properties
     * @param {string} viewNodeName - Name of the ViewNode
     * @param {object} attributes   - { mapping: {Mapping object}, // deprecated; should send inputId and mappingId
                                        inputId: "",               // Unique ID for input - from UI use input.$getKeyAttributeValue()
                                        mappingId: "",             // Unique ID for mapping - from UI use mapping.$getKeyAttributeValue()
                                        type: "",                  // Type of Mapping; default: MappingType.ElementMapping
                                        targetName: "",            // will be used for all types; mapping can't be created without this
                                        mappingAttributes: { sourceName: "", targetName: "will be removed -SAMANTRAY" }, // MappingType.ElementMapping properties
                                        constantMappingAttributes: { value: "", isNull: "" },         // MappingType.ConstantElementMapping properties
                                        inputMappingAttributes: { sourceName: "", sourceInputId: "" } // MappintType.InputMapping properties
                                      }
     */
		var ChangeMappingPropertiesCommand = function(viewNodeName, attributes) {
			this.viewNodeName = viewNodeName;
			this.inputId = attributes.inputId;
			this.mappingId = attributes.mappingId;
			this.mapping = attributes.mapping;
			this.mappingAttributes = attributes.mappingAttributes;
			this.oldMappingAttributes = undefined;
			this.constantMappingAttributes = attributes.constantMappingAttributes;
			this.oldConstantMappingAttributes = undefined;
		};
		ChangeMappingPropertiesCommand.prototype = {
			execute: function(model, events) {
				var viewNode = model.columnView.viewNodes.get(this.viewNodeName);

				var mappingObj = null;
				if (this.inputId !== undefined && this.mappingId !== undefined) {
					var input = viewNode.inputs.get(this.inputId);
					if (!input) {
						return undefined;
					}
					mappingObj = input.mappings.get(this.mappingId);
					if (!mappingObj) {
						return undefined;
					}
				} else {
					// Support for old command -- deprecated
					mappingObj = this.mapping;
				}

				if (mappingObj) {
					if (this.mappingAttributes) {
						this.oldMappingAttributes = mappingObj.$getAttributesForUndo(this.mappingAttributes);
						this.sourceElement = mappingObj.sourceElement;
						mappingObj.$setAttributes(this.mappingAttributes);
					} else if (this.constantMappingAttributes) {
						this.oldConstantMappingAttributes = mappingObj.$getAttributesForUndo(this.constantMappingAttributes);
						mappingObj.$setAttributes(this.constantMappingAttributes);
					}
					events.push({
						source: viewNode,
						type: ViewModelEvents.ELEMENT_CHANGED,
						name: mappingObj.targetElement.name,
						changed: true
					});
					return mappingObj;
				}
			},
			undo: function(model, events) {
				var viewNode = model.columnView.viewNodes.get(this.viewNodeName);

				var mappingObj = null;
				if (this.inputId !== undefined && this.mappingId !== undefined) {
					var input = viewNode.inputs.get(this.inputId);
					if (!input) {
						return undefined;
					}
					mappingObj = input.mappings.get(this.mappingId);
					if (!mappingObj) {
						return undefined;
					}
				} else {
					// Support for old command -- deprecated
					mappingObj = this.mapping;
				}
				if (viewNode && mappingObj) {
					if (this.oldMappingAttributes) {
						mappingObj.$setAttributes(this.oldMappingAttributes);
						mappingObj.sourceElement = this.sourceElement;
					} else if (this.oldConstantMappingAttributes) {
						mappingObj.$setAttributes(this.oldConstantMappingAttributes);
					} else {
						return undefined;
					}
				} else {
					return undefined;
				}
				events.push({
					source: viewNode,
					type: ViewModelEvents.ELEMENT_CHANGED,
					name: mappingObj.targetElement.name,
					changed: true
				});
			}
		};

		/**
		 * @class
		 */
		var MoveElementCommand = function(viewNodeName, elementName, isMoveUp) {
			this.viewNodeName = viewNodeName;
			this.elementName = elementName;
			this.isMoveUp = isMoveUp;
		};
		MoveElementCommand.prototype = {
			execute: function(model, events) {
				var viewNode = model.columnView.viewNodes.get(this.viewNodeName);
				if (viewNode) {
					if (this.isMoveUp) {
						viewNode.elements.moveUp(this.elementName);
					} else {
						viewNode.elements.moveDown(this.elementName);
					}
					events.push({
						source: viewNode,
						type: ViewModelEvents.ELEMENT_MOVED,
						name: this.elementName,
						changed: true
					});
				}
			},
			undo: function(model, events) {
				var viewNode = model.columnView.viewNodes.get(this.viewNodeName);
				if (viewNode) {
					if (this.isMoveUp) {
						viewNode.elements.moveDown(this.elementName);
					} else {
						viewNode.elements.moveUp(this.elementName);
					}
					events.push({
						source: viewNode,
						type: ViewModelEvents.ELEMENT_MOVED,
						name: this.elementName,
						changed: true
					});
				}
			}
		};

		/**
		 * @class
		 */
		var ChangeElementPropertiesCommand = function(viewNodeName, oldElementName, newAttributes) {
			this.deleteInlineType = newAttributes.hasOwnProperty("typeAttributes") && typeof newAttributes.typeAttributes === "undefined";
			this.createInlineType = false;
			this.viewNodeName = viewNodeName;
			this.oldElementName = oldElementName;
			this.newElementProperties = newAttributes.objectAttributes;
			this.newTypeProperties = newAttributes.typeAttributes;
			this.newCalculationProperties = newAttributes.calculationAttributes;
			this.newRestrictionProperties = newAttributes.restrictionAttributes;
			this.newCounter = newAttributes.counter;
			this.newElementName = this.newElementProperties && this.newElementProperties.name ? this.newElementProperties.name : oldElementName;
			this.labelElement = newAttributes.labelElement;
			this.unitCurrencyElement = newAttributes.unitCurrencyElement;
			this.keyElement = newAttributes.keyElement;
			this.newValueHelpElementName = newAttributes.elementName;
			this.oldValueHelpElementName = null;
			this.valueHelpEntityInfo = newAttributes.extTypeEntity;
			this.isDeleteValueHelpEntity = newAttributes.extTypeEntity === null ? true : false;
			this.isDeleteValueHelpElement = newAttributes.elementName === null ? true : false;
			this.endUserTextsServant = new EndUserTextsServant();
			this.endUserTextsServant.initialize(this, newAttributes.endUserTexts);
		};
		ChangeElementPropertiesCommand.prototype = {
			execute: function(model, events) {
				var that = this;
				var viewNode = model.columnView.viewNodes.get(this.viewNodeName);
				if (viewNode) {
					var element = viewNode.elements.get(this.oldElementName);
					if (element) {
						// remember old properties
						this.oldElementProperties = element.$getAttributesForUndo(this.newElementProperties);
						if (element.inlineType) {
							this.oldTypeProperties = element.inlineType.$getAttributesForUndo(this.newTypeProperties);
						}
						if (element.calculationDefinition && this.newCalculationProperties) {
							this.oldCalculationProperties = element.calculationDefinition.$getAttributesForUndo(this.newCalculationProperties);
						}
						if (element.restrictionExpression && this.newRestrictionProperties) {
							this.oldRestrictionProperties = element.restrictionExpression.$getAttributesForUndo(this.newRestrictionProperties);
						}
						if (element.exceptionAggregationStep && this.newCounter) {
							this.oldCounter = element.exceptionAggregationStep.$getAttributesForUndo(this.newCounter);
						}
						if (this.valueHelpEntityInfo) {
							this.oldvalueHelpEntity = element.externalTypeOfEntity;
							this.newExtTypeOfEntity = model.createOrMergeEntity(this.valueHelpEntityInfo);
							element.externalTypeOfEntity = this.newExtTypeOfEntity;
						}
						if (this.isDeleteValueHelpEntity) {
							this.oldvalueHelpEntity = element.externalTypeOfEntity;
							element.externalTypeOfEntity = undefined;
						}
						if (this.isDeleteValueHelpElement) {
							if (element.externalTypeOfElement) {
								this.oldValueHelpElementName = element.externalTypeOfElement.name;
								element.externalTypeOfElement = undefined;
							} else if (element.typeOfElement) {
								this.oldValueHelpElementName = element.typeOfElement.name;
								element.typeOfElement = undefined;
							}
						}
						if (this.newValueHelpElementName) {
							if (element.externalTypeOfElement) {
								this.oldValueHelpElementName = element.externalTypeOfElement.name;
							} else if (element.typeOfElement) {
								this.oldValueHelpElementName = element.typeOfElement.name;
							}
							if (element.externalTypeOfEntity) {
								var valueHelpElement = element.externalTypeOfEntity.elements.get(this.newValueHelpElementName);
								element.externalTypeOfElement = valueHelpElement;
								element.typeOfElement = undefined;
							} else {
								var valueHelpElement = model.columnView.getDefaultNode().elements.get(this.newValueHelpElementName);
								element.typeOfElement = valueHelpElement;
								element.externalTypeOfElement = undefined;
							}
						}
						// is rename?
						if (this.oldElementName !== this.newElementName) {
							if (viewNode.elements.get(this.newElementName)) {
								throw new modelbase.ObjectAlreadyExistsException("Element", this.newElementName, viewNode.name);
							}
							viewNode.elements.rename(this.oldElementName, this.newElementName);
							// LS: Mapping now contains object based reference; gets adjusted when changing the element name
							/*viewNode.inputs.foreach(function(input) {
                            input.mappings.foreach(function(mapping) {
                                if (mapping.targetName === that.oldElementName) {
                                    mapping.targetName = that.newElementName;
                                }
                            });
                        });
                        model.columnView.viewNodes.foreach(function(node) {
                            node.inputs.foreach(function(input) {
                                if (input.getSource().name === that.viewNodeName) {
                                    input.mappings.foreach(function(mapping) {
                                        if (mapping.sourceName === that.oldElementName) {
                                            mapping.sourceName = that.newElementName;
                                        }
                                    });
                                }
                            });

                        });*/
						}
						// merge-in new attributes
						element.$setAttributes(this.newElementProperties);
						// type attributes
						if (this.newTypeProperties) {
							if (!element.inlineType) {
								this.createInlineType = true;
								element.createOrMergeSimpleType(this.newTypeProperties);
							} else {
								element.inlineType.$setAttributes(this.newTypeProperties);
							}
						} else if (this.deleteInlineType) {
							delete element.inlineType;
						}

						if (this.newCalculationProperties && element.calculationDefinition) {
							element.calculationDefinition.$setAttributes(this.newCalculationProperties);
						}
						if (this.newRestrictionProperties) {
							if (!element.restrictionExpression)
								element.restrictionExpression = element.createRestrictionExpression(this.newRestrictionProperties);
							else
								element.restrictionExpression.$setAttributes(this.newRestrictionProperties);
						}

						if (this.newCounter && element.exceptionAggregationStep) {
							element.exceptionAggregationStep.$setAttributes(this.newCounter);
						}

						if (this.unitCurrencyElement) {

							if (this.unitCurrencyElement.clear) {
								this.oldUnitCurrencyElement = element.unitCurrencyElement;
								this.oldFixedCurrency = element.fixedCurrency;
								element.unitCurrencyElement = undefined;
								element.fixedCurrency = undefined;
							} else {
								if (this.unitCurrencyElement.element) {
									this.oldUnitCurrencyElement = element.unitCurrencyElement;
									element.unitCurrencyElement = this.unitCurrencyElement.element;
									element.fixedCurrency = undefined;
								} else if (this.unitCurrencyElement.fixedCurrency) {
									this.oldFixedCurrency = element.fixedCurrency;
									element.fixedCurrency = this.unitCurrencyElement.fixedCurrency;
									element.unitCurrencyElement = undefined;
								}
							}
						}

						if (this.labelElement !== undefined) {
							this.oldLabelElement = element.labelElement;
							if (this.labelElement === null) {
								element.labelElement = undefined;
							} else {
								element.labelElement = this.labelElement;
							}
						}
						if (this.keyElement !== undefined) {
							if (this.keyElement) {
								viewNode.keyElements.add(element);
							} else {
								if (viewNode.keyElements.get(element.name)) {
									this.oldKeyElement = true;
								}
								viewNode.keyElements.remove(element.name);
							}
						}
						this.endUserTextsServant.execute(this, element);

						events.push({
							source: viewNode,
							type: ViewModelEvents.ELEMENT_CHANGED,
							originalName: this.oldElementName,
							name: element.name,
							changed: true
						});
						return element;
					}
				}
			},
			undo: function(model, events) {
				var viewNode = model.columnView.viewNodes.get(this.viewNodeName);
				if (viewNode) {
					var element = viewNode.elements.get(this.newElementName);
					if (element) {
						// is re-name
						if (this.oldElementName !== this.newElementName) {
							viewNode.elements.rename(this.newElementName, this.oldElementName);
							// LS: Mapping now contains object based reference; gets adjusted when changing the element name
							/*viewNode.inputs.foreach(function(input) {
                            input.mappings.foreach(function(mapping) {
                                if (mapping.targetName === that.newElementName) {
                                    mapping.targetName = that.oldElementName;
                                }
                            });
                        });
                        model.columnView.viewNodes.foreach(function(node) {
                            node.inputs.foreach(function(input) {
                                if (input.getSource().name === that.viewNodeName) {
                                    input.mappings.foreach(function(mapping) {
                                        if (mapping.sourceName === that.newElementName) {
                                            mapping.sourceName = that.oldElementName;
                                        }
                                    });
                                }
                            });

                        });*/
						}
						// reset old attributes
						element.$setAttributes(this.oldElementProperties);
						if (this.oldTypeProperties) {
							if (!element.inlineType) {
								element.createOrMergeSimpleType(this.oldTypeProperties);
							} else {
								element.inlineType.$setAttributes(this.oldTypeProperties);
							}
						} else if (this.createInlineType) {
							delete element.inlineType;
						}
						if (this.oldCalculationProperties) {
							element.calculationDefinition.$setAttributes(this.oldCalculationProperties);
						}
						if (this.oldRestrictionProperties) {
							element.restrictionExpression.$setAttributes(this.oldRestrictionProperties);
						}
						if (this.oldCounter) {
							element.exceptionAggregationStep.$setAttributes(this.oldCounter);
						}

						if (this.oldLabelElement || this.labelElement) {
							element.labelElement = this.oldLabelElement;
						}
						if (this.valueHelpEntityInfo) {
							if (this.oldvalueHelpEntity) {
								element.externalTypeOfEntity = this.oldvalueHelpEntity;
							} else {
								element.externalTypeOfEntity.$remove();
							}
						}
						if (this.isDeleteValueHelpEntity) {
							element.externalTypeOfEntity = this.oldvalueHelpEntity;
						}
						if (this.isDeleteValueHelpElement) {
							if (this.oldValueHelpElementName) {
								if (element.externalTypeOfEntity) {
									var valueHelpElement = element.externalTypeOfEntity.elements.get(this.oldValueHelpElementName);
									element.externalTypeOfElement = valueHelpElement;
								} else {
									var valueHelpElement = model.columnView.getDefaultNode().elements.get(this.oldValueHelpElementName);
									element.typeOfElement = valueHelpElement;
								}

							}
						}
						if (this.newValueHelpElementName) {
							if (this.oldValueHelpElementName) {
								if (element.externalTypeOfEntity) {
									var valueHelpElement = element.externalTypeOfEntity.elements.get(this.oldValueHelpElementName);
									element.externalTypeOfElement = valueHelpElement;
									element.typeOfElement = undefined;
								} else {
									var valueHelpElement = model.columnView.getDefaultNode().elements.get(this.oldValueHelpElementName);
									element.typeOfElement = valueHelpElement;
									element.externalTypeOfElement = undefined;
								}

							} else {
								element.typeOfElement = undefined;
								element.externalTypeOfElement = undefined;
							}
						}

						if (this.keyElement !== undefined) {
							if (this.keyElement) {
								viewNode.keyElements.remove(element.name);
							} else {
								if (this.oldKeyElement) {
									viewNode.keyElements.add(element);
								}
							}
						}
						if (this.unitCurrencyElement) {
							if (this.oldUnitCurrencyElement) {
								element.unitCurrencyElement = this.oldUnitCurrencyElement;
							}
							if (this.oldFixedCurrency) {
								element.fixedCurrency = this.oldFixedCurrency;
							}
						}
						this.endUserTextsServant.undo(this, element);

						events.push({
							source: viewNode,
							type: ViewModelEvents.ELEMENT_CHANGED,
							originalName: this.newElementName,
							name: element.name,
							changed: true
						});
					}
				}
			}
		};

		/**
		 * @class
		 */
		var CopyElementCommand = function(viewNodeName, elementName) {
			this.viewNodeName = viewNodeName;
			this.elementName = elementName;
			this.createCommand = null;
		};
		CopyElementCommand.prototype = {
			execute: function(model, events) {
				var viewNode = model.columnView.viewNodes.get(this.viewNodeName);
				if (viewNode) {
					var element = viewNode.elements.get(this.elementName);
					if (element) {
						var nextElementName = viewNode.elements.getNextKey(element.name);
						var elementProperties = {};
						elementProperties.objectAttributes = element.$getAttributes();
						if (element.inlineType) {
							elementProperties.typeAttributes = element.inlineType.$getAttributes();
						}
						elementProperties.objectAttributes.name = viewNode.getElementNameForCopy(element.name);
						this.createCommand = new AddElementCommand(this.viewNodeName, elementProperties, nextElementName);
						return this.createCommand.execute(model, events);
					}
				}
			},
			undo: function(model, events) {
				if (this.createCommand) {
					return this.createCommand.undo(model, events);
				}
			}
		};

		/**
		 * @class
		 */
		var AddParameterCommand = function(parameterProperties, nextParameterName) {
			this.nextParameterName = nextParameterName;
			this.parameterAttributes = parameterProperties.objectAttributes;
			this.typeAttributes = parameterProperties.typeAttributes;
		};
		AddParameterCommand.prototype = {
			execute: function(model, events) {
				var parameter = model.columnView.createParameter(this.parameterAttributes, null, this.nextParameterName);
				if (this.typeAttributes) {
					parameter.createOrMergeSimpleType(this.typeAttributes);
				}
				events.push({
					source: model.columnView,
					type: ViewModelEvents.PARAMETER_CREATED,
					name: parameter.name,
					changed: true
				});
				return parameter;
			},
			undo: function(model, events) {
				var parameter = model.columnView.parameters.remove(this.parameterAttributes.name);
				if (parameter) {
					events.push({
						source: model.columnView,
						type: ViewModelEvents.PARAMETER_DELETED,
						name: parameter.name,
						changed: true
					});
				}
			}
		};

		/**
		 * @class
		 */
		var MoveParameterCommand = function(parameterName, isMoveUp) {
			this.parameterName = parameterName;
			this.isMoveUp = isMoveUp;
		};
		MoveParameterCommand.prototype = {
			execute: function(model, events) {
				if (this.isMoveUp) {
					model.columnView.parameters.moveUp(this.parameterName);
				} else {
					model.columnView.parameters.moveDown(this.parameterName);
				}
				events.push({
					source: model.columnView,
					type: ViewModelEvents.PARAMETER_MOVED,
					name: this.parameterName,
					changed: true
				});
			},
			undo: function(model, events) {
				if (this.isMoveUp) {
					model.columnView.parameters.moveDown(this.parameterName);
				} else {
					model.columnView.parameters.moveUp(this.parameterName);
				}
				events.push({
					source: model.columnView,
					type: ViewModelEvents.PARAMETER_MOVED,
					name: this.parameterName,
					changed: true
				});
			}
		};

		/**
		 * @class ChangeParameterPropertiesCommand
		 * @property {object} newAttributes - {
		 *     objectAttributes    : { defaultValue: "", multipleSelections: true/false, mandatory: true/false, selectionType: "", parameterType: "" }
		 *     ...,
		 *     externalTypeOfEntity: { ... },
		 *     entityFQN: "" // for shared dimention elements , entityFQN = entity fully qualified name
		 *     typeOfElementName   : "",
		 *     hierarchyName       : "", // Hierarchy has to be from same view as typeOfElement
		 *     endUserTexts        : { objectAttributes: { label : "", labelMaxLength: <number> },
		 *                             comment         : { text  : "", mimetype      : ""       } }
		 * }
		 */
		var ChangeParameterPropertiesCommand = function(oldParameterName, newAttributes) {
			this.deleteInlineType = newAttributes.hasOwnProperty("typeAttributes") && typeof newAttributes.typeAttributes === "undefined";
			this.createInlineType = false;
			this.newTypeProperties = newAttributes.typeAttributes;
			this.oldTypeProperties = undefined;

			this.oldParameterName = oldParameterName;
			this.newParameterProperties = newAttributes.objectAttributes;
			this.oldParameterProperties = undefined;

			this.newParameterName = this.newParameterProperties && this.newParameterProperties.name ? this.newParameterProperties.name :
				oldParameterName;

			this.newDefaultExpression = newAttributes.defaultExpression;
			this.oldDefaultExpression = undefined;
			this.deleteDefaultExpression = newAttributes.hasOwnProperty("defaultExpression") && typeof newAttributes.defaultExpression ===
				"undefined";
			this.createDefaultExpression = false;

			this.extTypeOfEntityInfo = newAttributes.externalTypeOfEntity;
			this.newExtTypeOfEntity = undefined;
			this.oldExtTypeOfEntity = undefined;

			this.entityFQN = newAttributes.entityFQN;
			this.oldEntityFQN = undefined;

			this.isDeleteTypeOfElement = newAttributes.hasOwnProperty("typeOfElementName") && typeof newAttributes.typeOfElementName ===
				"undefined";
			this.typeOfElementName = newAttributes.typeOfElementName;
			this.oldTypeOfElementInfo = {};
			this.isCreateTypeOfElement = false;

			this.isDeleteHierarchy = newAttributes.hasOwnProperty("hierarchyName") && typeof newAttributes.hierarchyName === "undefined";
			this.hierarchyName = newAttributes.hierarchyName;
			this.oldHierarchyName = undefined;
			this.isCreateHierarchy = false;

			this.endUserTextsServant = new EndUserTextsServant();
			this.endUserTextsServant.initialize(this, newAttributes.endUserTexts);
		};
		ChangeParameterPropertiesCommand.prototype = {
			execute: function(model, events, isRedo) {
				var parameter = model.columnView.parameters.get(this.oldParameterName);
				if (parameter) {
					// remember old properties
					this.oldParameterProperties = parameter.$getAttributesForUndo(this.newParameterProperties);
					if (parameter.inlineType) {
						this.oldTypeProperties = parameter.inlineType.$getAttributesForUndo(this.newTypeProperties);
					}
					// is rename?
					if (this.oldParameterName !== this.newParameterName) {
						if (model.columnView.parameters.get(this.newParameterName)) {
							throw new modelbase.ObjectAlreadyExistsException("Parameter", this.newParameterName, model.columnView.name);
						}
						model.columnView.parameters.rename(this.oldParameterName, this.newParameterName);
					}
					// merge-in new attributes
					parameter.$setAttributes(this.newParameterProperties);
					// type attributes
					if (this.newTypeProperties) {
						if (!parameter.inlineType) {
							this.createInlineType = true;
							parameter.createOrMergeSimpleType(this.newTypeProperties);
						} else {
							parameter.inlineType.$setAttributes(this.newTypeProperties);
						}
					} else if (this.deleteInlineType) {
						//delete parameter.inlineType;
						parameter.inlineType.$remove();
					}

					// default expression
					if (this.newDefaultExpression) {
						if (!parameter.defaultExpression) {
							this.createDefaultExpression = true;
							parameter.createDefaultExpression(this.newDefaultExpression);
						} else {
							this.oldDefaultExpression = parameter.defaultExpression.$getAttributesForUndo(this.newDefaultExpression);
							parameter.defaultExpression.$setAttributes(this.newDefaultExpression);
						}
					} else if (this.deleteDefaultExpression) {
						parameter.defaultExpression.$remove();
					}

					// external type of Entity
					if (this.extTypeOfEntityInfo) {
						this.oldExtTypeOfEntity = parameter.externalTypeOfEntity;
						this.newExtTypeOfEntity = model.createOrMergeEntity(this.extTypeOfEntityInfo);
						parameter.externalTypeOfEntity = this.newExtTypeOfEntity;
						if (!isRedo) {
							this.newExtTypeOfEntity.isProxy = true;
						}
					}

					// typeOfElement / externalTypeOfElement
					if (this.isDeleteTypeOfElement) {
						if (parameter.externalTypeOfElement && parameter.externalTypeOfElement instanceof Element) {
							this.oldTypeOfElementInfo.name = parameter.externalTypeOfElement.name;
							this.oldTypeOfElementInfo.isPrivate = false;
							// parameter.externalTypeOfElement.$remove(); // should remove only the reference and not the actual element
							parameter.externalTypeOfElement = undefined;
						} else if (parameter.typeOfElement) {
							if (parameter.typeOfElement.$getContainer() instanceof viewmodel.Entity) {
								this.oldEntityFQN = parameter.typeOfElement.$getContainer().fqName;
							}
							this.oldTypeOfElementInfo.name = parameter.typeOfElement.name;
							this.oldTypeOfElementInfo.isPrivate = true;
							// parameter.typeOfElement.$remove(); // should remove only the reference and not the actual element
							parameter.typeOfElement = undefined;
						}
					} else if (this.typeOfElementName && this.typeOfElementName !== "") {
						var element;
						if (parameter.externalTypeOfEntity) {
							// external
							if (parameter.externalTypeOfElement) {
								this.oldTypeOfElementInfo.name = parameter.externalTypeOfElement.name;
								this.oldTypeOfElementInfo.isPrivate = false;
							} else {
								this.isCreateTypeOfElement = true;
							}
							element = parameter.externalTypeOfEntity.elements.get(this.typeOfElementName);
							parameter.externalTypeOfElement = element;
						} else {
							// private
							if (parameter.typeOfElement) {
								this.oldTypeOfElementInfo.name = parameter.typeOfElement.name;
								this.oldTypeOfElementInfo.isPrivate = true;
								if (parameter.typeOfElement.$getContainer() instanceof viewmodel.Entity) {
									this.oldEntityFQN = parameter.typeOfElement.$getContainer().fqName;
								}
							} else {
								this.isCreateTypeOfElement = true;
							}
							if (this.entityFQN) {
								var entity = model._entities.get(this.entityFQN);
								element = entity.elements.get(this.typeOfElementName);
							} else {
								element = model.columnView.getDefaultNode().elements.get(this.typeOfElementName);
							}
							parameter.typeOfElement = element;
						}
					}
					if (this.isDeleteHierarchy) {
						if (parameter.hierarchy) {
							this.oldHierarchyName = parameter.hierarchy.name;
							parameter.hierarchy = undefined;
						}
					} else if (this.hierarchyName && this.hierarchyName !== "") {
						// hierarchy has to be used from container of the typeOfElement/externalTypeOfElement
						var valueHelpElem = parameter.typeOfElement ? parameter.typeOfElement :
							parameter.externalTypeOfElement ? parameter.externalTypeOfElement : undefined;
						if (!valueHelpElem) {
							return;
						}
						var valueHelpEntity = valueHelpElem.$getContainer() instanceof viewmodel.ViewNode ?
							valueHelpElem.$getContainer().$getContainer() :
							valueHelpElem.$getContainer();
						if (!(valueHelpEntity && valueHelpEntity.inlineHierarchies)) {
							return;
						}
						var hier = valueHelpEntity.inlineHierarchies.get(this.hierarchyName);
						parameter.hierarchy = hier;
					}

					this.endUserTextsServant.execute(this, parameter);

					events.push({
						source: model.columnView,
						type: ViewModelEvents.PARAMETER_CHANGED,
						originalName: this.oldParameterName,
						name: parameter.name,
						changed: true
					});
				}
			},
			undo: function(model, events) {
				var parameter = model.columnView.parameters.get(this.newParameterName);
				if (parameter) {
					// is re-name
					if (this.oldParameterName !== this.newParameterName) {
						model.columnView.parameters.rename(this.newParameterName, this.oldParameterName);
					}
					// reset old attributes
					parameter.$setAttributes(this.oldParameterProperties);
					if (this.oldTypeProperties) {
						if (!parameter.inlineType) {
							parameter.createOrMergeSimpleType(this.oldTypeProperties);
						} else {
							parameter.inlineType.$setAttributes(this.oldTypeProperties);
						}
					} else if (this.createInlineType) {
						delete parameter.inlineType;
					}

					// default expression
					if (this.oldDefaultExpression) {
						if (!parameter.defaultExpression) {
							parameter.createDefaultExpression(this.oldDefaultExpression);
						} else {
							parameter.defaultExpression.$setAttributes(this.oldDefaultExpression);
						}
					} else if (this.createDefaultExpression) {
						delete parameter.defaultExpression;
					}

					// external type of Entity
					if (this.extTypeOfEntity) {
						if (this.oldExtTypeOfEntity) {
							parameter.externalTypeOfEntity = this.oldExtTypeOfEntity;
						} else {
							parameter.externalTypeOfEntity.$remove();
						}
					}
					if (this.isDeleteTypeOfElement) {
						if (this.oldTypeOfElementInfo) {
							var element;
							if (parameter.externalTypeOfEntity) {
								element = parameter.externalTypeOfEntity.elements.get(this.oldTypeOfElementInfo.name);
								parameter.externalTypeOfElement = element;
							} else {
								if (this.oldEntityFQN) {
									var entity = model._entities.get(this.oldEntityFQN);
									element = entity.elements.get(this.oldTypeOfElementInfo.name);
								} else {
									element = model.columnView.getDefaultNode().elements.get(this.oldTypeOfElementInfo.name);
								}
								parameter.typeOfElement = element;
							}
						}
					}
					// typeOfElement / externalTypeOfElement
					if (this.typeOfElementName && this.typeOfElementName !== "") {
						if (this.oldTypeOfElementInfo) {
							var element;
							if (parameter.externalTypeOfEntity) {
								element = parameter.externalTypeOfEntity.elements.get(this.oldTypeOfElementInfo.name);
								parameter.externalTypeOfElement = element;
							} else {
								if (this.oldEntityFQN) {
									var entity = model._entities.get(this.oldEntityFQN);
									element = entity.elements.get(this.oldTypeOfElementInfo.name);
								} else {
									element = model.columnView.getDefaultNode().elements.get(this.oldTypeOfElementInfo.name);
								}
								parameter.typeOfElement = element;
							}
						} else {
							parameter.typeOfElement = undefined;
							parameter.externalTypeOfElement = undefined;
							/*parameter.typeOfElement.$remove();
                        parameter.externalTypeOfElement.$remove();*/
						}
					}
					if (this.hierarchyName && this.hierarchyName !== "") {
						if (this.oldHierarchyName) {
							// hierarchy has to be used from container of the typeOfElement/externalTypeOfElement
							var valueHelpElem = parameter.typeOfElement ? parameter.typeOfElement :
								parameter.externalTypeOfElement ? parameter.externalTypeOfElement : undefined;
							if (!valueHelpElem) {
								return;
							}
							var valueHelpEntity = valueHelpElem.$getContainer() instanceof viewmodel.ViewNode ?
								valueHelpElem.$getContainer().$getContainer() :
								valueHelpElem.$getContainer();
							if (!(valueHelpEntity && valueHelpEntity.inlineHierarchies)) {
								return;
							}
							var hier = valueHelpEntity.inlineHierarchies.get(this.oldHierarchyName);
							parameter.hierarchy = hier;
						} else {
							parameter.hierarchy = undefined;
						}
					}

					this.endUserTextsServant.undo(this, parameter);

					events.push({
						source: model.columnView,
						type: ViewModelEvents.PARAMETER_CHANGED,
						originalName: this.newParameterName,
						name: parameter.name,
						changed: true
					});
				}
			}
		};

		/**
		 * @class
		 */
		var CopyParameterCommand = function(parameterName) {
			this.parameterName = parameterName;
			this.createCommand = null;
		};
		CopyParameterCommand.prototype = {
			execute: function(model, events) {
				var parameter = model.columnView.parameters.get(this.parameterName);
				if (parameter) {
					var nextParameterName = model.columnView.parameters.getNextKey(parameter.name);
					var parameterProperties = {};
					parameterProperties.objectAttributes = parameter.$getAttributes();
					if (parameter.inlineType) {
						parameterProperties.typeAttributes = parameter.inlineType.$getAttributes();
					}
					parameterProperties.objectAttributes.name = model.columnView.getParameterNameForCopy(parameter.name);
					this.createCommand = new AddParameterCommand(parameterProperties, nextParameterName);
					return this.createCommand.execute(model, events);
				}
			},
			undo: function(model, events) {
				if (this.createCommand) {
					return this.createCommand.undo(model, events);
				}
			}
		};

		/**
		 * @class
		 */
		var CreateParameterValueRangeCommand = function(parameterName, attributes) {
			this.parameterName = parameterName;
			this.attributes = attributes;
		};
		CreateParameterValueRangeCommand.prototype = {
			execute: function(model, events) {
				var parameter = model.columnView.parameters.get(this.parameterName);
				if (parameter && parameter.inlineType) {
					var valueRange = parameter.inlineType.createValueRange(this.attributes);
					events.push({
						source: parameter.inlineType,
						type: ViewModelEvents.PARAMETER_VALUERANGE_CREATED,
						name: this.value,
						changed: true
					});
					return valueRange;
				}
			},
			undo: function(model, events) {
				var parameter = model.columnView.parameters.get(this.parameterName);
				if (parameter && parameter.inlineType && parameter.inlineType.valueRanges) {
					var valueRange = parameter.inlineType.valueRanges.remove(this.value);
					if (valueRange) {
						events.push({
							source: parameter.inlineType,
							type: ViewModelEvents.PARAMETER_VALUERANGE_DELETED,
							name: this.value,
							changed: true
						});
					}
				}
			}
		};

		/**
		 * @class ChangeParameterValueRangeCommand - To change a Value Range object in Parameter
		 * @parameter {string} parameterName      - Name of parameter
		 * @parameter {string} value              - Value (key); In case of chagne in value this is the old value
		 * @parameter {object} attributes         - Contains attributes that are changed
		 */
		var ChangeParameterValueRangeCommand = function(parameterName, value, attributes) {
			this.parameterName = parameterName; // key

			this.oldValue = value; // key
			if (attributes.hasOwnProperty("value") && typeof attributes.value !== "undefined") {
				this.newValue = attributes.value;
			}

			this.oldDesc;
			if (attributes.hasOwnProperty("defaultDescription")) {
				this.newDesc = attributes.defaultDescription;
			}
		};
		ChangeParameterValueRangeCommand.prototype = {
			execute: function(model, events) {
				var parameter = model.columnView.parameters.get(this.parameterName);
				if (parameter && parameter.inlineType && parameter.inlineType.valueRanges) {
					var valueRange = parameter.inlineType.valueRanges.get(this.oldValue);
					if (valueRange) {
						if (this.newDesc) {
							this.oldDesc = valueRange.label;
							valueRange.label = this.newDesc;
						}
						if (this.newValue) {
							// oldValue is key; so anyways set
							valueRange.$rename(this.newValue);
						}

						events.push({
							source: parameter.inlineType,
							type: ViewModelEvents.PARAMETER_VALUERANGE_CHANGED,
							name: this.oldValue,
							changed: true
						});
						return valueRange;
					}
				}
			},
			undo: function(model, events) {
				var parameter = model.columnView.parameters.get(this.parameterName);
				if (parameter && parameter.inlineType && parameter.inlineType.valueRanges) {
					var valueRange = parameter.inlineType.valueRanges.get(this.oldValue);
					if (valueRange) {
						if (this.oldDesc) {
							valueRange.label = this.oldDesc;
						} else {
							delete valueRange.label;
						}
						if (this.newValue && this.oldValue !== this.newValue) {
							valueRange.$rename(this.oldValue);
						}

						events.push({
							source: parameter.inlineType,
							type: ViewModelEvents.PARAMETER_VALUERANGE_CHANGED,
							name: this.oldValue,
							changed: true
						});
					}
				}
			}
		};

		/**
		 * @class
		 */
		var CreateParameterDefaultRangeCommand = function(parameterName, attributes) {
			this.parameterName = parameterName;
			this.attributes = attributes;
			this.defaultRangeKey = undefined;
		};
		CreateParameterDefaultRangeCommand.prototype = {
			execute: function(model, events) {
				var parameter = model.columnView.parameters.get(this.parameterName);
				if (parameter) {
					var defaultRange = parameter.createDefaultRange(this.attributes);
					this.defaultRangeKey = defaultRange.$getKeyAttributeValue();
					events.push({
						source: parameter,
						type: ViewModelEvents.PARAMETER_DEFAULTRANGE_CREATED,
						name: this.defaultRangeKey,
						changed: true
					});
					return defaultRange;
				}
			},
			undo: function(model, events) {
				var parameter = model.columnView.parameters.get(this.parameterName);
				if (parameter && parameter.defaultRanges) {
					var defaultRange = parameter.defaultRanges.remove(this.defaultRangeKey);
					if (defaultRange) {
						events.push({
							source: parameter,
							type: ViewModelEvents.PARAMETER_DEFAULTRANGE_DELETED,
							name: this.defaultRangeKey,
							changed: true
						});
					}
				}
			}
		};

		/**
		 * @class
		 */
		var ChangeParameterDefaultRangeCommand = function(parameterName, defaultRangeKey, attributes) {
			this.parameterName = parameterName;
			this.attributes = attributes;
			this.defaultRangeKey = defaultRangeKey;
			this.oldAttributes = undefined;
		};
		ChangeParameterDefaultRangeCommand.prototype = {
			execute: function(model, events) {
				var parameter = model.columnView.parameters.get(this.parameterName);
				if (parameter && parameter.defaultRanges) {
					var defaultRange = parameter.defaultRanges.get(this.defaultRangeKey);
					if (defaultRange) {
						this.oldAttributes = defaultRange.$getAttributesForUndo(this.attributes);
						defaultRange.$setAttributes(this.attributes);
						events.push({
							source: parameter,
							type: ViewModelEvents.PARAMETER_DEFAULTRANGE_CHANGED,
							name: this.defaultRangeKey,
							changed: true
						});
					}
					return defaultRange;
				}
			},
			undo: function(model, events) {
				var parameter = model.columnView.parameters.get(this.parameterName);
				if (parameter && parameter.defaultRanges) {
					var defaultRange = parameter.defaultRanges.get(this.defaultRangeKey);
					if (defaultRange) {
						defaultRange.$setAttributes(this.oldAttributes);
						events.push({
							source: parameter,
							type: ViewModelEvents.PARAMETER_DEFAULTRANGE_CHANGED,
							name: this.defaultRangeKey,
							changed: true
						});
					}
				}
			}
		};

		/**
		 * @class AddParamAssignedElemCommand - Add element assignment for variable
		 * @property {string} parameterName - Parameter name
		 * @property {object} attributes    - { elementName: "", entityFQN: "", nextElementName: "", nextElementEntityFQN: "" }
		 */
		var AddParamAssignedElemCommand = function(parameterName, attributes) {
			this.paramName = parameterName;
			this.attrs = attributes;
			this.key;
		};
		AddParamAssignedElemCommand.prototype = {
			execute: function(model, events) {
				var param = model.columnView.parameters.get(this.paramName);
				if (param) {
					var elem;
					if (this.attrs.hasOwnProperty("entityFQN") && this.attrs.entityFQN) {
						// shared element
						this.key = this.attrs.entityFQN + "." + this.attrs.elementName;
						var entity = model._entities.get(this.attrs.entityFQN);
						elem = entity.elements.get(this.attrs.elementName);
					} else {
						// private element
						this.key = this.attrs.elementName;
						elem = model.columnView.getDefaultNode().elements.get(this.attrs.elementName);
					}

					if (this.attrs.nextElementName) {
						var keyNextElem;
						if (this.attrs.hasOwnProperty("nextElementEntityFQN") && this.attrs.nextElementEntityFQN) {
							keyNextElem = this.attrs.nextElementEntityFQN + "." + this.attrs.nextElementName;
						} else {
							keyNextElem = this.attrs.nextElementName;
						}
						param.assignedElements.add(this.key, elem, keyNextElem);
					} else {
						param.assignedElements.add(this.key, elem);
					}

					events.push({
						source: model.columnView,
						type: ViewModelEvents.PARAMETER_CHANGED,
						name: param.name,
						changed: true
					});

					events.push({
						source: param,
						type: ViewModelEvents.PARAMETER_ASSIGNEDELEMENT_CREATED,
						name: this.key,
						changed: true
					});
				}
			},
			undo: function(model, events) {
				var param = model.columnView.parameters.get(this.paramName);
				if (param) {
					param.assignedElements.remove(this.key);
				}

				events.push({
					source: model.columnView,
					type: ViewModelEvents.PARAMETER_CHANGED,
					name: param.name,
					changed: true
				});

				events.push({
					source: param,
					type: ViewModelEvents.PARAMETER_ASSIGNEDELEMENT_DELETED,
					name: this.key,
					changed: true
				});
			}
		};

		/**
		 * @class RemoveParamAssignedElemCommand - Remove element assignment for variable
		 * @property {string} parameterName - Parameter name
		 * @property {object} attributes    - { elementName: "", entityFQN: "" }
		 */
		var RemoveParamAssignedElemCommand = function(parameterName, attributes) {
			this.paramName = parameterName;
			this.attrs = attributes;
			this.key;
			this.nextElemKey;
		};
		RemoveParamAssignedElemCommand.prototype = {
			execute: function(model, events) {
				var param = model.columnView.parameters.get(this.paramName);
				if (param) {
					if (this.attrs.hasOwnProperty("entityFQN") && this.attrs.entityFQN) {
						// shared element
						this.key = this.attrs.entityFQN + "." + this.attrs.elementName;
					} else {
						// private element
						this.key = this.attrs.elementName;
					}
					this.nextElemKey = param.assignedElements.getNextKey(this.key);
					param.assignedElements.remove(this.key);
				}

				events.push({
					source: model.columnView,
					type: ViewModelEvents.PARAMETER_CHANGED,
					name: param.name,
					changed: true
				});

				events.push({
					source: param,
					type: ViewModelEvents.PARAMETER_ASSIGNEDELEMENT_DELETED,
					name: this.key,
					changed: true
				});
			},
			undo: function(model, events) {
				var param = model.columnView.parameters.get(this.paramName);
				if (param) {
					var elem;
					if (this.attrs.hasOwnProperty("entityFQN") && this.attrs.entityFQN) {
						var entity = model._entities.get(this.attrs.entityFQN);
						elem = entity.elements.get(this.attrs.elementName);
					} else {
						// private element
						elem = model.columnView.getDefaultNode().elements.get(this.attrs.elementName);
					}

					param.assignedElements.add(this.key, elem, this.nextElemKey);

					events.push({
						source: model.columnView,
						type: ViewModelEvents.PARAMETER_CHANGED,
						name: param.name,
						changed: true
					});

					events.push({
						source: param,
						type: ViewModelEvents.PARAMETER_ASSIGNEDELEMENT_CREATED,
						name: this.key,
						changed: true
					});
				}
			}
		};

		/**
		 * @class AddCounterReferenceElemCommand - Add element assignment for counter
		 * @property {string} CounterName   - Counter name
		 * @property {object} attributes    - { elementName: "", entityFQN: "", nextElementName: "", nextElementEntityFQN: "" }
		 */
		var AddCounterReferenceElemCommand = function(counterName, attributes) {
			this.counterName = counterName;
			this.attrs = attributes;
			this.key;
		};
		AddCounterReferenceElemCommand.prototype = {
			execute: function(model, events) {
				var counter = model.columnView.getDefaultNode().elements.get(this.counterName);
				if (counter) {
					var elem;
					if (this.attrs.hasOwnProperty("entityFQN") && this.attrs.entityFQN) {
						// shared element
						this.key = this.attrs.entityFQN + "." + this.attrs.elementName;
						var entity = model._entities.get(this.attrs.entityFQN);
						elem = entity.elements.get(this.attrs.elementName);
					} else {
						// private element
						this.key = this.attrs.elementName;
						elem = model.columnView.getDefaultNode().elements.get(this.attrs.elementName);
					}

					if (this.attrs.nextElementName) { // Replace old element reference with new
						var keyNextElem;
						if (this.attrs.hasOwnProperty("nextElementEntityFQN") && this.attrs.nextElementEntityFQN) {
							keyNextElem = this.attrs.nextElementEntityFQN + "." + this.attrs.nextElementName;
						} else {
							keyNextElem = this.attrs.nextElementName;
						}
						counter.exceptionAggregationStep.referenceElements.add(this.key, elem, keyNextElem);
					} else {
						counter.exceptionAggregationStep.referenceElements.add(this.key, elem);
					}

					events.push({
						source: model.columnView.getDefaultNode(),
						type: ViewModelEvents.ELEMENT_CHANGED,
						name: counter.name,
						changed: true
					});
				}
			},
			undo: function(model, events) {
				var counter = model.columnView.getDefaultNode().elements.get(this.counterName);
				if (counter) {
					counter.exceptionAggregationStep.referenceElements.remove(this.key);
				}

				events.push({
					source: model.columnView.getDefaultNode(),
					type: ViewModelEvents.ELEMENT_CHANGED,
					name: counter.name,
					changed: true
				});
			}
		};

		/**
		 * @class RemoveCounterReferenceElemCommand - Remove element assignment for counter
		 * @property {string} counterName   - Counter name
		 * @property {object} attributes    - { elementName: "", entityFQN: "" }
		 */
		var RemoveCounterReferenceElemCommand = function(counterName, attributes) {
			this.counterName = counterName;
			this.attrs = attributes;
			this.key;
			this.nextElemKey;
		};
		RemoveCounterReferenceElemCommand.prototype = {
			execute: function(model, events) {
				var counter = model.columnView.getDefaultNode().elements.get(this.counterName);
				if (counter) {
					if (this.attrs.hasOwnProperty("entityFQN") && this.attrs.entityFQN) {
						// shared element
						this.key = this.attrs.entityFQN + "." + this.attrs.elementName;
					} else {
						// private element
						this.key = this.attrs.elementName;
					}
					this.nextElemKey = counter.exceptionAggregationStep.referenceElements.getNextKey(this.key);
					counter.exceptionAggregationStep.referenceElements.remove(this.key);
				}

				events.push({
					source: model.columnView.getDefaultNode(),
					type: ViewModelEvents.ELEMENT_CHANGED,
					name: counter.name,
					changed: true
				});
			},
			undo: function(model, events) {
				var counter = model.columnView.getDefaultNode().elements.get(this.counterName);
				if (counter) {
					var elem;
					if (this.attrs.hasOwnProperty("entityFQN") && this.attrs.entityFQN) {
						var entity = model._entities.get(this.attrs.entityFQN);
						elem = entity.elements.get(this.attrs.elementName);
					} else {
						// private element
						elem = model.columnView.getDefaultNode().elements.get(this.attrs.elementName);
					}

					counter.exceptionAggregationStep.referenceElements.add(this.key, elem, this.nextElemKey);

					events.push({
						source: model.columnView.getDefaultNode(),
						type: ViewModelEvents.ELEMENT_CHANGED,
						name: counter.name,
						changed: true
					});
				}
			}
		};

		/**
		 * @class CreateDerivationRuleCommand - To create Derivation rule in Parameter
		 * @parameter {string} parameterName - Name of Input Parameter
		 * @parameter {object} attributes    - { lookupEntity: { refer viewModel.createOrMergeEntity() }, resultElementName: "" }
		 */
		var CreateDerivationRuleCommand = function(parameterName, attributes) {
			this.parameterName = parameterName; // key
			this.attributes = attributes;
		};
		CreateDerivationRuleCommand.prototype = {
			execute: function(model, events, isRedo) {
				var parameter = model.columnView.parameters.get(this.parameterName);
				if (parameter) {
					var derivationRule = parameter.createDerivationRule();

					if (this.attributes) {
						if (this.attributes.hasOwnProperty("lookupEntity")) {
							var entity = model.createOrMergeEntity(this.attributes.lookupEntity);
							if (entity && !isRedo) {
								entity.isProxy = true;
							}
							derivationRule.lookupEntity = entity;
						}
						if (this.attributes.hasOwnProperty("resultElementName")) {
							derivationRule.resultElementName = this.attributes.resultElementName;
						}
					}

					events.push({
						source: parameter,
						type: ViewModelEvents.PARAMETER_DERIVATIONRULE_CREATED,
						name: this.parameterName,
						changed: true
					});
					return derivationRule;
				}
			},
			undo: function(model, events) {
				var parameter = model.columnView.parameters.get(this.parameterName);
				if (parameter && parameter.derivationRule) {
					parameter.derivationRule.$remove();
					events.push({
						source: parameter,
						type: ViewModelEvents.PARAMETER_DERIVATIONRULE_DELETED,
						name: this.parameterName,
						changed: true
					});
				}
			}
		};

		/**
     * @class ChangeDerivationRuleCommand - To change Derivation rule in Parameter
     * @parameter {string} parameterName - Name of Input Parameter
     * @parameter {object} attributes { resultElementName: "",
     *                                  lookupEntity: { refer viewModel.createOrMergeEntity() },
     *                                  scriptObject: { refer viewModel.createOrMergeEntity() } 
                                        inputEnabled:boolean}
     */
		var ChangeDerivationRuleCommand = function(parameterName, attributes) {
			this.parameterName = parameterName; // key
			this.newAttributes = attributes;
			this.oldAttributes = {};
		};
		ChangeDerivationRuleCommand.prototype = {
			execute: function(model, events, isRedo) {
				var parameter = model.columnView.parameters.get(this.parameterName);
				if (parameter && this.newAttributes) {
					var derivationRule = parameter.derivationRule;
					if (derivationRule) {
						if ((this.newAttributes.hasOwnProperty("inputEnabled"))) {
							this.oldInputEnabledValue = derivationRule.inputEnabled;
							derivationRule.inputEnabled = this.newAttributes.inputEnabled;
						}
						if (this.newAttributes.hasOwnProperty("lookupEntity")) {
							if (derivationRule.lookupEntity) {
								this.oldAttributes.lookupEntityKey = derivationRule.lookupEntity.$getKeyAttributeValue();
							}
							if (this.newAttributes.lookupEntity) {
								var entity = model.createOrMergeEntity(this.newAttributes.lookupEntity);
								if (entity && !isRedo) {
									entity.isProxy = true;
								}
								derivationRule.lookupEntity = entity;
							} else if (derivationRule.lookupEntity) {
								derivationRule.lookupEntity.$remove();
							}
						}
						if (this.newAttributes.hasOwnProperty("scriptObject")) {
							if (derivationRule.scriptObject) {
								this.oldAttributes.scriptEntityKey = derivationRule.scriptObject.$getKeyAttributeValue();
							}
							if (this.newAttributes.scriptObject) {
								var scriptEntity = model.createOrMergeEntity(this.newAttributes.scriptObject);
								if (scriptEntity && !isRedo) {
									scriptEntity.isProxy = true;
								}
								derivationRule.scriptObject = scriptEntity;
							} else if (derivationRule.scriptObject) {
								derivationRule.scriptObject.$remove();
							}
						}
						if (this.newAttributes.hasOwnProperty("resultElementName")) {
							if (derivationRule.hasOwnProperty("resultElementName")) {
								this.oldAttributes.resultElementName = derivationRule.resultElementName;
							}
							derivationRule.resultElementName = this.newAttributes.resultElementName;
						}
						events.push({
							source: parameter,
							type: ViewModelEvents.PARAMETER_DERIVATIONRULE_CHANGED,
							name: this.parameterName,
							changed: true
						});
					}
					return derivationRule;
				}
			},
			undo: function(model, events) {
				var parameter = model.columnView.parameters.get(this.parameterName);
				if (parameter && this.newAttributes) {
					var derivationRule = parameter.derivationRule;
					if (derivationRule) {
						if (this.newAttributes.hasOwnProperty("inputEnabled")) {
							derivationRule.inputEnabled = this.oldInputEnabledValue;
						}
						if (this.newAttributes.hasOwnProperty("lookupEntity")) {
							if (this.oldAttributes.hasOwnProperty("lookupEntityKey")) {
								var lookupEntity = model._entities.get(this.oldAttributes.lookupEntityKey);
								derivationRule.lookupEntity = lookupEntity;
							} else if (derivationRule.lookupEntity) {
								derivationRule.lookupEntity.$remove();
							}
						}
						if (this.newAttributes.hasOwnProperty("scriptObject")) {
							if (this.oldAttributes.hasOwnProperty("scriptEntityKey")) {
								var scriptEntity = model._entities.get(this.oldAttributes.scriptEntityKey);
								derivationRule.scriptObject = scriptEntity;
							} else if (derivationRule.scriptObject) {
								derivationRule.scriptObject.$remove();
							}
						}
						if (this.newAttributes.hasOwnProperty("resultElementName")) {
							if (this.oldAttributes.hasOwnProperty("resultElementName")) {
								derivationRule.resultElementName = this.oldAttributes.resultElementName;
							} else if (derivationRule.resultElementName) {
								delete derivationRule.resultElementName;
							}
						}
						events.push({
							source: parameter,
							type: ViewModelEvents.PARAMETER_DERIVATIONRULE_CHANGED,
							name: this.parameterName,
							changed: true
						});
					}
				}
			}
		};

		/**
		 * @class CreateDerivationRuleElementFilter - Create ElementFilter within a DerivationRule
		 * @parameter {string} parameterName - Name of Input Parameter
		 * @parameter {object} attributes    - Contains properties 'elementName' and 'valueFilter'
		 */
		var CreateDerivationRuleElementFilter = function(parameterName, attributes) {
			this.parameterName = parameterName;
			this.attributes = attributes;
			this.elementFilterId = undefined;
		};
		CreateDerivationRuleElementFilter.prototype = {
			execute: function(model, events) {
				var parameter = model.columnView.parameters.get(this.parameterName);
				if (parameter) {
					var derivationRule = parameter.derivationRule;
					var elementFilter;
					if (derivationRule) {
						elementFilter = derivationRule.createElementFilter({
							elementName: this.attributes.elementName
						});
						if (this.attributes.valueFilter) {
							elementFilter.createValueFilter(this.attributes.valueFilter);
							/*elementFilter.createValueFilter({
                            type: ValueFilterType.SINGLE_VALUE_FILTER,
                            operator: ValueFilterOperator.EQUAL,
                            value: this.attributes.value
                        });*/
						}
						this.elementFilterId = elementFilter.$getKeyAttributeValue();
					}
					events.push({
						source: derivationRule,
						type: ViewModelEvents.PARAMETER_DERIVATIONRULE_ELEMENTFILTER_CREATED,
						name: this.elementFilterId,
						changed: true
					});
					return elementFilter;
				}
			},
			undo: function(model, events) {
				var parameter = model.columnView.parameters.get(this.parameterName);
				if (parameter) {
					var derivationRule = parameter.derivationRule;
					if (derivationRule) {
						var elementFilter = derivationRule.elementFilters.get(this.elementFilterId);
						if (elementFilter) {
							if (elementFilter.valueFilters) {
								elementFilter.valueFilters.$remove();
							}
							elementFilter.$remove();
							events.push({
								source: derivationRule,
								type: ViewModelEvents.PARAMETER_DERIVATIONRULE_ELEMENTFILTER_DELETED,
								name: this.elementFilterId,
								changed: true
							});
						}
					}
				}
			}
		};

		/**
		 * @class ChangeDerivationRuleElementFilter - Change ElementFilter within a DerivationRule
		 * @parameter {string} parameterName    - Name of Input Parameter
		 * @parameter {string} elementFilterKey - Key to the ElementFilter
		 * @parameter {object} attributes       - Contains properties 'elementName' and 'valueFilter'
		 */
		var ChangeDerivationRuleElementFilter = function(parameterName, elementFilterKey, attributes) {
			this.parameterName = parameterName;
			this.elementFilterId = elementFilterKey;
			this.attributes = attributes;
			this.oldElementName;
			this.oldValueFilter;
		};
		ChangeDerivationRuleElementFilter.prototype = {
			execute: function(model, events) {
				var parameter = model.columnView.parameters.get(this.parameterName);
				if (parameter && parameter.derivationRule) {
					var elementFilter = parameter.derivationRule.elementFilters.get(this.elementFilterId);
					if (elementFilter) {
						this.oldElementName = elementFilter.elementName;
						if (this.attributes.elementName) {
							elementFilter.elementName = this.attributes.elementName;
						}

						if (this.attributes.valueFilter) {
							if (elementFilter.valueFilters && elementFilter.valueFilters.count() > 0) {
								// Take the first one since there can only be one ValueFilter within an ElementFilter
								var valFilter = elementFilter.valueFilters.toArray()[0];
								this.oldValueFilter = valFilter.$getAttributesForUndo(this.attributes.valueFilter);
								valFilter.$setAttributes(this.attributes.valueFilter);
							} else {
								// Add new ValueFilter as there was none
								elementFilter.createValueFilter(this.attributes.valueFilter);
							}
						}
					}
					events.push({
						source: parameter.derivationRule,
						type: ViewModelEvents.PARAMETER_DERIVATIONRULE_ELEMENTFILTER_CHANGED,
						name: this.elementFilterId,
						changed: true
					});
					return elementFilter;
				}
			},
			undo: function(model, events) {
				var parameter = model.columnView.parameters.get(this.parameterName);
				if (parameter) {
					var derivationRule = parameter.derivationRule;
					if (derivationRule) {
						var elementFilter = derivationRule.elementFilters.get(this.elementFilterId);
						if (elementFilter) {
							elementFilter.elementName = this.oldElementName;
							if (!this.oldValueFilter) {
								if (elementFilter.valueFilters && elementFilter.valueFilters.count() > 0) {
									elementFilter.valueFilters.$remove();
								}
							} else {
								// Take the first one since there can only be one ValueFilter within an ElementFilter
								var valFilter = elementFilter.valueFilters.toArray()[0];
								valFilter.$setAttributes(this.oldValueFilter);
							}

							events.push({
								source: derivationRule,
								type: ViewModelEvents.PARAMETER_DERIVATIONRULE_ELEMENTFILTER_CHANGED,
								name: this.elementFilterId,
								changed: true
							});
						}
					}
				}
			}
		};

		/**
		 * targetNodeName: specify the target node name that element belongs to
		 * elementName: specify the element name that restriction to be added
		 * attributes: For restriction attributes contains elementName: restrictedelementname and value filters
		 **/
		var AddRestrictionCommand = function(targetNodeName, elementName, attributes) {
			this.targetNodeName = targetNodeName;
			this.elementName = elementName;
			this.oldAttributes;
			this.newAttributes = attributes;
			this.restrictionId;
		};
		AddRestrictionCommand.prototype = {
			execute: function(model, events) {
				var targetNode = model.columnView.viewNodes.get(this.targetNodeName);
				if (targetNode) {
					var element = targetNode.elements.get(this.elementName);
					if (element) {
						var restriction = element.createRestriction(this.newAttributes);
						this.restrictionId = restriction.$getKeyAttributeValue();
						this.oldAttributes = this.newAttributes;
						events.push({
							source: element,
							type: ViewModelEvents.RESTRICTION_CREATED,
							name: this.restrictionId,
							changed: true
						});
						return restriction;
					}

				}

			},
			undo: function(model, events) {
				var targetNode = model.columnView.viewNodes.get(this.targetNodeName);
				if (targetNode) {
					var element = targetNode.elements.get(this.elementName);
					if (element) {
						var restriction = element.restrictions.get(this.restrictionId)
						element.restrictions.remove(this.restriction);
						events.push({
							source: element,
							type: ViewModelEvents.RESTRICTION_DELETED,
							name: this.restrictionId,
							changed: true
						})

					}
				}
			}
		}

		var ChangeRestrictionCommand = function(targetNodeName, elementName, restrictionId, attributes) {
			this.targetNodeName = targetNodeName;
			this.elementName = elementName;
			this.restrictionId = restrictionId;
			this.newAttributes = attributes;
			this.oldElementName;
			this.oldValueFilter;
			this.oldEntityFQN;
		};
		ChangeRestrictionCommand.prototype = {
			execute: function(model, events) {
				var targetNode = model.columnView.viewNodes.get(this.targetNodeName);
				if (targetNode) {
					var element = targetNode.elements.get(this.elementName);
					if (element) {
						var restriction = element.restrictions.get(this.restrictionId);
						if (restriction) {
							if (this.newAttributes.elementName) {
								if (restriction.element) {
									this.oldElementName = restriction.element.name
									if (restriction.element.$getContainer() instanceof viewmodel.Entity) {
										this.oldEntityFQN = restriction.element.$getContainer().fqName;
									}
								}
								if (this.newAttributes.entityFQN) {
									var entity = model._entities.get(this.newAttributes.entityFQN);
									restriction.element = entity.elements.get(this.newAttributes.elementName);
								} else {
									restriction.element = targetNode.elements.get(this.newAttributes.elementName)
								}

							}
							if (this.newAttributes.valueFilter) {
								if (restriction.valueFilters && restriction.valueFilters.count() > 0) {
									// Take the first one since there can only be one ValueFilter within an ElementFilter
									var valFilter = restriction.valueFilters.toArray()[0];
									this.oldValueFilter = valFilter.$getAttributesForUndo(this.newAttributes.valueFilter);
									valFilter.$setAttributes(this.newAttributes.valueFilter);
								} else {
									// Add new ValueFilter as there was none
									restriction.createValueFilter(this.newAttributes.valueFilter);
								}
							}
							events.push({
								source: element,
								type: ViewModelEvents.RESTRICTION_CHANGED,
								name: this.restrictionId,
								changed: true
							});
							return restriction;
						}
					}
				}
			},
			undo: function(model, events) {
				var targetNode = model.columnView.viewNodes.get(this.targetNodeName);
				if (targetNode) {
					var element = targetNode.elements.get(this.elementName);
					if (element) {
						var restriction = element.restrictions.get(this.restrictionId);
						if (restriction) {
							if (this.oldElementName) {
								if (this.oldEntityFQN) {
									var entity = model._entities.get(this.oldEntityFQN);
									restriction.element = entity.elements.get(this.oldElementName);
								} else {
									restriction.element = targetNode.elements.get(this.oldElementName);
								}
							}
							if (!this.oldValueFilter) {
								if (restriction.valueFilters && restriction.valueFilters.count() > 0) {
									elementFilter.valueFilters.$remove();
								}
							} else {
								// Take the first one since there can only be one ValueFilter within an ElementFilter
								var valFilter = restriction.valueFilters.toArray()[0];
								valFilter.$setAttributes(this.oldValueFilter);
							}
							events.push({
								source: element,
								type: ViewModelEvents.RESTRICTION_CHANGED,
								name: restriction,
								changed: true
							})
						}
					}
				}
			}
		};

		/**
		 * @class
		 */
		var ChangeInputPropertiesCommand = function(viewNodeName, inputName, properties) {
			this.viewNodeName = viewNodeName;
			this.inputName = inputName;
			this.alias = properties.alias;
		};
		ChangeInputPropertiesCommand.prototype = {
			execute: function(model, events) {
				var that = this;
				var viewNode = model.columnView.viewNodes.get(this.viewNodeName);
				if (viewNode) {
					var input;

					for (var i = 0; i < viewNode.inputs._keys.length; i++) {
						var tempInput = viewNode.inputs.get(i);
						if (tempInput.getSource().name === that.inputName) {
							input = tempInput;
						}
					}

					if (that.alias) {
						input.alias = that.alias;
					}
					if (input) {
						events.push({
							source: viewNode,
							type: ViewModelEvents.INPUT_CHANGED,
							name: input.name,
							changed: true
						});
						return input;
					}
				}
			},
			undo: function(model, events) {
				var viewNode = model.columnView.viewNodes.get(this.viewNodeName);
				var that = this;
				if (viewNode) {
					var input;

					for (var i = 0; i < viewNode.inputs.length; i++) {
						var tempInput = viewNode.inputs.get(i);
						if (tempInput.getSource().name === that.inputName) {
							input = tempInput;
						}
					}
					if (input) {
						events.push({
							source: viewNode,
							type: ViewModelEvents.INPUT_CHANGED,
							name: input.name,
							changed: true
						});
					}
				}
			}
		};

		// Helper function to create source of an input(Entity/ViewNode) based on given data
		function createSourceForInput(model, viewNodeName, searchProperties, isRedo) {
			var source;
			if (searchProperties) {
				source = model.createOrMergeEntity(searchProperties);
				if (source && !isRedo) {
					source.isProxy = true;
				}
				if (source.physicalSchema && searchProperties.context) {
					var callback = function(value) {
						if (value) {
							source.schemaName = value;
						}
					};
					/*SchemaMappingService.schemaMapping.deriveAuthoringSchemaFor(source.physicalSchema, searchProperties.context.packageName,
						searchProperties.context, callback); */
				}
			} else {
				source = model.columnView.viewNodes.get(viewNodeName);
			}
			return source;
		}

		/**
		 * @class
		 */
		var CreateInputCommand = function(targetNodeName, sourceName, searchProperties, selectAll) {
			this.targetNodeName = targetNodeName;
			this.sourceName = sourceName;
			this.searchProperties = searchProperties;
			this.inputKey = null;
			this.selectAll = selectAll;
		};
		CreateInputCommand.prototype = {
			execute: function(model, events, isRedo) {
				var targetNode = model.columnView.viewNodes.get(this.targetNodeName);
				if (targetNode) {
					/*var source;
                var sourceName;
                if (this.searchProperties) {
                    source = model.createOrMergeEntity(this.searchProperties);
                    if (source && !isRedo) {
                        source.isProxy = true;
                    }
                    sourceName = source.getFullyQualifiedName();
                    if (source.physicalSchema && this.searchProperties.context) {
                        var callback = function(value) {
                            if (value) {
                                source.schemaName = value;
                            }
                        };
                        SchemaMappingService.schemaMapping.deriveAuthoringSchemaFor(source.physicalSchema, this.searchProperties.context.packageName, this.searchProperties.context, callback); 
                    }
                } else {
                    source = model.columnView.viewNodes.get(this.sourceName);
                    sourceName = source ? source.name : null;
                }*/
					var source = createSourceForInput(model, this.sourceName, this.searchProperties, isRedo);
					if (source) {
						if (targetNode.layout) {
							targetNode.layout.expanded = true;
						}
						var input = targetNode.createInput();
						this.inputKey = input.$getKeyAttributeValue();
						input.setSource(source);

						///for union pruning 

						if (targetNode.isUnion() && model.columnView.pruningTable) {
							CalcViewEditorUtil.fillRepositoryInputNodeId(model, targetNode.name, this.inputKey);
						}

						var getAlias = function(viewNode, input) {
							var aliasName = input.getSource().name;
							var inputName = input.getSource().fqName;
							if (input.getSource().$$className === "Entity") {
								var count = 0;
								for (var i = 0; i < viewNode.inputs._keys.length; i++) {
									var input2 = viewNode.inputs.get(viewNode.inputs._keys[i]);
									if (input2 !== input) {
										var inputName2 = input2.alias ? input2.alias : input2.getSource().fqName;
										if (!inputName2) {
											inputName2 = input2.getSource().name;
										}
										if (inputName2 === inputName || aliasName === inputName2) {
											count++;
											aliasName = input.getSource().name + "_" + count;
											inputName = aliasName;
											i = -1;
										}
									}
								}
							}
							if (aliasName !== input.getSource().name) {
								return aliasName;
							}
						};
						var alias = getAlias(targetNode, input);
						if (alias) {
							input.alias = alias;
						}
						if (targetNode.type === "Union") {
							// create constant mapping for output columns
							targetNode.elements.foreach(function(element) {
								var elementMapping = input.createMapping({
									value: "",
									isNull: true
								});
								elementMapping.type = "ConstantElementMapping";
								elementMapping.targetElement = element;
							});
						}
						if (this.selectAll) {
							input.selectAll = this.selectAll;
						}
						events.push({
							source: targetNode,
							type: ViewModelEvents.INPUT_CREATED,
							name: this.inputKey,
							changed: true
						});
						return input;
					}
				}
			},
			undo: function(model, events) {
				var targetNode = model.columnView.viewNodes.get(this.targetNodeName);
				if (targetNode) {
					var input = targetNode.inputs.remove(this.inputKey);
					if (input) {
						events.push({
							source: targetNode,
							type: ViewModelEvents.INPUT_DELETED,
							name: this.inputKey,
							changed: true
						});
					}
				}
			}
		};

		var CreateWorkSpaceCommand = function(targetNodeName, sourceName, searchProperties) {
			this.targetNodeName = targetNodeName;
			this.sourceName = sourceName;
			this.searchProperties = searchProperties;
		};
		CreateWorkSpaceCommand.prototype = {
			execute: function(model, events, isRedo) {
				var targetNode = model.columnView.viewNodes.get(this.targetNodeName);
				if (targetNode) {
					var source = createSourceForInput(model, this.sourceName, this.searchProperties, isRedo);
					if (source) {
						if (targetNode.layout) {
							targetNode.layout.expanded = true;
						}
						
						targetNode.workspace = source;

						//targetNode.mapAllWorkspaceElementToViewNodeElement();
						events.push({
							source: targetNode,
							type: ViewModelEvents.WORKSPACE_CREATED,
							name: source.name,
							changed: true
						});
						return source;
					}
				}
			},
			undo: function(model, events) {
				var targetNode = model.columnView.viewNodes.get(this.targetNodeName);
				if (targetNode) {
				    //tobedone: will have to write removeAllworkspaceelement
					var workspace = targetNode.workspace;
					targetNode.removeAllWorkspaceElementFromViewNodeElement();
					targetNode.workspace = undefined;
					//workspace.$remove();
					if (workspace) {
						events.push({
							source: targetNode,
							type: ViewModelEvents.WORKSPACE_DELETED,
							name: workspace.name,
							changed: true
						});
					}
				}
			}
		};

		/**
		 * @class ChangeInputCommand - Change command for Input; only few properties can be changed
		 * @parameter {string} viewNodeName       - Name of the ViewNode
		 * @parameter {string} inputId            - Name of Input Parameter (from UI use- parameter.$getKeyAttributeValue())
		 * @parameter {object} attributes         - { alias: "AliasName",
		 *                                            emptyUnionBehavior: "enum  EmptyUnionBehavior",
		 *                                            selectAll: "boolean" }
		 * @parameter {string} sourceViewNodeName - Name of source ViewNode to be replaced with
		 * @parameter {object} searchProperties   - Search Result of the new Entity
		 */
		var ChangeInputCommand = function(viewNodeName, inputId, attributes, sourceViewNodeName, searchProperties) {
			this.viewNodeName = viewNodeName;
			this.inputId = inputId;
			this.oldAttributes = null;
			this.newAttributes = attributes;
			this.sourceViewNodeName = sourceViewNodeName;
			this.searchProperties = searchProperties;
			this.oldSourceKey = undefined;
			this.sourceReplaced = false;
			this.isOldSourceEntityType = false;
		};
		ChangeInputCommand.prototype = {
			execute: function(model, events, isRedo) {
				var viewNode = null;
				if (model) {
					viewNode = model.columnView.viewNodes.get(this.viewNodeName);
					if (viewNode) {
						var input = viewNode.inputs.get(this.inputId);
						if (input) {
							if (this.newAttributes) {
								this.oldAttributes = input.$getAttributesForUndo();
								input.$setAttributes(this.newAttributes);
							}
							if (this.sourceViewNodeName || this.searchProperties) {
								var source = createSourceForInput(model, this.sourceViewNodeName, this.searchProperties, isRedo);
								if (input.getSource()) {
									this.oldSourceKey = input.getSource().$getKeyAttributeValue();
									// Need to know the type of source - ViewNode/Entity
									if (input.getSource() instanceof viewmodel.Entity) {
										this.isOldSourceEntityType = true;
									}
								}
								events.push({
									source: viewNode,
									type: ViewModelEvents.INPUT_DELETED,

									name: this.inputId,
									changed: true
								});
								events.push({
									source: viewNode,
									type: ViewModelEvents.INPUT_CREATED,

									name: this.inputId,
									changed: true
								});
								input.setSource(source);
								this.sourceReplaced = true;
							}

							events.push({
								source: viewNode,
								type: ViewModelEvents.INPUT_CHANGED,

								name: this.inputId,
								changed: true
							});
							return input;
						}
					}
				}
			},
			undo: function(model, events) {
				var viewNode = null;
				if (model) {
					viewNode = model.columnView.viewNodes.get(this.viewNodeName);
					if (viewNode) {
						var input = viewNode.inputs.get(this.inputId);
						if (input) {
							if (this.oldAttributes) {
								input.$setAttributes(this.oldAttributes);
							}
							var source;
							if (this.sourceReplaced) {
								if (this.oldSourceKey) {
									if (this.isOldSourceEntityType) {
										source = model._entities.get(this.oldSourceKey);
									} else {
										source = model.columnView.viewNodes.get(this.oldSourceKey);
									}
								}
								input.setSource(source);
								events.push({
									source: viewNode,
									type: ViewModelEvents.INPUT_DELETED,

									name: this.inputId,
									changed: true
								});
								events.push({
									source: viewNode,
									type: ViewModelEvents.INPUT_CREATED,

									name: this.inputId,
									changed: true
								});
							}

							events.push({
								source: viewNode,
								type: ViewModelEvents.INPUT_CHANGED,

								name: this.inputId,
								changed: true
							});
							return input;
						}
					}
				}
			}
		};

		/**
		 * @class SetSharedElementPropertiesCommand - Change command for Input; only few properties can be changed
		 * @parameter {string} viewNodeName - Name of the ViewNode
		 * @parameter {string} inputId      - Unique ID of Input (from UI use- input.$getKeyAttributeValue())
		 * @parameter {string} elementName  - Name of the shared element
		 * @parameter {object} attributes   - Local properties for the shared Element
		 *                                    { transparentFilter: "boolean", hidden: "boolean", aliasName: "", aliasLabel: "", targetEndUserTexts: { } }
		 */
		var SetSharedElementPropertiesCommand = function(viewNodeName, inputId, elementName, attributes) {
			this.viewNodeName = viewNodeName;
			this.inputId = inputId;
			this.elementName = elementName;
			this.oldAttributes = {};
			this.newAttributes = attributes;
			this.mappingCreated = false;
			this.endUserTextsServant = new EndUserTextsServant();
			this.endUserTextsServant.initialize(this, attributes.targetEndUserTexts);
		};
		SetSharedElementPropertiesCommand.prototype = {
			execute: function(model, events) {
				var viewNode = null;
				if (model) {
					viewNode = model.columnView.viewNodes.get(this.viewNodeName);
					if (viewNode) {
						var input = viewNode.inputs.get(this.inputId);
						if (input) {
							if (this.newAttributes.hasOwnProperty("hidden")) {
								this.oldAttributes.hidden = input.excludedElements.get(this.elementName) ? true : false;
								if (this.oldAttributes.hidden && !this.newAttributes.hidden) {
									input.excludedElements.remove(this.elementName);
								}
								if (!this.oldAttributes.hidden && this.newAttributes.hidden) {
									var elem = input.getSource().elements.get(this.elementName);
									input.excludedElements.add(elem);
								}
							}
							if (this.newAttributes.hasOwnProperty("aliasName") ||
								this.newAttributes.hasOwnProperty("aliasLabel") ||
								this.newAttributes.hasOwnProperty("targetEndUserTexts") ||
								this.newAttributes.hasOwnProperty("transparentFilter")) {
								var mappingObj;
								for (var i = 0; i <= input.mappings.size(); i++) {
									var mapping = input.mappings.getAt(i);
									if (mapping && mapping.sourceElement && mapping.sourceElement.name === this.elementName) {
										mappingObj = mapping;
										break;
									}
								}
								if (!mappingObj) {
									mappingObj = input.createMapping();
									var elem = input.getSource().elements.get(this.elementName);
									mappingObj.sourceElement = elem;
									this.mappingCreated = true;
								}
								if (this.newAttributes.hasOwnProperty("aliasName")) {
									this.oldAttributes.aliasName = mappingObj.aliasName;
									if (this.newAttributes.aliasName) {
										mappingObj.aliasName = this.newAttributes.aliasName;
									} else {
										mappingObj.aliasName = undefined;
										if (!mappingObj.transparentFilter) {
											mappingObj.$remove();
										}
									}
								}
								if (this.newAttributes.hasOwnProperty("aliasLabel")) {
									this.oldAttributes.aliasLabel = mappingObj.aliasLabel;
									mappingObj.label = this.newAttributes.aliasLabel;
								}
								if (this.newAttributes.hasOwnProperty("transparentFilter")) {
									this.oldAttributes.transparentFilter = mappingObj.transparentFilter;
									mappingObj.transparentFilter = this.newAttributes.transparentFilter;
									if (!mappingObj.aliasName && !mappingObj.transparentFilter) {
										mappingObj.$remove();
									}
								}
								if (this.newAttributes.hasOwnProperty("targetEndUserTexts")) {
									this.endUserTextsServant.execute(this, mappingObj);
								}
							}

							events.push({
								source: viewNode,
								type: ViewModelEvents.INPUT_CHANGED,
								name: this.inputKey,
								changed: true
							});
							return input;
						}
					}
				}
			},
			undo: function(model, events) {
				var viewNode = null;
				if (model) {
					viewNode = model.columnView.viewNodes.get(this.viewNodeName);
					if (viewNode) {
						var input = viewNode.inputs.get(this.inputId);
						if (input) {
							if (this.oldAttributes.hasOwnProperty("hidden")) {
								if (!this.oldAttributes.hidden) {
									input.excludedElements.remove(this.elementName);
								} else {
									var elem = input.getSource().elements.get(this.elementName);
									input.excludedElements.add(elem);
								}
							}
							if (this.oldAttributes.hasOwnProperty("aliasName") ||
								this.oldAttributes.hasOwnProperty("aliasLabel") ||
								this.oldAttributes.hasOwnProperty("targetEndUserTexts") ||
								this.newAttributes.hasOwnProperty("transparentFilter")) {
								var mappingObj;
								for (var i = 0; i <= input.mappings.size(); i++) {
									var mapping = input.mappings.getAt(i);
									if (mapping && mapping.sourceElement && mapping.sourceElement.name === this.elementName) {
										mappingObj = mapping;
										break;
									}
								}
								if (!mappingObj) {
									mappingObj = input.createMapping();
									var elem = input.getSource().elements.get(this.elementName);
									mappingObj.sourceElement = elem;
									this.mappingCreated = true;
								}
								if (this.mappingCreated) {
									this.mappingObj.$remove();
								} else {
									if (this.oldAttributes.hasOwnProperty("aliasName")) {
										mappingObj.aliasName = this.oldAttributes.aliasName;
									}
									if (this.oldAttributes.hasOwnProperty("aliasLabel")) {
										mappingObj.label = this.oldAttributes.aliasLabel;
									}
									if (this.oldAttributes.hasOwnProperty("transparentFilter")) {
										mappingObj.transparentFilter = this.oldAttributes.transparentFilter;
									}
									if (this.oldAttributes.hasOwnProperty("targetEndUserTexts")) {
										this.endUserTextsServant.execute(this, mappingObj);
									}
								}
							}

							events.push({
								source: viewNode,
								type: ViewModelEvents.INPUT_CHANGED,
								name: this.inputKey,
								changed: true
							});
							return input;
						}
					}
				}
			}
		};

		/**
		 * @class CreateParameterMappingCommand  - Add Parameter mapping to Input, Parameter or Element
		 * @property {object} attributes         - { source   : { type : "", typeName : "", viewNode : ""},
		 *                                           mapping  : { parameterNameOtherView : "", parameterName : "", value : "" }}
		 * If type === "input"          ==> typeName = inputKey,
		 * If type === "parameter"      ==> typeName = parameterName
		 * If type === "element"        ==> typeName = elementName
		 * If type === "derivationrule" ==> typeName = parameterName
		 */
		var CreateParameterMappingCommand = function(attributes) {
			this.attributes = attributes;
			this.key = null;
		};
		CreateParameterMappingCommand.prototype = {
			execute: function(model, events) {
				var type = this.attributes.source.type;
				var src = null;
				var parameterMapping;
				this.key = this.attributes.mapping.parameterNameOtherView;
				if (type === "input") {
					var viewNode = model.columnView.viewNodes.get(this.attributes.source.viewNode);
					if (viewNode) {
						var input = viewNode.inputs.get(this.attributes.source.typeName);
						if (input) {
							parameterMapping = input.createParameterMapping(this.attributes.mapping);
							if (this.attributes.mapping.parameterName !== undefined) {
								parameterMapping.parameter = model.columnView.parameters.get(this.attributes.mapping.parameterName);
								parameterMapping.type = viewmodel.ParameterMappingType.PARAMETER_MAPPING;
								delete parameterMapping.parameterName;
							} else {
								parameterMapping.type = viewmodel.ParameterMappingType.CONSTANT;
							}
							src = input;
						}
					}
				} else if (type === "parameter") {
					var param = model.columnView.parameters.get(this.attributes.source.typeName);
					if (param) {
						parameterMapping = param.createParameterMapping(this.attributes.mapping);
						if (this.attributes.mapping.parameterName !== undefined) {
							parameterMapping.parameter = model.columnView.parameters.get(this.attributes.mapping.parameterName);
							parameterMapping.type = viewmodel.ParameterMappingType.PARAMETER_MAPPING;
							delete parameterMapping.parameterName;
						} else {
							parameterMapping.type = viewmodel.ParameterMappingType.CONSTANT;
						}
						src = param;
					}
				} else if (type === "element") {
					var element = model.columnView.getDefaultNode().elements.get(this.attributes.source.typeName);
					if (element) {
						parameterMapping = element.createParameterMapping(this.attributes.mapping);
						if (this.attributes.mapping.parameterName !== undefined) {
							parameterMapping.parameter = model.columnView.parameters.get(this.attributes.mapping.parameterName);
							parameterMapping.type = viewmodel.ParameterMappingType.PARAMETER_MAPPING;
							delete parameterMapping.parameterName;
						} else {
							parameterMapping.type = viewmodel.ParameterMappingType.CONSTANT;
						}
						src = element;
					}
				} else if (type === "derivationrule") {
					var dParam = model.columnView.parameters.get(this.attributes.source.typeName);
					if (dParam && dParam.derivationRule) {
						parameterMapping = dParam.derivationRule.createParameterMapping(this.attributes.mapping);
						if (this.attributes.mapping.parameterName !== undefined) {
							parameterMapping.parameter = model.columnView.parameters.get(this.attributes.mapping.parameterName);
							parameterMapping.type = viewmodel.ParameterMappingType.PARAMETER_MAPPING;
							delete parameterMapping.parameterName;
						} else {
							parameterMapping.type = viewmodel.ParameterMappingType.CONSTANT;
						}
						src = dParam.derivationRule;
					}
				}
				events.push({
					source: src,
					type: ViewModelEvents.PARAMETERMAPPING_CREATED,
					name: this.key,
					changed: true
				});
			},
			undo: function(model, events) {
				var type = this.attributes.source.type;
				var src = null;
				if (type === "input") {
					var viewNode = model.columnView.viewNodes.get(this.attributes.source.viewNode);
					if (viewNode) {
						var input = viewNode.inputs.get(this.attributes.source.typeName);
						if (input) {
							input.parameterMappings.remove(this.key);
							src = input;
						}
					}
				} else if (type === "parameter") {
					var param = model.columnView.parameters.get(this.attributes.source.typeName);
					if (param) {
						param.parameterMappings.remove(this.key);
						src = param;
					}
				} else if (type === "element") {
					var element = model.columnView.getDefaultNode().elements.get(this.attributes.source.typeName);
					if (element) {
						element.parameterMappings.remove(this.key);
						src = element;
					}
				} else if (type === "derivationrule") {
					var dParam = model.columnView.parameters.get(this.attributes.source.typeName);
					if (dParam && dParam.derivationRule) {
						dParam.derivationRule.parameterMappings.remove(this.key);
						src = dParam.derivationRule;
					}
				}
				events.push({
					source: src,
					type: ViewModelEvents.PARAMETERMAPPING_DELETED,
					name: this.key,
					changed: true
				});

			}
		};

		/**
		 * @class RemoveParameterMappingCommand  - Remove Parameter mapping to Input, Parameter or Element
		 * @property {object} attributes         - { source   : { type : "", typeName : "", viewNode : ""},
		 *                                           mapping  : { parameterNameOtherView : "", parameterName : "", value : "" }}
		 * If type === "input"          ==> typeName = inputKey,
		 * If type === "parameter"      ==> typeName = parameterName
		 * If type === "element"        ==> typeName = elementName
		 * If type === "derivationrule" ==> typeName = parameterName
		 */

		var RemoveParameterMappingCommand = function(attributes) {
			this.attributes = attributes;
			this.key = null;
		};
		RemoveParameterMappingCommand.prototype = {
			execute: function(model, events) {
				var type = this.attributes.source.type;
				var src = null;
				this.key = this.attributes.mapping.parameterNameOtherView;
				if (type === "input") {
					var viewNode = model.columnView.viewNodes.get(this.attributes.source.viewNode);
					if (viewNode) {
						var input = viewNode.inputs.get(this.attributes.source.typeName);
						if (input) {
							input.parameterMappings.remove(this.key);
							src = input;
						}
					}
				} else if (type === "parameter") {
					var param = model.columnView.parameters.get(this.attributes.source.typeName);
					if (param) {
						param.parameterMappings.remove(this.key);
						src = param;
					}
				} else if (type === "element") {
					var element = model.columnView.getDefaultNode().elements.get(this.attributes.source.typeName);
					if (element) {
						element.parameterMappings.remove(this.key);
						src = element;
					}
				} else if (type === "derivationrule") {
					var dParam = model.columnView.parameters.get(this.attributes.source.typeName);
					if (dParam && dParam.derivationRule) {
						dParam.derivationRule.parameterMappings.remove(this.key);
						src = dParam.derivationRule;
					}
				}
				events.push({
					source: src,
					type: ViewModelEvents.PARAMETERMAPPING_DELETED,
					name: this.key,
					changed: true
				});
			},
			undo: function(model, events) {
				var type = this.attributes.source.type;
				var src = null;
				var parameterMapping;
				if (type === "input") {
					var viewNode = model.columnView.viewNodes.get(this.attributes.source.viewNode);
					if (viewNode) {
						var input = viewNode.inputs.get(this.attributes.source.typeName);
						if (input) {
							parameterMapping = input.createParameterMapping(this.attributes.mapping);
							if (this.attributes.mapping.parameterName !== undefined) {
								parameterMapping.parameter = model.columnView.parameters.get(this.attributes.mapping.parameterName);
								delete parameterMapping.parameterName;
							}
							src = input;
						}
					}
				} else if (type === "parameter") {
					var param = model.columnView.parameters.get(this.attributes.source.typeName);
					if (param) {
						parameterMapping = param.createParameterMapping(this.attributes.mapping);
						if (this.attributes.mapping.parameterName !== undefined) {
							parameterMapping.parameter = model.columnView.parameters.get(this.attributes.mapping.parameterName);
							delete parameterMapping.parameterName;
						}
						src = param;
					}
				} else if (type === "element") {
					var element = model.columnView.getDefaultNode().elements.get(this.attributes.source.typeName);
					if (element) {
						parameterMapping = element.createParameterMapping(this.attributes.mapping);
						if (this.attributes.mapping.parameterName !== undefined) {
							parameterMapping.parameter = model.columnView.parameters.get(this.attributes.mapping.parameterName);
							delete parameterMapping.parameterName;
						}
						src = element;
					}
				} else if (type === "derivationrule") {
					var dParam = model.columnView.parameters.get(this.attributes.source.typeName);
					if (dParam && dParam.derivationRule) {
						parameterMapping = dParam.derivationRule.createParameterMapping(this.attributes.mapping);
						if (this.attributes.mapping.parameterName !== undefined) {
							parameterMapping.parameter = model.columnView.parameters.get(this.attributes.mapping.parameterName);
							delete parameterMapping.parameterName;
						}
						src = dParam.derivationRule;
					}
				}
				events.push({
					source: src,
					type: ViewModelEvents.PARAMETERMAPPING_CREATED,
					name: this.key,
					changed: true
				});
			}
		};

		/**
		 * @class
		 */
		var changeEntityCommand = function(viewNodeName, entityName, attributes) {
			this.viewNodeName = viewNodeName;
			this.entityName = entityName;
			this.schemaName = attributes.schemaName;
			this.physicalSchema = attributes.physicalSchema;
		};
		changeEntityCommand.prototype = {
			execute: function(model, events) {
				var that = this;
				var viewNode = model.columnView.viewNodes.get(this.viewNodeName);
				var entity;
				if (viewNode) {
					for (var i = 0; i < viewNode.inputs._keys.length; i++) {
						var tempInput = viewNode.inputs.get(i);
						if (tempInput.getSource().name === that.entityName) {
							entity = tempInput.getSource();
						}
					}
					if (entity) {
						if (that.schemaName && that.physicalSchema) {
							if (that.schemaName === that.physicalSchema) {
								entity.schemaName = that.schemaName;
								entity.physicalSchema = undefined;
							} else {
								entity.schemaName = that.schemaName;
								entity.physicalSchema = that.physicalSchema;
							}
							entity.fqName = "\"" + that.schemaName + "\"." + entity.name;
						}

						events.push({
							source: viewNode,
							type: ViewModelEvents.ENTITY_CHANGED,
							name: entity.name,
							changed: true
						});
						return entity;
					}
				}
			},
			undo: function(model, events) {
				var viewNode = model.columnView.viewNodes.get(this.viewNodeName);
				if (viewNode) {

				}
			}
		};

		/**
		 * @class
		 */
		var CreateJoinCommand = function(viewNodeName, properties) {
			this.viewNodeName = viewNodeName;
			this.objectAttributes = properties.objectAttributes;
			this.leftInput = properties.leftInput;
			this.rightInput = properties.rightInput;
			this.leftColumn = properties.leftColumn;
			this.rightColumn = properties.rightColumn;
			this.join = "";
		};
		CreateJoinCommand.prototype = {
			execute: function(model, events) {
				var join;
				var viewNode = model.columnView.viewNodes.get(this.viewNodeName);
				if (viewNode) {
					join = viewNode.createJoin(this.objectAttributes, null);
					this.join = join;
					join.leftInput = this.leftInput;
					join.rightInput = this.rightInput;

					var key = this.leftColumn.name + "$$" + this.rightColumn.name;
					join.leftElements.add(key, this.leftColumn);
					join.rightElements.add(key, this.rightColumn);
					if (this.leftColumn.inlineType && this.rightColumn.inlineType) {
						if ((this.leftColumn.inlineType.primitiveType === "ST_GEOMETRY" && this.rightColumn.inlineType.primitiveType === "ST_GEOMETRY") ||
							((this.leftColumn.inlineType.primitiveType === "ST_POINT" && this.rightColumn.inlineType.primitiveType === "ST_POINT"))) {
							join.createSpatialJoinProperties({
								predicate: "CONTAINS",
								predicateEvaluatesTo: true
							});
						}
					}
					this.joinKey = join.$$defaultKeyValue;
					events.push({
						source: model.columnView,
						type: ViewModelEvents.COLUMNVIEW_LOADING_FINISHED,
						name: join.$getKeyAttributeValue(),
						changed: true
					});
					events.push({
						source: viewNode,
						type: ViewModelEvents.JOIN_CREATED,
						name: this.joinKey,
						changed: true
					});
				}
				return join;
			},
			undo: function(model, events) {
				var viewNode = model.columnView.viewNodes.get(this.viewNodeName);
				var join = this.join;
				if (viewNode) {
					var input = viewNode.joins.remove(this.joinKey);
					if (input) {
						events.push({
							source: model.columnView,
							type: ViewModelEvents.COLUMNVIEW_LOADING_FINISHED,
							name: join.$getKeyAttributeValue(),
							changed: true
						});
						events.push({
							source: viewNode,
							type: ViewModelEvents.JOIN_DELETED,
							name: this.joinKey,
							changed: true
						});
					}
				}

			}
		};

		/**
		 * @class
		 */
		var ChangeJoinPropertiesCommand = function(viewNodeName, joinName, properties) {
			this.viewNodeName = viewNodeName;
			this.joinName = joinName;
			this.newJoinProperties = properties.objectAttributes;
			this.newSpatialProperties = properties.spatialJoinAttributes ? properties.spatialJoinAttributes.properties : undefined;
			this.newDistance = properties.spatialJoinAttributes ? properties.spatialJoinAttributes.distance : undefined;
			this.newIntersectionMatrix = properties.spatialJoinAttributes ? properties.spatialJoinAttributes.intersectionMatrix : undefined;
			this.leftColumn = properties.leftColumn;
			this.rightColumn = properties.rightColumn;
			this.removeColumn = properties.removeColumn;
			this.inputs = properties.inputs;
			this.newElements = properties.newElements;
		};
		ChangeJoinPropertiesCommand.prototype = {
			execute: function(model, events) {
				var viewNode = model.columnView.viewNodes.get(this.viewNodeName);
				var mapping;
				if (viewNode) {
					var join = viewNode.joins.get(this.joinName);
					if (join) {
						if (this.newJoinProperties) {
							this.oldJoinProperties = join.$getAttributesForUndo(this.newJoinProperties);
							join.$setAttributes(this.newJoinProperties);
							if (viewNode.isStarJoin()) {
								if (this.oldJoinProperties.joinType === "leftOuter" || this.newJoinProperties.joinType === "leftOuter") {
									this.adjustInputMappings(model, events, join);
								}
							}
						}
						if (join.spatialJoinProperties && join.spatialJoinProperties.count() > 0) {
							var spatialJoinProperties = join.spatialJoinProperties.get(0);
							if (this.newSpatialProperties) {
								this.oldSpatialProperties = spatialJoinProperties.$getAttributesForUndo(this.newSpatialProperties);
								this.oldDistance = spatialJoinProperties.distance;
								this.oldIntersectionMatrix = spatialJoinProperties.intersectionMatrix;
								spatialJoinProperties.$setAttributes(this.newSpatialProperties);
								if (spatialJoinProperties.distance && spatialJoinProperties.predicate !== "WITHIN_DISTANCE") {
									spatialJoinProperties.distance.$remove();
								}
								if (spatialJoinProperties.intersectionMatrix && spatialJoinProperties.predicate !== "RELATE") {
									spatialJoinProperties.intersectionMatrix.$remove();
								}
							}
							if (this.newDistance) {
								this.oldSpatialDistance = spatialJoinProperties.distance;
								spatialJoinProperties.createSpatialDistanceParameterization(this.newDistance);
							}
							if (this.newIntersectionMatrix) {
								this.oldSpatialIntersectionMatrix = spatialJoinProperties.intersectionMatrix;
								spatialJoinProperties.createSpatialIntersectionMatrixParameterization(this.newIntersectionMatrix);
							}
						}
						if (this.leftColumn && this.rightColumn) {
							var key = this.leftColumn.name + "$$" + this.rightColumn.name;
							if (this.removeColumn) {
								join.leftElements.remove(key);
								join.rightElements.remove(key);
								if (join.leftElements.count() === 1 && join.dynamic !== undefined) {
									this.oldDynamic = join.dynamic;
									join.dynamic = false;
								}
							} else {
								join.leftElements.add(key, this.leftColumn);
								join.rightElements.add(key, this.rightColumn);

								if (this.inputs) {
									var leftInput = viewNode.inputs.get(this.inputs.leftInputKey);
									var rightInput = viewNode.inputs.get(this.inputs.rightInputKey);
									var leftelement = leftInput.getSource().elements.get(this.newElements.left);
									var rightElement = rightInput.getSource().elements.get(this.newElements.right);
									join.leftInput = leftInput;
									join.rightInput = rightInput;
									var key = leftelement.name + "$$" + rightElement.name;
									if (join.leftElements.indexOf(key) === -1) {
										join.leftElements.add(key, leftelement);
									}
									if (join.rightElements.indexOf(key) === -1) {
										join.rightElements.add(key, rightElement);
									}

								}
							}
							if (viewNode.isStarJoin() && join.joinType === "leftOuter") {
								if (this.removeColumn) {
									mapping = this.getInputMapping(join.rightInput, this.leftColumn, this.rightColumn);
									if (mapping) {
										join.rightInput.mappings.remove(mapping.$$defaultKeyValue);
									}

								} else {
									mapping = this.getInputMapping(join.rightInput, this.leftColumn, this.rightColumn);
									if (!mapping) {
										this.createInputMapping(join.rightInput, join.leftInput, this.leftColumn, this.rightColumn);
									}
								}
							}
						}

						events.push({
							source: model.columnView,
							type: ViewModelEvents.COLUMNVIEW_LOADING_FINISHED,
							name: join.$getKeyAttributeValue(),
							changed: true
						});

						events.push({
							source: viewNode,
							type: ViewModelEvents.JOIN_CHANGED,
							name: join.$getKeyAttributeValue(),
							changed: true
						});
						return join;
					}
				}
			},
			undo: function(model, events) {
				var viewNode = model.columnView.viewNodes.get(this.viewNodeName);
				var mapping;
				if (viewNode) {
					var join = viewNode.joins.get(this.joinName);
					if (join) {
						if (this.oldJoinProperties) {
							join.$setAttributes(this.oldJoinProperties);
							if (viewNode.isStarJoin()) {
								if (this.oldJoinProperties.joinType === "leftOuter" || this.newJoinProperties.joinType === "leftOuter") {
									this.adjustInputMappings(model, events, join);
								}
							}
						}
						if (join.spatialJoinProperties && join.spatialJoinProperties.count() > 0) {
							var spatialJoinProperties = join.spatialJoinProperties.get(0);
							if (this.oldSpatialProperties) {
								spatialJoinProperties.$setAttributes(this.oldSpatialProperties);
							}
							if (this.newDistance || this.oldDistance) {
								spatialJoinProperties.createSpatialDistanceParameterization(this.oldDistance);
							}
							if (this.newIntersectionMatrix || this.oldIntersectionMatrix) {
								spatialJoinProperties.createSpatialIntersectionMatrixParameterization(this.oldIntersectionMatrix);
							}
						}
						if (this.leftColumn && this.rightColumn) {
							var key = this.leftColumn.name + "$$" + this.rightColumn.name;
							if (this.removeColumn) {
								join.leftElements.add(key, this.leftColumn);
								join.rightElements.add(key, this.rightColumn);
								if (this.oldDynamic) {
									join.dynamic = this.oldDynamic;
								}
							} else {
								join.leftElements.remove(key);
								join.rightElements.remove(key);
							}
							if (viewNode.isStarJoin() && join.joinType === "leftOuter") {
								if (this.removeColumn) {
									mapping = this.getInputMapping(join.rightInput, this.leftColumn, this.rightColumn);
									if (!mapping) {
										this.createInputMapping(join.rightInput, join.leftInput, this.leftColumn, this.rightColumn);
									}
								} else {
									mapping = this.getInputMapping(join.rightInput, this.leftColumn, this.rightColumn);
									if (mapping) {
										join.rightInput.mappings.remove(mapping.$$defaultKeyValue);
									}
								}
							}
						}
						events.push({
							source: model.columnView,
							type: ViewModelEvents.COLUMNVIEW_LOADING_FINISHED,
							name: join.$getKeyAttributeValue(),
							changed: true
						});
						events.push({
							source: viewNode,
							type: ViewModelEvents.JOIN_CHANGED,
							name: join.$getKeyAttributeValue(),
							changed: true
						});
					}
				}
			},

			adjustInputMappings: function(model, events, join) {
				var i, aLeftElements, aRightElements, leftElement, rightElement, mapping;

				var leftInput = join.leftInput;
				var rightInput = join.rightInput;

				if (join.joinType === "leftOuter") {
					// add input mappings
					aLeftElements = join.leftElements.toArray();
					aRightElements = join.rightElements.toArray();
					for (i = 0; i < aLeftElements.length; i++) {
						leftElement = aLeftElements[i];
						rightElement = aRightElements[i];
						mapping = this.getInputMapping(rightInput, leftElement, rightElement);
						if (!mapping) {
							this.createInputMapping(rightInput, leftInput, leftElement, rightElement);
						}
					}
				} else {
					//remove input mappings
					aLeftElements = join.leftElements.toArray();
					aRightElements = join.rightElements.toArray();
					for (i = 0; i < aLeftElements.length; i++) {
						leftElement = aLeftElements[i];
						rightElement = aRightElements[i];
						mapping = this.getInputMapping(rightInput, leftElement, rightElement);
						if (mapping) {
							rightInput.mappings.remove(mapping.$$defaultKeyValue);
						}
					}
				}
			},

			createInputMapping: function(rightInput, leftInput, sourceElement, targetElement) {
				var mapping = rightInput.createMapping({
					type: "InputMapping"
				});
				mapping.sourceElement = sourceElement;
				mapping.targetElement = targetElement;
				mapping.sourceInput = leftInput;
				return mapping;
			},

			getInputMapping: function(rightInput, sourceElement, targetElement) {
				var oMapping;
				rightInput.mappings.foreach(function(mapping) {
					if (mapping.type === "InputMapping" && mapping.sourceElement === sourceElement && mapping.targetElement === targetElement) {
						oMapping = mapping;
					}
				});
				return oMapping;
			}
		};
		/**
		 * @class
		 */
		var ChangeCurrencyPropertiesCommand = function(viewNodeName, elementName, newAttributes) {

			this.viewNodeName = viewNodeName;
			this.elementName = elementName;
			this.newCurrencyProperties = newAttributes.objectAttributes;
			this.newUnitConversion = newAttributes.unitConversion;
			this.isCreate = newAttributes.isCreate;
			this.client = newAttributes.client;
			this.sourceCurrency = newAttributes.sourceCurrency;
			this.targetCurrency = newAttributes.targetCurrency;
			this.referenceDate = newAttributes.referenceDate;
			this.exchangeRateType = newAttributes.exchangeRateType;
			this.outputUnitCurrencyElement = newAttributes.outputUnitCurrencyElement;
			this.errorHandling = newAttributes.errorHandling;
			this.schema = newAttributes.schema;
			this.simpleType = newAttributes.simpleType;
			this.exchangeRateElement = newAttributes.exchangeRateElement;
		};
		ChangeCurrencyPropertiesCommand.prototype = {
			execute: function(model, events) {
				var viewNode = model.columnView.viewNodes.get(this.viewNodeName);
				if (viewNode) {
					var element = viewNode.elements.get(this.elementName);
					if (element) {
						// remember old properties
						this.oldCurrencyConversion = element.currencyConversion;

						var currencyConversion;
						if (element.currencyConversion) {
							currencyConversion = element.currencyConversion;
						} else {
							currencyConversion = element.createCurrencyConversion();
							if (element.unitConversion) {
								element.unitConversion = null;
							}
						}
						if (this.isCreate !== undefined && !this.isCreate) {
							element.currencyConversion = null;
						}

						if (element.currencyConversion) {
							if (this.newCurrencyProperties) {
								currencyConversion.$setAttributes(this.newCurrencyProperties);
							}
							if (this.schema) {
								if (this.schema === "<None>") {
									currencyConversion.schema = null;
								} else {
									currencyConversion.createOrMergeSchema({
										schemaName: this.schema
									});
								}
							}
							if (this.client) {
								var client = currencyConversion.createOrMergeClient();
								client.constantValue = this.client.constantValue;
								client.element = this.client.element;
								client.parameter = this.client.parameter;
							}
							if (this.sourceCurrency) {
								var sourceCurrency = currencyConversion.createOrMergeSourceCurrency();
								sourceCurrency.constantValue = this.sourceCurrency.constantValue;
								sourceCurrency.element = this.sourceCurrency.element;
								sourceCurrency.parameter = this.sourceCurrency.parameter;
							}
							if (this.targetCurrency) {
								var targetCurrency = currencyConversion.createOrMergeTargetCurrency();
								targetCurrency.constantValue = this.targetCurrency.constantValue;
								targetCurrency.element = this.targetCurrency.element;
								targetCurrency.parameter = this.targetCurrency.parameter;
							}
							if (this.exchangeRateType) {
								var exchangeRateType = currencyConversion.createOrMergeExchangeRateType();
								exchangeRateType.constantValue = this.exchangeRateType.constantValue;
								exchangeRateType.element = this.exchangeRateType.element;
								exchangeRateType.parameter = this.exchangeRateType.parameter;
							}
							if (this.referenceDate) {
								var referenceDate = currencyConversion.createOrMergeReferenceDate();
								referenceDate.constantValue = this.referenceDate.constantValue;
								referenceDate.element = this.referenceDate.element;
								referenceDate.parameter = this.referenceDate.parameter;
							}
							if (this.referenceDate) {
								var referenceDate = currencyConversion.createOrMergeReferenceDate();
								referenceDate.constantValue = this.referenceDate.constantValue;
								referenceDate.element = this.referenceDate.element;
								referenceDate.parameter = this.referenceDate.parameter;
							}
							if (this.exchangeRateElement) {
								currencyConversion.exchangeRateElement = this.exchangeRateElement;
								//	currencyConversion.exchangeRateType = undefined;
							}

							if (currencyConversion.outputUnitCurrencyElement && this.outputUnitCurrencyElement === false) {

								currencyConversion.outputUnitCurrencyElement = null;

							} else if (this.outputUnitCurrencyElement) {
								var outputUnitCurrencyElement = currencyConversion.createOrMergeOutputUnitCurrencyElement({
									name: this.outputUnitCurrencyElement
								});
							}
							if (this.simpleType) {
								var dataType = currencyConversion.createOrMergeOutputDataType();
								if (this.simpleType.dataType === "") {
									currencyConversion.outputDataType = undefined;
								} else {
									if (this.simpleType.dataType) {
										dataType.primitiveType = this.simpleType.dataType;
									}
									if (this.simpleType.length) {
										dataType.length = this.simpleType.length;
									}
									if (this.simpleType.scale) {
										dataType.scale = this.simpleType.scale;
									}
								}
							}
							if (this.errorHandling) {
								var errorHandling = currencyConversion.createOrMergeErrorHandling();
								errorHandling.constantValue = this.errorHandling.constantValue;
							}
						}
						events.push({
							source: viewNode,
							type: ViewModelEvents.ELEMENT_CHANGED,
							name: element.name,
							changed: true
						});
						return element;
					}
				}
			},
			undo: function(model, events) {
				var viewNode = model.columnView.viewNodes.get(this.viewNodeName);
				if (viewNode) {
					var element = viewNode.elements.get(this.elementName);
					if (element) {
						if (this.oldCurrencyConversion) {
							element.currencyConversion = this.oldCurrencyConversion;
						}

						events.push({
							source: viewNode,
							type: ViewModelEvents.ELEMENT_CHANGED,
							name: element.name,
							changed: true
						});
					}
				}
			}
		};

		/**
		 * @class
		 */
		var ChangeUnitPropertiesCommand = function(viewNodeName, elementName, newAttributes) {

			this.viewNodeName = viewNodeName;
			this.elementName = elementName;
			this.newUnitProperties = newAttributes.objectAttributes;
			this.newUnitConversion = newAttributes.unitConversion;
			this.isCreate = newAttributes.isCreate;
			this.client = newAttributes.client;
			this.sourceUnit = newAttributes.sourceUnit;
			this.targetUnit = newAttributes.targetUnit;
			this.referenceDate = newAttributes.referenceDate;
			this.exchangeRateType = newAttributes.exchangeRateType;
			this.outputUnitCurrencyElement = newAttributes.outputUnitCurrencyElement;
			this.errorHandling = newAttributes.errorHandling;
			this.schema = newAttributes.schema;
		};
		ChangeUnitPropertiesCommand.prototype = {
			execute: function(model, events) {
				var viewNode = model.columnView.viewNodes.get(this.viewNodeName);
				if (viewNode) {
					var element = viewNode.elements.get(this.elementName);
					if (element) {
						// remember old properties
						this.oldUnitConversion = element.unitConversion;

						var unitConversion;

						if (element.unitConversion) {
							unitConversion = element.unitConversion;
						} else {
							unitConversion = element.createUnitConversion();
							if (element.currencyConversion) {
								element.currencyConversion = null;
							}
						}
						if (this.isCreate !== undefined && !this.isCreate) {
							element.unitConversion = null;
						}
						if (this.newUnitProperties) {
							unitConversion.$setAttributes(this.newCurrencyProperties);
						}
						if (this.schema) {
							if (this.schema === "<None>") {
								unitConversion.schema = null;
							} else {
								unitConversion.createOrMergeSchema({
									schemaName: this.schema
								});
							}
						}
						if (this.client) {
							var client = unitConversion.createOrMergeClient();
							client.constantValue = this.client.constantValue;
							client.element = this.client.element;
							client.parameter = this.client.parameter;
						}

						if (this.sourceUnit) {
							var sourceUnit = unitConversion.createOrMergeSourceCurrency();
							sourceUnit.constantValue = this.sourceUnit.constantValue;
							sourceUnit.element = this.sourceUnit.element;
							sourceUnit.parameter = this.sourceUnit.parameter;
						}

						if (this.targetUnit) {
							var targetUnit = unitConversion.createOrMergeTargetCurrency();
							targetUnit.constantValue = this.targetUnit.constantValue;
							targetUnit.element = this.targetUnit.element;
							targetUnit.parameter = this.targetUnit.parameter;
						}

						if (this.outputUnitCurrencyElement) {
							if (this.outputUnitCurrencyElement) {
								if (!unitConversion.outputUnitCurrencyElement) {
									var outputUnitCurrencyElement = unitConversion.createOrMergeOutputUnitCurrencyElement({
										name: this.outputUnitCurrencyElement
									});
								} else {
									unitConversion.outputUnitCurrencyElement.name = this.outputUnitCurrencyElement;
								}
							}
						}

						if (this.errorHandling) {
							var errorHandling = unitConversion.createOrMergeErrorHandling();
							errorHandling.constantValue = this.errorHandling.constantValue;
						}

						events.push({
							source: viewNode,
							type: ViewModelEvents.ELEMENT_CHANGED,
							name: element.name,
							changed: true
						});
						return element;
					}
				}
			},
			undo: function(model, events) {
				var viewNode = model.columnView.viewNodes.get(this.viewNodeName);
				if (viewNode) {
					var element = viewNode.elements.get(this.elementName);
					if (element) {
						if (this.oldUnitConversion) {
							element.unitConversion = this.oldUnitConversion;
						}

						events.push({
							source: viewNode,
							type: ViewModelEvents.ELEMENT_CHANGED,
							name: element.name,
							changed: true
						});
					}
				}
			}
		};

		// ================ Hierarchy ================ \\
		function setHierTimeAttrsFromNames(model, hierarchy, timeProperties) {
			if (!hierarchy.timeProperties) {
				hierarchy.createTimeProperties();
			}
			var timePropertiesObject = hierarchy.timeProperties;
			var oldTimeProperties = {};

			if (timeProperties.hasOwnProperty("validFromElementName")) {
				oldTimeProperties.validFromElementName = timePropertiesObject.validFromElement ? timePropertiesObject.validFromElement.name : undefined;
				var validFromElem = model.columnView.getDefaultNode().elements.get(timeProperties.validFromElementName);
				if (validFromElem) {
					timePropertiesObject.validFromElement = validFromElem;
				} else {
					timePropertiesObject.validFromElement = undefined;
				}
			}
			if (timeProperties.hasOwnProperty("validToElementName")) {
				oldTimeProperties.validToElementName = timePropertiesObject.validToElement ? timePropertiesObject.validToElement.name : undefined;
				var validToElem = model.columnView.getDefaultNode().elements.get(timeProperties.validToElementName);
				if (validToElem) {
					timePropertiesObject.validToElement = validToElem;
				} else {
					timePropertiesObject.validToElement = undefined;
				}
			}
			if (timeProperties.hasOwnProperty("fromParameterName")) {
				oldTimeProperties.fromParameterName = timePropertiesObject.fromParameter ? timePropertiesObject.fromParameter.name : undefined;
				var fromParam = model.columnView.parameters.get(timeProperties.fromParameterName);
				if (fromParam) {
					timePropertiesObject.fromParameter = fromParam;
				} else {
					timePropertiesObject.fromParameter = undefined;
				}
			}
			if (timeProperties.hasOwnProperty("toParameterName")) {
				oldTimeProperties.toParameterName = timePropertiesObject.toParameter ? timePropertiesObject.toParameter.name : undefined;
				var toParam = model.columnView.parameters.get(timeProperties.toParameterName);
				if (toParam) {
					timePropertiesObject.toParameter = toParam;
				} else {
					timePropertiesObject.toParameter = undefined;
				}
			}
			if (timeProperties.hasOwnProperty("pointInTimeParameterName")) {
				oldTimeProperties.pointInTimeParameterName = timePropertiesObject.pointInTimeParameter ? timePropertiesObject.pointInTimeParameter.name :
					undefined;
				var pointInTimeParam = model.columnView.parameters.get(timeProperties.pointInTimeParameterName);
				if (pointInTimeParam) {
					timePropertiesObject.pointInTimeParameter = pointInTimeParam;
				} else {
					timePropertiesObject.pointInTimeParameter = undefined;
				}
			}
			return oldTimeProperties;
		}

		/**
     * @class to add a new Hierarchy
     * @property {object} attributes        - { objectAttributes: { name: "", ... },
                                                timeProperties :  { validFromElementName: "", validToElementName: "", fromParameterName: "", toParameterName: "", pointInTimeParameterName: ""}
                                              }
     * @property {string} nextHierarchyName - Optional - Name of the hierarchy to insert before (needed to create and insert in between others)
     */
		var AddHierarchyCommand = function(attributes, nextHierarchyName) {
			this.objectAttributes = attributes.objectAttributes;
			if (attributes.hasOwnProperty("timeProperties")) {
				this.timeProperties = attributes.timeProperties;
			}
			if (attributes.hasOwnProperty("levels")) {
				this.levels = attributes.levels;
			}
			if (attributes.hasOwnProperty("parentDefinitions")) {
				this.parentDefinitions = attributes.parentDefinitions;
			}
			if (attributes.hasOwnProperty("edgeAttributes")) {
				this.edgeAttributes = attributes.edgeAttributes;
			}
			if (attributes.hasOwnProperty("siblingOrders")) {
				this.siblingOrders = attributes.siblingOrders;
			}
			this.nextHierarchyName = nextHierarchyName;
		};
		AddHierarchyCommand.prototype = {
			execute: function(model, events) {
				var i;
				var hierarchy = model.columnView.createInlineHierarchy(this.objectAttributes, this.nextHierarchyName);
				if (hierarchy && this.timeProperties) {
					setHierTimeAttrsFromNames(model, hierarchy, this.timeProperties);
				}

				// Add Levels    
				if (this.levels && this.levels.length && this.levels.length > 0) {
					for (i = 0; i < this.levels.length; i++) {
						var addLevelCommand = new AddLevelCommand(hierarchy.name, this.levels[i]);
						addLevelCommand.execute(model, events);
					}
				}

				// Add Parent Definition
				if (this.parentDefinitions && this.parentDefinitions.length && this.parentDefinitions.length > 0) {
					for (i = 0; i < this.parentDefinitions.length; i++) {
						var addParentDefinitionCommand = new AddParentDefinitionCommand(hierarchy.name, this.parentDefinitions[i]);
						var parentDefinition = addParentDefinitionCommand.execute(model, events);
						var changeParentDefinitionCommand = new ChangeParentDefinitionCommand(hierarchy.name, parentDefinition.$getKeyAttributeValue(), this.parentDefinitions[
							i]);
						changeParentDefinitionCommand.execute(model, events);
					}
				}

				// Add Edge Attributes
				if (this.edgeAttributes && this.edgeAttributes.length && this.edgeAttributes.length > 0) {
					for (i = 0; i < this.edgeAttributes.length; i++) {
						var addEdgeAttributeCommand = new AddEdgeAttributeCommand(hierarchy.name, this.edgeAttributes[i]);
						addEdgeAttributeCommand.execute(model, events);

					}
				}

				// Add Sibling Orders  
				if (this.siblingOrders && this.siblingOrders.length && this.siblingOrders.length > 0) {
					for (i = 0; i < this.siblingOrders.length; i++) {
						var addSiblingOrderCommand = new AddSiblingOrderCommand(hierarchy.name, this.siblingOrders[i]);
						addSiblingOrderCommand.execute(model, events);
					}
				}

				events.push({
					source: model.columnView,
					type: ViewModelEvents.HIERARCHY_CREATED,
					name: hierarchy.name,
					changed: true
				});
				return hierarchy;
			},
			undo: function(model, events) {
				var hierarchy = model.columnView.inlineHierarchies.remove(this.objectAttributes.name);
				if (hierarchy) {
					events.push({
						source: model.columnView,
						type: ViewModelEvents.HIERARCHY_DELETED,
						name: hierarchy.name,
						changed: true
					});
				}
			}
		};

		/**
     * @class to change Hierarchy definition
     * @property {string} hierarchyName - Unique Name of the hierarchy
     * @property {object} attributes    - { objectAttributes: { name: "", ... },
                                            timeProperties  : { validFromElementName: "", validToElementName: "", fromParameterName: "", toParameterName: "", pointInTimeParameterName: ""}
                                            endUserTexts: { objectAttributes: { label: "", labelMaxLength: <number> },
     *                                                      comment         : { text : "", mimetype      : ""       } }
                                          }
     */
		var ChangeHierarchyCommand = function(hierarchyName, attributes) {
			this.name = hierarchyName;
			if (attributes.hasOwnProperty("objectAttributes")) {
				this.objectAttributes = attributes.objectAttributes;
				this.isRename = this.objectAttributes.hasOwnProperty("name") && this.objectAttributes.name !== this.name;
				this.oldObjectAttributes = undefined;
			}
			if (attributes.hasOwnProperty("timeProperties")) {
				this.timeProperties = attributes.timeProperties;
				this.oldTimeProperties = undefined;
			}
			this.endUserTextsServant = new EndUserTextsServant();
			this.endUserTextsServant.initialize(this, attributes.endUserTexts);
		};
		ChangeHierarchyCommand.prototype = {
			execute: function(model, events) {
				var hierarchy = model.columnView.inlineHierarchies.get(this.name);
				if (hierarchy) {
					if (this.objectAttributes) {
						this.oldObjectAttributes = hierarchy.$getAttributesForUndo(this.objectAttributes);
						if (this.isRename) {
							hierarchy.$rename(this.objectAttributes.name);
						}
						hierarchy.$setAttributes(this.objectAttributes);
					}
					if (this.timeProperties) {
						this.oldTimeProperties = setHierTimeAttrsFromNames(model, hierarchy, this.timeProperties);
					}
					this.endUserTextsServant.execute(this, hierarchy);

					events.push({
						source: model.columnView,
						type: ViewModelEvents.HIERARCHY_CHANGED,
						name: hierarchy.name,
						changed: true
					});
				}
				return hierarchy;
			},
			undo: function(model, events) {
				var hierarchy = model.columnView.inlineHierarchies.get(this.name);
				if (hierarchy) {
					if (this.oldObjectAttributes) {
						if (this.isRename) {
							hierarchy.$rename(this.name);
						}
						hierarchy.$setAttributes(this.oldObjectAttributes);
					}
					if (this.oldTimeProperties) {
						setHierTimeAttrsFromNames(model, hierarchy, this.oldTimeProperties);
					}
					this.endUserTextsServant.undo(this, hierarchy);

					events.push({
						source: model.columnView,
						type: ViewModelEvents.HIERARCHY_CHANGED,
						name: hierarchy.name,
						changed: true
					});
				}
			}
		};

		function setLevelAttributesFromNames(model, level, attributes) {
			var levelAttrs = {};
			var oldLevelAttrs;

			if (attributes.hasOwnProperty("levelType")) {
				levelAttrs.levelType = attributes.levelType;
			}
			if (attributes.hasOwnProperty("sortDirection")) {
				levelAttrs.sortDirection = attributes.sortDirection;
			}
			oldLevelAttrs = level.$getAttributesForUndo(levelAttrs);
			level.$setAttributes(levelAttrs);
			if (attributes.hasOwnProperty("elementName")) {
				oldLevelAttrs.elementName = level.element ? level.element.name : undefined;
				var elem = model.columnView.getDefaultNode().elements.get(attributes.elementName);
				level.element = elem; // in case elementName is empty it works like remove
			}
			if (attributes.hasOwnProperty("orderElementName")) {
				oldLevelAttrs.orderElementName = level.orderElement ? level.orderElement.name : undefined;
				var orderElem = model.columnView.getDefaultNode().elements.get(attributes.orderElementName);
				level.orderElement = orderElem; // in case elementName is empty it works like remove
			}
			return oldLevelAttrs;
		}

		/**
		 * @class to add a new Level to Leveled hierarchy
		 * @property {string} hierarchyName - Name of the level hierarchy
		 * @property {object} attributes    - { elementName: "", levelType: "", orderElementName: "", sortDirection: "" }
		 * @property {string} nextLevelId   - Optional - Unique ID of the Level to insert before
		 */
		var AddLevelCommand = function(hierarchyName, attributes, nextLevelId) {
			this.hierarchyName = hierarchyName;
			this.attributes = attributes;
			this.nextLevelId = nextLevelId;
			this.levelId = undefined;
		};
		AddLevelCommand.prototype = {
			execute: function(model, events) {
				var hierarchy = model.columnView.inlineHierarchies.get(this.hierarchyName);
				if (hierarchy) {
					var level = hierarchy.createLevel(null, null, this.nextLevelId);
					this.levelId = level.$getKeyAttributeValue();
					setLevelAttributesFromNames(model, level, this.attributes);
					events.push({
						source: model.columnView,
						type: ViewModelEvents.HIERARCHY_CHANGED,
						name: this.hierarchyName,
						changed: true
					});
				}
				return level;
			},
			undo: function(model, events) {
				var hierarchy = model.columnView.inlineHierarchies.get(this.hierarchyName);
				if (hierarchy) {
					hierarchy.levels.remove(this.levelId);
					events.push({
						source: model.columnView,
						type: ViewModelEvents.HIERARCHY_CHANGED,
						name: this.hierarchyName,
						changed: true
					});
				}
			}
		};

		/**
		 * @class to change Level in Leveled hierarchy
		 * @property {string} hierarchyName - Name of the level hierarchy
		 * @property {string} levelId       - Unique ID of the level to change
		 * @property {object} attributes    - { elementName: "", levelType: "", orderElementName: "", sortDirection: "" }
		 */
		var ChangeLevelCommand = function(hierarchyName, levelId, attributes) {
			this.hierarchyName = hierarchyName;
			this.levelId = levelId;
			this.attributes = attributes;
			this.oldAttributes = undefined;
		};
		ChangeLevelCommand.prototype = {
			execute: function(model, events) {
				var hierarchy = model.columnView.inlineHierarchies.get(this.hierarchyName);
				if (hierarchy) {
					var level = hierarchy.levels.get(this.levelId);
					if (level) {
						this.oldAttributes = setLevelAttributesFromNames(model, level, this.attributes);
						events.push({
							source: model.columnView,
							type: ViewModelEvents.HIERARCHY_CHANGED,
							name: this.hierarchyName,
							changed: true
						});
					}
				}
				return level;
			},
			undo: function(model, events) {
				var hierarchy = model.columnView.inlineHierarchies.get(this.hierarchyName);
				if (hierarchy) {
					var level = hierarchy.levels.get(this.levelId);
					if (level) {
						setLevelAttributesFromNames(model, level, this.oldAttributes);
						events.push({
							source: model.columnView,
							type: ViewModelEvents.HIERARCHY_CHANGED,
							name: this.hierarchyName,
							changed: true
						});
					}
				}
			}
		};

		/**
		 * @class to add a new Parent Definition to Parent-Child hierarchy
		 * @property {string} hierarchyName - Name of the parent-child hierarchy
		 * @property {object} attributes    - { rootNodeAttributes: { constantValue: "", parameterName: "" }, // Not Supported yet
		 *                                      elementName       : "", // Not Supported yet
		 *                                      parentName        : "", // Not Supported yet
		 *                                      stepParentNodeID  : ""
		 *                                    }
		 */
		var AddParentDefinitionCommand = function(hierarchyName, attributes) {
			this.hierarchyName = hierarchyName;
			this.attributes = attributes;
			this.parentDefinitionId = undefined;
		};
		AddParentDefinitionCommand.prototype = {
			execute: function(model, events) {
				var parentDefinition;
				var hierarchy = model.columnView.inlineHierarchies.get(this.hierarchyName);
				if (hierarchy) {
					var pdAttributes = {};
					if (this.attributes.hasOwnProperty("stepParentNodeID")) {
						pdAttributes.stepParentNodeID = this.attributes.stepParentNodeID;
					}
					parentDefinition = hierarchy.createParentDefinition(pdAttributes);
					this.parentDefinitionId = parentDefinition.$getKeyAttributeValue();
					events.push({
						source: model.columnView,
						type: ViewModelEvents.HIERARCHY_CHANGED,
						name: this.hierarchyName,
						changed: true
					});
				}
				return parentDefinition;
			},
			undo: function(model, events) {
				var hierarchy = model.columnView.inlineHierarchies.get(this.hierarchyName);
				if (hierarchy) {
					hierarchy.parentDefinitions.remove(this.parentDefinitionId);
					events.push({
						source: model.columnView,
						type: ViewModelEvents.HIERARCHY_CHANGED,
						name: this.hierarchyName,
						changed: true
					});
				}
			}
		};

		/**
		 * @class to Change a Parent Definition in Parent-Child hierarchy
		 * @property {string} hierarchyName      - Name of the parent-child hierarchy
		 * @property {string} parentDefinitionId - Unique Id for the parent Definition
		 * @property {object} attributes         - { rootNodeAttributes: { constantValue: "", parameterName: "" }, // Not Supported yet
		 *                                           elementName       : "", // Not Supported yet
		 *                                           parentName        : "", // Not Supported yet
		 *                                           stepParentNodeID  : ""
		 *                                         }
		 */
		var ChangeParentDefinitionCommand = function(hierarchyName, parentDefinitionId, attributes) {
			this.hierarchyName = hierarchyName;
			this.parentDefinitionId = parentDefinitionId;
			this.attributes = attributes;
			this.oldAttributes = undefined;
		};
		ChangeParentDefinitionCommand.prototype = {
			execute: function(model, events) {
				var hierarchy = model.columnView.inlineHierarchies.get(this.hierarchyName);
				if (hierarchy) {
					var parentDefinition = hierarchy.parentDefinitions.get(this.parentDefinitionId);
					if (parentDefinition) {
						var pdAttributes = {};
						if (this.attributes.hasOwnProperty("stepParentNodeID")) {
							pdAttributes.stepParentNodeID = this.attributes.stepParentNodeID;
							this.oldAttributes = parentDefinition.$getAttributesForUndo(pdAttributes);
							parentDefinition.$setAttributes(pdAttributes);
						} else {
							this.oldAttributes = {};
						}

						if (this.attributes.hasOwnProperty("rootNodeAttributes")) {
							if (parentDefinition.rootNode) {
								this.oldAttributes.rootNodeAttributes = parentDefinition.rootNode.$getAttributesForUndo(this.attributes.rootNodeAttributes);
								parentDefinition.rootNode.$setAttributes(this.attributes.rootNodeAttributes);
								if (parentDefinition.rootNode.parameter) {
									this.oldAttributes.rootNodeAttributes.parameterName = parentDefinition.rootNode.parameter.name;
								}
								if (this.attributes.rootNodeAttributes.parameterName) {
									parentDefinition.rootNode.parameter = model.columnView.parameters.get(this.attributes.rootNodeAttributes.parameterName);
									delete parentDefinition.rootNode.parameterName;
								}
								if (this.attributes.rootNodeAttributes.parameterName === null) {
									parentDefinition.rootNode.parameter = undefined;
								}
							} else {
								parentDefinition.createRootNode(this.attributes.rootNodeAttributes);
								if (this.attributes.rootNodeAttributes.parameterName) {
									parentDefinition.rootNode.parameter = model.columnView.parameters.get(this.attributes.rootNodeAttributes.parameterName);
									delete parentDefinition.rootNode.parameterName;
								}
							}
						}

						if (this.attributes.hasOwnProperty("elementName")) {
							this.oldAttributes.elementName = parentDefinition.element ? parentDefinition.element.name : undefined;
							var element = model.columnView.getDefaultNode().elements.get(this.attributes.elementName);
							parentDefinition.element = element;
						}

						if (this.attributes.hasOwnProperty("parentName")) {
							this.oldAttributes.parentName = parentDefinition.parent ? parentDefinition.parent.name : undefined;
							var parent = model.columnView.getDefaultNode().elements.get(this.attributes.parentName);
							parentDefinition.parent = parent;
						}

						events.push({
							source: model.columnView,
							type: ViewModelEvents.HIERARCHY_CHANGED,
							name: this.hierarchyName,
							changed: true
						});
					}
				}
			},
			undo: function(model, events) {
				var hierarchy = model.columnView.inlineHierarchies.get(this.hierarchyName);
				if (hierarchy) {
					var parentDefinition = hierarchy.parentDefinitions.get(this.parentDefinitionId);
					if (parentDefinition) {
						var pdAttributes = {};
						if (this.oldAttributes.hasOwnProperty("stepParentNodeID")) {
							pdAttributes.stepParentNodeID = this.attributes.stepParentNodeID;
							parentDefinition.$setAttributes(pdAttributes);
						}
						if (parentDefinition.rootNode) {
							if (this.oldAttributes.hasOwnProperty("rootNodeAttributes")) {
								parentDefinition.rootNode.$setAttributes(this.oldAttributes.rootNodeAttributes);
								if (this.oldAttributes.rootNodeAttributes.parameterName) {
									parentDefinition.rootNode.parameter = model.columnView.parameters.get(this.oldAttributes.rootNodeAttributes.parameterName);
									delete parentDefinition.rootNode.parameterName;
								}
							} else {
								parentDefinition.rootNode = undefined;
								delete parentDefinition.rootNode;
							}
						}

						if (this.oldAttributes.hasOwnProperty("elementName")) {
							var element = model.columnView.getDefaultNode().elements.get(this.oldAttributes.elementName);
							parentDefinition.element = element;
						}

						if (this.oldAttributes.hasOwnProperty("parentName")) {
							var parent = model.columnView.getDefaultNode().elements.get(this.oldAttributes.parentName);
							parentDefinition.parent = parent;
						}

						events.push({
							source: model.columnView,
							type: ViewModelEvents.HIERARCHY_CHANGED,
							name: this.hierarchyName,
							changed: true
						});
					}
				}
			}
		};

		/**
		 * @class to add a new Edge Attribute to Parent-Child hierarchy
		 * @property {string} hierarchyName       - Name of the parent-child hierarchy
		 * @property {object} attributes          - { elementName : "" }
		 * @property {string} nextEdgeAttributeId - Optional - Unique ID of the EdgeAttribute to insert before
		 */
		var AddEdgeAttributeCommand = function(hierarchyName, attributes, nextEdgeAttributeId) {
			this.hierarchyName = hierarchyName;
			this.attributes = attributes;
			this.nextEdgeAttributeId = nextEdgeAttributeId;
			this.edgeAttributeId = undefined;
		};
		AddEdgeAttributeCommand.prototype = {
			execute: function(model, events) {
				var edgeAttribute;
				var hierarchy = model.columnView.inlineHierarchies.get(this.hierarchyName);
				if (hierarchy) {
					edgeAttribute = hierarchy.createEdgeAttribute(null, null, this.nextEdgeAttributeId);
					if (this.attributes.hasOwnProperty("elementName")) {
						var element = model.columnView.getDefaultNode().elements.get(this.attributes.elementName);
						edgeAttribute.element = element;
					}
					this.edgeAttributeId = edgeAttribute.$getKeyAttributeValue();
					events.push({
						source: model.columnView,
						type: ViewModelEvents.HIERARCHY_CHANGED,
						name: this.hierarchyName,
						changed: true
					});
				}
				return edgeAttribute;
			},
			undo: function(model, events) {
				var hierarchy = model.columnView.inlineHierarchies.get(this.hierarchyName);
				if (hierarchy) {
					hierarchy.edgeAttributes.remove(this.edgeAttributeId);
					events.push({
						source: model.columnView,
						type: ViewModelEvents.HIERARCHY_CHANGED,
						name: this.hierarchyName,
						changed: true
					});
				}
			}
		};

		/**
		 * @class to add a new Sibling Order to Parent-Child hierarchy
		 * @property {string} hierarchyName - Name of the parent-child hierarchy
		 * @property {object} attributes    - { byElementName: "", direction: "" }
		 */
		var AddSiblingOrderCommand = function(hierarchyName, attributes) {
			this.hierarchyName = hierarchyName;
			this.attributes = attributes;
			this.siblingOrderId = undefined;
		};
		AddSiblingOrderCommand.prototype = {
			execute: function(model, events) {
				var siblingOrder;
				var hierarchy = model.columnView.inlineHierarchies.get(this.hierarchyName);
				if (hierarchy) {
					var siblingOrderAttributes = {};
					if (this.attributes.hasOwnProperty("direction")) {
						siblingOrderAttributes.direction = this.attributes.direction;
					}
					siblingOrder = hierarchy.createSiblingOrder(siblingOrderAttributes);

					if (this.attributes.hasOwnProperty("byElementName")) {
						var byElement = model.columnView.getDefaultNode().elements.get(this.attributes.byElementName);
						siblingOrder.byElement = byElement;
					}
					this.siblingOrderId = siblingOrder.$getKeyAttributeValue();
					events.push({
						source: model.columnView,
						type: ViewModelEvents.HIERARCHY_CHANGED,
						name: this.hierarchyName,
						changed: true
					});
				}
				return siblingOrder;
			},
			undo: function(model, events) {
				var hierarchy = model.columnView.inlineHierarchies.get(this.hierarchyName);
				if (hierarchy) {
					hierarchy.siblingOrders.remove(this.siblingOrderId);
					events.push({
						source: model.columnView,
						type: ViewModelEvents.HIERARCHY_CHANGED,
						name: this.hierarchyName,
						changed: true
					});
				}
			}
		};

		/**
		 * @class to change Sibling Order in Parent-Child hierarchy
		 * @property {string} hierarchyName - Name of the parent-child hierarchy
		 * @property {object} attributes    - { byElementName: "", direction: "" }
		 */
		var ChangeSiblingOrderCommand = function(hierarchyName, siblingOrderId, attributes) {
			this.hierarchyName = hierarchyName;
			this.siblingOrderId = siblingOrderId;
			this.attributes = attributes;
			this.oldAttributes = undefined;
		};
		ChangeSiblingOrderCommand.prototype = {
			execute: function(model, events) {
				var hierarchy = model.columnView.inlineHierarchies.get(this.hierarchyName);
				var siblingOrder;
				if (hierarchy) {
					siblingOrder = hierarchy.siblingOrders.get(this.siblingOrderId);
					if (siblingOrder) {
						var siblingOrderAttributes = {};
						if (this.attributes.hasOwnProperty("direction")) {
							siblingOrderAttributes.direction = this.attributes.direction;
							this.oldAttributes = siblingOrder.$getAttributesForUndo(siblingOrderAttributes);
							siblingOrder.$setAttributes(siblingOrderAttributes);
						} else {
							this.oldAttributes = {};
						}
						if (this.attributes.hasOwnProperty("byElementName")) {
							this.oldAttributes.byElementName = siblingOrder.byElementName ? siblingOrder.byElementName.name : undefined;
							var byElement = model.columnView.getDefaultNode().elements.get(this.attributes.byElementName);
							siblingOrder.byElement = byElement;
						}
					}
					events.push({
						source: model.columnView,
						type: ViewModelEvents.HIERARCHY_CHANGED,
						name: this.hierarchyName,
						changed: true
					});
				}
				return siblingOrder;
			},
			undo: function(model, events) {
				var hierarchy = model.columnView.inlineHierarchies.get(this.hierarchyName);
				if (hierarchy) {
					var siblingOrder = hierarchy.siblingOrders.get(this.siblingOrderId);
					if (siblingOrder) {
						var siblingOrderAttributes = {};
						if (this.oldAttributes.hasOwnProperty("direction")) {
							siblingOrderAttributes.direction = this.oldAttributes.direction;
							siblingOrder.$setAttributes(siblingOrderAttributes);
						}
						if (this.oldAttributes.hasOwnProperty("byElementName")) {
							var byElement = model.columnView.getDefaultNode().elements.get(this.oldAttributes.byElementName);
							siblingOrder.byElement = byElement;
						}
					}
					events.push({
						source: model.columnView,
						type: ViewModelEvents.HIERARCHY_CHANGED,
						name: this.hierarchyName,
						changed: true
					});
				}
			}
		};

		/**
		 * @class to swap in input as right to lift and left to right
		 * @property {string} parameter.viewNodeName - Name of the join node
		 */
		var swapInputInJoinCommand = function(parameter) {
			this.viewNodeName = parameter.viewNodeName;
			this.joinName = parameter.joinName;
		};
		swapInputInJoinCommand.prototype = {
			execute: function(model, events) {
				var viewNode = model.columnView.viewNodes.get(this.viewNodeName);
				if (viewNode) {
					var join = viewNode.joins.get(this.joinName);

					var tempRightInput = join.rightInput;
					var tempRightElement = join.rightElements;

					join.rightInput = join.leftInput;
					join.rightElements = join.leftElements;

					join.leftInput = tempRightInput;
					join.leftElements = tempRightElement;
					//swaping input 
					if (viewNode.inputs._keys.length >= 2) {
						viewNode.inputs._keys[0] = viewNode.inputs._keys[0] + viewNode.inputs._keys[1];
						viewNode.inputs._keys[1] = viewNode.inputs._keys[0] - viewNode.inputs._keys[1];
						viewNode.inputs._keys[0] = viewNode.inputs._keys[0] - viewNode.inputs._keys[1];
					}
					if (join.joinType === viewmodel.JoinType.TEXT_TABLE && join.languageColumn) {
						this.languageColumn = join.languageColumn;
						join.languageColumn = undefined;
					}
					//to refresh ui 
					viewNode._typeEvent = "Swap";
					events.push({
						source: viewNode,
						type: ViewModelEvents.JOIN_CHANGED,
						name: join.$getKeyAttributeValue(),
						changed: true
					});
					return join;

				}
			},
			undo: function(model, events) {
				var viewNode = model.columnView.viewNodes.get(this.viewNodeName);
				if (viewNode) {
					var join = viewNode.joins.get(this.joinName);

					var tempRightInput = join.rightInput;
					var tempRightElement = join.rightElements;

					join.rightInput = join.leftInput;
					join.rightElements = join.leftElements;

					join.leftInput = tempRightInput;
					join.leftElements = tempRightElement;

					//swaping input 
					if (viewNode.inputs._keys.length >= 2) {
						viewNode.inputs._keys[0] = viewNode.inputs._keys[0] + viewNode.inputs._keys[1];
						viewNode.inputs._keys[1] = viewNode.inputs._keys[0] - viewNode.inputs._keys[1];
						viewNode.inputs._keys[0] = viewNode.inputs._keys[0] - viewNode.inputs._keys[1];
					}

					if (join.joinType === viewmodel.JoinType.TEXT_TABLE && this.languageColumn) {
						join.languageColumn = this.languageColumn;
					}

					viewNode._typeEvent = "Swap";
					events.push({
						source: viewNode,
						type: ViewModelEvents.JOIN_CHANGED,
						name: join.$getKeyAttributeValue(),
						changed: true
					});
					return join;
				}
			}
		};

		return {
			ViewModelEvents: ViewModelEvents,
			ChangeColumnViewPropertiesCommand: ChangeColumnViewPropertiesCommand,
			CreateViewNodeCommand: CreateViewNodeCommand,
			ChangeViewNodeCommand: ChangeViewNodeCommand,
			AddElementCommand: AddElementCommand,
			MoveElementCommand: MoveElementCommand,
			ChangeElementPropertiesCommand: ChangeElementPropertiesCommand,
			CopyElementCommand: CopyElementCommand,
			AddCounterReferenceElemCommand: AddCounterReferenceElemCommand,
			RemoveCounterReferenceElemCommand: RemoveCounterReferenceElemCommand,
			AddParameterCommand: AddParameterCommand,
			MoveParameterCommand: MoveParameterCommand,
			ChangeParameterPropertiesCommand: ChangeParameterPropertiesCommand,
			CopyParameterCommand: CopyParameterCommand,
			CreateParameterMappingCommand: CreateParameterMappingCommand,
			RemoveParameterMappingCommand: RemoveParameterMappingCommand,
			CreateInputCommand: CreateInputCommand,
			SetSharedElementPropertiesCommand: SetSharedElementPropertiesCommand,
			CreateParameterValueRangeCommand: CreateParameterValueRangeCommand,
			ChangeParameterValueRangeCommand: ChangeParameterValueRangeCommand,
			CreateParameterDefaultRangeCommand: CreateParameterDefaultRangeCommand,
			ChangeParameterDefaultRangeCommand: ChangeParameterDefaultRangeCommand,
			CreateDerivationRuleCommand: CreateDerivationRuleCommand,
			ChangeDerivationRuleCommand: ChangeDerivationRuleCommand,
			CreateDerivationRuleElementFilter: CreateDerivationRuleElementFilter,
			ChangeDerivationRuleElementFilter: ChangeDerivationRuleElementFilter,
			ChangeColumnViewExecutionHintsPropertiesCommand: ChangeColumnViewExecutionHintsPropertiesCommand,
			AddParamAssignedElemCommand: AddParamAssignedElemCommand,
			RemoveParamAssignedElemCommand: RemoveParamAssignedElemCommand,
			CreateJoinCommand: CreateJoinCommand,
			ChangeJoinPropertiesCommand: ChangeJoinPropertiesCommand,
			AddRestrictionCommand: AddRestrictionCommand,
			ChangeRestrictionCommand: ChangeRestrictionCommand,
			ChangeCurrencyPropertiesCommand: ChangeCurrencyPropertiesCommand,
			ChangeUnitPropertiesCommand: ChangeUnitPropertiesCommand,
			ChangeInputPropertiesCommand: ChangeInputPropertiesCommand,
			changeEntityCommand: changeEntityCommand,
			CreateMappingCommand: CreateMappingCommand,
			ChangeMappingPropertiesCommand: ChangeMappingPropertiesCommand,
			ChangeRankNodePropertiesCommand: ChangeRankNodePropertiesCommand,
			ChangeInputCommand: ChangeInputCommand,
			AddHierarchyCommand: AddHierarchyCommand,
			ChangeHierarchyCommand: ChangeHierarchyCommand,
			AddLevelCommand: AddLevelCommand,
			ChangeLevelCommand: ChangeLevelCommand,
			AddParentDefinitionCommand: AddParentDefinitionCommand,
			ChangeParentDefinitionCommand: ChangeParentDefinitionCommand,
			AddEdgeAttributeCommand: AddEdgeAttributeCommand,
			AddSiblingOrderCommand: AddSiblingOrderCommand,
			ChangeSiblingOrderCommand: ChangeSiblingOrderCommand,
			CreateOrChangeGenericHint: CreateOrChangeGenericHint,
			swapInputInJoinCommand: swapInputInJoinCommand,
			CreateWorkSpaceCommand:CreateWorkSpaceCommand,
			ChangeGraphNodeCommand:ChangeGraphNodeCommand
		};
	});
