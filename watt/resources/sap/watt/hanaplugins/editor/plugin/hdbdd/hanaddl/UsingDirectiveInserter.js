/*eslint-disable no-eq-null,eqeqeq,camelcase,max-statements,complexity,quotes,curly,max-params,max-len,no-redeclare,no-empty,no-octal-escape,no-fallthrough,radix,no-proto,no-new-wrappers*/
// based on commit
//ce3692bd31af6afbbc43664cd32e9cd0373fb403 double maintenance for javascript backend code completion part
define(
    [
        "commonddl/commonddlNonUi",
        "rndrt/rnd",
        "hanaddl/NamespaceUtil",
        "hanaddl/ContextUtil"
    ], //dependencies
    function (
        commonddl,
        rnd,
        NamespaceUtil,
        ContextUtil
    ) {
        var AccessPolicyDeclarationImpl = commonddl.AccessPolicyDeclarationImpl;
        var AspectDeclarationImpl = commonddl.AspectDeclarationImpl;
        var CompilationUnitImpl = commonddl.CompilationUnitImpl;
        var ContextDeclarationImpl = commonddl.ContextDeclarationImpl;
        var DdlStatementImpl = commonddl.DdlStatementImpl;
        var EntityDeclarationImpl = commonddl.EntityDeclarationImpl;
        var NamedDeclarationImpl = commonddl.NamedDeclarationImpl;
        var NamespaceDeclarationImpl = commonddl.NamespaceDeclarationImpl;
        var RoleComponentDeclarationImpl = commonddl.RoleComponentDeclarationImpl;
        var RoleDeclarationImpl = commonddl.RoleDeclarationImpl;
        var StatementContainerImpl = commonddl.StatementContainerImpl;
        var TypeDeclarationImpl = commonddl.TypeDeclarationImpl;
        var UsingDirectiveImpl = commonddl.UsingDirectiveImpl;
        var ViewDefinitionImpl = commonddl.ViewDefinitionImpl;
        function UsingDirectiveInserter() {
        }
        UsingDirectiveInserter.prototype.getAliasOrNull = function(externalNameDecl,cocoCu) {
            if (externalNameDecl == null || cocoCu == null) {
                return null;
            }
            var using = this.getUsingDirective1(externalNameDecl);
            if (using != null) {
                var ud = this.getUsingDirective2(cocoCu, using);
                if (ud != null) {
                    var alias = ud.getAlias();
                    if (alias != null) {
                        return alias.m_lexem;
                    }else{
                        var n = ud.getName();
                        var ind = n.lastIndexOf(".");
                        n = n.substring(ind + 1);
                        return n;
                    }
                }
            }
            var extName = this.getExtName(externalNameDecl);
            var names = [];
            var stmts = [];
            this.getAllMainArtifactNamesInLowerCase(cocoCu.getStatements(),names,stmts);
            if (rnd.Utils.arrayContains(names, extName) == false) {
                return null;
            }
            var fqn = this.getFqnForExternalNameDeclIfString(externalNameDecl, stmts);
            if (fqn != null) {
                return fqn;
            }
            extName += "Alias";
            var extNameWithAlias = extName;
            var count = 1;
            while (rnd.Utils.arrayContains(names, extName.toLowerCase())) {
                extName = extNameWithAlias + count;
                count++;
            }
            return extName;
        };
        UsingDirectiveInserter.prototype.getFqnForExternalNameDeclIfString = function(externalNameDecl,stmts) {

            if (typeof externalNameDecl === "string") {
                //could be maybe local one
                for (var i = 0;i < stmts.length;i++) {
                    var fqn = ContextUtil.getFqnWithNamespace(stmts[i]);
                    if (externalNameDecl === fqn) {
                        //use local path without namespace - and don't add using declaration for local stmt
                        return ContextUtil.getFqn(stmts[i]);
                    }
                }
            }

        };
        UsingDirectiveInserter.prototype.getExtName = function(externalNameDecl) {

            function getNameFromFqn(string) {
                if (string == null || string.length == 0) {
                    return string;
                }
                var ind = Math.max(string.lastIndexOf(":"),string.lastIndexOf("."));
                if (ind > 0) {
                    string = string.substring(ind + 1);
                }
                return string;
            }
            var extName = typeof externalNameDecl === "string" ? getNameFromFqn(externalNameDecl).toLowerCase() : externalNameDecl.getName().toLowerCase();
            return extName;

        };
        UsingDirectiveInserter.prototype.getAllMainArtifactNamesInLowerCase = function(stmts,resultNames,resultStmts) {
            if (stmts != null) {
                for (var stmtCount = 0;stmtCount < stmts.length;stmtCount++) {
                    var stmt = stmts[stmtCount];
                    if (stmt instanceof UsingDirectiveImpl) {
                        var ud = stmt;
                        var alias = ud.getAlias();
                        if (alias != null) {
                            resultNames.push(alias.m_lexem.toLowerCase());
                        }else{
                            var nsp = ud.getName();
                            var ind = nsp.lastIndexOf(".");
                            var n = nsp.substring(ind + 1);
                            resultNames.push(n.toLowerCase());
                        }
                    }else if (stmt instanceof TypeDeclarationImpl || stmt instanceof ViewDefinitionImpl || stmt instanceof EntityDeclarationImpl || stmt instanceof AspectDeclarationImpl) {
                        var name = stmt.getName();
                        resultNames.push(name.toLowerCase());
                        resultStmts.push(stmt);
                    }else if (stmt instanceof ContextDeclarationImpl || stmt instanceof AccessPolicyDeclarationImpl) {
                        var c = stmt;
                        var name = stmt.getName();
                        resultNames.push(name.toLowerCase());
                        this.getAllMainArtifactNamesInLowerCase(c.getStatements(),resultNames,resultStmts);
                    }else if (stmt instanceof RoleDeclarationImpl) {
                        var role = stmt;
                        var name = stmt.getName();
                        resultStmts.push(stmt);
                        resultNames.push(name.toLowerCase());
                        var entries = role.getEntries();
                        for (var entryCount = 0;entryCount < entries.length;entryCount++) {
                            var entry = entries[entryCount];
                            if (entry instanceof AspectDeclarationImpl) {
                                var asp = entry;
                                resultNames.push(asp.getName().toLowerCase());
                                resultStmts.push(asp);
                            }
                        }
                    }
                }
            }
        };
        UsingDirectiveInserter.prototype.doit = function(externalNameDecl,cocoCu,document,alias) {
            if (alias != null && alias.indexOf(".") > 0) {
                return; //something strange; alias should never have a dot in it (for ContextUtil.getFqn scenario in this.getAliasOrNull)
            }
            var using = this.getUsingDirective1(externalNameDecl);
            if (this.containsUsingDirective(cocoCu,using) == false) {
                this.insertUsingDirective(cocoCu,document,using,alias);
            }
        };
        UsingDirectiveInserter.prototype.insertUsingDirective = function(cocoCu,document,using,alias) {
            var namespaceDecl = NamespaceUtil.getNamespaceDeclaration(cocoCu);
            if (namespaceDecl != null && using != null && using.length > 0) {
                var end = namespaceDecl.getEndOffsetWithComments();
                try {
                    if (alias != null) {
                        document.replace(end,0,"\r\nusing " + using + " as " + alias + ";");
                    }else{
                        document.replace(end,0,"\r\nusing " + using + ";");
                    }
                }
                catch(e) {
                }
            }
        };
        UsingDirectiveInserter.prototype.containsUsingDirective = function(cocoCu,using) {
            var stmts = cocoCu.getStatements();
            for (var stmtCount = 0;stmtCount < stmts.length;stmtCount++) {
                var stmt = stmts[stmtCount];
                if (stmt instanceof UsingDirectiveImpl) {
                    var ud = stmt;
                    var qp = ud.getNameWithNamespaceDelimeter();
                    if (qp === using) {
                        return true;
                    }
                }
            }
            return false;
        };
        UsingDirectiveInserter.prototype.getUsingDirective2 = function(cocoCu,using) {
            var stmts = cocoCu.getStatements();
            for (var stmtCount = 0;stmtCount < stmts.length;stmtCount++) {
                var stmt = stmts[stmtCount];
                if (stmt instanceof UsingDirectiveImpl) {
                    var ud = stmt;
                    var qp = ud.getNameWithNamespaceDelimeter();
                    if (qp === using) {
                        return ud;
                    }
                }
            }
            return null;
        };
        UsingDirectiveInserter.prototype.getUsingDirective1 = function(externalNameDecl) {
            var str = this.getFromString(externalNameDecl);
            if (str != null) {
                return str;
            }
            var nd = externalNameDecl;
            var name = new rnd.StringBuffer(externalNameDecl.getName());
            /*eslint-disable no-constant-condition*/
            while (true) {
                nd = nd.eContainer();
                if (nd instanceof ContextDeclarationImpl || nd instanceof AccessPolicyDeclarationImpl || nd instanceof RoleDeclarationImpl) {
                    var n = (nd).getName();
                    name.insert(0,n + ".");
                }else if (nd instanceof CompilationUnitImpl) {
                    var cu = nd;
                    var namespace = NamespaceUtil.getNamespaceDeclaration(cu);
                    if (namespace != null) {
                        name.insert(0,namespace.getName() + "::");
                    }
                    break;
                }else if (nd == null) {
                    break;
                }
            }
            return name.toString();
        };
        UsingDirectiveInserter.prototype.getFromString = function(externalNameDecl) {

            if (typeof externalNameDecl === "string") {
                return externalNameDecl;
            }
            return null;

        };
        return UsingDirectiveInserter;
    }
);