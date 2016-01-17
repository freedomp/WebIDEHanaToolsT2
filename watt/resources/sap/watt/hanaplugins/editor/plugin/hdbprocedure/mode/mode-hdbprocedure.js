ace.define('ace/mode/hdbprocedure', function(require, exports, module) {
var oop = require("ace/lib/oop");
var TextMode = require("./text").Mode;
var Tokenizer = require("../tokenizer").Tokenizer;
var hdbprocedureHighlightRules = require("./hdbprocedure_highlight_rules").hdbprocedureHighlightRules;

var Mode = function() {
    this.$tokenizer = new Tokenizer(new hdbprocedureHighlightRules().getRules());
};
oop.inherits(Mode, TextMode);

(function() {
    // Extra logic goes here. (see below)
}).call(Mode.prototype);

exports.Mode = Mode;
});

ace.define('ace/mode/hdbprocedure_highlight_rules', function(require, exports, module) {

var oop = require("ace/lib/oop");
var TextHighlightRules = require("ace/mode/text_highlight_rules").TextHighlightRules;

var hdbprocedureHighlightRules = function() {

    this.$rules = {
        "start" : [
            
            {
                token : "keyword",
                regex : '\\b(?:VAR |ALL|ALTER|AS|BEFORE|BEGIN|BOTH|CASE|CHAR|CONDITION|CONNECT|CROSS|CUBE|CURRENT_CONNECTION|CURRENT_DATE|CURRENT_SCHEMA|CURRENT_TIME|CURRENT_TIMESTAMP)\\b'
			},
            {
                token : "keyword",
                regex : '\\b(?:CURRENT_USER|CURRENT_UTCDATE|CURRENT_UTCTIME|CURRENT_UTCTIMESTAMP|CURRVAL|CURSOR|DECLARE|DISTINCT|ELSE|ELSEIF|ELSIF|END|EXCEPT|EXCEPTION|EXEC|FOR|FROM|FULL)\\b'
			},
            {
                token : "keyword",
                regex : '\\b(?:GROUP|HAVING|IF|IN|INNER|INOUT|INTERSECT|INTO|IS|JOIN|LEADING|LEFT|LIMIT|LOOP|MINUS|NATURAL|NEXTVAL|NULL|ON|ORDER|OUT|PRIOR|RETURN|RETURNS|REVERSE|RIGHT)\\b'
			},
            {
                token : "keyword",
                regex : '\\b(?:ROLLUP|ROWID|SELECT|SET|SQL|START|SYSDATE|SYSTIME|SYSTIMESTAMP|SYSUUID|TOP|TRAILING|UNION|USING|UTCDATE|UTCTIME|UTCTIMESTAMP|VALUES|WHEN|WHERE|WHILE|WITH|PROCEDURE|FUNCTION)\\b'
			},
            {
                token : "keyword",
                regex : '\\b(?:EXECUTE|PLANVIZ|LOCK|TABLE|EXCLUSIVE|MODE|NOWAIT|OF|COMMIT|ID|UPDATE|SKIP|PLAN|EXPORT|OFFSET|TOTAL|ROWCOUNT|COMMA|HINT|ORDERED|EXEC_AGGR_BEFORE_JOIN|IGNORE_PLAN_CACHE)\\b'
			},
            {
                token : "keyword",
                regex : '\\b(?:DEV_PROC_INLINE|DEV_PROC_NO_INLINE|DEV_PROC_L|DEV_PROC_CE|INDEX|NO_INDEX|REMOTE_SCAN|INDEX_JOIN|INDEX_UNION|NESTED_LOOP_JOIN|HASH_JOIN|NO_JOIN_THRU_AGGR|NO_JOIN_THRU_UNION_ALL)\\b'
			},
            {
                token : "keyword",
                regex : '\\b(?:NO_SELECT_THRU_AGGR|NO_ENUM_LIMIT|USE_NEW_EXPRESSION|NO_PRUNING|SUBPLAN_SHARING|NO_SUBPLAN_SHARING|OPTIMIZE_METAMODEL|NO_OPTIMIZE_METAMODEL|DEV_MIXED_AGGR|USE_REMOTE_CACHE)\\b'
			},
            {
                token : "keyword",
                regex : '\\b(?:USE_TRANSFORMATION|NO_USE_TRANSFORMATION|DEV_RS_ONLY|DEV_CS_ONLY|USE_R2C_CONV|USE_C2R_CONV|NO_CALC_DIMENSION|NO_USE_C2C_CONV|USE_UNION_OPT|USE_QUERY_MATCH|USE_PREAGGR)\\b'
			},
            {
                token : "keyword",
                regex : '\\b(?:NO_DISTINCT_FILTER|OLAP_PARALLEL_AGGREGATION|OLAP_SERIAL_AGGREGATION|USE_COLUMN_JOIN_IMPLICIT_CAST|USE_OLAP_PLAN|NO_USE_OLAP_PLAN|USE_JIT|LOCAL_METADATA|SHARED_METADATA)\\b'
			},
            {
                token : "keyword",
                regex : '\\b(?:PARALLEL|ROUTE_TO|NO_ROUTE_TO|ROUTE_BY_CARDINALITY|ROUTE_BY|TSCRIPT|OJ|OUTER|BY|GROUPING|SETS|BEST|SUBTOTAL|BALANCE|TEXT_FILTER|FILL|UP|SORT|MATCHES|TO|STRUCTURED|RESULT)\\b'
			},
            {
                token : "keyword",
                regex : '\\b(?:OVERVIEW|PREFIX|MULTIPLE|RESULTSETS|ST_GEOMETRY|ST_POINT|ST_POINTZ|ST_POINTM|ST_POINTZM|ST_POLYGON|ST_MULTIPOLYGON|ST_LINESTRING|ST_RECTANGLE|ST_MULTIPOINT|ST_MULTILINESTRING)\\b'
			},
            {
                token : "keyword",
                regex : '\\b(?:ST_GEOMETRYCOLLECTION|ST_GEOMFROMWKB|ST_GEOMFROMWKT|ST_GEOMFROMTEXT|ST_FROMTEXT|ST_POINTFROMWKB|ST_GEOMFROMEWKB|ST_GEOMFROMEWKT|ASC|DESC|NULLS|FIRST|LAST|INSERT|DELETE)\\b'
			},
            {
                token : "keyword",
                regex : '\\b(?:HISTORY|MERGE|DELTA|PART|FORCE|REBUILD|MOVE|PRELOAD|UNLOAD|LOAD|REPLACE|PRIMARY|KEY|UPSERT|VERSION|VALIDATION|DEBUG|CALL|CALLS|OR|AND|NOT|SOME|ANY|BETWEEN|LIKE|EXISTS)\\b'
			},
            {
                token : "keyword",
                regex : '\\b(?:NEW|ESCAPE|CONTAINS|LANGUAGE|WEIGHT|EXACT|SENSITIVE|INSENSITIVE|FUZZY|LINGUISTIC|COLLATE|THEN|FN|D|T|TS|GROUPING_ID|ABS|ACOS|ADD_DAYS|ADD_MONTHS|ADD_SECONDS|ADD_YEARS|ASIN)\\b'
			},
            {
                token : "keyword",
                regex : '\\b(?:ATAN|ATAN2|ASCII|BIND_BIGINT|BIND_CHAR|BIND_DECIMAL|BIND_DOUBLE|BIND_NCHAR|BIND_REAL|BITAND|CEIL|CEILING|COALESCE|CONCAT|COS|COSH|COT|DAYS_BETWEEN|EXP|FLOOR|GREATEST)\\b'
			},
            {
                token : "keyword",
                regex : '\\b(?:GROUPING_X|LEAST|HASANYPRIVILEGES|HASSYSTEMPRIVILEGE|ISAUTHORIZED|HEXTOBIN|INSTR|LOCATE|LAST_DAY|LENGTH|LN|LOG|LOWER|LCASE|LPAD|MAP|MOD|NCHAR|NEXT_DAY|NULLIF|IFNULL)\\b'
			},
            {
                token : "keyword",
                regex : '\\b(?:POWER|BINTOHEX|ROUND|RPAD|SECONDS_BETWEEN|SESSION_CONTEXT|SIGN|SIN|SINH|SUBSTR|SUBSTRING|SUBSTR_AFTER|SUBSTR_BEFORE|SQRT|TAN|TANH|TO_BINARY|TO_BLOB|TO_CHAR|TO_CLOB)\\b'
			},
            {
                token : "keyword",
                regex : '\\b(?:TO_DATE|TO_DATS|TO_NCHAR|TO_NCLOB|TO_NVARCHAR|TO_NUMBER|TO_BIGINT|TO_INT|TO_INTEGER|TO_SMALLINT|TO_SMALLDECIMAL|TO_TINYINT|TO_REAL|TO_DOUBLE|TO_DECIMAL|TO_TIME|TO_TIMESTAMP)\\b'
			},
            {
                token : "keyword",
                regex : '\\b(?:TO_SECONDDATE|TO_VARBINARY|TO_VARCHAR|UNICODE|UPPER|UCASE|WEEKDAY|CURDATE|CURTIME|DATABASE|USER|GROUPING_FILTER|NOW|OLYMP|ISTOTAL|CURRENT_TRANSACTION_ISOLATION_LEVEL)\\b'
			},
            {
                token : "keyword",
                regex : '\\b(?:ROW_NUMBER|RANK|DENSE_RANK|PERCENT_RANK|CUME_DIST|LAG|LEAD|NTILE|FIRST_VALUE|LAST_VALUE|NTH_VALUE|XMLELEMENT|XMLATTRIBUTES|XMLNAMESPACES|XMLEXTRACT|ADD_XMLDURATION)\\b'
			},
            {
                token : "keyword",
                regex : '\\b(?:TRIM|LTRIM|RTRIM|EXTRACT|YEAR|MONTH|DAY|HOUR|MINUTE|SECOND|CAST|ALPHANUM|BIGINT|BINARY|BLOB|DATE|SMALLDECIMAL|REAL|SMALLINT|SECONDDATE|TIME|TINYINT|VARBINARY)\\b'
			},
            {
                token : "keyword",
                regex : '\\b(?:DAYOFMONTH|DAYOFWEEK|DAYOFYEAR|WEEK|DAYNAME|MONTHNAME|BUSINESS|OBJECT|DATASOURCE|TREX|HYBRID|VIRTUAL|AT|TREE|BTREE|CPBTREE|INVERTED|HASH|VALUE|THREADS|BATCH|PARAMETERS)\\b'
			},
            {
                token : "keyword",
                regex : '\\b(?:RANGE_RESTRICTION|DATA|NO|SCHEMA|FLEXIBILITY|LOGGING|RETENTION|AUTO|PARTITION|PRIORITY|WITHOUT|SEARCH|PAGE|LOADABLE|GLOBAL|TEMPORARY|LOCAL|EXTENDED|STORAGE|TYPE_X|SUBTYPE)\\b'
			},
            {
                token : "keyword",
                regex : '\\b(?:NAME|REPLICA|LOCATIONS|ROWS|COLUMN|ROW|ENABLE|DISABLE|PARTITIONS|RANGE|ROUNDROBIN|GET_NUM_SERVERS|OTHERS|LOCATION|CASCADE|RESTRICT|ONLY|TENANT|INDEPENDENT)\\b'
			},
            {
                token : "keyword",
                regex : '\\b(?:DEPENDENT|PRIVATE|PRESERVE|MIME|TYPE|FAST|PREPROCESS|PHRASE|RATIO|CONFIGURATION|TEXT|MINING|ANALYSIS|TOKEN|SEPARATORS|DETECTION|OFF|SYNC|SYNCHRONOUS|ASYNC|ASYNCHRONOUS)\\b'
			},
            {
                token : "keyword",
                regex : '\\b(?:FLUSH|QUEUE|EVERY|MINUTES|AFTER|DOCUMENTS|WITH_TABLE_PARAMETER_COMPILATION|LLANG|SQLSCRIPT|RLANG|SECURITY|DEFINER|INVOKER|READS|VIEW|EXTERN_LANG_START|EXTERN_LANG_END|DEFAULT)\\b'
			},
            {
                token : "keyword",
                regex : '\\b(?:FLOAT|LONGDATE|DAYDATE|SECONDTIME|CLOB|RAW|BINTEXT|SHORTTEXT|BOOLEAN|ARRAY|ABAPITAB|ABAPSTRUCT|STRING|VARYING|CHARACTER|VARCHAR|VARCHAR1|VARCHAR2|VARCHAR3|NATIONAL)\\b'
			},
            {
                token : "keyword",
                regex : '\\b(?:NVARCHAR|INT|INTEGER|DEC|DECIMAL|NUMERIC|NUMBER|DOUBLE|PRECISION|TIMESTAMP|DATETIME|NCLOB|NTEXT|ROLLBACK|WORK|TRANSACTION|ISOLATION|LEVEL|READ|WRITE|WAIT|TIMEOUT)\\b'
			},
            {
                token : "keyword",
                regex : '\\b(?:UNCOMMITTED|COMMITTED|REPEATABLE|SERIALIZABLE|SEQUENTIAL|EXECUTION|EXIT|HANDLER|FOUND|SQL_ERROR_CODE|CONSTANT|DO|APPLY_FILTER|BREAK|CONTINUE|SIGNAL|RESIGNAL)\\b'
			},
            {
                token : "keyword",
                regex : '\\b(?:DROP|CREATE|TRUNCATE|OPEN|FETCH|CLOSE|IMMEDIATE|UNNEST|ORDINALITY|ARRAY_AGG|TRACE|CE_UNION_ALL|CE_PROJECTION|CE_AGGREGATION|CE_CONVERSION|CE_VERTICAL_UNION|CE_PARTITION)\\b'
			},
            {
                token : "keyword",
                regex : '\\b(?:CE_MERGE|CE_COMM2R|CE_LEFT_OUTER_JOIN|CE_RIGHT_OUTER_JOIN|CE_FULL_OUTER_JOIN|CE_JOIN|CE_COLUMN_TABLE|CE_JOIN_VIEW|CE_CALC_VIEW|CE_OLAP_VIEW|CE_CALC|COUNT|MIN|MAX|SUM)\\b'
			},
            {
                token : "keyword",
                regex : '\\b(?:AVG|STDDEV|SESSION_USER|UNBOUNDED|PRECEDING|CURRENT|FOLLOWING|OVER|FOREIGN|REFERENCES|UNIQUE|MEMORY|THRESHOLD|DUPLICATES|GENERATED|ALWAYS|IDENTITY|RESET|INCREMENT)\\b'
			},
            {
                token : "keyword",
                regex : '\\b(?:MAXVALUE|MINVALUE|CYCLE|CACHE|ST_MEMORY_LOB|ST_DISK_LOB|CS_ALPHANUM|CS_STRING|CS_FIXEDSTRING|CS_TEXT_AE|CS_INT|CS_FLOAT|CS_DATE|CS_TIME|CS_TEXT|CS_SHORTTEXT|CS_FIXED)\\b'
			},
            {
                token : "keyword",
                regex : '\\b(?:CS_DOUBLE|CS_UNITDECFLOAT|CS_RAW|CS_DECIMAL_FLOAT|CS_SDFLOAT|CS_LONGDATE|CS_SECONDDATE|CS_DAYDATE|CS_SECONDTIME|CS_GEOMETRY|CS_POINT|ABAP_CHAR|ABAP_STRING|ABAP_DATE)\\b'
			},
            {
                token : "keyword",
                regex : '\\b(?:ABAP_TIME|ABAP_NUM|ABAP_HEX|ABAP_XSTRING|ABAP_INT|ABAP_INT1|ABAP_INT2|ABAP_PACKED|ABAP_FLOAT|ABAP_DECFLOAT16|ABAP_DECFLOAT34|DDIC_ACCP|DDIC_ALNM|DDIC_CHAR|DDIC_CDAY)\\b'
			},
            {
                token : "keyword",
                regex : '\\b(?:DDIC_CLNT|DDIC_CUKY|DDIC_CURR|DDIC_D16D|DDIC_D34D|DDIC_D16R|DDIC_D34R|DDIC_D16S|DDIC_D34S|DDIC_DATS|DDIC_DAY|DDIC_DEC|DDIC_FLTP|DDIC_GUID|DDIC_INT1|DDIC_INT2)\\b'
			},
            {
                token : "keyword",
                regex : '\\b(?:DDIC_INT4|DDIC_INT8|DDIC_LANG|DDIC_LCHR|DDIC_MIN|DDIC_MON|DDIC_LRAW|DDIC_NUMC|DDIC_PREC|DDIC_QUAN|DDIC_RAW|DDIC_RSTR|DDIC_SEC|DDIC_SRST|DDIC_SSTR|DDIC_STRG|DDIC_STXT)\\b'
			},
            {
                token : "keyword",
                regex : '\\b(?:DDIC_TIMS|DDIC_UNIT|DDIC_UTCM|DDIC_UTCL|DDIC_UTCS|DDIC_TEXT|DDIC_VARC|DDIC_WEEK|MDRS_TEST)\\b'
			},
            {
                token : "keyword",
                regex : '\\b(?:var |all|alter|as|before|begin|both|case|char|condition|connect|cross|cube|current_connection|current_date|current_schema|current_time|current_timestamp)\\b'
			},
            {
                token : "keyword",
                regex : '\\b(?:current_user|current_utcdate|current_utctime|current_utctimestamp|currval|cursor|declare|distinct|else|elseif|elsif|end|except|exception|exec|for|from|full)\\b'
			},
            {
                token : "keyword",
                regex : '\\b(?:group|having|if|in|inner|inout|intersect|into|is|join|leading|left|limit|loop|minus|natural|nextval|null|on|order|out|prior|return|returns|reverse|right)\\b'
			},
            {
                token : "keyword",
                regex : '\\b(?:rollup|rowid|select|set|sql|start|sysdate|systime|systimestamp|sysuuid|top|trailing|union|using|utcdate|utctime|utctimestamp|values|when|where|while|with|procedure|function)\\b'
			},
            {
                token : "keyword",
                regex : '\\b(?:execute|planviz|lock|table|exclusive|mode|nowait|of|commit|id|update|skip|plan|export|offset|total|rowcount|comma|hint|ordered|exec_aggr_before_join|ignore_plan_cache)\\b'
			},
            {
                token : "keyword",
                regex : '\\b(?:dev_proc_inline|dev_proc_no_inline|dev_proc_l|dev_proc_ce|index|no_index|remote_scan|index_join|index_union|nested_loop_join|hash_join|no_join_thru_aggr|no_join_thru_union_all)\\b'
			},
            {
                token : "keyword",
                regex : '\\b(?:no_select_thru_aggr|no_enum_limit|use_new_expression|no_pruning|subplan_sharing|no_subplan_sharing|optimize_metamodel|no_optimize_metamodel|dev_mixed_aggr|use_remote_cache)\\b'
			},
            {
                token : "keyword",
                regex : '\\b(?:use_transformation|no_use_transformation|dev_rs_only|dev_cs_only|use_r2c_conv|use_c2r_conv|no_calc_dimension|no_use_c2c_conv|use_union_opt|use_query_match|use_preaggr)\\b'
			},
            {
                token : "keyword",
                regex : '\\b(?:no_distinct_filter|olap_parallel_aggregation|olap_serial_aggregation|use_column_join_implicit_cast|use_olap_plan|no_use_olap_plan|use_jit|local_metadata|shared_metadata)\\b'
			},
            {
                token : "keyword",
                regex : '\\b(?:parallel|route_to|no_route_to|route_by_cardinality|route_by|tscript|oj|outer|by|grouping|sets|best|subtotal|balance|text_filter|fill|up|sort|matches|to|structured|result)\\b'
			},
            {
                token : "keyword",
                regex : '\\b(?:overview|prefix|multiple|resultsets|st_geometry|st_point|st_pointz|st_pointm|st_pointzm|st_polygon|st_multipolygon|st_linestring|st_rectangle|st_multipoint|st_multilinestring)\\b'
			},
            {
                token : "keyword",
                regex : '\\b(?:st_geometrycollection|st_geomfromwkb|st_geomfromwkt|st_geomfromtext|st_fromtext|st_pointfromwkb|st_geomfromewkb|st_geomfromewkt|asc|desc|nulls|first|last|insert|delete)\\b'
			},
            {
                token : "keyword",
                regex : '\\b(?:history|merge|delta|part|force|rebuild|move|preload|unload|load|replace|primary|key|upsert|version|validation|debug|call|calls|or|and|not|some|any|between|like|exists)\\b'
			},
            {
                token : "keyword",
                regex : '\\b(?:new|escape|contains|language|weight|exact|sensitive|insensitive|fuzzy|linguistic|collate|then|fn|d|t|ts|grouping_id|abs|acos|add_days|add_months|add_seconds|add_years|asin)\\b'
			},
            {
                token : "keyword",
                regex : '\\b(?:atan|atan2|ascii|bind_bigint|bind_char|bind_decimal|bind_double|bind_nchar|bind_real|bitand|ceil|ceiling|coalesce|concat|cos|cosh|cot|days_between|exp|floor|greatest)\\b'
			},
            {
                token : "keyword",
                regex : '\\b(?:grouping_x|least|hasanyprivileges|hassystemprivilege|isauthorized|hextobin|instr|locate|last_day|length|ln|log|lower|lcase|lpad|map|mod|nchar|next_day|nullif|ifnull)\\b'
			},
            {
                token : "keyword",
                regex : '\\b(?:power|bintohex|round|rpad|seconds_between|session_context|sign|sin|sinh|substr|substring|substr_after|substr_before|sqrt|tan|tanh|to_binary|to_blob|to_char|to_clob)\\b'
			},
            {
                token : "keyword",
                regex : '\\b(?:to_date|to_dats|to_nchar|to_nclob|to_nvarchar|to_number|to_bigint|to_int|to_integer|to_smallint|to_smalldecimal|to_tinyint|to_real|to_double|to_decimal|to_time|to_timestamp)\\b'
			},
            {
                token : "keyword",
                regex : '\\b(?:to_seconddate|to_varbinary|to_varchar|unicode|upper|ucase|weekday|curdate|curtime|database|user|grouping_filter|now|olymp|istotal|current_transaction_isolation_level)\\b'
			},
            {
                token : "keyword",
                regex : '\\b(?:row_number|rank|dense_rank|percent_rank|cume_dist|lag|lead|ntile|first_value|last_value|nth_value|xmlelement|xmlattributes|xmlnamespaces|xmlextract|add_xmlduration)\\b'
			},
            {
                token : "keyword",
                regex : '\\b(?:trim|ltrim|rtrim|extract|year|month|day|hour|minute|second|cast|alphanum|bigint|binary|blob|date|smalldecimal|real|smallint|seconddate|time|tinyint|varbinary)\\b'
			},
            {
                token : "keyword",
                regex : '\\b(?:dayofmonth|dayofweek|dayofyear|week|dayname|monthname|business|object|datasource|trex|hybrid|virtual|at|tree|btree|cpbtree|inverted|hash|value|threads|batch|parameters)\\b'
			},
            {
                token : "keyword",
                regex : '\\b(?:range_restriction|data|no|schema|flexibility|logging|retention|auto|partition|priority|without|search|page|loadable|global|temporary|local|extended|storage|type_x|subtype)\\b'
			},
            {
                token : "keyword",
                regex : '\\b(?:name|replica|locations|rows|column|row|enable|disable|partitions|range|roundrobin|get_num_servers|others|location|cascade|restrict|only|tenant|independent)\\b'
			},
            {
                token : "keyword",
                regex : '\\b(?:dependent|private|preserve|mime|type|fast|preprocess|phrase|ratio|configuration|text|mining|analysis|token|separators|detection|off|sync|synchronous|async|asynchronous)\\b'
			},
            {
                token : "keyword",
                regex : '\\b(?:flush|queue|every|minutes|after|documents|with_table_parameter_compilation|llang|sqlscript|rlang|security|definer|invoker|reads|view|extern_lang_start|extern_lang_end|default)\\b'
			},
            {
                token : "keyword",
                regex : '\\b(?:float|longdate|daydate|secondtime|clob|raw|bintext|shorttext|boolean|array|abapitab|abapstruct|string|varying|character|varchar|varchar1|varchar2|varchar3|national)\\b'
			},
            {
                token : "keyword",
                regex : '\\b(?:nvarchar|int|integer|dec|decimal|numeric|number|double|precision|timestamp|datetime|nclob|ntext|rollback|work|transaction|isolation|level|read|write|wait|timeout)\\b'
			},
            {
                token : "keyword",
                regex : '\\b(?:uncommitted|committed|repeatable|serializable|sequential|execution|exit|handler|found|sql_error_code|constant|do|apply_filter|break|continue|signal|resignal)\\b'
			},
            {
                token : "keyword",
                regex : '\\b(?:drop|create|truncate|open|fetch|close|immediate|unnest|ordinality|array_agg|trace|ce_union_all|ce_projection|ce_aggregation|ce_conversion|ce_vertical_union|ce_partition)\\b'
			},
            {
                token : "keyword",
                regex : '\\b(?:ce_merge|ce_comm2r|ce_left_outer_join|ce_right_outer_join|ce_full_outer_join|ce_join|ce_column_table|ce_join_view|ce_calc_view|ce_olap_view|ce_calc|count|min|max|sum)\\b'
			},
            {
                token : "keyword",
                regex : '\\b(?:avg|stddev|session_user|unbounded|preceding|current|following|over|foreign|references|unique|memory|threshold|duplicates|generated|always|identity|reset|increment)\\b'
			},
            {
                token : "keyword",
                regex : '\\b(?:maxvalue|minvalue|cycle|cache|st_memory_lob|st_disk_lob|cs_alphanum|cs_string|cs_fixedstring|cs_text_ae|cs_int|cs_float|cs_date|cs_time|cs_text|cs_shorttext|cs_fixed)\\b'
			},
            {
                token : "keyword",
                regex : '\\b(?:cs_double|cs_unitdecfloat|cs_raw|cs_decimal_float|cs_sdfloat|cs_longdate|cs_seconddate|cs_daydate|cs_secondtime|cs_geometry|cs_point|abap_char|abap_string|abap_date)\\b'
			},
            {
                token : "keyword",
                regex : '\\b(?:abap_time|abap_num|abap_hex|abap_xstring|abap_int|abap_int1|abap_int2|abap_packed|abap_float|abap_decfloat16|abap_decfloat34|ddic_accp|ddic_alnm|ddic_char|ddic_cday)\\b'
			},
            {
                token : "keyword",
                regex : '\\b(?:ddic_clnt|ddic_cuky|ddic_curr|ddic_d16d|ddic_d34d|ddic_d16r|ddic_d34r|ddic_d16s|ddic_d34s|ddic_dats|ddic_day|ddic_dec|ddic_fltp|ddic_guid|ddic_int1|ddic_int2)\\b'
			},
            {
                token : "keyword",
                regex : '\\b(?:ddic_int4|ddic_int8|ddic_lang|ddic_lchr|ddic_min|ddic_mon|ddic_lraw|ddic_numc|ddic_prec|ddic_quan|ddic_raw|ddic_rstr|ddic_sec|ddic_srst|ddic_sstr|ddic_strg|ddic_stxt)\\b'
			},
            {
                token : "keyword",
                regex : '\\b(?:ddic_tims|ddic_unit|ddic_utcm|ddic_utcl|ddic_utcs|ddic_text|ddic_varc|ddic_week|mdrs_test)\\b'
			},
            
            {
                token : "string", 
                regex : "\'[^\']*\'"
            },
            
            {
                token : "string",
                regex : '\"[^\"]*\"'
            },
            {
                token : "constant.numeric", // float
                regex : "[+-]?\\d+(?:(?:\\.\\d*)?(?:[eE][+-]?\\d+)?)?\\b"
            },
            
            {
                token : "comment", 
                regex : '(--.*)'
            },{
                token : "comment", // multi line comment
                regex : "\\/\\*",
                next : "comment"
            }
            
        ],
        "comment" : [
            {
                token : "comment", // closing comment
                regex : ".*?\\*\\/",
                next : "start"
            }, {
                token : "comment", // comment spanning whole line
                regex : ".+"
            }
        ]

    };
    
};

oop.inherits(hdbprocedureHighlightRules, TextHighlightRules);

exports.hdbprocedureHighlightRules = hdbprocedureHighlightRules;
});