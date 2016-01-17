define(['sap/hana/ide/editor/plugin/analytics/view/TypedObjectParser'], function(TypedObjectParser) {
    "use strict";

    var columnParser = new TypedObjectParser("column");

    var testParser = function(input, expectedName, expectedType, expectedLength, expectedScale, expectedAggregation, existingColumn) {
        var expected = {
            value: input.replace(/\s/g, ''),
            errorId: null,
            errorParams: [],
            errorMatch: "",
            objectAttributes: {
                name: expectedName,
                label: existingColumn ? existingColumn.label : expectedName,
                aggregationBehavior: expectedAggregation
            },
            typeAttributes: {
                primitiveType: expectedType,
                isDerived: false
            }
        };
        if (typeof expectedLength !== "undefined" || existingColumn && existingColumn.hasOwnProperty("length") && typeof existingColumn.length === "number") {
            expected.typeAttributes.length = expectedLength;
        }
        if (typeof expectedScale !== "undefined" || existingColumn && existingColumn.hasOwnProperty("scale") && typeof existingColumn.scale === "number") {
            expected.typeAttributes.scale = expectedScale;
        }
        deepEqual(columnParser.parse(input, existingColumn), expected, "pattern match: result for " + input);
    };

    var testParserNegative = function(input, expectedId, expectedObject, expectedMatch, expectedValue) {
        if (!Array.isArray(expectedObject)) expectedObject = [expectedObject];
        var expectedMessage = {
            value: expectedValue ? expectedValue : input.replace(/\s/g, ''),
            errorId: expectedId,
            errorParams: expectedObject,
            errorMatch: expectedMatch ? expectedMatch : "",
            objectAttributes: {},
            typeAttributes: {}
        };
        deepEqual(columnParser.parse(input), expectedMessage, "negative pattern: match messages for " + input);
    };

    module("TypedObjectParser");

    test("parse column", function() {
        var test, expected;
        // test
        testParser("X:TEXT", "X", "TEXT", undefined, undefined, "none");
        testParser("X:ALPHANUM(10)", "X", "ALPHANUM", 10, undefined, "none");
        testParser("X:DECIMAL(20,10)", "X", "DECIMAL", 20, 10, "sum");
        testParser(" X123   : INTEGER ", "X123", "INTEGER", undefined, undefined, "sum");
        testParser(" _X:VARCHAR( 1 ) ", "_X", "VARCHAR", 1, undefined, "none");
        testParser("X:DECIMAL(  20 ,10  )  ", "X", "DECIMAL", 20, 10, "sum");
        testParser("X:DECIMAL(  20 )  ", "X", "DECIMAL", 20, 0, "sum");
        testParser("X:DECIMAL(20,20)  ", "X", "DECIMAL", 20, 20, "sum");
        // test default values and determination of aggregationBehavior
        testParser("X:DATE", "X", "DATE", undefined, undefined, "min");
        testParser("X:DATE", "X", "DATE", undefined, undefined, "none", {
            aggregationBehavior: "NONE",
            label: "Another Label"
        });
        testParser("X:DATE", "X", "DATE", undefined, undefined, "count", {
            aggregationBehavior: "COUNT",
            label: "Another Label"
        });
        testParser("X:TEXT", "X", "TEXT", undefined, undefined, "count", {
            aggregationBehavior: "COUNT",
            label: "Another Label"
        });
        testParser("X:DATE", "X", "DATE", undefined, undefined, "none", {
            length: 3,
            aggregationBehavior: "NONE",
            label: "Another Label"
        });
        testParser("X:DATE", "X", "DATE", undefined, undefined, "none", {
            length: 3,
            scale: 1,
            aggregationBehavior: "NONE",
            label: "Another Label"
        });
        testParser("X:VARCHAR(10)", "X", "VARCHAR", 10, undefined, "none", {
            length: 3,
            scale: 1,
            aggregationBehavior: "NONE",
            label: "Another Label"
        });
        testParser("X:VARCHAR(10)", "X", "VARCHAR", 10, undefined, "none", {
            length: 3,
            aggregationBehavior: "NONE",
            label: "Another Label"
        });
        // syntax negavive test
        testParserNegative("", columnParser.MSG_OBJECT_EMPTY, [], "");
        testParserNegative("~", columnParser.MSG_OBJECT_INVALID_NAME, [], "~");
        testParserNegative("~X", columnParser.MSG_OBJECT_INVALID_NAME, [], "~");
        testParserNegative("~#X+", columnParser.MSG_OBJECT_INVALID_NAME, [], "~");
        testParserNegative("X", columnParser.MSG_OBJECT_MISSING_COLON, [], "X");
        testParserNegative("X~", columnParser.MSG_OBJECT_MISSING_COLON, [], "X~");
        testParserNegative("X Y:", columnParser.MSG_OBJECT_MISSING_COLON, [], "X ", "X Y:");
        testParserNegative("X~:", columnParser.MSG_OBJECT_MISSING_COLON, [], "X~");
        testParserNegative("X:~", columnParser.MSG_OBJECT_INVALID_TYPE, [], "X:~");
        testParserNegative("X:~Y", columnParser.MSG_OBJECT_INVALID_TYPE, [], "X:~");
        testParserNegative("X:Y~", columnParser.MSG_OBJECT_MISSING_OPENING_BRACKET, [], "X:Y~");
        testParserNegative("X:Y Z(", columnParser.MSG_OBJECT_MISSING_OPENING_BRACKET, [], "X:Y ", "X:Y Z(");
        testParserNegative("X:Y~(", columnParser.MSG_OBJECT_MISSING_OPENING_BRACKET, [], "X:Y~");
        testParserNegative("X:Y(", columnParser.MSG_OBJECT_INVALID_LENGTH, [], "X:Y(");
        testParserNegative("X:Y(~", columnParser.MSG_OBJECT_INVALID_LENGTH, [], "X:Y(~");
        testParserNegative("X:Y(~20", columnParser.MSG_OBJECT_INVALID_LENGTH, [], "X:Y(~");
        testParserNegative("X:Y(20", columnParser.MSG_OBJECT_MISSING_CLOSING_BRACKET_OR_COMMA, [], "X:Y(20");
        testParserNegative("X:Y(20~", columnParser.MSG_OBJECT_MISSING_CLOSING_BRACKET_OR_COMMA, [], "X:Y(20~");
        testParserNegative("X:Y(20~,", columnParser.MSG_OBJECT_MISSING_CLOSING_BRACKET_OR_COMMA, [], "X:Y(20~");
        testParserNegative("X:Y(20~)", columnParser.MSG_OBJECT_MISSING_CLOSING_BRACKET_OR_COMMA, [], "X:Y(20~");
        testParserNegative("X:Y(20,", columnParser.MSG_OBJECT_INVALID_SCALE, [], "X:Y(20,");
        testParserNegative("X:Y(20,~", columnParser.MSG_OBJECT_INVALID_SCALE, [], "X:Y(20,~");
        testParserNegative("X:Y(20,~10", columnParser.MSG_OBJECT_INVALID_SCALE, [], "X:Y(20,~");
        testParserNegative("X:Y(20,10", columnParser.MSG_OBJECT_MISSING_CLOSING_BRACKET, [], "X:Y(20,10");
        testParserNegative("X:Y(20,10~", columnParser.MSG_OBJECT_MISSING_CLOSING_BRACKET, [], "X:Y(20,10~");
        testParserNegative("X:Y(20,10~)", columnParser.MSG_OBJECT_MISSING_CLOSING_BRACKET, [], "X:Y(20,10~");
        // semantic negativ tests
        testParserNegative("X:Y", columnParser.MSG_OBJECT_UNKNOWN_DATA_TYPE, ["Y"]);
        testParserNegative("X:TEXT(3)", columnParser.MSG_OBJECT_LENGTH_NOT_SUPPORTED, ["TEXT"]);
        testParserNegative("X:FLOAT(10,2)", columnParser.MSG_OBJECT_SCALE_NOT_SUPPORTED, ["FLOAT"]);
        testParserNegative("X:NVARCHAR", columnParser.MSG_OBJECT_LENGTH_NOT_SPECIFIED, ["NVARCHAR"]);
        testParserNegative("X:ALPHANUM(0)", columnParser.MSG_OBJECT_MINIMUM_LENGTH_1, ["ALPHANUM"]);
        testParserNegative("X:SHORTTEXT(5001)", columnParser.MSG_OBJECT_MAX_LEN_EXCEEDED, ["SHORTTEXT", 5000]);
        testParserNegative("X:DECIMAL(10,20)", columnParser.MSG_OBJECT_MAX_SCALE_EXCEEDED, ["DECIMAL", 10]);

    });

});