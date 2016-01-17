/** Copyright © 2015 SAP SE or an affiliate company. All rights reserved.**/

define([], function() {

    // Data Type Conversion Functions
    var DATA_TYPE_CONVERSION_FUNCTIONS = [{
        "name": "CAST",
        "prefix": "CAST",
        "description": "CAST()",
        "template": "CAST(${expression} AS ${data_type})",
        "category": "sql.function"
    }, {
        "name": "TO_ALPHANUM",
        "prefix": "TO_ALPHANUM",
        "description": "TO_ALPHANUM()",
        "template": "TO_ALPHANUM(${value})",
        "category": "sql.function"
    }, {
        "name": "TO_BIGINT",
        "prefix": "TO_BIGINT",
        "description": "TO_BIGINT()",
        "template": "TO_BIGINT(${value})",
        "category": "sql.function"
    }, {
        "name": "TO_BINARY",
        "prefix": "TO_BINARY",
        "description": "TO_BINARY()",
        "template": "TO_BINARY(${value})",
        "category": "sql.function"
    }, {
        "name": "TO_BLOB",
        "prefix": "TO_BLOB",
        "description": "TO_BLOB()",
        "template": "TO_BLOB(${value})",
        "category": "sql.function"
    }, {
        "name": "TO_CLOB",
        "prefix": "TO_CLOB",
        "description": "TO_CLOB()",
        "template": "TO_CLOB(${value})",
        "category": "sql.function"
    }, {
        "name": "TO_DATE",
        "prefix": "TO_DATE",
        "description": "TO_DATE()",
        "template": "TO_DATE(${d})",
        "category": "sql.function"
    }, {
        "name": "TO_DATS",
        "prefix": "TO_DATS",
        "description": "TO_DATS()",
        "template": "TO_DATS(${d})",
        "category": "sql.function"
    }, {
        "name": "TO_DECIMAL",
        "prefix": "TO_DECIMAL",
        "description": "TO_DECIMAL()",
        "template": "TO_DECIMAL(${value})",
        "category": "sql.function"
    }, {
        "name": "TO_DOUBLE",
        "prefix": "TO_DOUBLE",
        "description": "TO_DOUBLE()",
        "template": "TO_DOUBLE(${value})",
        "category": "sql.function"
    }, {
        "name": "TO_INT",
        "prefix": "TO_INT",
        "description": "TO_INT()",
        "template": "TO_INT(${value})",
        "category": "sql.function"
    }, {
        "name": "TO_INTEGER",
        "prefix": "TO_INTEGER",
        "description": "TO_INTEGER()",
        "template": "TO_INTEGER(${value})",
        "category": "sql.function"
    }, {
        "name": "TO_NCLOB",
        "prefix": "TO_NCLOB",
        "description": "TO_NCLOB()",
        "template": "TO_NCLOB(${value})",
        "category": "sql.function"
    }, {
        "name": "TO_NVARCHAR",
        "prefix": "TO_NVARCHAR",
        "description": "TO_NVARCHAR()",
        "template": "TO_NVARCHAR(${value})",
        "category": "sql.function"
    }, {
        "name": "TO_REAL",
        "prefix": "TO_REAL",
        "description": "TO_REAL()",
        "template": "TO_REAL(${value})",
        "category": "sql.function"
    }, {
        "name": "TO_SECONDDATE",
        "prefix": "TO_SECONDDATE",
        "description": "TO_SECONDDATE()",
        "template": "TO_SECONDDATE(${d})",
        "category": "sql.function"
    }, {
        "name": "TO_SMALLDECIMAL",
        "prefix": "TO_SMALLDECIMAL",
        "description": "TO_SMALLDECIMAL()",
        "template": "TO_SMALLDECIMAL(${value})",
        "category": "sql.function"
    }, {
        "name": "TO_SMALLINT",
        "prefix": "TO_SMALLINT",
        "description": "TO_SMALLINT()",
        "template": "TO_SMALLINT(${value})",
        "category": "sql.function"
    }, {
        "name": "TO_TIME",
        "prefix": "TO_TIME",
        "description": "TO_TIME()",
        "template": "TO_TIME(${t})",
        "category": "sql.function"
    }, {
        "name": "TO_TIMESTAMP",
        "prefix": "TO_TIMESTAMP",
        "description": "TO_TIMESTAMP()",
        "template": "TO_TIMESTAMP(${d})",
        "category": "sql.function"
    }, {
        "name": "TO_TINYINT",
        "prefix": "TO_TINYINT",
        "description": "TO_TINYINT()",
        "template": "TO_TINYINT(${value})",
        "category": "sql.function"
    }, {
        "name": "TO_VARCHAR",
        "prefix": "TO_VARCHAR",
        "description": "TO_VARCHAR()",
        "template": "TO_VARCHAR(${value})",
        "category": "sql.function"
    }];

    // DateTime Functions
    var DATA_TIME_FUNCTIONS = [{
        "name": "ADD_DAYS",
        "prefix": "ADD_DAYS",
        "description": "ADD_DAYS()",
        "template": "ADD_DAYS(${d}, ${n})",
        "category": "sql.function"
    }, {
        "name": "ADD_MONTHS",
        "prefix": "ADD_MONTHS",
        "description": "ADD_MONTHS()",
        "template": "ADD_MONTHS(${d}, ${n})",
        "category": "sql.function"
    }, {
        "name": "ADD_SECONDS",
        "prefix": "ADD_SECONDS",
        "description": "ADD_SECONDS()",
        "template": "ADD_SECONDS(${t}, ${n})",
        "category": "sql.function"
    }, {
        "name": "ADD_YEARS",
        "prefix": "ADD_YEARS",
        "description": "ADD_YEARS()",
        "template": "ADD_YEARS(${d}, ${n})",
        "category": "sql.function"
    }, {
        "name": "DAYNAME",
        "prefix": "DAYNAME",
        "description": "DAYNAME()",
        "template": "DAYNAME(${d})",
        "category": "sql.function"
    }, {
        "name": "DAYOFMONTH",
        "prefix": "DAYOFMONTH",
        "description": "DAYOFMONTH()",
        "template": "DAYOFMONTH(${d})",
        "category": "sql.function"
    }, {
        "name": "DAYOFYEAR",
        "prefix": "DAYOFYEAR",
        "description": "DAYOFYEAR()",
        "template": "DAYOFYEAR(${d})",
        "category": "sql.function"
    }, {
        "name": "DAYS_BETWEEN",
        "prefix": "DAYS_BETWEEN",
        "description": "DAYS_BETWEEN()",
        "template": "DAYS_BETWEEN(${d1}, ${d2})",
        "category": "sql.function"
    }, {
        "name": "EXTRACT",
        "prefix": "EXTRACT",
        "description": "EXTRACT(YEAR...)",
        "template": "EXTRACT(YEAR FROM ${d})",
        "category": "sql.function"
    }, {
        "name": "EXTRACT",
        "prefix": "EXTRACT",
        "description": "EXTRACT(MONTH...)",
        "template": "EXTRACT(MONTH FROM ${d})",
        "category": "sql.function"
    }, {
        "name": "EXTRACT",
        "prefix": "EXTRACT",
        "description": "EXTRACT(DAY...)",
        "template": "EXTRACT(DAY FROM ${d})",
        "category": "sql.function"
    }, {
        "name": "EXTRACT",
        "prefix": "EXTRACT",
        "description": "EXTRACT(HOUR...)",
        "template": "EXTRACT(HOUR FROM ${d})",
        "category": "sql.function"
    }, {
        "name": "EXTRACT",
        "prefix": "EXTRACT",
        "description": "EXTRACT(MINUTE...)",
        "template": "EXTRACT(MINUTE FROM ${d})",
        "category": "sql.function"
    }, {
        "name": "EXTRACT",
        "prefix": "EXTRACT",
        "description": "EXTRACT(SECOND...)",
        "template": "EXTRACT(SECOND FROM ${d})",
        "category": "sql.function"
    }, {
        "name": "HOUR",
        "prefix": "HOUR",
        "description": "HOUR()",
        "template": "HOUR(${t})",
        "category": "sql.function"
    }, {
        "name": "ISOWEEK",
        "prefix": "ISOWEEK",
        "description": "ISOWEEK()",
        "template": "ISOWEEK(${d})",
        "category": "sql.function"
    }, {
        "name": "LAST_DAY",
        "prefix": "LAST_DAY",
        "description": "LAST_DAY()",
        "template": "LAST_DAY(${d})",
        "category": "sql.function"
    }, {
        "name": "LOCALTOUTC",
        "prefix": "LOCALTOUTC",
        "description": "LOCALTOUTC()",
        "template": "LOCALTOUTC(${t}, ${timezone})",
        "category": "sql.function"
    }, {
        "name": "MINUTE",
        "prefix": "MINUTE",
        "description": "MINUTE()",
        "template": "MINUTE(${t})",
        "category": "sql.function"
    }, {
        "name": "MONTH",
        "prefix": "MONTH",
        "description": "MONTH()",
        "template": "MONTH(${d})",
        "category": "sql.function"
    }, {
        "name": "MONTHNAME",
        "prefix": "MONTHNAME",
        "description": "MONTHNAME()",
        "template": "MONTHNAME(${d})",
        "category": "sql.function"
    }, {
        "name": "NEXT_DAY",
        "prefix": "NEXT_DAY",
        "description": "NEXT_DAY() - THE DATE OF THE NEXT DAY AFTER DATE d",
        "template": "NEXT_DAY(${d})",
        "category": "sql.function"
    }, {
        "name": "NOW",
        "prefix": "NOW",
        "description": "NOW() - RETURNS THE CURRENT TIMESTAMP ",
        "template": "NOW()",
        "category": "sql.function"
    }, {
        "name": "QUARTER",
        "prefix": "QUARTER",
        "description": "QUARTER() - THE NUMBERICAL YEAR QUARTER OF DATE d ",
        "template": "QUARTER(${d})",
        "category": "sql.function"
    }, {
        "name": "SECOND",
        "prefix": "SECOND",
        "description": "SECOND() - THE SECOND OF TIME t ",
        "template": "SECOND(${t})",
        "category": "sql.function"
    }, {
        "name": "SECONDS_BETWEEN",
        "prefix": "SECONDS_BETWEEN",
        "description": "SECONDS_BETWEEN() - THE SECOND OF TIME t ",
        "template": "SECONDS_BETWEEN(${d1}, ${d2})",
        "category": "sql.function"
    }, {
        "name": "UTCTOLOCAL",
        "prefix": "UTCTOLOCAL",
        "description": "UTCTOLOCAL()",
        "template": "UTCTOLOCAL(${t}, ${timezone})",
        "category": "sql.function"
    }, {
        "name": "WEEK",
        "prefix": "WEEK",
        "description": "WEEK() - RETURNS THE WEEK NUMBER OF DATE d ",
        "template": "WEEK(${d})",
        "category": "sql.function"
    }, {
        "name": "WEEKDAY",
        "prefix": "WEEKDAY",
        "description": "WEEKDAY()",
        "template": "WEEKDAY(${d})",
        "category": "sql.function"
    }, {
        "name": "YEAR",
        "prefix": "YEAR",
        "description": "YEAR() - RETURNS THE YEAR NUMBER OF DATE d",
        "template": "YEAR(${d})",
        "category": "sql.function"
    }];

    // Fulltext Functions
    var FULL_TEXT_FUNCTIONS = [{
        "name": "LANGUAGE",
        "prefix": "LANGUAGE",
        "description": "LANGUAGE() - LANGUAGE OF THE CORRESPONDING COLUMN ENTRIES",
        "template": "LANGUAGE(${<column_name>})",
        "category": "sql.function"
    }, {
        "name": "MIMETYPE",
        "prefix": "MIMETYPE",
        "description": "MIMETYPE() - THE MIME TYPE OF THE CORRESPONDING CELL(S)",
        "template": "MIMETYPE(${<column_name>})",
        "category": "sql.function"
    }, {
        "name": "SCORE",
        "prefix": "SCORE",
        "description": "SCORE()",
        "template": "SELECT SCORE(),* FROM ${<table_name>} WHERE CONTAINS(${<search_term>})",
        "category": "sql.function"
    }];

    // Number Functions
    var NUMBER_FUNCTIONS = [{
        "name": "ABS",
        "prefix": "ABS",
        "description": "ABS() - THE ABSOLUTE VALUE",
        "template": "ABS(${n})",
        "category": "sql.function"
    }, {
        "name": "ASIN",
        "prefix": "ASIN",
        "description": "ASIN() - THE ARC-SINE",
        "template": "ASIN(${n})",
        "category": "sql.function"
    }, {
        "name": "ACOS",
        "prefix": "ACOS",
        "description": "ACOS() - THE ARC-COSINE",
        "template": "ACOS(${n})",
        "category": "sql.function"
    }, {
        "name": "ATAN",
        "prefix": "ATAN",
        "description": "ATAN() - THE ARC-TANGENT",
        "template": "ATAN(${n})",
        "category": "sql.function"
    }, {
        "name": "ATAN2",
        "prefix": "ATAN2",
        "description": "ATAN2() - THE ARC-TANGENT ",
        "template": "ATAN2(${n}, ${m})",
        "category": "sql.function"
    }, {
        "name": "BINTOHEX",
        "prefix": "BINTOHEX",
        "description": "BINTOHEX() - CONVERTS A BINARY VALUE TO A HEXADECIMAL VALUE",
        "template": "BINTOHEX(${expression})",
        "category": "sql.function"
    }, {
        "name": "BITAND",
        "prefix": "BITAND",
        "description": "BITAND()",
        "template": "BITAND(${n}, ${m})",
        "category": "sql.function"
    }, {
        "name": "CEIL",
        "prefix": "CEIL",
        "description": "CEIL() - THE FIRST INTEGER THAT'S GREATER OR EQUAL TO THE VALUE n ",
        "template": "CEIL(${n})",
        "category": "sql.function"
    }, {
        "name": "COS",
        "prefix": "COS",
        "description": "COS() - RETURNS THE CONSINE OF THE ANGLE",
        "template": "COS(${n})",
        "category": "sql.function"
    }, {
        "name": "COSH",
        "prefix": "COSH",
        "description": "COSH() - COMPUTERS THE HYPERBOLIC CONSINE OF THE ARGUMENT n ",
        "template": "COSH(${n})",
        "category": "sql.function"
    }, {
        "name": "COT",
        "prefix": "COT",
        "description": "COT() - COMPUTERS THE COTANGENT OF A NUMBER n ",
        "template": "COT(${n})",
        "category": "sql.function"
    }, {
        "name": "EXP",
        "prefix": "EXP",
        "description": "EXP()",
        "template": "EXP(${n})",
        "category": "sql.function"
    }, {
        "name": "FLOOR",
        "prefix": "FLOOR",
        "description": "FLOOR() - THE LARGEST INTEGER NOT GREATER THAN THE NUMERIC n ",
        "template": "FLOOR(${n})",
        "category": "sql.function"
    }, {
        "name": "HEXTOBIN",
        "prefix": "HEXTOBIN",
        "description": "HEXTOBIN() - CONVERTS A HEXADECIMAL VALUE TO A BINARY VALUE ",
        "template": "HEXTOBIN(${value})",
        "category": "sql.function"
    }, {
        "name": "LN",
        "prefix": "LN",
        "description": "LN() - RETURNS THE NATURAL LOGARITHM OF THE ARGUMENT n ",
        "template": "LN(${n})",
        "category": "sql.function"
    }, {
        "name": "LOG",
        "prefix": "LOG",
        "description": "LOG() - RETURNS THE NATURAL LOGARITHM OF A NUMBER n BASE b ",
        "template": "LOG(${b}, ${n})",
        "category": "sql.function"
    }, {
        "name": "MOD",
        "prefix": "MOD",
        "description": "MOD() - THE REMAINDER OF A NUMBER n DIVIDED BY A DIVISOR d ",
        "template": "MOD(${n}, ${d})",
        "category": "sql.function"
    }, {
        "name": "POWER",
        "prefix": "POWER",
        "description": "POWER() - THE BASE NUMBER b RAISED TO THE POWER OF AN EXPONENT e ",
        "template": "POWER(${b}, ${e})",
        "category": "sql.function"
    }, {
        "name": "RAND",
        "prefix": "RAND",
        "description": "RAND() - RETURNS A PSEUDO-RANDOM VALUE IN THE RANGE OF [0,10] ",
        "template": "RAND()",
        "category": "sql.function"
    }, {
        "name": "ROUND",
        "prefix": "ROUND",
        "description": "ROUND()",
        "template": "ROUND(${n}, ${pos})",
        "category": "sql.function"
    }, {
        "name": "ROUND_WITH_ROUNDING_MODE",
        "prefix": "ROUND",
        "description": "ROUND() WITH ROUNDING MODE",
        "template": "ROUND(${n}, ${pos}, ${rounding_mode})",
        "category": "sql.function"
    }, {
        "name": "SIGN",
        "prefix": "SIGN",
        "description": "SIGN() - THE SIGN (POSITIVE OR NEGATIVE)",
        "template": "SIGN(${n})",
        "category": "sql.function"
    }, {
        "name": "SIN",
        "prefix": "SIN",
        "description": "SIN() - THE SINE OF n ",
        "template": "SIN(${n})",
        "category": "sql.function"
    }, {
        "name": "SINH",
        "prefix": "SINH",
        "description": "SINH() - THE HYPERBOLIC SINE OF n ",
        "template": "SINH(${n})",
        "category": "sql.function"
    }, {
        "name": "SQRT",
        "prefix": "SQRT",
        "description": "SQRT() - THE SQUARE ROOT OF THE ARGUMENT n ",
        "template": "SQRT(${n})",
        "category": "sql.function"
    }, {
        "name": "TAN",
        "prefix": "TAN",
        "description": "TAN() - RETURNS THE TANGENT OF n ",
        "template": "TAN(${n})",
        "category": "sql.function"
    }, {
        "name": "TANH",
        "prefix": "TANH",
        "description": "TANH() - THE HYPERBOLIC TANGENT OF THE NUMERIC ARGUMENT n ",
        "template": "TANH(${n})",
        "category": "sql.function"
    }, {
        "name": "UMINUS",
        "prefix": "UMINUS",
        "description": "UMINU() - THE NAGATED VALUE OF THE NUMERIC ARGUMENT n ",
        "template": "UMINUS(${n})",
        "category": "sql.function"
    }];

    // String Functions
    var STRING_FUNCTIONS = [{
        "name": "ASCII",
        "prefix": "ASCII",
        "description": "ASCII() - THE ASCII VALUE OF THE FIRST BYTE IN A STRING c ",
        "template": "ASCII(${c})",
        "category": "sql.function"
    }, {
        "name": "CHAR",
        "prefix": "CHAR",
        "description": "CHAR() - THE CHARACTER WITH THE ASCII VALUE OF A NUMBER n ",
        "template": "CHAR(${n})",
        "category": "sql.function"
    }, {
        "name": "CONCAT",
        "prefix": "CONCAT",
        "description": "CONCAT() - A COMBINED STRING CONSISTING OF str1 FOLLOWED BY str2 ",
        "template": "CONCAT(${str1}, ${str2})",
        "category": "sql.function"
    }, {
        "name": "LCASE",
        "prefix": "LCASE",
        "description": "LCASE() - CONVERTS ALL CHARACTERS IN STRING str TO LOWERCASE ",
        "template": "LCASE(${str})",
        "category": "sql.function"
    }, {
        "name": "LEFT",
        "prefix": "LEFT",
        "description": "LEFT() - THE FIRST n CHARACTERS OF STRING str ",
        "template": "LEFT(${str}, ${n})",
        "category": "sql.function"
    }, {
        "name": "LENGTH",
        "prefix": "LENGTH",
        "description": "LENGTH() - THE NUMBER OF CHARACTERS IN STRING str ",
        "template": "LENGTH(${str})",
        "category": "sql.function"
    }, {
        "name": "LOCATE",
        "prefix": "LOCATE",
        "description": "LOCATE() - THE POSITION OF A SUBSTRING needle WITHIN haystack ",
        "template": "LOCATE(${haystack}, ${needle})",
        "category": "sql.function"
    }, {
        "name": "LOWER",
        "prefix": "LOWER",
        "description": "LOWER() - CONVERTS ALL CHARACTERS IN STRING str TO LOWERCASE ",
        "template": "LOWER(${str})",
        "category": "sql.function"
    }, {
        "name": "LPAD",
        "prefix": "LPAD",
        "description": "LPAD()",
        "template": "LPAD(${str}, ${n})",
        "category": "sql.function"
    }, {
        "name": "LTRIM",
        "prefix": "LTRIM",
        "description": "LTRIM() - RETURNS STRING str, TRIMMED OF ALL LEADING SPACES ",
        "template": "LTRIM(${str})",
        "category": "sql.function"
    }, {
        "name": "NCHAR",
        "prefix": "NCHAR",
        "description": "NCHAR() - THE UNICODE CHARACTER WITH THE INTEGER CODE NUMBER n ",
        "template": "NCHAR(${n})",
        "category": "sql.function"
    }, {
        "name": "REPLACE",
        "prefix": "REPLACE",
        "description": "REPLACE()",
        "template": "REPLACE(${original_string}, ${search_string}, ${replace_string})",
        "category": "sql.function"
    }, {
        "name": "RIGHT",
        "prefix": "RIGHT",
        "description": "RIGHT() - THE RIGHTMOST n CHARACTERS/BYTES OF STRING str ",
        "template": "RIGHT(${str}, ${n})",
        "category": "sql.function"
    }, {
        "name": "RPAD",
        "prefix": "RPAD",
        "description": "RPAD() FUNCTION",
        "template": "RPAD(${str}, ${n})",
        "category": "sql.function"
    }, {
        "name": "RTRIM",
        "prefix": "RTRIM",
        "description": "RTRIM() - RETURNS STRING str, TRIMMED OF ALL STRAILING SPACES ",
        "template": "RTRIM(${str})",
        "category": "sql.function"
    }, {
        "name": "SUBSTR_AFTER",
        "prefix": "SUBSTR_AFTER",
        "description": "SUBSTR_AFTER()",
        "template": "SUBSTR_AFTER(${str}, ${pattern})",
        "category": "sql.function"
    }, {
        "name": "SUBSTR_BEFORE",
        "prefix": "SUBSTR_BEFORE",
        "description": "SUBSTR_BEFORE()",
        "template": "SUBSTR_BEFORE(${str}, ${pattern})",
        "category": "sql.function"
    }, {
        "name": "SUBSTRING",
        "prefix": "SUBSTRING",
        "description": "SUBSTRING()",
        "template": "SUBSTRING(${str}, ${start_position})",
        "category": "sql.function"
    }, {
        "name": "TRIM",
        "prefix": "TRIM",
        "description": "TRIM() - REMOVING AND TRAILING SPACES ",
        "template": "TRIM(${str})",
        "category": "sql.function"
    }, {
        "name": "UCASE",
        "prefix": "UCASE",
        "description": "UCASE() - CONVERTS A STRING TO UPPERCASE",
        "template": "UCASE(${str})",
        "category": "sql.function"
    }, {
        "name": "UNICODE",
        "prefix": "UNICODE",
        "description": "UNICODE() - RETURNS UNICODE CODE OF FIRST CHARACTER",
        "template": "UNICODE(${c})",
        "category": "sql.function"
    }, {
        "name": "UPPER",
        "prefix": "UPPER",
        "description": "UPPER() - CONVERTS A STRING TO UPPERCASE",
        "template": "UPPER(${str})",
        "category": "sql.function"
    }];

    // Window Functions

    // Miscellaneous Functions
    var MISCELLANEOUS_FUNCTIONS = [{
        "name": "COALESCE",
        "prefix": "COALESCE",
        "description": "COALESCE() - RETURNS THE FIRST NON-NULL EXPRESSION FROM A LIST",
        "template": "COALESCE(${expression_list})",
        "category": "sql.function"
    }, {
        "name": "GROUPING_ID",
        "prefix": "GROUPING_ID",
        "description": "GROUPING_ID()",
        "template": "GROUPING_ID(${column_name_list})",
        "category": "sql.function"
    }, {
        "name": "IFNULL",
        "prefix": "IFNULL",
        "description": "IFNULL() - RETURNS THE FIRST NOT NULL",
        "template": "IFNULL(${exp1}, ${exp2})",
        "category": "sql.function"
    }, {
        "name": "LEAST",
        "prefix": "LEAST",
        "description": "LEAST() - THE LEAST VALUE AMONG THE ARGUMENTS",
        "template": "LEAST(${n1}, ${n2})",
        "category": "sql.function"
    }, {
        "name": "GREATEST",
        "prefix": "GREATEST",
        "description": "GREATEST() - THE GREATEST VALUE AMONG THE ARGUMENTS",
        "template": "GREATEST(${<argument>})",
        "category": "sql.function"
    }, {
        "name": "MAP",
        "prefix": "MAP",
        "description": "MAP() - RETURNS THE FIRST NOT NULL",
        "template": "MAP(${<exp>}, ${<search>}, ${result})",
        "category": "sql.function"
    }, {
        "name": "NULLIF",
        "prefix": "NULLIF",
        "description": "NULLIF() - COMPARES THE VALUES OF TWO INPUT EXPRESSIONS",
        "template": "NULLIF(${exp1}, ${exp2})",
        "category": "sql.function"
    }, {
        "name": "TRACE",
        "prefix": "TRACE",
        "description": "TRACE() STATEMENT",
        "template": "TRACE(${<var_input>})",
        "category": "sql.function"
    },
    // ROW_NUMBER ( ) OVER ( [ PARTITION BY value_expression , ... [ n ] ] order_by_clause )
    // ROW_NUMBER() OVER (ORDER BY SalesYTD DESC) AS Row
    {
        "name": "ROW_NUMBER",
        "prefix": "ROW_NUMBER",
        "description": "ROW_NUMBER() STATEMENT",
        "template": "ROW_NUMBER() OVER (ORDER BY ${<column_name>} DESC)",
        "category": "sql.function"
    }
    ];
    
    // Array Functions
    var ARRAYS_FUNCTIONS = [
    // rst = UNNEST(:id, :name) AS ("ID", "NAME");
    {
        "name": "UNNEST",
        "prefix": "UNNEST",
        "description": "UNNEST() - CONVERTS AN ARRAY INTO A TABLE",
        "template": "UNNEST(${<array_variables>}) AS (${return_tables})",
        "category": "sql.function"
    }, 
    // id := ARRAY_AGG(:tab.a ORDER BY c, b DESC);
    {
        "name": "ARRAY_AGG",
        "prefix": "ARRAY_AGG",
        "description": "ARRAY_AGG() - CONVERTS A COLUMN OF A TABLE INTO AN ARRAY",
        "template": "ARRAY_AGG(${<table_variable>.<column_name>})",
        "category": "sql.function"
    }, 
    // arr_id := TRIM_ARRAY(:arr_id, 1); 
    {
        "name": "TRIM_ARRAY",
        "prefix": "TRIM_ARRAY",
        "description": "TRIM_ARRAY() - REMOVES ELEMENTS FROM THE END OF AN ARRAY",
        "template": "TRIM_ARRAY(${<array_variable>}, 1)",
        "category": "sql.function"
    }, 
    // CARDINALITY(:<array_variable>)
    {
        "name": "CARDINALITY",
        "prefix": "CARDINALITY",
        "description": "CARDINALITY() - RETURNS THE NUMBER OF ELEMENTS IN THE ARRAY",
        "template": "CARDINALITY(${<array_variable>})",
        "category": "sql.function"
    },
    // CONCAT(:id1, :id2)
    {
        "name": "CONCAT",
        "prefix": "CONCAT",
        "description": "CONCAT() - CONCATENATE TWO ARRAYS",
        "template": "CONCAT(${<array1>}, ${<array2>})",
        "category": "sql.function"
    }
    ];

    // Calculation Engine Plan Operators
    var CALCULATION_ENGINE_PLAN_OPERATORS = [
        // Data Source Access Operators
        {
            "name": "CE_COLUMN_TABLE",
            "prefix": "CE_COLUMN_TABLE",
            "description": "CE_COLUMN_TABLE() STATEMENT",
            "template": "CE_COLUMN_TABLE(${<table_name>}, [${<attributes>}]);",
            "category": "sql.function"
        }, {
            "name": "CE_JOIN_VIEW",
            "prefix": "CE_JOIN_VIEW",
            "description": "CE_JOIN_VIEW() STATEMENT",
            "template": "CE_JOIN_VIEW(${<column_view_name>}, [${<attributes>}]);",
            "category": "sql.function"
        }, {
            "name": "CE_OLAP_VIEW",
            "prefix": "CE_OLAP_VIEW",
            "description": "CE_OLAP_VIEW() STATEMENT",
            "template": "CE_OLAP_VIEW(${<olap_view_name>}, [${<attributes>}]);",
            "category": "sql.function"
        }, {
            "name": "CE_CALC_VIEW",
            "prefix": "CE_CALC_VIEW",
            "description": "CE_CALC_VIEW() STATEMENT",
            "template": "CE_CALC_VIEW(${<calc_view_name>}, [${<attributes>}]);",
            "category": "sql.function"
        },

        //Relational Operators
        {
            "name": "CE_JOIN",
            "prefix": "CE_JOIN",
            "description": "CE_JOIN() STATEMENT",
            "template": "CE_JOIN(${<left_table>}, ${<right_table>}, [${<join_attributes>}]);",
            "category": "sql.function"
        }, {
            "name": "CE_LEFT_OUTER_JOIN",
            "prefix": "CE_LEFT_OUTER_JOIN",
            "description": "CE_LEFT_OUTER_JOIN() STATEMENT",
            "template": "CE_JOIN(${<left_table>}, ${<right_table>}, [${<join_attributes>}]);",
            "category": "sql.function"
        }, {
            "name": "CE_PROJECTION",
            "prefix": "CE_PROJECTION",
            "description": "CE_PROJECTION() STATEMENT",
            "template": "CE_PROJECTION(${<var_table>}, [${<projection_list>}]);",
            "category": "sql.function"
        }, {
            "name": "CE_CALC",
            "prefix": "CE_CALC",
            "description": "CE_CALC() STATEMENT",
            "template": "CE_CALC('${<expr>}', ${<result_type>});",
            "category": "sql.function"
        }, {
            "name": "CE_AGGREGATION",
            "prefix": "CE_AGGREGATION",
            "description": "CE_AGGREGATION() STATEMENT",
            "template": "CE_AGGREGATION('${<var_table>}', ${<aggregate_list>});",
            "category": "sql.function"
        }, {
            "name": "CE_UNION_ALL",
            "prefix": "CE_UNION_ALL",
            "description": "CE_UNION_ALL() STATEMENT",
            "template": "CE_UNION_ALL(${<var_table1>}, ${<var_table2>});",
            "category": "sql.function"
        }, {
            "name": "CE_VERTICAL_UNION",
            "prefix": "CE_VERTICAL_UNION",
            "description": "CE_VERTICAL_UNION() STATEMENT",
            "template": "CE_VERTICAL_UNION(${<var_table>}, ${<projection_list>});",
            "category": "sql.function"
        }, {
            "name": "CE_CONVERSION",
            "prefix": "CE_CONVERSION",
            "description": "CE_CONVERSION() STATEMENT",
            "template": "CE_CONVERSION(${<var_table>}, ${<conversion_params>}, [${<rename_clause>}]);",
            "category": "sql.function"
        }
    ];

    return {

        _aFunctions: [],

        getFunctions: function() {
            if (!this._aFunctions || this._aFunctions.length === 0) {
                this._aFunctions = DATA_TYPE_CONVERSION_FUNCTIONS
                    .concat(DATA_TIME_FUNCTIONS)
                    .concat(FULL_TEXT_FUNCTIONS)
                    .concat(NUMBER_FUNCTIONS)
                    .concat(STRING_FUNCTIONS)
                    .concat(MISCELLANEOUS_FUNCTIONS)
                    .concat(ARRAYS_FUNCTIONS)
                    .concat(CALCULATION_ENGINE_PLAN_OPERATORS);
            }
            return this._aFunctions;
        }
    };
});