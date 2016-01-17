
// start via
//
// > mocha TestsUnitHanaDdlParserFactory

// requirejs config
var requirejs = require("requirejs");
requirejs.config({
    //Pass the top-level main.js/index.js require
    //function to requirejs so that node modules
    //are loaded relative to the top-level JS file.
    nodeRequire: require
});
require = requirejs;

// test suite helper sets the paths
var testsuitehelper = require("../testsuitehelper.js");
testsuitehelper.setRequireJsConfigForNodeJs(__dirname, 1);

var assert = require("assert");
var hanaddlNonUi = require("hanaddl/hanaddlNonUi");
require("hanaddl/hanav5/CdsDdlParserResolver");

describe("DDL Parser Factory API", function() {

    describe("get DDL parser factory", function () {
        it("should initialize the RND parser factory", function () {
            var parserFactoryApi = hanaddlNonUi.DdlParserFactoryApi;

            assert.notEqual(parserFactoryApi, undefined, "the parser factory is undefined");
        });
    });

    describe("get version factory", function () {
        it("should get the version factory", function () {
            var parserFactoryApi = hanaddlNonUi.DdlParserFactoryApi;

            var versionFactory = parserFactoryApi.versionsFactory;

            assert.notEqual(versionFactory, undefined, "the version factory is undefined");
        });
    });

    describe("create resolver", function () {
        it("should initialize the RND parser", function () {
            var parserFactoryApi = hanaddlNonUi.DdlParserFactoryApi;
            var parserFactoryRootFolder = "../../../../../../webapp/resources/editor/plugin/hdbdd";

            var version = "5";
            var resolver = parserFactoryApi.createResolver(version, parserFactoryRootFolder);

            assert.notEqual(resolver, undefined, "the resolver is undefined");
        });
    });

    describe("create DDL parser", function () {
        it("should initialize the RND parser", function () {
            var parserFactoryApi = hanaddlNonUi.DdlParserFactoryApi;

            var version = "5";
            var parser = parserFactoryApi.createParser(version);

            assert.notEqual(parser, undefined, "the parser is undefined");
        });
    });

    describe("parse simple statement", function () {
        it("should parse a simple statement", function () {
            var parserFactoryApi = hanaddlNonUi.DdlParserFactoryApi;
            var parserFactoryRootFolder = "../../../../../../webapp/resources/editor/plugin/hdbdd";

            var version = "5";
            var resolver = parserFactoryApi.createResolver(version, parserFactoryRootFolder);
            var parser = parserFactoryApi.createParser(version);

            var tokens = parser.parseAndGetAst2(resolver, "entity myEntity { myElement : Integer; };").tokenList;

            assert.equal(tokens.length, 10, "the tokens' lengths is not correct");

            assert.equal(tokens[0].m_lexem, "entity", "the token 0 is not correct");
            assert.equal(tokens[1].m_lexem, "myEntity", "the token 0 is not correct");
            assert.equal(tokens[2].m_lexem, "{", "the token 0 is not correct");
            assert.equal(tokens[3].m_lexem, "myElement", "the token 0 is not correct");
            assert.equal(tokens[4].m_lexem, ":", "the token 0 is not correct");
            assert.equal(tokens[5].m_lexem, "Integer", "the token 0 is not correct");
            assert.equal(tokens[6].m_lexem, ";", "the token 0 is not correct");
            assert.equal(tokens[7].m_lexem, "}", "the token 0 is not correct");
            assert.equal(tokens[8].m_lexem, ";", "the token 0 is not correct");
        });
    });
});
