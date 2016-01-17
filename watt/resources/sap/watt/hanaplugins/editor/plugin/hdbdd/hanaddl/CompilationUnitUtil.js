// based on commit
//eb5b212dbfda88e1728c6891345c095c3acb4d05 CDS: Fix Annotation Code Completion for DCL
/*eslint-disable no-eq-null,eqeqeq*/
define(
    ["commonddl/commonddlNonUi"], //dependencies
    function (commonddl) {
var AccessPolicyDeclarationImpl = commonddl.AccessPolicyDeclarationImpl;
        var CompilationUnitImpl = commonddl.CompilationUnitImpl;
        var ContextDeclarationImpl = commonddl.ContextDeclarationImpl;
        var DdlStatementImpl = commonddl.DdlStatementImpl;
        function CompilationUnitUtil() {
        }
        CompilationUnitUtil.getCu = function(stmt) {
            var parent = stmt.eContainer();
            while (parent != null) {
                if (parent instanceof CompilationUnitImpl) {
                    return parent;
                }
                parent = parent.eContainer();
            }
            return null;
        };
        CompilationUnitUtil.getNextStatement1 = function(stmt) {
            if (stmt == null) {
                return null;
            }
            var parent = stmt.eContainer();
if (parent instanceof ContextDeclarationImpl || parent instanceof AccessPolicyDeclarationImpl) {
                var stmts = (parent).getStatements();
                return CompilationUnitUtil.getNextStatement2(stmt,stmts);
            }else if (parent instanceof CompilationUnitImpl) {
                var stmts1 = (parent).getStatements();
                return CompilationUnitUtil.getNextStatement2(stmt,stmts1);
            }
            return null;
        };
        CompilationUnitUtil.getNextStatement2 = function(stmt,stmts) {
            if (stmts == null) {
                return null;
            }
            var idx = stmts.indexOf(stmt);
            if (idx + 1 < stmts.length) {
                var next = stmts[idx + 1];
                return next;
            }else{
                var parent = stmt.eContainer();
                if (parent instanceof DdlStatementImpl) {
                    return CompilationUnitUtil.getNextStatement1(parent);
                }
            }
            return null;
        };
CompilationUnitUtil.getAllStatementsAsFlatList1 = function(cu) {
var result = [];
CompilationUnitUtil.getAllStatementsAsFlatList2(result,cu.getStatements());
return result;
};
CompilationUnitUtil.getAllStatementsAsFlatList2 = function(result,statements) {
for (var stmtCount = 0;stmtCount < statements.length;stmtCount++) {
var stmt = statements[stmtCount];
result.push(stmt);
if (stmt instanceof ContextDeclarationImpl) {
var ctx = stmt;
CompilationUnitUtil.getAllStatementsAsFlatList2(result,ctx.getStatements());
}
}
};
        return CompilationUnitUtil;
    }
);