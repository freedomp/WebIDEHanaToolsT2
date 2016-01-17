/** Copyright © 2015 SAP SE or an affiliate company. All rights reserved.**/

/*
 * Parser module for data types
 */
/*global define*/
/*eslint-disable max-statements, max-params, complexity*/
define(function() {
	"use strict";

	var DataTypes = {},
		_types,
		_columnStoreDataTypes = {},
		_ddicDataTypes = {};

	function createTypes() {
		var category, types = {},
			order = 0;

		function push() {
			var i, j, type;

			for (i = 0; i < arguments.length; i++) {
				types[arguments[i]] = type = {
					order: order++,
					name: arguments[i]
				};
				if (Array.isArray(category)) {
					for (j = 0; j < category.length; j++) {
						type[category[j]] = true;
					}
				} else {
					type[category] = true;
				}
			}
		}

		function excludeFrom(type, context) {
			if (!type.excludedFrom) {
				type.excludedFrom = {};
			}
			type.excludedFrom[context] = true;
		}

		category = "isTimestamp";
		push("LONGDATE", "TIMESTAMP", "SECONDDATE");

		category = "isDate";
		push("DAYDATE", "DATE");

		category = "isTime";
		push("SECONDTIME", "TIME");

		category = "isNumeric";
		push("DOUBLE", "REAL", "FLOAT", "DECIMAL", "NUMERIC", "SMALLDECIMAL", "BIGINT", "INTEGER", "INT", "SMALLINT", "TINYINT");
		types.DECIMAL.maxLength = 38;
		types.DECIMAL.maxScale = 38;
		types.NUMERIC.maxLength = 38;
		types.NUMERIC.maxScale = 38;
		types.FLOAT.maxLength = 53;

		category = ["isLob", "isCharacter"];
		push("NCLOB", "TEXT");
		excludeFrom(types.TEXT, "variable");

		category = "isCharacter";
		push("NVARCHAR", "SHORTTEXT", "NCHAR");
		types.NVARCHAR.maxLength = 5000;
		types.SHORTTEXT.maxLength = 5000;
		types.NCHAR.maxLength = 2000;
		excludeFrom(types.SHORTTEXT, "variable");

		category = ["isLob", "isCharacter"];
		push("CLOB");

		// STRING is allowed in DECLARE
		category = "isCharacter";
		push("VARCHAR", "STRING", "CHAR", "CHARACTER", "ALPHANUM");
		types.VARCHAR.maxLength = 5000;
		types.CHAR.maxLength = 2000;
		types.CHARACTER.maxLength = 2000;
		types.ALPHANUM.maxLength = 127;
		excludeFrom(types.STRING, "column");

		category = ["isLob", "isBinary"];
		push("BLOB", "BINTEXT");
		excludeFrom(types.BINTEXT, "variable");

		category = "isBinary";
		push("VARBINARY", "BINARY");
		types.VARBINARY.maxLength = 5000;

		category = "isGeospatial";
		push("ST_GEOMETRY", "ST_POINT", "ST_POLYGON");
		types.ST_GEOMETRY.maxLength = -1; // rather not the lenght but specifies the spatial reference system used
		excludeFrom(types.ST_POINT, "variable");
		excludeFrom(types.ST_POLYGON, "variable");
		excludeFrom(types.ST_POLYGON, "column");

		return types;
	}

	_types = createTypes();

	("CS_ALPHANUM | CS_INT | CS_FIXED | CS_FLOAT | CS_DOUBLE | " +
		"CS_DECIMAL_FLOAT | CS_FIXED | CS_SDFLOAT | CS_STRING | CS_UNITEDECFLOAT | " +
		"CS_DATE | CS_TIME | CS_FIXEDSTRING | CS_RAW | CS_DAYDATE | CS_SECONDTIME | " +
		"CS_LONGDATE | CS_SECONDDATE").split(" | ").forEach(function(type) {
		_columnStoreDataTypes[type] = true;
	});

	("DDIC_ACCP | DDIC_ALNM | DDIC_CHAR | DDIC_CDAY | DDIC_CLNT | DDIC_CUKY | DDIC_CURR | " +
		"DDIC_D16D | DDIC_D34D | DDIC_D16R | DDIC_D34R | DDIC_D16S | DDIC_D34S | DDIC_DATS | DDIC_DAY | " +
		"DDIC_DEC | DDIC_FLTP | DDIC_GUID | DDIC_INT1 | DDIC_INT2 | DDIC_INT4 | DDIC_INT8 | DDIC_LANG | " +
		"DDIC_LCHR | DDIC_MIN | DDIC_MON | DDIC_LRAW | DDIC_NUMC | DDIC_PREC | DDIC_QUAN | DDIC_RAW | " +
		"DDIC_RSTR | DDIC_SEC | DDIC_SRST | DDIC_SSTR | DDIC_STRG | DDIC_STXT | DDIC_TIMS | DDIC_UNIT | " +
		"DDIC_UTCM | DDIC_UTCL | DDIC_UTCS | DDIC_TEXT | DDIC_VARC | DDIC_WEEK").split(" | ").forEach(function(type) {
		_ddicDataTypes[type] = true;
	});

	DataTypes.get = function(typeName) {
		return _types[typeName];
	};

	DataTypes.getColumnStoreDataType = function(typeName) {
		return _columnStoreDataTypes[typeName];
	};

	DataTypes.getDDICDataType = function(typeName) {
		return _ddicDataTypes[typeName];
	};

	DataTypes.allNames = function() {
		return Object.keys(_types);
	};

	/*
	 * Converts source type into target type.
	 * Conversion rules differ from the environment (assignment in a procedure, select into, insert)
	 * Current implementation mainly follows the rules of the insert statement which might be too strict in certain cases.
	 */
	DataTypes.convert = function(source, target) {
		var sourceType, targetType;

		if (source === "BOOLEAN" && target === "BOOLEAN") {
			return "BOOLEAN";
		}

		sourceType = _types[source];
		targetType = _types[target];

		if (!targetType) {
			return undefined;
		}

		if (source === "NULL") {
			return target;
		}

		if (!sourceType) {
			return undefined;
		}
		// no conversion needed
		if (source === target) {
			return target;
		}
		// TEXT
		if (source === "TEXT" || source === "BINTEXT") {
			return undefined;
		}
		// ALPHANUM
		if (target === "ALPHANUM") {
			if (sourceType.isCharacter && !sourceType.isLob) {
				return target;
			}
			return undefined;
		}
		if (source === "ALPHANUM") {
			if (targetType.isCharacter && !targetType.isLob) {
				return target;
			}
			return undefined;
		}
		// CLOB
		if (source === "CLOB") {
			if (targetType.isCharacter && !targetType.isLob) {
				return target;
			}
			return undefined;
		}
		// TIME
		if (sourceType.isTime) {
			if (targetType.isTime || targetType.isCharacter && !targetType.isLob) {
				return target;
			}
			return undefined;
		}
		if (targetType.isTime) {
			if (sourceType.isTime || sourceType.isTimestamp || sourceType.isCharacter && !sourceType.isLob) {
				return target;
			}
			return undefined;
		}
		// DATE and TIMESTAMP
		if (targetType.isDate || targetType.isTimestamp) {
			if (sourceType.isDate || sourceType.isTimestamp || sourceType.isCharacter && !sourceType.isLob) {
				return target;
			}
			return undefined;
		}
		// binary
		if (targetType.isBinary) {
			if (sourceType.isCharacter && !sourceType.isLob || sourceType.isBinary) {
				return target;
			}
			return undefined;
		}
		// numeric
		if (targetType.isNumeric) {
			if (sourceType.isNumeric || sourceType.isCharacter && !sourceType.isLob) {
				return target;
			}
			return undefined;
		}
		// geospatial
		if (target === "ST_GEOMETRY") {
			if (sourceType.isGeospatial) {
				return target;
			}
			return undefined;
		}
		// character
		if (targetType.isCharacter) {
			if (!sourceType.isLob && !targetType.isLob || sourceType.isCharacter) {
				return target;
			}
			return undefined;
		}
		return undefined;
	};

	return DataTypes;
});