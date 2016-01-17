// based on commit
//5af9117da94e3c9db8e54b0324a83ba181d6081d Catch up with backend grammar
define(["rndrt/rnd","hanaddl/hanaddlNonUi"], function (rnd,hanaddlNonUi) {
        "use strict";
        var DdlParserFactoryRespectingBackendVersion = hanaddlNonUi.DdlParserFactoryRespectingBackendVersion;
        var VersionsFactory = hanaddlNonUi.VersionsFactory;
        var ErrorState = rnd.ErrorState;
        var Utils = rnd.Utils;
        var Messages = hanaddlNonUi.Messages;

        function GrammarVersionDependentTests() {
        }
        GrammarVersionDependentTests.prototype = Object.create(null);
        GrammarVersionDependentTests.parserByVersion={};
        GrammarVersionDependentTests.padFileResolverByVersion={};
        GrammarVersionDependentTests.prototype.version=null;
        GrammarVersionDependentTests.versionFactory=VersionsFactory;
        GrammarVersionDependentTests.prototype.parserFactory=DdlParserFactoryRespectingBackendVersion.eInstance;
        GrammarVersionDependentTests.prototype.getParser = function() {
            if (!GrammarVersionDependentTests.parserByVersion[this.version]) {
                GrammarVersionDependentTests.parserByVersion[this.version]=this.createParserInteral();
            }
            return GrammarVersionDependentTests.parserByVersion[this.version];
        };
        GrammarVersionDependentTests.prototype.createParserInteral = function() {
            var parserApi = this.parserFactory.createParser(this.version);
            parserApi.setThrowExceptionAtTimeout(true);
            return parserApi;
        };
        GrammarVersionDependentTests.prototype.getPadFileResolver = function() {
            if (!GrammarVersionDependentTests.padFileResolverByVersion[this.version]) {
                GrammarVersionDependentTests.padFileResolverByVersion[this.version]=this.parserFactory.createResolver(this.version);
            }
            return GrammarVersionDependentTests.padFileResolverByVersion[this.version];
        };
        GrammarVersionDependentTests.prototype.getSupportedAnnotations = function() {
            return this.parserFactory.getSupportedAnnotations2(this.getParser(),this.version);
        };
        GrammarVersionDependentTests.prototype.parseSourceAndGetAst = function(source) {
            var parserApi = this.getParser();
            var compilationUnit=parserApi.parseAndGetAst3(this.getPadFileResolver(),null,source);
            return compilationUnit;
        };
        GrammarVersionDependentTests.prototype.parseSource = function(source) {
            var parserApi = this.getParser();
            var tokens=parserApi.parseSource(this.getPadFileResolver(),source);
            return tokens;
        };
        GrammarVersionDependentTests.prototype.assertNoErrorTokens = function(tokens) {
            for (var i=0; i < tokens.length; i++) {
                var t=tokens[i];
                if (t.m_err_state!==ErrorState.Correct) {
                    var minIndex = i-3>=0 ? i-3 : 0;
                    var maxIndex = i+1 < tokens.length ? i+1 : i;
                    var context = "";
                    var line = "?";
                    for(var j=minIndex; j<=maxIndex; j++) {
                        var lex = tokens[j].m_lexem;
                        if(j===i) {
                            line = tokens[j].m_line;
                            context += " >>>" + lex + "<<<";
                        } else {
                            context += " " + lex;
                        }
                    }
                    if (t.m_err_state===ErrorState.Suspicious) {
                        ok(true, "Suspicious token [#" + i + " line " + line + "]: " + context);
                    } else {
                        ok(false, "Incorrect token [#" + i + " line " + line + "]: " + context);
                    }
                } else {
                    equal(ErrorState.Correct, t.m_err_state);
                }
            }
        };
        GrammarVersionDependentTests.prototype.assertErrorTokenAtTokenIndex = function(tokens,expectedTokenIndex) {
            var errorFound=false;
            var acutalTokenIndex=0;
            for (var tCount=0; tCount<tokens.length; tCount++) {
                var t=tokens[tCount];
                if (ErrorState.Erroneous===t.m_err_state) {
                    equal(expectedTokenIndex,acutalTokenIndex);
                    errorFound=true;
                    return;
                }
                equal(ErrorState.Correct,t.m_err_state);
                acutalTokenIndex++;
            }
            if (errorFound === false) {
                Assert.fail1("An errorneous token at token index " + expectedTokenIndex + " was expected but not found");
            }
        };
        GrammarVersionDependentTests.prototype.assertToken5 = function(token,num,lexem,category,errorState) {
            equal(num,token.m_num);
            equal(lexem,token.m_lexem);
            equal(category,token.m_category);
            equal(errorState,token.m_err_state);
        };
        GrammarVersionDependentTests.prototype.assertToken4 = function(token,lexem,category,errorState) {
            equal(lexem,token.m_lexem);
            equal(category,token.m_category);
            equal(errorState,token.m_err_state);
        };
        GrammarVersionDependentTests.prototype.assertStartEndTokenIndex = function(actualSourceRange,expectedStartTokenIndex,expectedEndTokenIndex) {
            equal(expectedStartTokenIndex,actualSourceRange.getStartTokenIndex());
            equal(expectedEndTokenIndex,actualSourceRange.getEndTokenIndex());
        };
        GrammarVersionDependentTests.allParserVersionsAsParameters = function(startParserVersion) {
            var newestVersion=parseInt(VersionsFactory.versionLast);
            var requestedVersion=parseInt(startParserVersion);
            var parameters = [];
            if (requestedVersion > newestVersion) {
                GrammarVersionDependentTests.addParameterForVersion(parameters,requestedVersion);
            }
            for (var i=requestedVersion; i <= newestVersion; i++) {
                GrammarVersionDependentTests.addParameterForVersion(parameters,i);
            }
            return parameters;
        };
        GrammarVersionDependentTests.oneParserVersionAsParameters = function(parserVersion) {
            var parameters = [];
            var parameter = [""];
            parameter[0]=parserVersion;
            parameters.push(parameter);
            return parameters;
        };
        GrammarVersionDependentTests.addParameterForVersion = function(parameters,i) {
            var parameter = [""];
            parameter[0]=i;
            parameters.push(parameter);
        };
        GrammarVersionDependentTests.hideWelcomePage = function() {
            var ap = PlatformUI.getWorkbench().getActiveWorkbenchWindow().getActivePage();
            ap.hideView1(ap.findViewReference1("org.eclipse.ui.internal.introview"));
        };
        GrammarVersionDependentTests.prototype.get = function(completions,string) {
            for (var compCount = 0; compCount < completions.length; compCount++) {
                var comp = completions[compCount];
                var name = comp.getName();
                if (name === string) {
                    return comp;
                }
            }
            return null;
        };
        GrammarVersionDependentTests.prototype.assertNoAnnotationCompletions = function(completions) {
            for (var stringCount=0; stringCount<completions.length; stringCount++) {
                var string=completions[stringCount];
                if (string.length >= 2) {
                    equal(rnd.Utils.stringStartsWith(string, "@"),false);
                }
            }
        };
        GrammarVersionDependentTests.prototype.assertNoCompletions = function(completions) {
            rnd.Utils.arrayRemove(completions, Messages.BaseCdsDdlParser_list_incomplete_remove_syntax_errors_xmsg);
            equal(Utils.arrayIsEmpty(completions),true);
        };
        GrammarVersionDependentTests.prototype.getFirstAccessPolicy = function(cu) {
            return cu.getStatements()[0];
        };
        GrammarVersionDependentTests.prototype.getFirstRole = function(acp) {
            return acp.getStatements()[0];
        };
        GrammarVersionDependentTests.prototype.testSupportedVersions = function(method, async) {
            var that  = this;

            if(async) {
                var p = Q.delay(10);
            }

            var wrap = async ? window.withPromise : function(func) {
                return function() {
                    func.apply(this, arguments);
                };
            };

            test(method, wrap(function (assert) {
                var versions = that.parserVersions();
                for (var i = 0; i < versions.length; i++) {
                    that.version = versions[i][0].toString();
                    if(async) {
                        p = p.then( that[method](assert) );
                    } else {
                        if(that.setup) that.setup();
                        that[method](assert);
                        if(that.teardown) that.teardown();
                    }
                }
                if(async) {
                    return p;
                }
            }));
        };

    /*
        To be called from prototype e.g. TestsUnitV5MyTest.prototype.testAllMethodsInSupportedVersions()

        Tests all functions directly defined in _this_ prototype, each for the supported grammar
        versions i.e. a V5 test function will be tested for grammar V5, V6 ... maxVersion
     */
        GrammarVersionDependentTests.prototype.testAllMethodsInSupportedVersions = function(async) {

            var instance = Object.create(this);

            var props = Object.getOwnPropertyNames(this);

            for(var x in props) {
                var prop = props[x];
                if(prop.indexOf("__")==0) continue;
                if(prop=="setup") continue;
                if(prop=="teardown") continue;
                if(this[prop] instanceof Function) {
                    instance.testSupportedVersions(prop, async);
                }
            }
        };

        return GrammarVersionDependentTests;
    }
);
