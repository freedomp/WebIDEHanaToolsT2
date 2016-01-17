/** Copyright © 2015 SAP SE or an affiliate company. All rights reserved.**/

/*
 * Parser module for create statement
 */
/*global define*/
/*jshint -W024 */
/*eslint-disable no-constant-condition, quotes, max-statements, max-depth*/
/*jshint white: false */
define(function(require) {
	"use strict";

	var Parser = require("./parser"),
		defaultConfig = {
			"alter": {},
			"begin": {},
			"break": {},
			"call": {},
			"close": {},
			"continue": {},
			"create": {}, // enable the create statement, detailed, statement specific config. can be stored inside
			"declare": {},
			"do": {},
			"exec": {},
			"execute": {},
			"fetch": {},
			"for": {},
			"if": {},
			"loop": {},
			"open": {},
			"resignal": {},
			"return": {},
			"signal": {},
			"while": {}
		};

	/*
	 * declares a statement that is not allowed at top level but only inside a block
	 */
	Parser.prototype.procedureStmt = function(id, fud, parentSymbolTable) {
		var parser = this;

		return parser.stmt(id, function(rbp) {
			var result = this;

			if (this.parent < 0) {
				parser.error(this, "stmt_not_in_block");
				parser.skipRemaining();
				return undefined;
			}
			if (typeof fud === "function") {
				result = fud.call(this, rbp);
			} else {
				parser.skipRemaining();
			}
			return result;
		}, parentSymbolTable);
	};

	/*
    parse optional PRIMARY KEY identifier
    */
	Parser.prototype.parseOptionalPrimaryIdentifier = function() {
		if (this.advanceIf("PRIMARY") && this.advanceIf("KEY")) {
			return true;
		}
		return false;
	};

	/*
	 * Parses a table constraint.
	 */
	Parser.prototype.parseTableConstraint = function(constraints) {
		var constraint = {};
		if (this.advanceIf("UNIQUE")) {
			constraint.constraintType = "unique";
			if (this.advanceIf("BTREE")) {
				constraint.indexType = "btree";
			} else if (this.advanceIf("CPBTREE")) {
				constraint.indexType = "cpbtree";
			}
		} else if (this.advanceIf("PRIMARY")) {
			this.advance("KEY");
			constraint.constraintType = "primary key";
			if (this.advanceIf("BTREE")) {
				constraint.indexType = "btree";
			} else if (this.advanceIf("CPBTREE")) {
				constraint.indexType = "cpbtree";
			} else if (this.advanceIf("INVERTED")) {
				if (this.advanceIf("HASH")) {
					constraint.indexType = "inverted hash";
				} else if (this.advance("value")) {
					constraint.indexType = "inverted value";
				}
			}
			constraint.columns = this.parseColumnsList();
		} else if (this.advanceIf("FOREIGN")) {
			this.advance("KEY");
			constraint.constraintType = "foreign key";
			constraint.columns = this.parseColumnsList();
			if (this.advance("REFERENCES")) {
				var refactions = [];
				if (this.parseIdentifier("table")) {
					constraint.references = {
						identifier: this.token
					};
					if (this.nextToken.id === "(") {
						constraint.references.columns = this.parseColumnsList();
					}
					if (this.advanceIf("ON")) {
						while (true) {
							if (this.advanceIf("UPDATE") || this.advanceIf("DELETE")) {
								var refaction = {
									name: this.token.value
								};
								if (this.advanceIf("RESTRICT") || this.advanceIf("CASCADE")) {
									refaction.value = this.token.value;
								} else if (this.advanceIf("SET")) {
									if (this.advanceIf("NULL") || this.advanceIf("DEFAULT")) {
										refaction.value = this.token.value;
									} else {
										this.error(this.nextToken, "expected_referential_action");
									}
								} else {
									this.error(this.nextToken, "expected_referential_action");
								}
								refactions.push(refaction);
							} else {
								this.error(this.nextToken, "expected_referential_action");
								break;
							}

							if (!this.advanceIf("ON")) {
								break;
							}
						}

						constraint.references.actions = refactions;
					}
				}
			}
		}
		if (constraint.constraintType) {
			constraints.push(constraint);
			return constraint;
		}
	};

	/*
	 * Parses a column definition, e.g. in CREATE TYPE xxx AS TABLE () or DECLARE xxx TABLE ()
	 * <column_list_definition> ::= ( <column_elem>[{, <column_elem>}...] )
	 * <column_elem> ::= <column_name> <data_type>[<column_store_data_type>][<ddic_data_type>]
	 * <column_name> ::= <identifier>
	 */
	Parser.prototype.parseColumnListDefinition = function() {
		var columns, parser = this;

		function parseColumnDefinition() {
			var tok;

			if (parser.parseIdentifier("column")) {
				tok = parser.token;
				tok.resolved = true;
				parser.parseDataType(tok, "column", false, true, true);
			}
			return tok;
		}

		if (this.advance("(")) {
			columns = this.makeParseList(parseColumnDefinition, "no_columns")();
			columns.resolved = true;
			this.advance(")");
		} else {
			columns = [];
		}
		return columns;
	};

	/*
	 * Parses a table element
	 * parse <column definition> [column constraint] |  <table constraint>
	 * (now just support <column definition>)
	 */
	Parser.prototype.parseTableElement = function(columns, constraints) {
		var tok, p0, p1, v0, v1, token, subquery;

		p0 = this.nextToken;
		v0 = p0 && p0.value ? p0.value.toUpperCase() : "";
		p1 = this.peek();
		v1 = p1 && p1.value ? p1.value.toUpperCase() : "";
		if (v0 === "UNIQUE") {
			if (v1 === "(") {
				this.parseTableConstraint(constraints);
				return;
			}
		} else if (v0 === "PRIMARY" || v0 === "FOREIGN") {
			if (v1 === "KEY") {
				this.parseTableConstraint(constraints);
				return;
			}
		}
		if (this.parseIdentifier("column")) {
			tok = this.token;
			tok.resolved = true;
			// data type is optional in case of CREATE TABLE ttt (...) AS (SELECT...)
			if (this.parseDataType(tok, "column", false, true, true, true)) {
				//if (this.parseOptionalPrimaryIdentifier()) {
				//    tok.isPrimaryKey = true;
				//}
				while (true /*this.nextToken.id !== ","*/ /* && this.nextToken.identifier !== "PRIMARY" && this.nextToken.id !== ")" */ ) {
					if (this.advanceIf("NOT")) {
						if (this.advance("NULL")) {
							tok.isNull = false;
						}
					} else if (this.advanceIf("NULL")) {
						tok.isNull = true;
					} else if (this.advanceIf("DEFAULT")) {
						if (this.advanceIf("NULL")) {
							tok.defaultValue = "null";
						} else if (typeof this.parseOptionalInteger() !== "undefined") {
							tok.defaultValue = this.token.number;
						} else {
							tok.defaultValue = this.parseString();
						}
					} else if (this.advanceIf("MEMORY")) {
						if (this.advance("THRESHOLD")) {
							if (this.advanceIf("NULL")) {
								tok.threshold = "null";
							} else {
								tok.threshold = this.parseInteger();
							}
						}
					} else if (this.advanceIf("GENERATED")) {
						if (this.advanceIf("BY")) {
							if (this.advance("DEFAULT")) {
								tok.generated = "byDefault";
							}
						} else if (this.advance("ALWAYS")) {
							tok.generated = "always";
						}
						if (this.advance("AS")) {
							if (this.advanceIf("IDENTITY")) {
								var seqOp = [];
								tok.asIdentity = true;
								// parse sequence param list
								if (this.advanceIf("(")) {
									while (true) {
										if (this.advanceIf("START")) {
											if (this.advance("WITH")) {
												seqOp.push({
													name: "startWith",
													value: this.parseInteger()
												});
											}
										} else if (this.advanceIf("INCREMENT")) {
											if (this.advance("BY")) {
												seqOp.push({
													name: "incrementBy",
													value: this.parseInteger()
												});
											}
										} else if (this.advanceIf("MAXVALUE")) {
											seqOp.push({
												name: "maxValue",
												value: this.parseInteger()
											});
										} else if (this.advanceIf("MINVALUE")) {
											seqOp.push({
												name: "minValue",
												value: this.parseInteger()
											});
										} else if (this.advanceIf("CYCLE")) {
											seqOp.push({
												name: "cycle",
												value: true
											});
										} else if (this.advanceIf("CACHE")) {
											seqOp.push({
												name: "cache",
												value: this.parseInteger()
											});
										} else if (this.advanceIf("NO")) {
											if (this.advanceIf("MAXVALUE")) {
												seqOp.push({
													name: "noMaxValue",
													value: true
												});
											} else if (this.advanceIf("MINVALUE")) {
												seqOp.push({
													name: "noMinValue",
													value: true
												});
											} else if (this.advanceIf("CYCLE")) {
												seqOp.push({
													name: "noCycle",
													value: true
												});
											} else if (this.advanceIf("CACHE")) {
												seqOp.push({
													name: "noCache",
													value: true
												});
											} else {
												this.error(this.nextToken, "expected_option");
											}
										}
										if (!this.advanceIf(",")) {
											break;
										}
									}
									this.advance(")");
									tok.generatedSeqOps = seqOp;
								}

								if (this.advanceIf("RESET")) {
									if (this.advance("BY")) {
										token = this.nextToken;
										subquery = this.parseExpression(0, true);
										if (!subquery || subquery.id !== "SELECT") {
											this.error(token, "expected_subquery");
										} else {
											tok.resetBy = subquery;
										}
									}
								}
							} else {
								tok.generated = this.parseExpression();
							}
						}
					} else if (this.advanceIf("ENABLE")) {
						if (this.advance("SCHEMA") && this.advance("FLEXIBILITY")) {
							tok.schemaFlex = "enable";
						}
					} else if (this.advanceIf("DISABLE")) {
						if (this.advance("SCHEMA") && this.advance("FLEXIBILITY")) {
							tok.schemaFlex = "disable";
						}
					} else if (this.advanceIf("FUZZY")) {
						if (this.advance("SEARCH")) {
							if (this.advanceIf("MODE")) {
								if (this.advanceIf("NULL")) {
									tok.fuzzyMode = "null";
								} else {
									this.parseString();
									tok.fuzzyMode = this.token;
								}
							} else if (this.advance("INDEX")) {
								if (this.advanceIf("ON")) {
									tok.fuzzyIndex = "on";
								} else if (this.advanceIf("OFF")) {
									tok.fuzzyIndex = "off";
								}
							}
						}
					} else if (this.advanceIf("PAGE")) {
						if (this.advance("LOADABLE")) {
							this.loadable = "page";
						}
					} else if (this.advanceIf("COLUMN")) {
						if (this.advance("LOADABLE")) {
							this.loadable = "column";
						}
					} else if (this.advanceIf("UNIQUE")) {
						if (this.advanceIf("CBPTREE")) {
							tok.isUnique = "CPBTREE";
						} else if (this.advanceIf("BTREE")) {
							tok.isUnique = "BTREE";
						}
					} else if (this.advanceIf("PRIMARY")) {
						if (this.advance("KEY")) {
							if (this.advanceIf("CBPTREE")) {
								tok.isPrimaryKey = "CPBTREE";
							} else if (this.advanceIf("BTREE")) {
								tok.isPrimaryKey = "BTREE";
							} else if (this.advanceIf("INVERTED")) {
								if (this.advanceIf("HASH")) {
									tok.isPrimaryKey = "INVERTED HASH";
								} else if (this.advanceIf("VALUE")) {
									tok.isPrimaryKey = "INVERTED VALUE";
								} else {
									tok.isPrimaryKey = "INVERTED";
								}
							} else {
								tok.isPrimaryKey = true;
							}
						}
					} else if (this.advanceIf("REFERENCES")) {
						tok.ref = {};
						var table = this.parseIdentifier("table"),
							cols = [],
							refactions = [];
						if (table) {
							tok.ref.table = table;
							if (this.nextToken.id === "(") {
								cols = this.parseColumnsList();
								if (cols.length > 0) {
									tok.ref.columns = cols;
								}
							}

							if (this.advanceIf("ON")) {
								while (true) {
									if (this.advanceIf("UPDATE") || this.advanceIf("DELETE")) {
										var refaction = {
											name: this.token.value
										};
										if (this.advanceIf("RESTRICT") || this.advanceIf("CASCADE")) {
											refaction.value = this.token.value;
										} else if (this.advanceIf("SET")) {
											if (this.advanceIf("NULL") || this.advanceIf("DEFAULT")) {
												refaction.value = this.token.value;
											} else {
												this.error(this.nextToken, "expected_referential_action");
											}
										} else {
											this.error(this.nextToken, "expected_referential_action");
										}
										refactions.push(refaction);
									} else {
										this.error(this.nextToken, "expected_referential_action");
										break;
									}

									if (!this.advanceIf("ON")) {
										break;
									}
								}

								tok.ref.actions = refactions;
							}
						}
					} else {
						break;
					}

					if (this.nextToken.id === "," || this.nextToken.id === ")") {
						break;
					}
				}
			}
			columns.push(tok);
		}
	};

	/*
	 * Parses a table type deflinition.
	 */
	Parser.prototype.parseOptionalTableTypeDefinition = function(tok) {
		if (this.advanceIf("TABLE")) {
			tok.dataType = {
				resolved: true,
				kind: "tableType",
				identifier: "TABLE_TYPE"
			};
			tok.dataType.columns = this.parseColumnListDefinition();
			return true;
		} else {
			return false;
		}
	};

	/*
	 * Parses a procedure or function's parameter definition
	 */
	Parser.prototype.parseProcedureParameter = function() {
		var tok, parameterType;

		if (this.advanceIf("IN")) {
			parameterType = "IN";
		} else if (this.advanceIf("OUT")) {
			parameterType = "OUT";
		} else if (this.advanceIf("INOUT")) {
			parameterType = "INOUT";
		} else {
			parameterType = "IN";
		}

		if (this.parseIdentifier("variable")) {
			tok = this.token;
			tok.parameterType = parameterType;
			tok.resolved = true;
			if (!this.parseOptionalTableTypeDefinition(tok)) {
				this.parseDataType(tok, "variable", true);
			}
			if (parameterType === "IN" && this.advanceIf("DEFAULT")) {
				if (this.parseOptionalNumber(true)) {
					tok.defaultValue = this.token;
				} else if (this.parseString()) {
					tok.defaultValue = this.token;
				}
			}
			return tok;
		}
	};

	/*
	 * Parses a procedure or function's parameter definition
	 */
	Parser.prototype.parseProcedureParameterList = function() {
		var tok,
			position = 1,
			params = [];

		if (this.advanceIf("(")) {
			// empty parameter list allowed
			while (this.nextToken.id !== ")") {
				tok = this.parseProcedureParameter();
				if (tok) {
					tok.position = position++;
					params.push(tok);
				}
				if (!this.advanceIf(",")) {
					break;
				}
			}
			this.advance(")");
		}

		return params;
	};

	function init(parser) {
		var parseCreate, parseAlter;

		function parseCreateObject(tok, kind, deferredDefine) {
			var id;

			function define() {
				if (tok.id === "CREATE" && tok.identifier) {
					parser.define(tok, undefined, parser.globalScope);
				}
			}

			tok.kind = kind || parser.token.value.toLowerCase();
			id = parser.parseObjectRef({
				pathType: tok.kind,
				globalObject: tok
			});
			if (id) {
				tok.identifier = id;
				if (id.schema) {
					tok.schema = id.schema;
				}
			}
			if (!deferredDefine) {
				define();
				return;
			} else {
				return define;
			}
		}

		function parsePartitionExpression() {
			return parser.parseExpression(0, undefined, "column");
		}

		function parseHashPartition() {
			var partition = {
				type: "hash"
			};

			parser.advance("(");
			partition.expressions = parser.makeParseList(parsePartitionExpression, "no_partition_expression")();
			parser.advance(")");
			parser.advance("PARTITIONS");
			partition.number = parser.parseInteger();

			return partition;
		}

		function parseRangeSpec() {
			// PARTITION '2010-02-03' <= VALUES < '2011-01-01', PARTITION VALUE = '2012-05-01', PARTITION OTHERS
			var oldSymbols,
				partitionExp = {},
				parseLiteral = function() {
					var value;
					if (parser.parseOptionalNumber()) {
						value = parser.token;
					} else if (parser.parseOptionalString()) {
						value = parser.token;
					} else {
						parser.error(parser.nextToken, "expected_literal");
					}
					return value;
				};

			oldSymbols = parser.operatorSymbolTable;
			parser.operatorSymbolTable = parser.logicalOperatorSymbolTable;
			parser.advance("PARTITION");
			if (parser.advanceIf("VALUE")) {
				parser.advance("=");
				partitionExp.value = parseLiteral();
			} else if (parser.advanceIf("OTHERS")) {
				partitionExp.others = true;
			} else {
				partitionExp.minValue = parseLiteral();
				parser.advance("<=");
				parser.advance("VALUES");
				parser.advance("<");
				partitionExp.maxValue = parseLiteral();
			}
			parser.operatorSymbolTable = oldSymbols;
			return partitionExp;
		}

		function parseRangePartition() {
			var partition = {
				type: "range"
			};

			if (parser.advance("(")) {
				partition.expression = parsePartitionExpression();
				parser.advance(")");
			}
			if (parser.advance("(")) {
				partition.ranges = parser.makeParseList(parseRangeSpec, "no_range_spec")();
				parser.advance(")");
			}
			return partition;
		}

		function parseRoundRobinPartition() {
			var partition = {
				type: "roundrobin"
			};

			parser.advance("PARTITIONS");
			partition.number = parser.parseInteger();
			return partition;
		}

		function parsePartitionClause(tok) {
			var second, partitions = [];

			if (!parser.advanceIf("PARTITION")) {
				return;
			}
			parser.advance("BY");
			parser.advanceCase({
				"HASH": parseHashPartition,
				"RANGE": parseRangePartition,
				"ROUNDROBIN": parseRoundRobinPartition
			}).then(function(partition) {
				partitions.push(partition);
				second = {
					"RANGE": parseRangePartition
				};
				if (partition.type === "hash") {
					second.HASH = parseHashPartition;
				}
				if (parser.advanceIf(",")) {
					parser.advanceCase(second).then(function(part) {
						partitions.push(part);
					});
				}
			});

			if (partitions.length > 0) {
				tok.partitions = partitions;
			}
		}

		function parseGroupClause(tok) {
			var group;

			while (parser.advanceIf("GROUP")) {
				group = group || {};
				if (parser.advanceIf("TYPE")) {
					group.type = parser.parseIdentifier();
				} else if (parser.advanceIf("SUBTYPE")) {
					group.subtype = parser.parseIdentifier();
				} else if (parser.advanceIf("NAME")) {
					group.name = parser.parseIdentifier();
				}
			}
			if (group) {
				tok.group = group;
			}
		}

		function parsePriorityUnload(tok) {
			if (!parser.advanceIf("UNLOAD")) {
				return;
			}
			parser.advance("PRIORITY");
			tok.unload = parser.parseInteger();
		}

		function parseAutoMerge(tok) {
			if (parser.advanceIf("NOT") || parser.advanceIf("AUTO")) {
				if (parser.advanceIf("AUTO")) {
					tok.merge = "not auto";
				} else {
					tok.merge = "auto";
				}
				parser.advance("MERGE");
			}
		}

		function parseLikeTable(tok) {
			var like = {};
			if (parser.advanceIf("LIKE")) {
				like.table = parser.parseObjectRef("table"); //parser.parseExpression(0, false, "table");
				if (parser.advanceIf("WITH") /*parser.token.id === "WITH"*/ ) {
					if (parser.advanceIf("NO")) {
						like.withData = false;
					} else {
						like.withData = true;
					}
					parser.advance("DATA");
				}
				var woo = {
						"AUTO": {
							"MERGE": {
								"end": true
							}
						},
						"HISTORY": {
							"end": true
						},
						"NO": {
							"LOGGING": {
								"end": true
							}
						},
						"PARTITION": {
							"end": true
						},
						"SCHEMA": {
							"FLEXIBILITY": {
								"end": true
							}
						},
						"UNLOAD": {
							"end": true,
							"PRIORITY": {
								"end": true
							}
						},
						"PRELOAD": {
							"end": true
						},
						"INDEX": {
							"end": true
						},
						"FUZZY": {
							"SEARCH": {
								"INDEX": {
									"end": true
								},
								"MODE": {
									"end": true
								}
							}
						},
						"GLOBAL": {
							"TEMPORARY": {
								"end": true
							}
						},
						"LOCAL": {
							"TEMPORARY": {
								"end": true
							}
						}
					},
					options = [];
				// -- for checking, not enable now;

				if (parser.advanceIf("WITHOUT")) {
					while (true) {
						var option = [],
							value, o = woo;
						while (!o.end) {
							value = parser.nextToken.value.toUpperCase();
							if (o[value]) {
								parser.advance();
								option.push(value);
								o = o[value];
							} else {
								parser.error(parser.nextToken, "expected_without_option");
								break;
							}
						}

						value = parser.nextToken.value.toUpperCase();
						if (o[value]) {
							parser.advance();
							option.push(value);
							o = o[value];
						}

						options.push(option);

						if (!parser.advanceIf("WITHOUT")) {
							break;
						}
					}

					like.options = options;
				}
				tok.like = like;
				return tok;
			}
		}

		function parseWithSchemaFlex(tok) {
			if (parser.advanceIf("WITH")) {
				if (parser.advance("SCHEMA") && parser.advance("FLEXIBILITY")) {
					tok.schemaFlex = true;
				}
			}
		}

		function parseAsSubquery(tok) {
			var token, subquery, as = {};
			tok.columnNames = tok.columns = parser.parseColumnsList();
			if (parser.advanceIf("AS")) {
				token = parser.nextToken;
				parser.advance('(');
				subquery = parser.parseExpression(0, true);
				if (!subquery || subquery.id !== "SELECT") {
					parser.error(token, "expected_subquery");
				} else {
					as.subquery = subquery;
					if (tok.columns.length === 0) {
						// no columns list specified, take over columns from subquery, otherwise columns list is resolved in analyzer
						tok.columns = subquery.columns;
					}
				}
				parser.advance(')');

				if (parser.advanceIf("WITH")) {
					if (parser.advanceIf("NO")) {
						as.withData = false;
					} else {
						as.withData = true;
					}
					parser.advance("DATA");
				}

				tok.as = as;
			}
		}

		/*
		 * parse LANGUAGE clause for procedure/function create definition
		 */
		function parseOptionalLanguage(tok) {
			var languages = "SQLSCRIPT | R | LLANG".split(" | ");

			if (parser.advanceIf("LANGUAGE")) {
				if (parser.nextToken.id === "(name)" && parser.nextToken.identifier && languages.indexOf(parser.nextToken.identifier) >= 0) {
					parser.advance();
					tok.language = parser.token;
				} else {
					parser.error(parser.nextToken, "expected_language");
				}
			}
		}

		/*
		 * parse SQL SECURITY clause for procedure/function create definition
		 */
		function parseOptionalSecurity(tok) {
			var modes = "DEFINER | INVOKER".split(" | ");

			if (parser.advanceIf("SQL")) {
				if (parser.advance("SECURITY")) {
					if (parser.nextToken.id === "(name)" && parser.nextToken.identifier && modes.indexOf(parser.nextToken.identifier) >= 0) {
						parser.advance();
						tok.security = parser.token;
					} else {
						parser.error(tok, "expected_language");
					}
				}
			}
		}

		/*
		 * parse DEFAULT SCHEMA clause for procedure/function create definition
		 */
		function parseOptionalDefaultSchema(tok) {
			if (parser.advanceIf("DEFAULT")) {
				if (parser.advanceIf("SCHEMA")) {
					tok.defaultSchema = parser.parseIdentifier("schema");
					parser.currentSchema = {
						identifier: parser.token
					}; // wrap with an object since the parser identifies SET SCHEMA the same way
				} else {
					parser.error(parser.nextToken, "expected_1_found_0", "SCHEMA");
				}
			}
		}

		/*
		 * parse READS SQL DATA [WITH RESULT VIEW <view_name>] clause for procedure/function create definition
		 */
		function parseOptionalReadView(tok) {
			if (parser.advanceIf("READS")) {
				if (parser.advance("SQL") && parser.advance("DATA")) {
					tok.readonly = true;
					if (parser.advanceIf("WITH")) {
						if (parser.advance("RESULT") && parser.advance("VIEW")) {
							tok.resultView = parser.parseIdentifier("view");
						}
					}
				}
			}
		}

		function parseVariableName() {
			if (parser.parseIdentifier("variable")) {
				return parser.token;
			}
		}

		function parseScalarVariableDeclaration(decl) {

			if (parser.advanceIf("CONSTANT")) {
				decl.constant = true;
			}
			parser.parseDataType(decl, "variable");
			if (parser.advanceIf("ARRAY")) {
				decl.isArray = true;
			} else {

				if (parser.advanceIf("NOT")) {
					if (parser.advance("NULL")) {
						decl.isNull = false;
					}
				} else if (parser.advanceIf("NULL")) {
					decl.isNull = true;
				}
			}

			if (parser.advanceIf(":=") || parser.advanceIf("DEFAULT")) {
				// TODO no subqueries allowed
				decl.defaultValue = parser.parseExpression(20);
			}
		}

		function parseVariableDeclaration(decl) {

			decl.variables = parser.makeParseList(parseVariableName, "no_variables")();

			if (parser.advanceIf("CONDITION")) {
				decl.kind = "condition";

				if (parser.advanceIf("FOR")) {
					parser.advance("SQL_ERROR_CODE");
					decl.errorCode = parser.parseInteger(false);
				}
				/*
                <proc_condition>         ::= <variable_name> CONDITION
                            | <variable_name> CONDITION FOR <sql_error_code>
                */
			} else {
				decl.kind = "variable";

				if (!parser.parseOptionalTableTypeDefinition(decl)) {
					parseScalarVariableDeclaration(decl);
				}

			}
		}

		/*
		 * parse procedural declaration block for procedure/function procedural block
		 */
		function parseOptionalProceduralDeclaration(stmt) {
			/*DECLARE {<proc_variable>|<proc_cursor>|<proc_condition>} ; */

			/*              <variable_name>           ::= <identifier> */
			/*<sql_error_code> ::= <unsigned_integer>*/

			function parseCursorDeclaration(decl) {
				var params = [],
					subquery, token;
				if (parser.advance("CURSOR")) {
					decl.kind = "cursor";
					var name = parser.parseIdentifier();
					if (name) {
						decl.name = name;
					}

					if (parser.advanceIf("(")) {
						while (true) {
							var param = {};
							param.name = parser.parseIdentifier();
							parser.parseDataType(param, "variable");
							params.push(param);

							if (!parser.advanceIf(",")) {
								break;
							}
						}
						parser.advance(")");
					}

					if (params.length > 0) {
						decl.parameters = params;
					}

					if (parser.advance("FOR")) {
						token = parser.nextToken;
						subquery = parser.parseExpression(0, true);
						if (!subquery || subquery.id !== "SELECT") {
							parser.error(token, "expected_subquery");
						} else {
							decl.subquery = subquery;
						}
					}

				}
				/*
                <proc_cursor>            ::= CURSOR <cursor_name> [ ( proc_cursor_param_list ) ] FOR <subquery> ;
                <proc_cursor_param_list> ::= <proc_cursor_param> [{,<proc_cursor_param>}...]
                <cursor_name>            ::= <identifier>
                <proc_cursor_param>      ::= <param_name> <datatype>
                */
			}

			function parseExitHanderDeclaration(decl) {
				var oldSymbolTable;

				if (parser.advance("EXIT") && parser.advance("HANDLER") && parser.advance("FOR")) {
					decl.kind = "exit handler";
					decl.handlers = [];
					oldSymbolTable = parser.symbolTable;
					parser.symbolTable = parser.stmtSymbolTable;
					while (true) {
						var handler = {};
						if (parser.advanceIf("SQLEXCEPTION")) {
							handler.kind = "sqlexception";
						} else if (parser.advanceIf("SQLWARNING")) {
							handler.kind = "sqlwarning";
						} else if (parser.advanceIf("SQL_ERROR_CODE")) {
							handler.kind = "sql_error_code";
							handler.errorCode = parser.parseInteger();
						} else {
							handler.kind = "variable";
							if (parser.parseIdentifier()) {
								handler.variable = parser.token;
							}
						}

						decl.handlers.push(handler);

						if (!parser.advanceIf(",")) {
							break;
						}
					}
					parser.symbolTable = oldSymbolTable;
					decl.stmt = parser.parseStatement(true);
				}
			}

			if (parser.nextToken.id === "CURSOR") {
				parseCursorDeclaration(stmt);
			} else if (stmt.id === "DECLARE" && parser.nextToken.identifier === "EXIT") {
				// exit handler declaration is not allowed outside BEGIN, i.e. DECLARE is mandatory
				parseExitHanderDeclaration(stmt);
			} else {
				parseVariableDeclaration(stmt);
			}
		}

		/*
		 * parse procedural declaration block for procedure/function procedural block
		 */
		function parseOptionalProceduralDeclarationList(tok) {
			var declStmt;

			tok.declarations = [];
			while (parser.nextToken.id === "DECLARE") {
				declStmt = parser.parseStatement();
				tok.declarations.push(declStmt);
			}
		}

		/*
		 * parser statement block of procedure/function create definition
		 */
		function parseStatementBlock(block) {

			if (parser.advanceIf("SEQUENTIAL")) {
				if (parser.advance("EXECUTION")) {
					block.sequentialExecution = true;
				}
			}

			/*
            <procedure_body> := [<proc_decl_list>]
                                             [<proc_handler_list>] 
                                              <proc_stmt_list>
            */
			parseOptionalProceduralDeclarationList(block);
			block.statements = parser.parseStatements();
			return block;
		}

		/*
		 * Parses a block symbol followed by a list of declarations and statements w/o END.
		 * In case of a top level block starting with AS, just a single BEGIN statement including 'END;' is parsed.
		 *
		 * @param id start symbol of the block, e.g. BEGIN, THEN, DO, ELSE
		 */
		function parseBlock(id) {
			var found, tok,
				oldSymbolTable = parser.symbolTable;

			// a block starts with a symbol like BEGIN, THEN, DO, ...
			// followed by a list of statements: DECLARE, IF, BEGIN, ...
			// before advancing to the start symbol (specified by parameter id),
			// we need to temporarily switch to the stmtSymbolTable in order to find
			// the correct symbol instance carrying a "fud" function
			parser.symbolTable = parser.stmtSymbolTable;
			found = parser.advance(id);
			parser.symbolTable = oldSymbolTable;
			if (found) {
				tok = parser.token;
				if (id === "ELSEIF") {
					tok.condition = parser.parseCondition();
					tok.block = parseBlock("THEN");
				} else {
					// nomally (after BEGIN, DO, THEN, ELSE, ...) we expect a statement block, i.e.
					// a list of declarations followed by a list of statements
					parseStatementBlock(tok);
				}
			}
			return tok;
		}

		function parseCreateExtendedStorage(tok) {
			parser.advance("STORAGE");
			parser.advance("CONFIGURATION");
			tok.kind = "extended storage";
			tok.configuration = parser.parseString();
			if (parser.advanceIf("WITH")) {
				parser.advance("CREDENTIAL");
				tok.credential = {};
				parser.advance("TYPE");
				tok.credential.type = parser.parseString();
				parser.advance("USING");
				tok.credential.using = parser.parseString();
			}
			return tok;
		}

		function parseCreateFulltextIndex(tok) {
			parser.advance("INDEX");
			parseCreateObject(tok, "fulltext index");
			parser.skipRemaining(); // TODO full syntax support
			return tok;
		}

		function parseCreateIndex(tok) {
			var on, fillFactor, i,
				hasColumnOrder = false,
				upperValue = parser.token.value.toUpperCase();

			if (parser.advanceIf("UNIQUE")) {
				tok.isUnique = true;
			}

			if (parser.advanceIf("BTREE")) {
				tok.indexType = "btree";
			} else if (parser.advanceIf("CPBTREE")) {
				tok.indexType = "cpbtree";
			}
			if (upperValue !== "INDEX") {
				parser.advance("INDEX");
			}
			parseCreateObject(tok);
			if (parser.advance("ON")) {
				on = parser.parseObjectRef("table");
				if (on) {
					tok.on = on;
				}
			}

			tok.columns = parser.parseColumnsList(tok.on, true);

			for (i = 0; i < tok.columns.length; i++) {
				if (tok.columns[i].order !== "default") {
					hasColumnOrder = true;
					break;
				}
			}
			if (parser.advanceIf("ASC")) {
				tok.order = "asc";
			} else if (parser.advanceIf("DESC")) {
				tok.order = "desc";
			} else if (!hasColumnOrder) {
				tok.order = "default";
			}
			if (tok.order && hasColumnOrder) {
				parser.error(parser.token, "column_order_and_index_order_specified");
			}

			if (parser.advanceIf("FILLFACTOR")) {
				fillFactor = parser.parseInteger();
				if (!isNaN(fillFactor)) {
					tok.fillFactor = fillFactor;
				}
			}
			return tok;
		}

		function parseAlterIndex(tok) {
			parseCreateObject(tok);
			parser.advance("REBUILD");
			return tok;
		}

		function parseCreateSchema(tok) {
			parseCreateObject(tok);
			if (parser.advanceIf("OWNED")) {
				if (parser.advance("BY")) {
					if (parser.parseSimpleIdentifier("user")) {
						tok.owner = parser.token;
					}
				}
			}
		}

		function parseCreateSequence(tok) {
			parseCreateObject(tok);
			parser.skipRemaining(); // TODO full syntax support
			return tok;
		}

		function parseCreateStatistics(tok) {
			if (parser.parseOptionalIdentifier("statistics")) {
				tok.identifier = parser.token;
			}
			parser.advance("ON");
			tok.kind = "statistics";
			parser.skipRemaining(); // TODO full syntax support
			return tok;
		}

		function parseCreateSynonym(tok) {
			if (parser.advanceIf("SYNONYM")) {
				tok.isPublic = true;
			}
			parseCreateObject(tok);
			parser.skipRemaining(); // TODO full syntax support
			return tok;
		}

		function parseCreateTable(tok) {
			var defineFn, peek0, peek1,
				columns = [],
				constraints = [],
				upperValue = parser.token.value.toUpperCase();

			if (upperValue === "COLUMN") {
				tok.tableType = "column";
			} else if (upperValue === "ROW") {
				tok.tableType = "row";
			} else if (upperValue === "HISTORY") {
				if (parser.advance("COLUMN")) {
					tok.tableType = "history column";
				}
			} else if (upperValue === "GLOBAL") {
				if (parser.advance("TEMPORARY")) {
					if (parser.advanceIf("COLUMN")) {
						tok.tableType = "global temporary column";
					} else {
						tok.tableType = "global temporary";
					}
				}
			} else if (upperValue === "LOCAL") {
				if (parser.advance("TEMPORARY")) {
					if (parser.advanceIf("COLUMN")) {
						tok.tableType = "local temporary column";
					} else {
						tok.tableType = "local temporary";
					}
				}
			} else {
				tok.tableType = "row";
			}
			if (upperValue !== "TABLE") {
				parser.advance("TABLE");
			}
			defineFn = parseCreateObject(tok, undefined, true);
			if (!parseLikeTable(tok)) {
				peek0 = parser.peek();
				peek1 = parser.peek(1);
				if (parser.nextToken.id === "AS" || parser.nextToken.id === "(" && peek0 && (peek0.type === "name" || peek0.type === "qname") && peek1 &&
					(peek1.value === "," || peek1.value === ")")) {
					parseAsSubquery(tok);
				} else {
					if (parser.advance("(")) {
						while (true) {
							parser.parseTableElement(columns, constraints);
							if (!parser.advanceIf(",")) {
								break;
							}
						}
						parser.advance(")");
						if (columns.length === 0) {
							parser.error(tok, "no_column_definition");
						} else {
							tok.columns = columns;
							tok.columns.resolved = true;
						}
						if (constraints.length > 0) {
							tok.constraints = constraints;
						}
					}
				}
			}
			parsePartitionClause(tok);
			parseGroupClause(tok);
			parsePriorityUnload(tok);
			parseAutoMerge(tok);
			parseWithSchemaFlex(tok);
			defineFn();
			return tok;
		}

		function parseAlterTable(tok) {
			parseCreateObject(tok);
			parser.skipRemaining(); // TODO full syntax support
			return tok;
		}

		function parseCreateTrigger(tok) {
			var oldSymbolTable;

			function parseTransition() {
				var trans;

				if (parser.advanceIf("OLD")) {
					trans.record = "old";
				} else {
					parser.advance("NEW");
					trans.record = "new";
				}
				if (parser.advanceIf("ROW")) {
					trans.kind = "row";
				} else {
					parser.advance("TABLE");
					trans.kind = "table";
				}
				parser.advanceIf("AS");
				if (parser.parseIdentifier(trans.kind)) {
					trans.name = parser.token;
				}
			}

			parseCreateObject(tok);
			if (parser.advanceIf("BEFORE")) {
				tok.actionTime = "before";
			} else {
				parser.advance("AFTER");
				tok.actionTime = "after";
			}
			tok.eventList = [];
			do {
				if (parser.advanceIf("INSERT")) {
					tok.eventList.push("insert");
				} else if (parser.advanceIf("DELETE")) {
					tok.eventList.push("delete");
				} else {
					parser.advance("UPDATE");
					tok.eventList.push("update");
				}
			} while (parser.advanceIf("OR"));

			oldSymbolTable = parser.symbolTable;
			parser.symbolTable = parser.stmtSymbolTable;
			parser.advance("ON");
			// TODO we migth need to reset the symbol table earlier
			if (parser.parseIdentifier("table")) {
				tok.on = parser.token;
			}

			if (parser.advanceIf("REFERENCING")) {
				tok.transitions = parser.makeParseList(parseTransition, "no_transitions")();
			}
			if (parser.advanceIf("FOR")) {
				parser.advance("EACH");
				if (parser.advanceIf("ROW")) {
					tok.forEach = "row";
				} else {
					parser.advance("STATEMENT");
					tok.forEach = "statement";
				}
			}

			parser.symbolTable = oldSymbolTable;
			if (parser.nextToken.id === "BEGIN") {
				tok.block = parser.parseStatement(true);
			} else {
				parser.advance("BEGIN"); // force error
			}
			return tok;
		}

		function parseCreateType(tok) {
			parseCreateObject(tok, "tableType");
			if (parser.advance("AS") && parser.advance("TABLE")) {
				tok.columns = parser.parseColumnListDefinition();
			}
			return tok;
		}

		function parseCreateView(tok) {
			var token, subquery, defineFn,
				as = {};

			defineFn = parseCreateObject(tok, undefined, true);
			tok.columnNames = tok.columns = parser.parseColumnsList();
			if (parser.advance("AS")) {
				token = parser.nextToken;
				subquery = parser.parseExpression(0, true);
				if (!subquery || subquery.id !== "SELECT") {
					parser.error(token, "expected_subquery");
				} else {
					as.subquery = subquery;
					if (tok.columns.length === 0) {
						// no columns list specified, take over columns from subquery, otherwise columns list is resolved in analyzer
						tok.columns = subquery.columns;
					}
				}
				tok.as = as;
			}
			// deferred define to prevent self reference in SELECT
			defineFn();
			return tok;
		}

		function parseCreateVirtualTable(tok) {
			var tree;

			if (parser.advance("TABLE")) {
				tok.tableType = "virtual";
				parseCreateObject(tok);
				if (parser.advance("AT")) {
					tree = parser.parseExpression(0, false, ["remote source", "database", "owner", "table"]);
					if (tree) {
						// TODO: validate remote name
						tok.remoteObject = tree;
					}
				}
			}
			return tok;
		}

		function parseCreateProcedure(tok) {
			var oldSymbolTable, params, declarations = [],
				decl, defineFn, oldSchema;

			defineFn = parseCreateObject(tok, undefined, true);

			if (tok.id === "ALTER") {
				if (parser.advanceIf("RECOMPILE")) {
					if (parser.advanceIf("WITH")) {
						parser.advance("PLAN");
						tok.recompile = "with plan";
					} else {
						tok.recompile = "without plan";
					}
					return tok;
				}
			}
			params = parser.parseProcedureParameterList();
			if (params.length > 0) {
				tok.parameters = params;
			}

			parseOptionalLanguage(tok);
			parseOptionalSecurity(tok);
			oldSchema = parser.currentSchema;
			parseOptionalDefaultSchema(tok);
			parseOptionalReadView(tok);

			if (parser.nextToken.id === "AS") {
				oldSymbolTable = parser.symbolTable;
				parser.symbolTable = parser.stmtSymbolTable;
				parser.advance("AS");
				parser.symbolTable = oldSymbolTable;

				if (parser.advanceIf("HEADER")) {
					parser.advance("ONLY");
				} else if (tok.language && tok.language.identifier !== "SQLSCRIPT") {
					parser.advance("BEGIN");
					parser.skipRemaining("END", true); // R, LLANG
					parser.advance("END");
				} else {
					while (parser.nextToken.id !== "BEGIN" && parser.nextToken.id !== "(end)") {

						decl = {};
						parseOptionalProceduralDeclaration(decl);
						if (decl.kind) {
							declarations.push(decl);
						}

						oldSymbolTable = parser.symbolTable;
						parser.symbolTable = parser.stmtSymbolTable;
						parser.advance(";");
						parser.symbolTable = oldSymbolTable;
					}

					if (declarations.length > 0) {
						tok.declarations = declarations;
					}

					if (parser.nextToken.id === "BEGIN") {
						tok.block = parser.parseStatement(true);
					} else {
						// force error
						parser.advance("BEGIN");
					}
				}
			}
			parser.currentSchema = oldSchema;
			// deferred definition to avoid recursive procedure calls
			defineFn();
		}

		function parseCreateFunction(tok) {
			var oldSymbolTable, params, defineFn, oldSchema;

			function parseReturnParameter() {
				var id, returnsTok,
					isTableFunction = false,
					param = {
						position: 0,
						identifier: "(return)",
						kind: "variable",
						parameterType: "RETURN",
						resolved: true
					},
					result = [];

				parser.advance("RETURNS");
				returnsTok = parser.token;
				if (!parser.parseOptionalTableTypeDefinition(param)) {
					id = parser.parseObjectRef("tableType");
					if (!id) {
						parser.error(returnsTok, "no_return_parameter");
					} else if (parser.nextToken.id === "AS") {
						isTableFunction = true;
						param.dataType = id;
						result.push(param);
					} else {
						id.kind = "variable";
						id.position = 0;
						id.parameterType = "RETURN";
						id.resolved = true;
						parser.parseDataType(id, "variable");
						result.push(id);
						while (parser.nextToken.id === ",") {
							parser.advance(",");
							if (parser.parseIdentifier("variable")) {
								id = parser.token;
								id.position = 0;
								id.parameterType = "RETURN";
								id.resolved = true;
								parser.parseDataType(id, "variable");
							}
							result.push(id);
						}
					}
				} else {
					isTableFunction = true;
					result.push(param);
				}
				if (isTableFunction) {
					tok.kind = "tableFunction";
					if (tok.identifier) {
						tok.identifier.kind = tok.kind;
					}
				}

				return result;
			}

			defineFn = parseCreateObject(tok, undefined, true);

			params = parser.parseProcedureParameterList();
			tok.parameters = parseReturnParameter();
			if (params.length > 0) {
				Array.prototype.push.apply(tok.parameters, params);
			}

			parseOptionalLanguage(tok);
			parseOptionalSecurity(tok);
			oldSchema = parser.currentSchema;
			parseOptionalDefaultSchema(tok);

			if (parser.nextToken.id === "AS") {
				oldSymbolTable = parser.symbolTable;
				parser.symbolTable = parser.stmtSymbolTable;
				parser.advance("AS");
				parser.symbolTable = oldSymbolTable;

				if (parser.advanceIf("HEADER")) {
					parser.advance("ONLY");
				} else {
					if (parser.nextToken.id === "BEGIN") {
						tok.block = parser.parseStatement(true);
					} else {
						// force error
						parser.advance("BEGIN");
					}
				}
			}
			// deferred definition because RETURNS determines kind = function|tableFunction and to avoid recursion
			parser.currentSchema = oldSchema;
			defineFn();
		}

		//CREATE EXTENDED STORAGE CONFIGURATION
		//CREATE FULLTEXT INDEX
		//CREATE FUNCTION
		//CREATE [UNIQUE] [BTREE | CPBTREE] INDEX
		//CREATE SCHEMA
		//CREATE SEQUENCE
		//CREATE STATISTICS
		//CREATE [PUBLIC] SYNONYM
		//CREATE [VIRTUAL | COLUMN | ROW | HISTORY COLUMN | GLOBAL TEMPORARY | 
		//        GLOBAL TEMPORARY COLUMN | LOCAL TEMPORARY | LOCAL TEMPORARY COLUMN] TABLE
		//CREATE TRIGGER
		//CREATE VIEW
		parseCreate = function() {
			var tok = parser.token;

			parser.advanceCase({
				"EXTENDED": parseCreateExtendedStorage,
				"FULLTEXT": parseCreateFulltextIndex,
				"FUNCTION": parseCreateFunction,
				// index
				"UNIQUE": parseCreateIndex,
				"BTREE": parseCreateIndex,
				"CPBTREE": parseCreateIndex,
				"INDEX": parseCreateIndex,
				// end index
				"SCHEMA": parseCreateSchema,
				"SEQUENCE": parseCreateSequence,
				"STATISTICS": parseCreateStatistics,
				// synonym
				"PUBLIC": parseCreateSynonym,
				"SYNONYM": parseCreateSynonym,
				// table
				"VIRTUAL": parseCreateVirtualTable,
				"COLUMN": parseCreateTable,
				"ROW": parseCreateTable,
				"HISTORY": parseCreateTable,
				"GLOBAL": parseCreateTable,
				"LOCAL": parseCreateTable,
				"TABLE": parseCreateTable,
				// end table
				"TYPE": parseCreateType,
				"TRIGGER": parseCreateTrigger,
				"VIEW": parseCreateView,
				"PROCEDURE": parseCreateProcedure
			}, tok).else(function() {
				parser.error(parser.nextToken, "0_not_supported");
			});
			return this;
		};

		parser.stmt("CREATE", parseCreate);

		//ALTER FULLTEXT INDEX
		//ALTER FUNCTION
		//ALTER [UNIQUE] [BTREE | CPBTREE] INDEX
		//ALTER SEQUENCE
		//ALTER STATISTICS
		//ALTER [PUBLIC] SYNONYM
		//ALTER [VIRTUAL | COLUMN | ROW | HISTORY COLUMN | GLOBAL TEMPORARY | 
		//        GLOBAL TEMPORARY COLUMN | LOCAL TEMPORARY | LOCAL TEMPORARY COLUMN] TABLE
		//ALTER TRIGGER
		//ALTER VIEW
		parseAlter = function() {
			var tok = parser.token;

			parser.advanceCase({
				"FULLTEXT": parseCreateFulltextIndex,
				"FUNCTION": parseCreateFunction,
				"INDEX": parseAlterIndex,
				"TABLE": parseAlterTable,
				"SEQUENCE": parseCreateSequence,
				"TYPE": parseCreateType,
				"VIEW": parseCreateView,
				"PROCEDURE": parseCreateProcedure
			}, tok).else(function() {
				parser.error(parser.nextToken, "0_not_supported");
			});
			return this;
		};

		parser.symbol("ALTER"); // reserved word
		parser.stmt("ALTER", parseAlter);

		// anonymous proc.
		// need to set parser.stmtSymbolTable so that BEGIN is recognized as stmt
		parser.stmt("DO", function() {
			if (parser.nextToken.id === "BEGIN") {
				this.block = parser.parseStatement(true);
			}
			return this;
		}, parser.stmtSymbolTable);

		parser.stmt("CALL", function() {
			this.target = parser.parseExpression(0, false, "procedure");
			return this;
		});

		parser.procedureStmt("BEGIN", function() {
			parseStatementBlock(this);
			parser.advance("END");
			return this;
		}, parser.stmtSymbolTable); // BEGIN is immediately followed other statements, hence must not use its own symbol table

		parser.procedureStmt("DECLARE", function() {
			parseOptionalProceduralDeclaration(this);
			return this;
		});

		parser.procedureStmt("IF", function() {
			this.elseif = [];

			this.condition = parser.parseCondition();
			this.then = parseBlock("THEN");
			while (parser.nextToken.id === "ELSEIF") {
				this.elseif.push(parseBlock("ELSEIF"));
			}
			if (parser.nextToken.id === "ELSE") {
				this.else = parseBlock("ELSE");
			}
			parser.advance("END");
			parser.advance("IF");
			return this;
		});

		parser.procedureStmt("BREAK", function() {
			return this;
		});

		parser.procedureStmt("CONTINUE", function() {
			return this;
		});

		parser.procedureStmt("LOOP", function() {
			parseStatementBlock(this);
			parser.advance("END");
			parser.advance("LOOP");
			return this;
		}, parser.stmtSymbolTable);

		parser.procedureStmt("WHILE", function() {
			this.condition = parser.parseCondition();
			this.do =
				parseBlock("DO");
			parser.advance("END");
			parser.advance("WHILE");
			return this;
		}, parser.stmtSymbolTable);

		parser.procedureStmt("FOR", function() {
			var oldScope = parser.scope,
				range;

			parser.parseIdentifier("variable");
			this.variable = parser.token;

			if (parser.advanceIf("AS")) {
				parser.scope = this.scope = Object.create(oldScope);
				this.variable.kind = "rowVariable";
				parser.define(this.variable, undefined, this.scope);
				this.cursor = parser.parseExpression(0, false, "cursor");
			} else if (parser.advanceIf("IN")) {
				if (parser.advanceIf("REVERSE")) {
					this.reverse = true;
				}
				range = parser.parseExpression(0, true);
				this.from = range.first; //parser.parseExpression();
				//parser.advance("..");
				this.to = range.second; //parser.parseExpression();
			}
			this.do =
				parseBlock("DO");
			parser.advance("END");
			parser.advance("FOR");

			parser.scope = oldScope;
			return this;
		}, parser.stmtSymbolTable);

		function parseSignal(tok, optional) {
			if (parser.advanceIf("SQL_ERROR_CODE")) {
				tok.errorCode = parser.parseInteger();
			} else if (optional) {
				tok.signalName = parser.parseOptionalIdentifier();
			} else if (parser.nextToken.id !== ";" && parser.nextToken.id !== "(end)") {
				tok.signalName = parser.parseIdentifier();
			} else {
				parser.error(parser.nextToken, "expected_identifier_or_sql_error_code");
			}

			if (parser.advanceIf("SET")) {
				if (parser.advance("MESSAGE_TEXT") && parser.advance("=")) {
					tok.messageText = parser.parseExpression(67);
				}
			}
			return tok;
		}

		parser.procedureStmt("SIGNAL", function() {
			return parseSignal(this, false);
		});

		parser.procedureStmt("RESIGNAL", function() {
			return parseSignal(this, true);
		});

		parser.procedureStmt("OPEN", function() {
			this.cursor = parser.parseIdentifier();
			if (parser.advanceIf("(")) {
				this.parameters = [];
				while (true) {
					this.parameters.push(parser.parseExpression());
					if (!parser.advanceIf(",")) {
						break;
					}
				}
				parser.advance(")");
			}
			return this;
		});

		parser.procedureStmt("FETCH", function() {
			this.cursor = parser.parseIdentifier();
			if (parser.advance("INTO")) {
				this.columns = [];
				while (true) {
					this.columns.push(parser.parseIdentifier());
					if (!parser.advanceIf(",")) {
						break;
					}
				}
			}
			return this;
		});

		parser.procedureStmt("CLOSE", function() {
			this.cursor = parser.parseIdentifier();
			return this;
		});

		parser.procedureStmt("RETURN", function() {
			this.expression = parser.parseExpression(0, true);
			return this;
		});

		parser.procedureStmt("EXEC", function() {
			this.expression = parser.parseExpression();
			if (!this.expression) {
				parser.error(this, "no_expression");
			}
			return this;
		});

		parser.procedureStmt("EXECUTE", function() {
			if (parser.advance("IMMEDIATE")) {
				this.expression = parser.parseExpression();
				if (!this.expression) {
					parser.error(this, "no_expression");
				}
			}
			return this;
		});

	}

	return {
		init: init,
		defaultConfig: defaultConfig
	};

});