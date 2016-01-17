// based on commit
//449c081101fd3dfd46338cc1a3c4cb92f78b2304 CDS: Implement code completion for DCL statements
/*eslint-disable no-eq-null,eqeqeq,camelcase,max-params,quotes,complexity,max-statements,curly,max-len,no-empty,no-proto,no-redeclare,radix,no-undef,no-console,valid-jsdoc,no-constant-condition*/
define(
    ["rndrt/rnd","commonddl/commonddlNonUi","hanaddl/CompilationUnitUtil","hanaddl/NamespaceUtil","hanaddl/CompareUtil"], //dependencies
    function (rnd,commonddl,CompilationUnitUtil,NamespaceUtil,CompareUtil) {
        var ContextDeclarationImpl = commonddl.ContextDeclarationImpl;
        var NamespaceDeclarationImpl = commonddl.NamespaceDeclarationImpl;
        var CompilationUnitImpl = commonddl.CompilationUnitImpl;
        var NamedDeclarationImpl = commonddl.NamedDeclarationImpl;
        var AccessPolicyDeclarationImpl = commonddl.AccessPolicyDeclarationImpl;
        var RoleDeclarationImpl = commonddl.RoleDeclarationImpl;
        var EntityDeclarationImpl = commonddl.EntityDeclarationImpl;
        var TypeDeclarationImpl = commonddl.TypeDeclarationImpl;
        var ViewDefinitionImpl = commonddl.ViewDefinitionImpl;
        var ConstDeclarationImpl = commonddl.ConstDeclarationImpl;

        function ContextUtil() {
        }
        ContextUtil.getFqnWithNamespaceForEObject = function(stmt) {
            if (stmt instanceof NamedDeclarationImpl) {
                return ContextUtil.getFqnWithNamespace(stmt);
            }else if (stmt instanceof CompilationUnitImpl) {
                var cu = stmt;
                var namespaceName = NamespaceUtil.getNamespaceName(cu);
                return namespaceName;
            }
            throw new Error();
        };
        ContextUtil.getFqnWithNamespace = function(stmt) {
            var result = new rnd.StringBuffer(stmt.getName());
            var parent = stmt.eContainer();
            while (parent != null) {
                if (parent instanceof ContextDeclarationImpl || parent instanceof AccessPolicyDeclarationImpl || parent instanceof RoleDeclarationImpl) {
                    var namedDecl = parent;
                    result.insert(0,namedDecl.getName() + ".");
                }
                parent = parent.eContainer();
            }
            var cu = CompilationUnitUtil.getCu(stmt);
            var namespaceName = NamespaceUtil.getNamespaceName(cu);
            result.insert(0,namespaceName + "::");
            return result.toString();
        };
        ContextUtil.getFqn = function(stmt) {
            if (stmt == null) {
                return null;
            }
            var result = new rnd.StringBuffer(stmt.getName());
            var parent = stmt.eContainer();
            while (parent != null) {
                if (parent instanceof ContextDeclarationImpl || parent instanceof AccessPolicyDeclarationImpl) {
                    var c = parent;
                    result.insert(0,c.getName() + ".");
                }
                parent = parent.eContainer();
            }
            return result.toString();
        };
        ContextUtil.getRootContext = function(cu) {
            if (cu == null) {
                return null;
            }
            for (var stmtCount = 0;stmtCount < cu.getStatements().length;stmtCount++) {
                var stmt = cu.getStatements()[stmtCount];
                if (stmt instanceof ContextDeclarationImpl) {
                    return stmt;
                }
            }
            return null;
        };
        ContextUtil.getRootContextOrAccessPolicyOrEntityOrTypeOrViewOrConst = function(cu) {
            if (cu == null) {
                return null;
            }
            for (var stmtCount = 0;stmtCount < cu.getStatements().length;stmtCount++) {
                var stmt = cu.getStatements()[stmtCount];
                if (stmt instanceof ContextDeclarationImpl || stmt instanceof AccessPolicyDeclarationImpl ||
                    stmt instanceof EntityDeclarationImpl || stmt instanceof TypeDeclarationImpl ||
                    stmt instanceof ViewDefinitionImpl || stmt instanceof ConstDeclarationImpl) {
                    return stmt;
                }
            }
            return null;
        };
        ContextUtil.getFqnRootContextName = function(cu) {
            if (cu == null) {
                return null;
            }
            var namespace = null;
            var rootContextName = null;
            for (var stmtCount = 0;stmtCount < cu.getStatements().length;stmtCount++) {
                var stmt = cu.getStatements()[stmtCount];
                if (stmt instanceof NamespaceDeclarationImpl) {
                    namespace = stmt.getName();
                }else if (stmt instanceof ContextDeclarationImpl) {
                    rootContextName = stmt.getName();
                }
                if (namespace != null && rootContextName != null) {
                    break;
                }
            }
            if (namespace != null && rootContextName != null) {
                var fqn = namespace + "::" + rootContextName;
                return fqn;
            }
            return null;
        };
        ContextUtil.getFqnRootAccessPolicyName = function(cu) {
            if (cu == null) {
                return null;
            }
            var namespace = null;
            var rootAccessPolicyName = null;
            for (var stmtCount = 0;stmtCount < cu.getStatements().length;stmtCount++) {
                var stmt = cu.getStatements()[stmtCount];
                if (stmt instanceof NamespaceDeclarationImpl) {
                    namespace = stmt.getName();
                }else if (stmt instanceof AccessPolicyDeclarationImpl) {
                    rootAccessPolicyName = stmt.getName();
                }
                if (namespace != null && rootAccessPolicyName != null) {
                    break;
                }
            }
            if (namespace != null && rootAccessPolicyName != null) {
                var fqn = namespace + "::" + rootAccessPolicyName;
                return fqn;
            }
            return null;
        };
        ContextUtil.isContextPathNecessary = function(currentFqn,targetFqn) {
            if (currentFqn == null || targetFqn == null) {
                return false;
            }
            if (targetFqn.length > currentFqn.length) {
                return true;
            }else if (targetFqn.length == currentFqn.length) {
                if (CompareUtil.equalsIgnoreQuotesAndCase(currentFqn,targetFqn)) {
                    return false;
                }else{
                    return true;
                }
            }
            var current = currentFqn.substring(0,targetFqn.length);
            if (CompareUtil.equalsIgnoreQuotesAndCase(current,targetFqn)) {
                if (currentFqn.charAt(targetFqn.length) == '.') {
                    return false;
                }else{
                    return true;
                }
            }else{
                return true;
            }
        };
        return ContextUtil;
    }
);