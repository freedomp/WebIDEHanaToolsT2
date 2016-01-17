// Copyright (c) 2015 SAP SE, All Rights Reserved
define(
    [
        "hanaddl/hanaddlNonUi",
        "converttohdbcds/ConvertToHdi",
        "hanaddl/hanav5/CdsDdlParserResolver" //preload the used resolvers, that are not present in the optimized build
    ],
    function (hanaddl, ConvertToHdi) {
        "use strict";

        var my_converttohdbcds;


        function Converter(parserFactoryRootFolder) {

            //var parserFactoryRootFolder = "../../webapp/resources/editor/plugin/hdbdd";
            if (undefined === parserFactoryRootFolder) {
                // user did not pass our resource directory
                // try to get it from the location where hdbdd-to-hdbcds.js places it
                if (undefined === my_converttohdbcds) {
                    my_converttohdbcds = require("converttohdbcds/converttohdbcds");
                }
                if (undefined === my_converttohdbcds.resources_dir) {
                    throw "Pass the path to the resources folder either as Converter parameter or as converttohdbcds.resources_dir property";
                }
                parserFactoryRootFolder = my_converttohdbcds.resources_dir;
            }
            var parserFactoryApi = hanaddl.DdlParserFactoryApi;

            //var version = parserFactoryApi.versionsFactory.versionLast;
            this.hanaVersion = '5';
            this.resolver = parserFactoryApi.createResolver(this.hanaVersion, parserFactoryRootFolder);
            this.parser = parserFactoryApi.createParser(this.hanaVersion);
            this.parser.getDefaultHaltedInterval = function() {
                return 1000 * 1000;
            };
        }

        Converter.prototype.convert = function (source) {

            //1: pre flight check: use syntax coloring that does not mask RND errors
            var SyntaxCheckConverter = new ConvertToHdi();
            if (SyntaxCheckConverter.syntaxCheck(this.parser, this.resolver, source) === false) {
                return { hdbcdscontent: '', messages: SyntaxCheckConverter.m_log.getMessages() };
            }
            SyntaxCheckConverter = undefined;

            //:2 get AST
            var cu;
            try {
                this.parser.setThrowExceptionAtTimeout(true);
                cu = this.parser.parseAndGetAst2(this.resolver, source);
            }
            catch(err) {
                //fatal parse error while building AST.
                // This can only be a grammar error:
                // The scan done in syntaxCheck did not detect anything
                // thus rescanOnError will only produce an "internal error message"
                var errorConverter = new ConvertToHdi();
                errorConverter.rescanOnError(this.parser, this.resolver, source, err.message.search(/timeout/i) !== -1);
                return { hdbcdscontent:'', messages:errorConverter.m_log.getMessages() };
            }

            //3: run over AST
            var converter = new ConvertToHdi(cu);
            converter.analyze();

            //4: modify source
            var newSource = converter.convert();

            return { hdbcdscontent:newSource, messages:converter.m_log.getMessages() };
        };

        Converter.prototype.getGrammarVersion = function () {


            return this.hanaVersion;
        };


        return Converter;
    }
);

