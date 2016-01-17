// Copyright (c) 2015 SAP SE, All Rights Reserved
define(
    ['rndrt/rnd',
     "converttohdbcds/Log",
     "commonddl/astmodel/AnnotationValueImpl",
     "commonddl/astmodel/EntityDeclarationImpl",
     "commonddl/astmodel/AnnotationRecordValueImpl",
     "commonddl/astmodel/AnnotationArrayValueImpl",
     "commonddl/astmodel/TypeDeclarationImpl",
     "commonddl/astmodel/ContextDeclarationImpl",
     "commonddl/astmodel/CompilationUnitImpl",
     "commonddl/astmodel/ViewDefinitionImpl",
     "commonddl/astmodel/AttributeDeclarationImpl"
    ],
    function (rnd, Log,
              AnnotationValueImpl,
              EntityDeclarationImpl,
              AnnotationRecordValueImpl,
              AnnotationArrayValueImpl,
              TypeDeclarationImpl,
              ContextDeclarationImpl,
              CompilationUnitImpl,
              ViewDefinitionImpl,
              AttributeDeclarationImpl
        ) {
        "use strict";

        var Utils = rnd.Utils;

        var MARK = '\u0011';
        var CATALOG = 'Catalog';
        var NOKEY = 'nokey';
        var GENERATE_TABLE_TYPE = 'GenerateTableType';
        var WITH_PRIVILEGE = 'WithStructuredPrivilegeCheck';

        var MSG_HAS_SCHEMA = { id:"001", message:"Found schema: {0}" };
        var MSG_ANNOTATION_CHANGES_COUNT = { id:"002", message: "Found '{0}' Annotations to convert" };
        var MSG_NOP = { id:"003", message:"Nothing to convert in this source" };
        var MSG_DONE = { id:"004", message:"Done" };
        //var MSG_1_UNEXPECTED_TOKENS = { id:"005", message:"Found 1 unexpected token" };
        //var MSG_COUNT_UNEXPECTED_TOKENS = { id:"006", message:"Found {0} unexpected tokens" };
        var MSG_UNSUPPORTED_TEXT_ANALYSIS_CID  = { id:"007", message:"The annotation @SearchIndex.textAnalysis.configurationID is currently not supported on HDI" };
        var MSG_UNSUPPORTED_TEXT_MINING_CID  = { id:"008", message:"The annotation @SearchIndex.textMining.configurationID is currently not supported on HDI" };

        var MSG_SYNTAX_ERROR = { id:"010", message:"Syntax error in source" };
        var MSG_PARSE_ERROR = { id:"011", message:"Internal parser error" };
        var MSG_UNEXPECTED_TOKENS = { id:"012", message:"Unexpected tokens \"{0}\" Line: {1} Column: {2}" };
        var MSG_WRONG_AST = { id:"013", message:"Cannot Parse  {0} \"{1}\" Line: {2}" };
        var MSG_TIMEOUT_ERROR = { id:"014", message:"Timeout. The source might be too complex to parse" };
        var MSG_ID_WITH_BAD_CHARACTER = { id:"015", message:"The identifier \'{0}\' contains a \"{1}\". This is not allowed in a definition" };

        var containsForbiddenCharactersReg = /\.|::/;

        //private static class
        function RangeToPrune (startOffset, endOffset) {
            this.startOffset = startOffset;
            this.endOffset = endOffset;
        }

        //private static class
        function Index () {
            this.name = undefined;
            this.unique = true;
            this.ascending = undefined;
            this.fields = [];
        }

        Index.prototype.toString = function (prefix) {
            var sb = '';

            if (this.warn !== undefined) {
                sb = this.warn.concat(prefix ? prefix : '');
            }
            if (this.unique) {
                sb = sb.concat("unique ");
            }
            sb = sb.concat("index ");
            sb = sb.concat(this.name);
            sb = sb.concat(" on (");
            var iLast = this.fields.length;
            for (var i = 0; i < iLast; ) {
                sb = sb.concat(this.fields[i]);
                if (++i < iLast) {
                    sb = sb.concat(", ");
                }
            }
            sb = sb.concat(")");
            if (this.ascending !== undefined) {
                sb = sb.concat(" ");
                sb = sb.concat(this.ascending);
            }
            sb = sb.concat(";");

            return sb;
        };

        //private static class
        function SearchIndex (elementName) {
            this.elementName = elementName;
            this.text = undefined;
            this.fuzzy = undefined;
            this.isFTI = false;
            this.isFUZZY = false;
        }

        SearchIndex.prototype.analyze = function () {
            if (this.text !== undefined && this.text.enabled !== undefined) {
                this.isFTI = this.text.enabled;
            }
            if (this.isFTI === false && this.fuzzy !== undefined && this.fuzzy.enabled !== undefined) {
                this.isFUZZY = this.fuzzy.enabled;
            }
        };

        SearchIndex.prototype.initText = function () {
            if (this.text === undefined) {
                this.text = {};
            }
        };

        SearchIndex.prototype.initTextAnalysis = function () {
            this.initText();
            if (this.text.textAnalysis === undefined) {
                this.text.textAnalysis = {};
            }
        };

        SearchIndex.prototype.initTextMining = function () {
            this.initText();
            if (this.text.textMining === undefined) {
                this.text.textMining = {};
            }
        };

        SearchIndex.prototype.initFuzzy = function () {
            if (this.fuzzy === undefined) {
                this.fuzzy = {};
            }
        };

        SearchIndex.prototype.toString = function (prefix) {
            var sb = '';
            if (!this.isFTI && !this.isFUZZY) {
                this.analyze();
            }

            if (this.isFTI) {
                sb = 'FULLTEXT INDEX ';
                if (this.text.name !== undefined) {
                    if (this.warn !== undefined) {
                        sb = this.warn.concat('FULLTEXT INDEX ');
                    }
                    sb = sb.concat( this.text.name);
                } else {
                    sb = sb.concat( 'noName');
                }
                sb = sb.concat( ' ON ( ', this.elementName, ' )');

                //FUZZY SEARCH <on_off>
                if (this.fuzzy !== undefined && this.fuzzy.enabled !== undefined) {
                    sb = sb.concat('\n', prefix, 'FUZZY SEARCH INDEX ', this.renderBooleanValue(this.fuzzy.enabled));
                }

                //SEARCH ONLY <on_off>
                if (this.text.storeOriginalContent !== undefined) {
                    sb = sb.concat('\n', prefix, 'SEARCH ONLY ', this.renderBooleanValue(!this.text.storeOriginalContent));
                } else {
                    sb = sb.concat('\n', prefix, 'SEARCH ONLY OFF');
                }

                //PHRASE INDEX RATIO <numeric>
                if (this.text.phraseIndexRatio !== undefined) {
                    sb = sb.concat('\n', prefix, 'PHRASE INDEX RATIO ', this.text.phraseIndexRatio);
                } else {
                    sb = sb.concat('\n', prefix, 'PHRASE INDEX RATIO 0.0');
                }

                //SYNC|ASYNC
                if (this.text.async !== undefined) {
                    if (this.text.async) {
                        sb = sb.concat('\n', prefix, 'ASYNCHRONOUS');
                    } else {
                        sb = sb.concat('\n', prefix, 'SYNCHRONOUS');
                    }
                } else {
                    sb = sb.concat('\n', prefix, 'ASYNC');
                }

                if (this.text.textAnalysis !== undefined) {
                    //FAST PREPROCESS <on_off> TEXT ANALYSIS <on_off>
                    if (this.text.textAnalysis.mode !== undefined) {
                        if (this.text.textAnalysis.mode === '#FAST') {
                            sb = sb.concat('\n', prefix, 'FAST PREPROCESS ON');
                        } else if (this.text.textAnalysis.mode === '#SIMPLE') {
                            sb = sb.concat('\n', prefix, 'FAST PREPROCESS OFF TEXT ANALYSIS OFF');
                        } else if (this.text.textAnalysis.mode === '#EXTENDED') {
                            sb = sb.concat('\n', prefix, 'FAST PREPROCESS OFF TEXT ANALYSIS ON');
                        }
                    } else {
                        sb = sb.concat('\n', prefix, 'FAST PREPROCESS ON');
                    }

                    //LANGUAGE COLUMN <element_name>
                    if (this.text.textAnalysis.languageElement !== undefined) {
                        sb = sb.concat('\n', prefix, 'LANGUAGE COLUMN ', this.text.textAnalysis.languageElement);
                    }

                    //LANGUAGE DETECTION ( <name list> )
                    if (this.text.textAnalysis.languageDetection !== undefined) {
                        sb = sb.concat('\n', prefix, 'LANGUAGE DETECTION ( ');
                        for (var i = 0; i < this.text.textAnalysis.languageDetection.length; ++i){
                            if (i > 0) {
                                sb = sb.concat(', ', this.text.textAnalysis.languageDetection[i]);
                            } else {
                                sb = sb.concat(this.text.textAnalysis.languageDetection[i]);
                            }
                        }
                        sb = sb.concat(' )');
                    }

                    //MIME TYPE COLUMN  <element name> )
                    if (this.text.textAnalysis.mimeTypeElement !== undefined) {
                        sb = sb.concat('\n', prefix, 'MIME TYPE COLUMN ', this.text.textAnalysis.mimeTypeElement);
                    }

                    //MIME TYPE <element name> )
                    if (this.text.textAnalysis.mimeType !== undefined) {
                        sb = sb.concat('\n', prefix, 'MIME TYPE ', this.text.textAnalysis.mimeType);
                    }

                    //TOKEN SEPARATORS <string>
                    if (this.text.textAnalysis.tokenSeparators !== undefined) {
                        sb = sb.concat('\n', prefix, 'TOKEN SEPARATORS ', this.text.textAnalysis.tokenSeparators);
                    }

                    //CONFIGURATION <string>
                    if (this.text.textAnalysis.configurationID !== undefined) {
                        sb = sb.concat('\n', prefix, '// The annotation "@SearchIndex.textAnalysis.configurationID name"');
                        sb = sb.concat('\n', prefix, '// has been converted to "CONFIGURATION name"');
                        sb = sb.concat('\n', prefix, '// but this might not be supported by your system');
                        sb = sb.concat('\n', prefix, 'CONFIGURATION ', this.text.textAnalysis.configurationID);
                    }
                } else {
                    sb = sb.concat('\n', prefix, 'FAST PREPROCESS ON');
                }

                //TEXT MINING <on_off>
                if (this.text.textMining !== undefined) {
                    if (this.text.textMining.enabled !== undefined) {
                        sb = sb.concat('\n', prefix, 'TEXT MINING ', this.renderBooleanValue(this.text.textMining.enabled));
                    }

                    //TEXT MINING CONFIGURATION <string>
                    if (this.text.textMining.configurationID !== undefined) {
                        sb = sb.concat('\n', prefix, '// The annotation "@SearchIndex.textMining.configurationID name"');
                        sb = sb.concat('\n', prefix, '// has been converted to "TEXT MINING CONFIGURATION name"');
                        sb = sb.concat('\n', prefix, '// but this might not be supported by your system');
                        sb = sb.concat('\n', prefix, 'TEXT MINING CONFIGURATION ', this.text.textMining.configurationID);
                    }
                }

                sb = sb.concat( ';');
            } else if (this.isFUZZY) {
                sb = 'FUZZY SEARCH INDEX ON ( '.concat(this.elementName, ' )');
                if (this.fuzzy.mode !== undefined && this.fuzzy.mode !== "#DEFAULT"){
                    sb = sb.concat('\n', prefix, 'FUZZY SEARCH MODE \'');
                    sb = sb.concat(this.fuzzy.mode.substring(1));
                    sb = sb.concat('\'');
                }
                sb = sb.concat( ';');
            }
            return sb;
        };

        SearchIndex.prototype.renderBooleanValue = function (booleanValue) {
            return (booleanValue === true) ? 'ON' : 'OFF';
        };

        function ConvertToHdi(cu) {
            this.m_cu = cu;
            this.m_hasSchema = false;
            this.m_countChanges = 0;
            this.m_schemaName = "";
            this.m_rangesToPrune = [];
            this.m_indexDeclarationToAdd = {};
            this.m_tableTypeDeclarationToAdd = {};
            this.m_prefixFromDeclarationToAdd = {};
            this.m_searchIndexToAdd = {};
            this.m_fuzzyIndexToAdd = {};
            this.m_alreadyHasTC = {};
            this.m_log = new Log();
        }

        /**
         * Analyze a compile unit looking for annotations to rewrite.
         *
         * @return true if rewriting is needed
         */
        ConvertToHdi.prototype.analyze = function () {
            var tokens = this.m_cu.getTokens();
            var annotations = this.m_cu.getAnnotations();
            var index;
            var sAnnotation;
            var annotation;
// Not used because we meanwhile run a defensive syntax check before AST construction
//            var countErrors = 0;
//
//            for(index = 0; index < tokens.length; ++index) {
//                if (tokens[index].m_err_state === rnd.ErrorState.Erroneous) {
//                    ++countErrors;
//                }
//            }
//            if (countErrors === 1) {
//                this.m_log.warn(MSG_1_UNEXPECTED_TOKENS.id, [MSG_1_UNEXPECTED_TOKENS.message]);
//            } else if (countErrors > 1) {
//                this.m_log.warn(MSG_COUNT_UNEXPECTED_TOKENS.id, [MSG_COUNT_UNEXPECTED_TOKENS.message, countErrors ]);
//            }

            for( index = 0; index < annotations.length; ++index) {
                annotation = annotations[index];
                tokens = annotation.getNameTokenPath();
                if (tokens.length > 0 ){
                    sAnnotation = tokens[0].m_lexem;
                    if (sAnnotation === "Schema"){
                        this.handleSchema(annotation);
                        break;
                    }
                }
            }
            var ti = this.m_cu.eAllContents();
            for(var i = 0; i < ti.length; ++i){
                var eo = ti[i];

                if (eo instanceof EntityDeclarationImpl) {

                    //1: Loop over the entities annotation to rewrite
                    annotations = eo.getAnnotationList();
                    for(var j = 0; j < annotations.length; ++j) {
                        annotation = annotations[j];
                        tokens = annotation.getNameTokenPath();
                        if (tokens.length > 0) {
                            sAnnotation = tokens[0].m_lexem;
                            if (sAnnotation === CATALOG){
                                this.exploreCatalog(eo, annotation);
                            } else if (sAnnotation === NOKEY) {
                                this.m_countChanges += 1; //enforce Conversion
                                this.pruneAnnotationTokens(annotation);
                            }
                        }
                    }

                    //2: loop over the entities fields searching for  SearchIndex to rewrite
                    this.exploreEntitiesFields(eo);

                } else if (eo instanceof TypeDeclarationImpl &&
                    (eo.eContainer() === null || eo.eContainer() instanceof ContextDeclarationImpl || eo.eContainer() instanceof CompilationUnitImpl ) &&
                    this.isTypeAlias(eo) === false) {
                    var hasGeneratedTypeAnnotation = false;
                    annotations = eo.getAnnotationList();
                    for(var k = 0; k < annotations.length; ++k) {
                        annotation = annotations[k];
                        tokens = annotation.getNameTokenPath();
                        if (tokens.length > 0) {
                            sAnnotation = tokens[0].m_lexem;
                            if (sAnnotation === GENERATE_TABLE_TYPE){
                                this.m_countChanges += 1; //enforce Conversion
                                hasGeneratedTypeAnnotation = true;
                                this.exploreGenerateTable(eo, annotation);
                            }
                        }
                    }
                    if (hasGeneratedTypeAnnotation === false) {
                        this.m_countChanges += 1; //enforce Conversion
                        this.addGenerateType(eo.getStartTokenIndex());
                    }
                } else if (eo instanceof ViewDefinitionImpl) {
                    annotations = eo.getAnnotationList();
                    for(var l = 0; l < annotations.length; ++l) {
                        annotation = annotations[l];
                        tokens = annotation.getNameTokenPath();
                        if (tokens.length > 0) {
                            sAnnotation = tokens[0].m_lexem;
                            if (sAnnotation === WITH_PRIVILEGE){
                                this.m_countChanges += 1; //enforce Conversion
                                this.exploreWithPrivilegeCheck(eo, annotation);
                            }
                        }
                    }
                }
            }
            if (this.m_hasSchema) {
                this.m_log.log(MSG_HAS_SCHEMA.id, [MSG_HAS_SCHEMA.message, this.m_schemaName]);
            }
            if (this.m_countChanges > 0) {
                this.m_log.log(MSG_ANNOTATION_CHANGES_COUNT.id, [MSG_ANNOTATION_CHANGES_COUNT.message, this.m_countChanges]);
            }

            return this.m_hasSchema || this.m_countChanges > 0;
        };

        /**
         * Write the compile unit in HDI syntax
         *
         * analyze() must have been called previously
         *
         * @return the converted source
         */
        ConvertToHdi.prototype.convert = function () {
            if (this.m_hasSchema || this.m_countChanges > 0) {

                // if (this.m_canConvertSegmentWise) {
                return this.convertSegmentWise();
                //} else {
                //    return convertTokenWise();
                //}
            } else {
                //nothing to change
                this.m_log.log(MSG_NOP.id, [MSG_NOP.message]);
                return this.m_cu.getParsedSource();
            }
        };

        /**
         * Rescan in case of exception in parseAndGetAst2()
         *
         * (Attempt to get an error position)
         *
         * Fills the error log
         */
        ConvertToHdi.prototype.rescanOnError = function(parser, resolver, source, timeout) {
            if (timeout === true)
            {
                this.m_log.error(MSG_TIMEOUT_ERROR.id, [MSG_TIMEOUT_ERROR.message]);
                return;
            }
            this.m_log.error(MSG_PARSE_ERROR.id, [MSG_PARSE_ERROR.message]);

            var tokens = parser.parseSource(resolver,source);
            var countErrors = 0;

            for(var index = 0; index < tokens.length; ++index) {
                if (tokens[index].m_err_state === rnd.ErrorState.Erroneous) {
                    ++countErrors;
                    this.m_log.error(MSG_UNEXPECTED_TOKENS.id, [MSG_UNEXPECTED_TOKENS.message, tokens[index].m_lexem, tokens[index].m_line, tokens[index].m_column]);
                    if (countErrors > 10) {
                        break;
                    }
                }
            }
        };

        ConvertToHdi.prototype.syntaxCheck = function(parser, resolver, source) {
            var tokens = parser.parseSource(resolver,source);
            var countErrors = 0;

            for(var index = 0; index < tokens.length; ++index) {
                if (tokens[index].m_err_state === rnd.ErrorState.Erroneous) {
                    ++countErrors;
                    this.m_log.error(MSG_UNEXPECTED_TOKENS.id, [MSG_UNEXPECTED_TOKENS.message, tokens[index].m_lexem, tokens[index].m_line, tokens[index].m_column]);
                    if (countErrors > 10) {
                        break;
                    }
                }
            }
            if (countErrors > 0) {
                this.m_log.error(MSG_SYNTAX_ERROR.id, [MSG_SYNTAX_ERROR.message]);
            }
            return countErrors === 0;
        };

        /**
         * Remove ' from string literals
         */
        ConvertToHdi.prototype.unquoteSqlString = function(input) {
            var input_size = input.length;
            if (input_size < 2) {
                return input;
            }

            var output = '';
            var i;
            for (i = 1; i < input_size - 1; ++i) {
                output = output.concat(input.charAt(i));
                if (input.charAt(i) === '\'' && input.charAt(i + 1) === '\'') {
                    i += 1;
                }
            }

            return output;
        };

        /**
         * Surround a name with "
         */
        ConvertToHdi.prototype.doubleQuoteSqlString = function(input) {
            var input_size = input.length;
            var output = '';

            var foundDQuote = input.indexOf('"');
            if (foundDQuote === -1) {
                output = output.concat('"');
                output = output.concat(input);
                output = output.concat('"');
            } else {
                output = output.concat('"');
                output = output.concat(input.substring(0, foundDQuote));

                for (var i = foundDQuote; i < input_size; ++i) {
                    var c = input.charAt(i);
                    if (c === '"') {
                        output = output.concat(c);
                    }
                    output = output.concat(c);
                }

                output = output.concat('"');
            }

            return output;
        };

        /**
         * Check if a name needs double quoting
         */
        ConvertToHdi.prototype.needsQuote = function (name) {
            return this.findFirstNotOf(name, "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_") !== -1;
        };

        /**
         * Convert a string literal in a, possibly double quoted, name.
         *
         * Double quote only if needed
         */
        ConvertToHdi.prototype.convertStringLitToDQuoteId = function (sLit) {
            var unquotedLit = this.unquoteSqlString(sLit);
            if (this.needsQuote(unquotedLit)) {
                return this.doubleQuoteSqlString(unquotedLit);
            } else {
                return unquotedLit;
            }
        };

        ConvertToHdi.prototype.convertStringLitToDQuoteIdPath = function (sLit) {
            var unquotedLit = this.unquoteSqlString(sLit);
            var unquotedPathArray = unquotedLit.split('.');
            var unquotedPath = '';
            for (var i = 0; i < unquotedPathArray.length; ++i) {
                if (i > 0) {
                    unquotedPath = unquotedPath.concat('.');
                }
                if (this.needsQuote(unquotedPathArray[i])) {
                    unquotedPath = unquotedPath.concat(this.doubleQuoteSqlString(unquotedPathArray[i]));
                } else {
                    unquotedPath = unquotedPath.concat(unquotedPathArray[i]);
                }
            }
            return unquotedPath;
        };

        ConvertToHdi.prototype.warnForForbiddenCharacters = function (name) {
            var ma = name.match(containsForbiddenCharactersReg);
            if (ma !== null) {
                this.m_log.warn(MSG_ID_WITH_BAD_CHARACTER.id, [MSG_ID_WITH_BAD_CHARACTER.message, name, ma[0]]);
                if (ma[0] === '.') {
                    return '// WARNING: The character \"'.concat(ma[0]).concat('\", used in the original source, is not suported in a name\n');
                }
                return '// WARNING: The characters \"'.concat(ma[0]).concat('\", used in the original source, are not suported in a name\n');
            }
            return null;
        };

        // abc.def.g"h => AbcDefGH
        ConvertToHdi.prototype.makeFTINameTrial = function (name) {
            var normalized = '';
            var toUpp = true;
            for (var i = 0; i < name.length; ++i){
                var c = name.charAt(i);
                if ("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_".indexOf(c) === -1) {
                    toUpp = true;
                    continue;
                }
                if (toUpp) {
                    toUpp = false;
                    c = c.toUpperCase();
                }
                normalized = normalized.concat(c);
            }
            return (normalized.length < 114 ? normalized : normalized.substring(0, 114));
        };

        ConvertToHdi.prototype.handleSchema = function (annotation) {
            this.m_hasSchema = true;
            this.m_countChanges += 1;
            var v = annotation.getValue();
            if (v instanceof AnnotationValueImpl) {
                this.m_schemaName = v.getValueToken().m_lexem;
            }
            this.pruneAnnotationTokens(annotation);
        };

        ConvertToHdi.prototype.pruneAnnotationTokens = function (annotation) {
            var rangeToPrune = new RangeToPrune(
                this.m_cu.getTokenList()[annotation.getStartTokenIndex()].m_offset,
                this.m_cu.getTokenList()[annotation.getEndTokenIndex()].getEndOffset()
            );
            this.m_rangesToPrune.push(rangeToPrune);
        };

        //also prune optional column
        ConvertToHdi.prototype.pruneAnnotationTokensColumn = function (annotation) {
            var endTokenIndex = annotation.getEndTokenIndex();
            var tokens = this.m_cu.getTokenList();
            for(var j = endTokenIndex; j < tokens.length; ++j) {
                var tok = tokens[j];
                if (tok.m_category === rnd.Category.CAT_COMMENT) {
                    continue;
                }
                if (tok.m_lexem === ','){
                    endTokenIndex = j;
                    break;
                }
            }
            var rangeToPrune = new RangeToPrune(
                this.m_cu.getTokenList()[annotation.getStartTokenIndex()].m_offset,
                this.m_cu.getTokenList()[endTokenIndex].getEndOffset()
            );
            this.m_rangesToPrune.push(rangeToPrune);
        };

        ConvertToHdi.prototype.exploreCatalog = function (ed, annotation) {
            var av = annotation.getValue();
            var path = this.getFlatName(annotation);

            if (path === CATALOG && av instanceof AnnotationRecordValueImpl){
                //@Catalog : { tableType : <tableTypeValue> , index : <indexAnnoValue> }
                if (this.exploreCatalogRecord(ed, av) === true) {
                    this.pruneAnnotationTokens(annotation); //prune the entire Catalog annotation
                }
            } else if (path === 'Catalog.index' && av instanceof AnnotationArrayValueImpl){
                //@Catalog.index : <indexAnnoValue>
                this.exploreCatalogIndexArray(ed, av);
                this.pruneAnnotationTokens(annotation); //prune the entire Catalog annotation
            } else if (path === 'Catalog.tableType'&& av instanceof AnnotationValueImpl) {
                //@Catalog.tableType : tableType
                this.exploreCatalogTableTypeValue(ed, av, false);
                this.pruneAnnotationTokens(annotation); //prune the entire Catalog annotation
            }
        };

        ConvertToHdi.prototype.exploreGenerateTable = function (ed, annotation) {
            var av = annotation.getValue();
            if (av === null) {
                //no value => default to true
                this.addGenerateType(ed.getStartTokenIndex());
            } else {
                if (av.getValueToken().m_lexem === 'true'){
                    this.addGenerateType(ed.getStartTokenIndex());
                }
            }
            this.pruneAnnotationTokens(annotation);
        };

        //explore @WithStructuredPrivilegeCheck annotation
        ConvertToHdi.prototype.exploreWithPrivilegeCheck = function (ed, annotation) {
            var av = annotation.getValue();
            if (av === null) {
                //no value => default to true
                this.addStructuredPrivilegeCheck(this.getEndOfViewTokenIndex(ed));
            } else {
                if (av.getValueToken().m_lexem === 'true') {
                    this.addStructuredPrivilegeCheck(this.getEndOfViewTokenIndex(ed));
                }
            }
            this.pruneAnnotationTokens(annotation); //prune the entire annotation
        };

        ConvertToHdi.prototype.getFlatName = function (annotation) {
            var tokens = annotation.getNameTokenPath();
            var name = '';
            for(var i = 0; i < tokens.length; ++i) {
                name = name.concat(tokens[i].m_lexem);
            }
            return name;
        };

        // explore a @Catalog { record } looking for index :
        // returns true if the @catalog records contains only index
        // returns false  if the @catalog records contains a tableType
        ConvertToHdi.prototype.exploreCatalogRecord = function (ed, rv) {

            var consumedAll = true;
            var  endOfEntityTokenIndex = this.getEndOfEntityTokenIndex(ed);
            var  column = this.getColumnForFields(ed, endOfEntityTokenIndex);

            var components = rv.getComponents();
            for (var i = 0; i < components.length; ++i){
                var vp = components[i];
                var  names = vp.getNameTokenPath();
                if (names.length > 0 && names[names.length - 1].m_lexem === "index") {
                    var hdi_index = this.handleIndexValue(vp.getValue(), column);

                    if (this.m_indexDeclarationToAdd[endOfEntityTokenIndex] !== undefined) {
                        var old_index = this.m_indexDeclarationToAdd[endOfEntityTokenIndex];
                        old_index += '\n' + hdi_index;
                        old_index = this.terminateIndexDeclaration(old_index, this.m_cu.getTokenList()[endOfEntityTokenIndex].m_column);
                        this.m_indexDeclarationToAdd[endOfEntityTokenIndex] = old_index;
                    } else {
                        hdi_index = this.terminateIndexDeclaration(hdi_index, this.m_cu.getTokenList()[endOfEntityTokenIndex].m_column);
                        this.m_indexDeclarationToAdd[endOfEntityTokenIndex] = hdi_index;
                    }
                    if (this.hasTC(ed)) {
                        this.storeTcPosition(endOfEntityTokenIndex);
                    }
                    this.pruneAnnotationTokensColumn(vp);
                } else if (names.length > 0 && names[names.length - 1].m_lexem === "tableType") {
                    this.exploreCatalogTableTypeValue(ed, vp.getValue(), true);
                    this.pruneAnnotationTokensColumn(vp);
                } else {
                    consumedAll = false;
                }
            }

            return consumedAll;
        };

        // explore a @Catalog.index :  [ array ]
        ConvertToHdi.prototype.exploreCatalogIndexArray = function(ed, av) {

            var endOfEntityTokenIndex = this.getEndOfEntityTokenIndex(ed);
            var column = this.getColumnForFields(ed, endOfEntityTokenIndex);

            var hdi_index = this.handleIndexValue(av, column);

            if (this.m_indexDeclarationToAdd[endOfEntityTokenIndex] !== undefined) {
                var old_index = this.m_indexDeclarationToAdd[endOfEntityTokenIndex];
                old_index += '\n' + hdi_index;
                old_index = this.terminateIndexDeclaration(old_index, this.m_cu.getTokenList()[endOfEntityTokenIndex].m_column);
                this.m_indexDeclarationToAdd[endOfEntityTokenIndex] = old_index;
            } else {
                hdi_index = this.terminateIndexDeclaration(hdi_index, this.m_cu.getTokenList()[endOfEntityTokenIndex].m_column);
                this.m_indexDeclarationToAdd[endOfEntityTokenIndex] =  hdi_index;
            }
            if (this.hasTC(ed)) {
                this.storeTcPosition(endOfEntityTokenIndex);
            }
            this.pruneAnnotationTokens(av);
        };

        // explore a @Catalog.tableType :  #xxxx
        ConvertToHdi.prototype.exploreCatalogTableTypeValue = function (ed, av, pruneColumn) {

            var beginOfEntityTokenIndex = this.getBeginOfEntityTokenIndex(ed);
            var endOfEntityTokenIndex = this.getEndOfEntityTokenIndex(ed);
            var column = this.getColumnForFields(ed, endOfEntityTokenIndex);

            var hdiTableType = this.handleTableTypeValue(av, beginOfEntityTokenIndex, column);

            hdiTableType = this.terminateIndexDeclaration(hdiTableType, (this.m_cu.getTokenList()[endOfEntityTokenIndex]).m_column);

            this.m_tableTypeDeclarationToAdd[endOfEntityTokenIndex] = hdiTableType;
            if (this.hasTC(ed)) {
                this.storeTcPosition(endOfEntityTokenIndex);
            }
            if (pruneColumn === true) {
                this.pruneAnnotationTokensColumn(av);
            } else {
                this.pruneAnnotationTokens(av);
            }
        };

        ConvertToHdi.prototype.exploreEntitiesFields = function (eo) {
            var contextForEntitiesExploration = {};
            contextForEntitiesExploration.endOfEntityTokenIndex = this.getEndOfEntityTokenIndex(eo);
            contextForEntitiesExploration.hasTC = this.hasTC(eo);
            contextForEntitiesExploration.column = this.m_cu.getTokenList()[contextForEntitiesExploration.endOfEntityTokenIndex].m_column;
            contextForEntitiesExploration.spacesPrefix = new Array(contextForEntitiesExploration.column).join( ' ' );
            contextForEntitiesExploration.FTindexes = [];

            var elements = eo.getElements();
            for (var i = 0; i < elements.length; ++i){
                var fd = elements[i];
                if (fd instanceof AttributeDeclarationImpl && fd.eContainer() === eo) {
                    var annotations = fd.getAnnotationList();
                    for(var m = 0; m < annotations.length; ++m) {
                        var annotation = annotations[m];
                        var tokens = annotation.getNameTokenPath();
                        if (tokens.length > 0) {
                            var sAnnotation = tokens[0].m_lexem;
                            if (sAnnotation === "SearchIndex"){
                                this.m_countChanges += 1; //enforce Conversion
                                this.exploreSearchIndex(contextForEntitiesExploration, fd, annotation);
                            } else if (sAnnotation === "SearchIndexes"){
                                this.m_countChanges += 1; //enforce Conversion
                                this.exploreSearchIndexes(contextForEntitiesExploration, fd, annotation);
                            }
                        }
                    }
                }
            }
            if (contextForEntitiesExploration.FTindexes.length > 0 ) {
                this.flushFTindexes(eo, contextForEntitiesExploration, this);
            }
        };

        ConvertToHdi.prototype.flushFTindexes = function (eo, contextForEntitiesExploration, converter) {
            var nameList = {};
            var anonymous = [];
            var i;
            var FTindexes = contextForEntitiesExploration.FTindexes;
            var fti;
            //search anonymous
            for (i = 0; i < FTindexes.length; ++i) {
                fti = FTindexes[i];
                if (fti.text !== undefined ) {
                    if (fti.text.name === undefined) {
                        anonymous.push(i);
                    } else {
                        var warn = this.warnForForbiddenCharacters(fti.text.name);
                        if (warn !== null) {
                            fti.warn = warn; 
                        }
                        nameList[fti.text.name] = fti.text.name;
                    }
                } else if (fti.fuzzy !== undefined) {
                    nameList[fti.elementName] = fti.elementName;
                }
            }

            //name anonymous
            for (i = 0; i < anonymous.length; ++i) {
                var nameTrial = 'ftiOn'.concat(converter.makeFTINameTrial(FTindexes[anonymous[i]].elementName));
                if (nameList[nameTrial] === undefined) {
                    FTindexes[anonymous[i]].text.name = nameTrial;
                    nameList[nameTrial] = nameTrial;
                } else {
                    for( var j = i; j < 999999; j++) {
                        var trial = nameTrial.concat(String(j));
                        if (nameList[trial] === undefined) {
                            FTindexes[anonymous[i]].text.name = trial;
                            nameList[trial] = trial;
                            break;
                        }
                    }
                }
            }

            //serialize
            for (i = 0; i < FTindexes.length; ++i) {
                fti = FTindexes[i];
                var serialized = fti.toString(contextForEntitiesExploration.spacesPrefix.concat('    '));
                if (serialized.length > 0) {
                    this.storeSearchIndex(contextForEntitiesExploration.endOfEntityTokenIndex, contextForEntitiesExploration.spacesPrefix, serialized);
                    if (contextForEntitiesExploration.hasTC) {
                        this.storeTcPosition(contextForEntitiesExploration.endOfEntityTokenIndex);
                    }
                }
            }
        };

        ConvertToHdi.prototype.exploreSearchIndex = function (contextForEntitiesExploration, fd, annotation) {
            var av = annotation.getValue();
            var path = this.getFlatName(annotation);
            var elementName = fd.getNameToken().m_lexem;
            var newIndex = false;
            var searchIndex;
            if (contextForEntitiesExploration.FTindexes.length > 0 &&
                contextForEntitiesExploration.FTindexes[contextForEntitiesExploration.FTindexes.length - 1].elementName === elementName) {
                searchIndex = contextForEntitiesExploration.FTindexes[0];
            } else {
                newIndex = true;
                searchIndex = new SearchIndex(elementName);
            }
            var foundSearchIndex = false;

            if (path === "SearchIndex" && av instanceof AnnotationRecordValueImpl){
                //@searchIndex : { text : {...}, fuzzy { ... } }
                foundSearchIndex = true;
                this.exploreASearchIndex(fd, av, searchIndex);
                this.pruneAnnotationTokens(annotation); //prune the entire SearchIndex annotation
            } else if (path === 'SearchIndex.text' && av instanceof AnnotationRecordValueImpl){
                //@path === 'SearchIndex.text : { ... }
                foundSearchIndex = true;
                searchIndex.initText();
                this.exploreSearchIndexText(searchIndex.text, av);
                this.pruneAnnotationTokens(annotation); //prune the entire SearchIndex annotation
            } else if (path === 'SearchIndex.fuzzy' && av instanceof AnnotationRecordValueImpl){
                //@path === 'SearchIndex.fuzzy : { ... }
                foundSearchIndex = true;
                searchIndex.initFuzzy();
                this.exploreSearchIndexFuzzy(searchIndex.fuzzy, av);
                this.pruneAnnotationTokens(annotation); //prune the entire SearchIndex annotation
            } else if (path === 'SearchIndex.text.enabled') {
                //@path === 'SearchIndex.text.enabled ...
                foundSearchIndex = true;
                searchIndex.initText();
                searchIndex.text.enabled = this.getBooleanValue(annotation);

                this.pruneAnnotationTokens(annotation); //prune the entire SearchIndex annotation
            } else if (path === 'SearchIndex.text.name') {
                //@path === 'SearchIndex.text.name ...
                foundSearchIndex = true;
                searchIndex.initText();
                searchIndex.text.name = this.convertStringLitToDQuoteId(annotation.getValue().getValueToken().m_lexem);

                this.pruneAnnotationTokens(annotation); //prune the entire SearchIndex annotation
            } else if (path === 'SearchIndex.text.storeOriginalContent') {
                //@path === 'SearchIndex.text.storeOriginalContent ...
                foundSearchIndex = true;
                searchIndex.initText();
                searchIndex.text.storeOriginalContent = this.getBooleanValue(annotation);

                this.pruneAnnotationTokens(annotation); //prune the entire SearchIndex annotation
            } else if (path === 'SearchIndex.text.async') {
                //@path === 'SearchIndex.text.async ...
                searchIndex.initText();
                searchIndex.text.async = this.getBooleanValue(annotation);

                this.pruneAnnotationTokens(annotation); //prune the entire SearchIndex annotation
            } else if (path === 'SearchIndex.text.textAnalysis') {
                //@path === 'SearchIndex.text.textAnalysis ...
                foundSearchIndex = true;
                searchIndex.initTextAnalysis();
                this.exploreTextAnalysis(searchIndex.text.textAnalysis, annotation.getValue());

                this.pruneAnnotationTokens(annotation); //prune the entire SearchIndex annotation
            } else if (path === 'SearchIndex.text.textAnalysis.mode') {
                //@path === 'SearchIndex.text.textAnalysis ...
                foundSearchIndex = true;
                searchIndex.initTextAnalysis();
                searchIndex.text.textAnalysis.mode = annotation.getValue().getValueToken().m_lexem;

                this.pruneAnnotationTokens(annotation); //prune the entire SearchIndex annotation
            } else if (path === 'SearchIndex.text.textAnalysis.languageElement') {
                //@path === 'SearchIndex.text.textAnalysis ...
                foundSearchIndex = true;
                searchIndex.initTextAnalysis();
                searchIndex.text.textAnalysis.languageElement = this.convertStringLitToDQuoteIdPath(annotation.getValue().getValueToken().m_lexem);

                this.pruneAnnotationTokens(annotation); //prune the entire SearchIndex annotation
            } else if (path === 'SearchIndex.text.textAnalysis.languageDetection') {
                //@path === 'SearchIndex.text.textAnalysis,languageDetection ...
                foundSearchIndex = true;
                searchIndex.initTextAnalysis();
                var values = annotation.getValue();
                if (values !== undefined && values instanceof AnnotationArrayValueImpl) {
                    var contents = values.eContents();
                    searchIndex.text.textAnalysis.languageDetection = [];
                    for (var j = 0; j < contents.length; ++j) {
                        var o = contents[j];
                        if (o instanceof AnnotationValueImpl){
                            searchIndex.text.textAnalysis.languageDetection[j] = o.getValueToken().m_lexem;
                        }
                    }
                }

                this.pruneAnnotationTokens(annotation); //prune the entire SearchIndex annotation
            } else if (path === 'SearchIndex.text.textAnalysis.mimeTypeElement') {
                //@path === 'SearchIndex.text.textAnalysis ...
                foundSearchIndex = true;
                searchIndex.initTextAnalysis();
                searchIndex.text.textAnalysis.mimeTypeElement = this.convertStringLitToDQuoteIdPath(annotation.getValue().getValueToken().m_lexem);

                this.pruneAnnotationTokens(annotation); //prune the entire SearchIndex annotation
            } else if (path === 'SearchIndex.text.textAnalysis.mimeType') {
                //@path === 'SearchIndex.text.textAnalysis ...
                foundSearchIndex = true;
                searchIndex.initTextAnalysis();
                searchIndex.text.textAnalysis.mimeType = annotation.getValue().getValueToken().m_lexem;

                this.pruneAnnotationTokens(annotation); //prune the entire SearchIndex annotation
            } else if (path === 'SearchIndex.text.textAnalysis.configurationID') {
                //@path === 'SearchIndex.text.textAnalysis ...
                foundSearchIndex = true;
                searchIndex.initTextAnalysis();
                this.m_log.warn(MSG_UNSUPPORTED_TEXT_ANALYSIS_CID.id, [MSG_UNSUPPORTED_TEXT_ANALYSIS_CID.message]);
                searchIndex.text.textAnalysis.configurationID = annotation.getValue().getValueToken().m_lexem;

                this.pruneAnnotationTokens(annotation); //prune the entire SearchIndex annotation
            } else if (path === 'SearchIndex.text.textAnalysis.tokenSeparators') {
                //@path === 'SearchIndex.text.textAnalysis ...
                foundSearchIndex = true;
                searchIndex.initTextAnalysis();
                searchIndex.text.textAnalysis.tokenSeparators = annotation.getValue().getValueToken().m_lexem;

                this.pruneAnnotationTokens(annotation); //prune the entire SearchIndex annotation
            } else if (path === 'SearchIndex.text.TextMining') {
                //@path === 'SearchIndex.text.TextMining ...
                foundSearchIndex = true;
                searchIndex.initTextMining();
                this.exploreTextMining(searchIndex.text.textMining,annotation.getValue());
                this.pruneAnnotationTokens(annotation); //prune the entire SearchIndex annotation
            } else if (path === 'SearchIndex.text.TextMining.enabled') {
                //@path === 'SearchIndex.text.TextMining.enabled ...
                foundSearchIndex = true;
                searchIndex.initTextMining();
                searchIndex.text.textMining.enabled = this.getBooleanValue(annotation);

                this.pruneAnnotationTokens(annotation); //prune the entire SearchIndex annotation
            } else if (path === 'SearchIndex.text.TextMining.configurationID') {
                //@path === 'SearchIndex.text.TextMining ...
                foundSearchIndex = true;
                searchIndex.initTextMining();
                this.m_log.warn(MSG_UNSUPPORTED_TEXT_MINING_CID.id, [MSG_UNSUPPORTED_TEXT_MINING_CID.message]);
                searchIndex.text.textMining.configurationID = annotation.getValue().getValueToken().m_lexem;

                this.pruneAnnotationTokens(annotation); //prune the entire SearchIndex annotation
            } else if (path === 'SearchIndex.fuzzy.enabled') {
                //@path === 'SearchIndex.fuzzy.enabled ...
                foundSearchIndex = true;
                searchIndex.initFuzzy();
                searchIndex.fuzzy.enabled = this.getBooleanValue(annotation);

                this.pruneAnnotationTokens(annotation); //prune the entire SearchIndex annotation
            } else if (path === 'SearchIndex.fuzzy.mode') {
                //@path === 'SearchIndex.fuzzy.mode ...
                foundSearchIndex = true;
                searchIndex.initFuzzy();
                searchIndex.fuzzy.mode = annotation.getValue().getValueToken().m_lexem;

                this.pruneAnnotationTokens(annotation); //prune the entire SearchIndex annotation
            }


            if (foundSearchIndex){
                searchIndex.analyze();
                if ((searchIndex.text !== undefined || searchIndex.fuzzy !== undefined) && newIndex === true) {
                    contextForEntitiesExploration.FTindexes.push(searchIndex);
                }
            }
        };

        //@SearchIndexes : [ { element : name, text { ... }, fuzzy {...} }, ... ]
        ConvertToHdi.prototype.exploreSearchIndexes = function (contextForEntitiesExploration, fd, annotation) {
            var av = annotation.getValue();
            var contents =av.eContents();
            var seenUnknown = false;
            for (var i = 0; i < contents.length; ++i) {
                var o = contents[i];
                var elementName;
                var text;
                var fuzzy;
                var components = o.getComponents();
                for(var j = 0; j < components.length; ++j ) {
                    var e = components[j];
                    var names = e.getNameTokenPath();
                    if (names.length > 0 && names[names.length - 1].m_lexem === "element") {
                        elementName = e.getValue().getValueToken().m_lexem;
                    } else if (names.length > 0 && names[names.length - 1].m_lexem === "text") {
                        text = e.getValue();
                    } else if (names.length > 0 && names[names.length - 1].m_lexem === "fuzzy") {
                        fuzzy = e.getValue();
                    } else {
                        seenUnknown = true;
                    }
                }
                if (elementName !== undefined && (text !== undefined || fuzzy !== undefined)) {
                    var searchIndex = new SearchIndex(this.convertStringLitToDQuoteIdPath(elementName));
                    if (text !== undefined) {
                        searchIndex.text = {};
                        this.exploreSearchIndexText(searchIndex.text, text);
                    }
                    if (fuzzy !== undefined) {
                        searchIndex.fuzzy = {};
                        this.exploreSearchIndexFuzzy(searchIndex.fuzzy, fuzzy);
                    }

                    searchIndex.analyze();
                    if (searchIndex.isFUZZY) {
                        var serialized = searchIndex.toString(contextForEntitiesExploration.spacesPrefix.concat('    '));
                        this.storeFuzzySearchIndex(contextForEntitiesExploration.endOfEntityTokenIndex, contextForEntitiesExploration.spacesPrefix, serialized);
                        if (contextForEntitiesExploration.hasTC) {
                            this.storeTcPosition(contextForEntitiesExploration.endOfEntityTokenIndex);
                        }
                    } else if (searchIndex.isFTI) {
                        contextForEntitiesExploration.FTindexes.push(searchIndex);
                    }
                }
            }
            if (contents.length > 0 && seenUnknown === false) {
                this.pruneAnnotationTokens(annotation); //prune the entire SearchIndexes annotation
            }
        };

        ConvertToHdi.prototype.exploreASearchIndex = function (fd, annotation, searchIndex) {

            var components = annotation.getComponents();
            for (var i = 0; i < components.length; ++i){
                var vp = components[i];
                var  names = vp.getNameTokenPath();
                if (names.length > 0 && names[names.length - 1].m_lexem === "text") {
                    searchIndex.initText();
                    this.exploreSearchIndexText(searchIndex.text, vp.getValue());

                } else if (names.length > 0 && names[names.length - 1].m_lexem === "fuzzy") {
                    searchIndex.initFuzzy();
                    this.exploreSearchIndexFuzzy(searchIndex.fuzzy, vp.getValue());
                }
            }
        };

        ConvertToHdi.prototype.exploreSearchIndexText = function (text, annotation) {
            var components = annotation.getComponents();
            for (var i = 0; i < components.length; ++i){
                var vp = components[i];
                var  names = vp.getNameTokenPath();
                var name = (names.length > 0 ? names[names.length - 1].m_lexem : "");
                if (name === "enabled" || name === "storeOriginalContent" || name === "async") {
                    text[name] = this.getBooleanValue(vp);
                } else if (name === "textAnalysis") {
                    if (text.textAnalysis === undefined) {
                        text.textAnalysis = {};
                    }
                    this.exploreTextAnalysis(text.textAnalysis, vp.getValue());
                } else if (name ==='textMining'){
                    if (text.textMining === undefined) {
                        text.textMining = {};
                    }
                    this.exploreTextMining(text.textMining, vp.getValue());
                } else if (name === "name"){
                    text[name] = this.convertStringLitToDQuoteId(vp.getValue().getValueToken().m_lexem);
                } else if (name !== ""){
                    text[name] = vp.getValue().getValueToken().m_lexem;
                }
            }
        };

        ConvertToHdi.prototype.exploreTextAnalysis = function (text, annotation) {
            var components = annotation.getComponents();
            for (var i = 0; i < components.length; ++i){
                var vp = components[i];
                var  names = vp.getNameTokenPath();
                var name = (names.length > 0 ? names[names.length - 1].m_lexem : "");
                if (name === "languageDetection") {
                    var values = vp.getValue();
                    if (values !== undefined && values instanceof AnnotationArrayValueImpl) {
                        var contents = values.eContents();
                        text.languageDetection = [];
                        for (var j = 0; j < contents.length; ++j) {
                            var o = contents[j];
                            if (o instanceof AnnotationValueImpl){
                                text.languageDetection[j] = o.getValueToken().m_lexem;
                            }
                        }
                    }
                } else if (name === "languageElement" || name === "mimeTypeElement") {
                    text[name] = this.convertStringLitToDQuoteIdPath(vp.getValue().getValueToken().m_lexem);
                } else if (name === "configurationID") {
                    this.m_log.warn(MSG_UNSUPPORTED_TEXT_ANALYSIS_CID.id, [MSG_UNSUPPORTED_TEXT_ANALYSIS_CID.message]);
                    text[name] = vp.getValue().getValueToken().m_lexem;
                } else {
                    text[name] = vp.getValue().getValueToken().m_lexem;
                }
            }
        };

        ConvertToHdi.prototype.exploreTextMining = function (text, annotation) {
            var components = annotation.getComponents();
            for (var i = 0; i < components.length; ++i){
                var vp = components[i];
                var  names = vp.getNameTokenPath();
                var name = (names.length > 0 ? names[names.length - 1].m_lexem : "");
                if (name === "enabled") {
                    text[name] = this.getBooleanValue(vp);
                } else if (name === "configurationID"){
                    this.m_log.warn(MSG_UNSUPPORTED_TEXT_MINING_CID.id, [MSG_UNSUPPORTED_TEXT_MINING_CID.message]);
                    text[name] = vp.getValue().getValueToken().m_lexem;
                }
            }
        };

        ConvertToHdi.prototype.exploreSearchIndexFuzzy = function (text, annotation) {
            var components = annotation.getComponents();
            for (var i = 0; i < components.length; ++i){
                var vp = components[i];
                var  names = vp.getNameTokenPath();
                var name = (names.length > 0 ? names[names.length - 1].m_lexem : "");
                if (name === "enabled") {
                    text[name] = this.getBooleanValue(vp);
                } else if (name !== ""){
                    text[name] = vp.getValue().getValueToken().m_lexem;
                }
            }
        };

        ConvertToHdi.prototype.storeSearchIndex = function (endOfEntityTokenIndex, spacesPrefix, src) {
            var indexes = this.m_searchIndexToAdd[endOfEntityTokenIndex];
            if (indexes !== undefined){
                this.m_searchIndexToAdd[endOfEntityTokenIndex] = indexes.concat('\n', spacesPrefix, src, '\n', spacesPrefix);
            } else {
                this.m_searchIndexToAdd[endOfEntityTokenIndex] = '\n'.concat(spacesPrefix, src, '\n', spacesPrefix);
            }
        };

        ConvertToHdi.prototype.storeFuzzySearchIndex = function (endOfEntityTokenIndex, spacesPrefix, src) {
            var indexes = this.m_fuzzyIndexToAdd[endOfEntityTokenIndex];
            if (indexes !== undefined){
                this.m_fuzzyIndexToAdd[endOfEntityTokenIndex] = indexes.concat('\n', spacesPrefix, src, '\n', spacesPrefix);
            } else {
                this.m_fuzzyIndexToAdd[endOfEntityTokenIndex] = '\n'.concat(spacesPrefix, src, '\n', spacesPrefix);
            }
        };


        //get boolean value from annotation value pair
        ConvertToHdi.prototype.getBooleanValue = function (avp) {
            var av = avp.getValue();
            if (av !== undefined && av !== null) {
                return (av.getValueToken().m_lexem === 'true');
            }
            return true; //default value for omitted boolean value in annotation
        };

        //get the begin of the entity
        ConvertToHdi.prototype.getBeginOfEntityTokenIndex = function (ed) {
            return ed.getStartTokenIndex();
        };

        //get the closing brace of the entity
        // handling the optional ; after the closing brace
        ConvertToHdi.prototype.getEndOfEntityTokenIndex = function (ed) {
            var tokens = this.m_cu.getTokenList();
            var endIndex = ed.getEndTokenIndex();

            if (endIndex < 0 || endIndex >= tokens.length) {
                var name = '?';
                var line = 0;
                var namePath = ed.getNamePath();
                if (namePath !== undefined && namePath!== null) {
                    var entries = namePath.getPathEntries();
                    if (entries.length > 0) {
                        name = entries[entries.length - 1].nameToken.m_lexem;
                        line = entries[entries.length - 1].nameToken.m_line;
                    }
                }
                this.m_log.error(MSG_WRONG_AST.id, [MSG_WRONG_AST.message, 'ENTITY', name, line]);
                return 0;
            }


            //loop back up to }
            while (endIndex >= 0 && tokens[endIndex].m_lexem.localeCompare('}') !== 0) {
                --endIndex;
            }

            return endIndex;
        };


        ConvertToHdi.prototype.getEndOfViewTokenIndex = function (ed) {
            var tokens = this.m_cu.getTokenList();
            var endIndex = ed.getEndTokenIndex();

            if (endIndex < 0 || endIndex >= tokens.length) {
                var name = '?';
                var line = 0;
                var namePath = ed.getNamePath();
                if (namePath !== undefined && namePath!== null) {
                    var entries = namePath.getPathEntries();
                    if (entries.length > 0) {
                        name = entries[entries.length - 1].nameToken.m_lexem;
                        line = entries[entries.length - 1].nameToken.m_line;
                    }
                }
                this.m_log.error(MSG_WRONG_AST.id, [MSG_WRONG_AST.message, 'VIEW', name, line]);
                return 0;
            }

            return endIndex;
        };

        //Check iif Entity already has a technical configuration.
        // i.e. is already new source ...
        ConvertToHdi.prototype.hasTC = function (ed) {
            return (ed.technicalConfiguration !== undefined);
        };

        ConvertToHdi.prototype.storeTcPosition= function (pos) {
            this.m_alreadyHasTC[pos] = true;
        };


        // find the column used by the last field in the entity definition
        // this is the column of the begin of the last non comment line in the entity
        ConvertToHdi.prototype.getColumnForFields = function (ed, endOfEntityTokenIndex) {
            var minIndex = ed.getStartTokenIndex();
            var  tokens = this.m_cu.getTokenList();
            var column = tokens[endOfEntityTokenIndex].m_column;
            var lineOfLB = tokens[endOfEntityTokenIndex].m_line;
            var lineBeforeLB = -1;
            var i;
            var tok;
            for (i = endOfEntityTokenIndex - 1; i >= minIndex; --i) {
                tok = tokens[i];
                if (i === endOfEntityTokenIndex - 1 && tok.m_line === lineOfLB) {
                    //there are tokens before }
                    // => use LB's offset
                    return column;
                }
                if (tok.m_category === rnd.Category.CAT_COMMENT) {
                    continue;
                }
                if (lineBeforeLB === -1) {
                    lineBeforeLB = tok.m_line;
                    continue;
                }
                if (lineBeforeLB > tok.m_line) {
                    break;
                }
            }
            if (lineBeforeLB !== -1) {
                for (++i; i <= endOfEntityTokenIndex; ++i) {
                    tok = tokens[i];
                    if (tok.m_category === rnd.Category.CAT_COMMENT) {
                        continue;
                    }
                    column = tok.m_column;
                    break;
                }
            }
            return column;
        };


        ConvertToHdi.prototype.isTypeAlias = function (to) {
            var elements = to.getElements();
            if (elements.length === 1){
                var attribute = elements[0];
                if (attribute.endTokenIndex < attribute.startTokenIndex) {
                    return true;
                }
            }
            return false;
        };

        // we have found an array of indexAnnoValue, collects it's data and compute the equivalent representation
        ConvertToHdi.prototype.handleIndexValue = function (av, column) {
            this.m_countChanges += 1;

            var spacesPrefix = new Array(column).join( ' ' );
            var newIndex = '';

            //loop over an array of indexAnnotationValue
            var contents =av.eContents();
            for (var i = 0; i < contents.length; ++i) {
                var o = contents[i];

                var indexDesc = new Index();

                if (o instanceof AnnotationRecordValueImpl) {

                    //loop over the annIndexSpec
                    var components = o.getComponents();
                    for (var j = 0; j < components.length; ++j) {
                        var ap = components[j];
                        var annIndexSpecTokens = ap.getNameTokenPath();
                        var annIndexSpec = annIndexSpecTokens[annIndexSpecTokens.length - 1].m_lexem;

                        if (annIndexSpec === 'name') {
                            indexDesc.name = this.convertStringLitToDQuoteId(ap.getValue().getValueToken().m_lexem);
                            var warn = this.warnForForbiddenCharacters(indexDesc.name);
                            if (warn !== null) {
                                indexDesc.warn = warn; 
                            }
                            continue;
                        }
                        if (annIndexSpec === 'unique') {
                            indexDesc.unique = this.getBooleanValue(ap);
                            continue;
                        }
                        if (annIndexSpec === 'order') {
                            var asc = ap.getValue().getValueToken().m_lexem;
                            indexDesc.ascending = asc.substring(1).toLowerCase();
                            continue;
                        }
                        if (annIndexSpec === 'elementNames') {
                            var  names = ap.getValue();
                            var  elementNames = names.getValues();
                            for (var k = 0; k < elementNames.length; ++k ) {
                                var name = elementNames[k];
                                indexDesc.fields.push(this.convertStringLitToDQuoteId(name.getValueToken().m_lexem));
                            }
                            continue;
                        }

                    }

                    newIndex = newIndex.concat('\n');
                    newIndex = newIndex.concat(spacesPrefix);
                    newIndex = newIndex.concat(indexDesc.toString(spacesPrefix));
                }
            }

            return newIndex;
        };


        ConvertToHdi.prototype.replaceRange = function (s, start, end, substitute) {
            return s.substring(0, start) + substitute + s.substring(end);
        };

        ConvertToHdi.prototype.convertSegmentWise = function () {
            var newSrc = this.m_cu.getParsedSource();
            var i;

            //1 mark range to delete (without modifying offsets)
            for (i = 0; i < this.m_rangesToPrune.length; ++i) {
                var rp = this.m_rangesToPrune[i];
                var padding = new Array(rp.endOffset -  rp.startOffset + 1).join( MARK );
                newSrc = this.replaceRange(newSrc, rp.startOffset , rp.endOffset, padding );
            }

            //2: insert new src backward
            var tokens = this.m_cu.getTokenList();
            var tokensCount = tokens.length;
            var countChanges = (this.m_hasSchema ? this.m_countChanges - 1 : this.m_countChanges);

            for (i = tokensCount - 1; i >= 0; --i) {
                var tok;
                var indexRewrite = this.m_indexDeclarationToAdd[i];
                var tableRewrite = this.m_tableTypeDeclarationToAdd[i];
                var searchRewrite = this.m_searchIndexToAdd[i];
                var fuzzyRewrite = this.m_fuzzyIndexToAdd[i];
                if (indexRewrite !== undefined || tableRewrite !== undefined || searchRewrite !== undefined || fuzzyRewrite !== undefined) {
                    tok = tokens[i];
                    var technicalConf = (this.m_alreadyHasTC[i] === undefined  ? '} technical configuration {' : '');
                    if (tableRewrite !== undefined) {
                        technicalConf = technicalConf.concat(tableRewrite);
                    }
                    if (indexRewrite !== undefined){
                        technicalConf = technicalConf.concat(indexRewrite);
                    }
                    if (searchRewrite !== undefined){
                        technicalConf = technicalConf.concat(searchRewrite);
                    }
                    if (fuzzyRewrite !== undefined){
                        technicalConf = technicalConf.concat(fuzzyRewrite);
                    }
                    newSrc = Utils.stringInsertAt(newSrc, tok.m_offset, technicalConf);
                    if (--countChanges <= 0) {
                        break;
                    }
                } else if (this.m_prefixFromDeclarationToAdd[i] !== undefined) {
                    tok = tokens[i];
                    newSrc = Utils.stringInsertAt(newSrc, tok.m_offset, this.m_prefixFromDeclarationToAdd[i]);
                    if (--countChanges <= 0) {
                        break;
                    }
                }
            }

            //3: remove characters to prune
            var newSource1 = newSrc.replace( new RegExp("\n[ \t]*" + MARK + "+[ \t]*\n", 'g'), "\n");
            var newSource2 = newSource1.replace( new RegExp(MARK, 'g'), "");
            var newSource3 = newSource2.replace(/\n[ \t]+\n/g, "\n\n");

            this.m_log.log(MSG_DONE.id, [MSG_DONE.message]);
            return newSource3;

        };

        // we have found an array of indexAnnoValue, collects it's data and compute the equivalent representation
        ConvertToHdi.prototype.handleTableTypeValue = function (av, beginOfEntityTokenIndex, column) {
            this.m_countChanges += 1;

            var spacesPrefix = new Array(column).join( ' ' );
            var newTableType = '';

            var tokenAv = av.getValueToken().m_lexem;
            var tableTypeString = "";

            if (tokenAv === '#ROW') {
                tableTypeString = "row store;";
            } else if (tokenAv === '#COLUMN') {
                tableTypeString = "column store;";
            } else if (tokenAv === '#GLOBAL_TEMPORARY') {
                tableTypeString = "row store;";
                this.makeEntityTemporary(beginOfEntityTokenIndex);
            } else if (tokenAv  === '#GLOBAL_TEMPORARY_COLUMN') {
                tableTypeString = "column store;";
                this.makeEntityTemporary(beginOfEntityTokenIndex);
            }

            if (tableTypeString.length > 0) {
                newTableType = newTableType.concat('\n');
                newTableType = newTableType.concat(spacesPrefix);
                newTableType = newTableType.concat(tableTypeString);
            }

            return newTableType;
        };

        ConvertToHdi.prototype.makeEntityTemporary = function (beginOfEntityTokenIndex) {
            this.m_prefixFromDeclarationToAdd[beginOfEntityTokenIndex] = 'temporary ';
        };

        ConvertToHdi.prototype.addGenerateType = function (beginOfTypeTokenIndex) {
            this.m_prefixFromDeclarationToAdd[beginOfTypeTokenIndex] = 'table ';
        };

        ConvertToHdi.prototype.addStructuredPrivilegeCheck = function (endOfViewTokenIndex) {
            this.m_prefixFromDeclarationToAdd[endOfViewTokenIndex] = ' with structured privilege check';
        };

        //when converting segment wise, we need to append \n and spaces to place the
        // entity closing brace at the proper place
        ConvertToHdi.prototype.terminateIndexDeclaration = function (idxDecl, column) {

            var spacesPrefix = new Array(column).join( ' ' );

            var newIndex = idxDecl;
            newIndex = newIndex.concat('\n');
            newIndex = newIndex.concat(spacesPrefix);

            return newIndex;
        };


        ConvertToHdi.prototype.findFirstNotOf = function (name, characters) {
            for (var i = 0; i < name.length; ++i) {
                if (characters.indexOf(name.charAt(i)) === -1) {
                    return i;
                }
            }
            return -1;
        };

        return ConvertToHdi;
    }
);
