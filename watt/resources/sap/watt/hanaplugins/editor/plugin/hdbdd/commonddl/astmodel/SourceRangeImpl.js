define(
    ["require","commonddl/astmodel/EObjectImpl","commonddl/astmodel/CompilationUnitImpl","rndrt/rnd","commonddl/AnnotationPayload"], //dependencies
    function (require,EObjectImpl,CompilationUnitImpl,rnd,AnnotationPayload) {
        function SourceRangeImpl() {
            EObjectImpl.call(this);
        }
        SourceRangeImpl.prototype = Object.create(EObjectImpl.prototype);
        SourceRangeImpl.START_TOKEN_INDEX_WITH_COMMENTS_EDEFAULT = 0;
        SourceRangeImpl.END_TOKEN_INDEX_WITH_COMMENTS_EDEFAULT = 0;
        SourceRangeImpl.START_TOKEN_INDEX_EDEFAULT = 0;
        SourceRangeImpl.prototype.startTokenIndex = SourceRangeImpl.START_TOKEN_INDEX_EDEFAULT;
        SourceRangeImpl.END_TOKEN_INDEX_EDEFAULT = 0;
        SourceRangeImpl.prototype.endTokenIndex = SourceRangeImpl.END_TOKEN_INDEX_EDEFAULT;
        SourceRangeImpl.START_OFFSET_EDEFAULT = 0;
        SourceRangeImpl.END_OFFSET_EDEFAULT = 0;
        SourceRangeImpl.START_OFFSET_WITH_COMMENTS_EDEFAULT = 0;
        SourceRangeImpl.END_OFFSET_WITH_COMMENTS_EDEFAULT = 0;
        SourceRangeImpl.prototype.constructor = SourceRangeImpl;
        SourceRangeImpl.prototype.getStartTokenIndexWithComments = function() {
            var includeAnnotation = true;
            var AnnotationValueImpl = require("commonddl/astmodel/AnnotationValueImpl");
            var AnnotationRecordValueImpl = require("commonddl/astmodel/AnnotationRecordValueImpl");
            var AnnotationNameValuePairImpl = require("commonddl/astmodel/AnnotationNameValuePairImpl");
            var AnnotationArrayValueImpl = require("commonddl/astmodel/AnnotationArrayValueImpl");
            if (this instanceof AnnotationValueImpl || this instanceof AnnotationRecordValueImpl || this instanceof AnnotationNameValuePairImpl || this instanceof AnnotationArrayValueImpl) {
                includeAnnotation = false;
            }
            var index = this.getStartTokenIndex();
            return SourceRangeImpl.getStartTokenIndexWithCommentsUtil(this,index,includeAnnotation);
        };
        SourceRangeImpl.getStartTokenIndexWithCommentsUtil = function(me,index,includeAnnotations) {
            var cu = SourceRangeImpl.getCompilationUnit(me);
            var tokens = cu.getTokenList();
            index--;
            /*eslint-disable no-constant-condition*/
            while (true) {
                if (index >= 0) {
                    var t = tokens[index];
                    /*eslint-disable no-eq-null*/
                    if (t != null) {
                        if (SourceRangeImpl.isComment(t)) {
                            index--;
                            continue;
                        }
                        if (includeAnnotations && SourceRangeImpl.isAnnotation(t)) {
                            index--;
                            continue;
                        }
                    }
                }
                index++;
                var current = tokens[index];
                if (index > 0) {
                    var previous = tokens[index - 1];
                    if (rnd.Category.CAT_COMMENT === current.m_category && rnd.Category.CAT_COMMENT !== previous.m_category && current.m_line === previous.m_line) {
                        index++;
                    }
                }
                break;
            }
            return index;
        };
        SourceRangeImpl.isAnnotation = function(t) {
            var payload = t.getPayload();
            if (payload instanceof AnnotationPayload) {
                return true;
            }
            return false;
        };
        SourceRangeImpl.isComment = function(t) {
            if (t.m_category === rnd.Category.CAT_COMMENT) {
                return true;
            }
            return false;
        };
        SourceRangeImpl.prototype.getEndTokenIndexWithComments = function() {
            var index = this.getEndTokenIndex();
            return SourceRangeImpl.getEndTokenIndexWithCommentsUtil(this,index);
        };
        SourceRangeImpl.getEndTokenIndexWithCommentsUtil = function(me,index) {
            if (index === -1) {
                return -1;
            }
            var cu = SourceRangeImpl.getCompilationUnit(me);
            var tokens = cu.getTokenList();
            var currentLine = tokens[index].m_line;
            index++;
            /*eslint-disable no-constant-condition*/
            while (true) {
                var t = tokens[index];
                /*eslint-disable no-eq-null*/
                if (t != null) {
                    if (SourceRangeImpl.isComment(t) && t.m_line === currentLine) {
                        index++;
                        continue;
                    }
                }
                index--;
                break;
            }
            return index;
        };
        SourceRangeImpl.prototype.getStartTokenIndex = function() {
            return this.startTokenIndex;
        };
        SourceRangeImpl.prototype.setStartTokenIndex = function(newStartTokenIndex) {
            var oldStartTokenIndex = this.startTokenIndex;
            this.startTokenIndex = newStartTokenIndex;
        };
        SourceRangeImpl.prototype.getEndTokenIndex = function() {
            return this.endTokenIndex;
        };
        SourceRangeImpl.prototype.setEndTokenIndex = function(newEndTokenIndex) {
            var oldEndTokenIndex = this.endTokenIndex;
            this.endTokenIndex = newEndTokenIndex;
        };
        SourceRangeImpl.prototype.getStartOffset = function() {
            var idx = this.getStartTokenIndex();
            if (idx === -1) {
                return -1;
            }
            var cu = SourceRangeImpl.getCompilationUnit(this);
            var token = cu.getTokenList()[idx];
            return token.m_offset;
        };
        SourceRangeImpl.prototype.getEndOffset = function() {
            var idx = this.getEndTokenIndex();
            if (idx === -1) {
                return -1;
            }
            var cu = SourceRangeImpl.getCompilationUnit(this);
            var token = cu.getTokenList()[idx];
            return token.m_offset + token.m_lexem.length;
        };
        SourceRangeImpl.prototype.getStartOffsetWithComments = function() {
            var idx = this.getStartTokenIndexWithComments();
            if (idx === -1) {
                return -1;
            }
            var cu = SourceRangeImpl.getCompilationUnit(this);
            var token = cu.getTokenList()[idx];
            return token.m_offset;
        };
        SourceRangeImpl.getDdlStatement = function(me) {
            var container = me;
            var ExpressionImpl = require("commonddl/astmodel/ExpressionImpl");
            var DdlStatementImpl = require("commonddl/astmodel/DdlStatementImpl");
            /*eslint-disable no-constant-condition*/
            while (!(container instanceof DdlStatementImpl)) {
                var parent = container.eContainer();
                if (parent == null && container instanceof ExpressionImpl) {
                    parent = (container).getParent();
                }
                container = parent;
                if (container == null) {
                    throw new Error();
                }
            }
            var cu = container;
            return cu;
        };
        SourceRangeImpl.ExpressionImpl = null;
        SourceRangeImpl.getCompilationUnit = function(me) {

            var ExpressionImpl = SourceRangeImpl.ExpressionImpl;
            if (ExpressionImpl == null) {
                try {
                    ExpressionImpl = require("commonddl/astmodel/ExpressionImpl");
                }catch(e){ //eslint-disable-line no-empty
                }
            }

            var container = me;
            /*eslint-disable no-constant-condition*/
            while (!(container instanceof CompilationUnitImpl)) {
                var parent = container.eContainer();
                /*eslint-disable no-eq-null*/
                if (parent == null && container instanceof ExpressionImpl) {
                    parent = (container).getParent();
                }
                container = parent;
                if (container == null) {
                    throw new Error();
                }
            }
            var cu = container;
            return cu;
        };
        SourceRangeImpl.prototype.getEndOffsetWithComments = function() {
            var cu = SourceRangeImpl.getCompilationUnit(this);
            var idx = this.getEndTokenIndexWithComments();
            var token = cu.getTokenList()[idx];
            if (token == null) {
                return -1;
            }
            return token.m_offset + token.m_lexem.length;
        };
        SourceRangeImpl.prototype.toString = function() {
            var result = new rnd.StringBuffer(EObjectImpl.prototype.toString.call(this));
            result.append(" (startTokenIndex: ");
            result.append(this.startTokenIndex);
            result.append(", endTokenIndex: ");
            result.append(this.endTokenIndex);
            result.append(")");
            return result.toString();
        };
        return SourceRangeImpl;
    }
);