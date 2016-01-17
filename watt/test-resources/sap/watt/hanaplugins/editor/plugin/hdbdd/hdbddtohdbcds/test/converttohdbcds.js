/*global it, describe, __dirname */
var requirejs = require('requirejs');

requirejs.config({
    paths: {
        //Path are relative to .../node_modules/mocha/!!!!
        'rndrt' : __dirname + '/../resources/rndrt',        //'../../../../../webapp/resources/lib/rndrt',
        'hanaddl': __dirname  + '/../resources/hanaddl',    //'/../../../webapp/resources/editor/plugin/hdbdd/hanaddl',
        'commonddl': __dirname  + '/../resources/commonddl',// '/../../../webapp/resources/editor/plugin/hdbdd/commonddl',
        'converttohdbcds': __dirname  + '/..'
    }
});

/* exported should, hanaddl, Converter */
var should = require('chai').should(),
    fs = require('fs'),
    converttohdbcds = requirejs('converttohdbcds/converttohdbcds'),
    hanaddl = requirejs('hanaddl/hanaddlNonUi'),
    ConvertToHdi = converttohdbcds.ConvertToHdi,
    Converter = converttohdbcds.Converter;

describe('Converter', function() {
    "use strict";

    var pathToPAD =  __dirname  +  '/../resources';

    //=================================================================
    it('Steffen\'s sample', function() {

        var source = "" +
            "namespace Pack;\n"+
            "\n"+
            "@Schema: 'MyTestSchema'\n"+
            "context MyContext {\n"+
            "    @Catalog : { tableType : #ROW,\n"+
            "                 index : [ { name : 'myIndex', order : #ASC,\n"+
            "                             elementNames : ['a', 'b'] },\n"+
            "                           { name : 'yourIndex', unique : false, order : #DESC,\n"+
            "                             elementNames : ['c', 'b'] }, \n"+
            "                           { name : 'yourIndex2', unique , order : #DESC,\n"+
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
            "        unique index yourIndex2 on (c, b) desc;\n"+
            "    };\n"+
            "};\n";

        var converter = new converttohdbcds.Converter(pathToPAD);

        var result = converter.convert(source);

        result.hdbcdscontent.should.equal(expected);
    });


    //=================================================================
    it('Steffen\'s sample with comments', function() {

        var source = "" +
            "namespace Pack;\n" +
            "\n" +
            "//Repo V1 needs a Schema\n" +
            "@Schema: 'MyTestSchema'\n" +
            "context MyContext {\n" +
            "    @Catalog : { tableType : #ROW, ///< Use Row store\n" +
            "                 index : [ // usage 1 index\n" +
            "                           { name : 'my.Index', order : #ASC,\n" +
            "                             elementNames : ['a', 'b'] },\n" +
            "                           // usage 2 index\n" +
            "                           { name : 'your::Index', unique : false, order : #DESC,\n" +
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
            "        // WARNING: The character \".\", used in the original source, is not suported in a name\n" +
            "        unique index \"my.Index\" on (a, b) asc;\n" +
            "        // WARNING: The characters \"::\", used in the original source, are not suported in a name\n" +
            "        index \"your::Index\" on (c, b) desc;\n" +
            "    };\n" +
            "};\n";

        var converter = new converttohdbcds.Converter(pathToPAD);

        var result = converter.convert(source);

        result.hdbcdscontent.should.equal(expected);
    });


    //=================================================================
    it('Convert weird names', function() {

        var source = "" +
            "namespace Pack;\n" +
            "\n" +
            "@Schema: 'MyTestSchema'\n" +
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

        result.hdbcdscontent.should.equal(expected);
    });

    it('Convert weird names 2', function() {

        var source = "" +
            "namespace Pack;\n" +
            "\n" +
            "@Schema: 'MyTestSchema'\n" +
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

        result.hdbcdscontent.should.equal(expected);
    });


    //=================================================================
    it('Convert short catalog', function() {

        var source = "" +
            "namespace Pack;\n" +
            "\n" +
            "@Schema: 'MyTestSchema'\n" +
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

        result.hdbcdscontent.should.equal(expected);
    });

    //=================================================================
    it('Catalog without table type', function() {

        var source ="" +
            "namespace Pack;\n" +
            "\n" +
            "@Schema: 'MyTestSchema'\n" +
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

        result.hdbcdscontent.should.equal(expected);
    });

    //=================================================================
    it('Catalog table types', function() {
        // Test various table types
        // Test nokey
        var source ="" +
            "namespace Pack;\n" +
            "\n" +
            "@Schema: 'MyTestSchema'\n" +
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

        result.hdbcdscontent.should.equal(expected);
    });

    //=================================================================
    it('Generate table type', function() {
        // Test various generate table type
        var source ="" +
            "namespace Pack;\n" +
            "\n" +
            "@Schema: 'MyTestSchema'\n" +
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

        result.hdbcdscontent.should.equal(expected);
    });

    //=================================================================
    it('Type alias', function() {
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

        result.hdbcdscontent.should.equal(expected);
    });


    //=================================================================
    it('View with privilege check', function() {
        // // Test various Views
        var source ="" +
            "namespace Pack;\n" +
            "\n" +
            "@Schema: 'MyTestSchema'\n" +
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

        result.hdbcdscontent.should.equal(expected);
    });

    //=================================================================
    it('Poor original source format', function() {

        var source = "" +
            "namespace Pack;\n" +
            "\n" +
            "@Schema: 'MyTestSchema'\n" +
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

        result.hdbcdscontent.should.equal(expected);
    });

    //=================================================================
    it('NO OP', function() {

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

        result.hdbcdscontent.should.equal(source);
    });

    //=================================================================
    it('Already had technical configuration', function() {

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

        result.hdbcdscontent.should.equal(expected);
    });

    //=================================================================
    it('Ha-Jo\'s FTI sample', function() {

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

        result.hdbcdscontent.should.equal(expected);
    });

    it('Ha-Jo\'s short FTI sample', function() {

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

        result.hdbcdscontent.should.equal(expected);
    });

    it('Ha-Jo\'s shorter FTI sample', function() {

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

        result.hdbcdscontent.should.equal(expected);
    });


    it('Ha-Jo\'s even shorter FTI sample', function() {

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

        result.hdbcdscontent.should.equal(expected);
    });


    it('FTI with mining sample', function() {

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

        result.hdbcdscontent.should.equal(expected);
    });

    it('Ha-Jo\'s FUZZY sample', function() {

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

        result.hdbcdscontent.should.equal(expected);
    });


    it('Ha-Jo\'s short FUZZY sample', function() {

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

        result.hdbcdscontent.should.equal(expected);
    });

    it('Ha-Jo\'s shorter FUZZY sample', function() {

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

        result.hdbcdscontent.should.equal(expected);

    });

    it('Ha-Jo\'s even shorter FUZZY sample', function() {

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

        result.hdbcdscontent.should.equal(expected);

    });


    it('SearchIndexes sample', function() {

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

        result.hdbcdscontent.should.equal(expected);

    });

    it('SearchIndexes sample with exotic names', function() {

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

        result.hdbcdscontent.should.equal(expected);

    });

    it('SearchIndexes flat list', function() {

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
            "// WARNING: The character \".\", used in the original source, is not suported in a name\n"+
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

        result.hdbcdscontent.should.equal(expected);
    });


    it('SearchIndexes flat mixed list', function() {

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
            "    @SearchIndex.text.textAnalysis.mode:    #EXTENDED\n" +
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
            "\n" +
            "     // force list of default token separators\n" +
            "    AN_TEXT :                   String(4999)        not null; // the text of the annotation\n" +
            "    SEARCH_MASK:                Integer             null; //0 means that the annotation CANNOT be used in a match based search, 1 means that the annotation can be used in a match-based search\n" +
            "\n" +
            "} technical configuration {\n" +
            "    column store;\n" +
            "\n" +
            "// WARNING: The character \".\", used in the original source, is not suported in a name\n"+
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

        result.hdbcdscontent.should.equal(expected);
    });

    it('SearchIndexes flat fuzzy', function() {

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

        result.hdbcdscontent.should.equal(expected);
    });

    
    
    it('large file', function(done) {
        this.timeout(15000);

        var source = fs.readFileSync('test/Basis.hdbdd', 'utf8');

        var converter = new converttohdbcds.Converter(pathToPAD);

        var result = converter.convert(source);

        result.hdbcdscontent.length.should.not.equal(0);

        var hasErrors = false;
        for( var i = 0; i< result.messages.length; ++i) {
            var message = result.messages[i];
            if (message.type === "ERROR") {
                hasErrors = true;
                break;
            }
        }
        hasErrors.should.equal(false);
        done();
    });


});

describe('convertStringLitToDQuoteId', function() {
    "use strict";

    var converter = new ConvertToHdi();

    it('converts simple \'name\' into name', function() {
        converter.convertStringLitToDQuoteId("'name'").should.equal('name');
    });
    it('converts name with ABAP name space', function() {
        converter.convertStringLitToDQuoteId("'abap/name'").should.equal("\"abap/name\"");
    });
    it('converts name with \'', function() {
        converter.convertStringLitToDQuoteId("'a''b'").should.equal("\"a'b\"");
    });
    it('converts name with \"', function() {
        converter.convertStringLitToDQuoteId("'a\"b'").should.equal("\"a\"\"b\"");
    });
});


describe('unquoteSqlString', function() {
    "use strict";

    var converter = new ConvertToHdi();


    it('Unquote empty', function() {
        converter.unquoteSqlString("").should.equal("");
    });
    it('Unquote buggy', function() {
        converter.unquoteSqlString("'").should.equal("'");
    });
    it('Unquote empty lit', function() {
        converter.unquoteSqlString("''").should.equal("");
    });
    it('Unquote simple lit', function() {
        converter.unquoteSqlString("'a'").should.equal("a");
    });
    it('Unquote lit_1', function() {
        converter.unquoteSqlString("'a''b'").should.equal("a'b");
    });
    it('Unquote lit_2', function() {
        converter.unquoteSqlString("'a'''").should.equal("a'");
    });
    it('Unquote lit_3', function() {
        converter.unquoteSqlString("'''a'").should.equal("'a");
    });
    it('Unquote lit_4', function() {
        converter.unquoteSqlString("'a''''b'").should.equal("a''b");
    });
});


describe('doubleQuoteSqlString', function() {
    "use strict";

    var converter = new ConvertToHdi();

    it('DQuote empty', function () {
        converter.doubleQuoteSqlString("").should.equal("\"\"");
    });
    it('DQuote simple', function () {
        converter.doubleQuoteSqlString("a").should.equal("\"a\"");
    });
    it('DQuote name with a \"', function () {
        converter.doubleQuoteSqlString("a\"b").should.equal("\"a\"\"b\"");
    });
    it('DQuote name with a trailing \"', function () {
        converter.doubleQuoteSqlString("a\"").should.equal("\"a\"\"\"");
    });
    it('DQuote name with a leading \"', function () {
        converter.doubleQuoteSqlString("\"b").should.equal("\"\"\"b\"");
    });
    it('DQuote name with a 2 embedded \"', function () {
        converter.doubleQuoteSqlString("a\"\"b").should.equal("\"a\"\"\"\"b\"");
    });

});
