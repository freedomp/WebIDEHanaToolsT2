define(
    ["rndrt/rnd","commonddl/commonddlNonUi","commonddl/commonddlUi","hanaddl/BaseCdsDdlParser","hanaddl/CodeResolver","hanaddl/CompilationUnitUtil","hanaddl/hanaddlCache"], //dependencies
    function (rnd,commonddlNonUi,commonddlUi,BaseCdsDdlParser,CodeResolver,CompilationUnitUtil,Cache) {

        var Context = Cache.context;
        var BaseEditorNavigationHandler = commonddlUi.BaseEditorNavigationHandler;
        var StringBuffer = rnd.StringBuffer;
        var Category = rnd.Category;
        var NamedDeclarationImpl = commonddlNonUi.NamedDeclarationImpl;
        var ContextDeclarationImpl = commonddlNonUi.ContextDeclarationImpl;
        var NamespaceDeclarationImpl = commonddlNonUi.NamespaceDeclarationImpl;
        var SourceRangeImpl = commonddlNonUi.SourceRangeImpl;
        var EntityDeclarationImpl = commonddlNonUi.EntityDeclarationImpl;
        var ViewDefinitionImpl = commonddlNonUi.ViewDefinitionImpl;
        var Utils = rnd.Utils;
        var SelectListEntryImpl = commonddlNonUi.SelectListEntryImpl;

        function EditorNavigationHandler(editor, parser, resolver, Rang) {
            BaseEditorNavigationHandler.call(this, editor, parser, resolver, Rang);
        }
        EditorNavigationHandler.prototype = Object.create(BaseEditorNavigationHandler.prototype);

        EditorNavigationHandler.prototype.doNavigate = function(aceEditor, row, startColumn, endColumn) {

            var that = this;

            // Unit test case
            if(!Context || !Context.service) {
                return that._doNavigateAsync(aceEditor,row,startColumn,endColumn);
            }

            // Run Simple:
            // until we have the backend service to resolve any mapping of HDI (CDS) artifact id and source file path, we provide old XS1 discipline:
            // namespace is mapped 1:1 to folder, first (top-level) element (context, type, entity) mapped 1:1 to file name.
            return Context.service.aceeditor.getCurrentFilePath().then(function (path) {
                return Context.service.document.getDocumentByPath(path);
            }).then(function (doc) {
                return doc.getProject();
            }).then(function (proj) {
                var meta = proj.getProjectMetadata();
                var projectPath = meta.path;

                var project = that.parser;
                project.rootPath = projectPath;

                return that._doNavigateAsync(aceEditor,row,startColumn,endColumn);
            });

        };

        EditorNavigationHandler.prototype._doNavigateAsync = function(aceEditor, row, startColumn, endColumn) {

            var source = this.getSource(aceEditor);
            var ast = this.parser.parseAndGetAst2(this.resolver, source);
            /*eslint-disable no-eq-null*/
            if (ast == null || ast.getStatements() == null) {
                return Q.resolve();
            }
            var tokens = ast.getTokenList();
            var current = this.getTokenAt(tokens, row, startColumn);
            /*eslint-disable no-eq-null*/
            if (current != null && Category.CAT_KEYWORD === current.m_category) {
                return Q.resolve();
            }

            var path = BaseCdsDdlParser.getPathInLowerCase(tokens, current, false);
            /*eslint-disable no-eq-null*/
            if (path == null || path.length === 0) { //no text over cursor, cannot navigate; navigation doesn't make sense
                return Q.resolve();
            }
            path = this.qualifyPath(path, ast, current.m_offset);

            var codeResolver = new CodeResolver();
            var that = this;
            return codeResolver.async_resolvePathForNavigation(current.m_offset, path, ast, this.parser)
                .then(function(target){

                    /*eslint-disable no-eq-null*/
                    if (target != null) {
                        var cu = CompilationUnitUtil.getCu(target);
                        if (cu === ast) {
                            // is local file
                            var t = that.getRangeForTarget(target);
                            /*eslint-disable no-eq-null*/
                            if (t != null) {
                                //check offset
                                if ((row === t.startRow) && (startColumn >= t.startColumn && endColumn <= t.endColumn)) {
                                    // target is an entity or view and target offset is in start offset -> we are already on
                                    // the definition part of the entity --> navigate now to the generated table if available
                                    if (target instanceof EntityDeclarationImpl) {
                                        that.navigateToTableCatalog(target);
                                        return;
                                    } else if (target instanceof ViewDefinitionImpl) {
                                        that.navigateToViewCatalog(target);
                                        return;
                                    }
                                }
                                var me = that;
                                return that.navigateToSameFile(me.aceEditor, t.startRow, t.startColumn, t.endRow, t.endColumn);
                            }
                        }else{
                            // not a local file
                            var url = that.getFileUrlForTarget(cu);
                            url = that.parser.rootPath + url;
                            /*eslint-disable no-eq-null*/
                            if (url != null) {
                                //open editor
                                var namePath = target.getNamePath();
                                var nameToken = null;
                                /*eslint-disable no-eq-null*/
                                if (namePath != null) {
                                    nameToken = namePath.getEntries()[0].nameToken;
                                }else{
                                    nameToken = target.getNameToken();
                                }
                                if (nameToken !== null) {
                                    var targetLine = nameToken.m_line - 1;
                                    var targetColumn = nameToken.m_column - 1;
                                    var endTargetColumn = targetColumn + nameToken.m_lexem.length;
                                    return that.openAndNavigateToDifferentFile(url, Context, targetLine, targetColumn, targetLine, endTargetColumn);
                                }
                            }
                        }
                    }
                });
        };
        
        EditorNavigationHandler.prototype.navigateToTableCatalog = function(target) {
            // Not yet supported
        };
        
        EditorNavigationHandler.prototype.navigateToViewCatalog = function(target) {
            // Not yet supported
        };

        EditorNavigationHandler.prototype.getFileUrlForTarget = function(cu) {
            var ns = null;
            var n = null;
            var stmts = cu.getStatements();
            for (var i = 0; i < stmts.length;i++) {
                if (stmts[i] instanceof NamespaceDeclarationImpl) {
                    ns = stmts[i].getName();
                }else if (stmts[i] instanceof ContextDeclarationImpl) {
                    n = stmts[i].getName();
                }
            }
            /*eslint-disable no-eq-null*/
            if (ns != null && n != null) {
                ns = Utils.stringReplaceAll(ns, ".","/");
                var res = "/" + ns + "/" + n + ".hdbcds";
                return res;
            }
            return null;
        };
        /*global console*/
        var Console = null;
        if (typeof console !== "undefined") {
            Console = console;
        }else{
            Console = {log:function() {}};
        }
        EditorNavigationHandler.prototype.getRangeForTarget = function(target) {
            if (target instanceof NamedDeclarationImpl) {
                var nt = target;
                var targetPathDecl = nt.getNamePath();
                /*eslint-disable no-eq-null*/
                if (targetPathDecl == null) {
                    var name = nt.getNameToken();
                    return { startRow:name.m_line - 1, startColumn:name.m_column - 1, endRow:name.m_line - 1, endColumn: name.m_column - 1 + name.m_lexem.length };
                }
                var entries = targetPathDecl.getEntries();
                var first = entries[0];
                var startLine = first.getNameToken().m_line - 1;
                var startColumn = first.getNameToken().m_column - 1;
                var last = entries[entries.length - 1];
                var end = last.getNameToken().m_column - 1 + last.getNameToken().m_lexem.length;
                var endLine = last.getNameToken().m_line - 1;
                return { startRow: startLine, startColumn: startColumn, endRow: endLine, endColumn: end };
            } else if (target instanceof SourceRangeImpl) {
                var sr = target;
                var idx = sr.getStartTokenIndex();
                var cu = CompilationUnitUtil.getCu(sr);
                var tok = cu.getTokenList()[idx];
                if (target instanceof SelectListEntryImpl) {
                    var at = target.getAliasToken();
                    /*eslint-disable no-eq-null*/
                    if (at != null) {
                        tok = at;
                    }
                }
                return { startRow: tok.m_line - 1, startColumn:tok.m_column - 1, endRow: tok.m_line - 1, endColumn: tok.m_column - 1 + tok.m_lexem.length };
            } else {
                Console.log("cannot handle object " + target); //$NON-NLS-1$
            }
        };

        EditorNavigationHandler.prototype.qualifyPath = function( path, ast, offset) {
            // if foreign key path, add target entity name to path
            var assoc = BaseCdsDdlParser.getCoCoCompilationUnitAssociationDeclaration(offset, ast);
            /*eslint-disable no-eq-null*/
            if (assoc != null) {
                var inForeignKey = this.isInForeignKey(assoc, offset);
                if (inForeignKey) {
                    var tn = assoc.getTargetEntityName();
                    /*eslint-disable no-eq-null*/
                    if (tn != null && tn.length > 0) {
                        path = tn + "." + path; //$NON-NLS-1$
                    }
                }
            }
            return path;
        };

        EditorNavigationHandler.prototype.isInForeignKey = function( assoc, offset) {
            var keys = assoc.getKeys();
            /*eslint-disable no-eq-null*/
            if (keys != null) {
                for (var i = 0;i < keys.length;i++) {
                    var fk = keys[i];
                    var so = fk.getStartOffset();
                    var eo = fk.getEndOffset();
                    if (offset >= so && offset <= eo) {
                        return true;
                    }
                }
            }
            return false;
        };


        EditorNavigationHandler.prototype.getTokenAt = function(tokens,row,column) {
            column = column + 1;
            for (var i = 0; i < tokens.length; i++) {
                var t = tokens[i];
                if (row + 1 === t.m_line) {
                    if (column >= t.m_column && column <= t.m_column + t.m_lexem.length) {
                        if (t.m_lexem.length === 1 && i + 1 < tokens.length) {
                            // May be next token fits better
                            if (column >= tokens[i + 1].m_column && column <= tokens[i + 1].m_column + tokens[i + 1].m_lexem.length) {
                                return tokens[ i + 1 ];
                            }
                        }
                        return t;
                    }
                }
            }
            return null;
        };

        EditorNavigationHandler.prototype.getSource = function(aceEditor) {
            var buf = new StringBuffer();
            var sourceDoc = aceEditor.session.doc;
            for (var i = 0;i < sourceDoc.$lines.length;i++) {
                buf.append(sourceDoc.$lines[i]);
                buf.append("\n");
            }
            var str = buf.toString();
            return str;
        };

        EditorNavigationHandler.prototype.parserResolver = null;

        EditorNavigationHandler.prototype.isAceTokenNavigable = function (aceToken) {
            var res = BaseEditorNavigationHandler.prototype.isAceTokenNavigable.call(this, aceToken);
            if (res === false) {
                return false;
            }
            var p = Utils.stringTrim(aceToken.value);
            if (aceToken.type === "variable.parameter" && p.length > 0) { // if it is colored as type, check for predefined type
                /*eslint-disable no-eq-null*/
                if (this.parserResolver == null) {
                    this.parserResolver = this.parser.versionFactory.createParser(this.parser.version, this.parser.byteCode, null, null);
                }
                var pts = this.parserResolver.getPrimitiveTypes();
                /*eslint-disable no-eq-null*/
                if (pts != null && pts.length > 0) {
                    for (var i = 0;i < pts.length;i++) {
                        var name = pts[i];
                        if (pts[i].getName) {
                            name = pts[i].getName();
                        }
                        var idx = name.indexOf("(");
                        if (idx > 0) {
                            name = name.substring(0,idx);
                        }
                        if (Utils.stringEqualsIgnoreCase(name, p)) {
                            return false; //aha, aceToken is predefined type -> don't mark it as navigable
                        }
                    }
                }
            }
            return true;
        };

        return EditorNavigationHandler;
    }
);