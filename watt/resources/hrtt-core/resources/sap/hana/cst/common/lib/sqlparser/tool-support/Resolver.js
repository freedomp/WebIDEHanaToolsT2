/** Copyright © 2015 SAP SE or an affiliate company. All rights reserved.**/

/*global define*/
/*eslint-disable no-constant-condition, quotes*/
define(function(require) {
	"use strict";

	var
		Util = require("./Util"),
		CatalogAccess = require("./CatalogAccess"),
		consoleLog = Util.makeLog("sqlparser.Resolver"),
		typesWithLength = ["ALPHANUM", "DECIMAL", "FLOAT", "NVARCHAR", "SHORTTEXT", "VARCHAR", "VARBINARY"],
		typesWithScale = ["DECIMAL"];

	function Resolver() {}

	Resolver.prototype = {
		resolve: function(objects, done, args) {
			var current, last, catalogAccess,
				result = [],
				currentSchema = args.currentSchema || "PUBLIC",
				metadataChunkSize = args.metadataChunkSize || 1000,
				allRequestData = [];

			function expandData(unresolved, dataArray) {
				var j, data, resolvedData,
					parameters = [],
					columns = [];

				if (!Array.isArray(dataArray)) {
					return;
				}
				dataArray.sort(function(a, b) {
					return a.position - b.position;
				});
				for (j = 0; j < dataArray.length; j++) {
					data = dataArray[j];
					if (data.parameterType === "RETURN" && data.dataTypeName === "TABLE_TYPE") {
						expandData(unresolved, data.data);
					}
					resolvedData = {
						identifier: data.name,
						dataType: data.dataTypeName,
						kind: data.parameterType ? "parameter" : "column",
						description: data.description,
						resolved: true
					};
					if (data.dataTypeName === "TABLE_TYPE") {
						resolvedData.dataType = {
							schema: data.tableTypeSchema,
							identifier: data.tableTypeName,
							kind: "tableType"
						};
						/*
							tableTypeSchema: data.tableTypeSchema,
							tableTypeName: data.tableTypeName,
							*/
					}
					if (typesWithLength.indexOf(data.dataTypeName) >= 0) {
						resolvedData.length = data.length;
					}
					if (typesWithScale.indexOf(data.dataTypeName) >= 0) {
						resolvedData.scale = data.scale;
					}
					if (data.parameterType) {
						resolvedData.parameterType = data.parameterType;
						resolvedData.hasDefaultValue = data.hasDefaultValue;
						parameters.push(resolvedData);
					} else {
						columns.push(resolvedData);
					}
				}
				if (parameters.length > 0) {
					unresolved.parameters = parameters;
				}
				if (columns.length > 0) {
					unresolved.columns = columns;
				}
			}

			function resolveObject(resolved, unresolved) {
				unresolved.resolved = true;
				unresolved.schema = resolved.schema;
				unresolved.description = resolved.description;
				unresolved.mainType = resolved.mainType;
				unresolved.subType = resolved.subType;
				if (unresolved.expand) {
					expandData(unresolved, resolved.data);
				}
			}

			function match(unresolved, resolved, subType, conflictingSubType) {
				var expectedSchema;
				if (!unresolved.resolveConflict && !unresolved.resolved && unresolved.identifier === resolved.objectName) {
					if (unresolved.schema) {
						if (unresolved.schema !== resolved.schema) {
							return;
						}
					} else if (unresolved.kind !== "schema") {
						expectedSchema = unresolved.currentSchema || currentSchema;
						if (resolved.schema !== expectedSchema && resolved.schema !== 'PUBLIC') {
							return;
						}
					}
					if (subType && resolved.subType !== subType) {
						unresolved.resolveConflict = resolved;
					} else if (conflictingSubType && resolved.subType === conflictingSubType) {
						unresolved.resolveConflict = resolved;
					} else {
						resolveObject(resolved, unresolved);
					}
				}
			}

			function matchResolveObject(resolved) {
				var j, unresolved, objectsOfType, isTableFunction;

				if (resolved.mainType === "TABLE" || resolved.mainType === "VIEW") {
					if (objects.table) {
						for (j = 0; j < objects.table.length; j++) {
							unresolved = objects.table[j];
							match(unresolved, resolved, undefined, "TYPE");
						}
					}
					if (objects.tableType) {
						for (j = 0; j < objects.tableType.length; j++) {
							unresolved = objects.tableType[j];
							match(unresolved, resolved);
						}
					}
					if (resolved.mainType === "VIEW" && objects.tableFunction) {
						for (j = 0; j < objects.tableFunction.length; j++) {
							unresolved = objects.tableFunction[j];
							match(unresolved, resolved);
						}
					}
				} else if (resolved.mainType === "FUNCTION") {
					if (objects.function) {
						for (j = 0; j < objects.function.length; j++) {
							unresolved = objects.function[j];
							match(unresolved, resolved, undefined, "TYPE");
						}
					}
					isTableFunction = resolved.data && resolved.data[0] && resolved.data[0].dataTypeName === "TABLE_TYPE" && resolved.data[0].parameterType ===
						"RETURN";
					if (isTableFunction && objects.tableFunction) {
						for (j = 0; j < objects.tableFunction.length; j++) {
							unresolved = objects.tableFunction[j];
							match(unresolved, resolved);
						}
					}
				} else {
					objectsOfType = objects[resolved.mainType.toLowerCase()];
					if (objectsOfType) {
						for (j = 0; j < objectsOfType.length; j++) {
							unresolved = objectsOfType[j];
							match(unresolved, resolved);
						}
					}
				}
			}

			function collectResult(res) {
				var j, publicNames = [];

				last = current;
				current = Math.max(last - metadataChunkSize, 0);
				try {
					Array.prototype.push.apply(result, res);
					if (current === last) {
						for (j = 0; j < result.length; j++) {
							if (result[j].NOT_FOUND === true) {
								continue;
							}
							if (result[j].schema === "PUBLIC") {
								publicNames.push(result[j]);
							} else {
								matchResolveObject(result[j]);
							}
						}
						// make sure to resolve names in PUBLIC schema so that local names in CURRENT_SCHEMA get resolved first
						for (j = 0; j < publicNames.length; j++) {
							matchResolveObject(publicNames[j]);
						}
					} else {
						catalogAccess.getMetadata(allRequestData.slice(current, last), collectResult);
					}
				} finally {
					if (current === last && done) {
						done();
					}
				}
			}

			function makeReqData(obj, type, schema) {
				var requiresExpand = ["TABLE", "PROCEDURE", "FUNCTION"],
					reqData = {
						objectName: obj.identifier,
						mainType: type
					};
				if (schema) {
					reqData.schema = schema;
				}
				if (requiresExpand.indexOf(type) >= 0) {
					reqData.expand = "DATA";
				}
				return reqData;
			}

			function makeAllReqData(objectsByType, mainType) {
				var keys, i, obj;

				if (!objectsByType) {
					return;
				}
				keys = Object.keys(objectsByType);
				for (i = 0; i < keys.length; i++) {
					obj = objectsByType[keys[i]];
					if (obj.schema) {
						allRequestData.push(makeReqData(obj, mainType, obj.schema));
					} else {
						allRequestData.push(makeReqData(obj, mainType, obj.currentSchema || currentSchema));
						allRequestData.push(makeReqData(obj, mainType, "PUBLIC"));
					}
				}
			}

			function makeSchemaReqData() {
				var i = 1;
				if (objects.schema) {
					for (i = 0; i < objects.schema.length; i++) {
						if (objects.schema[i].identifier === "") {
							objects.schema[i].identifier = currentSchema;
							objects.schema[i].resolved = true;
						} else {
							allRequestData.push(makeReqData(objects.schema[i], "SCHEMA"));
						}

					}
				}
			}

			catalogAccess = CatalogAccess.get(args.metadataUrl, args.currentDB, args.metadataUseHttpPost);
			try {
				makeAllReqData(objects.table, "TABLE");
				makeAllReqData(objects.tableType, "TABLE");
				makeAllReqData(objects.procedure, "PROCEDURE");
				makeAllReqData(objects.function, "FUNCTION");
				// table function
				makeAllReqData(objects.tableFunction, "FUNCTION");
				// or parametrized column views, e.g.: FROM "_SYS_BIC"."tst"(placeholder."$$p1$$"=>'2')
				makeAllReqData(objects.tableFunction, "TABLE");
				makeSchemaReqData();

				last = allRequestData.length;
				current = Math.max(last - metadataChunkSize, 0);
				if (current !== last) {
					catalogAccess.getMetadata(allRequestData.slice(current, last), collectResult);
				} else {
					done();
				}
			} catch (e) {
				consoleLog(e);
				done();
			}
		}
	};

	return Resolver;

});