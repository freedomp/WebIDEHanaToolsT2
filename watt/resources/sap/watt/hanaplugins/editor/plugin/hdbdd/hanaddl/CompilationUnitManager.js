/*eslint-disable no-eq-null,eqeqeq,no-undef*/
define(
    ["rndrt/rnd","commonddl/commonddlNonUi","hanaddl/ContextUtil","hanaddl/CompareUtil", "hanaddl/hanaddlCache"], //dependencies
    function (rnd,commonddl,ContextUtil,CompareUtil, Cache) {

        var Context = Cache.context;

        var DdlRndParserAPI = commonddl.DdlRndParserApi;

        function CompilationUnitManager() {

        }
        CompilationUnitManager.singleton = new CompilationUnitManager();

        CompilationUnitManager.prototype.getRootContexts = function (project,rootContextPattern) {
            if (this.injectedAsts !== undefined) {
                return this.getRootContextsFromTestData(rootContextPattern);
            }
            return [];
        };

        CompilationUnitManager.prototype.getContextDeclarations = function (project, excludedFqnRootContextName) {
            if (this.injectedAsts !== undefined) {
                return this.getContextDeclarationsFromTestData(excludedFqnRootContextName);
            }
            return [];
        };

        CompilationUnitManager.prototype.getConstDeclarations2 = function (project, excludedFqnRootContextName) {
            if (this.injectedAsts !== undefined) {
                return this.getConstDeclarationsFromTestData(excludedFqnRootContextName);
            }
            return [];
        };

        CompilationUnitManager.prototype.getStructureTypeDeclarations2 = function (project,excludedFqnRootContextName) {
            if (this.injectedAsts !== undefined) {
                return this.getTypeDeclarationsFromTestData(excludedFqnRootContextName,true);
            }
            return [];
        };

        CompilationUnitManager.prototype.getTypeDeclarations2 = function (project,excludedFqnRootContextName) {
            if (this.injectedAsts !== undefined) {
                return this.getTypeDeclarationsFromTestData(excludedFqnRootContextName,false);
            }
            return [];
        };

        CompilationUnitManager.prototype.getEntityDeclarations2 = function (project, excludedFqnRootContextName) {
            if (this.injectedAsts !== undefined) {
                return this.getEntityDeclarationsFromTestData(excludedFqnRootContextName);
            }
            return [];
        };

        CompilationUnitManager.prototype.getViewDefinitions2 = function (project, excludedFqnRootContextName) {
            if (this.injectedAsts !== undefined) {
                return this.getViewDefinitionsFromTestData(excludedFqnRootContextName);
            }
            return [];
        };

        CompilationUnitManager.prototype.getAspectDeclarationsWithExclusion = function(project, fqnRootAspectNameToExclude) {
            if (this.injectedAsts !== undefined) {
                return this.getAspectDeclarationsFromTestData(fqnRootAspectNameToExclude);
            }
            return [];
        };

        CompilationUnitManager.prototype.getCUs = function(project) {
            if (this.injectedAsts != null) {
                return this.getTestDataCus();
            }
            return null;
        };

        CompilationUnitManager.prototype.getCU = function (fqn, project) {
            if (this.injectedAsts !== undefined) {
                var cu = this.getTestDataCu(fqn);
                if (cu != null) {
                    return cu;
                } else {
                    return this.parseAndGetCuUsingCache(fqn, project);
                }
            }
            return this.parseAndGetCuUsingCache(fqn, project);
        };

        CompilationUnitManager.prototype.async_getCU = function (fqn, project) {
            if (this.injectedAsts !== undefined) {
                var cu = this.getTestDataCu(fqn);
                if (cu != null) {
                    return Q.resolve(cu);
                }
            }
            return this.async_parseAndGetCuUsingCache(fqn, project);
        };

        CompilationUnitManager.astCacheByFqn = {};

        CompilationUnitManager.prototype.parseAndGetCuUsingCache = function (fqn, project) {
            var cache = CompilationUnitManager.astCacheByFqn[fqn];
            if (cache != null) {
                var diff = new Date().getTime() - cache.time;
                if (diff < 30 * 1000) { // cache lives for 30 seconds since last access
                    cache.time = new Date().getTime();
                    return cache.ast;
                }
            }
            var ast = this.parseAndGetCU(fqn,project);
            if (ast != null) {
                CompilationUnitManager.astCacheByFqn[fqn] = {time: new Date().getTime(), ast: ast};
            }
            return ast;
        };

        CompilationUnitManager.prototype.async_parseAndGetCuUsingCache = function (fqn, project) {

            var cache = CompilationUnitManager.astCacheByFqn[fqn];
            if (cache != null) {
                var diff = new Date().getTime() - cache.time;
                if (diff < 30 * 1000) { // cache lives for 30 seconds since last access
                    cache.time = new Date().getTime();
                    return Q.resolve(cache.ast);
                }
            }

            return this.async_parseAndGetCU(fqn,project)
                .then(function(ast){
                    if (ast != null) {
                        CompilationUnitManager.astCacheByFqn[fqn] = {time: new Date().getTime(), ast: ast};
                    }
                    return Q.resolve(ast);
                });
        };

        function getFileContent(path) {
            if (rnd.Utils.stringEndsWith(path,".hdbcds") === false || path.indexOf("?") >= 0 || path.indexOf("#") >= 0 ||
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

        function async_getFileContent(path) {

            if (rnd.Utils.stringEndsWith(path,".hdbcds") === false || path.indexOf("?") >= 0 || path.indexOf("#") >= 0 ||
                path.indexOf("\n") > 0 || path.indexOf("&") >= 0){
                return Q.resolve(null); // not a valid .pad file path
            }

            return Context.service.filesystem.documentProvider.getDocument(path)
                .then(function(doc){
                    return Q.resolve(doc.getContent());
                })
                .fail(function(e){
                    return Q.resolve(null);
                });
        }

        CompilationUnitManager.prototype.parseAndGetCU = function (fqn, project) {
            try {
                var path = fqn;
                if (path.lastIndexOf(".") > path.indexOf("::")) {
                    // remove last part
                    path = path.substring(0, path.lastIndexOf("."));
                }
                path = rnd.Utils.stringReplaceAll(path, ".", "/");
                path = rnd.Utils.stringReplaceAll(path, "::","/") + ".hdbcds";
                var reqUrl = "/sap/hana/xs/dt/base/file/" + path;
                if(project.rootPath) {
                    reqUrl = project.rootPath + "/" + path;
                }
                var source = getFileContent(reqUrl);
                if (source != null && project instanceof DdlRndParserAPI) {
                    var resolver = project.versionFactory.createPadFileResolver(project.version);
                    var ast = project.parseAndGetAst2(resolver, source);
                    return ast;
                }
            } catch (e) {
                return null;
            }
        };

        CompilationUnitManager.prototype.async_parseAndGetCU = function (fqn, project) {
            var path = fqn;
            if (path.lastIndexOf(".") > path.indexOf("::")) {
                // remove last part
                path = path.substring(0, path.lastIndexOf("."));
            }
            path = rnd.Utils.stringReplaceAll(path, ".", "/");
            path = rnd.Utils.stringReplaceAll(path, "::","/") + ".hdbcds";
            var reqUrl = "/sap/hana/xs/dt/base/file/" + path;
            if(project.rootPath) {
                reqUrl = project.rootPath + "/" + path;
            }
            return async_getFileContent(reqUrl)
                .then(function(source){
                    if (source != null && project instanceof DdlRndParserAPI) {
                        var resolver = project.versionFactory.createPadFileResolver(project.version);
                        var ast = project.parseAndGetAst2(resolver, source);
                        return Q.resolve(ast);
                    }
                })
                .fail(function(e){
                    return Q.resolve(null);
                });
        };

        CompilationUnitManager.isStructuredType = function(td) {
            var elements = td.getElements();
            if (elements != null) {
                if (elements.length > 1) {
                    return true;
                }else if (elements.length == 1) {
                    var el = elements[0];
                    var name = el.getName();
                    if (name != null && name.length > 0) {
                        return true;
                    }
                }
            }
            return false;
        };

        // ========================================================================
        // test data handling
        // ========================================================================

        CompilationUnitManager.prototype.addTestData = function (ast) {
            if (this.injectedAsts === undefined) {
                this.injectedAsts = [];
            }
            var rc = ContextUtil.getRootContextOrAccessPolicyOrEntityOrTypeOrViewOrConst(ast);
            if (rc == null) {
                return; //no root context found; don't store AST
            }
            //ensure that we don't keep duplicates
            var rcn = rc.getName();
            this.removeTestDataForContext(rcn);
            this.injectedAsts.push(ast);
        };

        CompilationUnitManager.prototype.removeTestDataForContext = function(rootContextName) {
            if (rootContextName == null || rootContextName.length == 0) {return;}
            if (this.injectedAsts === undefined) {return;}
            for (var i = this.injectedAsts.length - 1;i >= 0; i--) {
                var ast = this.injectedAsts[i];
                var ctx = ContextUtil.getRootContextOrAccessPolicyOrEntityOrTypeOrViewOrConst(ast);
                if (ctx == null) {
                    continue;
                }
                var rcn = ctx.getName();
                if (rcn === rootContextName) {
                    this.injectedAsts.splice(i,1);
                }
            }
        };

        CompilationUnitManager.prototype.clearTestData = function () {
            this.injectedAsts = undefined;
        };

        CompilationUnitManager.prototype.getTestDataCus = function () {
            return this.injectedAsts;
        };

        CompilationUnitManager.prototype.getTestDataCu = function (fqn) {
            for (var i = 0;i < this.injectedAsts.length;i++) {
                var stmts = this.injectedAsts[i].getStatements();
                var res = this.getTestDataCuForStmts(stmts,fqn);
                if (res != null) {
                    return this.injectedAsts[i];
                }
            }
            return null;
        };

        CompilationUnitManager.prototype.getTestDataCuForStmts = function(stmts,fqn) {
            for (var i = 0;i < stmts.length;i++) {
                var f = ContextUtil.getFqnWithNamespace(stmts[i]);
                if (rnd.Utils.stringEqualsIgnoreCase(fqn,f) == true) {
                    return stmts[i];
                }
                if (stmts[i] instanceof commonddl.ContextDeclarationImpl) {
                    var r = this.getTestDataCuForStmts(stmts[i].getStatements(),fqn);
                    if (r != null) {
                        return r;
                    }
                }
            }
        };

        CompilationUnitManager.prototype.getAspectDeclarationsFromTestData = function (excludedFqnRootContextName) {
            var result = [];
            for (var i = 0;i < this.injectedAsts.length;i++) {
                var stmts = this.injectedAsts[i].getStatements();
                var nsp = ContextUtil.getFqnRootAccessPolicyName(this.injectedAsts[i]);
                if (CompareUtil.equalsIgnoreQuotesAndCase(excludedFqnRootContextName,nsp)) {
                    continue;
                }
                this.fillAspectDeclarations(result, stmts);
            }
            return result;
        };

        CompilationUnitManager.prototype.fillAspectDeclarations = function(result,stmts) {
            for (var i = 0; i < stmts.length; i++) {
                if (stmts[i] instanceof commonddl.AspectDeclarationImpl) {
                    result.push(stmts[i]);
                }else if (commonddl.StatementContainerImpl.isStatementContainerInstance(stmts[i])) {
                    this.fillAspectDeclarations(result,stmts[i].getStatements());
                }else if (stmts[i] instanceof commonddl.RoleDeclarationImpl) {
                    this.fillAspectDeclarations(result,stmts[i].getEntries());
                }
            }
        };

        CompilationUnitManager.prototype.getRootContextsFromTestData = function (rootContextPattern) {
            var result = [];
            for (var i = 0;i < this.injectedAsts.length;i++) {
                var rc = ContextUtil.getRootContext(this.injectedAsts[i]);
                var rn = rc.getName();
                if (CompareUtil.startsWithIgnoreQuotesAndCase(rn, rootContextPattern)) {
                    result.push(rc);
                }
            }
            return result;
        };

        CompilationUnitManager.prototype.getContextDeclarationsFromTestData = function (excludedFqnRootContextName) {
            var result = [];
            for (var i = 0;i < this.injectedAsts.length;i++) {
                var stmts = this.injectedAsts[i].getStatements();
                var nsp = ContextUtil.getFqnRootContextName(this.injectedAsts[i]);
                if (CompareUtil.equalsIgnoreQuotesAndCase(excludedFqnRootContextName,nsp)) {
                    continue;
                }
                this.fillContextDeclarations(result, stmts);
            }
            return result;
        };

        CompilationUnitManager.prototype.fillContextDeclarations = function(result,stmts) {
            for (var i = 0; i < stmts.length; i++) {
                if (stmts[i] instanceof commonddl.ContextDeclarationImpl) {
                    result.push(stmts[i]);
                    this.fillContextDeclarations(result,stmts[i].getStatements());
                }
            }
        };

        CompilationUnitManager.prototype.getViewDefinitionsFromTestData = function (excludedFqnRootContextName) {
            var result = [];
            for (var i = 0;i < this.injectedAsts.length;i++) {
                var stmts = this.injectedAsts[i].getStatements();
                var nsp = ContextUtil.getFqnRootContextName(this.injectedAsts[i]);
                if (CompareUtil.equalsIgnoreQuotesAndCase(excludedFqnRootContextName,nsp)) {
                    continue;
                }
                this.fillViewDefinitions(result, stmts);
            }
            return result;
        };

        CompilationUnitManager.prototype.fillViewDefinitions = function(result,stmts) {
            for (var i = 0; i < stmts.length; i++) {
                if (stmts[i] instanceof commonddl.ViewDefinitionImpl) {
                    result.push(stmts[i]);
                }else if (stmts[i] instanceof commonddl.ContextDeclarationImpl) {
                    this.fillViewDefinitions(result,stmts[i].getStatements());
                }
            }
        };

        CompilationUnitManager.prototype.getEntityDeclarationsFromTestData = function (excludedFqnRootContextName) {
            var result = [];
            for (var i = 0;i < this.injectedAsts.length;i++) {
                var stmts = this.injectedAsts[i].getStatements();
                var nsp = ContextUtil.getFqnRootContextName(this.injectedAsts[i]);
                if (CompareUtil.equalsIgnoreQuotesAndCase(excludedFqnRootContextName,nsp)) {
                    continue;
                }
                this.fillEntityDeclarations(result, stmts);
            }
            return result;
        };

        CompilationUnitManager.prototype.getConstDeclarationsFromTestData = function (excludedFqnRootContextName) {
            var result = [];
            for (var i = 0;i < this.injectedAsts.length;i++) {
                var stmts = this.injectedAsts[i].getStatements();
                var nsp = ContextUtil.getFqnRootContextName(this.injectedAsts[i]);
                if (CompareUtil.equalsIgnoreQuotesAndCase(excludedFqnRootContextName,nsp)) {
                    continue;
                }
                this.fillConstDeclarations(result, stmts);
            }
            return result;
        };

        CompilationUnitManager.prototype.getTypeDeclarationsFromTestData = function (excludedFqnRootContextName,onlyStructuredTypes) {
            var result = [];
            for (var i = 0;i < this.injectedAsts.length;i++) {
                var stmts = this.injectedAsts[i].getStatements();
                var nsp = ContextUtil.getFqnRootContextName(this.injectedAsts[i]);
                if (CompareUtil.equalsIgnoreQuotesAndCase(excludedFqnRootContextName,nsp)) {
                    continue;
                }
                this.fillTypeDeclarations(result, stmts,onlyStructuredTypes);
            }
            return result;
        };

        CompilationUnitManager.prototype.fillConstDeclarations = function(result,stmts) {
            for (var i = 0; i < stmts.length; i++) {
                if (stmts[i] instanceof commonddl.ConstDeclarationImpl) {
                    result.push(stmts[i]);
                }else if (stmts[i] instanceof commonddl.ContextDeclarationImpl) {
                    this.fillConstDeclarations(result,stmts[i].getStatements());
                }
            }
        };

        CompilationUnitManager.prototype.fillTypeDeclarations = function(result,stmts,onlyStructuredTypes) {
            for (var i = 0; i < stmts.length; i++) {
                if (stmts[i] instanceof commonddl.TypeDeclarationImpl) {
                    if (onlyStructuredTypes == true) {
                        if (CompilationUnitManager.isStructuredType(stmts[i]) == true) {
                            result.push(stmts[i]);
                        }
                    }else{
                        //only simple types?
                        result.push(stmts[i]);
                    }

                }else if (stmts[i] instanceof commonddl.ContextDeclarationImpl) {
                    this.fillTypeDeclarations(result,stmts[i].getStatements(),onlyStructuredTypes);
                }
            }
        };

        CompilationUnitManager.prototype.fillEntityDeclarations = function(result,stmts) {
            for (var i = 0; i < stmts.length; i++) {
                if (stmts[i] instanceof commonddl.EntityDeclarationImpl) {
                    result.push(stmts[i]);
                }else if (stmts[i] instanceof commonddl.ContextDeclarationImpl) {
                    this.fillEntityDeclarations(result,stmts[i].getStatements());
                }
            }
        };

        return CompilationUnitManager;
    }
);