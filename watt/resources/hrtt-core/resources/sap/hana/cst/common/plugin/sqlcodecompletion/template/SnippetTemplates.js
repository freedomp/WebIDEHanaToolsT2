/** Copyright © 2015 SAP SE or an affiliate company. All rights reserved.**/

define([], function() {

    // SQL_CONTROL_STRUCTURES
    var SQL_CONTROL_STRUCTURES = [{
        "name": "IF",
        "prefix": "IF",
        "description": "IF - IF STATEMENT",
        "template": "IF (${<bool_expr>}) THEN\n\t${<then_stmts>}\nEND IF;",
        "category": "sql.template"
    }, {
        "name": "IF_ELSE",
        "prefix": "IFELSE",
        "description": "IFELSE - IF ELSE STATEMENT",
        "template": "IF ${<bool_expr1>} THEN\n\t${<then_stmts1>}\nELSEIF ${<bool_expr2>} THEN\n\t${<then_stmts2>}\nELSE\n\t${<else_stmts3>}\nEND IF;",
        "category": "sql.template"
    }, {
        "name": "FOR",
        "prefix": "FOR",
        "description": "FOR - ITERATE OVER ARRAY",
        "template": "FOR ${<loop-var>} IN ${<start_value>} .. ${<end_value>} DO\n\t${<proc_stmts>}\nEND FOR;",
        "category": "sql.template"
    }, {
        "name": "FOR",
        "prefix": "FOR",
        "description": "FOR - ITERATE OVER RESULT SETS",
        "template": "FOR ${<cur_row>} AS ${<cursor_name>} DO\n\t${<proc_stmts>}\nEND FOR;",
        "category": "sql.template"
    }, {
        "name": "WHILE",
        "prefix": "WHILE",
        "description": "WHILE - WHILE LOOP WITH CONDITION",
        "template": "WHILE ${<condition>} DO\n\t${<proc_stmts>}\nEND WHILE;",
        "category": "sql.template"
    }, {
        "name": "CASE",
        "prefix": "CASE,WHEN",
        "description": "CASE WHEN STATEMENT",
        "template": "CASE WHEN ${<condition>} THEN ${<then_stmts>} ELSE ${<else_stmts>} END;",
        "category": "sql.template"
    }];

    // Data Definition Statements
    var DATA_DEFINITION_SNIPPETS = [{
            "name": "ALTER_AUDIT",
            "prefix": "ALTER,AUDIT",
            "description": "ALTER AUDIT POLICY STATEMENT",
            "template": "ALTER AUDIT POLICY ${<policy_name>} ${<audit_mode>};",
            "category": "sql.template"
        }, {
            "name": "ALTER_FULLTEXT_INDEX",
            "prefix": "ALTER,FULLTEXT,INDEX,",
            "description": "ALTER FULLTEXT INDEX STATEMENT",
            "template": "ALTER FULLTEXT INDEX <index_name> <alter_fulltext_index_option>;",
            "category": "sql.template"
        }, {
            "name": "ALTER_INDEX",
            "prefix": "ALTER,INDEX,",
            "description": "ALTER INDEX STATEMENT",
            "template": "ALTER INDEX <index_name> REBUILD;",
            "category": "sql.template"
        }, {
            "name": "ALTER_SEQUENCE",
            "prefix": "ALTER,SEQUENCE,",
            "description": "ALTER SEQUENCE STATEMENT",
            "template": "ALTER SEQUENCE <sequence_name> RESTART WITH;",
            "category": "sql.template"
        },
        // ALTER SEQUENCE seq RESTART WITH 2;
        // ALTER SEQUENCE seq MAXVALUE 100 NO MINVALUE;
        // ALTER SEQUENCE seq INCREMENT BY 3 NO CYCLE;
        // ALTER TABLE
        // COMMENT ON
        // COMMENT ON {TABLE | VIEW } <object_name> IS <comment> 
        // COMMENT ON COLUMN <column_ref> IS <comment>
        // CREATE AUDIT POLICY
        // CREATE AUDIT POLICY <policy_name> AUDITING <audit_status_clause> <audit_actions> LEVEL <audit_level>
        // CREATE FULLTEXT INDEX
        // CREATE FULLTEXT INDEX <index_name> ON <table_name> ( <column_name> ) [<fulltext_parameter_list>]
        // CREATE INDEX
        // CREATE [UNIQUE] [BTREE | CPBTREE] INDEX <index_name> ON <table_name> (<column_name_order_entry>[{, <column_name_order_entry>}...]) [<global_index_order>]
        {
            "name": "CREATE_SCHEMA",
            "prefix": "CREATE,SCHEMA",
            "description": "CREATE SCHEMA STATEMENT",
            "template": "CREATE SCHEMA ${<schema_name>};",
            "category": "sql.template"
        }, {
            "name": "CREATE_SCHEMA",
            "prefix": "CREATE,SCHEMA",
            "description": "CREATE SCHEMA OWNED BY STATEMENT",
            "template": "CREATE SCHEMA ${<schema_name>} OWNED BY ${<user_name>};",
            "category": "sql.template"
        },

        // CREATE SEQUENCE
        // CREATE SEQUENCE <sequence_name> [<sequence_parameter_list>] [RESET BY <subquery>]
        // CREATE SEQUENCE seq START WITH 11;
        {
            "name": "CREATE_SEQUENCE",
            "prefix": "CREATE,SEQUENCE",
            "description": "CREATE SEQUENCE STATEMENT",
            "template": "CREATE SEQUENCE START WITH ${<start_value>};",
            "category": "sql.template"
        },
        // CREATE STATISTICS
        // CREATE STATISTICS [<data_statistics_name>} ON <data_sources> <data_statistics_properties>
        // <data_sources> ::= <table_name> [(<column_name>{, <column_name>}...)]
        // <data_statistics_property>::= TYPE <data_statistics_type> | CONSTRAINT <constraint_param> | BUCKETS <unsigned_integer> | QERROR <numeric_literal> | QTHETA <unsigned_integer> | MEMORY <memory_bytes> | MEMORY PERCENT <memory_percentage> | PERSISTENT {ON|OFF}
        // CREATE [PUBLIC] SYNONYM <synonym_name> FOR <object_name>
        // CREATE SYNONYM
        {
            "name": "CREATE_SYNONYM",
            "prefix": "CREATE,SYNONYM",
            "description": "CREATE SYNONYM STATEMENT",
            "template": "CREATE SYNONYM ${<synonym_name>} FOR ${<object_name>};",
            "category": "sql.template"
        }, {
            "name": "CREATE_PUBLIC_SYNONYM",
            "prefix": "CREATE,SYNONYM",
            "description": "CREATE PUBLIC SYNONYM STATEMENT",
            "template": "CREATE PUBLIC SYNONYM ${<synonym_name>} FOR ${<object_name>};",
            "category": "sql.template"
        }, {
            "name": "CREATE_TABLE",
            "prefix": "CREATE,TABLE",
            "description": "CREATE TABLE STATEMENT",
            "template": "CREATE TABLE ${<table>}();",
            "category": "sql.template"
        }, {
            "name": "CREATE_COLUMN_TABLE",
            "prefix": "CREATE,TABLE",
            "description": "CREATE COLUMN TABLE STATEMENT",
            "template": "CREATE COLUMN TABLE ${<table>}();",
            "category": "sql.template"
        }, {
            "name": "CREATE_HISTORY_COLUMN_TABLE",
            "prefix": "CREATE,TABLE",
            "description": "CREATE HISTORY COLUMN TABLE STATEMENT",
            "template": "CREATE HISTORY COLUMN TABLE ${<table>}();",
            "category": "sql.template"
        },
        // CREATE TRIGGER
        {
            "name": "CREATE_TRIGGER_BEFORE",
            "prefix": "CREATE,TRIGGER",
            "description": "CREATE TRIGGER BEFORE STATEMENT",
            "template": "CREATE TRIGGER <trigger_name> BEFORE;",
            "category": "sql.template"
        }, {
            "name": "CREATE_TRIGGER_AFTER",
            "prefix": "CREATE,TRIGGER",
            "description": "CREATE TRIGGER AFTER STATEMENT",
            "template": "CREATE TRIGGER <trigger_name> AFTER;",
            "category": "sql.template"
        },
        // CREATE VIEW <view_name> [(<column_name_list>)] AS <subquery>
        {
            "name": "CREATE_VIEW",
            "prefix": "CREATE,VIEW",
            "description": "CREATE VIEW STATEMENT",
            "template": "CREATE VIEW <view_name> AS <subquery>;",
            "category": "sql.template"
        }, {
            "name": "CREATE_TYPE",
            "prefix": "CREATE,TYPE",
            "description": "CREATE TYPE STATEMENT",
            "template": "CREATE TYPE ${<type_name>} AS TABLE ();",
            "category": "sql.template"
        }
        // ANONYMOUS BLOCKS
        , 
        {
            "name": "DO",
            "prefix": "DO,BEGIN",
            "description": "DO BEGIN ... END - ANONYMOUS BLOCKS",
            "template": "DO BEGIN\n\t${<statements>}\nEND;",
            "category": "sql.template"
        }
    ];
    
    // DROP AUDIT POLICYSyntax
    // DROP AUDIT POLICY <policy_name>
    // DROP FULLTEXT INDEX
    // DROP FULLTEXT INDEX <index_name>
    // DROP INDEXSyntax
    // DROP INDEX <index_name>
    // DROP SEQUENCE <sequence_name> CASCADE | RESTRICT
    // DROP STATISTICS
    // DROP STATISTICS {<data_statistics_name> 
    // DROP [PUBLIC] SYNONYM <synonym_name> ${<drop_option>}
    var DROP_SNIPPETS = [
        {
            "name": "DROP_TABLE",
            "prefix": "DROP,TABLE",
            "description": "DROP TABLE STATEMENT",
            "template": "DROP TABLE ${<table>};",
            "category": "sql.template"
        }, {
            "name": "DROP_VIEW",
            "prefix": "DROP,VIEW",
            "description": "DROP VIEW STATEMENT",
            "template": "DROP VIEW ${<view>};",
            "category": "sql.template"
        }, {
            "name": "DROP_SCHEMA",
            "prefix": "DROP,SCHEMA",
            "description": "DROP SCHEMA STATEMENT",
            "template": "DROP SCHEMA ${<schema_name>};",
            "category": "sql.template"
        }, {
            "name": "DROP_SYNONYM",
            "prefix": "DROP,SYNONYM",
            "description": "DROP SYNONYM STATEMENT",
            "template": "DROP SYNONYM ${<synonym>};",
            "category": "sql.template"
        }, {
            "name": "DROP_PROCEDURE",
            "prefix": "DROP,PROCEDURE",
            "description": "DROP PROCEDURE STATEMENT",
            "template": "DROP PROCEDURE ${<procedure>};",
            "category": "sql.template"
        },
        // DROP VIEW <view_name> ${<drop_option>}
        // REFRESH STATISTICS {<data_statistics_name>
        // RENAME COLUMN <table_name>.<old_column_name> TO <new_column_name>
        // RENAME INDEX <current_index_name> TO <new_index_name>
        // RENAME TABLE <current_table_name> TO <new_table_name>
        {
            "name": "DROP_FUNCTION",
            "prefix": "DROP,FUNCTION",
            "description": "DROP FUNCTION STATEMENT",
            "template": "DROP FUNCTION ${<function>};",
            "category": "sql.template"
        }, {
            "name": "DROP_TYPE",
            "prefix": "DROP,TYPE",
            "description": "DROP TYPE STATEMENT",
            "template": "DROP TYPE ${<type>};",
            "category": "sql.template"
        }, {
            "name": "DROP_SEQUENCE",
            "prefix": "DROP,SEQUENCE",
            "description": "DROP SEQUENCE STATEMENT",
            "template": "DROP SEQUENCE ${<sequence>};",
            "category": "sql.template"
        }, {
            "name": "DROP_TRIGGER",
            "prefix": "DROP,TRIGGER",
            "description": "DROP TRIGGER STATEMENT",
            "template": "DROP TRIGGER ${<trigger>};",
            "category": "sql.template"
        }
    ];

    // Data Manipulation Statements
    var DATA_MANIPULATION_SNIPPETS = [{
            "name": "SELECT_TABLE",
            "prefix": "SELECT",
            "description": "SELECT STATEMENT",
            "template": "SELECT * FROM ${<table>};",
            "category": "sql.template"
        },
        
        // SELECT column FROM table
        // LIMIT 10 OFFSET 10
        {
            "name": "SELECT_LIMIT_OFFSET",
            "prefix": "SELECT,LIMIT,OFFSET",
            "description": "SELECT LIMIT OFFSET STATEMENT",
            "template": "SELECT * FROM ${<table>}\nLIMIT ${<limit_row_count>} OFFSET ${<offset>};",
            "category": "sql.template"
        },
        
        {
            "name": "SELECT_INNER_JOIN",
            "prefix": "SELECT,JOIN,INNER",
            "description": "SELECT INNER JOIN STATEMENT",
            "template": "SELECT * \nFROM ${<table1>} \nINNER JOIN ${<table2>} \nON ;",
            "category": "sql.template"
        }, 
        {
            "name": "SELECT_LEFT_JOIN",
            "prefix": "SELECT,JOIN,LEFT",
            "description": "SELECT LEFT JOIN STATEMENT",
            "template": "SELECT * \nFROM ${<table1>} \nLEFT JOIN ${<table2>} \nON ;",
            "category": "sql.template"
        }, 
        {
            "name": "SELECT_RIGHT_JOIN",
            "prefix": "SELECT,JOIN,RIGHT",
            "description": "SELECT RIGHT JOIN STATEMENT",
            "template": "SELECT * \nFROM ${<table1>} \nRIGHT JOIN ${<table2>} \nON ;",
            "category": "sql.template"
        }, 
        {
            "name": "SELECT_FULL_JOIN",
            "prefix": "SELECT,JOIN,FULL",
            "description": "SELECT FULL JOIN STATEMENT",
            "template": "SELECT * \nFROM ${<table1>} \nFULL JOIN ${<table2>} \nON ;",
            "category": "sql.template"
        },
        
        // SELECT <column_name>, row_number() over (order by <column_name>) FROM <table>
        {
            "name": "SELECT_ROW_NUMBER",
            "prefix": "SELECT,ROW_NUMBER",
            "description": "SELECT ROW_NUMBER STATEMENT",
            "template": "SELECT ${<column_name>}, ROW_NUMBER() OVER (ORDER BY ${<column_name>}) FROM ${<table>};",
            "category": "sql.template"
        },

        // SELECT SYSUUID FROM DUMMY
        {
            "name": "SELECT_SYSUUID",
            "prefix": "SELECT,SYSUUID,UUID",
            "description": "SELECT SYSUUID STATEMENT",
            "template": "SELECT SYSUUID FROM DUMMY;",
            "category": "sql.template"
        },
        

        // WITH <alias_name> AS (sql_subquery_statement)
        // SELECT column_list FROM <alias_name>[,tablename]
        // multiple subquery aliases
        // WITH 
        // <alias_name_A> AS (sql_subquery_statement)
        // <alias_name_B> AS (sql_subquery_statement_from_alias_name_A or sql_subquery_statement )
        // SELECT <column_list>
        // FROM <alias_name_A>, <alias_name_B>, [tablenames]
        // [WHERE <join_condition>]
        {
            "name": "WITH_SELECT",
            "prefix": "WITH,SELECT",
            "description": "WITH SELECT",
            "template": "WITH ${<alias_name>} AS (${<sql_subquery_statement>})\nSELECT * FROM ${<alias_name>};",
            "category": "sql.template"
        }, 
        
        {
            "name": "WITH_SELECT_MULTI",
            "prefix": "WITH,SELECT",
            "description": "WITH SELECT MULTI",
            "template": "WITH\n${<alias_name_A>} AS (${<sql_subquery_statement>})\n${<alias_name_B>} AS (${<sql_subquery_statement>})\nSELECT *\nFROM ${<alias_name_A>}, ${<alias_name_B>};",
            "category": "sql.template"
        }, 
        
        {
            "name": "INSERT_TABLE",
            "prefix": "INSERT",
            "description": "INSERT STATEMENT",
            "template": "INSERT INTO ${<table>} VALUES();",
            "category": "sql.template"
        }, {
            "name": "UPDATE_TABLE",
            "prefix": "UPDATE",
            "description": "UPDATE STATEMENT",
            "template": "UPDATE ${<table>} SET ;",
            "category": "sql.template"
        },
        // DELETE [HISTORY] FROM <table_name> [WHERE <condition>]
        // EXPLAIN PLAN [SET STATEMENT_NAME = <statement_name>] FOR <subquery>
        // INSERT INTO <table_name> [ <column_list_clause> ] { <value_list_clause> | <subquery> }
        // LOAD <table_name> [HISTORY] {DELTA | ALL | (<column_name>, ...)}
        // MERGE [HISTORY] DELTA OF <table_name> [PART n] [WITH PARAMETERS (<parameter_list>, ...)]
        // UPSERT T VALUES (1, 1);
        // REPLACE <table_name> [ <column_list_clause> ] { <value_list_clause> [ WHERE <condition> | WITH PRIMARY KEY ] | <subquery> }
        // UNLOAD <table_name>
        {
            "name": "DELETE_TABLE",
            "prefix": "DELETE",
            "description": "DELETE STATEMENT",
            "template": "DELETE FROM ${<table>};",
            "category": "sql.template"
        }, {
            "name": "TRUNCATE_TABLE",
            "prefix": "TRUNCATE,TABLE",
            "description": "TRUNCATE TABLE STATEMENT",
            "template": "TRUNCATE TABLE ${<table>};",
            "category": "sql.template"
        }
    ];

    // System Management Statements

    // Session Management Statements
    var SESSION_MANAGEMENT_SNIPPETS = [{
        "name": "SET_SCHEMA",
        "prefix": "SET,SCHEMA",
        "description": "SET SCHEMA STATEMENT",
        "template": "SET SCHEMA ${<schema_name>};",
        "category": "sql.template"
    }, {
        "name": "SET_APPLICATION_USER",
        "prefix": "SET,APPLICATIONUSER",
        "description": "SET APPLICATION USER",
        "template": "SET 'APPLICATIONUSER'=${'<user>'};",
        "category": "sql.template"
    }, {
        "name": "CONNECT",
        "prefix": "CONNECT",
        "description": "CONNECT STATEMENT",
        "template": "CONNECT ${<username>} PASSWORD ${<password>};",
        "category": "sql.template"
    }, {
        "name": "SET_HISTORY_SESSION",
        "prefix": "SET,HISTORY,SESSION",
        "description": "SET HISTORY SESSION STATEMENT",
        "template": "SET HISTORY SESSION TO ${<when>};",
        "category": "sql.template"
    }, {
        "name": "SESSION_CONTEXT_CONNECTION_ID",
        "prefix": "SESSION_CONTEXT,CONNECTION",
        "description": "SESSION_CONTEXT CONNECTION ID",
        "template": "SELECT SESSION_CONTEXT('CONN_ID') FROM DUMMY;",
        "category": "sql.template"
    }, {
        "name": "SESSION_CONTEXT_APPLICATION",
        "prefix": "SESSION_CONTEXT,APPLICATION",
        "description": "SESSION_CONTEXT APPLICATION",
        "template": "SELECT SESSION_CONTEXT('APPLICATION') FROM DUMMY;",
        "category": "sql.template"
    }, {
        "name": "SESSION_CONTEXT_APPLICATIONUSER",
        "prefix": "SESSION_CONTEXT,APPLICATIONUSER",
        "description": "SESSION_CONTEXT APPLICATIONUSER",
        "template": "SELECT SESSION_CONTEXT('APPLICATIONUSER') FROM DUMMY;",
        "category": "sql.template"
    }, {
        "name": "SESSION_CONTEXT_TRACEPROFILE",
        "prefix": "SESSION_CONTEXT,TRACEPROFILE",
        "description": "SESSION_CONTEXT TRACEPROFILE",
        "template": "SELECT SESSION_CONTEXT('TRACEPROFILE') FROM DUMMY;",
        "category": "sql.template"
    }];

    // Transaction Management Statements
    var TXN_MANAGEMENT_SNIPPETS = [{
        "name": "LOCK_TABLE",
        "prefix": "LOCK",
        "description": "LOCK TABLE",
        "template": "LOCK TABLE <table_name> IN EXCLUSIVE MODE;",
        "category": "sql.template"
    }, {
        "name": "SET_TXN_ISOLATION",
        "prefix": "SET,TRANSACTION",
        "description": "SET TRANSACTION ISOLATION LEVEL",
        "template": "SET TRANSACTION <isolation_level>;",
        "category": "sql.template"
    }, {
        "name": "SET_TXN_ACCESS",
        "prefix": "SET,TRANSACTION",
        "description": "SET TRANSACTION ACCESS MODE",
        "template": "SET TRANSACTION <transaction_access_mode>;",
        "category": "sql.template"
    }];

    // Access Control Statements
    var ACCESS_CONTROL_SNIPPETS = [
        // CREATE USER new_user PASSWORD Password1 WITH IDENTITY ANY FOR SAML PROVIDER ac_saml_provider;
        // CREATE USER T12345 PASSWORD Password123
        {
            "name": "CREATE_USER",
            "prefix": "CREATE,USER",
            "description": "CREATE USER STATEMENT",
            "template": "CREATE USER ${<user_name>} PASSWORD ${<password>} \n\tIDENTIFIED EXTERNALLY AS ${<external_identity>} \n\tWITH IDENTITY ${<provider_identity>} \n\t${<set_user_parameters>};",
            "category": "sql.template"
        }, 
        // ALTER USER BANH_T3 SET PARAMETER <user_parameter_list>
        {
            "name": "ALTER_USER_SET_PARAMETER",
            "prefix": "ALTER,PARAMETER,USER",
            "description": "ALTER USER SET PARAMETER",
            "template": "ALTER USER ${<user_name>} SET PARAMETER <user_parameter_list>;",
            "category": "sql.template"
        }, 
        // ALTER USER BANH_T3 CLEAR PARAMETER <clear_user_parameter_list>
        {
            "name": "ALTER_USER_CLEAR_PARAMETER",
            "prefix": "ALTER,PARAMETER,USER",
            "description": "ALTER USER CLEAR PARAMETER",
            "template": "ALTER USER ${<user_name>} CLEAR PARAMETER <clear_user_parameter_list>;",
            "category": "sql.template"
        },
        // ALTER USER BANH_T3 CLEAR ALL PARAMETERS;
        {
            "name": "ALTER_USER_CLEAR_ALL_PARAMETER",
            "prefix": "ALTER,PARAMETER,USER",
            "description": "ALTER USER CLEAR ALL PARAMETER",
            "template": "ALTER USER ${<user_name>} CLEAR ALL PARAMETERS;",
            "category": "sql.template"
        }, {
            "name": "CREATE_ROLE",
            "prefix": "CREATE,ROLE",
            "description": "CREATE ROLE STATEMENT",
            "template": "CREATE ROLE ${<role_name>};",
            "category": "sql.template"
        }, {
            "name": "DROP_USER",
            "prefix": "DROP,USER",
            "description": "DROP USER STATEMENT",
            "template": "DROP USER ${<user_name>};",
            "category": "sql.template"
        }, {
            "name": "DROP_ROLE",
            "prefix": "DROP,ROLE",
            "description": "DROP ROLE STATEMENT",
            "template": "DROP ROLE ${<role_name>};",
            "category": "sql.template"
        }, {
            "name": "DROP_SAML_PROVIDER",
            "prefix": "DROP,SAML",
            "description": "DROP SAML PROVIDER STATEMENT",
            "template": "DROP SAML PROVIDER ${<saml_provider_name>};",
            "category": "sql.template"
        }, {
            "name": "GRANT_SYSTEM_PRIVILEGE",
            "prefix": "GRANT",
            "description": "GRANT STATEMENT",
            "template": "GRANT ${<system_privilege>} TO  ${<grantee>};",
            "category": "sql.template"
        }, {
            "name": "GRANT_SCHEMA_PRIVILEGE",
            "prefix": "GRANT,SCHEMA",
            "description": "GRANT ON SCHEMA",
            "template": "GRANT ${<schema_privilege>} ON SCHEMA ${<schema_name>} TO ${<grantee>};",
            "category": "sql.template"
        }, {
            "name": "GRANT_OBJECT_PRIVILEGE",
            "prefix": "GRANT,OBJECT",
            "description": "GRANT ON OBJECT",
            "template": "GRANT ${<object_privilege>} ON ${<object_name>} TO ${<grantee>};",
            "category": "sql.template"
        }, {
            "name": "GRANT_ROLE_NAME",
            "prefix": "GRANT,ROLE",
            "description": "GRANT ROLE",
            "template": "GRANT ${<role_name>} TO ${<grantee>};",
            "category": "sql.template"
        }, {
            "name": "GRANT_STRUCTURED_PRIVILEGE",
            "prefix": "GRANT, STRUCTURED",
            "description": "GRANT STRUCTURED PRIVILEGE",
            "template": "GRANT STRUCTURED PRIVILEGE ${<privilege_name>} TO ${<grantee>};",
            "category": "sql.template"
        }, {
            "name": "REVOKE_SYSTEM_PRIVILEGE",
            "prefix": "REVOKE",
            "description": "REVOKE",
            "template": "REVOKE ${<system_privilege>} FROM  ${<grantee>};",
            "category": "sql.template"
        }, {
            "name": "REVOKE_SCHEMA_PRIVILEGE",
            "prefix": "GRANT,SCHEMA",
            "description": "REVOKE ON SCHEMA",
            "template": "REVOKE ${<schame_privilege>} ON SCHEMA ${<schema_name>} FROM ${<grantee>};",
            "category": "sql.template"
        }, {
            "name": "REVOKE_OBJECT_PRIVILEGE",
            "prefix": "REVOKE,OBJECT",
            "description": "REVOKE ON OBJECT",
            "template": "REVOKE ${<object_privilege>} ON ${<object_name>} FROM ${<grantee>};",
            "category": "sql.template"
        }, {
            "name": "REVOKE_ROLE_NAME",
            "prefix": "REVOKE,ROLE",
            "description": "REVOKE ROLE",
            "template": "REVOKE ${<role_name>} FROM ${<grantee>};",
            "category": "sql.template"
        }, {
            "name": "REVOKE_STRUCTURED_PRIVILEGE",
            "prefix": "REVOKE,STRUCTURED",
            "description": "REVOKE STRUCTURED PRIVILEGE",
            "template": "REVOKE STRUCTURED PRIVILEGE ${<privilege_name>} FROM ${<grantee>};",
            "category": "sql.template"
        }, {
            "name": "REVOKE_APPLICATION_PRIVILEGE",
            "prefix": "REVOKE,APPLICATION",
            "description": "REVOKE APPLICATION PRIVILEGE",
            "template": "REVOKE APPLICATION PRIVILEGE ${<privilege_name>} FROM ${<grantee>};",
            "category": "sql.template"
        }, {
            "name": "ALTER_SAML_PROVIDER",
            "prefix": "ALTER,SAML",
            "description": "ALTER SAML PROVIDER",
            "template": "ALTER SAML PROVIDER ${<saml_provider_name>} \n\tSET SUBJECT ${<subject_distinguished_name>} \n\tISSUER ${<issuer_distinguished_name>};",
            "category": "sql.template"
        },
        // CREATE SAML PROVIDER ac_saml_provider WITH SUBJECT 'CN = wiki.detroit.ACompany.corp,OU = ACNet,O = ACompany,C = EN' ISSUER 'E = John.Do@acompany.com,CN = ACNetCA,OU = ACNet,O = ACompany,C = EN';
        {
            "name": "CREATE_SAML_PROVIDER",
            "prefix": "CREATE,SAML",
            "description": "CREATE SAML PROVIDER STATEMENT",
            "template": "CREATE SAML PROVIDER ${<saml_provider_name>} \n\tWITH SUBJECT ${<subject_distinguished_name>} \n\tISSUER ${<issuer_distinguished_name>};",
            "category": "sql.template"
        }
    ];

    // Data Import Export Statements
    var DATA_IMPORT_EXPORT_SNIPPETS = [{
        "name": "EXPORT",
        "prefix": "EXPORT",
        "description": "EXPORT",
        "template": "EXPORT ${<object_name_list>} AS ${<export_format>} INTO ${<path>};",
        "category": "sql.template"
    }, {
        "name": "IMPORT",
        "prefix": "IMPORT",
        "description": "IMPORT",
        "template": "IMPORT ${<object_name_list>} FROM ${<path>};",
        "category": "sql.template"
    }, {
        "name": "IMPORT_SCAN",
        "prefix": "IMPORT,SCAN",
        "description": "IMPORT SCAN",
        "template": "IMPORT SCAN ${<path>};",
        "category": "sql.template"
    }];

    // Procedural Statements
    var PROCEDURAL_SNIPPETS = [{
        "name": "CREATE_PROCEDURE",
        "prefix": "CREATE,PROCEDURE",
        "description": "CREATE PROCEDURE STATEMENT",
        "template": "CREATE PROCEDURE \"${<target_schema_name>}\".\"${<proc_name>}\"( )\n\tLANGUAGE SQLSCRIPT\n\tSQL SECURITY DEFINER\n\t--DEFAULT SCHEMA <default_schema_name>\n\tREADS SQL DATA AS\nBEGIN\n\t/*************************************\n\t\tWrite your procedure logic\n\t*************************************/\nEND",
        "category": "sql.template"
    }, {
        "name": "CREATE_PARAMETER_PROCEDURE",
        "prefix": "CREATE,PROCEDURE",
        "description": "CREATE PROCEDURE PARAMETER STATEMENT",
        "template": "CREATE PROCEDURE \"${<target_schema_name>}\".\"${<proc_name>}\"(IN ${param1} ${type},\n\t\t\t\t\t\t\tOUT ${param2} ${type},\n\t\t\t\t\t\t\tINOUT ${param3} ${type})\n\tLANGUAGE SQLSCRIPT\n\tSQL SECURITY DEFINER\n\t--DEFAULT SCHEMA <default_schema_name>\n\tREADS SQL DATA AS\nBEGIN\n\t/*************************************\n\tWrite your procedure logic\n\t/*************************************/\nEND",
        "category": "sql.template"
    }, {
        "name": "CREATE_RESULT_VIEW_PROCEDURE",
        "prefix": "CREATE,PROCEDURE",
        "description": "CREATE PROCEDURE RESULT VIEW STATEMENT",
        "template": "CREATE PROCEDURE \"${<target_schema_name>}\".\"${<proc_name>}\"(IN ${param1} ${type},\n\t\t\t\t\t\t\tOUT ${param2} ${type})\n\tLANGUAGE SQLSCRIPT\n\tREADS SQL DATA WITH RESULT VIEW ${<view_name>} AS\nBEGIN\n\t/*************************************\n\tWrite your procedure logic\n\t/*************************************/\nEND",
        "category": "sql.template"
    }, {
        "name": "CALL",
        "prefix": "CALL",
        "description": "CALL A PROCEDURE",
        "template": "CALL \"${<target_schema_name>}\".\"${<proc_name>}\"} (${<param_list>});",
        "category": "sql.template"
    }, {
        "name": "ALTER_PROCEDURE_RECOMPILE",
        "prefix": "ALTER,PROCEDURE",
        "description": "ALTER PROCEDURE RECOMPILE",
        "template": "ALTER PROCEDURE \"${<target_schema_name>}\".\"${<proc_name>}\" RECOMPILE;",
        "category": "sql.template"
    }];
    
    // CREATE FUNCTION <func_name> [(<parameter_clause>)] RETURNS <return_type> [LANGUAGE <lang>] [SQL SECURITY <mode>][DEFAULT SCHEMA <default_schema_name>]ASBEGIN <function_body> END
    var FUNCTION_SNIPPETS =[{
        "name": "CREATE_FUNCTION",
        "prefix": "CREATE,FUNCTION",
        "description": "CREATE FUNCTION STATEMENT",
        "template": "CREATE FUNCTION ${<func_name>}(${<parameter_clause>}) \n\tRETURNS ${<return_type>} \n\tLANGUAGE SQLSCRIPT \n\tAS\nBEGIN\n\nEND;",
        "category": "sql.template"
    }, {
        "name": "CREATE_AGGREGATE_FUNCTION",
        "prefix": "AGGREGATE,CREATE,FUNCTION",
        "description": "CREATE AGGREGATE FUNCTION STATEMENT",
        "template": "CREATE AGGREGATE FUNCTION ${<func_name>}(${<parameter_clause>}) \n\tRETURNS ${<return_type_aggr>} \n\tLANGUAGE SQLSCRIPT \n\tAS\nBEGIN\n\nEND;",
        "category": "sql.template"
    }, {
        "name": "CREATE_WINDOW_FUNCTION",
        "prefix": "WINDOW,CREATE,FUNCTION",
        "description": "CREATE WINDOW FUNCTION STATEMENT",
        "template": "CREATE WINDOW FUNCTION ${<func_name>}(${<parameter_clause>}) \n\tRETURNS ${<return_type_wind>} \n\tLANGUAGE SQLSCRIPT \n\tAS\nBEGIN\n\nEND;",
        "category": "sql.template"
    }];

    // Cursors
    var CURSORS_SNIPPETS = [{
        "name": "DEFINE_CURSOR",
        "prefix": "DEFINE,CURSOR",
        "description": "DEFINE CURSOR STATEMENT",
        "template": "CURSOR ${<cursor_name>} () \n\t FOR ${<select_stmt>};",
        "category": "sql.template"
    }, {
        "name": "OPEN_CURSOR",
        "prefix": "OPEN,CURSOR",
        "description": "OPEN CURSOR STATEMENT",
        "template": "OPEN ${<cursor_name>};",
        "category": "sql.template"
    }, {
        "name": "CLOSE_CURSOR",
        "prefix": "CLOSE,CURSOR",
        "description": "CLOSE CURSOR STATEMENT",
        "template": "CLOSE ${<cursor_name>};",
        "category": "sql.template"
    }, {
        "name": "FETCH_QUERY_RESULTS_OF_A_CURSOR",
        "prefix": "FETCH,CURSOR",
        "description": "FETCH QUERY RESULTS OF A CURSOR",
        "template": "FETCH ${<cursor_name>} INTO ${<variable_list>};",
        "category": "sql.template"
    }];

    // Dynamic SQL
    var DYNAMIC_SQL_SNIPPETS = [{
        "name": "EXEC",
        "prefix": "EXEC",
        "description": "EXEC STATEMENT",
        "template": "EXEC '${<sql-statement>}';",
        "category": "sql.template"
    }, {
        "name": "EXECUTE_IMMEDIATE",
        "prefix": "EXECUTE,IMMEDIATE",
        "description": "EXECUTE IMMEDIATE STATEMENT",
        "template": "EXECUTE IMMEDIATE '${<sql-statement>}';",
        "category": "sql.template"
    }, {
        "name": "APPLY_FILTER",
        "prefix": "APPLY,FILTER",
        "description": "APPLY_FILTER STATEMENT",
        "template": "${<variable_name>} = APPLY_FILTER(${<table_or_table_variable>}, ${<filter_variable_name>});",
        "category": "sql.template"
    }];

    // Declare
    // variable
    // Array
    // array_int INTEGER ARRAY;
    // array_int INTEGER ARRAY:= ARRAY(1, 2, 3);
    // array_id INTEGER ARRAY[] := ARRAY(1, 2, 3);
    // Exception Handling
    var DECLARE_SNIPPETS = [{
        "name": "DECLARE_VARIABLE",
        "prefix": "DECLARE",
        "description": "DECLARE VARIABLE",
        "template": "DECLARE ${<variable_name>} ${<type>};",
        "category": "sql.template"
    }, {
        "name": "DECLARE_ARRAY",
        "prefix": "DECLARE,ARRAY",
        "description": "DECLARE ARRAY",
        "template": "DECLARE ${<array_name>} ${<type>} ARRAY;",
        "category": "sql.template"
    }, {
        "name": "DECLARE_ARRAY_CONSTRUCTOR",
        "prefix": "DECLARE,ARRAY",
        "description": "DECLARE ARRAY CONSTRUCTOR",
        "template": "DECLARE ${<array_name>} ${<type>} ARRAY[] := ARRAY();",
        "category": "sql.template"
    }, {
        "name": "DECLARE_EXIT_HANDLER",
        "prefix": "DECLARE,EXIT,HANDLER",
        "description": "DECLARE EXIT HANDLER",
        "template": "${<proc_handler>} \n\t::= DECLARE EXIT HANDLER FOR ${<proc_condition_value_list>} ${<proc_stmt>};",
        "category": "sql.template"
    }, {
        "name": "DECLARE_CONDITION",
        "prefix": "DECLARE,CONDITION",
        "description": "DECLARE CONDITION",
        "template": "DECLARE ${<condition_name>} CONDITION  FOR ${<sqlstate_value>};",
        "category": "sql.template"
    }];

    return {
        _aContents: [],

        getSnippets: function() {
            if (!this._aContents || this._aContents.length === 0) {
                this._aContents = SQL_CONTROL_STRUCTURES
                    .concat(DATA_MANIPULATION_SNIPPETS)
                    .concat(DATA_DEFINITION_SNIPPETS)
                    .concat(SESSION_MANAGEMENT_SNIPPETS)
                    .concat(ACCESS_CONTROL_SNIPPETS)
                    .concat(TXN_MANAGEMENT_SNIPPETS)
                    .concat(DATA_IMPORT_EXPORT_SNIPPETS)
                    .concat(PROCEDURAL_SNIPPETS)
                    .concat(FUNCTION_SNIPPETS)
                    .concat(CURSORS_SNIPPETS)
                    .concat(DYNAMIC_SQL_SNIPPETS)
                    .concat(DECLARE_SNIPPETS)
                    .concat(DROP_SNIPPETS);
            }
            return this._aContents;
        }
    };
});