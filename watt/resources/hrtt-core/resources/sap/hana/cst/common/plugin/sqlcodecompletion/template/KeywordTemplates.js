/** Copyright © 2015 SAP SE or an affiliate company. All rights reserved.**/

define([],
    function() {
        var KEYWORD = {
            CONTROL: "IF|ELSE|ELSEIF|THEN|LOOP|BEGIN|END|WHILE|DO|FOR",
            OPERATOR: "NOT|AND|OR|LIKE|CONTAINS|NOT IN|" +
                "UNION|UNION ALL|UNION DISTINCT|INTERSECT|EXCEPT|INTERSECT DISTINCT|EXCEPT DISTINCT",
            CE_KEYWORD: "CE_LEFT_OUTER_JOIN|CE_RIGHT_OUTER_JOIN|CE_FULL_OUTER_JOIN|" +
                "CE_JOIN|CE_UNION_ALL|CE_COLUMN_TABLE|CE_JOIN_VIEW|CE_CALC_VIEW|" +
                "CE_OLAP_VIEW|CE_PROJECTION|CE_AGGREGATION|CE_CONVERSION|" +
                "CE_VERTICAL_UNION|CE_COMM2R|CE_PARTITION|CE_MERGE|CE_CALC",

            OTHER: "PUBLIC|ARRAY|INSERT|UPDATE|DELETE|FROM|WHERE|ORDER|LIMIT|OFFSET|RENAME|" +
                "HAVING|AS|CASE|WHEN|TYPE|JOIN|DESC|ASC|LOAD|UNLOAD|UNNEST|" +
                "ALL|ALTER|BOTH|CONDITION|CONNECT|CROSS|CUBE|SCHEMA|" +
                "YEAR|MONTH|DAY|HOUR|MINUTE|SECOND|"+
                "BEFORE|AFTER|ENABLE|DISABLE|" +
                "CURRENT_CONNECTION|CURRENT_DATE|CURRENT_SCHEMA|CURRENT_TIME|" +
                "CURRENT_TIMESTAMP|CURRENT_USER|CURRENT_UTCDATE|CURRENT_UTCTIME|" +
                "CURRENT_UTCTIMESTAMP|CURRVAL|" +
                "GROUP|INNER|LEFT|RIGHT|NEXTVAL|" +
                "CURSOR|DECLARE|DISTINCT|ON|OF|ROW|STATISTICS|GLOBAL|HISTORY|" +
                "EXCEPTION|EXEC|FULL|IN|OUT|INOUT|INTERSECT|INTO|PERSISTENT|" +
                "LEADING|MINUS|NATURAL|PRIOR|RETURN|RETURNS|REVERSE|" +
                "ROLLUP|ROWID|SELECT|SET|SQL|START|SYSDATE|SYSTIME|SYSTIMESTAMP|SYSUUID|" +
                "TOP|TRAILING|USING|UTCDATE|UTCTIME|UTCTIMESTAMP|VALUES|" +
                "WITH|CREATE|TABLE|VIEW|PROCEDURE|FUNCTION|SEQUENCE|TRIGGER|" +
                "SYNONYM|COLUMN|DEFAULT|TRUNCATE|CASCADE|RESTRICT|DROP|OVERVIEW|" +
                "DEBUG|CALL|OPEN|FETCH|CLOSE|SECURITY|BREAK|ID|CONTINUE|" +
                "DUMMY|COMMIT|ROLLBACK|BETWEEN|RECOMPILE|USER|" +
                "ANY|SOME|EXISTS|ADD|UNIQUE|CONSTRAINT|REFERENCES|" +
                "SYSTEM|IMPORT|EXPORT|BACKUP|EXECUTE|PASSWORD|LOCAL|" +
                "SYNC|ASYNC|EXACT|LINGUISTIC|WEIGHT|OVER|CONTENT|TEXT|DETECTION|" +
                "AUDITING|GRANT|REVOKE|COMPONENT|PURPOSE|TRACE|APPLY_FILTER|" +
                "ROLE|LEVEL|QUEUE|REBUILD|RESTART|INVERTED|SQL_ERROR_CODE|" +
                "MEMORY|THRESHOLD|PARTITION|PRELOAD|BATCH|PHYSICAL|ISSUER|" +
                "MOVE|TO|AUTOMERGE|MERGE|PRIVILEGE|LICENSE|UNSET|CONFIGURATION|" +
                "DISCONNECT|CANCEL|CATALOG|SESSION|SESSION_CONTEXT|SESSION_USER|EVERY|MINUTES|DOCUMENTS|" +
                "BUCKETS|QERROR|QTHETA|LOGGING|LOCATION|REFERENCING|CONSTANT|" +
                "SQLEXCEPTION|SQLWARNING|SIGNAL|RESIGNAL|MESSAGE_TEXT|PARAMETERS|" +
                "UPSERT|REPLACE|PLAN_EXECUTION|FUNCTION_PROFILER|" +
                "DURATION|APPLICATIONUSER|APPLICATION|TRACEPROFILE|IMMEDIATE|TRANSACTION|VALID|" +
                "FOREVER|UNTIL|ADAPTER|SAVEPOINT|AT|STRIP|THREADS|ADMIN|" +
                "ISCLOSED|NOTFOUND|ROWCOUNT|NEW|KEY|SCENARIO|INVOKER",
            BEGINABLE: (
                "COMMENT ON TABLE|" +
                "COMMENT ON VIEW|" +
                "COMMENT ON COLUMN|" +
                "EXPLAIN PLAN SET|" +
                "EXPLAIN PLAN SET STATEMENT_NAME|" +
                "REFRESH STATISTICS|" +
                "MERGE DELTA OF|" +
                "MERGE HISTORY DELTA OF|" +
                "TRUNCATE TABLE|" +
                "LOCK TABLE"
                // "CREATE USER"
            ),
            NONBEGINABLE: (
                "IS|NULL|IS NULL|AUDIT POLICY|FULLTEXT INDEX|" +
                "FUZZY SEARCH INDEX|FUZZY SEARCH MODE|PHRASE INDEX RATIO|" +
                "RESET BY|INCREMENT BY|OWNED BY|ORDER BY|" +
                "MAXVALUE|MINVALUE|CYCLE|CACHE|" +
                "NO MAXVALUE|NO MINVALUE|NO CYCLE|NO CACHE|" +
                "GENERATED ALWAYS AS|SCHEMA FLEXIBILITY|" +
                "PRIMARY KEY|FOREIGN KEY|INVERTED HASH|INVERTED VALUE|" +
                "PARTITION|PARTITION OTHERS|PARTITION BY|PARTITION VALUE|MERGE PARTITIONS|" +
                "PERSISTENT MERGE|DELTA LOG|UNLOAD PRIORITY|PAGE LOADABLE|COLUMN LOADABLE|" +
                "AUDITING|AUDITING SUCCESSFUL|AUDITING UNSUCCESSFUL|AUDITING ALL|" +
                "ACTIONS FOR|STRUCTURED|STRUCTURED PRIVILEGE|APPLICATION PRIVILEGE|CONFIGURATION CHANGE|" +
                "SYSTEM LICENSE|REPOSITORY CONTENT|LANGUAGE COLUMN|LANGUAGE DETECTION|" +
                "MIME TYPE|SEARCH ONLY|FAST PREPROCESS|" +
                "SYNC HRONOUS|ASYNC HRONOUS FLUSH QUEUE|ASYNC HRONOUS FLUSH|" +
                "UNIQUE INDEX|UNIQUE BTREE INDEX|UNIQUE CPBTREE INDEX|" +
                "TYPE HISTOGRAM|TYPE SIMPLE|TYPE ALL|CONSTRAINT QOPTIMAL|CONSTRAINT MAXDIFF|" +
                "MEMORY PERCENT|UNIQUE BTREE|UNIQUE CPBTREE|" +
                "PRIMARY KEY BTREE|PRIMARY KEY CPBTREE|" +
                "INVERTED HASH|INVERTED VALUE|" +
                "WITH SUBTOTAL|WITH BALANCE|WITH TOTAL|WITH RECONFIGURE|WITH DATA||WITH NO DATA|WITH REPLACE|" +
                "SAML ASSERTION|CREDENTIAL|SUBJECT|GRANT OPTION|ADMIN OPTION|" +
                "PLAN|RESULT VIEW|ORDINALITY|" +
                "WITHOUT AUTO MERGE|WITHOUT HISTORY|WITHOUT NO LOGGING|" +
                "PARTITION|UNLOAD|UNLOAD PRIORITY|PRELOAD|INDEX|" +
                "FUZZY SEARCH INDEX|FUZZY SEARCH MODE|GLOBAL TEMPORARY|LOCAL TEMPORARY|" +
                "NO LOGGING|NO LOGGING RETENTION|AUTO MERGE|NO AUTO MERGE|ROUNDROBIN PARTITIONS|" +
                "HISTORY COLUMN|HISTORY SESSION|COMMIT ID|" +
                "AS OF|AS OF UTCTIMESTAMP|AS OF COMMIT ID|" +
                "DECLARE EXIT HANDLER FOR|" +
                "CROSS JOIN|INNER JOIN|LEFT JOIN|RIGHT JOIN|FULL JOIN|" +
                "LEFT OUTER JOIN|RIGHT OUTER JOIN|FULL OUTER JOIN" +
                "GROUP BY|GROUP BY GROUPING SETS|GROUP BY ROLLUP|GROUP BY CUBE|BEST|LIMIT|" +
                "WITH OVERVIEW|WITH SUBTOTAL|WITH BALANCE|WITH TOTAL|TEXT FILTER|" +
                "STRUCTURED RESULT|STRUCTURED RESULT WITH OVERVIEW|PREFIX|MULTIPLE RESULTSETS|" +
                "NULLS FIRST|NULLS LAST|" +
                "FOR UPDATE|FILL UP|SORT MATCHES TO TOP|" +
                "INTO TABLES|IMMEDIATE WITH COREFILE|" +
                "CANCEL SESSION|CANCEL WORK IN SESSION|VIRTUAL TABLE|" +
                "CLEAR SQL PLAN CACHE|CLEAR TRACES|DISCONNECT SESSION|" +
                "LOAD PERFTRACE FILE|LOAD PERFTRACE FILE|USER CREATION|" +
                "PERSISTENCE ENCRYPTION|APPLY CURRENT KEY|" +
                "RECLAIM|RECLAIM ROW|DATA SPACE|DATA SPACE IMMEDIATE|" +
                "DATAVOLUME|DATAVOLUME SPACE|LOG|VERSION SPACE|" +
                "RECONFIGURE SERVICE|REMOVE TRACES|SET SUBJECT|" +
                "RESET MONITORING VIEW|SAVE PERFTRACE|SAVE PERFTRACE INTO FILE|" +
                "START PERFTRACE|STOP PERFTRACE|STOP SERVICE|" +
                "IN EXCLUSIVE MODE|IN EXCLUSIVE MODE NOWAIT|SAML PROVIDER|" +
                "ISOLATION LEVEL READ COMMITTED|ISOLATION LEVEL REPEATABLE READ|ISOLATION LEVEL SERIALIZABLE|" +
                "READ ONLY|READ WRITE|CREDENTIAL FOR|" +
                "IDENTIFIED EXTERNALLY AS|RESET CONNECT ATTEMPTS|DROP CONNECT ATTEMPTS|" +
                "DISABLE PASSWORD LIFETIME|FORCE PASSWORD CHANGE|" +
                "ACTIVATE|DEACTIVATE|ACTIVATE USER NOW|DEACTIVATE USER NOW|" +
                "DROP IDENTITY|ADD IDENTITY|WITH IDENTITY|" +
                "CLEAR PARAMETER|SET PARAMETER|CLIENT|LOCALE|TIME ZONE|EMAIL ADDRESS|" +
                "CLEAR ALL PARAMETERS|" +
                "ENABLE PASSWORD|ENABLE KERBEROS|ENABLE SAML|ENABLE X509|" +
                "DISABLE PASSWORD|DISABLE KERBEROS|DISABLE SAML|DISABLE X509|" +
                "KERBEROS|X509|REMOTE SOURCE|" +
                "ENABLE USER CREATION|PASSPORT_TRACELEVEL MEDIUM|PASSPORT_TRACELEVEL HIGH|" +
                "CATALOG READ|BACKUP OPERATOR|" +
                "ALL PRIVILEGES|AS BINARY|AS CSV|AT LOCATION|" +
                "CATALOG ONLY|NO DEPENDENCIES|SCRAMBLE|SCRAMBLE BY|" +
                "TABLE LOCK|NO TYPE CHECK|SKIP FIRST|" +
                "COLUMN LIST|COLUMN LIST IN FIRST ROW|" +
                "RECORD DELIMITED BY|FIELD DELIMITED BY|OPTIONALLY ENCLOSED BY|" +
                "DATE FORMAT|TIME FORMAT|TIMESTAMP FORMAT|ERROR LOG|" +
                "IN DEBUG MODE|SQL SECURITY DEFINER|SQL SECURITY INVOKER|" +
                "LANGUAGE SQLSCRIPT|LANGUAGE R|READS SQL DATA|" +
                "SEQUENTIAL EXECUTION|SEQUENTIEL EXECUTION"
            ),
            HDBPROCEDURE:(
                "PLANVIZ|ROWCOUNT|COMMA|HINT|ORDERED|EXEC_AGGR_BEFORE_JOIN|IGNORE_PLAN_CACHE|" +
                "DEV_PROC_INLINE|DEV_PROC_NO_INLINE|DEV_PROC_L|DEV_PROC_CE|NO_INDEX|REMOTE_SCAN|INDEX_JOIN|INDEX_UNION|NESTED_LOOP_JOIN|HASH_JOIN|NO_JOIN_THRU_AGGR|NO_JOIN_THRU_UNION_ALL|" +
                "NO_SELECT_THRU_AGGR|NO_ENUM_LIMIT|USE_NEW_EXPRESSION|NO_PRUNING|SUBPLAN_SHARING|NO_SUBPLAN_SHARING|OPTIMIZE_METAMODEL|NO_OPTIMIZE_METAMODEL|DEV_MIXED_AGGR|USE_REMOTE_CACHE|" +
                "USE_TRANSFORMATION|NO_USE_TRANSFORMATION|DEV_RS_ONLY|DEV_CS_ONLY|USE_R2C_CONV|USE_C2R_CONV|NO_CALC_DIMENSION|NO_USE_C2C_CONV|USE_UNION_OPT|USE_QUERY_MATCH|USE_PREAGGR|" +
                "NO_DISTINCT_FILTER|OLAP_PARALLEL_AGGREGATION|OLAP_SERIAL_AGGREGATION|USE_COLUMN_JOIN_IMPLICIT_CAST|USE_OLAP_PLAN|NO_USE_OLAP_PLAN|USE_JIT|LOCAL_METADATA|SHARED_METADATA|" +
                "PARALLEL|ROUTE_TO|NO_ROUTE_TO|ROUTE_BY_CARDINALITY|ROUTE_BY|TSCRIPT|OJ|TEXT_FILTER|" +
                "PART|ESCAPE|SENSITIVE|INSENSITIVE|COLLATE|FN|D|T|TS|" +
                "GROUPING_X|HASANYPRIVILEGES|HASSYSTEMPRIVILEGE|ISAUTHORIZED|DATABASE|GROUPING_FILTER|OLYMP|ISTOTAL|CURRENT_TRANSACTION_ISOLATION_LEVEL|" +
                "XMLELEMENT|XMLATTRIBUTES|XMLNAMESPACES|XMLEXTRACT|ADD_XMLDURATION|" +
                "BUSINESS|OBJECT|DATASOURCE|TREX|HYBRID|TREE|" +
                "RANGE_RESTRICTION|EXTENDED|STORAGE|TYPE_X|SUBTYPE|" +
                "NAME|REPLICA|LOCATIONS|ROWS|RANGE|TENANT|INDEPENDENT|" +
                "DEPENDENT|PRIVATE|PRESERVE|MINING|ANALYSIS|TOKEN|SEPARATORS|SYNCHRONOUS|ASYNCHRONOUS|" +
                "WITH_TABLE_PARAMETER_COMPILATION|LLANG|RLANG|EXTERN_LANG_START|EXTERN_LANG_END|WAIT|TIMEOUT|" +
                "UNCOMMITTED|FOUND|UNBOUNDED|PRECEDING|FOLLOWING|DUPLICATES|MDRS_T"
            )
        };

        return {

            _aKeywords: [],
            
            _aSingleKeywords: [],

            getKeywords: function() {
                if (!this._aKeywords || this._aKeywords.length === 0) {
                    this._aKeywords = KEYWORD.CONTROL.split("|")
                        .concat(KEYWORD.OPERATOR.split("|"))
                        .concat(KEYWORD.CE_KEYWORD.split("|"))
                        .concat(KEYWORD.OTHER.split("|"))
                        .concat(KEYWORD.BEGINABLE.split("|"))
                        .concat(KEYWORD.NONBEGINABLE.split("|"))
                        .concat(KEYWORD.HDBPROCEDURE.split("|"));
                }
                return this._aKeywords;
            },
            
            getSingleKeywords: function() {
                if (!this._aSingleKeywords || this._aSingleKeywords.length === 0) {
                    
                    this._aSingleKeywords = KEYWORD.CONTROL.split("|")
                        .concat(KEYWORD.OPERATOR.split("|"))
                        .concat(KEYWORD.CE_KEYWORD.split("|"))
                        .concat(KEYWORD.OTHER.split("|"));
                }
                return this._aSingleKeywords;
                
            }
        };
    });