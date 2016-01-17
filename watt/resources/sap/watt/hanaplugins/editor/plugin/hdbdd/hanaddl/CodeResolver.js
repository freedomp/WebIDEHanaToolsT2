/*eslint-disable no-eq-null,eqeqeq,camelcase,max-statements,complexity,quotes,curly,max-params,max-len,no-redeclare,no-empty,no-octal-escape,no-fallthrough,radix,no-proto,no-new-wrappers*/
// based on commit
//2f860536ff6dbcba201ebb20b8f8a7a1e065f95d CDS: AST for nested select list
define(
    ["commonddl/commonddlNonUi", "hanaddl/CompareUtil", "hanaddl/CompilationUnitManager",
        "hanaddl/CompilationUnitUtil",
        "rndrt/rnd", "hanaddl/StmtUtil", "hanaddl/PrimitiveTypeUtil"
    ], //dependencies
    function (commonddl, CompareUtil, CompilationUnitManager, CompilationUnitUtil, rnd, StmtUtil, PrimitiveTypeUtil) {
        var ElementDeclarationImpl = commonddl.ElementDeclarationImpl;
        var AssociationDeclarationImpl = commonddl.AssociationDeclarationImpl;
        var AttributeDeclarationImpl = commonddl.AttributeDeclarationImpl;
        var TypeDeclarationImpl = commonddl.TypeDeclarationImpl;
        var UsingDirectiveImpl = commonddl.UsingDirectiveImpl;
        var EntityDeclarationImpl = commonddl.EntityDeclarationImpl;
        var ViewDefinitionImpl = commonddl.ViewDefinitionImpl;
        var ContextDeclarationImpl = commonddl.ContextDeclarationImpl;
        var CompilationUnitImpl = commonddl.CompilationUnitImpl;
        var ViewExtendImpl = commonddl.ViewExtendImpl;
        var ConstDeclarationImpl = commonddl.ConstDeclarationImpl;
        var PathExpressionImpl = commonddl.PathExpressionImpl;
        var AnnotationDeclarationImpl = commonddl.AnnotationDeclarationImpl;
        var StringTokenizer = rnd.StringTokenizer;
        var NamedDeclarationImpl = commonddl.NamedDeclarationImpl;
        var LiteralExpressionImpl = commonddl.LiteralExpressionImpl;
        var ViewSelectSetImpl = commonddl.ViewSelectSetImpl;
        var ViewSelectImpl = commonddl.ViewSelectImpl;
        var AspectDeclarationImpl = commonddl.AspectDeclarationImpl;
        var StatementContainerImpl = commonddl.StatementContainerImpl;
        var DdlStatementImpl = commonddl.DdlStatementImpl;
        var RoleDeclarationImpl = commonddl.RoleDeclarationImpl;
        var AccessPolicyDeclarationImpl = commonddl.AccessPolicyDeclarationImpl;
        var RuleDeclarationImpl = commonddl.RuleDeclarationImpl;
        var StringBuffer = rnd.StringBuffer;
        var PathEntryImpl = commonddl.PathEntryImpl;

        function CodeResolver() {
        }
        CodeResolver.prototype.resolvePath = function (offset, path, cu, project) {
            return this.resolvePathInternal(offset, path, cu, project, null);
        };
        CodeResolver.prototype.resolvePathInternal = function (offset, path, cu, project, callee) {
            if (cu == null || path == null || rnd.Utils.stringContains(path, ".") == false) {
                return null;
            }
            var rest = null;
            var context = null;
            var indDd = path.indexOf("::");
            if (indDd > 0) {
                path = path.substring(indDd + 2);
                if (path.length == 0) {
                    return null;
                }
            }
            var ind = path.indexOf(".");
            var firstElement = path.substring(0, ind);
            context = this.findLocalElementBasedOnCompilerRules(offset, firstElement, path, cu, project, callee, false);
            if (context == null) {
                var fqn = this.getFullyQualifiedNameViaUsingStmt(firstElement, cu);
                if (fqn != null) {
                    cu = CompilationUnitManager.singleton.getCU(fqn, project);
                    rest = this.getRestWithoutNamespace(fqn + ".");
                    context = this.resolvePath(-1, rest, cu, project);
                } else {
                    var cUs = CompilationUnitManager.singleton.getCUs(project);
                    if (cUs != null) {
                        for (var lcuCount = 0; lcuCount < cUs.length; lcuCount++) {
                            var lcu = cUs[lcuCount];
                            context = this.findFirstMatchingContextOrTypeOrEntityOrConstOrAccessPolicy(firstElement, lcu.getStatements());
                            if (context != null) {
                                break;
                            }
                        }
                    }
                }
                if (context == null) {
                    return null;
                }
            }
            rest = path.substring(ind + 1);
            if (rest.length == 0) {
                return context;
            }
            if (context instanceof ElementDeclarationImpl) {
                var cont = context.eContainer();
                if (cont instanceof NamedDeclarationImpl) {
                    var parent = cont;
                    if (parent.getName() != null && rnd.Utils.stringEqualsIgnoreCase(parent.getName(), (context).getName())) {
                        context = parent;
                    }
                }
            }
            var tok = new StringTokenizer(rest, ".");
            var numberOfDots = this.countNumberOfDots(rest);
            var currentDot = 0;
            var def = null;
            while (tok.hasMoreTokens()) {
                if (def != null) {
                    context = this.getTarget(def, project);
                }
                var element = tok.nextToken();
                def = this.getElement(element, context, project);
                if (def == null) {
                    if (currentDot != numberOfDots) {
                        return null;
                    }
                    return context;
                }
                currentDot++;
            }
            if (rnd.Utils.stringEndsWith(path, ".")) {
                context = this.getTarget(def, project);
            }
            return context;
        };
        CodeResolver.prototype.getFullyQualifiedNameFromUsingStmtViaOffset = function (cu, offset) {
            if (offset < 0 || cu == null) {
                return null;
            }
            var stmts = cu.getStatements();
            if (stmts == null) {
                return null;
            }
            for (var stmtCount = 0; stmtCount < stmts.length; stmtCount++) {
                var stmt = stmts[stmtCount];
                if (stmt instanceof UsingDirectiveImpl) {
                    var usd = stmt;
                    var start = usd.getStartOffset();
                    var end = usd.getEndOffset();
                    if (offset >= start && offset <= end) {
                        var uname = usd.getPartOfNameWithNamespaceDelimeter(offset);
                        return uname;
                    }
                }
            }
            return null;
        };
        CodeResolver.prototype.countNumberOfDots = function (str) {
            var count = 0;
            for (var i = 0; i < str.length; i++) {
                var c = str.charAt(i);
                if (c == '.') {
                    count++;
                }
            }
            return count;
        };
        CodeResolver.prototype.getFullyQualifiedName = function (offset, path, cu, project) {
            if (cu == null || path == null) {
                return null;
            }
            if (rnd.Utils.stringEndsWith(path, ".") == false) {
                path += ".";
            }
            var ind = path.indexOf(".");
            var firstElement = path.substring(0, ind);
            var context = this.findLocalElementBasedOnCompilerRules(offset, firstElement, path, cu, project, null, true);
            if (context == null) {
                var fqn = this.getFullyQualifiedNameViaUsingStmt(firstElement, cu);
                if (fqn == null) {
                    fqn = this.getFullyQualifiedNameFromUsingStmtViaOffset(cu, offset);
                }
                return fqn;
            }
            return null;
        };
        CodeResolver.prototype.resolvePathForNavigation = function (offset, path, cu, project) {
            if (cu == null || path == null) {
                return null;
            }
            if (rnd.Utils.stringEndsWith(path, ".") == false) {
                path += ".";
            }
            var ind = path.indexOf(".");
            var firstElement = path.substring(0, ind);
            var context = this.findLocalElementBasedOnCompilerRules(offset, firstElement, path, cu, project, null, true);
            if (context == null) {
                var fqn = this.getFullyQualifiedNameViaUsingStmt(firstElement, cu);
                if (fqn == null) {
                    fqn = this.getFullyQualifiedNameFromUsingStmtViaOffset(cu, offset);
                    if (fqn != null) {
                        path = ".";
                        ind = 0;
                    }
                }
                if (fqn != null) {
                    cu = CompilationUnitManager.singleton.getCU(fqn, project);
                    var rest = this.getRestWithoutNamespace(fqn + ".");
                    context = this.resolvePath(-1, rest, cu, project);
                } else {
                    if (this.hasErrorToken(cu) == false) {
                        var cUs = CompilationUnitManager.singleton.getCUs(project);
                        if (cUs != null) {
                            for (var lcuCount = 0; lcuCount < cUs.length; lcuCount++) {
                                var lcu = cUs[lcuCount];
                                context = this.findFirstMatchingContextOrTypeOrEntityOrConstOrAccessPolicy(firstElement, lcu.getStatements());
                                if (context != null) {
                                    break;
                                }
                            }
                        }
                    }
                }
                if (context == null) {
                    return null;
                }
            }
            var rest = path.substring(ind + 1);
            if (rest.length == 0) {
                return context;
            }
            if (context instanceof AssociationDeclarationImpl) {
                context = this.getTarget(context, project);
            } else if (context instanceof ElementDeclarationImpl) {
                var parent = context.eContainer();
                if (parent.getName() != null && rnd.Utils.stringEqualsIgnoreCase(parent.getName(), (context).getName())) {
                    context = parent;
                }
            }
            var tok = new rnd.StringTokenizer(rest, ".");
            var numberOfDots = this.countNumberOfDots(rest);
            var currentDot = 0;
            var def = null;
            while (tok.hasMoreTokens()) {
                if (def != null) {
                    context = this.getTarget(def, project);
                }
                var element = tok.nextToken();
                def = this.getElement(element, context, project);
                if (def == null) {
                    if (currentDot != numberOfDots) {
                        return null;
                    }
                    return context;
                }
                currentDot++;
            }
            if (rnd.Utils.stringEndsWith(path, ".")) {
                if (def instanceof AssociationDeclarationImpl || def instanceof AttributeDeclarationImpl || def instanceof TypeDeclarationImpl) {
                    return def;
                }
                context = this.getTarget(def, project);
            }
            return context;
        };


        CodeResolver.prototype.async_resolvePathForNavigation = function (offset, path, cu, project) {

            var that = this;

            if (cu == null || path == null) {
                return Q.resolve(null);
            }
            if (rnd.Utils.stringEndsWith(path, ".") == false) {
                path += ".";
            }
            var ind = path.indexOf(".");
            var firstElement = path.substring(0, ind);
            var context = this.findLocalElementBasedOnCompilerRules(offset, firstElement, path, cu, project, null, true);

            var getContext = function(context, ind) {

                var rest = path.substring(ind + 1);
                if (rest.length == 0) {
                    return context;
                }
                if (context instanceof AssociationDeclarationImpl) {
                    context = that.getTarget(context, project);
                } else if (context instanceof ElementDeclarationImpl) {
                    var parent = context.eContainer();
                    if (parent.getName() != null && rnd.Utils.stringEqualsIgnoreCase(parent.getName(), (context).getName())) {
                        context = parent;
                    }
                }
                var tok = new rnd.StringTokenizer(rest, ".");
                var numberOfDots = that.countNumberOfDots(rest);
                var currentDot = 0;
                var def = null;
                while (tok.hasMoreTokens()) {
                    if (def != null) {
                        context = that.getTarget(def, project);
                    }
                    var element = tok.nextToken();
                    def = that.getElement(element, context, project);
                    if (def == null) {
                        if (currentDot != numberOfDots) {
                            return null;
                        }
                        return context;
                    }
                    currentDot++;
                }
                if (rnd.Utils.stringEndsWith(path, ".")) {
                    if (def instanceof AssociationDeclarationImpl || def instanceof AttributeDeclarationImpl || def instanceof TypeDeclarationImpl) {
                        return Q.resolve(def);
                    }
                    context = that.getTarget(def, project);
                }
                return context;
            };

            if (context == null) {
                var fqn = this.getFullyQualifiedNameViaUsingStmt(firstElement, cu); // TODO: check usages, function no longer returns lowercase
                if (fqn == null) {
                    fqn = this.getFullyQualifiedNameFromUsingStmtViaOffset(cu, offset);
                    if (fqn != null) {
                        path = ".";
                        ind = 0;
                    }
                }
                if (fqn != null) {
                    return CompilationUnitManager.singleton.async_getCU(fqn, project)
                        .then(function(cu){

                            var rest = that.getRestWithoutNamespace(fqn + ".");
                            context = that.resolvePath(-1, rest, cu, project);

                            return Q.resolve(getContext(context, ind));
                        });
                } else {
                    if (this.hasErrorToken(cu) == false) {
                        var cUs = CompilationUnitManager.singleton.getCUs(project);
                        if (cUs != null) {
                            for (var lcuCount = 0; lcuCount < cUs.length; lcuCount++) {
                                var lcu = cUs[lcuCount];
                                context = this.findFirstMatchingContextOrTypeOrEntityOrConstOrAccessPolicy(firstElement, lcu.getStatements());
                                if (context != null) {
                                    break;
                                }
                            }
                        }
                    }
                }
                if (context == null) {
                    return Q.resolve(null);
                }
            }

            return Q.resolve( getContext(context, ind) );
        };


        CodeResolver.prototype.hasErrorToken = function (cu) {
            if (cu == null) {
                return false;
            }
            var list = cu.getTokenList();
            if (list == null) {
                return false;
            }
            for (var tCount = 0; tCount < list.length; tCount++) {
                var t = list[tCount];
                if (rnd.ErrorState.Erroneous === t.m_err_state) {
                    return true;
                }
            }
            return false;
        };
        CodeResolver.prototype.getRestWithoutNamespace = function (fqn) {
            var ind = fqn.indexOf("::");
            if (ind > 0) {
                fqn = fqn.substring(ind + 2);
            }
            return fqn;
        };
        CodeResolver.prototype.getFullyQualifiedNameViaUsingStmt = function (name, cu) {
            name = name.toLowerCase();
            var stmts = cu.getStatements();
            for (var stmtCount = 0; stmtCount < stmts.length; stmtCount++) {
                var stmt = stmts[stmtCount];
                if (stmt instanceof UsingDirectiveImpl) {
                    var u = stmt;
                    var nameWithNamespaceDelimeter = u.getNameWithNamespaceDelimeter();
                    var uname = nameWithNamespaceDelimeter.toLowerCase();
                    var alias = u.getAlias();
                    if (alias != null) {
                        if (CompareUtil.equalsIgnoreQuotesAndCase(name, alias.m_lexem)) {
                            return nameWithNamespaceDelimeter;
                        } else {
                            continue;
                        }
                    } else {
                        if (rnd.Utils.stringEndsWith(uname, name)) {
                            return nameWithNamespaceDelimeter;
                        }
                    }
                }
            }
            return null;
        };
        CodeResolver.prototype.getTarget = function (stmt, project) {
            if (stmt instanceof TypeDeclarationImpl) {
                var td = stmt;
                var elements = td.getElements();
                if (elements != null && elements.length == 1) {
                    for (var elemCount = 0; elemCount < elements.length; elemCount++) {
                        var elem = elements[elemCount];
                        if (elem.getNamePath() == null) {
                            var name = elem.getName();
                            if (name == null || name.length == 0) {
                                var typeId = elem.getTypeId();
                                if (project != null && rnd.Utils.arrayContains(PrimitiveTypeUtil.getPrimitiveTypeNames(false), typeId)) {
                                    return stmt;
                                }
                                if (typeId != null) {
                                    var target = this.resolvePath(elem.getStartOffset(), typeId + ".", //$NON-NLS-1$
                                        CompilationUnitUtil.getCu(stmt), project);
                                    if (target != null) {
                                        var t = this.getTarget(target, project);
                                        if (t != null) {
                                            return t;
                                        }
                                        return target;
                                    }
                                }
                            }
                        }
                    }
                }
            } else if (stmt instanceof AttributeDeclarationImpl) {
                var ad = stmt;
                var typeId = ad.getTypeId();
                if (typeId != null) {
                    var offset = ad.getStartOffset();
                    var a = this.resolvePathInternal(offset, typeId + ".", CompilationUnitUtil.getCu(ad), project, ad);
                    if (a instanceof TypeDeclarationImpl) {
                        var target = a;
                        var t = this.getTarget(target, project);
                        if (t != null) {
                            return t;
                        }
                        return target;
                    } else if (a instanceof EntityDeclarationImpl || a instanceof ViewDefinitionImpl) {
                        return a;
                    }
                }
            } else if (stmt instanceof AssociationDeclarationImpl) {
                var assoc = stmt;
                var targetEntity = assoc.getTargetEntityName();
                if (targetEntity != null) {
                    var offset = this.getOffsetOfFirstContextInHierarchy(assoc);
                    var cu = CompilationUnitUtil.getCu(assoc);
                    if (rnd.Utils.stringContains(targetEntity, ".")) {
                        var t = this.resolvePath(-1, targetEntity + ".", cu, project);
                        return t;
                    }
                    var t = this.findLocalElementBasedOnCompilerRules(offset, targetEntity, null, cu, project, null, false);
                    if (t == null) {
                        t = this.resolvePath(-1, targetEntity + ".", cu, project);
                    }
                    return t;
                }
                return null;
            }
            return stmt;
        };
        CodeResolver.prototype.getOffsetOfFirstContextInHierarchy = function (assoc) {
            var offset = -1;
            var con = this.getFirstContextInHierarchy(assoc);
            if (con != null) {
                offset = con.getStartOffset();
            }
            return offset;
        };
        CodeResolver.prototype.getFirstContextInHierarchy = function (assoc) {
            if (assoc == null) {
                return null;
            }
            /*eslint-disable no-constant-condition*/
            while (true) {
                if (assoc instanceof ContextDeclarationImpl) {
                    return assoc;
                }
                assoc = assoc.eContainer();
                if (assoc == null) {
                    return null;
                }
            }
        };
        CodeResolver.prototype.getElement = function (element, stmt, project) {
            if (stmt instanceof CompilationUnitImpl || stmt instanceof ContextDeclarationImpl || stmt instanceof AccessPolicyDeclarationImpl) {
                var c = stmt;
                var stmts = c.getStatements();
                for (var childCount = 0; childCount < stmts.length; childCount++) {
                    var child = stmts[childCount];
                    if (CompareUtil.equalsIgnoreQuotesAndCase(child.getName(), element)) {
                        return child;
                    }
                }
            } else if (stmt instanceof TypeDeclarationImpl) {
                var td = stmt;
                var elements = td.getElements();
                if (elements != null) {
                    for (var edCount = 0; edCount < elements.length; edCount++) {
                        var ed = elements[edCount];
                        var name = ed.getName();
                        if (name != null && CompareUtil.equalsIgnoreQuotesAndCase(name, element)) {
                            return ed;
                        }
                    }
                }
            } else if (stmt instanceof EntityDeclarationImpl) {
                var et = stmt;
                var elements = et.getElements();
                if (elements != null) {
                    for (var edCount = 0; edCount < elements.length; edCount++) {
                        var ed = elements[edCount];
                        var name = ed.getName();
                        if (name != null && CompareUtil.equalsIgnoreQuotesAndCase(name, element)) {
                            return ed;
                        }
                    }
                }
            } else if (stmt instanceof RoleDeclarationImpl) {
                var role = stmt;
                for (var entryCount = 0; entryCount < role.getEntries().length; entryCount++) {
                    var entry = role.getEntries()[entryCount];
                    if (entry instanceof AspectDeclarationImpl) {
                        var name = (entry).getName();
                        if (name != null && CompareUtil.equalsIgnoreQuotesAndCase(name, element)) {
                            return entry;
                        }
                    }
                }
            } else if (stmt instanceof AspectDeclarationImpl) {
                var aspect = stmt;
                var select = aspect.getSelect();
                return this.getAssociationFromSelect(select, element);
            } else if (stmt instanceof ViewDefinitionImpl) {
                var vd = stmt;
                var selects = vd.getSelects();
                for (var selectCount = 0; selectCount < selects.length; selectCount++) {
                    var select = selects[selectCount];
                    var list = select.getSelectList();
                    if (list != null) {
                        var entries = list.getEntries();
                        if (entries != null) {
                            for (var entryCount = 0; entryCount < entries.length; entryCount++) {
                                var entry = entries[entryCount];
                                var alias = entry.getAlias();
                                if (alias != null && CompareUtil.equalsIgnoreQuotesAndCase(alias, element)) {
                                    return entry;
                                }
                                var ex = entry.getExpression();
                                if (ex instanceof PathExpressionImpl) {
                                    var ps = (ex).getPathString(false);
                                    var ind = ps.lastIndexOf(".");
                                    if (ind > 0) {
                                        ps = ps.substring(ind + 1);
                                    }
                                    if (ps != null && CompareUtil.equalsIgnoreQuotesAndCase(ps, element)) {
                                        return entry;
                                    }
                                }
                            }
                        }
                    }
                    var assoc = this.getAssociationFromSelect(select, element);
                    if (assoc != null) {
                        return assoc;
                    }
                }
            } else if (stmt instanceof AssociationDeclarationImpl) {
                var assoc = stmt;
                var target = this.getTarget(assoc, project);
                if (target != null) {
                    var te = this.getElement(element, target, project);
                    return te;
                }
            }
            return null;
        };
        CodeResolver.prototype.getAssociationFromSelect = function (select, element) {
            var assocs = select.getAssociations();
            for (var assocCount = 0; assocCount < assocs.length; assocCount++) {
                var assoc = assocs[assocCount];
                var name = assoc.getName();
                if (CompareUtil.equalsIgnoreQuotesAndCase(name, element)) {
                    return assoc;
                }
            }
            return null;
        };
        CodeResolver.prototype.findLocalElementBasedOnCompilerRules = function (offset, nameToFind, fullPath, cu, project, callee, forNavigation) {
            if (offset < 0) {
                return this.findFirstMatchingContextOrTypeOrEntityOrConstOrAccessPolicy(nameToFind, cu.getStatements());
            }
            var best = CodeResolver.findBestMatchingTypeAtOffset(offset, cu);
            if (best != null) {
                var res = this.findLocalElementBasedOnCompilerRulesUsingStmt(best, nameToFind, fullPath, project, callee, offset, forNavigation);
                if (res != null) {
                    return res;
                }
            }
            return this.findFirstMatchingContextOrTypeOrEntityOrConstOrAccessPolicy(nameToFind, cu.getStatements());
        };
        CodeResolver.prototype.findLocalElementBasedOnCompilerRulesUsingStmt = function (best, nameToFind, fullPath, project, callee, offset, forNavigation) {
            if (best instanceof EntityDeclarationImpl) {
                var en = best;
                var elements = en.getElements();
                var t = this.findLocalElementBasedOnCompilerRulesWithElements(nameToFind, project, callee, offset, forNavigation, elements);
                if (t != null) {
                    return t;
                }
                var parent = best.eContainer();
                if (parent instanceof ContextDeclarationImpl) {
                    return this.findLocalElementBasedOnCompilerRulesUsingStmt(parent, nameToFind, fullPath, project, null, offset, forNavigation);
                }
            } else if (best instanceof TypeDeclarationImpl) {
                var td = best;
                var elems = td.getElements();
                if (elems != null) {
                    for (var elemCount = 0; elemCount < elems.length; elemCount++) {
                        var elem = elems[elemCount];
                        var name = elem.getName();
                        if (CompareUtil.equalsIgnoreQuotesAndCase(name, nameToFind)) {
                            var start = elem.getStartOffset();
                            var end = elem.getEndOffset();
                            if ((!(forNavigation)) || ((start <= offset) && (offset <= end))) {
                                if (callee != null && callee == elem) {
                                    continue;
                                }
                                var target = this.getTarget(elem, project);
                                if (target != null) {
                                    return target;
                                }
                            } else if (forNavigation) {
                                if (this.isTypeOfElementAtOffset(elems, offset)) {
                                    return elem;
                                }
                            }
                        }
                        if (forNavigation) {
                            var t = this.findEnumerationValueForDefaultValue(nameToFind, project, offset, elem);
                            if (t != null) {
                                return t;
                            }
                        }
                    }
                }
                var parent = best.eContainer();
                if (parent instanceof ContextDeclarationImpl) {
                    return this.findLocalElementBasedOnCompilerRulesUsingStmt(parent, nameToFind, fullPath, project, null, -1, forNavigation);
                }
            } else if (StatementContainerImpl.isStatementContainerInstance(best)) {
                var context = best;
                for (var stmtCount = 0; stmtCount < context.getStatements().length; stmtCount++) {
                    var stmt = context.getStatements()[stmtCount];
                    var name = stmt.getName();
                    if (CompareUtil.equalsIgnoreQuotesAndCase(name, nameToFind)) {
                        return stmt;
                    }
                }
                var parent = best.eContainer();
                if (StatementContainerImpl.isStatementContainerInstance(parent) && (parent instanceof DdlStatementImpl)) {
                    return this.findLocalElementBasedOnCompilerRulesUsingStmt(parent, nameToFind, fullPath, project, null, -1, forNavigation);
                }
            } else if (best instanceof RoleDeclarationImpl) {
                var role = best;
                for (var entryCount = 0; entryCount < role.getEntries().length; entryCount++) {
                    var entry = role.getEntries()[entryCount];
                    if (entry instanceof AspectDeclarationImpl) {
                        var name = (entry).getName();
                        if (CompareUtil.equalsIgnoreQuotesAndCase(name, nameToFind)) {
                            return entry;
                        }
                    }
                }
                var parent = best.eContainer();
                if (parent instanceof AccessPolicyDeclarationImpl) {
                    return this.findLocalElementBasedOnCompilerRulesUsingStmt(parent, nameToFind, fullPath, project, null, -1, forNavigation);
                }
            } else if (best instanceof AspectDeclarationImpl) {
                var sourceRange = StmtUtil.getBestMatchingSourceRangeRecursive(best, offset);
                var viewSelect = StmtUtil.getParentOfTypeViewSelect(sourceRange);
                if (viewSelect != null) {
                    var assoc = this.getAdHocAssociationFromSelect(nameToFind, offset, forNavigation, viewSelect);
                    if (assoc != null) {
                        return assoc;
                    }
                }
                var parent = best.eContainer();
                if (StatementContainerImpl.isStatementContainerInstance(parent) && parent instanceof DdlStatementImpl) {
                    return this.findLocalElementBasedOnCompilerRulesUsingStmt(parent, nameToFind, fullPath, project, null, -1, forNavigation);
                }
            } else if (best instanceof ViewDefinitionImpl) {
                var sourceRange = StmtUtil.getBestMatchingSourceRangeRecursive(best, offset);
                var viewSelect = StmtUtil.getParentOfTypeViewSelect(sourceRange);
                if (viewSelect != null) {
                    var assocs = this.getAdHocAssociationFromSelect(nameToFind, offset, forNavigation, viewSelect);
                    if (assocs != null) {
                        return assocs;
                    }
                    var ds = viewSelect.getFrom();
                    if (ds != null) {
                        var dsStart = ds.getStartOffset();
                        var dsEnd = ds.getEndOffset();
                        var doit = true;
                        if (offset >= dsStart && offset <= dsEnd) {
                            doit = false;
                        }
                        if (forNavigation) {
                            var vdStart = best.getStartOffset();
                            if ((offset >= vdStart) && (offset <= dsStart)) {
                                doit = false;
                            }
                        }
                        if (doit) {
                            var dsTarget = this.resolvePath(this.getOffsetOfFirstContextInHierarchy(ds),
                                    ds.getName() + ".", CompilationUnitUtil.getCu(best), project);
                            if (dsTarget != null) {
                                if (offset > -1) {
                                    var dss = ds.getStartOffset();
                                    var dse = ds.getEndOffset();
                                    if (dss > -1 && dse > -1 && offset >= dss && offset <= dse) {
                                        return dsTarget;
                                    }
                                }
                                if (fullPath != null && rnd.Utils.stringStartsWith(fullPath, nameToFind)) {
                                    if (this.hasPathMoreThanOneElement(fullPath)) {
                                        var dsName = ds.getName();
                                        var dsAlias = ds.getAlias();
                                        if (CompareUtil.equalsIgnoreQuotesAndCase(nameToFind, dsName) || CompareUtil.equalsIgnoreQuotesAndCase(nameToFind, dsAlias)) {
                                            return dsTarget;
                                        }
                                    }
                                }
                                var t = this.getElement(nameToFind, dsTarget, project);
                                if (t != null) {
                                    return t;
                                }
                            }
                        }
                    }
                } else {
                    if (sourceRange instanceof PathExpressionImpl) {
                        var givenName = this.getLastPathExpressionTokenName(sourceRange);
                        if (givenName != null) {
                            var orderByEntry = StmtUtil.getParentOfTypeOrderByEntry(sourceRange);
                            if (orderByEntry != null && forNavigation) {
                                var parentParent = orderByEntry.eContainer().eContainer();
                                if (parentParent instanceof ViewSelectSetImpl) {
                                    var first = this.getFirstLeftViewSelect(parentParent);
                                    if (first != null) {
                                        var sl = first.getSelectList();
                                        if (sl != null) {
                                            var entries = sl.getEntries();
                                            for (var entryCount = 0; entryCount < entries.length; entryCount++) {
                                                var entry = entries[entryCount];
                                                var alias = entry.getAlias();
                                                if (alias != null) {
                                                    if (givenName === alias) {
                                                        return entry;
                                                    }
                                                } else {
                                                    var publicName = entry.getPublicName();
                                                    if (publicName != null) {
                                                        var ind = publicName.lastIndexOf(".");
                                                        if (ind > 0) {
                                                            publicName = publicName.substring(ind + 1);
                                                        }
                                                        if (givenName === publicName) {
                                                            return entry;
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                                return orderByEntry;
                            }
                        }
                    }
                }
                var parent = best.eContainer();
                if (StatementContainerImpl.isStatementContainerInstance(parent) && parent instanceof DdlStatementImpl) {
                    return this.findLocalElementBasedOnCompilerRulesUsingStmt(parent, nameToFind, fullPath, project, null, -1, forNavigation);
                }
            } else if (best instanceof ConstDeclarationImpl) {
                var parent = best.eContainer();
                if (parent instanceof ContextDeclarationImpl) {
                    return this.findLocalElementBasedOnCompilerRulesUsingStmt(parent, nameToFind, fullPath, project, null, -1, forNavigation);
                }
            } else if (best instanceof RuleDeclarationImpl) {
                var parent = best.eContainer();
                if (parent instanceof RoleDeclarationImpl) {
                    return this.findLocalElementBasedOnCompilerRulesUsingStmt(parent, nameToFind, fullPath, project, null, -1, forNavigation);
                }
            } else if (best instanceof AnnotationDeclarationImpl) {
                var annot = best;
                var at = annot.getAnonymousType();
                if (at != null) {
                    var elements = at.getElements();
                    var t = this.findLocalElementBasedOnCompilerRulesWithElements(nameToFind, project, callee, offset, forNavigation, elements);
                    if (t != null) {
                        return t;
                    }
                }
                var parent = best.eContainer();
                if (parent instanceof ContextDeclarationImpl) {
                    return this.findLocalElementBasedOnCompilerRulesUsingStmt(parent, nameToFind, fullPath, project, null, -1, forNavigation);
                }
            }
            return null;
        };
        CodeResolver.prototype.getAdHocAssociationFromSelect = function (nameToFind, offset, forNavigation, viewSelect) {
            var assocs = viewSelect.getAssociations();
            for (var assocCount = 0; assocCount < assocs.length; assocCount++) {
                var assoc = assocs[assocCount];
                var name = assoc.getName();
                if (CompareUtil.equalsIgnoreQuotesAndCase(name, nameToFind)) {
                    var dsStart = assoc.getStartOffset();
                    var dsEnd = assoc.getEndOffset();
                    var doit = true;
                    if (forNavigation == false && offset >= dsStart && offset <= dsEnd) {
                        doit = false;
                    }
                    if (doit) {
                        return assoc;
                    }
                    break;
                }
            }
            return null;
        };
        CodeResolver.prototype.getLastPathExpressionTokenName = function (pe) {
            var pes = pe.getPathEntries();
            var givenName = null;
            if (pes.length > 0) {
                var abstractPathEntry = pes[pes.length - 1];
                if (abstractPathEntry instanceof PathEntryImpl) {
                    var nt = (abstractPathEntry).getNameToken();
                    if (nt != null) {
                        givenName = nt.m_lexem;
                    }
                }
            }
            return givenName;
        };
        CodeResolver.prototype.getFirstLeftViewSelect = function (set) {
            var left = set.getLeft();
            if (left instanceof ViewSelectSetImpl) {
                return this.getFirstLeftViewSelect(left);
            } else if (left instanceof ViewSelectImpl) {
                return left;
            }
            return null;
        };
        CodeResolver.prototype.findLocalElementBasedOnCompilerRulesWithElements = function (nameToFind, project, callee, offset, forNavigation, elements) {
            if (elements == null) {
                return null;
            }
            for (var elemCount = 0; elemCount < elements.length; elemCount++) {
                var elem = elements[elemCount];
                var name = elem.getName();
                if (CompareUtil.equalsIgnoreQuotesAndCase(name, nameToFind)) {
                    var start = elem.getStartOffset();
                    var end = elem.getEndOffset();
                    if ((!(forNavigation)) || ((start <= offset) && (offset <= end))) {
                        if (elem === callee == false) {
                            var target = this.getTarget(elem, project);
                            if (target != null) {
                                return target;
                            }
                        }
                    } else if (forNavigation) {
                        if (this.isTypeOfElementAtOffset(elements, offset)) {
                            return elem;
                        } else if (this.isOffsetOverAssociationOnCondition(elements, offset)) {
                            return elem;
                        }
                    }
                }
                if (forNavigation) {
                    var t = this.findEnumerationValueForDefaultValue(nameToFind, project, offset, elem);
                    if (t != null) {
                        return t;
                    }
                }
            }
            return null;
        };
        CodeResolver.prototype.isOffsetOverAssociationOnCondition = function (elements, offset) {
            for (var elCount = 0; elCount < elements.length; elCount++) {
                var el = elements[elCount];
                if (el instanceof AssociationDeclarationImpl) {
                    var asso = el;
                    var on = asso.getOnExpression();
                    if (on == null) {
                        continue;
                    }
                    var start = on.getStartOffset();
                    var end = on.getEndOffset();
                    if (offset >= start && offset <= end) {
                        return true;
                    }
                }
            }
            return false;
        };
        CodeResolver.prototype.findEnumerationValueForDefaultValue = function (nameToFind, project, offset, elem) {
            var so = elem.getStartOffset();
            var eo = elem.getEndOffset();
            if (offset < so || offset >= eo) {
                return null;
            }
            var def = elem.getDefault();
            if (def instanceof LiteralExpressionImpl) {
                var defaultValue = (def).getToken();
                if (CompareUtil.equalsIgnoreQuotesAndCase(defaultValue, nameToFind)) {
                    var enumDecl = elem.getEnumerationDeclaration();
                    var ev = this.getEnumValueForEnumDecl(nameToFind, enumDecl);
                    if (ev != null) {
                        return ev;
                    }
                    var p = elem.getTypeIdPath();
                    if (p == null) {
                        p = elem.getTypeOfPath();
                    }
                    if (p != null) {
                        var type = p.getPathString(false);
                        var target = this.resolvePath(offset, type + ".", CompilationUnitUtil.getCu(p), project);
                        if (target instanceof TypeDeclarationImpl) {
                            var tt = target;
                            if (CompilationUnitManager.isStructuredType(tt) == false) {
                                enumDecl = tt.getElements()[0].getEnumerationDeclaration();
                                return this.getEnumValueForEnumDecl(nameToFind, enumDecl);
                            }
                        } else if (target instanceof AttributeDeclarationImpl) {
                            var at = target;
                            enumDecl = at.getEnumerationDeclaration();
                            return this.getEnumValueForEnumDecl(nameToFind, enumDecl);
                        }
                    }
                }
            }
            return null;
        };
        CodeResolver.prototype.getEnumValueForEnumDecl = function (nameToFind, enumDecl) {
            if (enumDecl != null) {
                var values = enumDecl.getValues();
                var v = this.getEnumValue(nameToFind, values);
                if (v != null) {
                    return v;
                }
            }
            return null;
        };
        CodeResolver.prototype.getEnumValue = function (nameToFind, values) {
            for (var vCount = 0; vCount < values.length; vCount++) {
                var v = values[vCount];
                var symbol = v.getSymbol();
                if (symbol != null && CompareUtil.equalsIgnoreQuotesAndCase("#" + symbol.m_lexem, nameToFind)) {
                    return v;
                }
            }
            return null;
        };
        CodeResolver.prototype.isTypeOfElementAtOffset = function (elements, offset) {
            for (var elemCount = 0; elemCount < elements.length; elemCount++) {
                var elem = elements[elemCount];
                var start = elem.getStartOffset();
                var end = elem.getEndOffset();
                if (offset >= start && offset <= end) {
                    if (elem.getTypeOfPath() != null) {
                        return true;
                    }
                }
            }
            return false;
        };
        CodeResolver.prototype.hasPathMoreThanOneElement = function (fullPath) {
            if (this.countNumberOfDots(fullPath) >= 1) {
                return true;
            }
            return false;
        };
        CodeResolver.findBestMatchingTypeAtOffset = function (offset, cu) {
            var decls = CodeResolver.getAllDeclarations(cu.getStatements());
            var lastDeltaOffset = 999999999;
            var best = null;
            for (var declCount = 0; declCount < decls.length; declCount++) {
                var decl = decls[declCount];
                var start = decl.getStartOffset();
                var delta = offset - start;
                if (delta >= 0 && delta < lastDeltaOffset) {
                    lastDeltaOffset = delta;
                    best = decl;
                }
            }
            if (best != null) {
                var so = best.getStartOffset();
                var eo = best.getEndOffset();
                if (so > -1 && eo > -1 && (offset < so || offset > eo)) {
                    return null;
                }
            }
            return best;
        };
        CodeResolver.getAllDeclarations = function (stmts) {
            var result = [];
            for (var stmtCount = 0; stmtCount < stmts.length; stmtCount++) {
                var stmt = stmts[stmtCount];
                if (StatementContainerImpl.isStatementContainerInstance(stmt)) {
                    var context = stmt;
                    result.push(stmt);
                    result = result.concat(CodeResolver.getAllDeclarations(context.getStatements()));
                } else if (stmt instanceof RoleDeclarationImpl) {
                    var role = stmt;
                    result.push(stmt);
                    for (var entryCount = 0; entryCount < role.getEntries().length; entryCount++) {
                        var entry = role.getEntries()[entryCount];
                        result.push(entry);
                    }
                } else if (stmt instanceof TypeDeclarationImpl || stmt instanceof EntityDeclarationImpl || stmt instanceof ViewDefinitionImpl || stmt instanceof ViewExtendImpl || stmt instanceof ConstDeclarationImpl || stmt instanceof AnnotationDeclarationImpl || stmt instanceof AspectDeclarationImpl) {
                    result.push(stmt);
                }
            }
            return result;
        };
        CodeResolver.prototype.findFirstMatchingContextOrTypeOrEntityOrConstOrAccessPolicy = function (name, statements) {
            for (var stmtCount = 0; stmtCount < statements.length; stmtCount++) {
                var stmt = statements[stmtCount];
                if (stmt instanceof ContextDeclarationImpl || stmt instanceof AccessPolicyDeclarationImpl) {
                    var c = stmt;
                    if (CompareUtil.equalsIgnoreQuotesAndCase(name, stmt.getName())) {
                        return stmt;
                    }
                    var r = this.findFirstMatchingContextOrTypeOrEntityOrConstOrAccessPolicy(name, c.getStatements());
                    if (r != null) {
                        return r;
                    }
                } else if (stmt instanceof TypeDeclarationImpl) {
                    var t = stmt;
                    if (CompareUtil.equalsIgnoreQuotesAndCase(name, t.getName())) {
                        return t;
                    }
                } else if (stmt instanceof EntityDeclarationImpl) {
                    var e = stmt;
                    if (CompareUtil.equalsIgnoreQuotesAndCase(name, e.getName())) {
                        return e;
                    }
                } else if (stmt instanceof ViewDefinitionImpl) {
                    var v = stmt;
                    if (CompareUtil.equalsIgnoreQuotesAndCase(name, v.getName())) {
                        return v;
                    }
                } else if (stmt instanceof ConstDeclarationImpl) {
                    var cd = stmt;
                    if (CompareUtil.equalsIgnoreQuotesAndCase(name, cd.getName())) {
                        return cd;
                    }
                }
            }
            return null;
        };
        return CodeResolver;
    }
);
