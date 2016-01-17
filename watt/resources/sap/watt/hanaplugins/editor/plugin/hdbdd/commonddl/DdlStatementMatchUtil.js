/*eslint-disable no-eq-null,eqeqeq*/
define(
    ["rndrt/rnd","commonddl/astmodel/ContextDeclarationImpl","commonddl/astmodel/NamespaceDeclarationImpl"], //dependencies
    function (rnd,ContextDeclarationImpl,NamespaceDeclarationImpl) {
        var Utils = rnd.Utils;
        function DdlStatementMatchUtil() {
        }
        DdlStatementMatchUtil.CONTEXT_SEPR = ".";
        DdlStatementMatchUtil.getAllStatements = function(statements) {
            var result = [];
            if (statements != null) {
                for (var stmtCount = 0;stmtCount < statements.length;stmtCount++) {
                    var stmt = statements[stmtCount];
                    if (stmt instanceof ContextDeclarationImpl) {
                        var cd = stmt;
                        result = result.concat(DdlStatementMatchUtil.getAllStatements(cd.getStatements()));
                    }else{
                        result.push(stmt);
                    }
                }
            }
            return result;
        };
        DdlStatementMatchUtil.createEntityDeclarationFqnIndexMap = function(allEntityDeclarations) {
            var result = {};
            for (var eCount = 0;eCount < allEntityDeclarations.length;eCount++) {
                var e = allEntityDeclarations[eCount];
                var fqn = DdlStatementMatchUtil.getFqnInLowerCase(e);
                result[fqn] = e;
            }
            return result;
        };
        DdlStatementMatchUtil.getFqnInLowerCase = function(s) {
            var result = s.getName();
            var fqn = new rnd.StringBuffer();
            var context = s.eContainer();
            while (context instanceof ContextDeclarationImpl) {
                fqn.insert(0,(context).getName() + DdlStatementMatchUtil.CONTEXT_SEPR);
                context = context.eContainer();
            }
            result = fqn + result;
            return result.toLowerCase();
        };
        DdlStatementMatchUtil.getFullyQualifiedNameInLowerCase = function(name,entityByFqn) {
            if (name != null) {
                var result = name;
                if (Utils.stringContains(result, DdlStatementMatchUtil.CONTEXT_SEPR) == false) {
                    var lresult = DdlStatementMatchUtil.CONTEXT_SEPR + result.toLowerCase();
                    var keys = Object.keys(entityByFqn);
                    for (var i = 0;i < keys.length;i++) {
                        var key = keys[i];
                        if (Utils.stringEndsWith(key, lresult)) {
                            return key;
                        }
                    }
                }
                return result.toLowerCase();
            }
            return null;
        };
        DdlStatementMatchUtil.findBestMatch = function(givenFqn,entityByFqn,cu) {
            if (givenFqn == null || givenFqn.length == 0) {
                return null;
            }
            givenFqn = givenFqn.toLowerCase();
            var lastFoundFqn = null;
            var keys = Object.keys(entityByFqn);
            for (var i = 0;i < keys.length;i++) {
                var key = keys[i];
                var lfqn = key.toLowerCase();
                if (Utils.stringEndsWith(lfqn, givenFqn)) {
                    if (lastFoundFqn != null) {
                        return null;
                    }
                    lastFoundFqn = key;
                }
            }
            if (lastFoundFqn == null) {
                var ns = DdlStatementMatchUtil.getNamespace(cu);
                if (ns != null && ns.length > 0 && Utils.stringStartsWith(givenFqn, ns)) {
                    var lfqn1 = givenFqn.substring(ns.length + 1);
                    var stmt = DdlStatementMatchUtil.findBestMatch(lfqn1,entityByFqn,cu);
                    return stmt;
                }
                return null;
            }
            var stmt1 = entityByFqn[lastFoundFqn];
            return stmt1;
        };
        DdlStatementMatchUtil.getNamespace = function(cu) {
            var stmts = cu.getStatements();
            for (var stmtCount = 0;stmtCount < stmts.length;stmtCount++) {
                var stmt = stmts[stmtCount];
                if (stmt instanceof NamespaceDeclarationImpl) {
                    var s = stmt;
                    var name = s.getName();
                    return name;
                }
            }
            return null;
        };
        return DdlStatementMatchUtil;
    }
);