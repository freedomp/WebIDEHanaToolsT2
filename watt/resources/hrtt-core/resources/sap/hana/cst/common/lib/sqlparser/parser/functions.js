/** Copyright © 2015 SAP SE or an affiliate company. All rights reserved.**/

/*
 * Parser module for built-in functions
 */
/*global define*/
define(function() {
	"use strict";

	var Functions = function() {},
		_functions,
		_methods;

	function parseParameter(parser, result, supportsAsterisk, lbp) {
		var p;

		p = Object.create(null);
		p.value = parser.parseExpression(lbp || 0);
		if (p.value) {
			result.push(p);
			if (p.value.id === "*" && p.value.arity !== "infix" && !supportsAsterisk) {
				parser.error(p.value, "0_not_supported");
			}
			return p;
		} else {
			return undefined;
		}
	}

	function defaultParse(parser /*, tok*/ ) {
		var result = [];

		while (parser.nextToken.id !== ")") {
			parseParameter(parser, result);

			if (parser.nextToken.id !== ",") {
				break;
			}
			parser.advance(",");
		}
		parser.advance(")");
		return result;
	}

	function parseAggregate(parser, tok) {
		var p, distinct, hasPrefix = false,
			result = [];

		p = Object.create(null);
		if (parser.nextToken.id === "DISTINCT" || parser.nextToken.id === "ALL") {
			if (parser.advanceIf("DISTINCT")) {
				distinct = true;
			} else {
				parser.advanceIf("ALL");
			}
			hasPrefix = true;
		}

		p = parseParameter(parser, result, !hasPrefix && tok.first.identifier === "COUNT");
		if (p && distinct) {
			p.distinct = distinct;
		}

		parser.advance(")");
		return result;
	}

	function parseWindowFunction(parser, tok) {
		var result;

		function parseExpression() {
			return parser.parseExpression(67, false, "column");
		}

		result = defaultParse(parser, tok);

		if (parser.advance("OVER")) {
			parser.advance("(");
			if (parser.advanceIf("PARTITION")) {
				parser.advance("BY");
				tok.partitionBy = parser.makeParseList(parseExpression, "no_expression")();
			}
			if (parser.advanceIf("ORDER")) {
				parser.advance("BY");
				tok.orderBy = parser.makeParseList(parser.parseOrderByExpression, "no_order_by_expression")();
			}
			parser.advance(")");
		}
		return result;
	}

	function makeReturn(dataType, id) {
		return {
			identifier: id || "",
			dataType: dataType || "unknown",
			kind: "parameter",
			parameterType: "RETURN",
			resolved: true
		};
	}

	function makeIn(dataType, id) {
		return {
			identifier: id || "",
			dataType: dataType || "any",
			kind: "parameter",
			parameterType: "IN",
			resolved: true
		};
	}

	function createMethods() {

		var i,
			methods = {},
			/* constructors = ["ST_GEOMETRYCOLLECTION", "ST_CIRCULARSTRING", "ST_LINESTRING", "ST_MULTILINESTRING", "ST_MULTIPOINT",
					"ST_MULTIPOLYGON", "ST_POINT", "ST_POLYGON"], */
			allMethods = ["ST_ASBINARY", "ST_ASEWKB", "ST_ASEWKT", "ST_ASGEOJSON", "ST_ASTEXT", "ST_ASWKB", "ST_ASWKT", "ST_ASSVG",
				"ST_BOUNDARY", "ST_BUFFER", "ST_CONTAINS", "ST_COVEREDBY", "ST_COVERS", "ST_CONVEXHULL", "ST_CROSSES", "ST_DIFFERENCE",
				"ST_DIMENSION", "ST_DISJOINT", "ST_DISTANCE", "ST_ENVELOPE", "ST_EQUALS", "ST_EXTERIORRING", "ST_GEOMFROMEWKB", "ST_GEOMFROMEWKT",
				"ST_GEOMFROMTEXT", "ST_GEOMFROMWKB", "ST_GEOMFROMWKT", "ST_GEOMETRYTYPE", "ST_INTERIORRINGN", "ST_INTERSECTION", "ST_INTERSECTS",
				"ST_INTERSECTSFILTER", "ST_INTERSECTSRECT", "ST_ISSIMPLE", "ST_IS3D", "ST_ISEMPTY", "ST_ISVALID", "ST_NUMINTERIORRINGS",
				"ST_NUMINTERIORRING", "ST_ORDERINGEQUALS", "ST_OVERLAPS", "ST_POINTONSURFACE", "ST_RELATE", "ST_SRID", "ST_SNAPTOGRID",
				"ST_SYMDIFFERENCE", "ST_TOUCHES", "ST_UNIONAGGR", "ST_WITHINDISTANCE", "ST_WITHIN", "ST_XMAX", "ST_XMIN", "ST_YMAX", "ST_YMIN",
			/* methodsSTGeometryCollection */
				"ST_GEOMETRYN", "ST_NUMGEOMETRIES",
			/* methodsSTLineString */
				"ST_ENDPOINT", "ST_ISCLOSED", "ST_ISRING", "ST_LENGTH", "ST_NUMPOINTS",
				"ST_POINTN", "ST_STARTPOINT",
			/* methodsSTPoint */
				"ST_X", "ST_Y",
			/* methodsSTPolygon */
				"ST_AREA", "ST_CENTROID"];

		function defaultAnalyze(analyzer, params, parent) {
			analyzer.analyzeCallParameters(params, parent);
		}

		function add(name, hasOptionalParameters, analyze, parse) {
			var fn;

			fn = methods[name];
			if (!fn) {
				fn = {
					objectName: name,
					mainType: "FUNCTION",
					parameters: []
				};

				methods[name] = fn;
			}
			if (hasOptionalParameters) {
				fn.hasOptionalParameters = true;
			}
			fn.analyze = analyze || defaultAnalyze;
			fn.parse = parse || defaultParse;
			return fn;
		}

		for (i = 0; i < allMethods.length; i++) {
			add(allMethods[i], true).parameters.push(makeReturn());
		}
		return methods;
	}

	function createFunctions() {
		var functions = {};

		function defaultAnalyze(analyzer, params, parent) {
			analyzer.analyzeCallParameters(params, parent);
		}

		function add(name, hasOptionalParameters, analyze, parse) {
			var fn;

			fn = functions[name];
			if (!fn) {
				fn = {
					objectName: name,
					mainType: "FUNCTION",
					parameters: []
				};

				functions[name] = fn;
			}
			if (hasOptionalParameters) {
				fn.hasOptionalParameters = true;
			}
			fn.analyze = analyze || defaultAnalyze;
			fn.parse = parse || defaultParse;
			return fn;
		}

		function analyzeAggregate(analyzer, params, parent) {
			analyzer.analyzeCallParameters(params, parent);
			if (params.resolved && params.resolved.length >= 1 && params.resolved[0].value) {
				// dynamic determination of return type
				return [makeReturn(params.resolved[0].value.dataType), makeIn(params.resolved[0].value.dataType)];
			}
		}

		function analyzeAddToDate(analyzer, params, parent) {
			var param0, typeName;

			analyzer.analyzeCallParameters(params, parent);
			// dynamic determination of return type
			param0 = params[0] ? analyzer.resolve(params[0].value) : undefined;
			typeName = param0 && param0.dataType === "TIMESTAMP" ? "TIMESTAMP" : "DATE";
			return [makeReturn(typeName), makeIn(typeName), makeIn("INT")];
		}

		function analyzeBitOperations(analyzer, params, parent) {
			var param0, isBinary, typeName;

			analyzer.analyzeCallParameters(params, parent);
			// dynamic determination of return type
			param0 = params[0] ? analyzer.resolve(params[0].value) : undefined;
			params[1] ? analyzer.resolve(params[1].value) : undefined;
			isBinary = param0 && (param0.dataType === "BINARY" || param0.dataType === "VARBINARY");
			typeName = isBinary ? "VARBINARY" : "INT";
			return [makeReturn(typeName), makeIn(typeName), makeIn(typeName)];
		}

		function addAggregate(name) {
			add(name, false, analyzeAggregate, parseAggregate).parameters.push(makeReturn(), makeIn());
		}

		function addNumericAggregate(name) {
			add(name, false, undefined, parseAggregate).parameters.push(makeReturn("NUMERIC"), makeIn("NUMERIC"));
		}

		// text search
		add("CONTAINS", true, function(analyzer, params, parent) { // TODO check optional search specifier
			analyzer.analyzeCallParameters(params, parent, 2);
		}).parameters.push(makeReturn("BOOLEAN"), makeIn(), makeIn());
		add("SCORE").parameters.push(makeReturn("NUMERIC"));
		add("LANGUAGE").parameters.push(makeReturn("CHAR"), makeIn()); // TODO check input is a column
		add("MIMETYPE").parameters.push(makeReturn("CHAR"), makeIn()); // TODO check input is a column

		// aggregates
		add("COUNT", false, undefined, parseAggregate).parameters.push(makeReturn("INT"), makeIn());
		addNumericAggregate("AVG");
		addAggregate("MAX");
		addAggregate("MIN");
		addNumericAggregate("SUM");
		addNumericAggregate("STDDEV");
		addNumericAggregate("VAR");
		add("STRING_AGG").parameters.push(makeReturn("CHAR"), makeIn());

		// conversions
		add("CAST", false,
			function(analyzer, params, parent) {
				analyzer.analyzeCallParameters(params, parent);
				// dynamic determination of return type
				return [makeReturn(params[0] ? params[0].dataType : undefined), makeIn()];
			},
			function(parser /*, tok*/ ) {
				var p, result = [];

				p = parseParameter(parser, result);
				// treat AS as second parameter
				if (p && parser.advance("AS")) {
					parser.parseDataType(p, "column");
				}

				parser.advance(")");
				return result;
			}).parameters.push(makeReturn(), makeIn());
		add("TO_ALPHANUM").parameters.push(makeReturn("ALPHANUM"), makeIn());
		add("TO_BIGINT").parameters.push(makeReturn("BIGINT"), makeIn());
		add("TO_BINARY", true).parameters.push(makeReturn("VARBINARY"), makeIn()); // optional length
		add("TO_BLOB").parameters.push(makeReturn("BLOB"), makeIn());
		add("TO_CHAR", true).parameters.push(makeReturn("CHAR"), makeIn()); // optional format
		add("TO_CLOB").parameters.push(makeReturn("CLOB"), makeIn());
		add("TO_DATE", true).parameters.push(makeReturn("DATE"), makeIn("CHAR")); // optional format
		add("TO_DATS").parameters.push(makeReturn("CHAR"), makeIn("CHAR"));
		add("TO_DECIMAL", true).parameters.push(makeReturn("DECIMAL"), makeIn()); // optional precision, scale
		add("TO_DOUBLE").parameters.push(makeReturn("DOUBLE"), makeIn());
		add("TO_FIXEDCHAR").parameters.push(makeReturn("FIXEDCHAR"), makeIn(), makeIn("INT"));
		add("TO_INT").parameters.push(makeReturn("INT"), makeIn());
		add("TO_INTEGER").parameters.push(makeReturn("INTEGER"), makeIn());
		add("TO_NCLOB").parameters.push(makeReturn("NCLOB"), makeIn());
		add("TO_NVARCHAR", true).parameters.push(makeReturn("NVARCHAR"), makeIn()); // optional format
		add("TO_REAL").parameters.push(makeReturn("REAL"), makeIn());
		add("TO_SECONDDATE", true).parameters.push(makeReturn("SECONDDATE"), makeIn()); // optional format
		add("TO_SMALLDECIMAL").parameters.push(makeReturn("SMALLDECIMAL"), makeIn());
		add("TO_SMALLINT").parameters.push(makeReturn("SMALLINT"), makeIn());
		add("TO_TIME", true).parameters.push(makeReturn("TIME"), makeIn()); // optional format
		add("TO_TIMESTAMP", true).parameters.push(makeReturn("TIMESTAMP"), makeIn()); // optional format
		add("TO_TINYINT").parameters.push(makeReturn("TINYINT"), makeIn());
		add("TO_VARBINARY", true).parameters.push(makeReturn("VARBINARY"), makeIn()); // optional length
		add("TO_VARCHAR", true).parameters.push(makeReturn("VARCHAR"), makeIn()); // optional format
		add("TO_GEOMETRY").parameters.push(makeReturn("ST_GEOMETRY"), makeIn());
		add("TO_POINT").parameters.push(makeReturn("ST_POINT"), makeIn());

		// geospatial
		add("ST_GEOMFROMEWKB").parameters.push(makeReturn("ST_GEOMETRY"), makeIn("VARBINARY"));
		add("ST_GEOMFROMEWKT").parameters.push(makeReturn("ST_GEOMETRY"), makeIn("VARBINARY"));
		add("ST_GEOMFROMTEXT", true).parameters.push(makeReturn("ST_GEOMETRY"), makeIn("VARCHAR")); // optional srid
		add("ST_GEOMFROMWKB", true).parameters.push(makeReturn("ST_GEOMETRY"), makeIn("VARBINARY")); // optional srid
		add("ST_GEOMFROMWKT", true).parameters.push(makeReturn("ST_GEOMETRY"), makeIn("VARBINARY")); // optional srid

		// escaping
		add("IS_SQL_INJECTION_SAFE").parameters.push(makeReturn("INT"), makeIn("VARCHAR"));
		add("ESCAPE_SINGLE_QUOTES").parameters.push(makeReturn("VARCHAR"), makeIn("VARCHAR"));
		add("ESCAPE_DOUBLE_QUOTES").parameters.push(makeReturn("VARCHAR"), makeIn("VARCHAR"));

		// date time
		add("ADD_DAYS", false, analyzeAddToDate).parameters.push(makeReturn(), makeIn(), makeIn("INT"));
		add("ADD_MONTHS", false, analyzeAddToDate).parameters.push(makeReturn(), makeIn(), makeIn("INT"));
		add("ADD_SECONDS", false, function(analyzer, params, parent) {
			analyzer.analyzeCallParameters(params, parent);
			// dynamic determination of return type
			var param0 = params[0] ? analyzer.resolve(params[0].value) : undefined,
				typeName = param0 && param0.dataType === "TIMESTAMP" ? "TIMESTAMP" : "TIME";
			return [makeReturn(typeName), makeIn(typeName), makeIn("INT")];

		}).parameters.push(makeReturn(), makeIn(), makeIn("INT"));
		add("ADD_WORKDAYS", true).parameters.push(makeReturn("DATE"), makeIn("CHAR"), makeIn("DATE"), makeIn("INT"));
		add("ADD_YEARS", false, analyzeAddToDate).parameters.push(makeReturn(), makeIn(), makeIn("INT"));
		add("DAYNAME").parameters.push(makeReturn("CHAR"), makeIn("TIMESTAMP"));
		add("DAYOFMONTH").parameters.push(makeReturn("INT"), makeIn("TIMESTAMP"));
		add("DAYOFYEAR").parameters.push(makeReturn("INT"), makeIn("TIMESTAMP"));
		add("DAYS_BETWEEN").parameters.push(makeReturn("CHAR"), makeIn("TIMESTAMP"), makeIn("TIMESTAMP"));
		add("EXTRACT", false, undefined, function(parser /*, tok*/ ) {
			var p, field, result = [];

			switch (parser.nextToken.value.toUpperCase()) {
				case "YEAR":
				case "MONTH":
				case "DAY":
				case "HOUR":
				case "MINUTE":
				case "SECOND":
					parser.advance();
					field = parser.token.identifier;
					break;
				default:
					parser.error(parser.nextToken, "not_supported");
			}
			parser.advance("FROM");
			p = parseParameter(parser, result);
			if (p && field) {
				p.field = field;
			}
			parser.advance(")");
			return result;
		}).parameters.push(makeReturn("INT"), makeIn()); // IN can be TIME or TIMESTAMP
		add("HOUR").parameters.push(makeReturn("INT"), makeIn()); // IN can be TIME or TIMESTAMP
		add("ISOWEEK").parameters.push(makeReturn("CHAR"), makeIn("TIMESTAMP"));
		add("LAST_DAY").parameters.push(makeReturn("DATE"), makeIn("TIMESTAMP"));
		add("LOCALTOUTC").parameters.push(makeReturn("TIMESTAMP"), makeIn("TIMESTAMP"), makeIn("CHAR"));
		add("MINUTE").parameters.push(makeReturn("INT"), makeIn()); // IN can be TIME or TIMESTAMP
		add("MONTH").parameters.push(makeReturn("INT"), makeIn("DATE"));
		add("MONTHNAME").parameters.push(makeReturn("CHAR"), makeIn("TIMESTAMP"));
		add("NANO100_BETWEEN").parameters.push(makeReturn("BIGINT"), makeIn("TIMESTAMP"), makeIn("TIMESTAMP"));
		add("NEXT_DAY").parameters.push(makeReturn("DATE"), makeIn("TIMESTAMP"));
		add("NOW").parameters.push(makeReturn("TIMESTAMP"));
		add("QUARTER", true).parameters.push(makeReturn("CHAR"), makeIn("TIMESTAMP")); // optional start quarter
		add("SECOND").parameters.push(makeReturn("INT"), makeIn()); // IN can be TIME or TIMESTAMP
		add("SECONDS_BETWEEN").parameters.push(makeReturn("BIGINT"), makeIn("TIMESTAMP"), makeIn("TIMESTAMP"));
		add("UTCTOLOCAL").parameters.push(makeReturn("TIMESTAMP"), makeIn("TIMESTAMP"), makeIn("CHAR"));
		add("WEEK").parameters.push(makeReturn("INT"), makeIn("TIMESTAMP"));
		add("WEEKDAY").parameters.push(makeReturn("INT"), makeIn("TIMESTAMP"));
		add("WORKDAYS_BETWEEN", true).parameters.push(makeReturn("INT"), makeIn("CHAR"), makeIn("TIMESTAMP"), makeIn("TIMESTAMP"));
		add("YEAR").parameters.push(makeReturn("INT"), makeIn("TIMESTAMP"));

		// numeric
		add("ABS").parameters.push(makeReturn("INT"), makeIn("NUMERIC"));
		add("ACOS").parameters.push(makeReturn("NUMERIC"), makeIn("NUMERIC"));
		add("ASIN").parameters.push(makeReturn("NUMERIC"), makeIn("NUMERIC"));
		add("ATAN").parameters.push(makeReturn("NUMERIC"), makeIn("NUMERIC"));
		add("ATAN2").parameters.push(makeReturn("NUMERIC"), makeIn("NUMERIC"));
		add("BINTOHEX").parameters.push(makeReturn("NUMERIC"), makeIn("VARBINARY"));
		add("BITAND", false, analyzeBitOperations).parameters.push(makeReturn(""), makeIn(""), makeIn(""));
		add("BITOR", false, analyzeBitOperations).parameters.push(makeReturn(""), makeIn(""), makeIn(""));
		add("BITXOR", false, analyzeBitOperations).parameters.push(makeReturn(""), makeIn(""), makeIn(""));
		add("BITSET").parameters.push(makeReturn("VARBINARY"), makeIn("VARBINARY"), makeIn("INT"), makeIn("INT"));
		add("BITUNSET").parameters.push(makeReturn("VARBINARY"), makeIn("VARBINARY"), makeIn("INT"), makeIn("INT"));
		add("CEIL").parameters.push(makeReturn("NUMERIC"), makeIn("NUMERIC")); // returns NUMERIC not INT!
		add("COS").parameters.push(makeReturn("NUMERIC"), makeIn("NUMERIC"));
		add("COSH").parameters.push(makeReturn("NUMERIC"), makeIn("NUMERIC"));
		add("COT").parameters.push(makeReturn("NUMERIC"), makeIn("NUMERIC"));
		add("EXP").parameters.push(makeReturn("NUMERIC"), makeIn("NUMERIC"));
		add("FLOOR").parameters.push(makeReturn("NUMERIC"), makeIn("NUMERIC")); // returns NUMERIC not INT!
		add("HEXTOBIN").parameters.push(makeReturn("VARBINARY"), makeIn("NUMERIC"));
		add("LN").parameters.push(makeReturn("NUMERIC"), makeIn("NUMERIC"));
		add("LOG").parameters.push(makeReturn("NUMERIC"), makeIn("NUMERIC"), makeIn("NUMERIC"));
		add("MOD").parameters.push(makeReturn("NUMERIC"), makeIn("NUMERIC"), makeIn("NUMERIC"));
		add("POWER").parameters.push(makeReturn("NUMERIC"), makeIn("NUMERIC"), makeIn("NUMERIC"));
		add("RAND").parameters.push(makeReturn("DOUBLE"));
		add("ROUND", true, undefined, function(parser /*, tok*/ ) {
			var p, result = [];

			parseParameter(parser, result);

			if (parser.nextToken.id === ",") {
				parser.advance(",");
				parseParameter(parser, result);
			}

			if (parser.nextToken.id === ",") {
				parser.advance(",");
				if (parser.parseIdentifier("roundingMode")) {
					p = Object.create(null);
					p.value = parser.token;
					result.push(p);
				}
			}

			parser.advance(")");
			return result;
		}).parameters.push(makeReturn("NUMERIC"), makeIn("NUMERIC"));
		add("SIGN");
		add("SIN").parameters.push(makeReturn("NUMERIC"), makeIn("NUMERIC"));
		add("SINH").parameters.push(makeReturn("NUMERIC"), makeIn("NUMERIC"));
		add("SQRT").parameters.push(makeReturn("NUMERIC"), makeIn("NUMERIC"));
		add("TAN").parameters.push(makeReturn("NUMERIC"), makeIn("NUMERIC"));
		add("TANH").parameters.push(makeReturn("NUMERIC"), makeIn("NUMERIC"));
		add("UMINUS").parameters.push(makeReturn("NUMERIC"), makeIn("NUMERIC"));

		// string
		add("ASCII").parameters.push(makeReturn("INT"), makeIn("CHAR"));
		add("BINTOSTR").parameters.push(makeReturn("VARCHAR"), makeIn("VARBINARY"));
		add("CHAR").parameters.push(makeReturn("CHAR"), makeIn("INT"));
		add("CONCAT").parameters.push(makeReturn("NVARCHAR"), makeIn("NVARCHAR"), makeIn("NVARCHAR"));
		add("LCASE").parameters.push(makeReturn("NVARCHAR"), makeIn("NVARCHAR"));
		add("LEFT").parameters.push(makeReturn("NVARCHAR"), makeIn("NVARCHAR"), makeIn("INT"));
		add("LENGTH").parameters.push(makeReturn("INT"), makeIn("NVARCHAR"));
		add("LOCATE", true).parameters.push(makeReturn("INT"), makeIn("NVARCHAR"), makeIn("NVARCHAR")); // optional start, occurrences
		add("LOWER").parameters.push(makeReturn("NVARCHAR"), makeIn("NVARCHAR"));
		add("LPAD", true).parameters.push(makeReturn("NVARCHAR"), makeIn("NVARCHAR"), makeIn("INT")); // optional pattern
		add("LTRIM", true).parameters.push(makeReturn("NVARCHAR"), makeIn("NVARCHAR")); // optional removeSet
		add("NCHAR").parameters.push(makeReturn("NCHAR"), makeIn("INT"));
		add("REPLACE").parameters.push(makeReturn("NVARCHAR"), makeIn("NVARCHAR"), makeIn("NVARCHAR"), makeIn("NVARCHAR"));
		add("RIGHT").parameters.push(makeReturn("NVARCHAR"), makeIn("NVARCHAR"), makeIn("INT"));
		add("RPAD", true).parameters.push(makeReturn("NVARCHAR"), makeIn("NVARCHAR"), makeIn("INT")); // optional pattern
		add("RTRIM", true).parameters.push(makeReturn("NVARCHAR"), makeIn("NVARCHAR")); // optional removeSet
		add("STRTOBIN").parameters.push(makeReturn("VARBINARY"), makeIn("VARCHAR"), makeIn("CHAR"));
		add("SUBSTR_AFTER").parameters.push(makeReturn("NVARCHAR"), makeIn("NVARCHAR"), makeIn("NVARCHAR"));
		add("SUBSTR_BEFORE").parameters.push(makeReturn("NVARCHAR"), makeIn("NVARCHAR"), makeIn("NVARCHAR"));
		add("SUBSTRING", true).parameters.push(makeReturn("NVARCHAR"), makeIn("NVARCHAR"), makeIn("INT")); // optional length
		add("TRIM", false, undefined, function(parser /*, tok*/ ) {
			var p, trimChar, trimOperation,
				result = [];

			if (parser.advanceIf("LEADING")) {
				trimOperation = parser.token;
			} else if (parser.advanceIf("TRAILING")) {
				trimOperation = parser.token;
			} else if (parser.advanceIf("BOTH")) {
				trimOperation = parser.token;
			}

			p = parseParameter(parser, result);
			if (parser.advanceIf("FROM")) {
				trimChar = p.value;
				result = [];
			}

			p = parseParameter(parser, result);
			if (trimOperation) {
				p.trimOperation = trimOperation;
			}
			if (trimChar) {
				p.trimChar = trimChar;
			}

			parser.advance(")");
			return result;
		}).parameters.push(makeReturn("NVARCHAR"), makeIn("NVARCHAR"));
		add("UCASE").parameters.push(makeReturn("NVARCHAR"), makeIn("NVARCHAR"));
		add("UNICODE").parameters.push(makeReturn("INT"), makeIn("NCHAR"));
		add("UPPER").parameters.push(makeReturn("NVARCHAR"), makeIn("NVARCHAR"));

		// misc
		add("COALESCE", true).parameters.push(makeReturn(), makeIn(), makeIn()); // optional more expressions
		add("CONVERT_CURRENCY", true,
			function(analyzer, params, parent) {
				analyzer.analyzeCallParameters(params, parent);
				return [makeReturn("NUMERIC"), makeIn("NUMERIC", "AMOUNT"), makeIn("VARCHAR", "SOURCE_UNIT"), makeIn("VARCHAR", "TARGET_UNIT"),
					makeIn("CHAR", "CLIENT"), makeIn("VARCHAR", "SCHEMA")];
			},
			function(parser, tok) {
				return parser.parseCallParameters(tok);
			}).parameters.push(
			makeReturn("NUMERIC"),
			makeIn("NUMERIC", "AMOUNT"),
			makeIn("VARCHAR", "SOURCE_UNIT_COLUMN"),
			makeIn("VARCHAR", "TARGET_UNIT_COLUMN"),
			makeIn("DATE", "REFERENCE_DATE_COLUMN"),
			makeIn("VARCHAR", "SOURCE_UNIT"),
			makeIn("VARCHAR", "TARGET_UNIT"),
			makeIn("DATE", "REFERENCE_DATE"),
			makeIn("CHAR", "CLIENT"),
			makeIn("VARCHAR", "SCHEMA"),
			makeIn("VARCHAR", "CONVERSION_TYPE"),
			makeIn("VARCHAR", "LOOKUP"),
			makeIn("VARCHAR", "ERROR_HANDLING"),
			makeIn("VARCHAR", "ACCURACY"),
			makeIn("VARCHAR", "DATE_FORMAT"),
			makeIn("VARCHAR", "STEPS"),
			makeIn("VARCHAR", "CONFIGURATION_TABLE"),
			makeIn("VARCHAR", "PRECISIONS_TABLE"),
			makeIn("VARCHAR", "NOTATION_TABLE"),
			makeIn("VARCHAR", "RATES_TABLE"),
			makeIn("VARCHAR", "PREFACTORS_TABLE"));
		add("CONVERT_UNIT", true,
			function(analyzer, params, parent) {
				analyzer.analyzeCallParameters(params, parent);
				return [makeReturn("NUMERIC"), makeIn("NUMERIC", "QUANTITY"), makeIn("VARCHAR", "SOURCE_UNIT"), makeIn("VARCHAR", "TARGET_UNIT"),
					makeIn("CHAR", "CLIENT"), makeIn("VARCHAR", "SCHEMA")];
			},
			function(parser, tok) {
				return parser.parseCallParameters(tok);
			}).parameters.push(
			makeReturn("NUMERIC"),
			makeIn("NUMERIC", "QUANTITY"),
			makeIn("VARCHAR", "SOURCE_UNIT_COLUMN"),
			makeIn("VARCHAR", "TARGET_UNIT_COLUMN"),
			makeIn("VARCHAR", "SOURCE_UNIT"),
			makeIn("VARCHAR", "TARGET_UNIT"),
			makeIn("CHAR", "CLIENT"),
			makeIn("VARCHAR", "SCHEMA"),
			makeIn("VARCHAR", "ERROR_HANDLING"),
			makeIn("VARCHAR", "RATES_TABLE"),
			makeIn("VARCHAR", "DIMENSION_TABLE"));
		add("GREATEST", true).parameters.push(makeReturn(), makeIn()); // optional more expressions
		add("GROUPING", false, undefined, function(parser /*, tok*/ ) {
			var p, result = [];

			p = Object.create("null");
			p.value = parser.parseColumnName();
			if (p.value) {
				result.push(p);
			}
			parser.advance(")");
			return result;
		}).parameters.push(makeReturn("INT"), makeIn());
		add("GROUPING_ID", true, undefined, function(parser /*, tok*/ ) {
			var p, i, params, result = [];

			params = this.makeParseList(this.parseColumnName, "no_columns")();
			for (i = 0; i < params.length; i++) {
				p = Object.create("null");
				p.value = params[i];
				if (p.value) {
					result.push(p);
				}
			}
			parser.advance(")");
			return result;
		}).parameters.push(makeReturn("INT"), makeIn());
		add("HASH_SHA256", true).parameters.push(makeReturn("VARBINARY"), makeIn("VARBINARY")); // optional more expressions
		add("IFNULL").parameters.push(makeReturn(), makeIn(), makeIn());
		add("LEAST", true).parameters.push(makeReturn(), makeIn()); // optional more expressions
		add("MAP", true).parameters.push(makeReturn(), makeIn(), makeIn(), makeIn()); // optional more search, result pairs, default result
		add("NULLIF").parameters.push(makeReturn(), makeIn(), makeIn());
		add("SESSION_CONTEXT").parameters.push(makeReturn("NVARCHAR"), makeIn("CHAR"));

		// window
		add("RANK", false, undefined, parseWindowFunction).parameters.push(makeReturn("INT"));
		add("DENSE_RANK", false, undefined, parseWindowFunction).parameters.push(makeReturn("INT"));
		add("ROW_NUMBER", false, undefined, parseWindowFunction).parameters.push(makeReturn("INT"));
		add("PERCENT_RANK", false, undefined, parseWindowFunction).parameters.push(makeReturn("NUMERIC"));
		add("CUME_DIST", false, undefined, parseWindowFunction).parameters.push(makeReturn("NUMERIC"));
		add("NTILE", false, undefined, parseWindowFunction).parameters.push(makeReturn("INT"), makeIn("INT"));
		add("LEAD", true, undefined, parseWindowFunction).parameters.push(makeReturn("INT"), makeIn("INT")); // optional offset and defaultExpr
		add("LAG", true, undefined, parseWindowFunction).parameters.push(makeReturn("INT"), makeIn("INT")); // optional offset and defaultExpr
		add("FIRST_VALUE", false, undefined, parseWindowFunction).parameters.push(makeReturn(), makeIn());
		add("LAST_VALUE", false, undefined, parseWindowFunction).parameters.push(makeReturn(), makeIn());
		add("NTH_VALUE", false, undefined, parseWindowFunction).parameters.push(makeReturn(), makeIn(), makeIn("INT"));

		// script
		add("APPLY_FILTER").parameters.push(makeReturn(), makeIn(), makeIn("NVARCHAR"));
		add("ARRAY", true).parameters.push(makeReturn(), makeIn());
		add("ARRAY_AGG", false, undefined, function(parser /*, tok*/ ) {
			var p, result = [];

			p = parseParameter(parser, result, false, 26);
			if (parser.advanceIf("ORDER")) {
				parser.advance("BY");
				p.orderBy = parser.makeParseList(parser.parseOrderByExpression, "no_order_by_expression")();
			}
			parser.advance(")");
			return result;
		}).parameters.push(makeReturn(), makeIn());
		add("CARDINALITY").parameters.push(makeReturn("INT"), makeIn());
		add("TRIM_ARRAY").parameters.push(makeReturn(), makeIn(), makeIn("INT"));
		add("UNNEST", true, undefined, function(parser, tok) {
			var result = defaultParse(parser, tok);

			if (parser.advanceIf("WITH")) {
				parser.advance("ORDINALITY");
				tok.withOrdinality = true;
			}
			if (parser.advanceIf("AS")) {
				tok.columns = parser.parseColumnsList();
			}
			return result;
		}).parameters.push(makeReturn(), makeIn()); // optional more array variables

		return functions;
	}

	_functions = createFunctions();
	_methods = createMethods();

	Functions.prototype.getBuiltIn = function(name) {
		// identifier can be a token in case of a function defined in the same script
		var id = name && name.identifier ? name.identifier : name;

		return _functions[id];
	};

	Functions.prototype.getMethod = function(name) {
		// identifier can be a token in case of a function defined in the same script
		var id = name && name.identifier ? name.identifier : name;

		return _methods[id];
	};

	Functions.prototype.analyzeBuiltIn = function(analyzer, definition, params, parent) {
		var builtIn, result;

		if (definition.kind === "method") {
			builtIn = this.getMethod(definition.identifier);
		} else {
			builtIn = this.getBuiltIn(definition.identifier);
		}
		if (builtIn) {
			result = builtIn.analyze.call(this, analyzer, params, parent) || builtIn.parameters;
			definition.resolved = true;
			definition.description = builtIn.description;
			definition.mainType = builtIn.mainType;
			definition.subType = builtIn.subType;
			definition.parameters = builtIn.parameters;
			definition.hasOptionalParameters = builtIn.hasOptionalParameters;
		} else {
			analyzer.analyzeCallParameters(params, parent);
		}
		return result;
	};

	return new Functions();

});