// based on commit
//fd7a485712c27311346f9384ea3849427248f1e6 CDS: Make semicolon optional / New grammar version 4
/*eslint-disable no-eq-null,eqeqeq,camelcase,max-params,quotes,complexity,max-statements,curly,max-len,no-empty,no-proto,no-redeclare,radix,no-undef,no-console,valid-jsdoc,no-constant-condition*/
define(
    ["commonddl/commonddlNonUi","hanaddl/VersionsFactory","rndrt/rnd"], //dependencies
    function (commonddl,VersionsFactory,rnd) {
        var DdlRndParserApi = commonddl.DdlRndParserApi;
        var DdlParserFactoryBackendVersion = commonddl.DdlParserFactoryBackendVersion;
        /*global console*/
        var Console = null;
        if (typeof console !== "undefined") {
            Console = console;
        }else{
            Console = {log:function() {}};
        }

        function DdlParserFactoryRespectingBackendVersion() {
        }
        DdlParserFactoryRespectingBackendVersion.prototype = Object.create(DdlParserFactoryBackendVersion.prototype);
        DdlParserFactoryRespectingBackendVersion.eInstance = new DdlParserFactoryRespectingBackendVersion();

        DdlParserFactoryRespectingBackendVersion.prototype.mapToClientVersion = function(project) {
            var parser = DdlParserFactoryBackendVersion.parserByProject[project];
            if (parser != null) {
                var version = parser.getVersion();
                if (version != null) {
                    return version;
                }
            }
            version = this.getCdsFeatureWithTimeout(project);
            return version;
        };
        //!!!! needed for js implementation
        DdlParserFactoryRespectingBackendVersion.prototype.createResolver = function(version, padFilePath) {
            return new VersionsFactory().createPadFileResolver(version, padFilePath);
        };
        DdlParserFactoryRespectingBackendVersion.prototype.createParserAndResolver = function(destination) {
            throw new Error();
            /*
            var parser=this.getFromCache(destination);
            if (parser != null) {
                var v=parser.getVersion();
                var resolver=this.createResolver(v);
                return [parser,resolver];
            }
            try {
                var version=CdsVersionCheckUtil.getCdsFeature(destination);
                if (version != null) {
                    var v=this.versionAsString(version);
                    parser=this.createParser(v);
                    var resolver=this.createResolver(v);
                    return [parser,resolver];
                }
            }
            catch(e) {
                Console.log(e.stack);
            }
            return null;
            */
        };
        DdlParserFactoryRespectingBackendVersion.prototype.getFromCache = function(destination) {
            throw new Error("unexpected case");
            /*
            for (var pCount=0;pCount<Object.keys(DdlParserFactoryBackendVersion.parserByProject).length;pCount++) {
                var p=Object.keys(DdlParserFactoryBackendVersion.parserByProject)[pCount];
                var hp=p.getAdapter(IHanaProject.class);
                if (hp == null) {
                    continue;
                }
                var d=hp.getDestination();
                if (d == null) {
                    continue;
                }
                if (d===destination) {
                    var res=DdlParserFactoryBackendVersion.parserByProject[p];
                    return res;
                }
            }
            return null;
            */
        };
        DdlParserFactoryRespectingBackendVersion.prototype.getCdsFeatureWithTimeout = function(project) {
            throw new Error("unexpected case");
            /*
            var version=null;
            try {
                version=CdsVersionCheckUtil.getAndCheckCdsFeature(new NullProgressMonitor(),project,true);
            }
            catch(e) {
            }
            var result=this.versionAsString(version);
            return result;
            */
        };
        DdlParserFactoryRespectingBackendVersion.prototype.versionAsString = function(version) {
            var result = null;
            if (version == null) {
                result = VersionsFactory.versionLast;
            }else if (version == 0) {
                result = VersionsFactory.version1;
            }else{
                result = version.toString();
            }
            return result;
        };
        DdlParserFactoryRespectingBackendVersion.prototype.getSupportedAnnotations3 = function(project,parser,version) {
            try {
                var annotationDefinitions = this.getAnnotationDefinitions(version);
                var cu = parser.parseAnnotationDefinition(this.createResolver(version),annotationDefinitions);
                this.assertTokens(cu);
                return cu;
            }
            catch(e) {
                Console.log(e.stack);
            }
            return null;
        };
        DdlParserFactoryRespectingBackendVersion.prototype.getSupportedAnnotations2 = function(parser,version) {
            try {
                var annotationDefinitions = this.getAnnotationDefinitions(version);
                var cu = parser.parseAnnotationDefinition(this.createResolver(version),annotationDefinitions);
                return cu;
            }
            catch(e) {
                Console.log(e.stack);
            }
            return null;
        };
        DdlParserFactoryRespectingBackendVersion.prototype.assertTokens = function(cu) {
            var tokens = cu.getTokenList();
            if (tokens != null) {
                for (var tCount = 0;tCount < tokens.length;tCount++) {
                    var t = tokens[tCount];
                    if (rnd.ErrorState.Erroneous === t.m_err_state) {
                        Console.log(new Error("couldn't parse annotation definitions. errorneous token found: " + t).stack);
                        return;
                    }
                }
            }
        };

        function getAnnotationsContent(path) {
            if (rnd.Utils.stringEndsWith(path,".txt") === false || path.indexOf("?") >= 0 || path.indexOf("#") >= 0 ||
                path.indexOf("\n") > 0 || path.indexOf("&") >= 0){
                return null; // not a valid .pad file path
            }
            // limit XHR call to pad files
            var http = null;
            if ((typeof document !== "undefined") && document.defaultView.navigator.appName === "Microsoft Internet Explorer") {
                http = new ActiveXObject("Microsoft.XMLHTTP");
            } else {
                http = new XMLHttpRequest();
            }
            http.open("GET", path, false);
            http.send(null);
            return http.responseText;
        }

        DdlParserFactoryRespectingBackendVersion.prototype.getAnnotationDefinitions = function(version) {
            function getFilePath(name) {
                /*eslint-disable sap-browser-api-warning,guard-for-in*/
                var scripts = document.getElementsByTagName("script");
                for (var q in scripts) {
                    var s = scripts[q].src;
                    if (rnd.Utils.stringEndsWith(s, name)) { //find DdlParser.js entry in loaded scripts
                        var lind = s.lastIndexOf("/");
                        var p = s.substring(0,lind);
                        return p;
                    }
                }
                return "";
            }
            var path = getFilePath("hanaddlNonUi.js");
            if (VersionsFactory.version1 === version) {
                path += "/hanav1/annotations.txt";
                var annots = getAnnotationsContent(path);
                return annots;
            }else if (VersionsFactory.version2 === version) {
                path += "/hanav2/annotations.txt";
                annots = getAnnotationsContent(path);
                return annots;
            }else if (VersionsFactory.version3 === version) {
                path += "/hanav3/annotations.txt";
                annots = getAnnotationsContent(path);
                return annots;
            }else if (VersionsFactory.version4 === version) {
                path += "/hanav4/annotations.txt";
                annots = getAnnotationsContent(path);
                return annots;
            }else if (VersionsFactory.version5 === version) {
                path += "/hanav5/annotations.txt";
                annots = getAnnotationsContent(path);
                return annots;
            }else{
                path += "/hanav5/annotations.txt";
                annots = getAnnotationsContent(path);
                return annots;
            }
        };
        DdlParserFactoryRespectingBackendVersion.prototype.createVersionFactory = function() {
            return new VersionsFactory();
        };
        DdlParserFactoryRespectingBackendVersion.clearCache = function(project) {
            delete DdlParserFactoryBackendVersion.parserByProject[project];
        };
        DdlParserFactoryRespectingBackendVersion.prototype.createParser = function(version) {
            var strictSeparationAtPlusMinus = true;
            var strictSeparationAtSlash = true;
            var createDotDotTokens = false;
            var createEnumIDs = true;
            if (VersionsFactory.version1 === version || VersionsFactory.version2 === version) {
                createEnumIDs = false;
            }
            var createColonFollowedByIdTokens = true;
            if (VersionsFactory.version1 === version || VersionsFactory.version2 === version) {
                createColonFollowedByIdTokens = false;
            }
            var createPipePipeTokens = true;
            return this.createParserWithDifferentStartRule(version,strictSeparationAtPlusMinus,strictSeparationAtSlash,createDotDotTokens,createEnumIDs,createColonFollowedByIdTokens,createPipePipeTokens);
        };
        DdlParserFactoryRespectingBackendVersion.prototype.createParserWithDifferentStartRule = function(version,strictSeparationAtPlusMinus,strictSeparationAtSlash,createDotDotTokens,createEnumIDs,createColonFollowedByIdTokens,createPipePipeTokens) {

            var api = DdlRndParserApi.DdlRndParserApi7(version,this.getVersionFactory(),strictSeparationAtPlusMinus,strictSeparationAtSlash,createDotDotTokens,createEnumIDs,createColonFollowedByIdTokens,createPipePipeTokens);
            api.initBeforeParseSource = function(parser) {
                parser.setStartRuleName("START_SYNTAX_COLORING");
            };
            return api;
        };
        DdlParserFactoryRespectingBackendVersion.prototype.injectParser = function(project,version) {
            var parser = this.createParser(version);
            if (project != null) {
                DdlParserFactoryBackendVersion.parserByProject[project] = parser;
            }
        };
        return DdlParserFactoryRespectingBackendVersion;
    }
);
