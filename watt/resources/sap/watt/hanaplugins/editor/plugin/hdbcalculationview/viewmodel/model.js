/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define(["../base/modelbase", "../base/FullQualifiedName", "../sharedmodel/sharedmodel"], function(modelbase, FullQualifiedName, sharedmodel) {
                "use strict";
 
                var AbstractModelClass = modelbase.AbstractModelClass;
                var ModelCollection = modelbase.ModelCollection;
                var ModelException = modelbase.ModelException;
                var ObjectAlreadyExistsException = modelbase.ObjectAlreadyExistsException;
                var AttributeMissingException = modelbase.AttributeMissingException;
                var InvalidAttributeException = modelbase.InvalidAttributeException;
 
                /**
                * @class
                * @property {string}               severityType                -  Use enum SeverityType @see {@link SeverityType}
                * @property {string}               message                     -  Message in case of Severity (Error/Warning)
                * @property {ModelCollection}      referenceEntities           -  List of reference entities containing error/warning
                */
                var ViewModel = modelbase.AbstractModel.extend("ViewModel", {
 
                                $features: {
                                                containments: {
                                                                "columnView": {},
                                                                "_entities": {
                                                                                isMany: true
                                                                }
                                                },
                                                references: {
                                                                "referenceEntities": {
                                                                                isMany: true
                                                                }
                                                }
                                },
 
                                createColumnView: function(attributes, skippedNodes) {
                                                var columnView = new ColumnView(attributes, skippedNodes);
                                                this.columnView = columnView;
                                                return columnView;
                                },
 
                                createEntity: function(attributes, skippedNodes) {
                                                var entity = new Entity(attributes, skippedNodes);
                                                var key = entity.$getKeyAttributeValue();
                                                if (this._entities.get(key)) {
                                                                entity.$rename(this._entities.getUniqueKey(key));
                                                }
                                                this._entities.add(entity);
                                                return entity;
                                },
 
                                /**
                                * @parameter {object} attributes - {
                                *                                     name: "EntityName",
                                *                                     schemaName: "SchemaNameInCaseOfCatalogRTObject",
                                *                                     packageName: "PackageNameInCaseOfRepositoryDTObject",
                                *                                     type: "TypeOfEntity" // @see {@link EntityType}
                                *                                  }
                                */
						createOrMergeEntity: function(attributes, skippedNodes) {
                                                var entityObj = this._entities.get(attributes.id);
                                                if (entityObj) {
                                                                entityObj.$setAttributes(attributes, skippedNodes);
                                                } else {
                                                                entityObj = this.createEntity(attributes, skippedNodes);
                                                }
                                                return entityObj;
                                },
 
                                getNextViewNodeName: function(type) {
                                                var reg = new RegExp("_([0-9]+)$");
                                                var match, max = 0;
 
                                                this.columnView.viewNodes.foreach(function(viewNode) {
                                                                if (viewNode.type === type) {
                                                                                match = reg.exec(viewNode.name);
                                                                                if (match && match.length === 2) {
                                                                                                max = Math.max(max, parseInt(match[1], 10));
                                                                                }
                                                                }
                                                });
                                                var prefix = type === "JoinNode" ? "Join" : type;
                                                return prefix + "_" + (max + 1).toString();
                                }
                });
 
                /**
                * ENum for SeverityType
                * @enum {string}
                */
 
                var SeverityType = {
                                ERROR: "Error",
                                WARNING: "Warning"
                };
 
                /**
                * Enum for Mime Type values
                * @readonly
                * @enum {string}
                */
                var MimeType = {
                                TEXT_PLAIN: "text/plain",
                                TEXT_HTML: "text/html"
                };
 
                /**
                * @class CommentProperties - Stores non-translatable comment text in model elements
                * @property {string}  text     - Comment text
                * @property {string}  mimetype - Mime type; Use enum MimeType @see {@link MimeType}
                */
                var CommentProperties = modelbase.AbstractModelClass.extend("CommentProperties", {
 
                });
 
                /**
                * @class LocalizedText - Stores localized text with its language
                * @property {string}  text     - Text/description
                * @property {string}  language - Language
                */
                var LocalizedText = modelbase.AbstractModelClass.extend("CommentProperties", {
 
                });
 
                /**
                * @class EndUserTexts - Stores text/description, comment etc. for model elements
                * @property {LocalizedText}     localizedLabels - Collection of translatable texts
                * @property {CommentProperties} comment         - Comment for the model element
                * @property {string}            label           - Label/description - Not used yet; We are using label field directly in the model elements
                * @property {number}            labelMaxLength  - Maximum length for the label (used for the translation process)
                */
                var EndUserTexts = modelbase.AbstractModelClass.extend("EndUserTexts", {
                                $features: {
                                                containments: {
                                                                "localizedLabels": {
                                                                                isMany: true
                                                                },
                                                                "comment": {}
                                                }
                                },
 
                                createComment: function(attributes, skippedNodes) {
                                                this.comment = new CommentProperties(attributes, skippedNodes);
                                                return this.comment;
                                }
                });
 
                /**
                * Enum for Hierarchy Type values.
                * @readonly
                * @enum {string}
                */
                var HierarchyType = {
                                LEVELED: "LeveledHierarchy",
                                PARENT_CHILD: "ParentChildHierarchy"
                };
 
                /**
                * Enum for RootNode Visibility values.
                * @readonly
                * @enum {string}
                */
                var RootNodeVisibility = {
                                ADD_ROOT_NODE_IF_DEFINED: "ADD_ROOT_NODE_IF_DEFINED",
                                ADD_ROOT_NODE: "ADD_ROOT_NODE",
                                DO_NOT_ADD_ROOT_NODE: "DO_NOT_ADD_ROOT_NODE"
                };
 
                /**
                * Enum for Orphaned Nodes Handling values.
                * @readonly
                * @enum {string}
                */
                var OrphanedNodesHandling = {
                                ROOT_NODES: "ROOT_NODES",
                                ERROR: "ERROR",
                                IGNORE: "IGNORE",
                                STEPPARENT_NODE: "STEPPARENT_NODE"
                };
 
                /**
                * @class A representation of the model object 'UDF Parameter'. It can be filled with a constant or an element or a parameter
                * @property {string}    constantValue - Constant value
                * @property {Element}   element       - Element
                * @property {Parameter} parameter     - Input parameter
                *
                */
                var UDFParameter = AbstractModelClass.extend("UDFParameter", {
                                $features: {
                                                references: {
                                                                "element": {},
                                                                "parameter": {}
                                                }
                                }
                });
 
                /**
                * @class ParentDefinition
                * @property {UDFParameter} rootNode         - Root node (can be fixed or a parameter)
                * @property {Element}      element          - Child
                * @property {Element}      parent           - Parent
                * @property {string}       stepParentNodeID - Node ID of the step parent node; applicable when orphanedNodesHandling = STEPPARENT_NODE
                */
                var ParentDefinition = AbstractModelClass.extend("ParentDefinition", {
                                $features: {
                                                containments: {
                                                                "rootNode": {
                                                                                isMany: false
                                                                }
                                                },
                                                references: {
                                                                "element": {},
                                                                "parent": {}
                                                }
                                },
 
                                createRootNode: function(attributes, skippedNodes) {
                                                this.rootNode = new UDFParameter(attributes, skippedNodes);
                                                return this.rootNode;
                                }
                });
 
                /**
                * @class HierarchyTimeProperties - Time dependent properties of an Hierarchy
                * @property {Element}   validFromElement     - Valid from column of the underlying view
                * @property {Element}   validToElement       - Valid to column of the underlying view
                * @property {Parameter} fromParameter        - Specifies begin of the access interval. If set then the toParameter must be set as well and the pointInTimeParameter must not be set
                * @property {Parameter} toParameter          - Specifies end of the access interval. If set then the fromParameter must be set as well and the pointInTimeParameter must not be set
                * @property {Parameter} pointInTimeParameter - Specifies accessing the hierarchy at a certain point in time. If set then the neither the fromParameter nor the toParameter must be set
                */
                var HierarchyTimeProperties = AbstractModelClass.extend("HierarchyTimeProperties", {
                                $features: {
                                                references: {
                                                                "validFromElement": {},
                                                                "validToElement": {},
                                                                "fromParameter": {},
                                                                "toParameter": {},
                                                                "pointInTimeParameter": {}
                                                }
                                }
                });
 
                /**
                * @class EdgeAttribute - Specification of a hierarchy edge attribute
                * @property {Element}    element - Element
                */
                var EdgeAttribute = AbstractModelClass.extend("EdgeAttribute", {
                                $features: {
                                                references: {
                                                                "element": {}
                                                }
                                }
                });
 
                /**
                * Enum for Level Type values
                * @readonly
                * @enum {string}
                */
                var LevelType = {
                                regular: "MDLEVEL_TYPE_REGULAR",
                                all: "MDLEVEL_TYPE_ALL",
                                calculated: "MDLEVEL_TYPE_CALCULATED",
                                time: "MDLEVEL_TYPE_TIME",
                                timeYears: "MDLEVEL_TYPE_TIME_YEARS",
                                timeHalfYear: "MDLEVEL_TYPE_TIME_HALF_YEAR",
                                timeQuarters: "MDLEVEL_TYPE_TIME_QUARTERS",
                                timeMonths: "MDLEVEL_TYPE_TIME_MONTHS",
                                timeWeeks: "MDLEVEL_TYPE_TIME_WEEKS",
                                timeDays: "MDLEVEL_TYPE_TIME_DAYS",
                                timeHours: "MDLEVEL_TYPE_TIME_HOURS",
                                timeMinutes: "MDLEVEL_TYPE_TIME_MINUTES",
                                timeSeconds: "MDLEVEL_TYPE_TIME_SECONDS",
                                timeUndefined: "MDLEVEL_TYPE_TIME_UNDEFINED",
                                unknown: "MDLEVEL_TYPE_UNKNOWN"
                };
 
                /**
                * Enum for Sort Direction values
                * @readonly
                * @enum {string}
                */
                var SortDirection = {
                                ASC: "ASC",
                                DESC: "DESC"
                };
 
                /**
                * @class Level - Specification of Level hierarchy
                * @property {Element} element       - Element defining the level - can be from a shared element
                * @property {string}  levelType     - Semantic type of the level; Use enum LevelType @see {@link LevelType}
                * @property {Element} orderElement  - Element to use for sorting the level. If not filled the level is sorted by its elementName
                * @property {string}  sortDirection - Specifies the sort direction of the level - default is ASCending; Use enum SortDirection @see {@link SortDirection}
                */
                var Level = AbstractModelClass.extend("Level", {
                                $features: {
                                                references: {
                                                                "element": {},
                                                                "orderElement": {}
                                                }
                                }
                });
 
                /**
                * Enum for Node Style values
                * @readonly
                * @enum {string}
                */
                var NodeStyle = {
                                LEVELNAME: "LEVEL_NAME",
                                NAMEONLY: "NAME_ONLY",
                                NAMEPATH: "NAME_PATH",
                                LEVELNAMEENFORCED: "LEVEL_NAME_ENFORCED",
                                NAMEPATHENFORCED: "NAME_PATH_ENFORCED"
                };
 
                /**
                * @class Order
                * @property {Element} byElement - Element by which the results have to be ordered
                * @property {string}  direction - ASC or DESC
                */
                var Order = AbstractModelClass.extend("Order", {
                                $features: {
                                                references: {
                                                                "byElement": {}
                                                }
                                }
                });
 
                /**
                * @class InlineHierarchy
                * @property {string}                  name                  - Name
                * @property {string}                  type                  - Type of hierarchy; Use enum HierarchyType @see {@link HierarchyType}
                * @property {string}                  label                 - Description of the hierarchy
                * @property {boolean}                 rootNodeVisibility    - Specifies the handling of the root node; Use enum RootNodeVisibility @see {@link RootNodeVisibility}
                * @property {boolean}                 aggregateAllNodes     - Indicates that data is posted on aggregate nodes
                * @property {string}                  defaultMember         - Specifies, which node should be the default member in MDX; If nothing is specified, the root node is used
                * @property {boolean}                 multipleParents       - Indicates that multiple parents might occur in the hierarchy
                * @property {string}                  orphanedNodesHandling - Orphane  nodes handling; Use enum OrphanedNodesHandling @see {@link OrphanedNodesHandling}
                * @property {boolean}                 timeDependent         - Indicates time dependent hierarchy
                * @property {ParentDefinition}        parentDefinitions     - Parent-child: Parent definition
                * @property {Order}                   siblingOrders         - Parent-child: Sibling Orders
                * @property {HierarchyTimeProperties} timeProperties        - Parent-child: Time properties in case of time-dependent hierarchy
                * @property {EdgeAttribute}           edgeAttributes        - Parent-child: Edge attribute
                * @property {Level}                   levels                - Level: Level hierarchy
                * @property {string}                  nodeStyle             - Level: Node style; Use enum NodeStyle @see {@link NodeStyle}
                * @property {string}                  stepParentNodeID      - Level: Contains node ID of the step parent node when orphanedNodesHandling = STEPPARENT_NODE
                * @property {EndUserTexts}            endUserTexts          - End User Texts including label, comment etc.
                */
                var InlineHierarchy = AbstractModelClass.extend("InlineHierarchy", {
                                $features: {
                                                keyAttribute: "name",
                                                containments: {
                                                                "parentDefinitions": {
                                                                                isMany: true
                                                                },
                                                                "siblingOrders": {
                                                                                isMany: true
                                                                },
                                                                "timeProperties": {},
                                                                "edgeAttributes": {
                                                                                isMany: true
                                                                },
                                                                "levels": {
                                                                                isMany: true
                                                                },
                                                                "endUserTexts": {}
                                                }
                                },
 
                                createTimeProperties: function(attributes, skippedNodes) {
                                                this.timeProperties = new HierarchyTimeProperties(attributes, skippedNodes);
                                                return this.timeProperties;
                                },
 
                                createLevel: function(attributes, skippedNodes, nextLevelId) {
                                                var level = new Level(attributes, skippedNodes);
                                                if (typeof nextLevelId !== "undefined") {
                                                                this.levels.add(level, nextLevelId);
                                                } else {
                                                                this.levels.add(level);
                                                }
                                                return level;
                                },
 
                                createParentDefinition: function(attributes, skippedNodes) {
                                                var parentDef = new ParentDefinition(attributes, skippedNodes);
                                                this.parentDefinitions.add(parentDef);
                                                return parentDef;
                                },
 
                                createEdgeAttribute: function(attributes, skippedNodes, nextEdgeAttributeId) {
                                                var edgeAttr = new EdgeAttribute(attributes);
                                                if (typeof nextEdgeAttributeId !== "undefined") {
                                                                this.edgeAttributes.add(edgeAttr, nextEdgeAttributeId);
                                                } else {
                                                                this.edgeAttributes.add(edgeAttr);
                                                }
                                                return edgeAttr;
                                },
 
                                createSiblingOrder: function(attributes, skippedNodes) {
                                                var siblingOrder = new Order(attributes, skippedNodes);
                                                this.siblingOrders.add(siblingOrder);
                                                return siblingOrder;
                                },
 
                                createEndUserTexts: function(attributes, skippedNodes) {
                                                this.endUserTexts = new EndUserTexts(attributes, skippedNodes);
                                                return this.endUserTexts;
                                }
                });
 
                /**
                * @class - Column View design time model
                * @property {string}            name               - Name       //Currently name will be same as id
                * @property {string}            id                 - id of Column View - HDI Specific (namespace::name)
                * @property {string}            label              - Description of the Column View
                * @property {Origin}            origin             - Origin of the resource, if exported from external system
                * @property {string}            defaultMember      - Default Member
                * @property {Number}            schemaVersion      - schemaVersion   //In the DevX it is 3.0
                * @property {boolean}           clientDependent    - Client dependent (false => Cross client; true => $$client$$ or fixedClient)
                * @property {string}            fixedClient        - Fixed client (applicable only when clientDependent = true)
                * @property {string}            applyPrivilegeType - Apply privilege type; Use enum PrivilegeType @see {@link PrivilegeType}
                * @property {ExecutionHints}    executionHints     - Special execution hints/directives for the engine
                * @property {string}            dataCategory       - Hints to the engine to interpret individual entities; Use enum DataCategory @see {@link DataCategory}
                * @property {string}            dimensionType      - Only relevant for dataCategory = DIMENSION; Use enum DimensionType @see {@link DimensionType}
                * @property {string}            defaultSchema      - The default schema for the Information model.
                *                                                                                                                                                  This schema will be mapped from authoring to physical schema and vice versa
                *                                                                                                                                      It is used as follows
                *                                                                                                                                        - As schema for the unqualified table access within the SQL script of script based calculation views
                *                                                                                                                                        - As schema for the currency conversion in analytic views and graphical calculation views
                * @property {boolean}           historyEnabled     - Represents history enabled View
                * @property {boolean}           deprecated         - If set to true the model should (must) not be used anymore.
                * @property {boolean}           translationRelevant    - Flag to indicate that the texts of the view will not be translated.
                                                            If set to true no texts will be written into the repository text tables. So the texts will always be read from the XML.
                * @property {Parameter}         historyParameter   - The parameter whose input should be used in the AS OF part of the select clause of the view.
                *                                                                                                                                      The means the data returned by the select is the data that as been in the
                *                                                                                                                                      table at the time of the passed timestamp
                * @property {FQName}            pruningTable       - Table containing information for pruning in union nodes
                                                          The FQN can denote a CDS entity or a catalog table. In case of a catalog table no existance check is done
     * @property {boolean}           readPruningInformation     - Set as true if pruningTable should be read                                                      
                                                          (the table might only exist in the productive system, but not in the dev system).
                * @property {ModelCollection}   parameters         - List of parameters of type Parameter
                * @property {ModelCollection}   inlineHierarchies  - List of hierarchies of Type InlineHierarchy
                * @property {EndUserTexts}      endUserTexts       - End User Texts including label, comment etc.
                */
                var ColumnView = AbstractModelClass.extend("ColumnView", {
 
                                $features: {
                                                //keyAttribute: "name",
                                                keyAttribute: "id",
                                                containments: {
                                                                "parameters": {
                                                                                isMany: true
                                                                },
                                                                "viewNodes": {
                                                                                isMany: true
                                                                },
                                                                "origin": {},
                                                                "executionHints": {},
                                                                "inlineHierarchies": {
                                                                                isMany: true
                                                                },
                                                                "endUserTexts": {}
                                                },
                                                references: {
                                                                "_defaultNode": {},
                                                                "_layouts": {
                                                                                isMany: true
                                                                },
                                                                "historyParameter": {}
                                                }
                                },
 
                                $init: function() {
                                                if (this.dataCategory === undefined || this.dataCategory === null) throw new AttributeMissingException(this, "dataCategory");
                                                if (!this.id) {
													throw new AttributeMissingException(this, "id");
												}
                                                this.id = this.id;
                                                if(!this.name){
													this.name = this.getName();
												}
                                },
 
                                createViewNode: function(attributes, skippedNodes, isDefaultNode, nextNodeName) {
                                                var viewNode = this.viewNodes.get(attributes.name);
                                                if (viewNode) {
                                                                throw new ObjectAlreadyExistsException(this, attributes.name, this.name);
                                                }
                                                return this.createOrMergeViewNode(attributes, skippedNodes, isDefaultNode, nextNodeName);
                                },
 
                                createOrMergeViewNode: function(attributes, skippedNodes, isDefaultNode, nextNodeName) {
                                                var viewNode = this.viewNodes.get(attributes.name);
                                                if (viewNode) {
                                                                viewNode.$setAttributes(attributes, skippedNodes);
                                                } else {
                                                                viewNode = new ViewNode(attributes, skippedNodes);
                                                                this.viewNodes.add(viewNode, nextNodeName);
                                                }
                                                if (isDefaultNode) {
                                                                this.setDefaultNode(viewNode);
                                                }
                                                return viewNode;
                                },
 
                                createParameter: function(attributes, skippedNodes, nextParameterName) {
                                                var parameter = new Parameter(attributes, skippedNodes);
                                                this.parameters.add(parameter, nextParameterName);
                                                return parameter;
                                },
 
                                createOrMergeParameter: function(attributes, skippedNodes, nextParameterName) {
                                                var parameter = this.parameters.get(attributes.name);
                                                if (parameter) {
                                                                parameter.$setAttributes(attributes, skippedNodes);
                                                } else {
                                                                parameter = new Parameter(attributes, skippedNodes);
                                                                this.parameters.add(parameter, nextParameterName);
                                                }
                                                return parameter;
                                },
 
                                getDefaultNode: function() {
                                                return this._defaultNode;
                                },
								
								getName: function(){
									if(!this.name){
										if(id && id.indexOf('::') > -1){				
											var id_parts = id.split('::');					
											if (id_parts && id_parts.length === 2 && id_parts[1]) {
												this.name = id_parts[1];
											}
										}else if(id){
											this.name = id;
										}
									}	
									return this.name;
								},
 
                                setDefaultNode: function(viewNode) {
                                                if (viewNode) {
                                                                if (this._defaultNode) throw new ModelException("default node already set");
                                                                viewNode._isDefaultNode = true;
                                                }
                                                this._defaultNode = viewNode;
                                },
 
                                getLayouts: function(viewNode) {
                                                return this._layouts;
                                },
 
                                getParameterNameForCopy: function(previousName) {
                                                return this.parameters.getUniqueKey(previousName, "_COPY");
                                },
 
                                createOrigin: function(attributes, skippedNodes) {
                                                var lOrigin = new Origin(attributes, skippedNodes);
                                                this.origin = lOrigin;
                                                return this.origin;
                                },
 
                                createExecutionHints: function(attributes, skippedNodes) {
                                                var xecutionHints = new ExecutionHints(attributes, skippedNodes);
                                                this.executionHints = xecutionHints;
                                                return xecutionHints;
                                },
 
                                propagateDataTypeToDefaultNode: function(columnView) {
                                                var defaultNode = columnView.getDefaultNode();
                                                var that = this;
                                                defaultNode.elements.foreach(function(element) {
                                                                // var isAColumn = true;
                                                                //Only For columns and not for calculated columns
                                                                // if (element.calculationDefinition.formula === undefined && element.calculationDefinition.formula === null) {
                                                                //Also need to restrict for counter and restrtricted measure
                                                                /*if (element.measureType !== null && element.measureType !== undefined) {
                        if (element.measureType !== viewmodel.MeasureType.RESTRICTION && element.measureType !== viewmodel.MeasureType.COUNTER) {
                            isAColumn = false;
                        }
                    }*/
                                                                // }
                                                                var inlineType = that.$getInlineTypeFromSource(element);
                                                                if (inlineType) {
                                                                                var simpleTypeAttributes = {
                                                                                                primitiveType: inlineType.primitiveType,
                                                                                                length: inlineType.length
                                                                                                //scale: "6",
                                                                                };
                                                                                element.createOrMergeSimpleType(simpleTypeAttributes);
                                                                }
                                                });
                                },
 
                                $getInlineTypeFromSource: function(element) {
                                                if (element.$getContainer() !== null && element.$getContainer() instanceof Entity) {
                                                                return element.inlineType;
                                                } else if (element.$getContainer() !== null && element.$getContainer() instanceof ViewNode) {
                                                                var viewNode = element.$getContainer();
                                                                var elementInput;
                                                                var that = this;
                                                                for (var i = 0; i < viewNode.inputs.count(); i++) {
                                                                                // var mapping = viewNode.inputs.getAt(i).mappings.get(element.name);
                                                                                var findElementMapping = that.$findElementMapping.bind(viewNode.inputs.getAt(i), element.name);
                                                                                var mapping = findElementMapping();
                                                                                if (mapping) {
                                                                                                elementInput = viewNode.inputs.getAt(i);
                                                                                                break;
                                                                                }
                                                                }
                                                                if (elementInput) {
                                                                                var elementInputSource = elementInput.getSource();
                                                                                if (elementInputSource) {
                                                                                                var sourceElement = elementInputSource.elements.get(element.name);
                                                                                                if (sourceElement) {
                                                                                                                /*var inlineType = that.$getInlineTypeFromSource(sourceElement);
                            if(inlineType){
                                var simpleTypeAttributes = {
                                    primitiveType: inlineType.primitiveType,
                                    length: inlineType.length
                                    //scale: "6",
                                };
                                sourceElement.createOrMergeSimpleType(simpleTypeAttributes);
                            }
                            return inlineType;*/
                                                                                                                return that.$getInlineTypeFromSource(sourceElement);
                                                                                                }
                                                                                }
                                                                }
 
                                                }
                                },
 
                                $findElementMapping: function(elementName) {
                                                // return this.mappings.get(element.name);
                                                for (var i = 0; i < this.mappings.count(); i++) {
                                                                var mapping = this.mappings.getAt(i);
                                                                if (mapping.targetElement.name === elementName) {
                                                                                return mapping;
                                                                }
                                                }
                                },
 
                                createInlineHierarchy: function(attributes, skippedNodes, nextHierarchyName) {
                                                var hierarchy = new InlineHierarchy(attributes, skippedNodes);
                                                if (nextHierarchyName) {
                                                                this.inlineHierarchies.add(hierarchy.name, hierarchy, nextHierarchyName);
                                                } else {
                                                                this.inlineHierarchies.add(hierarchy);
                                                }
                                                return hierarchy;
                                },
                               
                                // Required because if private Hierarchy is used in parameter, it will be added while parsing parameter as proxy, then while parsing Hierarchy it will get more properties and become non-proxy
                                createOrMergeInlineHierarchy: function(attributes, skippedNodes, nextElementName) {
                                                var hierarchy = this.inlineHierarchies.get(attributes.name);
                                                if (hierarchy) {
                                                                hierarchy.$setAttributes(attributes, skippedNodes);
                                                } else {
                                                                hierarchy = new InlineHierarchy(attributes, skippedNodes);
                                                                this.inlineHierarchies.add(hierarchy, nextElementName);
                                                }
                                                return hierarchy;
                                },
 
                                createEndUserTexts: function(attributes, skippedNodes) {
                                                this.endUserTexts = new EndUserTexts(attributes, skippedNodes);
                                                return this.endUserTexts;
                                }
                });
 
                /**
                * Enum for Data Category values.
                * @readonly
                * @enum {string}
                */
                var DataCategory = {
                                DEFAULT: "DEFAULT",
                                DIMENSION: "DIMENSION",
                                CUBE: "CUBE",
                                FACT: "FACT",
                                TEXT: "TEXT",
                                HIERARCHY: "HIERARCHY"
                };
 
                /**
                * Enum for Dimension Type values.
                * @readonly
                * @enum {string}
                */
                var DimensionType = {
                                UNKNOWN: "UNKNOWN",
                                TIME: "TIME",
                                MEASURE: "MEASURE",
                                STANDARD: "STANDARD",
                                GEOGRAPHY: "GEOGRAPHY",
                                CUSTOMER: "CUSTOMER",
                                PRODUCT: "PRODUCT",
                                ORGANIZATION: "ORGANIZATION",
                                EMPLOYEE: "EMPLOYEE",
                                CURRENCY: "CURRENCY",
                                CHANNEL: "CHANNEL"
                };
 
                /**
                * @class - Execution Hints
                * @property {NameValuePair} genericHints                - Generic properties as name-value pair
                * @property {string}        engine                      - Transient: represents the View type. Use enum ColumnEngine @see {@link ColumnEngine}
                * @property {string}        preferredEngine             - Push down execution (as much as possible) to the specified engine. Use enum ColumnEngine @see {@link ColumnEngine}
                * @property {Element}       countStarElement            - Defines the element (column) used to produce the count(*) result
                * @property {boolean}       allowRelationalOptimization - Allows engine to do critical relational optimizations
                * @property {boolean}       alwaysAggregateResult       - On quering measures are always aggregated even if not specified in the SQL; Applicable when top node is of type aggregation
                * @property {boolean}       runWithInvokerPrivileges    - Script executed with invoker privileges (true) or definer/owner privileges (false)
                * @property {boolean}       generateConcatAttributes    - Generate concat attributes for multi-column join to improve join performance
                * @property {string}        cacheInvalidationPeriod     - Specifies the Lifetime of the Cache. Use enum CacheInvalidationPeriod @see {@link CacheInvalidationPeriod}
                */
                var ExecutionHints = AbstractModelClass.extend("ExecutionHints", {
                                $features: {
                                                containments: {
                                                                "genericHints": {
                                                                                isMany: true
                                                                }
                                                },
                                                references: {
                                                                "countStarElement": {}
                                                }
                                },
 
                                createNameValuePair: function(attributes, skippedNodes) {
                                                var nmValPair = new NameValuePair(attributes, skippedNodes);
                                                this.genericHints.add(nmValPair);
                                                return nmValPair;
                                }
                });
 
                /**
                 * Enum for Cache Invalidation Period values.
                * @readonly
                * @enum {string}
                */
                var CacheInvalidationPeriod = {
                                NONE: "NONE",
                                HOURLY: "HOURLY",
                                DAILY: "DAILY"
                };
 
                /**
                 * Enum for Column Engine values.
                * @readonly
                * @enum {string}
                */
                var ColumnEngine = {
                                CALC: "CALC",
                                OLAP: "OLAP",
                                JOIN: "JOIN",
                                SQL: "SQL"
                };
 
                /**
                * @class NameValuePair
                * @property {string} name  - Name (key)
                * @property {string} value - Value
                */
                var NameValuePair = AbstractModelClass.extend("NameValuePair", {
                                $features: {
                                                keyAttribute: "name"
                                }
                });
 
                /**
                 * Enum for Privilege Type values.
                * @readonly
                * @enum {string}
                */
                var PrivilegeType = {
                                NONE: "NONE",
                                ANALYTIC_PRIVILEGE: "ANALYTIC_PRIVILEGE",
                                SQL_ANALYTIC_PRIVILEGE: "SQL_ANALYTIC_PRIVILEGE"
                };
 
                /**
                * @class Origin of the resource, if exported from external system
                * @property {string}   entityName  - Name of entity
                * @property {string}   entityType  - Type of entity
                * @property {string}   system      - System name
                */
                var Origin = AbstractModelClass.extend("Origin", {
                                /*$init: function() {
           
        }*/
                });
 
                /**
                 * Enum for Value Filter Operator values.
                * @readonly
                * @enum {string}
                */
                var ValueFilterOperator = {
                                Equal: "EQ",
                                LessThan: "LT",
                                LessEqual: "LE",
                                GreaterThan: "GT",
                                GreaterEqual: "GE",
                                Between: "BT",
                                In: "IN",
                                ContainsPattern: "CP",
                                IsNull: "NL"
                };
 
                /**
                * @class DefaultRange - Range definition for default values
                * @property {string}    lowValue       - Low value
                * @property {string}    highValue      - High value
                * @property {boolean}   lowExpression  - true if the low value is an expression, false if it is a constant
                * @property {boolean}   highExpression - true if the high value is an expression, false if it is a constant
                * @property {string}    operator       - Operator: Use Enum ValueFilterOperator @see {@link ValueFilterOperator}
                * @property {string}    including      - true if including high and low values; false if excluding high and low values
                * @property {string}   expressionLanguage  - expression language. Use enum ExpressionLanguage @see {@link ExpressionLanguage}
                */
                var DefaultRange = AbstractModelClass.extend("DefaultRange", {
                                /*$init: function() {
           
        }*/
                });
 
                /**
                * @class Input Parameter and Variables
                * @property {string}            name                    - Name of parameter
                * @property {SimpleType}        inlineType              - Inline Type                
                * @property {boolean}           multipleSelections      - Parameter can take multiple values
                * @property {boolean}           mandatory               - Mandatory parameter
                * @property {Element}           typeOfElement           - Reference column for Parameter of type Column (private or shared)
                * @property {InlineHierarchy}   hierarchy               - Specifying a hierarchy; turns the variable / the parameter into a hierarchy variable/parameter;
                *                                                         Note: hierarchy should be from the same view that contains typeOfElement
                * @property {Element}           externalTypeOfElement   - External reference column for Parameter of type Column
                * @property {Entity}            externalTypeOfEntity    - Transient: Container Entity of the externalTypeOfElement
                * @property {ModelCollection}   assignedElements        - Variable assigned to elements
                * @property {string}            selectionType           - Selection type. Use enum SelectionType @see {@link SelectionType}
                * @property {DerivationRule}    derivationRule          - Derivation rule (Derived Parameter)
                * @property {boolean}           isVariable              - Object is a Variable (transient property)
                * @property {string}            parameterType           - Type of Parameter. Use enum ParameterType (transient property)
                * @property {ModelCollection}   parameterMappings       - Parameter Mappings
                * @property {ModelCollection}   defaultRanges           - Default Ranges
                * @property {EndUserTexts}      endUserTexts            - End User Texts including label, comment etc.
                */
                var Parameter = AbstractModelClass.extend("Parameter", {
 
                                $features: {
                                                keyAttribute: "name",
                                                containments: {
                                                                "inlineType": {},
                                                                "defaultExpression": {},
                                                                "derivationRule": {},
                                                                "parameterMappings": {
                                                                                isMany: true
                                                                },
                                                                "defaultRanges": {
                                                                                isMany: true
                                                                },
                                                                "endUserTexts": {}
                                                },
                                                references: {
                                                                "typeOfElement": {},
                                                                "hierarchy": {},
                                                                "externalTypeOfElement": {},
                                                                "externalTypeOfEntity": {}, // Transient: just to help the UI
                                                                "assignedElements": {
                                                                                isMany: true
                                                                }
                                                }
                                },
 
                                $init: function() {},
 
                                createOrMergeSimpleType: function(attributes, skippedNodes) {
                                                var simpleType = this.inlineType;
                                                if (simpleType) {
                                                                simpleType.$setAttributes(attributes, skippedNodes);
                                                } else {
                                                                simpleType = new SimpleType(attributes, skippedNodes);
                                                                this.inlineType = simpleType;
                                                }
                                                return simpleType;
                                },
 
                                createDefaultExpression: function(attributes, skippedNodes) {
                                                this.defaultExpression = new Expression(attributes);
                                                return this.defaultExpression;
                                },
 
                                createParameterMapping: function(attributes, skippedNodes) {
                                                var parameterMapping = new ParameterMapping(attributes, skippedNodes);
                                                this.parameterMappings.add(parameterMapping);
                                                return parameterMapping;
                                },
 
                                createDerivationRule: function(attributes, skippedNodes) {
                                                this.derivationRule = new DerivationRule(attributes);
                                                return this.derivationRule;
                                },
 
                                createDefaultRange: function(attributes, skippedNodes) {
                                                var defRange = new DefaultRange(attributes, skippedNodes);
                                                this.defaultRanges.add(defRange);
                                                return defRange;
                                },
 
                                createEndUserTexts: function(attributes, skippedNodes) {
                                                this.endUserTexts = new EndUserTexts(attributes, skippedNodes);
                                                return this.endUserTexts;
                                }
                });
 
                /*Object.defineProperty(Parameter, "externalTypeOfElement1", {
        set: function(element) {
            console.log("hello");
            if (element) {
                this.externalTypeOfElementInternal = element;
                this.externalTypeOfEntityInternal = element.$getContainer();
            }
        },
        get: function() {
            console.log("hello");
            return this.externalTypeOfElementInternal;
        }
    });
 
    Object.defineProperty(Parameter, "externalTypeOfEntity1", {
        get: function() {
            console.log("hello");
            if (this.externalTypeOfElementInternal) {
                return this.externalTypeOfElementInternal.$getContainer();
            } else {
                return this.externalTypeOfEntityInternal;
            }
        },
        set: function(entity) {
            console.log("hello");
            if (this.externalTypeOfEntityInternal) {
                if (this.externalTypeOfEntityInternal !== entity) {
                    this.externalTypeOfEntityInternal = entity;
                    this.externalTypeOfElementInternal = null;
                }
            } else {
                this.externalTypeOfEntityInternal = entity;
            }
        },
    });*/
 
                /**
                * @class ParameterMapping
                * @property {string}    parameterNameOtherView - Parameter reference in the external view
                * @property {Parameter} parameter              - Parameter name in the view (Optional if value is provided)
                * @property {string}    value                  - Constant value (Optional if parameterName is provided,  applicable only for Constant Mapping)
                * @property {string}    type                   - Parameter Mapping Type. Use enum ParameterMappingType @see {@link ParameterMappingType}
                */
                var ParameterMapping = AbstractModelClass.extend("ParameterMapping", {
                                $features: {
                                                keyAttribute: "parameterNameOtherView",
                                                references: {
                                                                // "parameterNameOtherView" : {},
                                                                "parameter": {}
                                                }
                                }
                });
 
                /**
                 * Enum for Selection Type values.
                * @readonly
                * @enum {string}
                */
                var ParameterMappingType = {
                                // Name same as in SelectionType enumeration in viewmodel.parameter XSD
                                // Value same as in legacy bimodel.variable XSD for ease of conversion
                                CONSTANT: "ConstantVariableMapping",
                                PARAMETER_MAPPING: "VariableMapping"
                };
 
                /**
                * @class DerivationRule
                * @property {Entity}              lookupEntity      - Lookup Entity
                * @property {string}              resultElementName - Result Element name
                * @property {ModelCollection}     elementFilters    - Collection of objects of type ElementFilter
                * @property {Entity}              scriptObject      - Reference to Procedure/Scalar Function
                * @property {Entity}              inputEnabled      - Applicable for Procedure/Scalar Function
                * @property {ParameterMapping}    parameterMappings - Parameter mapping for the lookup entity
                */
                var DerivationRule = AbstractModelClass.extend("DerivationRule", {
                                $features: {
                                                containments: {
                                                                "elementFilters": {
                                                                                isMany: true
                                                                },
                                                                "parameterMappings": {
                                                                                isMany: true
                                                                }
                                                },
                                                references: {
                                                                "lookupEntity": {},
                                                                "scriptObject": {}
                                                }
                                },
 
                                createElementFilter: function(attributes, skippedNodes) {
                                                var elementFilter = new ElementFilter(attributes, skippedNodes);
                                                this.elementFilters.add(elementFilter);
                                                return elementFilter;
                                },
 
                                createParameterMapping: function(attributes, skippedNodes) {
                                                var parameterMapping = new ParameterMapping(attributes, skippedNodes);
                                                this.parameterMappings.add(parameterMapping);
                                                return parameterMapping;
                                }
                });
 
                /**
                * @class ElementFilter
                * @property {ModelCollection} valueFilters - Collection of objects of type sharedmodel.ValueFilter
                * @property {string}          elementName  - Element name
                * @property {boolean}         forced       - @Deprecated not shown in UI
                */
                var ElementFilter = AbstractModelClass.extend("ElementFilter", {
                                $features: {
                                                keyAttribute: "elementName",
                                                containments: {
                                                                "valueFilters": {
                                                                                isMany: true
                                                                }
                                                }
                                },
 
                                createValueFilter: function(attributes, skippedNodes) {
                                                var valueFilter = new sharedmodel.ValueFilter(attributes, skippedNodes);
                                                this.valueFilters.add(valueFilter);
                                                return valueFilter;
                                }
                });
 
                /**
                 * Enum for Selection Type values.
                * @readonly
                * @enum {string}
                */
                var SelectionType = {
                                // Name same as in SelectionType enumeration in viewmodel.parameter XSD
                                // Value same as in legacy bimodel.variable XSD for ease of conversion
                                SINGLE: "SingleValue",
                                INTERVAL: "Interval",
                                RANGE: "Range"
                };
 
                /**
                * @class Simple Type
                * @property {string}       primitiveType   - Primitive data type
                * @property {short}        length          - Length
                * @property {short}        precision       - Precision
                * @property {short}        scale           - Scale
                * @property {string}       semanticType    - Semantic type. Use enum SemanticType @see {@link SemanticType}
                * @property {ValueRange}   valueRanges     - Range of values
                * @property {boolean}      isDerived       - If set to true indicates that type is not an instrinsic part of model but derived
                */
                var SimpleType = AbstractModelClass.extend("SimpleType", {
 
                                $features: {
                                                containments: {
                                                                "valueRanges": {
                                                                                isMany: true
                                                                }
                                                }
                                },
                                $init: function() {
                                                // primitive type may be added later, after creation of the element
                                                // if (!this.primitiveType) throw new AttributeMissingException(this, "primitiveType");
                                                // Default the isDerived to true if it is not set yet;
                                                // For CalculatedViewAttribute isDerived will always be set as false while creating CalculatedViewAttribute using constructor
                                                if (this.isDerived === undefined) {
                                                                this.isDerived = true;
                                                }
                                },
 
                                createValueRange: function(attributes, skippedNodes) {
                                                var valueRange = new ValueRange(attributes, skippedNodes);
                                                this.valueRanges.add(valueRange);
                                                return valueRange;
                                },
 
                                getDisplayName: function() {
                                                var displayName = this.primitiveType;
                                                if (typeof this.length !== "undefined") {
                                                                if (typeof this.scale !== "undefined") {
                                                                                displayName += "(" + this.length + "," + this.scale + ")";
                                                                } else {
                                                                                displayName += "(" + this.length + ")";
                                                                }
                                                }
                                                return displayName;
                                }
 
                });
 
                /**
                 * Enum for Parameter Type values.
                * @readonly
                * @enum {string}
                */
                var ParameterType = {
                                DIRECT: "direct",
                                COLUMN: "column",
                                DERIVED_FROM_TABLE: "derivedFromTable",
                                DERIVED_FROM_PROCEDURE: "derivedFromProcedure",
                                STATIC_LIST: "staticList"
                };
 
                var PrimitiveType = {
                                VARCHAR: "VARCHAR",
                                TINYINT: "TINYINT",
                                SMALLINT: "SMALLINT",
                                INTEGER: "INTEGER",
                                BIGINT: "BIGINT",
                                DECIMAL: "DECIMAL",
                                REAL: "REAL",
                                FLOAT: "FLOAT",
                                DOUBLE: "DOUBLE",
                                SMALLDECIMAL: "SMALLDECIMAL",
                                NUMERIC: "NUMERIC"
                                /*BIGINT_VALUE:
                DECIMAL_VALUE:
                DOUBLE_VALUE:
                FLOAT_VALUE:
                NUMERIC_VALUE:
                REAL_VALUE:
                SMALLDECIMAL_VALUE:
                SMALLINT_VALUE:
                TINYINT_VALUE:
                INTEGER_VALUE:*/
                };
 
                /**
                 * Enum for ElementType values. This is transient
                * @readonly
                * @enum {string}
                */
                var MeasureType = {
                                RESTRICTION: "restriction",
                                COUNTER: "counter",
                                CALCULATED_MEASURE: "calculatedMeasure"
                };
               
                //Used for Variable ValueDomain Type
    var ValueType = {
        EMPTY: "empty",
                                CURRENCY_CODE: "Currency",
                                UNIT_OF_MEASURE: "UnitOfMeasure",
                                DATE: "Date",
                                ATTRIBUTE_VALUE: "AttributeValue",
                                STATIC_LIST: "StaticList"
    };
   
                /**
                 * Enum for Semantic Type values.
                * @readonly
                * @enum {string}
                */
                var SemanticType = {
                                EMPTY: "empty",
                                AMOUNT: "amount",
                                QUANTITY: "quantity",
                                //                            CURRENCY_CODE: "Currency",
                                CURRENCY_CODE: "currencyCode",
                                //                            UNIT_OF_MEASURE: "UnitOfMeasure",
                                UNIT_OF_MEASURE: "unitOfMeasure",
                                TIME: "time",
                                //                            DATE: "Date",
                                DATE: "date",
                                /*DATE_BUSINESS_DATE_FROM: "dateBusinessDateFrom",
                                DATE_BUSINESS_DATE_TO: "dateBusinessDateTo",
                                GEO_LOCATION_LONGITUDE: "geoLocationLongitude",
                                GEO_LOCATION_LATITUDE: "geoLocationLatitude",
                                GEO_LOCATION_CARTO_ID: "geoLocationCartoId",
                                GEO_LOCATION_NORMALIZED_NAME: "geoLocationNormalizedName",*/
                                DATE_BUSINESS_DATE_FROM: "date.businessDateFrom",
                                DATE_BUSINESS_DATE_TO: "date.businessDateTo",
                                GEO_LOCATION_LONGITUDE: "geoLocation.longitude",
                                GEO_LOCATION_LATITUDE: "geoLocation.latitude",
                                GEO_LOCATION_CARTO_ID: "geoLocation.cartoId",
                                GEO_LOCATION_NORMALIZED_NAME: "geoLocation.normalizedName",
                                CLIENT: "client",
                                LANGUAGE: "language",
                                DESCRIPTION: "description"
                };
                var _semanticTypesMap = [
        SemanticType.EMPTY, // 0
        SemanticType.AMOUNT, // 1
        SemanticType.QUANTITY, // 2
        SemanticType.CURRENCY_CODE, // 3
        SemanticType.UNIT_OF_MEASURE, // 4
        SemanticType.TIME, // 5
        SemanticType.DATE, // 6
        SemanticType.DATE_BUSINESS_DATE_FROM, // 7
        SemanticType.DATE_BUSINESS_DATE_TO, // 8
        SemanticType.GEO_LOCATION_LONGITUDE, // 9
        SemanticType.GEO_LOCATION_LATITUDE, // 10
        SemanticType.GEO_LOCATION_CARTO_ID, // 11
        SemanticType.GEO_LOCATION_NORMALIZED_NAME, // 12
        SemanticType.CLIENT, // 13
        SemanticType.LANGUAGE, // 14
        SemanticType.DESCRIPTION // 15;
    ];
                SemanticType.getSemanticType = function(semanticTypeNumeric) {
                                return _semanticTypesMap[semanticTypeNumeric];
                };
 
                /**
                * @class ValueRange
                * @property {string} value                 - Value
                * @property {String} label                 - Defaule description/label
                */
                var ValueRange = AbstractModelClass.extend("ValueRange", {
                                $features: {
                                                keyAttribute: "value" // SAMANTRAY: refer RepositoryXMLParser #219
                                }
                });
 
                /**
                * @class Expression consists of simple string type to store an expression (TREX expression language or SQL)
                * @property {string}   formula             - formula string
                * @property {string}   expressionLanguage  - expression language. Use enum ExpressionLanguage @see {@link ExpressionLanguage}
                */
                var Expression = AbstractModelClass.extend("Expression", {
 
                });
 
                /**
                 * Enum for Expression Language values.
                * @readonly
                * @enum {string}
                */
                var ExpressionLanguage = {
                                COLUMN_ENGINE: "COLUMN_ENGINE",
                                SQL: "SQL"
                };
 
                /**
                 * Enum for Partition Type values.
                * @readonly
                * @enum {string}
                */
                var PartitionSpecificationType = {
                                NUMBERED: "NumberedPartitionSpecification",
                                ROUND_ROBIN: "RoundRobinPartitionSpecification",
                                HASH: "HashPartitionSpecification",
                                RANGE: "RangePartitionSpecification",
                                NONE: "None"
                };
 
                /**
                 * Enum for Partition Expression Function values.
                * @readonly
                * @enum {string}
                */
                var PartitionExpressionFunction = {
                                YEAR: "YEAR",
                                MONTH: "MONTH"
                };
 
                /**
                * @class PartitionExpression Defines the link to one column / element and its usage in the partition
                * @property {Element}  element   - Partition element
                * @property {string}   function  - Partition function. Use enum PartitionExpressionFunction @see {@link PartitionExpressionFunction}
                */
                var PartitionExpression = AbstractModelClass.extend("PartitionExpression", {
                                $features: {
                                                references: {
                                                                "element": {}
                                                }
                                }
                });
 
                /**
                * @class PartitionSpecification - Partition Specification
                * @property {string}               partitionId        - Partition ID
                * @property {string}               type               - Type of PartitionSpecification (transient property). Use enum PartitionSpecificationType @see {@link PartitionSpecificationType}
                * @property {number}               numberOfPartitions - Number of partitions created for the table
                * @property {boolean}              useNumberOfServers - If set to true the number of partitions is the number of available servers
                * @property {PartitionExpression}  expressions         - Expression
                * @property {ValueFilter}          ranges             - The ranges / filters definded for the element of the expression
                * @property {boolean}              aging              - Indicates a special data aging kind of range partitioning
                * @property {boolean}              withOthers         - If set to true all values that don't fit the filters of the ranges go in one extra partition
                */
                var PartitionSpecification = AbstractModelClass.extend("PartitionSpecification", {
                                $features: {
                                                containments: {
                                                                "expressions": {
                                                                                isMany: true
                                                                },
                                                                "ranges": {
                                                                                isMany: true
                                                                }
                                                }
                                }
                });
 
                /**
                * @class PartitionDetail        - Partition Details
                * @property {string}               partitionId     - Partition ID
                * @property {string}               host            - Host
                * @property {string}               port            - Port
                * @property {string}               range            - Range
                * @property {string}               noOfRows        - No of rows in partition
                * @property {PartitionDetail}      subpartitionDetails - Each partition can be sub partitioned
                */
 
                var PartitionDetail = AbstractModelClass.extend("PartitionDetail", {
                                $features: {
                                                containments: {
                                                                "subpartitionDetails": {
                                                                                isMany: true
                                                                }
                                                }
                                }
                });
 
                /**
                * @class TableGroup        - Group details for catalog table
                * @property {string}               groupType     - Group Type
                * @property {string}               subtype       - Subtype
                * @property {string}               groupName     - Group Name
                */
 
                var TableGroup = AbstractModelClass.extend("TableGroup", {
 
                });
 
                /**
                * @class VirtualProperties        - Virtual Properties for catalog table
                * @property {string}               remoteSource     - Remote Source Name
                * @property {string}               remoteDb       - Remote DB Name
                * @property {string}               remoteOwner     - Remote Owner Name
                * @property {string}               remoteObject     - Remote Object Name
                */
 
                var VirtualProperties = AbstractModelClass.extend("VirtualProperties", {
 
                });
 
                /**
                * @class Represents a Catalog Table or a Consumption View (Runtime representation of a Repository View)
                * @property {string}                  name                    - Name of entity
                * @property {string}                  id                      - Qualified Name of entity in HDI
                * @property {string}                  schemaName              - Schema name (applicable only for catalog RT objects)
                * @property {string}                  physicalSchema          - Physical schema name
                * @property {string}                  packageName             - Package name (applicable only for DT objects)
                * @property {string}                  type                    - Type of Entity (transient property). Use enum EntityType @see {@link EntityType}
                * @property {string}                  dataCategory            - Hints to the engine to interpret individual entities; Use enum DataCategory @see {@link DataCategory}
                * @property {string}                  dimensionType           - Only relevant for dataCategory = DIMENSION; Use enum DimensionType @see {@link DimensionType}
                * @property {boolean}                 isProxy                 - Entity proxy. Indicates that the entity has been deleted or not resolved during model loading
                * @property {boolean}                 isLoadFromXML           - Applied to shared entity of star join to load shared hierarchy information
                * @property {PartitionSpecification}  partitionSpecifications - Partition Specifications
                * @property {PartitionDetails}        partitionDetails        - Partition Details
                * @property {TableGroup}              tableGroup              - Group details for catalog table
                * @property {VirtualProperties}       virtualProperties       - Virtual Properties for catalog table
                * @property {ModelCollection}         inlineHierarchies       - List of hierarchies of Type InlineHierarchy
                * @property {boolean}                 deprecated              - If set to true the Entity should (must) not be used anymore.
                */
                var Entity = AbstractModelClass.extend("Entity", {
 
                                $features: {
                                                //keyAttribute: "fqName",
                                                keyAttribute: "id",
                                                containments: {
                                                                "elements": {
                                                                                isMany: true
                                                                },
                                                                "parameters": {
                                                                                isMany: true
                                                                },
                                                                "partitionSpecifications": {
                                                                                isMany: true
                                                                },
                                                                "partitionDetails": {
                                                                                isMany: true
                                                                },
                                                                "inlineHierarchies": {
                                                                                isMany: true
                                                                }
                                                }
                                },
                                $init: function() {
                                                //this.fqName = this.getFullyQualifiedName();
												if (!this.id) {
													throw new AttributeMissingException(this, "id");
												}
                                                this.id = this.id;
                                                if(!this.name){
													this.name = this.id;
												}
                                                /*if (!this.schemaName && !this.physicalSchema && !this.packageName) {
                                                                throw new AttributeMissingException(this, "schemaName/packageName");
                                                }*/
                                },
 
                                createElement: function(attributes, skippedNodes, nextElementName) {
                                                var element = this.elements.get(attributes.name);
                                                if (element) {
                                                                throw new ObjectAlreadyExistsException(this, attributes.name, this.name);
                                                }
                                                return this.createOrMergeElement(attributes, skippedNodes, nextElementName);
                                },
 
                                // Will be very useful while parsing Element references (Eg. LabelElement, RestrictedColumn etc.)
                                createOrMergeElement: function(attributes, skippedNodes, nextElementName) {
                                                var element = this.elements.get(attributes.name);
                                                if (element) {
                                                                element.$setAttributes(attributes, skippedNodes);
                                                } else {
                                                                element = new Element(attributes, skippedNodes);
                                                                this.elements.add(element, nextElementName);
                                                }
                                                return element;
                                },
 
                                createParameter: function(attributes, skippedNodes, nextParameterName) {
                                                var parameter = this.parameters.get(attributes.name);
                                                if (parameter) {
                                                                throw new ObjectAlreadyExistsException(this, attributes.name, this.name);
                                                }
                                                return this.createOrMergeParameter(attributes, skippedNodes, nextParameterName);
                                },
 
                                createOrMergeParameter: function(attributes, skippedNodes, nextParameterName) {
                                                var parameter = this.parameters.get(attributes.name);
                                                if (parameter) {
                                                                parameter.$setAttributes(attributes, skippedNodes);
                                                } else {
                                                                parameter = new Parameter(attributes, skippedNodes);
                                                                this.parameters.add(parameter, nextParameterName);
                                                }
                                                return parameter;
                                },
 
                                createInlineHierarchy: function(attributes, skippedNodes, nextHierarchyName) {
                                                var hierarchy = new InlineHierarchy(attributes, skippedNodes);
                                                if (nextHierarchyName) {
                                                                this.inlineHierarchies.add(hierarchy.name, hierarchy, nextHierarchyName);
                                                } else {
                                                                this.inlineHierarchies.add(hierarchy);
                                                }
                                                return hierarchy;
                                },
 
                                // Required because used shared Hierarchy will be added by transformation then Proxy resolver will enhance same Hierarchy instance with other properties
                                createOrMergeHierarchy: function(attributes, skippedNodes, nextElementName) {
                                                var hierarchy = this.inlineHierarchies.get(attributes.name);
                                                if (hierarchy) {
                                                                hierarchy.$setAttributes(attributes, skippedNodes);
                                                } else {
                                                                hierarchy = new InlineHierarchy(attributes, skippedNodes);
                                                                this.inlineHierarchies.add(hierarchy, nextElementName);
                                                }
                                                return hierarchy;
                                },
 
                                // createOrMergePartitionSpecification: function(attributes) {
                                //     var partSpec = this.partitionSpecifications.get
                                //     partSpec = new PartitionSpecification(attributes);
                                //     this.partitionSpecifications.add(partSpec);
                                //     return partSpec;
                                // },
 
                                getFullyQualifiedName: function() {
                                                if (!this.fqName) {
												  this.fqName = this.id;

                                                               /* if (this.schemaName && 0 < this.schemaName.length) {
                                                                                this.fqName = '"' + this.schemaName + '".' + this.name;
                                                                } else if (this.packageName && 0 < this.packageName.length){
                                                                                this.fqName = this.packageName + '::' + this.name;
                                                                }else{
                                                                                this.fqName = this.id;
                                                                } */
                                                }
                                                return this.fqName;
                                },
								
								getID: function(){
									return this.id;
								},
								
								getName: function(){
									//var name;									
									return this.name;
								},
								
                });
 
                /**
                 * Enum for Entity Type values.
                * @readonly
                * @enum {string}
                */
                var EntityType = {
                                // For catalog types value is same as in DataSourceType enumeration in XSD;
                                // For DT objects value is same as file suffix
                                DATABASE_VIEW: "DATA_BASE_VIEW",
                                DATABASE_TABLE: "DATA_BASE_TABLE",
                                ATTRIBUTE_VIEW: "ATTRIBUTEVIEW",
                                ANALYTIC_VIEW: "ANALYTICVIEW",
                                CALCULATION_VIEW: "CALCULATIONVIEW",
                                TABLE_FUNCTION: "hdbtablefunction",
                                SCALAR_FUNCTION: "hdbscalarfunction",
                                PROCEDURE: "hdbprocedure",
                                CATALOG_PROCEDURE: "procedure",
						        GRAPH_WORKSPACE: "GRAPH_WORKSPACE"
                };
 
                /**
                * @class WindowFunction - Rank Node
                * @property {boolean}                dynamicPartitionElements - If TRUE, all the requested columns of the actual query will be used as partition elements
                *                                                               in addition to the statically defined partition elements
                * @property {Order}                  order                    - Top N (DESC) or Bottom N(ASC)
                * @property {UDFParameter}           rankThreshold            - Number of records in result of the rank node
                * @property {ModelCollection}        partitionElement         - Collection of elements to partition/group by
                */
                var WindowFunction = AbstractModelClass.extend("WindowFunction", {
                                $features: {
                                                containments: {
                                                                "orders": {
                                                                                isMany: true
                                                                },
                                                                "rankThreshold": {}
                                                },
                                                references: {
                                                                "partitionElements": {
                                                                                isMany: true
                                                                }
                                                }
                                },
 
                                createOrMergeRankThreshold: function(attributes, skippedNodes) {
                                                var threshold = this.rankThreshold;
                                                if (threshold) {
                                                                threshold.$setAttributes(attributes, skippedNodes);
                                                } else {
                                                                threshold = new UDFParameter(attributes, skippedNodes);
                                                                this.rankThreshold = threshold;
                                                }
                                                return this.rankThreshold;
                                },
 
                                createOrder: function(attributes, skippedNodes) {
                                                var order = new Order(attributes, skippedNodes);
                                                this.orders.add(order);
                                                return order;
                                }
                });
 
                /**
                * @class
                * @property {string}            name             - Name of ViewNode
                * @property {string}            type             - Type of ViewNode; Use enum ViewNodeType @see {@link ViewNodeType}
			  * @property {boolean}           isDataSource     - Flag to indicate that the projection corresponds to a data source of the calc view model
                * @property {Element}           elements         - Elements
                * @property {Expression}        filterExpression - Filter Expression
			  * @property {string}            graphExpression  - Graph Expression
                * @property {ModelCollection}   keyElements      - Key elements
                * @property {ModelCollection}   joins            - Collection of Join objects (applicable for JoinNode)
                * @property {Input}             centralEntity    - Input containing the Central Entity in Star Join (applicable for JoinNode)
                * @property {windowFunction}    windowFunction   - Rank node
			  * @property {Entity}            workspace        - Graph node workspace
			  * @property {String}            action           - Type of Graph node action;  Use enum GraphAlgoritm @see {@link GraphAlgoritm}
                * @property {EndUserTexts}      endUserTexts     - End User Texts including label, comment etc.
                * @property {ModelCollection}   elementFilters     - Collection of ElementFilter - To support column level filters in old models
                */
                var ViewNode = AbstractModelClass.extend("ViewNode", {
 
                                $features: {
                                                keyAttribute: "name",
                                                containments: {
                                                                "filterExpression": {},
                                                                "inputs": {
                                                                                isMany: true
                                                                },
                                                                "elements": {
                                                                                isMany: true
                                                                },
                                                                "layout": {},
                                                                "joins": {
                                                                                isMany: true
                                                                },
                                                                "windowFunction": {},
                                                                "endUserTexts": {},
                                                                "elementFilters": {
                                                                                isMany: true
                                                                }
                                                },
                                                references: {
                                                                "centralEntity": {}, 
												        "workspace": {},
                                                                "keyElements": {
                                                                                isMany: true
                                                                }
                                                }
                                },
 
                                $init: function() {
                                                //: During parsing when we parse a calculation view which uses one more calculation view as its input source
                                                // we call RepositoryXmlParser.getSourceForInput() and in turn it calls ColumnView.createOrMergeViewNode()
                                                //at that time we will not have info about type because that calculation view is not parsed yet
                                                // if (!this.type) throw new AttributeMissingException(this, "type");
                                                if (!this.name) {
                                                                this.name = this.$getModel().getNextViewNodeName(this.type);
                                                }
                                                this._isDefaultNode = false;
                                },
 
                                createLayout: function(attributes, skippedNodes) {
                                                var layout = new Layout(attributes, skippedNodes);
                                                this.layout = layout;
                                                // this.$getContainer()._layouts.add("ViewNode:" + this.name, layout);
                                                // this.$getContainer()._layouts.add("ViewNode:" + this.name, layout);
                                                return layout;
                                },
 
                                deleteLayout: function() {
                                                this.layout = null;
                                                // return this.$getContainer()._layouts.remove("ViewNode:" + this.name);
                                                // return this.$getContainer()._layouts.remove("ViewNode:" + this.name);
                                },
 
                                /**
                                * @param [inputKey] can be specified to ensure stable key after undo of delete input
                                */
                                createInput: function(attributes, skippedNodes, nextInputKey, inputKey) {
                                                var input = new Input(attributes, skippedNodes);
                                                this.inputs.add(inputKey, input, nextInputKey);
                                                return input;
                                },
 
                                createElementWithoutAddingIntoElementCollection: function(attributes, skippedNodes, nextElementName) {
                                                var element = this.elements.get(attributes.name);
                                                if (element) {
                                                                throw new ObjectAlreadyExistsException(this, attributes.name, this.name);
                                                } else {
                                                                element = new Element(attributes, skippedNodes);
                                                }
                                                return element;
                                },
 
                                createElement: function(attributes, skippedNodes, nextElementName) {
                                                var element = this.elements.get(attributes.name);
                                                if (element) {
                                                                throw new ObjectAlreadyExistsException(this, attributes.name, this.name);
                                                }
                                                return this.createOrMergeElement(attributes, skippedNodes, nextElementName);
                                },
 
                                createOrMergeElement: function(attributes, skippedNodes, nextElementName) {
                                                var element = this.elements.get(attributes.name);
                                                if (element) {
                                                                //: There might be situations where we need it to work for non-default node;
                                                                // please refer test data model - idetests/editor/plugin/analytics/testdata/UNION_BEFORE_REQUIRED_PROJECTION_NODE.calculationview.xml
                                                                /*if (!element.$getContainer().isDefaultNode()) {
                    throw new ObjectAlreadyExistsException(this, attributes.name, this.name);
                }*/
                                                                element.$setAttributes(attributes, skippedNodes);
                                                } else {
                                                                element = new Element(attributes, skippedNodes);
                                                                this.elements.add(element, nextElementName);
                                                }
 
                                                return element;
                                },
                                
     mapAllWorkspaceElementToViewNodeElement: function(){
    		for(var index = 0; index < this.workspace.elements.count(); index++){
    		    var workspaceElement = this.workspace.elements.getAt(index);
    		    var viewNodeElement = this.createOrMergeElement({name: workspaceElement.name});
    		    
    		    var simpleTypeAttributes = {
    	                primitiveType: workspaceElement.inlineType.primitiveType,
    	                length: workspaceElement.inlineType.length,
    	                scale: workspaceElement.inlineType.scale,
    	                semanticType: workspaceElement.inlineType.semanticType
    	            };
    		    viewNodeElement.createOrMergeSimpleType(simpleTypeAttributes);
    		}
		},
		
		removeAllWorkspaceElementFromViewNodeElement: function(){
		    var elements = [];
    		for(var index = 0; index < this.elements.count(); index++){
    		    var element = this.workspace.elements.getAt(index);
    		    elements.push(element);
    		}
    		for(var i = 0; i < elements.length; i++){
    		    var elementToRemove = elements[i];
    		    this.elements.remove(elementToRemove.name);
    		}
		},
 
                                createJoin: function(attributes, skippedNodes) {
                                                var join = new Join(attributes, skippedNodes);
                                                this.joins.add(join);
                                                return join;
                                },
 
                                //To support column level filters while opening
                                createElementFilter: function(attributes, skippedNodes) {
                                                var elementFilter = new ElementFilter(attributes, skippedNodes);
                                                this.elementFilters.add(elementFilter);
                                                return elementFilter;
                                },
 
                                createFilterExpression: function(attributes, skippedNodes) {
                                                this.filterExpression = new Expression(attributes, skippedNodes);
                                                return this.filterExpression;
                                },
 
                                createWindowFunction: function(attributes, skippedNodes) {
                                                this.windowFunction = new WindowFunction(attributes, skippedNodes);
                                                return this.windowFunction;
                                },
 
                                isDefaultNode: function() {
                                                return this._isDefaultNode;
                                },
 
                                isScriptNode: function() {
                                                return this.type === "Script";
                                },
 
                                isJoinNode: function() {
                                                return this.type === "JoinNode";
                                },
 
                                isStarJoin: function() {
                                                return (this.isJoinNode() && this.isDefaultNode());
                                },
 
                                isUnion: function() {
                                                return this.type === "Union";
                                },
 
                                isRankNode: function() {
                                                return this.type === "Rank";
                                },
						   isGraphNode: function() {
								return this.type === "Graph";
							},

 
                                getDefaultInput: function() {
                                                if (!this.isDefaultNode()) {
                                                                throw new ModelException("Default input cannot be determined for {0}, it is not the default node", this);
                                                }
                                                var result;
 
                                                this.inputs.foreach(function(input) {
                                                                result = input;
                                                                // should be only one input
                                                                return;
                                                });
                                                return result;
                                },
 
                                getElementNameForCopy: function(previousName) {
                                                return this.elements.getUniqueKey(previousName, "_COPY");
                                },
 
                                createEndUserTexts: function(attributes, skippedNodes) {
                                                this.endUserTexts = new EndUserTexts(attributes, skippedNodes);
                                                return this.endUserTexts;
                                }
                });
 
                /**
                * @class Join
                * @property {Input}                  leftInput                   - Left input
                * @property {Input}                  rightInput                  - Right input
                * @property {ModelCollection}        leftElement                 - Left Elements in Join - Collection of Elements
                * @property {ModelCollection}        rightElement                - Right Elements in Join - Collection of Elements
                * @property {string}                 joinType                    - Type of Join; Use enum JoinType @see {@link JoinType}
                * @property {string}                 cardinality                 - Cardinality; Use enum Cardinality @see {@link Cardinality}
                * @property {boolean}                dynamic                     - Dynamic Join
                * @property {boolean}                dimensionJoin               - Indicates that the join partner is used as dimension; Applicable when DataCategory = CUBE
                * @property {boolean}                textJoin                    - Indicates join to a language dependent text table
                * @property {string}                 languageColumn              - Language column name in the text table
                * @property {boolean}                optimizeJoinColumns         - Join columns are usually kept during instantiation process of the calc engine
                * @property {ModelCollection}        spatialJoinProperties       - Spatial Join properties
                * @property {TemporalJoinProperties} temporalJoinProperties      - Temporal Join properties
                */
                var Join = AbstractModelClass.extend("Join", {
 
                                $features: {
                                                containments: {
                                                                "spatialJoinProperties": {
                                                                                isMany: true
                                                                },
                                                                "temporalJoinProperties": {}
                                                },
                                                references: {
                                                                "leftInput": {},
                                                                "rightInput": {},
                                                                "leftElements": {
                                                                                isMany: true
                                                                },
                                                                "rightElements": {
                                                                                isMany: true
                                                                }
                                                }
                                },
 
                                createSpatialJoinProperties: function(attributes, skippedNodes) {
                                                var spatialJoinProperties = new SpatialJoinProperties(attributes, skippedNodes);
                                                this.spatialJoinProperties.add(spatialJoinProperties);
                                                return spatialJoinProperties;
                                }
                });
 
                /**
                 * Enum for ViewNode Type values.
                * @readonly
                * @enum {string}
                */
                var ViewNodeType = {
                                JoinNode: "JoinNode",
                                Projection: "Projection",
                                Aggregation: "Aggregation",
                                Rank: "Rank",
                                Union: "Union",
                                Script: "Script",
							Graph: "Graph"
                };
/** 
	 * Enum for ViewNode Type values.
	 * @readonly
	 * @enum {string}
	 */
	var RepositoryViewNodeType = {
		JoinView: "JoinView",
		ProjectionView: "ProjectionView",
		AggregationView: "AggregationView",
		RankView: "RankView",
		UnionView: "UnionView",
		ScriptView: "SqlScriptView",
		GraphView: "GraphView"
	};
 
                /**
                 * Enum for Join Type values.
                * @readonly
                * @enum {string}
                */
                var JoinType = {
                                REFERENTIAL: "referential",
                                INNER: "inner",
                                LEFT_OUTER: "leftOuter",
                                RIGHT_OUTER: "rightOuter",
                                FULL_OUTER: "fullOuter",
                                TEXT_TABLE: "textTable"
                };
 
                /**
                 * Enum for Cardinality values.
                * @readonly
                * @enum {string}
                */
                var Cardinality = {
                                C11: "C1_1",
                                C1N: "C1_N",
                                CN1: "CN_1",
                                CNN: "CN_N"
                };
/** 
	 * Enum for GraphAlgoritm Type values.
	 * @readonly
	 * @enum {string}
	 */
	var GraphAlgoritm = {
		GEM: "GEM",
		IS_ACYCLIC: "IS_ACYCLIC",
		GET_NEIGHBORHOOD: "GET_NEIGHBORHOOD"
	};
 
                /**
                * @class SpatialJoinProperties
                * @property {SpatialDistanceParameterization}           distance             - Distance for the predicate; relvant when predicate = WITHIN_DISTANCE
                * @property {SpatialIntersectionMatrixParameterization} intersectionMatrix   - intersection matrix (Dimensionally Extended Nine-Intersection Model) for the predicate; relvant when predicate = RELATE
                * @property {string}                                    predicate            - Predicate; Use enum SpatialPredicate @see {@link SpatialPredicate}
                * @property {boolean}                                   predicateEvaluatesTo - Indicates when join between two rows is performed
                */
                var SpatialJoinProperties = AbstractModelClass.extend("SpatialJoinProperties", {
 
                                $features: {
                                                containments: {
                                                                "distance": {},
                                                                "intersectionMatrix": {}
                                                }
                                },
 
                                createSpatialDistanceParameterization: function(attributes, skippedNodes) {
                                                var spatialDistanceParameterization = new SpatialDistanceParameterization(attributes, skippedNodes);
                                                this.distance = spatialDistanceParameterization;
                                                return spatialDistanceParameterization;
                                },
 
                                createSpatialIntersectionMatrixParameterization: function(attributes, skippedNodes) {
                                                var spatialIntersectionMatrixParameterization = new SpatialIntersectionMatrixParameterization(attributes, skippedNodes);
                                                this.intersectionMatrix = spatialIntersectionMatrixParameterization;
                                                return spatialIntersectionMatrixParameterization;
                                }
                });
 
                /**
                 * Enum for Spatial Predicate values.
                * @readonly
                * @enum {string}
                */
                var SpatialPredicate = {
                                CONTAINS: "CONTAINS",
                                COVERED_BY: "COVERED_BY",
                                COVERS: "COVERS",
                                CROSSES: "CROSSES",
                                DISJOINT: "DISJOINT",
                                EQUALS: "EQUALS",
                                INTERSECTS: "INTERSECTS",
                                OVERLAPS: "OVERLAPS",
                                RELATE: "RELATE",
                                TOUCHES: "TOUCHES",
                                WITHIN: "WITHIN",
                                WITHIN_DISTANCE: "WITHIN_DISTANCE"
                };
 
                /**
                * @class SpatialDistanceParameterization
                * @property {double}                                       value
                * @property {Parameter}                                    parameter
                *
                */
                var SpatialDistanceParameterization = AbstractModelClass.extend("SpatialDistanceParameterization", {
                                $features: {
                                                references: {
                                                                "parameter": {}
                                                }
                                }
                });
 
                /**
                * @class SpatialIntersectionMatrixParameterization
                * @property {String}                                       value
                * @property {Parameter}                                    parameter
                */
                var SpatialIntersectionMatrixParameterization = AbstractModelClass.extend("SpatialIntersectionMatrixParameterization", {
                                $features: {
                                                references: {
                                                                "parameter": {}
                                                }
                                }
                });
 
                /**
                * @class TemporalJoinProperties
                */
                var TemporalJoinProperties = AbstractModelClass.extend("TemporalJoinProperties", {
                                $features: {
                                                // TODO
                                }
                });
 
                /**
                * @class
                */
                var Layout = AbstractModelClass.extend("Layout", {
 
                                $init: function() {
                                                //: There can be models where xCoordinate and yCoordinate would be undefined; but we have to support opening it (internal message : 1580017445)
                                                /*if (typeof this.xCoordinate === "undefined") {
                                                                throw new AttributeMissingException(this, "xCoordinate");
                                                }*/
                                                /*if (this.xCoordinate < 0) {
                throw new InvalidAttributeException(this, "xCoordinate", this.xCoordinate);
            }*/
                                                /*if (typeof this.yCoordinate === "undefined") {
                                                                throw new AttributeMissingException(this, "yCoordinate");
                                                }*/
                                                /* if (this.yCoordinate < 0) {
                throw new InvalidAttributeException(this, "yCoordinate", this.yCoordinate);
            }*/
                                                // width, height, expanded are optional
                                }
                });
 
                /**
                * @class
                * @property {string}                       name                            - Name
                * @property {string}                       label                           - Description of the Element
                * @property {SimpleType}                   inlineType                      - Inline type
                * @property {string}                       measureType                     - Type of element. Transient property. Use Enum MeasureType for assigning values.
                * @property {boolean}                      hidden                          - Hidden element
			  * @property {boolean}                      deprecated                      - If set to true the column should (must) not be used anymore.
                * @property {boolean}                      keep                            - Keep flag can be set only for attributes in aggregation and projection nodes
                * @property {boolean}                      transparentFilter               - transparentFilter flag can be set only for attributes
                *                                                                          - The flag can only be set on aggregations, projections, unions and normal joins.
                *                                                                            It can't be set on rank node nor on the star join node. It can't be set on calculated
                *                                                                            columns nor on measures. Also on script based calc views this field is not relevant.
                * @property {Expression}                   calculationDefinition           - Calculation definition for calculated element
                * @property {string}                       aggregationBehavior             - The default or client aggregation behavior. Use enum AggregationBehavior @see {@link AggregationBehavior}
                * @property {string}                       engineAggregation               - Defines which aggregation the calc engine must use on the node. Use enum AggregationBehavior @see {@link AggregationBehavior}
                * @property {Element}                      unitCurrencyElement             - Unit/Currency element
                * @property {CurrencyConversion}           currencyConversion              - Currency conversion
                * @property {UnitConversion}               unitConversion                  - Unit conversion
                * @property {Element}                      labelElement                    - Label element
                * @property {Element}                      typeOfElement                   - Reference column for Parameter of type Column
                * @property {Element}                      externalTypeOfElement           - External reference column for Parameter of type Column
                * @property {Entity}                       externalTypeOfEntity            - Transient: Container Entity of the externalTypeOfElement
                * @property {Entity}                       parameterMappings               - Parameter mapping for the External View
                * @property {string}                       drillDownEnablement             - Drilldown enablement. Use enum DrillDownEnablement @see {@link DrillDownEnablement}
                * @property {string}                       infoObjectName                  - InfoObject name
                * @property {string}                       attributeHierarchyDefaultMember - Attribute Hierarchy Default Member
                * @property {boolean}                      isRestricted                    - Transient - Represents a RestrictedElement if true
                * @property {ModelCollection}              restrictions                    - Collection of ElementRefFilter objects
                * @property {Expression}                   restrictionExpression           - Restriction expression - only in case of Restricted Columns
                * @property {ExceptionAggregationStep}     exceptionAggregationStep        - Counter
                * @property {boolean}                      isProxy                         - Proxy element. Indicates that the element has ben deleted or not resolved during model loading
			  * @property {boolean}                      hasNoMapping                    - to address Power Designer models having elements without elementMapping
                * @property {string}                       sharedDimension                 - Shared dimension name
                * @property {string}                       nameInSharedDimension           - Name of column in shared dimension
                * @property {EndUserTexts}                 endUserTexts                    - End User Texts including label, comment etc.
                */
                var Element = AbstractModelClass.extend("Element", {
 
                                $features: {
                                                keyAttribute: "name",
                                                containments: {
                                                                "inlineType": {},
                                                                "calculationDefinition": {},
                                                                "restrictions": {
                                                                                isMany: true
                                                                },
                                                                "restrictionExpression": {},
                                                                "parameterMappings": {
                                                                                isMany: true
                                                                },
                                                                "exceptionAggregationStep": {},
                                                                "currencyConversion": {},
                                                                "unitConversion": {},
                                                                "endUserTexts": {}
                                                },
                                                references: {
                                                                "unitCurrencyElement": {},
                                                                "labelElement": {},
                                                                "externalTypeOfElement": {},
                                                                "externalTypeOfEntity": {}
                                                }
                                },
 
                                createOrMergeSimpleType: function(attributes, skippedNodes) {
                                                var simpleType = this.inlineType;
                                                if (simpleType) {
                                                                simpleType.$setAttributes(attributes, skippedNodes);
                                                } else {
                                                                simpleType = new SimpleType(attributes, skippedNodes);
                                                                this.inlineType = simpleType;
                                                }
                                                return simpleType;
                                },
 
                                getMapping: function() {
                                                if (this.$getContainer().isScriptNode()) {
                                                                return null;
                                                }
 
                                                var mapping;
                                                var targetName = this.name;
                                                var mappingFound = false;
 
                                                var inputs = this.$getContainer().inputs;
                                                for (var i = 0; i < inputs.count(); i++) {
                                                                var input = inputs.getAt(i);
                                                                for (var j = 0; j < input.mappings.count(); j++) {
                                                                                mapping = input.mappings.getAt(j);
                                                                                if (mapping.targetElement && mapping.targetElement.name === targetName) {
                                                                                                mappingFound = true;
                                                                                                break;
                                                                                }
                                                                }
                                                }
                                                if (mappingFound) {
                                                                return mapping;
                                                }
                                },
 
                                getStarJoinPrivateElementMapping: function(input) {
                                                var mapping;
                                                var targetName = this.name;
                                                var mappingFound = false;
                                                for (var j = 0; j < input.mappings.count(); j++) {
                                                                mapping = input.mappings.getAt(j);
                                                                if (mapping.targetElement && mapping.targetElement.name === targetName) {
                                                                                mappingFound = true;
                                                                                break;
                                                                }
                                                }
                                                if (mappingFound) {
                                                                return mapping;
                                                }
                                },
 
                                createDefaultMapping: function(attributes, skippedNodes) {
                                                if (this.$getContainer() && !this.$getContainer().isDefaultNode()) {
                                                                throw new ModelException("Default mapping cannot be created for {0}, its parent {1} is not the default node", [this, this.$getContainer()]);
                                                }
 
                                                // remember skipped nodes
                                                this.$setAttributes(null, skippedNodes);
 
                                                var mapping = null;
                                                if (this.$getContainer() && !this.$getContainer().isScriptNode()) {
                                                                var input = this.$getContainer().getDefaultInput();
                                                                // mapping = input.createMapping(attributes);
                                                                //: passing skippedNodes to be used by renderer
                                                                mapping = input.createMapping(attributes, skippedNodes);
                                                }
                                                return mapping;
                                },
 
                                createCalculationDefinition: function(attributes, skippedNodes) {
                                                this.calculationDefinition = new Expression(attributes);
                                                return this.calculationDefinition;
                                },
 
                                createRestriction: function(attributes, skippedNodes, nextRestrictionName) {
                                                var restriction = new ElementRefFilter(attributes, skippedNodes);
                                                this.restrictions.add(restriction, nextRestrictionName);
                                                return restriction;
                                },
 
                                createRestrictionExpression: function(attributes, skippedNodes) {
                                                this.restrictionExpression = new Expression(attributes);
                                                return this.restrictionExpression;
                                },
 
                                createExceptionAggregationStep: function(attributes, skippedNodes) {
                                                this.exceptionAggregationStep = new ExceptionAggregationStep(attributes, skippedNodes);
                                                return this.exceptionAggregationStep;
                                },
 
                                createParameterMapping: function(attributes, skippedNodes) {
                                                var parameterMapping = new ParameterMapping(attributes, skippedNodes);
                                                this.parameterMappings.add(parameterMapping);
                                                return parameterMapping;
                                },
 
                                createCurrencyConversion: function(attributes, skippedNodes) {
                                                this.currencyConversion = new CurrencyConversion(attributes, skippedNodes);
                                                return this.currencyConversion;
                                },
 
                                createUnitConversion: function(attributes, skippedNodes) {
                                                this.unitConversion = new UnitConversion(attributes, skippedNodes);
                                                return this.unitConversion;
                                },
 
                                createEndUserTexts: function(attributes, skippedNodes) {
                                                this.endUserTexts = new EndUserTexts(attributes, skippedNodes);
                                                return this.endUserTexts;
                                },
 
                                isPrivateElement: function() {
                                                var elementContainer = this.$getContainer();
                                                if (elementContainer instanceof ViewNode) {
                                                                return true;
                                                } else if (elementContainer instanceof Entity) {
                                                                return false;
                                                }
                                },
 
                                deriveSharedElementOriginalName: function() {
                                                var sharedElementName = this.name;
                                                var dotLastIndexOf = sharedElementName.lastIndexOf(".");
                                                var originalElementName = sharedElementName.substring(dotLastIndexOf, sharedElementName.length);
                                                return originalElementName;
                                }
                });
 
                /**
                * @class ElementRefFilter - Similar to ElementFilter; but this one contains object based reference to Element
                * @property {Element}         element      - Element reference
                * @property {ModelCollection} valueFilters - Collection of objects of type sharedmodel.ValueFilter
                */
                var ElementRefFilter = AbstractModelClass.extend("ElementRefFilter", {
                                $features: {
                                                containments: {
                                                                "valueFilters": {
                                                                                isMany: true
                                                                }
                                                },
                                                references: {
                                                                "element": {}
                                                }
                                },
 
                                createValueFilter: function(attributes, skippedNodes) {
                                                var valueFilter = new sharedmodel.ValueFilter(attributes, skippedNodes);
                                                this.valueFilters.add(valueFilter);
                                                return valueFilter;
                                }
                });
 
                /**
                * @class ExceptionAggregationStep Counter - This contains object based reference to Element
                * @property {string}   exceptionAggregationBehavior - Count Distinct. Use enum ExceptionAggregationBehavior @see {@link ExceptionAggregationBehavior}
                * @property {ModelCollection}  referenceElements    - Element reference
                */
                var ExceptionAggregationStep = AbstractModelClass.extend("ExceptionAggregationStep", {
                                $features: {
                                                references: {
                                                                "referenceElements": {
                                                                                isMany: true
                                                                }
                                                }
                                },
                                $init: function() {
                                                if (this.exceptionAggregationBehavior === undefined) {
                                                                this.exceptionAggregationBehavior = ExceptionAggregationBehavior.COUNT_DISTINCT;
                                                }
                                }
                });
 
                /**
                * @class CurrencyConversion comprises information required by engine for currency conversion
                * @property {UDFParameter}             sourceCurrency            - Source currency
                * @property {UDFParameter}             targetCurrency            - Target currency
                * @property {UDFParameter}             referenceDate             - Reference date
                * @property {UDFParameter}             exchangeRateType          - Exchange rate type
                * @property {Element}                  exchangeRateElement       - Exchange rate via a column of the view
                * @property {boolean}                  erpDecimalShift           - Decimal shift
                * @property {boolean}                  erpDecimalShiftBack       - Decimal shift back
                * @property {boolean}                  round                     - Round
                * @property {UDFParameter}             client                    - Client
                * @property {SchemaMappingBasedObject} schema                    - Conversion schema
                * @property {UDFParameter}             errorHandling             - Error handling
                * @property {SimpleType}               outputDataType            - Data type of the conversion result
                * @property {Element}                  outputUnitCurrencyElement - Derived output element to be used as CurrencyUnitElement
                * @property {boolean}                  convert                   - Only for use by UI; indicates that the conversion flag has been set
                */
                var CurrencyConversion = AbstractModelClass.extend("CurrencyConversion", {
                                $features: {
                                                containments: {
                                                                "sourceCurrency": {},
                                                                "targetCurrency": {},
                                                                "referenceDate": {},
                                                                "exchangeRateType": {},
                                                                "client": {},
                                                                "schema": {},
                                                                "errorHandling": {},
                                                                "outputDataType": {},
                                                                "outputUnitCurrencyElement": {}
                                                },
                                                references: {
                                                                "exchangeRateElement": {}
                                                }
                                },
 
                                createOrMergeSourceCurrency: function(attributes, skippedNodes) {
                                                var sourceCurr = this.sourceCurrency;
                                                if (sourceCurr) {
                                                                sourceCurr.$setAttributes(attributes, skippedNodes);
                                                } else {
                                                                sourceCurr = new UDFParameter(attributes, skippedNodes);
                                                                this.sourceCurrency = sourceCurr;
                                                }
                                                return sourceCurr;
                                },
 
                                createOrMergeTargetCurrency: function(attributes, skippedNodes) {
                                                var targetCurr = this.targetCurrency;
                                                if (targetCurr) {
                                                                targetCurr.$setAttributes(attributes, skippedNodes);
                                                } else {
                                                                targetCurr = new UDFParameter(attributes, skippedNodes);
                                                                this.targetCurrency = targetCurr;
                                                }
                                                return targetCurr;
                                },
 
                                createOrMergeReferenceDate: function(attributes, skippedNodes) {
                                                var referenceDate = this.referenceDate;
                                                if (referenceDate) {
                                                                referenceDate.$setAttributes(attributes, skippedNodes);
                                                } else {
                                                                referenceDate = new UDFParameter(attributes, skippedNodes);
                                                                this.referenceDate = referenceDate;
                                                }
                                                return referenceDate;
                                },
 
                                createOrMergeExchangeRateType: function(attributes, skippedNodes) {
                                                var exchangeRateType = this.exchangeRateType;
                                                if (exchangeRateType) {
                                                                exchangeRateType.$setAttributes(attributes, skippedNodes);
                                                } else {
                                                                exchangeRateType = new UDFParameter(attributes, skippedNodes);
                                                                this.exchangeRateType = exchangeRateType;
                                                }
                                                return exchangeRateType;
                                },
 
                                createOrMergeClient: function(attributes, skippedNodes) {
                                                var client = this.client;
                                                if (client) {
                                                                client.$setAttributes(attributes, skippedNodes);
                                                } else {
                                                                client = new UDFParameter(attributes, skippedNodes);
                                                                this.client = client;
                                                }
                                                return client;
                                },
 
                                createOrMergeSchema: function(attributes, skippedNodes) {
                                                var schema = this.schema;
                                                if (schema) {
                                                                schema.$setAttributes(attributes, skippedNodes);
                                                } else {
                                                                schema = new SchemaMappingBasedObject(attributes, skippedNodes);
                                                                this.schema = schema;
                                                }
                                                return schema;
                                },
 
                                createOrMergeErrorHandling: function(attributes, skippedNodes) {
                                                var errorHandling = this.errorHandling;
                                                if (errorHandling) {
                                                                errorHandling.$setAttributes(attributes, skippedNodes);
                                                } else {
                                                                errorHandling = new UDFParameter(attributes, skippedNodes);
                                                                this.errorHandling = errorHandling;
                                                }
                                                return errorHandling;
                                },
 
                                createOrMergeOutputDataType: function(attributes, skippedNodes) {
                                                var outputDataType = this.outputDataType;
                                                if (outputDataType) {
                                                                outputDataType.$setAttributes(attributes, skippedNodes);
                                                } else {
                                                                outputDataType = new SimpleType(attributes, skippedNodes);
                                                                this.outputDataType = outputDataType;
                                                }
                                                return outputDataType;
                                },
 
                                createOrMergeOutputUnitCurrencyElement: function(attributes, skippedNodes) {
                                                var outputUnitCurrencyElement = this.outputUnitCurrencyElement;
                                                if (outputUnitCurrencyElement) {
                                                                outputUnitCurrencyElement.$setAttributes(attributes, skippedNodes);
                                                } else {
                                                                outputUnitCurrencyElement = new Element(attributes, skippedNodes);
                                                                this.outputUnitCurrencyElement = outputUnitCurrencyElement;
                                                }
                                                return outputUnitCurrencyElement;
                                }
                });
 
                /**
                * @class UnitConversion comprises information required by engine for unit conversion
                * @property {UDFParameter}             sourceUnit                - Source unit
                * @property {UDFParameter}             targetUnit                - Target unit
                * @property {UDFParameter}             client                    - Client
                * @property {SchemaMappingBasedObject} schema                    - Conversion schema
                * @property {UDFParameter}             errorHandling             - Error handling
                * @property {SimpleType}               outputDataType            - Data type of the conversion result
                * @property {Element}                  outputUnitCurrencyElement - Derived output element to be used as CurrencyUnitElement
                */
                var UnitConversion = AbstractModelClass.extend("UnitConversion", {
                                $features: {
                                                containments: {
                                                                "sourceUnit": {},
                                                                "targetUnit": {},
                                                                "client": {},
                                                                "schema": {},
                                                                "errorHandling": {},
                                                                "outputDataType": {},
                                                                "outputUnitCurrencyElement": {}
                                                }
                                },
 
                                createOrMergeSourceCurrency: function(attributes, skippedNodes) {
                                                var sourceUnit = this.sourceUnit;
                                                if (sourceUnit) {
                                                                sourceUnit.$setAttributes(attributes, skippedNodes);
                                                } else {
                                                                sourceUnit = new UDFParameter(attributes, skippedNodes);
                                                                this.sourceUnit = sourceUnit;
                                                }
                                                return sourceUnit;
                                },
 
                                createOrMergeTargetCurrency: function(attributes, skippedNodes) {
                                                var targetUnit = this.targetUnit;
                                                if (targetUnit) {
                                                                targetUnit.$setAttributes(attributes, skippedNodes);
                                                } else {
                                                                targetUnit = new UDFParameter(attributes, skippedNodes);
                                                                this.targetUnit = targetUnit;
                                                }
                                                return targetUnit;
                                },
 
                                createOrMergeClient: function(attributes, skippedNodes) {
                                                var client = this.client;
                                                if (client) {
                                                                client.$setAttributes(attributes, skippedNodes);
                                                } else {
                                                                client = new UDFParameter(attributes, skippedNodes);
                                                                this.client = client;
                                                }
                                                return client;
                                },
 
                                createOrMergeSchema: function(attributes, skippedNodes) {
                                                var schema = this.schema;
                                                if (schema) {
                                                                schema.$setAttributes(attributes, skippedNodes);
                                                } else {
                                                                schema = new SchemaMappingBasedObject(attributes, skippedNodes);
                                                                this.schema = schema;
                                                }
                                                return schema;
                                },
 
                                createOrMergeErrorHandling: function(attributes, skippedNodes) {
                                                var errorHandling = this.errorHandling;
                                                if (errorHandling) {
                                                                errorHandling.$setAttributes(attributes, skippedNodes);
                                                } else {
                                                                errorHandling = new UDFParameter(attributes, skippedNodes);
                                                                this.errorHandling = errorHandling;
                                                }
                                                return errorHandling;
                                },
 
                                createOrMergeOutputDataType: function(attributes, skippedNodes) {
                                                var outputDataType = this.outputDataType;
                                                if (outputDataType) {
                                                                outputDataType.$setAttributes(attributes, skippedNodes);
                                                } else {
                                                                outputDataType = new SimpleType(attributes, skippedNodes);
                                                                this.outputDataType = outputDataType;
                                                }
                                                return outputDataType;
                                },
 
                                createOrMergeOutputUnitCurrencyElement: function(attributes, skippedNodes) {
                                                var outputUnitCurrencyElement = this.outputUnitCurrencyElement;
                                                if (outputUnitCurrencyElement) {
                                                                outputUnitCurrencyElement.$setAttributes(attributes, skippedNodes);
                                                } else {
                                                                outputUnitCurrencyElement = new Element(attributes, skippedNodes);
                                                                this.outputUnitCurrencyElement = outputUnitCurrencyElement;
                                                }
                                                return outputUnitCurrencyElement;
                                }
                });
 
                /**
                * @class SchemaMappingBasedObject
                * @property {string} physicalSchemaName - Physical schema name
                * @property {string} schemaName         - Authoring schema name
                */
                var SchemaMappingBasedObject = AbstractModelClass.extend("SchemaMappingBasedObject", {
 
                });
 
                /**
                 * Enum for ErrorHandling in Currency/UnitConversion
                * @readonly
                * @enum {string}
                */
                var ConversionErrorHandling = {
                                FAIL: "failOnError",
                                SET_TO_NULL: "setToNull",
                                IGNORE: "keepUnconverted"
                };
 
                /**
                 * Enum for Drilldown Enablement values.
                * @readonly
                * @enum {string}
                */
                var DrillDownEnablement = {
                                NONE: "NONE",
                                DRILL_DOWN: "DRILL_DOWN",
                                DRILL_DOWN_WITH_HIERARCHY: "DRILL_DOWN_WITH_HIERARCHY"
                };
 
                /**
                 * Enum for Aggregation Behavior values.
                * @readonly
                * @enum {string}
                */
                var AggregationBehavior = {
                                // Name same as in AggregationBehavior enumeration in datamodel.type XSD
                                // Value same as in AggregationType enumeration in bimodel.cube XSD for easy conversion
                                NONE: "none", // special one; not present in legacy model
                                SUM: "sum",
                                MIN: "min",
                                MAX: "max",
                                COUNT: "count",
                                FORMULA: "formula" // special one; not present in legacy model
                };
 
                /**
                * Enum for Exception Aggregation Behavior
                * @readonly
                * @enum {string}
                */
                var ExceptionAggregationBehavior = {
                                COUNT_DISTINCT: "countDistinct"
                };
 
                /**
                * Enum for Mapping Type
                * @readonly
                * @enum {string}
                */
                var MappingType = {
                                ElementMapping: "ElementMapping",
                                ConstantElementMapping: "ConstantElementMapping",
                                InputMapping: "InputMapping"
                };
 
                /**
                * @class Mapping (ElementMapping, ConstantElementMapping, InputMapping)
                * @property {string}       type               - Type of Mapping; Use enum MappingType @see {@link MappingType}
                * @property {Element}      targetElement      - Target Element
                * @property {Element}      sourceElement      - Source Element
                * @property {String}       value              - Constant value - used with MappingType.ConstantElementMapping
                * @property {boolean}      isNull             - Null value - used with MappingType.ConstantElementMapping
                * @property {Input}        sourceInput        - Star Join: Source Input from which Join Element is taken
                * @property {string}       aliasName          - Star Join: Alias name for the shared element
                * @property {boolean}      transparentFilter  -  Star Join: Shared element
                * @property {EndUserTexts} targetEndUserTexts - Star Join: End User Texts
                */
                var Mapping = AbstractModelClass.extend("Mapping", {
                                $features: {
                                                containments: {
                                                                "targetEndUserTexts": {}
                                                },
                                                references: {
                                                                "targetElement": {},
                                                                "sourceElement": {},
                                                                "sourceInput": {}
                                                }
                                },
 
                                $init: function() {
                                                // Default the type to ElementMapping
                                                // this.type = MappingType.ElementMapping;
                                                // Default the type to ElementMapping if it is not set before(now constructor calls $setAttributes() before $init())
                                                if (this.type === undefined) {
                                                                this.type = MappingType.ElementMapping;
                                                }
                                },
 
                                createEndUserTexts: function(attributes, skippedNodes) {
                                                this.targetEndUserTexts = new EndUserTexts(attributes, skippedNodes);
                                                return this.targetEndUserTexts;
                                }
                });
 
                /**
                * @class
                * @property {string}          alias              - Alias for input
                * @property {string}          repositoryInputNodeId  - Datasource ID for input in repository model
                * @property {ModelCollection} elementFilters     - Structured Filters on sources of View node (Will be used if filter can be applied on Input lable - Not supported now)
                * @property {ModelCollection - ElementFilter}  unionPruningElementFilters     - Union Pruning Element Filters information
                * @property {ModelCollection} mappings           -
                * @property {string}          emptyUnionBehavior - Empty Union Behavior; Use enum EmptyUnionBehavior @see {@link EmptyUnionBehavior}
                * @property {boolean}         selectAll          - Star Join: Indicates all elements of the input node are mapped 1:1 to (output) elements
                * @property {Element}         excludedElements   - Star Join: Locally hidden shared elements
                */
                var Input = AbstractModelClass.extend("Input", {
 
                                $features: {
                                                containments: {
                                                                "mappings": {
                                                                                isMany: true
                                                                },
                                                                "parameterMappings": {
                                                                                isMany: true
                                                                },
                                                                "unionPruningElementFilters": {
                                                                                isMany: true
                                                                }
                                                },
                                                references: {
                                                                "_source": {},
                                                                excludedElements: {
                                                                                isMany: true
                                                                }
                                                }
                                },
 
                                setSource: function(source) {
                                                this._source = source;
                                },
 
                                getSource: function() {
                                                return this._source;
                                },
 
                                getTarget: function() {
                                                return this.$getContainer();
                                },
 
                                createMapping: function(attributes, skippedNodes) {
                                                var mapping = new Mapping(attributes, skippedNodes);
                                                this.mappings.add(mapping);
                                                return mapping;
                                },
 
                                createParameterMapping: function(attributes, skippedNodes) {
                                                var parameterMapping = new ParameterMapping(attributes, skippedNodes);
                                                this.parameterMappings.add(parameterMapping);
                                                return parameterMapping;
                                },
 
                                createElementFilter: function(attributes, skippedNodes) {
                                                var elementFilter = new ElementFilter(attributes, skippedNodes);
                                                this.elementFilters.add(elementFilter);
                                                return elementFilter;
                                },
                               
                                createUnionPruningElementFilter: function(attributes, skippedNodes) {
                                                var elementFilter = new ElementFilter(attributes, skippedNodes);
                                                this.unionPruningElementFilters.add(elementFilter);
                                                return elementFilter;
                                }
                });
 
                /**
                 * Enum for Empty Union Behavior values.
                * @readonly
                * @enum {string}
                */
                var EmptyUnionBehavior = {
                                NO_ROW: "NO_ROW",
                                ROW_WITH_CONSTANTS: "ROW_WITH_CONSTANTS"
                };
 
                return {
                                ViewModel: ViewModel,
                                ColumnView: ColumnView,
                                Parameter: Parameter,
                                SimpleType: SimpleType,
                                ValueRange: ValueRange,
                                DefaultRange: DefaultRange,
                                Entity: Entity,
                                ViewNode: ViewNode,
                                Layout: Layout,
                                Element: Element,
                                Input: Input,
                                Mapping: Mapping,
                                ParameterMapping: ParameterMapping,
                                ExpressionLanguage: ExpressionLanguage,
                                AggregationBehavior: AggregationBehavior,
                                ExceptionAggregationBehavior: ExceptionAggregationBehavior,
                                ExceptionAggregationStep: ExceptionAggregationStep,
                                DrillDownEnablement: DrillDownEnablement,
                                EntityType: EntityType,
                                SelectionType: SelectionType,
                                SemanticType: SemanticType,
                                ParameterType: ParameterType,
                                ElementFilter: ElementFilter,
                                Origin: Origin,
                                PrivilegeType: PrivilegeType,
                                DerivationRule: DerivationRule,
                                CurrencyConversion: CurrencyConversion,
                                UDFParameter: UDFParameter,
                                ExecutionHints: ExecutionHints,
                                DataCategory: DataCategory,
                                DimensionType: DimensionType,
                                CacheInvalidationPeriod: CacheInvalidationPeriod,
                                ColumnEngine: ColumnEngine,
                                NameValuePair: NameValuePair,
                                MeasureType: MeasureType,
                                UnitConversion: UnitConversion,
                                SchemaMappingBasedObject: SchemaMappingBasedObject,
                                ParameterMappingType: ParameterMappingType,
                                Join: Join,
                                EmptyUnionBehavior: EmptyUnionBehavior,
                                ViewNodeType: ViewNodeType,
                                WindowFunction: WindowFunction,
                                Order: Order,
                                MappingType: MappingType,
                                HierarchyType: HierarchyType,
                                InlineHierarchy: InlineHierarchy,
                                ParentDefinition: ParentDefinition,
                                OrphanedNodesHandling: OrphanedNodesHandling,
                                RootNodeVisibility: RootNodeVisibility,
                                Level: Level,
                                NodeStyle: NodeStyle,
                                HierarchyTimeProperties: HierarchyTimeProperties,
                                EdgeAttribute: EdgeAttribute,
                                LevelType: LevelType,
                                SortDirection: SortDirection,
                                CommentProperties: CommentProperties,
                                LocalizedText: LocalizedText,
                                EndUserTexts: EndUserTexts,
                                MimeType: MimeType,
                                PartitionSpecification: PartitionSpecification,
                                PartitionExpression: PartitionExpression,
                                PartitionExpressionFunction: PartitionExpressionFunction,
                                PartitionSpecificationType: PartitionSpecificationType,
                                PartitionDetail: PartitionDetail,
                                TableGroup: TableGroup,
                                VirtualProperties: VirtualProperties,
                                JoinType: JoinType,
                                ElementRefFilter: ElementRefFilter,
                                PrimitiveType: PrimitiveType,
                                ValueType: ValueType,
                                SeverityType: SeverityType,
							Cardinality: Cardinality,
							GraphAlgoritm: GraphAlgoritm,
							RepositoryViewNodeType: RepositoryViewNodeType
                };
});
