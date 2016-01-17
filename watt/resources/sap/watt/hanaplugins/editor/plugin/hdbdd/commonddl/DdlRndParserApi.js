/*eslint-disable no-eq-null,eqeqeq,camelcase,max-statements,max-params,max-len,no-unused-vars*/
// based on commit
//a13496cbf7d325199440307180a5b8d22e44c2f9 CDS: Cleanup API
define(
    ["commonddl/SapDdlConstants", "commonddl/DdlScanner","rndrt/rnd",
        "commonddl/astmodel/ViewDefinitionImpl",
        "commonddl/DdlStatementMatchUtil","commonddl/astmodel/IAstFactory","commonddl/astmodel/ViewSelectImpl",
        "commonddl/astmodel/JoinEnum"
    ], //dependencies
    function (SapDdlConstants, DdlScanner,rnd,ViewDefinitionImpl,DdlStatementMatchUtil,IAstFactory,ViewSelectImpl,JoinEnum) {
        var ByteCodeFactory = rnd.ByteCodeFactory;
        var Utils = rnd.Utils;
        var Token = rnd.Token;
        var Category = rnd.Category;
        var ErrorState = rnd.ErrorState;
        var ScannerState = rnd.ScannerState;

        function DdlRndParserApi() {
        }
        DdlRndParserApi.DELTA_TIMEFRAME_TO_LAST_PARSE_TIMEOUT_RUN = 5 * 1000;
        DdlRndParserApi.RULE_NAME_ANNOTATION_DEFINTIONS = "annotationDefintions";
        DdlRndParserApi.prototype.byteCode = null;
        DdlRndParserApi.prototype.version = "";
        DdlRndParserApi.prototype.supportedAnnotations = null;
        DdlRndParserApi.prototype.versionFactory = null;
        DdlRndParserApi.prototype.lastPadFileResolverUsedToGetByteCode = null;
        DdlRndParserApi.prototype.scannerDoesStrictSeparationOfTokensAtPlusMinus = false;
        DdlRndParserApi.prototype.scannerDoesStrictSeparationOfTokensAtSlash = false;
        DdlRndParserApi.prototype.scannerCreatesDotDotTokens = false;
        DdlRndParserApi.prototype.scannerCreatesEnumIdTokens = false;
        DdlRndParserApi.prototype.scannerCreatesColonFollowedByIdTokens = false;
        DdlRndParserApi.prototype.scannerCreatesPipePipeTokens = false;
        DdlRndParserApi.prototype.scannerCreatesDashArrowNoWsTokens = false;
        DdlRndParserApi.prototype.allAnnotDefsAndEnumValues = null;
        DdlRndParserApi.DdlRndParserApi1 = function(version,versionFactory) {
            var result = new DdlRndParserApi();
            var indexOfDot = version.indexOf(".");
            if (indexOfDot != -1) {
                result.version = version.substring(0,indexOfDot);
            }else{
                result.version = version;
            }
            result.versionFactory = versionFactory;
            return result;
        };
        DdlRndParserApi.DdlRndParserApi2 = function(version,versionFactory,scannerDoesStrictSeparationOfTokensAtPlusMinus) {
            var result = DdlRndParserApi.DdlRndParserApi1(version,versionFactory);
            result.scannerDoesStrictSeparationOfTokensAtPlusMinus = scannerDoesStrictSeparationOfTokensAtPlusMinus;
            return result;
        };
        DdlRndParserApi.DdlRndParserApi3 = function(version,versionFactory,scannerDoesStrictSeparationOfTokensAtPlusMinus,scannerDoesStrictSeparationOfTokensAtSlash) {
            var result = DdlRndParserApi.DdlRndParserApi2(version,versionFactory,scannerDoesStrictSeparationOfTokensAtPlusMinus);
            result.scannerDoesStrictSeparationOfTokensAtSlash = scannerDoesStrictSeparationOfTokensAtSlash;
            return result;
        };
        DdlRndParserApi.DdlRndParserApi4 = function(version,versionFactory,scannerDoesStrictSeparationOfTokensAtPlusMinus,scannerDoesStrictSeparationOfTokensAtSlash,scannerCreatesDotDotTokens) {
            var result = DdlRndParserApi.DdlRndParserApi3(version,versionFactory,scannerDoesStrictSeparationOfTokensAtPlusMinus,scannerDoesStrictSeparationOfTokensAtSlash);
            result.scannerCreatesDotDotTokens = scannerCreatesDotDotTokens;
            return result;
        };
        DdlRndParserApi.DdlRndParserApi5 = function(version,versionFactory,scannerDoesStrictSeparationOfTokensAtPlusMinus,scannerDoesStrictSeparationOfTokensAtSlash,scannerCreatesDotDotTokens,scannerCreatesEnumIdTokens) {
            var result = DdlRndParserApi.DdlRndParserApi4(version,versionFactory,scannerDoesStrictSeparationOfTokensAtPlusMinus,scannerDoesStrictSeparationOfTokensAtSlash,scannerCreatesDotDotTokens);
            result.scannerCreatesEnumIdTokens = scannerCreatesEnumIdTokens;
            return result;
        };
        DdlRndParserApi.DdlRndParserApi6 = function(version,versionFactory,scannerDoesStrictSeparationOfTokensAtPlusMinus,scannerDoesStrictSeparationOfTokensAtSlash,scannerCreatesDotDotTokens,scannerCreatesEnumIdTokens,scannerCreatedColonFollowedByIdTokens) {
            var result = DdlRndParserApi.DdlRndParserApi5(version,versionFactory,scannerDoesStrictSeparationOfTokensAtPlusMinus,scannerDoesStrictSeparationOfTokensAtSlash,scannerCreatesDotDotTokens,scannerCreatesEnumIdTokens);
            result.scannerCreatesColonFollowedByIdTokens = scannerCreatedColonFollowedByIdTokens;
            return result;
        };
        DdlRndParserApi.DdlRndParserApi7 = function(version,versionFactory,scannerDoesStrictSeparationOfTokensAtPlusMinus,scannerDoesStrictSeparationOfTokensAtSlash,scannerCreatesDotDotTokens,scannerCreatesEnumIdTokens,scannerCreatedColonFollowedByIdTokens,scannerCreatesPipePipeTokens) {
            var result = DdlRndParserApi.DdlRndParserApi6(version,versionFactory,scannerDoesStrictSeparationOfTokensAtPlusMinus,scannerDoesStrictSeparationOfTokensAtSlash,scannerCreatesDotDotTokens,scannerCreatesEnumIdTokens,scannerCreatedColonFollowedByIdTokens);
            result.scannerCreatesPipePipeTokens = scannerCreatesPipePipeTokens;
            return result;
        };
        DdlRndParserApi.DdlRndParserApi8 = function(version,versionFactory,scannerDoesStrictSeparationOfTokensAtPlusMinus,scannerDoesStrictSeparationOfTokensAtSlash,scannerCreatesDotDotTokens,scannerCreatesEnumIdTokens,scannerCreatedColonFollowedByIdTokens,scannerCreatesPipePipeTokens,scannerCreatesDashArrowNoWsTokens) {
            var result = DdlRndParserApi.DdlRndParserApi7(version,versionFactory,scannerDoesStrictSeparationOfTokensAtPlusMinus,scannerDoesStrictSeparationOfTokensAtSlash,scannerCreatesDotDotTokens,scannerCreatesEnumIdTokens,scannerCreatedColonFollowedByIdTokens,scannerCreatesPipePipeTokens);
            result.scannerCreatesDashArrowNoWsTokens = scannerCreatesDashArrowNoWsTokens;
            return result;
        };
        /*global console*/
        var Console = null;
        if (typeof console !== "undefined") {
            Console = console;
        }else{
            Console = {log:function() {}};
        }
        DdlRndParserApi.prototype.getByteCode = function(resolver) {
            var stream = resolver.getPadFileContent();
            var byteCode = null;
            try {
                byteCode = ByteCodeFactory.readByteCode(stream, resolver
                    .getRelease(), true);
                this.lastPadFileResolverUsedToGetByteCode = resolver;
            } catch (e) {
                //custom console
                Console.log(e);
            }
            return byteCode;
        };
        DdlRndParserApi.prototype.getCachedByteCode = function() {
            var localByteCode = this.byteCode;
            return localByteCode;
        };
        DdlRndParserApi.prototype.parseTokens = function(resolver, tokens, startTokenIdx, endTokenIdx) {
            var localByteCode = this.getAndCheckByteCode(resolver);
            var scanner = this.createDdlScanner(localByteCode);
            var parser = this.createAndInitParserForTokenQualification(localByteCode, scanner);
            var subList = rnd.Utils.arraySubArray(tokens, startTokenIdx, endTokenIdx);
            var input = parser.m_scanner.getInput();
            this.addAllTokens(parser,subList,input);
            input.push(new Token((parser.m_scanner).getEofTokenNumber(),SapDdlConstants.EOF,Category.CAT_WS,-1,-1,-1,false,ErrorState.Correct,0));
            var scannerState = new ScannerState();
            scannerState.m_input_pos = 0;
            parser.m_scanner.setState(scannerState);
            parser.resetInput();
            parser.onResetInput();
            this.runParserForTokenQualification(parser);
            this.storeByteCodeAndAnnotationDefinitions(localByteCode, parser);
            return tokens;
        };
        DdlRndParserApi.prototype.addAllTokens = function(parser,subList,input) {

            input = input.concat(subList);
            parser.m_scanner.m_input = input;

        };
        DdlRndParserApi.prototype.parseSource = function(resolver,source) {
            var localByteCode = this.getAndCheckByteCode(resolver);
            var scanner = this.createDdlScanner(localByteCode);
            var parser = this.createAndInitParserForTokenQualification(localByteCode, scanner);
            //20150824: Trace is currently crashing
            //parser.activateTrace({print: function(x){console.log(x);}});
            parser.setInput(source, new rnd.CursorPos(1, 1, null), new rnd.CursorPos(-1, -1, null), null);
            this.runParserForTokenQualification(parser);
            this.storeByteCodeAndAnnotationDefinitions(localByteCode, parser);
            return parser.m_scanner.getInput();
        };
        DdlRndParserApi.prototype.storeByteCodeAndAnnotationDefinitions = function(localByteCode, parser) {
            this.byteCode = localByteCode;
            this.allAnnotDefsAndEnumValues = parser.getAllAnnotDefsAndEnumValues();
        };
        function DdlParseSourceHaltedCallback(parserInstance, resolver) {
            this.parserInstance = parserInstance;
            this.resolver = resolver;
        }
        DdlParseSourceHaltedCallback.prototype.run = function() {
            this.parserInstance.lastParseSourceHaltedTimeout = new Date().getTime();

            var currentTokenIndex = this.resolver.getCurrentTokenIndex();
            haltTrace("DdlParseSourceHaltedCallback halted @" + currentTokenIndex);
            return false;
        };
        DdlRndParserApi.prototype.runParserForTokenQualification = function(parser) {
            this.initBeforeParseSource(parser);
            haltTrace("runParserForTokenQualification");
            parser.run(rnd.CompletionModes.COMPL_MODE_NONE.getValue(), new DdlParseSourceHaltedCallback(this, parser), this.getCurrentHaltedInterval());
        };
        DdlRndParserApi.prototype.createAndInitParserForTokenQualification = function(localByteCode,scanner) {
            var parser = this.versionFactory.createParser(this.version, localByteCode, scanner, null);
            this.initParser(parser);
            parser.TRACING_ENABLED = true;
            parser.m_resync = true;
            parser.setSupportedAnnotations(this.getSupportedAnnotations());
            parser.setAllAnnotDefsAndEnumValues(this.allAnnotDefsAndEnumValues);
            return parser;
        };
        DdlRndParserApi.prototype.createDdlScanner = function(localByteCode) {
            return DdlScanner.DdlScanner7(localByteCode, this.scannerDoesStrictSeparationOfTokensAtPlusMinus,
                this.scannerDoesStrictSeparationOfTokensAtSlash, this.scannerCreatesDotDotTokens, this.scannerCreatesEnumIdTokens,
                this.scannerCreatesColonFollowedByIdTokens, this.scannerCreatesPipePipeTokens,
                this.scannerCreatesDashArrowNoWsTokens);
        };
        DdlRndParserApi.prototype.getAndCheckByteCode = function(resolver) {
            var localByteCode = this.byteCode;
            if (localByteCode == null) {
                localByteCode = this.getByteCode(resolver);
            }
            this.assertByteCodeVersion(localByteCode);
            return localByteCode;
        };
        DdlRndParserApi.prototype.initBeforeParseSource = function(parser) {
        };
        DdlRndParserApi.prototype.initParser = function(parser) {
            parser.init();
            parser.setPadFileResolverUsedToGetByteCode(this.lastPadFileResolverUsedToGetByteCode);
            parser.setDdlParser(this);
        };
        DdlRndParserApi.prototype.tokenize = function(resolver, source) {
            var localByteCode = this.getAndCheckByteCode(resolver);
            var scanner = this.createDdlScanner(localByteCode);
            scanner.setInput(source, new rnd.CursorPos(1, 1, null), new rnd.CursorPos(-1, -1, null));
            this.byteCode = localByteCode;
            return scanner.getInput();
        };
        DdlRndParserApi.prototype.getCodeCompletions = function(resolver, source, line, column, repositoryAccess) {
            var localByteCode = this.getAndCheckByteCode(resolver);
            try {
                this.byteCode = localByteCode;
                var scanner = this.createDdlScanner(localByteCode);
                var m_resolver = this.versionFactory.createParser(this.version, localByteCode, scanner, repositoryAccess);
                var cocoTriggerPos = new rnd.CursorPos(line, column, null);
                if (m_resolver.isAstNeededForCoCo()) {
                    var cu = this.parseAndGetAstInternal(resolver, repositoryAccess, source, null, null, cocoTriggerPos);
                    m_resolver.setCompilationUnitForCoCo(cu);
                }
                this.initParser(m_resolver);
                m_resolver.setInput(source, new rnd.CursorPos(1, 1, null), cocoTriggerPos, "");
                m_resolver.setSupportedAnnotations(this.getSupportedAnnotations());
                m_resolver.run(rnd.CompletionModes.COMPL_MODE_UNIQUE.getValue(), new DdlHaltedCallback(this, m_resolver), this
                    .getDefaultHaltedInterval());
                return m_resolver;
            } catch (e) {
                Console.log(e.stack);
            } finally {
                this.byteCode = localByteCode;
            }
        };
        DdlRndParserApi.prototype.getTypedCompletions4 = function(resolver,source,line,column) {
            var m_resolver = this.getCodeCompletions(resolver,source,line,column,null);
            if (m_resolver == null) {
                return [];
            }
            var completionNames = m_resolver.getTypedCompletionNames(m_resolver);
            return completionNames;
        };
        DdlRndParserApi.prototype.getTypedCompletions5 = function(resolver,repositoryAccess,source,line,column) {
            var m_resolver = this.getCodeCompletions(resolver,source,line,column,repositoryAccess);
            if (m_resolver == null) {
                return [];
            }
            var completionNames = m_resolver.getTypedCompletionNames(m_resolver);
            return completionNames;
        };
        DdlRndParserApi.prototype.getTypedCodeCompletions4 = function(resolver,source,line,column) {
            var m_resolver = this.getCodeCompletions(resolver,source,line,column,null);
            if (m_resolver == null) {
                return [];
            }
            var completionNames = m_resolver.getTypedCodeCompletionNames(m_resolver);
            return completionNames;
        };
        DdlRndParserApi.prototype.getTypedCodeCompletions5 = function(resolver,repositoryAccess,source,line,column) {
            var m_resolver = this.getCodeCompletions(resolver,source,line,column,repositoryAccess);
            if (m_resolver == null) {
                return [];
            }
            var completionNames = m_resolver.getTypedCodeCompletionNames(m_resolver);
            return completionNames;
        };
        DdlRndParserApi.prototype.getCompletions4 = function(resolver,source,line,column) {
            var m_resolver = this.getCodeCompletions(resolver,source,line,column,null);
            if (m_resolver == null) {
                return [];
            }
            var completionNames = m_resolver.getCodeCompletionNames(m_resolver);
            return completionNames;
        };
        DdlRndParserApi.prototype.getCompletions5 = function(resolver,repositoryAccess,source,line,column) {
            var m_resolver = this.getCodeCompletions(resolver,source,line,column,repositoryAccess);
            if (m_resolver == null) {
                return [];
            }
            var completionNames = m_resolver.getCodeCompletionNames(m_resolver);
            return completionNames;
        };
        DdlRndParserApi.prototype.getCurrentHaltedInterval = function() {
            return this.getDefaultHaltedInterval();
        };
        DdlRndParserApi.prototype.getDefaultHaltedInterval = function() {
            return 100*1000;
        };
        DdlRndParserApi.prototype.parseAndGetAst4 = function(resolver,repositoryAccess,source,visitor) {
            return this.parseAndGetAstInternal(resolver,repositoryAccess,source,visitor,null,null);
        };
        DdlRndParserApi.prototype.parseAndGetAstInternal = function(resolver,repositoryAccess,source,visitor,startRule,cocoTriggerPos) {
            var localByteCode = this.getAndCheckByteCode(resolver);
            var scanner = this.createDdlScanner(localByteCode);
            var m_resolver = this.versionFactory.createParser(this.version,localByteCode,scanner,null);
            if (startRule != null) {
                m_resolver.setStartRuleName(startRule);
            }
            if (cocoTriggerPos != null) {
                m_resolver.setTriggerPosForCoCo(cocoTriggerPos);
            }
            this.initParser(m_resolver);
            m_resolver.setInput(source, new rnd.CursorPos(1, 1, null), new rnd.CursorPos(-1, -1, null), null);
            m_resolver.visitor = visitor;
            m_resolver.setisActionDisabledDuringErrorReplay(false);
            m_resolver.run(rnd.CompletionModes.COMPL_MODE_GEN.getValue(), new DdlHaltedCallback(this, m_resolver), this.getDefaultHaltedInterval());
            this.byteCode = localByteCode;
            var compilationUnit = m_resolver.compilationUnit;
            if (compilationUnit == null) {
                return null;
            }
            compilationUnit.setParsedSource(source);
            compilationUnit.setTokenList(m_resolver.m_scanner.getInput());
            var statements = compilationUnit.getStatements();
            if (statements != null) {
                for (var statementCount = 0; statementCount < statements.length; statementCount++) {
                    var statement = statements[statementCount];
                    if (statement instanceof ViewDefinitionImpl) {
                        var vd = statement;
                        var selects = vd.getSelects();
                        if (selects.length > 0) {
                            var last = selects[selects.length - 1];
                            var ds = this.getDataSourceForStack(m_resolver,
                                last.getFrom());
                            last.setFrom(ds);
                        }
                    }
                }
            }
            this.calculateAssociationTargetReferences(compilationUnit,
                m_resolver.allAssociationDeclarations);
            compilationUnit.setRepositoryAccess(repositoryAccess);
            return compilationUnit;
        };
        DdlRndParserApi.prototype.calculateAssociationTargetReferences = function(
            cu, associationDeclarations) {
            for (var assocCount = 0; assocCount < associationDeclarations.length; assocCount++) {
                var assoc = associationDeclarations[assocCount];
                try {
                    if (assoc.eContainer() instanceof ViewSelectImpl) {
                        var ds = IAstFactory.eINSTANCE.createDataSource();
                        var targetPath = assoc.getTargetEntityPath();
                        var targetPathCopy = targetPath;//EcoreUtil.copy(targetPath);
                        ds.setNamePathExpression(targetPathCopy);
                        var entries = targetPath.getEntries();
                        var firstToken = entries[0].getNameToken();
                        var lastToken = entries[entries.length - 1].getNameToken();
                        var tokenFirstIndex = 0;
                        var tokenLastIndex = 0;
                        var tokens = cu.getTokenList();
                        for (var i = assoc.getStartTokenIndex() + 1; i < tokens.length; i++) {
                            if (firstToken === tokens[i]) {
                                tokenFirstIndex = i;
                            }
                            if (lastToken === tokens[i]) {
                                tokenLastIndex = i;
                                break;
                            }
                        }
                        ds.setStartTokenIndex(tokenFirstIndex);
                        ds.setEndTokenIndex(tokenLastIndex);
                        var nameToken = assoc.getNameToken();
                        if ((nameToken != null) && (Utils.stringCompareToIgnoreCase(nameToken.getM_lexem(), targetPath.getPathString(false)) != 0)) {
                            ds.setAliasToken(nameToken);
                            for (var j = tokenLastIndex + 1; j < tokens.length; j++) {
                                if (nameToken === tokens[j]) {
                                    tokenLastIndex = j;
                                    break;
                                }
                            }
                            ds.setEndTokenIndex(tokenLastIndex);
                        }
                        assoc.setTargetDataSource(ds);
                    }
                }
                catch(e) {
                    //silently ignored
                    //Console.log(e.stack);
                }
            }
        };
        DdlRndParserApi.prototype.getDataSourceForStack = function(
            resolver, currentDataSource) {
            var unusedDataSources = [];
            for (var lastFoundDataSourceCount = 0; lastFoundDataSourceCount < resolver.lastFoundDataSources.length; lastFoundDataSourceCount++) {
                var lastFoundDataSource = resolver.lastFoundDataSources[lastFoundDataSourceCount];
                if (lastFoundDataSource.eContainer() == null) {
                    unusedDataSources.push(lastFoundDataSource);
                }
            }
            if (unusedDataSources.length != 0) {
                for (var pos = unusedDataSources.length - 1; pos >= 0; pos--) {
                    var right = unusedDataSources[pos];
                    currentDataSource = resolver.viewparser_setDatasourcesForJoin(IAstFactory.eINSTANCE.createJoinDataSource(),JoinEnum.LEFT,currentDataSource,right,null);
                }
            }
            resolver.lastFoundDataSources = {};
            return currentDataSource;
        };
        DdlRndParserApi.prototype.parseAndGetAst2 = function(resolver,source) {
            return this.parseAndGetAstInternal(resolver,null,source,null,null,null);
        };
        DdlRndParserApi.prototype.parseAndGetAst3 = function(resolver,repositoryAccess,source) {
            return this.parseAndGetAstInternal(resolver,repositoryAccess,source,null,null,null);
        };
        DdlRndParserApi.prototype.assertByteCodeVersion = function(bc) {

        };
        DdlRndParserApi.prototype.setRepositoryAccess = function(access) {
        };
        DdlRndParserApi.prototype.getVersion = function() {
            return this.version;
        };
        DdlRndParserApi.prototype.setSupportedAnnotations = function(annots) {
            this.supportedAnnotations = annots;
        };
        DdlRndParserApi.prototype.getSupportedAnnotations = function() {
            return this.supportedAnnotations;
        };
        DdlRndParserApi.prototype.parseAnnotationDefinition = function(resolver,source) {
            return this.parseAndGetAstInternal(resolver,null,source,null,DdlRndParserApi.RULE_NAME_ANNOTATION_DEFINTIONS,null);
        };

        /*eslint-disable no-redeclare*/
        function DdlHaltedCallback(parserInstance, resolver) {
            this.parserInstance = parserInstance;
            this.resolver = resolver;
            this.lastTokenIndex = 0;
        }
        DdlHaltedCallback.prototype.run = function() {
            var currentTokenIndex = this.resolver.getCurrentTokenIndex();
            if(currentTokenIndex-this.lastTokenIndex<20) {
                haltTrace("DdlHaltedCallback timeout! halted @" + currentTokenIndex);
                if (this.parserInstance.throwExceptionAtTimeout) {
                    throw new Error("DdlHaltedCallback: Parser ran into a timeout"); //$NON-NLS-1$
                } else {
                    return true;
                }
            }
            this.lastTokenIndex = currentTokenIndex;
            haltTrace("DdlHaltedCallback halted @" + currentTokenIndex);
            return false;
        };
        DdlRndParserApi.prototype.resetInternalCaches = function() {
            this.allAnnotDefsAndEnumValues = null;
            this.byteCode = null;
        };
        DdlRndParserApi.prototype.throwExceptionAtTimeout = false;
        DdlRndParserApi.prototype.setThrowExceptionAtTimeout = function(throwExceptionAtTimeout) {
            this.throwExceptionAtTimeout = throwExceptionAtTimeout;
        };

        function haltTrace(m) {
            //console.log("HALT " + m);
        }

        return DdlRndParserApi;
    }
);
