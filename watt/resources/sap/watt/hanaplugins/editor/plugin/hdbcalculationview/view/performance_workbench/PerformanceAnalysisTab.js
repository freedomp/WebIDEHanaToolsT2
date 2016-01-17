/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define([
        "../../util/ResourceLoader",
        "../../viewmodel/model",
        "../../viewmodel/commands",
        "../../viewmodel/services/PerformanceAnalysisService"
    ],
	function(ResourceLoader, modelClass, commands, PerformanceAnalysisService) {
		"use strict";

		var ViewModelEvents = commands.ViewModelEvents;
		var resourceLoader = new ResourceLoader("/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview");
		var HASH = "Hash",
			RANGE = "Range",
			ROUND_ROBIN = "Round Robin",
			NOT_PARTITIONED = "Not Partitioned",
			VIRTUAL = "VIRTUAL",
			ROW = "ROW";

		var PerformanceAnalysisTab = function(attributes) {
			this._viewNode = attributes.viewNode;
			this._context = attributes.context;
			this._model = attributes.model;
			this._analysisModel = {};
			this._jsonModels = {
				joinDef: {},
				dataSource: {}
			};
			this._oDataSourceTbl = undefined;
			this._propsLayout = undefined;
			this._dsProgressLbl = undefined;
			this._joinProgressLbl = undefined;
			this._notApplicableLayout = undefined;
			this._joinDetails = undefined;
			this._joinLayout = undefined;
			this._service = new PerformanceAnalysisService(this._model, this._context);
			this._init();
		};

		PerformanceAnalysisTab.prototype = {

			_init: function() {
				this._constructUiModel();
				//subscribe to events
				this._subscribeEvents();
			},
			_subscribeEvents: function(e) {
				if (!e) {
					this._viewNode.$getEvents().subscribe(ViewModelEvents.INPUT_CREATED, this.refresh, this);
					this._viewNode.$getEvents().subscribe(ViewModelEvents.INPUT_DELETED, this.refresh, this);
					this._viewNode.$getEvents().subscribe(ViewModelEvents.JOIN_CREATED, this.refresh, this);
					this._viewNode.$getEvents().subscribe(ViewModelEvents.JOIN_DELETED, this.refresh, this);
					this._viewNode.$getEvents().subscribe(ViewModelEvents.JOIN_CHANGED, this.refresh, this);
					this._model.columnView.$getEvents().subscribe(ViewModelEvents.REPLACE_ACTIONS_START, this._unsubscribeEvents, this);
					this._model.columnView.$getEvents().subscribe(ViewModelEvents.REPLACE_ACTIONS_STOP, this.refresh, this);
				} else {
					switch (e.type) {
						case ViewModelEvents.REPLACE_ACTIONS_STOP:
							{
								this._viewNode.$getEvents().subscribe(ViewModelEvents.INPUT_CREATED, this.refresh, this);
								this._viewNode.$getEvents().subscribe(ViewModelEvents.INPUT_DELETED, this.refresh, this);
								this._viewNode.$getEvents().subscribe(ViewModelEvents.JOIN_CREATED, this.refresh, this);
								this._viewNode.$getEvents().subscribe(ViewModelEvents.JOIN_DELETED, this.refresh, this);
								this._viewNode.$getEvents().subscribe(ViewModelEvents.JOIN_CHANGED, this.refresh, this);
							}
							break;
						case ViewModelEvents.INPUT_DELETED:
							{
								this._viewNode.$getEvents().subscribe(ViewModelEvents.JOIN_DELETED, this.refresh, this);
							}
							break;
					}
				}
			},
			_unsubscribeAndRefresh: function(e) {
				this._unsubscribeEvents(e);
				this.refresh(e);
			},
			_unsubscribeEvents: function(e) {
				if (!e) {
					this._viewNode.$getEvents().unsubscribe(ViewModelEvents.INPUT_CREATED, this.refresh, this);
					this._viewNode.$getEvents().unsubscribe(ViewModelEvents.INPUT_DELETED, this.refresh, this);
					this._viewNode.$getEvents().unsubscribe(ViewModelEvents.JOIN_CREATED, this.refresh, this);
					this._viewNode.$getEvents().unsubscribe(ViewModelEvents.JOIN_DELETED, this.refresh, this);
					this._viewNode.$getEvents().unsubscribe(ViewModelEvents.JOIN_CHANGED, this.refresh, this);
					this._model.columnView.$getEvents().unsubscribe(ViewModelEvents.REPLACE_ACTIONS_START, this._unsubscribeEvents, this);
					this._model.columnView.$getEvents().unsubscribe(ViewModelEvents.REPLACE_ACTIONS_STOP, this.refresh, this);
				} else {
					switch (e.type) {
						case ViewModelEvents.REPLACE_ACTIONS_START:
							{
								this._viewNode.$getEvents().unsubscribe(ViewModelEvents.INPUT_CREATED, this.refresh, this);
								this._viewNode.$getEvents().unsubscribe(ViewModelEvents.INPUT_DELETED, this.refresh, this);
								this._viewNode.$getEvents().unsubscribe(ViewModelEvents.JOIN_CREATED, this.refresh, this);
								this._viewNode.$getEvents().unsubscribe(ViewModelEvents.JOIN_DELETED, this.refresh, this);
								this._viewNode.$getEvents().unsubscribe(ViewModelEvents.JOIN_CHANGED, this.refresh, this);
							}
							break;
						case ViewModelEvents.INPUT_DELETED:
							{
								this._viewNode.$getEvents().unsubscribe(ViewModelEvents.JOIN_DELETED, this.refresh, this);
							}
							break;
					}
				}
			},

			_constructUiModel: function() {
				var that = this;
				var THRESHOLD_VALUE = 5000;
				if (this._model.preferenceStore && that._model.preferenceStore.performanceAnalysisThresholdValue) {
					THRESHOLD_VALUE = parseInt(that._model.preferenceStore.performanceAnalysisThresholdValue, 10) || 5000;
				}
				//structure of intermediate model
				this._analysisModel = {
					joinDefinition: {
						constructUiModel: false,
						isApplicable: false,
						leftTable: "",
						rightTable: "",
						joinType: "",
						referential: "",
						cardinality: "",
						proposedCardinality: "",
						statusIcon: "",
						status: ""
					},
					isAnalysisDataLoaded: false,
					entities: [] // entities of type catalog table, of current node
				};
				//structure of entity
				var Entity = function(name) {
					this.name = name;
					this.tableType = "";
					this.recordCount = ""; //for row tables
					this.partitionType = "";
					this.recordCount = "";
					this.thresholdStatus = "";
					this.thresholdStatusIcon = "";
					this.groupType = "";
					this.subtype = "";
					this.groupName = "";
					this.partitionDetails = {};
					this.virtualProps = []; // properties: ["Remote Source", "Remote DB", "Remote Owner", "Remote Object"]
					this.extendedProps = {
						isDelta: "",
						tableSize: "",
						recordCount: "",
						lastModifiedTime: ""
					};
				};

				//structure of partitionSpec
				/*var PartitionSpec = function() {
                    this.partitionId = "";
                    this.hostName = "";
                    this.portNo = "";
                    this.range = "";
                    this.recordCount = "";
                    this.columns="";
                };*/

				function getDisplayName(str) {
					function toCamel(str) {
						if (str) {
							return str.replace(/(\-[a-z])/g, function($1) {
								return $1.toUpperCase().replace('-', '');
							});
						} else {
							return str;
						}
					}
					switch (str) {
						case modelClass.PartitionSpecificationType.HASH:
							return HASH;
						case modelClass.PartitionSpecificationType.RANGE:
							return RANGE;
						case modelClass.PartitionSpecificationType.ROUND_ROBIN:
							return ROUND_ROBIN;
						case modelClass.PartitionSpecificationType.NONE:
							return NOT_PARTITIONED;
						default:
							return toCamel(str);
					}
				}
				//--------------------------------------------------------------------------
				//JOIN DETAILS MODEL
				//--------------------------------------------------------------------------
				function getCardianlity(c) {
					var cardinalityTypes = {
						"NONE": "",
						"C1_1": "1..1",
						"C1_N": "1..n",
						"CN_1": "n..1",
						"CN_N": "n..m"
					};
					return cardinalityTypes[c];
				}

				function getJoinType(j) {
					var joinTypes = {
						"inner": resourceLoader.getText("txt_inner_join"),
						"leftOuter": resourceLoader.getText("txt_left_outer"),
						"rightOuter": resourceLoader.getText("txt_right_outer"),
						"textTable": resourceLoader.getText("txt_text_join")
					};
					return joinTypes[j];
				}
				if (this._viewNode.type === "JoinNode" && this._model.columnView.getDefaultNode() !== this._viewNode) {
					if (this._viewNode.joins.size() === 1) {
						var joinDef = this._viewNode.joins.get(0);
						var leftInput = joinDef.leftInput;
						var rightInput = joinDef.rightInput;
						if (leftInput && rightInput) {
							if (leftInput.getSource().type === "DATA_BASE_TABLE" && rightInput.getSource().type === "DATA_BASE_TABLE") {
								this._analysisModel.joinDefinition.isApplicable = true;
								this._analysisModel.joinDefinition.leftTable = leftInput.getSource().fqName;
								this._analysisModel.joinDefinition.rightTable = rightInput.getSource().fqName;
								this._analysisModel.joinDefinition.cardinality = getCardianlity(joinDef.cardinality);
								this._analysisModel.joinDefinition.joinType = getJoinType(joinDef.joinType);
								if (joinDef.validationStatus) {
									this._analysisModel.joinDefinition.isJoinValidated = true;
								}
								if (joinDef.isJoinValidated) {
									this._analysisModel.joinDefinition.proposedCardinality = joinDef.proposedCardinality;
									if (joinDef.isReferential) {
										this._analysisModel.joinDefinition.referential = resourceLoader.getText("txt_is_maintained");
									} else {
										this._analysisModel.joinDefinition.referential = resourceLoader.getText("txt_not_maintained");
									}
								}
								this._analysisModel.joinDefinition.status = joinDef.validationStatusMessage;
								this._analysisModel.joinDefinition.statusIcon = joinDef.validationStatusIcon;
							}
						}

					}
					if (!this._analysisModel.joinDefinition.isApplicable) {
						this._analysisModel.joinDefinition.isJoinValidated = true;
					}
				}

				function getColumns(pss) {
					var cols = {
						cols1: "",
						cols2: ""
					};
					if (pss.size() > 0) {
						//1st level
						for (var e = 0; e < pss.get(0).expressions.size(); e++) {
							var exp = pss.get(0).expressions.get(e);
							if(exp.element){
							cols.cols1 = cols.cols1.concat(exp.element.name).concat(",");
							}
						}
						cols.cols1 = cols.cols1.substring(0, cols.cols1.length - 1);
						//2nd level
						if (pss.size() > 1) {
							for (var e = 0; e < pss.get(1).expressions.size(); e++) {
								var exp = pss.get(1).expressions.get(e);
								if(exp.element){
								cols.cols2 = cols.cols2.concat(exp.element.name).concat(",");
								}
							}
							cols.cols2 = cols.cols2.substring(0, cols.cols2.length - 1);
						}
					}
					return cols;
				}

				function getPartitionDetails(pds, cols) {
					var detail = {},
						recordCount = 0;
					for (var i = 0; i < pds.size(); i++) {
						var pd = pds.getAt(i);

						detail[i] = {
							partitionId: pd.partitionId,
							hostName: pd.host,
							portNo: pd.port,
							range: pd.range,
							recordCount: pd.recordCount,
							columns: cols.cols1
						};
						recordCount += parseInt(pd.recordCount, 10);
						for (var j = 0; j < pd.subpartitionDetails.size(); j++) {
							var spd = pd.subpartitionDetails.getAt(j);
							detail[i][j] = {
								partitionId: spd.partitionId,
								range: spd.range,
								recordCount: spd.recordCount,
								columns: cols.cols2
							};
						}
					}
					return {
						detail: detail,
						recordCount: recordCount.toString()
					};
				}

				function getPartitionType(pss) {
					var type = "";
					for (var i = 0; i < pss.size(); i++) {
						type = type.concat(getDisplayName(pss.getAt(i).type)).concat("-");
					}
					return type.substring(0, type.length - 1);
				}

				//--------------------------------------------------------------------------
				//DATASOURCES MODEL
				//--------------------------------------------------------------------------
				//make unique list of entities without aliases
				var sources = [];
				if (this._viewNode.inputs.size() > 0) {
					for (var i = 0; i < this._viewNode.inputs.size(); i++) {
						if (this._viewNode.inputs.get(i)) {
							var source = this._viewNode.inputs.get(i).getSource();
							if (source && source.type === "DATA_BASE_TABLE" && (sources.indexOf(source) < 0) && typeof this._viewNode.inputs.get(i).alias ===
								'undefined') {
								sources.push(source);
							}
						}
					}
				}
				if (sources.length === 0) {
					that._analysisModel.isAnalysisDataLoaded = true;
				}
				sources.forEach(function(source) {
					var entity = new Entity(source.fqName);
					if (source.subtype) {
						that._analysisModel.isAnalysisDataLoaded = true;
						entity.tableType = getDisplayName(source.subtype);
					}
					if (source.tableGroup && that._model.isScaleOut) {
						that._analysisModel.isAnalysisDataLoaded = true;
						entity.groupType = source.tableGroup.groupType;
						entity.subtype = source.tableGroup.subtype;
						entity.groupName = source.tableGroup.groupName;
					}
					//order -> "Remote Source", "Remote DB", "Remote Owner", "Remote Object"
					if (source.subtype === VIRTUAL && source.virtualProperties) {
						that._analysisModel.isAnalysisDataLoaded = true;
						entity.virtualProps.push({
							key: "Remote Source",
							value: source.virtualProperties.remoteSource
						});
						entity.virtualProps.push({
							key: "Remote DB",
							value: source.virtualProperties.remoteDb
						});
						entity.virtualProps.push({
							key: "Remote Owner",
							value: source.virtualProperties.remoteOwner
						});
						entity.virtualProps.push({
							key: "Remote Object",
							value: source.virtualProperties.remoteObject
						});
					}
					if (source.subtype === ROW && source.recordCount) {
						that._analysisModel.isAnalysisDataLoaded = true;
						entity.recordCount = source.recordCount;
					}
					if (source.hasPartitionSpecifications) {
						that._analysisModel.isAnalysisDataLoaded = true;
						entity.partitionType = getPartitionType(source.partitionSpecifications);
						if (source.hasPartitionDetails) {
							var cols = getColumns(source.partitionSpecifications);
							var pd = getPartitionDetails(source.partitionDetails, cols);
							entity.partitionDetails = pd.detail;
							entity.recordCount = pd.recordCount;
							if (parseInt(entity.recordCount, 10) > THRESHOLD_VALUE) {
								entity.thresholdStatus = resourceLoader.getText("txt_count_exceeded_threshold");
								entity.thresholdStatusIcon = resourceLoader.getImagePath("Warning.png");
							}
						}
					}else{
					    that._analysisModel.isAnalysisDataLoaded = true;
						entity.partitionType = 'Not partitioneed';
					    if (source.hasPartitionDetails) {
					        var cols = getColumns(source.partitionSpecifications);
							var pd = getPartitionDetails(source.partitionDetails, cols);
							if(pd){
							entity.partitionDetails = pd.detail;
							entity.recordCount = pd.recordCount;
							if (parseInt(entity.recordCount, 10) > THRESHOLD_VALUE) {
								entity.thresholdStatus = resourceLoader.getText("txt_count_exceeded_threshold");
								entity.thresholdStatusIcon = resourceLoader.getImagePath("Warning.png");
							}
							}
					    }
					}
					if (source.isProxy && !that._analysisModel.isAnalysisDataLoaded) {
						that._analysisModel.isAnalysisDataLoaded = true;
					}
					that._analysisModel.entities.push(entity);
				});
			},

			refresh: function(event) {
				var that = this;
				if (this._dsProgressLbl) {
					this._dsProgressLbl.setVisible(true);
				}
				if (this._joinProgressLbl) {
					this._joinProgressLbl.setVisible(true);
				}
				this._service.clearJoinData(this._viewNode);
				this._service.injectAnalysisData(function() {
					that._constructUiModel();
					if (that._analysisModel.joinDefinition.isApplicable && that._jsonModels.joinDef) {
						that._jsonModels.joinDef.setData(that._analysisModel.joinDefinition);
						that._jsonModels.joinDef.updateBindings(true);
					}
					if (that._joinLayout) {
						that._joinLayout.removeContent(1);
						if (that._analysisModel.joinDefinition.isApplicable) {
							that._joinLayout.addContent(that._joinDetails);
						} else {
							that._joinLayout.addContent(that._notApplicableLayout);
						}
					}
					if (that._jsonModels.dataSource) {
						that._jsonModels.dataSource.setData(that._analysisModel.entities);
						that._jsonModels.dataSource.updateBindings(true);
					}
					if (that._oDataSourceTbl) {
						that._oDataSourceTbl.setSelectedIndex(0);
						that._oDataSourceTbl.fireRowSelectionChange({
							rowIndex: 0,
							rowContext: {
								oModel: that._jsonModels.dataSource
							}
						});
					}
					if (that._dsProgressLbl) {
						that._dsProgressLbl.setVisible(false);
					}
					if (that._joinProgressLbl) {
						that._joinProgressLbl.setVisible(false);
					}
					if (!event) {
				    	that._subscribeEvents(event);
					}
				});
			},

			getContent: function() {
				if (this._viewNode.type === "JoinNode") {
					//create a horizontal Splitter
					var oSplitterH = new sap.ui.commons.Splitter();
					oSplitterH.setSplitterOrientation(sap.ui.commons.Orientation.horizontal);
					oSplitterH.setSplitterPosition("30%");
					oSplitterH.setWidth("100%");
					oSplitterH.setHeight("100%");

					oSplitterH.addFirstPaneContent(this._getJoinDetailsSection());
					oSplitterH.addSecondPaneContent(this._getDataSourceDetailsSection());

					oSplitterH.addStyleClass("customProperties");
					oSplitterH.addStyleClass("viewPropertiesPane");
					return oSplitterH;
				} else {
					return this._getDataSourceDetailsSection();
				}
			},

			_getJoinDetailsSection: function() {
				var that = this;
				var loMatrix = new sap.ui.commons.layout.MatrixLayout({
					layoutFixed: false,
					width: '100%',
					widths: ['15%', '25%', '25%', '25%', '10%'],
					columns: 5
				});

				//left table
				var loleftTableLabel = new sap.ui.commons.Label({
					text: resourceLoader.getText("txt_left_table"),
					textAlign: "Left",
					width: '100%'
				});

				var leftTableField = new sap.ui.commons.TextField({
					value: "{leftTable}",
					tooltip: "{leftTable}",
					editable: false,
					enabled: false,
					width: '100%'
				});

				loleftTableLabel.setLabelFor(leftTableField);

				//right table
				var loRightTableLabel = new sap.ui.commons.Label({
					text: resourceLoader.getText("txt_right_table"),
					textAlign: "Left",
					width: '100%'
				});

				var rightTableField = new sap.ui.commons.TextField({
					value: "{rightTable}",
					tooltip: "{rightTable}",
					editable: false,
					enabled: false,
					width: '100%'
				});

				loRightTableLabel.setLabelFor(rightTableField);

				loMatrix.createRow(loleftTableLabel, leftTableField, loRightTableLabel, rightTableField);

				//join type
				var loJoinTypeLabel = new sap.ui.commons.Label({
					text: resourceLoader.getText("txt_join_type"),
					textAlign: "Left",
					width: '100%'
				});

				var joinTypeField = new sap.ui.commons.TextField({
					value: "{joinType}",
					tooltip: "{joinType}",
					editable: false,
					enabled: false,
					width: '100%'
				});

				loJoinTypeLabel.setLabelFor(joinTypeField);

				//refrential integrity
				var loRefIntegrityLabel = new sap.ui.commons.Label({
					text: resourceLoader.getText("txt_referential_integrity"),
					textAlign: "Left",
					width: '100%'
				});

				var refIntegrityField = new sap.ui.commons.TextField({
					value: "{referential}",
					tooltip: "{referential}",
					editable: false,
					enabled: false,
					width: '100%'
				});

				loRefIntegrityLabel.setLabelFor(refIntegrityField);

				loMatrix.createRow(loJoinTypeLabel, joinTypeField, loRefIntegrityLabel, refIntegrityField);

				//cardinality
				var loCardinalityLabel = new sap.ui.commons.Label({
					text: resourceLoader.getText("txt_cardinality"),
					textAlign: "Left",
					width: '100%'
				});

				var cardinalityField = new sap.ui.commons.TextField({
					value: "{cardinality}",
					tooltip: "{cardinality}",
					editable: false,
					enabled: false,
					width: '100%'
				});

				loCardinalityLabel.setLabelFor(cardinalityField);

				//proposed cardinality
				var loProposedCardinalityLabel = new sap.ui.commons.Label({
					text: resourceLoader.getText("txt_proposed_cardinality"),
					textAlign: "Left",
					width: '100%'
				});

				var proposedCardinalityField = new sap.ui.commons.TextField({
					value: "{proposedCardinality}",
					tooltip: "{proposedCardinality}",
					editable: false,
					enabled: false,
					width: '100%'
				});

				loProposedCardinalityLabel.setLabelFor(proposedCardinalityField);

				loMatrix.createRow(loCardinalityLabel, cardinalityField, loProposedCardinalityLabel, proposedCardinalityField);

				//join validation
				var statusLbl = new sap.ui.commons.Label({
					icon: "{statusIcon}",
					text: "{status}",
					tooltip: "{status}",
					textAlign: "Left",
					width: '100%'
				}).addStyleClass("joinValidationStatus");

				this._joinDetails = new sap.ui.layout.VerticalLayout({
					height: "100%",
					content: [loMatrix, statusLbl]
				}).addStyleClass("joinPropertiesLayout");

				//not applicable info
				this._notApplicableLayout = new sap.ui.commons.layout.MatrixLayout({
					width: "100%",
					// widths: ['50%', '50%'],
					columns: 1
				});
				//header label
				var infoLabel = new sap.ui.commons.layout.MatrixLayoutCell({
					content: [new sap.ui.commons.Label({
						text: resourceLoader.getText("txt_not_applicable_for_join_node"),
						design: sap.ui.commons.LabelDesign.Standard
					})],
					hAlign: sap.ui.commons.layout.HAlign.Left,
					vAlign: sap.ui.commons.layout.VAlign.Center
				});

				this._notApplicableLayout.createRow(infoLabel);

				//section header
				var joinHeaderLayout = new sap.ui.commons.layout.MatrixLayout({
					width: "100%",
					widths: ['80%', '20%'],
					columns: 2
				});
				//header label
				var headerLbl = new sap.ui.commons.layout.MatrixLayoutCell({
					content: [new sap.ui.commons.Label({
						text: resourceLoader.getText("txt_join_details", [that._viewNode.name]),
						design: sap.ui.commons.LabelDesign.Bold
					})],
					hAlign: sap.ui.commons.layout.HAlign.Left,
					vAlign: sap.ui.commons.layout.VAlign.Center
				}).addStyleClass("viewPropertiesHeaderStyle");

				//validating progress
				this._joinProgressLbl = new sap.ui.commons.Label({
					icon: "/sap/hana/ide/common/images/throbber.gif",
					text: resourceLoader.getText("txt_validating"),
					design: sap.ui.commons.LabelDesign.Bold
				});

				joinHeaderLayout.createRow(headerLbl, new sap.ui.commons.layout.MatrixLayoutCell({
					content: [this._joinProgressLbl],
					hAlign: sap.ui.commons.layout.HAlign.Right,
					vAlign: sap.ui.commons.layout.VAlign.Center
				}).addStyleClass("viewPropertiesHeaderStyle"));

				//check if the model has join validation info, change visibility of joinProgressLbl
				if (this._analysisModel.joinDefinition.isJoinValidated) {
					this._joinProgressLbl.setVisible(false);
				}

				this._joinLayout = new sap.ui.layout.VerticalLayout({
					height: "100%"
				}).addStyleClass("viewPropertiesLayout");
				this._joinLayout.addContent(joinHeaderLayout);

				if (this._analysisModel.joinDefinition.isApplicable) {
					this._joinLayout.addContent(this._joinDetails);
				} else {
					this._joinProgressLbl.setVisible(false);
					this._joinLayout.addContent(this._notApplicableLayout);
				}
				var jsonModel = new sap.ui.model.json.JSONModel();
				this._jsonModels.joinDef = (jsonModel);
				jsonModel.setData(this._analysisModel.joinDefinition);
				this._joinLayout.setModel(jsonModel);
				return this._joinLayout;
			},

			_getDataSourceDetailsSection: function() {
				var that = this;
				var vLayout = new sap.ui.layout.VerticalLayout({
					height: "100%"
				}).addStyleClass("tableProperties");
				this._propsLayout = new sap.ui.layout.VerticalLayout({
					height: "100%"
				});
				vLayout.addContent(that._getDataSourceTable());
				vLayout.addContent(this._propsLayout);

				var dataSourceHeaderLayout = new sap.ui.commons.layout.MatrixLayout({
					width: "100%"
				});

				//loading progress
				this._dsProgressLbl = new sap.ui.commons.Label({
					icon: "/sap/hana/ide/common/images/throbber.gif",
					text: resourceLoader.getText("txt_loading"),
					design: sap.ui.commons.LabelDesign.Bold
				});

				dataSourceHeaderLayout.createRow(new sap.ui.commons.layout.MatrixLayoutCell({
					content: [new sap.ui.commons.Label({
						text: resourceLoader.getText("txt_data_source_details", [that._viewNode.name]),
						design: sap.ui.commons.LabelDesign.Bold
					})],
					hAlign: sap.ui.commons.layout.HAlign.Left,
					vAlign: sap.ui.commons.layout.VAlign.Center
				}).addStyleClass("viewPropertiesHeaderStyle"), new sap.ui.commons.layout.MatrixLayoutCell({
					content: [this._dsProgressLbl],
					hAlign: sap.ui.commons.layout.HAlign.Right,
					vAlign: sap.ui.commons.layout.VAlign.Center
				}).addStyleClass("viewPropertiesHeaderStyle"));

				//check if the model has partition details, then hide the progress label
				if (this._analysisModel.isAnalysisDataLoaded) {
					this._dsProgressLbl.setVisible(false);
				}

				var dataSourceLayout = new sap.ui.commons.layout.VerticalLayout({
					height: "100%",
					width: "100%"
				}).addStyleClass("viewPropertiesLayout");
				dataSourceLayout.addContent(dataSourceHeaderLayout);
				dataSourceLayout.addContent(vLayout);
				return dataSourceLayout;
			},

			_getDataSourceTable: function() {
				var that = this;

				function handleDSTableSelection(event) {
					if (that._propsLayout && event.getParameters().rowContext && typeof event.getParameters().rowIndex !== 'undefined') {
						var selectedEntity = event.getParameters().rowContext.oModel.oData[event.getParameters().rowIndex];
						var content = that._getDataSourcePropertiesSection(selectedEntity);
						that._propsLayout.destroyContent();
						that._propsLayout.addContent(content);
					}
				}

				//Create an instance of the table control
				this._oDataSourceTbl = new sap.ui.table.Table({
					visibleRowCount: 5,
					fixedColumnCount: 1,
					selectionMode: sap.ui.table.SelectionMode.Single,
					rowSelectionChange: handleDSTableSelection,
					selectionBehavior: sap.ui.table.SelectionBehavior.Row,
					navigationMode: sap.ui.table.NavigationMode.Scrollbar,
					visibleRowCountMode: sap.ui.table.VisibleRowCountMode.Interactive,
					noData: new sap.ui.commons.TextView({
						text: resourceLoader.getText("txt_no_catalog_tables")
					})
				}).addStyleClass("dataSourceTable");

				//Define the columns and the control templates to be used
				//data source
				this._oDataSourceTbl.addColumn(new sap.ui.table.Column({
					label: new sap.ui.commons.Label({
						text: resourceLoader.getText("txt_data_source"),
						tooltip: resourceLoader.getText("txt_data_source")
					}),
					template: new sap.ui.commons.TextView().bindProperty("text", "name"),
					sortProperty: "name",
					filterProperty: "name",
					width: "200px"
				}));

				//table type
				this._oDataSourceTbl.addColumn(new sap.ui.table.Column({
					label: new sap.ui.commons.Label({
						text: resourceLoader.getText("txt_table_type"),
						tooltip: resourceLoader.getText("txt_table_type")
					}),
					template: new sap.ui.commons.TextView().bindProperty("text", "tableType")
					//width: "150px"
				}));

				//partition type
				this._oDataSourceTbl.addColumn(new sap.ui.table.Column({
					label: new sap.ui.commons.Label({
						text: resourceLoader.getText("txt_partition_type"),
						tooltip: resourceLoader.getText("txt_partition_type")
					}),
					template: new sap.ui.commons.TextView().bindProperty("text", "partitionType")
					//width: "150px"
				}));

				//no of rows
				this._oDataSourceTbl.addColumn(new sap.ui.table.Column({
					label: new sap.ui.commons.Label({
						text: resourceLoader.getText("txt_no_of_rows"),
						tooltip: resourceLoader.getText("txt_no_of_rows")
					}),
					template: new sap.ui.commons.Label().bindProperty("text", "recordCount").bindProperty("tooltip", "thresholdStatus").bindProperty(
						"icon", "thresholdStatusIcon"),
					//width: "75px",
					hAlign: "Center"
				}));

				//group type
				this._oDataSourceTbl.addColumn(new sap.ui.table.Column({
					label: new sap.ui.commons.Label({
						text: resourceLoader.getText("txt_group_type"),
						tooltip: resourceLoader.getText("txt_group_type")
					}),
					template: new sap.ui.commons.TextView().bindProperty("text", "groupType"),
					visible: that._model.isScaleOut
					//width: "100px"
				}));

				//subtype
				this._oDataSourceTbl.addColumn(new sap.ui.table.Column({
					label: new sap.ui.commons.Label({
						text: resourceLoader.getText("txt_subtype"),
						tooltip: resourceLoader.getText("txt_subtype")
					}),
					template: new sap.ui.commons.TextView().bindProperty("text", "subtype"),
					visible: that._model.isScaleOut
					//width: "150px"
				}));

				//group name
				this._oDataSourceTbl.addColumn(new sap.ui.table.Column({
					label: new sap.ui.commons.Label({
						text: resourceLoader.getText("txt_group_name"),
						tooltip: resourceLoader.getText("txt_group_name")
					}),
					template: new sap.ui.commons.TextView().bindProperty("text", "groupName"),
					//width: "150px",
					visible: that._model.isScaleOut
				}));

				//Create a model and bind the table rows to this model
				var oModel = new sap.ui.model.json.JSONModel();
				this._jsonModels.dataSource = (oModel);
				oModel.setData(that._analysisModel.entities);
				this._oDataSourceTbl.setModel(oModel);
				this._oDataSourceTbl.bindRows("/");
				if (this._analysisModel.isAnalysisDataLoaded) {
					this._oDataSourceTbl.setSelectedIndex(0);
				}
				return this._oDataSourceTbl;
			},

			_getDataSourcePropertiesSection: function(selectedEntity) {
				if (selectedEntity && selectedEntity.partitionType && selectedEntity.partitionType !== NOT_PARTITIONED) {
					return this._getPartitionDetailsSection(selectedEntity);
				} else if (selectedEntity && selectedEntity.tableType === VIRTUAL) {
					return this._getVirtualDetailsSection(selectedEntity);
				}
			},

			_getVirtualDetailsSection: function(selectedEntity) {
				var virtualTable = new sap.ui.table.Table({
					visibleRowCount: 5,
					selectionMode: sap.ui.table.SelectionMode.Single,
					selectionBehavior: sap.ui.table.SelectionBehavior.Row,
					navigationMode: sap.ui.table.NavigationMode.Scrollbar,
					columns: [
                        new sap.ui.table.Column({
							label: resourceLoader.getText("txt_property"),
							tooltip: resourceLoader.getText("txt_property"),
							template: "key"
						}),
                        new sap.ui.table.Column({
							label: resourceLoader.getText("txt_value"),
							tooltip: resourceLoader.getText("txt_value"),
							template: "value"
						})
                    ]
					/*noData: new sap.ui.commons.TextView({
                        text: resourceLoader.getText("txt_no_catalog_tables")
                    })*/
				}).addStyleClass("dataSourceTable");

				var oModel = new sap.ui.model.json.JSONModel();
				this._jsonModels.dataSource = (oModel);
				oModel.setData(selectedEntity.virtualProps);
				virtualTable.setModel(oModel);
				virtualTable.bindRows("/");

				//section header
				var headerLayout = new sap.ui.commons.layout.MatrixLayout({
					width: "100%"
				});
				//header label
				var headerLbl = new sap.ui.commons.layout.MatrixLayoutCell({
					content: [new sap.ui.commons.Label({
						text: resourceLoader.getText("txt_virtual_details", [selectedEntity.name]),
						design: sap.ui.commons.LabelDesign.Bold
					})],
					hAlign: sap.ui.commons.layout.HAlign.Left,
					vAlign: sap.ui.commons.layout.VAlign.Center
				}).addStyleClass("viewPropertiesHeaderStyle");

				headerLayout.createRow(headerLbl);

				var layout = new sap.ui.layout.VerticalLayout({
					height: "100 %"
				}).addStyleClass("viewPropertiesLayout ");
				layout.addContent(headerLayout);
				layout.addContent(virtualTable);
				return layout;
			},

			_getPartitionDetailsSection: function(selectedEntity) {
				var columnsColumn = new sap.ui.table.Column({
					label: resourceLoader.getText("txt_columns"),
					tooltip: resourceLoader.getText("txt_columns"),
					template: "columns",
					visible: false
				});
				var rangeColumn = new sap.ui.table.Column({
					label: resourceLoader.getText("txt_range"),
					tootip: resourceLoader.getText("txt_range"),
					template: "range",
					visible: false
				});
				var partitionTable = new sap.ui.table.TreeTable({
					columns: [
                        new sap.ui.table.Column({
							label: resourceLoader.getText("txt_partition_id"),
							tooltip: resourceLoader.getText("txt_partition_id"),
							template: "partitionId"
						}),
                        new sap.ui.table.Column({
							label: resourceLoader.getText("txt_host"),
							tooltip: resourceLoader.getText("txt_host"),
							template: "hostName"
						}),
                        new sap.ui.table.Column({
							label: resourceLoader.getText("txt_port"),
							tooltip: resourceLoader.getText("txt_port"),
							template: "portNo"
						}),
                        columnsColumn,
                        rangeColumn,
                        new sap.ui.table.Column({
							label: resourceLoader.getText("txt_no_of_rows"),
							tooltip: resourceLoader.getText("txt_no_of_rows"),
							template: "recordCount"
						})
                    ],
					visibleRowCount: 5,
					selectionMode: sap.ui.table.SelectionMode.Single,
					//visibleRowCountMode: sap.ui.table.VisibleRowCountMode.Interactive,
					navigationMode: sap.ui.table.NavigationMode.Scrollbar,
					enableColumnReordering: true,
					expandFirstLevel: false
				}).addStyleClass("dataSourceTable");

				//check if entity has RANGE partition type, then make rangeColumn visible. Else, let it remain hidden
				if (selectedEntity.partitionType.indexOf(RANGE) > -1) {
					rangeColumn.setVisible(true);
				}
				//check if entity doesn't have ROUND ROBIN partition type, then make columnsColumn visible. Else, let it remain hidden
				if (selectedEntity.partitionType.indexOf(ROUND_ROBIN) === -1) {
					columnsColumn.setVisible(true);
				}

				//Create a model and bind the table rows to this model
				var oModel = new sap.ui.model.json.JSONModel();
				oModel.setData(selectedEntity.partitionDetails);
				partitionTable.setModel(oModel);
				partitionTable.bindRows("/");

				//section header
				var headerLayout = new sap.ui.commons.layout.MatrixLayout({
					width: "100%"
				});
				//header label
				var headerLbl = new sap.ui.commons.layout.MatrixLayoutCell({
					content: [new sap.ui.commons.Label({
						text: resourceLoader.getText("txt_partition_details", [selectedEntity.name]),
						design: sap.ui.commons.LabelDesign.Bold
					})],
					hAlign: sap.ui.commons.layout.HAlign.Left,
					vAlign: sap.ui.commons.layout.VAlign.Center
				}).addStyleClass("viewPropertiesHeaderStyle");

				headerLayout.createRow(headerLbl);

				var layout = new sap.ui.layout.VerticalLayout({
					height: "100 %"
				}).addStyleClass("viewPropertiesLayout ");
				layout.addContent(headerLayout);
				layout.addContent(partitionTable);
				return layout;
			},

			close: function() {
				this._analysisModel = {};
				//unsubscribe to events
				this._unsubscribeEvents();
			}
		};
		return PerformanceAnalysisTab;
	});
