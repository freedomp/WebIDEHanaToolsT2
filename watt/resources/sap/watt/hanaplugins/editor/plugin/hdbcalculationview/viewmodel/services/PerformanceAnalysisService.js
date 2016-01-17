/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define(["../model", "../../sharedmodel/sharedmodel", "../../util/ResourceLoader",
		],
	function(Model, SharedModel, ResourceLoader) {

		"use strict";
		var HASH = "HASH";
		var RANGE = "RANGE";
		var ROUNDROBIN = "ROUNDROBIN";
		var YEAR = "YEAR";
		var MONTH = "MONTH";
		var resourceLoader = new ResourceLoader("/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview");

		var PerformanceAnalysisService = function(viewModel, context) {
			this.viewModel = viewModel;
			//this.catalogDao = context.service.catalogDAO;
			this.settings = {
			    
				// maxResultSize: "",
				includePosColumn: "false"
				//limitLOBColumnSize: "",
				//measurePerformance: ""
			};
		};
		PerformanceAnalysisService.prototype = {
			injectAnalysisData: function(onCompleteHandler, errorHandler) {
				var promises = [];
				//------------------------------
				//construct the WHERE clause
				//------------------------------
				var whereClause = "";
				var isCatalogTablePresent = false;
				for (var idx = 0; idx < this.viewModel._entities.size(); idx++) {
					var entity = this.viewModel._entities.getAt(idx);
					if (entity.type === "DATA_BASE_TABLE") {
						whereClause = ('"SCHEMA_NAME" = \'').concat(entity.physicalSchema).concat('\' and "TABLE_NAME" = \'').concat(entity.name, '\'');
						isCatalogTablePresent = true;
						if ((typeof entity.hasPartitionSpecifications === 'undefined' || !entity.hasPartitionSpecifications)) {
							//-----------------------------------------
							//Fetch and inject PARTITION SPECIFICATIONS
							//-----------------------------------------
							promises.push(this._injectPartitionSpec(entity, whereClause));
						}

						if (typeof entity.tableGroup === "undefined") {
							//-------------------------------------
							//Fetch and inject GROUP DETAILS
							//-------------------------------------
							promises.push(this._injectGroupDetails(entity, whereClause));
						}
					}
				}

				if (isCatalogTablePresent && typeof this.viewModel.isScaleOut === 'undefined') {
					//-------------------------------
					//Check for SCALE OUT scenario
					//-------------------------------
					promises.push(this._checkScaleOutScenario());
				}

				//-------------------------------------
				//Fetch and inject JOIN VALIDATIONS
				//-------------------------------------
				promises.push(this._validateJoins());

				Q.all(promises).then(function() {
					if (onCompleteHandler) {
						onCompleteHandler();
					}
				}, function(error) {
					if (errorHandler) {
						errorHandler(error);
					}
				}).done();

			},

			_validateJoins: function() {
				var that = this;
				var validationPromises = [];
				var deferred = Q.defer();
				this.viewModel.columnView.viewNodes.foreach(function(viewNode) {
					if (viewNode.joins.size() > 0) {
						if (typeof viewNode.joins.getAt(0).isJoinValidated === 'undefined' || !viewNode.joins.getAt(0).isJoinValidated) {
							validationPromises.push(that.validateJoin(viewNode, viewNode.joins.getAt(0), true));
						}
					}
				});
				Q.all(validationPromises).then(function() {
					deferred.resolve();
				}, function() {
					deferred.resolve();
				});
				return deferred.promise;
			},

			//  CALL "PUBLIC"."GET_JOIN_INFO"(
			//	SCHEMANAMELEFT => 'MINI'/*<NVARCHAR(256)>*/,
			//	TABLENAMELEFT => 'TD1_PART_HASH'/*<NVARCHAR(256)>*/,
			//	COLUMNNAMESLEFT => 'K1'/*<NVARCHAR(5000)>*/,
			//	SCHEMANAMERIGHT => 'MINI'/*<NVARCHAR(256)>*/,
			//	TABLENAMERIGHT => 'TD1_PART_HASH_RANGE'/*<NVARCHAR(256)>*/,
			//	COLUMNNAMESRIGHT => 'K1'/*<NVARCHAR(5000)>*/,
			//	COLUMNDELIMITER => ','/*<NVARCHAR(1)>*/,
			//	CARDINALITY  => ?,
			//	ISREF  => ?
			//)
			validateJoin: function(viewNode, joinDef, isAllJoins) {
				var COLUMNDELIMITER = ";";
				if (typeof isAllJoins === "undefined") {
					isAllJoins = false;
				}
				var deferred = Q.defer();
				var msg = "";
				var isResolve = true;

				function getDelimitedColumnNames(elements) {
					var str = "";
					elements.foreach(function(element) {
						str = str.concat(element.name).concat(COLUMNDELIMITER);
					});
					return str.substring(0, str.length - 1);
				}

				function getCardianlity(c) {
					var cardinalityTypes = {
						"NONE": "",
						"1:1": "1..1",
						"1:n": "1..n",
						"n:1": "n..1",
						"n:n": "n..m",
						"": ""
					};
					return cardinalityTypes[c];
				}

				//in case of str join, the join node wud be the default node and we need to avoid star join nodes
				if (viewNode.type === "JoinNode" && this.viewModel.columnView.getDefaultNode() !== viewNode) {
					if (joinDef && joinDef.leftInput && joinDef.rightInput) {
						if (joinDef.leftInput.getSource().type === "DATA_BASE_TABLE" && joinDef.rightInput.getSource().type === "DATA_BASE_TABLE") {
							isResolve = false;
							if (joinDef.joinType === Model.JoinType.TEXT_TABLE) {
								joinDef.isJoinValidated = false;
								//information
								joinDef.validationStatus = "Information";
								joinDef.validationStatusMessage = "Join Type is Text Join. Join validation is not supported";
								joinDef.validationStatusIcon = resourceLoader.getImagePath("info.png");
								deferred.resolve(joinDef);
							} else {
								var stmt = ('CALL "PUBLIC"."GET_JOIN_INFO"(SCHEMANAMELEFT => \'').concat(joinDef.leftInput.getSource().physicalSchema).concat(
										'\', TABLENAMELEFT => \'\"').concat(joinDef.leftInput.getSource().name).concat('\"\', COLUMNNAMESLEFT => \'').concat(
										getDelimitedColumnNames(joinDef.leftElements)).concat('\', SCHEMANAMERIGHT => \'').concat(joinDef.rightInput.getSource().physicalSchema)
									.concat('\', TABLENAMERIGHT => \'\"').concat(joinDef.rightInput.getSource().name).concat('\"\', COLUMNNAMESRIGHT => \'').concat(
										getDelimitedColumnNames(joinDef.rightElements)).concat('\', COLUMNDELIMITER => \'').concat(COLUMNDELIMITER).concat(
										'\', CARDINALITY  => ?, ISREF  => ?)');

								var oStatement = {
									statement: stmt,
									type: "CALL"
								};

								/*this.catalogDao.sqlExecute(oStatement, this.settings, function(result) {
									if (result && result.message) {
										//ConsoleLogger.writeErrorMessage(result.message);
										joinDef.isJoinValidated = false;
										//error
										joinDef.validationStatus = "Error";
										joinDef.validationStatusMessage = result.message;
										joinDef.validationStatusIcon = resourceLoader.getImagePath("Error.png");
									}
									if (result && result.scalarOutputs && result.scalarOutputs.entries && result.scalarOutputs.entries.length > 0) {
										joinDef.isJoinValidated = true;
										joinDef.proposedCardinality = getCardianlity(result.scalarOutputs.entries[0][0]);
										joinDef.isReferential = !result.scalarOutputs.entries[0][1]; //0-> true, 1->false
										//update the joinDef with status and icon
										if (!joinDef.isReferential || joinDef.proposedCardinality !== joinDef.cardinality) {
											//warning
											joinDef.validationStatus = "Warning";
											joinDef.validationStatusIcon = resourceLoader.getImagePath("Warning.png");
											if (joinDef.proposedCardinality !== joinDef.cardinality) {
												joinDef.validationStatusMessage = resourceLoader.getText("msg_cardinality_mismatch");
											}
											if (!joinDef.isReferential) {
												if (joinDef.validationStatusMessage.length > 0) {
													joinDef.validationStatusMessage = joinDef.validationStatusMessage.concat("\n");
												}
												joinDef.validationStatusMessage = joinDef.validationStatusMessage.concat(resourceLoader.getText(
													"msg_not_referential_integrity"));
											}
										} else {
											//valid
											joinDef.validationStatus = "Valid";
											joinDef.validationStatusMessage = resourceLoader.getText("txt_join_validated");
											joinDef.validationStatusIcon = resourceLoader.getImagePath("StatusValid.png");
										}
									}
									deferred.resolve(joinDef);
								});*/
							}
						} else {
							msg = resourceLoader.getText("msg_validate_join_no_catalog_tables");
						}
					} else {
						msg = resourceLoader.getText("msg_validate_join_join_not_defined");
					}
				} else {
					msg = resourceLoader.getText("msg_validate_join_no_catalog_tables");
				}
				if (isResolve) {
					if (isAllJoins) {
						deferred.resolve(msg);
					} else {
						deferred.reject(msg);
					}
				}
				return deferred.promise;
			},

			//SELECT REMOTE_SOURCE_NAME, REMOTE_DB_NAME, REMOTE_OWNER_NAME, REMOTE_OBJECT_NAME FROM "PUBLIC"."VIRTUAL_TABLES" 
			//where ("SCHEMA_NAME" = <schema_name> and "TABLE_NAME" = <table_name>)
			_injectVirtualProperties: function(entity, whereClause) {
				var that = this;
				var deferred = Q.defer();
				//encoding gives error during sql execution
				var stmt = (('SELECT REMOTE_SOURCE_NAME, REMOTE_DB_NAME, REMOTE_OWNER_NAME, REMOTE_OBJECT_NAME FROM "PUBLIC"."VIRTUAL_TABLES" WHERE ').concat(
					whereClause));
				var oStatement = {
					statement: stmt,
					type: "SELECT"
				};
				/*this.catalogDao.sqlExecute(oStatement, this.settings, function(result) {
					if (result && result.errorCode) {
						//ConsoleLogger.writeErrorMessage(result.message);
					}
					if (result && result.entries && result.entries.length > 0) {
						var entry = result.entries[0];
						var virtualProperties = new Model.VirtualProperties({
							remoteSource: entry[0],
							remoteDb: entry[1],
							remoteOwner: entry[2],
							remoteObject: entry[3]
						});
						entity = that.viewModel.createOrMergeEntity({
							schemaName: entity.schemaName,
							name: entity.name,
							virtualProperties: virtualProperties
						});
					}
					deferred.resolve();
				});*/
				return deferred.promise;
			},

			//SELECT RECORD_COUNT FROM "PUBLIC"."M_RS_TABLES" 
			//where ("SCHEMA_NAME" = <schema_name> and "TABLE_NAME" = <table_name>)
			_injectRowProperties: function(entity, whereClause) {
				var that = this;
				var deferred = Q.defer();
				//encoding gives error during sql execution
				var stmt = (('SELECT RECORD_COUNT FROM "PUBLIC"."M_RS_TABLES" WHERE ').concat(
					whereClause));
				var oStatement = {
					statement: stmt,
					type: "SELECT"
				};
				/*this.catalogDao.sqlExecute(oStatement, this.settings, function(result) {
					if (result && result.errorCode) {
						//ConsoleLogger.writeErrorMessage(result.message);
					}
					if (result && result.entries && result.entries.length > 0) {
						var entry = result.entries[0];
						entity = that.viewModel.createOrMergeEntity({
							schemaName: entity.schemaName,
							name: entity.name,
							recordCount: entry[0]
						});
					}
					deferred.resolve();
				});*/
				return deferred.promise;
			},
			// SELECT count( * ) FROM "SYS"."M_LANDSCAPE_HOST_CONFIGURATION" where host_active = 'YES'
			_checkScaleOutScenario: function() {
				var that = this;
				var deferred = Q.defer();
				//encoding gives error during sql execution
				var stmt = (('SELECT count( * ) FROM "SYS"."M_LANDSCAPE_HOST_CONFIGURATION" where host_active = \'YES\''));
				var oStatement = {
					statement: stmt,
					type: "SELECT"
				};
				/*this.catalogDao.sqlExecute(oStatement, this.settings, function(result) {
					if (result && result.errorCode) {
						//ConsoleLogger.writeErrorMessage(result.message);
					}
					if (result && result.entries) {
						var entry = result.entries[0];
						that.viewModel.isScaleOut = parseInt(entry[0], 10) > 1 || false;
					}
					deferred.resolve();
				});*/
				return deferred.promise;
			},
			//select "SCHEMA_NAME", "TABLE_NAME", "PARTITION_SPEC", "TABLE_TYPE" from PUBLIC.TABLES 
			//where ("SCHEMA_NAME" = <schema_name> and "TABLE_NAME" = <table_name>)
			_injectPartitionSpec: function(entity, whereClause) {
				var that = this;
				var deferred = Q.defer();
				//encoding gives error during sql execution
				var stmt = (('SELECT "SCHEMA_NAME", "TABLE_NAME", "PARTITION_SPEC", "TABLE_TYPE" FROM PUBLIC.TABLES WHERE ').concat(whereClause));
				var oStatement = {
					statement: stmt,
					type: "SELECT"
				};

				function addSpecs(entity, spec) {
					function startsWith(str, pattern) {
						return str.slice(0, pattern.length) === pattern;
					}

					function endsWith(str, pattern) {
						return str.slice(-pattern.length) === pattern;
					}

					function contains(str, pattern) {
						return str.indexOf(pattern) > -1;
					}
					//parse string and construct PartitonSpec model object and return it
					if(spec && spec !== null){
					var specs = spec.split(";");
					for (var idx = 0; idx < specs.length; idx++) {
						var partitionStr = specs[idx].trim().split(" ");
						var ps = new Model.PartitionSpecification();
						ps.specificationString = specs[idx].trim();
						//HASH------------------------------------------------
						if (startsWith(partitionStr[0], HASH)) {
							ps.type = Model.PartitionSpecificationType.HASH;
							ps.numberOfPartitions = partitionStr[1];
							//expression
							var elements = partitionStr[2].split(",");
							for (var ele in elements) {
								var exp = new Model.PartitionExpression();

								if (startsWith(elements[ele], YEAR)) {
									var tokens = elements[ele].split("[()]");
									exp.expressionFunction = Model.PartitionExpressionFunction.YEAR;
									exp.element = entity.elements.get(tokens[1]);
								} else if (startsWith(elements[ele], MONTH)) {
									var tokens = elements[ele].split("[()]");
									exp.expressionFunction = Model.PartitionExpressionFunction.MONTH;
									exp.element = entity.elements.get(tokens[1]);
								} else {
									//reference to actual element
									exp.element = entity.elements.get(elements[ele]);
								}
								ps.expressions.add(exp);
							}
						}
						//RANGE--------------------------------------------------
						else if (startsWith(partitionStr[0], RANGE)) {
							ps.type = Model.PartitionSpecificationType.RANGE;
							if (endsWith(specs[idx], "*")) {
								ps.withOthers = true;
							} else {
								ps.withOthers = false;
							}
							//filters
							var dateRangeValue = partitionStr[2].substring(0, partitionStr[2].length - 1).split(",");
							for (var r in dateRangeValue) {
								var filter;
								if (!contains(dateRangeValue[r], "-")) {
									//single value filter
									filter = new SharedModel.ValueFilter({
										type: SharedModel.ValueFilterType.SINGLE_VALUE_FILTER,
										operator: SharedModel.ValueFilterOperator.EQUAL,
										value: dateRangeValue[r]
									});
								} else {
									//range value filter
									var values = dateRangeValue[r].split("-");
									filter = new SharedModel.ValueFilter({
										type: SharedModel.ValueFilterType.RANGE_VALUE_FILTER,
										operator: SharedModel.ValueFilterOperator.EQUAL,
										lowValue: values[0],
										highValue: values[1]
									});
								}
								ps.ranges.add(filter);
							}
							//expression
							var exp = new Model.PartitionExpression();
							var tokens = partitionStr[1].split("[()]");
							if (startsWith(partitionStr[1], YEAR)) {
								exp.expressionFunction = Model.PartitionExpressionFunction.YEAR;
								//reference to actual element
								exp.element = entity.elements.get(tokens[1]);
							} else if (startsWith(partitionStr[1], MONTH)) {
								exp.expressionFunction = Model.PartitionExpressionFunction.MONTH;
								//reference to actual element
								exp.element = entity.elements.get(tokens[1]);
							} else {
								//reference to actual element
								exp.element = entity.elements.get(partitionStr[1]);
							}

							ps.expressions.add(exp);
						}
						//ROUNDROBIN---------------------------------------------
						else if (startsWith(partitionStr[0], ROUNDROBIN)) {
							ps.type = Model.PartitionSpecificationType.ROUND_ROBIN;
							ps.numberOfPartitions = partitionStr[1];
						} else {
							ps.type = Model.PartitionSpecificationType.NONE;
						}
						entity.hasPartitionSpecifications = true;
						entity.partitionSpecifications.add(ps);
					}
					}
				}

				/*this.catalogDao.sqlExecute(oStatement, this.settings, function(result) {
					if (result && result.errorCode) {
						//ConsoleLogger.writeErrorMessage(result.message);
						entity = that.viewModel.createOrMergeEntity({
							schemaName: entity.schemaName,
							name: entity.name,
							hasPartitionSpecifications: false,
							errorLoadingPartitionSpecifications: result
						});
						deferred.resolve();
					}
					if (result && result.entries && result.entries.length > 0) {
						for (var row = 0; row < result.entries.length; row++) {
							var entry = result.entries[row];
							entity = that.viewModel.createOrMergeEntity({
								schemaName: entity.schemaName,
								name: entity.name,
								subtype: entry[3],
								hasPartitionSpecifications: false
							});
							addSpecs(entity, entry[2]);
						}
						if (entity.subtype === "VIRTUAL" && typeof entity.virtualProperties === "undefined") {
							//-----------------------------------------
							//Fetch and inject VIRTUAL PROPERTIES
							//-----------------------------------------
							that._injectVirtualProperties(entity, whereClause).then(function() {
								deferred.resolve();
							});
						} else if (entity.subtype === "ROW") {
							//-----------------------------------------
							//Fetch and inject ROW PROPERTIES
							//-----------------------------------------
							that._injectRowProperties(entity, whereClause).then(function() {
								deferred.resolve();
							});
						} else if ((typeof entity.hasPartitionDetails === 'undefined' || !entity.hasPartitionDetails)) {
							//-------------------------------------
							//Fetch and inject PARTITION DETAILS
							//-------------------------------------
							that._injectPartitionDetails(entity, whereClause).then(function() {
								deferred.resolve();
							});
						} else {
							deferred.resolve();
						}
					}
				});*/
				return deferred.promise;
			},

			//SELECT CST.TABLE_NAME,CST.SCHEMA_NAME, CST.PART_ID, CST.HOST, CST.PORT, CST.RECORD_COUNT, CSP.PARTITION, CSP.SUBPARTITION, CSP.RANGE 
			//FROM PUBLIC.M_CS_TABLES CST INNER JOIN PUBLIC.M_CS_PARTITIONS CSP 
			//ON CST.PART_ID = CSP.PART_ID AND CSP.TABLE_NAME = CST.TABLE_NAME AND CSP.SCHEMA_NAME = CST.SCHEMA_NAME
			//where ("SCHEMA_NAME" = <schema_name> and "TABLE_NAME" = <table_name>)
			_injectPartitionDetails: function(entity, whereClause) {
				var that = this;
				var deferred = Q.defer();

				function tuneWhereClause(prefix, clause) {
					function replaceAll(find, replace, str) {
						return str.replace(new RegExp(find, 'g'), replace);
					}
					var str = replaceAll('"SCHEMA_NAME"', prefix.concat('."SCHEMA_NAME"'), clause);
					return replaceAll('"TABLE_NAME"', prefix.concat('."TABLE_NAME"'), str);
				}
				//encoding gives error during sql execution
				var stmt = ((
					'SELECT CST.TABLE_NAME,CST.SCHEMA_NAME, CST.PART_ID, CST.HOST, CST.PORT, CST.RECORD_COUNT, CSP.PARTITION, CSP.SUBPARTITION, CSP.RANGE'
				).concat(' FROM PUBLIC.M_CS_TABLES CST INNER JOIN PUBLIC.M_CS_PARTITIONS CSP ').concat(
					' ON CST.PART_ID = CSP.PART_ID AND CSP.TABLE_NAME = CST.TABLE_NAME AND CSP.SCHEMA_NAME = CST.SCHEMA_NAME WHERE ').concat(
					tuneWhereClause("CST", whereClause)));
				var oStatement = {
					statement: stmt,
					type: "SELECT"
				};

				/*this.catalogDao.sqlExecute(oStatement, this.settings, function(result) {
					if (result && result.errorCode) {
						//ConsoleLogger.writeErrorMessage(result.message);
						entity = that.viewModel.createOrMergeEntity({
							schemaName: entity.schemaName,
							name: entity.name,
							hasPartitionDetails: false,
							errorLoadingPartitionDetails: result
						});
					}
					if (result && result.entries) {
						for (var row = 0; row < result.entries.length; row++) {
							var entry = result.entries[row];
							//var entity = that.viewModel._entities.get(FullQualifiedName.createForCatalogObject(entry[1], entry[0]).getFullQualifiedName());
							entity = that.viewModel.createOrMergeEntity({
								schemaName: entity.schemaName,
								name: entity.name,
								hasPartitionDetails: true
							});
							var createNewPartitionDetails = true;
							for (var idx = 0; idx < entity.partitionDetails.size(); idx++) {
								var pd = entity.partitionDetails.getAt(idx);
								if (pd.partitionId === entry[6]) {
									createNewPartitionDetails = false;
									pd.recordCount = (parseInt(pd.recordCount, 10) + parseInt(entry[5], 10)).toString();
									if (entity.partitionSpecifications && entity.partitionSpecifications.size() > 1) {
										var subDetails = new Model.PartitionDetail();
										subDetails.partitionId = entry[7];
										subDetails.range = entry[8];
										subDetails.recordCount = entry[5];
										pd.subpartitionDetails.add(subDetails);
									}
								}
							}
							if (createNewPartitionDetails) {
								var details = new Model.PartitionDetail();
								details.partitionId = entry[6];
								details.host = entry[3];
								details.port = entry[4];
								details.recordCount = entry[5];
								if (entity.partitionSpecifications && entity.partitionSpecifications.size() > 1) {
									var subDetails = new Model.PartitionDetail();
									subDetails.partitionId = entry[7];
									subDetails.range = entry[8];
									subDetails.recordCount = entry[5];
									details.subpartitionDetails.add(subDetails);
								} else {
									details.range = entry[8];
								}
								entity.partitionDetails.add(details);
							}
						}
					}
					deferred.resolve();
				});*/
				return deferred.promise;
			},
			//SELECT GROUP_TYPE, SUBTYPE, GROUP_NAME FROM "PUBLIC"."TABLE_GROUPS"
			//where ("SCHEMA_NAME" = <schema_name> and "TABLE_NAME" = <table_name>)
			_injectGroupDetails: function(entity, whereClause) {
				var that = this;
				var deferred = Q.defer();
				//encoding gives error during sql execution
				var stmt = (('SELECT GROUP_TYPE, SUBTYPE, GROUP_NAME FROM "PUBLIC"."TABLE_GROUPS" WHERE ').concat(whereClause));
				var oStatement = {
					statement: stmt,
					type: "SELECT"
				};

				/*this.catalogDao.sqlExecute(oStatement, this.settings, function(result) {
					if (result && result.errorCode) {
						//ConsoleLogger.writeErrorMessage(result.message);
						entity = that.viewModel.createOrMergeEntity({
							schemaName: entity.schemaName,
							name: entity.name,
							tableGroup: {}
						});
					}
					if (result && result.entries && result.entries.length > 0) {
						var entry = result.entries[0];
						var tableGroup = new Model.TableGroup({
							groupType: entry[0],
							subtype: entry[1],
							groupName: entry[2]
						});
						entity = that.viewModel.createOrMergeEntity({
							schemaName: entity.schemaName,
							name: entity.name,
							tableGroup: tableGroup
						});
					}
					deferred.resolve();
				});*/
				return deferred.promise;
			},
			clearData: function() {
				var that = this;
				if (this.viewModel.isScaleOut) {
					delete this.viewModel.isScaleOut;
				}
				for (var i = 0; i < this.viewModel._entities.size(); i++) {
					var entity = this.viewModel._entities.getAt(i);
					if (entity.subtype) {
						delete entity.subtype;
					}
					if (entity.hasPartitionSpecifications) {
						entity.hasPartitionSpecifications = false;
						entity.partitionSpecifications.clear();
					}
					if (entity.hasPartitionDetails) {
						entity.hasPartitionDetails = false;
						entity.partitionDetails.clear();
					}
					if (entity.tableGroup) {
						delete entity.tableGroup;
					}
					if (entity.virtualProperties) {
						delete entity.virtualProperties;
					}
					if (entity.recordCount) {
						delete entity.recordCount;
					}
				}
				this.viewModel.columnView.viewNodes.foreach(function(viewNode) {
					that.clearJoinData(viewNode);
				});
			},
			clearJoinData: function(viewNode) {
				if (viewNode.joins.size() > 0) {
					var join = viewNode.joins.getAt(0);
					if (join.isJoinValidated) {
						delete join.isJoinValidated;
						delete join.proposedCardinality;
						delete join.isReferential;
						delete join.validationStatus;
						delete join.validationStatusMessage;
						delete join.validationStatusIcon;
					}
				}
			}

		};

		return PerformanceAnalysisService;
	});
