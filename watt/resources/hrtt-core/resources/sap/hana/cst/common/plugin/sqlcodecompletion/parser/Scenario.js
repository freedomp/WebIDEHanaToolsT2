/** Copyright © 2015 SAP SE or an affiliate company. All rights reserved.**/

define([], function() {

    "use strict";

    /*
    The contexts should be arranged from the most complex level to simple one
    Structure
        scenario: 'create'
        context: 'create procedure <proc_name>('
        subcontext: in <variablename> <datatype> ...
    */
    var SCENARIO_IN_PRE = {
        /*** CALL context collection ***/
        // CALL <proc_name> (<param_list>) [WITH OVERVIEW]
        "call": {
            "contexts": [{
                "name": "call_space",
                "description": "call_space",
                "pattern": /\bcall\b\s+[\w|\W]+\s+$/igm
            }, {
                "name": "call",
                "description": "call",
                "pattern": /\bcall\b\s+[\w|\W]*$/igm
            }]
        },

        /*** DELETE context collection ***/
        // DELETE [HISTORY] FROM <table_name> [WHERE <condition>]
        // DELETE FROM T WHERE KEY = 1;
        // DELETE HISTORY FROM HIST WHERE KEY=1;
        "delete": {
            "contexts": [{
                "name": "delete_from_space",
                "description": "delete_from_space",
                "pattern": /\bdelete\s+(history\s+)?from\b\s+[\w|\W]+\s+$/igm
            }, {
                "name": "delete_from",
                "description": "delete_from",
                "pattern": /\bdelete\s+(history\s+)?from\b\s+[\w|\W]*$/igm
            }]
        },

        // EXPLAIN PLAN [SET STATEMENT_NAME = <statement_name>] FOR <subquery>

        /*** LOAD context collection ***/
        // LOAD <table_name> [HISTORY] {DELTA | ALL | (<column_name>, ...)}
        // LOAD A all;
        // LOAD A (A,B);
        "load": {
            "contexts": [{
                "name": "load_space",
                "description": "load_space",
                "pattern": /\bload\b\s+[\w|\W]+\s+$/igm
            }, {
                "name": "load",
                "description": "load",
                "pattern": /\bload\b\s+[\w|\W]*$/igm
            }]
        },

        /*** INSERT context collection ***/
        // INSERT INTO <table_name> [ <column_list_clause> ] { <value_list_clause> | <subquery> }
        // INSERT INTO T VALUES (1, 1, 'The first');
        // INSERT INTO T (KEY, VAL2) VALUES (2,3);
        // INSERT INTO T SELECT 3, 3, 'The third' FROM DUMMY;
        "insert": {
            "contexts": [{
                "name": "insert_into_values",
                "description": "insert_into_values",
                "pattern": /\binsert\s+into\b\s+[\w|\W]+\s*\bvalues\b[\w|\W]*$/igm
            }, {
                "name": "insert_into_space",
                "description": "insert_into_space",
                "pattern": /\binsert\s+into\b\s+[\w|\W]+\s+$/igm
            }, {
                "name": "insert_into",
                "description": "insert into ",
                "pattern": /\binsert\s+into\b\s+[\w|\W]*$/igm
            }]
        },

        /*** MERGE context collection ***/
        // MERGE [HISTORY] DELTA OF <table_name> [PART n] [WITH PARAMETERS (<parameter_list>, ...)]
        // CREATE HISTORY COLUMN TABLE A(c NVARCHAR(1000)) PARTITION BY ROUNDROBIN PARTITIONS 2;
        // MERGE DELTA OF A;
        "merge": {
            "contexts": [{
                "name": "merge_delta_of_space",
                "description": "merge_delta_of_space",
                "pattern": /\bmerge\s+(history\s+)?delta\s+of\b\s+[\w|\W]+\s+$/igm
            }, {
                "name": "merge_delta_of",
                "description": "merge_delta_of",
                "pattern": /\bmerge\s+(history\s+)?delta\s+of\b\s+[\w|\W]*$/igm
            }]
        },

        /*** UPSERT context collection ***/
        // UPSERT <table_name> [ <column_list_clause> ] { <value_list_clause> [ WHERE <condition> | WITH PRIMARY KEY ] | <subquery> } 
        // REPLACE <table_name> [ <column_list_clause> ] { <value_list_clause> [ WHERE <condition> | WITH PRIMARY KEY ] | <subquery> }
        // UPSERT T VALUES (1, 1);
        // UPSERT T VALUES (2, 2) WHERE KEY = 2;
        // UPSERT T VALUES (1, 8) WITH PRIMARY KEY;
        // UPSERT T SELECT KEY + 2, VAL FROM T;
        "upsert": {
            "contexts": [{
                "name": "upsert_space",
                "description": "upsert_space",
                "pattern": /\bupsert\b\s+[\w|\W]+\s+$/igm
            }, {
                "name": "upsert",
                "description": "upsert",
                "pattern": /\bupsert\b\s+[\w|\W]*$/igm
            }]
        },

        /*** SELECT context collection ***/
        // SELECT count(*) INTO found FROM books WHERE isbn = :v_isbn;
        "select": {
            "contexts": [{
                "name": "select_from_where",
                "description": "select <name_list> from <name_list> where",
                "pattern": /\bselect\s+[\W|\w]*\s*from\s+[\W|\w]+\s+where\b\s+[\w|\W]*$/igm,
                "subcontextdelimeter": /\,/igm,
                "subcontexts": [{
                    "name": "define_columns_in_select_from_where",
                    "description": "define_columns_in_select_from_where",
                    "pattern": /[\w|\W]*$/igm
                }]
            }, {
                "name": "select_from_join",
                "description": "select <name_list> from <name_list> inner join",
                "pattern": /\bselect\s+[\W|\w]*\s*from\s+[\W|\w]+(?:\s+(?:inner|(?:left|right|full)(?:\s+outer)?)\s+join\s+[\W|\w]+on)+\b\s+[\w|\W]*$/igm
            }, {
                "name": "select_from",
                "description": "select <name_list> from ",
                "pattern": /\bselect\s+[\w|\W]*\s*from\b\s+[\w|\W]*$/igm,
                "subcontextdelimeter": /\bfrom\b|\,/igm,
                "subcontexts": [{
                    "name": "define_table_in_select_from",
                    "description": "define_table_in_select_from",
                    "pattern": /[\w|\W]*$/igm
                }]
            }, {
                "name": "select_on_schema",
                "description": "select_on_schema",
                "pattern": /\bselect\s+on\s+schema\b\s+[\w|\W]*$/igm
            }, {
                "name": "select",
                "description": "select ",
                "pattern": /\bselect\b\s+[\w|\W]*$/igm,
                "subcontextdelimeter": /[\,]/ig,
                "subcontexts": [{
                    "name": "define_columns_in_select",
                    "description": "<name> ",
                    "pattern": /\s*[\w|\W]+\s+[\w|\W]*$/igm
                }]
            }]
        },

        // TRUNCATE TABLE <table_name>
        "truncate": {
            "contexts": [{
                "name": "truncate_table_space",
                "description": "truncate_table_space",
                "pattern": /\btruncate\s+table\b\s+[\w|\W]+\s+$/igm
            }, {
                "name": "truncate_table",
                "description": "truncate_table",
                "pattern": /\btruncate\s+table\b\s+[\w|\W]*$/igm
            }]
        },

        // UNLOAD <table_name>
        "unload": {
            "contexts": [{
                "name": "unload_space",
                "description": "unload_space ",
                "pattern": /\bunload\b\s+[\w|\W]+\s+$/igm
            }, {
                "name": "unload",
                "description": "unload ",
                "pattern": /\bunload\b\s+[\w|\W]*$/igm
            }]
        },

        /*** UPDATE context collection ***/
        // UPDATE <table_name> [<alias_name>] <set_clause> [ WHERE <condition> ]
        // UPDATE T SET VAL = KEY + 10;
        // UPDATE T SET VAL = T2.VAR FROM T, T2 WHERE T.KEY = T2.KEY;
        "update": {
            "contexts": [{
                "name": "update_set_from_where",
                "description": "update_set_from_where ",
                "pattern": /\bupdate\s+[\w|\W]*\s+set\s+[\w|\W]*\s+from[\w|\W]+\s+where\b\s+[\w|\W]*$/igm
            }, {
                "name": "update_set_from",
                "description": "update_set_from ",
                "pattern": /\bupdate\s+[\w|\W]*\s+set\s+[\w|\W]*\s+from\b\s+[\w|\W]*$/igm
            }, {
                "name": "update_set",
                "description": "update_set",
                "pattern": /\bupdate\s+[\w|\W]*\s+set\b\s+[\w|\W]*$/igm
            }, {
                "name": "update_space",
                "description": "update_space ",
                "pattern": /\bupdate\b\s+[\w|\W]+\s+$/igm
            }, {
                "name": "update",
                "description": "update ",
                "pattern": /\bupdate\b\s+[\w|\W]*$/igm
            }]
        },

        /*** DROP context collection ***/
        "drop": {
            "contexts": [
                // DROP FUNCTION <func_name> [<drop_option>]
                {
                    "name": "drop_function_space",
                    "description": "drop_function_space",
                    "pattern": /\bdrop\s+function\b\s+[\w|\W]+\s+$/igm
                }, {
                    "name": "drop_function",
                    "description": "drop_function",
                    "pattern": /\bdrop\s+function\b\s+[\w|\W]*$/igm
                },

                // DROP PROCEDURE <proc_name> [<drop_option>]
                {
                    "name": "drop_procedure_space",
                    "description": "drop_procedure_space",
                    "pattern": /\bdrop\s+procedure\b\s+[\w|\W]+\s+$/igm
                }, {
                    "name": "drop_procedure",
                    "description": "drop_procedure",
                    "pattern": /\bdrop\s+procedure\b\s+[\w|\W]*$/igm
                },

                // DROP [PUBLIC] SYNONYM <synonym_name> [<drop_option>]
                // DROP SYNONYM a_synonym; 
                // DROP PUBLIC SYNONYM pa_synonym;
                {
                    "name": "drop_public_synonym_space",
                    "description": "drop_public_synonym_space",
                    "pattern": /\bdrop\s+public\s+synonym\b\s+[\w|\W]+\s+$/igm
                }, {
                    "name": "drop_public_synonym",
                    "description": "drop_public_synonym",
                    "pattern": /\bdrop\s+public\s+synonym\b\s+[\w|\W]*$/igm
                }, {
                    "name": "drop_synonym_space",
                    "description": "drop_synonym_space",
                    "pattern": /\bdrop\s+synonym\b\s+[\w|\W]+\s+$/igm
                }, {
                    "name": "drop_synonym",
                    "description": "drop_synonym",
                    "pattern": /\bdrop\s+synonym\b\s+[\w|\W]*$/igm
                },

                // DROP SEQUENCE <sequence_name> [<drop_option>]Syntax Elements
                {
                    "name": "drop_sequence_space",
                    "description": "drop_sequence_space",
                    "pattern": /\bdrop\s+sequence\b\s+[\w|\W]+\s+$/igm
                }, {
                    "name": "drop_sequence",
                    "description": "drop_sequence",
                    "pattern": /\bdrop\s+sequence\b\s+[\w|\W]*$/igm
                },

                // DROP TABLE <table_name> [<drop_option>]
                {
                    "name": "drop_table_space",
                    "description": "drop_table_space",
                    "pattern": /\bdrop\s+table\b\s+[\w|\W]+\s+$/igm
                }, {
                    "name": "drop_table",
                    "description": "drop_table",
                    "pattern": /\bdrop\s+table\b\s+[\w|\W]*$/igm
                },

                // DROP VIEW <view_name> [<drop_option>]
                {
                    "name": "drop_view_space",
                    "description": "drop_view_space",
                    "pattern": /\bdrop\s+view\b\s+[\w|\W]+\s+$/igm
                }, {
                    "name": "drop_view",
                    "description": "drop_view",
                    "pattern": /\bdrop\s+view\b\s+[\w|\W]*$/igm
                },

                // DROP TRIGGER <trigger_name>
                {
                    "name": "drop_trigger_space",
                    "description": "drop_trigger_space",
                    "pattern": /\bdrop\s+trigger\b\s+[\w|\W]+\s+$/igm
                }, {
                    "name": "drop_trigger",
                    "description": "drop_trigger",
                    "pattern": /\bdrop\s+trigger\b\s+[\w|\W]*$/igm
                },

                // DROP INDEX <index_name>
                {
                    "name": "drop_index_space",
                    "description": "drop_index_space",
                    "pattern": /\bdrop\s+index\b\s+[\w|\W]+\s+$/igm
                }, {
                    "name": "drop_index",
                    "description": "drop_index",
                    "pattern": /\bdrop\s+index\b\s+[\w|\W]*$/igm
                },

                // DROP TYPE <type_name> [<drop_option>]
                {
                    "name": "drop_type_space",
                    "description": "drop_type_space",
                    "pattern": /\bdrop\s+type\b\s+[\w|\W]+\s+$/igm
                }, {
                    "name": "drop_type",
                    "description": "drop_type",
                    "pattern": /\bdrop\s+type\b\s+[\w|\W]*$/igm
                },

                // DROP SCHEMA <schema_name> [<drop_option>]
                {
                    "name": "drop_schema_space",
                    "description": "drop_schema_space",
                    "pattern": /\bdrop\s+schema\b\s+[\w|\W]+\s+$/igm
                }, {
                    "name": "drop_schema",
                    "description": "drop_schema",
                    "pattern": /\bdrop\s+schema\b\s+[\w|\W]*$/igm
                },
                // DROP USER <user_name> [<drop_option>]
                {
                    "name": "drop_user_space",
                    "description": "drop_user_space",
                    "pattern": /\bdrop\s+user\b\s+[\w|\W]+\s+$/igm
                }, {
                    "name": "drop_user",
                    "description": "drop_user",
                    "pattern": /\bdrop\s+user\b\s+[\w|\W]*$/igm
                },
                // DROP ROLE <role_name>
                {
                    "name": "drop_role_space",
                    "description": "drop_role_space",
                    "pattern": /\bdrop\s+role\b\s+[\w|\W]+\s+$/igm
                }, {
                    "name": "drop_role",
                    "description": "drop_role",
                    "pattern": /\bdrop\s+role\b\s+[\w|\W]*$/igm
                },
                // DROP SAML PROVIDER <saml_provider_name>
                {
                    "name": "drop_saml_provider_space",
                    "description": "drop_saml_provider_space",
                    "pattern": /\bdrop\s+saml\s+provider\b\s+[\w|\W]+\s+$/igm
                }, {
                    "name": "drop_saml_provider",
                    "description": "drop_saml_provider",
                    "pattern": /\bdrop\s+saml\s+provider\b\s+[\w|\W]*$/igm
                }
            ]
        },

        /*** RENAME context collection ***/
        // RENAME COLUMN <table_name>.<old_column_name> TO <new_column_name>
        // RENAME COLUMN tab.A TO C;

        // RENAME INDEX <current_index_name> TO <new_index_name>
        // RENAME INDEX idx TO new_idx;

        // RENAME TABLE <current_table_name> TO <new_table_name>
        // RENAME TABLE A TO B;
        // RENAME TABLE mySchema.A TO B;
        "rename": {
            "contexts": [{
                "name": "rename_table_to",
                "description": "rename_table_to",
                "pattern": /\brename\s+table\s+[\w|\W]*\s+to\b\s+[\w|\W]*$/igm
            }, {
                "name": "rename_table_space",
                "description": "rename_table_space",
                "pattern": /\brename\s+table\b\s+[\w|\W]+\s+$/igm
            }, {
                "name": "rename_table",
                "description": "rename_table",
                "pattern": /\brename\s+table\b\s+[\w|\W]*$/igm
            }, {
                "name": "rename_column_to",
                "description": "rename_column_to",
                "pattern": /\brename\s+column\s+[\w|\W]*\s+to\b\s+[\w|\W]*$/igm
            }, {
                "name": "rename_column",
                "description": "rename_column",
                "pattern": /\brename\s+column\b\s+[\w|\W]*$/igm
            }, {
                "name": "rename_index_to",
                "description": "rename_index_to",
                "pattern": /\brename\s+index\s+[\w|\W]*\s+to\b\s+[\w|\W]*$/igm
            }, {
                "name": "rename_index",
                "description": "rename_index",
                "pattern": /\brename\s+index\b\s+[\w|\W]*$/igm
            }]
        },

        /*** ALTER context collection ***/
        // ALTER PROCEDURE <proc_name> RECOMPILE [WITH PLAN]
        // ALTER SAML PROVIDER <saml_provider_name> <alter_saml_provider_option>
        // ALTER USER <user_name> <alter_user_option>
        "alter": {
            "contexts": [{
                "name": "alter_saml_provider",
                "description": "alter_saml_provider",
                "pattern": /\balter\s+saml\s+provider\b\s+[\w|\W]*$/igm
            }, {
                "name": "alter_procedure",
                "description": "alter_procedure",
                "pattern": /\balter\s+procedure\b\s+[\w|\W]*$/igm
            }, {
                "name": "alter_user",
                "description": "alter_user",
                "pattern": /\balter\s+user\b\s+[\w|\W]*$/igm
            }]
        },

        /*** CREATE context collection ***/
        "create": {
            "contexts": [
                // CREATE [<table_type>] TABLE <table_name> <table_contents_source>
                //        <table_type> ::= COLUMN | ROW | HISTORY COLUMN | GLOBAL TEMPORARY | LOCAL TEMPORARY

                // CREATE TABLE A (A INT PRIMARY KEY, B INT);

                // CREATE COLUMN TABLE P1 (U DATE PRIMARY KEY) PARTITION BY RANGE (U) (PARTITION '2010-02-03' <= VALUES < '2011-01-01', PARTITION VALUE = '2011-05-01');
                // CREATE COLUMN TABLE C1 LIKE A WITH DATA;

                // CREATE HISTORY COLUMN TABLE H (A INT); 
                // CREATE TABLE H1 LIKE H WITH DATA; 
                // CREATE TABLE H2 LIKE H WITH NO DATA WITHOUT HISTORY;
                // CREATE TABLE C2 AS (SELECT * FROM A) WITH NO DATA;

                // CREATE TABLE R (A INT PRIMARY KEY, B NVARCHAR(10)); 
                // CREATE TABLE F (FK INT, B NVARCHAR(10), FOREIGN KEY(FK) REFERENCES R ON UPDATE CASCADE);
                {
                    "name": "create_table(",
                    "description": "create table column|row|history column|global temporary|local temporary table <name>(",
                    "pattern": /\bcreate\s+(column|row|history\s+column|local\s+temporary|glocal\s+temporary)?\s+table\b\s+[\W|\w]+\s*\(\s*[\w|\W]*$/igm,
                    "subcontextdelimeter": /[\,\(\)]/ig,
                    "subcontexts": [{
                        "name": "define_datatype_in_create_table(",
                        "description": "<name> ",
                        "pattern": /\s*[\w|\W]+\s+[\w|\W]*$/igm
                    }]
                },

                // CREATE TYPE <type_name> AS TABLE (<column_definition>[{,<column_definition>}...])
                // CREATE TYPE tt_publishers AS TABLE ( publisher INTEGER, name VARCHAR(50), price DECIMAL, cnt INTEGER);
                {
                    "name": "create_type_as_table_(",
                    "description": "create_type_as_table_(",
                    "pattern": /\bcreate\s+type\s+[\w|\W]*\s+as\s+table\s*\(\s*[\w|\W]*$/igm,
                    "subcontextdelimeter": /[\,\(\)]/ig,
                    "subcontexts": [{
                        "name": "define_datatype_in_create_type_as_table_(",
                        "description": "<name> ",
                        "pattern": /\s*[\w|\W]+\s+[\w|\W]*$/igm
                    }]
                },

                // CREATE [PUBLIC] SYNONYM <synonym_name> FOR <object_name>
                // CREATE TABLE A (A INT PRIMARY KEY, B INT);
                // CREATE SYNONYM a_synonym FOR A;
                {
                    "name": "create_[public]_synonym_for",
                    "description": "create_[public]_synonym_for",
                    "pattern": /\bcreate\s+(public\s+)?synonym\s+[\w|\W]+\s+for\b\s+[\w|\W]*$/igm
                },

                // CREATE VIEW <view_name> [(<column_name_list>)] AS <subquery>
                // CREATE TABLE A (A INT PRIMARY KEY, B INT);
                // CREATE VIEW v AS SELECT * FROM A;

                // CREATE TRIGGER <trigger_name> <trigger_action_time> <trigger_event_list> ON <subject_table_name> [REFERENCING <transition_list>]
                // CREATE TABLE TARGET ( A INT);
                // CREATE TRIGGER TEST_TRIGGER AFTER INSERT ON TARGET FOR EACH ROW
                {
                    "name": "create_trigger_on",
                    "description": "create_trigger_on",
                    "pattern": /\bcreate\s+(\w*\s+)?trigger\s+[\w|\W]+\s+on\b\s+[\w|\W]*$/igm
                },
                
                // PROCEDURE "SQLSCRIPTDOCUMENT"."playground.dat.hdbprocedure::array_unnest_simple" (out y integer)
                //   LANGUAGE SQLSCRIPT
                //   SQL SECURITY INVOKER
                //   DEFAULT SCHEMA <default_schema_name>
                //   READS SQL DATA AS
                //     z INTEGER := 3;
                //     x INTEGER := 5;
                // BEGIN
                //   ...
                {
                    "name": "create_procedure_()_as_begin",
                    "description": "create_procedure_()_as_begin",
                    "pattern": /\bcreate\s+(\w*\s+)?procedure\b\s+[\w|\W]+\s*\(\s*[\w|\W]*\)[\w|\W]*\s+(\bdefault schema\b\s+)?[\w|\W]*\s+\bas\b\s+[\w|\W]*\bbegin\b\s+[\w|\W]*$/igm
                },

                // PROCEDURE "SQLSCRIPTDOCUMENT"."playground.dat.hdbprocedure::array_unnest_simple" (out y integer)
                //   LANGUAGE SQLSCRIPT
                //   SQL SECURITY INVOKER
                //   DEFAULT SCHEMA <default_schema_name>
                //   READS SQL DATA AS
                //     z INTEGER := 3;
                //     x INTEGER := 5;
                //     ...
                {
                    "name": "create_procedure_()_as",
                    "description": "create_procedure_()_as",
                    "pattern": /\bcreate\s+(\w*\s+)?procedure\b\s+[\w|\W]+\s*\(\s*[\w|\W]*\)[\w|\W]*\s+(\bdefault schema\b\s+)?[\w|\W]*\s+\bas\b\s+[\w|\W]*$/igm,
                    "subcontextdelimeter": /\bas\b|;/ig,
                    "subcontexts": [{
                        "name": "define_datatype_in_create_procedure_()_as",
                        "description": "<name> ",
                        "pattern": /\s*[\w|\W]+\s+[\w|\W]*$/igm
                    }]
                },
                
                // PROCEDURE "SQLSCRIPTDOCUMENT"."playground.dat.hdbprocedure::array_unnest_simple" (out y integer)
                //   LANGUAGE SQLSCRIPT
                //   SQL SECURITY INVOKER
                //   DEFAULT SCHEMA <default_schema_name>
                {
                    "name": "create_procedure_()_default_schema",
                    "description": "create_procedure_()_default_schema",
                    "pattern": /\bcreate\s+(\w*\s+)?procedure\b\s+[\w|\W]+\s*\(\s*[\w|\W]*\)[\w|\W]*\s+\bdefault schema\b\s+[\w|\W]*$/igm
                },

                // CREATE PROCEDURE <proc_name> [(<parameter_clause>)] [LANGUAGE <lang>] [SQL SECURITY <mode>] [DEFAULT SCHEMA <default_schema_name>] [READS SQL DATA [WITH RESULT VIEW <view_name>]] AS
                // CREATE PROCEDURE orchestrationProc LANGUAGE SQLSCRIPT AS
                // CREATE PROCEDURE ProcWithResultView(IN id INT, OUT o1 CUSTOMER) LANGUAGE SQLSCRIPT READS SQL DATA WITH RESULT VIEW ProcView AS
                {
                    "name": "create_procedure_(",
                    "description": "create procedure <name>(",
                    "pattern": /\bcreate\s+(\w*\s+)?procedure\b\s+[\w|\W]+\s*\(\s*[\w|\W]*$/igm,
                    // create procedure test (in d varchar, inout d varchar, out dat VARCHAR, out va VARCHAR, in d fdfd, in d varchar
                    "subcontextdelimeter": /[\,\(\)]/ig,
                    "subcontexts": [{
                        "name": "define_datatype_in_create_procedure_(",
                        "description": "in <name> ",
                        "pattern": /\s*\bin\b\s+[\w|\W]+\s+[\w|\W]*$/igm
                    }, {
                        "name": "define_datatype_in_create_procedure_(",
                        "description": "out <name> ",
                        "pattern": /\s*\bout\b\s+[\w|\W]+\s+[\w|\W]*$/igm
                    }, {
                        "name": "define_datatype_in_create_procedure_(",
                        "description": "inout <name> ",
                        "pattern": /\s*\binout\b\s+[\w|\W]+\s+[\w|\W]*$/igm
                    }]
                },


                // CREATE FUNCTION <func_name> [(<parameter_clause>)] RETURNS <return_type> [LANGUAGE <lang>] [SQL SECURITY <mode>] AS <local_scalar_variables> BEGIN <function_code> END
                // CREATE FUNCTION scale (val INT) RETURNS TABLE (a INT, b INT) LANGUAGE SQLSCRIPT AS 
                // CREATE FUNCTION func_add_mul(x Double, y Double) RETURNS result_add Double, result_mul Double LANGUAGE SQLSCRIPT READS SQL DATA AS
                {
                    "name": "create_function_()_returns_table_(",
                    "description": "create_function_()_returns_table_(",
                    "pattern": /\bcreate\s+(\w*\s+)?function\b\s+[\w|\W]+\s*\([\w|\W]*\)\s+\breturns\b\s+\btable\b\s*\([\w|\W]*$/igm,
                    "subcontextdelimeter": /[\,\(\)]/ig,
                    "subcontexts": [{
                        "name": "define_datatype_in_create_function_()_returns_table_(",
                        "description": "<name> ",
                        "pattern": /\s*[\w|\W]+\s+[\w|\W]*$/igm
                    }]
                },

                {
                    "name": "create_function_()_returns_table",
                    "description": "create_function_()_returns_table",
                    "pattern": /\bcreate\s+(\w*\s+)?function\b\s+[\w|\W]+\s*\([\w|\W]*\)\s+\breturns\s+table\b\s*[\w|\W]*$/igm
                },

                {
                    "name": "create_function_()_returns_",
                    "description": "create_function_()_returns_",
                    "pattern": /\bcreate\s+(\w*\s+)?function\b\s+[\w|\W]+\s*\([\w|\W]*\)\s+\breturns\b\s+[\w|\W]*$/igm,
                    "subcontextdelimeter": /[\,\(\)]/ig,
                    "subcontexts": [{
                        "name": "define_datatype_in_create_function_()_returns_",
                        "description": "<name> ",
                        "pattern": /\s*[\w|\W]+\s+[\w|\W]*$/igm
                    }]
                },

                {
                    "name": "create_function_()",
                    "description": "create function <name>(",
                    "pattern": /\bcreate\s+(\w*\s+)?function\b\s+[\w|\W]+\s*\(\s*[\w|\W]*\)\s*[\w|\W]*$/igm
                },

                {
                    "name": "create_function_(",
                    "description": "create function <name>(",
                    "pattern": /\bcreate\s+(\w*\s+)?function\b\s+[\w|\W]+\s*\(\s*[\w|\W]*$/igm,
                    "subcontextdelimeter": /[\,\(\)]/ig,
                    "subcontexts": [{
                        "name": "define_datatype_in_create_function_(in",
                        "description": "in <name> ",
                        "pattern": /\s*\bin\b\s+[\w|\W]+\s+[\w|\W]*$/igm
                    }, {
                        "name": "none",
                        "description": "in ",
                        "pattern": /\s*\bin\b\s+[\w|\W]*$/igm
                    }, {
                        "name": "define_datatype_in_create_function_(",
                        "description": "<name> ",
                        "pattern": /\s*[\w|\W]+\s+[\w|\W]*$/igm
                    }]
                },

                // CREATE CREDENTIAL FOR [USER <user_name>] COMPONENT <component_id> PURPOSE <purpose_def> TYPE <type_def> USING <using_param>
                // CREATE CREDENTIAL FOR COMPONENT 'INTERNAL_APP' PURPOSE 'COMPANY_MASTER_MASCHINE' TYPE 'PASSWORD' USING 'PASSWORD_9876';
                {
                    "name": "create_credential_for_user",
                    "description": "create_credential_for_user",
                    "pattern": /\bcreate\s+credential\s+for\s+user\b\s+[\w|\W]*$/igm
                }
            ]
        },

        /*** PROCEDURE in hdbprocedure extension file ***/
        "procedure": {
            "contexts": [
                
                // PROCEDURE "SQLSCRIPTDOCUMENT"."playground.dat.hdbprocedure::array_unnest_simple" (out y integer)
                //   LANGUAGE SQLSCRIPT
                //   SQL SECURITY INVOKER
                //   DEFAULT SCHEMA <default_schema_name>
                //   READS SQL DATA AS
                //     z INTEGER := 3;
                //     x INTEGER := 5;
                // BEGIN
                //   ...
                {
                    "name": "create_procedure_()_as_begin",
                    "description": "create_procedure_()_as_begin",
                    "pattern": /(\bcreate\s+)?(\w*\s+)?procedure\b\s+[\w|\W]+\s*\(\s*[\w|\W]*\)[\w|\W]*\s+(\bdefault schema\b\s+)?[\w|\W]*\s+\bas\b\s+[\w|\W]*\bbegin\b\s+[\w|\W]*$/igm
                },

                // PROCEDURE "SQLSCRIPTDOCUMENT"."playground.dat.hdbprocedure::array_unnest_simple" (out y integer)
                //   LANGUAGE SQLSCRIPT
                //   SQL SECURITY INVOKER
                //   DEFAULT SCHEMA <default_schema_name>
                //   READS SQL DATA AS
                //     z INTEGER := 3;
                //     x INTEGER := 5;
                {
                    "name": "create_procedure_()_as",
                    "description": "create_procedure_()_as",
                    "pattern": /(\bcreate\s+)?(\w*\s+)?procedure\b\s+[\w|\W]+\s*\(\s*[\w|\W]*\)[\w|\W]*\s+(\bdefault schema\b\s+)?[\w|\W]*\s+\bas\b\s+[\w|\W]*$/igm,
                    "subcontextdelimeter": /\bas\b|;/ig,
                    "subcontexts": [{
                        "name": "define_datatype_in_create_procedure_()_as",
                        "description": "<name> ",
                        "pattern": /\s*[\w|\W]+\s+[\w|\W]*$/igm
                    }]
                },
                
                // PROCEDURE "SQLSCRIPTDOCUMENT"."playground.dat.hdbprocedure::array_unnest_simple" (out y integer)
                //   LANGUAGE SQLSCRIPT
                //   SQL SECURITY INVOKER
                //   DEFAULT SCHEMA <default_schema_name>
                {
                    "name": "create_procedure_()_default_schema",
                    "description": "create_procedure_()_default_schema",
                    "pattern": /(\bcreate\s+)?(\w*\s+)?\bprocedure\b\s+[\w|\W]+\s*\(\s*[\w|\W]*\)[\w|\W]*\s+\bdefault schema\b\s+[\w|\W]*$/igm
                },


                // PROCEDURE "SQLSCRIPTDOCUMENT"."playground.dat.hdbprocedure::array_unnest_simple" (out y integer
                {
                    "name": "create_procedure_(",
                    "description": "create procedure <name>(",
                    "pattern": /(\bcreate\s+)?(\w*\s+)?\bprocedure\b\s+[\w|\W]+\s*\(\s*[\w|\W]*$/igm,
                    // create procedure test (in d varchar, inout d varchar, out dat VARCHAR, out va VARCHAR, in d fdfd, in d varchar
                    "subcontextdelimeter": /[\,\(\)]/ig,
                    "subcontexts": [{
                        "name": "define_datatype_in_create_procedure_(",
                        "description": "in <name> ",
                        "pattern": /\s*\bin\b\s+[\w|\W]+\s+[\w|\W]*$/igm
                    }, {
                        "name": "define_datatype_in_create_procedure_(",
                        "description": "out <name> ",
                        "pattern": /\s*\bout\b\s+[\w|\W]+\s+[\w|\W]*$/igm
                    }, {
                        "name": "define_datatype_in_create_procedure_(",
                        "description": "inout <name> ",
                        "pattern": /\s*\binout\b\s+[\w|\W]+\s+[\w|\W]*$/igm
                    }]
                }
            ]
        },

        /*** Session Management Statements ***/
        // CONNECT {<username> PASSWORD <password>} | {WITH SAML ASSERTION <xml>}
        "connect": {
            "contexts": [{
                "name": "connect",
                "description": "connect",
                "pattern": /\bconnect\b\s+[\w|\W]*$/igm
            }]
        },

        /*** SET context collection ***/
        // SET SCHEMA <schema_name>
        "set": {
            "contexts": [{
                "name": "set_schema",
                "description": "set_schema",
                "pattern": /\bset\s+schema\b\s+[\w|\W]*$/igm
            }]
        },

        /*** LOCK context collection ***/
        /* Transaction Management Statements */
        // LOCK TABLE <table_name> IN EXCLUSIVE MODE [NOWAIT]
        "lock": {
            "contexts": [{
                "name": "lock_table_space",
                "description": "lock_table_space",
                "pattern": /\block\s+table\b\s+[\w|\W]+\s+$/igm
            }, {
                "name": "lock_table",
                "description": "lock_table",
                "pattern": /\block\s+table\b\s+[\w|\W]*$/igm
            }]
        },

        /*** GRANT context collection ***/
        // GRANT <system_privilege>[{, <system_privilege>}...] TO <grantee> [WITH ADMIN OPTION] 
        // GRANT INIFILE ADMIN, TRACE ADMIN TO worker WITH ADMIN OPTION;

        // GRANT <source_privilege>[{, <source_privilege>}...] ON REMOTE SOURCE <source_name> TO <grantee> [WITH GRANT OPTION] 
        // GRANT <schema_privilege>[{, <schema_privilege>}...] ON SCHEMA <schema_name> TO <grantee> [WITH GRANT OPTION] 
        // GRANT SELECT ON SCHEMA my_schema TO role_for_work_on_my_schema;

        // GRANT <object_privilege>[{, <object_privilege>}...] ON <object_name> TO <grantee> [WITH GRANT OPTION] 
        // GRANT INSERT ON my_schema.work_done TO role_for_work_on_my_schema;

        // GRANT <role_name>[{, <role_name>}...] TO <grantee> [WITH ADMIN OPTION] 
        // GRANT STRUCTURED PRIVILEGE <privilege_name> TO <grantee>
        "grant": {
            "contexts": [{
                "name": "grant_on_schema_to",
                "description": "grant_on_schema_to",
                "pattern": /\bgrant\s+[\w|\W]*\s+on\s+schema\s+[\w|\W]*\s+to\b\s+[\w|\W]*$/igm
            }, {
                "name": "grant_on_remote_source_to",
                "description": "grant_on_remote_source_to",
                "pattern": /\bgrant\s+[\w|\W]*\s+on\s+remote\s+source\s+[\w|\W]*\s+to\b\s+[\w|\W]*$/igm
            }, {
                "name": "grant_on_schema",
                "description": "grant_on_schema",
                "pattern": /\bgrant\s+[\w|\W]*\s+on\s+\bschema\b\s+[\w|\W]*$/igm
            }, {
                "name": "grant_on_to",
                "description": "grant_on_to",
                "pattern": /\bgrant\s+[\w|\W]*\s+on\s+[\w|\W]*\s+to\b\s+[\w|\W]*$/igm
            }, {
                "name": "grant_on",
                "description": "grant_on",
                "pattern": /\bgrant\s+[\w|\W]*\s+on\b\s+[\w|\W]*$/igm
            }, {
                "name": "grant_to",
                "description": "grant_to",
                "pattern": /\bgrant\s+[\w|\W]*\s+to\b\s+[\w|\W]*$/igm
            }, {
                "name": "grant",
                "description": "grant",
                "pattern": /\bgrant\b\s+[\w|\W]*$/igm,
                "subcontextdelimeter": /\bgrant\b|\,/igm,
                "subcontexts": [{
                    "name": "define_object_in_grant",
                    "description": "define_object_in_grant",
                    "pattern": /[\w|\W]*$/igm
                }]
            }]
        },

        /*** REVOKE context collection ***/
        // REVOKE <system_privilege>,... FROM <grantee> 
        // REVOKE <source_privilege>,... ON REMOTE SOURCE <source_name> FROM <grantee> 
        // REVOKE <schema_privilege>,... ON SCHEMA <schema_name> FROM <grantee> 
        // REVOKE <object_privilege>,... ON <object_name> FROM <grantee> 
        // REVOKE <role_name>,... FROM <grantee> 
        // REVOKE STRUCTURED PRIVILEGE <privilege_name> FROM <grantee>
        "revoke": {
            "contexts": [{
                "name": "revoke_on_schema_from",
                "description": "revoke_on_schema_from",
                "pattern": /\brevoke\s+[\w|\W]*\s+on\s+schema\s+[\w|\W]*\s+from\b\s+[\w|\W]*$/igm
            }, {
                "name": "revoke_on_remote_source_from",
                "description": "revoke_on_remote_source_from",
                "pattern": /\brevoke\s+[\w|\W]*\s+on\s+remote\s+source\s+[\w|\W]*\s+from\b\s+[\w|\W]*$/igm
            }, {
                "name": "revoke_on_from",
                "description": "revoke_on_from",
                "pattern": /\brevoke\s+[\w|\W]*\s+on\s+[\w|\W]*\s+from\b\s+[\w|\W]*$/igm
            }, {
                "name": "revoke_on_schema",
                "description": "revoke_on_schema",
                "pattern": /\brevoke\s+[\w|\W]*\s+on\s+schema\b\s+[\w|\W]*$/igm
            }, {
                "name": "revoke_on",
                "description": "revoke_on",
                "pattern": /\brevoke\s+[\w|\W]*\s+on\b\s+[\w|\W]*$/igm
            }, {
                "name": "revoke_from",
                "description": "revoke_from",
                "pattern": /\brevoke\s+[\w|\W]*\s+from\b\s+[\w|\W]*$/igm
            }, {
                "name": "revoke",
                "description": "revoke",
                "pattern": /\brevoke\b\s+[\w|\W]*$/igm,
                "subcontextdelimeter": /\brevoke\b|\,/igm,
                "subcontexts": [{
                    "name": "define_object_in_revoke",
                    "description": "define_object_in_revoke",
                    "pattern": /[\w|\W]*$/igm
                }]
            }]
        },

        /*** CURSOR context collection ***/
        // CURSOR c_cursor1 (v_isbn VARCHAR(20)) FOR SELECT isbn, title, price, crcy FROM books WHERE isbn = :v_isbn ORDER BY isbn;

        // <array_name> <type> ARRAY [:= <array_constructor>]

        /*** DECLARE context collection ***/
        // DECLARE EXIT HANDLER FOR SQLEXCEPTION
        // DECLARE CURSOR C FOR SELECT * FROM mytab1;
        // DECLARE <condition name> CONDITION [ FOR <sqlstate value> ]
        "declare": {
            "contexts": [{
                "name": "define_datatype",
                "description": "declare <name> ",
                "pattern": /\bdeclare\b\s+[\w|\W]+\s+[\w|\W]*$/igm
            }]
        },

        /*** CAST context collection ***/
        "cast": {
            "contexts": [{
                "name": "define_datatype",
                "description": "cast(<name> as ",
                "pattern": /\bcast\b\s*\([\w|\W]+\s+\bas\b\s+[\w|\W]*$/igm
            }, {
                "name": "define_datatype",
                "description": "cast(<name> as ",
                "pattern": /\bcast\s*\(as\b\s+[\w|\W]*$/igm
            }]
        }
    };

    var SCENARIO_IN_POST = {
        /*** FROM context collection ***/
        // FROM <schemaname>.<tablename> 
        "from": {
            "contexts": [{
                "name": "from",
                "description": "from",
                "pattern": /^\s+\bfrom\b\s*[\w|\W]*/ig
            }]
        },

        // xDECLARE amount INTEGER ARRAY := ARRAY(10, 20);
        // xDECLARE fruit VARCHAR(10) ARRAY := ARRAY('Orange', 'Kiwi', 'Grape');
        "declare": {
            "contexts": [{
                "name": "declare",
                "description": "declare",
                "pattern": /^\s*\bdeclare\b/ig
            }]
        },

        /*** ARRAY context collection ***/
        // <array_name> <type> ARRAY [:= <array_constructor>]
        // DECLARE array_int xINTEGER ARRAY;
        // DECLARE array_int xINTEGER ARRAY:=ARRAY(1, 2, 3);
        // DECLARE amount xINTEGER ARRAY := ARRAY(10, 20);
        // DECLARE fruit xVARCHAR(10) ARRAY := ARRAY('Orange', 'Kiwi', 'Grape');
        "array": {
            "contexts": [{
                "name": "define_datatype_for_array",
                "description": "array",
                // "pattern": /\s+[\w|\W]*\s*\barray\b\s*[\w|\W]*/ig
                "pattern": /^\s+\barray\b/ig
            }]
        },

        /*** ARRAY[] context collection ***/
        // DECLARE ARRAY(<value_expression> [{, <value_expression>}...])
        // DECLARE array_id xINTEGER ARRAY[] := ARRAY(1, 2, 3);
        "array[]": {
            "contexts": [{
                "name": "define_datatype_for_array[]",
                "description": "array[]",
                // "pattern": /\s+[\w|\W]*\s*\barray\b\s*[\w|\W]*/ig
                "pattern": /^\s+\barray\b\s*\[{1}\s*\]{1}/ig
            }]
        },

        "date|time|seconddate|timestamp": {
            "contexts": [{
                "name": "datetime",
                "description": "datetime",
                "pattern": /^\s*\bdate|time|seconddate|timestamp\b/ig
            }]
        },

        "tinyint|smallint|integer|bigint|smalldecimal|decimal|real|double|int": {
            "contexts": [{
                "name": "numeric",
                "description": "numeric",
                "pattern": /^\s*\btinyint|smallint|integer|bigint|smalldecimal|decimal|real|double|int\b/ig
            }]
        },

        "varchar|nvarchar|alphanum|shorttext|char|string": {
            "contexts": [{
                "name": "character_string",
                "description": "character_string",
                "pattern": /^\s*\bvarchar|nvarchar|alphanum|shorttext|char|string\b/ig
            }]
        },

        "varbinary|binary": {
            "contexts": [{
                "name": "binary",
                "description": "binary",
                "pattern": /^\s*\bvarbinary|binary\b/ig
            }]
        },

        "blob|clob|nclob|text": {
            "contexts": [{
                "name": "large_object",
                "description": "large_object",
                "pattern": /^\s*\bblob|clob|nclob|text\b/ig
            }]
        }
    };
    
    var oNewPostScenario = {};
    for (var sName in SCENARIO_IN_POST) {
        if (SCENARIO_IN_POST.hasOwnProperty(sName)) {
            var sNameContext = null;
            var oScenario = SCENARIO_IN_POST[sName];
            if (oScenario) {
                var aNameParts = sName.split("|");
                if (aNameParts.length > 1) {
                    for (var i = 0; i < aNameParts.length; i++) {
                        sNameContext = aNameParts[i];
                        oNewPostScenario[sNameContext] = oScenario;
                    }
                } else {
                    sNameContext = aNameParts[0];
                    oNewPostScenario[sNameContext] = oScenario;
                }
            }
        }
    }


    return {
        SCENARIO_IN_PRE: SCENARIO_IN_PRE,
        SCENARIO_IN_POST: oNewPostScenario
    };
});