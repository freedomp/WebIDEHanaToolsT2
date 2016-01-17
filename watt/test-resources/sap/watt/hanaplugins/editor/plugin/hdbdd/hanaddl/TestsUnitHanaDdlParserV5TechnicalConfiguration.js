/*eslint-disable no-eq-null,eqeqeq,camelcase,max-statements,complexity,quotes,curly,max-params,max-len,no-redeclare,no-empty,no-octal-escape,no-fallthrough,radix,no-proto,no-new-wrappers*/
RequirePaths.setRequireJsConfigForHanaDdl(2);
define(
    [
        "rndrt/rnd",
        "./AbstractV5HanaDdlParserTests",
        "commonddl/commonddlNonUi"
    ], //dependencies
    function (
        rnd,
        AbstractV5HanaDdlParserTests,
        commonddl
        ) {
        "use strict";
        function TestsUnitHanaDdlParserV5TechnicalConfiguration() {
        }
        TestsUnitHanaDdlParserV5TechnicalConfiguration.prototype = Object.create(AbstractV5HanaDdlParserTests.prototype);
        TestsUnitHanaDdlParserV5TechnicalConfiguration.prototype.emptyTechnicalConfiguration = function() {
            var tokens = this.parseSource("ENTITY a { el : Integer; } TECHNICAL CONFIGURATION { };");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV5TechnicalConfiguration.prototype.technicalConfigurationHashPartition = function() {
            var tokens = this.parseSource("ENTITY a { el : Integer; } TECHNICAL CONFIGURATION { PARTITION BY HASH ( path ) PARTITIONS 3; };");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV5TechnicalConfiguration.prototype.technicalConfigurationHashPartitionMultiplePartitionExpressions = function() {
            var tokens = this.parseSource("ENTITY a { el : Integer; } TECHNICAL CONFIGURATION { PARTITION BY HASH ( path,YEAR(a.b.c),MONTH(d) ) PARTITIONS GET_NUM_SERVERS(); };");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV5TechnicalConfiguration.prototype.technicalConfigurationRangePartition = function() {
            var tokens = this.parseSource("ENTITY a { el : Integer; } TECHNICAL CONFIGURATION { PARTITION BY RANGE ( path ) ( PARTITION VALUE = 3 ); };");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV5TechnicalConfiguration.prototype.technicalConfigurationRangePartitionRangeSpecValues = function() {
            var tokens = this.parseSource("ENTITY a { el : Integer; } TECHNICAL CONFIGURATION { PARTITION BY RANGE ( path ) ( PARTITION VALUES = 3 ); };");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV5TechnicalConfiguration.prototype.technicalConfigurationRangePartitionRangeSpecFromTo = function() {
            var tokens = this.parseSource("ENTITY a { el : Integer; } TECHNICAL CONFIGURATION { PARTITION BY RANGE ( path ) ( PARTITION 3 <= VALUES < 4 ); };");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV5TechnicalConfiguration.prototype.technicalConfigurationRangePartitionMultipleRangeSpecs = function() {
            var tokens = this.parseSource("ENTITY a { el : Integer; } TECHNICAL CONFIGURATION { PARTITION BY RANGE ( path ) ( PARTITION 3 <= VALUES < 4, PARTITION VALUES = 3, PARTITION OTHERS ); };");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV5TechnicalConfiguration.prototype.technicalConfigurationRoundRobinPartition = function() {
            var tokens = this.parseSource("ENTITY a { el : Integer; } TECHNICAL CONFIGURATION { PARTITION BY ROUNDROBIN PARTITIONS 3; };");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV5TechnicalConfiguration.prototype.technicalConfigurationMultiplePartitions = function() {
            var tokens = this.parseSource("ENTITY a { el : Integer; } TECHNICAL CONFIGURATION { PARTITION BY ROUNDROBIN PARTITIONS 3, RANGE ( path ) ( PARTITION 3 <= VALUES < 4, PARTITION VALUES = 3, PARTITION OTHERS ); };");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV5TechnicalConfiguration.prototype.technicalConfigurationRangePartitionRangeSpecValuesRealLiteral = function() {
            var tokens = this.parseSource("ENTITY a { el : Integer; } TECHNICAL CONFIGURATION { PARTITION BY RANGE ( path ) ( PARTITION VALUES = 4.2e5 ); };");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV5TechnicalConfiguration.prototype.technicalConfigurationUnloadPriority = function() {
            var tokens = this.parseSource("ENTITY a { el : Integer; } TECHNICAL CONFIGURATION { UNLOAD PRIORITY 3; };");
            this.assertNoErrorTokens(tokens);
        };

        TestsUnitHanaDdlParserV5TechnicalConfiguration.prototype.astFullTextIndex = function(assert) {
            var ast = this.parseSourceAndGetAst("ENTITY a { el : Integer; } TECHNICAL CONFIGURATION { FULLTEXT INDEX myidx ON ( mycol ) async flush queue every 3 minutes or after 5 documents synchronous phrase index ratio 0.3 LANGUAGE COLUMN mylang LANGUAGE DETECTION ( 'u', 'v', 'w' ) ; };");
            validateStructure(ast);

            var entity = ast.statements[0];
            var technicalConfiguration = entity.technicalConfiguration;
            var fulltext = technicalConfiguration.fulltextIndexDefinitions[0];
            assert.equal("mycol", fulltext.onColumn.value.pathEntries[0].nameToken.m_lexem);
            var ftparams = fulltext.fulltextIndexParameters;
            assert.equal(5, ftparams.length);

            var async = ftparams[0].fullTextChangeTracking.asynchronous;
            assert.equal("async", async.token.m_lexem);
            var asyncSpec = async.value;
            assert.equal("flush", asyncSpec.flush.m_lexem);
            assert.equal("queue", asyncSpec.queue.m_lexem);
            assert.equal(3, asyncSpec.everyMinutes.value.m_lexem);
            assert.equal(5, asyncSpec.orAfterDocuments.value.m_lexem);

            assert.equal("synchronous", ftparams[1].fullTextChangeTracking.synchronous.m_lexem);

            assert.equal("0.3", ftparams[2].phraseIndexRatio.value.m_lexem);

            assert.equal("mylang", ftparams[3].languageColumn.value.pathEntries[0].nameToken.m_lexem);

            var langDet = ftparams[4].languageDetection.value;
            assert.equal(3, langDet.length);
            assert.equal("'u'", langDet[0].m_lexem);
            assert.equal("'v'", langDet[1].m_lexem);
            assert.equal("'w'", langDet[2].m_lexem);
        };

        TestsUnitHanaDdlParserV5TechnicalConfiguration.prototype.astIndex = function(assert) {
            var ast = this.parseSourceAndGetAst("ENTITY a { el : Integer; } TECHNICAL CONFIGURATION { INDEX hugo ON ( mypath, mypath2 ) ASC; group name X group name Y group type Z; UNLOAD PRIORITY 3; };");
            validateStructure(ast);

            var entity = ast.statements[0];

            var technicalConfiguration = entity.technicalConfiguration;
            var indexDefinition = technicalConfiguration.indexDefinitions[0];

            // Will ensure TC is correctly in container hierarchy.
            technicalConfiguration.getStartOffset();
            indexDefinition.getStartOffset();

            assert.equal(indexDefinition.index.value.m_lexem, "hugo");
            assert.equal(indexDefinition.onPathWithOrders.length, 2);
            assert.equal(indexDefinition.onPathWithOrders["0"].m_lexem, "mypath");
            assert.equal(indexDefinition.onPathWithOrders["1"].m_lexem, "mypath2");
            assert.equal(indexDefinition.order.m_lexem, "ASC");
        };

        TestsUnitHanaDdlParserV5TechnicalConfiguration.prototype.astFuzzyIndex = function(assert) {
            var ast = this.parseSourceAndGetAst("ENTITY a { el : Integer; } TECHNICAL CONFIGURATION { FUZZY SEARCH INDEX ON ( mycol ) FUZZY SEARCH MODE ;  };");
            validateStructure(ast);

            var entity = ast.statements[0];
            var technicalConfiguration = entity.technicalConfiguration;
            var fuzzyDefs = technicalConfiguration.fuzzyIndexDefinitions;
            assert.equal(1, fuzzyDefs.length);

            assert.equal("mycol", fuzzyDefs[0].onColumn.value.pathEntries[0].nameToken.m_lexem);
            assert.equal(null, fuzzyDefs[0].searchMode.value);

            ast = this.parseSourceAndGetAst("ENTITY a { el : Integer; } TECHNICAL CONFIGURATION { FUZZY SEARCH INDEX ON ( mycol ) FUZZY SEARCH MODE 'd';  };");
            validateStructure(ast);

            entity = ast.statements[0];
            technicalConfiguration = entity.technicalConfiguration;
            fuzzyDefs = technicalConfiguration.fuzzyIndexDefinitions;
            assert.equal(1, fuzzyDefs.length);
            assert.equal("'d'", fuzzyDefs[0].searchMode.value.m_lexem);
        };

        TestsUnitHanaDdlParserV5TechnicalConfiguration.prototype.astPartition = function(assert) {

            var validateAndGetPartScheme = function(ast) {

                validateStructure(ast);

                var entity = ast.statements[0];
                var scheme = entity.technicalConfiguration.partitionDefinition.partitionScheme;

                return scheme;
            };

            var rangeFragment = "RANGE ( path ) ( PARTITION 3 <= VALUES < 4, PARTITION VALUES = 5, PARTITION OTHERS )";
            var validateRangePart = function(rangePart) {
                assert.equal("OTHERS",rangePart.partitionOthers.m_lexem);
                var ranges = rangePart.partitionRanges;
                assert.equal(2,ranges.length);
                assert.equal("3", ranges[0].atLeast.m_lexem);
                assert.equal("4", ranges[0].below.m_lexem);
                assert.equal("5", ranges[1].exactly.m_lexem);
            };

            var astRange = this.parseSourceAndGetAst("ENTITY a { el : Integer; } TECHNICAL CONFIGURATION { PARTITION BY %%RANGEPART%%; };".replace("%%RANGEPART%%", rangeFragment));

            var scheme = validateAndGetPartScheme(astRange);
            validateRangePart(scheme.rangePartition);

            var astHash = this.parseSourceAndGetAst("ENTITY a { el : Integer; } TECHNICAL CONFIGURATION { PARTITION BY HASH ( mypath,YEAR(a.b.c),MONTH(d) ) PARTITIONS GET_NUM_SERVERS(); };");
            scheme = validateAndGetPartScheme(astHash);
            var hashPart = scheme.hashPartition;
            assert.equal("GET_NUM_SERVERS", hashPart.numberOfPartitions.m_lexem);
            var exprs = hashPart.partitionExpressions;
            assert.equal(3,exprs.length);

            assert.equal(hashPart,exprs[0].container);
            var simplePath = exprs[0].simplePath;
            assert.equal("mypath", simplePath.pathEntries[0].nameToken.m_lexem);
            var cu = commonddl.SourceRangeImpl.getCompilationUnit(simplePath);
            assert.ok(cu !== null);

            assert.equal(15, exprs[0].startTokenIndex);
            assert.equal(15, exprs[0].endTokenIndex);

            var pe = exprs[1].yearPath.value.pathEntries;
            assert.equal(3,pe.length);
            assert.equal("a", pe[0].nameToken.m_lexem);
            assert.equal("b", pe[1].nameToken.m_lexem);
            assert.equal("c", pe[2].nameToken.m_lexem);

            pe = exprs[2].monthPath.value.pathEntries;
            assert.equal(1,pe.length);
            assert.equal("d", pe[0].nameToken.m_lexem);

            var astRobinAndRange = this.parseSourceAndGetAst("ENTITY a { el : Integer; } TECHNICAL CONFIGURATION { PARTITION BY ROUNDROBIN PARTITIONS 3, %%RANGEPART%%; };".replace("%%RANGEPART%%", rangeFragment));
            scheme = validateAndGetPartScheme(astRobinAndRange);
            var robinPart = scheme.roundRobinPartition;
            assert.equal(3, robinPart.numberOfPartitions.m_lexem);

            validateRangePart(scheme.container.partitionScheme2.rangePartition);
        };

        TestsUnitHanaDdlParserV5TechnicalConfiguration.prototype.astRowStoreDefinition = function(assert) {
            var ast = this.parseSourceAndGetAst("ENTITY a { el : Integer; } TECHNICAL CONFIGURATION { ROW STORE ; };");
            validateStructure(ast);

            var entity = ast.statements[0];
            var technicalConfiguration = entity.technicalConfiguration;
            assert.equal("STORE", technicalConfiguration.storeDefinition.rowStore.m_lexem);
        };

        TestsUnitHanaDdlParserV5TechnicalConfiguration.prototype.astColumnStoreDefinition = function(assert) {
            var ast = this.parseSourceAndGetAst("ENTITY a { el : Integer; } TECHNICAL CONFIGURATION { COLUMN STORE ; };");
            validateStructure(ast);

            var entity = ast.statements[0];
            var technicalConfiguration = entity.technicalConfiguration;
            assert.equal("STORE", technicalConfiguration.storeDefinition.columnStore.m_lexem);
        };

        TestsUnitHanaDdlParserV5TechnicalConfiguration.prototype.testOnlyRowOrColumnStore = function(assert) {
            var ast = this.parseSourceAndGetAst("ENTITY a { el : Integer; } TECHNICAL CONFIGURATION { COLUMN STORE ; ROW STORE ; };");
            this.assertErrorTokenAtTokenIndex(ast.tokenList, 14);
            assert.equal("ROW", ast.tokenList[14].m_lexem);
        };

        function validateStructure(ast) {

            TestsUnitHanaDdlParserV5TechnicalConfiguration.prototype.assertNoErrorTokens(ast.tokenList);

            var validateNode = function(astNode) {

                // Traverse children
                for (var key in astNode) {
                    if (astNode.hasOwnProperty(key)) {
                        if(getType(astNode[key]) === "Object") {
                            if(key==="owner" || key ==="container" || key === "parent") continue;
                            validateNode(astNode[key]);
                        }
                    }
                }

                // Check this node
                if(isModernAstNode(astNode)) {
                    // assure endRule has been called
                    var completed = !("endRule" in astNode);
                    ok(completed, completed ? null : "Rule node was not completed: " + astNode.constructor.name + " [#" + astNode.startTokenIndex +"-]");

                    if(!(astNode instanceof commonddl.EObjectContainmentEList)) {
                        // Will ensure TC is correctly in container hierarchy.
                        astNode.getStartOffset();
                    }
                }
            };

            validateNode(ast);
        }

        function getType(o) {
            var t, c, n;
            if(o===null) return "null";
            if(o!=o) return "nan";
            if((t=typeof o) != "object") return t;
            if((c=Object.prototype.toString.call(o).slice(8,-1))!=="Object") return c;
            if(o.constructor && o.constructor === "function" && (n= o.constructor.getName())) return n;
            return "Object";
        }

        function isModernAstNode(astNode) {
            return astNode.hasOwnProperty("__globalInstanceId");
        }

        //function validateIndices(astNode, startTokenIndex, endTokenIndex) {
        //    if(isModernAstNode(astNode)) {
        //        equal(startTokenIndex, astNode.startTokenIndex);
        //        equal(endTokenIndex, astNode.endTokenIndex);
        //    }
        //}

//TEST METHODS

        TestsUnitHanaDdlParserV5TechnicalConfiguration.prototype.testAllMethodsInSupportedVersions();

        QUnit.start();
        return TestsUnitHanaDdlParserV5TechnicalConfiguration;
    }
);
