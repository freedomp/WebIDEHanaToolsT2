// based on commit
//6ddcfb9df80c90c7e0ef23adb08027c07a62b0aa CDS: Fix checking if a path is a prefix of another path
/*eslint-disable no-eq-null,eqeqeq,camelcase,max-params,quotes,complexity,max-statements,curly,max-len,no-empty,no-proto,no-redeclare,radix,no-undef,no-console,valid-jsdoc,no-constant-condition*/
define(
    ["commonddl/commonddlNonUi","hanaddl/CompareUtil", "rndrt/rnd"], //dependencies
    function (commonddl,CompareUtil, rnd) {
        var NamespaceDeclarationImpl = commonddl.NamespaceDeclarationImpl;

        function NamespaceUtil() {
        }
        NamespaceUtil.getNamespaceName = function(cu) {
            for (var stmtCount = 0;stmtCount < cu.getStatements().length;stmtCount++) {
                var stmt = cu.getStatements()[stmtCount];
                if (stmt instanceof NamespaceDeclarationImpl) {
                    var name = stmt.getName();
                    return name;
                }
            }
            return null;
        };
        NamespaceUtil.getNamespaceDeclaration = function(cu) {
            for (var stmtCount = 0;stmtCount < cu.getStatements().length;stmtCount++) {
                var stmt = cu.getStatements()[stmtCount];
                if (stmt instanceof NamespaceDeclarationImpl) {
                    return stmt;
                }
            }
            return null;
        };
        NamespaceUtil.getRelativeContextPath = function(fqn,baseFqn) {
            if (fqn == null || baseFqn == null || rnd.Utils.stringContains(fqn, "::") == false || rnd.Utils.stringContains(baseFqn, "::") == false) {
                throw new Error("parameters are not fully qualified (namespace missing)");
            }
            var ns = NamespaceUtil.getNamespace(fqn);
            var basens = NamespaceUtil.getNamespace(baseFqn);
            if (CompareUtil.equalsIgnoreQuotesAndCase(ns,basens) == false) {
                throw new Error();
            }
            var fqnLower = fqn.toLowerCase();
            var baseFqnLower = baseFqn.toLowerCase();
            if (fqnLower === baseFqnLower) {
                return "";
            }
            if (CompareUtil.isPrefixOfPath(fqnLower,baseFqnLower)) {
                var res = fqn.substring(baseFqn.length + 1);
                if (res.length == 0) {
                    res = fqn.substring(baseFqn.lastIndexOf(".") + 1);
                }
                return res;
            }
            var res = NamespaceUtil.removeNamespace(fqn);
            return res;
        };
        NamespaceUtil.getPathElements = function(path) {
            var result = [];
            if (path != null) {
                var i = 0;
                var start = 0;
                /*eslint-disable no-constant-condition*/
                while (true) {
                    var c = path.charAt(i);
                    if (c == '"') {
                        i++;
                        if (i >= path.length) {
                            break;
                        }
                        while (true) {
                            c = path.charAt(i);
                            var next = i >= path.length - 1 ? ' ' : path.charAt(i + 1);
                            if (c == '"') {
                                if (next == '"') {
                                    i++;
                                }else{
                                    break;
                                }
                            }
                            i++;
                            if (i >= path.length) {
                                break;
                            }
                        }
                    }else if (c == '.') {
                        var pathElement = path.substring(start,i);
                        result.push(pathElement);
                        start = i + 1;
                    }
                    i++;
                    if (i >= path.length) {
                        break;
                    }
                }
                result.push(path.substring(start,path.length));
            }
            return result;
        };
        NamespaceUtil.getNamespace = function(fqn) {
            if (fqn == null) {
                return null;
            }
            var ind = fqn.indexOf("::");
            if (ind < 0) {
                throw new Error();
            }
            fqn = fqn.substring(0,ind);
            return fqn;
        };
        NamespaceUtil.removeNamespace = function(fqn) {
            if (fqn == null) {
                return null;
            }
            var ind = fqn.indexOf("::");
            if (ind >= 0) {
                fqn = fqn.substring(ind + 2);
            }
            return fqn;
        };
        return NamespaceUtil;
    }
);