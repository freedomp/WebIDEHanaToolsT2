/*jshint unused:false*/
/*global test, equal, assert */
RequirePaths.setRequireJsConfigForHdbddConverter(3);
define(
    [
        "converttohdbcds/converttohdbcds"
    ], //dependencies
    function (
        converttohdbcds
        ) {

        var pathToPAD = RequirePaths._hanaddlPath;

        test('Steffen\'s sample', function(assert) {

            var source = "" +
                "namespace Pack;\n"+
                "\n"+
                "@Schema: 'TestSchema'\n"+
                "context MyContext {\n"+
                "    @Catalog : { tableType : #ROW,\n"+
                "                 index : [ { name : 'myIndex', order : #ASC,\n"+
                "                             elementNames : ['a', 'b'] },\n"+
                "                           { name : 'yourIndex', unique : false, order : #DESC,\n"+
                "                             elementNames : ['c', 'b'] } ]\n"+
                "               }\n"+
                "    entity E {\n"+
                "        key id : Integer;\n"+
                "        a : Integer;\n"+
                "        b : Integer;\n"+
                "        c : Integer;\n"+
                "    };\n"+
                "};\n"+
                "";
            var expected = "" +
                "namespace Pack;\n"+
                "\n"+
                "context MyContext {\n"+
                "    entity E {\n"+
                "        key id : Integer;\n"+
                "        a : Integer;\n"+
                "        b : Integer;\n"+
                "        c : Integer;\n"+
                "    } technical configuration {\n"+
                "        row store;\n"+
                "\n"+
                "        unique index myIndex on (a, b) asc;\n"+
                "        index yourIndex on (c, b) desc;\n"+
                "    };\n"+
                "};\n";

            var converter = new converttohdbcds.Converter(pathToPAD);

            var result = converter.convert(source);

            equal(result.hdbcdscontent, expected);
        });

        test('Steffen\'s sample with comments', function(assert) {

            var source = "" +
                "namespace Pack;\n" +
                "\n" +
                "//Repo V1 needs a Schema\n" +
                "@Schema: 'TestSchema'\n" +
                "context MyContext {\n" +
                "    @Catalog : { tableType : #ROW, ///< Use Row store\n" +
                "                 index : [ // usage 1 index\n" +
                "                           { name : 'myIndex', order : #ASC,\n" +
                "                             elementNames : ['a', 'b'] },\n" +
                "                           // usage 2 index\n" +
                "                           { name : 'yourIndex', unique : false, order : #DESC,\n" +
                "                             elementNames : ['c', 'b'] } ]\n" +
                "               }\n" +
                "    entity E {\n" +
                "        key id : Integer;\n" +
                "        a : Integer;\n" +
                "        b : Integer;\n" +
                "        c : Integer;\n" +
                "    };\n" +
                "};\n" +
                "";

            var expected = "" +
                "namespace Pack;\n" +
                "\n" +
                "//Repo V1 needs a Schema\n" +
                "context MyContext {\n" +
                "    entity E {\n" +
                "        key id : Integer;\n" +
                "        a : Integer;\n" +
                "        b : Integer;\n" +
                "        c : Integer;\n" +
                "    } technical configuration {\n"+
                "        row store;\n"+
                "\n" +
                "        unique index myIndex on (a, b) asc;\n" +
                "        index yourIndex on (c, b) desc;\n" +
                "    };\n" +
                "};\n";

            var converter = new converttohdbcds.Converter(pathToPAD);

            var result = converter.convert(source);

            equal(result.hdbcdscontent, expected);
        });


        //=================================================================
        test('Convert weird names', function(assert) {

            var source = "" +
                "namespace Pack;\n" +
                "\n" +
                "@Schema: 'TestSchema'\n" +
                "context MyContext {\n" +
                "    @Catalog : { tableType : #ROW,\n" +
                "                 index : [ { name : 'Steffens''s', order : #ASC,\n" +
                "                             elementNames : ['UI5/a', 'b''b'] },\n" +
                "                           { name : 'Gilles''', unique : false, order : #DESC,\n" +
                "                             elementNames : ['c\"c', 'b''b'] } ]\n" +
                "               }\n" +
                "    entity E {\n" +
                "        key id : Integer;\n" +
                "        \"UI5/a\" : Integer;\n" +
                "        \"b'b\"  : Integer;\n" +
                "        \"c\"\"c\" : Integer;\n" +
                "    };\n" +
                "};\n" +
                "";

            var expected = "" +
                "namespace Pack;\n" +
                "\n" +
                "context MyContext {\n" +
                "    entity E {\n" +
                "        key id : Integer;\n" +
                "        \"UI5/a\" : Integer;\n" +
                "        \"b'b\"  : Integer;\n" +
                "        \"c\"\"c\" : Integer;\n" +
                "    } technical configuration {\n"+
                "        row store;\n"+
                "\n" +
                "        unique index \"Steffens's\" on (\"UI5/a\", \"b'b\") asc;\n" +
                "        index \"Gilles'\" on (\"c\"\"c\", \"b'b\") desc;\n" +
                "    };\n" +
                "};\n";

            var converter = new converttohdbcds.Converter(pathToPAD);

            var result = converter.convert(source);

            equal(result.hdbcdscontent, expected);
        });

        test('Convert weird names 2', function() {

            var source = "" +
                "namespace Pack;\n" +
                "\n" +
                "@Schema: 'TestSchema'\n" +
                "context MyContext {\n" +
                "    @Catalog : { tableType : #ROW,\n" +
                "                 index : [ { name : 'Steffens''s', order : #ASC,\n" +
                "                             elementNames : ['UI5/a', 'b''b'] },\n" +
                "                           { name : 'Gilles''', unique : false, order : #DESC,\n" +
                "                             elementNames : ['c\"c', 'b''b'] } ],\n" +
                "                 foo: bar\n"+
                "               }\n" +
                "    entity E {\n" +
                "        key id : Integer;\n" +
                "        \"UI5/a\" : Integer;\n" +
                "        \"b'b\"  : Integer;\n" +
                "        \"c\"\"c\" : Integer;\n" +
                "    };\n" +
                "};\n" +
                "";

            var expected = "" +
                "namespace Pack;\n" +
                "\n" +
                "context MyContext {\n" +
                "    @Catalog : { \n" +
                "                 foo: bar\n"+
                "               }\n" +
                "    entity E {\n" +
                "        key id : Integer;\n" +
                "        \"UI5/a\" : Integer;\n" +
                "        \"b'b\"  : Integer;\n" +
                "        \"c\"\"c\" : Integer;\n" +
                "    } technical configuration {\n"+
                "        row store;\n"+
                "\n" +
                "        unique index \"Steffens's\" on (\"UI5/a\", \"b'b\") asc;\n" +
                "        index \"Gilles'\" on (\"c\"\"c\", \"b'b\") desc;\n" +
                "    };\n" +
                "};\n";

            var converter = new converttohdbcds.Converter(pathToPAD);

            var result = converter.convert(source);

            equal(result.hdbcdscontent, expected);
        });


        //=================================================================
        test('Convert short catalog', function(assert) {

            var source = "" +
                "namespace Pack;\n" +
                "\n" +
                "@Schema: 'TestSchema'\n" +
                "context MyContext {\n" +
                "    @Catalog.index :  [ { name : 'myIndex', order : #ASC,\n" +
                "                          elementNames : ['a', 'b'] },\n" +
                "                        { name : 'yourIndex', unique : false, order : #DESC,\n" +
                "                           elementNames : ['c', 'b'] }\n" +
                "                      ]\n" +
                "    entity E {\n" +
                "        key id : Integer;\n" +
                "        a : Integer;\n" +
                "        b : Integer;\n" +
                "        c : Integer;\n" +
                "    };\n" +
                "};\n" +
                "";

            var expected = "" +
                "namespace Pack;\n" +
                "\n" +
                "context MyContext {\n" +
                "    entity E {\n" +
                "        key id : Integer;\n" +
                "        a : Integer;\n" +
                "        b : Integer;\n" +
                "        c : Integer;\n" +
                "    } technical configuration {\n"+
                "        unique index myIndex on (a, b) asc;\n" +
                "        index yourIndex on (c, b) desc;\n" +
                "    };\n" +
                "};\n";

            var converter = new converttohdbcds.Converter(pathToPAD);

            var result = converter.convert(source);

            equal(result.hdbcdscontent, expected);
        });

        //=================================================================
        test('Catalog without table type', function(assert) {

            var source ="" +
                "namespace Pack;\n" +
                "\n" +
                "@Schema: 'TestSchema'\n" +
                "context MyContext {\n" +
                "    @Catalog : { \n" +
                "                 index : [ { name : 'myIndex', order : #ASC,\n" +
                "                             elementNames : ['a', 'b'] },\n" +
                "                           { name : 'yourIndex', unique : false, order : #DESC,\n" +
                "                             elementNames : ['c', 'b'] } ]\n" +
                "               }\n" +
                "    entity E {\n" +
                "        key id : Integer;\n" +
                "        a : Integer;\n" +
                "        b : Integer;\n" +
                "        c : Integer;\n" +
                "    };\n" +
                "};\n" +
                "";

            var expected = "" +
                "namespace Pack;\n" +
                "\n" +
                "context MyContext {\n" +
                "    entity E {\n" +
                "        key id : Integer;\n" +
                "        a : Integer;\n" +
                "        b : Integer;\n" +
                "        c : Integer;\n" +
                "    } technical configuration {\n"+
                "        unique index myIndex on (a, b) asc;\n" +
                "        index yourIndex on (c, b) desc;\n" +
                "    };\n" +
                "};\n";

            var converter = new converttohdbcds.Converter(pathToPAD);

            var result = converter.convert(source);

            equal(result.hdbcdscontent, expected);
        });

        //=================================================================
        test('Catalog table types', function(assert) {
            // Test various table types
            // Test nokey
            var source ="" +
                "namespace Pack;\n" +
                "\n" +
                "@Schema: 'TestSchema'\n" +
                "context MyContext {\n" +
                "    @nokey\n" +
                "    @Catalog.tableType : #ROW\n" +
                "    entity rowTable {\n" +
                "        key id : Integer;\n" +
                "        a : Integer;\n" +
                "        b : Integer;\n" +
                "        c : Integer;\n" +
                "    };\n" +
                "\n" +
                "    @Catalog.tableType : #COLUMN\n" +
                "    @nokey\n" +
                "    entity columnTable {\n" +
                "        key id : Integer;\n" +
                "        a : Integer;\n" +
                "        b : Integer;\n" +
                "        c : Integer;\n" +
                "    };\n" +
                "\n" +
                "    @Catalog: { tableType : #GLOBAL_TEMPORARY }\n" +
                "    entity globalTemporaryTable {\n" +
                "        key id : Integer;\n" +
                "        a : Integer;\n" +
                "        b : Integer;\n" +
                "        c : Integer;\n" +
                "    };\n" +
                "\n" +
                "    @Catalog : { tableType : #GLOBAL_TEMPORARY_COLUMN }\n" +
                "    entity globalTemporaryColumnTable {\n" +
                "        key id : Integer;\n" +
                "        a : Integer;\n" +
                "        b : Integer;\n" +
                "        c : Integer;\n" +
                "    };\n" +
                "\n" +
                "};\n" +
                "";

            var expected = "" +
                "namespace Pack;\n" +
                "\n" +
                "context MyContext {\n" +
                "\n" +
                "    entity rowTable {\n" +
                "        key id : Integer;\n" +
                "        a : Integer;\n" +
                "        b : Integer;\n" +
                "        c : Integer;\n" +
                "    } technical configuration {\n" +
                "        row store;\n" +
                "    };\n" +
                "\n" +
                "\n" +
                "    entity columnTable {\n" +
                "        key id : Integer;\n" +
                "        a : Integer;\n" +
                "        b : Integer;\n" +
                "        c : Integer;\n" +
                "    } technical configuration {\n" +
                "        column store;\n" +
                "    };\n" +
                "\n" +
                "    temporary entity globalTemporaryTable {\n" +
                "        key id : Integer;\n" +
                "        a : Integer;\n" +
                "        b : Integer;\n" +
                "        c : Integer;\n" +
                "    } technical configuration {\n" +
                "        row store;\n" +
                "    };\n" +
                "\n" +
                "    temporary entity globalTemporaryColumnTable {\n" +
                "        key id : Integer;\n" +
                "        a : Integer;\n" +
                "        b : Integer;\n" +
                "        c : Integer;\n" +
                "    } technical configuration {\n" +
                "        column store;\n" +
                "    };\n" +
                "\n" +
                "};\n";

            var converter = new converttohdbcds.Converter(pathToPAD);

            var result = converter.convert(source);

            equal(result.hdbcdscontent, expected);
        });

        //=================================================================
        test('Generate table type', function(assert) {
            // Test various generate table type
            var source ="" +
                "namespace Pack;\n" +
                "\n" +
                "@Schema: 'TestSchema'\n" +
                "context MyContext {\n" +
                "    type simpleTable {\n" +
                "        id : Integer;\n" +
                "        a : Integer;\n" +
                "        b : Integer;\n" +
                "        c : Integer;\n" +
                "    };\n" +
                "\n" +
                "    @GenerateTableType\n" +
                "    type generateTable {\n" +
                "        id : Integer;\n" +
                "        a : Integer;\n" +
                "        b : Integer;\n" +
                "        c : Integer;\n" +
                "    };\n" +
                "\n" +
                "    @GenerateTableType: true\n" +
                "    type generateTableTrue {\n" +
                "        id : Integer;\n" +
                "        a : Integer;\n" +
                "        b : Integer;\n" +
                "        c : Integer;\n" +
                "    };\n" +
                "\n" +
                "    @GenerateTableType: false\n" +
                "    type structuredType {\n" +
                "        id : Integer;\n" +
                "        a : Integer;\n" +
                "        b : Integer;\n" +
                "        c : Integer;\n" +
                "    };\n" +
                "};\n" +
                "";

            var expected = "" +
                "namespace Pack;\n" +
                "\n" +
                "context MyContext {\n" +
                "    table type simpleTable {\n" +
                "        id : Integer;\n" +
                "        a : Integer;\n" +
                "        b : Integer;\n" +
                "        c : Integer;\n" +
                "    };\n" +
                "\n" +
                "    table type generateTable {\n" +
                "        id : Integer;\n" +
                "        a : Integer;\n" +
                "        b : Integer;\n" +
                "        c : Integer;\n" +
                "    };\n" +
                "\n" +
                "    table type generateTableTrue {\n" +
                "        id : Integer;\n" +
                "        a : Integer;\n" +
                "        b : Integer;\n" +
                "        c : Integer;\n" +
                "    };\n" +
                "\n" +
                "    type structuredType {\n" +
                "        id : Integer;\n" +
                "        a : Integer;\n" +
                "        b : Integer;\n" +
                "        c : Integer;\n" +
                "    };\n" +
                "};\n" +
                "";

            var converter = new converttohdbcds.Converter(pathToPAD);

            var result = converter.convert(source);

            equal(result.hdbcdscontent, expected);
        });

        test('Type alias', function(assert) {
            // Test that type aliases are not modified

            var source ="" +
                "namespace Annotations.Usage;\n" +
                "\n" +
                "@Schema: 'TestSchema'\n" +
                "context PredefinedOk\n" +
                "{\n" +
                "\n" +
                "   type MyType : MyOtherType;\n" +
                "\n" +
                "   type myTable\n" +
                "   { f:Integer; a:Integer; }\n" +
                "\n" +
                "};\n" +
                "";

            var expected = "" +
                "namespace Annotations.Usage;\n" +
                "\n" +
                "context PredefinedOk\n" +
                "{\n" +
                "\n" +
                "   type MyType : MyOtherType;\n" +
                "\n" +
                "   table type myTable\n" +
                "   { f:Integer; a:Integer; }\n" +
                "\n" +
                "};\n" +
                "";


            var converter = new converttohdbcds.Converter(pathToPAD);

            var result = converter.convert(source);

            equal(result.hdbcdscontent, expected);
        });


        //=================================================================
        test('View with privilege check', function(assert) {
            // // Test various Views
            var source ="" +
                "namespace Pack;\n" +
                "\n" +
                "@Schema: 'TestSchema'\n" +
                "context MyContext {\n" +
                " entity E1\n" +
                " {\n" +
                "    key id : Integer;\n" +
                "    a : Integer;\n" +
                "    b : Integer;\n" +
                "    c : Integer;\n" +
                "    s { x : Integer;\n" +
                "        y : Integer; };\n" +
                "   key : Integer;\n" +
                " };\n" +
                "\n" +
                " view V1 as select from E1 {\n" +
                "    id,                      // element name\n" +
                "    key,                     // element name\n" +
                "    key a                    // element name + alias\n" +
                " } where id = 1;\n" +
                "\n" +
                " @WithStructuredPrivilegeCheck\n" +
                " view V2 as select from E1 {\n" +
                "    id,                      // element name\n" +
                "    key key                  // element name + alias\n" +
                " } where id = 1;\n" +
                "\n" +
                " @WithStructuredPrivilegeCheck : true\n" +
                " view V3 as select from E1 {\n" +
                "    id,                      // element name\n" +
                "    key key                  // element name + alias\n" +
                " } where id = 1;\n" +
                "\n" +
                " @WithStructuredPrivilegeCheck : false\n" +
                " view V4 as select from E1 {\n" +
                "    id,                      // element name\n" +
                "    key key                  // element name + alias\n" +
                " } where id = 1;\n" +
                "};\n" +
                "";

            var expected = "" +
                "namespace Pack;\n" +
                "\n" +
                "context MyContext {\n" +
                " entity E1\n" +
                " {\n" +
                "    key id : Integer;\n" +
                "    a : Integer;\n" +
                "    b : Integer;\n" +
                "    c : Integer;\n" +
                "    s { x : Integer;\n" +
                "        y : Integer; };\n" +
                "   key : Integer;\n" +
                " };\n" +
                "\n" +
                " view V1 as select from E1 {\n" +
                "    id,                      // element name\n" +
                "    key,                     // element name\n" +
                "    key a                    // element name + alias\n" +
                " } where id = 1;\n" +
                "\n" +
                " view V2 as select from E1 {\n" +
                "    id,                      // element name\n" +
                "    key key                  // element name + alias\n" +
                " } where id = 1 with structured privilege check;\n" +
                "\n" +
                " view V3 as select from E1 {\n" +
                "    id,                      // element name\n" +
                "    key key                  // element name + alias\n" +
                " } where id = 1 with structured privilege check;\n" +
                "\n" +
                " view V4 as select from E1 {\n" +
                "    id,                      // element name\n" +
                "    key key                  // element name + alias\n" +
                " } where id = 1;\n" +
                "};\n" +
                "";

            var converter = new converttohdbcds.Converter(pathToPAD);

            var result = converter.convert(source);

            equal(result.hdbcdscontent, expected);
        });

        //=================================================================
        test('Poor original source format', function(assert) {

            var source = "" +
                "namespace Pack;\n" +
                "\n" +
                "@Schema: 'TestSchema'\n" +
                "context MyContext {\n" +
                "    @Catalog.index :  [ { name : 'myIndex', order : #ASC,\n" +
                "                          elementNames : ['a', 'b'] },\n" +
                "                        { name : 'yourIndex', unique : false, order : #DESC,\n" +
                "                           elementNames : ['c', 'b'] }\n" +
                "                      ]\n" +
                "    entity E {\n" +
                "        key id : Integer;\n" +
                "        a : Integer;\n" +
                "        b : Integer;\n" +
                "        c : Integer;};\n" +
                "};\n" +
                "";

            var expected = "" +
                "namespace Pack;\n" +
                "\n" +
                "context MyContext {\n" +
                "    entity E {\n" +
                "        key id : Integer;\n" +
                "        a : Integer;\n" +
                "        b : Integer;\n" +
                "        c : Integer;} technical configuration {\n" +
                "                    unique index myIndex on (a, b) asc;\n" +
                "                    index yourIndex on (c, b) desc;\n" +
                "                    };\n" +
                "};\n";

            var converter = new converttohdbcds.Converter(pathToPAD);

            var result = converter.convert(source);

            equal(result.hdbcdscontent, expected);
        });


        //=================================================================
        test('Already had technical configuration', function(assert) {

            var source = "" +
                "namespace Pack;\n" +
                "\n" +
                "@Schema: 'TestSchema'\n" +
                "context MyContext {\n" +
                "@Catalog.tableType : #ROW\n" +
                "  entity E {\n" +
                "    key id : Integer;\n" +
                "    a : String(100);\n" +
                "  } technical configuration {\n" +
                "    partition by hash (a) partitions 4;\n" +
                "  };\n" +
                "\n" +
                "};\n" +
                "";

            var expected = "" +
                "namespace Pack;\n" +
                "\n" +
                "context MyContext {\n" +
                "  entity E {\n" +
                "    key id : Integer;\n" +
                "    a : String(100);\n" +
                "  } technical configuration {\n" +
                "    partition by hash (a) partitions 4;\n" +
                "\n" +
                "    row store;\n" +
                "  };\n" +
                "\n" +
                "};\n" +
                "";

            var converter = new converttohdbcds.Converter(pathToPAD);

            var result = converter.convert(source);

            equal(result.hdbcdscontent, expected);
        });

        //=================================================================
        test('NO OP', function(assert) {

            var source = "" +
                "namespace Pack;\n" +
                "context MyContext {\n" +
                "    entity E {\n" +
                "        key id : Integer;\n" +
                "        a : Integer;\n" +
                "        b : Integer;\n" +
                "        c : Integer;\n" +
                "    } technical configuration {"+
                "        unique index myIndex on (a, b) asc;\n" +
                "        index yourIndex on (c, b) desc;\n" +
                "    };\n" +
                "};\n";

            var converter = new converttohdbcds.Converter(pathToPAD);

            var result = converter.convert(source);

            equal(result.hdbcdscontent, source);
        });

        //================================================================
        test('Ha-Jo\'s FTI sample', function() {

            var source = "" +
                "namespace Annotations.Usage;\n" +
                "\n" +
                "@Schema: 'TestSchema'\n" +
                "context PredefinedOk\n" +
                "{\n" +
                "  // there is no source file where the annotation SearchIndex\n" +
                "  //  is defined, it is part of the compiler preload\n" +
                "  entity searchEntity\n" +
                "  {\n" +
                "    key id : Integer;\n" +
                "\n" +
                "    @SearchIndex : { text : { enabled : true,\n" +
                "                              name : 'myTextIndex',\n" +
                "                              storeOriginalContent : false,\n" +
                "                              phraseIndexRatio : 1.7,\n" +
                "                              async : true,\n" +
                "                              textAnalysis : { mode : #SIMPLE,\n" +
                "                                               languageElement : 'a',\n" +
                "                                               languageDetection : ['DE', 'EN'],\n" +
                "                                               mimeTypeElement : 'Gans',\n" +
                "                                               mimeType : 'Jojo',\n" +
                "                                               configurationID : 'Herbert',\n" +
                "                                               tokenSeparators : 'Otto' \n" +
                "                                             }\n" +
                "                            },\n" +
                "                     fuzzy : { enabled : true,\n" +
                "                               mode : #ALPHANUM\n" +
                "                             }\n" +
                "                   }\n" +
                "    elt : String(1000);\n" +
                "  };\n" +
                "\n" +
                "};\n" +
                "";
            var expected = "" +
                "namespace Annotations.Usage;\n" +
                "\n" +
                "context PredefinedOk\n" +
                "{\n" +
                "  // there is no source file where the annotation SearchIndex\n" +
                "  //  is defined, it is part of the compiler preload\n" +
                "  entity searchEntity\n" +
                "  {\n" +
                "    key id : Integer;\n" +
                "\n" +
                "    elt : String(1000);\n" +
                "  } technical configuration {\n" +
                "  FULLTEXT INDEX myTextIndex ON ( elt )\n" +
                "      FUZZY SEARCH INDEX ON\n" +
                "      SEARCH ONLY ON\n" +
                "      PHRASE INDEX RATIO 1.7\n" +
                "      ASYNCHRONOUS\n" +
                "      FAST PREPROCESS OFF TEXT ANALYSIS OFF\n" +
                "      LANGUAGE COLUMN a\n" +
                "      LANGUAGE DETECTION ( 'DE', 'EN' )\n" +
                "      MIME TYPE COLUMN Gans\n" +
                "      MIME TYPE 'Jojo'\n" +
                "      TOKEN SEPARATORS 'Otto'\n" +
                "      // The annotation \"@SearchIndex.textAnalysis.configurationID name\"\n" +
                "      // has been converted to \"CONFIGURATION name\"\n" +
                "      // but this might not be supported by your system\n" +
                "      CONFIGURATION 'Herbert';\n" +
                "  };\n" +
                "\n" +
                "};\n";

            var converter = new converttohdbcds.Converter(pathToPAD);

            var result = converter.convert(source);

            equal(result.hdbcdscontent, expected);
        });

        test('Ha-Jo\'s short FTI sample', function() {

            var source = "" +
                "namespace Annotations.Usage;\n" +
                "\n" +
                "@Schema: 'TestSchema'\n" +
                "context PredefinedOk\n" +
                "{\n" +
                "  // there is no source file where the annotation SearchIndex\n" +
                "  //  is defined, it is part of the compiler preload\n" +
                "  entity searchEntity\n" +
                "  {\n" +
                "    key id : Integer;\n" +
                "\n" +
                "    @SearchIndex.text : { enabled : true }\n" +
                "    elt : String(1000);\n" +
                "  };\n" +
                "\n" +
                "};\n" +
                "";
            var expected = "" +
                "namespace Annotations.Usage;\n" +
                "\n" +
                "context PredefinedOk\n" +
                "{\n" +
                "  // there is no source file where the annotation SearchIndex\n" +
                "  //  is defined, it is part of the compiler preload\n" +
                "  entity searchEntity\n" +
                "  {\n" +
                "    key id : Integer;\n" +
                "\n" +
                "    elt : String(1000);\n" +
                "  } technical configuration {\n" +
                "  FULLTEXT INDEX ftiOnElt ON ( elt )\n" +
                "      SEARCH ONLY OFF\n" +
                "      PHRASE INDEX RATIO 0.0\n" +
                "      ASYNC\n" +
                "      FAST PREPROCESS ON;\n" +
                "  };\n" +
                "\n" +
                "};\n";

            var converter = new converttohdbcds.Converter(pathToPAD);

            var result = converter.convert(source);

            equal(result.hdbcdscontent, expected);
        });

        test('Ha-Jo\'s shorter FTI sample', function() {

            var source = "" +
                "namespace Annotations.Usage;\n" +
                "\n" +
                "@Schema: 'TestSchema'\n" +
                "context PredefinedOk\n" +
                "{\n" +
                "  // there is no source file where the annotation SearchIndex\n" +
                "  //  is defined, it is part of the compiler preload\n" +
                "  entity searchEntity\n" +
                "  {\n" +
                "    key id : Integer;\n" +
                "\n" +
                "    @SearchIndex.text.enabled : true\n" +
                "    elt : String(1000);\n" +
                "  };\n" +
                "\n" +
                "};\n" +
                "";
            var expected = "" +
                "namespace Annotations.Usage;\n" +
                "\n" +
                "context PredefinedOk\n" +
                "{\n" +
                "  // there is no source file where the annotation SearchIndex\n" +
                "  //  is defined, it is part of the compiler preload\n" +
                "  entity searchEntity\n" +
                "  {\n" +
                "    key id : Integer;\n" +
                "\n" +
                "    elt : String(1000);\n" +
                "  } technical configuration {\n" +
                "  FULLTEXT INDEX ftiOnElt ON ( elt )\n" +
                "      SEARCH ONLY OFF\n" +
                "      PHRASE INDEX RATIO 0.0\n" +
                "      ASYNC\n" +
                "      FAST PREPROCESS ON;\n" +
                "  };\n" +
                "\n" +
                "};\n";

            var converter = new converttohdbcds.Converter(pathToPAD);

            var result = converter.convert(source);

            equal(result.hdbcdscontent, expected);
        });


        test('Ha-Jo\'s even shorter FTI sample', function() {

            var source = "" +
                "namespace Annotations.Usage;\n" +
                "\n" +
                "@Schema: 'TestSchema'\n" +
                "context PredefinedOk\n" +
                "{\n" +
                "  // there is no source file where the annotation SearchIndex\n" +
                "  //  is defined, it is part of the compiler preload\n" +
                "  entity searchEntity\n" +
                "  {\n" +
                "    key id : Integer;\n" +
                "\n" +
                "    @SearchIndex.text.enabled\n" +
                "    elt : String(1000);\n" +
                "  };\n" +
                "\n" +
                "};\n" +
                "";
            var expected = "" +
                "namespace Annotations.Usage;\n" +
                "\n" +
                "context PredefinedOk\n" +
                "{\n" +
                "  // there is no source file where the annotation SearchIndex\n" +
                "  //  is defined, it is part of the compiler preload\n" +
                "  entity searchEntity\n" +
                "  {\n" +
                "    key id : Integer;\n" +
                "\n" +
                "    elt : String(1000);\n" +
                "  } technical configuration {\n" +
                "  FULLTEXT INDEX ftiOnElt ON ( elt )\n" +
                "      SEARCH ONLY OFF\n" +
                "      PHRASE INDEX RATIO 0.0\n" +
                "      ASYNC\n" +
                "      FAST PREPROCESS ON;\n" +
                "  };\n" +
                "\n" +
                "};\n";

            var converter = new converttohdbcds.Converter(pathToPAD);

            var result = converter.convert(source);

            equal(result.hdbcdscontent, expected);
        });


        test('FTI with mining sample', function() {

            var source = "" +
                "namespace Annotations.Usage;\n" +
                "\n" +
                "@Schema: 'TestSchema'\n" +
                "context PredefinedOk\n" +
                "{\n" +
                "  // there is no source file where the annotation SearchIndex\n" +
                "  //  is defined, it is part of the compiler preload\n" +
                "  entity searchEntity\n" +
                "  {\n" +
                "    key id : Integer;\n" +
                "\n" +
                "    @SearchIndex : { text : { enabled : true,\n" +
                "                              name : 'myTextIndex',\n" +
                "                              storeOriginalContent : false,\n" +
                "                              phraseIndexRatio : 1.7,\n" +
                "                              async : true,\n" +
                "                              textAnalysis : { mode : #SIMPLE,\n" +
                "                                               languageElement : 'a',\n" +
                "                                               languageDetection : ['DE', 'EN'],\n" +
                "                                               mimeTypeElement : 'Gans',\n" +
                "                                               mimeType : 'Jojo',\n" +
                "                                               configurationID : 'Herbert',\n" +
                "                                               tokenSeparators : 'Otto' \n" +
                "                                             },\n" +
                "                              textMining : { enabled  }\n" +
                "                            },\n" +
                "                     fuzzy : { enabled : true,\n" +
                "                               mode : #ALPHANUM\n" +
                "                             }\n" +
                "                   }\n" +
                "    elt : String(1000);\n" +
                "  };\n" +
                "\n" +
                "};\n" +
                "";
            var expected = "" +
                "namespace Annotations.Usage;\n" +
                "\n" +
                "context PredefinedOk\n" +
                "{\n" +
                "  // there is no source file where the annotation SearchIndex\n" +
                "  //  is defined, it is part of the compiler preload\n" +
                "  entity searchEntity\n" +
                "  {\n" +
                "    key id : Integer;\n" +
                "\n" +
                "    elt : String(1000);\n" +
                "  } technical configuration {\n" +
                "  FULLTEXT INDEX myTextIndex ON ( elt )\n" +
                "      FUZZY SEARCH INDEX ON\n" +
                "      SEARCH ONLY ON\n" +
                "      PHRASE INDEX RATIO 1.7\n" +
                "      ASYNCHRONOUS\n" +
                "      FAST PREPROCESS OFF TEXT ANALYSIS OFF\n" +
                "      LANGUAGE COLUMN a\n" +
                "      LANGUAGE DETECTION ( 'DE', 'EN' )\n" +
                "      MIME TYPE COLUMN Gans\n" +
                "      MIME TYPE 'Jojo'\n" +
                "      TOKEN SEPARATORS 'Otto'\n" +
                "      // The annotation \"@SearchIndex.textAnalysis.configurationID name\"\n" +
                "      // has been converted to \"CONFIGURATION name\"\n" +
                "      // but this might not be supported by your system\n" +
                "      CONFIGURATION 'Herbert'\n" +
                "      TEXT MINING ON;\n" +
                "  };\n" +
                "\n" +
                "};\n";


            var converter = new converttohdbcds.Converter(pathToPAD);

            var result = converter.convert(source);

            equal(result.hdbcdscontent, expected);
        });

        test('Ha-Jo\'s FUZZY sample', function() {

            var source = "" +
                "namespace Annotations.Usage;\n" +
                "\n" +
                "@Schema: 'TestSchema'\n" +
                "context PredefinedOk\n" +
                "{\n" +
                "  // there is no source file where the annotation SearchIndex\n" +
                "  //  is defined, it is part of the compiler preload\n" +
                "  entity searchEntity\n" +
                "  {\n" +
                "    key id : Integer;\n" +
                "\n" +
                "    @SearchIndex : { text : { enabled : false,\n" +
                "                              name : 'myTextIndex',\n" +
                "                              storeOriginalContent : false,\n" +
                "                              phraseIndexRatio : 1.7,\n" +
                "                              async : true,\n" +
                "                              textAnalysis : { mode : #SIMPLE,\n" +
                "                                               languageElement : 'a',\n" +
                "                                               languageDetection : ['DE', 'EN'],\n" +
                "                                               mimeTypeElement : 'Gans',\n" +
                "                                               mimeType : 'Jojo',\n" +
                "                                               configurationID : 'Herbert',\n" +
                "                                               tokenSeparators : 'Otto' \n" +
                "                                             }\n" +
                "                            },\n" +
                "                     fuzzy : { enabled : true,\n" +
                "                               mode : #POSTCODE\n" +
                "                             }\n" +
                "                   }\n" +
                "    elt : String(1000);\n" +
                "  };\n" +
                "\n" +
                "};\n" +
                "";
            var expected = "" +
                "namespace Annotations.Usage;\n" +
                "\n" +
                "context PredefinedOk\n" +
                "{\n" +
                "  // there is no source file where the annotation SearchIndex\n" +
                "  //  is defined, it is part of the compiler preload\n" +
                "  entity searchEntity\n" +
                "  {\n" +
                "    key id : Integer;\n" +
                "\n" +
                "    elt : String(1000);\n" +
                "  } technical configuration {\n" +
                "  FUZZY SEARCH INDEX ON ( elt )\n" +
                "      FUZZY SEARCH MODE 'POSTCODE';\n" +
                "  };\n" +
                "\n" +
                "};\n";


            var converter = new converttohdbcds.Converter(pathToPAD);

            var result = converter.convert(source);

            equal(result.hdbcdscontent, expected);
        });


        test('Ha-Jo\'s short FUZZY sample', function() {

            var source = "" +
                "namespace Annotations.Usage;\n" +
                "\n" +
                "@Schema: 'TestSchema'\n" +
                "context PredefinedOk\n" +
                "{\n" +
                "  // there is no source file where the annotation SearchIndex\n" +
                "  //  is defined, it is part of the compiler preload\n" +
                "  entity searchEntity\n" +
                "  {\n" +
                "    key id : Integer;\n" +
                "\n" +
                "    @SearchIndex.fuzzy : { enabled : true,\n" +
                "                               mode : #ALPHANUM\n" +
                "                         }\n" +
                "    elt : String(1000);\n" +
                "  };\n" +
                "\n" +
                "};\n" +
                "";
            var expected = "" +
                "namespace Annotations.Usage;\n" +
                "\n" +
                "context PredefinedOk\n" +
                "{\n" +
                "  // there is no source file where the annotation SearchIndex\n" +
                "  //  is defined, it is part of the compiler preload\n" +
                "  entity searchEntity\n" +
                "  {\n" +
                "    key id : Integer;\n" +
                "\n" +
                "    elt : String(1000);\n" +
                "  } technical configuration {\n" +
                "  FUZZY SEARCH INDEX ON ( elt )\n" +
                "      FUZZY SEARCH MODE 'ALPHANUM';\n" +
                "  };\n" +
                "\n" +
                "};\n";


            var converter = new converttohdbcds.Converter(pathToPAD);

            var result = converter.convert(source);

            equal(result.hdbcdscontent, expected);
        });

        test('Ha-Jo\'s shorter FUZZY sample', function() {

            var source = "" +
                "namespace Annotations.Usage;\n" +
                "\n" +
                "@Schema: 'TestSchema'\n" +
                "context PredefinedOk\n" +
                "{\n" +
                "  // there is no source file where the annotation SearchIndex\n" +
                "  //  is defined, it is part of the compiler preload\n" +
                "  entity searchEntity\n" +
                "  {\n" +
                "    key id : Integer;\n" +
                "\n" +
                "    @SearchIndex.fuzzy.enabled : true\n"+
                "    elt : String(1000);\n" +
                "  };\n" +
                "\n" +
                "};\n" +
                "";
            var expected = "" +
                "namespace Annotations.Usage;\n" +
                "\n" +
                "context PredefinedOk\n" +
                "{\n" +
                "  // there is no source file where the annotation SearchIndex\n" +
                "  //  is defined, it is part of the compiler preload\n" +
                "  entity searchEntity\n" +
                "  {\n" +
                "    key id : Integer;\n" +
                "\n" +
                "    elt : String(1000);\n" +
                "  } technical configuration {\n" +
                "  FUZZY SEARCH INDEX ON ( elt );\n" +
                "  };\n" +
                "\n" +
                "};\n";


            var converter = new converttohdbcds.Converter(pathToPAD);

            var result = converter.convert(source);

            equal(result.hdbcdscontent, expected);
        });

        test('Ha-Jo\'s even shorter FUZZY sample', function() {

            var source = "" +
                "namespace Annotations.Usage;\n" +
                "\n" +
                "@Schema: 'TestSchema'\n" +
                "context PredefinedOk\n" +
                "{\n" +
                "  // there is no source file where the annotation SearchIndex\n" +
                "  //  is defined, it is part of the compiler preload\n" +
                "  entity searchEntity\n" +
                "  {\n" +
                "    key id : Integer;\n" +
                "\n" +
                "    @SearchIndex.fuzzy.enabled\n"+
                "    elt : String(1000);\n" +
                "  };\n" +
                "\n" +
                "};\n" +
                "";
            var expected = "" +
                "namespace Annotations.Usage;\n" +
                "\n" +
                "context PredefinedOk\n" +
                "{\n" +
                "  // there is no source file where the annotation SearchIndex\n" +
                "  //  is defined, it is part of the compiler preload\n" +
                "  entity searchEntity\n" +
                "  {\n" +
                "    key id : Integer;\n" +
                "\n" +
                "    elt : String(1000);\n" +
                "  } technical configuration {\n" +
                "  FUZZY SEARCH INDEX ON ( elt );\n" +
                "  };\n" +
                "\n" +
                "};\n";


            var converter = new converttohdbcds.Converter(pathToPAD);

            var result = converter.convert(source);

            equal(result.hdbcdscontent, expected);
        });


        test('SearchIndexes sample', function() {

            var source = "" +
                "namespace Annotations.Usage;\n" +
                "\n" +
                "@Schema: 'TestSchema'\n" +
                "context ESHTests\n" +
                "{\n" +
                "  type documentType\n" +
                "  {\n" +
                "    abstract: LargeString;\n" +
                "    content:  LargeString;\n" +
                "    language: String(2);\n" +
                "  };\n" +
                "\n" +
                "  @Catalog.tableType: #COLUMN\n" +
                "  entity documents\n" +
                "  {\n" +
                "    key id: Integer;\n" +
                "\n" +
                "    @SearchIndexes: [ { element: 'document.abstract', text: { enabled: true, textAnalysis: { mode: #SIMPLE, languageElement: 'document.language' } }, fuzzy: { enabled: true} },\n" +
                "                      { element: 'document.content',  text: { enabled: true, textAnalysis: { mode: #SIMPLE, languageElement: 'document.language' } } } ]\n" +
                "    document: documentType;\n" +
                "  };\n" +
                "\n" +
                "};\n" +
                "";
            var expected = "" +
                "namespace Annotations.Usage;\n" +
                "\n" +
                "context ESHTests\n" +
                "{\n" +
                "  table type documentType\n" +
                "  {\n" +
                "    abstract: LargeString;\n" +
                "    content:  LargeString;\n" +
                "    language: String(2);\n" +
                "  };\n" +
                "\n" +
                "  entity documents\n" +
                "  {\n" +
                "    key id: Integer;\n" +
                "\n" +
                "    document: documentType;\n" +
                "  } technical configuration {\n" +
                "    column store;\n" +
                "\n" +
                "  FULLTEXT INDEX ftiOnDocumentAbstract ON ( document.abstract )\n" +
                "      FUZZY SEARCH INDEX ON\n" +
                "      SEARCH ONLY OFF\n" +
                "      PHRASE INDEX RATIO 0.0\n" +
                "      ASYNC\n" +
                "      FAST PREPROCESS OFF TEXT ANALYSIS OFF\n" +
                "      LANGUAGE COLUMN document.language;\n" +
                "\n" +
                "  FULLTEXT INDEX ftiOnDocumentContent ON ( document.content )\n" +
                "      FUZZY SEARCH INDEX ON\n" +
                "      SEARCH ONLY OFF\n" +
                "      PHRASE INDEX RATIO 0.0\n" +
                "      ASYNC\n" +
                "      FAST PREPROCESS OFF TEXT ANALYSIS OFF\n" +
                "      LANGUAGE COLUMN document.language;\n" +
                "  };\n" +
                "\n" +
                "};\n";


            var converter = new converttohdbcds.Converter(pathToPAD);

            var result = converter.convert(source);

            equal(result.hdbcdscontent, expected);
        });

        test('SearchIndexes sample with exotic names', function() {

            var source = "" +
                "namespace Annotations.Usage;\n" +
                "\n" +
                "@Schema: 'TestSchema'\n" +
                "context ESHTests\n" +
                "{\n" +
                "  type documentType\n" +
                "  {\n" +
                "    abstract: LargeString;\n" +
                "    content:  LargeString;\n" +
                "    \"language's\": String(2);\n" +
                "  };\n" +
                "\n" +
                "  @Catalog.tableType: #COLUMN\n" +
                "  entity documents\n" +
                "  {\n" +
                "    key id: Integer;\n" +
                "\n" +
                "    @SearchIndexes: [ { element: 'document@.abstract', text: { enabled: true, textAnalysis: { mode: #SIMPLE, languageElement: 'document@.language''s' } }, fuzzy: { enabled: true} },\n" +
                "                      { element: 'document@.content',  text: { enabled: true, textAnalysis: { mode: #SIMPLE, languageElement: 'document@.language''s' } } } ]\n" +
                "    \"document@\": documentType;\n" +
                "  };\n" +
                "\n" +
                "};\n" +
                "";
            var expected = "" +
                "namespace Annotations.Usage;\n" +
                "\n" +
                "context ESHTests\n" +
                "{\n" +
                "  table type documentType\n" +
                "  {\n" +
                "    abstract: LargeString;\n" +
                "    content:  LargeString;\n" +
                "    \"language's\": String(2);\n" +
                "  };\n" +
                "\n" +
                "  entity documents\n" +
                "  {\n" +
                "    key id: Integer;\n" +
                "\n" +
                "    \"document@\": documentType;\n" +
                "  } technical configuration {\n" +
                "    column store;\n" +
                "\n" +
                "  FULLTEXT INDEX ftiOnDocumentAbstract ON ( \"document@\".abstract )\n" +
                "      FUZZY SEARCH INDEX ON\n" +
                "      SEARCH ONLY OFF\n" +
                "      PHRASE INDEX RATIO 0.0\n" +
                "      ASYNC\n" +
                "      FAST PREPROCESS OFF TEXT ANALYSIS OFF\n" +
                "      LANGUAGE COLUMN \"document@\".\"language's\";\n" +
                "\n" +
                "  FULLTEXT INDEX ftiOnDocumentContent ON ( \"document@\".content )\n" +
                "      FUZZY SEARCH INDEX ON\n" +
                "      SEARCH ONLY OFF\n" +
                "      PHRASE INDEX RATIO 0.0\n" +
                "      ASYNC\n" +
                "      FAST PREPROCESS OFF TEXT ANALYSIS OFF\n" +
                "      LANGUAGE COLUMN \"document@\".\"language's\";\n" +
                "  };\n" +
                "\n" +
                "};\n";


            var converter = new converttohdbcds.Converter(pathToPAD);

            var result = converter.convert(source);

            equal(result.hdbcdscontent, expected);
        });

        test('SearchIndexes flat list', function() {

            var source = "" +
                "namespace sap.hana.im.ess.eg;\n" +
                "\n" +
                "@Schema:    'SAP_HANA_IM_ESS'\n" +
                "@Catalog.tableType: #COLUMN\n" +
                "entity ANNOTATION {\n" +
                "    PROPERTY_NAME:              String(300)         null;  // indicates the name of the property whose value  is extracted as annotation. In case of text which does not correspond to an property value,  the property name is NULL\n" +
                "    @SearchIndex.text.name: 'IDX_ESS_sap.hana.im.ess'\n" +
                "    @SearchIndex.text.enabled:  true\n" +
                "    @SearchIndex.text.async:  true\n" +
                "    @SearchIndex.text.textAnalysis.mode:    #EXTENDED\n" +
                "//    @SearchIndex.text.textAnalysis.languageDetection:   ['en','de','fr','es','pt','it','ru','zh','kr','ja'] // TODO verify list\n" +
                "    @SearchIndex.text.textAnalysis.configurationID:     'LINGANALYSIS_FULL'\n" +
                "    @SearchIndex.text.textAnalysis.tokenSeparators: '\/;,.:-_()[]<>!?*@+{}=\"&' // force list of default token separators\n" +
                "    AN_TEXT :                   String(4999)        not null; // the text of the annotation\n" +
                "    SEARCH_MASK:                Integer             null; //0 means that the annotation CANNOT be used in a match based search, 1 means that the annotation can be used in a match-based search\n" +
                "\n" +
                "};\n" +
                "";
            var expected = "" +
                "namespace sap.hana.im.ess.eg;\n" +
                "\n" +
                "\n" +
                "entity ANNOTATION {\n" +
                "    PROPERTY_NAME:              String(300)         null;  // indicates the name of the property whose value  is extracted as annotation. In case of text which does not correspond to an property value,  the property name is NULL\n" +
                "\n" +
                "    \n" +
                "//    @SearchIndex.text.textAnalysis.languageDetection:   ['en','de','fr','es','pt','it','ru','zh','kr','ja'] // TODO verify list\n" +
                "     // force list of default token separators\n" +
                "    AN_TEXT :                   String(4999)        not null; // the text of the annotation\n" +
                "    SEARCH_MASK:                Integer             null; //0 means that the annotation CANNOT be used in a match based search, 1 means that the annotation can be used in a match-based search\n" +
                "\n" +
                "} technical configuration {\n" +
                "    column store;\n" +
                "\n" +
                "// WARNING: The character \".\", used in the original source, is not suported in a name\n" +
                "FULLTEXT INDEX \"IDX_ESS_sap.hana.im.ess\" ON ( AN_TEXT )\n" +
                "    SEARCH ONLY OFF\n" +
                "    PHRASE INDEX RATIO 0.0\n" +
                "    ASYNCHRONOUS\n" +
                "    FAST PREPROCESS OFF TEXT ANALYSIS ON\n" +
                "    TOKEN SEPARATORS '\/;,.:-_()[]<>!?*@+{}=\"&'\n" +
                "    // The annotation \"@SearchIndex.textAnalysis.configurationID name\"\n" +
                "    // has been converted to \"CONFIGURATION name\"\n" +
                "    // but this might not be supported by your system\n" +
                "    CONFIGURATION 'LINGANALYSIS_FULL';\n" +
                "};\n";

            var converter = new converttohdbcds.Converter(pathToPAD);

            var result = converter.convert(source);

            equal(result.hdbcdscontent, expected);
        });

        test('SearchIndexes flat mixed list', function() {

            var source = "" +
                "namespace sap.hana.im.ess.eg;\n" +
                "\n" +
                "@Schema:    'SAP_HANA_IM_ESS'\n" +
                "@Catalog.tableType: #COLUMN\n" +
                "entity ANNOTATION {\n" +
                "    PROPERTY_NAME:              String(300)         null;  // indicates the name of the property whose value  is extracted as annotation. In case of text which does not correspond to an property value,  the property name is NULL\n" +
                "    @SearchIndex.text.name: 'IDX_ESS_sap.hana.im.ess'\n" +
                "    @SearchIndex.text.enabled:  true\n" +
                "    @SearchIndex.fuzzy.enabled:  true\n" +
                "    @SearchIndex.text.async:  true\n" +
                "    @SearchIndex.text.textAnalysis : { mode: #EXTENDED, \n" +
                "                                       configurationID: 'LINGANALYSIS_FULL',\n" +
                "                                       tokenSeparators: '\/;,.:-_()[]<>!?*@+{}=\"&' } // force list of default token separators\n" +
                "    AN_TEXT :                   String(4999)        not null; // the text of the annotation\n" +
                "    SEARCH_MASK:                Integer             null; //0 means that the annotation CANNOT be used in a match based search, 1 means that the annotation can be used in a match-based search\n" +
                "\n" +
                "};\n" +
                "";
            var expected = "" +
                "namespace sap.hana.im.ess.eg;\n" +
                "\n" +
                "\n" +
                "entity ANNOTATION {\n" +
                "    PROPERTY_NAME:              String(300)         null;  // indicates the name of the property whose value  is extracted as annotation. In case of text which does not correspond to an property value,  the property name is NULL\n" +
                "\n" +
                "    \n" +
                "     // force list of default token separators\n" +
                "    AN_TEXT :                   String(4999)        not null; // the text of the annotation\n" +
                "    SEARCH_MASK:                Integer             null; //0 means that the annotation CANNOT be used in a match based search, 1 means that the annotation can be used in a match-based search\n" +
                "\n" +
                "} technical configuration {\n" +
                "    column store;\n" +
                "\n" +
                "// WARNING: The character \".\", used in the original source, is not suported in a name\n" +
                "FULLTEXT INDEX \"IDX_ESS_sap.hana.im.ess\" ON ( AN_TEXT )\n" +
                "    FUZZY SEARCH INDEX ON\n" +
                "    SEARCH ONLY OFF\n" +
                "    PHRASE INDEX RATIO 0.0\n" +
                "    ASYNCHRONOUS\n" +
                "    FAST PREPROCESS OFF TEXT ANALYSIS ON\n" +
                "    TOKEN SEPARATORS '\/;,.:-_()[]<>!?*@+{}=\"&'\n" +
                "    // The annotation \"@SearchIndex.textAnalysis.configurationID name\"\n" +
                "    // has been converted to \"CONFIGURATION name\"\n" +
                "    // but this might not be supported by your system\n" +
                "    CONFIGURATION 'LINGANALYSIS_FULL';\n" +
                "};\n";

            var converter = new converttohdbcds.Converter(pathToPAD);

            var result = converter.convert(source);

            equal(result.hdbcdscontent, expected);
        });

        test('SearchIndexes flat fuzzy', function() {

            var source = "" +
                "namespace sap.hana.im.ess.eg;\n" +
                "\n" +
                "@Schema:    'SAP_HANA_IM_ESS'\n" +
                "@Catalog.tableType: #COLUMN\n" +
                "entity ANNOTATION {\n" +
                "    PROPERTY_NAME:              String(300)         null;  // indicates the name of the property whose value  is extracted as annotation. In case of text which does not correspond to an property value,  the property name is NULL\n" +
                "    @SearchIndex.fuzzy.enabled:  true\n" +
                "    @SearchIndex.fuzzy.mode:  #HOUSENUMBER\n" +
                "    AN_TEXT :                   String(4999)        not null; // the text of the annotation\n" +
                "    SEARCH_MASK:                Integer             null; //0 means that the annotation CANNOT be used in a match based search, 1 means that the annotation can be used in a match-based search\n" +
                "\n" +
                "};\n" +
                "";
            var expected = "" +
                "namespace sap.hana.im.ess.eg;\n" +
                "\n" +
                "\n" +
                "entity ANNOTATION {\n" +
                "    PROPERTY_NAME:              String(300)         null;  // indicates the name of the property whose value  is extracted as annotation. In case of text which does not correspond to an property value,  the property name is NULL\n" +
                "\n" +
                "    AN_TEXT :                   String(4999)        not null; // the text of the annotation\n" +
                "    SEARCH_MASK:                Integer             null; //0 means that the annotation CANNOT be used in a match based search, 1 means that the annotation can be used in a match-based search\n" +
                "\n" +
                "} technical configuration {\n" +
                "    column store;\n" +
                "\n" +
                "FUZZY SEARCH INDEX ON ( AN_TEXT )\n" +
                "    FUZZY SEARCH MODE 'HOUSENUMBER';\n" +
                "};\n";

            var converter = new converttohdbcds.Converter(pathToPAD);

            var result = converter.convert(source);

            equal(result.hdbcdscontent, expected);
        });


        test('large file', function() {

            var source = getRequestInTest("../test/Basis.hdbdd") ;
            equal(source.length !== 0, true);

            var converter = new converttohdbcds.Converter(pathToPAD);
            var result = converter.convert(source);

            var hasErrors = false;
            for( var i = 0; i< result.messages.length; ++i) {
                var message = result.messages[i];
                if (message.type === "ERROR") {
                    hasErrors = true;
                    break;
                }
            }
            equal(hasErrors, false);
        });


		QUnit.start();

    }
);
