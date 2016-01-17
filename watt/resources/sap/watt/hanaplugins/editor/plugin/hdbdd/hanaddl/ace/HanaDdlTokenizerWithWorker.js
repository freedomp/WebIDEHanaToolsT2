//ace editor mode implementation for HANA DDL grammar
/*eslint-disable no-eq-null,eqeqeq, max-params*/
define(
    [
        "hanaddl/DdlParserFactoryRespectingBackendVersion",
        "hanaddl/VersionsFactory",
        "rndrt/rnd",
        "commonddl/commonddlNonUi",
        "commonddl/commonddlUi",
        "hanaddl/ace/HanaRepositoryAccess",
        "hanaddl/ace/EditorNavigationHandler",
        "hanaddl/CdsDdlPadFileResolver",
        "hanaddl/IBaseCdsDdlParserConstants",
        "hanaddl/CompilationUnitManager",
        "hanaddl/UsingDirectiveInserter"],
    function (DdlParserFactoryRespectingBackendVersion,
              VersionsFactory,
              rnd,
              commonddlNonUi,
              commonddlUi,
              HanaRepositoryAccess,
              EditorNavigationHandler,
              CdsDdlPadFileResolver,
              IBaseCdsDdlParserConstants,
              CompilationUnitManager,
              UsingDirectiveInserter) {

        var SapDdlConstants = commonddlNonUi.SapDdlConstants;

        //DONE: multi line coloring -> remove */ at end and add it again --> next line not colored correctly
        //DONE: bug coco: association <coco press t and then enter>
        //DONE: take DdlCompletionType into account (what about annotation)
        //DONE: sort order in coco list wrong ( view v as select from context.entity { <elements strange>
        //DONE: different colors for annotations and comments
        //DONE: make type usage italic
        //DONE: */context test {
        //DONE: multi line comment
        //DONE: take multi line comment handling from console
        //DONE: annotations not colored in a correct way
        //DONE: coloring for following scenario:
        //entity entity {
        //element
        //    : cc
        //    };

        function HanaDdlTokenizerWithWorker(Range) {
            commonddlUi.BaseDdlTokenizerWithWorker.call(this, Range, CdsDdlPadFileResolver.getPadFilePath(), "hanaddlUi.js");
            var version = VersionsFactory.versionLast;
            this.resolver = DdlParserFactoryRespectingBackendVersion.eInstance.createResolver(version);
            this.parser = DdlParserFactoryRespectingBackendVersion.eInstance.createParser(version);
            var annots = DdlParserFactoryRespectingBackendVersion.eInstance.getSupportedAnnotations2(this.parser, version);
            this.parser.setSupportedAnnotations(annots);
        }
        HanaDdlTokenizerWithWorker.prototype = Object.create(commonddlUi.BaseDdlTokenizerWithWorker.prototype);

        HanaDdlTokenizerWithWorker.prototype.isMyEditorSessionMode = function (session) {
            if (session.$modeId == "ace/mode/hdbcds") {
                return true;
            }
            return false;
        };

        HanaDdlTokenizerWithWorker.prototype.getTokenizerPath = function () {
            var path = commonddlUi.BaseDdlTokenizerWithWorker.prototype.getTokenizerPath.call(this);
            path += "/ace";
            return path;
        };

        HanaDdlTokenizerWithWorker.prototype.addNavigationHandler = function (editor) {
            var nh = new EditorNavigationHandler(editor, this.parser, this.resolver, this.Range);
            nh.registerEventListeners();
            nh.registerKeyboardShortcut();
            return nh;
        };

        HanaDdlTokenizerWithWorker.prototype.insertCompletion = function (editor, compl, beforeCursor) {
            if (rnd.Utils.stringContains(compl.name, "(") === true && rnd.Utils.stringContains(compl.name, ")") === true) { //aha, predefined type with ( )
                this.insertPredefinedType(editor, compl, beforeCursor);
                return;
            }
            if (compl.type == IBaseCdsDdlParserConstants.WARNING_TYPE || compl.type == IBaseCdsDdlParserConstants.LOADING_TYPE) {
                return;//
            }

            var replacementStr = compl.name;
            if (compl.replacementString !== undefined) {
                if (compl.replacementString.length > 0) {
                    replacementStr = compl.replacementString;
                }
            }
            var replInfo = null;
            if (compl.calculateReplacementInformation) {
                var beforeOffset = compl.replacementOffset;
                replInfo = compl.calculateReplacementInformation(replacementStr, compl.replacementLength,
                    compl.replacementOffset);
                if (replInfo.string != null && replInfo.string.length > 0) {
                    replacementStr = replInfo.string;
                }
                if (replInfo.offset !== undefined && replInfo.offset != beforeOffset) {
                    compl.replacementOffset = replInfo.offset;
                    var str = this.getLinesFromDocument(this.sourceDocument);
                    var tmpPos = this.convertOffsetToRowColumn(str, compl.replacementOffset);
                    compl.replacementRow = tmpPos.row;
                    compl.replacementColumn = tmpPos.column;
                    compl.replacementLength = replInfo.length;
                }
            }

            if (compl.replacementRow != null && compl.replacementRow >= 0) {
                var currentCursor = editor.selection.getCursor();
                if (beforeCursor != null && currentCursor != null && beforeCursor.row == currentCursor.row) {
                    var delta = currentCursor.column - beforeCursor.column;
                    if (delta > 0) {
                        compl.replacementLength += delta;
                    }
                }
                editor.selection.moveTo(compl.replacementRow, compl.replacementColumn);
                editor.selection.selectTo(compl.replacementRow, compl.replacementColumn + compl.replacementLength);
            }
            editor.execCommand("insertstring", replacementStr);

            //insert using directive
            if (replInfo != null && replInfo.externalNamedDeclaration != null) {
                //aha, we have to add the using directive
                var that = this;
                var doc = {
                    replace : function (start,end,string) {
                        var before = editor.selection.getCursor();
                        var source = that.getLinesFromDocument(that.sourceDocument);
                        var startRowColumn = that.convertOffsetToRowColumn(source,start);
                        if (startRowColumn != null) {
                            editor.selection.moveTo(startRowColumn.row, startRowColumn.column);
                        }
                        editor.execCommand("insertstring", string);
                        if (before != null) {
                            editor.selection.moveTo(before.row + 1, before.column);
                        }
                    }
                };
                new UsingDirectiveInserter().doit(replInfo.externalNamedDeclaration, compl.getCocoCu(), doc,
                    replInfo.alias);
            }
        };

        HanaDdlTokenizerWithWorker.prototype.getLinesFromDocument = function(document) {
            var buf = new rnd.StringBuffer();
            for (var i = 0; i < document.$lines.length; i++) {
                buf.append(document.$lines[i]);
                buf.append("\n");
            }
            return buf.toString();
        };

        HanaDdlTokenizerWithWorker.prototype.getCompls = function (pos, prefix, triggerOffset, repAccess) {
            if (repAccess === undefined) {
                repAccess = HanaRepositoryAccess.HanaRepositoryAccess2(this.parser);
            }
            var source = this.getLinesFromDocument(this.sourceDocument);
            repAccess.aceEditor = this.aceEditor;
            var completions = this.parser.getTypedCodeCompletions5(this.resolver, repAccess, source, pos.row + 1, pos.column + 1);
            if (completions && completions.length > 0) {
                var replacementPosCache = {};
                for (var completionsCount = 0; completionsCount < completions.length; completionsCount++) {
                    var completion = completions[completionsCount];
                    if (completion.doReplaceTokenAtCurrentOffset && completion.replacementOffset > 0) {
                        // semantic completion
                        if(!replacementPosCache[completion.replacementOffset]) {
                            replacementPosCache[completion.replacementOffset] = this.convertOffsetToRowColumn(source, completion.replacementOffset);
                        }
                        var replacementPos = replacementPosCache[completion.replacementOffset];
                        completion.replacementRow = replacementPos.row;
                        completion.replacementColumn = replacementPos.column;
                    } else {
                        // keyword completion
                        // DdlKeywordCodeCompletionProposal for standard keyword completion
                        // HanaDdlCodeCompletion for "look ahead" keyword completion (insert and don't replace)
                        if (completion instanceof commonddlNonUi.DdlKeywordCodeCompletionProposal && completion.replacementLength === 0) {
                            completion.replacementRow = pos.row;
                            completion.replacementColumn = pos.column - prefix.length;
                            completion.replacementLength = prefix.length;
                        } else {
                            completion.replacementRow = pos.row;
                            completion.replacementColumn = pos.column;
                            completion.replacementLength = 0;
                            if (completion.calculateReplacementInformation && triggerOffset && triggerOffset > -1) {
                                completion.replacementOffset = triggerOffset;
                            }
                        }
                    }
                }
            }
            return completions;
        };

        HanaDdlTokenizerWithWorker.prototype.isKeyword = function(token) {
            if (token.m_category.value === rnd.Category.CAT_KEYWORD.value ||
                token.m_category.value === rnd.Category.CAT_MAYBE_KEYWORD.value ||
                token.m_category.value === rnd.Category.CAT_OPERATOR.value) {
                return true;
            }
            return false;
        };

        HanaDdlTokenizerWithWorker.prototype.convertRndTokensToAce = function (rndTokens, row) {
            this.deleteLastErrorTokenMarkers(row);
            var aceTokens = [];

            var lastEndTokenOffset = 0;
            for (var i = 0; i < rndTokens.length; i++) {
                /*eslint-disable eqeqeq*/
                if (rndTokens[i].m_num == SapDdlConstants.NUM_EOF) {
                    continue;
                }
                var aceToken = {};
                var spaces = this.createSpaces(row, lastEndTokenOffset, rndTokens[i].m_column - 1);
                aceToken.value = spaces + rndTokens[i].m_lexem;
                var payload = rndTokens[i].mPayLoad;
                /*eslint-disable eqeqeq*/
                if (rndTokens[i].m_err_state.m_value == rnd.ErrorState.Erroneous.getValue()) {
                    if (this.isKeyword(rndTokens[i])) {
                        aceToken.type = "keyword";
                    }else {
                        aceToken.type = "text";
                    }
                    this.createMarkerForErrorToken(row,rndTokens[i].m_column - 1,rndTokens[i].m_lexem.length);
                } else if (this.isKeyword(rndTokens[i])) {
                    aceToken.type = "keyword";
                } else if (rndTokens[i].m_category.value === rnd.Category.CAT_LITERAL.value) {
                    aceToken.type = "type";
                } else if (rndTokens[i].m_category.value === rnd.Category.CAT_COMMENT.value) {
                    aceToken.type = "comment";
                } else {
                    aceToken.type = "text";
                }
                if (payload !== undefined && payload.isDdlTypeUsage === true) {
                    /*eslint-disable eqeqeq*/
                    if (aceToken.type != "keyword") { //but not when keyword -> keyword can never be a type usage; incorrect parser behavior
                        aceToken.type = "variable.parameter";
                    }
                }
                if (payload !== undefined && payload.isAnnotationPayload === true) {
                    aceToken.type = "meta.tag";
                }
                aceTokens.push(aceToken);
                lastEndTokenOffset = rndTokens[i].m_column - 1 + rndTokens[i].m_lexem.length;
            }
            return aceTokens;
        };

        HanaDdlTokenizerWithWorker.prototype.insertPredefinedType = function (editor, theObj,beforeCursor) {
            this.selectReplacement(editor,theObj,beforeCursor);
            var insertString = theObj.name;
            editor.execCommand("insertstring", insertString);

            var start = insertString.indexOf("(");
            var end = insertString.indexOf(")");
            if (start > 0 && end > 0) {
                var spacesBetweenBrackets = 1;
                var currentCursor = editor.selection.getCursor();
                var diff = insertString.length - start - spacesBetweenBrackets;
                editor.selection.moveTo(currentCursor.row, currentCursor.column - diff);
                editor.selection.selectTo(currentCursor.row, currentCursor.column - spacesBetweenBrackets);
                var beforeRow = currentCursor.row;
                var openBracketColumn = currentCursor.column - diff;
                var me = this;
                editor.keyBinding.addKeyboardHandler(function(data, hashId, keyString, keyCode, e) {
                    var c = editor.selection.getCursor();
                    if (c.row != beforeRow) {
                        editor.keyBinding.removeKeyboardHandler(this); // unregister listener
                        return undefined;
                    }
                    var line = me.sourceDocument.$lines[currentCursor.row];
                    var closeBracketColumn = line.indexOf(")",c.column - 1);
                    if (keyCode == 13 && (c.column < openBracketColumn || c.column > closeBracketColumn)) {
                        editor.keyBinding.removeKeyboardHandler(this); // unregister listener
                        return undefined;
                    }
                    if (keyCode == 13 && c.row === beforeRow) { //enter key pressed; jump to closing bracket
                        var moveToIndex = closeBracketColumn + 1 /*column starts with 1*/;
                        editor.selection.moveTo(currentCursor.row, moveToIndex);
                        editor.selection.selectTo(currentCursor.row, moveToIndex);
                        editor.keyBinding.removeKeyboardHandler(this); // unregister listener
                        return {command:"null"}; // stop event execution and don't add line break
                    }
                });
            }
        };

        HanaDdlTokenizerWithWorker.prototype.selectReplacement = function(editor,theObj,beforeCursor) {
            if (theObj.replacementRow != null && theObj.replacementRow >= 0) {
                var currentCursor = editor.selection.getCursor();
                if (beforeCursor != null && currentCursor != null && beforeCursor.row === currentCursor.row) {
                    var delta = currentCursor.column - beforeCursor.column;
                    if (delta > 0) {
                        theObj.replacementLength += delta;
                    }
                }
                editor.selection.moveTo(theObj.replacementRow, theObj.replacementColumn);
                editor.selection.selectTo(theObj.replacementRow, theObj.replacementColumn + theObj.replacementLength);
            }
        };

        HanaDdlTokenizerWithWorker.prototype.onBeforePostMessage = function (src) {
            // update CompilationUnitManager cache each time the source is modified
            if (this.parser != null && this.resolver != null) {
                var ast = this.parser.parseAndGetAst2(this.resolver,src);
                CompilationUnitManager.singleton.addTestData(ast);
            }
        };

        return HanaDdlTokenizerWithWorker;
    }
);