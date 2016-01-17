/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define([
        "../model",
        "../../base/modelbase"
    ],
    function(viewModel, modelbase) {
        "use strict";

        var DeleteService = {
            //: Added viewNode argument to address graph node workspace scenario
            getImpactAnalysis: function(object, columnView, isDelete, viewNode) {
                var impactAnalysis = [];
                if (object) {
                    if (object instanceof viewModel.Element) {
                        this.getImpactAnalysisForElement(impactAnalysis, object, columnView, isDelete);
                    } else if (object instanceof viewModel.Input) {
                        this.getImpactAnalysisForInput(impactAnalysis, object, columnView, isDelete);
                    } else if (object instanceof viewModel.ViewNode) {
                        this.getImpactAnalysisForViewNode(impactAnalysis, object, columnView, isDelete);
                    } else if (object instanceof viewModel.Parameter) {
                        this.getImpactAnalysisForParameter(impactAnalysis, object, columnView, isDelete);
                    } else if (object instanceof viewModel.InlineHierarchy) {
                        this.getImpactAnalysisForInlineHierarchy(impactAnalysis, object, columnView, isDelete);
                    } else if (object instanceof viewModel.Entity) { //viewNode.isGraphNode()
                        this.getImpactAnalysisForGraphWorkspace(impactAnalysis, object, columnView, isDelete, viewNode);
                    } 
                    
                }
                return impactAnalysis;
            },
            
            getImpactAnalysisForParameter: function(impactAnalysis, object, columnView, isDelete) {
                var referancesTo = modelbase.ReferenceManager.getReferencesTo(object, true, true);
                for (var i = 0; i < referancesTo.length; i++) {
                    var feature = referancesTo[i].feature;
                    if (feature._name === "pointInTimeParameter") {                                
                        var hierarchy = feature._owner.$getContainer();   
                        this.addToImpactAnalysis(impactAnalysis, object, "Parameter '" + object.name + "' is used as point-in-time-parameter of the time dependent hierarchy '" + hierarchy.name + "'", undefined, isDelete, false);
                    }else if(feature._owner.$$containingFeature._name === "rootNode"){
                        var hierarchy = feature._owner.$getContainer().$getContainer();                             
                        this.addToImpactAnalysis(impactAnalysis, object, "Parameter '" + object.name + "' is used in the root node definition of hierarchy '" + hierarchy.name + "'", undefined, isDelete, false);    
                    }else if (feature._name === "fromParameter") {                                
                        var hierarchy = feature._owner.$getContainer();   
                        this.addToImpactAnalysis(impactAnalysis, object, "Parameter '" + object.name + "' is used as from-parameter of the time dependent hierarchy '" + hierarchy.name + "'", undefined, isDelete, false);
                    }else if (feature._name === "toParameter") {                                
                        var hierarchy = feature._owner.$getContainer();   
                        this.addToImpactAnalysis(impactAnalysis, object, "Parameter '" + object.name + "' is used as to-parameter of the time dependent hierarchy '" + hierarchy.name + "'", undefined, isDelete, false);
                    }
                    else if (feature._name === "historyParameter") {                                
                        // var columnView = feature._owner.$getContainer();   
                        this.addToImpactAnalysis(impactAnalysis, object, "Parameter '" + object.name + "' is used as history parameter of the view.", undefined, isDelete, false);
                    }else if(feature._owner.$$containingFeature._name === "rankThreshold"){
                        var viewNode = feature._owner.$getContainer().$getContainer(); 
                        this.addToImpactAnalysis(impactAnalysis, object, "Parameter '" + object.name + "' is used as rank threshold of node '" + viewNode.name + "'", undefined, isDelete, false);    
                    }else if(feature._owner.$$containingFeature._name === "intersectionMatrix"){
                        var join = feature._owner.$getContainer().$getContainer(); 
                        var joinNode = feature._owner.$getContainer().$getContainer().$getContainer(); 
                        this.addToImpactAnalysis(impactAnalysis, object, "Parameter '" + object.name + "' is used as spatial intersection matrix parameter in the join of node '" + joinNode.name + "'", undefined, isDelete, false);    
                    }else if(feature._owner.$$containingFeature._name === "distance"){
                        var join = feature._owner.$getContainer().$getContainer(); 
                        var joinNode = feature._owner.$getContainer().$getContainer().$getContainer(); 
                        this.addToImpactAnalysis(impactAnalysis, object, "Parameter '" + object.name + "' is used as spatial distance parameter in the join of node '" + joinNode.name + "'", undefined, isDelete, false);    
                    }
                }
            },  
            
            getImpactAnalysisForInlineHierarchy: function(impactAnalysis, object, columnView, isDelete) {
                var referancesTo = modelbase.ReferenceManager.getReferencesTo(object, true, true);
                for (var i = 0; i < referancesTo.length; i++) {
                    var feature = referancesTo[i].feature;
                    if(feature._name === "hierarchy"){
                        var paramter = feature._owner;    
                        this.addToImpactAnalysis(impactAnalysis, paramter, "Hierarchy '" + object.name + "' is used in Parameter '" + paramter.name + "'", undefined, isDelete, false);    
                    }
                }
            },

            getImpactAnalysisForElement: function(impactAnalysis, object, columnView, isDelete) {
                if (object.$getContainer() instanceof viewModel.ViewNode) {
                    this.addToImpactAnalysis(impactAnalysis, object, "Column '" + object.name + "' is used as output in view node '" + object.$getContainer().name + "'", this.computeObjectPath(object), isDelete, false);
                    var referancesTo = modelbase.ReferenceManager.getReferencesTo(object, true, true);
                    for (var i = 0; i < referancesTo.length; i++) {
                        var feature = referancesTo[i].feature;
                        if (feature._owner instanceof viewModel.Mapping) {
                            if (feature._owner.$getContainer().$getContainer() instanceof viewModel.ViewNode && feature._owner.$getContainer().$getContainer().joins && feature._owner.$getContainer().$getContainer().joins.count() > 0) {
                                var joins = feature._owner.$getContainer().$getContainer().joins;
                                var that = this;
                                joins.foreach(function(join) {
                                    var position = that.getIndexOfArray(object, join.leftElements);
                                    if (position !== -1) {      
                                        that.addToImpactAnalysis(impactAnalysis, join.leftElements.get(position), "Element", undefined, isDelete, true);
                                    }
                                });
                            }
                            if (feature._name === "targetElement") {
                                this.addToImpactAnalysis(impactAnalysis, feature._owner, "Column \"" + feature._value.name + "\" is mapped in view node \"" + feature._owner.$getContainer().$getContainer().name + "\"", this.computeObjectPath(feature._owner), isDelete, true);
                            } else if (feature._name === "sourceElement") {
                                if (feature._owner.targetElement) {
                                    this.getImpactAnalysisForElement(impactAnalysis, feature._owner.targetElement, columnView, isDelete);
                                }
                            } else {
                                this.addToImpactAnalysis(impactAnalysis, feature._owner, feature._owner.type, this.computeObjectPath(feature._owner), isDelete, false);
                            }
                        }else if(feature._owner instanceof viewModel.Join){
                            var join =  feature._owner;  
                                if(join.leftElements.count() === 1){
                                    this.addToImpactAnalysis(impactAnalysis, join, "Column '" + object.name + "' is used as right join element in Join Node '" + join.$getContainer().name + "'", this.computeObjectPath(join), isDelete, false);          
                                }else if(join.leftElements.count() > 1){
                                        var position = this.getIndexOfArray(object, join.rightElements);
                                        var rightJoinElementPath = this.computeObjectPath(join, true, position);
                                        this.addToImpactAnalysis(impactAnalysis, join.rightElements, "Column '" + object.name + "' is used as right join element in Join Node '" + join.$getContainer().name + "'", rightJoinElementPath, isDelete, false);
                                        var lefttJoinElementPath = this.computeObjectPath(join, true, position, true);
                                        this.addToImpactAnalysis(impactAnalysis, join.leftElements, "Element", lefttJoinElementPath, isDelete, true);
                                } 
                        }else if(feature._owner instanceof viewModel.ExceptionAggregationStep){
                            var exceptionAggregationStep =  feature._owner;   
                            var element = exceptionAggregationStep.$getContainer();
                            if(feature._name === "referenceElements"){                                
                                this.addToImpactAnalysis(impactAnalysis, exceptionAggregationStep, "Column '" + object.name + "' is used as (reference) column in distinct counter column '" + element.name + "'", undefined, isDelete, false);                           
                            }        
                        }else if(feature._owner instanceof viewModel.ElementRefFilter){
                            var elementRefFilter =  feature._owner;   
                            var element = elementRefFilter.$getContainer();
                            if(feature._name === "element"){                                
                                this.addToImpactAnalysis(impactAnalysis, elementRefFilter, "Column '" + object.name + "' is used in restriction of restricted column '" + element.name + "'", undefined, isDelete, false);                           
                            }        
                        }else if(feature._name === "unitCurrencyElement"){
                            var element =  feature._owner;     
                            this.addToImpactAnalysis(impactAnalysis, element, "Column '" + object.name + "' is used as unit/currency in column '" + element.name + "'", undefined, isDelete, false);     
                        }else if(feature._name === "labelElement"){
                            var element =  feature._owner;     
                            this.addToImpactAnalysis(impactAnalysis, element, "Column '" + object.name + "' is used as label column in column '" + element.name + "'", undefined, isDelete, false);     
                        }else if(feature._owner.$$containingFeature._name === "sourceCurrency"){
                            var element = feature._owner.$getContainer().$getContainer();
                            this.addToImpactAnalysis(impactAnalysis, element, "Column '" + object.name + "' is used in Source Currency of the unit/currency conversion in column '" + element.name + "'", undefined, isDelete, false);      
                        }else if(feature._owner.$$containingFeature._name === "targetCurrency"){
                            var element = feature._owner.$getContainer().$getContainer(); 
                            this.addToImpactAnalysis(impactAnalysis, element, "Column '" + object.name + "' is used in Target Currency of the unit/currency conversion in column '" + element.name + "'", undefined, isDelete, false);    
                        }else if(feature._owner.$$containingFeature._name === "exchangeRateType"){
                            var element = feature._owner.$getContainer().$getContainer(); 
                            this.addToImpactAnalysis(impactAnalysis, element, "Column '" + object.name + "' is used in Exchange Type of the unit/currency conversion in column '" + element.name + "'", undefined, isDelete, false);    
                        }else if(feature._owner.$$containingFeature._name === "referenceDate"){
                            var element = feature._owner.$getContainer().$getContainer(); 
                            this.addToImpactAnalysis(impactAnalysis, element, "Column '" + object.name + "' is used in Conversion Date of the unit/currency conversion in column '" + element.name + "'", undefined, isDelete, false);    
                        }else if(feature._name === "assignedElements"){
                            var paramter = feature._owner;    
                            this.addToImpactAnalysis(impactAnalysis, paramter, "Column '" + object.name + "' is assigned to Variable '" + paramter.name + "'", undefined, isDelete, false);
                        }else if(feature._name === "typeOfElement"){
                            var paramter = feature._owner;    
                            this.addToImpactAnalysis(impactAnalysis, paramter, "Column '" + object.name + "' is used in type Parameter/Variable '" + paramter.name + "'", undefined, isDelete, false);    
                        }else if(feature._name === "orderElement"){
                            var hierarchy = feature._owner.$getContainer();   
                            this.addToImpactAnalysis(impactAnalysis, paramter, "Column '" + object.name + "' is used as orderElement in Level in hierarchy '" + hierarchy.name + "'", undefined, isDelete, false);  
                        }else if(feature._owner.$$containingFeature._name === "levels"){
                            var hierarchy = feature._owner.$getContainer();   
                            this.addToImpactAnalysis(impactAnalysis, paramter, "Column '" + object.name + "' is used as Level in hierarchy '" + hierarchy.name + "'", undefined, isDelete, false);  
                        }else if(feature._name === "parent"){
                            var hierarchy = feature._owner.$getContainer();   
                            this.addToImpactAnalysis(impactAnalysis, paramter, "Column '" + object.name + "' is used as Parent node in hierarchy '" + hierarchy.name + "'", undefined, isDelete, false);  
                        }else if(feature._name === "element" && feature._owner.$$containingFeature._name === "parentDefinitions"){
                            var hierarchy = feature._owner.$getContainer();   
                            this.addToImpactAnalysis(impactAnalysis, paramter, "Column '" + object.name + "' is used as Child node in hierarchy '" + hierarchy.name + "'", undefined, isDelete, false);  
                        }else if(feature._name === "validFromElement"){
                            var hierarchy = feature._owner.$getContainer();   
                            this.addToImpactAnalysis(impactAnalysis, paramter, "Column '" + object.name + "' is used as Valid-from column in hierarchy '" + hierarchy.name + "'", undefined, isDelete, false);  
                        }else if(feature._name === "validToElement"){
                            var hierarchy = feature._owner.$getContainer();   
                            this.addToImpactAnalysis(impactAnalysis, paramter, "Column '" + object.name + "' is used as Valid-to column in hierarchy '" + hierarchy.name + "'", undefined, isDelete, false);  
                        }   
                    }
                }
            },

            getImpactAnalysisForInput: function(impactAnalysis, object, columnView, isDelete) {
                if (object && object instanceof viewModel.Input) {
                    //this.addToImpactAnalysis(impactAnalysis, object, object.name, this.computeObjectPath(object), isDelete, true);
                    var that = this;
                    object.mappings.foreach(function(mapping) {
                        if (mapping.targetElement) {
                            that.getImpactAnalysisForElement(impactAnalysis, mapping.targetElement, columnView, isDelete);
                        }
                    });

                    //For Deleting Join Object

                    var referancesTo = modelbase.ReferenceManager.getReferencesTo(object, true);
                    for (var i = 0; i < referancesTo.length; i++) {
                        var feature = referancesTo[i].feature;
                        if (feature._owner instanceof viewModel.Join) {
                            this.addToImpactAnalysis(impactAnalysis, feature._owner, undefined, this.computeObjectPath(feature._owner), isDelete, true);
                            // feature._owner = undefined;
                        }
                    }
                    
                    //ViewNode Deletion Issue Incident ID: 1570443168
                    this.addToImpactAnalysis(impactAnalysis, object, object.name, this.computeObjectPath(object), isDelete, true);
                }
            },
            
            getImpactAnalysisForGraphWorkspace: function(impactAnalysis, object, columnView, isDelete, viewNode){
                var columnView = object.$getContainer().columnView;
                var graphNode = viewNode ? viewNode : columnView.viewNodes.get("Graph_1");
                
                this.addToImpactAnalysis(impactAnalysis, object, object.name, this.computeObjectPath(object, undefined, undefined, undefined, graphNode), isDelete, true);
                var that = this;
                graphNode.elements.foreach(function(element) {
                    that.getImpactAnalysisForElement(impactAnalysis, element, columnView, isDelete);
                });
            },

            getImpactAnalysisForViewNode: function(impactAnalysis, object, columnView, isDelete) {
                if (object && object instanceof viewModel.ViewNode) {
                    this.addToImpactAnalysis(impactAnalysis, object, object.name, this.computeObjectPath(object), isDelete, false);
                    //TODO for view node implementation - Rajesh
                }
            },

            computeObjectPath: function(object, isJoinElement, position, leftElement, viewNode) {
                var path;
                if (object instanceof viewModel.Element) {
                    path = "columnView.viewNodes[\"" + object.$getContainer().name + "\"].elements[\"" + object.name + "\"]";
                } else if (object instanceof viewModel.Input) {
                    var viewNode = object.$getContainer();
                    path = "columnView.viewNodes[\"" + viewNode.name + "\"].inputs[" + this.getIndexOfArray(object, viewNode.inputs) + "]";
                } else if (object instanceof viewModel.ViewNode) {
                    path = "columnView.viewNodes[\"" + object.name + "\"]";
                } else if (object instanceof viewModel.Mapping) {
                    var viewNode = object.$getContainer().$getContainer();
                    var input = object.$getContainer();
                    path = "columnView.viewNodes[\"" + viewNode.name + "\"].inputs[" + this.getIndexOfArray(input, viewNode.inputs) + "].mappings[" + this.getIndexOfArray(object, input.mappings) + "]";
                } else if (object instanceof viewModel.Join && isJoinElement === undefined) {
                    var viewNode = object.$getContainer();
                    path = "columnView.viewNodes[\"" + viewNode.name + "\"].joins[" + this.getIndexOfArray(object, viewNode.joins) + "]";
                }else if (object instanceof viewModel.Join && isJoinElement) {
                    var viewNode = object.$getContainer();
                    if(leftElement){
                        path = "columnView.viewNodes[\"" + viewNode.name + "\"].joins[0].leftElements[" + "\"" + position + "\"" + "]";
                    }else{
                          path = "columnView.viewNodes[\"" + viewNode.name + "\"].joins[0].rightElements[" + "\"" + position + "\"" + "]";   
                    }    
                }else if (object instanceof viewModel.Entity) {
                    var graphNode = viewNode;
                    path = "columnView.viewNodes[\"" + graphNode.name + "\"].workspace";
                }
                return path;
            },

            addToImpactAnalysis: function(impactAnalysis, obj, objectName, objPath, changetype, isHidden) {
                //: There will be cases when same object instance will ve used twice
                /*if (impactAnalysis) {
                    for (var i = 0; i < impactAnalysis.length; i++) {
                        if (impactAnalysis[i].object === obj) {
                            return;
                        }
                    }
                }*/
                impactAnalysis.push({
                    object: obj,
                    name: objectName,
                    path: objPath,
                    changeType: changetype,
                    hidden: isHidden
                });
            },

            getIndexOfArray: function(object, array) {
                if (array.hasOwnProperty("length")) {
                    for (var i = 0; i < array.length; i++) {
                        if (array[i] === object) {
                            return i;
                        }
                    }
                } else if (array.hasOwnProperty("_keys") && array.hasOwnProperty("_values")) {
                    var temp = 0;
                    var position = -1;
                    array.foreach(function(value) {
                        if (value === object) {
                            position = temp;
                        } else {
                            temp++;
                        }
                    });
                    if (position !== -1 && position < array._keys.length) {
                        position = array._keys[position];
                    }
                }
                return position;
            },
            
            getIntegerIndexOfArray: function(object, array) {
                if (array.hasOwnProperty("length")) {
                    for (var i = 0; i < array.length; i++) {
                        if (array[i] === object) {
                            return i;
                        }
                    }
                } else if (array.hasOwnProperty("_keys") && array.hasOwnProperty("_values")) {
                    var temp = 0;
                    var position = -1;
                    array.foreach(function(value) {
                        if (value === object) {
                            position = temp;
                        } else {
                            temp++;
                        }
                    });                    
                }
                return position;
            }

        };
        
        /*
    	 * @class
    	 */
        var RenameService = {

    			getImpactAnalysis: function(object, columnView, isDelete) {
    				var impactAnalysis = [];
    				if (object) {
    					if (object instanceof viewModel.Element) {
    						this.getImpactAnalysisForElement(impactAnalysis, object, columnView, isDelete);
    					} else if (object instanceof viewModel.Input) {
    						this.getImpactAnalysisForInput(impactAnalysis, object, columnView, isDelete);
    					} else if (object instanceof viewModel.ViewNode) {
    						this.getImpactAnalysisForViewNode(impactAnalysis, object, columnView, isDelete);
    					} else if (object instanceof viewModel.Parameter) {
    						this.getImpactAnalysisForParameter(impactAnalysis, object, columnView, isDelete);
    					} else if (object instanceof viewModel.InlineHierarchy) {
    						this.getImpactAnalysisForInlineHierarchy(impactAnalysis, object, columnView, isDelete);
    					} else if(object instanceof viewModel.Entity){
    						this.getImpactAnalysisForEntity(impactAnalysis, object, columnView, isDelete);
    					}  else if(object instanceof viewModel.Context){
    						this.getImpactAnalysisForContext(impactAnalysis, object, columnView, isDelete);
    					}

    				}
    				return impactAnalysis;
    			},
    			
    			getImpactAnalysisForEntity : function(impactAnalysis, object, columnView, isDelete){
    				if (object.$getContainer() instanceof viewModel.Context) {
    					this.addToImpactAnalysis(impactAnalysis, object, "Entity '" + object.name + "' is used as output in context '" + object.$getContainer().name + "'", this.computeObjectPath(object), isDelete, false);
    					/*var referancesTo = modelbase.ReferenceManager.getReferencesTo(object, true, true);
    					for (var i = 0; i < referancesTo.length; i++) {
    						var feature = referancesTo[i].feature;
    						if (feature._owner instanceof viewModel.Association) {
    							this.addToImpactAnalysis(impactAnalysis, feature._owner, "Entity '" + object.name + "' is used as target entity in association'" + feature._owner.$$containingFeature._owner.name + "'", undefined, isDelete, false);  
    						} 
    					}*/
    				}
    			},
    			
    			getImpactAnalysisForType : function(impactAnalysis, object, columnView, isDelete){
    				if (object.$getContainer() instanceof viewModel.Context) {
    					this.addToImpactAnalysis(impactAnalysis, object, "Type '" + object.name + "' is used as output in context '" + object.$getContainer().name + "'", this.computeObjectPath(object), isDelete, false);
    					var referancesTo = modelbase.ReferenceManager.getReferencesTo(object, true, true);
    					for (var i = 0; i < referancesTo.length; i++) {
    						var feature = referancesTo[i].feature;
    						if (feature._owner instanceof viewModel.Association) {
    							this.addToImpactAnalysis(impactAnalysis, feature._owner, "Type '" + object.name + "' is used as data type in element'" + feature._owner.$$containingFeature._owner.name + "'", undefined, isDelete, false);  
    						} 
    					}
    				}
    			},
    			
    			getImpactAnalysisForContext : function(impactAnalysis, object, columnView, isDelete){
    				if (object.$getContainer() instanceof viewModel.Context) {
    					this.addToImpactAnalysis(impactAnalysis, object, "Context '" + object.name + "' is used as output in context '" + object.$getContainer().name + "'", this.computeObjectPath(object), isDelete, false);
    					
    					var referancesTo = modelbase.ReferenceManager.getReferencesTo(object, true, true);
    					for (var i = 0; i < referancesTo.length; i++) {
    						var feature = referancesTo[i].feature;
    						if (feature._owner instanceof viewModel.Association) {
    							this.addToImpactAnalysis(impactAnalysis, feature._owner, "Column '" + object.name + "' is used as key column in association'" + feature._owner.$$containingFeature._owner.name + "'", undefined, isDelete, false);  
    						} 
    					}
    					
    					//add all its children to impact analysis array
    					var chilrenArray = object.children;
    					for (var i = 0; i < chilrenArray._keys.length; i++) {
    						var child = chilrenArray.getAt(i);
    						if(child instanceof viewModel.Entity){
    							this.getImpactAnalysisForEntity(impactAnalysis, child, columnView, isDelete);
    						} else if(child instanceof viewModel.Context){
    							this.getImpactAnalysisForContext(impactAnalysis, child, columnView, isDelete);
    						} else if(child instanceof viewModel.Type){
    							this.getImpactAnalysisForType(impactAnalysis, child, columnView, isDelete);
    						}
    					}
    				}
    			},

    			getImpactAnalysisForElement: function(impactAnalysis, object, columnView, isDelete) {
    				if (object.$getContainer() instanceof viewModel.Entity) {
    					this.addToImpactAnalysis(impactAnalysis, object, "Entity '" + object.name + "' is used as output in view node '" + object.$getContainer().name + "'", this.computeObjectPath(object), isDelete, false);
    					var referancesTo = modelbase.ReferenceManager.getReferencesTo(object, true, true);
    					for (var i = 0; i < referancesTo.length; i++) {
    						var feature = referancesTo[i].feature;
    						if (feature._owner instanceof viewModel.AssociationKey) {
    							this.addToImpactAnalysis(impactAnalysis, feature._owner, "Column '" + object.name + "' is used as key column in association'" + feature._owner.$$containingFeature._owner.name + "'", undefined, isDelete, false);  

    						} else if (feature._owner instanceof viewModel.Mapping) {
    							if (feature._owner.$getContainer().$getContainer() instanceof viewModel.ViewNode && feature._owner.$getContainer().$getContainer().joins && feature._owner.$getContainer().$getContainer().joins.count() > 0) {
    								var joins = feature._owner.$getContainer().$getContainer().joins;
    								var that = this;
    								joins.foreach(function(join) {
    									var position = that.getIndexOfArray(object, join.leftElements);
    									if (position !== -1) {      
    										that.addToImpactAnalysis(impactAnalysis, join.leftElements.get(position), "Element", undefined, isDelete, true);
    									}
    								});
    							}
    							if (feature._name === "targetElement") {
    								this.addToImpactAnalysis(impactAnalysis, feature._owner, "Column \"" + feature._value.name + "\" is mapped in view node \"" + feature._owner.$getContainer().$getContainer().name + "\"", this.computeObjectPath(feature._owner), isDelete, true);
    							} else if (feature._name === "sourceElement") {
    								if (feature._owner.targetElement) {
    									this.getImpactAnalysisForElement(impactAnalysis, feature._owner.targetElement, columnView, isDelete);
    								}
    							} else {
    								this.addToImpactAnalysis(impactAnalysis, feature._owner, feature._owner.type, this.computeObjectPath(feature._owner), isDelete, false);
    							}
    						}else if(feature._owner instanceof viewModel.Join){
    							var join =  feature._owner;  
    							if(join.leftElements.count() === 1){
    								this.addToImpactAnalysis(impactAnalysis, join, "Column '" + object.name + "' is used as right join element in Join Node '" + join.$getContainer().name + "'", this.computeObjectPath(join), isDelete, false);          
    							}else if(join.leftElements.count() > 1){
    								var position = this.getIndexOfArray(object, join.rightElements);
    								var rightJoinElementPath = this.computeObjectPath(join, true, position);
    								this.addToImpactAnalysis(impactAnalysis, join.rightElements, "Column '" + object.name + "' is used as right join element in Join Node '" + join.$getContainer().name + "'", rightJoinElementPath, isDelete, false);
    								var lefttJoinElementPath = this.computeObjectPath(join, true, position, true);
    								this.addToImpactAnalysis(impactAnalysis, join.leftElements, "Element", lefttJoinElementPath, isDelete, true);
    							} 
    						}else if(feature._owner instanceof viewModel.ExceptionAggregationStep){
    							var exceptionAggregationStep =  feature._owner;   
    							var element = exceptionAggregationStep.$getContainer();
    							if(feature._name === "referenceElements"){                                
    								this.addToImpactAnalysis(impactAnalysis, exceptionAggregationStep, "Column '" + object.name + "' is used as (reference) column in distinct counter column '" + element.name + "'", undefined, isDelete, false);                           
    							}        
    						}else if(feature._owner instanceof viewModel.ElementRefFilter){
    							var elementRefFilter =  feature._owner;   
    							var element = elementRefFilter.$getContainer();
    							if(feature._name === "element"){                                
    								this.addToImpactAnalysis(impactAnalysis, elementRefFilter, "Column '" + object.name + "' is used in restriction of restricted column '" + element.name + "'", undefined, isDelete, false);                           
    							}        
    						}else if(feature._name === "unitCurrencyElement"){
    							var element =  feature._owner;     
    							this.addToImpactAnalysis(impactAnalysis, element, "Column '" + object.name + "' is used as unit/currency in column '" + element.name + "'", undefined, isDelete, false);     
    						}else if(feature._name === "labelElement"){
    							var element =  feature._owner;     
    							this.addToImpactAnalysis(impactAnalysis, element, "Column '" + object.name + "' is used as label column in column '" + element.name + "'", undefined, isDelete, false);     
    						}else if(feature._owner.$$containingFeature._name === "sourceCurrency"){
    							var element = feature._owner.$getContainer().$getContainer();
    							this.addToImpactAnalysis(impactAnalysis, element, "Column '" + object.name + "' is used in Source Currency of the unit/currency conversion in column '" + element.name + "'", undefined, isDelete, false);      
    						}else if(feature._owner.$$containingFeature._name === "targetCurrency"){
    							var element = feature._owner.$getContainer().$getContainer(); 
    							this.addToImpactAnalysis(impactAnalysis, element, "Column '" + object.name + "' is used in Target Currency of the unit/currency conversion in column '" + element.name + "'", undefined, isDelete, false);    
    						}else if(feature._owner.$$containingFeature._name === "exchangeRateType"){
    							var element = feature._owner.$getContainer().$getContainer(); 
    							this.addToImpactAnalysis(impactAnalysis, element, "Column '" + object.name + "' is used in Exchange Type of the unit/currency conversion in column '" + element.name + "'", undefined, isDelete, false);    
    						}else if(feature._owner.$$containingFeature._name === "referenceDate"){
    							var element = feature._owner.$getContainer().$getContainer(); 
    							this.addToImpactAnalysis(impactAnalysis, element, "Column '" + object.name + "' is used in Conversion Date of the unit/currency conversion in column '" + element.name + "'", undefined, isDelete, false);    
    						}else if(feature._name === "assignedElements"){
    							var paramter = feature._owner;    
    							this.addToImpactAnalysis(impactAnalysis, paramter, "Column '" + object.name + "' is assigned to Variable '" + paramter.name + "'", undefined, isDelete, false);
    						}else if(feature._name === "typeOfElement"){
    							var paramter = feature._owner;    
    							this.addToImpactAnalysis(impactAnalysis, paramter, "Column '" + object.name + "' is used in type Parameter/Variable '" + paramter.name + "'", undefined, isDelete, false);    
    						}else if(feature._name === "orderElement"){
    							var hierarchy = feature._owner.$getContainer();   
    							this.addToImpactAnalysis(impactAnalysis, paramter, "Column '" + object.name + "' is used as orderElement in Level in hierarchy '" + hierarchy.name + "'", undefined, isDelete, false);  
    						}else if(feature._owner.$$containingFeature._name === "levels"){
    							var hierarchy = feature._owner.$getContainer();   
    							this.addToImpactAnalysis(impactAnalysis, paramter, "Column '" + object.name + "' is used as Level in hierarchy '" + hierarchy.name + "'", undefined, isDelete, false);  
    						}else if(feature._name === "parent"){
    							var hierarchy = feature._owner.$getContainer();   
    							this.addToImpactAnalysis(impactAnalysis, paramter, "Column '" + object.name + "' is used as Parent node in hierarchy '" + hierarchy.name + "'", undefined, isDelete, false);  
    						}else if(feature._name === "element" && feature._owner.$$containingFeature._name === "parentDefinitions"){
    							var hierarchy = feature._owner.$getContainer();   
    							this.addToImpactAnalysis(impactAnalysis, paramter, "Column '" + object.name + "' is used as Child node in hierarchy '" + hierarchy.name + "'", undefined, isDelete, false);  
    						}else if(feature._name === "validFromElement"){
    							var hierarchy = feature._owner.$getContainer();   
    							this.addToImpactAnalysis(impactAnalysis, paramter, "Column '" + object.name + "' is used as Valid-from column in hierarchy '" + hierarchy.name + "'", undefined, isDelete, false);  
    						}else if(feature._name === "validToElement"){
    							var hierarchy = feature._owner.$getContainer();   
    							this.addToImpactAnalysis(impactAnalysis, paramter, "Column '" + object.name + "' is used as Valid-to column in hierarchy '" + hierarchy.name + "'", undefined, isDelete, false);  
    						}   
    					}
    				}
    			},

    			addToImpactAnalysis: function(impactAnalysis, obj, objectName, objPath, changetype, isHidden) {
    				//I066990: There will be cases when same object instance will ve used twice
    				/*if (impactAnalysis) {
                            for (var i = 0; i < impactAnalysis.length; i++) {
                                if (impactAnalysis[i].object === obj) {
                                    return;
                                }
                            }
                        }*/
    				impactAnalysis.push({
    					object: obj,
    					name: objectName,
    					path: objPath,
    					changeType: changetype,
    					hidden: isHidden
    				});
    			},

    			computeObjectPath: function(object, isJoinElement, position, leftElement) {
    				var path;
    				if (object instanceof viewModel.Element) {
    					path = "columnView.viewNodes[\"" + object.$getContainer().name + "\"].elements[\"" + object.name + "\"]";
    				} else if (object instanceof viewModel.Input) {
    					var viewNode = object.$getContainer();
    					path = "columnView.viewNodes[\"" + viewNode.name + "\"].inputs[" + this.getIndexOfArray(object, viewNode.inputs) + "]";
    				} else if (object instanceof viewModel.ViewNode) {
    					path = "columnView.viewNodes[\"" + object.name + "\"]";
    				} else if (object instanceof viewModel.Mapping) {
    					var viewNode = object.$getContainer().$getContainer();
    					var input = object.$getContainer();
    					path = "columnView.viewNodes[\"" + viewNode.name + "\"].inputs[" + this.getIndexOfArray(input, viewNode.inputs) + "].mappings[" + this.getIndexOfArray(object, input.mappings) + "]";
    				} else if (object instanceof viewModel.Join && isJoinElement === undefined) {
    					var viewNode = object.$getContainer();
    					path = "columnView.viewNodes[\"" + viewNode.name + "\"].joins[" + this.getIndexOfArray(object, viewNode.joins) + "]";
    				}else if (object instanceof viewModel.Join && isJoinElement) {
    					var viewNode = object.$getContainer();
    					if(leftElement){
    						path = "columnView.viewNodes[\"" + viewNode.name + "\"].joins[0].leftElements[" + "\"" + position + "\"" + "]";
    					}else{
    						path = "columnView.viewNodes[\"" + viewNode.name + "\"].joins[0].rightElements[" + "\"" + position + "\"" + "]";   
    					}    
    				} else if (object instanceof viewModel.Entity) {
    					path = "columnView.viewNodes[\"" + object.$getContainer().name + "\"].elements[\"" + object.name + "\"]";
    				} 
    				return path;
    			}
    	};

        return {
            DeleteService: DeleteService,
            RenameService : RenameService
        };
    });
