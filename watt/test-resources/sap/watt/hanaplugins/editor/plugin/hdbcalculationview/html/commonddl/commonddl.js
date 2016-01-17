define(
    'commonddl/astmodel/EObjectContainmentEList',["rndrt/rnd"], //dependencies
    function (rnd) {
        var Utils = rnd.Utils;

        function EObjectContainmentEList(owner) {
            this.owner = owner;
        }

        EObjectContainmentEList.prototype = Object.create(Array.prototype);

        EObjectContainmentEList.prototype.push = function (obj) {
            if (Utils.arrayContains(this, obj))
                return;

            Array.prototype.push.call(this, obj);
            if (obj.setContainer)
                obj.setContainer(this.owner);
        };

        EObjectContainmentEList.prototype.addAll=function(list) {
            for (var i=0;i<list.length;i++) {
                var e = list[i];
                this.push(e);
            }
        };
        
        EObjectContainmentEList.prototype.isEmpty=function(){
            Utils.arrayIsEmpty(this);
        };

        return EObjectContainmentEList;
    }
);
define(
    'commonddl/astmodel/EObjectImpl',["require","rndrt/rnd", "commonddl/astmodel/EObjectContainmentEList"], //dependencies
    function (require, rnd, EObjectContainmentEList) {
        var Utils = rnd.Utils;

        function EObjectImpl() {

        }

        EObjectImpl.prototype.setContainer = function (parent) {
            this.container=parent;
        };

        EObjectImpl.prototype.eContents = function () {
            //returns all its children
            var ProxyStatementImpl = require("commonddl/astmodel/ProxyStatementImpl");
            var CompilationUnitImpl = require("commonddl/astmodel/CompilationUnitImpl");
            var result = [];
            if (this instanceof ProxyStatementImpl)
                return result;
            for(var key in this){
                if (key=="parent" || key=="container")
                    continue;
                var child = this[key];
                if (child instanceof  ProxyStatementImpl || child instanceof CompilationUnitImpl)
                    continue;
                if (child instanceof EObjectImpl) {
                    if (child.container) {
                        if (child.container !== this) {
                            continue; //parent/container is not this -> don't return is as eContents
                        }
                    }
                    result.push(child);
                }else if (child instanceof  EObjectContainmentEList) {
                    for (var i=0;i<child.length;i++) {
                        result.push(child[i]);
                    }
                }
            }
            return result;
        };

        EObjectImpl.prototype.eAllContents = function () {
            var result=[];
            this.internalGetAllContents(result,this);
            return result;
        };

        EObjectImpl.prototype.internalGetAllContents=function(result,obj) {
            if (obj==null || !obj.eContents || Utils.arrayContains(result, obj))
                return;  //don't run into an endless loop
            result.push(obj);
            var children = obj.eContents();
            for (var i=0;i<children.length;i++) {
                this.internalGetAllContents(result,children[i]);
            }
        };

        EObjectImpl.prototype.eContainer = function() {
            if (this.container===undefined) {
                if (this.getParent) {
                    return this.getParent();
                }
            }
            return this.container;
        };

        return EObjectImpl;
    }
);
define(
    'commonddl/astmodel/StatementContainerImpl',["commonddl/astmodel/EObjectImpl","commonddl/astmodel/EObjectContainmentEList"], //dependencies
    function (EObjectImpl,EObjectContainmentEList) {
        StatementContainerImpl.prototype = Object.create(EObjectImpl.prototype);
        StatementContainerImpl.prototype.statements=null;
        function StatementContainerImpl() {
            EObjectImpl.call(this);
        }
        StatementContainerImpl.prototype.eStaticClass = function() {
            return IAstPackage.Literals.STATEMENT_CONTAINER;
        };
        StatementContainerImpl.prototype.getStatements = function() {
            if (this.statements == null) {
                this.statements=new EObjectContainmentEList(this);
            }
            return this.statements;
        };
        StatementContainerImpl.prototype.eInverseRemove = function(otherEnd,featureID,msgs) {
            switch (featureID) {
                case IAstPackage.STATEMENT_CONTAINER__STATEMENTS:
                    return (this.getStatements()).basicRemove(otherEnd,msgs);
            }

        };
        StatementContainerImpl.prototype.eGet = function(featureID,resolve,coreType) {
            switch (featureID) {
                case IAstPackage.STATEMENT_CONTAINER__STATEMENTS:
                    return this.getStatements();
            }
            return EObjectImpl.prototype.eGet.call(this,featureID,resolve,coreType);
        };
        StatementContainerImpl.prototype.eSet = function(featureID,newValue) {
        };
        StatementContainerImpl.prototype.eUnset = function(featureID) {
        };
        StatementContainerImpl.prototype.eIsSet = function(featureID) {
            switch (featureID) {
                case IAstPackage.STATEMENT_CONTAINER__STATEMENTS:
                    return this.statements != null && !this.statements.isEmpty();
            }
            return EObjectImpl.prototype.eIsSet.call(this,featureID);
        };
        return StatementContainerImpl;
    }
);
define(
    'commonddl/astmodel/CompilationUnitImpl',["commonddl/astmodel/StatementContainerImpl","commonddl/astmodel/EObjectContainmentEList"], //dependencies
    function (StatementContainerImpl,EObjectContainmentEList) {
        CompilationUnitImpl.prototype = Object.create(StatementContainerImpl.prototype);
        CompilationUnitImpl.PARSED_SOURCE_EDEFAULT=null;
        CompilationUnitImpl.prototype.parsedSource=CompilationUnitImpl.PARSED_SOURCE_EDEFAULT;
        CompilationUnitImpl.prototype.tokens=null;
        CompilationUnitImpl.prototype.annotations=null;
        CompilationUnitImpl.prototype.repositoryAccess=null;
        function CompilationUnitImpl() {
            StatementContainerImpl.call(this);
        }
        CompilationUnitImpl.prototype.eStaticClass = function() {
            return IAstPackage.Literals.COMPILATION_UNIT;
        };
        CompilationUnitImpl.prototype.getParsedSource = function() {
            return this.parsedSource;
        };
        CompilationUnitImpl.prototype.setParsedSource = function(newParsedSource) {
            var oldParsedSource=this.parsedSource;
            this.parsedSource=newParsedSource;
        };
        CompilationUnitImpl.prototype.getTokens = function() {
            Activator.trace("PLEASE USE METHOD ICompilationUnit#getTokenList");
            if (this.tokens == null) {
                this.tokens=new EDataTypeUniqueEList<Token>(Token.class,this,IAstPackage.COMPILATION_UNIT__TOKENS);
                this.tokens=this.tokens.concat(this.getTokenList());
            }
            return this.tokens;
        };
        CompilationUnitImpl.prototype.tokenList=null;
        CompilationUnitImpl.prototype.getTokenList = function() {
            return this.tokenList;
        };
        CompilationUnitImpl.prototype.setTokenList = function(tokenListParam) {
            this.tokenList=tokenListParam;
        };
        CompilationUnitImpl.prototype.getAnnotations = function() {
            if (this.annotations == null) {
                this.annotations=new EObjectContainmentEList(this);
            }
            return this.annotations;
        };
        CompilationUnitImpl.prototype.eInverseRemove = function(otherEnd,featureID,msgs) {
            switch (featureID) {
                case IAstPackage.COMPILATION_UNIT__ANNOTATIONS:
                    return (this.getAnnotations()).basicRemove(otherEnd,msgs);
            }

        };
        CompilationUnitImpl.prototype.eGet = function(featureID,resolve,coreType) {
            switch (featureID) {
                case IAstPackage.COMPILATION_UNIT__PARSED_SOURCE:
                    return this.getParsedSource();
                case IAstPackage.COMPILATION_UNIT__TOKENS:
                    return this.getTokens();
                case IAstPackage.COMPILATION_UNIT__ANNOTATIONS:
                    return this.getAnnotations();
            }
            return StatementContainerImpl.prototype.eGet.call(this,featureID,resolve,coreType);
        };
        CompilationUnitImpl.prototype.eSet = function(featureID,newValue) {
        };
        CompilationUnitImpl.prototype.eUnset = function(featureID) {
        };
        CompilationUnitImpl.prototype.eIsSet = function(featureID) {
            switch (featureID) {
                case IAstPackage.COMPILATION_UNIT__PARSED_SOURCE:
                    return CompilationUnitImpl.PARSED_SOURCE_EDEFAULT == null ? this.parsedSource != null : !PARSED_SOURCE_EDEFAULT===this.parsedSource;
                case IAstPackage.COMPILATION_UNIT__TOKENS:
                    return this.tokens != null && !this.tokens.isEmpty();
                case IAstPackage.COMPILATION_UNIT__ANNOTATIONS:
                    return this.annotations != null && !this.annotations.isEmpty();
            }
            return StatementContainerImpl.prototype.eIsSet.call(this,featureID);
        };
        CompilationUnitImpl.prototype.toString = function() {
            if (this.eIsProxy()) {
                return StatementContainerImpl.prototype.toString.call(this);
            }
            var result=new StringBuffer(StatementContainerImpl.prototype.toString.call(this));
            result.append(" (parsedSource: ");
            result.append(this.parsedSource);
            result.append(", tokens: ");
            result.append(this.tokens);
            result.append(')');
            return result.toString();
        };
        CompilationUnitImpl.prototype.setRepositoryAccess = function(prepositoryAccess) {
            this.repositoryAccess=prepositoryAccess;
        };
        CompilationUnitImpl.prototype.getRepositoryAccess = function() {
            return this.repositoryAccess;
        };
        return CompilationUnitImpl;
    }
);
define(
    'commonddl/AnnotationPayload',[], //dependencies
    function () {
        

        function AnnotationPayload() {
            this.isAnnotationPayload = true; // please don't remove , is used in AbapDdlTokenizerWithWorker
        }

        return AnnotationPayload;
    }
);



define(
    'commonddl/astmodel/SourceRangeImpl',["require","commonddl/astmodel/EObjectImpl","commonddl/astmodel/CompilationUnitImpl","rndrt/rnd","commonddl/AnnotationPayload"], //dependencies
    function (require,EObjectImpl,CompilationUnitImpl,rnd,AnnotationPayload) {
        SourceRangeImpl.prototype = Object.create(EObjectImpl.prototype);
        SourceRangeImpl.START_TOKEN_INDEX_WITH_COMMENTS_EDEFAULT=0;
        SourceRangeImpl.END_TOKEN_INDEX_WITH_COMMENTS_EDEFAULT=0;
        SourceRangeImpl.START_TOKEN_INDEX_EDEFAULT=0;
        SourceRangeImpl.prototype.startTokenIndex=SourceRangeImpl.START_TOKEN_INDEX_EDEFAULT;
        SourceRangeImpl.END_TOKEN_INDEX_EDEFAULT=0;
        SourceRangeImpl.prototype.endTokenIndex=SourceRangeImpl.END_TOKEN_INDEX_EDEFAULT;
        SourceRangeImpl.START_OFFSET_EDEFAULT=0;
        SourceRangeImpl.END_OFFSET_EDEFAULT=0;
        SourceRangeImpl.START_OFFSET_WITH_COMMENTS_EDEFAULT=0;
        SourceRangeImpl.END_OFFSET_WITH_COMMENTS_EDEFAULT=0;
        function SourceRangeImpl() {
            EObjectImpl.call(this);
        }
        SourceRangeImpl.prototype.eStaticClass = function() {
            return IAstPackage.Literals.SOURCE_RANGE;
        };
        SourceRangeImpl.prototype.getStartTokenIndexWithComments = function() {
            var includeAnnotation=true;
            var AnnotationValueImpl = require("commonddl/astmodel/AnnotationValueImpl");
            var AnnotationRecordValueImpl = require("commonddl/astmodel/AnnotationRecordValueImpl");
            var AnnotationNameValuePairImpl = require("commonddl/astmodel/AnnotationNameValuePairImpl");
            var AnnotationArrayValueImpl = require("commonddl/astmodel/AnnotationArrayValueImpl");
            if (this instanceof AnnotationValueImpl || this instanceof AnnotationRecordValueImpl || this instanceof AnnotationNameValuePairImpl|| this instanceof AnnotationArrayValueImpl) {
                includeAnnotation=false;
            }
            var index=this.getStartTokenIndex();
            return SourceRangeImpl.getStartTokenIndexWithCommentsUtil(this,index,includeAnnotation);
        };
        SourceRangeImpl.getStartTokenIndexWithCommentsUtil = function(me,index,includeAnnotations) {
            var cu=SourceRangeImpl.getCompilationUnit(me);
            var tokens=cu.getTokenList();
            index--;
            while (true) {
                if (index >= 0) {
                    var t=tokens[index];
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
                var current=tokens[index];
                if (index > 0) {
                    var previous=tokens[index - 1];
                    if (rnd.Category.CAT_COMMENT===current.m_category && rnd.Category.CAT_COMMENT===previous.m_category == false && current.m_line == previous.m_line) {
                        index++;
                    }
                }
                break;
            }
            return index;
        };
        SourceRangeImpl.isAnnotation = function(t) {
            var payload=t.getPayload();
            if (payload instanceof AnnotationPayload) {
                return true;
            }
            return false;
        };
        SourceRangeImpl.isComment = function(t) {
            if (t.m_category===rnd.Category.CAT_COMMENT) {
                return true;
            }
            return false;
        };
        SourceRangeImpl.prototype.getEndTokenIndexWithComments = function() {
            var index=this.getEndTokenIndex();
            return SourceRangeImpl.getEndTokenIndexWithCommentsUtil(this,index);
        };
        SourceRangeImpl.getEndTokenIndexWithCommentsUtil = function(me,index) {
            if (index == -1) {
                return -1;
            }
            var cu=SourceRangeImpl.getCompilationUnit(me);
            var tokens=cu.getTokenList();
            var currentLine=tokens[index].m_line;
            index++;
            while (true) {
                var t=tokens[index];
                if (t != null) {
                    if (SourceRangeImpl.isComment(t) && t.m_line == currentLine) {
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
            var oldStartTokenIndex=this.startTokenIndex;
            this.startTokenIndex=newStartTokenIndex;
        };
        SourceRangeImpl.prototype.getEndTokenIndex = function() {
            return this.endTokenIndex;
        };
        SourceRangeImpl.prototype.setEndTokenIndex = function(newEndTokenIndex) {
            var oldEndTokenIndex=this.endTokenIndex;
            this.endTokenIndex=newEndTokenIndex;
        };
        SourceRangeImpl.prototype.getStartOffset = function() {
            var idx=this.getStartTokenIndex();
            if (idx == -1) {
                return -1;
            }
            var cu=SourceRangeImpl.getCompilationUnit(this);
            var token=cu.getTokenList()[idx];
            return token.m_offset;
        };
        SourceRangeImpl.prototype.getEndOffset = function() {
            var idx=this.getEndTokenIndex();
            if (idx == -1) {
                return -1;
            }
            var cu=SourceRangeImpl.getCompilationUnit(this);
            var token=cu.getTokenList()[idx];
            return token.m_offset + token.m_lexem.length;
        };
        SourceRangeImpl.prototype.getStartOffsetWithComments = function() {
            var idx=this.getStartTokenIndexWithComments();
            if (idx == -1) {
                return -1;
            }
            var cu=SourceRangeImpl.getCompilationUnit(this);
            var token=cu.getTokenList()[idx];
            return token.m_offset;
        };
        SourceRangeImpl.getDdlStatement = function(me) {
            var container=me;
            while (!(container instanceof DdlStatementImpl)) {
                var parent=container.eContainer();
                if (parent == null && container instanceof ExpressionImpl) {
                    parent=(container).getParent();
                }
                container=parent;
                if (container == null) {
                    throw new IllegalSelectorException();
                }
            }
            var cu=container;
            return cu;
        };
        SourceRangeImpl.ExpressionImpl = null;
        SourceRangeImpl.getCompilationUnit = function(me) {

            var ExpressionImpl = SourceRangeImpl.ExpressionImpl;
            if (ExpressionImpl==null) {
                try {
                    ExpressionImpl = require("commonddl/astmodel/ExpressionImpl");
                }catch(e){
                    debugger;
                }
            }

            var container=me;
            while (!(container instanceof CompilationUnitImpl)) {
                var parent=container.eContainer();
                if (parent == null && container instanceof ExpressionImpl) {
                    parent=(container).getParent();
                }
                container=parent;
                if (container == null) {
                    throw new IllegalStateException();
                }
            }
            var cu=container;
            return cu;
        };
        SourceRangeImpl.prototype.getEndOffsetWithComments = function() {
            var cu=SourceRangeImpl.getCompilationUnit(this);
            var idx=this.getEndTokenIndexWithComments();
            var token=cu.getTokenList()[idx];
            return token.m_offset + token.m_lexem.length;
        };
        SourceRangeImpl.prototype.eGet = function(featureID,resolve,coreType) {
            switch (featureID) {
                case IAstPackage.SOURCE_RANGE__START_TOKEN_INDEX_WITH_COMMENTS:
                    return this.getStartTokenIndexWithComments();
                case IAstPackage.SOURCE_RANGE__END_TOKEN_INDEX_WITH_COMMENTS:
                    return this.getEndTokenIndexWithComments();
                case IAstPackage.SOURCE_RANGE__START_TOKEN_INDEX:
                    return this.getStartTokenIndex();
                case IAstPackage.SOURCE_RANGE__END_TOKEN_INDEX:
                    return this.getEndTokenIndex();
                case IAstPackage.SOURCE_RANGE__START_OFFSET:
                    return this.getStartOffset();
                case IAstPackage.SOURCE_RANGE__END_OFFSET:
                    return this.getEndOffset();
                case IAstPackage.SOURCE_RANGE__START_OFFSET_WITH_COMMENTS:
                    return this.getStartOffsetWithComments();
                case IAstPackage.SOURCE_RANGE__END_OFFSET_WITH_COMMENTS:
                    return this.getEndOffsetWithComments();
            }
            return EObjectImpl.prototype.eGet.call(this,featureID,resolve,coreType);
        };
        SourceRangeImpl.prototype.eSet = function(featureID,newValue) {
            switch (featureID) {
                case IAstPackage.SOURCE_RANGE__START_TOKEN_INDEX:
                    this.setStartTokenIndex(newValue);
                    return;
                case IAstPackage.SOURCE_RANGE__END_TOKEN_INDEX:
                    this.setEndTokenIndex(newValue);
                    return;
            }
            EObjectImpl.prototype.eSet.call(this,featureID,newValue);
        };
        SourceRangeImpl.prototype.eUnset = function(featureID) {
            switch (featureID) {
                case IAstPackage.SOURCE_RANGE__START_TOKEN_INDEX:
                    this.setStartTokenIndex(SourceRangeImpl.START_TOKEN_INDEX_EDEFAULT);
                    return;
                case IAstPackage.SOURCE_RANGE__END_TOKEN_INDEX:
                    this.setEndTokenIndex(SourceRangeImpl.END_TOKEN_INDEX_EDEFAULT);
                    return;
            }
            EObjectImpl.prototype.eUnset.call(this,featureID);
        };
        SourceRangeImpl.prototype.eIsSet = function(featureID) {
            switch (featureID) {
                case IAstPackage.SOURCE_RANGE__START_TOKEN_INDEX_WITH_COMMENTS:
                    return this.getStartTokenIndexWithComments() != SourceRangeImpl.START_TOKEN_INDEX_WITH_COMMENTS_EDEFAULT;
                case IAstPackage.SOURCE_RANGE__END_TOKEN_INDEX_WITH_COMMENTS:
                    return this.getEndTokenIndexWithComments() != SourceRangeImpl.END_TOKEN_INDEX_WITH_COMMENTS_EDEFAULT;
                case IAstPackage.SOURCE_RANGE__START_TOKEN_INDEX:
                    return this.startTokenIndex != SourceRangeImpl.START_TOKEN_INDEX_EDEFAULT;
                case IAstPackage.SOURCE_RANGE__END_TOKEN_INDEX:
                    return this.endTokenIndex != SourceRangeImpl.END_TOKEN_INDEX_EDEFAULT;
                case IAstPackage.SOURCE_RANGE__START_OFFSET:
                    return this.getStartOffset() != SourceRangeImpl.START_OFFSET_EDEFAULT;
                case IAstPackage.SOURCE_RANGE__END_OFFSET:
                    return this.getEndOffset() != SourceRangeImpl.END_OFFSET_EDEFAULT;
                case IAstPackage.SOURCE_RANGE__START_OFFSET_WITH_COMMENTS:
                    return this.getStartOffsetWithComments() != SourceRangeImpl.START_OFFSET_WITH_COMMENTS_EDEFAULT;
                case IAstPackage.SOURCE_RANGE__END_OFFSET_WITH_COMMENTS:
                    return this.getEndOffsetWithComments() != SourceRangeImpl.END_OFFSET_WITH_COMMENTS_EDEFAULT;
            }
            return EObjectImpl.prototype.eIsSet.call(this,featureID);
        };
        SourceRangeImpl.prototype.toString = function() {
            if (this.eIsProxy()) {
                return EObjectImpl.prototype.toString.call(this);
            }
            var result=new StringBuffer(EObjectImpl.prototype.toString.call(this));
            result.append(" (startTokenIndex: ");
            result.append(startTokenIndex);
            result.append(", endTokenIndex: ");
            result.append(endTokenIndex);
            result.append(')');
            return result.toString();
        };
        return SourceRangeImpl;
    }
);
define(
    'commonddl/astmodel/AnnotationNameValuePairImpl',["commonddl/astmodel/SourceRangeImpl","commonddl/astmodel/EObjectContainmentEList"], //dependencies
    function (SourceRangeImpl,EObjectContainmentEList) {
        AnnotationNameValuePairImpl.prototype = Object.create(SourceRangeImpl.prototype);
        AnnotationNameValuePairImpl.prototype.nameTokenPath=null;
        AnnotationNameValuePairImpl.prototype.value=null;
        function AnnotationNameValuePairImpl() {
            SourceRangeImpl.call(this);
        }
        AnnotationNameValuePairImpl.prototype.eStaticClass = function() {
            return IAstPackage.Literals.ANNOTATION_NAME_VALUE_PAIR;
        };
        AnnotationNameValuePairImpl.prototype.getNameTokenPath = function() {
            if (this.nameTokenPath == null) {
                this.nameTokenPath=new EObjectContainmentEList(this);
            }
            return this.nameTokenPath;
        };
        AnnotationNameValuePairImpl.prototype.getValue = function() {
            return this.value;
        };
        AnnotationNameValuePairImpl.prototype.basicSetValue = function(newValue,msgs) {
            var oldValue=this.value;
            this.value=newValue;
            this.value.setContainer(this);
            return msgs;
        };
        AnnotationNameValuePairImpl.prototype.setValue = function(newValue) {
            if (newValue != this.value) {
                var msgs=null;
                if (this.value != null) {

                }
                if (newValue != null) {

                }
                msgs=this.basicSetValue(newValue,msgs);
                if (msgs != null) {
                    msgs.dispatch();
                }
            }
        };
        AnnotationNameValuePairImpl.prototype.eInverseRemove = function(otherEnd,featureID,msgs) {
            switch (featureID) {
                case IAstPackage.ANNOTATION_NAME_VALUE_PAIR__VALUE:
                    return this.basicSetValue(null,msgs);
            }

        };
        AnnotationNameValuePairImpl.prototype.eGet = function(featureID,resolve,coreType) {
            switch (featureID) {
                case IAstPackage.ANNOTATION_NAME_VALUE_PAIR__NAME_TOKEN_PATH:
                    return this.getNameTokenPath();
                case IAstPackage.ANNOTATION_NAME_VALUE_PAIR__VALUE:
                    return this.getValue();
            }
            return SourceRangeImpl.prototype.eGet.call(this,featureID,resolve,coreType);
        };
        AnnotationNameValuePairImpl.prototype.eSet = function(featureID,newValue) {

        };
        AnnotationNameValuePairImpl.prototype.eUnset = function(featureID) {
        };
        AnnotationNameValuePairImpl.prototype.eIsSet = function(featureID) {
            switch (featureID) {
                case IAstPackage.ANNOTATION_NAME_VALUE_PAIR__NAME_TOKEN_PATH:
                    return this.nameTokenPath != null && !this.nameTokenPath.isEmpty();
                case IAstPackage.ANNOTATION_NAME_VALUE_PAIR__VALUE:
                    return this.value != null;
            }
            return SourceRangeImpl.prototype.eIsSet.call(this,featureID);
        };
        AnnotationNameValuePairImpl.prototype.toString = function() {
            if (this.eIsProxy()) {
                return SourceRangeImpl.prototype.toString.call(this);
            }
            var result=new StringBuffer(SourceRangeImpl.prototype.toString.call(this));
            result.append(" (nameTokenPath: ");
            result.append(nameTokenPath);
            result.append(')');
            return result.toString();
        };
        return AnnotationNameValuePairImpl;
    }
);
define(
    'commonddl/astmodel/AbstractAnnotationValueImpl',["commonddl/astmodel/SourceRangeImpl"], //dependencies
    function (SourceRangeImpl) {
        AbstractAnnotationValueImpl.prototype = Object.create(SourceRangeImpl.prototype);
        function AbstractAnnotationValueImpl() {
            SourceRangeImpl.call(this);
        }
        AbstractAnnotationValueImpl.prototype.eStaticClass = function() {
            return IAstPackage.Literals.ABSTRACT_ANNOTATION_VALUE;
        };
        return AbstractAnnotationValueImpl;
    }
);
define(
    'commonddl/astmodel/AnnotationValueImpl',["commonddl/astmodel/AbstractAnnotationValueImpl"], //dependencies
    function (AbstractAnnotationValueImpl) {
        AnnotationValueImpl.prototype = Object.create(AbstractAnnotationValueImpl.prototype);
        AnnotationValueImpl.VALUE_TOKEN_EDEFAULT=null;
        AnnotationValueImpl.prototype.valueToken=AnnotationValueImpl.VALUE_TOKEN_EDEFAULT;
        function AnnotationValueImpl() {
            AbstractAnnotationValueImpl.call(this);
        }
        AnnotationValueImpl.prototype.eStaticClass = function() {
            return IAstPackage.Literals.ANNOTATION_VALUE;
        };
        AnnotationValueImpl.prototype.getValueToken = function() {
            return this.valueToken;
        };
        AnnotationValueImpl.prototype.setValueToken = function(newValueToken) {
            var oldValueToken=this.valueToken;
            this.valueToken=newValueToken;
        };
        AnnotationValueImpl.prototype.eGet = function(featureID,resolve,coreType) {
            switch (featureID) {
                case IAstPackage.ANNOTATION_VALUE__VALUE_TOKEN:
                    return this.getValueToken();
            }
            return AbstractAnnotationValueImpl.prototype.eGet.call(this,featureID,resolve,coreType);
        };
        AnnotationValueImpl.prototype.eSet = function(featureID,newValue) {
            switch (featureID) {
                case IAstPackage.ANNOTATION_VALUE__VALUE_TOKEN:
                    this.setValueToken(newValue);
                    return;
            }
            AbstractAnnotationValueImpl.prototype.eSet.call(this,featureID,newValue);
        };
        AnnotationValueImpl.prototype.eUnset = function(featureID) {
            switch (featureID) {
                case IAstPackage.ANNOTATION_VALUE__VALUE_TOKEN:
                    this.setValueToken(AnnotationValueImpl.VALUE_TOKEN_EDEFAULT);
                    return;
            }
            AbstractAnnotationValueImpl.prototype.eUnset.call(this,featureID);
        };
        AnnotationValueImpl.prototype.eIsSet = function(featureID) {
            switch (featureID) {
                case IAstPackage.ANNOTATION_VALUE__VALUE_TOKEN:
                    return AnnotationValueImpl.VALUE_TOKEN_EDEFAULT == null ? this.valueToken != null : !VALUE_TOKEN_EDEFAULT===valueToken;
            }
            return AbstractAnnotationValueImpl.prototype.eIsSet.call(this,featureID);
        };
        AnnotationValueImpl.prototype.toString = function() {
            if (this.eIsProxy()) {
                return AbstractAnnotationValueImpl.prototype.toString.call(this);
            }
            var result=new StringBuffer(AbstractAnnotationValueImpl.prototype.toString.call(this));
            result.append(" (valueToken: ");
            result.append(valueToken);
            result.append(')');
            return result.toString();
        };
        return AnnotationValueImpl;
    }
);
define(
    'commonddl/astmodel/AnnotationRecordValueImpl',["commonddl/astmodel/AbstractAnnotationValueImpl","commonddl/astmodel/EObjectContainmentEList"], //dependencies
    function (AbstractAnnotationValueImpl,EObjectContainmentEList) {
        AnnotationRecordValueImpl.prototype = Object.create(AbstractAnnotationValueImpl.prototype);
        AnnotationRecordValueImpl.prototype.components=null;
        function AnnotationRecordValueImpl() {
            AbstractAnnotationValueImpl.call(this);
        }
        AnnotationRecordValueImpl.prototype.eStaticClass = function() {
            return IAstPackage.Literals.ANNOTATION_RECORD_VALUE;
        };
        AnnotationRecordValueImpl.prototype.getComponents = function() {
            if (this.components == null) {
                this.components=new EObjectContainmentEList(this);
            }
            return this.components;
        };
        AnnotationRecordValueImpl.prototype.eInverseRemove = function(otherEnd,featureID,msgs) {
            switch (featureID) {
                case IAstPackage.ANNOTATION_RECORD_VALUE__COMPONENTS:
                    return (this.getComponents()).basicRemove(otherEnd,msgs);
            }

        };
        AnnotationRecordValueImpl.prototype.eGet = function(featureID,resolve,coreType) {
            switch (featureID) {
                case IAstPackage.ANNOTATION_RECORD_VALUE__COMPONENTS:
                    return this.getComponents();
            }
            return AbstractAnnotationValueImpl.prototype.eGet.call(this,featureID,resolve,coreType);
        };
        AnnotationRecordValueImpl.prototype.eSet = function(featureID,newValue) {
        };
        AnnotationRecordValueImpl.prototype.eUnset = function(featureID) {
        };
        AnnotationRecordValueImpl.prototype.eIsSet = function(featureID) {
            switch (featureID) {
                case IAstPackage.ANNOTATION_RECORD_VALUE__COMPONENTS:
                    return this.components != null && !this.components.isEmpty();
            }
            return AbstractAnnotationValueImpl.prototype.eIsSet.call(this,featureID);
        };
        return AnnotationRecordValueImpl;
    }
);
define(
    'commonddl/astmodel/AbstractAnnotationImpl',["commonddl/astmodel/AnnotationNameValuePairImpl","commonddl/astmodel/AbstractAnnotationValueImpl","commonddl/astmodel/AnnotationValueImpl","commonddl/astmodel/AnnotationRecordValueImpl", "rndrt/rnd"], //dependencies
    function (AnnotationNameValuePairImpl,AbstractAnnotationValueImpl,AnnotationValueImpl,AnnotationRecordValueImpl, rnd) {
        var Utils = rnd.Utils;
        
        AbstractAnnotationImpl.prototype = Object.create(AnnotationNameValuePairImpl.prototype);
        function AbstractAnnotationImpl() {
            AnnotationNameValuePairImpl.call(this);
        }
        AbstractAnnotationImpl.prototype.eStaticClass = function() {
            return IAstPackage.Literals.ABSTRACT_ANNOTATION;
        };
        AbstractAnnotationImpl.prototype.getValueTokenForPath = function(path) {
            var namePath=this.getPathForTokens(this.getNameTokenPath());
            var value=this.getValue();
            return this.getValueForPathWithValue(path,namePath,value);
        };
        AbstractAnnotationImpl.prototype.getValueForPath = function(path) {
            if (this.getValueTokenForPath(path) == null) {
                return null;
            }
            var lexem=this.getValueTokenForPath(path).m_lexem;
            if (Utils.stringStartsWith(lexem, "'") && Utils.stringEndsWith(lexem, "'")) {
                lexem=lexem.substring(1,lexem.length - 1);
            }
            return lexem;
        };
        AbstractAnnotationImpl.prototype.getValueForPathWithValue = function(path,namePath,valueParam) {
            if (Utils.stringEqualsIgnoreCase(namePath, path)) {
                if (valueParam instanceof AnnotationValueImpl) {
                    var simpleValue=valueParam;
                    return simpleValue.getValueToken();
                }
            }else if (Utils.stringStartsWith(path.toUpperCase(), namePath.toUpperCase())) {
                if (valueParam instanceof AnnotationRecordValueImpl) {
                    var record=valueParam;
                    path=path.substring(namePath.length);
                    path=path.substring(1);
                    return this.getValueForPathRecordValue(record,path);
                }
            }
            return null;
        };
        AbstractAnnotationImpl.prototype.getPathForTokens = function(tokens) {
            var namePath=null;
            for (var tokenCount=0;tokenCount<tokens.length;tokenCount++) {
                var token=tokens[tokenCount];
                if (namePath == null) {
                    namePath=token.m_lexem;
                }else{
                    namePath=namePath + token.m_lexem;
                }
            }
            return namePath;
        };
        AbstractAnnotationImpl.prototype.getValueForPathRecordValue = function(recordValue,path) {
            var components=recordValue.getComponents();
            for (var nameValuePairCount=0;nameValuePairCount<components.length;nameValuePairCount++) {
                var nameValuePair=components[nameValuePairCount];
                var namePath=this.getPathForTokens(nameValuePair.getNameTokenPath());
                var value=nameValuePair.getValue();
                var token=this.getValueForPathWithValue(path,namePath,value);
                if (token != null) {
                    return token;
                }
            }
            return null;
        };
        return AbstractAnnotationImpl;
    }
);
define(
    'commonddl/astmodel/AnnotatedImpl',["commonddl/astmodel/EObjectImpl"], //dependencies
    function (EObjectImpl) {
        AnnotatedImpl.prototype = Object.create(EObjectImpl.prototype);
        AnnotatedImpl.prototype.annotationList=null;
        function AnnotatedImpl() {
            EObjectImpl.call(this);
        }
        AnnotatedImpl.prototype.eStaticClass = function() {
            return IAstPackage.Literals.ANNOTATED;
        };
        AnnotatedImpl.prototype.getAnnotationList = function() {
            if (this.annotationList == null) {
                this.annotationList=[];
            }
            return this.annotationList;
        };
        AnnotatedImpl.prototype.eGet = function(featureID,resolve,coreType) {
            switch (featureID) {
                case IAstPackage.ANNOTATED__ANNOTATION_LIST:
                    return this.getAnnotationList();
            }
            return EObjectImpl.prototype.eGet.call(this,featureID,resolve,coreType);
        };
        AnnotatedImpl.prototype.eSet = function(featureID,newValue) {
        };
        AnnotatedImpl.prototype.eUnset = function(featureID) {
        };
        AnnotatedImpl.prototype.eIsSet = function(featureID) {
            switch (featureID) {
                case IAstPackage.ANNOTATED__ANNOTATION_LIST:
                    return this.annotationList != null && !this.annotationList.isEmpty();
            }
            return EObjectImpl.prototype.eIsSet.call(this,featureID);
        };
        return AnnotatedImpl;
    }
);
define(
    'commonddl/astmodel/AnnotationArrayValueImpl',["commonddl/astmodel/AbstractAnnotationValueImpl","commonddl/astmodel/EObjectContainmentEList"], //dependencies
    function (AbstractAnnotationValueImpl,EObjectContainmentEList) {
        AnnotationArrayValueImpl.prototype = Object.create(AbstractAnnotationValueImpl.prototype);
        AnnotationArrayValueImpl.prototype.values=null;
        function AnnotationArrayValueImpl() {
            AbstractAnnotationValueImpl.call(this);
        }
        AnnotationArrayValueImpl.prototype.eStaticClass = function() {
            return IAstPackage.Literals.ANNOTATION_ARRAY_VALUE;
        };
        AnnotationArrayValueImpl.prototype.getValues = function() {
            if (this.values == null) {
                this.values=new EObjectContainmentEList(this);
            }
            return this.values;
        };
        AnnotationArrayValueImpl.prototype.eInverseRemove = function(otherEnd,featureID,msgs) {
            switch (featureID) {
                case IAstPackage.ANNOTATION_ARRAY_VALUE__VALUES:
                    return (this.getValues()).basicRemove(otherEnd,msgs);
            }

        };
        AnnotationArrayValueImpl.prototype.eGet = function(featureID,resolve,coreType) {
            switch (featureID) {
                case IAstPackage.ANNOTATION_ARRAY_VALUE__VALUES:
                    return this.getValues();
            }
            return AbstractAnnotationValueImpl.prototype.eGet.call(this,featureID,resolve,coreType);
        };
        AnnotationArrayValueImpl.prototype.eSet = function(featureID,newValue) {
        };
        AnnotationArrayValueImpl.prototype.eUnset = function(featureID) {
        };
        AnnotationArrayValueImpl.prototype.eIsSet = function(featureID) {
            switch (featureID) {
                case IAstPackage.ANNOTATION_ARRAY_VALUE__VALUES:
                    return this.values != null && !this.values.isEmpty();
            }
            return AbstractAnnotationValueImpl.prototype.eIsSet.call(this,featureID);
        };
        return AnnotationArrayValueImpl;
    }
);
define(
    'commonddl/astmodel/NamedDeclarationImpl',["commonddl/astmodel/SourceRangeImpl"], //dependencies
    function (SourceRangeImpl) {

        NamedDeclarationImpl.prototype = Object.create(SourceRangeImpl.prototype);
        NamedDeclarationImpl.NAME_TOKEN_EDEFAULT=null;
        NamedDeclarationImpl.prototype.nameToken=NamedDeclarationImpl.NAME_TOKEN_EDEFAULT;
        NamedDeclarationImpl.NAME_EDEFAULT=null;
        NamedDeclarationImpl.prototype.namePath=null;
        function NamedDeclarationImpl() {
            SourceRangeImpl.call(this);
        }
        NamedDeclarationImpl.prototype.eStaticClass = function() {
            return IAstPackage.Literals.NAMED_DECLARATION;
        };
        NamedDeclarationImpl.prototype.getNameToken = function() {
            return this.nameToken;
        };
        NamedDeclarationImpl.prototype.setNameToken = function(newNameToken) {
            var oldNameToken=this.nameToken;
            this.nameToken=newNameToken;
        };
        NamedDeclarationImpl.prototype.getName = function() {
            var path=this.getNamePath();
            if (path != null && path.getEntries() != null && path.getEntries().length > 0) {
                return path.getPathString(false);
            }
            var tk=this.getNameToken();
            return (tk != null) ? tk.m_lexem : "";
        };
        NamedDeclarationImpl.prototype.getNamePath = function() {
            return this.namePath;
        };
        NamedDeclarationImpl.prototype.basicSetNamePath = function(newNamePath,msgs) {
            var oldNamePath=this.namePath;
            this.namePath=newNamePath;
            return msgs;
        };
        NamedDeclarationImpl.prototype.setNamePath = function(newNamePath) {
            if (newNamePath != this.namePath) {
                var msgs=null;
                if (this.namePath != null) {

                }
                if (newNamePath != null) {

                }
                msgs=this.basicSetNamePath(newNamePath,msgs);
                if (msgs != null) {
                    msgs.dispatch();
                }
            }
        };
        NamedDeclarationImpl.prototype.eInverseRemove = function(otherEnd,featureID,msgs) {
            switch (featureID) {
                case IAstPackage.NAMED_DECLARATION__NAME_PATH:
                    return this.basicSetNamePath(null,msgs);
            }

        };
        NamedDeclarationImpl.prototype.eGet = function(featureID,resolve,coreType) {
            switch (featureID) {
                case IAstPackage.NAMED_DECLARATION__NAME_TOKEN:
                    return this.getNameToken();
                case IAstPackage.NAMED_DECLARATION__NAME:
                    return this.getName();
                case IAstPackage.NAMED_DECLARATION__NAME_PATH:
                    return this.getNamePath();
            }
            return SourceRangeImpl.prototype.eGet.call(this,featureID,resolve,coreType);
        };
        NamedDeclarationImpl.prototype.eSet = function(featureID,newValue) {
            switch (featureID) {
                case IAstPackage.NAMED_DECLARATION__NAME_TOKEN:
                    this.setNameToken(newValue);
                    return;
                case IAstPackage.NAMED_DECLARATION__NAME_PATH:
                    this.setNamePath(newValue);
                    return;
            }
            SourceRangeImpl.prototype.eSet.call(this,featureID,newValue);
        };
        NamedDeclarationImpl.prototype.eUnset = function(featureID) {
            switch (featureID) {
                case IAstPackage.NAMED_DECLARATION__NAME_TOKEN:
                    this.setNameToken(NamedDeclarationImpl.NAME_TOKEN_EDEFAULT);
                    return;
                case IAstPackage.NAMED_DECLARATION__NAME_PATH:
                    this.setNamePath(null);
                    return;
            }
            SourceRangeImpl.prototype.eUnset.call(this,featureID);
        };
        NamedDeclarationImpl.prototype.eIsSet = function(featureID) {
            switch (featureID) {
                case IAstPackage.NAMED_DECLARATION__NAME_TOKEN:
                    return NamedDeclarationImpl.NAME_TOKEN_EDEFAULT == null ? this.nameToken != null : !NAME_TOKEN_EDEFAULT.equals(nameToken);
                case IAstPackage.NAMED_DECLARATION__NAME:
                    return NamedDeclarationImpl.NAME_EDEFAULT == null ? this.getName() != null : !NAME_EDEFAULT===this.getName();
                case IAstPackage.NAMED_DECLARATION__NAME_PATH:
                    return this.namePath != null;
            }
            return SourceRangeImpl.prototype.eIsSet.call(this,featureID);
        };
        NamedDeclarationImpl.prototype.toString = function() {
            if (this.eIsProxy()) {
                return SourceRangeImpl.prototype.toString.call(this);
            }
            var result=new StringBuffer(SourceRangeImpl.prototype.toString.call(this));
            result.append(" (nameToken: ");
            result.append(nameToken);
            result.append(')');
            return result.toString();
        };
        return NamedDeclarationImpl;
    }
);
define(
    'commonddl/astmodel/ElementDeclarationImpl',["commonddl/astmodel/NamedDeclarationImpl"], //dependencies
    function (NamedDeclarationImpl) {
        ElementDeclarationImpl.prototype = Object.create(NamedDeclarationImpl.prototype);
        ElementDeclarationImpl.prototype.annotationList=null;
        ElementDeclarationImpl.KEY_TOKEN_EDEFAULT=null;
        ElementDeclarationImpl.prototype.keyToken=ElementDeclarationImpl.KEY_TOKEN_EDEFAULT;
        ElementDeclarationImpl.NULLABLE_TOKEN_EDEFAULT=null;
        ElementDeclarationImpl.prototype.nullableToken=ElementDeclarationImpl.NULLABLE_TOKEN_EDEFAULT;
        ElementDeclarationImpl.ELEMENT_TOKEN_EDEFAULT=null;
        ElementDeclarationImpl.prototype.elementToken=ElementDeclarationImpl.ELEMENT_TOKEN_EDEFAULT;
        ElementDeclarationImpl.TYPE_ID_EDEFAULT=null;
        ElementDeclarationImpl.prototype.typeIdPath=null;
        ElementDeclarationImpl.NOT_TOKEN_EDEFAULT=null;
        ElementDeclarationImpl.prototype.notToken=ElementDeclarationImpl.NOT_TOKEN_EDEFAULT;
        ElementDeclarationImpl.prototype.default_=null;
        ElementDeclarationImpl.prototype.enumerationDeclaration=null;
        ElementDeclarationImpl.prototype.anonymousType=null;
        ElementDeclarationImpl.prototype.typeOfPath=null;
        ElementDeclarationImpl.CARDINALITY_START_TOKEN_EDEFAULT=null;
        ElementDeclarationImpl.prototype.cardinalityStartToken=ElementDeclarationImpl.CARDINALITY_START_TOKEN_EDEFAULT;
        ElementDeclarationImpl.CARDINALITY_END_TOKEN_EDEFAULT=null;
        ElementDeclarationImpl.prototype.cardinalityEndToken=ElementDeclarationImpl.CARDINALITY_END_TOKEN_EDEFAULT;
        ElementDeclarationImpl.CARDINALITY_MIN_TOKEN_EDEFAULT=null;
        ElementDeclarationImpl.prototype.cardinalityMinToken=ElementDeclarationImpl.CARDINALITY_MIN_TOKEN_EDEFAULT;
        ElementDeclarationImpl.CARDINALITY_MAX_TOKEN_EDEFAULT=null;
        ElementDeclarationImpl.prototype.cardinalityMaxToken=ElementDeclarationImpl.CARDINALITY_MAX_TOKEN_EDEFAULT;
        ElementDeclarationImpl.ARRAY_TOKEN_EDEFAULT=null;
        ElementDeclarationImpl.prototype.arrayToken=ElementDeclarationImpl.ARRAY_TOKEN_EDEFAULT;
        ElementDeclarationImpl.ARRAY_OF_TOKEN_EDEFAULT=null;
        ElementDeclarationImpl.prototype.arrayOfToken=ElementDeclarationImpl.ARRAY_OF_TOKEN_EDEFAULT;
        function ElementDeclarationImpl() {
            NamedDeclarationImpl.call(this);
        }
        ElementDeclarationImpl.prototype.eStaticClass = function() {
            return IAstPackage.Literals.ELEMENT_DECLARATION;
        };
        ElementDeclarationImpl.prototype.getAnnotationList = function() {
            if (this.annotationList == null) {
                this.annotationList=[];
            }
            return this.annotationList;
        };
        ElementDeclarationImpl.prototype.isKey = function() {
            return this.getKeyToken() != null;
        };
        ElementDeclarationImpl.prototype.getKeyToken = function() {
            return this.keyToken;
        };
        ElementDeclarationImpl.prototype.setKeyToken = function(newKeyToken) {
            var oldKeyToken=this.keyToken;
            this.keyToken=newKeyToken;
        };
        ElementDeclarationImpl.prototype.getNullableToken = function() {
            return this.nullableToken;
        };
        ElementDeclarationImpl.prototype.setNullableToken = function(newNullableToken) {
            var oldNullableToken=this.nullableToken;
            this.nullableToken=newNullableToken;
        };
        ElementDeclarationImpl.prototype.isElement = function() {
            return this.getElementToken() != null;
        };
        ElementDeclarationImpl.prototype.getElementToken = function() {
            return this.elementToken;
        };
        ElementDeclarationImpl.prototype.setElementToken = function(newElementToken) {
            var oldElementToken=this.elementToken;
            this.elementToken=newElementToken;
        };
        ElementDeclarationImpl.prototype.getTypeId = function() {
            var path=this.getTypeIdPath();
            if (path != null && path.getEntries() != null && path.getEntries().length > 0) {
                var str=path.getPathString(false);
                return str;
            }else{
                return "";
            }
        };
        ElementDeclarationImpl.prototype.getTypeIdPath = function() {
            return this.typeIdPath;
        };
        ElementDeclarationImpl.prototype.basicSetTypeIdPath = function(newTypeIdPath,msgs) {
            var oldTypeIdPath=this.typeIdPath;
            this.typeIdPath=newTypeIdPath;
            this.typeIdPath.parent=this;
            return msgs;
        };
        ElementDeclarationImpl.prototype.setTypeIdPath = function(newTypeIdPath) {
            if (newTypeIdPath != this.typeIdPath) {
                var msgs=null;
                if (this.typeIdPath != null) {

                }
                if (newTypeIdPath != null) {

                }
                msgs=this.basicSetTypeIdPath(newTypeIdPath,msgs);
                if (msgs != null) {
                    msgs.dispatch();
                }
            }
        };
        ElementDeclarationImpl.prototype.getNotToken = function() {
            return this.notToken;
        };
        ElementDeclarationImpl.prototype.setNotToken = function(newNotToken) {
            var oldNotToken=this.notToken;
            this.notToken=newNotToken;
        };
        ElementDeclarationImpl.prototype.getDefault = function() {
            return this.default_;
        };
        ElementDeclarationImpl.prototype.basicSetDefault = function(newDefault,msgs) {
            var oldDefault=this.default_;
            this.default_=newDefault;
            this.default_.setContainer(this);
            return msgs;
        };
        ElementDeclarationImpl.prototype.setDefault = function(newDefault) {
            if (newDefault != this.default_) {
                var msgs=null;
                if (this.default_ != null) {

                }
                if (newDefault != null) {

                }
                msgs=this.basicSetDefault(newDefault,msgs);
                if (msgs != null) {
                    msgs.dispatch();
                }
            }
        };
        ElementDeclarationImpl.prototype.getEnumerationDeclaration = function() {
            return this.enumerationDeclaration;
        };
        ElementDeclarationImpl.prototype.basicSetEnumerationDeclaration = function(newEnumerationDeclaration,msgs) {
            var oldEnumerationDeclaration=this.enumerationDeclaration;
            this.enumerationDeclaration=newEnumerationDeclaration;
            this.enumerationDeclaration.setContainer(this);
            return msgs;
        };
        ElementDeclarationImpl.prototype.setEnumerationDeclaration = function(newEnumerationDeclaration) {
            if (newEnumerationDeclaration != this.enumerationDeclaration) {
                var msgs=null;
                if (this.enumerationDeclaration != null) {

                }
                if (newEnumerationDeclaration != null) {

                }
                msgs=this.basicSetEnumerationDeclaration(newEnumerationDeclaration,msgs);
                if (msgs != null) {
                    msgs.dispatch();
                }
            }
        };
        ElementDeclarationImpl.prototype.getAnonymousType = function() {
            return this.anonymousType;
        };
        ElementDeclarationImpl.prototype.basicSetAnonymousType = function(newAnonymousType,msgs) {
            var oldAnonymousType=this.anonymousType;
            this.anonymousType=newAnonymousType;
            this.anonymousType.setContainer(this);
            return msgs;
        };
        ElementDeclarationImpl.prototype.setAnonymousType = function(newAnonymousType) {
            if (newAnonymousType != this.anonymousType) {
                var msgs=null;
                if (this.anonymousType != null) {

                }
                if (newAnonymousType != null) {

                }
                msgs=this.basicSetAnonymousType(newAnonymousType,msgs);
                if (msgs != null) {
                    msgs.dispatch();
                }
            }
        };
        ElementDeclarationImpl.prototype.getTypeOfPath = function() {
            return this.typeOfPath;
        };
        ElementDeclarationImpl.prototype.basicSetTypeOfPath = function(newTypeOfPath,msgs) {
            var oldTypeOfPath=this.typeOfPath;
            this.typeOfPath=newTypeOfPath;
            this.typeOfPath.parent=this;
            return msgs;
        };
        ElementDeclarationImpl.prototype.setTypeOfPath = function(newTypeOfPath) {
            if (newTypeOfPath != this.typeOfPath) {
                var msgs=null;
                if (this.typeOfPath != null) {

                }
                if (newTypeOfPath != null) {

                }
                msgs=this.basicSetTypeOfPath(newTypeOfPath,msgs);
                if (msgs != null) {
                    msgs.dispatch();
                }
            }
        };
        ElementDeclarationImpl.prototype.getCardinalityStartToken = function() {
            return this.cardinalityStartToken;
        };
        ElementDeclarationImpl.prototype.setCardinalityStartToken = function(newCardinalityStartToken) {
            var oldCardinalityStartToken=this.cardinalityStartToken;
            this.cardinalityStartToken=newCardinalityStartToken;
        };
        ElementDeclarationImpl.prototype.getCardinalityEndToken = function() {
            return this.cardinalityEndToken;
        };
        ElementDeclarationImpl.prototype.setCardinalityEndToken = function(newCardinalityEndToken) {
            var oldCardinalityEndToken=this.cardinalityEndToken;
            this.cardinalityEndToken=newCardinalityEndToken;
        };
        ElementDeclarationImpl.prototype.getCardinalityMinToken = function() {
            return this.cardinalityMinToken;
        };
        ElementDeclarationImpl.prototype.setCardinalityMinToken = function(newCardinalityMinToken) {
            var oldCardinalityMinToken=this.cardinalityMinToken;
            this.cardinalityMinToken=newCardinalityMinToken;
        };
        ElementDeclarationImpl.prototype.getCardinalityMaxToken = function() {
            return this.cardinalityMaxToken;
        };
        ElementDeclarationImpl.prototype.setCardinalityMaxToken = function(newCardinalityMaxToken) {
            var oldCardinalityMaxToken=this.cardinalityMaxToken;
            this.cardinalityMaxToken=newCardinalityMaxToken;
        };
        ElementDeclarationImpl.prototype.getArrayToken = function() {
            return this.arrayToken;
        };
        ElementDeclarationImpl.prototype.setArrayToken = function(newArrayToken) {
            var oldArrayToken=this.arrayToken;
            this.arrayToken=newArrayToken;
        };
        ElementDeclarationImpl.prototype.getArrayOfToken = function() {
            return this.arrayOfToken;
        };
        ElementDeclarationImpl.prototype.setArrayOfToken = function(newArrayOfToken) {
            var oldArrayOfToken=this.arrayOfToken;
            this.arrayOfToken=newArrayOfToken;
        };
        ElementDeclarationImpl.prototype.isArrayType = function() {
            if (this.getCardinalityStartToken() != null) {
                return true;
            }
            return false;
        };
        ElementDeclarationImpl.prototype.getAnoymousType = function() {
            return this.getAnonymousType();
        };
        ElementDeclarationImpl.prototype.setAnoymousType = function(newAnoymousType) {
            this.setAnonymousType(newAnoymousType);
        };
        ElementDeclarationImpl.prototype.eInverseRemove = function(otherEnd,featureID,msgs) {
            switch (featureID) {
                case IAstPackage.ELEMENT_DECLARATION__TYPE_ID_PATH:
                    return this.basicSetTypeIdPath(null,msgs);
                case IAstPackage.ELEMENT_DECLARATION__DEFAULT:
                    return this.basicSetDefault(null,msgs);
                case IAstPackage.ELEMENT_DECLARATION__ENUMERATION_DECLARATION:
                    return this.basicSetEnumerationDeclaration(null,msgs);
                case IAstPackage.ELEMENT_DECLARATION__ANONYMOUS_TYPE:
                    return this.basicSetAnonymousType(null,msgs);
                case IAstPackage.ELEMENT_DECLARATION__TYPE_OF_PATH:
                    return this.basicSetTypeOfPath(null,msgs);
            }

        };
        ElementDeclarationImpl.prototype.eGet = function(featureID,resolve,coreType) {
            switch (featureID) {
                case IAstPackage.ELEMENT_DECLARATION__ANNOTATION_LIST:
                    return this.getAnnotationList();
                case IAstPackage.ELEMENT_DECLARATION__KEY_TOKEN:
                    return this.getKeyToken();
                case IAstPackage.ELEMENT_DECLARATION__NULLABLE_TOKEN:
                    return this.getNullableToken();
                case IAstPackage.ELEMENT_DECLARATION__ELEMENT_TOKEN:
                    return this.getElementToken();
                case IAstPackage.ELEMENT_DECLARATION__TYPE_ID:
                    return this.getTypeId();
                case IAstPackage.ELEMENT_DECLARATION__TYPE_ID_PATH:
                    return this.getTypeIdPath();
                case IAstPackage.ELEMENT_DECLARATION__NOT_TOKEN:
                    return this.getNotToken();
                case IAstPackage.ELEMENT_DECLARATION__DEFAULT:
                    return this.getDefault();
                case IAstPackage.ELEMENT_DECLARATION__ENUMERATION_DECLARATION:
                    return this.getEnumerationDeclaration();
                case IAstPackage.ELEMENT_DECLARATION__ANONYMOUS_TYPE:
                    return this.getAnonymousType();
                case IAstPackage.ELEMENT_DECLARATION__TYPE_OF_PATH:
                    return this.getTypeOfPath();
                case IAstPackage.ELEMENT_DECLARATION__CARDINALITY_START_TOKEN:
                    return this.getCardinalityStartToken();
                case IAstPackage.ELEMENT_DECLARATION__CARDINALITY_END_TOKEN:
                    return this.getCardinalityEndToken();
                case IAstPackage.ELEMENT_DECLARATION__CARDINALITY_MIN_TOKEN:
                    return this.getCardinalityMinToken();
                case IAstPackage.ELEMENT_DECLARATION__CARDINALITY_MAX_TOKEN:
                    return this.getCardinalityMaxToken();
            }
            return NamedDeclarationImpl.prototype.eGet.call(this,featureID,resolve,coreType);
        };
        ElementDeclarationImpl.prototype.eSet = function(featureID,newValue) {
        };
        ElementDeclarationImpl.prototype.eUnset = function(featureID) {
        };
        ElementDeclarationImpl.prototype.eIsSet = function(featureID) {
            switch (featureID) {
                case IAstPackage.ELEMENT_DECLARATION__ANNOTATION_LIST:
                    return this.annotationList != null && !this.annotationList.isEmpty();
                case IAstPackage.ELEMENT_DECLARATION__KEY_TOKEN:
                    return ElementDeclarationImpl.KEY_TOKEN_EDEFAULT == null ? this.keyToken != null : !KEY_TOKEN_EDEFAULT===keyToken;
                case IAstPackage.ELEMENT_DECLARATION__NULLABLE_TOKEN:
                    return ElementDeclarationImpl.NULLABLE_TOKEN_EDEFAULT == null ? this.nullableToken != null : !NULLABLE_TOKEN_EDEFAULT===nullableToken;
                case IAstPackage.ELEMENT_DECLARATION__ELEMENT_TOKEN:
                    return ElementDeclarationImpl.ELEMENT_TOKEN_EDEFAULT == null ? this.elementToken != null : !ELEMENT_TOKEN_EDEFAULT===elementToken;
                case IAstPackage.ELEMENT_DECLARATION__TYPE_ID:
                    return ElementDeclarationImpl.TYPE_ID_EDEFAULT == null ? this.getTypeId() != null : !TYPE_ID_EDEFAULT===this.getTypeId();
                case IAstPackage.ELEMENT_DECLARATION__TYPE_ID_PATH:
                    return this.typeIdPath != null;
                case IAstPackage.ELEMENT_DECLARATION__NOT_TOKEN:
                    return ElementDeclarationImpl.NOT_TOKEN_EDEFAULT == null ? this.notToken != null : !NOT_TOKEN_EDEFAULT===notToken;
                case IAstPackage.ELEMENT_DECLARATION__DEFAULT:
                    return this.default_ != null;
                case IAstPackage.ELEMENT_DECLARATION__ENUMERATION_DECLARATION:
                    return this.enumerationDeclaration != null;
                case IAstPackage.ELEMENT_DECLARATION__ANONYMOUS_TYPE:
                    return this.anonymousType != null;
                case IAstPackage.ELEMENT_DECLARATION__TYPE_OF_PATH:
                    return this.typeOfPath != null;
                case IAstPackage.ELEMENT_DECLARATION__CARDINALITY_START_TOKEN:
                    return ElementDeclarationImpl.CARDINALITY_START_TOKEN_EDEFAULT == null ? this.cardinalityStartToken != null : !CARDINALITY_START_TOKEN_EDEFAULT===cardinalityStartToken;
                case IAstPackage.ELEMENT_DECLARATION__CARDINALITY_END_TOKEN:
                    return ElementDeclarationImpl.CARDINALITY_END_TOKEN_EDEFAULT == null ? this.cardinalityEndToken != null : !CARDINALITY_END_TOKEN_EDEFAULT===cardinalityEndToken;
                case IAstPackage.ELEMENT_DECLARATION__CARDINALITY_MIN_TOKEN:
                    return ElementDeclarationImpl.CARDINALITY_MIN_TOKEN_EDEFAULT == null ? this.cardinalityMinToken != null : !CARDINALITY_MIN_TOKEN_EDEFAULT===cardinalityMinToken;
                case IAstPackage.ELEMENT_DECLARATION__CARDINALITY_MAX_TOKEN:
                    return ElementDeclarationImpl.CARDINALITY_MAX_TOKEN_EDEFAULT == null ? this.cardinalityMaxToken != null : !CARDINALITY_MAX_TOKEN_EDEFAULT===cardinalityMaxToken;
            }
            return NamedDeclarationImpl.prototype.eIsSet.call(this,featureID);
        };
        ElementDeclarationImpl.prototype.eBaseStructuralFeatureID = function(derivedFeatureID,baseClass) {
            if (baseClass == IAnnotated.class) {
                switch (derivedFeatureID) {
                    case IAstPackage.ELEMENT_DECLARATION__ANNOTATION_LIST:
                        return IAstPackage.ANNOTATED__ANNOTATION_LIST;
                    default :
                        return -1;
                }
            }
            return NamedDeclarationImpl.prototype.eBaseStructuralFeatureID.call(this,derivedFeatureID,baseClass);
        };
        ElementDeclarationImpl.prototype.eDerivedStructuralFeatureID = function(baseFeatureID,baseClass) {
            if (baseClass == IAnnotated.class) {
                switch (baseFeatureID) {
                    case IAstPackage.ANNOTATED__ANNOTATION_LIST:
                        return IAstPackage.ELEMENT_DECLARATION__ANNOTATION_LIST;
                    default :
                        return -1;
                }
            }
            return NamedDeclarationImpl.prototype.eDerivedStructuralFeatureID.call(this,baseFeatureID,baseClass);
        };
        ElementDeclarationImpl.prototype.toString = function() {
            if (this.eIsProxy()) {
                return NamedDeclarationImpl.prototype.toString.call(this);
            }
            var result=new StringBuffer(NamedDeclarationImpl.prototype.toString.call(this));
            result.append(" (keyToken: ");
            result.append(keyToken);
            result.append(", nullableToken: ");
            result.append(nullableToken);
            result.append(", elementToken: ");
            result.append(elementToken);
            result.append(", notToken: ");
            result.append(notToken);
            result.append(", cardinalityStartToken: ");
            result.append(cardinalityStartToken);
            result.append(", cardinalityEndToken: ");
            result.append(cardinalityEndToken);
            result.append(", cardinalityMinToken: ");
            result.append(cardinalityMinToken);
            result.append(", cardinalityMaxToken: ");
            result.append(cardinalityMaxToken);
            result.append(", arrayToken: ");
            result.append(arrayToken);
            result.append(", arrayOfToken: ");
            result.append(arrayOfToken);
            result.append(')');
            return result.toString();
        };
        return ElementDeclarationImpl;
    }
);
define(
    'commonddl/astmodel/AttributeDeclarationImpl',["commonddl/astmodel/ElementDeclarationImpl"], //dependencies
    function (ElementDeclarationImpl) {
        AttributeDeclarationImpl.prototype = Object.create(ElementDeclarationImpl.prototype);
        AttributeDeclarationImpl.LENGTH_TOKEN_EDEFAULT=null;
        AttributeDeclarationImpl.prototype.lengthToken=AttributeDeclarationImpl.LENGTH_TOKEN_EDEFAULT;
        AttributeDeclarationImpl.DECIMALS_TOKEN_EDEFAULT=null;
        AttributeDeclarationImpl.prototype.decimalsToken=AttributeDeclarationImpl.DECIMALS_TOKEN_EDEFAULT;
        function AttributeDeclarationImpl() {
            ElementDeclarationImpl.call(this);
        }
        AttributeDeclarationImpl.prototype.eStaticClass = function() {
            return IAstPackage.Literals.ATTRIBUTE_DECLARATION;
        };
        AttributeDeclarationImpl.prototype.getLengthToken = function() {
            return this.lengthToken;
        };
        AttributeDeclarationImpl.prototype.setLengthToken = function(newLengthToken) {
            var oldLengthToken=this.lengthToken;
            this.lengthToken=newLengthToken;
        };
        AttributeDeclarationImpl.prototype.getDecimalsToken = function() {
            return this.decimalsToken;
        };
        AttributeDeclarationImpl.prototype.setDecimalsToken = function(newDecimalsToken) {
            var oldDecimalsToken=this.decimalsToken;
            this.decimalsToken=newDecimalsToken;
        };
        AttributeDeclarationImpl.prototype.eGet = function(featureID,resolve,coreType) {
            switch (featureID) {
                case IAstPackage.ATTRIBUTE_DECLARATION__LENGTH_TOKEN:
                    return this.getLengthToken();
                case IAstPackage.ATTRIBUTE_DECLARATION__DECIMALS_TOKEN:
                    return this.getDecimalsToken();
            }
            return ElementDeclarationImpl.prototype.eGet.call(this,featureID,resolve,coreType);
        };
        AttributeDeclarationImpl.prototype.eSet = function(featureID,newValue) {
            switch (featureID) {
                case IAstPackage.ATTRIBUTE_DECLARATION__LENGTH_TOKEN:
                    this.setLengthToken(newValue);
                    return;
                case IAstPackage.ATTRIBUTE_DECLARATION__DECIMALS_TOKEN:
                    this.setDecimalsToken(newValue);
                    return;
            }
            ElementDeclarationImpl.prototype.eSet.call(this,featureID,newValue);
        };
        AttributeDeclarationImpl.prototype.eUnset = function(featureID) {
            switch (featureID) {
                case IAstPackage.ATTRIBUTE_DECLARATION__LENGTH_TOKEN:
                    this.setLengthToken(AttributeDeclarationImpl.LENGTH_TOKEN_EDEFAULT);
                    return;
                case IAstPackage.ATTRIBUTE_DECLARATION__DECIMALS_TOKEN:
                    this.setDecimalsToken(AttributeDeclarationImpl.DECIMALS_TOKEN_EDEFAULT);
                    return;
            }
            ElementDeclarationImpl.prototype.eUnset.call(this,featureID);
        };
        AttributeDeclarationImpl.prototype.eIsSet = function(featureID) {
            switch (featureID) {
                case IAstPackage.ATTRIBUTE_DECLARATION__LENGTH_TOKEN:
                    return AttributeDeclarationImpl.LENGTH_TOKEN_EDEFAULT == null ? this.lengthToken != null : !LENGTH_TOKEN_EDEFAULT===lengthToken;
                case IAstPackage.ATTRIBUTE_DECLARATION__DECIMALS_TOKEN:
                    return AttributeDeclarationImpl.DECIMALS_TOKEN_EDEFAULT == null ? this.decimalsToken != null : !DECIMALS_TOKEN_EDEFAULT===decimalsToken;
            }
            return ElementDeclarationImpl.prototype.eIsSet.call(this,featureID);
        };
        AttributeDeclarationImpl.prototype.toString = function() {
            if (this.eIsProxy()) {
                return ElementDeclarationImpl.prototype.toString.call(this);
            }
            var result=new StringBuffer(ElementDeclarationImpl.prototype.toString.call(this));
            result.append(" (lengthToken: ");
            result.append(lengthToken);
            result.append(", decimalsToken: ");
            result.append(decimalsToken);
            result.append(')');
            return result.toString();
        };
        AttributeDeclarationImpl.prototype.getTypeId = function() {
            var result=ElementDeclarationImpl.prototype.getTypeId.call(this);
            var token=this.getLengthToken();
            if (token != null) {
                result+="(" + token.m_lexem;
                token=this.getDecimalsToken();
                if (token != null) {
                    result+=", " + token.m_lexem;
                }
                result+=")";
            }
            return result;
        };
        return AttributeDeclarationImpl;
    }
);
define(
    'commonddl/astmodel/AnnotationDeclarationImpl',["commonddl/astmodel/AttributeDeclarationImpl"], //dependencies
    function (AttributeDeclarationImpl) {
        AnnotationDeclarationImpl.prototype = Object.create(AttributeDeclarationImpl.prototype);
        AnnotationDeclarationImpl.prototype.compilationUnit=null;
        AnnotationDeclarationImpl.QUALIFIED_PATH_EDEFAULT=null;
        function AnnotationDeclarationImpl() {
            AttributeDeclarationImpl.call(this);
        }
        AnnotationDeclarationImpl.prototype.eStaticClass = function() {
            return IAstPackage.Literals.ANNOTATION_DECLARATION;
        };
        AnnotationDeclarationImpl.prototype.getCompilationUnit = function() {
            return this.compilationUnit;
        };
        AnnotationDeclarationImpl.prototype.basicGetCompilationUnit = function() {
            return this.compilationUnit;
        };
        AnnotationDeclarationImpl.prototype.setCompilationUnit = function(newCompilationUnit) {
            var oldCompilationUnit=this.compilationUnit;
            this.compilationUnit=newCompilationUnit;
        };
        AnnotationDeclarationImpl.prototype.eGet = function(featureID,resolve,coreType) {
            switch (featureID) {
                case IAstPackage.ANNOTATION_DECLARATION__COMPILATION_UNIT:
                    if (resolve) {
                        return this.getCompilationUnit();
                    }
                    return this.basicGetCompilationUnit();
                case IAstPackage.ANNOTATION_DECLARATION__QUALIFIED_PATH:
                    return this.getQualifiedPath();
            }
            return AttributeDeclarationImpl.prototype.eGet.call(this,featureID,resolve,coreType);
        };
        AnnotationDeclarationImpl.prototype.eSet = function(featureID,newValue) {
            switch (featureID) {
                case IAstPackage.ANNOTATION_DECLARATION__COMPILATION_UNIT:
                    this.setCompilationUnit(newValue);
                    return;
            }
            AttributeDeclarationImpl.prototype.eSet.call(this,featureID,newValue);
        };
        AnnotationDeclarationImpl.prototype.eUnset = function(featureID) {
            switch (featureID) {
                case IAstPackage.ANNOTATION_DECLARATION__COMPILATION_UNIT:
                    this.setCompilationUnit(null);
                    return;
            }
            AttributeDeclarationImpl.prototype.eUnset.call(this,featureID);
        };
        AnnotationDeclarationImpl.prototype.eIsSet = function(featureID) {
            switch (featureID) {
                case IAstPackage.ANNOTATION_DECLARATION__COMPILATION_UNIT:
                    return this.compilationUnit != null;
                case IAstPackage.ANNOTATION_DECLARATION__QUALIFIED_PATH:
                    return AnnotationDeclarationImpl.QUALIFIED_PATH_EDEFAULT == null ? this.getQualifiedPath() != null : !QUALIFIED_PATH_EDEFAULT===this.getQualifiedPath();
            }
            return AttributeDeclarationImpl.prototype.eIsSet.call(this,featureID);
        };
        AnnotationDeclarationImpl.prototype.eBaseStructuralFeatureID = function(derivedFeatureID,baseClass) {
            if (baseClass == IDdlStatement.class) {
                switch (derivedFeatureID) {
                    case IAstPackage.ANNOTATION_DECLARATION__COMPILATION_UNIT:
                        return IAstPackage.DDL_STATEMENT__COMPILATION_UNIT;
                    case IAstPackage.ANNOTATION_DECLARATION__QUALIFIED_PATH:
                        return IAstPackage.DDL_STATEMENT__QUALIFIED_PATH;
                    default :
                        return -1;
                }
            }
            return AttributeDeclarationImpl.prototype.eBaseStructuralFeatureID.call(this,derivedFeatureID,baseClass);
        };
        AnnotationDeclarationImpl.prototype.eDerivedStructuralFeatureID = function(baseFeatureID,baseClass) {
            if (baseClass == IDdlStatement.class) {
                switch (baseFeatureID) {
                    case IAstPackage.DDL_STATEMENT__COMPILATION_UNIT:
                        return IAstPackage.ANNOTATION_DECLARATION__COMPILATION_UNIT;
                    case IAstPackage.DDL_STATEMENT__QUALIFIED_PATH:
                        return IAstPackage.ANNOTATION_DECLARATION__QUALIFIED_PATH;
                    default :
                        return -1;
                }
            }
            return AttributeDeclarationImpl.prototype.eDerivedStructuralFeatureID.call(this,baseFeatureID,baseClass);
        };
        AnnotationDeclarationImpl.prototype.getQualifiedPath = function() {
            return null;
        };
        return AnnotationDeclarationImpl;
    }
);
define(
    'commonddl/astmodel/DdlStatementImpl',["commonddl/astmodel/NamedDeclarationImpl"], //dependencies
    function (NamedDeclarationImpl) {

        DdlStatementImpl.prototype = Object.create(NamedDeclarationImpl.prototype);
        DdlStatementImpl.prototype.compilationUnit = null;
        DdlStatementImpl.QUALIFIED_PATH_EDEFAULT = null;
        DdlStatementImpl.PATH_IDENTIFIER = ".";
        function DdlStatementImpl() {
            NamedDeclarationImpl.call(this);
        }

        DdlStatementImpl.prototype.eStaticClass = function () {
            return IAstPackage.Literals.DDL_STATEMENT;
        };
        DdlStatementImpl.prototype.getCompilationUnit = function () {

            return this.compilationUnit;
        };
        DdlStatementImpl.prototype.basicGetCompilationUnit = function () {
            return this.compilationUnit;
        };
        DdlStatementImpl.prototype.setCompilationUnit = function (newCompilationUnit) {
            var oldCompilationUnit = this.compilationUnit;
            this.compilationUnit = newCompilationUnit;
        };
        DdlStatementImpl.prototype.eSet = function (featureID, newValue) {
            switch (featureID) {
                case IAstPackage.DDL_STATEMENT__COMPILATION_UNIT:
                    this.setCompilationUnit(newValue);
                    return;
            }
            NamedDeclarationImpl.prototype.eSet.call(this, featureID, newValue);
        };
        DdlStatementImpl.prototype.eIsSet = function (featureID) {
            switch (featureID) {
                case IAstPackage.DDL_STATEMENT__COMPILATION_UNIT:
                    return this.compilationUnit != null;
                case IAstPackage.DDL_STATEMENT__QUALIFIED_PATH:
                    return DdlStatementImpl.QUALIFIED_PATH_EDEFAULT == null ? this.getQualifiedPath() != null : !QUALIFIED_PATH_EDEFAULT === this.getQualifiedPath();
            }
            return NamedDeclarationImpl.prototype.eIsSet.call(this, featureID);
        };
        DdlStatementImpl.prototype.getObjQualifiedPath = function (bo) {
            var parent = null;
            if (bo instanceof IEntityDeclaration) {
                parent = (bo).eContainer();
            }
            if (bo instanceof ITypeDeclaration) {
                parent = (bo).eContainer();
            }
            if (bo instanceof IViewDefinition) {
                parent = (bo).eContainer();
            }
            if (bo instanceof IProxyStatement) {
                var proxy = bo;
                return proxy.getQualifiedPart();
            }
            if (parent instanceof ICompilationUnit) {
                return null;
            }
            var qualifiedPath = null;
            while (parent != null) {
                if (parent instanceof ICompilationUnit) {
                    break;
                }
                if (parent instanceof INamedDeclaration) {
                    if (qualifiedPath == null) {
                        qualifiedPath = new String((parent).getName());
                    } else {
                        qualifiedPath = (parent).getName() + DdlStatementImpl.PATH_IDENTIFIER + qualifiedPath;
                    }
                }
                parent = parent.eContainer();
            }
            return qualifiedPath;
        };
        return DdlStatementImpl;
    }
);
define(
    'commonddl/astmodel/ComponentDeclarationImpl',["commonddl/astmodel/DdlStatementImpl","commonddl/astmodel/EObjectContainmentEList"], //dependencies
    function (DdlStatementImpl,EObjectContainmentEList) {
        ComponentDeclarationImpl.prototype = Object.create(DdlStatementImpl.prototype);
        ComponentDeclarationImpl.prototype.elements=null;
        function ComponentDeclarationImpl() {
            DdlStatementImpl.call(this);
        }
        ComponentDeclarationImpl.prototype.eStaticClass = function() {
            return IAstPackage.Literals.COMPONENT_DECLARATION;
        };
        ComponentDeclarationImpl.prototype.getElements = function() {
            if (this.elements == null) {
                this.elements=new EObjectContainmentEList(this);
            }
            return this.elements;
        };
        ComponentDeclarationImpl.prototype.eInverseRemove = function(otherEnd,featureID,msgs) {
            switch (featureID) {
                case IAstPackage.COMPONENT_DECLARATION__ELEMENTS:
                    return (this.getElements()).basicRemove(otherEnd,msgs);
            }

        };
        ComponentDeclarationImpl.prototype.eGet = function(featureID,resolve,coreType) {
            switch (featureID) {
                case IAstPackage.COMPONENT_DECLARATION__ELEMENTS:
                    return this.getElements();
            }
            return DdlStatementImpl.prototype.eGet.call(this,featureID,resolve,coreType);
        };
        ComponentDeclarationImpl.prototype.eSet = function(featureID,newValue) {
        };
        ComponentDeclarationImpl.prototype.eUnset = function(featureID) {
        };
        ComponentDeclarationImpl.prototype.eIsSet = function(featureID) {
            switch (featureID) {
                case IAstPackage.COMPONENT_DECLARATION__ELEMENTS:
                    return this.elements != null && !this.elements.isEmpty();
            }
            return DdlStatementImpl.prototype.eIsSet.call(this,featureID);
        };
        return ComponentDeclarationImpl;
    }
);
define(
    'commonddl/astmodel/TypeDeclarationImpl',["commonddl/astmodel/ComponentDeclarationImpl"], //dependencies
    function (ComponentDeclarationImpl) {
        TypeDeclarationImpl.prototype = Object.create(ComponentDeclarationImpl.prototype);
        TypeDeclarationImpl.prototype.annotationList=null;
        function TypeDeclarationImpl() {
            ComponentDeclarationImpl.call(this);
        }
        TypeDeclarationImpl.prototype.eStaticClass = function() {
            return IAstPackage.Literals.TYPE_DECLARATION;
        };
        TypeDeclarationImpl.prototype.getAnnotationList = function() {
            if (this.annotationList == null) {
                this.annotationList=[];
            }
            return this.annotationList;
        };
        TypeDeclarationImpl.prototype.eGet = function(featureID,resolve,coreType) {
            switch (featureID) {
                case IAstPackage.TYPE_DECLARATION__ANNOTATION_LIST:
                    return this.getAnnotationList();
            }
            return ComponentDeclarationImpl.prototype.eGet.call(this,featureID,resolve,coreType);
        };
        TypeDeclarationImpl.prototype.eSet = function(featureID,newValue) {
        };
        TypeDeclarationImpl.prototype.eUnset = function(featureID) {
        };
        TypeDeclarationImpl.prototype.eIsSet = function(featureID) {
            switch (featureID) {
                case IAstPackage.TYPE_DECLARATION__ANNOTATION_LIST:
                    return this.annotationList != null && !this.annotationList.isEmpty();
            }
            return ComponentDeclarationImpl.prototype.eIsSet.call(this,featureID);
        };
        TypeDeclarationImpl.prototype.eBaseStructuralFeatureID = function(derivedFeatureID,baseClass) {
            if (baseClass == IAnnotated.class) {
                switch (derivedFeatureID) {
                    case IAstPackage.TYPE_DECLARATION__ANNOTATION_LIST:
                        return IAstPackage.ANNOTATED__ANNOTATION_LIST;
                    default :
                        return -1;
                }
            }
            return ComponentDeclarationImpl.prototype.eBaseStructuralFeatureID.call(this,derivedFeatureID,baseClass);
        };
        TypeDeclarationImpl.prototype.eDerivedStructuralFeatureID = function(baseFeatureID,baseClass) {
            if (baseClass == IAnnotated.class) {
                switch (baseFeatureID) {
                    case IAstPackage.ANNOTATED__ANNOTATION_LIST:
                        return IAstPackage.TYPE_DECLARATION__ANNOTATION_LIST;
                    default :
                        return -1;
                }
            }
            return ComponentDeclarationImpl.prototype.eDerivedStructuralFeatureID.call(this,baseFeatureID,baseClass);
        };
        return TypeDeclarationImpl;
    }
);
define(
    'commonddl/astmodel/AnonymousTypeDeclarationImpl',["commonddl/astmodel/TypeDeclarationImpl"], //dependencies
    function (TypeDeclarationImpl) {
        AnonymousTypeDeclarationImpl.prototype = Object.create(TypeDeclarationImpl.prototype);
        function AnonymousTypeDeclarationImpl() {
            TypeDeclarationImpl.call(this);
        }
        AnonymousTypeDeclarationImpl.prototype.eStaticClass = function() {
            return IAstPackage.Literals.ANONYMOUS_TYPE_DECLARATION;
        };
        return AnonymousTypeDeclarationImpl;
    }
);
define(
    'commonddl/astmodel/AssociationDeclarationImpl',["commonddl/astmodel/ElementDeclarationImpl","rndrt/rnd","commonddl/astmodel/EObjectContainmentEList","require"], //dependencies
    function (ElementDeclarationImpl,rnd,EObjectContainmentEList,require) {
        var Utils = rnd.Utils;
        AssociationDeclarationImpl.prototype = Object.create(ElementDeclarationImpl.prototype);
        AssociationDeclarationImpl.SOURCE_MAX_CARDINALITY_TOKEN_EDEFAULT=null;
        AssociationDeclarationImpl.prototype.sourceMaxCardinalityToken=AssociationDeclarationImpl.SOURCE_MAX_CARDINALITY_TOKEN_EDEFAULT;
        AssociationDeclarationImpl.MIN_TOKEN_EDEFAULT=null;
        AssociationDeclarationImpl.prototype.minToken=AssociationDeclarationImpl.MIN_TOKEN_EDEFAULT;
        AssociationDeclarationImpl.MAX_TOKEN_EDEFAULT=null;
        AssociationDeclarationImpl.prototype.maxToken=AssociationDeclarationImpl.MAX_TOKEN_EDEFAULT;
        AssociationDeclarationImpl.prototype.keys=null;
        AssociationDeclarationImpl.CARDINALITIES_EDEFAULT=null;
        AssociationDeclarationImpl.prototype.targetProxy=null;
        AssociationDeclarationImpl.prototype.targetEntityPath=null;
        AssociationDeclarationImpl.prototype.targetDataSource=null;
        AssociationDeclarationImpl.prototype.referencedDataSources=null;
        AssociationDeclarationImpl.prototype.onExpression=null;
        function AssociationDeclarationImpl() {
            ElementDeclarationImpl.call(this);
        }
        AssociationDeclarationImpl.prototype.eStaticClass = function() {
            return IAstPackage.Literals.ASSOCIATION_DECLARATION;
        };
        AssociationDeclarationImpl.prototype.getSourceMaxCardinalityToken = function() {
            return this.sourceMaxCardinalityToken;
        };
        AssociationDeclarationImpl.prototype.setSourceMaxCardinalityToken = function(newSourceMaxCardinalityToken) {
            var oldSourceMaxCardinalityToken=this.sourceMaxCardinalityToken;
            this.sourceMaxCardinalityToken=newSourceMaxCardinalityToken;
        };
        AssociationDeclarationImpl.prototype.getMinToken = function() {
            return this.minToken;
        };
        AssociationDeclarationImpl.prototype.setMinToken = function(newMinToken) {
            var oldMinToken=this.minToken;
            this.minToken=newMinToken;
        };
        AssociationDeclarationImpl.prototype.getMaxToken = function() {
            return this.maxToken;
        };
        AssociationDeclarationImpl.prototype.setMaxToken = function(newMaxToken) {
            var oldMaxToken=this.maxToken;
            this.maxToken=newMaxToken;
        };
        AssociationDeclarationImpl.prototype.getKeys = function() {
            if (this.keys == null) {
                this.keys=new EObjectContainmentEList(this);
            }
            return this.keys;
        };
        AssociationDeclarationImpl.prototype.getTargetEntityName = function() {
            var path=this.getTargetEntityPath();
            var result=new rnd.StringBuffer();
            if (path != null && path.getEntries() != null && path.getEntries().length > 0) {
                var str=path.getPathString(false);
                return str;
            }
            return result.toString();
        };
        AssociationDeclarationImpl.prototype.getCardinalities = function() {
            var result="";
            var token=this.getMinToken();
            if (token != null) {
                result=token.getM_lexem();
            }
            token=this.getMaxToken();
            if (token != null) {
                result+=".." + token.getM_lexem();
            }
            return result;
        };
        AssociationDeclarationImpl.prototype.getOnCondition = function() {
            return this.getOnExpression();
        };
        AssociationDeclarationImpl.prototype.getTargetProxy = function() {
            return this.targetProxy;
        };
        AssociationDeclarationImpl.prototype.basicGetTargetProxy = function() {
            return this.targetProxy;
        };
        AssociationDeclarationImpl.prototype.setTargetProxy = function(newTargetProxy) {
            var oldTargetProxy=this.targetProxy;
            this.targetProxy=newTargetProxy;
        };
        AssociationDeclarationImpl.prototype.getTargetEntityPath = function() {
            return this.targetEntityPath;
        };
        AssociationDeclarationImpl.prototype.basicSetTargetEntityPath = function(newTargetEntityPath,msgs) {
            var oldTargetEntityPath=this.targetEntityPath;
            this.targetEntityPath=newTargetEntityPath;
            this.targetEntityPath.parent = this;
            return msgs;
        };
        AssociationDeclarationImpl.prototype.setTargetEntityPath = function(newTargetEntityPath) {
            if (newTargetEntityPath != this.targetEntityPath) {
                var msgs=null;
                if (this.targetEntityPath != null) {

                }
                if (newTargetEntityPath != null) {

                }
                msgs=this.basicSetTargetEntityPath(newTargetEntityPath,msgs);
                if (msgs != null) {
                    msgs.dispatch();
                }
            }
        };
        AssociationDeclarationImpl.prototype.getTargetDataSource = function() {
            return this.targetDataSource;
        };
        AssociationDeclarationImpl.prototype.basicSetTargetDataSource = function(newTargetDataSource,msgs) {
            var oldTargetDataSource=this.targetDataSource;
            this.targetDataSource=newTargetDataSource;
            this.targetDataSource.setContainer(this);
            return msgs;
        };
        AssociationDeclarationImpl.prototype.setTargetDataSource = function(newTargetDataSource) {
            if (newTargetDataSource != this.targetDataSource) {
                var msgs=null;
                if (this.targetDataSource != null) {

                }
                if (newTargetDataSource != null) {

                }
                msgs=this.basicSetTargetDataSource(newTargetDataSource,msgs);
                if (msgs != null) {
                    msgs.dispatch();
                }
            }
        };
        AssociationDeclarationImpl.prototype.getReferencedDataSources = function() {
            if (this.referencedDataSources == null) {
                this.referencedDataSources = [];
                var onCond = this.getOnCondition();
                if (onCond != null) {
                    var JoinDataSourceImpl = require("commonddl/astmodel/JoinDataSourceImpl");
                    JoinDataSourceImpl.addReferencedDataSources(onCond,this.referencedDataSources);
                    Utils.arrayRemove(this.referencedDataSources, this.getTargetDataSource());
                }
            }
            return this.referencedDataSources;
        };
        AssociationDeclarationImpl.prototype.getOnExpression = function() {
            return this.onExpression;
        };
        AssociationDeclarationImpl.prototype.basicSetOnExpression = function(newOnExpression,msgs) {
            var oldOnExpression=this.onExpression;
            this.onExpression=newOnExpression;
            this.onExpression.setContainer(this);
            return msgs;
        };
        AssociationDeclarationImpl.prototype.setOnCondition = function(exp) {
            this.setOnExpression(exp);
        };
        AssociationDeclarationImpl.prototype.setOnExpression = function(newOnExpression) {
            if (newOnExpression != this.onExpression) {
                var msgs=null;
                if (this.onExpression != null) {

                }
                if (newOnExpression != null) {

                }
                msgs=this.basicSetOnExpression(newOnExpression,msgs);
                if (msgs != null) {
                    msgs.dispatch();
                }
            }
        };
        AssociationDeclarationImpl.prototype.eInverseRemove = function(otherEnd,featureID,msgs) {
            switch (featureID) {
                case IAstPackage.ASSOCIATION_DECLARATION__KEYS:
                    return (this.getKeys()).basicRemove(otherEnd,msgs);
                case IAstPackage.ASSOCIATION_DECLARATION__TARGET_ENTITY_PATH:
                    return this.basicSetTargetEntityPath(null,msgs);
                case IAstPackage.ASSOCIATION_DECLARATION__TARGET_DATA_SOURCE:
                    return this.basicSetTargetDataSource(null,msgs);
                case IAstPackage.ASSOCIATION_DECLARATION__ON_EXPRESSION:
                    return this.basicSetOnExpression(null,msgs);
            }

        };
        AssociationDeclarationImpl.prototype.getTypeId = function() {
            return this.getTargetEntityName();
        };
        AssociationDeclarationImpl.prototype.eGet = function(featureID,resolve,coreType) {
            switch (featureID) {
                case IAstPackage.ASSOCIATION_DECLARATION__SOURCE_MAX_CARDINALITY_TOKEN:
                    return this.getSourceMaxCardinalityToken();
                case IAstPackage.ASSOCIATION_DECLARATION__MIN_TOKEN:
                    return this.getMinToken();
                case IAstPackage.ASSOCIATION_DECLARATION__MAX_TOKEN:
                    return this.getMaxToken();
                case IAstPackage.ASSOCIATION_DECLARATION__KEYS:
                    return this.getKeys();
                case IAstPackage.ASSOCIATION_DECLARATION__CARDINALITIES:
                    return this.getCardinalities();
                case IAstPackage.ASSOCIATION_DECLARATION__TARGET_PROXY:
                    if (resolve) {
                        return this.getTargetProxy();
                    }
                    return this.basicGetTargetProxy();
                case IAstPackage.ASSOCIATION_DECLARATION__TARGET_ENTITY_PATH:
                    return this.getTargetEntityPath();
                case IAstPackage.ASSOCIATION_DECLARATION__TARGET_DATA_SOURCE:
                    return this.getTargetDataSource();
                case IAstPackage.ASSOCIATION_DECLARATION__REFERENCED_DATA_SOURCES:
                    return this.getReferencedDataSources();
                case IAstPackage.ASSOCIATION_DECLARATION__ON_EXPRESSION:
                    return this.getOnExpression();
            }
            return ElementDeclarationImpl.prototype.eGet.call(this,featureID,resolve,coreType);
        };
        AssociationDeclarationImpl.prototype.eSet = function(featureID,newValue) {
        };
        AssociationDeclarationImpl.prototype.eUnset = function(featureID) {
        };
        AssociationDeclarationImpl.prototype.eIsSet = function(featureID) {
            switch (featureID) {
                case IAstPackage.ASSOCIATION_DECLARATION__SOURCE_MAX_CARDINALITY_TOKEN:
                    return AssociationDeclarationImpl.SOURCE_MAX_CARDINALITY_TOKEN_EDEFAULT == null ? this.sourceMaxCardinalityToken != null : !SOURCE_MAX_CARDINALITY_TOKEN_EDEFAULT===sourceMaxCardinalityToken;
                case IAstPackage.ASSOCIATION_DECLARATION__MIN_TOKEN:
                    return AssociationDeclarationImpl.MIN_TOKEN_EDEFAULT == null ? this.minToken != null : !MIN_TOKEN_EDEFAULT===minToken;
                case IAstPackage.ASSOCIATION_DECLARATION__MAX_TOKEN:
                    return AssociationDeclarationImpl.MAX_TOKEN_EDEFAULT == null ? this.maxToken != null : !MAX_TOKEN_EDEFAULT===maxToken;
                case IAstPackage.ASSOCIATION_DECLARATION__KEYS:
                    return this.keys != null && !this.keys.isEmpty();
                case IAstPackage.ASSOCIATION_DECLARATION__CARDINALITIES:
                    return AssociationDeclarationImpl.CARDINALITIES_EDEFAULT == null ? this.getCardinalities() != null : !CARDINALITIES_EDEFAULT===this.getCardinalities();
                case IAstPackage.ASSOCIATION_DECLARATION__TARGET_PROXY:
                    return this.targetProxy != null;
                case IAstPackage.ASSOCIATION_DECLARATION__TARGET_ENTITY_PATH:
                    return this.targetEntityPath != null;
                case IAstPackage.ASSOCIATION_DECLARATION__TARGET_DATA_SOURCE:
                    return this.targetDataSource != null;
                case IAstPackage.ASSOCIATION_DECLARATION__REFERENCED_DATA_SOURCES:
                    return this.referencedDataSources != null && !this.referencedDataSources.isEmpty();
                case IAstPackage.ASSOCIATION_DECLARATION__ON_EXPRESSION:
                    return this.onExpression != null;
            }
            return ElementDeclarationImpl.prototype.eIsSet.call(this,featureID);
        };
        AssociationDeclarationImpl.prototype.toString = function() {
            if (this.eIsProxy()) {
                return ElementDeclarationImpl.prototype.toString.call(this);
            }
            var result=new rnd.StringBuffer(ElementDeclarationImpl.prototype.toString.call(this));
            result.append(" (sourceMaxCardinalityToken: ");
            result.append(sourceMaxCardinalityToken);
            result.append(", minToken: ");
            result.append(minToken);
            result.append(", maxToken: ");
            result.append(maxToken);
            result.append(')');
            return result.toString();
        };
        return AssociationDeclarationImpl;
    }
);
define(
    'commonddl/astmodel/SelectListEntryType',[], //dependencies
    function () {

        function SelectListEntryType(val) {
            this.m_value = val;
        }

        SelectListEntryType.COLUMN = new SelectListEntryType(0);
        SelectListEntryType.ASSOCIATION = new SelectListEntryType(1);
        SelectListEntryType.COMPLEX = new SelectListEntryType(2);
        SelectListEntryType.UNKOWN = new SelectListEntryType(3);

        //public
        SelectListEntryType.prototype.getValue = function () {
            return this.m_value;
        };
        return SelectListEntryType;
    }
);
define(
    'commonddl/astmodel/DataSourceImpl',["require", "commonddl/astmodel/SourceRangeImpl", "rndrt/rnd", "commonddl/astmodel/EObjectContainmentEList",
        "commonddl/astmodel/SelectListEntryType"
    ], //dependencies
    function (require, SourceRangeImpl, rnd, EObjectContainmentEList, SelectListEntryType) {
        var Utils = rnd.Utils;

        DataSourceImpl.prototype = Object.create(SourceRangeImpl.prototype);
        DataSourceImpl.NAME_EDEFAULT = null;
        DataSourceImpl.prototype.namePathExpression = null;
        DataSourceImpl.ALIAS_EDEFAULT = null;
        DataSourceImpl.ALIAS_TOKEN_EDEFAULT = null;
        DataSourceImpl.prototype.aliasToken = DataSourceImpl.ALIAS_TOKEN_EDEFAULT;
        DataSourceImpl.prototype.selectListEntries = null;
        DataSourceImpl.PRIMARY_EDEFAULT = false;
        DataSourceImpl.prototype.cachedColumns = null;
        DataSourceImpl.CACHED_DATA_SOURCE_TYPE_EDEFAULT = null;
        DataSourceImpl.prototype.cachedDataSourceType = DataSourceImpl.CACHED_DATA_SOURCE_TYPE_EDEFAULT;
        DataSourceImpl.prototype.cachedAssociations = null;
        function DataSourceImpl() {
            SourceRangeImpl.call(this);
        }

        DataSourceImpl.prototype.eStaticClass = function () {
            return IAstPackage.Literals.DATA_SOURCE;
        };
        DataSourceImpl.prototype.getName = function () {
            var pe = this.getNamePathExpression();
            if (pe != null) {
                return pe.getPathString(false);
            }
            return null;
        };
        DataSourceImpl.prototype.getNamePathExpression = function () {
            return this.namePathExpression;
        };
        DataSourceImpl.prototype.basicSetNamePathExpression = function (newNamePathExpression, msgs) {
            var oldNamePathExpression = this.namePathExpression;
            this.namePathExpression = newNamePathExpression;
            this.namePathExpression.parent = this;
            return msgs;
        };
        DataSourceImpl.prototype.setNamePathExpression = function (newNamePathExpression) {
            if (newNamePathExpression != this.namePathExpression) {
                var msgs = null;
                if (this.namePathExpression != null) {

                }
                if (newNamePathExpression != null) {

                }
                msgs = this.basicSetNamePathExpression(newNamePathExpression, msgs);
                if (msgs != null) {
                    msgs.dispatch();
                }
            }
        };
        DataSourceImpl.prototype.getAlias = function () {
            var at = this.getAliasToken();
            if (at != null) {
                return at.m_lexem;
            }
            return null;
        };
        DataSourceImpl.prototype.getAliasToken = function () {
            return this.aliasToken;
        };
        DataSourceImpl.prototype.setAliasToken = function (newAliasToken) {
            var oldAliasToken = this.aliasToken;
            this.aliasToken = newAliasToken;
        };
        DataSourceImpl.prototype.getParentJoin = function () {
            var JoinDataSourceImpl = require("commonddl/astmodel/JoinDataSourceImpl");
            if (this instanceof JoinDataSourceImpl) {
                return null;
            }
            var parent = this.eContainer();
            if (parent instanceof JoinDataSourceImpl) {
                return parent;
            }
            return null;
        };
        DataSourceImpl.prototype.basicGetParentJoin = function () {
            return this.getParentJoin();
        };
        DataSourceImpl.prototype.getSelectListEntries = function () {
            if (this.selectListEntries != null) {
                return this.selectListEntries;
            }
            var PathExpressionImpl = require("commonddl/astmodel/PathExpressionImpl");
            var StdFuncExpressionImpl = require("commonddl/astmodel/StdFuncExpressionImpl");
            var FuncExpressionImpl = require("commonddl/astmodel/FuncExpressionImpl");
            var lSelectListEntries = [];
            try {
                var select = this.getViewSelect();
                var entries = select.getSelectList().getEntries();
                for (var entryCount = 0; entryCount < entries.length; entryCount++) {
                    var entry = entries[entryCount];
                    var ex = entry.getExpression();
                    if (ex instanceof PathExpressionImpl) {
                        var ds = (ex).getTarget();
                        if (ds == this) {
                            lSelectListEntries.push(entry);
                        }
                    } else if (ex instanceof StdFuncExpressionImpl) {
                        var param = (ex).getParameter();
                        if (param instanceof PathExpressionImpl) {
                            var ds = (param).getTarget();
                            if (ds == this) {
                                lSelectListEntries.push(entry);
                            }
                        }
                    } else if (ex instanceof FuncExpressionImpl) {
                        var params = (ex).getParameters();
                        for (var paramCount = 0; paramCount < params.length; paramCount++) {
                            var param = params[paramCount];
                            if (param instanceof PathExpressionImpl) {
                                var ds = (param).getTarget();
                                if (ds == this) {
                                    lSelectListEntries.push(entry);
                                    break;
                                }
                            }
                        }
                    } else {
                    }
                }
            } catch (e) {
                console.log(e.stack);
            }
            this.selectListEntries = new EObjectContainmentEList(this);
            this.selectListEntries.addAll(lSelectListEntries);
            return this.selectListEntries;
        };
        DataSourceImpl.prototype.isPrimary = function () {
            return true;
        };
        DataSourceImpl.prototype.getCachedColumns = function () {
            return this.cachedColumns;
        };
        DataSourceImpl.prototype.getCachedDataSourceType = function () {
            return this.cachedDataSourceType;
        };
        DataSourceImpl.prototype.getCachedAssociations = function () {
            return this.cachedAssociations;
        };
        DataSourceImpl.prototype.retrieveColumns = function (progressMonitor, forceReload) {
            try {
                var IAstFactory = require("commonddl/astmodel/IAstFactory");
            var vs = this.getViewSelect();
            var allDataSources = vs.getDataSources();
            for (var dsCount = 0; dsCount < allDataSources.length; dsCount++) {
                var ds = allDataSources[dsCount];
                DataSourceImpl.retrieveColumnsAndAssociationsFromBackend(ds, progressMonitor, forceReload);
            }
            this.retrieveSelectListEntryType(progressMonitor, vs);
            for (var dsCount = 0; dsCount < allDataSources.length; dsCount++) {
                var ds = allDataSources[dsCount];
                var dsi = ds;
                    if (dsi.getCachedColumns().length == 0) {
                        var columnNamesInUpperCaseForAllSelectListEntries = dsi.getColumnNamesInUpperCaseForAllSelectListEntries();
                        for (var nCount = 0; nCount < columnNamesInUpperCaseForAllSelectListEntries.length; nCount++) {
                            var n = columnNamesInUpperCaseForAllSelectListEntries[nCount];
                            var column = IAstFactory.eINSTANCE.createColumn();
                            column.name = n;
                            column.setSelected(true);
                            dsi.cachedColumns.push(column);
                        }
                        continue;
                    }
                    this.initializeColumnsSelection(dsi);
            }
            }catch(e) {
                console.log(e.stack);
            }
        };
        DataSourceImpl.prototype.initializeColumnsSelection = function (dsi) {
            if (this.isSelectedAttributeCalculated(dsi.getCachedColumns())) {
                return;
            }
            var columnNamesInUpperCaseForAllSelectListEntries = dsi.getColumnNamesInUpperCaseForAllSelectListEntries();
            for (var columnCount = 0; columnCount < dsi.getCachedColumns().length; columnCount++) {
                var column = dsi.getCachedColumns()[columnCount];
                var columnNameInUpperCase = column.getName().toUpperCase();
                if (Utils.arrayContains(columnNamesInUpperCaseForAllSelectListEntries, columnNameInUpperCase)) {
                    column.setSelected(true);
                } else {
                    column.setSelected(false);
                }
            }
        };
        DataSourceImpl.prototype.retrieveLocalColumns = function () {
            var PathExpressionImpl = require("commonddl/astmodel/PathExpressionImpl");
            if ((this.getCachedColumns() != null) || (this.getCachedAssociations() != null)) {
                return (this.getCachedColumns() != null) && (this.getCachedAssociations() != null);
            }
            var view = this.getViewDefinition();
            if (view == null) {
                return false;
            }
            var prnt = view.eContainer();
            if ((prnt == null) || (prnt instanceof CompilationUnitImpl)) {
                return false;
            }
            while ((prnt != null) && !(prnt instanceof CompilationUnitImpl)) {
                prnt = prnt.eContainer();
            }
            if (prnt instanceof CompilationUnitImpl) {
                this.cachedColumns = new EObjectContainmentEList(this);
                var cu = prnt;
                var stmt = this.findDataSourceLocalStatement(cu);
                if (stmt instanceof EntityDeclarationImpl) {
                    this.cachedDataSourceType = DataSourceType.ENTITY;
                    var attrElts = [];
                    var asscElts = [];
                    for (var eltCount = 0; eltCount < (stmt).getElements().length; eltCount++) {
                        var elt = (stmt).getElements()[eltCount];
                        if (elt instanceof AttributeDeclarationImpl) {
                            attrElts.push(elt);
                        } else if (elt instanceof AssociationDeclarationImpl) {
                            asscElts.push(elt);
                        }
                    }
                    return this.initializeWithLocalInfo(cu, attrElts, asscElts);
                } else if (stmt instanceof ViewDefinitionImpl) {
                    this.cachedDataSourceType = DataSourceType.VIEW;
                    var select = (stmt).getSelect();
                    if ((select != null) && (select.getSelectList() != null)) {
                        var fullyInitialized = true;
                        var attrEntries = [];
                        var asscEntries = [];
                        for (var entryCount = 0; entryCount < select.getSelectList().getEntries().length; entryCount++) {
                            var entry = select.getSelectList().getEntries()[entryCount];
                            var type = entry.getType();
                            if ((type == null) || type === SelectListEntryType.UNKOWN) {
                                fullyInitialized = false;
                                break;
                            } else {
                                switch (type.getValue()) {
                                    case SelectListEntryType.ASSOCIATION_VALUE:
                                        fullyInitialized = false;
                                        var expr = entry.getExpression();
                                        if (expr instanceof PathExpressionImpl) {
                                            var assoc = (expr).getDataSourceAssociation();
                                            if (assoc != null) {
                                                fullyInitialized = true;
                                                asscEntries.push(assoc);
                                            }
                                        }
                                        break;
                                    case SelectListEntryType.COLUMN_VALUE:
                                    case SelectListEntryType.COMPLEX_VALUE:
                                        attrEntries.push(entry);
                                        break;
                                    default :
                                        this.cachedColumns = null;
                                        throw new IllegalStateException("Unsupported select list entry type: " + type.toString());
                                }
                                if (!fullyInitialized) {
                                    break;
                                }
                            }
                        }
                        this.cachedColumns = null;
                        if (fullyInitialized) {
                            return this.initializeWithLocalInfo(cu, attrEntries, asscEntries);
                        }
                    }
                }
            }
            return false;
        };
        DataSourceImpl.prototype.initializeWithLocalInfo = function (cu, attrs, asscs) {
            this.cachedColumns = new EObjectContainmentEList(this);
            this.cachedAssociations = new EObjectContainmentEList(this);
            var select = this.getViewSelect();
            if (select == null) {
                return true;
            }
            for (var attrCount = 0; attrCount < attrs.length; attrCount++) {
                var attr = attrs[attrCount];
                var name = null;
                if (attr instanceof AttributeDeclarationImpl) {
                    name = (attr).getName();
                } else if (attr instanceof SelectListEntryImpl) {
                    name = (attr).getPublicName();
                }
                if (name != null) {
                    name = name.toUpperCase();
                    var column = IAstFactory.eINSTANCE.createColumn();
                    column.name = name.toUpperCase();
                    this.cachedColumns.push(column);
                }
            }
            for (var asscCount = 0; asscCount < asscs.length; asscCount++) {
                var assc = asscs[asscCount];
                var name = null;
                var cardinalities = null;
                var proxy = null;
                if (assc instanceof AssociationDeclarationImpl) {
                    name = (assc).getName();
                    proxy = (assc).getTargetProxy();
                    cardinalities = (assc).getCardinalities();
                } else if (assc instanceof DataSourceAssociationImpl) {
                    name = (assc).getName();
                    proxy = (assc).getTargetStmt();
                    cardinalities = (assc).getCardinalities();
                }
                if ((name != null) && (proxy != null)) {
                    var assoc = DataSourceImpl.createDataSourceAssociation(this, cu, name, proxy, cardinalities);
                    if (assoc != null) {
                    }
                }
            }
            this.initializeColumnsSelection(this);
            this.retrieveLocalSelectListEntryType(select);
            return true;
        };
        DataSourceImpl.prototype.findDataSourceLocalStatement = function (cu) {
            var stmts = DdlStatementMatchUtil.getAllStatements(cu.getStatements());
            var indexMap = DdlStatementMatchUtil.createEntityDeclarationFqnIndexMap(stmts);
            var fqn = DdlStatementMatchUtil.getFullyQualifiedNameInLowerCase(this.getName(), indexMap);
            return DdlStatementMatchUtil.findBestMatch(fqn, indexMap, cu);
        };
        DataSourceImpl.prototype.retrieveLocalSelectListEntryType = function (select) {
            var fullyInitialized = true;
            var selectList = select.getSelectList();
            if (selectList == null) {
                return true;
            }
            var entries = selectList.getEntries();
            for (var entryCount = 0; entryCount < entries.length; entryCount++) {
                var entry = entries[entryCount];
                var exp = entry.getExpression();
                var PathExpressionImpl = require("commonddl/astmodel/PathExpressionImpl");
                if (exp instanceof PathExpressionImpl) {
                    var pe = exp;
                    var pentries = pe.getEntries();
                    if (pentries.length == 1) {
                        var name = pe.getPathString(false);
                        var type = this.getSelectListEntryTypeForSimplePath(select, name);
                        if (type != null) {
                            entry.setType(type);
                        } else {
                            entry.setType(SelectListEntryType.UNKOWN);
                        }
                    } else if (pentries.length == 2) {
                        var dataSourceName = pentries[0].getNameToken().m_lexem;
                        var ds = DataSourceImpl.getDatasource(dataSourceName, select);
                        if (ds != null) {
                            var secondPart = pentries[1].getNameToken().m_lexem;
                            var type = DataSourceImpl.getColumnOrAssociation(secondPart, ds);
                            if (type != null) {
                                entry.setType(type);
                                continue;
                            }
                        }
                        fullyInitialized = false;
                    } else {
                        fullyInitialized = false;
                    }
                } else {
                    entry.setType(SelectListEntryType.COMPLEX);
                }
            }
            return fullyInitialized;
        };
        DataSourceImpl.prototype.retrieveSelectListEntryType = function (progressMonitor, select) {
            var PathExpressionImpl = require("commonddl/astmodel/PathExpressionImpl");
            if (!this.retrieveLocalSelectListEntryType(select)) {
                var selectList = select.getSelectList();
                if (selectList == null) {
                    return;
                }
                var view = this.getViewDefinition();
                if (view == null) {
                    return;
                }
                var cu = view.getCompilationUnit();
                var entries = selectList.getEntries();
                for (var entryCount = 0; entryCount < entries.length; entryCount++) {
                    var entry = entries[entryCount];
                    var type = entry.getType();
                    if ((type == null) || (type == SelectListEntryType.UNKOWN)) {
                        var exp = entry.getExpression();
                        if (exp instanceof PathExpressionImpl) {
                            var pe = exp;
                            var pathList = this.replaceFirstPartWithDatasourceName(pe, select);
                            DataSourceImpl.retrieveAndSetSelectListEntryType(progressMonitor, entry, cu, pathList);
                        }
                    }
                }
            }
        };
        DataSourceImpl.retrieveAndSetSelectListEntryType = function (monitor, entry, cu, pathNames) {
            var ra = cu.getRepositoryAccess();
            if (ra != null) {
                var type = ra.getSelectListEntryType(monitor, cu, pathNames);
                if (type != null) {
                    entry.setType(type);
                    return;
                }
            }
            entry.setType(SelectListEntryType.UNKOWN);
        };
        DataSourceImpl.prototype.replaceFirstPartWithDatasourceName = function (pe, select) {
            var result = [];
            var fullPath = pe.getPathString(false);
            var firstPart = pe.getEntries()[0].getNameToken().m_lexem;
            var ds = DataSourceImpl.getDatasource(firstPart, select);
            if (ds != null && pe.getEntries().length >= 2) {
                fullPath = ds.getName() + "." + fullPath.substring(fullPath.indexOf(".") + 1);
                result.push(fullPath);
            } else {
                for (var datasourceCount = 0; datasourceCount < select.getDataSources().length; datasourceCount++) {
                    var datasource = select.getDataSources()[datasourceCount];
                    var prefix = datasource.getNamePathExpression().getPathString(false);
                    var p = prefix + "." + fullPath;
                    result.push(p);
                }
            }
            return result;
        };
        DataSourceImpl.getDatasource = function (dataSourceName, select) {
            dataSourceName = DataSourceImpl.removeQuotes(dataSourceName);
            var dataSources = select.getDataSources();
            for (var dsCount = 0; dsCount < dataSources.length; dsCount++) {
                var ds = dataSources[dsCount];
                if (Utils.stringEqualsIgnoreCase(dataSourceName, DataSourceImpl.removeQuotes(ds.getName()))) {
                    return ds;
                }
                if (Utils.stringEqualsIgnoreCase(dataSourceName, DataSourceImpl.removeQuotes(ds.getAlias()))) {
                    return ds;
                }
            }
            return null;
        };
        DataSourceImpl.prototype.getSelectListEntryTypeForSimplePath = function (select, name) {
            name = DataSourceImpl.removeQuotes(name);
            if ("*" === name) {
                return SelectListEntryType.COMPLEX;
            }
            var assocs = select.getAssociations();
            for (var assocCount = 0; assocCount < assocs.length; assocCount++) {
                var assoc = assocs[assocCount];
                if (Utils.stringEqualsIgnoreCase(name, DataSourceImpl.removeQuotes(assoc.getName()))) {
                    return SelectListEntryType.ASSOCIATION;
                }
            }
            var dataSources = select.getDataSources();
            for (var dsCount = 0; dsCount < dataSources.length; dsCount++) {
                var ds = dataSources[dsCount];
                var type = DataSourceImpl.getColumnOrAssociation(name, ds);
                if (type != null) {
                    return type;
                }
            }
            return null;
        };
        DataSourceImpl.getColumnOrAssociation = function (name, datasource) {
            var SelectListEntryType = require("commonddl/astmodel/SelectListEntryType");
            var column = DataSourceImpl.getColumnWithName(datasource, name);
            if (column != null) {
                return SelectListEntryType.COLUMN;
            }
            var association = DataSourceImpl.getAssociationWithName(datasource, name);
            if (association != null) {
                return SelectListEntryType.ASSOCIATION;
            }
            return null;
        };
        DataSourceImpl.getAssociationWithName = function (ds, name) {
            name = DataSourceImpl.removeQuotes(name);
            var assocs = ds.getCachedAssociations();
            if (assocs != null) {
                for (var assocCount = 0; assocCount < assocs.length; assocCount++) {
                    var assoc = assocs[assocCount];
                    if (Utils.stringEqualsIgnoreCase(name, assoc.getName())) {
                        return assoc;
                    }
                }
            }
            return null;
        };
        DataSourceImpl.getColumnWithName = function (ds, name) {
            name = DataSourceImpl.removeQuotes(name);
            var columns = ds.getCachedColumns();
            if (columns != null) {
                for (var columnCount = 0; columnCount < columns.length; columnCount++) {
                    var column = columns[columnCount];
                    if (Utils.stringEqualsIgnoreCase(name, column.getName())) {
                        return column;
                    }
                }
            }
            return null;
        };
        DataSourceImpl.removeQuotes = function (name) {
            if (name != null) {
                var result = new rnd.StringBuffer(name);
                var inQuote = false;
                for (var i = name.length - 1; i >= 0; i--) {
                    var c = name.charAt(i);
                    if (c == '"') {
                        var prev = i > 0 ? name.charAt(i - 1) : ' ';
                        var next = i >= name.length - 1 ? '.' : name.charAt(i + 1);
                        if (inQuote == false && next == '.') {
                            inQuote = true;
                            result.replace(i, i + 1, "");
                        } else if (inQuote == false && next != '.' && i == 0) {
                            result.replace(i, i + 1, "");
                        } else if (inQuote && prev == '"') {
                            result.replace(i, i + 1, "");
                            i--;
                        } else if (inQuote && prev != '"') {
                            inQuote = false;
                            result.replace(i, i + 1, "");
                        }
                    }
                }
                return result.toString();
            }
            return name;
        };
        DataSourceImpl.prototype.isSelectedAttributeCalculated = function (columns) {
            if (columns == null || columns.length == 0) {
                return true;
            }
            for (var cCount = 0; cCount < columns.length; cCount++) {
                var c = columns[cCount];
                if (c.getSelected() == null) {
                    return false;
                }
            }
            return true;
        };
        DataSourceImpl.retrieveColumnsAndAssociationsFromBackend = function (ds, progressMonitor, forceReload) {
            if (forceReload == false && ds.cachedColumns != null) {
                return;
            }
            if (ds.isPrimary() == false) {
                throw new IllegalStateException("DataSource is not primary");
            }
            if (ds.cachedColumns == null || forceReload == true) {
                ds.cachedColumns = new EObjectContainmentEList(ds);
            }
            if (ds.cachedAssociations == null || forceReload == true) {
                ds.cachedAssociations = new EObjectContainmentEList(ds);
            }
            var cu = SourceRangeImpl.getCompilationUnit(ds);
            var ra = cu.getRepositoryAccess();
            if (ra == null) {
                return;
            }
            if (forceReload) {
                ra.resetCache();
            }
            var fullyQualifiedPathName = ds.getNamePathExpression().getPathString(false);
            var columnNames = [];
            var associationNames = [];
            var associationTargetEntityNames = [];
            ra.getColumnsAndAssociations(progressMonitor, cu, fullyQualifiedPathName, columnNames, associationNames, associationTargetEntityNames);
            if (columnNames.length == 0) {
            }
            for (var nameCount = 0; nameCount < columnNames.length; nameCount++) {
                var name = columnNames[nameCount];
                var IAstFactory = require("commonddl/astmodel/IAstFactory");
                var column = IAstFactory.eINSTANCE.createColumn();
                column.name = name;
                ds.cachedColumns.push(column);
            }
            for (var i = 0; i < associationNames.length; i++) {
                var associationName = associationNames[i];
                var targetName = associationTargetEntityNames[i];
                DataSourceImpl.createDataSourceAssociationWithAssociationName(ds, cu, associationName, targetName, null);
            }
        };
        DataSourceImpl.createDataSourceAssociationWithAssociationName = function (ds, cu, associationName, targetName, cardinalities) {
            var IAstFactory = require("commonddl/astmodel/IAstFactory");
            var assoc = IAstFactory.eINSTANCE.createDataSourceAssociation();
            assoc.setName(associationName);
            assoc.setTargetName(targetName);
            assoc.setCardinalities(cardinalities);
            var proxy = IAstFactory.eINSTANCE.createProxyStatement();
            proxy.setCompilationUnit(cu);
            var path = IAstFactory.eINSTANCE.createPathExpression();
            var entry = IAstFactory.eINSTANCE.createPathEntry();
            entry.setNameToken(new rnd.Token(0, targetName, rnd.Category.CAT_IDENTIFIER, 0, 0, 0, false, rnd.ErrorState.Correct, 0));
            var entries = path.getEntries();
            entries.push(entry);
            proxy.setNamePathRef(path);
            assoc.setTargetStmt(proxy);
            ds.cachedAssociations.push(assoc);
            return assoc;
        };
        DataSourceImpl.createDataSourceAssociation = function (ds, cu, associationName, proxy, cardinalities) {
            var proxy2 = EcoreUtil.copy(proxy);
            var targetName = proxy2.getName();
            var assoc = IAstFactory.eINSTANCE.createDataSourceAssociation();
            assoc.setName(associationName);
            assoc.setTargetName(targetName);
            assoc.setCardinalities(cardinalities);
            assoc.setTargetStmt(proxy2);
            ds.cachedAssociations.push(assoc);
            return assoc;
        };
        DataSourceImpl.prototype.getColumnNamesInUpperCaseForAllSelectListEntries = function () {
            var result = [];
            var select = this.getViewSelect();
            if (select == null) {
                return result;
            }
            var entries = this.getSelectListEntries();
            for (var entryCount = 0; entryCount < entries.length; entryCount++) {
                var entry = entries[entryCount];
                var names = this.getColumnNamesInUpperCase1(entry);
                result = result.concat(names);
            }
            return result;
        };
        DataSourceImpl.prototype.getColumnNamesInUpperCase1 = function (entry) {
            var exp = entry.getExpression();
            var names = this.getColumnNamesInUpperCaseExpression(exp);
            return names;
        };
        DataSourceImpl.prototype.getColumnNamesInUpperCaseExpression = function (exp) {
            var PathExpressionImpl = require("commonddl/astmodel/PathExpressionImpl");
            //var AtomicExpressionImpl = require("commonddl/astmodel/AtomicExpressionImpl");
            var StdFuncExpressionImpl = require("commonddl/astmodel/StdFuncExpressionImpl");
            var FuncExpressionImpl = require("commonddl/astmodel/FuncExpressionImpl");
            if (exp instanceof PathExpressionImpl) {
                var ident = (exp).getIdentifier();
                ident = ident.toUpperCase();
                return [ident];
            } /*else if (exp instanceof AtomicExpressionImpl) {
                var ident = (exp).getIdentifierToken().m_lexem;
                ident = ident.toUpperCase();
                return [ident];
            } */else if (exp instanceof StdFuncExpressionImpl) {
                var param = (exp).getParameter();
                return this.getColumnNamesInUpperCase1(param);
            } else if (exp instanceof FuncExpressionImpl) {
                var params = (exp).getParameters();
                var result = [];
                for (var paramCount = 0; paramCount < params.length; paramCount++) {
                    var param = params[paramCount];
                    result = result.concat(this.getColumnNamesInUpperCase1(param));
                }
                return result;
            }
            return [];
        };
        DataSourceImpl.prototype.retrieveDataSourceTypes = function (progressMonitor, force) {
            var def = this.getViewDefinition();
            if (def == null) {
                return;
            }
            var dataSourceNames = [];
            for (var selectCount = 0; selectCount < def.getSelects().length; selectCount++) {
                var select = def.getSelects()[selectCount];
                for (var dsCount = 0; dsCount < select.getDataSources().length; dsCount++) {
                    var ds = select.getDataSources()[dsCount];
                    Assert.isTrue1(ds.isPrimary());
                    dataSourceNames.push(ds.getNamePathExpression().getPathString(false));
                }
            }
            var cu = SourceRangeImpl.getCompilationUnit(this);
            var ra = cu.getRepositoryAccess();
            if (force) {
                ra.resetCache();
            }
            var dataSourceTypesMap = ra.getDataSourceTypes(progressMonitor, dataSourceNames);
            if (dataSourceTypesMap != null) {
                for (var selectCount = 0; selectCount < def.getSelects().length; selectCount++) {
                    var select = def.getSelects()[selectCount];
                    for (var dsCount = 0; dsCount < select.getDataSources().length; dsCount++) {
                        var ds = select.getDataSources()[dsCount];
                        var type = dataSourceTypesMap[ds.getNamePathExpression().getPathString(false)];
                        (ds).cachedDataSourceType = type;
                    }
                }
            }
        };
        DataSourceImpl.prototype.eInverseRemove = function (otherEnd, featureID, msgs) {
            switch (featureID) {
                case IAstPackage.DATA_SOURCE__NAME_PATH_EXPRESSION:
                    return this.basicSetNamePathExpression(null, msgs);
                case IAstPackage.DATA_SOURCE__CACHED_COLUMNS:
                    return (this.getCachedColumns()).basicRemove(otherEnd, msgs);
                case IAstPackage.DATA_SOURCE__CACHED_ASSOCIATIONS:
                    return (this.getCachedAssociations()).basicRemove(otherEnd, msgs);
            }

        };
        DataSourceImpl.prototype.getViewSelect = function () {
            var me = this;
            var ViewSelectImpl = require("commonddl/astmodel/ViewSelectImpl");
            while (!(me instanceof ViewSelectImpl)) {
                me = me.eContainer();
                if (me == null) {
                    return null;
                }
            }
            return me;
        };
        DataSourceImpl.prototype.getViewDefinition = function () {
            var ViewDefinitionImpl = require("commonddl/astmodel/ViewDefinitionImpl");
            var me = this;
            while (!(me instanceof ViewDefinitionImpl)) {
                me = me.eContainer();
                if (me == null) {
                    return null;
                }
            }
            return me;
        };
        DataSourceImpl.prototype.eGet = function (featureID, resolve, coreType) {
            switch (featureID) {
                case IAstPackage.DATA_SOURCE__NAME:
                    return this.getName();
                case IAstPackage.DATA_SOURCE__NAME_PATH_EXPRESSION:
                    return this.getNamePathExpression();
                case IAstPackage.DATA_SOURCE__ALIAS:
                    return this.getAlias();
                case IAstPackage.DATA_SOURCE__ALIAS_TOKEN:
                    return this.getAliasToken();
                case IAstPackage.DATA_SOURCE__PARENT_JOIN:
                    if (resolve) {
                        return this.getParentJoin();
                    }
                    return this.basicGetParentJoin();
                case IAstPackage.DATA_SOURCE__SELECT_LIST_ENTRIES:
                    return this.getSelectListEntries();
                case IAstPackage.DATA_SOURCE__PRIMARY:
                    return this.isPrimary();
                case IAstPackage.DATA_SOURCE__CACHED_COLUMNS:
                    return this.getCachedColumns();
                case IAstPackage.DATA_SOURCE__CACHED_DATA_SOURCE_TYPE:
                    return this.getCachedDataSourceType();
                case IAstPackage.DATA_SOURCE__CACHED_ASSOCIATIONS:
                    return this.getCachedAssociations();
            }
            return SourceRangeImpl.prototype.eGet.call(this, featureID, resolve, coreType);
        };
        DataSourceImpl.prototype.eSet = function (featureID, newValue) {

        };
        DataSourceImpl.prototype.eUnset = function (featureID) {

        };
        DataSourceImpl.prototype.eIsSet = function (featureID) {
            switch (featureID) {
                case IAstPackage.DATA_SOURCE__NAME:
                    return DataSourceImpl.NAME_EDEFAULT == null ? this.getName() != null : !NAME_EDEFAULT === this.getName();
                case IAstPackage.DATA_SOURCE__NAME_PATH_EXPRESSION:
                    return this.namePathExpression != null;
                case IAstPackage.DATA_SOURCE__ALIAS:
                    return DataSourceImpl.ALIAS_EDEFAULT == null ? this.getAlias() != null : !ALIAS_EDEFAULT === this.getAlias();
                case IAstPackage.DATA_SOURCE__ALIAS_TOKEN:
                    return DataSourceImpl.ALIAS_TOKEN_EDEFAULT == null ? this.aliasToken != null : !ALIAS_TOKEN_EDEFAULT === this.aliasToken;
                case IAstPackage.DATA_SOURCE__PARENT_JOIN:
                    return this.basicGetParentJoin() != null;
                case IAstPackage.DATA_SOURCE__SELECT_LIST_ENTRIES:
                    return this.selectListEntries != null && !this.selectListEntries.isEmpty();
                case IAstPackage.DATA_SOURCE__PRIMARY:
                    return this.isPrimary() != DataSourceImpl.PRIMARY_EDEFAULT;
                case IAstPackage.DATA_SOURCE__CACHED_COLUMNS:
                    return this.cachedColumns != null && !this.cachedColumns.isEmpty();
                case IAstPackage.DATA_SOURCE__CACHED_DATA_SOURCE_TYPE:
                    return this.cachedDataSourceType != DataSourceImpl.CACHED_DATA_SOURCE_TYPE_EDEFAULT;
                case IAstPackage.DATA_SOURCE__CACHED_ASSOCIATIONS:
                    return this.cachedAssociations != null && !this.cachedAssociations.isEmpty();
            }
            return SourceRangeImpl.prototype.eIsSet.call(this, featureID);
        };
        DataSourceImpl.prototype.toString = function () {
            var result = new rnd.StringBuffer();
            if (this.namePathExpression != null) {
                result.append(" (nameToken: ");
                result.append(this.getName());
            }
            if (this.aliasToken != null) {
                result.append(", aliasToken: ");
                result.append(this.aliasToken.m_lexem);
            }
            result.append(')');
            return result.toString();
        };
        return DataSourceImpl;
    }
);
define(
    'commonddl/astmodel/JoinEnum',[], //dependencies
    function () {

        function JoinEnum(val) {
            this.m_value = val;
        }

        JoinEnum.LEFT = new JoinEnum(0);
        JoinEnum.RIGHT = new JoinEnum(1);
        JoinEnum.FULL = new JoinEnum(2);
        JoinEnum.INNER = new JoinEnum(3);

        //public
        JoinEnum.prototype.getValue = function () {
            return this.m_value;
        };
        return JoinEnum;
    }
);
define(
    'commonddl/astmodel/JoinDataSourceImpl',["commonddl/astmodel/DataSourceImpl","commonddl/astmodel/JoinEnum","commonddl/astmodel/EObjectContainmentEList","require", "rndrt/rnd"], //dependencies
    function (DataSourceImpl,JoinEnum,EObjectContainmentEList,require,rnd) {
        var Utils = rnd.Utils;
        JoinDataSourceImpl.prototype = Object.create(DataSourceImpl.prototype);
        JoinDataSourceImpl.JOIN_ENUM_EDEFAULT=JoinEnum.LEFT;
        JoinDataSourceImpl.prototype.joinEnum=JoinDataSourceImpl.JOIN_ENUM_EDEFAULT;
        JoinDataSourceImpl.prototype.left=null;
        JoinDataSourceImpl.prototype.right=null;
        JoinDataSourceImpl.prototype.referencedDataSources=null;
        JoinDataSourceImpl.prototype.onExpression=null;
        function JoinDataSourceImpl() {
            DataSourceImpl.call(this);
        }
        JoinDataSourceImpl.prototype.eStaticClass = function() {
            return IAstPackage.Literals.JOIN_DATA_SOURCE;
        };
        JoinDataSourceImpl.prototype.getJoinEnum = function() {
            return this.joinEnum;
        };
        JoinDataSourceImpl.prototype.setJoinEnum = function(newJoinEnum) {
            var oldJoinEnum=this.joinEnum;
            this.joinEnum=newJoinEnum == null ? JOIN_ENUM_EDEFAULT : newJoinEnum;
        };
        JoinDataSourceImpl.prototype.getLeft = function() {
            return this.left;
        };
        JoinDataSourceImpl.prototype.basicSetLeft = function(newLeft,msgs) {
            var oldLeft=this.left;
            this.left=newLeft;
            this.left.setContainer(this);
            return msgs;
        };
        JoinDataSourceImpl.prototype.setLeft = function(newLeft) {
            if (newLeft != this.left) {
                var msgs=null;
                if (this.left != null) {

                }
                if (newLeft != null) {

                }
                msgs=this.basicSetLeft(newLeft,msgs);
                if (msgs != null) {
                    msgs.dispatch();
                }
            }
        };
        JoinDataSourceImpl.prototype.getRight = function() {
            return this.right;
        };
        JoinDataSourceImpl.prototype.basicSetRight = function(newRight,msgs) {
            var oldRight=this.right;
            this.right=newRight;
            this.right.setContainer(this);
            return msgs;
        };
        JoinDataSourceImpl.prototype.setRight = function(newRight) {
            if (newRight != this.right) {
                var msgs=null;
                if (this.right != null) {

                }
                if (newRight != null) {

                }
                msgs=this.basicSetRight(newRight,msgs);
                if (msgs != null) {
                    msgs.dispatch();
                }
            }
        };
        JoinDataSourceImpl.prototype.getOn = function() {
            return this.getOnExpression();
        };
        JoinDataSourceImpl.prototype.setOn = function(newOn) {
            this.setOnExpression(newOn);
        };
        JoinDataSourceImpl.prototype.getReferencedDataSources = function() {
            if (this.referencedDataSources == null) {
                this.referencedDataSources=new EObjectContainmentEList(this);
                var onCond=this.getOn();
                JoinDataSourceImpl.addReferencedDataSources(onCond,this.referencedDataSources);
            }
            return this.referencedDataSources;
        };
        JoinDataSourceImpl.prototype.getOnExpression = function() {
            return this.onExpression;
        };
        JoinDataSourceImpl.prototype.basicSetOnExpression = function(newOnExpression,msgs) {
            var oldOnExpression=this.onExpression;
            this.onExpression=newOnExpression;
            this.onExpression.setContainer(this);
            return msgs;
        };
        JoinDataSourceImpl.prototype.setOnExpression = function(newOnExpression) {
            var oldOn=this.onExpression;
            this.onExpression=newOnExpression;
            if (newOnExpression != null) {
                newOnExpression.setParent(this);
            }
        };
        JoinDataSourceImpl.addReferencedDataSources = function(onCond,referencedDataSources) {
            JoinDataSourceImpl.addDataSource(referencedDataSources,onCond);
        };
        JoinDataSourceImpl.prototype.isPrimary = function() {
            return false;
        };
        JoinDataSourceImpl.addDataSource = function(refs,r) {
            /*if (r instanceof AtomicExpressionImpl) {
                var ds=(r).getDataSource();
                if (ds != null) {
                    if (!refs.contains(ds)) {
                        refs.push(ds);
                    }
                }
            }else */
            var PathExpressionImpl = require("commonddl/astmodel/PathExpressionImpl");
            var ExpressionImpl = require("commonddl/astmodel/ExpressionImpl");
            if (r instanceof PathExpressionImpl) {
                var path=(r).getTarget();
                if (path instanceof DataSourceImpl) {
                    if (!Utils.arrayContains(refs, path)) {
                        refs.push(path);
                    }
                }else{
                    var Category = require("rndrt/rnd").Category;
                    var AssociationDeclarationImpl = require("commonddl/astmodel/AssociationDeclarationImpl");
                    var ViewSelectImpl = require("commonddl/astmodel/ViewSelectImpl");
                    var pathEntries=(r).getEntries();
                    if ((pathEntries != null) && (pathEntries.length > 1)) {
                        var firstPart=pathEntries[0].getNameToken();
                        if (firstPart.m_category===Category.CAT_KEYWORD && Utils.stringEqualsIgnoreCase(firstPart.m_lexem, "$projection")) {
                            var prnt=ExpressionImpl.getFirstNonExpressionContainer(r);
                            if (prnt instanceof AssociationDeclarationImpl) {
                                var grndPrnt=prnt.eContainer();
                                if (grndPrnt instanceof ViewSelectImpl) {
                                    var secondPart=pathEntries[1].getNameToken().getM_lexem();
                                    var entry=JoinDataSourceImpl.getFirstMatchingSelectListEntry(grndPrnt,secondPart);
                                    if (entry != null) {
                                        if (pathEntries.length == 2) {
                                            JoinDataSourceImpl.addDataSource(refs,entry.getExpression());
                                        }else{
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }else if (r != null) {
                var children=r.eContents();
                for (var childCount=0;childCount<children.length;childCount++) {
                    var child=children[childCount];
                    if (child instanceof ExpressionImpl) {
                        JoinDataSourceImpl.addDataSource(refs,child);
                    }
                }
            }
        };
        JoinDataSourceImpl.getFirstMatchingSelectListEntry = function(viewSelect,name) {
            var PathExpressionImpl = require("commonddl/astmodel/PathExpressionImpl");
            var selectList=viewSelect.getSelectList();
            if (selectList != null) {
                var entries=selectList.getEntries();
                for (var entryCount=0;entryCount<entries.length;entryCount++) {
                    var entry=entries[entryCount];
                    var alias=entry.getAlias();
                    if ((alias != null) && Utils.stringEqualsIgnoreCase(alias, name)) {
                        return entry;
                    }else if (entry.getExpression() instanceof PathExpressionImpl) {
                        var path=(entry.getExpression()).getPathString(false);
                        if ((path != null) && Utils.stringEqualsIgnoreCase(path, name)) {
                            return entry;
                        }
                    }
                }
            }
            return null;
        };
        JoinDataSourceImpl.prototype.eInverseRemove = function(otherEnd,featureID,msgs) {
            switch (featureID) {
                case IAstPackage.JOIN_DATA_SOURCE__LEFT:
                    return this.basicSetLeft(null,msgs);
                case IAstPackage.JOIN_DATA_SOURCE__RIGHT:
                    return this.basicSetRight(null,msgs);
                case IAstPackage.JOIN_DATA_SOURCE__ON_EXPRESSION:
                    return this.basicSetOnExpression(null,msgs);
            }

        };
        JoinDataSourceImpl.prototype.eGet = function(featureID,resolve,coreType) {
            switch (featureID) {
                case IAstPackage.JOIN_DATA_SOURCE__JOIN_ENUM:
                    return this.getJoinEnum();
                case IAstPackage.JOIN_DATA_SOURCE__LEFT:
                    return this.getLeft();
                case IAstPackage.JOIN_DATA_SOURCE__RIGHT:
                    return this.getRight();
                case IAstPackage.JOIN_DATA_SOURCE__REFERENCED_DATA_SOURCES:
                    return this.getReferencedDataSources();
                case IAstPackage.JOIN_DATA_SOURCE__ON_EXPRESSION:
                    return this.getOnExpression();
            }
            return DataSourceImpl.prototype.eGet.call(this,featureID,resolve,coreType);
        };
        JoinDataSourceImpl.prototype.eSet = function(featureID,newValue) {

        };
        JoinDataSourceImpl.prototype.eUnset = function(featureID) {

        };
        JoinDataSourceImpl.prototype.eIsSet = function(featureID) {
            switch (featureID) {
                case IAstPackage.JOIN_DATA_SOURCE__JOIN_ENUM:
                    return this.joinEnum != JoinDataSourceImpl.JOIN_ENUM_EDEFAULT;
                case IAstPackage.JOIN_DATA_SOURCE__LEFT:
                    return this.left != null;
                case IAstPackage.JOIN_DATA_SOURCE__RIGHT:
                    return this.right != null;
                case IAstPackage.JOIN_DATA_SOURCE__REFERENCED_DATA_SOURCES:
                    return this.referencedDataSources != null && !this.referencedDataSources.isEmpty();
                case IAstPackage.JOIN_DATA_SOURCE__ON_EXPRESSION:
                    return this.onExpression != null;
            }
            return DataSourceImpl.prototype.eIsSet.call(this,featureID);
        };
        JoinDataSourceImpl.prototype.toString = function() {
            var result=new StringBuffer();
            result.append(" (joinEnum: ");
            result.append(this.joinEnum);
            result.append(')');
            result.append(" (left: ");
            result.append(this.left.toString());
            result.append(')');
            result.append(" (right: ");
            result.append(this.right.toString());
            result.append(')');
            return result.toString();
        };
        return JoinDataSourceImpl;
    }
);
define(
    'commonddl/astmodel/OrderByImpl',["commonddl/astmodel/SourceRangeImpl","commonddl/astmodel/EObjectContainmentEList"], //dependencies
    function (SourceRangeImpl,EObjectContainmentEList) {
        OrderByImpl.prototype = Object.create(SourceRangeImpl.prototype);
        OrderByImpl.prototype.entries=null;
        function OrderByImpl() {
            SourceRangeImpl.call(this);
        }
        OrderByImpl.prototype.eStaticClass = function() {
            return IAstPackage.Literals.ORDER_BY;
        };
        OrderByImpl.prototype.getEntries = function() {
            if (this.entries == null) {
                this.entries=new EObjectContainmentEList(this);
            }
            return this.entries;
        };
        OrderByImpl.prototype.eInverseRemove = function(otherEnd,featureID,msgs) {
            switch (featureID) {
                case IAstPackage.ORDER_BY__ENTRIES:
                    return (this.getEntries()).basicRemove(otherEnd,msgs);
            }

        };
        OrderByImpl.prototype.eGet = function(featureID,resolve,coreType) {
            switch (featureID) {
                case IAstPackage.ORDER_BY__ENTRIES:
                    return this.getEntries();
            }
            return SourceRangeImpl.prototype.eGet.call(this,featureID,resolve,coreType);
        };
        OrderByImpl.prototype.eSet = function(featureID,newValue) {

        };
        OrderByImpl.prototype.eUnset = function(featureID) {

        };
        OrderByImpl.prototype.eIsSet = function(featureID) {
            switch (featureID) {
                case IAstPackage.ORDER_BY__ENTRIES:
                    return this.entries != null && !this.entries.isEmpty();
            }
            return SourceRangeImpl.prototype.eIsSet.call(this,featureID);
        };
        return OrderByImpl;
    }
);
define(
    'commonddl/astmodel/SelectImpl',[
        "commonddl/astmodel/OrderByImpl",
        "commonddl/astmodel/SourceRangeImpl"
    ], //dependencies
    function (
        OrderByImpl,SourceRangeImpl
        ) {
        SelectImpl.prototype = Object.create(SourceRangeImpl.prototype);
        SelectImpl.prototype.orderBy=null;
        function SelectImpl() {
            SourceRangeImpl.call(this);
        }
        SelectImpl.prototype.eStaticClass = function() {
            return IAstPackage.Literals.SELECT;
        };
        SelectImpl.prototype.getOrderBy = function() {
            return this.orderBy;
        };
        SelectImpl.prototype.basicSetOrderBy = function(newOrderBy,msgs) {
            var oldOrderBy=this.orderBy;
            this.orderBy=newOrderBy;
            this.orderBy.setContainer(this);
            return msgs;
        };
        SelectImpl.prototype.setOrderBy = function(newOrderBy) {
            if (newOrderBy != this.orderBy) {
                var msgs=null;
                if (this.orderBy != null) {

                }
                if (newOrderBy != null) {

                }
                msgs=this.basicSetOrderBy(newOrderBy,msgs);
                if (msgs != null) {
                    msgs.dispatch();
                }
            }
        };
        SelectImpl.prototype.eInverseRemove = function(otherEnd,featureID,msgs) {
            switch (featureID) {
                case IAstPackage.SELECT__ORDER_BY:
                    return this.basicSetOrderBy(null,msgs);
            }

        };
        SelectImpl.prototype.eGet = function(featureID,resolve,coreType) {
            switch (featureID) {
                case IAstPackage.SELECT__ORDER_BY:
                    return this.getOrderBy();
            }
            return SourceRangeImpl.prototype.eGet.call(this,featureID,resolve,coreType);
        };
        SelectImpl.prototype.eSet = function(featureID,newValue) {
            switch (featureID) {
                case IAstPackage.SELECT__ORDER_BY:
                    this.setOrderBy(newValue);
                    return;
            }
            SourceRangeImpl.prototype.eSet.call(this,featureID,newValue);
        };
        SelectImpl.prototype.eUnset = function(featureID) {
            switch (featureID) {
                case IAstPackage.SELECT__ORDER_BY:
                    this.setOrderBy(null);
                    return;
            }
            SourceRangeImpl.prototype.eUnset.call(this,featureID);
        };
        SelectImpl.prototype.eIsSet = function(featureID) {
            switch (featureID) {
                case IAstPackage.SELECT__ORDER_BY:
                    return this.orderBy != null;
            }
            return SourceRangeImpl.prototype.eIsSet.call(this,featureID);
        };
        return SelectImpl;
    }
);
define(
    'commonddl/astmodel/ViewSelectImpl',["rndrt/rnd", "commonddl/astmodel/SourceRangeImpl","commonddl/astmodel/JoinDataSourceImpl","commonddl/astmodel/EObjectContainmentEList", "require","commonddl/astmodel/SelectImpl"], //dependencies
    function (rnd, SourceRangeImpl,JoinDataSourceImpl,EObjectContainmentEList,require,SelectImpl) {
        var Utils = rnd.Utils;
        ViewSelectImpl.prototype = Object.create(SelectImpl.prototype);
        ViewSelectImpl.prototype.selectList=null;
        ViewSelectImpl.prototype.from=null;
        ViewSelectImpl.prototype.associations=null;
        ViewSelectImpl.prototype.where=null;
        ViewSelectImpl.prototype.groupBy=null;
        ViewSelectImpl.prototype.having=null;
        ViewSelectImpl.prototype.orderBy=null;
        ViewSelectImpl.prototype.union=null;
        ViewSelectImpl.UNION_ALL_EDEFAULT=false;
        ViewSelectImpl.prototype.unionAll=ViewSelectImpl.UNION_ALL_EDEFAULT;
        ViewSelectImpl.UNION_TYPE_EDEFAULT=null;
        ViewSelectImpl.prototype.dataSources=null;
        ViewSelectImpl.NAME_EDEFAULT=null;
        ViewSelectImpl.prototype.name=ViewSelectImpl.NAME_EDEFAULT;
        ViewSelectImpl.UNION_TOKEN_EDEFAULT=null;
        ViewSelectImpl.prototype.unionToken=ViewSelectImpl.UNION_TOKEN_EDEFAULT;
        ViewSelectImpl.ALL_TOKEN_EDEFAULT=null;
        ViewSelectImpl.prototype.allToken=ViewSelectImpl.ALL_TOKEN_EDEFAULT;
        ViewSelectImpl.UNCERTAIN_COLUMN_USAGE_EDEFAULT=false;
        ViewSelectImpl.prototype.uncertainColumnUsage=ViewSelectImpl.UNCERTAIN_COLUMN_USAGE_EDEFAULT;
        function ViewSelectImpl() {
            SelectImpl.call(this);
        }
        ViewSelectImpl.prototype.eStaticClass = function() {
            return IAstPackage.Literals.VIEW_SELECT;
        };
        ViewSelectImpl.prototype.getSelectList = function() {
            return this.selectList;
        };
        ViewSelectImpl.prototype.basicSetSelectList = function(newSelectList,msgs) {
            var oldSelectList=this.selectList; this.selectList=newSelectList; this.selectList.setContainer(this); return msgs;
        };
        ViewSelectImpl.prototype.setSelectList = function(newSelectList) {
            if (newSelectList != this.selectList) {
                var msgs=null;
                if (this.selectList != null) {

                }
                if (newSelectList != null) {

                }
                msgs=this.basicSetSelectList(newSelectList,msgs);
                if (msgs != null) {
                    msgs.dispatch();
                }
            }
        };
        ViewSelectImpl.prototype.getFrom = function() {
            return this.from;
        };
        ViewSelectImpl.prototype.basicSetFrom = function(newFrom,msgs) {
            var oldFrom=this.from;
            this.from=newFrom;
            this.from.setContainer(this);
            return msgs;
        };
        ViewSelectImpl.prototype.setFrom = function(newFrom) {
            if (newFrom != this.from) {
                var msgs=null;
                if (this.from != null) {

                }
                if (newFrom != null) {

                }
                msgs=this.basicSetFrom(newFrom,msgs);
                if (msgs != null) {
                    msgs.dispatch();
                }
            }
        };
        ViewSelectImpl.prototype.getAssociations = function() {
            if (this.associations == null) {
                this.associations=new EObjectContainmentEList(this);
            }
            return this.associations;
        };
        ViewSelectImpl.prototype.getWhere = function() {
            return this.where;
        };
        ViewSelectImpl.prototype.basicSetWhere = function(newWhere,msgs) {
            var oldWhere=this.where;
            this.where=newWhere;
            this.where.setContainer(this);
            return msgs;
        };
        ViewSelectImpl.prototype.setWhere = function(newWhere) {
            if (newWhere != this.where) {
                var msgs=null;
                if (this.where != null) {

                }
                if (newWhere != null) {

                }
                msgs=this.basicSetWhere(newWhere,msgs);
                if (msgs != null) {
                    msgs.dispatch();
                }
            }
        };
        ViewSelectImpl.prototype.getGroupBy = function() {
            return this.groupBy;
        };
        ViewSelectImpl.prototype.basicSetGroupBy = function(newGroupBy,msgs) {
            var oldGroupBy=this.groupBy;
            this.groupBy=newGroupBy;
            this.groupBy.setContainer(this);
            return msgs;
        };
        ViewSelectImpl.prototype.setGroupBy = function(newGroupBy) {
            if (newGroupBy != this.groupBy) {
                var msgs=null;
                if (this.groupBy != null) {

                }
                if (newGroupBy != null) {

                }
                msgs=this.basicSetGroupBy(newGroupBy,msgs);
                if (msgs != null) {
                    msgs.dispatch();
                }
            }
        };
        ViewSelectImpl.prototype.getHaving = function() {
            return this.having;
        };
        ViewSelectImpl.prototype.basicSetHaving = function(newHaving,msgs) {
            var oldHaving=this.having;
            this.having=newHaving;
            this.having.setContainer(this);
            return msgs;
        };
        ViewSelectImpl.prototype.setHaving = function(newHaving) {
            if (newHaving != this.having) {
                var msgs=null;
                if (this.having != null) {

                }
                if (newHaving != null) {

                }
                msgs=this.basicSetHaving(newHaving,msgs);
                if (msgs != null) {
                    msgs.dispatch();
                }
            }
        };
        ViewSelectImpl.prototype.getUnion = function() {
            return this.union;
        };
        ViewSelectImpl.prototype.basicSetUnion = function(newUnion,msgs) {
            var oldUnion=this.union;
            this.union=newUnion;
            this.union.setContainer(this);
            return msgs;
        };
        ViewSelectImpl.prototype.setUnion = function(newUnion) {
            if (newUnion != this.union) {
                var msgs=null;
                if (this.union != null) {

                }
                if (newUnion != null) {

                }
                msgs=this.basicSetUnion(newUnion,msgs);
                if (msgs != null) {
                    msgs.dispatch();
                }
            }
        };
        ViewSelectImpl.prototype.isUnionAll = function() {
            return this.unionAll;
        };
        ViewSelectImpl.prototype.setUnionAll = function(newUnionAll) {
            var oldUnionAll=this.unionAll;
            this.unionAll=newUnionAll;
        };
        ViewSelectImpl.prototype.getDataSources = function() {
            if (this.dataSources == null) {
                this.dataSources=[];
                var ds=this.getFrom();
                ViewSelectImpl.getAllFlatDataSources(ds,this.dataSources);
                this.getAllAssocDataSources(this.dataSources);
            }
            return this.dataSources;
        };
        ViewSelectImpl.prototype.getName = function() {
            try {
                var root=this.getViewDefinition(this);
                var un=root.isSingleSelect();
                var names=root.getNames();
                if ((names != null) && names.getNames().length == 0) {
                    names=null;
                }
                if (un == true && names == null) {
                    var nameToken=root.getNameToken();
                    return nameToken.m_lexem;
                }else{
                    var index=root.getSelects().indexOf(this);
                    index=index + 1;
                    return "Result Set " + index;
                }
            }
            catch(e) {
            }
            return null;
        };
        ViewSelectImpl.prototype.getUnionType = function() {
            if (this.eContainer() instanceof ViewSelectImpl) {
                var parent=this.eContainer();
                return parent.isUnionAll() ? "union all" : "union";
            }
            return "";
        };
        ViewSelectImpl.prototype.getFromDataSource = function() {
            var from=this.getFrom();
            if ((this.from != null) && this.from.isPrimary()) {
                return this.from;
            }
            if (from instanceof JoinDataSourceImpl) {
                var leftJoin=this.from;
                while (true) {
                    var next=leftJoin.getLeft();
                    if (next instanceof JoinDataSourceImpl) {
                        leftJoin=next;
                    }else{
                        return next;
                    }
                }
            }
            return null;
        };
        ViewSelectImpl.prototype.getUnionToken = function() {
            return this.unionToken;
        };
        ViewSelectImpl.prototype.setUnionToken = function(newUnionToken) {
            var oldUnionToken=this.unionToken;
            this.unionToken=newUnionToken;
        };
        ViewSelectImpl.prototype.getAllToken = function() {
            return this.allToken;
        };
        ViewSelectImpl.prototype.setAllToken = function(newAllToken) {
            var oldAllToken=this.allToken;
            this.allToken=newAllToken;
        };
        ViewSelectImpl.prototype.isUncertainColumnUsage = function() {
            return this.uncertainColumnUsage;
        };
        ViewSelectImpl.prototype.setUncertainColumnUsage = function(newUncertainColumnUsage) {
            var oldUncertainColumnUsage=this.uncertainColumnUsage;
            this.uncertainColumnUsage=newUncertainColumnUsage;
            if (oldUncertainColumnUsage && !newUncertainColumnUsage) {
                this.recomputeUncertainCachedValues();
            }
        };
        ViewSelectImpl.prototype.getAllLocalContents = function() {
            var result = [];
            this.getAllLocalContentsRecursively(result,this);
            return result;
        };

        ViewSelectImpl.prototype.getAllLocalContentsRecursively = function(result,obj) {
            if (Utils.arrayContains(result, obj))
                return; //ensure no endless loop

            if (obj instanceof ViewSelectImpl) {
                var union = obj.getUnion();
                if (union != null) {
                    var children = obj.eContents();
                    for (var i=0;i<children.length;i++) {
                        var child = children[i];
                        if (union!=child) {
                            this.getAllLocalContentsRecursively(result,child);
                        }
                    }
                    return;
                }
            }

            result.push(obj);
            var o = obj.eContents();
            for (var i=0;i< o.length;i++) {
                this.getAllLocalContentsRecursively(result,o[i]);
            }
        };

        ViewSelectImpl.prototype.recomputeUncertainCachedValues = function() {

        };
        ViewSelectImpl.prototype.isComputingExpressionColumns=false;
        ViewSelectImpl.prototype.computeAllExpressionColumns = function() {
            if (this.isComputingExpressionColumns) {
                return;
            }
            this.isComputingExpressionColumns=true;
            try {
                var PathExpressionImpl = require("commonddl/astmodel/PathExpressionImpl");
                var localContents = this.getAllLocalContents();
                for (var i=0;i<localContents.length;i++) {
                    var subObj=localContents[i];
                    if (subObj instanceof PathExpressionImpl) {
                        (subObj).getDataSourceColumn();
                    }
                }
            }
            catch(e) {
                console.log(e.stack);
            }
            this.isComputingExpressionColumns=false;
        };
        ViewSelectImpl.prototype.isComputingExpressionAssociations=false;
        ViewSelectImpl.prototype.computeAllExpressionAssociations = function() {
            if (this.isComputingExpressionAssociations) {
                return;
            }
            this.isComputingExpressionAssociations=true;
            try {
                var PathExpressionImpl = require("commonddl/astmodel/PathExpressionImpl");
                var contents = this.getAllLocalContents();
                for (var i = 0;i<contents.length; i++) {
                    var subObj=contents[i];
                    if (subObj instanceof PathExpressionImpl) {
                        (subObj).getDataSourceAssociation();
                    }
                }
            }
            catch(e) {
                console.log(e.stack);
            }
            this.isComputingExpressionAssociations=false;
        };
        ViewSelectImpl.prototype.getViewDefinition = function(select) {
            var ViewDefinitionImpl = require("commonddl/astmodel/ViewDefinitionImpl");
            var parent=select;
            while (!(parent instanceof ViewDefinitionImpl)) {
                parent=parent.eContainer();
                if (parent == null) {
                    return null;
                }
            }
            return parent;
        };
        ViewSelectImpl.prototype.getAllDataSourcesWithoutAssociations = function() {
            var result=[];
            var ds=this.getFrom();
            ViewSelectImpl.getAllFlatDataSources(ds,result);
            return result;
        };
        ViewSelectImpl.getAllFlatDataSources = function(ds,list) {
            if (!(ds instanceof JoinDataSourceImpl)) {
                if (ds != null) {
                    list.push(ds);
                }
            }
            if (ds instanceof JoinDataSourceImpl) {
                var join=ds;
                var left=join.getLeft();
                ViewSelectImpl.getAllFlatDataSources(left,list);
                var right=join.getRight();
                ViewSelectImpl.getAllFlatDataSources(right,list);
            }
        };
        ViewSelectImpl.prototype.getAllDataSourcesIncludingJoinsWithoutAssociationsAsFlatList0 = function() {
            var result=[];
            var from=this.getFrom();
            if (!(from instanceof JoinDataSourceImpl)) {
                if (this.from != null) {
                    result.push(from);
                }
            }
            if (from instanceof JoinDataSourceImpl) {
                this.getAllDataSourcesIncludingJoinsWithoutAssociationsAsFlatList2(from,result);
            }
            return result;
        };
        ViewSelectImpl.prototype.getAllDataSourcesIncludingJoinsWithoutAssociationsAsFlatList2 = function(ds,result) {
            if (ds instanceof JoinDataSourceImpl) {
                var join=ds;
                result.push(join);
                this.getAllDataSourcesIncludingJoinsWithoutAssociationsAsFlatList2(join.getLeft(),result);
                this.getAllDataSourcesIncludingJoinsWithoutAssociationsAsFlatList2(join.getRight(),result);
            }else{
                result.push(ds);
            }
        };
        ViewSelectImpl.prototype.getAllAssocDataSources = function(list) {
            var assocs=this.getAssociations();
            for (var assocCount=0;assocCount<assocs.length;assocCount++) {
                var assoc=assocs[assocCount];
                var targetDataSource=assoc.getTargetDataSource();
                if (targetDataSource != null) {
                    list.push(targetDataSource);
                }
            }
        };
        ViewSelectImpl.prototype.isDistinct = function() {
            throw new UnsupportedOperationException();
        };
        ViewSelectImpl.prototype.eInverseRemove = function(otherEnd,featureID,msgs) {
            switch (featureID) {
                case IAstPackage.VIEW_SELECT__SELECT_LIST:
                    return this.basicSetSelectList(null,msgs);
                case IAstPackage.VIEW_SELECT__FROM:
                    return this.basicSetFrom(null,msgs);
                case IAstPackage.VIEW_SELECT__ASSOCIATIONS:
                    return (this.getAssociations()).basicRemove(otherEnd,msgs);
                case IAstPackage.VIEW_SELECT__WHERE:
                    return this.basicSetWhere(null,msgs);
                case IAstPackage.VIEW_SELECT__GROUP_BY:
                    return this.basicSetGroupBy(null,msgs);
                case IAstPackage.VIEW_SELECT__HAVING:
                    return this.basicSetHaving(null,msgs);
                case IAstPackage.VIEW_SELECT__ORDER_BY:
                    return this.basicSetOrderBy(null,msgs);
                case IAstPackage.VIEW_SELECT__UNION:
                    return this.basicSetUnion(null,msgs);
            }

        };
        ViewSelectImpl.prototype.eGet = function(featureID,resolve,coreType) {
            switch (featureID) {
                case IAstPackage.VIEW_SELECT__SELECT_LIST:
                    return this.getSelectList();
                case IAstPackage.VIEW_SELECT__FROM:
                    return this.getFrom();
                case IAstPackage.VIEW_SELECT__ASSOCIATIONS:
                    return this.getAssociations();
                case IAstPackage.VIEW_SELECT__WHERE:
                    return this.getWhere();
                case IAstPackage.VIEW_SELECT__GROUP_BY:
                    return this.getGroupBy();
                case IAstPackage.VIEW_SELECT__HAVING:
                    return this.getHaving();
                case IAstPackage.VIEW_SELECT__ORDER_BY:
                    return this.getOrderBy();
                case IAstPackage.VIEW_SELECT__UNION:
                    return this.getUnion();
                case IAstPackage.VIEW_SELECT__UNION_ALL:
                    return this.isUnionAll();
                case IAstPackage.VIEW_SELECT__UNION_TYPE:
                    return this.getUnionType();
                case IAstPackage.VIEW_SELECT__DATA_SOURCES:
                    return this.getDataSources();
                case IAstPackage.VIEW_SELECT__NAME:
                    return this.getName();
                case IAstPackage.VIEW_SELECT__FROM_DATA_SOURCE:
                    return this.getFromDataSource();
                case IAstPackage.VIEW_SELECT__UNION_TOKEN:
                    return this.getUnionToken();
                case IAstPackage.VIEW_SELECT__ALL_TOKEN:
                    return this.getAllToken();
                case IAstPackage.VIEW_SELECT__UNCERTAIN_COLUMN_USAGE:
                    return this.isUncertainColumnUsage();
            }
            return SourceRangeImpl.prototype.eGet.call(this,featureID,resolve,coreType);
        };
        ViewSelectImpl.prototype.eSet = function(featureID,newValue) {

        };
        ViewSelectImpl.prototype.eUnset = function(featureID) {

        };
        ViewSelectImpl.prototype.eIsSet = function(featureID) {
            switch (featureID) {
                case IAstPackage.VIEW_SELECT__SELECT_LIST:
                    return this.selectList != null;
                case IAstPackage.VIEW_SELECT__FROM:
                    return this.from != null;
                case IAstPackage.VIEW_SELECT__ASSOCIATIONS:
                    return this.associations != null && !this.associations.isEmpty();
                case IAstPackage.VIEW_SELECT__WHERE:
                    return this.where != null;
                case IAstPackage.VIEW_SELECT__GROUP_BY:
                    return this.groupBy != null;
                case IAstPackage.VIEW_SELECT__HAVING:
                    return this.having != null;
                case IAstPackage.VIEW_SELECT__ORDER_BY:
                    return this.orderBy != null;
                case IAstPackage.VIEW_SELECT__UNION:
                    return this.union != null;
                case IAstPackage.VIEW_SELECT__UNION_ALL:
                    return this.unionAll != ViewSelectImpl.UNION_ALL_EDEFAULT;
                case IAstPackage.VIEW_SELECT__UNION_TYPE:
                    return ViewSelectImpl.UNION_TYPE_EDEFAULT == null ? this.getUnionType() != null : !UNION_TYPE_EDEFAULT===this.getUnionType();
                case IAstPackage.VIEW_SELECT__DATA_SOURCES:
                    return this.dataSources != null && !this.dataSources.isEmpty();
                case IAstPackage.VIEW_SELECT__NAME:
                    return ViewSelectImpl.NAME_EDEFAULT == null ? this.name != null : !NAME_EDEFAULT===this.name;
                case IAstPackage.VIEW_SELECT__FROM_DATA_SOURCE:
                    return this.getFromDataSource() != null;
                case IAstPackage.VIEW_SELECT__UNION_TOKEN:
                    return ViewSelectImpl.UNION_TOKEN_EDEFAULT == null ? this.unionToken != null : !UNION_TOKEN_EDEFAULT===this.unionToken;
                case IAstPackage.VIEW_SELECT__ALL_TOKEN:
                    return ViewSelectImpl.ALL_TOKEN_EDEFAULT == null ? this.allToken != null : !ALL_TOKEN_EDEFAULT===this.allToken;
                case IAstPackage.VIEW_SELECT__UNCERTAIN_COLUMN_USAGE:
                    return this.uncertainColumnUsage != ViewSelectImpl.UNCERTAIN_COLUMN_USAGE_EDEFAULT;
            }
            return SourceRangeImpl.prototype.eIsSet.call(this,featureID);
        };
        ViewSelectImpl.prototype.toString = function() {
            if (this.eIsProxy()) {
                return SourceRangeImpl.prototype.toString.call(this);
            }
            var result=new StringBuffer(SourceRangeImpl.prototype.toString.call(this));
            result.append(" (unionAll: ");
            result.append(this.unionAll);
            result.append(", name: ");
            result.append(this.name);
            result.append(", unionToken: ");
            result.append(this.unionToken);
            result.append(", allToken: ");
            result.append(this.allToken);
            result.append(", uncertainColumnUsage: ");
            result.append(this.uncertainColumnUsage);
            result.append(')');
            return result.toString();
        };
        return ViewSelectImpl;
    }
);
define(
    'commonddl/astmodel/ViewSelectSetImpl',[
        "rndrt/rnd",
        "commonddl/astmodel/SelectImpl"
    ], //dependencies
    function (
        rnd,SelectImpl
        ) {
        var Token = rnd.Token;
        var StringBuffer = rnd.StringBuffer;
        ViewSelectSetImpl.prototype = Object.create(SelectImpl.prototype);
        ViewSelectSetImpl.prototype.left=null;
        ViewSelectSetImpl.prototype.right=null;
        ViewSelectSetImpl.OPERATOR_EDEFAULT=null;
        ViewSelectSetImpl.prototype.operator=ViewSelectSetImpl.OPERATOR_EDEFAULT;
        ViewSelectSetImpl.DISTINCT_EDEFAULT=null;
        ViewSelectSetImpl.prototype.distinct=ViewSelectSetImpl.DISTINCT_EDEFAULT;
        ViewSelectSetImpl.ALL_EDEFAULT=null;
        ViewSelectSetImpl.prototype.all=ViewSelectSetImpl.ALL_EDEFAULT;
        function ViewSelectSetImpl() {
            SelectImpl.call(this);
        }
        ViewSelectSetImpl.prototype.eStaticClass = function() {
            return IAstPackage.Literals.VIEW_SELECT_SET;
        };
        ViewSelectSetImpl.prototype.getLeft = function() {
            return this.left;
        };
        ViewSelectSetImpl.prototype.basicSetLeft = function(newLeft,msgs) {
            var oldLeft=this.left;
            this.left=newLeft;
            this.left.setContainer(this);
            return msgs;
        };
        ViewSelectSetImpl.prototype.setLeft = function(newLeft) {
            if (newLeft != this.left) {
                var msgs=null;
                if (this.left != null) {

                }
                if (newLeft != null) {

                }
                msgs=this.basicSetLeft(newLeft,msgs);
                if (msgs != null) {
                    msgs.dispatch();
                }
            }
        };
        ViewSelectSetImpl.prototype.getRight = function() {
            return this.right;
        };
        ViewSelectSetImpl.prototype.basicSetRight = function(newRight,msgs) {
            var oldRight=this.right;
            this.right=newRight;
            this.right.setContainer(this);
            return msgs;
        };
        ViewSelectSetImpl.prototype.setRight = function(newRight) {
            if (newRight != this.right) {
                var msgs=null;
                if (this.right != null) {

                }
                if (newRight != null) {

                }
                msgs=this.basicSetRight(newRight,msgs);
                if (msgs != null) {
                    msgs.dispatch();
                }
            }
        };
        ViewSelectSetImpl.prototype.getOperator = function() {
            return this.operator;
        };
        ViewSelectSetImpl.prototype.setOperator = function(newOperator) {
            var oldOperator=this.operator;
            this.operator=newOperator;
        };
        ViewSelectSetImpl.prototype.getDistinct = function() {
            return this.distinct;
        };
        ViewSelectSetImpl.prototype.setDistinct = function(newDistinct) {
            var oldDistinct=this.distinct;
            this.distinct=newDistinct;
        };
        ViewSelectSetImpl.prototype.getAll = function() {
            return this.all;
        };
        ViewSelectSetImpl.prototype.setAll = function(newAll) {
            var oldAll=this.all;
            this.all=newAll;
        };
        ViewSelectSetImpl.prototype.eInverseRemove = function(otherEnd,featureID,msgs) {
            switch (featureID) {
                case IAstPackage.VIEW_SELECT_SET__LEFT:
                    return this.basicSetLeft(null,msgs);
                case IAstPackage.VIEW_SELECT_SET__RIGHT:
                    return this.basicSetRight(null,msgs);
            }

        };
        ViewSelectSetImpl.prototype.eGet = function(featureID,resolve,coreType) {
            switch (featureID) {
                case IAstPackage.VIEW_SELECT_SET__LEFT:
                    return this.getLeft();
                case IAstPackage.VIEW_SELECT_SET__RIGHT:
                    return this.getRight();
                case IAstPackage.VIEW_SELECT_SET__OPERATOR:
                    return this.getOperator();
                case IAstPackage.VIEW_SELECT_SET__DISTINCT:
                    return this.getDistinct();
                case IAstPackage.VIEW_SELECT_SET__ALL:
                    return this.getAll();
            }
            return SelectImpl.prototype.eGet.call(this,featureID,resolve,coreType);
        };
        ViewSelectSetImpl.prototype.eSet = function(featureID,newValue) {
            switch (featureID) {
                case IAstPackage.VIEW_SELECT_SET__LEFT:
                    this.setLeft(newValue);
                    return;
                case IAstPackage.VIEW_SELECT_SET__RIGHT:
                    this.setRight(newValue);
                    return;
                case IAstPackage.VIEW_SELECT_SET__OPERATOR:
                    this.setOperator(newValue);
                    return;
                case IAstPackage.VIEW_SELECT_SET__DISTINCT:
                    this.setDistinct(newValue);
                    return;
                case IAstPackage.VIEW_SELECT_SET__ALL:
                    this.setAll(newValue);
                    return;
            }
            SelectImpl.prototype.eSet.call(this,featureID,newValue);
        };
        ViewSelectSetImpl.prototype.eUnset = function(featureID) {
            switch (featureID) {
                case IAstPackage.VIEW_SELECT_SET__LEFT:
                    this.setLeft(null);
                    return;
                case IAstPackage.VIEW_SELECT_SET__RIGHT:
                    this.setRight(null);
                    return;
                case IAstPackage.VIEW_SELECT_SET__OPERATOR:
                    this.setOperator(ViewSelectSetImpl.OPERATOR_EDEFAULT);
                    return;
                case IAstPackage.VIEW_SELECT_SET__DISTINCT:
                    this.setDistinct(ViewSelectSetImpl.DISTINCT_EDEFAULT);
                    return;
                case IAstPackage.VIEW_SELECT_SET__ALL:
                    this.setAll(ViewSelectSetImpl.ALL_EDEFAULT);
                    return;
            }
            SelectImpl.prototype.eUnset.call(this,featureID);
        };
        ViewSelectSetImpl.prototype.eIsSet = function(featureID) {
            switch (featureID) {
                case IAstPackage.VIEW_SELECT_SET__LEFT:
                    return this.left != null;
                case IAstPackage.VIEW_SELECT_SET__RIGHT:
                    return this.right != null;
                case IAstPackage.VIEW_SELECT_SET__OPERATOR:
                    return ViewSelectSetImpl.OPERATOR_EDEFAULT == null ? this.operator != null : !ViewSelectSetImpl.OPERATOR_EDEFAULT===operator;
                case IAstPackage.VIEW_SELECT_SET__DISTINCT:
                    return ViewSelectSetImpl.DISTINCT_EDEFAULT == null ? this.distinct != null : !ViewSelectSetImpl.DISTINCT_EDEFAULT===distinct;
                case IAstPackage.VIEW_SELECT_SET__ALL:
                    return ViewSelectSetImpl.ALL_EDEFAULT == null ? this.all != null : !ViewSelectSetImpl.ALL_EDEFAULT===all;
            }
            return SelectImpl.prototype.eIsSet.call(this,featureID);
        };
        ViewSelectSetImpl.prototype.toString = function() {
            if (this.eIsProxy()) {
                return SelectImpl.prototype.toString.call(this);
            }
            var result=new StringBuffer(SelectImpl.prototype.toString.call(this));
            result.append(" (operator: ");
            result.append(operator);
            result.append(", distinct: ");
            result.append(distinct);
            result.append(", all: ");
            result.append(all);
            result.append(')');
            return result.toString();
        };
        return ViewSelectSetImpl;
    }
);
define(
    'commonddl/astmodel/ViewDefinitionImpl',["commonddl/astmodel/DdlStatementImpl","commonddl/astmodel/EObjectContainmentEList","commonddl/astmodel/ViewSelectImpl","commonddl/astmodel/ViewSelectSetImpl"], //dependencies
    function (DdlStatementImpl,EObjectContainmentEList,ViewSelectImpl,ViewSelectSetImpl) {
        ViewDefinitionImpl.prototype = Object.create(DdlStatementImpl.prototype);
        ViewDefinitionImpl.prototype.annotationList=null;
        ViewDefinitionImpl.prototype.select=null;
        ViewDefinitionImpl.prototype.selectSet=null;
        ViewDefinitionImpl.prototype.names=null;
        ViewDefinitionImpl.prototype.selects=null;
        ViewDefinitionImpl.SINGLE_SELECT_EDEFAULT=false;
        ViewDefinitionImpl.prototype.singleSelect=ViewDefinitionImpl.SINGLE_SELECT_EDEFAULT;
        ViewDefinitionImpl.prototype.parameters=null;
        function ViewDefinitionImpl() {
            DdlStatementImpl.call(this);
        }
        ViewDefinitionImpl.prototype.eStaticClass = function() {
            return IAstPackage.Literals.VIEW_DEFINITION;
        };
        ViewDefinitionImpl.prototype.getAnnotationList = function() {
            if (this.annotationList == null) {
                this.annotationList=[];
            }
            return this.annotationList;
        };
        ViewDefinitionImpl.prototype.getSelect = function() {
            return this.select;
        };
        ViewDefinitionImpl.prototype.isSingleSelect = function() {
            var sel=this.getSelect();
            if (sel != null) {
                var union=sel.getUnion();
                if (union != null) {
                    return false;
                }
            }
            return true;
        };
        ViewDefinitionImpl.prototype.getParameters = function() {
            if (this.parameters == null) {
                this.parameters=new EObjectContainmentEList(this);
            }
            return this.parameters;
        };
        ViewDefinitionImpl.prototype.retrieveColumnsForAllDataSources = function(progressMonitor) {
            var selects = this.getSelects();
            for (var selectCount=0;selectCount<selects.length;selectCount++) {
                var select=selects[selectCount];
                for (var dsCount=0;dsCount<select.getDataSources().length;dsCount++) {
                    var ds=select.getDataSources()[dsCount];
                    ds.retrieveColumns(progressMonitor,true);
                }
            }
        };
        ViewDefinitionImpl.prototype.retrieveLocalColumnsForAllDataSources = function() {
            var prnt=this.eContainer();
            if ((prnt == null) || (prnt instanceof CompilationUnitImpl)) {
                return false;
            }
            var allResolved=true;
            for (var selectCount=0;selectCount<this.getSelects().length;selectCount++) {
                var select=this.getSelects()[selectCount];
                for (var dsCount=0;dsCount<this.select.getDataSources().length;dsCount++) {
                    var ds=this.select.getDataSources()[dsCount];
                    if (!ds.retrieveLocalColumns()) {
                        allResolved=false;
                    }
                }
            }
            return allResolved;
        };
        ViewDefinitionImpl.prototype.basicSetSelect = function(newSelect,msgs) {
            var oldSelect=this.select;
            this.select=newSelect;
            this.select.setContainer(this);
            return msgs;
        };
        ViewDefinitionImpl.prototype.setSelect = function(newSelect) {
            if (newSelect != this.select) {
                var msgs=null;
                if (this.select != null) {

                }
                if (newSelect != null) {

                }
                msgs=this.basicSetSelect(newSelect,msgs);
                if (msgs != null) {
                    msgs.dispatch();
                }
            }
        };
        ViewDefinitionImpl.prototype.getSelectSet = function() {
            return this.selectSet;
        };
        ViewDefinitionImpl.prototype.basicSetSelectSet = function(newSelectSet,msgs) {
            var oldSelectSet=this.selectSet;
            this.selectSet=newSelectSet;
            this.selectSet.setContainer(this);
            return msgs;
        };
        ViewDefinitionImpl.prototype.setSelectSet = function(newSelectSet) {
            if (newSelectSet != this.selectSet) {
                var msgs=null;
                if (this.selectSet != null) {

                }
                if (newSelectSet != null) {

                }
                msgs=this.basicSetSelectSet(newSelectSet,msgs);
                if (msgs != null) {
                    msgs.dispatch();
                }
            }
        };
        ViewDefinitionImpl.prototype.getSelects = function() {
            if (this.selects == null) {
                this.selects=[];
                var select=this.getSelectSet();
                if (select == null) {
                    select=this.getSelect();
                }
                this.selects=this.selects.concat(this.getNestedSelects(select));
            }
            return this.selects;
        };
        ViewDefinitionImpl.prototype.getNestedSelects = function(select) {
            var result=[];
            if (select instanceof ViewSelectImpl) {
                var viewSelect=select;
                result.push(viewSelect);
                var union=viewSelect.getUnion();
                while (union != null) {
                    result.push(union);
                    union=union.getUnion();
                }
            }else if (select instanceof ViewSelectSetImpl) {
                var selectSet=select;
                var left=selectSet.getLeft();
                result=result.concat(this.getNestedSelects(left));
                var right=selectSet.getRight();
                result=result.concat(this.getNestedSelects(right));
            }
            return result;
        };
        ViewDefinitionImpl.prototype.isSingleSelect = function() {
            var allSelects=this.getSelects();
            return (allSelects.length <= 1);
        };
        ViewDefinitionImpl.prototype.getParameters = function() {
            if (this.parameters == null) {
                this.parameters=new EObjectContainmentEList(this);
            }
            return this.parameters;
        };
        ViewDefinitionImpl.prototype.getNames = function() {
            return this.names;
        };
        ViewDefinitionImpl.prototype.basicGetNames = function() {
            return this.names;
        };
        ViewDefinitionImpl.prototype.setNames = function(newNames) {
            var oldNames=this.names;
            this.names=newNames;
        };
        ViewDefinitionImpl.prototype.eInverseRemove = function(otherEnd,featureID,msgs) {
            switch (featureID) {
                case IAstPackage.VIEW_DEFINITION__SELECT:
                    return this.basicSetSelect(null,msgs);
                case IAstPackage.VIEW_DEFINITION__SELECT_SET:
                    return this.basicSetSelectSet(null,msgs);
                case IAstPackage.VIEW_DEFINITION__PARAMETERS:
                    return (this.getParameters()).basicRemove(otherEnd,msgs);
            }

        };
        ViewDefinitionImpl.prototype.eGet = function(featureID,resolve,coreType) {
            switch (featureID) {
                case IAstPackage.VIEW_DEFINITION__ANNOTATION_LIST:
                    return this.getAnnotationList();
                case IAstPackage.VIEW_DEFINITION__SELECT:
                    return this.getSelect();
                case IAstPackage.VIEW_DEFINITION__SELECT_SET:
                    return this.getSelectSet();
                case IAstPackage.VIEW_DEFINITION__NAMES:
                    if (resolve) {
                        return this.getNames();
                    }
                    return this.basicGetNames();
                case IAstPackage.VIEW_DEFINITION__SELECTS:
                    return this.getSelects();
                case IAstPackage.VIEW_DEFINITION__SINGLE_SELECT:
                    return this.isSingleSelect();
                case IAstPackage.VIEW_DEFINITION__PARAMETERS:
                    return this.getParameters();
            }
            return DdlStatementImpl.prototype.eGet.call(this,featureID,resolve,coreType);
        };
        ViewDefinitionImpl.prototype.eSet = function(featureID,newValue) {
        };
        ViewDefinitionImpl.prototype.eUnset = function(featureID) {
        };
        ViewDefinitionImpl.prototype.eIsSet = function(featureID) {
            switch (featureID) {
                case IAstPackage.VIEW_DEFINITION__ANNOTATION_LIST:
                    return this.annotationList != null && !this.annotationList.isEmpty();
                case IAstPackage.VIEW_DEFINITION__SELECT:
                    return this.select != null;
                case IAstPackage.VIEW_DEFINITION__SELECT_SET:
                    return this.selectSet != null;
                case IAstPackage.VIEW_DEFINITION__NAMES:
                    return this.names != null;
                case IAstPackage.VIEW_DEFINITION__SELECTS:
                    return this.selects != null && !this.selects.isEmpty();
                case IAstPackage.VIEW_DEFINITION__SINGLE_SELECT:
                    return this.singleSelect != ViewDefinitionImpl.SINGLE_SELECT_EDEFAULT;
                case IAstPackage.VIEW_DEFINITION__PARAMETERS:
                    return this.parameters != null && !this.parameters.isEmpty();
            }
            return DdlStatementImpl.prototype.eIsSet.call(this,featureID);
        };
        ViewDefinitionImpl.prototype.eBaseStructuralFeatureID = function(derivedFeatureID,baseClass) {
            if (baseClass == IAnnotated.class) {
                switch (derivedFeatureID) {
                    case IAstPackage.VIEW_DEFINITION__ANNOTATION_LIST:
                        return IAstPackage.ANNOTATED__ANNOTATION_LIST;
                    default :
                        return -1;
                }
            }
            return DdlStatementImpl.prototype.eBaseStructuralFeatureID.call(this,derivedFeatureID,baseClass);
        };
        ViewDefinitionImpl.prototype.eDerivedStructuralFeatureID = function(baseFeatureID,baseClass) {
            if (baseClass == IAnnotated.class) {
                switch (baseFeatureID) {
                    case IAstPackage.ANNOTATED__ANNOTATION_LIST:
                        return IAstPackage.VIEW_DEFINITION__ANNOTATION_LIST;
                    default :
                        return -1;
                }
            }
            return DdlStatementImpl.prototype.eDerivedStructuralFeatureID.call(this,baseFeatureID,baseClass);
        };
        ViewDefinitionImpl.prototype.toString = function() {
            if (this.eIsProxy()) {
                return DdlStatementImpl.prototype.toString.call(this);
            }
            var result=new StringBuffer(DdlStatementImpl.prototype.toString.call(this));
            result.append(" (singleSelect: ");
            result.append(singleSelect);
            result.append(')');
            return result.toString();
        };
        return ViewDefinitionImpl;
    }
);
define(
    'commonddl/astmodel/ColumnImpl',["commonddl/astmodel/EObjectImpl","require"], //dependencies
    function (EObjectImpl,require) {
        ColumnImpl.prototype = Object.create(EObjectImpl.prototype);
        ColumnImpl.NAME_EDEFAULT=null;
        ColumnImpl.SELECTED_EDEFAULT=null;
        ColumnImpl.prototype.selected=ColumnImpl.SELECTED_EDEFAULT;
        ColumnImpl.prototype.expressions=null;
        ColumnImpl.prototype.name="";
        function ColumnImpl() {
            EObjectImpl.call(this);
        }
        ColumnImpl.prototype.eStaticClass = function() {
            return IAstPackage.Literals.COLUMN;
        };
        ColumnImpl.prototype.getName = function() {
            return this.name;
        };
        ColumnImpl.prototype.getSelected = function() {
            return this.selected;
        };
        ColumnImpl.prototype.setSelected = function(newSelected) {
            var oldSelected=this.selected;
            this.selected=newSelected;
        };
        ColumnImpl.prototype.getExpressions = function() {
            var ViewSelectImpl = require("commonddl/astmodel/ViewSelectImpl");
            if (this.expressions == null) {
                this.expressions=[];//new EObjectEList<IPathExpression>(IPathExpression.class,this,IAstPackage.COLUMN__EXPRESSIONS);
                var prnt=this;
                while (prnt != null) {
                    if (prnt instanceof ViewSelectImpl) {
                        (prnt).computeAllExpressionColumns();
                    }
                    prnt=prnt.eContainer();
                }
            }
            return this.expressions;
        };
        ColumnImpl.prototype.eGet = function(featureID,resolve,coreType) {
            switch (featureID) {
                case IAstPackage.COLUMN__NAME:
                    return this.getName();
                case IAstPackage.COLUMN__SELECTED:
                    return this.getSelected();
                case IAstPackage.COLUMN__EXPRESSIONS:
                    return this.getExpressions();
            }
            return EObjectImpl.prototype.eGet.call(this,featureID,resolve,coreType);
        };
        ColumnImpl.prototype.eSet = function(featureID,newValue) {
            switch (featureID) {
                case IAstPackage.COLUMN__SELECTED:
                    this.setSelected(newValue);
                    return;
            }
            EObjectImpl.prototype.eSet.call(this,featureID,newValue);
        };
        ColumnImpl.prototype.eUnset = function(featureID) {
            switch (featureID) {
                case IAstPackage.COLUMN__SELECTED:
                    this.setSelected(ColumnImpl.SELECTED_EDEFAULT);
                    return;
                case IAstPackage.COLUMN__EXPRESSIONS:
                    this.expressions=null;
                    return;
            }
            EObjectImpl.prototype.eUnset.call(this,featureID);
        };
        ColumnImpl.prototype.eIsSet = function(featureID) {
            switch (featureID) {
                case IAstPackage.COLUMN__NAME:
                    return ColumnImpl.NAME_EDEFAULT == null ? this.getName() != null : !NAME_EDEFAULT===this.getName();
                case IAstPackage.COLUMN__SELECTED:
                    return ColumnImpl.SELECTED_EDEFAULT == null ? this.selected != null : !SELECTED_EDEFAULT.equals(selected);
                case IAstPackage.COLUMN__EXPRESSIONS:
                    return this.expressions != null && !this.expressions.isEmpty();
            }
            return EObjectImpl.prototype.eIsSet.call(this,featureID);
        };
        ColumnImpl.prototype.toString = function() {
            if (this.eIsProxy()) {
                return EObjectImpl.prototype.toString.call(this);
            }
            var result=new StringBuffer(EObjectImpl.prototype.toString.call(this));
            result.append(" (selected: ");
            result.append(selected);
            result.append(')');
            return result.toString();
        };
        return ColumnImpl;
    }
);
define(
    'commonddl/astmodel/DataSourceAssociationImpl',["rndrt/rnd","commonddl/astmodel/EObjectImpl","require"], //dependencies
    function (rnd,EObjectImpl,require) {

        var StringBuffer = rnd.StringBuffer;
        DataSourceAssociationImpl.prototype = Object.create(EObjectImpl.prototype);
        DataSourceAssociationImpl.NAME_EDEFAULT=null;
        DataSourceAssociationImpl.prototype.name=DataSourceAssociationImpl.NAME_EDEFAULT;
        DataSourceAssociationImpl.CARDINALITIES_EDEFAULT=null;
        DataSourceAssociationImpl.prototype.cardinalities=DataSourceAssociationImpl.CARDINALITIES_EDEFAULT;
        DataSourceAssociationImpl.TARGET_NAME_EDEFAULT=null;
        DataSourceAssociationImpl.prototype.targetName=DataSourceAssociationImpl.TARGET_NAME_EDEFAULT;
        DataSourceAssociationImpl.prototype.targetStmt=null;
        DataSourceAssociationImpl.prototype.expressions=null;
        function DataSourceAssociationImpl() {
            EObjectImpl.call(this);
        }
        DataSourceAssociationImpl.prototype.eStaticClass = function() {
            return IAstPackage.Literals.DATA_SOURCE_ASSOCIATION;
        };
        DataSourceAssociationImpl.prototype.getName = function() {
            return this.name;
        };
        DataSourceAssociationImpl.prototype.setName = function(newName) {
            var oldName=this.name;
            this.name=newName;
        };
        DataSourceAssociationImpl.prototype.getCardinalities = function() {
            return this.cardinalities;
        };
        DataSourceAssociationImpl.prototype.setCardinalities = function(newCardinalities) {
            var oldCardinalities=this.cardinalities;
            this.cardinalities=newCardinalities;
        };
        DataSourceAssociationImpl.prototype.getTargetName = function() {
            return this.targetName;
        };
        DataSourceAssociationImpl.prototype.setTargetName = function(newTargetName) {
            var oldTargetName=this.targetName;
            this.targetName=newTargetName;
        };
        DataSourceAssociationImpl.prototype.getTargetStmt = function() {
            return this.targetStmt;
        };
        DataSourceAssociationImpl.prototype.basicSetTargetStmt = function(newTargetStmt,msgs) {
            var oldTargetStmt=this.targetStmt;
            this.targetStmt=newTargetStmt;
            this.targetStmt.setContainer(this);
            return msgs;
        };
        DataSourceAssociationImpl.prototype.setTargetStmt = function(newTargetStmt) {
            if (newTargetStmt != this.targetStmt) {
                var msgs=null;
                if (this.targetStmt != null) {

                }
                if (newTargetStmt != null) {

                }
                msgs=this.basicSetTargetStmt(newTargetStmt,msgs);
                if (msgs != null) {
                    msgs.dispatch();
                }
            }
        };
        DataSourceAssociationImpl.prototype.getExpressions = function() {
            var ViewSelectImpl=require("commonddl/astmodel/ViewSelectImpl");
            if (this.expressions == null) {
                this.expressions=[];//new EObjectEList<IPathExpression>(IPathExpression.class,this,IAstPackage.DATA_SOURCE_ASSOCIATION__EXPRESSIONS);
                var prnt=this;
                while (prnt != null) {
                    if (prnt instanceof ViewSelectImpl) {
                        (prnt).computeAllExpressionAssociations();
                    }
                    prnt=prnt.eContainer();
                }
            }
            return this.expressions;
        };
        DataSourceAssociationImpl.prototype.eInverseRemove = function(otherEnd,featureID,msgs) {
            switch (featureID) {
                case IAstPackage.DATA_SOURCE_ASSOCIATION__TARGET_STMT:
                    return this.basicSetTargetStmt(null,msgs);
            }

        };
        DataSourceAssociationImpl.prototype.eGet = function(featureID,resolve,coreType) {
            switch (featureID) {
                case IAstPackage.DATA_SOURCE_ASSOCIATION__NAME:
                    return this.getName();
                case IAstPackage.DATA_SOURCE_ASSOCIATION__CARDINALITIES:
                    return this.getCardinalities();
                case IAstPackage.DATA_SOURCE_ASSOCIATION__TARGET_NAME:
                    return this.getTargetName();
                case IAstPackage.DATA_SOURCE_ASSOCIATION__TARGET_STMT:
                    return this.getTargetStmt();
                case IAstPackage.DATA_SOURCE_ASSOCIATION__EXPRESSIONS:
                    return this.getExpressions();
            }
            return EObjectImpl.prototype.eGet.call(this,featureID,resolve,coreType);
        };
        DataSourceAssociationImpl.prototype.eSet = function(featureID,newValue) {
            switch (featureID) {
                case IAstPackage.DATA_SOURCE_ASSOCIATION__NAME:
                    this.setName(newValue);
                    return;
                case IAstPackage.DATA_SOURCE_ASSOCIATION__CARDINALITIES:
                    this.setCardinalities(newValue);
                    return;
                case IAstPackage.DATA_SOURCE_ASSOCIATION__TARGET_NAME:
                    this.setTargetName(newValue);
                    return;
                case IAstPackage.DATA_SOURCE_ASSOCIATION__TARGET_STMT:
                    this.setTargetStmt(newValue);
                    return;
            }
            EObjectImpl.prototype.eSet.call(this,featureID,newValue);
        };
        DataSourceAssociationImpl.prototype.eUnset = function(featureID) {
            switch (featureID) {
                case IAstPackage.DATA_SOURCE_ASSOCIATION__NAME:
                    this.setName(DataSourceAssociationImpl.NAME_EDEFAULT);
                    return;
                case IAstPackage.DATA_SOURCE_ASSOCIATION__TARGET_NAME:
                    this.setTargetName(DataSourceAssociationImpl.TARGET_NAME_EDEFAULT);
                    return;
                case IAstPackage.DATA_SOURCE_ASSOCIATION__TARGET_STMT:
                    this.setTargetStmt(null);
                    return;
                case IAstPackage.DATA_SOURCE_ASSOCIATION__EXPRESSIONS:
                    this.expressions=null;
                    return;
            }
            EObjectImpl.prototype.eUnset.call(this,featureID);
        };
        DataSourceAssociationImpl.prototype.eIsSet = function(featureID) {
            switch (featureID) {
                case IAstPackage.DATA_SOURCE_ASSOCIATION__NAME:
                    return DataSourceAssociationImpl.NAME_EDEFAULT == null ? this.name != null : !NAME_EDEFAULT===name;
                case IAstPackage.DATA_SOURCE_ASSOCIATION__CARDINALITIES:
                    return DataSourceAssociationImpl.CARDINALITIES_EDEFAULT == null ? this.cardinalities != null : !CARDINALITIES_EDEFAULT===cardinalities;
                case IAstPackage.DATA_SOURCE_ASSOCIATION__TARGET_NAME:
                    return DataSourceAssociationImpl.TARGET_NAME_EDEFAULT == null ? this.targetName != null : !TARGET_NAME_EDEFAULT===targetName;
                case IAstPackage.DATA_SOURCE_ASSOCIATION__TARGET_STMT:
                    return this.targetStmt != null;
                case IAstPackage.DATA_SOURCE_ASSOCIATION__EXPRESSIONS:
                    return this.expressions != null && !this.expressions.isEmpty();
            }
            return EObjectImpl.prototype.eIsSet.call(this,featureID);
        };
        DataSourceAssociationImpl.prototype.toString = function() {
            if (this.eIsProxy()) {
                return EObjectImpl.prototype.toString.call(this);
            }
            var result=new StringBuffer(EObjectImpl.prototype.toString.call(this));
            result.append(" (name: ");
            result.append(name);
            result.append(", cardinalities: ");
            result.append(cardinalities);
            result.append(", targetName: ");
            result.append(targetName);
            result.append(')');
            return result.toString();
        };
        return DataSourceAssociationImpl;
    }
);
define(
    'commonddl/astmodel/PathEntryImpl',["commonddl/astmodel/EObjectImpl"], //dependencies
    function (EObjectImpl) {
        PathEntryImpl.prototype = Object.create(EObjectImpl.prototype);
        PathEntryImpl.NAME_TOKEN_EDEFAULT=null;
        PathEntryImpl.prototype.nameToken=PathEntryImpl.NAME_TOKEN_EDEFAULT;
        PathEntryImpl.prototype.filter=null;
        function PathEntryImpl() {
            EObjectImpl.call(this);
        }
        PathEntryImpl.prototype.eStaticClass = function() {
            return IAstPackage.Literals.PATH_ENTRY;
        };
        PathEntryImpl.prototype.getNameToken = function() {
            return this.nameToken;
        };
        PathEntryImpl.prototype.setNameToken = function(newNameToken) {
            var oldNameToken=this.nameToken;
            this.nameToken=newNameToken;
        };
        PathEntryImpl.prototype.getFilter = function() {
            return this.filter;
        };
        PathEntryImpl.prototype.basicSetFilter = function(newFilter,msgs) {
            var oldFilter=this.filter;
            this.filter=newFilter;
            this.filter.setContainer(this);
            return msgs;
        };
        PathEntryImpl.prototype.setFilter = function(newFilter) {
            if (newFilter != this.filter) {
                var msgs=null;
                if (this.filter != null) {

                }
                if (newFilter != null) {

                }
                msgs=this.basicSetFilter(newFilter,msgs);
                if (msgs != null) {
                    msgs.dispatch();
                }
            }
        };
        PathEntryImpl.prototype.eInverseRemove = function(otherEnd,featureID,msgs) {
            switch (featureID) {
                case IAstPackage.PATH_ENTRY__FILTER:
                    return this.basicSetFilter(null,msgs);
            }

        };
        PathEntryImpl.prototype.eGet = function(featureID,resolve,coreType) {
            switch (featureID) {
                case IAstPackage.PATH_ENTRY__NAME_TOKEN:
                    return this.getNameToken();
                case IAstPackage.PATH_ENTRY__FILTER:
                    return this.getFilter();
            }
            return EObjectImpl.prototype.eGet.call(this,featureID,resolve,coreType);
        };
        PathEntryImpl.prototype.eSet = function(featureID,newValue) {
            switch (featureID) {
                case IAstPackage.PATH_ENTRY__NAME_TOKEN:
                    this.setNameToken(newValue);
                    return;
                case IAstPackage.PATH_ENTRY__FILTER:
                    this.setFilter(newValue);
                    return;
            }
            EObjectImpl.prototype.eSet.call(this,featureID,newValue);
        };
        PathEntryImpl.prototype.eUnset = function(featureID) {
            switch (featureID) {
                case IAstPackage.PATH_ENTRY__NAME_TOKEN:
                    this.setNameToken(PathEntryImpl.NAME_TOKEN_EDEFAULT);
                    return;
                case IAstPackage.PATH_ENTRY__FILTER:
                    this.setFilter(null);
                    return;
            }
            EObjectImpl.prototype.eUnset.call(this,featureID);
        };
        PathEntryImpl.prototype.eIsSet = function(featureID) {
            switch (featureID) {
                case IAstPackage.PATH_ENTRY__NAME_TOKEN:
                    return PathEntryImpl.NAME_TOKEN_EDEFAULT == null ? this.nameToken != null : !NAME_TOKEN_EDEFAULT.equals(nameToken);
                case IAstPackage.PATH_ENTRY__FILTER:
                    return this.filter != null;
            }
            return EObjectImpl.prototype.eIsSet.call(this,featureID);
        };
        PathEntryImpl.prototype.toString = function() {
            if (this.eIsProxy()) {
                return EObjectImpl.prototype.toString.call(this);
            }
            var result=new StringBuffer(EObjectImpl.prototype.toString.call(this));
            result.append(" (nameToken: ");
            result.append(nameToken);
            result.append(')');
            return result.toString();
        };
        return PathEntryImpl;
    }
);
define(
    'commonddl/astmodel/SelectListImpl',["commonddl/astmodel/SourceRangeImpl","commonddl/astmodel/EObjectContainmentEList"], //dependencies
    function (SourceRangeImpl,EObjectContainmentEList) {
        SelectListImpl.prototype = Object.create(SourceRangeImpl.prototype);
        SelectListImpl.prototype.entries=null;
        function SelectListImpl() {
            SourceRangeImpl.call(this);
        }
        SelectListImpl.prototype.eStaticClass = function() {
            return IAstPackage.Literals.SELECT_LIST;
        };
        SelectListImpl.prototype.getEntries = function() {
            if (this.entries == null) {
                this.entries=new EObjectContainmentEList(this);
            }
            return this.entries;
        };
        SelectListImpl.prototype.getEntry = function(selectListEntry) {
            throw new UnsupportedOperationException();
        };
        SelectListImpl.prototype.addEntry2 = function(selectListEntry,entry) {
            throw new UnsupportedOperationException();
        };
        SelectListImpl.prototype.addEntry1 = function(entry) {
            if (entry == null) {
                return;
            }
            this.getEntries().push(entry);
        };
        SelectListImpl.prototype.eInverseRemove = function(otherEnd,featureID,msgs) {
            switch (featureID) {
                case IAstPackage.SELECT_LIST__ENTRIES:
                    return (this.getEntries()).basicRemove(otherEnd,msgs);
            }

        };
        SelectListImpl.prototype.eGet = function(featureID,resolve,coreType) {
            switch (featureID) {
                case IAstPackage.SELECT_LIST__ENTRIES:
                    return this.getEntries();
            }
            return SourceRangeImpl.prototype.eGet.call(this,featureID,resolve,coreType);
        };
        SelectListImpl.prototype.eSet = function(featureID,newValue) {

        };
        SelectListImpl.prototype.eUnset = function(featureID) {

        };
        SelectListImpl.prototype.eIsSet = function(featureID) {
            switch (featureID) {
                case IAstPackage.SELECT_LIST__ENTRIES:
                    return this.entries != null && !this.entries.isEmpty();
            }
            return SourceRangeImpl.prototype.eIsSet.call(this,featureID);
        };
        return SelectListImpl;
    }
);
define(
    'commonddl/astmodel/SelectListEntryImpl',[
        "commonddl/astmodel/SourceRangeImpl",
        "commonddl/astmodel/SelectListEntryType","commonddl/astmodel/SelectListImpl","commonddl/astmodel/ViewSelectImpl","commonddl/astmodel/ViewDefinitionImpl","require"
    ], //dependencies
    function (SourceRangeImpl,SelectListEntryType,SelectListImpl,ViewSelectImpl,ViewDefinitionImpl,require) {
        SelectListEntryImpl.prototype = Object.create(SourceRangeImpl.prototype);
        SelectListEntryImpl.prototype.annotationList=null;
        SelectListEntryImpl.ALIAS_EDEFAULT=null;
        SelectListEntryImpl.ALIAS_TOKEN_EDEFAULT=null;
        SelectListEntryImpl.prototype.aliasToken=SelectListEntryImpl.ALIAS_TOKEN_EDEFAULT;
        SelectListEntryImpl.prototype.expression=null;
        SelectListEntryImpl.KEY_TOKEN_EDEFAULT=null;
        SelectListEntryImpl.prototype.keyToken=SelectListEntryImpl.KEY_TOKEN_EDEFAULT;
        SelectListEntryImpl.TYPE_EDEFAULT=SelectListEntryType.UNKOWN;
        SelectListEntryImpl.prototype.type=SelectListEntryImpl.TYPE_EDEFAULT;
        SelectListEntryImpl.PUBLIC_NAME_EDEFAULT=null;
        function SelectListEntryImpl() {
            SourceRangeImpl.call(this);
        }
        SelectListEntryImpl.prototype.eStaticClass = function() {
            return IAstPackage.Literals.SELECT_LIST_ENTRY;
        };
        SelectListEntryImpl.prototype.getAnnotationList = function() {
            if (this.annotationList == null) {
                this.annotationList=[];
            }
            return this.annotationList;
        };
        SelectListEntryImpl.prototype.getAlias = function() {
            var at=this.getAliasToken();
            if (at != null) {
                return at.m_lexem;
            }
            return null;
        };
        SelectListEntryImpl.prototype.getAliasToken = function() {
            return this.aliasToken;
        };
        SelectListEntryImpl.prototype.setAliasToken = function(newAliasToken) {
            var oldAliasToken=this.aliasToken;
            this.aliasToken=newAliasToken;
        };
        SelectListEntryImpl.prototype.getExpression = function() {
            return this.expression;
        };
        SelectListEntryImpl.prototype.basicSetExpression = function(newExpression,msgs) {
            var oldExpression=this.expression;
            this.expression=newExpression;
            this.expression.setContainer(this);
            return msgs;
        };
        SelectListEntryImpl.prototype.setExpression = function(newExpression) {
            var oldExpression=this.expression;
            this.expression=newExpression;
            this.expression.setParent(this);
        };
        SelectListEntryImpl.prototype.getKeyToken = function() {
            return this.keyToken;
        };
        SelectListEntryImpl.prototype.setKeyToken = function(newKeyToken) {
            var oldKeyToken=this.keyToken;
            this.keyToken=newKeyToken;
        };
        SelectListEntryImpl.prototype.getType = function() {
            return this.type;
        };
        SelectListEntryImpl.prototype.setType = function(newType) {
            var oldType=this.type;
            this.type=newType == null ? TYPE_EDEFAULT : newType;
        };
        SelectListEntryImpl.prototype.getPublicName = function() {
            var prnt=this.eContainer();
            if (prnt instanceof SelectListImpl) {
                var prnt2=prnt.eContainer();
                if (prnt2 instanceof ViewSelectImpl) {
                    var prnt3=prnt2.eContainer();
                    while ((prnt3 != null) && !(prnt3 instanceof ViewDefinitionImpl)) {
                        prnt3=prnt3.eContainer();
                    }
                    if (prnt3 instanceof ViewDefinitionImpl) {
                        var names=(prnt3).getNames();
                        if (names != null) {
                            var list=names.getViewColumnNames();
                            if (list != null) {
                                var entries=(prnt).getEntries();
                                var index=entries.indexOf(this);
                                if (list.length >= index + 1) {
                                    var coln=list[index];
                                    if (coln != null) {
                                        return coln.getName();
                                    }
                                }
                            }
                        }
                    }
                }
            }
            var alias=this.getAlias();
            if ((alias != null) && alias.length>0) {
                return alias;
            }
            var expr=this.getExpression();
            var PathExpressionImpl = require("commonddl/astmodel/PathExpressionImpl");
            if (expr instanceof PathExpressionImpl) {
                return (expr).getPathString(false);
            }
            return this.getExpression().getShortDescription();
        };
        SelectListEntryImpl.prototype.eInverseRemove = function(otherEnd,featureID,msgs) {
            switch (featureID) {
                case IAstPackage.SELECT_LIST_ENTRY__EXPRESSION:
                    return this.basicSetExpression(null,msgs);
            }

        };
        SelectListEntryImpl.prototype.eGet = function(featureID,resolve,coreType) {
            switch (featureID) {
                case IAstPackage.SELECT_LIST_ENTRY__ANNOTATION_LIST:
                    return this.getAnnotationList();
                case IAstPackage.SELECT_LIST_ENTRY__ALIAS:
                    return this.getAlias();
                case IAstPackage.SELECT_LIST_ENTRY__ALIAS_TOKEN:
                    return this.getAliasToken();
                case IAstPackage.SELECT_LIST_ENTRY__EXPRESSION:
                    return this.getExpression();
                case IAstPackage.SELECT_LIST_ENTRY__KEY_TOKEN:
                    return this.getKeyToken();
                case IAstPackage.SELECT_LIST_ENTRY__TYPE:
                    return this.getType();
                case IAstPackage.SELECT_LIST_ENTRY__PUBLIC_NAME:
                    return this.getPublicName();
            }
            return SourceRangeImpl.prototype.eGet.call(this,featureID,resolve,coreType);
        };
        SelectListEntryImpl.prototype.eSet = function(featureID,newValue) {

        };
        SelectListEntryImpl.prototype.eUnset = function(featureID) {

        };
        SelectListEntryImpl.prototype.eIsSet = function(featureID) {
            switch (featureID) {
                case IAstPackage.SELECT_LIST_ENTRY__ANNOTATION_LIST:
                    return this.annotationList != null && !this.annotationList.isEmpty();
                case IAstPackage.SELECT_LIST_ENTRY__ALIAS:
                    return SelectListEntryImpl.ALIAS_EDEFAULT == null ? this.getAlias() != null : !ALIAS_EDEFAULT===this.getAlias();
                case IAstPackage.SELECT_LIST_ENTRY__ALIAS_TOKEN:
                    return SelectListEntryImpl.ALIAS_TOKEN_EDEFAULT == null ? this.aliasToken != null : !ALIAS_TOKEN_EDEFAULT.equals(aliasToken);
                case IAstPackage.SELECT_LIST_ENTRY__EXPRESSION:
                    return this.expression != null;
                case IAstPackage.SELECT_LIST_ENTRY__KEY_TOKEN:
                    return SelectListEntryImpl.KEY_TOKEN_EDEFAULT == null ? this.keyToken != null : !KEY_TOKEN_EDEFAULT.equals(keyToken);
                case IAstPackage.SELECT_LIST_ENTRY__TYPE:
                    return this.type != SelectListEntryImpl.TYPE_EDEFAULT;
                case IAstPackage.SELECT_LIST_ENTRY__PUBLIC_NAME:
                    return SelectListEntryImpl.PUBLIC_NAME_EDEFAULT == null ? this.getPublicName() != null : !PUBLIC_NAME_EDEFAULT===this.getPublicName();
            }
            return SourceRangeImpl.prototype.eIsSet.call(this,featureID);
        };
        SelectListEntryImpl.prototype.eBaseStructuralFeatureID = function(derivedFeatureID,baseClass) {
            if (baseClass == IAnnotated.class) {
                switch (derivedFeatureID) {
                    case IAstPackage.SELECT_LIST_ENTRY__ANNOTATION_LIST:
                        return IAstPackage.ANNOTATED__ANNOTATION_LIST;
                    default :
                        return -1;
                }
            }
            return SourceRangeImpl.prototype.eBaseStructuralFeatureID.call(this,derivedFeatureID,baseClass);
        };
        SelectListEntryImpl.prototype.eDerivedStructuralFeatureID = function(baseFeatureID,baseClass) {
            if (baseClass == IAnnotated.class) {
                switch (baseFeatureID) {
                    case IAstPackage.ANNOTATED__ANNOTATION_LIST:
                        return IAstPackage.SELECT_LIST_ENTRY__ANNOTATION_LIST;
                    default :
                        return -1;
                }
            }
            return SourceRangeImpl.prototype.eDerivedStructuralFeatureID.call(this,baseFeatureID,baseClass);
        };
        SelectListEntryImpl.prototype.toString = function() {
            var result=new StringBuffer();
            result.append(" (aliasToken: ");
            result.append(this.aliasToken);
            result.append(')');
            result.append(" (expression: ");
            result.append(this.getExpression());
            result.append(')');
            return result.toString();
        };
        return SelectListEntryImpl;
    }
);
define(
    'commonddl/astmodel/ExpressionImpl',["commonddl/astmodel/SourceRangeImpl","commonddl/astmodel/SelectListEntryImpl"], //dependencies
    function (SourceRangeImpl,SelectListEntryImpl) {
        ExpressionImpl.prototype = Object.create(SourceRangeImpl.prototype);
        ExpressionImpl.PARENT_EDEFAULT=null;
        ExpressionImpl.prototype.parent=ExpressionImpl.PARENT_EDEFAULT;
        ExpressionImpl.SHORT_DESCRIPTION_EDEFAULT=null;
        ExpressionImpl.prototype.shortDescription=ExpressionImpl.SHORT_DESCRIPTION_EDEFAULT;
        function ExpressionImpl() {
            SourceRangeImpl.call(this);
        }
        ExpressionImpl.prototype.eStaticClass = function() {
            return IAstPackage.Literals.EXPRESSION;
        };
        ExpressionImpl.prototype.eContainer = function() {
            var container=SourceRangeImpl.prototype.eContainer.call(this);
            if (container != null) {
                return container;
            }
            var parent=this.getParent();
            if (parent instanceof SelectListEntryImpl) {
                if (this===(parent).getExpression()) {
                    return this.parent;
                }
            }
            return null;
        };
        ExpressionImpl.prototype.getParent = function() {
            return this.parent;
        };
        ExpressionImpl.prototype.setParent = function(newParent) {
            var oldParent=this.parent;
            this.parent=newParent;
        };
        ExpressionImpl.prototype.getShortDescription = function() {
            if (this.shortDescription == null) {
                var start=this.getStartOffset();
                var end=this.getEndOffset();
                var cu=SourceRangeImpl.getCompilationUnit(this);
                this.shortDescription=cu.getParsedSource().substring(start,end);
            }
            return this.shortDescription;
        };
        ExpressionImpl.prototype.eGet = function(featureID,resolve,coreType) {
            switch (featureID) {
                case IAstPackage.EXPRESSION__PARENT:
                    return this.getParent();
                case IAstPackage.EXPRESSION__SHORT_DESCRIPTION:
                    return this.getShortDescription();
            }
            return SourceRangeImpl.prototype.eGet.call(this,featureID,resolve,coreType);
        };
        ExpressionImpl.prototype.eSet = function(featureID,newValue) {
            switch (featureID) {
                case IAstPackage.EXPRESSION__PARENT:
                    this.setParent(newValue);
                    return;
            }
            SourceRangeImpl.prototype.eSet.call(this,featureID,newValue);
        };
        ExpressionImpl.prototype.eUnset = function(featureID) {
            switch (featureID) {
                case IAstPackage.EXPRESSION__PARENT:
                    this.setParent(ExpressionImpl.PARENT_EDEFAULT);
                    return;
            }
            SourceRangeImpl.prototype.eUnset.call(this,featureID);
        };
        ExpressionImpl.prototype.eIsSet = function(featureID) {
            switch (featureID) {
                case IAstPackage.EXPRESSION__PARENT:
                    return ExpressionImpl.PARENT_EDEFAULT == null ? this.parent != null : !PARENT_EDEFAULT===parent;
                case IAstPackage.EXPRESSION__SHORT_DESCRIPTION:
                    return ExpressionImpl.SHORT_DESCRIPTION_EDEFAULT == null ? this.shortDescription != null : !SHORT_DESCRIPTION_EDEFAULT===shortDescription;
            }
            return SourceRangeImpl.prototype.eIsSet.call(this,featureID);
        };
        ExpressionImpl.prototype.toString = function() {
            return SourceRangeImpl.prototype.toString.call(this);
        };
        ExpressionImpl.getFirstNonExpressionContainer = function(expr) {
            var prnt=expr;
            while ((prnt != null) && (prnt instanceof ExpressionImpl)) {
                prnt=prnt.eContainer();
            }
            return prnt;
        };
        return ExpressionImpl;
    }
);
define(
    'commonddl/astmodel/CompExpressionImpl',["commonddl/astmodel/ExpressionImpl"], //dependencies
    function (ExpressionImpl) {
        CompExpressionImpl.prototype = Object.create(ExpressionImpl.prototype);
        CompExpressionImpl.TYPE_EDEFAULT=null;
        CompExpressionImpl.TYPE_TOKEN_EDEFAULT=null;
        CompExpressionImpl.prototype.typeToken=CompExpressionImpl.TYPE_TOKEN_EDEFAULT;
        CompExpressionImpl.prototype.left=null;
        CompExpressionImpl.prototype.right=null;
        function CompExpressionImpl() {
            ExpressionImpl.call(this);
        }
        CompExpressionImpl.prototype.eStaticClass = function() {
            return IAstPackage.Literals.COMP_EXPRESSION;
        };
        CompExpressionImpl.prototype.getType = function() {
            var tt=this.getTypeToken();
            if (tt != null) {
                return tt.m_lexem;
            }
            return null;
        };
        CompExpressionImpl.prototype.getTypeToken = function() {
            return this.typeToken;
        };
        CompExpressionImpl.prototype.setTypeToken = function(newTypeToken) {
            var oldTypeToken=this.typeToken;
            this.typeToken=newTypeToken;
        };
        CompExpressionImpl.prototype.getLeft = function() {
            return this.left;
        };
        CompExpressionImpl.prototype.basicSetLeft = function(newLeft,msgs) {
            var oldLeft=this.left;
            this.left=newLeft;
            this.left.setContainer(this);
            return msgs;
        };
        CompExpressionImpl.prototype.setLeft = function(newLeft) {
            if (newLeft != this.left) {
                var msgs=null;
                if (this.left != null) {

                }
                if (newLeft != null) {

                }
                msgs=this.basicSetLeft(newLeft,msgs);
                if (msgs != null) {
                    msgs.dispatch();
                }
            }
        };
        CompExpressionImpl.prototype.getRight = function() {
            return this.right;
        };
        CompExpressionImpl.prototype.basicSetRight = function(newRight,msgs) {
            var oldRight=this.right;
            this.right=newRight;
            this.right.setContainer(this);
            return msgs;
        };
        CompExpressionImpl.prototype.setRight = function(newRight) {
            if (newRight != this.right) {
                var msgs=null;
                if (this.right != null) {

                }
                if (newRight != null) {

                }
                msgs=this.basicSetRight(newRight,msgs);
                if (msgs != null) {
                    msgs.dispatch();
                }
            }
        };
        CompExpressionImpl.prototype.eInverseRemove = function(otherEnd,featureID,msgs) {
            switch (featureID) {
                case IAstPackage.COMP_EXPRESSION__LEFT:
                    return this.basicSetLeft(null,msgs);
                case IAstPackage.COMP_EXPRESSION__RIGHT:
                    return this.basicSetRight(null,msgs);
            }

        };
        CompExpressionImpl.prototype.eGet = function(featureID,resolve,coreType) {
            switch (featureID) {
                case IAstPackage.COMP_EXPRESSION__TYPE:
                    return this.getType();
                case IAstPackage.COMP_EXPRESSION__TYPE_TOKEN:
                    return this.getTypeToken();
                case IAstPackage.COMP_EXPRESSION__LEFT:
                    return this.getLeft();
                case IAstPackage.COMP_EXPRESSION__RIGHT:
                    return this.getRight();
            }
            return ExpressionImpl.prototype.eGet.call(this,featureID,resolve,coreType);
        };
        CompExpressionImpl.prototype.eSet = function(featureID,newValue) {
            switch (featureID) {
                case IAstPackage.COMP_EXPRESSION__TYPE_TOKEN:
                    this.setTypeToken(newValue);
                    return;
                case IAstPackage.COMP_EXPRESSION__LEFT:
                    this.setLeft(newValue);
                    return;
                case IAstPackage.COMP_EXPRESSION__RIGHT:
                    this.setRight(newValue);
                    return;
            }
            ExpressionImpl.prototype.eSet.call(this,featureID,newValue);
        };
        CompExpressionImpl.prototype.eUnset = function(featureID) {
            switch (featureID) {
                case IAstPackage.COMP_EXPRESSION__TYPE_TOKEN:
                    this.setTypeToken(CompExpressionImpl.TYPE_TOKEN_EDEFAULT);
                    return;
                case IAstPackage.COMP_EXPRESSION__LEFT:
                    this.setLeft(null);
                    return;
                case IAstPackage.COMP_EXPRESSION__RIGHT:
                    this.setRight(null);
                    return;
            }
            ExpressionImpl.prototype.eUnset.call(this,featureID);
        };
        CompExpressionImpl.prototype.eIsSet = function(featureID) {
            switch (featureID) {
                case IAstPackage.COMP_EXPRESSION__TYPE:
                    return CompExpressionImpl.TYPE_EDEFAULT == null ? this.getType() != null : !TYPE_EDEFAULT===this.getType();
                case IAstPackage.COMP_EXPRESSION__TYPE_TOKEN:
                    return CompExpressionImpl.TYPE_TOKEN_EDEFAULT == null ? this.typeToken != null : !TYPE_TOKEN_EDEFAULT.equals(typeToken);
                case IAstPackage.COMP_EXPRESSION__LEFT:
                    return this.left != null;
                case IAstPackage.COMP_EXPRESSION__RIGHT:
                    return this.right != null;
            }
            return ExpressionImpl.prototype.eIsSet.call(this,featureID);
        };
        CompExpressionImpl.prototype.toString = function() {
            return this.left.toString() + " " + this.getTypeToken().m_lexem+ " "+ this.right.toString();
        };
        return CompExpressionImpl;
    }
);
define(
    'commonddl/astmodel/PreAnnotationImpl',["commonddl/astmodel/AbstractAnnotationImpl"], //dependencies
    function (AbstractAnnotationImpl) {
        PreAnnotationImpl.prototype = Object.create(AbstractAnnotationImpl.prototype);
        function PreAnnotationImpl() {
            AbstractAnnotationImpl.call(this);
        }
        PreAnnotationImpl.prototype.eStaticClass = function() {
            return IAstPackage.Literals.PRE_ANNOTATION;
        };
        return PreAnnotationImpl;
    }
);
define(
    'commonddl/astmodel/ViewExtendImpl',["commonddl/astmodel/DdlStatementImpl"], //dependencies
    function (DdlStatementImpl) {
        ViewExtendImpl.prototype = Object.create(DdlStatementImpl.prototype);
        ViewExtendImpl.prototype.annotationList=null;
        ViewExtendImpl.prototype.selectList=null;
        ViewExtendImpl.EXTENDED_VIEW_NAME_EDEFAULT=null;
        ViewExtendImpl.EXTENDED_VIEW_NAME_TOKEN_EDEFAULT=null;
        ViewExtendImpl.prototype.extendedViewNameToken=ViewExtendImpl.EXTENDED_VIEW_NAME_TOKEN_EDEFAULT;
        function ViewExtendImpl() {
            DdlStatementImpl.call(this);
        }
        ViewExtendImpl.prototype.eStaticClass = function() {
            return IAstPackage.Literals.VIEW_EXTEND;
        };
        ViewExtendImpl.prototype.getAnnotationList = function() {
            if (this.annotationList == null) {
                this.annotationList=[];
            }
            return this.annotationList;
        };
        ViewExtendImpl.prototype.getSelectList = function() {
            return this.selectList;
        };
        ViewExtendImpl.prototype.basicSetSelectList = function(newSelectList,msgs) {
            var oldSelectList=this.selectList;
            this.selectList=newSelectList;
            this.selectList.setContainer(this);
            return msgs;
        };
        ViewExtendImpl.prototype.setSelectList = function(newSelectList) {
            if (newSelectList != this.selectList) {
                var msgs=null;
                if (this.selectList != null) {

                }
                if (newSelectList != null) {

                }
                msgs=this.basicSetSelectList(newSelectList,msgs);
                if (msgs != null) {
                    msgs.dispatch();
                }
            }
        };
        ViewExtendImpl.prototype.getExtendedViewName = function() {
            throw new UnsupportedOperationException();
        };
        ViewExtendImpl.prototype.getExtendedViewNameToken = function() {
            return this.extendedViewNameToken;
        };
        ViewExtendImpl.prototype.setExtendedViewNameToken = function(newExtendedViewNameToken) {
            var oldExtendedViewNameToken=this.extendedViewNameToken;
            this.extendedViewNameToken=newExtendedViewNameToken;
        };
        ViewExtendImpl.prototype.eInverseRemove = function(otherEnd,featureID,msgs) {
            switch (featureID) {
                case IAstPackage.VIEW_EXTEND__SELECT_LIST:
                    return this.basicSetSelectList(null,msgs);
            }

        };
        ViewExtendImpl.prototype.eGet = function(featureID,resolve,coreType) {
            switch (featureID) {
                case IAstPackage.VIEW_EXTEND__ANNOTATION_LIST:
                    return this.getAnnotationList();
                case IAstPackage.VIEW_EXTEND__SELECT_LIST:
                    return this.getSelectList();
                case IAstPackage.VIEW_EXTEND__EXTENDED_VIEW_NAME:
                    return this.getExtendedViewName();
                case IAstPackage.VIEW_EXTEND__EXTENDED_VIEW_NAME_TOKEN:
                    return this.getExtendedViewNameToken();
            }
            return DdlStatementImpl.prototype.eGet.call(this,featureID,resolve,coreType);
        };
        ViewExtendImpl.prototype.eSet = function(featureID,newValue) {

        };
        ViewExtendImpl.prototype.eUnset = function(featureID) {

        };
        ViewExtendImpl.prototype.eIsSet = function(featureID) {
            switch (featureID) {
                case IAstPackage.VIEW_EXTEND__ANNOTATION_LIST:
                    return this.annotationList != null && !this.annotationList.isEmpty();
                case IAstPackage.VIEW_EXTEND__SELECT_LIST:
                    return this.selectList != null;
                case IAstPackage.VIEW_EXTEND__EXTENDED_VIEW_NAME:
                    return ViewExtendImpl.EXTENDED_VIEW_NAME_EDEFAULT == null ? this.getExtendedViewName() != null : !EXTENDED_VIEW_NAME_EDEFAULT===this.getExtendedViewName();
                case IAstPackage.VIEW_EXTEND__EXTENDED_VIEW_NAME_TOKEN:
                    return ViewExtendImpl.EXTENDED_VIEW_NAME_TOKEN_EDEFAULT == null ? this.extendedViewNameToken != null : !EXTENDED_VIEW_NAME_TOKEN_EDEFAULT===extendedViewNameToken;
            }
            return DdlStatementImpl.prototype.eIsSet.call(this,featureID);
        };
        ViewExtendImpl.prototype.eBaseStructuralFeatureID = function(derivedFeatureID,baseClass) {
            if (baseClass == IAnnotated.class) {
                switch (derivedFeatureID) {
                    case IAstPackage.VIEW_EXTEND__ANNOTATION_LIST:
                        return IAstPackage.ANNOTATED__ANNOTATION_LIST;
                    default :
                        return -1;
                }
            }
            return DdlStatementImpl.prototype.eBaseStructuralFeatureID.call(this,derivedFeatureID,baseClass);
        };
        ViewExtendImpl.prototype.eDerivedStructuralFeatureID = function(baseFeatureID,baseClass) {
            if (baseClass == IAnnotated.class) {
                switch (baseFeatureID) {
                    case IAstPackage.ANNOTATED__ANNOTATION_LIST:
                        return IAstPackage.VIEW_EXTEND__ANNOTATION_LIST;
                    default :
                        return -1;
                }
            }
            return DdlStatementImpl.prototype.eDerivedStructuralFeatureID.call(this,baseFeatureID,baseClass);
        };
        ViewExtendImpl.prototype.toString = function() {
            if (this.eIsProxy()) {
                return DdlStatementImpl.prototype.toString.call(this);
            }
            var result=new StringBuffer(DdlStatementImpl.prototype.toString.call(this));
            result.append(" (extendedViewNameToken: ");
            result.append(extendedViewNameToken);
            result.append(')');
            return result.toString();
        };
        return ViewExtendImpl;
    }
);
define(
    'commonddl/astmodel/BooleanType',[], //dependencies
    function () {

        function BooleanType(val) {
            this.m_value = val;
        }

        BooleanType.AND = new BooleanType(0);
        BooleanType.OR = new BooleanType(1);

        //public
        BooleanType.prototype.BooleanType = function () {
            return this.m_value;
        };
        BooleanType.prototype.getName = function() {
            if (this.m_value == 0)
                return "AND";
            if (this.m_value == 1)
                return "OR";
        };
        return BooleanType;
    }
);
define(
    'commonddl/astmodel/BooleanExpressionImpl',["commonddl/astmodel/ExpressionImpl","commonddl/astmodel/BooleanType","commonddl/astmodel/EObjectContainmentEList"], //dependencies
    function (ExpressionImpl,BooleanType,EObjectContainmentEList) {
        BooleanExpressionImpl.prototype = Object.create(ExpressionImpl.prototype);
        BooleanExpressionImpl.TYPE_EDEFAULT=BooleanType.AND;
        BooleanExpressionImpl.prototype.type=BooleanExpressionImpl.TYPE_EDEFAULT;
        BooleanExpressionImpl.prototype.conditions=null;
        BooleanExpressionImpl.OPEN_BRACKET_EDEFAULT=null;
        BooleanExpressionImpl.prototype.openBracket=BooleanExpressionImpl.OPEN_BRACKET_EDEFAULT;
        BooleanExpressionImpl.CLOSE_BRACKET_EDEFAULT=null;
        BooleanExpressionImpl.prototype.closeBracket=BooleanExpressionImpl.CLOSE_BRACKET_EDEFAULT;
        function BooleanExpressionImpl() {
            ExpressionImpl.call(this);
        }
        BooleanExpressionImpl.prototype.eStaticClass = function() {
            return IAstPackage.Literals.BOOLEAN_EXPRESSION;
        };
        BooleanExpressionImpl.prototype.getType = function() {
            return this.type;
        };
        BooleanExpressionImpl.prototype.setType = function(newType) {
            var oldType=this.type;
            this.type=newType == null ? TYPE_EDEFAULT : newType;
        };
        BooleanExpressionImpl.prototype.getConditions = function() {
            if (this.conditions == null) {
                this.conditions=new EObjectContainmentEList(this);
            }
            return this.conditions;
        };
        BooleanExpressionImpl.prototype.getOpenBracket = function() {
            return this.openBracket;
        };
        BooleanExpressionImpl.prototype.setOpenBracket = function(newOpenBracket) {
            var oldOpenBracket=this.openBracket;
            this.openBracket=newOpenBracket;
        };
        BooleanExpressionImpl.prototype.getCloseBracket = function() {
            return this.closeBracket;
        };
        BooleanExpressionImpl.prototype.setCloseBracket = function(newCloseBracket) {
            var oldCloseBracket=this.closeBracket;
            this.closeBracket=newCloseBracket;
        };
        BooleanExpressionImpl.prototype.addConditionExpression = function(ex) {
            this.getConditions().push(ex);
        };
        BooleanExpressionImpl.prototype.eInverseRemove = function(otherEnd,featureID,msgs) {
            switch (featureID) {
                case IAstPackage.BOOLEAN_EXPRESSION__CONDITIONS:
                    return (this.getConditions()).basicRemove(otherEnd,msgs);
            }

        };
        BooleanExpressionImpl.prototype.eGet = function(featureID,resolve,coreType) {
            switch (featureID) {
                case IAstPackage.BOOLEAN_EXPRESSION__TYPE:
                    return this.getType();
                case IAstPackage.BOOLEAN_EXPRESSION__CONDITIONS:
                    return this.getConditions();
                case IAstPackage.BOOLEAN_EXPRESSION__OPEN_BRACKET:
                    return this.getOpenBracket();
                case IAstPackage.BOOLEAN_EXPRESSION__CLOSE_BRACKET:
                    return this.getCloseBracket();
            }
            return ExpressionImpl.prototype.eGet.call(this,featureID,resolve,coreType);
        };
        BooleanExpressionImpl.prototype.eSet = function(featureID,newValue) {

        };
        BooleanExpressionImpl.prototype.eUnset = function(featureID) {

        };
        BooleanExpressionImpl.prototype.eIsSet = function(featureID) {
            switch (featureID) {
                case IAstPackage.BOOLEAN_EXPRESSION__TYPE:
                    return this.type != BooleanExpressionImpl.TYPE_EDEFAULT;
                case IAstPackage.BOOLEAN_EXPRESSION__CONDITIONS:
                    return this.conditions != null && !this.conditions.isEmpty();
                case IAstPackage.BOOLEAN_EXPRESSION__OPEN_BRACKET:
                    return BooleanExpressionImpl.OPEN_BRACKET_EDEFAULT == null ? this.openBracket != null : !OPEN_BRACKET_EDEFAULT===openBracket;
                case IAstPackage.BOOLEAN_EXPRESSION__CLOSE_BRACKET:
                    return BooleanExpressionImpl.CLOSE_BRACKET_EDEFAULT == null ? this.closeBracket != null : !CLOSE_BRACKET_EDEFAULT===closeBracket;
            }
            return ExpressionImpl.prototype.eIsSet.call(this,featureID);
        };
        BooleanExpressionImpl.prototype.toString = function() {
            if (this.eIsProxy()) {
                return ExpressionImpl.prototype.toString.call(this);
            }
            var result=new StringBuffer(ExpressionImpl.prototype.toString.call(this));
            result.append(" (type: ");
            result.append(type);
            result.append(", openBracket: ");
            result.append(openBracket);
            result.append(", closeBracket: ");
            result.append(closeBracket);
            result.append(')');
            return result.toString();
        };
        return BooleanExpressionImpl;
    }
);
define(
    'commonddl/astmodel/LiteralExpressionImpl',["commonddl/astmodel/ExpressionImpl"], //dependencies
    function (ExpressionImpl) {
        LiteralExpressionImpl.prototype = Object.create(ExpressionImpl.prototype);
        LiteralExpressionImpl.TOKEN_EDEFAULT=null;
        LiteralExpressionImpl.TOKEN_TOKEN_EDEFAULT=null;
        LiteralExpressionImpl.prototype.tokenToken=LiteralExpressionImpl.TOKEN_TOKEN_EDEFAULT;
        function LiteralExpressionImpl() {
            ExpressionImpl.call(this);
        }
        LiteralExpressionImpl.prototype.eStaticClass = function() {
            return IAstPackage.Literals.LITERAL_EXPRESSION;
        };
        LiteralExpressionImpl.prototype.getToken = function() {
            return this.getTokenToken().m_lexem;
        };
        LiteralExpressionImpl.prototype.getTokenToken = function() {
            return this.tokenToken;
        };
        LiteralExpressionImpl.prototype.setTokenToken = function(newTokenToken) {
            var oldTokenToken=this.tokenToken;
            this.tokenToken=newTokenToken;
        };
        LiteralExpressionImpl.prototype.eGet = function(featureID,resolve,coreType) {
            switch (featureID) {
                case IAstPackage.LITERAL_EXPRESSION__TOKEN:
                    return this.getToken();
                case IAstPackage.LITERAL_EXPRESSION__TOKEN_TOKEN:
                    return this.getTokenToken();
            }
            return ExpressionImpl.prototype.eGet.call(this,featureID,resolve,coreType);
        };
        LiteralExpressionImpl.prototype.eSet = function(featureID,newValue) {
            switch (featureID) {
                case IAstPackage.LITERAL_EXPRESSION__TOKEN_TOKEN:
                    this.setTokenToken(newValue);
                    return;
            }
            ExpressionImpl.prototype.eSet.call(this,featureID,newValue);
        };
        LiteralExpressionImpl.prototype.eUnset = function(featureID) {
            switch (featureID) {
                case IAstPackage.LITERAL_EXPRESSION__TOKEN_TOKEN:
                    this.setTokenToken(LiteralExpressionImpl.TOKEN_TOKEN_EDEFAULT);
                    return;
            }
            ExpressionImpl.prototype.eUnset.call(this,featureID);
        };
        LiteralExpressionImpl.prototype.eIsSet = function(featureID) {
            switch (featureID) {
                case IAstPackage.LITERAL_EXPRESSION__TOKEN:
                    return LiteralExpressionImpl.TOKEN_EDEFAULT == null ? this.getToken() != null : !TOKEN_EDEFAULT===this.getToken();
                case IAstPackage.LITERAL_EXPRESSION__TOKEN_TOKEN:
                    return LiteralExpressionImpl.TOKEN_TOKEN_EDEFAULT == null ? this.tokenToken != null : !TOKEN_TOKEN_EDEFAULT===tokenToken;
            }
            return ExpressionImpl.prototype.eIsSet.call(this,featureID);
        };
        LiteralExpressionImpl.prototype.toString = function() {
            if (this.eIsProxy()) {
                return ExpressionImpl.prototype.toString.call(this);
            }
            var result=new StringBuffer(ExpressionImpl.prototype.toString.call(this));
            result.append(" (tokenToken: ");
            result.append(tokenToken);
            result.append(')');
            return result.toString();
        };
        return LiteralExpressionImpl;
    }
);
define(
    'commonddl/astmodel/ExpressionContainerImpl',["commonddl/astmodel/SourceRangeImpl"], //dependencies
    function (SourceRangeImpl) {
        ExpressionContainerImpl.prototype = Object.create(SourceRangeImpl.prototype);
        ExpressionContainerImpl.prototype.expression=null;
        ExpressionContainerImpl.SHORT_DESCRIPTION_EDEFAULT=null;
        ExpressionContainerImpl.prototype.shortDescription=ExpressionContainerImpl.SHORT_DESCRIPTION_EDEFAULT;
        function ExpressionContainerImpl() {
            SourceRangeImpl.call(this);
        }
        ExpressionContainerImpl.prototype.eStaticClass = function() {
            return IAstPackage.Literals.EXPRESSION_CONTAINER;
        };
        ExpressionContainerImpl.prototype.getExpression = function() {
            return this.expression;
        };
        ExpressionContainerImpl.prototype.basicSetExpression = function(newExpression,msgs) {
            var oldExpression=this.expression;
            this.expression=newExpression;
            this.expression.setContainer(this);
            return msgs;
        };
        ExpressionContainerImpl.prototype.setExpression = function(newExpression) {
            if (newExpression != this.expression) {
                var msgs=null;
                if (this.expression != null) {

                }
                if (newExpression != null) {

                }
                msgs=this.basicSetExpression(newExpression,msgs);
                if (msgs != null) {
                    msgs.dispatch();
                }
            }
        };
        ExpressionContainerImpl.prototype.getShortDescription = function() {
            if (this.shortDescription == null) {
                var start=this.getStartOffset();
                var end=this.getEndOffset();
                var cu=SourceRangeImpl.getCompilationUnit(this);
                this.shortDescription=cu.getParsedSource().substring(start,end);
            }
            return this.shortDescription;
        };
        ExpressionContainerImpl.prototype.eInverseRemove = function(otherEnd,featureID,msgs) {
            switch (featureID) {
                case IAstPackage.EXPRESSION_CONTAINER__EXPRESSION:
                    return this.basicSetExpression(null,msgs);
            }

        };
        ExpressionContainerImpl.prototype.eGet = function(featureID,resolve,coreType) {
            switch (featureID) {
                case IAstPackage.EXPRESSION_CONTAINER__EXPRESSION:
                    return this.getExpression();
                case IAstPackage.EXPRESSION_CONTAINER__SHORT_DESCRIPTION:
                    return this.getShortDescription();
            }
            return SourceRangeImpl.prototype.eGet.call(this,featureID,resolve,coreType);
        };
        ExpressionContainerImpl.prototype.eSet = function(featureID,newValue) {
            switch (featureID) {
                case IAstPackage.EXPRESSION_CONTAINER__EXPRESSION:
                    this.setExpression(newValue);
                    return;
            }
            SourceRangeImpl.prototype.eSet.call(this,featureID,newValue);
        };
        ExpressionContainerImpl.prototype.eUnset = function(featureID) {
            switch (featureID) {
                case IAstPackage.EXPRESSION_CONTAINER__EXPRESSION:
                    this.setExpression(null);
                    return;
            }
            SourceRangeImpl.prototype.eUnset.call(this,featureID);
        };
        ExpressionContainerImpl.prototype.eIsSet = function(featureID) {
            switch (featureID) {
                case IAstPackage.EXPRESSION_CONTAINER__EXPRESSION:
                    return this.expression != null;
                case IAstPackage.EXPRESSION_CONTAINER__SHORT_DESCRIPTION:
                    return ExpressionContainerImpl.SHORT_DESCRIPTION_EDEFAULT == null ? this.shortDescription != null : !SHORT_DESCRIPTION_EDEFAULT===shortDescription;
            }
            return SourceRangeImpl.prototype.eIsSet.call(this,featureID);
        };
        ExpressionContainerImpl.prototype.toString = function() {
            if (this.eIsProxy()) {
                return SourceRangeImpl.prototype.toString.call(this);
            }
            var result=new StringBuffer(SourceRangeImpl.prototype.toString.call(this));
            result.append(" (shortDescription: ");
            result.append(shortDescription);
            result.append(')');
            return result.toString();
        };
        return ExpressionContainerImpl;
    }
);
define(
    'commonddl/astmodel/SelectListEntryExtensionImpl',["commonddl/astmodel/SelectListEntryImpl"], //dependencies
    function (SelectListEntryImpl) {
        SelectListEntryExtensionImpl.prototype = Object.create(SelectListEntryImpl.prototype);
        function SelectListEntryExtensionImpl() {
            SelectListEntryImpl.call(this);
        }
        SelectListEntryExtensionImpl.prototype.eStaticClass = function() {
            return IAstPackage.Literals.SELECT_LIST_ENTRY_EXTENSION;
        };
        return SelectListEntryExtensionImpl;
    }
);
define(
    'commonddl/astmodel/NotExpressionImpl',["commonddl/astmodel/ExpressionImpl"], //dependencies
    function (ExpressionImpl) {
        NotExpressionImpl.prototype = Object.create(ExpressionImpl.prototype);
        NotExpressionImpl.prototype.cond=null;
        function NotExpressionImpl() {
            ExpressionImpl.call(this);
        }
        NotExpressionImpl.prototype.eStaticClass = function() {
            return IAstPackage.Literals.NOT_EXPRESSION;
        };
        NotExpressionImpl.prototype.getCond = function() {
            return this.cond;
        };
        NotExpressionImpl.prototype.basicSetCond = function(newCond,msgs) {
            var oldCond=this.cond;
            this.cond=newCond;
            this.cond.setContainer(this);
            return msgs;
        };
        NotExpressionImpl.prototype.setCond = function(newCond) {
            if (newCond != this.cond) {
                var msgs=null;
                if (this.cond != null) {

                }
                if (newCond != null) {

                }
                msgs=this.basicSetCond(newCond,msgs);
                if (msgs != null) {
                    msgs.dispatch();
                }
            }
        };
        NotExpressionImpl.prototype.eInverseRemove = function(otherEnd,featureID,msgs) {
            switch (featureID) {
                case IAstPackage.NOT_EXPRESSION__COND:
                    return this.basicSetCond(null,msgs);
            }

        };
        NotExpressionImpl.prototype.eGet = function(featureID,resolve,coreType) {
            switch (featureID) {
                case IAstPackage.NOT_EXPRESSION__COND:
                    return this.getCond();
            }
            return ExpressionImpl.prototype.eGet.call(this,featureID,resolve,coreType);
        };
        NotExpressionImpl.prototype.eSet = function(featureID,newValue) {
            switch (featureID) {
                case IAstPackage.NOT_EXPRESSION__COND:
                    this.setCond(newValue);
                    return;
            }
            ExpressionImpl.prototype.eSet.call(this,featureID,newValue);
        };
        NotExpressionImpl.prototype.eUnset = function(featureID) {
            switch (featureID) {
                case IAstPackage.NOT_EXPRESSION__COND:
                    this.setCond(null);
                    return;
            }
            ExpressionImpl.prototype.eUnset.call(this,featureID);
        };
        NotExpressionImpl.prototype.eIsSet = function(featureID) {
            switch (featureID) {
                case IAstPackage.NOT_EXPRESSION__COND:
                    return this.cond != null;
            }
            return ExpressionImpl.prototype.eIsSet.call(this,featureID);
        };
        return NotExpressionImpl;
    }
);
define(
    'commonddl/astmodel/EnumerationDeclarationImpl',["commonddl/astmodel/SourceRangeImpl","commonddl/astmodel/EObjectContainmentEList"], //dependencies
    function (SourceRangeImpl,EObjectContainmentEList) {
        EnumerationDeclarationImpl.prototype = Object.create(SourceRangeImpl.prototype);
        EnumerationDeclarationImpl.prototype.values=null;
        function EnumerationDeclarationImpl() {
            SourceRangeImpl.call(this);
        }
        EnumerationDeclarationImpl.prototype.eStaticClass = function() {
            return IAstPackage.Literals.ENUMERATION_DECLARATION;
        };
        EnumerationDeclarationImpl.prototype.getValues = function() {
            if (this.values == null) {
                this.values=new EObjectContainmentEList(this);
            }
            return this.values;
        };
        EnumerationDeclarationImpl.prototype.eInverseRemove = function(otherEnd,featureID,msgs) {
            switch (featureID) {
                case IAstPackage.ENUMERATION_DECLARATION__VALUES:
                    return (this.getValues()).basicRemove(otherEnd,msgs);
            }

        };
        EnumerationDeclarationImpl.prototype.eGet = function(featureID,resolve,coreType) {
            switch (featureID) {
                case IAstPackage.ENUMERATION_DECLARATION__VALUES:
                    return this.getValues();
            }
            return SourceRangeImpl.prototype.eGet.call(this,featureID,resolve,coreType);
        };
        EnumerationDeclarationImpl.prototype.eSet = function(featureID,newValue) {

        };
        EnumerationDeclarationImpl.prototype.eUnset = function(featureID) {

        };
        EnumerationDeclarationImpl.prototype.eIsSet = function(featureID) {
            switch (featureID) {
                case IAstPackage.ENUMERATION_DECLARATION__VALUES:
                    return this.values != null && !this.values.isEmpty();
            }
            return SourceRangeImpl.prototype.eIsSet.call(this,featureID);
        };
        return EnumerationDeclarationImpl;
    }
);
define(
    'commonddl/astmodel/EnumerationValueImpl',["commonddl/astmodel/SourceRangeImpl"], //dependencies
    function (SourceRangeImpl) {
        EnumerationValueImpl.prototype = Object.create(SourceRangeImpl.prototype);
        EnumerationValueImpl.SYMBOL_EDEFAULT=null;
        EnumerationValueImpl.prototype.symbol=EnumerationValueImpl.SYMBOL_EDEFAULT;
        EnumerationValueImpl.prototype.literal=null;
        function EnumerationValueImpl() {
            SourceRangeImpl.call(this);
        }
        EnumerationValueImpl.prototype.eStaticClass = function() {
            return IAstPackage.Literals.ENUMERATION_VALUE;
        };
        EnumerationValueImpl.prototype.getSymbol = function() {
            return this.symbol;
        };
        EnumerationValueImpl.prototype.setSymbol = function(newSymbol) {
            var oldSymbol=this.symbol;
            this.symbol=newSymbol;
        };
        EnumerationValueImpl.prototype.getLiteral = function() {
            return this.literal;
        };
        EnumerationValueImpl.prototype.basicSetLiteral = function(newLiteral,msgs) {
            var oldLiteral=this.literal;
            this.literal=newLiteral;
            return msgs;
        };
        EnumerationValueImpl.prototype.setLiteral = function(newLiteral) {
            if (newLiteral != this.literal) {
                var msgs=null;
                if (this.literal != null) {

                }
                if (newLiteral != null) {

                }
                msgs=this.basicSetLiteral(newLiteral,msgs);
                if (msgs != null) {
                    msgs.dispatch();
                }
            }
        };
        EnumerationValueImpl.prototype.eInverseRemove = function(otherEnd,featureID,msgs) {
            switch (featureID) {
                case IAstPackage.ENUMERATION_VALUE__LITERAL:
                    return this.basicSetLiteral(null,msgs);
            }

        };
        EnumerationValueImpl.prototype.eGet = function(featureID,resolve,coreType) {
            switch (featureID) {
                case IAstPackage.ENUMERATION_VALUE__SYMBOL:
                    return this.getSymbol();
                case IAstPackage.ENUMERATION_VALUE__LITERAL:
                    return this.getLiteral();
            }
            return SourceRangeImpl.prototype.eGet.call(this,featureID,resolve,coreType);
        };
        EnumerationValueImpl.prototype.eSet = function(featureID,newValue) {
            switch (featureID) {
                case IAstPackage.ENUMERATION_VALUE__SYMBOL:
                    this.setSymbol(newValue);
                    return;
                case IAstPackage.ENUMERATION_VALUE__LITERAL:
                    this.setLiteral(newValue);
                    return;
            }
            SourceRangeImpl.prototype.eSet.call(this,featureID,newValue);
        };
        EnumerationValueImpl.prototype.eUnset = function(featureID) {
            switch (featureID) {
                case IAstPackage.ENUMERATION_VALUE__SYMBOL:
                    this.setSymbol(EnumerationValueImpl.SYMBOL_EDEFAULT);
                    return;
                case IAstPackage.ENUMERATION_VALUE__LITERAL:
                    this.setLiteral(null);
                    return;
            }
            SourceRangeImpl.prototype.eUnset.call(this,featureID);
        };
        EnumerationValueImpl.prototype.eIsSet = function(featureID) {
            switch (featureID) {
                case IAstPackage.ENUMERATION_VALUE__SYMBOL:
                    return EnumerationValueImpl.SYMBOL_EDEFAULT == null ? this.symbol != null : !SYMBOL_EDEFAULT===symbol;
                case IAstPackage.ENUMERATION_VALUE__LITERAL:
                    return this.literal != null;
            }
            return SourceRangeImpl.prototype.eIsSet.call(this,featureID);
        };
        EnumerationValueImpl.prototype.toString = function() {
            if (this.eIsProxy()) {
                return SourceRangeImpl.prototype.toString.call(this);
            }
            var result=new StringBuffer(SourceRangeImpl.prototype.toString.call(this));
            result.append(" (symbol: ");
            result.append(symbol);
            result.append(')');
            return result.toString();
        };
        return EnumerationValueImpl;
    }
);
define(
    'commonddl/astmodel/ProxyStatementImpl',["commonddl/astmodel/EObjectImpl"], //dependencies
    function (EObjectImpl) {
        ProxyStatementImpl.prototype = Object.create(EObjectImpl.prototype);
        ProxyStatementImpl.prototype.target=null;
        ProxyStatementImpl.prototype.compilationUnit=null;
        ProxyStatementImpl.prototype.namePathRef=null;
        ProxyStatementImpl.NAME_EDEFAULT=null;
        ProxyStatementImpl.UNQUALIFIED_NAME_EDEFAULT=null;
        ProxyStatementImpl.QUALIFIED_PART_EDEFAULT=null;
        function ProxyStatementImpl() {
            EObjectImpl.call(this);
        }
        ProxyStatementImpl.prototype.eStaticClass = function() {
            return IAstPackage.Literals.PROXY_STATEMENT;
        };
        ProxyStatementImpl.prototype.getTarget = function() {
            return this.target;
        };
        ProxyStatementImpl.prototype.basicGetTarget = function() {
            return this.target;
        };
        ProxyStatementImpl.prototype.setTarget = function(newTarget) {
            var oldTarget=this.target;
            this.target=newTarget;
        };
        ProxyStatementImpl.prototype.getCompilationUnit = function() {
            if (this.compilationUnit != null && this.compilationUnit.eIsProxy()) {
                var oldCompilationUnit=this.compilationUnit;
                this.compilationUnit=this.eResolveProxy(oldCompilationUnit);
                if (this.compilationUnit != oldCompilationUnit) {
                }
            }
            return this.compilationUnit;
        };
        ProxyStatementImpl.prototype.basicGetCompilationUnit = function() {
            return this.compilationUnit;
        };
        ProxyStatementImpl.prototype.setCompilationUnit = function(newCompilationUnit) {
            var oldCompilationUnit=this.compilationUnit;
            this.compilationUnit=newCompilationUnit;
        };
        ProxyStatementImpl.prototype.getNamePathRef = function() {
            return this.namePathRef;
        };
        ProxyStatementImpl.prototype.basicGetNamePathRef = function() {
            return this.namePathRef;
        };
        ProxyStatementImpl.prototype.setNamePathRef = function(newNamePathRef) {
            var oldNamePathRef=this.namePathRef;
            this.namePathRef=newNamePathRef;
        };
        ProxyStatementImpl.prototype.resolveTargetEntity = function(progressMonitor) {
            var target=this.getTarget();
            if (this.target == null || this.target.eIsProxy() == true) {
                var cu=this.getCompilationUnit();
                if (cu == null) {
                    return false;
                }
                var ra=cu.getRepositoryAccess();
                if (ra == null) {
                    return false;
                }
                var resolvedTarget=ra.findAndParseEntity(progressMonitor,this.getNamePathRef());
                if (resolvedTarget == null) {
                    return false;
                }
                this.setTarget(resolvedTarget);
            }
            return true;
        };
        ProxyStatementImpl.prototype.eGet = function(featureID,resolve,coreType) {
            switch (featureID) {
                case IAstPackage.PROXY_STATEMENT__TARGET:
                    if (resolve) {
                        return this.getTarget();
                    }
                    return this.basicGetTarget();
                case IAstPackage.PROXY_STATEMENT__COMPILATION_UNIT:
                    if (resolve) {
                        return this.getCompilationUnit();
                    }
                    return this.basicGetCompilationUnit();
                case IAstPackage.PROXY_STATEMENT__NAME_PATH_REF:
                    if (resolve) {
                        return this.getNamePathRef();
                    }
                    return this.basicGetNamePathRef();
                case IAstPackage.PROXY_STATEMENT__NAME:
                    return this.getName();
                case IAstPackage.PROXY_STATEMENT__UNQUALIFIED_NAME:
                    return this.getUnqualifiedName();
                case IAstPackage.PROXY_STATEMENT__QUALIFIED_PART:
                    return this.getQualifiedPart();
            }
            return EObjectImpl.prototype.eGet.call(this,featureID,resolve,coreType);
        };
        ProxyStatementImpl.prototype.eSet = function(featureID,newValue) {
            switch (featureID) {
                case IAstPackage.PROXY_STATEMENT__TARGET:
                    this.setTarget(newValue);
                    return;
                case IAstPackage.PROXY_STATEMENT__COMPILATION_UNIT:
                    this.setCompilationUnit(newValue);
                    return;
                case IAstPackage.PROXY_STATEMENT__NAME_PATH_REF:
                    this.setNamePathRef(newValue);
                    return;
            }
            EObjectImpl.prototype.eSet.call(this,featureID,newValue);
        };
        ProxyStatementImpl.prototype.eUnset = function(featureID) {
            switch (featureID) {
                case IAstPackage.PROXY_STATEMENT__TARGET:
                    this.setTarget(null);
                    return;
                case IAstPackage.PROXY_STATEMENT__COMPILATION_UNIT:
                    this.setCompilationUnit(null);
                    return;
                case IAstPackage.PROXY_STATEMENT__NAME_PATH_REF:
                    this.setNamePathRef(null);
                    return;
            }
            EObjectImpl.prototype.eUnset.call(this,featureID);
        };
        ProxyStatementImpl.prototype.eIsSet = function(featureID) {
            switch (featureID) {
                case IAstPackage.PROXY_STATEMENT__TARGET:
                    return this.target != null;
                case IAstPackage.PROXY_STATEMENT__COMPILATION_UNIT:
                    return this.compilationUnit != null;
                case IAstPackage.PROXY_STATEMENT__NAME_PATH_REF:
                    return this.namePathRef != null;
                case IAstPackage.PROXY_STATEMENT__NAME:
                    return ProxyStatementImpl.NAME_EDEFAULT == null ? this.getName() != null : !NAME_EDEFAULT===this.getName();
            }
            return EObjectImpl.prototype.eIsSet.call(this,featureID);
        };
        ProxyStatementImpl.prototype.getName = function() {
            var path=this.getNamePathRef();
            if (path != null && path.getEntries() != null && path.getEntries().length > 0) {
                return path.getPathString(false);
            }
            return "";
        };
        ProxyStatementImpl.prototype.getUnqualifiedName = function() {
            var name=this.getName();
            var pos=name.lastIndexOf(DdlStatementImpl.PATH_IDENTIFIER);
            return name.substring(pos + 1);
        };
        ProxyStatementImpl.prototype.getQualifiedPart = function() {
            var name=this.getName();
            var pos=name.lastIndexOf(DdlStatementImpl.PATH_IDENTIFIER);
            if (pos <= 0) {
                return null;
            }
            return name.substring(0,pos);
        };
        return ProxyStatementImpl;
    }
);
define(
    'commonddl/astmodel/PathDeclarationImpl',["commonddl/astmodel/EObjectImpl","commonddl/astmodel/EObjectContainmentEList","rndrt/rnd"], //dependencies
    function (EObjectImpl,EObjectContainmentEList,rnd) {
        PathDeclarationImpl.prototype = Object.create(EObjectImpl.prototype);
        PathDeclarationImpl.prototype.entries=null;
        PathDeclarationImpl.LAST_NAMESPACE_COMPONENT_INDEX_EDEFAULT=null;
        PathDeclarationImpl.prototype.lastNamespaceComponentIndex=PathDeclarationImpl.LAST_NAMESPACE_COMPONENT_INDEX_EDEFAULT;
        function PathDeclarationImpl() {
            EObjectImpl.call(this);
        }
        PathDeclarationImpl.prototype.eStaticClass = function() {
            return IAstPackage.Literals.PATH_DECLARATION;
        };
        PathDeclarationImpl.prototype.getEntries = function() {
            if (this.entries == null) {
                this.entries=new EObjectContainmentEList(this);
            }
            return this.entries;
        };
        PathDeclarationImpl.prototype.getLastNamespaceComponentIndex = function() {
            return this.lastNamespaceComponentIndex;
        };
        PathDeclarationImpl.prototype.setLastNamespaceComponentIndex = function(newLastNamespaceComponentIndex) {
            var oldLastNamespaceComponentIndex=this.lastNamespaceComponentIndex;
            this.lastNamespaceComponentIndex=newLastNamespaceComponentIndex;
        };
        PathDeclarationImpl.prototype.eInverseRemove = function(otherEnd,featureID,msgs) {
            switch (featureID) {
                case IAstPackage.PATH_DECLARATION__ENTRIES:
                    return (this.getEntries()).basicRemove(otherEnd,msgs);
            }

        };
        PathDeclarationImpl.prototype.eGet = function(featureID,resolve,coreType) {
            switch (featureID) {
                case IAstPackage.PATH_DECLARATION__ENTRIES:
                    return this.getEntries();
                case IAstPackage.PATH_DECLARATION__LAST_NAMESPACE_COMPONENT_INDEX:
                    return this.getLastNamespaceComponentIndex();
            }
            return EObjectImpl.prototype.eGet.call(this,featureID,resolve,coreType);
        };
        PathDeclarationImpl.prototype.eSet = function(featureID,newValue) {

        };
        PathDeclarationImpl.prototype.eUnset = function(featureID) {

        };
        PathDeclarationImpl.prototype.eIsSet = function(featureID) {
            switch (featureID) {
                case IAstPackage.PATH_DECLARATION__ENTRIES:
                    return this.entries != null && !this.entries.isEmpty();
                case IAstPackage.PATH_DECLARATION__LAST_NAMESPACE_COMPONENT_INDEX:
                    return PathDeclarationImpl.LAST_NAMESPACE_COMPONENT_INDEX_EDEFAULT == null ? this.lastNamespaceComponentIndex != null : !LAST_NAMESPACE_COMPONENT_INDEX_EDEFAULT.equals(lastNamespaceComponentIndex);
            }
            return EObjectImpl.prototype.eIsSet.call(this,featureID);
        };
        PathDeclarationImpl.prototype.toString = function() {
            return this.getPathString(true);
        };
        PathDeclarationImpl.prototype.getPathString = function(withFilters) {
            var result=new rnd.StringBuffer();
            var entries=this.getEntries();
            for (var i=0;i < this.entries.length;i++) {
                var entry=this.entries[i];
                if (i > 0) {
                    result.append(".");
                }
                var t=entry.getNameToken();
                if (t != null) {
                    result.append(t.m_lexem);
                }
                var filter=entry.getFilter();
                if (withFilters && filter != null) {
                    result.append("[");
                    result.append(filter.toString());
                    result.append("]");
                }
            }
            return result.toString();
        };
        return PathDeclarationImpl;
    }
);
define(
    'commonddl/astmodel/ContextDeclarationImpl',["commonddl/astmodel/DdlStatementImpl","commonddl/astmodel/EObjectContainmentEList"], //dependencies
    function (DdlStatementImpl,EObjectContainmentEList) {
        ContextDeclarationImpl.prototype = Object.create(DdlStatementImpl.prototype);
        ContextDeclarationImpl.prototype.annotationList=null;
        ContextDeclarationImpl.prototype.statements=null;
        function ContextDeclarationImpl() {
            DdlStatementImpl.call(this);
        }
        ContextDeclarationImpl.prototype.eStaticClass = function() {
            return IAstPackage.Literals.CONTEXT_DECLARATION;
        };
        ContextDeclarationImpl.prototype.getAnnotationList = function() {
            if (this.annotationList == null) {
                this.annotationList=[];
            }
            return this.annotationList;
        };
        ContextDeclarationImpl.prototype.getStatements = function() {
            if (this.statements == null) {
                this.statements=new EObjectContainmentEList(this);
            }
            return this.statements;
        };
        ContextDeclarationImpl.prototype.eInverseRemove = function(otherEnd,featureID,msgs) {
            switch (featureID) {
                case IAstPackage.CONTEXT_DECLARATION__STATEMENTS:
                    return (this.getStatements()).basicRemove(otherEnd,msgs);
            }

        };
        ContextDeclarationImpl.prototype.eGet = function(featureID,resolve,coreType) {
            switch (featureID) {
                case IAstPackage.CONTEXT_DECLARATION__ANNOTATION_LIST:
                    return this.getAnnotationList();
                case IAstPackage.CONTEXT_DECLARATION__STATEMENTS:
                    return this.getStatements();
            }
            return DdlStatementImpl.prototype.eGet.call(this,featureID,resolve,coreType);
        };
        ContextDeclarationImpl.prototype.eSet = function(featureID,newValue) {

        };
        ContextDeclarationImpl.prototype.eUnset = function(featureID) {

        };
        ContextDeclarationImpl.prototype.eIsSet = function(featureID) {
            switch (featureID) {
                case IAstPackage.CONTEXT_DECLARATION__ANNOTATION_LIST:
                    return this.annotationList != null && !this.annotationList.isEmpty();
                case IAstPackage.CONTEXT_DECLARATION__STATEMENTS:
                    return this.statements != null && !this.statements.isEmpty();
            }
            return DdlStatementImpl.prototype.eIsSet.call(this,featureID);
        };
        ContextDeclarationImpl.prototype.eBaseStructuralFeatureID = function(derivedFeatureID,baseClass) {
            if (baseClass == IAnnotated.class) {
                switch (derivedFeatureID) {
                    case IAstPackage.CONTEXT_DECLARATION__ANNOTATION_LIST:
                        return IAstPackage.ANNOTATED__ANNOTATION_LIST;
                    default :
                        return -1;
                }
            }
            if (baseClass == IStatementContainer.class) {
                switch (derivedFeatureID) {
                    case IAstPackage.CONTEXT_DECLARATION__STATEMENTS:
                        return IAstPackage.STATEMENT_CONTAINER__STATEMENTS;
                    default :
                        return -1;
                }
            }
            return DdlStatementImpl.prototype.eBaseStructuralFeatureID.call(this,derivedFeatureID,baseClass);
        };
        ContextDeclarationImpl.prototype.eDerivedStructuralFeatureID = function(baseFeatureID,baseClass) {
            if (baseClass == IAnnotated.class) {
                switch (baseFeatureID) {
                    case IAstPackage.ANNOTATED__ANNOTATION_LIST:
                        return IAstPackage.CONTEXT_DECLARATION__ANNOTATION_LIST;
                    default :
                        return -1;
                }
            }
            if (baseClass == IStatementContainer.class) {
                switch (baseFeatureID) {
                    case IAstPackage.STATEMENT_CONTAINER__STATEMENTS:
                        return IAstPackage.CONTEXT_DECLARATION__STATEMENTS;
                    default :
                        return -1;
                }
            }
            return DdlStatementImpl.prototype.eDerivedStructuralFeatureID.call(this,baseFeatureID,baseClass);
        };
        return ContextDeclarationImpl;
    }
);
define(
    'commonddl/astmodel/NamespaceDeclarationImpl',["commonddl/astmodel/DdlStatementImpl"], //dependencies
    function (DdlStatementImpl) {
        NamespaceDeclarationImpl.prototype = Object.create(DdlStatementImpl.prototype);
        function NamespaceDeclarationImpl() {
            DdlStatementImpl.call(this);
        }
        NamespaceDeclarationImpl.prototype.eStaticClass = function() {
            return IAstPackage.Literals.NAMESPACE_DECLARATION;
        };
        return NamespaceDeclarationImpl;
    }
);
define(
    'commonddl/astmodel/EntityDeclarationImpl',["commonddl/astmodel/ComponentDeclarationImpl"], //dependencies
    function (ComponentDeclarationImpl) {
        EntityDeclarationImpl.prototype = Object.create(ComponentDeclarationImpl.prototype);
        EntityDeclarationImpl.prototype.annotationList=null;
        function EntityDeclarationImpl() {
            ComponentDeclarationImpl.call(this);
        }
        EntityDeclarationImpl.prototype.eStaticClass = function() {
            return IAstPackage.Literals.ENTITY_DECLARATION;
        };
        EntityDeclarationImpl.prototype.getAnnotationList = function() {
            if (this.annotationList == null) {
                this.annotationList=[];
            }
            return this.annotationList;
        };
        EntityDeclarationImpl.prototype.eGet = function(featureID,resolve,coreType) {
            switch (featureID) {
                case IAstPackage.ENTITY_DECLARATION__ANNOTATION_LIST:
                    return this.getAnnotationList();
            }
            return ComponentDeclarationImpl.prototype.eGet.call(this,featureID,resolve,coreType);
        };
        EntityDeclarationImpl.prototype.eSet = function(featureID,newValue) {

        };
        EntityDeclarationImpl.prototype.eUnset = function(featureID) {

        };
        EntityDeclarationImpl.prototype.eIsSet = function(featureID) {
            switch (featureID) {
                case IAstPackage.ENTITY_DECLARATION__ANNOTATION_LIST:
                    return this.annotationList != null && !this.annotationList.isEmpty();
            }
            return ComponentDeclarationImpl.prototype.eIsSet.call(this,featureID);
        };
        EntityDeclarationImpl.prototype.eBaseStructuralFeatureID = function(derivedFeatureID,baseClass) {
            if (baseClass == IAnnotated.class) {
                switch (derivedFeatureID) {
                    case IAstPackage.ENTITY_DECLARATION__ANNOTATION_LIST:
                        return IAstPackage.ANNOTATED__ANNOTATION_LIST;
                    default :
                        return -1;
                }
            }
            return ComponentDeclarationImpl.prototype.eBaseStructuralFeatureID.call(this,derivedFeatureID,baseClass);
        };
        EntityDeclarationImpl.prototype.eDerivedStructuralFeatureID = function(baseFeatureID,baseClass) {
            if (baseClass == IAnnotated.class) {
                switch (baseFeatureID) {
                    case IAstPackage.ANNOTATED__ANNOTATION_LIST:
                        return IAstPackage.ENTITY_DECLARATION__ANNOTATION_LIST;
                    default :
                        return -1;
                }
            }
            return ComponentDeclarationImpl.prototype.eDerivedStructuralFeatureID.call(this,baseFeatureID,baseClass);
        };
        return EntityDeclarationImpl;
    }
);
define(
    'commonddl/astmodel/ForeignKeyImpl',["commonddl/astmodel/SourceRangeImpl"], //dependencies
    function (SourceRangeImpl) {
        ForeignKeyImpl.prototype = Object.create(SourceRangeImpl.prototype);
        ForeignKeyImpl.KEY_TOKEN_EDEFAULT=null;
        ForeignKeyImpl.prototype.keyToken=ForeignKeyImpl.KEY_TOKEN_EDEFAULT;
        ForeignKeyImpl.ALIAS_TOKEN_EDEFAULT=null;
        ForeignKeyImpl.prototype.aliasToken=ForeignKeyImpl.ALIAS_TOKEN_EDEFAULT;
        ForeignKeyImpl.prototype.keyPath=null;
        function ForeignKeyImpl() {
            SourceRangeImpl.call(this);
        }
        ForeignKeyImpl.prototype.eStaticClass = function() {
            return IAstPackage.Literals.FOREIGN_KEY;
        };
        ForeignKeyImpl.prototype.getKeyToken = function() {
            return this.keyToken;
        };
        ForeignKeyImpl.prototype.setKeyToken = function(newKeyToken) {
            var oldKeyToken=this.keyToken;
            this.keyToken=newKeyToken;
        };
        ForeignKeyImpl.prototype.getAliasToken = function() {
            return this.aliasToken;
        };
        ForeignKeyImpl.prototype.setAliasToken = function(newAliasToken) {
            var oldAliasToken=this.aliasToken;
            this.aliasToken=newAliasToken;
        };
        ForeignKeyImpl.prototype.getKeyPath = function() {
            return this.keyPath;
        };
        ForeignKeyImpl.prototype.basicSetKeyPath = function(newKeyPath,msgs) {
            var oldKeyPath=this.keyPath;
            this.keyPath=newKeyPath;
            return msgs;
        };
        ForeignKeyImpl.prototype.setKeyPath = function(newKeyPath) {
            if (newKeyPath != this.keyPath) {
                var msgs=null;
                if (this.keyPath != null) {

                }
                if (newKeyPath != null) {

                }
                msgs=this.basicSetKeyPath(newKeyPath,msgs);
                if (msgs != null) {
                    msgs.dispatch();
                }
            }
        };
        ForeignKeyImpl.prototype.eInverseRemove = function(otherEnd,featureID,msgs) {
            switch (featureID) {
                case IAstPackage.FOREIGN_KEY__KEY_PATH:
                    return this.basicSetKeyPath(null,msgs);
            }

        };
        ForeignKeyImpl.prototype.getKeyName = function() {
            var path=this.getKeyPath();
            if (path != null) {
                var s=path.getPathString(false);
                return s;
            }
            var kt=this.getKeyToken();
            if (kt != null) {
                return kt.m_lexem;
            }
            return null;
        };
        ForeignKeyImpl.prototype.eGet = function(featureID,resolve,coreType) {
            switch (featureID) {
                case IAstPackage.FOREIGN_KEY__KEY_TOKEN:
                    return this.getKeyToken();
                case IAstPackage.FOREIGN_KEY__ALIAS_TOKEN:
                    return this.getAliasToken();
                case IAstPackage.FOREIGN_KEY__KEY_PATH:
                    return this.getKeyPath();
            }
            return SourceRangeImpl.prototype.eGet.call(this,featureID,resolve,coreType);
        };
        ForeignKeyImpl.prototype.eSet = function(featureID,newValue) {
            switch (featureID) {
                case IAstPackage.FOREIGN_KEY__KEY_TOKEN:
                    this.setKeyToken(newValue);
                    return;
                case IAstPackage.FOREIGN_KEY__ALIAS_TOKEN:
                    this.setAliasToken(newValue);
                    return;
                case IAstPackage.FOREIGN_KEY__KEY_PATH:
                    this.setKeyPath(newValue);
                    return;
            }
            SourceRangeImpl.prototype.eSet.call(this,featureID,newValue);
        };
        ForeignKeyImpl.prototype.eUnset = function(featureID) {
            switch (featureID) {
                case IAstPackage.FOREIGN_KEY__KEY_TOKEN:
                    this.setKeyToken(ForeignKeyImpl.KEY_TOKEN_EDEFAULT);
                    return;
                case IAstPackage.FOREIGN_KEY__ALIAS_TOKEN:
                    this.setAliasToken(ForeignKeyImpl.ALIAS_TOKEN_EDEFAULT);
                    return;
                case IAstPackage.FOREIGN_KEY__KEY_PATH:
                    this.setKeyPath(null);
                    return;
            }
            SourceRangeImpl.prototype.eUnset.call(this,featureID);
        };
        ForeignKeyImpl.prototype.eIsSet = function(featureID) {
            switch (featureID) {
                case IAstPackage.FOREIGN_KEY__KEY_TOKEN:
                    return ForeignKeyImpl.KEY_TOKEN_EDEFAULT == null ? this.keyToken != null : !KEY_TOKEN_EDEFAULT===keyToken;
                case IAstPackage.FOREIGN_KEY__ALIAS_TOKEN:
                    return ForeignKeyImpl.ALIAS_TOKEN_EDEFAULT == null ? this.aliasToken != null : !ALIAS_TOKEN_EDEFAULT===aliasToken;
                case IAstPackage.FOREIGN_KEY__KEY_PATH:
                    return this.keyPath != null;
            }
            return SourceRangeImpl.prototype.eIsSet.call(this,featureID);
        };
        ForeignKeyImpl.prototype.toString = function() {
            if (this.eIsProxy()) {
                return SourceRangeImpl.prototype.toString.call(this);
            }
            var result=new StringBuffer(SourceRangeImpl.prototype.toString.call(this));
            result.append(" (keyToken: ");
            result.append(keyToken);
            result.append(", aliasToken: ");
            result.append(aliasToken);
            result.append(')');
            return result.toString();
        };
        return ForeignKeyImpl;
    }
);
define(
    'commonddl/astmodel/UsingDirectiveImpl',["commonddl/astmodel/DdlStatementImpl","rndrt/rnd"], //dependencies
    function (DdlStatementImpl,rnd) {
        UsingDirectiveImpl.prototype = Object.create(DdlStatementImpl.prototype);
        UsingDirectiveImpl.ALIAS_EDEFAULT=null;
        UsingDirectiveImpl.prototype.alias=UsingDirectiveImpl.ALIAS_EDEFAULT;
        function UsingDirectiveImpl() {
            DdlStatementImpl.call(this);
        }
        UsingDirectiveImpl.prototype.eStaticClass = function() {
            return IAstPackage.Literals.USING_DIRECTIVE;
        };
        UsingDirectiveImpl.prototype.getAlias = function() {
            return this.alias;
        };
        UsingDirectiveImpl.prototype.setAlias = function(newAlias) {
            var oldAlias=this.alias;
            this.alias=newAlias;
        };
        UsingDirectiveImpl.prototype.eGet = function(featureID,resolve,coreType) {
            switch (featureID) {
                case IAstPackage.USING_DIRECTIVE__ALIAS:
                    return this.getAlias();
            }
            return DdlStatementImpl.prototype.eGet.call(this,featureID,resolve,coreType);
        };
        UsingDirectiveImpl.prototype.eSet = function(featureID,newValue) {
            switch (featureID) {
                case IAstPackage.USING_DIRECTIVE__ALIAS:
                    this.setAlias(newValue);
                    return;
            }
            DdlStatementImpl.prototype.eSet.call(this,featureID,newValue);
        };
        UsingDirectiveImpl.prototype.eUnset = function(featureID) {
            switch (featureID) {
                case IAstPackage.USING_DIRECTIVE__ALIAS:
                    this.setAlias(UsingDirectiveImpl.ALIAS_EDEFAULT);
                    return;
            }
            DdlStatementImpl.prototype.eUnset.call(this,featureID);
        };
        UsingDirectiveImpl.prototype.eIsSet = function(featureID) {
            switch (featureID) {
                case IAstPackage.USING_DIRECTIVE__ALIAS:
                    return UsingDirectiveImpl.ALIAS_EDEFAULT == null ? this.alias != null : !ALIAS_EDEFAULT===alias;
            }
            return DdlStatementImpl.prototype.eIsSet.call(this,featureID);
        };
        UsingDirectiveImpl.prototype.toString = function() {
            if (this.eIsProxy()) {
                return DdlStatementImpl.prototype.toString.call(this);
            }
            var result=new rnd.StringBuffer(DdlStatementImpl.prototype.toString.call(this));
            result.append(" (alias: ");
            result.append(alias);
            result.append(')');
            return result.toString();
        };
        UsingDirectiveImpl.prototype.getNameWithNamespaceDelimeter = function() {
            var path=this.getNamePath();
            if (path != null) {
                var ind=path.getLastNamespaceComponentIndex();
                if (ind != null) {
                    var entries=path.getEntries();
                    var result=new rnd.StringBuffer();
                    for (var i=0;i <= ind;i++) {
                        result.append(entries[i].getNameToken().m_lexem);
                        if (i < ind) {
                            result.append(".");
                        }
                    }
                    result.append("::");
                    for (var i=ind + 1;i < entries.length;i++) {
                        result.append(entries[i].getNameToken().m_lexem);
                        if (i < entries.length - 1) {
                            result.append(".");
                        }
                    }
                    return result.toString();
                }else{
                    return this.getName();
                }
            }
            return "";
        };
        return UsingDirectiveImpl;
    }
);
define(
    'commonddl/astmodel/StdFuncExpressionImpl',["commonddl/astmodel/ExpressionImpl"], //dependencies
    function (ExpressionImpl) {
        StdFuncExpressionImpl.prototype = Object.create(ExpressionImpl.prototype);
        StdFuncExpressionImpl.FUNC_NAME_EDEFAULT=null;
        StdFuncExpressionImpl.FUNC_NAME_TOKEN_EDEFAULT=null;
        StdFuncExpressionImpl.prototype.funcNameToken=StdFuncExpressionImpl.FUNC_NAME_TOKEN_EDEFAULT;
        StdFuncExpressionImpl.prototype.parameter=null;
        StdFuncExpressionImpl.DISTINCT_TOKEN_EDEFAULT=null;
        StdFuncExpressionImpl.prototype.distinctToken=StdFuncExpressionImpl.DISTINCT_TOKEN_EDEFAULT;
        StdFuncExpressionImpl.ALL_TOKEN_EDEFAULT=null;
        StdFuncExpressionImpl.prototype.allToken=StdFuncExpressionImpl.ALL_TOKEN_EDEFAULT;
        function StdFuncExpressionImpl() {
            ExpressionImpl.call(this);
        }
        StdFuncExpressionImpl.prototype.eStaticClass = function() {
            return IAstPackage.Literals.STD_FUNC_EXPRESSION;
        };
        StdFuncExpressionImpl.prototype.getFuncName = function() {
            var t=this.getFuncNameToken();
            if (t != null) {
                return t.m_lexem;
            }
            return null;
        };
        StdFuncExpressionImpl.prototype.getFuncNameToken = function() {
            return this.funcNameToken;
        };
        StdFuncExpressionImpl.prototype.setFuncNameToken = function(newFuncNameToken) {
            var oldFuncNameToken=this.funcNameToken;
            this.funcNameToken=newFuncNameToken;
        };
        StdFuncExpressionImpl.prototype.getParameter = function() {
            return this.parameter;
        };
        StdFuncExpressionImpl.prototype.basicSetParameter = function(newParameter,msgs) {
            var oldParameter=this.parameter;
            this.parameter=newParameter;
            this.parameter.setContainer(this);
            return msgs;
        };
        StdFuncExpressionImpl.prototype.setParameter = function(newParameter) {
            if (newParameter != this.parameter) {
                var msgs=null;
                if (this.parameter != null) {

                }
                if (newParameter != null) {

                }
                msgs=this.basicSetParameter(newParameter,msgs);
                if (msgs != null) {
                    msgs.dispatch();
                }
            }
        };
        StdFuncExpressionImpl.prototype.getDistinctToken = function() {
            return this.distinctToken;
        };
        StdFuncExpressionImpl.prototype.setDistinctToken = function(newDistinctToken) {
            var oldDistinctToken=this.distinctToken;
            this.distinctToken=newDistinctToken;
        };
        StdFuncExpressionImpl.prototype.getAllToken = function() {
            return this.allToken;
        };
        StdFuncExpressionImpl.prototype.setAllToken = function(newAllToken) {
            var oldAllToken=this.allToken;
            this.allToken=newAllToken;
        };
        StdFuncExpressionImpl.prototype.eInverseRemove = function(otherEnd,featureID,msgs) {
            switch (featureID) {
                case IAstPackage.STD_FUNC_EXPRESSION__PARAMETER:
                    return this.basicSetParameter(null,msgs);
            }

        };
        StdFuncExpressionImpl.prototype.eGet = function(featureID,resolve,coreType) {
            switch (featureID) {
                case IAstPackage.STD_FUNC_EXPRESSION__FUNC_NAME:
                    return this.getFuncName();
                case IAstPackage.STD_FUNC_EXPRESSION__FUNC_NAME_TOKEN:
                    return this.getFuncNameToken();
                case IAstPackage.STD_FUNC_EXPRESSION__PARAMETER:
                    return this.getParameter();
                case IAstPackage.STD_FUNC_EXPRESSION__DISTINCT_TOKEN:
                    return this.getDistinctToken();
                case IAstPackage.STD_FUNC_EXPRESSION__ALL_TOKEN:
                    return this.getAllToken();
            }
            return ExpressionImpl.prototype.eGet.call(this,featureID,resolve,coreType);
        };
        StdFuncExpressionImpl.prototype.eSet = function(featureID,newValue) {
            switch (featureID) {
                case IAstPackage.STD_FUNC_EXPRESSION__FUNC_NAME_TOKEN:
                    this.setFuncNameToken(newValue);
                    return;
                case IAstPackage.STD_FUNC_EXPRESSION__PARAMETER:
                    this.setParameter(newValue);
                    return;
                case IAstPackage.STD_FUNC_EXPRESSION__DISTINCT_TOKEN:
                    this.setDistinctToken(newValue);
                    return;
                case IAstPackage.STD_FUNC_EXPRESSION__ALL_TOKEN:
                    this.setAllToken(newValue);
                    return;
            }
            ExpressionImpl.prototype.eSet.call(this,featureID,newValue);
        };
        StdFuncExpressionImpl.prototype.eUnset = function(featureID) {
            switch (featureID) {
                case IAstPackage.STD_FUNC_EXPRESSION__FUNC_NAME_TOKEN:
                    this.setFuncNameToken(StdFuncExpressionImpl.FUNC_NAME_TOKEN_EDEFAULT);
                    return;
                case IAstPackage.STD_FUNC_EXPRESSION__PARAMETER:
                    this.setParameter(null);
                    return;
                case IAstPackage.STD_FUNC_EXPRESSION__DISTINCT_TOKEN:
                    this.setDistinctToken(StdFuncExpressionImpl.DISTINCT_TOKEN_EDEFAULT);
                    return;
                case IAstPackage.STD_FUNC_EXPRESSION__ALL_TOKEN:
                    this.setAllToken(StdFuncExpressionImpl.ALL_TOKEN_EDEFAULT);
                    return;
            }
            ExpressionImpl.prototype.eUnset.call(this,featureID);
        };
        StdFuncExpressionImpl.prototype.eIsSet = function(featureID) {
            switch (featureID) {
                case IAstPackage.STD_FUNC_EXPRESSION__FUNC_NAME:
                    return StdFuncExpressionImpl.FUNC_NAME_EDEFAULT == null ? this.getFuncName() != null : !FUNC_NAME_EDEFAULT===this.getFuncName();
                case IAstPackage.STD_FUNC_EXPRESSION__FUNC_NAME_TOKEN:
                    return StdFuncExpressionImpl.FUNC_NAME_TOKEN_EDEFAULT == null ? this.funcNameToken != null : !FUNC_NAME_TOKEN_EDEFAULT===funcNameToken;
                case IAstPackage.STD_FUNC_EXPRESSION__PARAMETER:
                    return this.parameter != null;
                case IAstPackage.STD_FUNC_EXPRESSION__DISTINCT_TOKEN:
                    return StdFuncExpressionImpl.DISTINCT_TOKEN_EDEFAULT == null ? this.distinctToken != null : !DISTINCT_TOKEN_EDEFAULT===distinctToken;
                case IAstPackage.STD_FUNC_EXPRESSION__ALL_TOKEN:
                    return StdFuncExpressionImpl.ALL_TOKEN_EDEFAULT == null ? this.allToken != null : !ALL_TOKEN_EDEFAULT===allToken;
            }
            return ExpressionImpl.prototype.eIsSet.call(this,featureID);
        };
        StdFuncExpressionImpl.prototype.toString = function() {
            if (this.eIsProxy()) {
                return ExpressionImpl.prototype.toString.call(this);
            }
            var result=new StringBuffer(ExpressionImpl.prototype.toString.call(this));
            result.append(" (funcNameToken: ");
            result.append(funcNameToken);
            result.append(", distinctToken: ");
            result.append(distinctToken);
            result.append(", allToken: ");
            result.append(allToken);
            result.append(')');
            return result.toString();
        };
        return StdFuncExpressionImpl;
    }
);
define(
    'commonddl/astmodel/OrderByEntryImpl',["commonddl/astmodel/SourceRangeImpl"], //dependencies
    function (SourceRangeImpl) {
        OrderByEntryImpl.prototype = Object.create(SourceRangeImpl.prototype);
        OrderByEntryImpl.prototype.expression=null;
        OrderByEntryImpl.ORDER_SEQUENCE_TOKEN_EDEFAULT=null;
        OrderByEntryImpl.prototype.orderSequenceToken=OrderByEntryImpl.ORDER_SEQUENCE_TOKEN_EDEFAULT;
        OrderByEntryImpl.NULLS_TOKEN_EDEFAULT=null;
        OrderByEntryImpl.prototype.nullsToken=OrderByEntryImpl.NULLS_TOKEN_EDEFAULT;
        OrderByEntryImpl.NULLS_FIRST_LAST_TOKEN_EDEFAULT=null;
        OrderByEntryImpl.prototype.nullsFirstLastToken=OrderByEntryImpl.NULLS_FIRST_LAST_TOKEN_EDEFAULT;
        function OrderByEntryImpl() {
            SourceRangeImpl.call(this);
        }
        OrderByEntryImpl.prototype.eStaticClass = function() {
            return IAstPackage.Literals.ORDER_BY_ENTRY;
        };
        OrderByEntryImpl.prototype.getExpression = function() {
            return this.expression;
        };
        OrderByEntryImpl.prototype.basicSetExpression = function(newExpression,msgs) {
            var oldExpression=this.expression;
            this.expression=newExpression;
            this.expression.setContainer(this);
            return msgs;
        };
        OrderByEntryImpl.prototype.setExpression = function(newExpression) {
            if (newExpression != this.expression) {
                var msgs=null;
                if (this.expression != null) {

                }
                if (newExpression != null) {

                }
                msgs=this.basicSetExpression(newExpression,msgs);
                if (msgs != null) {
                    msgs.dispatch();
                }
            }
        };
        OrderByEntryImpl.prototype.getOrderSequenceToken = function() {
            return this.orderSequenceToken;
        };
        OrderByEntryImpl.prototype.setOrderSequenceToken = function(newOrderSequenceToken) {
            var oldOrderSequenceToken=this.orderSequenceToken;
            this.orderSequenceToken=newOrderSequenceToken;
        };
        OrderByEntryImpl.prototype.getNullsToken = function() {
            return this.nullsToken;
        };
        OrderByEntryImpl.prototype.setNullsToken = function(newNullsToken) {
            var oldNullsToken=this.nullsToken;
            this.nullsToken=newNullsToken;
        };
        OrderByEntryImpl.prototype.getNullsFirstLastToken = function() {
            return this.nullsFirstLastToken;
        };
        OrderByEntryImpl.prototype.setNullsFirstLastToken = function(newNullsFirstLastToken) {
            var oldNullsFirstLastToken=this.nullsFirstLastToken;
            this.nullsFirstLastToken=newNullsFirstLastToken;
        };
        OrderByEntryImpl.prototype.eInverseRemove = function(otherEnd,featureID,msgs) {
            switch (featureID) {
                case IAstPackage.ORDER_BY_ENTRY__EXPRESSION:
                    return this.basicSetExpression(null,msgs);
            }

        };
        OrderByEntryImpl.prototype.eGet = function(featureID,resolve,coreType) {
            switch (featureID) {
                case IAstPackage.ORDER_BY_ENTRY__EXPRESSION:
                    return this.getExpression();
                case IAstPackage.ORDER_BY_ENTRY__ORDER_SEQUENCE_TOKEN:
                    return this.getOrderSequenceToken();
                case IAstPackage.ORDER_BY_ENTRY__NULLS_TOKEN:
                    return this.getNullsToken();
                case IAstPackage.ORDER_BY_ENTRY__NULLS_FIRST_LAST_TOKEN:
                    return this.getNullsFirstLastToken();
            }
            return SourceRangeImpl.prototype.eGet.call(this,featureID,resolve,coreType);
        };
        OrderByEntryImpl.prototype.eSet = function(featureID,newValue) {
            switch (featureID) {
                case IAstPackage.ORDER_BY_ENTRY__EXPRESSION:
                    this.setExpression(newValue);
                    return;
                case IAstPackage.ORDER_BY_ENTRY__ORDER_SEQUENCE_TOKEN:
                    this.setOrderSequenceToken(newValue);
                    return;
                case IAstPackage.ORDER_BY_ENTRY__NULLS_TOKEN:
                    this.setNullsToken(newValue);
                    return;
                case IAstPackage.ORDER_BY_ENTRY__NULLS_FIRST_LAST_TOKEN:
                    this.setNullsFirstLastToken(newValue);
                    return;
            }
            SourceRangeImpl.prototype.eSet.call(this,featureID,newValue);
        };
        OrderByEntryImpl.prototype.eUnset = function(featureID) {
            switch (featureID) {
                case IAstPackage.ORDER_BY_ENTRY__EXPRESSION:
                    this.setExpression(null);
                    return;
                case IAstPackage.ORDER_BY_ENTRY__ORDER_SEQUENCE_TOKEN:
                    this.setOrderSequenceToken(OrderByEntryImpl.ORDER_SEQUENCE_TOKEN_EDEFAULT);
                    return;
                case IAstPackage.ORDER_BY_ENTRY__NULLS_TOKEN:
                    this.setNullsToken(OrderByEntryImpl.NULLS_TOKEN_EDEFAULT);
                    return;
                case IAstPackage.ORDER_BY_ENTRY__NULLS_FIRST_LAST_TOKEN:
                    this.setNullsFirstLastToken(OrderByEntryImpl.NULLS_FIRST_LAST_TOKEN_EDEFAULT);
                    return;
            }
            SourceRangeImpl.prototype.eUnset.call(this,featureID);
        };
        OrderByEntryImpl.prototype.eIsSet = function(featureID) {
            switch (featureID) {
                case IAstPackage.ORDER_BY_ENTRY__EXPRESSION:
                    return this.expression != null;
                case IAstPackage.ORDER_BY_ENTRY__ORDER_SEQUENCE_TOKEN:
                    return OrderByEntryImpl.ORDER_SEQUENCE_TOKEN_EDEFAULT == null ? this.orderSequenceToken != null : !ORDER_SEQUENCE_TOKEN_EDEFAULT===orderSequenceToken;
                case IAstPackage.ORDER_BY_ENTRY__NULLS_TOKEN:
                    return OrderByEntryImpl.NULLS_TOKEN_EDEFAULT == null ? this.nullsToken != null : !NULLS_TOKEN_EDEFAULT===nullsToken;
                case IAstPackage.ORDER_BY_ENTRY__NULLS_FIRST_LAST_TOKEN:
                    return OrderByEntryImpl.NULLS_FIRST_LAST_TOKEN_EDEFAULT == null ? this.nullsFirstLastToken != null : !NULLS_FIRST_LAST_TOKEN_EDEFAULT===nullsFirstLastToken;
            }
            return SourceRangeImpl.prototype.eIsSet.call(this,featureID);
        };
        OrderByEntryImpl.prototype.toString = function() {
            if (this.eIsProxy()) {
                return SourceRangeImpl.prototype.toString.call(this);
            }
            var result=new StringBuffer(SourceRangeImpl.prototype.toString.call(this));
            result.append(" (orderSequenceToken: ");
            result.append(orderSequenceToken);
            result.append(", nullsToken: ");
            result.append(nullsToken);
            result.append(", nullsFirstLastToken: ");
            result.append(nullsFirstLastToken);
            result.append(')');
            return result.toString();
        };
        return OrderByEntryImpl;
    }
);
define(
    'commonddl/astmodel/ConcatenationExpressionImpl',["commonddl/astmodel/ExpressionImpl"], //dependencies
    function (ExpressionImpl) {
        ConcatenationExpressionImpl.prototype = Object.create(ExpressionImpl.prototype);
        ConcatenationExpressionImpl.prototype.left=null;
        ConcatenationExpressionImpl.prototype.right=null;
        ConcatenationExpressionImpl.OPERATOR_EDEFAULT=null;
        ConcatenationExpressionImpl.prototype.operator=ConcatenationExpressionImpl.OPERATOR_EDEFAULT;
        function ConcatenationExpressionImpl() {
            ExpressionImpl.call(this);
        }
        ConcatenationExpressionImpl.prototype.eStaticClass = function() {
            return IAstPackage.Literals.CONCATENATION_EXPRESSION;
        };
        ConcatenationExpressionImpl.prototype.getLeft = function() {
            return this.left;
        };
        ConcatenationExpressionImpl.prototype.basicSetLeft = function(newLeft,msgs) {
            var oldLeft=this.left;
            this.left=newLeft;
            this.left.setContainer(this);
            return msgs;
        };
        ConcatenationExpressionImpl.prototype.setLeft = function(newLeft) {
            if (newLeft != this.left) {
                var msgs=null;
                if (this.left != null) {

                }
                if (newLeft != null) {

                }
                msgs=this.basicSetLeft(newLeft,msgs);
                if (msgs != null) {
                    msgs.dispatch();
                }
            }
        };
        ConcatenationExpressionImpl.prototype.getRight = function() {
            return this.right;
        };
        ConcatenationExpressionImpl.prototype.basicSetRight = function(newRight,msgs) {
            var oldRight=this.right;
            this.right=newRight;
            this.right.setContainer(this);
            return msgs;
        };
        ConcatenationExpressionImpl.prototype.setRight = function(newRight) {
            if (newRight != this.right) {
                var msgs=null;
                if (this.right != null) {

                }
                if (newRight != null) {

                }
                msgs=this.basicSetRight(newRight,msgs);
                if (msgs != null) {
                    msgs.dispatch();
                }
            }
        };
        ConcatenationExpressionImpl.prototype.getOperator = function() {
            return this.operator;
        };
        ConcatenationExpressionImpl.prototype.setOperator = function(newOperator) {
            var oldOperator=this.operator;
            this.operator=newOperator;
        };
        ConcatenationExpressionImpl.prototype.eInverseRemove = function(otherEnd,featureID,msgs) {
            switch (featureID) {
                case IAstPackage.CONCATENATION_EXPRESSION__LEFT:
                    return this.basicSetLeft(null,msgs);
                case IAstPackage.CONCATENATION_EXPRESSION__RIGHT:
                    return this.basicSetRight(null,msgs);
            }

        };
        ConcatenationExpressionImpl.prototype.eGet = function(featureID,resolve,coreType) {
            switch (featureID) {
                case IAstPackage.CONCATENATION_EXPRESSION__LEFT:
                    return this.getLeft();
                case IAstPackage.CONCATENATION_EXPRESSION__RIGHT:
                    return this.getRight();
                case IAstPackage.CONCATENATION_EXPRESSION__OPERATOR:
                    return this.getOperator();
            }
            return ExpressionImpl.prototype.eGet.call(this,featureID,resolve,coreType);
        };
        ConcatenationExpressionImpl.prototype.eSet = function(featureID,newValue) {
            switch (featureID) {
                case IAstPackage.CONCATENATION_EXPRESSION__LEFT:
                    this.setLeft(newValue);
                    return;
                case IAstPackage.CONCATENATION_EXPRESSION__RIGHT:
                    this.setRight(newValue);
                    return;
                case IAstPackage.CONCATENATION_EXPRESSION__OPERATOR:
                    this.setOperator(newValue);
                    return;
            }
            ExpressionImpl.prototype.eSet.call(this,featureID,newValue);
        };
        ConcatenationExpressionImpl.prototype.eUnset = function(featureID) {
            switch (featureID) {
                case IAstPackage.CONCATENATION_EXPRESSION__LEFT:
                    this.setLeft(null);
                    return;
                case IAstPackage.CONCATENATION_EXPRESSION__RIGHT:
                    this.setRight(null);
                    return;
                case IAstPackage.CONCATENATION_EXPRESSION__OPERATOR:
                    this.setOperator(ConcatenationExpressionImpl.OPERATOR_EDEFAULT);
                    return;
            }
            ExpressionImpl.prototype.eUnset.call(this,featureID);
        };
        ConcatenationExpressionImpl.prototype.eIsSet = function(featureID) {
            switch (featureID) {
                case IAstPackage.CONCATENATION_EXPRESSION__LEFT:
                    return this.left != null;
                case IAstPackage.CONCATENATION_EXPRESSION__RIGHT:
                    return this.right != null;
                case IAstPackage.CONCATENATION_EXPRESSION__OPERATOR:
                    return ConcatenationExpressionImpl.OPERATOR_EDEFAULT == null ? this.operator != null : !OPERATOR_EDEFAULT===operator;
            }
            return ExpressionImpl.prototype.eIsSet.call(this,featureID);
        };
        ConcatenationExpressionImpl.prototype.toString = function() {
            if (this.eIsProxy()) {
                return ExpressionImpl.prototype.toString.call(this);
            }
            var result=new StringBuffer(ExpressionImpl.prototype.toString.call(this));
            result.append(" (operator: ");
            result.append(operator);
            result.append(')');
            return result.toString();
        };
        return ConcatenationExpressionImpl;
    }
);
define(
    'commonddl/astmodel/GroupByImpl',["commonddl/astmodel/SourceRangeImpl","commonddl/astmodel/EObjectContainmentEList"], //dependencies
    function (SourceRangeImpl,EObjectContainmentEList) {
        GroupByImpl.prototype = Object.create(SourceRangeImpl.prototype);
        GroupByImpl.prototype.entries=null;
        function GroupByImpl() {
            SourceRangeImpl.call(this);
        }
        GroupByImpl.prototype.eStaticClass = function() {
            return IAstPackage.Literals.GROUP_BY;
        };
        GroupByImpl.prototype.getEntries = function() {
            if (this.entries == null) {
                this.entries=new EObjectContainmentEList(this);
            }
            return this.entries;
        };
        GroupByImpl.prototype.eInverseRemove = function(otherEnd,featureID,msgs) {
            switch (featureID) {
                case IAstPackage.GROUP_BY__ENTRIES:
                    return (this.getEntries()).basicRemove(otherEnd,msgs);
            }

        };
        GroupByImpl.prototype.eGet = function(featureID,resolve,coreType) {
            switch (featureID) {
                case IAstPackage.GROUP_BY__ENTRIES:
                    return this.getEntries();
            }
            return SourceRangeImpl.prototype.eGet.call(this,featureID,resolve,coreType);
        };
        GroupByImpl.prototype.eSet = function(featureID,newValue) {

        };
        GroupByImpl.prototype.eUnset = function(featureID) {

        };
        GroupByImpl.prototype.eIsSet = function(featureID) {
            switch (featureID) {
                case IAstPackage.GROUP_BY__ENTRIES:
                    return this.entries != null && !this.entries.isEmpty();
            }
            return SourceRangeImpl.prototype.eIsSet.call(this,featureID);
        };
        return GroupByImpl;
    }
);
define(
    'commonddl/astmodel/InExpressionImpl',["commonddl/astmodel/ExpressionImpl","commonddl/astmodel/EObjectContainmentEList"], //dependencies
    function (ExpressionImpl,EObjectContainmentEList) {
        InExpressionImpl.prototype = Object.create(ExpressionImpl.prototype);
        InExpressionImpl.prototype.left=null;
        InExpressionImpl.prototype.ins=null;
        function InExpressionImpl() {
            ExpressionImpl.call(this);
        }
        InExpressionImpl.prototype.eStaticClass = function() {
            return IAstPackage.Literals.IN_EXPRESSION;
        };
        InExpressionImpl.prototype.getLeft = function() {
            return this.left;
        };
        InExpressionImpl.prototype.basicSetLeft = function(newLeft,msgs) {
            var oldLeft=this.left;
            this.left=newLeft;
            return msgs;
        };
        InExpressionImpl.prototype.setLeft = function(newLeft) {
            if (newLeft != this.left) {
                var msgs=null;
                if (this.left != null) {

                }
                if (newLeft != null) {

                }
                msgs=this.basicSetLeft(newLeft,msgs);
                if (msgs != null) {
                    msgs.dispatch();
                }
            }
        };
        InExpressionImpl.prototype.getIns = function() {
            if (this.ins == null) {
                this.ins=new EObjectContainmentEList(this);
            }
            return this.ins;
        };
        InExpressionImpl.prototype.eInverseRemove = function(otherEnd,featureID,msgs) {
            switch (featureID) {
                case IAstPackage.IN_EXPRESSION__LEFT:
                    return this.basicSetLeft(null,msgs);
                case IAstPackage.IN_EXPRESSION__INS:
                    return (this.getIns()).basicRemove(otherEnd,msgs);
            }

        };
        InExpressionImpl.prototype.eGet = function(featureID,resolve,coreType) {
            switch (featureID) {
                case IAstPackage.IN_EXPRESSION__LEFT:
                    return this.getLeft();
                case IAstPackage.IN_EXPRESSION__INS:
                    return this.getIns();
            }
            return ExpressionImpl.prototype.eGet.call(this,featureID,resolve,coreType);
        };
        InExpressionImpl.prototype.eSet = function(featureID,newValue) {

        };
        InExpressionImpl.prototype.eUnset = function(featureID) {

        };
        InExpressionImpl.prototype.eIsSet = function(featureID) {
            switch (featureID) {
                case IAstPackage.IN_EXPRESSION__LEFT:
                    return this.left != null;
                case IAstPackage.IN_EXPRESSION__INS:
                    return this.ins != null && !this.ins.isEmpty();
            }
            return ExpressionImpl.prototype.eIsSet.call(this,featureID);
        };
        return InExpressionImpl;
    }
);
define(
    'commonddl/astmodel/GroupByEntryImpl',["commonddl/astmodel/SourceRangeImpl"], //dependencies
    function (SourceRangeImpl) {
        GroupByEntryImpl.prototype = Object.create(SourceRangeImpl.prototype);
        GroupByEntryImpl.prototype.expression=null;
        function GroupByEntryImpl() {
            SourceRangeImpl.call(this);
        }
        GroupByEntryImpl.prototype.eStaticClass = function() {
            return IAstPackage.Literals.GROUP_BY_ENTRY;
        };
        GroupByEntryImpl.prototype.getExpression = function() {
            return this.expression;
        };
        GroupByEntryImpl.prototype.basicSetExpression = function(newExpression,msgs) {
            var oldExpression=this.expression;
            this.expression=newExpression;
            this.expression.setContainer(this);
            return msgs;
        };
        GroupByEntryImpl.prototype.setExpression = function(newExpression) {
            if (newExpression != this.expression) {
                var msgs=null;
                if (this.expression != null) {

                }
                if (newExpression != null) {

                }
                msgs=this.basicSetExpression(newExpression,msgs);
                if (msgs != null) {
                    msgs.dispatch();
                }
            }
        };
        GroupByEntryImpl.prototype.eInverseRemove = function(otherEnd,featureID,msgs) {
            switch (featureID) {
                case IAstPackage.GROUP_BY_ENTRY__EXPRESSION:
                    return this.basicSetExpression(null,msgs);
            }

        };
        GroupByEntryImpl.prototype.eGet = function(featureID,resolve,coreType) {
            switch (featureID) {
                case IAstPackage.GROUP_BY_ENTRY__EXPRESSION:
                    return this.getExpression();
            }
            return SourceRangeImpl.prototype.eGet.call(this,featureID,resolve,coreType);
        };
        GroupByEntryImpl.prototype.eSet = function(featureID,newValue) {
            switch (featureID) {
                case IAstPackage.GROUP_BY_ENTRY__EXPRESSION:
                    this.setExpression(newValue);
                    return;
            }
            SourceRangeImpl.prototype.eSet.call(this,featureID,newValue);
        };
        GroupByEntryImpl.prototype.eUnset = function(featureID) {
            switch (featureID) {
                case IAstPackage.GROUP_BY_ENTRY__EXPRESSION:
                    this.setExpression(null);
                    return;
            }
            SourceRangeImpl.prototype.eUnset.call(this,featureID);
        };
        GroupByEntryImpl.prototype.eIsSet = function(featureID) {
            switch (featureID) {
                case IAstPackage.GROUP_BY_ENTRY__EXPRESSION:
                    return this.expression != null;
            }
            return SourceRangeImpl.prototype.eIsSet.call(this,featureID);
        };
        return GroupByEntryImpl;
    }
);
define(
    'commonddl/astmodel/LikeExpressionImpl',["commonddl/astmodel/CompExpressionImpl"], //dependencies
    function (CompExpressionImpl) {
        LikeExpressionImpl.prototype = Object.create(CompExpressionImpl.prototype);
        LikeExpressionImpl.ESCAPE_TOKEN_EDEFAULT=null;
        LikeExpressionImpl.prototype.escapeToken=LikeExpressionImpl.ESCAPE_TOKEN_EDEFAULT;
        function LikeExpressionImpl() {
            CompExpressionImpl.call(this);
        }
        LikeExpressionImpl.prototype.eStaticClass = function() {
            return IAstPackage.Literals.LIKE_EXPRESSION;
        };
        LikeExpressionImpl.prototype.getEscapeToken = function() {
            return this.escapeToken;
        };
        LikeExpressionImpl.prototype.setEscapeToken = function(newEscapeToken) {
            var oldEscapeToken=this.escapeToken;
            this.escapeToken=newEscapeToken;
        };
        LikeExpressionImpl.prototype.eGet = function(featureID,resolve,coreType) {
            switch (featureID) {
                case IAstPackage.LIKE_EXPRESSION__ESCAPE_TOKEN:
                    return this.getEscapeToken();
            }
            return CompExpressionImpl.prototype.eGet.call(this,featureID,resolve,coreType);
        };
        LikeExpressionImpl.prototype.eSet = function(featureID,newValue) {
            switch (featureID) {
                case IAstPackage.LIKE_EXPRESSION__ESCAPE_TOKEN:
                    this.setEscapeToken(newValue);
                    return;
            }
            CompExpressionImpl.prototype.eSet.call(this,featureID,newValue);
        };
        LikeExpressionImpl.prototype.eUnset = function(featureID) {
            switch (featureID) {
                case IAstPackage.LIKE_EXPRESSION__ESCAPE_TOKEN:
                    this.setEscapeToken(LikeExpressionImpl.ESCAPE_TOKEN_EDEFAULT);
                    return;
            }
            CompExpressionImpl.prototype.eUnset.call(this,featureID);
        };
        LikeExpressionImpl.prototype.eIsSet = function(featureID) {
            switch (featureID) {
                case IAstPackage.LIKE_EXPRESSION__ESCAPE_TOKEN:
                    return LikeExpressionImpl.ESCAPE_TOKEN_EDEFAULT == null ? this.escapeToken != null : !ESCAPE_TOKEN_EDEFAULT===escapeToken;
            }
            return CompExpressionImpl.prototype.eIsSet.call(this,featureID);
        };
        LikeExpressionImpl.prototype.toString = function() {
            if (this.eIsProxy()) {
                return CompExpressionImpl.prototype.toString.call(this);
            }
            var result=new StringBuffer(CompExpressionImpl.prototype.toString.call(this));
            result.append(" (escapeToken: ");
            result.append(escapeToken);
            result.append(')');
            return result.toString();
        };
        return LikeExpressionImpl;
    }
);
define(
    'commonddl/astmodel/BetweenExpressionImpl',["commonddl/astmodel/ExpressionImpl"], //dependencies
    function (ExpressionImpl) {
        BetweenExpressionImpl.prototype = Object.create(ExpressionImpl.prototype);
        BetweenExpressionImpl.prototype.left=null;
        BetweenExpressionImpl.prototype.lower=null;
        BetweenExpressionImpl.prototype.upper=null;
        function BetweenExpressionImpl() {
            ExpressionImpl.call(this);
        }
        BetweenExpressionImpl.prototype.eStaticClass = function() {
            return IAstPackage.Literals.BETWEEN_EXPRESSION;
        };
        BetweenExpressionImpl.prototype.getLeft = function() {
            return this.left;
        };
        BetweenExpressionImpl.prototype.basicSetLeft = function(newLeft,msgs) {
            var oldLeft=this.left;
            this.left=newLeft;
            this.left.setContainer(this);
            return msgs;
        };
        BetweenExpressionImpl.prototype.setLeft = function(newLeft) {
            if (newLeft != this.left) {
                var msgs=null;
                if (this.left != null) {

                }
                if (newLeft != null) {

                }
                msgs=this.basicSetLeft(newLeft,msgs);
                if (msgs != null) {
                    msgs.dispatch();
                }
            }
        };
        BetweenExpressionImpl.prototype.getLower = function() {
            return this.lower;
        };
        BetweenExpressionImpl.prototype.basicSetLower = function(newLower,msgs) {
            var oldLower=this.lower;
            this.lower=newLower;
            this.lower.setContainer(this);
            return msgs;
        };
        BetweenExpressionImpl.prototype.setLower = function(newLower) {
            if (newLower != this.lower) {
                var msgs=null;
                if (this.lower != null) {

                }
                if (newLower != null) {

                }
                msgs=this.basicSetLower(newLower,msgs);
                if (msgs != null) {
                    msgs.dispatch();
                }
            }
        };
        BetweenExpressionImpl.prototype.getUpper = function() {
            return this.upper;
        };
        BetweenExpressionImpl.prototype.basicSetUpper = function(newUpper,msgs) {
            var oldUpper=this.upper;
            this.upper=newUpper;
            this.upper.setContainer(this);
            return msgs;
        };
        BetweenExpressionImpl.prototype.setUpper = function(newUpper) {
            if (newUpper != this.upper) {
                var msgs=null;
                if (this.upper != null) {

                }
                if (newUpper != null) {

                }
                msgs=this.basicSetUpper(newUpper,msgs);
                if (msgs != null) {
                    msgs.dispatch();
                }
            }
        };
        BetweenExpressionImpl.prototype.eInverseRemove = function(otherEnd,featureID,msgs) {
            switch (featureID) {
                case IAstPackage.BETWEEN_EXPRESSION__LEFT:
                    return this.basicSetLeft(null,msgs);
                case IAstPackage.BETWEEN_EXPRESSION__LOWER:
                    return this.basicSetLower(null,msgs);
                case IAstPackage.BETWEEN_EXPRESSION__UPPER:
                    return this.basicSetUpper(null,msgs);
            }

        };
        BetweenExpressionImpl.prototype.eGet = function(featureID,resolve,coreType) {
            switch (featureID) {
                case IAstPackage.BETWEEN_EXPRESSION__LEFT:
                    return this.getLeft();
                case IAstPackage.BETWEEN_EXPRESSION__LOWER:
                    return this.getLower();
                case IAstPackage.BETWEEN_EXPRESSION__UPPER:
                    return this.getUpper();
            }
            return ExpressionImpl.prototype.eGet.call(this,featureID,resolve,coreType);
        };
        BetweenExpressionImpl.prototype.eSet = function(featureID,newValue) {
            switch (featureID) {
                case IAstPackage.BETWEEN_EXPRESSION__LEFT:
                    this.setLeft(newValue);
                    return;
                case IAstPackage.BETWEEN_EXPRESSION__LOWER:
                    this.setLower(newValue);
                    return;
                case IAstPackage.BETWEEN_EXPRESSION__UPPER:
                    this.setUpper(newValue);
                    return;
            }
            ExpressionImpl.prototype.eSet.call(this,featureID,newValue);
        };
        BetweenExpressionImpl.prototype.eUnset = function(featureID) {
            switch (featureID) {
                case IAstPackage.BETWEEN_EXPRESSION__LEFT:
                    this.setLeft(null);
                    return;
                case IAstPackage.BETWEEN_EXPRESSION__LOWER:
                    this.setLower(null);
                    return;
                case IAstPackage.BETWEEN_EXPRESSION__UPPER:
                    this.setUpper(null);
                    return;
            }
            ExpressionImpl.prototype.eUnset.call(this,featureID);
        };
        BetweenExpressionImpl.prototype.eIsSet = function(featureID) {
            switch (featureID) {
                case IAstPackage.BETWEEN_EXPRESSION__LEFT:
                    return this.left != null;
                case IAstPackage.BETWEEN_EXPRESSION__LOWER:
                    return this.lower != null;
                case IAstPackage.BETWEEN_EXPRESSION__UPPER:
                    return this.upper != null;
            }
            return ExpressionImpl.prototype.eIsSet.call(this,featureID);
        };
        return BetweenExpressionImpl;
    }
);
define(
    'commonddl/astmodel/NullExpressionImpl',["commonddl/astmodel/ExpressionImpl"], //dependencies
    function (ExpressionImpl) {
        NullExpressionImpl.prototype = Object.create(ExpressionImpl.prototype);
        NullExpressionImpl.prototype.left=null;
        NullExpressionImpl.NOT_EDEFAULT=false;
        NullExpressionImpl.prototype.not=NullExpressionImpl.NOT_EDEFAULT;
        function NullExpressionImpl() {
            ExpressionImpl.call(this);
        }
        NullExpressionImpl.prototype.eStaticClass = function() {
            return IAstPackage.Literals.NULL_EXPRESSION;
        };
        NullExpressionImpl.prototype.getLeft = function() {
            return this.left;
        };
        NullExpressionImpl.prototype.basicSetLeft = function(newLeft,msgs) {
            var oldLeft=this.left;
            this.left=newLeft;
            this.left.setContainer(this);
            return msgs;
        };
        NullExpressionImpl.prototype.setLeft = function(newLeft) {
            if (newLeft != this.left) {
                var msgs=null;
                if (this.left != null) {

                }
                if (newLeft != null) {

                }
                msgs=this.basicSetLeft(newLeft,msgs);
                if (msgs != null) {
                    msgs.dispatch();
                }
            }
        };
        NullExpressionImpl.prototype.isNot = function() {
            return this.not;
        };
        NullExpressionImpl.prototype.setNot = function(newNot) {
            var oldNot=this.not;
            this.not=newNot;
        };
        NullExpressionImpl.prototype.eInverseRemove = function(otherEnd,featureID,msgs) {
            switch (featureID) {
                case IAstPackage.NULL_EXPRESSION__LEFT:
                    return this.basicSetLeft(null,msgs);
            }

        };
        NullExpressionImpl.prototype.eGet = function(featureID,resolve,coreType) {
            switch (featureID) {
                case IAstPackage.NULL_EXPRESSION__LEFT:
                    return this.getLeft();
                case IAstPackage.NULL_EXPRESSION__NOT:
                    return this.isNot();
            }
            return ExpressionImpl.prototype.eGet.call(this,featureID,resolve,coreType);
        };
        NullExpressionImpl.prototype.eSet = function(featureID,newValue) {
            switch (featureID) {
                case IAstPackage.NULL_EXPRESSION__LEFT:
                    this.setLeft(newValue);
                    return;
                case IAstPackage.NULL_EXPRESSION__NOT:
                    this.setNot(newValue);
                    return;
            }
            ExpressionImpl.prototype.eSet.call(this,featureID,newValue);
        };
        NullExpressionImpl.prototype.eUnset = function(featureID) {
            switch (featureID) {
                case IAstPackage.NULL_EXPRESSION__LEFT:
                    this.setLeft(null);
                    return;
                case IAstPackage.NULL_EXPRESSION__NOT:
                    this.setNot(NullExpressionImpl.NOT_EDEFAULT);
                    return;
            }
            ExpressionImpl.prototype.eUnset.call(this,featureID);
        };
        NullExpressionImpl.prototype.eIsSet = function(featureID) {
            switch (featureID) {
                case IAstPackage.NULL_EXPRESSION__LEFT:
                    return this.left != null;
                case IAstPackage.NULL_EXPRESSION__NOT:
                    return this.not != NullExpressionImpl.NOT_EDEFAULT;
            }
            return ExpressionImpl.prototype.eIsSet.call(this,featureID);
        };
        NullExpressionImpl.prototype.toString = function() {
            if (this.eIsProxy()) {
                return ExpressionImpl.prototype.toString.call(this);
            }
            var result=new StringBuffer(ExpressionImpl.prototype.toString.call(this));
            result.append(" (not: ");
            result.append(not);
            result.append(')');
            return result.toString();
        };
        return NullExpressionImpl;
    }
);
define(
    'commonddl/astmodel/FuncExpressionImpl',["commonddl/astmodel/ExpressionImpl","commonddl/astmodel/EObjectContainmentEList"], //dependencies
    function (ExpressionImpl,EObjectContainmentEList) {
        FuncExpressionImpl.prototype = Object.create(ExpressionImpl.prototype);
        FuncExpressionImpl.NAME_EDEFAULT=null;
        FuncExpressionImpl.prototype.name=FuncExpressionImpl.NAME_EDEFAULT;
        FuncExpressionImpl.prototype.parameters=null;
        function FuncExpressionImpl() {
            ExpressionImpl.call(this);
        }
        FuncExpressionImpl.prototype.eStaticClass = function() {
            return IAstPackage.Literals.FUNC_EXPRESSION;
        };
        FuncExpressionImpl.prototype.getName = function() {
            return this.name;
        };
        FuncExpressionImpl.prototype.setName = function(newName) {
            var oldName=this.name;
            this.name=newName;
        };
        FuncExpressionImpl.prototype.getParameters = function() {
            if (this.parameters == null) {
                this.parameters=new EObjectContainmentEList(this);
            }
            return this.parameters;
        };
        FuncExpressionImpl.prototype.eInverseRemove = function(otherEnd,featureID,msgs) {
            switch (featureID) {
                case IAstPackage.FUNC_EXPRESSION__PARAMETERS:
                    return (this.getParameters()).basicRemove(otherEnd,msgs);
            }

        };
        FuncExpressionImpl.prototype.eGet = function(featureID,resolve,coreType) {
            switch (featureID) {
                case IAstPackage.FUNC_EXPRESSION__NAME:
                    return this.getName();
                case IAstPackage.FUNC_EXPRESSION__PARAMETERS:
                    return this.getParameters();
            }
            return ExpressionImpl.prototype.eGet.call(this,featureID,resolve,coreType);
        };
        FuncExpressionImpl.prototype.eSet = function(featureID,newValue) {

        };
        FuncExpressionImpl.prototype.eUnset = function(featureID) {

        };
        FuncExpressionImpl.prototype.eIsSet = function(featureID) {
            switch (featureID) {
                case IAstPackage.FUNC_EXPRESSION__NAME:
                    return FuncExpressionImpl.NAME_EDEFAULT == null ? this.name != null : !NAME_EDEFAULT===name;
                case IAstPackage.FUNC_EXPRESSION__PARAMETERS:
                    return this.parameters != null && !this.parameters.isEmpty();
            }
            return ExpressionImpl.prototype.eIsSet.call(this,featureID);
        };
        FuncExpressionImpl.prototype.toString = function() {
            if (this.eIsProxy()) {
                return ExpressionImpl.prototype.toString.call(this);
            }
            var result=new StringBuffer(ExpressionImpl.prototype.toString.call(this));
            result.append(" (name: ");
            result.append(name);
            result.append(')');
            return result.toString();
        };
        return FuncExpressionImpl;
    }
);
define(
    'commonddl/astmodel/NamesImpl',[
        "rndrt/rnd",
        "commonddl/astmodel/EObjectImpl",
        "require",
        "commonddl/astmodel/EObjectContainmentEList"
    ], //dependencies
    function (
        rnd,
        EObjectImpl,
        require,
        EObjectContainmentEList
        ) {
        var Token = rnd.Token;
        var StringBuffer = rnd.StringBuffer;
        NamesImpl.prototype = Object.create(EObjectImpl.prototype);
        NamesImpl.prototype.names=null;
        NamesImpl.prototype.viewColumnNames=null;
        function NamesImpl() {
            EObjectImpl.call(this);
        }
        NamesImpl.prototype.eStaticClass = function() {
            return IAstPackage.Literals.NAMES;
        };
        NamesImpl.prototype.getNames = function() {
            if (this.names == null) {
                this.names = new EObjectContainmentEList(this);
            }
            return this.names;
        };
        NamesImpl.prototype.getViewColumnNames = function() {
            if (this.viewColumnNames == null) {
                this.viewColumnNames=new EObjectContainmentEList(this);
                if (this.names != null) {
                    for (var tkCount=0;tkCount<this.names.length;tkCount++) {
                        var tk=this.names[tkCount];
                        var IAstFactory = require("commonddl/astmodel/IAstFactory");
                        var colnName=IAstFactory.eINSTANCE.createViewColumnName();
                        colnName.setNameToken(tk);
                        this.viewColumnNames.push(colnName);
                    }
                }
            }
            return this.viewColumnNames;
        };
        NamesImpl.prototype.add = function(name) {
            this.getNames().push(name);
        };
        NamesImpl.prototype.eInverseRemove = function(otherEnd,featureID,msgs) {
            switch (featureID) {
                case IAstPackage.NAMES__VIEW_COLUMN_NAMES:
                    return (this.getViewColumnNames()).basicRemove(otherEnd,msgs);
            }

        };

        NamesImpl.prototype.eGet = function(featureID,resolve,coreType) {
            switch (featureID) {
                case IAstPackage.NAMES__NAMES:
                    return this.getNames();
                case IAstPackage.NAMES__VIEW_COLUMN_NAMES:
                    return this.getViewColumnNames();
            }
            return EObjectImpl.prototype.eGet.call(this,featureID,resolve,coreType);
        };
        NamesImpl.prototype.eSet = function(featureID,newValue) {
        };
        NamesImpl.prototype.eUnset = function(featureID) {
        };
        NamesImpl.prototype.eIsSet = function(featureID) {
        };
        NamesImpl.prototype.toString = function() {
        };
        return NamesImpl;
    }
);
define(
    'commonddl/TokenUtil',["rndrt/rnd"], //dependencies
    function (rnd) {
        var Utils = rnd.Utils;

        function TokenUtil() {
        }

        TokenUtil.aliasNamePrefix="alias";
        TokenUtil.getTokenByOffset = function(tokens,offset) {
            if (tokens == null || tokens.size() == 0) {
                return null;
            }
            for (var tokenCount=0;tokenCount<tokens.length;tokenCount++) {
                var token=tokens[tokenCount];
                if (TokenUtil.isInToken(offset,token)) {
                    return token;
                }
            }
            return null;
        };
        TokenUtil.isInToken = function(offset,t) {
            return offset >= t.m_offset && offset <= t.m_offset + t.m_lexem.length;
        };
        TokenUtil.getTokenByName = function(tokens,name) {
            for (var tokenCount=0;tokenCount<tokens.length;tokenCount++) {
                var token=tokens[tokenCount];
                if (token == null) {
                    continue;
                }
                if (Utils.stringEqualsIgnoreCase(name, token.m_lexem)) {
                    return token;
                }
            }
            return null;
        };
        TokenUtil.getTokenLexem = function(tokenAsObject) {
            var token=TokenUtil.toToken(tokenAsObject);
            if (token != null) {
                return token.getM_lexem();
            }
            return null;
        };
        TokenUtil.getUniqueAliasName = function(tokens) {
            var i=1;
            var newAlias=TokenUtil.aliasNamePrefix + i;
            var token=TokenUtil.getTokenByName(tokens,newAlias);
            while (token != null) {
                i++;
                newAlias=TokenUtil.aliasNamePrefix + i;
                token=TokenUtil.getTokenByName(tokens,newAlias);
            }
            return newAlias;
        };
        TokenUtil.toToken = function(tokenAsObject) {
            if (tokenAsObject instanceof rnd.Token) {
                return tokenAsObject;
            }
            return null;
        };
        TokenUtil.getPreviousTokenIgnoringNLAndComment = function(tokens,tokenIndex) {
            var previousTokenIndex=tokenIndex;
            var tok=tokens[previousTokenIndex];
            while (tok.m_category===rnd.Category.CAT_WS || tok.m_category===rnd.Category.CAT_COMMENT) {
                previousTokenIndex--;
                if (previousTokenIndex < 0) {
                    return null;
                }
                tok=tokens[previousTokenIndex];
            }
            return tok;
        };
        TokenUtil.getNextTokenIgnoringNLAndComment = function(tokens,tokenIndex) {
            var nextTokenIndex=tokenIndex;
            var tok=tokens[nextTokenIndex];
            while (tok.m_category===rnd.Category.CAT_WS || tok.m_category===rnd.Category.CAT_COMMENT) {
                nextTokenIndex++;
                if (nextTokenIndex >= tokens.length) {
                    return null;
                }
                tok=tokens[nextTokenIndex];
            }
            return tok;
        };
        TokenUtil.getNextTokenIndexIgnoringNLAndComment = function(tokens,tokenIndex) {
            var nextTokenIndex=tokenIndex;
            var tok=tokens[nextTokenIndex];
            while (tok.m_category===rnd.Category.CAT_WS || tok.m_category===rnd.Category.CAT_COMMENT) {
                nextTokenIndex++;
                if (nextTokenIndex >= tokens.length) {
                    return -1;
                }
                tok=tokens[nextTokenIndex];
            }
            return nextTokenIndex;
        };

        return TokenUtil;
    }
);
define(
    'commonddl/astmodel/ViewColumnNameImpl',[
        "rndrt/rnd",
        "commonddl/TokenUtil",
        "commonddl/astmodel/EObjectImpl"
    ], //dependencies
    function (
        rnd,
        TokenUtil,
        EObjectImpl
        ) {
        var Token = rnd.Token;
        var StringBuffer = rnd.StringBuffer;
        ViewColumnNameImpl.prototype = Object.create(EObjectImpl.prototype);
        ViewColumnNameImpl.NAME_TOKEN_EDEFAULT=null;
        ViewColumnNameImpl.prototype.nameToken=ViewColumnNameImpl.NAME_TOKEN_EDEFAULT;
        ViewColumnNameImpl.NAME_EDEFAULT=null;
        function ViewColumnNameImpl() {
            EObjectImpl.call(this);
        }
        ViewColumnNameImpl.prototype.eStaticClass = function() {
            return IAstPackage.Literals.VIEW_COLUMN_NAME;
        };
        ViewColumnNameImpl.prototype.getNameToken = function() {
            return this.nameToken;
        };
        ViewColumnNameImpl.prototype.setNameToken = function(newNameToken) {
            var oldNameToken=this.nameToken;
            this.nameToken=newNameToken;
        };
        ViewColumnNameImpl.prototype.getName = function() {
            return TokenUtil.getTokenLexem(this.getNameToken());
        };
        ViewColumnNameImpl.prototype.eGet = function(featureID,resolve,coreType) {
            switch (featureID) {
                case IAstPackage.VIEW_COLUMN_NAME__NAME_TOKEN:
                    return this.getNameToken();
                case IAstPackage.VIEW_COLUMN_NAME__NAME:
                    return this.getName();
            }
            return EObjectImpl.prototype.eGet.call(this,featureID,resolve,coreType);
        };
        ViewColumnNameImpl.prototype.eSet = function(featureID,newValue) {
            switch (featureID) {
                case IAstPackage.VIEW_COLUMN_NAME__NAME_TOKEN:
                    this.setNameToken(newValue);
                    return;
            }
            EObjectImpl.prototype.eSet.call(this,featureID,newValue);
        };
        ViewColumnNameImpl.prototype.eUnset = function(featureID) {
            switch (featureID) {
                case IAstPackage.VIEW_COLUMN_NAME__NAME_TOKEN:
                    this.setNameToken(ViewColumnNameImpl.NAME_TOKEN_EDEFAULT);
                    return;
            }
            EObjectImpl.prototype.eUnset.call(this,featureID);
        };
        ViewColumnNameImpl.prototype.eIsSet = function(featureID) {
            switch (featureID) {
                case IAstPackage.VIEW_COLUMN_NAME__NAME_TOKEN:
                    return ViewColumnNameImpl.NAME_TOKEN_EDEFAULT == null ? this.nameToken != null : !NAME_TOKEN_EDEFAULT===nameToken;
                case IAstPackage.VIEW_COLUMN_NAME__NAME:
                    return ViewColumnNameImpl.NAME_EDEFAULT == null ? this.getName() != null : !NAME_EDEFAULT===this.getName();
            }
            return EObjectImpl.prototype.eIsSet.call(this,featureID);
        };
        ViewColumnNameImpl.prototype.toString = function() {
            if (this.eIsProxy()) {
                return EObjectImpl.prototype.toString.call(this);
            }
            var result=new StringBuffer(EObjectImpl.prototype.toString.call(this));
            result.append(" (nameToken: ");
            result.append(nameToken);
            result.append(')');
            return result.toString();
        };
        return ViewColumnNameImpl;
    }
);
define(
    'commonddl/astmodel/CaseExpressionImpl',[
        "commonddl/astmodel/ExpressionImpl",
        "commonddl/astmodel/EObjectContainmentEList"
    ], //dependencies
    function (
        ExpressionImpl,
        EObjectContainmentEList
        ) {
        CaseExpressionImpl.prototype = Object.create(ExpressionImpl.prototype);
        CaseExpressionImpl.prototype.elseExpression=null;
        CaseExpressionImpl.prototype.whenExpressions=null;
        function CaseExpressionImpl() {
            ExpressionImpl.call(this);
        }
        CaseExpressionImpl.prototype.eStaticClass = function() {
            return IAstPackage.Literals.CASE_EXPRESSION;
        };
        CaseExpressionImpl.prototype.getElseExpression = function() {
            return this.elseExpression;
        };
        CaseExpressionImpl.prototype.basicSetElseExpression = function(newElseExpression,msgs) {
            var oldElseExpression=this.elseExpression;
            this.elseExpression=newElseExpression;
            this.elseExpression.setContainer(this);
            return msgs;
        };
        CaseExpressionImpl.prototype.setElseExpression = function(newElseExpression) {
            if (newElseExpression != this.elseExpression) {
                var msgs=null;
                if (this.elseExpression != null) {

                }
                if (newElseExpression != null) {

                }
                msgs=this.basicSetElseExpression(newElseExpression,msgs);
                if (msgs != null) {
                    msgs.dispatch();
                }
            }
        };
        CaseExpressionImpl.prototype.getWhenExpressions = function() {
            if (this.whenExpressions == null) {
                this.whenExpressions=new EObjectContainmentEList(this);
            }
            return this.whenExpressions;
        };
        CaseExpressionImpl.prototype.eInverseRemove = function(otherEnd,featureID,msgs) {
            switch (featureID) {
                case IAstPackage.CASE_EXPRESSION__ELSE_EXPRESSION:
                    return this.basicSetElseExpression(null,msgs);
                case IAstPackage.CASE_EXPRESSION__WHEN_EXPRESSIONS:
                    return (this.getWhenExpressions()).basicRemove(otherEnd,msgs);
            }

        };
        CaseExpressionImpl.prototype.eGet = function(featureID,resolve,coreType) {
            switch (featureID) {
                case IAstPackage.CASE_EXPRESSION__ELSE_EXPRESSION:
                    return this.getElseExpression();
                case IAstPackage.CASE_EXPRESSION__WHEN_EXPRESSIONS:
                    return this.getWhenExpressions();
            }
            return ExpressionImpl.prototype.eGet.call(this,featureID,resolve,coreType);
        };
        CaseExpressionImpl.prototype.eSet = function(featureID,newValue) {
        };
        CaseExpressionImpl.prototype.eUnset = function(featureID) {
        };
        CaseExpressionImpl.prototype.eIsSet = function(featureID) {
        };
        return CaseExpressionImpl;
    }
);
define(
    'commonddl/astmodel/SimpleCaseExpressionImpl',[
        "commonddl/astmodel/ExpressionImpl",
        "commonddl/astmodel/CaseExpressionImpl"
    ], //dependencies
    function (
        ExpressionImpl,
        CaseExpressionImpl
        ) {
        SimpleCaseExpressionImpl.prototype = Object.create(CaseExpressionImpl.prototype);
        SimpleCaseExpressionImpl.prototype.caseExpression=null;
        function SimpleCaseExpressionImpl() {
            CaseExpressionImpl.call(this);
        }
        SimpleCaseExpressionImpl.prototype.eStaticClass = function() {
            return IAstPackage.Literals.SIMPLE_CASE_EXPRESSION;
        };
        SimpleCaseExpressionImpl.prototype.getCaseExpression = function() {
            return this.caseExpression;
        };
        SimpleCaseExpressionImpl.prototype.basicSetCaseExpression = function(newCaseExpression,msgs) {
            var oldCaseExpression=this.caseExpression;
            this.caseExpression=newCaseExpression;
            this.caseExpression.setContainer(this);
            return msgs;
        };
        SimpleCaseExpressionImpl.prototype.setCaseExpression = function(newCaseExpression) {
            if (newCaseExpression != this.caseExpression) {
                var msgs=null;
                if (this.caseExpression != null) {

                }
                if (newCaseExpression != null) {

                }
                msgs=this.basicSetCaseExpression(newCaseExpression,msgs);
                if (msgs != null) {
                    msgs.dispatch();
                }
            }
        };
        SimpleCaseExpressionImpl.prototype.eInverseRemove = function(otherEnd,featureID,msgs) {
            switch (featureID) {
                case IAstPackage.SIMPLE_CASE_EXPRESSION__CASE_EXPRESSION:
                    return this.basicSetCaseExpression(null,msgs);
            }

        };
        SimpleCaseExpressionImpl.prototype.eGet = function(featureID,resolve,coreType) {
            switch (featureID) {
                case IAstPackage.SIMPLE_CASE_EXPRESSION__CASE_EXPRESSION:
                    return this.getCaseExpression();
            }
            return CaseExpressionImpl.prototype.eGet.call(this,featureID,resolve,coreType);
        };
        SimpleCaseExpressionImpl.prototype.eSet = function(featureID,newValue) {
            switch (featureID) {
                case IAstPackage.SIMPLE_CASE_EXPRESSION__CASE_EXPRESSION:
                    this.setCaseExpression(newValue);
                    return;
            }
            CaseExpressionImpl.prototype.eSet.call(this,featureID,newValue);
        };
        SimpleCaseExpressionImpl.prototype.eUnset = function(featureID) {
            switch (featureID) {
                case IAstPackage.SIMPLE_CASE_EXPRESSION__CASE_EXPRESSION:
                    this.setCaseExpression(null);
                    return;
            }
            CaseExpressionImpl.prototype.eUnset.call(this,featureID);
        };
        SimpleCaseExpressionImpl.prototype.eIsSet = function(featureID) {
            switch (featureID) {
                case IAstPackage.SIMPLE_CASE_EXPRESSION__CASE_EXPRESSION:
                    return this.caseExpression != null;
            }
            return CaseExpressionImpl.prototype.eIsSet.call(this,featureID);
        };
        return SimpleCaseExpressionImpl;
    }
);
define(
    'commonddl/astmodel/CaseWhenExpressionImpl',[
        "commonddl/astmodel/ExpressionImpl"
    ], //dependencies
    function (
        ExpressionImpl
        ) {
        CaseWhenExpressionImpl.prototype = Object.create(ExpressionImpl.prototype);
        CaseWhenExpressionImpl.prototype.whenExpression=null;
        CaseWhenExpressionImpl.prototype.thenExpression=null;
        function CaseWhenExpressionImpl() {
            ExpressionImpl.call(this);
        }
        CaseWhenExpressionImpl.prototype.eStaticClass = function() {
            return IAstPackage.Literals.CASE_WHEN_EXPRESSION;
        };
        CaseWhenExpressionImpl.prototype.getWhenExpression = function() {
            return this.whenExpression;
        };
        CaseWhenExpressionImpl.prototype.basicSetWhenExpression = function(newWhenExpression,msgs) {
            var oldWhenExpression=this.whenExpression;
            this.whenExpression=newWhenExpression;
            this.whenExpression.setContainer(this);
            return msgs;
        };
        CaseWhenExpressionImpl.prototype.setWhenExpression = function(newWhenExpression) {
            if (newWhenExpression != this.whenExpression) {
                var msgs=null;
                if (this.whenExpression != null) {

                }
                if (newWhenExpression != null) {

                }
                msgs=this.basicSetWhenExpression(newWhenExpression,msgs);
                if (msgs != null) {
                    msgs.dispatch();
                }
            }
        };
        CaseWhenExpressionImpl.prototype.getThenExpression = function() {
            return this.thenExpression;
        };
        CaseWhenExpressionImpl.prototype.basicSetThenExpression = function(newThenExpression,msgs) {
            var oldThenExpression=this.thenExpression;
            this.thenExpression=newThenExpression;
            this.thenExpression.setContainer(this);
            return msgs;
        };
        CaseWhenExpressionImpl.prototype.setThenExpression = function(newThenExpression) {
            if (newThenExpression != this.thenExpression) {
                var msgs=null;
                if (this.thenExpression != null) {

                }
                if (newThenExpression != null) {

                }
                msgs=this.basicSetThenExpression(newThenExpression,msgs);
                if (msgs != null) {
                    msgs.dispatch();
                }
            }
        };
        CaseWhenExpressionImpl.prototype.eInverseRemove = function(otherEnd,featureID,msgs) {
            switch (featureID) {
                case IAstPackage.CASE_WHEN_EXPRESSION__WHEN_EXPRESSION:
                    return this.basicSetWhenExpression(null,msgs);
                case IAstPackage.CASE_WHEN_EXPRESSION__THEN_EXPRESSION:
                    return this.basicSetThenExpression(null,msgs);
            }

        };
        CaseWhenExpressionImpl.prototype.eGet = function(featureID,resolve,coreType) {
            switch (featureID) {
                case IAstPackage.CASE_WHEN_EXPRESSION__WHEN_EXPRESSION:
                    return this.getWhenExpression();
                case IAstPackage.CASE_WHEN_EXPRESSION__THEN_EXPRESSION:
                    return this.getThenExpression();
            }
            return ExpressionImpl.prototype.eGet.call(this,featureID,resolve,coreType);
        };
        CaseWhenExpressionImpl.prototype.eSet = function(featureID,newValue) {
            switch (featureID) {
                case IAstPackage.CASE_WHEN_EXPRESSION__WHEN_EXPRESSION:
                    this.setWhenExpression(newValue);
                    return;
                case IAstPackage.CASE_WHEN_EXPRESSION__THEN_EXPRESSION:
                    this.setThenExpression(newValue);
                    return;
            }
            ExpressionImpl.prototype.eSet.call(this,featureID,newValue);
        };
        CaseWhenExpressionImpl.prototype.eUnset = function(featureID) {
            switch (featureID) {
                case IAstPackage.CASE_WHEN_EXPRESSION__WHEN_EXPRESSION:
                    this.setWhenExpression(null);
                    return;
                case IAstPackage.CASE_WHEN_EXPRESSION__THEN_EXPRESSION:
                    this.setThenExpression(null);
                    return;
            }
            ExpressionImpl.prototype.eUnset.call(this,featureID);
        };
        CaseWhenExpressionImpl.prototype.eIsSet = function(featureID) {
            switch (featureID) {
                case IAstPackage.CASE_WHEN_EXPRESSION__WHEN_EXPRESSION:
                    return this.whenExpression != null;
                case IAstPackage.CASE_WHEN_EXPRESSION__THEN_EXPRESSION:
                    return this.thenExpression != null;
            }
            return ExpressionImpl.prototype.eIsSet.call(this,featureID);
        };
        return CaseWhenExpressionImpl;
    }
);
define(
    'commonddl/astmodel/ArithmeticExpressionImpl',[
        "commonddl/astmodel/ExpressionImpl",
        "rndrt/rnd"
    ], //dependencies
    function (
        ExpressionImpl,
        rnd
        ) {
        var Token = rnd.Token;
        var StringBuffer = rnd.StringBuffer;
        ArithmeticExpressionImpl.prototype = Object.create(ExpressionImpl.prototype);
        ArithmeticExpressionImpl.prototype.left=null;
        ArithmeticExpressionImpl.prototype.right=null;
        ArithmeticExpressionImpl.OPERATOR_EDEFAULT=null;
        ArithmeticExpressionImpl.prototype.operator=ArithmeticExpressionImpl.OPERATOR_EDEFAULT;
        function ArithmeticExpressionImpl() {
            ExpressionImpl.call(this);
        }
        ArithmeticExpressionImpl.prototype.eStaticClass = function() {
            return IAstPackage.Literals.ARITHMETIC_EXPRESSION;
        };
        ArithmeticExpressionImpl.prototype.getLeft = function() {
            return this.left;
        };
        ArithmeticExpressionImpl.prototype.basicSetLeft = function(newLeft,msgs) {
            var oldLeft=this.left;
            this.left=newLeft;
            this.left.setContainer(this);
            return msgs;
        };
        ArithmeticExpressionImpl.prototype.setLeft = function(newLeft) {
            if (newLeft != this.left) {
                var msgs=null;
                if (this.left != null) {

                }
                if (newLeft != null) {

                }
                msgs=this.basicSetLeft(newLeft,msgs);
                if (msgs != null) {
                    msgs.dispatch();
                }
            }
        };
        ArithmeticExpressionImpl.prototype.getRight = function() {
            return this.right;
        };
        ArithmeticExpressionImpl.prototype.basicSetRight = function(newRight,msgs) {
            var oldRight=this.right;
            this.right=newRight;
            this.right.setContainer(this);
            return msgs;
        };
        ArithmeticExpressionImpl.prototype.setRight = function(newRight) {
            if (newRight != this.right) {
                var msgs=null;
                if (this.right != null) {

                }
                if (newRight != null) {

                }
                msgs=this.basicSetRight(newRight,msgs);
                if (msgs != null) {
                    msgs.dispatch();
                }
            }
        };
        ArithmeticExpressionImpl.prototype.getOperator = function() {
            return this.operator;
        };
        ArithmeticExpressionImpl.prototype.setOperator = function(newOperator) {
            var oldOperator=this.operator;
            this.operator=newOperator;
        };
        ArithmeticExpressionImpl.prototype.eInverseRemove = function(otherEnd,featureID,msgs) {
            switch (featureID) {
                case IAstPackage.ARITHMETIC_EXPRESSION__LEFT:
                    return this.basicSetLeft(null,msgs);
                case IAstPackage.ARITHMETIC_EXPRESSION__RIGHT:
                    return this.basicSetRight(null,msgs);
            }

        };
        ArithmeticExpressionImpl.prototype.eGet = function(featureID,resolve,coreType) {
            switch (featureID) {
                case IAstPackage.ARITHMETIC_EXPRESSION__LEFT:
                    return this.getLeft();
                case IAstPackage.ARITHMETIC_EXPRESSION__RIGHT:
                    return this.getRight();
                case IAstPackage.ARITHMETIC_EXPRESSION__OPERATOR:
                    return this.getOperator();
            }
            return ExpressionImpl.prototype.eGet.call(this,featureID,resolve,coreType);
        };
        ArithmeticExpressionImpl.prototype.eSet = function(featureID,newValue) {
            switch (featureID) {
                case IAstPackage.ARITHMETIC_EXPRESSION__LEFT:
                    this.setLeft(newValue);
                    return;
                case IAstPackage.ARITHMETIC_EXPRESSION__RIGHT:
                    this.setRight(newValue);
                    return;
                case IAstPackage.ARITHMETIC_EXPRESSION__OPERATOR:
                    this.setOperator(newValue);
                    return;
            }
            ExpressionImpl.prototype.eSet.call(this,featureID,newValue);
        };
        ArithmeticExpressionImpl.prototype.eUnset = function(featureID) {
            switch (featureID) {
                case IAstPackage.ARITHMETIC_EXPRESSION__LEFT:
                    this.setLeft(null);
                    return;
                case IAstPackage.ARITHMETIC_EXPRESSION__RIGHT:
                    this.setRight(null);
                    return;
                case IAstPackage.ARITHMETIC_EXPRESSION__OPERATOR:
                    this.setOperator(ArithmeticExpressionImpl.OPERATOR_EDEFAULT);
                    return;
            }
            ExpressionImpl.prototype.eUnset.call(this,featureID);
        };
        ArithmeticExpressionImpl.prototype.eIsSet = function(featureID) {
            switch (featureID) {
                case IAstPackage.ARITHMETIC_EXPRESSION__LEFT:
                    return this.left != null;
                case IAstPackage.ARITHMETIC_EXPRESSION__RIGHT:
                    return this.right != null;
                case IAstPackage.ARITHMETIC_EXPRESSION__OPERATOR:
                    return ArithmeticExpressionImpl.OPERATOR_EDEFAULT == null ? this.operator != null : !OPERATOR_EDEFAULT===operator;
            }
            return ExpressionImpl.prototype.eIsSet.call(this,featureID);
        };
        ArithmeticExpressionImpl.prototype.toString = function() {
            if (this.eIsProxy()) {
                return ExpressionImpl.prototype.toString.call(this);
            }
            var result=new StringBuffer(ExpressionImpl.prototype.toString.call(this));
            result.append(" (operator: ");
            result.append(operator);
            result.append(')');
            return result.toString();
        };
        return ArithmeticExpressionImpl;
    }
);
define(
    'commonddl/astmodel/CastExpressionImpl',[
        "commonddl/astmodel/ExpressionImpl",
        "rndrt/rnd"
    ], //dependencies
    function (
        ExpressionImpl,
        rnd
        ) {
        var Token = rnd.Token;
        var StringBuffer = rnd.StringBuffer;
        CastExpressionImpl.prototype = Object.create(ExpressionImpl.prototype);
        CastExpressionImpl.prototype.value=null;
        CastExpressionImpl.TYPE_NAMESPACE_EDEFAULT=null;
        CastExpressionImpl.prototype.typeNamespace=CastExpressionImpl.TYPE_NAMESPACE_EDEFAULT;
        CastExpressionImpl.TYPE_NAME_EDEFAULT=null;
        CastExpressionImpl.prototype.typeName=CastExpressionImpl.TYPE_NAME_EDEFAULT;
        CastExpressionImpl.LENGTH_EDEFAULT=null;
        CastExpressionImpl.prototype.length=CastExpressionImpl.LENGTH_EDEFAULT;
        CastExpressionImpl.DECIMALS_EDEFAULT=null;
        CastExpressionImpl.prototype.decimals=CastExpressionImpl.DECIMALS_EDEFAULT;
        function CastExpressionImpl() {
            ExpressionImpl.call(this);
        }
        CastExpressionImpl.prototype.eStaticClass = function() {
            return IAstPackage.Literals.CAST_EXPRESSION;
        };
        CastExpressionImpl.prototype.getValue = function() {
            return this.value;
        };
        CastExpressionImpl.prototype.basicSetValue = function(newValue,msgs) {
            var oldValue=this.value;
            this.value=newValue;
            return msgs;
        };
        CastExpressionImpl.prototype.setValue = function(newValue) {
            if (newValue != this.value) {
                var msgs=null;
                if (this.value != null) {

                }
                if (newValue != null) {

                }
                msgs=this.basicSetValue(newValue,msgs);
                if (msgs != null) {
                    msgs.dispatch();
                }
            }
        };
        CastExpressionImpl.prototype.getTypeNamespace = function() {
            return this.typeNamespace;
        };
        CastExpressionImpl.prototype.setTypeNamespace = function(newTypeNamespace) {
            var oldTypeNamespace=this.typeNamespace;
            this.typeNamespace=newTypeNamespace;
        };
        CastExpressionImpl.prototype.getTypeName = function() {
            return this.typeName;
        };
        CastExpressionImpl.prototype.setTypeName = function(newTypeName) {
            var oldTypeName=this.typeName;
            this.typeName=newTypeName;
        };
        CastExpressionImpl.prototype.getLength = function() {
            return this.length;
        };
        CastExpressionImpl.prototype.setLength = function(newLength) {
            var oldLength=this.length;
            this.length=newLength;
        };
        CastExpressionImpl.prototype.getDecimals = function() {
            return this.decimals;
        };
        CastExpressionImpl.prototype.setDecimals = function(newDecimals) {
            var oldDecimals=this.decimals;
            this.decimals=newDecimals;
        };
        CastExpressionImpl.prototype.eInverseRemove = function(otherEnd,featureID,msgs) {
            switch (featureID) {
                case IAstPackage.CAST_EXPRESSION__VALUE:
                    return this.basicSetValue(null,msgs);
            }

        };
        CastExpressionImpl.prototype.eGet = function(featureID,resolve,coreType) {
            switch (featureID) {
                case IAstPackage.CAST_EXPRESSION__VALUE:
                    return this.getValue();
                case IAstPackage.CAST_EXPRESSION__TYPE_NAMESPACE:
                    return this.getTypeNamespace();
                case IAstPackage.CAST_EXPRESSION__TYPE_NAME:
                    return this.getTypeName();
                case IAstPackage.CAST_EXPRESSION__LENGTH:
                    return this.getLength();
                case IAstPackage.CAST_EXPRESSION__DECIMALS:
                    return this.getDecimals();
            }
            return ExpressionImpl.prototype.eGet.call(this,featureID,resolve,coreType);
        };
        CastExpressionImpl.prototype.eSet = function(featureID,newValue) {
            switch (featureID) {
                case IAstPackage.CAST_EXPRESSION__VALUE:
                    this.setValue(newValue);
                    return;
                case IAstPackage.CAST_EXPRESSION__TYPE_NAMESPACE:
                    this.setTypeNamespace(newValue);
                    return;
                case IAstPackage.CAST_EXPRESSION__TYPE_NAME:
                    this.setTypeName(newValue);
                    return;
                case IAstPackage.CAST_EXPRESSION__LENGTH:
                    this.setLength(newValue);
                    return;
                case IAstPackage.CAST_EXPRESSION__DECIMALS:
                    this.setDecimals(newValue);
                    return;
            }
            ExpressionImpl.prototype.eSet.call(this,featureID,newValue);
        };
        CastExpressionImpl.prototype.eUnset = function(featureID) {
            switch (featureID) {
                case IAstPackage.CAST_EXPRESSION__VALUE:
                    this.setValue(null);
                    return;
                case IAstPackage.CAST_EXPRESSION__TYPE_NAMESPACE:
                    this.setTypeNamespace(CastExpressionImpl.TYPE_NAMESPACE_EDEFAULT);
                    return;
                case IAstPackage.CAST_EXPRESSION__TYPE_NAME:
                    this.setTypeName(CastExpressionImpl.TYPE_NAME_EDEFAULT);
                    return;
                case IAstPackage.CAST_EXPRESSION__LENGTH:
                    this.setLength(CastExpressionImpl.LENGTH_EDEFAULT);
                    return;
                case IAstPackage.CAST_EXPRESSION__DECIMALS:
                    this.setDecimals(CastExpressionImpl.DECIMALS_EDEFAULT);
                    return;
            }
            ExpressionImpl.prototype.eUnset.call(this,featureID);
        };
        CastExpressionImpl.prototype.eIsSet = function(featureID) {
            switch (featureID) {
                case IAstPackage.CAST_EXPRESSION__VALUE:
                    return this.value != null;
                case IAstPackage.CAST_EXPRESSION__TYPE_NAMESPACE:
                    return CastExpressionImpl.TYPE_NAMESPACE_EDEFAULT == null ? this.typeNamespace != null : !TYPE_NAMESPACE_EDEFAULT===typeNamespace;
                case IAstPackage.CAST_EXPRESSION__TYPE_NAME:
                    return CastExpressionImpl.TYPE_NAME_EDEFAULT == null ? this.typeName != null : !TYPE_NAME_EDEFAULT===typeName;
                case IAstPackage.CAST_EXPRESSION__LENGTH:
                    return CastExpressionImpl.LENGTH_EDEFAULT == null ? this.length != null : !LENGTH_EDEFAULT===length;
                case IAstPackage.CAST_EXPRESSION__DECIMALS:
                    return CastExpressionImpl.DECIMALS_EDEFAULT == null ? this.decimals != null : !DECIMALS_EDEFAULT===decimals;
            }
            return ExpressionImpl.prototype.eIsSet.call(this,featureID);
        };
        CastExpressionImpl.prototype.toString = function() {
            if (this.eIsProxy()) {
                return ExpressionImpl.prototype.toString.call(this);
            }
            var result=new StringBuffer(ExpressionImpl.prototype.toString.call(this));
            result.append(" (typeNamespace: ");
            result.append(typeNamespace);
            result.append(", typeName: ");
            result.append(typeName);
            result.append(", length: ");
            result.append(length);
            result.append(", decimals: ");
            result.append(decimals);
            result.append(')');
            return result.toString();
        };
        return CastExpressionImpl;
    }
);
define(
    'commonddl/astmodel/SearchedCaseExpressionImpl',[
        "commonddl/astmodel/CaseExpressionImpl"
    ], //dependencies
    function (
        CaseExpressionImpl
        ) {
        SearchedCaseExpressionImpl.prototype = Object.create(CaseExpressionImpl.prototype);
        function SearchedCaseExpressionImpl() {
            CaseExpressionImpl.call(this);
        }
        SearchedCaseExpressionImpl.prototype.eStaticClass = function() {
            return IAstPackage.Literals.SEARCHED_CASE_EXPRESSION;
        };
        return SearchedCaseExpressionImpl;
    }
);
define(
    'commonddl/astmodel/FuncWithNamedParamExpressionImpl',[
        "rndrt/rnd",
        "commonddl/astmodel/ExpressionImpl",
        "commonddl/astmodel/EObjectContainmentEList"
    ], //dependencies
    function (
        rnd,
        ExpressionImpl,
        EObjectContainmentEList
        ) {
        var Token = rnd.Token;
        var StringBuffer = rnd.StringBuffer;
        FuncWithNamedParamExpressionImpl.prototype = Object.create(ExpressionImpl.prototype);
        FuncWithNamedParamExpressionImpl.NAME_EDEFAULT=null;
        FuncWithNamedParamExpressionImpl.prototype.name=FuncWithNamedParamExpressionImpl.NAME_EDEFAULT;
        FuncWithNamedParamExpressionImpl.prototype.parameters=null;
        function FuncWithNamedParamExpressionImpl() {
            ExpressionImpl.call(this);
        }
        FuncWithNamedParamExpressionImpl.prototype.eStaticClass = function() {
            return IAstPackage.Literals.FUNC_WITH_NAMED_PARAM_EXPRESSION;
        };
        FuncWithNamedParamExpressionImpl.prototype.getName = function() {
            return this.name;
        };
        FuncWithNamedParamExpressionImpl.prototype.setName = function(newName) {
            var oldName=this.name;
            this.name=newName;
        };
        FuncWithNamedParamExpressionImpl.prototype.getParameters = function() {
            if (this.parameters == null) {
                this.parameters=new EObjectContainmentEList(this);
            }
            return this.parameters;
        };
        FuncWithNamedParamExpressionImpl.prototype.eInverseRemove = function(otherEnd,featureID,msgs) {
            switch (featureID) {
                case IAstPackage.FUNC_WITH_NAMED_PARAM_EXPRESSION__PARAMETERS:
                    return (this.getParameters()).basicRemove(otherEnd,msgs);
            }

        };
        FuncWithNamedParamExpressionImpl.prototype.eGet = function(featureID,resolve,coreType) {
            switch (featureID) {
                case IAstPackage.FUNC_WITH_NAMED_PARAM_EXPRESSION__NAME:
                    return this.getName();
                case IAstPackage.FUNC_WITH_NAMED_PARAM_EXPRESSION__PARAMETERS:
                    return this.getParameters();
            }
            return ExpressionImpl.prototype.eGet.call(this,featureID,resolve,coreType);
        };
        FuncWithNamedParamExpressionImpl.prototype.eSet = function(featureID,newValue) {

        };
        FuncWithNamedParamExpressionImpl.prototype.eUnset = function(featureID) {

        };
        FuncWithNamedParamExpressionImpl.prototype.eIsSet = function(featureID) {

        };

        return FuncWithNamedParamExpressionImpl;
    }
);
define(
    'commonddl/astmodel/FuncParamImpl',[
        "commonddl/astmodel/ExpressionImpl",
        "commonddl/astmodel/SourceRangeImpl",
        "rndrt/rnd"
    ], //dependencies
    function (
        ExpressionImpl,
        SourceRangeImpl,
        rnd
        ) {
        var Token = rnd.Token;
        var StringBuffer = rnd.StringBuffer;
        FuncParamImpl.prototype = Object.create(SourceRangeImpl.prototype);
        FuncParamImpl.NAME_EDEFAULT=null;
        FuncParamImpl.prototype.name=FuncParamImpl.NAME_EDEFAULT;
        FuncParamImpl.prototype.expression=null;
        function FuncParamImpl() {
            SourceRangeImpl.call(this);
        }
        FuncParamImpl.prototype.eStaticClass = function() {
            return IAstPackage.Literals.FUNC_PARAM;
        };
        FuncParamImpl.prototype.getName = function() {
            return this.name;
        };
        FuncParamImpl.prototype.setName = function(newName) {
            var oldName=this.name;
            this.name=newName;
        };
        FuncParamImpl.prototype.getExpression = function() {
            return this.expression;
        };
        FuncParamImpl.prototype.basicSetExpression = function(newExpression,msgs) {
            var oldExpression=this.expression;
            this.expression=newExpression;
            this.expression.setContainer(this);
            return msgs;
        };
        FuncParamImpl.prototype.setExpression = function(newExpression) {
            if (newExpression != this.expression) {
                var msgs=null;
                if (this.expression != null) {

                }
                if (newExpression != null) {

                }
                msgs=this.basicSetExpression(newExpression,msgs);
                if (msgs != null) {
                    msgs.dispatch();
                }
            }
        };
        FuncParamImpl.prototype.eInverseRemove = function(otherEnd,featureID,msgs) {
            switch (featureID) {
                case IAstPackage.FUNC_PARAM__EXPRESSION:
                    return this.basicSetExpression(null,msgs);
            }

        };
        FuncParamImpl.prototype.eGet = function(featureID,resolve,coreType) {
            switch (featureID) {
                case IAstPackage.FUNC_PARAM__NAME:
                    return this.getName();
                case IAstPackage.FUNC_PARAM__EXPRESSION:
                    return this.getExpression();
            }
            return SourceRangeImpl.prototype.eGet.call(this,featureID,resolve,coreType);
        };
        FuncParamImpl.prototype.eSet = function(featureID,newValue) {
            switch (featureID) {
                case IAstPackage.FUNC_PARAM__NAME:
                    this.setName(newValue);
                    return;
                case IAstPackage.FUNC_PARAM__EXPRESSION:
                    this.setExpression(newValue);
                    return;
            }
            SourceRangeImpl.prototype.eSet.call(this,featureID,newValue);
        };
        FuncParamImpl.prototype.eUnset = function(featureID) {
            switch (featureID) {
                case IAstPackage.FUNC_PARAM__NAME:
                    this.setName(FuncParamImpl.NAME_EDEFAULT);
                    return;
                case IAstPackage.FUNC_PARAM__EXPRESSION:
                    this.setExpression(null);
                    return;
            }
            SourceRangeImpl.prototype.eUnset.call(this,featureID);
        };
        FuncParamImpl.prototype.eIsSet = function(featureID) {
            switch (featureID) {
                case IAstPackage.FUNC_PARAM__NAME:
                    return FuncParamImpl.NAME_EDEFAULT == null ? this.name != null : !NAME_EDEFAULT===name;
                case IAstPackage.FUNC_PARAM__EXPRESSION:
                    return this.expression != null;
            }
            return SourceRangeImpl.prototype.eIsSet.call(this,featureID);
        };
        FuncParamImpl.prototype.toString = function() {
            if (this.eIsProxy()) {
                return SourceRangeImpl.prototype.toString.call(this);
            }
            var result=new StringBuffer(SourceRangeImpl.prototype.toString.call(this));
            result.append(" (name: ");
            result.append(name);
            result.append(')');
            return result.toString();
        };
        return FuncParamImpl;
    }
);
define(
    'commonddl/astmodel/ParameterImpl',[
        "commonddl/astmodel/ParameterImpl",
        "commonddl/astmodel/NamedDeclarationImpl",
        "rndrt/rnd"
    ], //dependencies
    function (
        ParameterImpl,
        NamedDeclarationImpl,
        rnd
        ) {
        var Token = rnd.Token;
        ParameterImpl.prototype = Object.create(NamedDeclarationImpl.prototype);
        function ParameterImpl() {
            NamedDeclarationImpl.call(this);
        }
        ParameterImpl.prototype.eStaticClass = function() {
            return IAstPackage.Literals.PARAMETER;
        };
        return ParameterImpl;
    }
);
define(
    'commonddl/astmodel/PostAnnotationImpl',[
        "commonddl/astmodel/AbstractAnnotationImpl"
    ], //dependencies
    function (
        AbstractAnnotationImpl
        ) {
        PostAnnotationImpl.prototype = Object.create(AbstractAnnotationImpl.prototype);
        function PostAnnotationImpl() {
            AbstractAnnotationImpl.call(this);
        }
        PostAnnotationImpl.prototype.eStaticClass = function() {
            return IAstPackage.Literals.POST_ANNOTATION;
        };
        return PostAnnotationImpl;
    }
);
define(
    'commonddl/astmodel/ConstDeclarationImpl',["commonddl/astmodel/ComponentDeclarationImpl"], //dependencies
    function (ComponentDeclarationImpl) {
        ConstDeclarationImpl.prototype = Object.create(ComponentDeclarationImpl.prototype);
        ConstDeclarationImpl.prototype.annotationList=null;
        ConstDeclarationImpl.prototype.value=null;
        function ConstDeclarationImpl() {
            ComponentDeclarationImpl.call(this);
        }
        ConstDeclarationImpl.prototype.eStaticClass = function() {
            return IAstPackage.Literals.CONST_DECLARATION;
        };
        ConstDeclarationImpl.prototype.getAnnotationList = function() {
            if (this.annotationList == null) {
                this.annotationList=[];
            }
            return this.annotationList;
        };
        ConstDeclarationImpl.prototype.getValue = function() {
            return this.value;
        };
        ConstDeclarationImpl.prototype.basicSetValue = function(newValue,msgs) {
            var oldValue=this.value;
            this.value=newValue;
            this.value.setContainer(this);
            return msgs;
        };
        ConstDeclarationImpl.prototype.setValue = function(newValue) {
            if (newValue != this.value) {
                var msgs=null;
                if (this.value != null) {

                }
                if (newValue != null) {

                }
                msgs=this.basicSetValue(newValue,msgs);
                if (msgs != null) {
                    msgs.dispatch();
                }
            }
        };
        ConstDeclarationImpl.prototype.eInverseRemove = function(otherEnd,featureID,msgs) {
            switch (featureID) {
                case IAstPackage.CONST_DECLARATION__VALUE:
                    return this.basicSetValue(null,msgs);
            }

        };
        ConstDeclarationImpl.prototype.eGet = function(featureID,resolve,coreType) {
            switch (featureID) {
                case IAstPackage.CONST_DECLARATION__ANNOTATION_LIST:
                    return this.getAnnotationList();
                case IAstPackage.CONST_DECLARATION__VALUE:
                    return this.getValue();
            }
            return ComponentDeclarationImpl.prototype.eGet.call(this,featureID,resolve,coreType);
        };
        ConstDeclarationImpl.prototype.eSet = function(featureID,newValue) {

        };
        ConstDeclarationImpl.prototype.eUnset = function(featureID) {

        };
        ConstDeclarationImpl.prototype.eIsSet = function(featureID) {
            switch (featureID) {
                case IAstPackage.CONST_DECLARATION__ANNOTATION_LIST:
                    return this.annotationList != null && !this.annotationList.isEmpty();
                case IAstPackage.CONST_DECLARATION__VALUE:
                    return this.value != null;
            }
            return ComponentDeclarationImpl.prototype.eIsSet.call(this,featureID);
        };
        ConstDeclarationImpl.prototype.eBaseStructuralFeatureID = function(derivedFeatureID,baseClass) {
            if (baseClass == IAnnotated.class) {
                switch (derivedFeatureID) {
                    case IAstPackage.CONST_DECLARATION__ANNOTATION_LIST:
                        return IAstPackage.ANNOTATED__ANNOTATION_LIST;
                    default :
                        return -1;
                }
            }
            return ComponentDeclarationImpl.prototype.eBaseStructuralFeatureID.call(this,derivedFeatureID,baseClass);
        };
        ConstDeclarationImpl.prototype.eDerivedStructuralFeatureID = function(baseFeatureID,baseClass) {
            if (baseClass == IAnnotated.class) {
                switch (baseFeatureID) {
                    case IAstPackage.ANNOTATED__ANNOTATION_LIST:
                        return IAstPackage.CONST_DECLARATION__ANNOTATION_LIST;
                    default :
                        return -1;
                }
            }
            return ComponentDeclarationImpl.prototype.eDerivedStructuralFeatureID.call(this,baseFeatureID,baseClass);
        };
        return ConstDeclarationImpl;
    }
);
define(
        'commonddl/astmodel/AccessPolicyDeclarationImpl',[ "commonddl/astmodel/DdlStatementImpl", "commonddl/astmodel/EObjectContainmentEList"

        ], // dependencies
        function(DdlStatementImpl, EObjectContainmentEList) {
            AccessPolicyDeclarationImpl.prototype = Object
                    .create(DdlStatementImpl.prototype);
            AccessPolicyDeclarationImpl.prototype.annotationList = null;
            AccessPolicyDeclarationImpl.prototype.statements = null;
            function AccessPolicyDeclarationImpl() {
                DdlStatementImpl.call(this);
            }
            AccessPolicyDeclarationImpl.prototype.eStaticClass = function() {
                return IAstPackage.Literals.ACCESS_POLICY_DECLARATION;
            };
            AccessPolicyDeclarationImpl.prototype.getAnnotationList = function() {
                if (this.annotationList == null) {
                    this.annotationList = [];
                }
                return this.annotationList;
            };
            AccessPolicyDeclarationImpl.prototype.getStatements = function() {
                if (this.statements == null) {
                    this.statements=new EObjectContainmentEList(this);
                }
                return this.statements;
            };
            AccessPolicyDeclarationImpl.prototype.eInverseRemove = function(
                    otherEnd, featureID, msgs) {
                switch (featureID) {
                case IAstPackage.ACCESS_POLICY_DECLARATION__STATEMENTS:
                    return (this.getStatements()).basicRemove(otherEnd, msgs);
                }

            };
            AccessPolicyDeclarationImpl.prototype.eGet = function(featureID,
                    resolve, coreType) {
                switch (featureID) {
                case IAstPackage.ACCESS_POLICY_DECLARATION__ANNOTATION_LIST:
                    return this.getAnnotationList();
                case IAstPackage.ACCESS_POLICY_DECLARATION__STATEMENTS:
                    return this.getStatements();
                }
                return DdlStatementImpl.prototype.eGet.call(this, featureID,
                        resolve, coreType);
            };
            AccessPolicyDeclarationImpl.prototype.eSet = function(featureID, newValue) {
            };
            AccessPolicyDeclarationImpl.prototype.eUnset = function(featureID) {
            };
            AccessPolicyDeclarationImpl.prototype.eIsSet = function(featureID) {
                switch (featureID) {
                case IAstPackage.ACCESS_POLICY_DECLARATION__ANNOTATION_LIST:
                    return this.annotationList != null
                            && !this.annotationList.isEmpty();
                case IAstPackage.ACCESS_POLICY_DECLARATION__STATEMENTS:
                    return this.statements != null
                            && !this.statements.isEmpty();
                }
                return DdlStatementImpl.prototype.eIsSet.call(this, featureID);
            };
            AccessPolicyDeclarationImpl.prototype.eBaseStructuralFeatureID = function(
                    derivedFeatureID, baseClass) {
                if (baseClass == IAnnotated.class) {
                    switch (derivedFeatureID) {
                    case IAstPackage.ACCESS_POLICY_DECLARATION__ANNOTATION_LIST:
                        return IAstPackage.ANNOTATED__ANNOTATION_LIST;
                    default:
                        return -1;
                    }
                }
                if (baseClass == IStatementContainer.class) {
                    switch (derivedFeatureID) {
                    case IAstPackage.ACCESS_POLICY_DECLARATION__STATEMENTS:
                        return IAstPackage.STATEMENT_CONTAINER__STATEMENTS;
                    default:
                        return -1;
                    }
                }
                return DdlStatementImpl.prototype.eBaseStructuralFeatureID
                        .call(this, derivedFeatureID, baseClass);
            };
            AccessPolicyDeclarationImpl.prototype.eDerivedStructuralFeatureID = function(
                    baseFeatureID, baseClass) {
                if (baseClass == IAnnotated.class) {
                    switch (baseFeatureID) {
                    case IAstPackage.ANNOTATED__ANNOTATION_LIST:
                        return IAstPackage.ACCESS_POLICY_DECLARATION__ANNOTATION_LIST;
                    default:
                        return -1;
                    }
                }
                if (baseClass == IStatementContainer.class) {
                    switch (baseFeatureID) {
                    case IAstPackage.STATEMENT_CONTAINER__STATEMENTS:
                        return IAstPackage.ACCESS_POLICY_DECLARATION__STATEMENTS;
                    default:
                        return -1;
                    }
                }
                return DdlStatementImpl.prototype.eDerivedStructuralFeatureID
                        .call(this, baseFeatureID, baseClass);
            };
            return AccessPolicyDeclarationImpl;
        });
define(
        'commonddl/astmodel/AspectDeclarationImpl',[ "commonddl/astmodel/DdlStatementImpl"

        ], // dependencies
        function(DdlStatementImpl) {
            AspectDeclarationImpl.prototype = Object
                    .create(DdlStatementImpl.prototype);
            AspectDeclarationImpl.prototype.select = null;
            AspectDeclarationImpl.prototype.selectSet = null;
            AspectDeclarationImpl.prototype.annotationList = null;
            function AspectDeclarationImpl() {
                DdlStatementImpl.call(this);
            }
            AspectDeclarationImpl.prototype.eStaticClass = function() {
                return IAstPackage.Literals.ASPECT_DECLARATION;
            };
            AspectDeclarationImpl.prototype.getSelect = function() {
                return this.select;
            };
            AspectDeclarationImpl.prototype.basicSetSelect = function(
                    newSelect, msgs) {
                var oldSelect = this.select;
                this.select = newSelect;
                this.select.setContainer(this);
                return msgs;
            };
            AspectDeclarationImpl.prototype.setSelect = function(newSelect) {
                if (newSelect != this.select) {
                    var msgs = null;
                    if (this.select != null) {

                    }
                    if (newSelect != null) {

                    }
                    msgs = this.basicSetSelect(newSelect, msgs);
                    if (msgs != null) {
                        msgs.dispatch();
                    }
                }
            };
            AspectDeclarationImpl.prototype.getSelectSet = function() {
                return this.selectSet;
            };
            AspectDeclarationImpl.prototype.basicSetSelectSet = function(
                    newSelectSet, msgs) {
                var oldSelectSet = this.selectSet;
                this.selectSet = newSelectSet;
                this.selectSet.setContainer(this);
                return msgs;
            };
            AspectDeclarationImpl.prototype.setSelectSet = function(
                    newSelectSet) {
                if (newSelectSet != this.selectSet) {
                    var msgs = null;
                    if (this.selectSet != null) {

                    }
                    if (newSelectSet != null) {

                    }
                    msgs = this.basicSetSelectSet(newSelectSet, msgs);
                    if (msgs != null) {
                        msgs.dispatch();
                    }
                }
            };
            AspectDeclarationImpl.prototype.getAnnotationList = function() {
                if (this.annotationList == null) {
                    this.annotationList = [];
                }
                return this.annotationList;
            };
            AspectDeclarationImpl.prototype.eInverseRemove = function(otherEnd,
                    featureID, msgs) {
                switch (featureID) {
                case IAstPackage.ASPECT_DECLARATION__SELECT:
                    return this.basicSetSelect(null, msgs);
                case IAstPackage.ASPECT_DECLARATION__SELECT_SET:
                    return this.basicSetSelectSet(null, msgs);
                }

            };
            AspectDeclarationImpl.prototype.eGet = function(featureID, resolve,
                    coreType) {
                switch (featureID) {
                case IAstPackage.ASPECT_DECLARATION__SELECT:
                    return this.getSelect();
                case IAstPackage.ASPECT_DECLARATION__SELECT_SET:
                    return this.getSelectSet();
                case IAstPackage.ASPECT_DECLARATION__ANNOTATION_LIST:
                    return this.getAnnotationList();
                }
                return DdlStatementImpl.prototype.eGet.call(this, featureID,
                        resolve, coreType);
            };
            AspectDeclarationImpl.prototype.eSet = function(featureID, newValue) {
            };
            AspectDeclarationImpl.prototype.eUnset = function(featureID) {
            };
            AspectDeclarationImpl.prototype.eIsSet = function(featureID) {
                switch (featureID) {
                case IAstPackage.ASPECT_DECLARATION__SELECT:
                    return this.select != null;
                case IAstPackage.ASPECT_DECLARATION__SELECT_SET:
                    return this.selectSet != null;
                case IAstPackage.ASPECT_DECLARATION__ANNOTATION_LIST:
                    return this.annotationList != null
                            && !this.annotationList.isEmpty();
                }
                return DdlStatementImpl.prototype.eIsSet.call(this, featureID);
            };
            AspectDeclarationImpl.prototype.eBaseStructuralFeatureID = function(
                    derivedFeatureID, baseClass) {
                if (baseClass == ISelectContainer.class) {
                    switch (derivedFeatureID) {
                    case IAstPackage.ASPECT_DECLARATION__SELECT:
                        return IAstPackage.SELECT_CONTAINER__SELECT;
                    case IAstPackage.ASPECT_DECLARATION__SELECT_SET:
                        return IAstPackage.SELECT_CONTAINER__SELECT_SET;
                    default:
                        return -1;
                    }
                }
                if (baseClass == IRoleComponentDeclaration.class) {
                    switch (derivedFeatureID) {
                    default:
                        return -1;
                    }
                }
                if (baseClass == IAnnotated.class) {
                    switch (derivedFeatureID) {
                    case IAstPackage.ASPECT_DECLARATION__ANNOTATION_LIST:
                        return IAstPackage.ANNOTATED__ANNOTATION_LIST;
                    default:
                        return -1;
                    }
                }
                return DdlStatementImpl.prototype.eBaseStructuralFeatureID
                        .call(this, derivedFeatureID, baseClass);
            };
            AspectDeclarationImpl.prototype.eDerivedStructuralFeatureID = function(
                    baseFeatureID, baseClass) {
                if (baseClass == ISelectContainer.class) {
                    switch (baseFeatureID) {
                    case IAstPackage.SELECT_CONTAINER__SELECT:
                        return IAstPackage.ASPECT_DECLARATION__SELECT;
                    case IAstPackage.SELECT_CONTAINER__SELECT_SET:
                        return IAstPackage.ASPECT_DECLARATION__SELECT_SET;
                    default:
                        return -1;
                    }
                }
                if (baseClass == IRoleComponentDeclaration.class) {
                    switch (baseFeatureID) {
                    default:
                        return -1;
                    }
                }
                if (baseClass == IAnnotated.class) {
                    switch (baseFeatureID) {
                    case IAstPackage.ANNOTATED__ANNOTATION_LIST:
                        return IAstPackage.ASPECT_DECLARATION__ANNOTATION_LIST;
                    default:
                        return -1;
                    }
                }
                return DdlStatementImpl.prototype.eDerivedStructuralFeatureID
                        .call(this, baseFeatureID, baseClass);
            };
            return AspectDeclarationImpl;
        });
define('commonddl/astmodel/RoleComponentDeclarationImpl',[ "commonddl/astmodel/SourceRangeImpl"

], // dependencies
function(SourceRangeImpl) {
    RoleComponentDeclarationImpl.prototype = Object
            .create(SourceRangeImpl.prototype);
    function RoleComponentDeclarationImpl() {
        SourceRangeImpl.call(this);
    }
    RoleComponentDeclarationImpl.prototype.eStaticClass = function() {
        return IAstPackage.Literals.ROLE_COMPONENT_DECLARATION;
    };
    return RoleComponentDeclarationImpl;
});
define(
        'commonddl/astmodel/RoleDeclarationImpl',["commonddl/astmodel/DdlStatementImpl"

        ], // dependencies
        function(DdlStatementImpl) {
            RoleDeclarationImpl.prototype = Object
                    .create(DdlStatementImpl.prototype);
            RoleDeclarationImpl.prototype.annotationList = null;
            RoleDeclarationImpl.prototype.entries = null;
            function RoleDeclarationImpl() {
                DdlStatementImpl.call(this);
            }
            RoleDeclarationImpl.prototype.eStaticClass = function() {
                return IAstPackage.Literals.ROLE_DECLARATION;
            };
            RoleDeclarationImpl.prototype.getAnnotationList = function() {
                if (this.annotationList == null) {
                    this.annotationList = [];
                }
                return this.annotationList;
            };
            RoleDeclarationImpl.prototype.getEntries = function() {
                if (this.entries == null) {
                    this.entries = [];
                }
                return this.entries;
            };
            RoleDeclarationImpl.prototype.eInverseRemove = function(otherEnd,
                    featureID, msgs) {
                switch (featureID) {
                case IAstPackage.ROLE_DECLARATION__ENTRIES:
                    return (this.getEntries()).basicRemove(otherEnd, msgs);
                }

            };
            RoleDeclarationImpl.prototype.eGet = function(featureID, resolve,
                    coreType) {
                switch (featureID) {
                case IAstPackage.ROLE_DECLARATION__ANNOTATION_LIST:
                    return this.getAnnotationList();
                case IAstPackage.ROLE_DECLARATION__ENTRIES:
                    return this.getEntries();
                }
                return DdlStatementImpl.prototype.eGet.call(this, featureID,
                        resolve, coreType);
            };
            RoleDeclarationImpl.prototype.eSet = function(featureID, newValue) {
            };
            RoleDeclarationImpl.prototype.eUnset = function(featureID) {
            };
            RoleDeclarationImpl.prototype.eIsSet = function(featureID) {
                switch (featureID) {
                case IAstPackage.ROLE_DECLARATION__ANNOTATION_LIST:
                    return this.annotationList != null
                            && !this.annotationList.isEmpty();
                case IAstPackage.ROLE_DECLARATION__ENTRIES:
                    return this.entries != null && !this.entries.isEmpty();
                }
                return DdlStatementImpl.prototype.eIsSet.call(this, featureID);
            };
            RoleDeclarationImpl.prototype.eBaseStructuralFeatureID = function(
                    derivedFeatureID, baseClass) {
                if (baseClass == IAnnotated.class) {
                    switch (derivedFeatureID) {
                    case IAstPackage.ROLE_DECLARATION__ANNOTATION_LIST:
                        return IAstPackage.ANNOTATED__ANNOTATION_LIST;
                    default:
                        return -1;
                    }
                }
                return DdlStatementImpl.prototype.eBaseStructuralFeatureID
                        .call(this, derivedFeatureID, baseClass);
            };
            RoleDeclarationImpl.prototype.eDerivedStructuralFeatureID = function(
                    baseFeatureID, baseClass) {
                if (baseClass == IAnnotated.class) {
                    switch (baseFeatureID) {
                    case IAstPackage.ANNOTATED__ANNOTATION_LIST:
                        return IAstPackage.ROLE_DECLARATION__ANNOTATION_LIST;
                    default:
                        return -1;
                    }
                }
                return DdlStatementImpl.prototype.eDerivedStructuralFeatureID
                        .call(this, baseFeatureID, baseClass);
            };
            return RoleDeclarationImpl;
        });
define(
        'commonddl/astmodel/RuleDeclarationImpl',["commonddl/astmodel/RoleComponentDeclarationImpl"

        ], // dependencies
        function(RoleComponentDeclarationImpl) {
            RuleDeclarationImpl.prototype = Object
                    .create(RoleComponentDeclarationImpl.prototype);
            RuleDeclarationImpl.prototype.from = null;
            RuleDeclarationImpl.prototype.where = null;
            function RuleDeclarationImpl() {
                RoleComponentDeclarationImpl.call(this);
            }
            RuleDeclarationImpl.prototype.eStaticClass = function() {
                return IAstPackage.Literals.RULE_DECLARATION;
            };
            RuleDeclarationImpl.prototype.getFrom = function() {
                return this.from;
            };
            RuleDeclarationImpl.prototype.basicSetFrom = function(newFrom, msgs) {
                var oldFrom = this.from;
                this.from = newFrom;
                this.from.setContainer(this);
                return msgs;
            };
            RuleDeclarationImpl.prototype.setFrom = function(newFrom) {
                if (newFrom != this.from) {
                    var msgs = null;
                    if (this.from != null) {

                    }
                    if (newFrom != null) {

                    }
                    msgs = this.basicSetFrom(newFrom, msgs);
                    if (msgs != null) {
                        msgs.dispatch();
                    }
                }
            };
            RuleDeclarationImpl.prototype.getWhere = function() {
                return this.where;
            };
            RuleDeclarationImpl.prototype.basicGetWhere = function() {
                return this.where;
            };
            RuleDeclarationImpl.prototype.setWhere = function(newWhere) {
                var oldWhere = this.where;
                this.where = newWhere;
            };
            RuleDeclarationImpl.prototype.eInverseRemove = function(otherEnd,
                    featureID, msgs) {
                switch (featureID) {
                case IAstPackage.RULE_DECLARATION__FROM:
                    return this.basicSetFrom(null, msgs);
                }

            };
            RuleDeclarationImpl.prototype.eGet = function(featureID, resolve,
                    coreType) {
                switch (featureID) {
                case IAstPackage.RULE_DECLARATION__FROM:
                    return this.getFrom();
                case IAstPackage.RULE_DECLARATION__WHERE:
                    if (resolve) {
                        return this.getWhere();
                    }
                    return this.basicGetWhere();
                }
                return RoleComponentDeclarationImpl.prototype.eGet.call(this,
                        featureID, resolve, coreType);
            };
            RuleDeclarationImpl.prototype.eSet = function(featureID, newValue) {
                switch (featureID) {
                case IAstPackage.RULE_DECLARATION__FROM:
                    this.setFrom(newValue);
                    return;
                case IAstPackage.RULE_DECLARATION__WHERE:
                    this.setWhere(newValue);
                    return;
                }
                RoleComponentDeclarationImpl.prototype.eSet.call(this,
                        featureID, newValue);
            };
            RuleDeclarationImpl.prototype.eUnset = function(featureID) {
                switch (featureID) {
                case IAstPackage.RULE_DECLARATION__FROM:
                    this.setFrom(null);
                    return;
                case IAstPackage.RULE_DECLARATION__WHERE:
                    this.setWhere(null);
                    return;
                }
                RoleComponentDeclarationImpl.prototype.eUnset.call(this,
                        featureID);
            };
            RuleDeclarationImpl.prototype.eIsSet = function(featureID) {
                switch (featureID) {
                case IAstPackage.RULE_DECLARATION__FROM:
                    return this.from != null;
                case IAstPackage.RULE_DECLARATION__WHERE:
                    return this.where != null;
                }
                return RoleComponentDeclarationImpl.prototype.eIsSet.call(this,
                        featureID);
            };
            return RuleDeclarationImpl;
        });
define(
        'commonddl/astmodel/RuleFromClauseImpl',["commonddl/astmodel/EObjectImpl"

        ], // dependencies
        function(EObjectImpl

        ) {
            RuleFromClauseImpl.prototype = Object.create(EObjectImpl.prototype);
            RuleFromClauseImpl.prototype.dataSource = null;
            RuleFromClauseImpl.COMMAND_TOKEN_EDEFAULT = null;
            RuleFromClauseImpl.prototype.commandToken = RuleFromClauseImpl.COMMAND_TOKEN_EDEFAULT;
            function RuleFromClauseImpl() {
                EObjectImpl.call(this);
            }
            RuleFromClauseImpl.prototype.eStaticClass = function() {
                return IAstPackage.Literals.RULE_FROM_CLAUSE;
            };
            RuleFromClauseImpl.prototype.getDataSource = function() {
                return this.dataSource;
            };
            RuleFromClauseImpl.prototype.basicSetDataSource = function(
                    newDataSource, msgs) {
                var oldDataSource = this.dataSource;
                this.dataSource = newDataSource;
                this.dataSource.setContainer(this);
                return msgs;
            };
            RuleFromClauseImpl.prototype.setDataSource = function(newDataSource) {
                if (newDataSource != this.dataSource) {
                    var msgs = null;
                    if (this.dataSource != null) {

                    }
                    if (newDataSource != null) {

                    }
                    msgs = this.basicSetDataSource(newDataSource, msgs);
                    if (msgs != null) {
                        msgs.dispatch();
                    }
                }
            };
            RuleFromClauseImpl.prototype.getCommandToken = function() {
                return this.commandToken;
            };
            RuleFromClauseImpl.prototype.setCommandToken = function(
                    newCommandToken) {
                var oldCommandToken = this.commandToken;
                this.commandToken = newCommandToken;
            };
            RuleFromClauseImpl.prototype.eInverseRemove = function(otherEnd,
                    featureID, msgs) {
                switch (featureID) {
                case IAstPackage.RULE_FROM_CLAUSE__DATA_SOURCE:
                    return this.basicSetDataSource(null, msgs);
                }

            };
            RuleFromClauseImpl.prototype.eGet = function(featureID, resolve,
                    coreType) {
                switch (featureID) {
                case IAstPackage.RULE_FROM_CLAUSE__DATA_SOURCE:
                    return this.getDataSource();
                case IAstPackage.RULE_FROM_CLAUSE__COMMAND_TOKEN:
                    return this.getCommandToken();
                }
                return EObjectImpl.prototype.eGet.call(this, featureID,
                        resolve, coreType);
            };
            RuleFromClauseImpl.prototype.eSet = function(featureID, newValue) {
                switch (featureID) {
                case IAstPackage.RULE_FROM_CLAUSE__DATA_SOURCE:
                    this.setDataSource(newValue);
                    return;
                case IAstPackage.RULE_FROM_CLAUSE__COMMAND_TOKEN:
                    this.setCommandToken(newValue);
                    return;
                }
                EObjectImpl.prototype.eSet.call(this, featureID, newValue);
            };
            RuleFromClauseImpl.prototype.eUnset = function(featureID) {
                switch (featureID) {
                case IAstPackage.RULE_FROM_CLAUSE__DATA_SOURCE:
                    this.setDataSource(null);
                    return;
                case IAstPackage.RULE_FROM_CLAUSE__COMMAND_TOKEN:
                    this
                            .setCommandToken(RuleFromClauseImpl.COMMAND_TOKEN_EDEFAULT);
                    return;
                }
                EObjectImpl.prototype.eUnset.call(this, featureID);
            };
            RuleFromClauseImpl.prototype.eIsSet = function(featureID) {
                switch (featureID) {
                case IAstPackage.RULE_FROM_CLAUSE__DATA_SOURCE:
                    return this.dataSource != null;
                case IAstPackage.RULE_FROM_CLAUSE__COMMAND_TOKEN:
                    return RuleFromClauseImpl.COMMAND_TOKEN_EDEFAULT == null ? this.commandToken != null
                            : !RuleFromClauseImpl.COMMAND_TOKEN_EDEFAULT === commandToken;
                }
                return EObjectImpl.prototype.eIsSet.call(this, featureID);
            };
            RuleFromClauseImpl.prototype.toString = function() {
                if (this.eIsProxy()) {
                    return EObjectImpl.prototype.toString.call(this);
                }
                var result = new StringBuffer(EObjectImpl.prototype.toString
                        .call(this));
                result.append(" (commandToken: ");
                result.append(commandToken);
                result.append(')');
                return result.toString();
            };
            return RuleFromClauseImpl;
        });
define(
        'commonddl/astmodel/PrefixRuleFromClauseImpl',["commonddl/astmodel/RuleFromClauseImpl"

        ], // dependencies
        function(RuleFromClauseImpl) {
            PrefixRuleFromClauseImpl.prototype = Object
                    .create(RuleFromClauseImpl.prototype);
            PrefixRuleFromClauseImpl.ON_TOKEN_EDEFAULT = null;
            PrefixRuleFromClauseImpl.prototype.onToken = PrefixRuleFromClauseImpl.ON_TOKEN_EDEFAULT;
            function PrefixRuleFromClauseImpl() {
                RuleFromClauseImpl.call(this);
            }
            PrefixRuleFromClauseImpl.prototype.eStaticClass = function() {
                return IAstPackage.Literals.PREFIX_RULE_FROM_CLAUSE;
            };
            PrefixRuleFromClauseImpl.prototype.getOnToken = function() {
                return this.onToken;
            };
            PrefixRuleFromClauseImpl.prototype.setOnToken = function(newOnToken) {
                var oldOnToken = this.onToken;
                this.onToken = newOnToken;
            };
            PrefixRuleFromClauseImpl.prototype.eGet = function(featureID,
                    resolve, coreType) {
                switch (featureID) {
                case IAstPackage.PREFIX_RULE_FROM_CLAUSE__ON_TOKEN:
                    return this.getOnToken();
                }
                return RuleFromClauseImpl.prototype.eGet.call(this, featureID,
                        resolve, coreType);
            };
            PrefixRuleFromClauseImpl.prototype.eSet = function(featureID,
                    newValue) {
                switch (featureID) {
                case IAstPackage.PREFIX_RULE_FROM_CLAUSE__ON_TOKEN:
                    this.setOnToken(newValue);
                    return;
                }
                RuleFromClauseImpl.prototype.eSet.call(this, featureID,
                        newValue);
            };
            PrefixRuleFromClauseImpl.prototype.eUnset = function(featureID) {
                switch (featureID) {
                case IAstPackage.PREFIX_RULE_FROM_CLAUSE__ON_TOKEN:
                    this.setOnToken(PrefixRuleFromClauseImpl.ON_TOKEN_EDEFAULT);
                    return;
                }
                RuleFromClauseImpl.prototype.eUnset.call(this, featureID);
            };
            PrefixRuleFromClauseImpl.prototype.eIsSet = function(featureID) {
                switch (featureID) {
                case IAstPackage.PREFIX_RULE_FROM_CLAUSE__ON_TOKEN:
                    return PrefixRuleFromClauseImpl.ON_TOKEN_EDEFAULT == null ? this.onToken != null
                            : !PrefixRuleFromClauseImpl.ON_TOKEN_EDEFAULT === onToken;
                }
                return RuleFromClauseImpl.prototype.eIsSet
                        .call(this, featureID);
            };
            PrefixRuleFromClauseImpl.prototype.toString = function() {
                if (this.eIsProxy()) {
                    return RuleFromClauseImpl.prototype.toString.call(this);
                }
                var result = new StringBuffer(
                        RuleFromClauseImpl.prototype.toString.call(this));
                result.append(" (onToken: ");
                result.append(onToken);
                result.append(')');
                return result.toString();
            };
            return PrefixRuleFromClauseImpl;
        });
define('commonddl/astmodel/PostfixRuleFromClauseImpl',["commonddl/astmodel/RuleFromClauseImpl"

], // dependencies
function(RuleFromClauseImpl) {
    PostfixRuleFromClauseImpl.prototype = Object
            .create(RuleFromClauseImpl.prototype);
    function PostfixRuleFromClauseImpl() {
        RuleFromClauseImpl.call(this);
    }
    PostfixRuleFromClauseImpl.prototype.eStaticClass = function() {
        return IAstPackage.Literals.POSTFIX_RULE_FROM_CLAUSE;
    };
    return PostfixRuleFromClauseImpl;
});
define(
    'commonddl/astmodel/AstFactoryImpl',["commonddl/astmodel/CompilationUnitImpl",
        "commonddl/astmodel/ViewDefinitionImpl",
        "commonddl/astmodel/ViewSelectImpl",
        "commonddl/astmodel/ColumnImpl",
        "commonddl/astmodel/DataSourceAssociationImpl",
        "require",
        "commonddl/astmodel/PathEntryImpl",
        "commonddl/astmodel/DataSourceImpl",
        "commonddl/astmodel/SelectListEntryImpl",
        "commonddl/astmodel/SelectListImpl",
        "commonddl/astmodel/CompExpressionImpl",
        "commonddl/astmodel/JoinDataSourceImpl",
        "commonddl/astmodel/PreAnnotationImpl",
        "commonddl/astmodel/AnnotationValueImpl","commonddl/astmodel/ViewExtendImpl","commonddl/astmodel/BooleanExpressionImpl","commonddl/astmodel/LiteralExpressionImpl","commonddl/astmodel/ExpressionContainerImpl","commonddl/astmodel/AnnotationRecordValueImpl","commonddl/astmodel/AnnotationNameValuePairImpl","commonddl/astmodel/AnnotationArrayValueImpl","commonddl/astmodel/SelectListEntryExtensionImpl","commonddl/astmodel/NotExpressionImpl","commonddl/astmodel/AnnotationDeclarationImpl","commonddl/astmodel/AnonymousTypeDeclarationImpl",
        "commonddl/astmodel/AttributeDeclarationImpl","commonddl/astmodel/EnumerationDeclarationImpl","commonddl/astmodel/EnumerationValueImpl","commonddl/astmodel/ProxyStatementImpl","commonddl/astmodel/PathDeclarationImpl","commonddl/astmodel/ContextDeclarationImpl","commonddl/astmodel/NamespaceDeclarationImpl","commonddl/astmodel/EntityDeclarationImpl","commonddl/astmodel/AssociationDeclarationImpl","commonddl/astmodel/ForeignKeyImpl","commonddl/astmodel/TypeDeclarationImpl","commonddl/astmodel/UsingDirectiveImpl","commonddl/astmodel/StdFuncExpressionImpl","commonddl/astmodel/OrderByEntryImpl","commonddl/astmodel/ConcatenationExpressionImpl","commonddl/astmodel/OrderByImpl","commonddl/astmodel/GroupByImpl","commonddl/astmodel/InExpressionImpl","commonddl/astmodel/GroupByEntryImpl","commonddl/astmodel/LikeExpressionImpl","commonddl/astmodel/BetweenExpressionImpl","commonddl/astmodel/NullExpressionImpl",
        "commonddl/astmodel/FuncExpressionImpl",
        "commonddl/astmodel/NamesImpl",
        "commonddl/astmodel/ViewColumnNameImpl",
        "commonddl/astmodel/SimpleCaseExpressionImpl",
        "commonddl/astmodel/CaseWhenExpressionImpl",
        "commonddl/astmodel/ArithmeticExpressionImpl",
        "commonddl/astmodel/CastExpressionImpl",
        "commonddl/astmodel/SearchedCaseExpressionImpl",
        "commonddl/astmodel/FuncWithNamedParamExpressionImpl",
        "commonddl/astmodel/FuncParamImpl",
        "commonddl/astmodel/ParameterImpl",
        "commonddl/astmodel/PostAnnotationImpl",
        "commonddl/astmodel/ConstDeclarationImpl",
        "commonddl/astmodel/AccessPolicyDeclarationImpl",
        "commonddl/astmodel/AspectDeclarationImpl",
        "commonddl/astmodel/RoleComponentDeclarationImpl",
        "commonddl/astmodel/RoleDeclarationImpl",
        "commonddl/astmodel/RuleDeclarationImpl",
        "commonddl/astmodel/PrefixRuleFromClauseImpl",
        "commonddl/astmodel/PostfixRuleFromClauseImpl",
                "commonddl/astmodel/ViewSelectSetImpl"
    ], //dependencies
    function (CompilationUnitImpl,ViewDefinitionImpl,ViewSelectImpl,ColumnImpl,DataSourceAssociationImpl,require,PathEntryImpl,DataSourceImpl,SelectListEntryImpl,SelectListImpl,CompExpressionImpl,JoinDataSourceImpl,PreAnnotationImpl,AnnotationValueImpl,ViewExtendImpl,BooleanExpressionImpl,LiteralExpressionImpl,ExpressionContainerImpl,AnnotationRecordValueImpl,AnnotationNameValuePairImpl,AnnotationArrayValueImpl,SelectListEntryExtensionImpl,NotExpressionImpl,AnnotationDeclarationImpl,AnonymousTypeDeclarationImpl,AttributeDeclarationImpl,EnumerationDeclarationImpl,EnumerationValueImpl,ProxyStatementImpl,PathDeclarationImpl,ContextDeclarationImpl,NamespaceDeclarationImpl,EntityDeclarationImpl,AssociationDeclarationImpl,ForeignKeyImpl,TypeDeclarationImpl,UsingDirectiveImpl,StdFuncExpressionImpl,OrderByEntryImpl,ConcatenationExpressionImpl,OrderByImpl,GroupByImpl,InExpressionImpl,GroupByEntryImpl,LikeExpressionImpl,BetweenExpressionImpl,NullExpressionImpl,
              FuncExpressionImpl,NamesImpl,ViewColumnNameImpl,SimpleCaseExpressionImpl,CaseWhenExpressionImpl,ArithmeticExpressionImpl,CastExpressionImpl,
              SearchedCaseExpressionImpl,FuncWithNamedParamExpressionImpl,FuncParamImpl,ParameterImpl,PostAnnotationImpl,ConstDeclarationImpl,
              AccessPolicyDeclarationImpl,AspectDeclarationImpl,RoleComponentDeclarationImpl,RoleDeclarationImpl, RuleDeclarationImpl,
              PrefixRuleFromClauseImpl, PostfixRuleFromClauseImpl,ViewSelectSetImpl) {

        function AstFactoryImpl() {

        }

        AstFactoryImpl.init = function() {
            return new AstFactoryImpl();
        };
        AstFactoryImpl.prototype.create = function(eClass) {
            switch (eClass.getClassifierID()) {
                case IAstPackage.ABSTRACT_ANNOTATION_VALUE:
                    return this.createAbstractAnnotationValue();
                case IAstPackage.ACCESS_POLICY_DECLARATION: 
                    return this.createAccessPolicyDeclaration();
                case IAstPackage.ANNOTATED:
                    return this.createAnnotated();
                case IAstPackage.ANNOTATION:
                    return this.createAnnotation();
                case IAstPackage.ANNOTATION_ARRAY_VALUE:
                    return this.createAnnotationArrayValue();
                case IAstPackage.ANNOTATION_DECLARATION:
                    return this.createAnnotationDeclaration();
                case IAstPackage.ANNOTATION_VALUE:
                    return this.createAnnotationValue();
                case IAstPackage.ANNOTATION_NAME_VALUE_PAIR:
                    return this.createAnnotationNameValuePair();
                case IAstPackage.ANNOTATION_RECORD_VALUE:
                    return this.createAnnotationRecordValue();
                case IAstPackage.ANONYMOUS_TYPE_DECLARATION:
                    return this.createAnonymousTypeDeclaration();
                case IAstPackage.ARITHMETIC_EXPRESSION:
                    return this.createArithmeticExpression();
                case IAstPackage.ASPECT_DECLARATION: 
                    return createAspectDeclaration();
                case IAstPackage.ASSOCIATION_DECLARATION:
                    return this.createAssociationDeclaration();
                case IAstPackage.ATOMIC_EXPRESSION:
                    return this.createAtomicExpression();
                case IAstPackage.ATTRIBUTE_DECLARATION:
                    return this.createAttributeDeclaration();
                case IAstPackage.BETWEEN_EXPRESSION:
                    return this.createBetweenExpression();
                case IAstPackage.BOOLEAN_EXPRESSION:
                    return this.createBooleanExpression();
                case IAstPackage.CASE_EXPRESSION:
                    return this.createCaseExpression();
                case IAstPackage.CASE_WHEN_EXPRESSION:
                    return this.createCaseWhenExpression();
                case IAstPackage.SIMPLE_CASE_EXPRESSION:
                    return this.createSimpleCaseExpression();
                case IAstPackage.SEARCHED_CASE_EXPRESSION:
                    return this.createSearchedCaseExpression();
                case IAstPackage.CAST_EXPRESSION:
                    return this.createCastExpression();
                case IAstPackage.COLUMN:
                    return this.createColumn();
                case IAstPackage.COMP_EXPRESSION:
                    return this.createCompExpression();
                case IAstPackage.COMPILATION_UNIT:
                    return this.createCompilationUnit();
                case IAstPackage.CONCATENATION_EXPRESSION:
                    return this.createConcatenationExpression();
                case IAstPackage.CONTEXT_DECLARATION:
                    return this.createContextDeclaration();
                case IAstPackage.DATA_SOURCE:
                    return this.createDataSource();
                case IAstPackage.DATA_SOURCE_ASSOCIATION:
                    return this.createDataSourceAssociation();
                case IAstPackage.DDL_STATEMENT:
                    return this.createDdlStatement();
                case IAstPackage.DOCUMENT_ROOT:
                    return this.createDocumentRoot();
                case IAstPackage.ENTITY_DECLARATION:
                    return this.createEntityDeclaration();
                case IAstPackage.ENUMERATION_DECLARATION:
                    return this.createEnumerationDeclaration();
                case IAstPackage.ENUMERATION_VALUE:
                    return this.createEnumerationValue();
                case IAstPackage.EXPRESSION:
                    return this.createExpression();
                case IAstPackage.EXPRESSION_CONTAINER:
                    return this.createExpressionContainer();
                case IAstPackage.FOREIGN_KEY:
                    return this.createForeignKey();
                case IAstPackage.FUNC_EXPRESSION:
                    return this.createFuncExpression();
                case IAstPackage.FUNC_WITH_NAMED_PARAM_EXPRESSION:
                    return this.createFuncWithNamedParamExpression();
                case IAstPackage.FUNC_PARAM:
                    return this.createFuncParam();
                case IAstPackage.GROUP_BY:
                    return this.createGroupBy();
                case IAstPackage.GROUP_BY_ENTRY:
                    return this.createGroupByEntry();
                case IAstPackage.INCLUDED_ROLE:
                    return this.createIncludedRole();
                case IAstPackage.IN_EXPRESSION:
                    return this.createInExpression();
                case IAstPackage.JOIN_DATA_SOURCE:
                    return this.createJoinDataSource();
                case IAstPackage.LIKE_EXPRESSION:
                    return this.createLikeExpression();
                case IAstPackage.LITERAL_EXPRESSION:
                    return this.createLiteralExpression();
                case IAstPackage.NAMED_DECLARATION:
                    return this.createNamedDeclaration();
                case IAstPackage.NAMES:
                    return this.createNames();
                case IAstPackage.NAMESPACE_DECLARATION:
                    return this.createNamespaceDeclaration();
                case IAstPackage.NOT_EXPRESSION:
                    return this.createNotExpression();
                case IAstPackage.NULL_EXPRESSION:
                    return this.createNullExpression();
                case IAstPackage.ORDER_BY:
                    return this.createOrderBy();
                case IAstPackage.ORDER_BY_ENTRY:
                    return this.createOrderByEntry();
                case IAstPackage.PATH_ENTRY:
                    return this.createPathEntry();
                case IAstPackage.PATH_DECLARATION:
                    return this.createPathDeclaration();
                case IAstPackage.PATH_EXPRESSION:
                    return this.createPathExpression();
                case IAstPackage.PATH_TARGET:
                    return this.createPathTarget();
                case IAstPackage.POST_ANNOTATION:
                    return this.createPostAnnotation();
                case IAstPackage.PRE_ANNOTATION:
                    return this.createPreAnnotation();
                case IAstPackage.PROXY_STATEMENT:
                    return this.createProxyStatement();
                case IAstPackage.ROLE_COMPONENT_DECLARATION:
                    return this.createRoleComponentDeclaration();
                case IAstPackage.ROLE_DECLARATION: 
                    return this.createRoleDeclaration();
                case IAstPackage.RULE_DECLARATION:
                    return this.createRuleDeclaration();
                case IAstPackage.POSTFIX_RULE_FROM_CLAUSE: 
                    return this.createPostfixRuleFromClause();
                case IAstPackage.PREFIX_RULE_FROM_CLAUSE: 
                    return this.createPrefixRuleFromClause();
                case IAstPackage.ROLE_COMPONENT_DECLARATION:
                    return this.createRoleComponentDeclaration();
                case IAstPackage.ROLE_DECLARATION:
                    return this.createRoleDeclaration();
                case IAstPackage.RULE_DECLARATION:
                    return this.createRuleDeclaration();
                case IAstPackage.POSTFIX_RULE_FROM_CLAUSE:
                    return this.createPostfixRuleFromClause();
                case IAstPackage.PREFIX_RULE_FROM_CLAUSE:
                    return this.createPrefixRuleFromClause();
                case IAstPackage.SELECT_CONTAINER:
                    return this.createSelectContainer();
                case IAstPackage.SELECT_LIST:
                    return this.createSelectList();
                case IAstPackage.SELECT:
                    return this.createSelect();
                case IAstPackage.SELECT_LIST_ENTRY:
                    return this.createSelectListEntry();
                case IAstPackage.SELECT_LIST_ENTRY_EXTENSION:
                    return this.createSelectListEntryExtension();
                case IAstPackage.SOURCE_RANGE:
                    return this.createSourceRange();
                case IAstPackage.STATEMENT_CONTAINER:
                    return this.createStatementContainer();
                case IAstPackage.STD_FUNC_EXPRESSION:
                    return this.createStdFuncExpression();
                case IAstPackage.TYPE_DECLARATION:
                    return this.createTypeDeclaration();
                case IAstPackage.VIEW_COLUMN_NAME:
                    return this.createViewColumnName();
                case IAstPackage.VIEW_DEFINITION:
                    return this.createViewDefinition();
                case IAstPackage.VIEW_EXTEND:
                    return this.createViewExtend();
                case IAstPackage.VIEW_SELECT:
                    return this.createViewSelect();
                case IAstPackage.VIEW_SELECT_SET:
                    return this.createViewSelectSet();
                case IAstPackage.USING_DIRECTIVE:
                    return this.createUsingDirective();
                case IAstPackage.CONST_DECLARATION:
                    return this.createConstDeclaration();
                case IAstPackage.PARAMETER:
                    return this.createParameter();
                default :
                    throw new IllegalArgumentException("The class '" + eClass.getName() + "' is not a valid classifier");
            }
        };
        AstFactoryImpl.prototype.createFromString = function(eDataType,initialValue) {
            switch (eDataType.getClassifierID()) {
                case IAstPackage.BOOLEAN_TYPE:
                    return this.createBooleanTypeFromString(eDataType,initialValue);
                case IAstPackage.DATA_SOURCE_TYPE:
                    return this.createDataSourceTypeFromString(eDataType,initialValue);
                case IAstPackage.JOIN_ENUM:
                    return this.createJoinEnumFromString(eDataType,initialValue);
                case IAstPackage.SELECT_LIST_ENTRY_TYPE:
                    return this.createSelectListEntryTypeFromString(eDataType,initialValue);
                case IAstPackage.IPROGRESS_MONITOR:
                    return this.createIProgressMonitorFromString(eDataType,initialValue);
                case IAstPackage.OBJECT:
                    return this.createObjectFromString(eDataType,initialValue);
                case IAstPackage.TOKEN:
                    return this.createTokenFromString(eDataType,initialValue);
                case IAstPackage.TOKEN_LIST:
                    return this.createTokenListFromString(eDataType,initialValue);
                default :
                    throw new IllegalArgumentException("The datatype '" + eDataType.getName() + "' is not a valid classifier");
            }
        };
        AstFactoryImpl.prototype.convertToString = function(eDataType,instanceValue) {
            switch (eDataType.getClassifierID()) {
                case IAstPackage.BOOLEAN_TYPE:
                    return this.convertBooleanTypeToString(eDataType,instanceValue);
                case IAstPackage.DATA_SOURCE_TYPE:
                    return this.convertDataSourceTypeToString(eDataType,instanceValue);
                case IAstPackage.JOIN_ENUM:
                    return this.convertJoinEnumToString(eDataType,instanceValue);
                case IAstPackage.SELECT_LIST_ENTRY_TYPE:
                    return this.convertSelectListEntryTypeToString(eDataType,instanceValue);
                case IAstPackage.IPROGRESS_MONITOR:
                    return this.convertIProgressMonitorToString(eDataType,instanceValue);
                case IAstPackage.OBJECT:
                    return this.convertObjectToString(eDataType,instanceValue);
                case IAstPackage.TOKEN:
                    return this.convertTokenToString(eDataType,instanceValue);
                case IAstPackage.TOKEN_LIST:
                    return this.convertTokenListToString(eDataType,instanceValue);
                default :
                    throw new IllegalArgumentException("The datatype '" + eDataType.getName() + "' is not a valid classifier");
            }
        };
        AstFactoryImpl.prototype.createAbstractAnnotationValue = function() {
            var abstractAnnotationValue=new AbstractAnnotationValueImpl();
            return abstractAnnotationValue;
        };
        AstFactoryImpl.prototype.createAccessPolicyDeclaration = function() {
            var accessPolicyDeclaration = new AccessPolicyDeclarationImpl();
            return accessPolicyDeclaration;
        };
        AstFactoryImpl.prototype.createAnnotated = function() {
            var annotated=new AnnotatedImpl();
            return annotated;
        };
        AstFactoryImpl.prototype.createAnnotation = function() {
            var annotation=new AnnotationImpl();
            return annotation;
        };
        AstFactoryImpl.prototype.createAnnotationArrayValue = function() {
            var annotationArrayValue=new AnnotationArrayValueImpl();
            return annotationArrayValue;
        };
        AstFactoryImpl.prototype.createAnnotationDeclaration = function() {
            var annotationDeclaration=new AnnotationDeclarationImpl();
            return annotationDeclaration;
        };
        AstFactoryImpl.prototype.createAnnotationValue = function() {
            var annotationValue=new AnnotationValueImpl();
            return annotationValue;
        };
        AstFactoryImpl.prototype.createAssociationDeclaration = function() {
            var associationDeclaration=new AssociationDeclarationImpl();
            return associationDeclaration;
        };
        AstFactoryImpl.prototype.createAnnotationNameValuePair = function() {
            var annotationNameValuePair=new AnnotationNameValuePairImpl();
            return annotationNameValuePair;
        };
        AstFactoryImpl.prototype.createAnnotationRecordValue = function() {
            var annotationRecordValue=new AnnotationRecordValueImpl();
            return annotationRecordValue;
        };
        AstFactoryImpl.prototype.createAnonymousTypeDeclaration = function() {
            var anonymousTypeDeclaration=new AnonymousTypeDeclarationImpl();
            return anonymousTypeDeclaration;
        };
        AstFactoryImpl.prototype.createAtomicExpression = function() {
            var atomicExpression=new AtomicExpressionImpl();
            return atomicExpression;
        };
        AstFactoryImpl.prototype.createAttributeDeclaration = function() {
            var attributeDeclaration=new AttributeDeclarationImpl();
            return attributeDeclaration;
        };
        AstFactoryImpl.prototype.createBetweenExpression = function() {
            var betweenExpression=new BetweenExpressionImpl();
            return betweenExpression;
        };
        AstFactoryImpl.prototype.createBooleanExpression = function() {
            var booleanExpression=new BooleanExpressionImpl();
            return booleanExpression;
        };
        AstFactoryImpl.prototype.createColumn = function() {
            var column=new ColumnImpl();
            return column;
        };
        AstFactoryImpl.prototype.createCompExpression = function() {
            var compExpression=new CompExpressionImpl();
            return compExpression;
        };
        AstFactoryImpl.prototype.createCompilationUnit = function() {
            var compilationUnit=new CompilationUnitImpl();
            return compilationUnit;
        };
        AstFactoryImpl.prototype.createContextDeclaration = function() {
            var contextDeclaration=new ContextDeclarationImpl();
            return contextDeclaration;
        };
        AstFactoryImpl.prototype.createDataSource = function() {
            var dataSource=new DataSourceImpl();
            return dataSource;
        };
        AstFactoryImpl.prototype.createDdlStatement = function() {
            var ddlStatement=new DdlStatementImpl();
            return ddlStatement;
        };
        AstFactoryImpl.prototype.createDocumentRoot = function() {
            var documentRoot=new DocumentRootImpl();
            return documentRoot;
        };
        AstFactoryImpl.prototype.createEntityDeclaration = function() {
            var entityDeclaration=new EntityDeclarationImpl();
            return entityDeclaration;
        };
        AstFactoryImpl.prototype.createEnumerationDeclaration = function() {
            var enumerationDeclaration=new EnumerationDeclarationImpl();
            return enumerationDeclaration;
        };
        AstFactoryImpl.prototype.createEnumerationValue = function() {
            var enumerationValue=new EnumerationValueImpl();
            return enumerationValue;
        };
        AstFactoryImpl.prototype.createExpression = function() {
            var expression=new ExpressionImpl();
            return expression;
        };
        AstFactoryImpl.prototype.createExpressionContainer = function() {
            var expressionContainer=new ExpressionContainerImpl();
            return expressionContainer;
        };
        AstFactoryImpl.prototype.createForeignKey = function() {
            var foreignKey=new ForeignKeyImpl();
            return foreignKey;
        };
        AstFactoryImpl.prototype.createFuncExpression = function() {
            var funcExpression=new FuncExpressionImpl();
            return funcExpression;
        };
        AstFactoryImpl.prototype.createFuncWithNamedParamExpression = function() {
            var funcWithNamedParamExpression = new FuncWithNamedParamExpressionImpl();
            return funcWithNamedParamExpression;
        };
        AstFactoryImpl.prototype.createFuncParam = function() {
            var funcParam = new FuncParamImpl();
            return funcParam;
        };
        AstFactoryImpl.prototype.createGroupBy = function() {
            var groupBy=new GroupByImpl();
            return groupBy;
        };
        AstFactoryImpl.prototype.createGroupByEntry = function() {
            var groupByEntry=new GroupByEntryImpl();
            return groupByEntry;
        };
        AstFactoryImpl.prototype.createIncludedRole = function() {
            var includedRole=new IncludedRoleImpl();
            return includedRole;
        };
        AstFactoryImpl.prototype.createJoinDataSource = function() {
            var joinDataSource=new JoinDataSourceImpl();
            return joinDataSource;
        };
        AstFactoryImpl.prototype.createLikeExpression = function() {
            var likeExpression=new LikeExpressionImpl();
            return likeExpression;
        };
        AstFactoryImpl.prototype.createLiteralExpression = function() {
            var literalExpression=new LiteralExpressionImpl();
            return literalExpression;
        };
        AstFactoryImpl.prototype.createNamedDeclaration = function() {
            var namedDeclaration=new NamedDeclarationImpl();
            return namedDeclaration;
        };
        AstFactoryImpl.prototype.createNames = function() {
            var names=new NamesImpl();
            return names;
        };
        AstFactoryImpl.prototype.createNamespaceDeclaration = function() {
            var namespaceDeclaration=new NamespaceDeclarationImpl();
            return namespaceDeclaration;
        };
        AstFactoryImpl.prototype.createNotExpression = function() {
            var notExpression=new NotExpressionImpl();
            return notExpression;
        };
        AstFactoryImpl.prototype.createNullExpression = function() {
            var nullExpression=new NullExpressionImpl();
            return nullExpression;
        };
        AstFactoryImpl.prototype.createOrderBy = function() {
            var orderBy=new OrderByImpl();
            return orderBy;
        };
        AstFactoryImpl.prototype.createOrderByEntry = function() {
            var orderByEntry=new OrderByEntryImpl();
            return orderByEntry;
        };
        AstFactoryImpl.prototype.createPathEntry = function() {
            var pathEntry=new PathEntryImpl();
            return pathEntry;
        };
        AstFactoryImpl.prototype.createPathDeclaration = function() {
            var pathDeclaration=new PathDeclarationImpl();
            return pathDeclaration;
        };
        AstFactoryImpl.prototype.createPathExpression = function() {
            //circular dependency problem -> caller must first load PathExpressionImpl by itself
            var PathExpressionImpl = require("commonddl/astmodel/PathExpressionImpl");

            var pathExpression=new PathExpressionImpl();
            return pathExpression;
        };
        AstFactoryImpl.prototype.createPathTarget = function() {
            var pathTarget=new PathTargetImpl();
            return pathTarget;
        };
        AstFactoryImpl.prototype.createPostAnnotation = function() {
            var postAnnotation=new PostAnnotationImpl();
            return postAnnotation;
        };
        AstFactoryImpl.prototype.createPreAnnotation = function() {
            var preAnnotation=new PreAnnotationImpl();
            return preAnnotation;
        };
        AstFactoryImpl.prototype.createProxyStatement = function() {
            var proxyStatement=new ProxyStatementImpl();
            return proxyStatement;
        };
        AstFactoryImpl.prototype.createRoleComponentDeclaration = function() {
            var roleComponentDeclaration = new RoleComponentDeclarationImpl();
            return roleComponentDeclaration;
        };
        AstFactoryImpl.prototype.createRoleDeclaration = function() {
            var roleDeclaration = new RoleDeclarationImpl();
            return roleDeclaration;
        };
        AstFactoryImpl.prototype.createRuleDeclaration = function() {
            var ruleDeclaration = new RuleDeclarationImpl();
            return ruleDeclaration;
        };
        AstFactoryImpl.prototype.createPostfixRuleFromClause = function() {
            var postfixRuleFromClause = new PostfixRuleFromClauseImpl();
            return postfixRuleFromClause;
        };
        AstFactoryImpl.prototype.createPrefixRuleFromClause = function() {
            var prefixRuleFromClause = new PrefixRuleFromClauseImpl();
            return prefixRuleFromClause;
        };
        AstFactoryImpl.prototype.createRoleComponentDeclaration = function() {
            var roleComponentDeclaration=new RoleComponentDeclarationImpl();
            return roleComponentDeclaration;
        };
        AstFactoryImpl.prototype.createRoleDeclaration = function() {
            var roleDeclaration=new RoleDeclarationImpl();
            return roleDeclaration;
        };
        AstFactoryImpl.prototype.createRuleDeclaration = function() {
            var ruleDeclaration=new RuleDeclarationImpl();
            return ruleDeclaration;
        };
        AstFactoryImpl.prototype.createPostfixRuleFromClause = function() {
            var postfixRuleFromClause=new PostfixRuleFromClauseImpl();
            return postfixRuleFromClause;
        };
        AstFactoryImpl.prototype.createPrefixRuleFromClause = function() {
            var prefixRuleFromClause=new PrefixRuleFromClauseImpl();
            return prefixRuleFromClause;
        };
        AstFactoryImpl.prototype.createSelect = function() {
            var select=new SelectImpl();
            return select;
        };
        AstFactoryImpl.prototype.createSelectContainer = function() {
            var selectContainer=new SelectContainerImpl();
            return selectContainer;
        };
        AstFactoryImpl.prototype.createSelectList = function() {
            var selectList=new SelectListImpl();
            return selectList;
        };
        AstFactoryImpl.prototype.createSelectListEntry = function() {
            var selectListEntry=new SelectListEntryImpl();
            return selectListEntry;
        };
        AstFactoryImpl.prototype.createSelectListEntryExtension = function() {
            var selectListEntryExtension=new SelectListEntryExtensionImpl();
            return selectListEntryExtension;
        };
        AstFactoryImpl.prototype.createSourceRange = function() {
            var sourceRange=new SourceRangeImpl();
            return sourceRange;
        };
        AstFactoryImpl.prototype.createStatementContainer = function() {
            var statementContainer=new StatementContainerImpl();
            return statementContainer;
        };
        AstFactoryImpl.prototype.createStdFuncExpression = function() {
            var stdFuncExpression=new StdFuncExpressionImpl();
            return stdFuncExpression;
        };
        AstFactoryImpl.prototype.createTypeDeclaration = function() {
            var typeDeclaration=new TypeDeclarationImpl();
            return typeDeclaration;
        };
        AstFactoryImpl.prototype.createViewColumnName = function() {
            var viewColumnName=new ViewColumnNameImpl();
            return viewColumnName;
        };
        AstFactoryImpl.prototype.createViewSelect = function() {
            var viewSelect=new ViewSelectImpl();
            return viewSelect;
        };
        AstFactoryImpl.prototype.createViewSelectSet = function() {
            var viewSelectSet=new ViewSelectSetImpl();
            return viewSelectSet;
        };
        AstFactoryImpl.prototype.createViewExtend = function() {
            var viewExtend=new ViewExtendImpl();
            return viewExtend;
        };
        AstFactoryImpl.prototype.createViewDefinition = function() {
            var viewDefinition=new ViewDefinitionImpl();
            return viewDefinition;
        };
        AstFactoryImpl.prototype.createArithmeticExpression = function() {
            var arithmeticExpression=new ArithmeticExpressionImpl();
            return arithmeticExpression;
        };
        AstFactoryImpl.prototype.createAspectDeclaration = function() {
            var aspectDeclaration=new AspectDeclarationImpl();
            return aspectDeclaration;
        };
        AstFactoryImpl.prototype.createCastExpression = function() {
            var castExpression=new CastExpressionImpl();
            return castExpression;
        };
        AstFactoryImpl.prototype.createCaseExpression = function() {
            var caseExpression=new CaseExpressionImpl();
            return caseExpression;
        };
        AstFactoryImpl.prototype.createCaseWhenExpression = function() {
            var caseWhenExpression=new CaseWhenExpressionImpl();
            return caseWhenExpression;
        };
        AstFactoryImpl.prototype.createSimpleCaseExpression = function() {
            var simpleCaseExpression=new SimpleCaseExpressionImpl();
            return simpleCaseExpression;
        };
        AstFactoryImpl.prototype.createSearchedCaseExpression = function() {
            var searchedCaseExpression=new SearchedCaseExpressionImpl();
            return searchedCaseExpression;
        };
        AstFactoryImpl.prototype.createUsingDirective = function() {
            var usingDirective=new UsingDirectiveImpl();
            return usingDirective;
        };
        AstFactoryImpl.prototype.createConstDeclaration = function() {
            var constDeclaration=new ConstDeclarationImpl();
            return constDeclaration;
        };
        AstFactoryImpl.prototype.createParameter = function() {
            var parameter=new ParameterImpl();
            return parameter;
        };
        AstFactoryImpl.prototype.createDataSourceAssociation = function() {
            var dataSourceAssociation=new DataSourceAssociationImpl();
            return dataSourceAssociation;
        };
        AstFactoryImpl.prototype.createConcatenationExpression = function() {
            var concatenationExpression=new ConcatenationExpressionImpl();
            return concatenationExpression;
        };
        AstFactoryImpl.prototype.createInExpression = function() {
            var inExpression=new InExpressionImpl();
            return inExpression;
        };
        AstFactoryImpl.prototype.createBooleanTypeFromString = function(eDataType,initialValue) {
            var result=BooleanType.get1(initialValue);
            if (result == null) {
                throw new IllegalArgumentException("The value '" + initialValue + "' is not a valid enumerator of '"+ eDataType.getName()+ "'");
            }
            return result;
        };
        AstFactoryImpl.prototype.convertBooleanTypeToString = function(eDataType,instanceValue) {
            return instanceValue == null ? null : instanceValue.toString();
        };
        AstFactoryImpl.prototype.createDataSourceTypeFromString = function(eDataType,initialValue) {
            var result=DataSourceType.get1(initialValue);
            if (result == null) {
                throw new IllegalArgumentException("The value '" + initialValue + "' is not a valid enumerator of '"+ eDataType.getName()+ "'");
            }
            return result;
        };
        AstFactoryImpl.prototype.convertDataSourceTypeToString = function(eDataType,instanceValue) {
            return instanceValue == null ? null : instanceValue.toString();
        };
        AstFactoryImpl.prototype.createJoinEnumFromString = function(eDataType,initialValue) {
            var result=JoinEnum.get1(initialValue);
            if (result == null) {
                throw new IllegalArgumentException("The value '" + initialValue + "' is not a valid enumerator of '"+ eDataType.getName()+ "'");
            }
            return result;
        };
        AstFactoryImpl.prototype.convertJoinEnumToString = function(eDataType,instanceValue) {
            return instanceValue == null ? null : instanceValue.toString();
        };
        AstFactoryImpl.prototype.createSelectListEntryTypeFromString = function(eDataType,initialValue) {
            var result=SelectListEntryType.get1(initialValue);
            if (result == null) {
                throw new IllegalArgumentException("The value '" + initialValue + "' is not a valid enumerator of '"+ eDataType.getName()+ "'");
            }
            return result;
        };
        AstFactoryImpl.prototype.convertSelectListEntryTypeToString = function(eDataType,instanceValue) {
            return instanceValue == null ? null : instanceValue.toString();
        };
        AstFactoryImpl.prototype.createIProgressMonitorFromString = function(eDataType,initialValue) {
            return EFactoryImpl.prototype.createFromString.call(this,eDataType,initialValue);
        };
        AstFactoryImpl.prototype.convertIProgressMonitorToString = function(eDataType,instanceValue) {
            return EFactoryImpl.prototype.convertToString2.call(this,eDataType,instanceValue);
        };
        AstFactoryImpl.prototype.createObjectFromString = function(eDataType,initialValue) {
            return EFactoryImpl.prototype.createFromString.call(this,eDataType,initialValue);
        };
        AstFactoryImpl.prototype.convertObjectToString = function(eDataType,instanceValue) {
            return EFactoryImpl.prototype.convertToString2.call(this,eDataType,instanceValue);
        };
        AstFactoryImpl.prototype.getAstPackage = function() {
            return this.getEPackage();
        };
        AstFactoryImpl.getPackage = function() {
            return IAstPackage.eINSTANCE;
        };

        return AstFactoryImpl;
    }
);
define(
    'commonddl/astmodel/IAstFactory',["commonddl/astmodel/AstFactoryImpl"], //dependencies
    function (AstFactoryImpl) {

        function IAstFactory() {

        }
        IAstFactory.eINSTANCE = AstFactoryImpl.init();
        return IAstFactory;
    }
);
define(
    'commonddl/astmodel/PathExpressionImpl',[ "commonddl/astmodel/IAstFactory",
        "commonddl/astmodel/ExpressionImpl",
        "commonddl/astmodel/EObjectContainmentEList",
        "commonddl/astmodel/ViewSelectImpl",
        "commonddl/astmodel/EObjectImpl",
        "commonddl/astmodel/JoinDataSourceImpl",
        "rndrt/rnd",
        "commonddl/astmodel/DataSourceImpl",
        "commonddl/astmodel/AssociationDeclarationImpl"
    ], //dependencies
    function (IAstFactory,ExpressionImpl,EObjectContainmentEList,ViewSelectImpl,EObjectImpl,JoinDataSourceImpl,rnd,DataSourceImpl,AssociationDeclarationImpl) {
        var Utils = rnd.Utils;

        PathExpressionImpl.prototype = Object.create(ExpressionImpl.prototype);
        PathExpressionImpl.prototype.entries=null;
        PathExpressionImpl.LAST_NAMESPACE_COMPONENT_INDEX_EDEFAULT=null;
        PathExpressionImpl.prototype.lastNamespaceComponentIndex=PathExpressionImpl.LAST_NAMESPACE_COMPONENT_INDEX_EDEFAULT;
        PathExpressionImpl.prototype.target=null;
        PathExpressionImpl.TABLE_NAME_EDEFAULT=null;
        PathExpressionImpl.IDENTIFIER_EDEFAULT=null;
        PathExpressionImpl.TABLE_NAME_TOKEN_EDEFAULT=null;
        PathExpressionImpl.IDENTIFIER_TOKEN_EDEFAULT=null;
        PathExpressionImpl.undefDataSourceColumn=IAstFactory.eINSTANCE.createColumn();
        PathExpressionImpl.prototype.dataSourceColumn=PathExpressionImpl.undefDataSourceColumn;
        PathExpressionImpl.undefDataSourceAssociation=IAstFactory.eINSTANCE.createDataSourceAssociation();
        PathExpressionImpl.prototype.dataSourceAssociation=PathExpressionImpl.undefDataSourceAssociation;
        function PathExpressionImpl() {
            ExpressionImpl.call(this);
        }
        PathExpressionImpl.prototype.eStaticClass = function() {
            return IAstPackage.Literals.PATH_EXPRESSION;
        };
        PathExpressionImpl.prototype.getEntries = function() {
            if (this.entries == null) {
                this.entries=new EObjectContainmentEList(this);
            }
            return this.entries;
        };
        PathExpressionImpl.prototype.getLastNamespaceComponentIndex = function() {
            return this.lastNamespaceComponentIndex;
        };
        PathExpressionImpl.prototype.setLastNamespaceComponentIndex = function(newLastNamespaceComponentIndex) {
            var oldLastNamespaceComponentIndex=this.lastNamespaceComponentIndex;
            this.lastNamespaceComponentIndex=newLastNamespaceComponentIndex;
        };
        PathExpressionImpl.prototype.getTarget = function() {
            if (this.target != null) {
                return this.target;
            }
            try {
                var select=this.getViewSelect(this);
                if (select != null) {
                    var entries=this.getEntries();
                    if (this.entries.length > 2) {
                        return null;
                    }
                    if (this.entries.length == 2) {
                        var tableName=this.entries[0].getNameToken();
                        var ds=this.getBestMatchingDataSource2(tableName,this);
                        if (ds != null) {
                            this.target=ds;
                            return ds;
                        }
                        ds=this.getFirstMatchingDataSource(tableName,select.getFrom());
                        if (ds != null) {
                            this.target=ds;
                            return ds;
                        }
                        ds=this.getFirstMatchingAssociationDataSource(tableName,select);
                        if (ds != null) {
                            this.target=ds;
                            return ds;
                        }
                        ds=this.getFromUnion(tableName,select);
                        if (ds != null) {
                            this.target=ds;
                            return ds;
                        }
                    }
                    if (this.entries.length == 1) {
                        if (this.isStar(this.entries[0])) {
                            return null;
                        }
                        if (this.hasOnlyOneSingleDataSource(this)) {
                            var ds=this.getBestMatchingDataSource1(this);
                            if (ds != null) {
                                this.target=ds;
                                return ds;
                            }
                            ds=this.getVerfyFirstFromDataSource(select);
                            this.target=ds;
                            return ds;
                        }else{
                            var map=this.getColumnsByDatasourceExpectingUniqueColumnNames(this);
                            if (map == null) {
                                var ds=this.getBestMatchingDataSource1(this);
                                if (ds != null) {
                                    this.target=ds;
                                    return ds;
                                }
                                return null;
                            }
                            var aeColumnName=this.entries[0].getNameToken().m_lexem.toUpperCase();
                            var ds=map[aeColumnName];
                            if (ds == null && select.isUncertainColumnUsage() == false) {
                                var container=ExpressionImpl.getFirstNonExpressionContainer(this);
                                if (container instanceof AssociationDeclarationImpl) {
                                    ds=this.getDatasourceForSelectListEntry(select,aeColumnName);
                                }
                            }
                            this.target=ds;
                            return ds;
                        }
                    }
                }
            }
            catch(e) {
                console.log(e.stack);
                return null;
            }
            return null;
        };
        PathExpressionImpl.prototype.getDatasourceForSelectListEntry = function(viewSelect,selectListEntryName) {
            try {
                var unquotedSelectListEntryName=DataSourceImpl.removeQuotes(selectListEntryName);
                var entries=viewSelect.getSelectList().getEntries();
                for (var entryCount=0;entryCount<entries.length;entryCount++) {
                    var entry=entries[entryCount];
                    var doit=false;
                    var alias=entry.getAlias();
                    if (alias != null) {
                        var unquotedAlias=DataSourceImpl.removeQuotes(alias);
                        if (Utils.stringEqualsIgnoreCase(unquotedAlias, unquotedSelectListEntryName)) {
                            doit=true;
                        }
                    }
                    if (doit == false) {
                        var ex=entry.getExpression();
                        if (ex instanceof PathExpressionImpl) {
                            var ps=(ex).getPathString(false);
                            var unquotedPs=DataSourceImpl.removeQuotes(ps);
                            if (unquotedPs != null && Utils.stringEqualsIgnoreCase(unquotedPs, unquotedSelectListEntryName)) {
                                doit=true;
                            }
                        }
                    }
                    if (doit) {
                        var ex=entry.getExpression();
                        if (ex instanceof PathExpressionImpl) {
                            var pex=ex;
                            var t=pex.getTarget();
                            if (t instanceof DataSourceImpl) {
                                return t;
                            }
                        }
                    }
                }
            }
            catch(e) {
            }
            return null;
        };
        PathExpressionImpl.prototype.isStar = function(entry) {
            if (entry != null) {
                var nt=entry.getNameToken();
                if (nt != null && "*"===nt.m_lexem) {
                    return true;
                }
            }
            return false;
        };
        PathExpressionImpl.prototype.getFirstMatchingDataSource = function(tableName,from) {
            if (from instanceof JoinDataSourceImpl) {
                var jd=from;
                var ds=this.getFirstMatchingDataSource(tableName,jd.getLeft());
                if (ds != null) {
                    return ds;
                }
                ds=this.getFirstMatchingDataSource(tableName,jd.getRight());
                if (ds != null) {
                    return ds;
                }
            }else{
                var fn=from.getNamePathExpression().getPathString(false);
                if (fn != null && tableName != null && Utils.stringEqualsIgnoreCase(DataSourceImpl.removeQuotes(fn), DataSourceImpl.removeQuotes(tableName.m_lexem))) {
                    return from;
                }
                var alias=from.getAliasToken();
                if (alias != null && tableName != null && Utils.stringEqualsIgnoreCase(DataSourceImpl.removeQuotes(alias.m_lexem), DataSourceImpl.removeQuotes(tableName.m_lexem))) {
                    return from;
                }
            }
            return null;
        };
        PathExpressionImpl.prototype.getFirstMatchingAssociationDataSource = function(tableName,select) {
            var assocs=select.getAssociations();
            for (var assocCount=0;assocCount<assocs.length;assocCount++) {
                var assoc=assocs[assocCount];
                var ds=assoc.getTargetDataSource();
                var fn=ds.getNamePathExpression().getPathString(false);
                if (fn != null && tableName != null && Utils.stringEqualsIgnoreCase(DataSourceImpl.removeQuotes(fn), DataSourceImpl.removeQuotes(tableName.m_lexem))) {
                    return ds;
                }
                var alias=ds.getAliasToken();
                if (alias != null && tableName != null && Utils.stringEqualsIgnoreCase(DataSourceImpl.removeQuotes(alias.m_lexem), DataSourceImpl.removeQuotes(tableName.m_lexem))) {
                    return ds;
                }
            }
            return null;
        };
        PathExpressionImpl.prototype.getFromUnion = function(tableName,select) {
            var union=select.getUnion();
            if (union == null) {
                return null;
            }
            var ds=this.getFirstMatchingDataSource(tableName,union.getFrom());
            if (ds != null) {
                return ds;
            }
            ds=this.getFromUnion(tableName,union);
            if (ds != null) {
                return ds;
            }
            return null;
        };
        PathExpressionImpl.prototype.getColumnsByDatasourceExpectingUniqueColumnNames = function(ae) {
            var result={};
            var select=this.getViewSelect(ae);
            if (select == null) {
                return result;
            }
            var dataSources=this.computeDataSourceListExpectingUniqueColumnNames(select,ae);
            var processedDsNames=[];
            for (var dsCount=0;dsCount<dataSources.length;dsCount++) {
                var ds=dataSources[dsCount];
                var dsName=ds.getNamePathExpression().getPathString(false).toUpperCase();
                if (Utils.arrayContains(processedDsNames, dsName)) {
                    continue;
                }
                processedDsNames.push(dsName);
                var cachedColumns=ds.getCachedColumns();
                if (cachedColumns == null) {
                    select.setUncertainColumnUsage(true);
                    continue;
                }
                for (var columnCount=0;columnCount<cachedColumns.length;columnCount++) {
                    var column=cachedColumns[columnCount];
                    var columnName=column.getName().toUpperCase();
                    if (result[columnName]) {
                        result[columnName]=null;
                        continue;
                    }
                    result[columnName]=ds;
                }
                for (var assocCount=0;assocCount<ds.getCachedAssociations().length;assocCount++) {
                    var assoc=ds.getCachedAssociations()[assocCount];
                    var associationName=assoc.getName().toUpperCase();
                    if (result[associationName]) {
                        result[associationName]=null;
                        continue;
                    }
                    result[associationName]=ds;
                }
            }
            return result;
        };
        PathExpressionImpl.prototype.computeDataSourceListExpectingUniqueColumnNames = function(select,pathExpr) {
            var container=ExpressionImpl.getFirstNonExpressionContainer(pathExpr);
            if (container instanceof JoinDataSourceImpl) {
                var list=[];
                ViewSelectImpl.getAllFlatDataSources(container,list);
                return list;
            }else{
                var list=[];
                ViewSelectImpl.getAllFlatDataSources(select.getFrom(),list);
                if (container instanceof AssociationDeclarationImpl) {
                    var assocTrgt=(container).getTargetDataSource();
                    list.push(assocTrgt);
                }
                return list;
            }
        };
        PathExpressionImpl.prototype.getVerfyFirstFromDataSource = function(select) {
            var from=select.getFrom();
            while (from instanceof JoinDataSourceImpl) {
                var j=from;
                from=j.getLeft();
            }
            return from;
        };
        PathExpressionImpl.prototype.getBestMatchingDataSource2 = function(tableName,ae) {
            try {
                var p=ae.getParent();
                if (p == null) {
                    p=ae.eContainer();
                }
                if (p instanceof EObjectImpl) {
                    var cont=this.getContainerOrParent(p);
                    if (cont != null) {
                        while (!(cont instanceof ViewSelectImpl)) {
                            cont=this.getContainerOrParent(cont);
                            if (cont == null) {
                                return null;
                            }
                        }
                        var ds=(cont).getFrom();
                        var bmds=this.getBestMatchingDataSourceInternal(tableName,ds);
                        if (bmds != null) {
                            return bmds;
                        }
                    }
                }
            }
            catch(e) {
            }
            return null;
        };
        PathExpressionImpl.prototype.getBestMatchingDataSource1 = function(ae) {
            var p=ae.getParent();
            if (p instanceof EObjectImpl) {
                var cont=(p).eContainer();
                if (cont != null) {
                    while (!(cont instanceof ViewSelectImpl)) {
                        cont=cont.eContainer();
                        if (cont == null) {
                            return null;
                        }
                    }
                    var ds=(cont).getFrom();
                    if (!(ds instanceof JoinDataSourceImpl)) {
                        return ds;
                    }
                }
            }
            return null;
        };
        PathExpressionImpl.prototype.getBestMatchingDataSourceInternal = function(tableName,ds) {
            if (ds instanceof JoinDataSourceImpl) {
                var jds=ds;
                var l=this.getBestMatchingDataSourceInternal(tableName,jds.getLeft());
                if (l != null) {
                    return l;
                }
                var r=this.getBestMatchingDataSourceInternal(tableName,jds.getRight());
                if (r != null) {
                    return r;
                }
            }
            if (!(ds instanceof JoinDataSourceImpl) && ds != null) {
                var dsps=ds.getNamePathExpression().getPathString(false);
                if (dsps != null && Utils.stringEqualsIgnoreCase(DataSourceImpl.removeQuotes(dsps), DataSourceImpl.removeQuotes(tableName.m_lexem))) {
                    return ds;
                }else if (ds.getAliasToken() != null && Utils.stringEqualsIgnoreCase(DataSourceImpl.removeQuotes(ds.getAliasToken().m_lexem), DataSourceImpl.removeQuotes(tableName.m_lexem))) {
                    return ds;
                }
            }
            return null;
        };
        PathExpressionImpl.prototype.hasOnlyOneSingleDataSource = function(ae) {
            var vs=this.getViewSelect(ae);
            if (vs == null) {
                return false;
            }
            var dataSources=vs.getDataSources();
            if (dataSources != null && dataSources.length <= 1) {
                return true;
            }
            return false;
        };
        PathExpressionImpl.prototype.getViewSelect = function(ae) {
            var cont=ae;
            while ((cont != null) && !(cont instanceof ViewSelectImpl)) {
                cont=this.getContainerOrParent(cont);
            }
            return cont;
        };
        PathExpressionImpl.prototype.getContainerOrParent = function(p) {
            var cont=p.eContainer();
            if (cont == null && p instanceof ExpressionImpl) {
                cont=(p).getParent();
            }
            return cont;
        };
        PathExpressionImpl.prototype.basicGetTarget = function() {
            return this.target;
        };
        PathExpressionImpl.prototype.setTarget = function(newTarget) {
            var oldTarget=this.target;
            this.target=newTarget;
        };
        PathExpressionImpl.prototype.getTableName = function() {
            var tableNameToken=this.getTableNameToken();
            if (tableNameToken != null) {
                return tableNameToken.m_lexem;
            }else{
                return null;
            }
        };
        PathExpressionImpl.prototype.getIdentifier = function() {
            var identifierToken=this.getIdentifierToken();
            if (identifierToken != null) {
                return identifierToken.m_lexem;
            }else{
                return null;
            }
        };
        PathExpressionImpl.prototype.getTableNameToken = function() {
            var entries=this.getEntries();
            if (this.entries.length == 1 || this.entries.isEmpty()) {
                return null;
            }
            if (this.entries.length == 2) {
                return this.entries[0].getNameToken();
            }
            return null;
        };
        PathExpressionImpl.prototype.getIdentifierToken = function() {
            var entries=this.getEntries();
            if (this.entries.length == 1) {
                return this.entries[0].getNameToken();
            }
            if (this.entries.length == 2) {
                return this.entries[1].getNameToken();
            }
            if (this.entries.isEmpty()) {
                return null;
            }
            return null;
        };
        PathExpressionImpl.prototype.getDataSourceColumn = function() {
            if (this.dataSourceColumn == PathExpressionImpl.undefDataSourceColumn) {
                if ((this.dataSourceAssociation != PathExpressionImpl.undefDataSourceAssociation) && (this.dataSourceAssociation != null)) {
                    this.setDataSourceColumn(null);
                }else{
                    var target=this.getTarget();
                    if (target instanceof DataSourceImpl) {
                        var columns=(target).getCachedColumns();
                        if (columns == null) {
                            var select=this.getViewSelect(this);
                            if (select != null) {
                                select.setUncertainColumnUsage(true);
                            }
                            return null;
                        }else{
                            this.setDataSourceColumn(null);
                            var entries=this.getEntries();
                            if (this.entries.length >= 0) {
                                var lastEntry=this.entries[this.entries.length - 1];
                                var name=lastEntry.getNameToken().getM_lexem().toUpperCase();
                                for (var colnCount=0;colnCount<columns.length;colnCount++) {
                                    var coln=columns[colnCount];
                                    if (name===coln.getName().toUpperCase()) {
                                        this.setDataSourceColumn(coln);
                                        break;
                                    }
                                }
                            }
                        }
                    }else if (this.target == null) {
                        this.setDataSourceColumn(null);
                    }
                }
            }
            return this.dataSourceColumn;
        };
        PathExpressionImpl.prototype.setDataSourceColumn = function(newDataSourceColumn) {
            var oldDataSourceColumn=this.dataSourceColumn;
            if (oldDataSourceColumn != null && oldDataSourceColumn != PathExpressionImpl.undefDataSourceColumn) {
                Utils.arrayRemove(oldDataSourceColumn.getExpressions(), this);
            }
            this.dataSourceColumn=newDataSourceColumn;
            if (this.dataSourceColumn != null && this.dataSourceColumn != PathExpressionImpl.undefDataSourceColumn) {
                this.dataSourceColumn.getExpressions().push(this);
            }
        };
        PathExpressionImpl.prototype.getDataSourceAssociation = function() {
            if (this.dataSourceAssociation == PathExpressionImpl.undefDataSourceAssociation) {
                if ((this.dataSourceColumn != PathExpressionImpl.undefDataSourceColumn) && (this.dataSourceColumn != null)) {
                    this.setDataSourceAssociation(null);
                }else{
                    var target=this.getTarget();
                    if (target instanceof DataSourceImpl) {
                        var assocs=(target).getCachedAssociations();
                        if (assocs == null) {
                            var select=this.getViewSelect(this);
                            if (select != null) {
                                select.setUncertainColumnUsage(true);
                            }
                            return null;
                        }else{
                            this.setDataSourceAssociation(null);
                            var entries=this.getEntries();
                            if (this.entries.length >= 0) {
                                var lastEntry=this.entries[this.entries.length - 1];
                                var name=lastEntry.getNameToken().getM_lexem().toUpperCase();
                                for (var asscCount=0;asscCount<assocs.length;asscCount++) {
                                    var assc=assocs[asscCount];
                                    if (name===assc.getName().toUpperCase()) {
                                        this.setDataSourceAssociation(assc);
                                        break;
                                    }
                                }
                            }
                        }
                    }else if (this.target == null) {
                        this.setDataSourceAssociation(null);
                    }
                }
            }
            return this.dataSourceAssociation;
        };
        PathExpressionImpl.prototype.setDataSourceAssociation = function(newDataSourceAssociation) {
            var oldDataSourceAssociation=this.dataSourceAssociation;
            if (oldDataSourceAssociation != null && oldDataSourceAssociation != PathExpressionImpl.undefDataSourceAssociation) {
                Utils.arrayRemove(oldDataSourceAssociation.getExpressions(), this);
            }
            this.dataSourceAssociation=newDataSourceAssociation;
            if (this.dataSourceAssociation != null && this.dataSourceAssociation != PathExpressionImpl.undefDataSourceAssociation) {
                this.dataSourceAssociation.getExpressions().push(this);
            }
        };
        PathExpressionImpl.prototype.eInverseRemove = function(otherEnd,featureID,msgs) {
            switch (featureID) {
                case IAstPackage.PATH_EXPRESSION__ENTRIES:
                    return (this.getEntries()).basicRemove(otherEnd,msgs);
            }

        };
        PathExpressionImpl.prototype.eGet = function(featureID,resolve,coreType) {
            switch (featureID) {
                case IAstPackage.PATH_EXPRESSION__ENTRIES:
                    return this.getEntries();
                case IAstPackage.PATH_EXPRESSION__LAST_NAMESPACE_COMPONENT_INDEX:
                    return this.getLastNamespaceComponentIndex();
                case IAstPackage.PATH_EXPRESSION__TARGET:
                    if (resolve) {
                        return this.getTarget();
                    }
                    return this.basicGetTarget();
                case IAstPackage.PATH_EXPRESSION__TABLE_NAME:
                    return this.getTableName();
                case IAstPackage.PATH_EXPRESSION__IDENTIFIER:
                    return this.getIdentifier();
                case IAstPackage.PATH_EXPRESSION__TABLE_NAME_TOKEN:
                    return this.getTableNameToken();
                case IAstPackage.PATH_EXPRESSION__IDENTIFIER_TOKEN:
                    return this.getIdentifierToken();
                case IAstPackage.PATH_EXPRESSION__DATA_SOURCE_COLUMN:
                    return this.getDataSourceColumn();
                case IAstPackage.PATH_EXPRESSION__DATA_SOURCE_ASSOCIATION:
                    return this.getDataSourceAssociation();
            }
            return ExpressionImpl.prototype.eGet.call(this,featureID,resolve,coreType);
        };
        PathExpressionImpl.prototype.eSet = function(featureID,newValue) {

        };
        PathExpressionImpl.prototype.eUnset = function(featureID) {

        };
        PathExpressionImpl.prototype.eIsSet = function(featureID) {
            switch (featureID) {
                case IAstPackage.PATH_EXPRESSION__ENTRIES:
                    return this.entries != null && !this.entries.isEmpty();
                case IAstPackage.PATH_EXPRESSION__LAST_NAMESPACE_COMPONENT_INDEX:
                    return PathExpressionImpl.LAST_NAMESPACE_COMPONENT_INDEX_EDEFAULT == null ? this.lastNamespaceComponentIndex != null : !LAST_NAMESPACE_COMPONENT_INDEX_EDEFAULT.equals(this.lastNamespaceComponentIndex);
                case IAstPackage.PATH_EXPRESSION__TARGET:
                    return this.target != null;
                case IAstPackage.PATH_EXPRESSION__TABLE_NAME:
                    return PathExpressionImpl.TABLE_NAME_EDEFAULT == null ? this.getTableName() != null : !TABLE_NAME_EDEFAULT===this.getTableName();
                case IAstPackage.PATH_EXPRESSION__IDENTIFIER:
                    return PathExpressionImpl.IDENTIFIER_EDEFAULT == null ? this.getIdentifier() != null : !IDENTIFIER_EDEFAULT===this.getIdentifier();
                case IAstPackage.PATH_EXPRESSION__TABLE_NAME_TOKEN:
                    return PathExpressionImpl.TABLE_NAME_TOKEN_EDEFAULT == null ? this.getTableNameToken() != null : !TABLE_NAME_TOKEN_EDEFAULT.equals(this.getTableNameToken());
                case IAstPackage.PATH_EXPRESSION__IDENTIFIER_TOKEN:
                    return PathExpressionImpl.IDENTIFIER_TOKEN_EDEFAULT == null ? this.getIdentifierToken() != null : !IDENTIFIER_TOKEN_EDEFAULT.equals(this.getIdentifierToken());
                case IAstPackage.PATH_EXPRESSION__DATA_SOURCE_COLUMN:
                    return this.dataSourceColumn != PathExpressionImpl.undefDataSourceColumn;
                case IAstPackage.PATH_EXPRESSION__DATA_SOURCE_ASSOCIATION:
                    return this.dataSourceAssociation != PathExpressionImpl.undefDataSourceAssociation;
            }
            return ExpressionImpl.prototype.eIsSet.call(this,featureID);
        };
        PathExpressionImpl.prototype.eBaseStructuralFeatureID = function(derivedFeatureID,baseClass) {
            if (baseClass == IPathDeclaration.class) {
                switch (derivedFeatureID) {
                    case IAstPackage.PATH_EXPRESSION__ENTRIES:
                        return IAstPackage.PATH_DECLARATION__ENTRIES;
                    case IAstPackage.PATH_EXPRESSION__LAST_NAMESPACE_COMPONENT_INDEX:
                        return IAstPackage.PATH_DECLARATION__LAST_NAMESPACE_COMPONENT_INDEX;
                    default :
                        return -1;
                }
            }
            return ExpressionImpl.prototype.eBaseStructuralFeatureID.call(this,derivedFeatureID,baseClass);
        };
        PathExpressionImpl.prototype.eDerivedStructuralFeatureID = function(baseFeatureID,baseClass) {
            if (baseClass == IPathDeclaration.class) {
                switch (baseFeatureID) {
                    case IAstPackage.PATH_DECLARATION__ENTRIES:
                        return IAstPackage.PATH_EXPRESSION__ENTRIES;
                    case IAstPackage.PATH_DECLARATION__LAST_NAMESPACE_COMPONENT_INDEX:
                        return IAstPackage.PATH_EXPRESSION__LAST_NAMESPACE_COMPONENT_INDEX;
                    default :
                        return -1;
                }
            }
            return ExpressionImpl.prototype.eDerivedStructuralFeatureID.call(this,baseFeatureID,baseClass);
        };
        PathExpressionImpl.prototype.toString = function() {
            return this.getPathString(true);
        };
        PathExpressionImpl.prototype.getPathString = function(withFilters) {
            var result=new rnd.StringBuffer();
            var entries=this.getEntries();
            for (var i=0;i < this.entries.length;i++) {
                var entry=this.entries[i];
                if (i > 0) {
                    result.append(".");
                }
                var t=entry.getNameToken();
                if (t != null) {
                    result.append(t.m_lexem);
                }
                var filter=entry.getFilter();
                if (withFilters && filter != null) {
                    result.append("[");
                    result.append(filter.getShortDescription());
                    result.append("]");
                }
            }
            return result.toString();
        };
        return PathExpressionImpl;
    }
);
define(
    'commonddl/AbstractDdlCodeCompletionProposal',[], //dependencies
    function () {
        AbstractDdlCodeCompletionProposal.prototype = Object.create(null);
        AbstractDdlCodeCompletionProposal.prototype.name="";
        AbstractDdlCodeCompletionProposal.prototype.type=null;
        function AbstractDdlCodeCompletionProposal(name,type) {
            this.name=name;
            this.type=type;
        }
        AbstractDdlCodeCompletionProposal.prototype.getName = function() {
            return this.name;
        };
        AbstractDdlCodeCompletionProposal.prototype.setName = function(name) {
            this.name=name;
        };
        AbstractDdlCodeCompletionProposal.prototype.getType = function() {
            return this.type;
        };
        AbstractDdlCodeCompletionProposal.prototype.setType = function(type) {
            this.type=type;
        };
        AbstractDdlCodeCompletionProposal.prototype.hashCode = function() {
            var prime=31;
            var result=1;
            result=prime * result + ((this.name == null) ? 0 : this.name.hashCode());
            result=prime * result + ((this.type == null) ? 0 : this.type.hashCode());
            return result;
        };
        AbstractDdlCodeCompletionProposal.prototype.equals = function(obj) {
            if (this == obj) {
                return true;
            }
            if (obj == null) {
                return false;
            }
//            if (this.getClass() != obj.getClass()) {
//                return false;
//            }
            var other=obj;
            if (this.name == null) {
                if (other.name != null) {
                    return false;
                }
            }else if (!(this.name===other.name)) {
                return false;
            }
            if (this.type != other.type) {
                return false;
            }
            return true;
        };
    return AbstractDdlCodeCompletionProposal;

    }
);
define(
    'commonddl/DdlCodeCompletionType',[], //dependencies
    function () {
        DdlCodeCompletionType.INSERT_ALL_ELEMENTS = new DdlCodeCompletionType(200,"INSERT_ALL_ELEMENTS");
        DdlCodeCompletionType.PARAMETER = new DdlCodeCompletionType(300,"PARAMETER");
        DdlCodeCompletionType.DATASOURCE = new DdlCodeCompletionType(300,"DATASOURCE");
        DdlCodeCompletionType.ASSOCIATION = new DdlCodeCompletionType(300, "ASSOCIATION");
        DdlCodeCompletionType.COLUMN = new DdlCodeCompletionType(300, "COLUMN");
        DdlCodeCompletionType.DATA_TYPE = new DdlCodeCompletionType(300, "DATA_TYPE");
        DdlCodeCompletionType.DATA_ELEMENT = new DdlCodeCompletionType(330, "DATA_ELEMENT");
        DdlCodeCompletionType.ANNOTATION = new DdlCodeCompletionType(400, "ANNOTATION");
        DdlCodeCompletionType.KEYWORD = new DdlCodeCompletionType(500, "KEYWORD");
        DdlCodeCompletionType.prototype.value = 0;


        function DdlCodeCompletionType(sortValue,nam) {
            this.value = sortValue;
            this.name = nam;
        }

        DdlCodeCompletionType.toInt=function(type) {
            return type.value;
        };
        return DdlCodeCompletionType;
    }
);
define(
    'commonddl/DdlKeywordCodeCompletionProposal',["commonddl/DdlCodeCompletionType","commonddl/AbstractDdlCodeCompletionProposal"], //dependencies
    function (DdlCodeCompletionType,AbstractDdlCodeCompletionProposal) {

        DdlKeywordCodeCompletionProposal.prototype = Object.create(AbstractDdlCodeCompletionProposal.prototype);
        function DdlKeywordCodeCompletionProposal(name) {
            AbstractDdlCodeCompletionProposal.call(this,name,DdlCodeCompletionType.KEYWORD);
        }

        return DdlKeywordCodeCompletionProposal;
    }
);
define(
    'commonddl/SapDdlConstants',[], //dependencies
    function () {

        function SapDdlConstants() {
        };
        SapDdlConstants.ANY_KW = "#ANYKW#";
        SapDdlConstants.EOF = "#EOF#";
        SapDdlConstants.NL = "#NL#";
        SapDdlConstants.COMMENT1 = "#COMMENT1#";
        SapDdlConstants.COMMENT2 = "#COMMENT2#";
        SapDdlConstants.DOT = ".";
        SapDdlConstants.COMMA = ",";
        SapDdlConstants.COLON = ":";
        SapDdlConstants.COLON_FOLLOWED_BY_ID = "#COLON_FOLLOWED_BY_ID#";
        SapDdlConstants.PIPE_PIPE = "#PIPE_PIPE#";
        SapDdlConstants.LPAREN = "(";
        SapDdlConstants.RPAREN = ")";
        SapDdlConstants.LT = "<";
        SapDdlConstants.GT = ">";
        SapDdlConstants.LBRACK = "[";
        SapDdlConstants.RBRACK = "]";
        SapDdlConstants.LBRACE = "{";
        SapDdlConstants.RBRACE = "}";
        SapDdlConstants.STRING_CONST = "#STR_CONST#";
        SapDdlConstants.BINARY_CONST = "#BINARY_CONST#";
        SapDdlConstants.INT_CONST = "#INT_CONST#";
        SapDdlConstants.LONG_INT_CONST = "#LINT_CONST#";
        SapDdlConstants.DEC_CONST = "#DEC_CONST#";
        SapDdlConstants.REAL_CONST = "#REAL_CONST#";
        SapDdlConstants.DATE_CONST = "#DATE_CONST#";
        SapDdlConstants.TIME_CONST = "#TIME_CONST#";
        SapDdlConstants.TIMESTAMP_CONST = "#TIMESTAMP_CONST#";
        SapDdlConstants.AT = "@";
        SapDdlConstants.PIPE = "|";
        SapDdlConstants.STAR = "*";
        SapDdlConstants.PLUS = "+";
        SapDdlConstants.GE = ">=";
        SapDdlConstants.DASH_ARROW = "=>";
        SapDdlConstants.NE = "<>";
        SapDdlConstants.COLONCOLON = "::";
        SapDdlConstants.ID = "#ID#";
        SapDdlConstants.ENUM_ID = "#ENUM_ID#";
        SapDdlConstants.NUM_ANYKW = 0;
        SapDdlConstants.NUM_ANYLIT = 1;
        SapDdlConstants.NUM_EOF = 2;
        SapDdlConstants.NUM_NL = 3;
        SapDdlConstants.NUM_COMMENT1 = 4;
        SapDdlConstants.NUM_COMMENT2 = 5;
        SapDdlConstants.NUM_DOT = 6;
        SapDdlConstants.NUM_COMMA = 7;
        SapDdlConstants.NUM_COLON = 8;
        SapDdlConstants.NUM_DUMMY = 9;
        SapDdlConstants.NUM_LPAREN = 10;
        SapDdlConstants.NUM_RPAREN = 11;
        SapDdlConstants.NUM_PARAM_LPAREN = 12;
        SapDdlConstants.NUM_PARAM_RPAREN = 13;
        SapDdlConstants.NUM_LT = 14;
        SapDdlConstants.NUM_GT = 15;
        SapDdlConstants.NUM_LBRACK = 16;
        SapDdlConstants.NUM_RBRACK = 17;
        SapDdlConstants.NUM_LBRACE = 18;
        SapDdlConstants.NUM_RBRACE = 19;
        SapDdlConstants.NUM_STR_CONST = 20;
        SapDdlConstants.NUM_INT_CONST = 21;
        SapDdlConstants.NUM_LINT_CONST = 22;
        SapDdlConstants.NUM_DEC_CONST = 23;
        SapDdlConstants.NUM_REAL_CONST = 24;
        SapDdlConstants.NUM_DATE_CONST = 25;
        SapDdlConstants.NUM_TIME_CONST = 26;
        SapDdlConstants.NUM_TIMESTAMP_CONST = 27;
        SapDdlConstants.NUM_ACTION = 28;
        SapDdlConstants.NUM_ACTIONI = 29;
        SapDdlConstants.NUM_HASH = 30;
        SapDdlConstants.NUM_AT = 31;
        SapDdlConstants.NUM_PIPE = 32;
        SapDdlConstants.NUM_STAR = 33;
        SapDdlConstants.NUM_QUESTION = 34;
        SapDdlConstants.NUM_PLUS = 35;
        SapDdlConstants.NUM_BANG = 36;
        SapDdlConstants.NUM_DOLLAR = 37;
        SapDdlConstants.NUM_GE = 38;
        SapDdlConstants.NUM_NE = 39;
        SapDdlConstants.NUM_COLONCOLON = 40;
        SapDdlConstants.NUM_BINARY_CONST = 41;
        SapDdlConstants.NUM_ERROR = 42;
        SapDdlConstants.NUM_SYS = 43;
        SapDdlConstants.NUM_ID = 44;

        return SapDdlConstants;
    }
);
define(
    'commonddl/AbstractDdlParser',[
        "commonddl/AbstractDdlCodeCompletionProposal",
        "commonddl/DdlCodeCompletionType",
        "commonddl/DdlKeywordCodeCompletionProposal",
        "commonddl/TokenUtil",
        "commonddl/astmodel/BooleanType",
        "commonddl/astmodel/AbstractAnnotationImpl",
        "commonddl/astmodel/AbstractAnnotationValueImpl",
        "commonddl/astmodel/AnnotatedImpl",
        "commonddl/astmodel/AnnotationArrayValueImpl",
        "commonddl/astmodel/AnnotationDeclarationImpl",
        "commonddl/astmodel/AnnotationNameValuePairImpl",
        "commonddl/astmodel/AnnotationRecordValueImpl",
        "commonddl/astmodel/AnnotationValueImpl",
        "commonddl/astmodel/AnonymousTypeDeclarationImpl",
        "commonddl/astmodel/ArithmeticExpressionImpl",
        "commonddl/astmodel/AssociationDeclarationImpl",
        "commonddl/astmodel/IAstFactory",
        "commonddl/astmodel/AttributeDeclarationImpl",
        "commonddl/astmodel/BetweenExpressionImpl",
        "commonddl/astmodel/BooleanExpressionImpl",
        "commonddl/astmodel/CaseExpressionImpl",
        "commonddl/astmodel/CaseWhenExpressionImpl",
        "commonddl/astmodel/CastExpressionImpl",
        "commonddl/astmodel/CompExpressionImpl",
        "commonddl/astmodel/CompilationUnitImpl",
        "commonddl/astmodel/ConcatenationExpressionImpl",
        "commonddl/astmodel/ConstDeclarationImpl",
        "commonddl/astmodel/DataSourceImpl",
        "commonddl/astmodel/DdlStatementImpl",
        "commonddl/astmodel/ElementDeclarationImpl",
        "commonddl/astmodel/EntityDeclarationImpl",
        "commonddl/astmodel/EnumerationDeclarationImpl",
        "commonddl/astmodel/EnumerationValueImpl",
        "commonddl/astmodel/ExpressionImpl",
        "commonddl/astmodel/ExpressionContainerImpl",
        "commonddl/astmodel/ForeignKeyImpl",
        "commonddl/astmodel/FuncExpressionImpl",
        "commonddl/astmodel/FuncParamImpl",
        "commonddl/astmodel/FuncWithNamedParamExpressionImpl",
        "commonddl/astmodel/GroupByImpl",
        "commonddl/astmodel/GroupByEntryImpl",
        "commonddl/astmodel/InExpressionImpl",
        "commonddl/astmodel/JoinDataSourceImpl",
        "commonddl/astmodel/LikeExpressionImpl",
        "commonddl/astmodel/LiteralExpressionImpl",
        "commonddl/astmodel/NamesImpl",
        "commonddl/astmodel/NotExpressionImpl",
        "commonddl/astmodel/NullExpressionImpl",
        "commonddl/astmodel/OrderByImpl",
        "commonddl/astmodel/OrderByEntryImpl",
        "commonddl/astmodel/ParameterImpl",
        "commonddl/astmodel/PathDeclarationImpl",
        "commonddl/astmodel/PathEntryImpl",
        "commonddl/astmodel/PathExpressionImpl",
        "commonddl/astmodel/PostAnnotationImpl",
        "commonddl/astmodel/PreAnnotationImpl",
        "commonddl/astmodel/SearchedCaseExpressionImpl",
        "commonddl/astmodel/SelectListImpl",
        "commonddl/astmodel/SelectListEntryImpl",
        "commonddl/astmodel/SelectListEntryExtensionImpl",
        "commonddl/astmodel/SimpleCaseExpressionImpl",
        "commonddl/astmodel/SourceRangeImpl",
        "commonddl/astmodel/StdFuncExpressionImpl",
        "commonddl/astmodel/UsingDirectiveImpl",
        "commonddl/astmodel/ViewDefinitionImpl",
        "commonddl/astmodel/ViewExtendImpl",
        "commonddl/astmodel/ViewSelectImpl",
        "commonddl/astmodel/JoinEnum",
        "rndrt/rnd",
        "commonddl/SapDdlConstants"
    ], //dependencies
    function (AbstractDdlCodeCompletionProposal, DdlCodeCompletionType, DdlKeywordCodeCompletionProposal, TokenUtil, BooleanType, AbstractAnnotationImpl, AbstractAnnotationValueImpl, AnnotatedImpl, AnnotationArrayValueImpl, AnnotationDeclarationImpl, AnnotationNameValuePairImpl, AnnotationRecordValueImpl, AnnotationValueImpl, AnonymousTypeDeclarationImpl, ArithmeticExpressionImpl, AssociationDeclarationImpl, IAstFactory, AttributeDeclarationImpl, BetweenExpressionImpl, BooleanExpressionImpl, CaseExpressionImpl, CaseWhenExpressionImpl, CastExpressionImpl, CompExpressionImpl, CompilationUnitImpl, ConcatenationExpressionImpl, ConstDeclarationImpl, DataSourceImpl, DdlStatementImpl, ElementDeclarationImpl, EntityDeclarationImpl, EnumerationDeclarationImpl, EnumerationValueImpl, ExpressionImpl, ExpressionContainerImpl, ForeignKeyImpl, FuncExpressionImpl, FuncParamImpl, FuncWithNamedParamExpressionImpl, GroupByImpl, GroupByEntryImpl, InExpressionImpl, JoinDataSourceImpl, LikeExpressionImpl, LiteralExpressionImpl, NamesImpl, NotExpressionImpl, NullExpressionImpl, OrderByImpl, OrderByEntryImpl, ParameterImpl, PathDeclarationImpl, PathEntryImpl, PathExpressionImpl, PostAnnotationImpl, PreAnnotationImpl, SearchedCaseExpressionImpl, SelectListImpl, SelectListEntryImpl, SelectListEntryExtensionImpl, SimpleCaseExpressionImpl, SourceRangeImpl, StdFuncExpressionImpl, UsingDirectiveImpl, ViewDefinitionImpl, ViewExtendImpl, ViewSelectImpl, JoinEnum, rnd, SapDdlConstants) {
        var Category = rnd.Category;
        var CursorPos = rnd.CursorPos;
        var Token = rnd.Token;
        var Parser = rnd.Parser;
        var TokenCoCoCompletion = rnd.TokenCoCoCompletion;
        var TokenCoCoParser = rnd.TokenCoCoParser;
        var CompletionModes = rnd.CompletionModes;
        var Utils = rnd.Utils;
        var StringBuffer = rnd.StringBuffer;
        var Parser = rnd.Parser;
        AbstractDdlParser.prototype = Object.create(TokenCoCoParser.prototype);
        AbstractDdlParser.PRE_ANNOTATION_RULE = "PreAnnotation";
        AbstractDdlParser.RECORD_COMPONENT_RULE = "RecordComponent";
        AbstractDdlParser.prototype.repositoryAccess = null;
        AbstractDdlParser.prototype.semanticCompletions = [];
        AbstractDdlParser.prototype.semanticCodeCompletionProposals = [];
        AbstractDdlParser.INCOMPLETE_SIGNAL = "$$incomplete_result$$";
        function AbstractDdlParser(byte_code, scanner, repositoryAccess) {
            TokenCoCoParser.call(this, byte_code, scanner);
            this.setComplMaxKeywords(5);
            this.repositoryAccess = repositoryAccess;
        }

        AbstractDdlParser.prototype.run = function (completion_mode, halted, HALTED_INTERVAL) {
            this.semanticCompletions = [];
            this.semanticCodeCompletionProposals = [];
            this.unionStack = [];
            this.allDataSources = [];
            this.allAssociationDeclarations = [];
            this.allEntityDeclarations = [];
            this.lastFoundDataSources = [];
            return TokenCoCoParser.prototype.run.call(this, completion_mode, halted, HALTED_INTERVAL);
        };
        AbstractDdlParser.prototype.clearPathCompletions = function () {
            try {
                var f = Parser.class.getDeclaredField("m_completionPaths");
                f.setAccessible(true);
                var q = f.get(this);
                q.clear();
            }
            catch (e) {
                Activator.log(e);
            }
        };
        AbstractDdlParser.prototype.isEmptyIncompleteToken = function (token) {
            if (token != null && Category.CAT_INCOMPLETE === token.m_category) {
                if ("" === token.m_lexem) {
                    return true;
                }
            }
            return false;
        };
        AbstractDdlParser.prototype.isKeyword = function (t) {
            if (t != null && (Category.CAT_KEYWORD === t.m_category || Category.CAT_STRICT_KEYWORD === t.m_category || Category.CAT_MAYBE_KEYWORD === t.m_category)) {
                return true;
            }
            return false;
        };
        AbstractDdlParser.prototype.isIdentifier = function (t) {
            if (Category.CAT_IDENTIFIER === t.m_category) {
                return true;
            }
            return false;
        };
        AbstractDdlParser.prototype.getRuleNameHierarchy = function (stackframe) {
            var result = new StringBuffer();
            while (true) {
                var rn = stackframe.getRuleInfo().getRuleName();
                result.append(rn).append("#");
                stackframe = stackframe.getParent();
                if (stackframe == null) {
                    return result;
                }
            }
        };
        AbstractDdlParser.prototype.isOneOfTheRuleNamesListEntryInHierarchy = function (stackframe, ruleNames) {
            while (true) {
                var rn = stackframe.getRuleInfo().getRuleName();
                for (var ruleNameCount = 0; ruleNameCount < ruleNames.length; ruleNameCount++) {
                    var ruleName = ruleNames[ruleNameCount];
                    if (ruleName === rn) {
                        return true;
                    }
                }
                stackframe = stackframe.getParent();
                if (stackframe == null) {
                    return false;
                }
            }
        };
        AbstractDdlParser.prototype.isOneOfTheRuleNamesInHierarchy = function (stopAtFirstRuleName, stackframe, ruleNames) {
            while (true) {
                var rn = stackframe.getRuleInfo().getRuleName();
                if (stopAtFirstRuleName === rn) {
                    return false;
                }
                for (var ruleNameCount = 0; ruleNameCount < ruleNames.length; ruleNameCount++) {
                    var ruleName = ruleNames[ruleNameCount];
                    if (ruleName === rn) {
                        return true;
                    }
                }
                stackframe = stackframe.getParent();
                if (stackframe == null) {
                    return false;
                }
            }
        };
        AbstractDdlParser.prototype.sortKeywordCompletions = function (result) {
            result.sort(function (o1, o2) {
                if (o1 == null || o2 == null) {
                    return 0;
                }
                return rnd.Utils.stringCompareTo(o1.toLowerCase(), o2.toLowerCase());
            });
        };
        AbstractDdlParser.prototype.getTypedCompletionNames = function (resolver) {
            var result = [];
            var keywordCompletions = this.getKeywordCompletions(resolver);
            this.sortKeywordCompletions(keywordCompletions);
            for (var keywordCompletionCount = 0; keywordCompletionCount < keywordCompletions.length; keywordCompletionCount++) {
                var keywordCompletion = keywordCompletions[keywordCompletionCount];
                var comp = new com.sap.cds.ddl.parser.IDdlParser.DdlCompletion(keywordCompletion, null, null, com.sap.cds.ddl.parser.IDdlParser.DdlCompletionType.KEYWORD, false);
                result.push(comp);
            }
            this.semanticCompletions = this.sortSemanticCompletionResults(this.semanticCompletions);
            result = Utils.insertArrayAt(result, 0, this.semanticCompletions);
            return result;
        };
        AbstractDdlParser.prototype.getTypedCodeCompletionNames = function (resolver) {
            var result = [];
            var keywordCompletions = this.getKeywordCompletions(resolver);
            for (var keywordCompletionCount = 0; keywordCompletionCount < keywordCompletions.length; keywordCompletionCount++) {
                var keywordCompletion = keywordCompletions[keywordCompletionCount];
                var comp = new DdlKeywordCodeCompletionProposal(keywordCompletion);
                result.push(comp);
            }
            result = Utils.insertArrayAt(result, 0, this.semanticCodeCompletionProposals);
            result = this.sortCodeCompletionResults(result);
            return result;
        };
        AbstractDdlParser.prototype.getKeywordCompletions = function (resolver) {
            var result = [];
            var completionPaths = resolver.getCompletionPaths();
            for (var completionCount = 0; completionCount < completionPaths.length; completionCount++) {
                var completion = completionPaths[completionCount];
                var np = "";
                var tokens = [];
                if (completion.getCompletion() != null) {
                    tokens = (completion.getCompletion()).m_next_tokens;
                }
                for (var tCount = 0; tCount < tokens.length; tCount++) {
                    var t = tokens[tCount];
                    var info = resolver.getByteCodeTokenInfo();
                    var name = info.getTokenNameUS(t);
                    if (name != null && (SapDdlConstants.ID === name || SapDdlConstants.ENUM_ID === name || SapDdlConstants.COLON_FOLLOWED_BY_ID === name || SapDdlConstants.INT_CONST === name || SapDdlConstants.LONG_INT_CONST === name || SapDdlConstants.DEC_CONST === name || SapDdlConstants.REAL_CONST === name || SapDdlConstants.DATE_CONST === name || SapDdlConstants.TIME_CONST === name || SapDdlConstants.TIMESTAMP_CONST === name || SapDdlConstants.STRING_CONST === name || SapDdlConstants.BINARY_CONST === name)) {
                        break;
                    } else if ("#" === name) {
                        continue;
                    } else if ("(" === name) {
                        np += name;
                    } else {
                        np += " " + name;
                    }
                }
                np = rnd.Utils.stringTrim(np);
                if (SapDdlConstants.PIPE_PIPE === np) {
                    np = "||";
                }
                if ("$extension . *" === np) {
                    np = "$extension.*";
                }
                if ("$parameters ." === np || "$parameters" === np) {
                    np = "$parameters.";
                }
                if (np.length == 0) {
                    continue;
                }
                if (rnd.Utils.arrayContains(result, np) == false) {
                    result.push(np);
                }
            }
            return result;
        };
        AbstractDdlParser.prototype.sortSemanticCompletionResults = function (semanticCompletions) {
            semanticCompletions.sort(function (o1, o2) {
                if (o1 == null || o2 == null) {
                    return 0;
                }
                if (AbstractDdlParser.INCOMPLETE_SIGNAL === o1.name && AbstractDdlParser.INCOMPLETE_SIGNAL === o2.name) {
                    return 0;
                }
                if (AbstractDdlParser.INCOMPLETE_SIGNAL === o1.name) {
                    return 1;
                }
                if (AbstractDdlParser.INCOMPLETE_SIGNAL === o2.name) {
                    return -1;
                }
                if (o1.type === DdlCompletionType.ANNOTATION && !o2.type === DdlCompletionType.ANNOTATION) {
                    return 1;
                }
                if (o2.type === DdlCompletionType.ANNOTATION && !o1.type === DdlCompletionType.ANNOTATION) {
                    return -1;
                }
                return rnd.Utils.stringCompareTo(o1.name.toLowerCase(), o2.name.toLowerCase());
            });
            return semanticCompletions;
        };
        AbstractDdlParser.prototype.sortCodeCompletionResults = function (result) {
            result.sort(function (o1, o2) {
                if (o1 == null || o2 == null) {
                    return 0;
                }
                if (AbstractDdlParser.INCOMPLETE_SIGNAL === o1.getName() && AbstractDdlParser.INCOMPLETE_SIGNAL === o2.getName()) {
                    return 0;
                }
                if (AbstractDdlParser.INCOMPLETE_SIGNAL === o1.getName()) {
                    return 1;
                }
                if (AbstractDdlParser.INCOMPLETE_SIGNAL === o2.getName()) {
                    return -1;
                }
                if (o1.getType() == null || o2.getType() == null) {
                    return 0;
                }
                var diff = o1.getType().value - o2.getType().value;
                if (diff != 0) {
                    return diff;
                }
                if (o1.getName() == null || o2.getName() == null) {
                    return 0;
                }
                var o1n = o1.getName().toLowerCase();
                var o2n = o2.getName().toLowerCase();
                if (o1n == "::" && o2n == ".") return 1;
                if (o1n == ":" && o2n == ".") return 1;
                if (o1n == "@") return -1;
                if (o2n == "@") return 1;
                if (o2n[0] == "}") return -1;
                if (o1n[0] == "}" && rnd.Utils.isLetter(o2n[0])) return 1;
                return rnd.Utils.stringCompareTo(o1n, o2n);
            });
            return result;
        };
        AbstractDdlParser.prototype.sortSemanticCodeCompletionResults = function (semanticCompletions) {
            semanticCompletions.sort(function (o1, o2) {
                if (o1 == null || o2 == null) {
                    return 0;
                }
                if (AbstractDdlParser.INCOMPLETE_SIGNAL === o1.getName() && AbstractDdlParser.INCOMPLETE_SIGNAL === o2.getName()) {
                    return 0;
                }
                if (AbstractDdlParser.INCOMPLETE_SIGNAL === o1.getName()) {
                    return 1;
                }
                if (AbstractDdlParser.INCOMPLETE_SIGNAL === o2.getName()) {
                    return -1;
                }
                if (DdlCodeCompletionType.ANNOTATION === o1.getType() && !DdlCodeCompletionType.ANNOTATION === o2.getType()) {
                    return 1;
                }
                if (DdlCodeCompletionType.ANNOTATION === o2.getType() && !DdlCodeCompletionType.ANNOTATION === o1.getType()) {
                    return -1;
                }
                if (o1.getName() == null || o2.getName() == null) {
                    return 0;
                }
                return rnd.Utils.stringCompareTo(o1.getName().toLowerCase(), o2.getName().toLowerCase());
            });
            return semanticCompletions;
        };
        AbstractDdlParser.prototype.getCompletionNames = function (resolver) {
            var names = this.getTypedCompletionNames(resolver);
            var result = [];
            for (var nameCount = 0; nameCount < names.length; nameCount++) {
                var name = names[nameCount];
                result.push(name.name);
            }
            return result;
        };
        AbstractDdlParser.prototype.getCodeCompletionNames = function (resolver) {
            var names = this.getTypedCodeCompletionNames(resolver);
            var result = [];
            for (var nameCount = 0; nameCount < names.length; nameCount++) {
                var name = names[nameCount];
                result.push(name.getName());
            }
            return result;
        };
        AbstractDdlParser.prototype.currentSelect = null;
        AbstractDdlParser.prototype.lastFoundDataSources = [];
        AbstractDdlParser.prototype.visitor = null;
        AbstractDdlParser.prototype.allDataSources = [];
        AbstractDdlParser.prototype.allAssociationDeclarations = [];
        AbstractDdlParser.prototype.allEntityDeclarations = [];
        AbstractDdlParser.prototype.unionStack = [];
        AbstractDdlParser.prototype.compilationUnit = null;
        AbstractDdlParser.prototype.cocoCompilationUnit = null;
        AbstractDdlParser.prototype.cocoTriggerPos = null;
        AbstractDdlParser.prototype.supportedAnnotations = null;
        AbstractDdlParser.prototype.currentIncompleteSelectListEntry = null;
        AbstractDdlParser.prototype.padFileResolverUsedToGetByteCode = null;
        AbstractDdlParser.prototype.ddlParser = null;
        AbstractDdlParser.prototype.viewparser_createConcatenationExpression = function (left, right, operator) {
            var expr = IAstFactory.eINSTANCE.createConcatenationExpression();
            expr.setLeft(left);
            expr.setRight(right);
            expr.setOperator(operator);
            return expr;
        };
        AbstractDdlParser.prototype.viewparser_startDefineView = function () {
            this.lastFoundDataSources = [];
            var def = IAstFactory.eINSTANCE.createViewDefinition();
            this.allEntityDeclarations.push(def);
            return def;
        };
        AbstractDdlParser.prototype.getString = function (t) {
            return t.m_lexem;
        };
        AbstractDdlParser.prototype.viewparser_viewName = function (vd, name) {
            vd.setNameToken(name);
        };
        AbstractDdlParser.prototype.viewparser_tableDatasource = function (pe) {
            var ds = IAstFactory.eINSTANCE.createDataSource();
            ds.setNamePathExpression(pe);
            this.allDataSources.push(pe);
            if (this.visitor != null && this.visitor.visitSimpleDataSource) {
                this.visitor.visitSimpleDataSource(ds);
            }
            return ds;
        };
        AbstractDdlParser.prototype.viewparser_datasourcealias = function (ds, alias) {
            ds.setAliasToken(alias);
            if (this.visitor != null) {
                this.visitor.visitSimpleDataSource(ds);
            }
        };
        AbstractDdlParser.prototype.viewparser_leftjoinDatasource = function (left, right, onexpr) {
            var join = IAstFactory.eINSTANCE.createJoinDataSource();
            join.setLeft(left);
            join.setRight(right);
            join.setOn(onexpr);
            join.setJoinEnum(JoinEnum.LEFT);
            return join;
        };
        AbstractDdlParser.prototype.viewparser_rightjoinDatasource = function (left, right, onexpr) {
            var join = IAstFactory.eINSTANCE.createJoinDataSource();
            join.setLeft(left);
            join.setRight(right);
            join.setOn(onexpr);
            join.setJoinEnum(JoinEnum.RIGHT);
            return join;
        };
        AbstractDdlParser.prototype.viewparser_fulljoinDatasource = function (left, right, onexpr) {
            var join = IAstFactory.eINSTANCE.createJoinDataSource();
            join.setLeft(left);
            join.setRight(right);
            join.setOn(onexpr);
            join.setJoinEnum(JoinEnum.FULL);
            return join;
        };
        AbstractDdlParser.prototype.viewparser_innerjoinDatasource = function (left, right, onexpr) {
            var join = IAstFactory.eINSTANCE.createJoinDataSource();
            join.setLeft(left);
            join.setRight(right);
            join.setOn(onexpr);
            join.setJoinEnum(JoinEnum.INNER);
            return join;
        };
        AbstractDdlParser.prototype.viewparser_atomicExpression2 = function (alias, name) {
            var pe = IAstFactory.eINSTANCE.createPathExpression();
            var entry = null;
            if (alias != null) {
                entry = IAstFactory.eINSTANCE.createPathEntry();
                entry.setNameToken(alias);
                pe.getEntries().push(entry);
            }
            entry = IAstFactory.eINSTANCE.createPathEntry();
            entry.setNameToken(name);
            pe.getEntries().push(entry);
            return pe;
        };
        AbstractDdlParser.prototype.viewparser_atomicExpression1 = function (name) {
            var pe = IAstFactory.eINSTANCE.createPathExpression();
            var entry = IAstFactory.eINSTANCE.createPathEntry();
            entry.setNameToken(name);
            pe.getEntries().push(entry);
            return pe;
        };
        AbstractDdlParser.prototype.viewparser_orExpression = function (cond, cond2) {
            var ex = IAstFactory.eINSTANCE.createBooleanExpression();
            ex.addConditionExpression(cond);
            ex.addConditionExpression(cond2);
            ex.setType(BooleanType.OR);
            return ex;
        };
        AbstractDdlParser.prototype.viewparser_andExpression = function (cond, cond2) {
            var ex = IAstFactory.eINSTANCE.createBooleanExpression();
            ex.addConditionExpression(cond);
            ex.addConditionExpression(cond2);
            ex.setType(BooleanType.AND);
            return ex;
        };
        AbstractDdlParser.prototype.viewparser_notExpression = function (cond) {
            var res = IAstFactory.eINSTANCE.createNotExpression();
            res.setCond(cond);
            return res;
        };
        AbstractDdlParser.prototype.viewparser_compExpression = function (op, left, right) {
            var expr = IAstFactory.eINSTANCE.createCompExpression();
            expr.setLeft(left);
            expr.setRight(right);
            expr.setTypeToken(op);
            return expr;
        };
        AbstractDdlParser.prototype.viewparser_betweenExpression = function (left, lower, upper) {
            var expr = IAstFactory.eINSTANCE.createBetweenExpression();
            expr.setLeft(left);
            expr.setLower(lower);
            expr.setUpper(upper);
            return expr;
        };
        AbstractDdlParser.prototype.viewparser_nullExpression = function (left, isNull) {
            var nullExpr = IAstFactory.eINSTANCE.createNullExpression();
            nullExpr.setLeft(left);
            nullExpr.setNot(isNull);
            return nullExpr;
        };
        AbstractDdlParser.prototype.viewparser_inExpression = function (left, ins) {
            var inEx = IAstFactory.eINSTANCE.createInExpression();
            inEx.setLeft(left);
            inEx.getIns().addAll(ins);
            return inEx;
        };
        AbstractDdlParser.prototype.viewparser_likeExpression = function (op, left, right, escape) {
            var expr = IAstFactory.eINSTANCE.createLikeExpression();
            expr.setLeft(left);
            expr.setRight(right);
            expr.setTypeToken(op);
            expr.setEscapeToken(escape);
            return expr;
        };
        AbstractDdlParser.prototype.viewparser_parameter = function (token) {
            var pe = IAstFactory.eINSTANCE.createPathExpression();
            var entry = IAstFactory.eINSTANCE.createPathEntry();
            entry.setNameToken(token);
            pe.getEntries().push(entry);
            this.visitPathExpression(pe);
            return pe;
        };
        AbstractDdlParser.prototype.viewparser_cliteral = function (token) {
            var ex = IAstFactory.eINSTANCE.createLiteralExpression();
            ex.setTokenToken(token);
            return ex;
        };
        AbstractDdlParser.prototype.viewparser_iliteral = function (token) {
            var ex = IAstFactory.eINSTANCE.createLiteralExpression();
            ex.setTokenToken(token);
            return ex;
        };
        AbstractDdlParser.prototype.viewparser_hexliteral = function (token) {
            var ex = IAstFactory.eINSTANCE.createLiteralExpression();
            ex.setTokenToken(token);
            return ex;
        };
        AbstractDdlParser.prototype.viewparser_startSelect = function () {
            return IAstFactory.eINSTANCE.createViewSelect();
        };
        AbstractDdlParser.prototype.viewparser_distinct = function (select) {
        };
        AbstractDdlParser.prototype.viewparser_from = function (select, ds) {
            if (select != null) {
                select.setFrom(ds);
            }
        };
        AbstractDdlParser.prototype.viewparser_selectlist2 = function (select, sl) {
            if (select != null && sl != null) {
                select.setSelectList(sl);
            }
        };
        AbstractDdlParser.prototype.viewparser_selectlist2 = function (extend, sl) {
            if (extend != null) {
                extend.setSelectList(sl);
            }
        };
        AbstractDdlParser.prototype.viewparser_selectListEntry = function (schema) {
            var entry = IAstFactory.eINSTANCE.createSelectListEntry();
            if (schema != null) {
                entry.setExpression(schema);
            }
            return entry;
        };
        AbstractDdlParser.prototype.viewparser_alias = function (entry, alias) {
            if (entry == null) {
                return;
            }
            entry.setAliasToken(alias);
        };
        AbstractDdlParser.prototype.viewparser_selectListExtension = function (name) {
            var entry = IAstFactory.eINSTANCE.createSelectListEntryExtension();
            entry.setAliasToken(name);
            return entry;
        };
        AbstractDdlParser.prototype.viewparser_startSelectList0 = function () {
            return IAstFactory.eINSTANCE.createSelectList();
        };
        AbstractDdlParser.prototype.viewparser_startSelectList1 = function (column) {
            var tokens = Parser.prototype.getTokens.call(this);
            var tokenIndex = tokens.indexOf(column);
            var list = IAstFactory.eINSTANCE.createSelectList();
            var entry = IAstFactory.eINSTANCE.createSelectListEntry();
            var pe = IAstFactory.eINSTANCE.createPathExpression();
            var pathEntry = IAstFactory.eINSTANCE.createPathEntry();
            pathEntry.setNameToken(column);
            pe.setStartTokenIndex(tokenIndex);
            pe.setEndTokenIndex(tokenIndex);
            pe.getEntries().push(pathEntry);
            entry.setExpression(pe);
            entry.setStartTokenIndex(tokenIndex);
            entry.setEndTokenIndex(tokenIndex);
            list.addEntry1(entry);
            return list;
        };
        AbstractDdlParser.prototype.viewparser_addSelectListEntry = function (list, entry) {
            if (list != null) {
                var entries = list.getEntries();
                if (entries != null && entries.length > 0) {
                    var last = entries[entries.length - 1];
                    if (last != null && last == this.currentIncompleteSelectListEntry) {
                        rnd.Utils.arrayRemove(entries, last);
                        this.currentIncompleteSelectListEntry = null;
                    }
                }
                list.addEntry1(entry);
            }
        };
        AbstractDdlParser.prototype.viewparser_addIncompleteSelectListEntry = function (list, entry) {
            list.addEntry1(entry);
            this.currentIncompleteSelectListEntry = entry;
        };
        AbstractDdlParser.prototype.viewparser_endSelect = function (def, select) {
            if (def != null && select != null) {
                def.setSelect(select);
            }
        };
        AbstractDdlParser.prototype.viewparser_startGroupBy = function () {
            return IAstFactory.eINSTANCE.createGroupBy();
        };
        AbstractDdlParser.prototype.viewparser_groupBy2 = function (select, groupBy) {
            if (select != null) {
                select.setGroupBy(groupBy);
            }
        };
        AbstractDdlParser.prototype.viewparser_groupByEntry = function (expression) {
            var entry = IAstFactory.eINSTANCE.createGroupByEntry();
            entry.setExpression(expression);
            return entry;
        };
        AbstractDdlParser.prototype.viewparser_groupBy1 = function (expressions) {
            var groupBy = this.viewparser_startGroupBy();
            for (var expCount = 0; expCount < expressions.length; expCount++) {
                var exp = expressions[expCount];
                var entry = this.viewparser_groupByEntry(exp);
                entry.setStartTokenIndex(exp.getStartTokenIndex());
                entry.setEndTokenIndex(exp.getEndTokenIndex());
                this.viewparser_addGroupByEntry(groupBy, entry);
            }
            return groupBy;
        };
        AbstractDdlParser.prototype.viewparser_createOrderBy = function (entries) {
            var ob = IAstFactory.eINSTANCE.createOrderBy();
            ob.getEntries().addAll(entries);
            return ob;
        };
        AbstractDdlParser.prototype.viewparser_createOrderByEntry = function (exp) {
            var entry = IAstFactory.eINSTANCE.createOrderByEntry();
            entry.setExpression(exp);
            return entry;
        };
        AbstractDdlParser.prototype.viewparser_addGroupByEntry = function (list, entry) {
            if (list != null) {
                list.getEntries().push(entry);
            }
        };
        AbstractDdlParser.prototype.viewparser_having = function (select, having) {
            select.setHaving(having);
        };
        AbstractDdlParser.prototype.viewparser_where = function (select, cond) {
            if (select != null) {
                select.setWhere(cond);
            }
        };
        AbstractDdlParser.prototype.viewparser_addUnion = function (old, select, unionToken) {
            old.setUnion(select);
            old.setUnionToken(unionToken);
        };
        AbstractDdlParser.prototype.viewparser_addUnionAll = function (old, select, unionToken, allToken) {
            old.setUnion(select);
            old.setUnionAll(true);
            old.setUnionToken(unionToken);
            old.setAllToken(allToken);
        };
        AbstractDdlParser.prototype.viewparser_stdFunctionExpression = function (name, ae) {
            var func = IAstFactory.eINSTANCE.createStdFuncExpression();
            func.setFuncNameToken(name);
            if (ae != null) {
                func.setParameter(ae);
            }
            return func;
        };
        AbstractDdlParser.prototype.viewparser_addFuncExprParameter = function (funcExpr, expr) {
            if (expr != null) {
                funcExpr.getParameters().push(expr);
            }
        };
        AbstractDdlParser.prototype.viewparser_addParameter = function (funcExpr, expr) {
            if (expr != null) {
                funcExpr.setParameter(expr);
            }
        };
        AbstractDdlParser.prototype.viewparser_funcExpression = function (name) {
            var expr = IAstFactory.eINSTANCE.createFuncExpression();
            expr.setName(name);
            return expr;
        };
        AbstractDdlParser.prototype.viewparser_funcWithNamedParamExpression = function (name) {
            var expr = IAstFactory.eINSTANCE.createFuncWithNamedParamExpression();
            expr.setName(name);
            return expr;
        };
        AbstractDdlParser.prototype.viewparser_addFuncParam = function (funcExpr, paramName) {
            var param = IAstFactory.eINSTANCE.createFuncParam();
            funcExpr.getParameters().push(param);
            param.setName(paramName);
            return param;
        };
        AbstractDdlParser.prototype.viewparser_createStdFunc1 = function (funcName) {
            var expr = IAstFactory.eINSTANCE.createStdFuncExpression();
            expr.setFuncNameToken(funcName);
            return expr;
        };
        AbstractDdlParser.prototype.viewparser_createStdFunc4 = function (funcName, distinct, all, ae) {
            var expr = IAstFactory.eINSTANCE.createStdFuncExpression();
            expr.setFuncNameToken(funcName);
            expr.setDistinctToken(distinct);
            expr.setAllToken(all);
            expr.setParameter(ae);
            return expr;
        };
        AbstractDdlParser.prototype.viewparser_createStdFuncWithExpressionAndAsteriskToken = function (funcName, distinct, expr, asteriskToken) {
            var funcExpr = IAstFactory.eINSTANCE.createStdFuncExpression();
            funcExpr.setFuncNameToken(funcName);
            funcExpr.setDistinctToken(distinct);
            if (expr == null) {
                var pathExpression = IAstFactory.eINSTANCE.createPathExpression();
                var pathEntry = IAstFactory.eINSTANCE.createPathEntry();
                pathEntry.setNameToken(asteriskToken);
                pathExpression.getEntries().push(pathEntry);
                expr = pathExpression;
                this.visitPathExpression(pathExpression);
            }
            funcExpr.setParameter(expr);
            return funcExpr;
        };
        AbstractDdlParser.prototype.viewparser_names = function () {
            return IAstFactory.eINSTANCE.createNames();
        };
        AbstractDdlParser.prototype.viewparser_addname = function (names, name) {
            names.add(name);
        };
        AbstractDdlParser.prototype.viewparser_setnames = function (viewDef, names) {
            viewDef.setNames(names);
        };
        AbstractDdlParser.prototype.viewparser_setExtend = function (entry, lextend) {
        };
        AbstractDdlParser.prototype.viewparser_startExtendViewWithoutNames = function () {
            this.lastFoundDataSources = [];
            var extend = IAstFactory.eINSTANCE.createViewExtend();
            this.allEntityDeclarations.push(extend);
            return extend;
        };
        AbstractDdlParser.prototype.viewparser_setExtendViewNames = function (extend, extendedViewName, extendName) {
            extend.setNameToken(extendName);
            extend.setExtendedViewNameToken(extendedViewName);
        };
        AbstractDdlParser.prototype.viewparser_startExtendView = function (extendedViewName, extendName) {
            this.lastFoundDataSources = [];
            var extend = IAstFactory.eINSTANCE.createViewExtend();
            extend.setNameToken(extendName);
            extend.setExtendedViewNameToken(extendedViewName);
            this.allEntityDeclarations.push(extend);
            return extend;
        };
        AbstractDdlParser.prototype.viewparser_setDDLStmt = function (stmt) {
            if (stmt != null) {
                this.compilationUnit.getStatements().push(stmt);
                stmt.setCompilationUnit(this.compilationUnit);
            }
        };
        AbstractDdlParser.prototype.viewparser_setStartTokenIndex = function (range, startTokenIndex) {
            if (range != null) {
                range.setStartTokenIndex(startTokenIndex);
            }
        };
        AbstractDdlParser.prototype.viewparser_setEndTokenIndex = function (range, endTokenIndex) {
            if (range != null) {
                range.setEndTokenIndex(endTokenIndex);
            }
        };
        AbstractDdlParser.prototype.viewparser_setStartEndTokenIndex = function (range, startTokenIndex, endTokenIndex) {
            if (range != null) {
                range.setStartTokenIndex(startTokenIndex);
                range.setEndTokenIndex(endTokenIndex);
            }
        };
        AbstractDdlParser.prototype.createCaseExpression = function (caseExpression) {
            return this.createSimpleCaseExpression(caseExpression);
        };
        AbstractDdlParser.prototype.createSimpleCaseExpression = function (caseExpression) {
            var caseEx = IAstFactory.eINSTANCE.createSimpleCaseExpression();
            if (caseExpression != null) {
                caseEx.setCaseExpression(caseExpression);
            }
            return caseEx;
        };
        AbstractDdlParser.prototype.createSearchedCaseExpression = function () {
            var caseEx = IAstFactory.eINSTANCE.createSearchedCaseExpression();
            return caseEx;
        };
        AbstractDdlParser.prototype.addNewCaseWhenExpression = function (caseExpression, whenExpression, thenExpression) {
            this.addAndReturnNewCaseWhenExpression(caseExpression, whenExpression, thenExpression);
        };
        AbstractDdlParser.prototype.addAndReturnNewCaseWhenExpression = function (caseExpression, whenExpression, thenExpression) {
            if (caseExpression instanceof CaseExpressionImpl) {
                var caseEx = caseExpression;
                var when = IAstFactory.eINSTANCE.createCaseWhenExpression();
                if (whenExpression != null) {
                    when.setWhenExpression(whenExpression);
                }
                if (thenExpression != null) {
                    when.setThenExpression(thenExpression);
                }
                caseEx.getWhenExpressions().push(when);
                return when;
            } else {
                return null;
            }
        };
        AbstractDdlParser.prototype.addElseExpression = function (caseExpression, elseExpression) {
            if (caseExpression instanceof CaseExpressionImpl) {
                var caseEx = caseExpression;
                if (elseExpression != null) {
                    caseEx.setElseExpression(elseExpression);
                }
            }
        };
        AbstractDdlParser.prototype.createCastExpression = function (expr, typeNamespace, typeName, length, decimals) {
            var castEx = IAstFactory.eINSTANCE.createCastExpression();
            if (expr != null) {
                castEx.setValue(expr);
            }
            if (typeNamespace != null) {
                castEx.setTypeNamespace(typeNamespace);
            }
            if (typeName != null) {
                castEx.setTypeName(typeName);
            }
            if (length != null) {
                castEx.setLength(length);
            }
            if (decimals != null) {
                castEx.setDecimals(decimals);
            }
            return castEx;
        };
        AbstractDdlParser.prototype.createPreAnnotation = function () {
            var preAnnotation = IAstFactory.eINSTANCE.createPreAnnotation();
            this.compilationUnit.getAnnotations().push(preAnnotation);
            return preAnnotation;
        };
        AbstractDdlParser.prototype.createPreAnnotationList = function () {
            return [];
        };
        AbstractDdlParser.prototype.createPostAnnotation = function () {
            var postAnnotation = IAstFactory.eINSTANCE.createPostAnnotation();
            this.compilationUnit.getAnnotations().push(postAnnotation);
            return postAnnotation;
        };
        AbstractDdlParser.prototype.createPostAnnotationList = function () {
            return [];
        };
        AbstractDdlParser.prototype.createUsingDirective = function (path, alias) {
            var usingDirective = IAstFactory.eINSTANCE.createUsingDirective();
            if (path != null) {
                usingDirective.setNamePath(path);
            }
            if (alias != null) {
                usingDirective.setAlias(alias);
            }
            return usingDirective;
        };
        AbstractDdlParser.prototype.collectPreAnnotation = function (annotations, annotation) {
            if (annotations == null) {
                return;
            }
            annotations.push(annotation);
        };
        AbstractDdlParser.prototype.collectPostAnnotation = function (annotations, annotation) {
            if (annotations == null) {
                return;
            }
            annotations.push(annotation);
        };
        AbstractDdlParser.prototype.addAnnotations = function (statement, annotations) {
            if (annotations == null || statement == null) {
                return;
            }
            var list = statement.getAnnotationList();
            list = list.concat(annotations);
            statement.annotationList = list;
        };
        AbstractDdlParser.prototype.addAnnotationPath = function (nameValuePair, pathToken) {
            nameValuePair.getNameTokenPath().push(pathToken);
        };
        AbstractDdlParser.prototype.addAnnotationValue = function (container, valueToken) {
            if (container == null) {
                return null;
            }
            var annotationValue = IAstFactory.eINSTANCE.createAnnotationValue();
            annotationValue.setValueToken(valueToken);
            if (container instanceof AnnotationNameValuePairImpl) {
                var nameValuePair = container;
                nameValuePair.setValue(annotationValue);
                return annotationValue;
            } else if (container instanceof AnnotationArrayValueImpl) {
                var array = container;
                array.getValues().push(annotationValue);
                return annotationValue;
            } else {
                throw new IllegalStateException("Type " + container.getClass() + " of container is unknowns");
            }
        };
        AbstractDdlParser.prototype.createAnnotationArrayValue = function () {
            return IAstFactory.eINSTANCE.createAnnotationArrayValue();
        };
        AbstractDdlParser.prototype.addAnnotationArrayValue = function (container, array) {
            if (container == null) {
                return;
            }
            if (container instanceof AnnotationNameValuePairImpl) {
                var nameValuePair = container;
                nameValuePair.setValue(array);
            } else if (container instanceof AnnotationArrayValueImpl) {
                var outerArray = container;
                outerArray.getValues().push(array);
            } else {
                throw new IllegalStateException("Typ of container is unknown");
            }
        };
        AbstractDdlParser.prototype.createAnnotationRecordValue = function () {
            return IAstFactory.eINSTANCE.createAnnotationRecordValue();
        };
        AbstractDdlParser.prototype.addAnnotationRecordValue = function (container, record) {
            if (container == null) {
                return;
            }
            if (container instanceof AnnotationNameValuePairImpl) {
                var nameValuePair = container;
                nameValuePair.setValue(record);
            } else if (container instanceof AnnotationArrayValueImpl) {
                var array = container;
                array.getValues().push(record);
            } else {
                throw new IllegalStateException("Typ of container is unknown");
            }
        };
        AbstractDdlParser.prototype.createAnnotationNameValuePair = function () {
            return IAstFactory.eINSTANCE.createAnnotationNameValuePair();
        };
        AbstractDdlParser.prototype.addAnnotationNameValuePair = function (recordValue, nameValuePair) {
            recordValue.getComponents().push(nameValuePair);
        };
        AbstractDdlParser.prototype.createAssociation = function () {
            var association = IAstFactory.eINSTANCE.createAssociationDeclaration();
            this.allAssociationDeclarations.push(association);
            return association;
        };
        AbstractDdlParser.prototype.addAssociation = function (select, assoc) {
            select.getAssociations().push(assoc);
        };
        AbstractDdlParser.prototype.addKey = function (assocation, keys, alias) {
            var foreignKey = IAstFactory.eINSTANCE.createForeignKey();
            foreignKey.setKeyPath(keys);
            foreignKey.setAliasToken(alias);
            assocation.getKeys().push(foreignKey);
            return foreignKey;
        };
        AbstractDdlParser.prototype.setCardinality = function (assocation, srcMax, srcMaxStar, min, max, maxStar) {
            if (srcMax != null) {
                assocation.setSourceMaxCardinalityToken(srcMax);
            } else if (srcMaxStar != null) {
                assocation.setSourceMaxCardinalityToken(srcMaxStar);
            }
            if (min != null && max != null) {
                assocation.setMinToken(min);
                assocation.setMaxToken(max);
                return;
            }
            if (min != null && maxStar != null) {
                assocation.setMinToken(min);
                assocation.setMaxToken(maxStar);
                return;
            }
            if (max != null) {
                assocation.setMinToken(max);
                assocation.setMaxToken(max);
                return;
            }
            if (maxStar != null) {
                assocation.setMinToken(maxStar);
                assocation.setMaxToken(maxStar);
                return;
            }
        };
        AbstractDdlParser.prototype.createPathEntry = function (name) {
            var pathEntry = IAstFactory.eINSTANCE.createPathEntry();
            pathEntry.setNameToken(name);
            return pathEntry;
        };
        AbstractDdlParser.prototype.setFilter = function (entry, filter) {
            entry.setFilter(filter);
        };
        AbstractDdlParser.prototype.createPathExpression = function () {
            var pathExpression = IAstFactory.eINSTANCE.createPathExpression();
            return pathExpression;
        };
        AbstractDdlParser.prototype.createArithmeticExpression = function (left, right, operator) {
            var result = IAstFactory.eINSTANCE.createArithmeticExpression();
            if (left != null) {
                result.setLeft(left);
            }
            if (right != null) {
                result.setRight(right);
            }
            if (operator != null) {
                result.setOperator(operator);
            }
            return result;
        };
        AbstractDdlParser.prototype.createPathDeclaration = function () {
            return IAstFactory.eINSTANCE.createPathDeclaration();
        };
        AbstractDdlParser.prototype.createExpressionContainer = function (expr) {
            var container = IAstFactory.eINSTANCE.createExpressionContainer();
            container.setExpression(expr);
            return container;
        };
        AbstractDdlParser.prototype.visitPathExpression = function (path) {
            if (this.visitor != null && this.visitor.visitPathExpression) {
                this.visitor.visitPathExpression(path);
            }
        };
        AbstractDdlParser.prototype.addEntry = function (path, entry) {
            path.getEntries().push(entry);
        };
        AbstractDdlParser.prototype.markLastNamespacePathEntry = function (path) {
            var entries = path.getEntries();
            if (entries != null && entries.length > 0) {
                path.setLastNamespaceComponentIndex(entries.length - 1);
            }
        };
        AbstractDdlParser.prototype.setSupportedAnnotations = function (paramSupportedAnnotations) {
            this.supportedAnnotations = paramSupportedAnnotations;
        };
        AbstractDdlParser.prototype.getCurrentStackframe = function () {
            var path = this.getCurrentPath();
            if (path != null) {
                var sf = path.getStackframe();
                return sf;
            }
            return null;
        };
        AbstractDdlParser.prototype.getPreviousTokenIgnoringNLAndComment0 = function () {
            return this.previousTokIgnoringNL();
        };
        AbstractDdlParser.prototype.getPreviousTokenIgnoringNLAndComment1 = function (tokenIndex) {
            var tokens = this.m_scanner.getInput();
            return TokenUtil.getPreviousTokenIgnoringNLAndComment(tokens, tokenIndex);
        };
        AbstractDdlParser.prototype.getNextTokenIgnoringNLAndComment = function (tokenIndex) {
            var tokens = this.m_scanner.getInput();
            return TokenUtil.getNextTokenIgnoringNLAndComment(tokens, tokenIndex);
        };
        AbstractDdlParser.prototype.init = function () {
        };
        AbstractDdlParser.prototype.getCompletionMode = function () {
            return CompletionModes.parse(this.m_completion_mode);
        };
        AbstractDdlParser.prototype.createEntityWithToken = function (id) {
            var entity = IAstFactory.eINSTANCE.createEntityDeclaration();
            entity.setNameToken(id);
            this.allEntityDeclarations.push(entity);
            return entity;
        };
        AbstractDdlParser.prototype.createConst = function (path) {
            var constDecl = IAstFactory.eINSTANCE.createConstDeclaration();
            constDecl.setNamePath(path);
            return constDecl;
        };
        AbstractDdlParser.prototype.viewparser_setConstValue = function (constDecl, value) {
            if (constDecl != null && value != null) {
                constDecl.setValue(value);
            }
        };
        AbstractDdlParser.prototype.createEntity = function (path) {
            var entity = IAstFactory.eINSTANCE.createEntityDeclaration();
            entity.setNamePath(path);
            this.allEntityDeclarations.push(entity);
            return entity;
        };
        AbstractDdlParser.prototype.viewparser_setElementDefault = function (elementDecl, defaultExpr) {
            if (elementDecl != null) {
                elementDecl.setDefault(defaultExpr);
            }
        };
        AbstractDdlParser.prototype.viewparser_setElementDefaultToken = function (elementDecl, token) {
            var expression = IAstFactory.eINSTANCE.createLiteralExpression();
            expression.setTokenToken(token);
            if (elementDecl != null) {
                elementDecl.setDefault(expression);
            }
        };
        AbstractDdlParser.prototype.createAnnotationDeclaration = function (name) {
            var declaraion = IAstFactory.eINSTANCE.createAnnotationDeclaration();
            declaraion.setCompilationUnit(this.compilationUnit);
            declaraion.setNameToken(name);
            return declaraion;
        };
        AbstractDdlParser.prototype.setLength = function (attribute, length) {
            if (attribute instanceof AttributeDeclarationImpl) {
                (attribute).setLengthToken(length);
            }
        };
        AbstractDdlParser.prototype.setDecimals = function (attribute, decimals) {
            if (attribute instanceof AttributeDeclarationImpl) {
                (attribute).setDecimalsToken(decimals);
            }
        };
        AbstractDdlParser.prototype.setType = function (element, typeId) {
            var entry = IAstFactory.eINSTANCE.createPathEntry();
            entry.setNameToken(typeId);
            var path = IAstFactory.eINSTANCE.createPathExpression();
            path.getEntries().push(entry);
            element.setTypeIdPath(path);
        };
        AbstractDdlParser.prototype.createAndSetAnoymousTypeDeclaration = function (element) {
            return this.createAndSetAnonymousTypeDeclaration(element);
        };
        AbstractDdlParser.prototype.createAndSetAnonymousTypeDeclaration = function (element) {
            var type = IAstFactory.eINSTANCE.createAnonymousTypeDeclaration();
            element.setAnonymousType(type);
            return type;
        };
        AbstractDdlParser.prototype.createAndSetAttributeDeclaration = function (type) {
            var attributeDeclaration = IAstFactory.eINSTANCE.createAttributeDeclaration();
            type.getElements().push(attributeDeclaration);
            return attributeDeclaration;
        };
        AbstractDdlParser.prototype.createAndSetEnumerationDeclaration = function (element) {
            var enumeration = IAstFactory.eINSTANCE.createEnumerationDeclaration();
            element.setEnumerationDeclaration(enumeration);
            return enumeration;
        };
        AbstractDdlParser.prototype.createAndSetEnumerationValue = function (enumeration) {
            var value = IAstFactory.eINSTANCE.createEnumerationValue();
            enumeration.getValues().push(value);
            return value;
        };
        AbstractDdlParser.prototype.onMatchCollectCompletionSuggestionsOrAbort = function (current_token, matched_terminal, current, context) {
            return TokenCoCoParser.prototype.onMatchCollectCompletionSuggestionsOrAbort.call(this, current_token, matched_terminal, current, context);
        };
        AbstractDdlParser.prototype.setPadFileResolverUsedToGetByteCode = function (padFileResolverUsedToGetByteCode) {
            this.padFileResolverUsedToGetByteCode = padFileResolverUsedToGetByteCode;
        };
        AbstractDdlParser.prototype.setDdlParser = function (ddlRndParser) {
            this.ddlParser = ddlRndParser;
        };
        AbstractDdlParser.prototype.getPadFileResolverUsedToGetByteCode = function () {
            return this.padFileResolverUsedToGetByteCode;
        };
        AbstractDdlParser.prototype.isAstNeededForCoCo = function () {
            return false;
        };
        AbstractDdlParser.prototype.setCompilationUnitForCoCo = function (cu) {
            this.cocoCompilationUnit = cu;
        };
        AbstractDdlParser.prototype.setTriggerPosForCoCo = function (cocoTriggerPosParam) {
            this.cocoTriggerPos = cocoTriggerPosParam;
        };
        AbstractDdlParser.prototype.getTriggerPosForCoCo = function () {
            return this.cocoTriggerPos;
        };
        AbstractDdlParser.prototype.isRulenameInHierarchy3 = function (stackframe, ruleName, stopAtFirstRuleName) {
            while (true) {
                var rn = stackframe.getRuleInfo().getRuleName();
                if (stopAtFirstRuleName === rn) {
                    return false;
                }
                if (ruleName === rn) {
                    return true;
                }
                stackframe = stackframe.getParent();
                if (stackframe == null) {
                    return false;
                }
            }
        };
        AbstractDdlParser.prototype.getAnnotationDefinition = function (context) {
            var sf = context.getStackframe();
            var currentPath = new StringBuffer();
            var lastFirstTokenIndex = -1;
            while (true) {
                var rn = sf.getRuleInfo().getRuleName();
                if (AbstractDdlParser.RECORD_COMPONENT_RULE === rn) {
                    var idx = sf.getFirstTokenIndex();
                    if (idx < 0) {
                        if (lastFirstTokenIndex >= 1) {
                            var previous = this.getTokenAt1(lastFirstTokenIndex - 1);
                            if (":" === previous.m_lexem) {
                                var previousPrevious = this.getTokenAt1(lastFirstTokenIndex - 2);
                                if (currentPath.length() > 0) {
                                    currentPath.insert(0, ".");
                                }
                                currentPath.insert(0, previousPrevious.m_lexem);
                            }
                        }
                    } else {
                        var s = this.getNextAnnotationPath(idx);
                        if (currentPath.length() > 0) {
                            currentPath.insert(0, ".");
                        }
                        currentPath.insert(0, s);
                    }
                }
                if (AbstractDdlParser.PRE_ANNOTATION_RULE === rn) {
                    var idx = sf.getFirstTokenIndex();
                    if (idx < 0) {
                        idx = this.findAnnotationStartTokenIndex(lastFirstTokenIndex);
                    }
                    if (idx < 0) {
                        return null;
                    }
                    var s = this.getNextAnnotationPath(idx);
                    if (currentPath.length() > 0) {
                        currentPath.insert(0, ".");
                    }
                    if (rnd.Utils.stringStartsWith(s, "@")) {
                        s = s.substring(1);
                    }
                    currentPath.insert(0, s);
                    break;
                }
                if (sf.getFirstTokenIndex() >= 0) {
                    lastFirstTokenIndex = sf.getFirstTokenIndex();
                }
                sf = sf.getParent();
            }
            return currentPath.toString();
        };
        AbstractDdlParser.prototype.annotValueProposalMatchesAnyKw = function (token, currToken) {
            if (currToken == null || currToken.m_lexem.length == 0) {
                return true;
            }
            var lowCurrTokenLexem = currToken.m_lexem.toLowerCase();
            if (lowCurrTokenLexem.charAt(0) == '\'') {
                return false;
            }
            if (lowCurrTokenLexem.charAt(0) == '\'') {
                lowCurrTokenLexem = lowCurrTokenLexem.substring(1);
            }
            token = token.toLowerCase();
            if (token.charAt(0) == '\'') {
                token = token.substring(1);
            }
            if (rnd.Utils.stringStartsWith(token, lowCurrTokenLexem)) {
                return true;
            }
            return false;
        };
        AbstractDdlParser.prototype.addHashIfNecessary = function (token) {
            var newToken = token;
            if (rnd.Utils.stringContains(token, "#") == false) {
                newToken = "#" + token;
            }
            return newToken;
        };
        AbstractDdlParser.prototype.getAnnotationDefinitionCompletion = function (annotation, elementDeclaration) {
            var result = null;
            var defaultValue = elementDeclaration.getDefault();
            var type = null;
            var typeIdPath = elementDeclaration.getTypeIdPath();
            if (typeIdPath != null) {
                type = typeIdPath.getPathString(false);
            }
            var value = "";
            if (defaultValue == null) {
                if (rnd.Utils.stringEqualsIgnoreCase("string", type)) {
                    value = "''";
                }
            } else {
                var enumDeclaration = elementDeclaration.getEnumerationDeclaration();
                if (enumDeclaration != null && rnd.Utils.stringEqualsIgnoreCase("string", type)) {
                    value = this.getDefaultValueFromExpression(defaultValue);
                } else {
                    value = this.getDefaultValueFromExpression(defaultValue);
                }
            }
            result = "@" + annotation + ": " + value;
            return result;
        };
        AbstractDdlParser.prototype.getDefaultValueFromExpression = function (defaultValue) {
            var value = null;
            if (defaultValue instanceof LiteralExpressionImpl) {
                value = (defaultValue).getToken();
            } else if (defaultValue instanceof PathExpressionImpl) {
                value = (defaultValue).getPathString(false);
            }
            return value;
        };
        AbstractDdlParser.prototype.getCompletionAnnotationInsertionString = function (annot, context) {
            try {
                var sf = context.getStackframe();
                var first = sf.getFirstTokenIndex();
                var currentName = this.getTokenAt1(first).m_lexem;
                var currentPath = new StringBuffer();
                var lastFirstTokenIndex = -1;
                while (true) {
                    var rn = sf.getRuleInfo().getRuleName();
                    if (AbstractDdlParser.RECORD_COMPONENT_RULE === rn) {
                        var idx = sf.getFirstTokenIndex();
                        if (idx < 0) {
                            idx = this.getPreviousRecordComponentTokenIdx(lastFirstTokenIndex);
                        }
                        var s = this.getNextAnnotationPath(idx);
                        if (currentPath.length() > 0) {
                            currentPath.insert(0, ".");
                        }
                        currentPath.insert(0, s);
                    }
                    if (AbstractDdlParser.PRE_ANNOTATION_RULE === rn) {
                        var idx = sf.getFirstTokenIndex();
                        if (idx < 0) {
                            idx = this.findAnnotationStartTokenIndex(lastFirstTokenIndex);
                        }
                        var s = this.getNextAnnotationPath(idx);
                        if (currentPath.length() > 0) {
                            currentPath.insert(0, ".");
                        }
                        currentPath.insert(0, s);
                        break;
                    }
                    if (sf.getFirstTokenIndex() >= 0) {
                        lastFirstTokenIndex = sf.getFirstTokenIndex();
                    }
                    sf = sf.getParent();
                }
                var annotLc = annot.toLowerCase();
                if (rnd.Utils.stringStartsWith(annotLc, currentPath.toString().toLowerCase())) {
                    if (currentName.length == 0) {
                        var ann = annot.substring(currentPath.length());
                        if (ann.charAt(0) == '.' || ann.charAt(0) == ':') {
                            ann = ann.substring(1);
                            return ann;
                        }
                        if (rnd.Utils.stringContains(annot.substring(0, currentPath.length()), ".") == false) {
                            if (rnd.Utils.stringStartsWith(ann, "@") == false && currentPath.toString() === "@" == false) {
                                ann = "@" + ann;
                            }
                        }
                        return ann;
                    } else {
                        var ind = currentPath.toString().lastIndexOf(".");
                        if (ind > 0) {
                            var anno = annot.substring(ind + 1);
                            return anno;
                        }
                        ind = annotLc.indexOf(currentName.toLowerCase());
                        if (ind < 0) {
                            return annot;
                        }
                        var ann = annot.substring(ind);
                        if (rnd.Utils.stringContains(annot.substring(0, ind), ".") == false && currentPath.toString().charAt(0) != '@') {
                            ann = "@" + ann;
                        }
                        return ann;
                    }
                }
            }
            catch (e) {
            }
            return null;
        };
        AbstractDdlParser.prototype.getPreviousRecordComponentTokenIdx = function (idx) {
            var t = this.getTokenAt1(idx);
            if (t != null && "{" === t.m_lexem) {
                idx--;
                t = this.getPreviousTokenIgnoringNLAndComment1(idx);
                if (t != null && ":" === t.m_lexem) {
                    idx--;
                    t = this.getPreviousTokenIgnoringNLAndComment1(idx);
                    var resultIndex = this.m_scanner.getInput().indexOf(t);
                    return resultIndex;
                }
            }
            return idx;
        };
        AbstractDdlParser.prototype.getAnnotationValueCompletions = function (elementDeclaration, current_token) {
            var resultValues = [];
            if (elementDeclaration != null) {
                var type = elementDeclaration.getTypeIdPath().getPathString(false);
                var defaultValue = elementDeclaration.getDefault();
                if (rnd.Utils.stringEqualsIgnoreCase("boolean", type)) {
                    return ["true", "false"];
                } else if (rnd.Utils.stringEqualsIgnoreCase("string", type)) {
                    var enumDeclaration = elementDeclaration.getEnumerationDeclaration();
                    if (enumDeclaration != null) {
                        var values = enumDeclaration.getValues();
                        for (var elementCount = 0; elementCount < values.length; elementCount++) {
                            var element = values[elementCount];
                            var enumValue = element;
                            var symbol = enumValue.getSymbol();
                            var token = null;
                            if (symbol != null) {
                                token = symbol.m_lexem;
                            } else {
                                var valueExpr = enumValue.getLiteral();
                                token = valueExpr.getToken();
                            }
                            token = this.addHashIfNecessary(token);
                            if (this.annotValueProposalMatchesAnyKw(token, current_token)) {
                                resultValues.push(token);
                            }
                        }
                    } else if (defaultValue != null) {
                        var value = this.getDefaultValueFromExpression(defaultValue);
                        if (value != null) {
                            value = this.addHashIfNecessary(value);
                            resultValues.push(value);
                        }
                    }
                } else if (rnd.Utils.stringEqualsIgnoreCase("integer", type)) {
                    var enumDeclaration = elementDeclaration.getEnumerationDeclaration();
                    if (enumDeclaration != null) {
                        var values = enumDeclaration.getValues();
                        for (var elementCount = 0; elementCount < values.length; elementCount++) {
                            var element = values[elementCount];
                            var iEnumValue = element;
                            var literal = iEnumValue.getLiteral();
                            var token = literal.getToken();
                            resultValues.push(token);
                        }
                    } else if (defaultValue != null) {
                        var value = this.getDefaultValueFromExpression(defaultValue);
                        if (value != null) {
                            resultValues.push(value);
                        }
                    }
                }
            }
            return resultValues;
        };
        AbstractDdlParser.prototype.findAnnotationStartTokenIndex = function (idx) {
            if (idx < 0) {
                return idx;
            }
            while (true) {
                var t = this.getTokenAt1(idx);
                if (t == null || "@" === t.m_lexem) {
                    return idx;
                }
                idx--;
            }
        };
        AbstractDdlParser.prototype.getNextAnnotationPath = function (idx) {
            var t = this.getTokenAt1(idx);
            var result = new StringBuffer(t.m_lexem);
            if (t.m_lexem === "") {
                return result.toString();
            }
            try {
                while (true) {
                    idx++;
                    t = this.getTokenAt1(idx);
                    if (":" === t.m_lexem || "{" === t.m_lexem || "" === t.m_lexem || "}" === t.m_lexem) {
                        break;
                    }
                    result.append(t.m_lexem);
                    if (t.m_num == 0) {
                        break;
                    }
                }
            }
            catch (e) {
            }
            return result.toString();
        };
        AbstractDdlParser.prototype.isCoCoAnnotationValue = function (context) {
            var stackframe = context.getStackframe();
            if (this.isRulenameInHierarchy3(stackframe, "AnnotationValue", "RecordComponent")) {
                return true;
            }
            return false;
        };
        AbstractDdlParser.prototype.isCoCoAnnotation = function (context) {
            var stackframe = context.getStackframe();
            var tokenAt = this.getTokenAt1(context.getTokenIndex());
            if (tokenAt != null && "@" === tokenAt.m_lexem) {
                return true;
            }
            if (this.isRulenameInHierarchy2(stackframe, AbstractDdlParser.PRE_ANNOTATION_RULE)) {
                return true;
            }
            return false;
        };
        AbstractDdlParser.prototype.isRulenameInHierarchy2 = function (stackframe, ruleName) {
            while (true) {
                var rn = stackframe.getRuleInfo().getRuleName();
                if (ruleName === rn) {
                    return true;
                }
                stackframe = stackframe.getParent();
                if (stackframe == null) {
                    return false;
                }
            }
        };
        AbstractDdlParser.prototype.areAllRuleNamesInHierarchy = function (stackframe, ruleNames) {
            var ruleNamesCopy = [];
            for (var ruleNameCount = 0; ruleNameCount < ruleNames.length; ruleNameCount++) {
                var ruleName = ruleNames[ruleNameCount];
                ruleNamesCopy.push(ruleName);
            }
            while (true) {
                var ruleInfo = stackframe.getRuleInfo();
                if (ruleInfo == null) {
                    return false;
                }
                var rn = ruleInfo.getRuleName();
                if (rnd.Utils.arrayContains(ruleNamesCopy, rn)) {
                    rnd.Utils.arrayRemove(ruleNamesCopy, rn);
                    if (ruleNamesCopy.length == 0) {
                        return true;
                    }
                }
                stackframe = stackframe.getParent();
                if (stackframe == null) {
                    return false;
                }
            }
        };
        AbstractDdlParser.prototype.setArrayCardinality = function (element, start, min, max, end) {
            if (element == null) {
                return;
            }
            element.setCardinalityStartToken(start);
            element.setCardinalityMinToken(min);
            element.setCardinalityMaxToken(max);
            element.setCardinalityEndToken(end);
        };
        AbstractDdlParser.prototype.getVisibleAnnotations = function (supportedAnnotations, current_token) {
            var result = [];
            if (supportedAnnotations == null) {
                return result;
            }
            var isRootStmt = false;
            var expectedCurrentScope = null;
            if (this.cocoCompilationUnit != null) {
                var node = this.findAstNodeForCurrentOffsetForScopeCalculation(this.cocoCompilationUnit.getStatements(), current_token.m_offset, null);
                if (node != null) {
                    isRootStmt = this.isRootStmt(node);
                    expectedCurrentScope = this.getCoCoScope(node);
                    if (expectedCurrentScope == null || expectedCurrentScope.length == 0) {
                        return result;
                    }
                }
            }
            if (expectedCurrentScope != null) {
                var expectedScope = [];
                expectedScope.push(expectedCurrentScope);
                this.checkBackend(expectedScope);
                if (expectedScope.length == 1) {
                    expectedCurrentScope = expectedScope[0];
                }
            }
            var stmts = this.supportedAnnotations.getStatements();
            for (var stmtCount = 0; stmtCount < stmts.length; stmtCount++) {
                var stmt = stmts[stmtCount];
                if (this.isAnnotated(stmt)) {
                    var annotName = stmt.getName();
                    var annotationList = (stmt).getAnnotationList();
                    if (this.isAnnotationRelevant(annotationList, annotName, expectedCurrentScope, isRootStmt)) {
                        result.push(stmt);
                    }
                }
            }
            return result;
        };
        AbstractDdlParser.prototype.checkBackend = function (expectedScope) {
        };
        AbstractDdlParser.prototype.isAnnotated = function (stmt) {
            if (stmt.getAnnotationList) return true;
            return false;
        };
        AbstractDdlParser.prototype.isAnnotationRelevant = function (annotationListOfAnnotation, annotName, scopeAtCurrentPosition, isRootStmt) {
            return false;
        };
        AbstractDdlParser.prototype.findAstNodeForCurrentOffsetForScopeCalculation = function (statements, offset, object) {
            return null;
        };
        AbstractDdlParser.prototype.getCoCoScope = function (node) {
            return null;
        };
        AbstractDdlParser.prototype.isRootStmt = function (node) {
            if (node != null) {
                var cu = node.eContainer();
                if (cu instanceof CompilationUnitImpl) {
                    return true;
                }
            }
            return false;
        };
        AbstractDdlParser.prototype.containsScope = function (value, scope) {
            if (value instanceof AnnotationArrayValueImpl) {
                for (var vCount = 0; vCount < (value).getValues().length; vCount++) {
                    var v = (value).getValues()[vCount];
                    if (this.containsScope(v, scope)) {
                        return true;
                    }
                }
            } else if (value instanceof AnnotationValueImpl) {
                var vt = (value).getValueToken();
                if (vt != null) {
                    if (rnd.Utils.stringEqualsIgnoreCase(scope, vt.m_lexem)) {
                        return true;
                    }
                }
            } else {
                throw new IllegalStateException();
            }
            return false;
        };
        AbstractDdlParser.prototype.getScopeAnnotation = function (annotationList) {
            for (var annotCount = 0; annotCount < annotationList.length; annotCount++) {
                var annot = annotationList[annotCount];
                var ap = annot.getNameTokenPath();
                if (ap != null && ap.length == 1) {
                    var name = ap[0].m_lexem;
                    if (rnd.Utils.stringEqualsIgnoreCase("Scope", name)) {
                        return annot;
                    }
                }
            }
            return null;
        };
        AbstractDdlParser.prototype.addViewParameter = function (viewDef, parameterName) {
            if (viewDef != null && parameterName != null) {
                var param = IAstFactory.eINSTANCE.createParameter();
                param.setNameToken(parameterName);
                viewDef.getParameters().push(param);
                return param;
            }
            return null;
        };
        AbstractDdlParser.prototype.createViewSelectSet = function (operator, all, distinct, left, right) {
            var selectSet = IAstFactory.eINSTANCE.createViewSelectSet();
            selectSet.setOperator(operator);
            selectSet.setAll(all);
            selectSet.setDistinct(distinct);
            selectSet.setLeft(left);
            selectSet.setRight(right);
            return selectSet;
        };
        AbstractDdlParser.prototype.createPathFromSingleToken = function (name) {
            var path = IAstFactory.eINSTANCE.createPathDeclaration();
            var entry = IAstFactory.eINSTANCE.createPathEntry();
            entry.setNameToken(name);
            path.getEntries().push(entry);
            return path;
        };
        AbstractDdlParser.prototype.createDataSourceFromNameToken = function (name) {
            var entry = IAstFactory.eINSTANCE.createPathEntry();
            entry.setNameToken(name);
            var pe = IAstFactory.eINSTANCE.createPathExpression();
            pe.getEntries().push(entry);
            var ds = IAstFactory.eINSTANCE.createDataSource();
            ds.setNamePathExpression(pe);
            return ds;
        };
        AbstractDdlParser.prototype.createAccessPolicy = function (path) {
            var accessPolicy = IAstFactory.eINSTANCE.createAccessPolicyDeclaration();
            accessPolicy.setNamePath(path);
            return accessPolicy;
        };
        AbstractDdlParser.prototype.createAccessPolicyWithNameToken = function (name) {
            var path = this.createPathFromSingleToken(name);
            var accessPolicy = IAstFactory.eINSTANCE.createAccessPolicyDeclaration();
            accessPolicy.setNamePath(path);
            return accessPolicy;
        };
        AbstractDdlParser.prototype.createAspect = function (path) {
            var aspect = IAstFactory.eINSTANCE.createAspectDeclaration();
            aspect.setNamePath(path);
            return aspect;
        };
        AbstractDdlParser.prototype.createAspectWithNameToken = function (name) {
            var path = this.createPathFromSingleToken(name);
            var aspect = IAstFactory.eINSTANCE.createAspectDeclaration();
            aspect.setNamePath(path);
            return aspect;
        };
        AbstractDdlParser.prototype.createRole = function (path) {
            var role = IAstFactory.eINSTANCE.createRoleDeclaration();
            role.setNamePath(path);
            return role;
        };
        AbstractDdlParser.prototype.createRoleWithNameToken = function (name) {
            var path = this.createPathFromSingleToken(name);
            var role = IAstFactory.eINSTANCE.createRoleDeclaration();
            role.setNamePath(path);
            return role;
        };
        AbstractDdlParser.prototype.createRule = function () {
            var rule = IAstFactory.eINSTANCE.createRuleDeclaration();
            return rule;
        };
        AbstractDdlParser.prototype.createPrefixRuleFromClause = function (commandToken, onToken) {
            var from = IAstFactory.eINSTANCE.createPrefixRuleFromClause();
            from.setCommandToken(commandToken);
            from.setOnToken(onToken);
            return from;
        };
        AbstractDdlParser.prototype.createPostfixRuleFromClause = function (commandToken) {
            var from = IAstFactory.eINSTANCE.createPostfixRuleFromClause();
            from.setCommandToken(commandToken);
            return from;
        };
        AbstractDdlParser.prototype.createIncludedRole = function (path) {
            var incl = IAstFactory.eINSTANCE.createIncludedRole();
            incl.setName(path);
            return incl;
        };
        AbstractDdlParser.prototype.visitParameterName = function (name) {
            if (this.visitor != null && this.visitor.visitParameterName) {
                this.visitor.visitParameterName(name);
            }
        };
        AbstractDdlParser.prototype.visitTypeUsage = function (namespace, name) {
            if (this.visitor != null && this.visitor.visitTypeUsage) {
                this.visitor.visitTypeUsage(namespace, name);
            }
        };
        return AbstractDdlParser;
    }
);
define(
    'commonddl/AbstractDdlVisitor',[], //dependencies
    function () {
        function AbstractDdlVisitor() {
        };
        AbstractDdlVisitor.prototype.visitSimpleDataSource = function(ds) {
        };
        AbstractDdlVisitor.prototype.visitPathExpression = function(path) {
        };
        return AbstractDdlVisitor;
    }
);
define(
    'commonddl/AbstractSemanticCodeCompletionRepositoryAccess',[], //dependencies
    function () {

        function AbstractSemanticCodeCompletionRepositoryAccess() {
            this.cachedDataSourceNames = {};
        }
        AbstractSemanticCodeCompletionRepositoryAccess.prototype.getDataSourceNames1 = function(namePattern) {
            return null;
        };
        AbstractSemanticCodeCompletionRepositoryAccess.prototype.cachedDataSourceNames = {};
        AbstractSemanticCodeCompletionRepositoryAccess.prototype.getDataSourceNameObjects = function(namePattern) {
            var result = this.cachedDataSourceNames[namePattern];
            if (result != null)
                return result;
            var names=this.getDataSourceNames(namePattern);
            if (names == null) {
                return null;
            }
            result = this.getListOfDataSourceNames(names);
            this.cachedDataSourceNames[namePattern] = result;
            return result;
        };
        AbstractSemanticCodeCompletionRepositoryAccess.prototype.getListOfDataSourceNames = function(names) {
            var result=[];
            for (var nameCount=0;nameCount<names.length;nameCount++) {
                var name=names[nameCount];
                result.push({name:name,data:null});
            }
            return result;
        };
        AbstractSemanticCodeCompletionRepositoryAccess.prototype.getDataSourceNames2 = function(namePattern,requestScope) {
            return null;
        };
        AbstractSemanticCodeCompletionRepositoryAccess.prototype.getColumnNames = function(monitor,cu,dataSourceName,columnNamePattern) {
            return null;
        };
        AbstractSemanticCodeCompletionRepositoryAccess.prototype.getElementProposals = function(monitor,cu,pathNames,scope) {
            return null;
        };
        AbstractSemanticCodeCompletionRepositoryAccess.prototype.getDataSourceTypes = function(monitor,dataSourceNames) {
            return null;
        };
        AbstractSemanticCodeCompletionRepositoryAccess.prototype.resetCache = function() {
        };
        AbstractSemanticCodeCompletionRepositoryAccess.prototype.findAndParseEntity = function(monitor,namePath) {
            return null;
        };
        AbstractSemanticCodeCompletionRepositoryAccess.prototype.getColumnsAndAssociations = function(progressMonitor,compilationUnit,fullyQualifiedPathName,resultColumnNames,resultAssociationNames,resultAssociationTargetEntityNames) {
        };
        AbstractSemanticCodeCompletionRepositoryAccess.prototype.getSelectListEntryType = function(progressMonitor,compilationUnit,fullyQualifiedPathNames) {
            return null;
        };
        AbstractSemanticCodeCompletionRepositoryAccess.prototype.getProject = function() {
            return null;
        };
        AbstractSemanticCodeCompletionRepositoryAccess.prototype.getElementProposalsWithUris = function(monitor,pathNames,scope) {
            return null;
        };

        return AbstractSemanticCodeCompletionRepositoryAccess;
    }
);
define(
    'commonddl/AnnotationUtil',["commonddl/astmodel/AnnotationDeclarationImpl","rndrt/rnd"], //dependencies
    function (AnnotationDeclarationImpl,rnd) {
        var Utils = rnd.Utils;
        function AnnotationUtil() {
        };
        AnnotationUtil.SCOPE_ANNOTATION_NAME="Scope";
        AnnotationUtil.getAnnotationsAsStringList1 = function(annotationCu) {
            var result={};
            if (annotationCu != null) {
                var statements=annotationCu.getStatements();
                result=AnnotationUtil.getAnnotationsAsStringList1(statements);
            }
            return result;
        };
        AnnotationUtil.getAnnotationsAsStringList1 = function(statements) {
            var result={};
            for (var stmtCount=0;stmtCount<statements.length;stmtCount++) {
                var stmt=statements[stmtCount];
                if (stmt instanceof AnnotationDeclarationImpl) {
                    var annotDecl=stmt;
                    var annotDeclName=annotDecl.getName();
                    var anonymousType=annotDecl.getAnonymousType();
                    if (anonymousType != null) {
                        var allAnonymousTypes=AnnotationUtil.getAllTypeNames(annotDeclName,anonymousType);
                        result=rnd.Utils.collect(result,allAnonymousTypes);
                    }else{
                        if (result[annotDeclName] == false) {
                            result[annotDeclName]=annotDecl;
                        }
                    }
                }
            }
            return result;
        };
        AnnotationUtil.getAllTypeNames = function(annotDeclName,anoymousType) {
            var result={};
            var elements=anoymousType.getElements();
            if (elements.length == 0) {
                var el=IAstFactory.eINSTANCE.createAttributeDeclaration();
                result[annotDeclName]=el;
            }
            for (var elementCount=0;elementCount<elements.length;elementCount++) {
                var element=elements[elementCount];
                var annotName=annotDeclName + "." + element.getName();
                var elAno=element.getAnonymousType();
                if (elAno == null || elAno.getElements().length == 0) {
                    result[annotName]=element;
                }else{
                    result=rnd.Utils.collect(result,AnnotationUtil.getAllTypeNames(annotName,elAno));
                }
            }
            return result;
        };
        AnnotationUtil.getScopeValueForAnnotation = function(elementDeclaration) {
            var scopeValues=[];
            var annotList=elementDeclaration.getAnnotationList();
            var current=elementDeclaration;
            while (scopeValues.length == 0) {
                annotList=current.getAnnotationList();
                if (annotList != null && Utils.arrayIsEmpty(annotList) == false) {
                    for (var elementCount=0;elementCount<annotList.length;elementCount++) {
                        var element=annotList[elementCount];
                        var annot=element;
                        var nameTokenPath=annot.getNameTokenPath();
                        if (nameTokenPath != null && nameTokenPath.length == 1) {
                            if (AnnotationUtil.SCOPE_ANNOTATION_NAME===nameTokenPath[0].m_lexem) {
                                var value=annot.getValue();
                                if (value instanceof AnnotationValueImpl) {
                                    scopeValues.push((value).getValueToken().m_lexem);
                                    break;
                                }else if (value instanceof AnnotationArrayValueImpl) {
                                    var vs=(value).getValues();
                                    for (var vaCount=0;vaCount<vs.length;vaCount++) {
                                        var va=vs[vaCount];
                                        if (va instanceof AnnotationValueImpl) {
                                            scopeValues.push((va).getValueToken().m_lexem);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                if (scopeValues.length > 0) {
                    break;
                }
                if (!(current.eContainer() instanceof AnnotatedImpl)) {
                    break;
                }
                current=current.eContainer();
                if (current == null) {
                    break;
                }
            }
            if (annotList == null || Utils.arrayIsEmpty(annotList) || scopeValues.length == 0) {
                return null;
            }
            return scopeValues;
        };
        AnnotationUtil.hasScope1 = function(elementDeclaration) {
            var annotList=null;
            var current=elementDeclaration;
            while (current != null) {
                annotList=current.getAnnotationList();
                if (annotList != null && Utils.arrayIsEmpty(annotList) == false) {
                    for (var elementCount=0;elementCount<annotList.length;elementCount++) {
                        var element=annotList[elementCount];
                        var annot=element;
                        if (AnnotationUtil.hasScope1(annot)) {
                            return true;
                        }
                    }
                }
                if (!(current.eContainer() instanceof AnnotatedImpl)) {
                    break;
                }
                current=current.eContainer();
                if (current == null) {
                    break;
                }
            }
            return false;
        };
        AnnotationUtil.hasScope1 = function(annot) {
            var nameTokenPath=annot.getNameTokenPath();
            if (nameTokenPath != null && nameTokenPath.length == 1) {
                if (AnnotationUtil.SCOPE_ANNOTATION_NAME===nameTokenPath[0].m_lexem) {
                    return true;
                }
            }
            return false;
        };
        return AnnotationUtil;
    }
);
define(
    'commonddl/DdlCompletionProposal',[], //dependencies
    function () {

        function DdlCompletionProposal( name, type, path)  {
            this.name = name;
            this.type = type;
            this.path = path;
        }

        return DdlCompletionProposal;
    }
);
define(
    'commonddl/DdlCompletionScope',[], //dependencies
    function () {

        function DdlCompletionScope(n) {
            this.na = n;
        }
        DdlCompletionScope.COLUMNS=new DdlCompletionScope("COLUMNS");
        DdlCompletionScope.ASSOCIATIONS=new DdlCompletionScope("ASSOCIATIONS");
        DdlCompletionScope.COLUMNS_AND_ASSOCIATIONS=new DdlCompletionScope("COLUMNS_AND_ASSOCIATIONS");
        DdlCompletionScope.ENTITY_DEFINITIONS=new DdlCompletionScope("ENTITY_DEFINITIONS");
        DdlCompletionScope.SQLVIEW_DEFINITIONS=new DdlCompletionScope("SQLVIEW_DEFINITIONS");

        DdlCompletionScope.prototype.name = function () {
            return this.na;
        };

        return DdlCompletionScope;
    }
);
define(
    'commonddl/DdlErrorneousParserBackendInfo',[], //dependencies
    function () {

        function DdlErrorneousParserBackendInfo(){
        }
        DdlErrorneousParserBackendInfo.prototype.timestamp = 0;
        return DdlErrorneousParserBackendInfo;
    }
);
define(
    'commonddl/DdlHaltedCallback',[], //dependencies
    function () {

        function DdlHaltedCallback() {
        }
        DdlHaltedCallback.prototype.run = function () {
            return true;
        };
        return DdlHaltedCallback;
    }
);
define(
    'commonddl/DdlParserBackendInfo',[], //dependencies
    function () {

        function DdlParserBackendInfo() {
        }
        DdlParserBackendInfo.prototype.version = "";
        DdlParserBackendInfo.prototype.annotationDefinitions = "";
        DdlParserBackendInfo.prototype.predefinedDataTypeList = [];
        return DdlParserBackendInfo;
    }
);
define(
    'commonddl/DdlScanner',[
        "rndrt/rnd",
        "commonddl/SapDdlConstants",
        "commonddl/AnnotationPayload"
    ], //dependencies
    function (
        rnd,
        SapDdlConstants,
        AnnotationPayload
        ) {
        var Category = rnd.Category;
        var CursorPos = rnd.CursorPos;
        var ErrorState = rnd.ErrorState;
        var Scanner = rnd.Scanner;
        var Token = rnd.Token;
        var Utils = rnd.Utils;
        DdlScanner.prototype = Object.create(Scanner.prototype);
        DdlScanner.prototype.doStrictSeparationOfTokensAtPlusMinus=false;
        DdlScanner.prototype.doStrictSeparationOfTokensAtSlash=false;
        DdlScanner.prototype.createDotDotTokens=false;
        DdlScanner.prototype.createEnumIdTokens=false;
        DdlScanner.prototype.createColonFollowedByIdTokens=false;
        DdlScanner.prototype.createPipePipeTokens=false;
        DdlScanner.prototype.anyKeyword=0;
        DdlScanner.prototype.eof=0;
        DdlScanner.prototype.nl=0;
        DdlScanner.prototype.comment1=0;
        DdlScanner.prototype.comment2=0;
        DdlScanner.prototype.dot=0;
        DdlScanner.prototype.comma=0;
        DdlScanner.prototype.colon=0;
        DdlScanner.prototype.colonFollowedById=0;
        DdlScanner.prototype.lparen=0;
        DdlScanner.prototype.rparen=0;
        DdlScanner.prototype.lt=0;
        DdlScanner.prototype.gt=0;
        DdlScanner.prototype.lbrack=0;
        DdlScanner.prototype.rbrack=0;
        DdlScanner.prototype.lbrace=0;
        DdlScanner.prototype.rbrace=0;
        DdlScanner.prototype.stringConst=0;
        DdlScanner.prototype.binaryConst=0;
        DdlScanner.prototype.intConst=0;
        DdlScanner.prototype.longIntConst=0;
        DdlScanner.prototype.decConst=0;
        DdlScanner.prototype.realConst=0;
        DdlScanner.prototype.dateConst=0;
        DdlScanner.prototype.timeConst=0;
        DdlScanner.prototype.timestampConst=0;
        DdlScanner.prototype.at=0;
        DdlScanner.prototype.pipe=0;
        DdlScanner.prototype.pipePipe=0;
        DdlScanner.prototype.star=0;
        DdlScanner.prototype.plus=0;
        DdlScanner.prototype.ge=0;
        DdlScanner.prototype.ne=0;
        DdlScanner.prototype.dash_arrow=0;
        DdlScanner.prototype.colonColon=0;
        DdlScanner.prototype.sysCmd=0;
        DdlScanner.prototype.id=0;
        DdlScanner.prototype.enumId=0;
        function DdlScanner(byteCode) {
            Scanner.call(this,byteCode);
            this.initializeTokenNumbers();
        }
        DdlScanner.DdlScanner1 = function(byteCode,doStrictSeparationOfTokensAtPlusMinus) {
            var result = new DdlScanner(byteCode);
            result.doStrictSeparationOfTokensAtPlusMinus=doStrictSeparationOfTokensAtPlusMinus;
            return result;
        }
        DdlScanner.DdlScanner2 = function(byteCode,doStrictSeparationOfTokensAtPlusMinus,doStrictSeparationOfTokensAtSlash) {
            var result = DdlScanner.DdlScanner1(byteCode,doStrictSeparationOfTokensAtPlusMinus);
            result.doStrictSeparationOfTokensAtSlash=doStrictSeparationOfTokensAtSlash;
            return result;
        }
        DdlScanner.DdlScanner3 = function(byteCode,doStrictSeparationOfTokensAtPlusMinus,doStrictSeparationOfTokensAtSlash,createDotDotTokens) {
            var result = DdlScanner.DdlScanner2(byteCode,doStrictSeparationOfTokensAtPlusMinus,doStrictSeparationOfTokensAtSlash);
            result.createDotDotTokens=createDotDotTokens;
            return result;
        }
        DdlScanner.DdlScanner4 = function(byteCode,doStrictSeparationOfTokensAtPlusMinus,doStrictSeparationOfTokensAtSlash,createDotDotTokens,createEnumIdTokens) {
            var result = DdlScanner.DdlScanner3(byteCode,doStrictSeparationOfTokensAtPlusMinus,doStrictSeparationOfTokensAtSlash,createDotDotTokens);
            result.createEnumIdTokens=createEnumIdTokens;
            return result;
        }
        DdlScanner.DdlScanner5 = function(byteCode,doStrictSeparationOfTokensAtPlusMinus,doStrictSeparationOfTokensAtSlash,createDotDotTokens,createEnumIdTokens,createColonFollowedByIdTokens) {
            var result = DdlScanner.DdlScanner4(byteCode,doStrictSeparationOfTokensAtPlusMinus,doStrictSeparationOfTokensAtSlash,createDotDotTokens,createEnumIdTokens);
            result.createColonFollowedByIdTokens=createColonFollowedByIdTokens;
            return result;
        }
        DdlScanner.DdlScanner6 = function(byteCode,doStrictSeparationOfTokensAtPlusMinus,doStrictSeparationOfTokensAtSlash,createDotDotTokens,createEnumIdTokens,createColonFollowedByIdTokens,createPipePipeTokens) {
            var result = DdlScanner.DdlScanner5(byteCode,doStrictSeparationOfTokensAtPlusMinus,doStrictSeparationOfTokensAtSlash,createDotDotTokens,createEnumIdTokens,createColonFollowedByIdTokens);
            result.createPipePipeTokens=createPipePipeTokens;
            return result;
        }
        DdlScanner.prototype.getIntegerConstantTokenNumber = function() {
            return this.intConst;
        };
        DdlScanner.prototype.getEofTokenNumber = function() {
            return this.eof;
        };
        DdlScanner.prototype.getColonFollowedByIdTokenNumber = function() {
            return this.colonFollowedById;
        };
        DdlScanner.prototype.getColonTokenNumber = function() {
            return this.colon;
        };
        DdlScanner.prototype.getAnyKwTokenNumber = function() {
            return this.anyKeyword;
        };
        DdlScanner.prototype.tok_begin=0;
        DdlScanner.prototype.tok_end=0;
        DdlScanner.prototype.column=0;
        DdlScanner.prototype.line=0;
        DdlScanner.prototype.inAnnotation=false;
        DdlScanner.prototype.annotationColonFound=false;
        DdlScanner.prototype.annotationFirstOpeningChar=0;
        DdlScanner.prototype.annotationNestingLevel=0;
        DdlScanner.prototype.checkNextTokenForLiteral=false;
        DdlScanner.prototype.setInput = function(s,startPos,cursorPos) {
            this.resetInput();
            if (s.length > 0 && s.charAt(s.length - 1) != '\0') {
                s+="\0";
            }
            this.tok_begin=0;
            this.tok_end=0;
            this.line=startPos.m_line;
            this.column=startPos.m_column;
            var last_hit_cursor_offset=-1;
            while (this.tok_begin < s.length) {
                var fallThrough=false;
                var tok_txt;
                switch (s.charAt(this.tok_begin)) {
                    case '\r':
                    case '\n':
                        if (this.isCursor(this.line,this.column,cursorPos)) {
                            this.addEmptyAnyKeywordToken();
                        }
                        var lineBreakLength=this.getLineBreakLength(s,this.tok_begin);
                        this.tok_begin=this.tok_begin + lineBreakLength;
                        this.startNewLine();
                        break;
                    case ' ':
                    case '\t':
                        if (this.isCursor(this.line,this.column,cursorPos)) {
                            this.addEmptyAnyKeywordToken();
                        }
                        this.tok_begin++;
                        this.column++;
                        break;
                    case '%':
                        this.tok_end=this.tok_begin + 1;
                        while (s.charAt(this.tok_end) >= 'A' && s.charAt(this.tok_end) <= 'Z') {
                            this.tok_end++;
                        }
                        if (s.charAt(this.tok_end) == '(') {
                            do {
                                this.tok_end++;
                            }
                            while (s.charAt(this.tok_end) != ')' && s.charAt(this.tok_end) != '\n');
                            this.tok_end++;
                        }
                        tok_txt=s.substring(this.tok_begin,this.tok_end);
                        this.m_input.push(new Token(this.sysCmd,tok_txt,Category.CAT_LITERAL,this.tok_begin,this.line,this.column,false,ErrorState.Correct,0));
                        this.column+=this.tok_end - this.tok_begin;
                        this.tok_begin=this.tok_end;
                        break;
                    case '\'':
                        this.processLiteral(s,'\'',this.stringConst,cursorPos);
                        break;
                    case '{':
                        this.processSingleChar(s,'{',this.lbrace,cursorPos);
                        break;
                    case ';':
                        var num1=this.getTokenIndex(";");
                        this.processSingleCharWithOperator(s,';',num1,cursorPos,Category.CAT_MAYBE_KEYWORD);
                        break;
                    case '}':
                        this.processSingleChar(s,'}',this.rbrace,cursorPos);
                        break;
                    case ':':
                        this.handleColon(s,cursorPos);
                        break;
                    case ',':
                        this.processSingleChar(s,',',this.comma,cursorPos);
                        break;
                    case '.':
                        try {
                            if (this.createDotDotTokens && s.charAt(this.tok_begin + 1) == '.') {
                                var dotDotNum=this.getTokenIndex("..");
                                this.m_input.push(new Token(dotDotNum,s.substring(this.tok_begin,this.tok_begin + 2),Category.CAT_OPERATOR,this.tok_begin,this.line,this.column,false,ErrorState.Correct,0));
                                this.tok_begin+=2;
                                this.column+=2;
                            }else{
                                this.processSingleChar(s,'.',this.dot,cursorPos);
                            }
                        }
                        catch(e) {
                            this.processSingleChar(s,'.',this.dot,cursorPos);
                        }
                        break;
                    case '@':
                        try {
                            if (s.charAt(this.tok_begin + 1) == '<') {
                                var sub=s.substring(this.tok_begin,this.tok_begin + 2);
                                if (this.isCursor(this.line,this.column,cursorPos)) {
                                    this.addEmptyAnyKeywordToken();
                                }
                                var atLeNum=this.getTokenIndex("@<");
                                var atLeToken=new Token(atLeNum,sub,Category.CAT_OPERATOR,this.tok_begin,this.line,this.column,false,ErrorState.Correct,0);
                                atLeToken.setPayload(new AnnotationPayload());
                                this.resetAnnotationState();
                                this.inAnnotation=true;
                                this.m_input.push(atLeToken);
                                this.tok_begin+=2;
                                this.column+=2;
                            }else{
                                this.processSingleChar(s,'@',this.at,cursorPos);
                            }
                        }
                        catch(e) {
                            this.processSingleChar(s,'@',this.at,cursorPos);
                        }
                        break;
                    case '=':
                        if (s.charAt(this.tok_begin + 1) == '>') {
                            var sub=s.substring(this.tok_begin,this.tok_begin + 2);
                            if (this.isCursor(this.line,this.column,cursorPos)) {
                                this.addEmptyAnyKeywordToken();
                            }
                            this.m_input.push(new Token(this.dash_arrow,sub,Category.CAT_OPERATOR,this.tok_begin,this.line,this.column,false,ErrorState.Correct,0));
                            this.tok_begin+=2;
                            this.column+=2;
                        }else{
                            this.processSingleCharWithOperatorInternal(s,'=',this.getTokenIndex("="),cursorPos,Category.CAT_KEYWORD,true);
                        }
                        break;
                    case '<':
                        if (s.charAt(this.tok_begin + 1) == '>') {
                            var sub=s.substring(this.tok_begin,this.tok_begin + 2);
                            if (this.isCursor(this.line,this.column,cursorPos)) {
                                this.addEmptyAnyKeywordToken();
                            }else if (this.isCursor(this.line,this.column + 1,cursorPos)) {
                                sub=sub.substring(1);
                                this.addAnyKeywordToken("<");
                            }
                            this.m_input.push(new Token(this.ne,sub,Category.CAT_OPERATOR,this.tok_begin,this.line,this.column,false,ErrorState.Correct,0));
                            this.tok_begin+=2;
                            this.column+=2;
                        }else if (s.charAt(this.tok_begin + 1) == '=') {
                            var sub=s.substring(this.tok_begin,this.tok_begin + 2);
                            if (this.isCursor(this.line,this.column,cursorPos)) {
                                this.addEmptyAnyKeywordToken();
                            }else if (this.isCursor(this.line,this.column + 1,cursorPos)) {
                                sub=sub.substring(1);
                                this.addAnyKeywordToken("<");
                            }
                            this.m_input.push(new Token(this.ge,sub,Category.CAT_OPERATOR,this.tok_begin,this.line,this.column,false,ErrorState.Correct,0));
                            this.tok_begin+=2;
                            this.column+=2;
                        }else{
                            this.processSingleCharSeparateAnyKwToken(s,'<',this.lt,cursorPos);
                        }
                        break;
                    case '>':
                        if (s.charAt(this.tok_begin + 1) == '=') {
                            var sub=s.substring(this.tok_begin,this.tok_begin + 2);
                            if (this.isCursor(this.line,this.column,cursorPos)) {
                                this.addEmptyAnyKeywordToken();
                            }else if (this.isCursor(this.line,this.column + 1,cursorPos)) {
                                sub=sub.substring(1);
                                this.addAnyKeywordToken(">");
                            }
                            this.m_input.push(new Token(this.ge,sub,Category.CAT_OPERATOR,this.tok_begin,this.line,this.column,false,ErrorState.Correct,0));
                            this.tok_begin+=2;
                            this.column+=2;
                        }else{
                            this.processSingleCharSeparateAnyKwToken(s,'>',this.gt,cursorPos);
                        }
                        break;
                    case '[':
                        this.processSingleChar(s,'[',this.lbrack,cursorPos);
                        break;
                    case ']':
                        this.processSingleChar(s,']',this.rbrack,cursorPos);
                        break;
                    case '|':
                        var nextChar=0;
                        try {
                            nextChar=s.charAt(this.tok_begin + 1);
                        }
                        catch(e) {
                        }
                        if (this.createPipePipeTokens && nextChar == '|') {
                            this.m_input.push(new Token(this.pipePipe,s.substring(this.tok_begin,this.tok_begin + 2),Category.CAT_OPERATOR,this.tok_begin,this.line,this.column,false,ErrorState.Correct,0));
                            this.tok_begin+=2;
                            this.column+=2;
                        }else{
                            this.processSingleChar(s,'|',this.pipe,cursorPos);
                        }
                        break;
                    case '*':
                        this.processSingleChar(s,'*',this.star,cursorPos);
                        break;
                    case '-':
                        if (this.handleSqlLineComment(s)) {
                            break;
                        }
                        var nextNumberLiteral=[""];
                        var endNumberIndex=[0];
                        var numConst=[0];
                        if (this.doStrictSeparationOfTokensAtPlusMinus == false && this.previousIsNumber() == false && this.nextIsNumber(s,nextNumberLiteral,endNumberIndex,numConst)) {
                            this.m_input.push(new Token(numConst[0],"-" + nextNumberLiteral[0],Category.CAT_LITERAL,this.tok_begin,this.line,this.column,false,ErrorState.Correct,0));
                            this.column+=endNumberIndex[0] - this.tok_begin;
                            this.tok_begin=endNumberIndex[0];
                        }else{
                            var minusNumId=this.getTokenIndex("-");
                            this.processSingleCharWithOperator(s,'-',minusNumId,cursorPos,Category.CAT_OPERATOR);
                        }
                        break;
                    case '+':
                        nextNumberLiteral=[""];
                        endNumberIndex=[0];
                        numConst=[0];
                        if (this.doStrictSeparationOfTokensAtPlusMinus == false && this.previousIsNumber() == false && this.nextIsNumber(s,nextNumberLiteral,endNumberIndex,numConst)) {
                            if (nextNumberLiteral[0].length == 0) {
                                this.m_input.push(new Token(this.plus,"+",Category.CAT_OPERATOR,this.tok_begin,this.line,this.column,false,ErrorState.Correct,0));
                            }else{
                                this.m_input.push(new Token(numConst[0],"+" + nextNumberLiteral[0],Category.CAT_LITERAL,this.tok_begin,this.line,this.column,false,ErrorState.Correct,0));
                            }
                            this.column+=endNumberIndex[0] - this.tok_begin;
                            this.tok_begin=endNumberIndex[0];
                        }else{
                            this.processSingleChar(s,'+',this.plus,cursorPos);
                        }
                        break;
                    case '(':
                        this.processSingleChar(s,'(',this.lparen,cursorPos);
                        break;
                    case '!':
                        if (s.charAt(this.tok_begin + 1) == '=') {
                            this.m_input.push(new Token(this.getTokenIndex("!="),s.substring(this.tok_begin,this.tok_begin + 2),Category.CAT_OPERATOR,this.tok_begin,this.line,this.column,false,ErrorState.Correct,0));
                            this.tok_begin+=2;
                            this.column+=2;
                        }else if (s.charAt(this.tok_begin + 1) == '{') {
                            this.handleLBracket(s);
                        }else{
                            this.m_input.push(new Token(this.getTokenIndex("!"),s.substring(this.tok_begin,this.tok_begin + 1),Category.CAT_OPERATOR,this.tok_begin,this.line,this.column,false,ErrorState.Correct,0));
                            this.tok_begin++;
                            this.column++;
                        }
                        break;
                    case ')':
                        var num;
                        var cat;
                        var lexem;
                        if (this.isCursor(this.line,this.column,cursorPos)) {
                            num=this.anyKeyword;
                            cat=Category.CAT_INCOMPLETE;
                            lexem="";
                        }else{
                            num=this.rparen;
                            cat=Category.CAT_OPERATOR;
                            lexem=")";
                        }
                        this.m_input.push(new Token(num,lexem,cat,this.tok_begin,this.line,this.column,false,ErrorState.Correct,0));
                        this.column++;
                        this.tok_begin++;
                        break;
                    case '\0':
                        if (this.isCursor(this.line,this.column,cursorPos)) {
                            this.addEmptyAnyKeywordToken();
                        }
                        this.tok_begin++;
                        break;
                    case '"':
                        if (this.isCursor(this.line,this.column,cursorPos)) {
                            this.addEmptyAnyKeywordToken();
                        }
                        tok_txt=this.consumeIdentifierStartingWithQuotationMark(s,cursorPos);
                        break;
                    case '/':
                        if (this.isCursor(this.line,this.column,cursorPos)) {
                            this.addEmptyAnyKeywordToken();
                        }
                        switch (s.charAt(this.tok_begin + 1)) {
                            case '/':
                                this.consumeCompleteLine(s);
                                break;
                            case '*':
                                this.tok_end=this.tok_begin + 2;
                                var columnPos=this.column + 2;
                                var linePos=this.line;
                                try {
                                    while (true) {
                                        if (s.charAt(this.tok_end) == '*' && s.charAt(this.tok_end + 1) == '/') {
                                            this.tok_end=this.tok_end + 2;
                                            columnPos+=2;
                                            break;
                                        }else if (this.isNL(s.charAt(this.tok_end))) {
                                            var lineBreakLength=this.getLineBreakLength(s,this.tok_end);
                                            this.tok_end=this.tok_end + lineBreakLength;
                                            linePos++;
                                            columnPos=1;
                                        }else if (this.tok_end >= s.length) {
                                            break;
                                        }else{
                                            this.tok_end++;
                                            columnPos++;
                                        }
                                        if (this.tok_end >= s.length) {
                                            this.tok_end=s.length - 1;
                                            break;
                                        }
                                    }
                                }
                                catch(e) {
                                    this.tok_end=s.length - 1;
                                }
                                tok_txt=s.substring(this.tok_begin,this.tok_end);
                                this.m_input.push(new Token(this.comment1,tok_txt,Category.CAT_COMMENT,this.tok_begin,this.line,this.column,false,ErrorState.Correct,0));
                                this.column=columnPos;
                                this.line=linePos;
                                this.tok_begin=this.tok_end;
                                break;
                            default :
                                fallThrough=true;
                        }
                        if (fallThrough == false) {
                            break;
                        }
                        if (this.doStrictSeparationOfTokensAtSlash) {
                            this.handleSlash(s);
                            break;
                        }
                    default :
                        if (this.handleSqlLineComment(s)) {
                            break;
                        }
                        if (this.handleHexLiteral(s)) {
                            break;
                        }
                        if (this.handleDateConstLiteral(s)) {
                            break;
                        }
                        if (this.handleTimeConstLiteral(s)) {
                            break;
                        }
                        if (this.handleTimestampConstLiteral(s)) {
                            break;
                        }
                        this.tok_end=this.tok_begin;
                        var tok_col=this.column;
                        var hit_cursor=false;
                        while (!this.isWS(s.charAt(this.tok_end)) && !this.isPunctation(s,this.tok_end) && !(s.charAt(this.tok_end) == '{')&& !(s.charAt(this.tok_end) == '}')&& !(s.charAt(this.tok_end) == '\'')&& !this.isLineComment(s,this.tok_end)&& !(s.charAt(this.tok_end) == ';')&& !(s.charAt(this.tok_end) == '=')) {
                            if (this.isCursor(this.line,tok_col,cursorPos) && this.tok_end != last_hit_cursor_offset) {
                                hit_cursor=true;
                                last_hit_cursor_offset=this.tok_end;
                                break;
                            }
                            if (this.doStrictSeparationOfTokensAtSlash && s.charAt(this.tok_end) == '/') {
                                break;
                            }
                            this.tok_end++;
                            tok_col++;
                            if (this.isCursor(this.line,tok_col,cursorPos) && this.tok_end != last_hit_cursor_offset) {
                                hit_cursor=true;
                                last_hit_cursor_offset=this.tok_end;
                                break;
                            }
                        }
                        tok_txt=s.substring(this.tok_begin,this.tok_end);
                        var num;
                        var cat;
                        num=this.getTokenIndex(tok_txt.toLowerCase());
                        if (num == -1) {
                            var it=this.tok_begin;
                            var isLongInt=false;
                            var isDec=false;
                            var isReal=false;
                            while (it != this.tok_end && (this.isDigitWithE(s.charAt(it),s,it) || this.isDotInNumberLiteral(s,it) || s.charAt(it) == 'e' || s.charAt(it) == 'E' || s.charAt(it) == '-' || s.charAt(it) == '+' || (it == this.tok_end - 1 && (s.charAt(it) == 'L' || s.charAt(it) == 'l' || s.charAt(it) == 'm' || s.charAt(it) == 'M')))) {
                                if (rnd.Utils.stringEqualsIgnoreCase(tok_txt, "l") || rnd.Utils.stringEqualsIgnoreCase(tok_txt, "m")) {
                                    break;
                                }
                                if (s.charAt(it) == 'e' || s.charAt(it) == 'E') {
                                    if (this.isDigitWithE(s.charAt(it),s,it) == false) {
                                        break;
                                    }
                                }
                                it++;
                                if (s.charAt(it) == 'e' || s.charAt(it) == 'E') {
                                    if (this.isDigitWithE(s.charAt(it),s,it) == false) {
                                        break;
                                    }
                                    isReal=true;
                                }
                                if (s.charAt(it) == 'L' || s.charAt(it) == 'l') {
                                    isLongInt=true;
                                    isReal=false;
                                }
                                if (s.charAt(it) == 'm' || s.charAt(it) == 'M') {
                                    isDec=true;
                                    isReal=false;
                                }
                                if (this.isDotInNumberLiteral(s,it)) {
                                    isReal=true;
                                }
                            }
                            if (it == this.tok_end) {
                                if (isLongInt) {
                                    num=this.longIntConst;
                                }else if (isDec) {
                                    num=this.decConst;
                                }else if (isReal) {
                                    num=this.realConst;
                                }else{
                                    num=this.intConst;
                                }
                                cat=Category.CAT_LITERAL;
                            }else{
                                if (this.createEnumIdTokens && rnd.Utils.stringStartsWith(tok_txt, "#")) {
                                    num=this.enumId;
                                }else{
                                    num=this.id;
                                }
                                cat=Category.CAT_IDENTIFIER;
                            }
                        }else{
                            cat=Category.CAT_MAYBE_KEYWORD;
                        }
                        if (hit_cursor) {
                            num=this.anyKeyword;
                            cat=Category.CAT_INCOMPLETE;
                            last_hit_cursor_offset=this.tok_end;
                        }
                        if (this.checkNextTokenForLiteral) {
                            if (cat == Category.CAT_IDENTIFIER) {
                                if (rnd.Utils.stringEqualsIgnoreCase("true", tok_txt) || rnd.Utils.stringEqualsIgnoreCase("false", tok_txt)) {
                                    this.changePreviousTokenToColonToken();
                                }
                            }
                            this.checkNextTokenForLiteral=false;
                        }
                        var t=new Token(num,tok_txt,cat,this.tok_begin,this.line,this.column,false,ErrorState.Correct,0);
                        if (this.inAnnotation) {
                            var last=this.getPreviousTokenIgnoringComments(this.m_input.length);
                            if (this.annotationColonFound) {
                                if (":"===last.m_lexem) {
                                    t.setPayload(new AnnotationPayload());
                                }else if (this.annotationNestingLevel > 0) {
                                    t.setPayload(new AnnotationPayload());
                                }
                            }else{
                                var previousChar=s.charAt(t.m_offset - 1);
                                if ("@"===last.m_lexem && this.isWS(previousChar) == false) {
                                    t.setPayload(new AnnotationPayload());
                                }else if (previousChar == '.') {
                                    t.setPayload(new AnnotationPayload());
                                }else if (previousChar == '<') {
                                    if ("@<"===last.m_lexem) {
                                        t.setPayload(new AnnotationPayload());
                                    }
                                }
                            }
                            if (t.getPayload() == null) {
                                this.resetAnnotationState();
                            }
                        }
                        this.m_input.push(t);
                        this.column+=this.tok_end - this.tok_begin;
                        this.tok_begin=this.tok_end;
                        break;
                }
            }
            this.m_input.push(new Token(this.eof,SapDdlConstants.EOF,Category.CAT_WS,this.tok_begin,this.line,this.column,false,ErrorState.Correct,0));
            this.m_state.m_input_pos=0;
        };
        DdlScanner.prototype.addEmptyAnyKeywordToken = function() {
            this.addAnyKeywordToken("");
        };
        DdlScanner.prototype.addAnyKeywordToken = function(lexem) {
            var t=new Token(this.anyKeyword,lexem,Category.CAT_INCOMPLETE,this.tok_begin,this.line,this.column,false,ErrorState.Correct,0);
            this.m_input.push(t);
        };
        DdlScanner.prototype.handleColon = function(s,cursorPos) {
            var nextChar=0;
            try {
                nextChar=s.charAt(this.tok_begin + 1);
                if (nextChar == ':') {
                    this.m_input.push(new Token(this.colonColon,s.substring(this.tok_begin,this.tok_begin + 2),Category.CAT_OPERATOR,this.tok_begin,this.line,this.column,false,ErrorState.Correct,0));
                    this.tok_begin+=2;
                    this.column+=2;
                }else if (this.createColonFollowedByIdTokens && rnd.Utils.isLetter(nextChar)) {
                    this.checkNextTokenForLiteral=true;
                    this.processSingleChar(s,':',this.colonFollowedById,cursorPos);
                    return;
                }else{
                    this.processSingleChar(s,':',this.colon,cursorPos);
                }
            }
            catch(e) {
                this.processSingleChar(s,':',this.colon,cursorPos);
            }
        };
        DdlScanner.prototype.initializeTokenNumbers = function() {
            this.anyKeyword=this.getTokenIndex(SapDdlConstants.ANY_KW);
            this.eof=this.getTokenIndex(SapDdlConstants.EOF);
            this.nl=this.getTokenIndex(SapDdlConstants.NL);
            this.comment1=this.getTokenIndex(SapDdlConstants.COMMENT1);
            this.comment2=this.getTokenIndex(SapDdlConstants.COMMENT2);
            this.dot=this.getTokenIndex(SapDdlConstants.DOT);
            this.comma=this.getTokenIndex(SapDdlConstants.COMMA);
            this.colon=this.getTokenIndex(SapDdlConstants.COLON);
            this.colonFollowedById=this.getTokenIndex(SapDdlConstants.COLON_FOLLOWED_BY_ID);
            this.pipePipe=this.getTokenIndex(SapDdlConstants.PIPE_PIPE);
            this.lparen=this.getTokenIndex(SapDdlConstants.LPAREN);
            this.rparen=this.getTokenIndex(SapDdlConstants.RPAREN);
            this.lt=this.getTokenIndex(SapDdlConstants.LT);
            this.gt=this.getTokenIndex(SapDdlConstants.GT);
            this.lbrack=this.getTokenIndex(SapDdlConstants.LBRACK);
            this.rbrack=this.getTokenIndex(SapDdlConstants.RBRACK);
            this.lbrace=this.getTokenIndex(SapDdlConstants.LBRACE);
            this.rbrace=this.getTokenIndex(SapDdlConstants.RBRACE);
            this.stringConst=this.getTokenIndex(SapDdlConstants.STRING_CONST);
            this.binaryConst=this.getTokenIndex(SapDdlConstants.BINARY_CONST);
            this.intConst=this.getTokenIndex(SapDdlConstants.INT_CONST);
            this.longIntConst=this.getTokenIndex(SapDdlConstants.LONG_INT_CONST);
            this.decConst=this.getTokenIndex(SapDdlConstants.DEC_CONST);
            this.realConst=this.getTokenIndex(SapDdlConstants.REAL_CONST);
            this.dateConst=this.getTokenIndex(SapDdlConstants.DATE_CONST);
            this.timeConst=this.getTokenIndex(SapDdlConstants.TIME_CONST);
            this.timestampConst=this.getTokenIndex(SapDdlConstants.TIMESTAMP_CONST);
            this.at=this.getTokenIndex(SapDdlConstants.AT);
            this.star=this.getTokenIndex(SapDdlConstants.STAR);
            this.pipe=this.getTokenIndex(SapDdlConstants.PIPE);
            this.plus=this.getTokenIndex(SapDdlConstants.PLUS);
            this.ge=this.getTokenIndex(SapDdlConstants.GE);
            this.ne=this.getTokenIndex(SapDdlConstants.NE);
            this.colonColon=this.getTokenIndex(SapDdlConstants.COLONCOLON);
            this.id=this.getTokenIndex(SapDdlConstants.ID);
            this.enumId=this.getTokenIndex(SapDdlConstants.ENUM_ID);
            this.dash_arrow=this.getTokenIndex(SapDdlConstants.DASH_ARROW);
        };
        DdlScanner.prototype.handleSlash = function(s) {
            this.tok_end=this.tok_begin;
            this.tok_end++;
            var tok_txt=s.substring(this.tok_begin,this.tok_end);
            var num=this.getTokenIndex(tok_txt.toLowerCase());
            var cat=Category.CAT_MAYBE_KEYWORD;
            if (num == -1) {
                cat=Category.CAT_IDENTIFIER;
            }
            var t=new Token(num,tok_txt,cat,this.tok_begin,this.line,this.column,false,ErrorState.Correct,0);
            this.m_input.push(t);
            this.column+=this.tok_end - this.tok_begin;
            this.tok_begin=this.tok_end;
        };
        DdlScanner.prototype.handleTimestampConstLiteral = function(s) {
            var start=this.tok_begin;
            var startCol=this.column;
            try {
                if (rnd.Utils.stringEqualsIgnoreCase(s.substring(start,start + 10), "timestamp'")) {
                    start+=10;
                    try {
                        while (true) {
                            if (s.charAt(start) == '\'') {
                                start++;
                                break;
                            }
                            start++;
                            if (start >= s.length) {
                                start--;
                                break;
                            }
                        }
                    }
                    catch(e) {
                        start--;
                    }
                    this.changePreviousTokenToColonToken();
                    var tok_txt=s.substring(this.tok_begin,start);
                    this.m_input.push(new Token(this.timestampConst,tok_txt,Category.CAT_LITERAL,this.tok_begin,this.line,startCol,false,ErrorState.Correct,0));
                    this.column+=start - this.tok_begin;
                    this.tok_begin=start;
                    return true;
                }
            }
            catch(e) {
            }
            return false;
        };
        DdlScanner.prototype.handleTimeConstLiteral = function(s) {
            var start=this.tok_begin;
            var startCol=this.column;
            try {
                if (rnd.Utils.stringEqualsIgnoreCase(s.substring(start,start + 5), "time'")) {
                    start+=5;
                    try {
                        while (true) {
                            if (s.charAt(start) == '\'') {
                                start++;
                                break;
                            }
                            start++;
                            if (start >= s.length) {
                                start--;
                                break;
                            }
                        }
                    }
                    catch(e) {
                        start--;
                    }
                    this.changePreviousTokenToColonToken();
                    var tok_txt=s.substring(this.tok_begin,start);
                    this.m_input.push(new Token(this.timeConst,tok_txt,Category.CAT_LITERAL,this.tok_begin,this.line,startCol,false,ErrorState.Correct,0));
                    this.column+=start - this.tok_begin;
                    this.tok_begin=start;
                    return true;
                }
            }
            catch(e) {
            }
            return false;
        };
        DdlScanner.prototype.handleDateConstLiteral = function(s) {
            var start=this.tok_begin;
            var startCol=this.column;
            try {
                if (rnd.Utils.stringEqualsIgnoreCase(s.substring(start,start + 5), "date'")) {
                    start+=5;
                    try {
                        while (true) {
                            if (s.charAt(start) == '\'') {
                                start++;
                                break;
                            }
                            start++;
                            if (start >= s.length) {
                                start--;
                                break;
                            }
                        }
                    }
                    catch(e) {
                        start--;
                    }
                    this.changePreviousTokenToColonToken();
                    var tok_txt=s.substring(this.tok_begin,start);
                    this.m_input.push(new Token(this.dateConst,tok_txt,Category.CAT_LITERAL,this.tok_begin,this.line,startCol,false,ErrorState.Correct,0));
                    this.column+=start - this.tok_begin;
                    this.tok_begin=start;
                    return true;
                }
            }
            catch(e) {
            }
            return false;
        };
        DdlScanner.prototype.changePreviousTokenToColonToken = function() {
            if (this.checkNextTokenForLiteral) {
                var lastToken=this.m_input[this.m_input.length - 1];
                lastToken.m_num=this.colon;
            }
        };
        DdlScanner.prototype.nextIsNumber = function(source,retNumberLiteral,retEndIndex,retNum) {
            try {
                var i=this.tok_begin + 1;
                while (this.isNL(source.charAt(i))) {
                    i++;
                }
                var before=i;
                while (!this.isWS(source.charAt(i)) && !this.isPunctation(source,i) && !(source.charAt(i) == '{')&& !(source.charAt(i) == '}')&& !(source.charAt(i) == '\'')&& !this.isLineComment(source,i)&& !(source.charAt(i) == ';')&& !(source.charAt(i) == '=')) {
                    i++;
                }
                var next=source.substring(before,i);
                var isNumber=true;
                for (var q=0;q < next.length;q++) {
                    var c=next.charAt(q);
                    if (c == '.') {
                        retNum[0]=this.realConst;
                        continue;
                    }
                    if (this.isDigitWithE(c,next,q) == false) {
                        if (q == next.length - 1 && (c == 'L' || c == 'l')) {
                            retNum[0]=this.longIntConst;
                            continue;
                        }
                        if (q == next.length - 1 && (c == 'm' || c == 'M')) {
                            retNum[0]=this.decConst;
                            continue;
                        }
                        isNumber=false;
                        break;
                    }
                    if (c == 'e') {
                        retNum[0]=this.realConst;
                    }
                }
                if (isNumber) {
                    retNumberLiteral[0]=next;
                    retEndIndex[0]=i;
                    if (retNum[0] == 0) {
                        retNum[0]=this.intConst;
                    }
                    return true;
                }
            }
            catch(e) {
            }
            return false;
        };
        DdlScanner.prototype.previousIsNumber = function() {
            var size=this.m_input.length;
            if (size > 0) {
                var last=this.m_input[size - 1];
                if (this.isNumber(last)) {
                    return true;
                }
            }
            return false;
        };
        DdlScanner.prototype.isNumber = function(t) {
            if (t != null && t.m_num == this.intConst) {
                return true;
            }
            if (t != null && t.m_num == this.longIntConst) {
                return true;
            }
            if (t != null && t.m_num == this.decConst) {
                return true;
            }
            if (t != null && t.m_num == this.realConst) {
                return true;
            }
            return false;
        };
        DdlScanner.prototype.startNewLine = function() {
            this.line++;
            this.column=1;
        };
        DdlScanner.prototype.getLineBreakLength = function(s,lineBreakPosition) {
            var lineBreakLength=0;
            if (s.charAt(lineBreakPosition) == '\r' && s.charAt(lineBreakPosition + 1) == '\n') {
                lineBreakLength=2;
            }else if (s.charAt(lineBreakPosition) == '\r' && s.charAt(lineBreakPosition + 1) != '\n') {
                lineBreakLength=1;
            }else if (lineBreakPosition > 0 && s.charAt(lineBreakPosition) == '\n' && s.charAt(lineBreakPosition - 1) != '\r') {
                lineBreakLength=1;
            }else if (lineBreakPosition == 0 && s.charAt(lineBreakPosition) == '\n') {
                lineBreakLength=1;
            }else if (s.charAt(lineBreakPosition) == '\0') {
                lineBreakLength=1;
            }
            return lineBreakLength;
        };
        DdlScanner.prototype.resetAnnotationState = function() {
            this.inAnnotation=false;
            this.annotationColonFound=false;
            this.annotationFirstOpeningChar=0;
            this.annotationNestingLevel=0;
        };
        DdlScanner.prototype.isDotInNumberLiteral = function(s,position) {
            if (position == 0) {
                return false;
            }
            try {
                if (this.isDigit(s.charAt(position - 1)) && s.charAt(position) == '.' && this.isDigit(s.charAt(position + 1))) {
                    return true;
                }
            }
            catch(e) {
                return false;
            }
            return false;
        };
        DdlScanner.prototype.consumeIdentifierStartingWithQuotationMark = function(s,cursorPos) {
            var tok_txt;
            var start=this.tok_begin;
            var startColumn=this.column;
            var hitCursor=false;
            var errorState=ErrorState.Correct;
            try {
                while (true) {
                    this.tok_begin++;
                    this.column++;
                    if (this.isCursor(this.line,this.column,cursorPos)) {
                        hitCursor=true;
                        break;
                    }
                    if (this.tok_begin >= s.length) {
                        this.tok_begin--;
                        this.column--;
                        break;
                    }
                    var c=s.charAt(this.tok_begin);
                    if (c == '\r' || c == '\n') {
                        errorState=ErrorState.Erroneous;
                        break;
                    }
                    if (s.charAt(this.tok_begin) == '"') {
                        this.tok_begin++;
                        this.column++;
                        try {
                            if (s.charAt(this.tok_begin) == '"') {
                                continue;
                            }
                        }
                        catch(e) {
                        }
                        break;
                    }
                }
                if (this.isCursor(this.line,this.column,cursorPos)) {
                    hitCursor=true;
                }
            }
            catch(e) {
                this.tok_begin--;
                this.column--;
            }
            tok_txt=s.substring(start,this.tok_begin);
            if (hitCursor) {
                this.m_input.push(new Token(this.anyKeyword,tok_txt,Category.CAT_INCOMPLETE,start,this.line,startColumn,false,ErrorState.Correct,0));
            }else{
                this.m_input.push(new Token(this.id,tok_txt,Category.CAT_IDENTIFIER,start,this.line,startColumn,false,errorState,0));
            }
            return tok_txt;
        };
        DdlScanner.prototype.isLineComment = function(s,position) {
            return ((s.charAt(position) == '-' && s.charAt(position + 1) == '-'));
        };
        DdlScanner.prototype.handleSqlLineComment = function(s) {
            if (this.isLineComment(s,this.tok_begin)) {
                this.consumeCompleteLine(s);
                return true;
            }
            return false;
        };
        DdlScanner.prototype.consumeCompleteLine = function(s) {
            this.tok_end=this.tok_begin;
            while (!this.isNL(s.charAt(this.tok_end))) {
                this.tok_end++;
            }
            var lineBreakPosition=this.tok_end;
            var lineBreakLength=this.getLineBreakLength(s,lineBreakPosition);
            var tok_txt=s.substring(this.tok_begin,this.tok_end);
            this.m_input.push(new Token(this.comment2,tok_txt,Category.CAT_COMMENT,this.tok_begin,this.line,this.column,false,ErrorState.Correct,0));
            this.tok_end=this.tok_end + lineBreakLength;
            this.startNewLine();
            this.tok_begin=this.tok_end;
        };
        DdlScanner.prototype.handleHexLiteral = function(s) {
            var start=this.tok_begin;
            var startCol=this.column;
            if ((s.charAt(this.tok_begin) == 'x' || s.charAt(this.tok_begin) == 'X') && s.charAt(this.tok_begin + 1) == '\'') {
                try {
                    this.tok_begin++;
                    this.column++;
                    do {
                        this.tok_begin++;
                        this.column++;
                    }
                    while (s.charAt(this.tok_begin) != '\'' && !this.isPunctation(s,this.tok_begin) && !this.isWS(s.charAt(this.tok_begin)));
                    if (!this.isWS(s.charAt(this.tok_begin))) {
                        this.tok_begin++;
                        this.column++;
                    }
                }
                catch(e) {
                    this.tok_begin--;
                    this.column--;
                }
                this.changePreviousTokenToColonToken();
                var tok_txt=s.substring(start,this.tok_begin);
                this.m_input.push(new Token(this.binaryConst,tok_txt,Category.CAT_LITERAL,start,this.line,startCol,false,ErrorState.Correct,0));
                return true;
            }
            return false;
        };
        DdlScanner.prototype.processSingleCharSeparateAnyKwToken = function(s,c,token_num,cursorPos) {
            this.processSingleCharWithOperatorInternal(s,c,token_num,cursorPos,Category.CAT_OPERATOR,true);
        };
        DdlScanner.prototype.processSingleChar = function(s,c,token_num,cursorPos) {
            this.processSingleCharWithOperatorInternal(s,c,token_num,cursorPos,Category.CAT_OPERATOR,false);
        };
        DdlScanner.prototype.processSingleCharWithOperator = function(s,c,token_num,cursorPos,category) {
            this.processSingleCharWithOperatorInternal(s,c,token_num,cursorPos,category,false);
        };
        DdlScanner.prototype.processSingleCharWithOperatorInternal = function(s,c,token_num,cursorPos,category,separateTokenWithEmptyLexemForAnyKw) {
            if (s.charAt(this.tok_begin) == c) {
                if (this.isCursor(this.line,this.column,cursorPos)) {
                    var sub=s.substring(this.tok_begin,this.tok_begin + 1);
                    if ("}"===sub || ","===sub || "{"===sub|| separateTokenWithEmptyLexemForAnyKw) {
                        sub="";
                    }
                    var t=new Token(this.anyKeyword,sub,Category.CAT_INCOMPLETE,this.tok_begin,this.line,this.column,false,ErrorState.Correct,0);
                    this.handleAnnotationSingleChar(c,t);
                    this.m_input.push(t);
                    if (separateTokenWithEmptyLexemForAnyKw) {
                        t=new Token(token_num,s.substring(this.tok_begin,this.tok_begin + 1),category,this.tok_begin,this.line,this.column,false,ErrorState.Correct,0);
                        this.handleAnnotationSingleChar(c,t);
                        this.m_input.push(t);
                    }
                }else{
                    var t=new Token(token_num,s.substring(this.tok_begin,this.tok_begin + 1),category,this.tok_begin,this.line,this.column,false,ErrorState.Correct,0);
                    this.handleAnnotationSingleChar(c,t);
                    this.m_input.push(t);
                }
                this.tok_begin++;
                this.column++;
            }
        };
        DdlScanner.prototype.handleAnnotationSingleChar = function(c,t) {
            if (c == '@') {
                t.setPayload(new AnnotationPayload());
                this.resetAnnotationState();
                this.inAnnotation=true;
            }
            if (this.inAnnotation && c == ':') {
                t.setPayload(new AnnotationPayload());
                this.annotationColonFound=true;
            }
            if (this.inAnnotation && this.annotationColonFound == false && c == '.') {
                t.setPayload(new AnnotationPayload());
            }
            if (this.inAnnotation && this.annotationColonFound && c == '{') {
                if (this.annotationFirstOpeningChar == 0) {
                    this.annotationFirstOpeningChar=c;
                    this.annotationNestingLevel++;
                }else if (this.annotationFirstOpeningChar == '{') {
                    this.annotationNestingLevel++;
                }
            }
            if (this.inAnnotation && this.annotationColonFound && c == '}' && this.annotationFirstOpeningChar == '{') {
                this.annotationNestingLevel--;
                t.setPayload(new AnnotationPayload());
                if (this.annotationNestingLevel == 0) {
                    this.resetAnnotationState();
                }
            }
            if (this.inAnnotation && this.annotationColonFound && c == '[') {
                if (this.annotationFirstOpeningChar == 0) {
                    this.annotationFirstOpeningChar=c;
                    this.annotationNestingLevel++;
                }else if (this.annotationFirstOpeningChar == '[') {
                    this.annotationNestingLevel++;
                }
            }
            if (this.inAnnotation && this.annotationColonFound && c == ']' && this.annotationFirstOpeningChar == '[') {
                this.annotationNestingLevel--;
                t.setPayload(new AnnotationPayload());
                if (this.annotationNestingLevel == 0) {
                    this.resetAnnotationState();
                }
            }
            if (this.inAnnotation && this.m_input.length > 0) {
                var last=this.getPreviousTokenIgnoringComments(this.m_input.length);
                if (last != null) {
                    if (":"===last.m_lexem) {
                        t.setPayload(new AnnotationPayload());
                    }else if ("<"===t.m_lexem && "@"===last.m_lexem) {
                        t.setPayload(new AnnotationPayload());
                    }
                }
            }
            if (this.inAnnotation && this.annotationNestingLevel > 0) {
                t.setPayload(new AnnotationPayload());
            }
        };
        DdlScanner.prototype.processLiteral = function(s,delimeter,nUM_SLITERAL,cursorPos) {
            if (s.charAt(this.tok_begin) == delimeter) {
                var lColumn=this.column;
                this.tok_end=this.tok_begin;
                if (this.isCursor(this.line,lColumn,cursorPos)) {
                    var tok_txt=s.substring(this.tok_begin,this.tok_end);
                    this.addAnyKeywordToken(tok_txt);
                }
                var startLine = this.line;
                var startColumn = this.column;
                for (;;) {
                    this.tok_end++;
                    lColumn++;
                    if (this.isCursor(this.line,lColumn,cursorPos)) {
                        var tok_txt=s.substring(this.tok_begin,this.tok_end);
                        this.addAnyKeywordToken(tok_txt);
                    }
                    if (s.charAt(this.tok_end) == delimeter && this.isNotEscaped(s)) {
                        this.tok_end++;
                        lColumn++;
                        if (s.charAt(this.tok_end) != delimeter) {
                            if (this.isCursor(this.line,lColumn - 1,cursorPos)) {
                                var tok_txt=s.substring(this.tok_begin,this.tok_end - 1);
                                this.addAnyKeywordToken(tok_txt);
                            }
                            var tok_txt=s.substring(this.tok_begin,this.tok_end);
                            var t=new Token(nUM_SLITERAL,tok_txt,Category.CAT_LITERAL,this.tok_begin,startLine,startColumn,false,ErrorState.Correct,0);
                            this.handleAnnotationSingleChar('a',t);
                            this.m_input.push(t);
                            this.column=lColumn;
                            this.tok_begin=this.tok_end;
                            return;
                        }
                    }
                    switch (s.charAt(this.tok_end)) {
                        case '\n':
                            this.line++;
                            lColumn=0;
                            break;
                        case '\0':
                            var tok_txt=s.substring(this.tok_begin,this.tok_end);
                            var t=new Token(nUM_SLITERAL,tok_txt,Category.CAT_LITERAL,this.tok_begin,startLine,startColumn,false,ErrorState.Correct,0);
                            this.handleAnnotationSingleChar('a',t);
                            this.m_input.push(t);
                            this.column=lColumn;
                            this.tok_begin=this.tok_end;
                            return;
                        default :
                            break;
                    }
                }
            }
        };
        DdlScanner.prototype.isNotEscaped = function(s) {
            if (s.charAt(this.tok_end - 1) == '\\') {
                if (s.charAt(this.tok_end - 2) == '\\') {
                    return true;
                }
                return false;
            }
            return true;
        };
        DdlScanner.prototype.handleLBracket = function(s) {
            this.tok_end=this.tok_begin;
            for (;;) {
                switch (s.charAt(this.tok_end)) {
                    case '\r':
                        Assert.isTrue1(s.charAt(this.tok_end + 1) == '\n');
                    case '\n':
                        this.line++;
                        this.column=0;
                        if (s.charAt(this.tok_end) == '\r') {
                            this.tok_end++;
                        }
                        this.tok_end++;
                        break;
                    default :
                        this.column++;
                        this.tok_end++;
                        break;
                }
            }
        };
        DdlScanner.prototype.isNL = function(X) {
            if (X == '\n' || X == '\r' || X == '\0') {
                return true;
            }
            return false;
        };
        DdlScanner.prototype.isDigitWithE = function(X,s,tokenIndex) {
            if (X >= '0' && X <= '9') {
                return true;
            }
            if (X == '-' || X == '+') {
                if (this.isDigit(s.charAt(tokenIndex + 1))) {
                    return true;
                }
            }
            if (tokenIndex > 0) {
                if (X == 'e' || X == 'E') {
                    var prev=s.charAt(tokenIndex - 1);
                    var next=s.charAt(tokenIndex + 1);
                    if (this.isDigit(prev) && (this.isDigit(next) || next == '-' || next == '+')) {
                        return true;
                    }
                }
            }
            return false;
        };
        DdlScanner.prototype.isDigit = function(X) {
            if (X >= '0' && X <= '9') {
                return true;
            }
            return false;
        };
        DdlScanner.prototype.isPunctation = function(s,position) {
            if (this.isDotInNumberLiteral(s,position)) {
                return false;
            }
            var X=s.charAt(position);
            if (X == '-' || X == '+') {
                try {
                    var previous=s.charAt(position - 1);
                    if (previous == 'E' || previous == 'e') {
                        var previousPrevious=s.charAt(position - 2);
                        if (this.isDigit(previousPrevious)) {
                            return false;
                        }
                    }
                }
                catch(e) {
                }
                return true;
            }
            if (X == ':' || X == ',' || X == '.' || X == '(' || X == ')' || X == '@' || X == '<' || X == '>' || X == '[' || X == ']' || X == '|' || X == '*' || X == '!') {
                return true;
            }
            return false;
        };
        DdlScanner.prototype.isWS = function(X) {
            if (X == ' ' || X == '\t' || this.isNL(X)) {
                return true;
            }
            return false;
        };
        DdlScanner.prototype.isCursor = function(X,Y,compl_pos) {
            if (X == compl_pos.m_line && Y == compl_pos.m_column) {
                return true;
            }
            return false;
        };
        DdlScanner.prototype.getNextToken = function(nestingLevel) {
            var nextToken=Scanner.prototype.getNextToken.call(this,nestingLevel);
            while (true) {
                var num=this.m_input[nextToken].m_num;
                if (num == this.comment1 || num == this.comment2 || num == this.nl) {
                    nextToken=Scanner.prototype.getNextToken.call(this,nestingLevel);
                }else{
                    return nextToken;
                }
            }
        };
        DdlScanner.prototype.getNextTokenIgnoringComments = function(tokenIndex) {
            return null;
        };
        DdlScanner.prototype.getPreviousTokenIgnoringComments = function(tokenIndex) {
            tokenIndex--;
            if (tokenIndex < 0) {
                return null;
            }
            var token=this.m_input[tokenIndex];
            while (Category.CAT_COMMENT===token.m_category) {
                tokenIndex--;
                if (tokenIndex < 0) {
                    return null;
                }
                token=this.m_input[tokenIndex];
            }
            return token;
        };
        return DdlScanner;
    }
);
define(
    'commonddl/DdlStatementMatchUtil',["rndrt/rnd","commonddl/astmodel/ContextDeclarationImpl","commonddl/astmodel/NamespaceDeclarationImpl"], //dependencies
    function (rnd,ContextDeclarationImpl,NamespaceDeclarationImpl) {
        var Utils = rnd.Utils;
        function DdlStatementMatchUtil() {
        };
        DdlStatementMatchUtil.CONTEXT_SEPR=".";
        DdlStatementMatchUtil.getAllStatements = function(statements) {
            var result=[];
            if (statements != null) {
                for (var stmtCount=0;stmtCount<statements.length;stmtCount++) {
                    var stmt=statements[stmtCount];
                    if (stmt instanceof ContextDeclarationImpl) {
                        var cd=stmt;
                        result=result.concat(DdlStatementMatchUtil.getAllStatements(cd.getStatements()));
                    }else{
                        result.push(stmt);
                    }
                }
            }
            return result;
        };
        DdlStatementMatchUtil.createEntityDeclarationFqnIndexMap = function(allEntityDeclarations) {
            var result={};
            for (var eCount=0;eCount<allEntityDeclarations.length;eCount++) {
                var e=allEntityDeclarations[eCount];
                var fqn=DdlStatementMatchUtil.getFqnInLowerCase(e);
                result[fqn]=e;
            }
            return result;
        };
        DdlStatementMatchUtil.getFqnInLowerCase = function(s) {
            var result=s.getName();
            var fqn=new rnd.StringBuffer();
            var context=s.eContainer();
            while (context instanceof ContextDeclarationImpl) {
                fqn.insert(0,(context).getName() + DdlStatementMatchUtil.CONTEXT_SEPR);
                context=context.eContainer();
            }
            result=fqn + result;
            return result.toLowerCase();
        };
        DdlStatementMatchUtil.getFullyQualifiedNameInLowerCase = function(name,entityByFqn) {
            if (name != null) {
                var result=name;
                if (Utils.stringContains(result, DdlStatementMatchUtil.CONTEXT_SEPR) == false) {
                    var lresult = DdlStatementMatchUtil.CONTEXT_SEPR + result.toLowerCase();
                    var keys=Object.keys(entityByFqn);
                    for (var i=0;i<keys.length;i++) {
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
            givenFqn=givenFqn.toLowerCase();
            var lastFoundFqn=null;
            var keys = Object.keys(entityByFqn);
            for (var i=0;i<keys.length;i++) {
                var key = keys[i];
                var lfqn=key.toLowerCase();
                if (Utils.stringEndsWith(lfqn, givenFqn)) {
                    if (lastFoundFqn != null) {
                        return null;
                    }
                    lastFoundFqn=key;
                }
            }
            if (lastFoundFqn == null) {
                var ns=DdlStatementMatchUtil.getNamespace(cu);
                if (ns != null && ns.length > 0 && Utils.stringStartsWith(givenFqn, ns)) {
                    var lfqn=givenFqn.substring(ns.length + 1);
                    var stmt=DdlStatementMatchUtil.findBestMatch(lfqn,entityByFqn,cu);
                    return stmt;
                }
                return null;
            }
            var stmt=entityByFqn[lastFoundFqn];
            return stmt;
        };
        DdlStatementMatchUtil.getNamespace = function(cu) {
            var stmts=cu.getStatements();
            for (var stmtCount=0;stmtCount<stmts.length;stmtCount++) {
                var stmt=stmts[stmtCount];
                if (stmt instanceof NamespaceDeclarationImpl) {
                    var s=stmt;
                    var name=s.getName();
                    return name;
                }
            }
            return null;
        };
        return DdlStatementMatchUtil;
    }
);
define(
    'commonddl/DdlRndParserApi',["commonddl/DdlScanner","rndrt/rnd","commonddl/DdlHaltedCallback",
        "commonddl/astmodel/ViewDefinitionImpl",
        "commonddl/DdlStatementMatchUtil","commonddl/astmodel/IAstFactory","commonddl/astmodel/ViewSelectImpl"
    ], //dependencies
    function (DdlScanner,rnd,DdlHaltedCallback,ViewDefinitionImpl,DdlStatementMatchUtil,IAstFactory,ViewSelectImpl) {
        var ByteCodeFactory = rnd.ByteCodeFactory;
        var Utils = rnd.Utils;

        function DdlParseSourceHaltedCallback() {

        }
        DdlParseSourceHaltedCallback.prototype.run=function() {

        };

        function DdlRndParserApi() {
        };
        DdlRndParserApi.DELTA_TIMEFRAME_TO_LAST_PARSE_TIMEOUT_RUN=5 * 1000;
        DdlRndParserApi.RULE_NAME_ANNOTATION_DEFINTIONS="annotationDefintions";
        DdlRndParserApi.prototype.byteCode=null;
        DdlRndParserApi.prototype.version="";
        DdlRndParserApi.prototype.supportedAnnotations=null;
        DdlRndParserApi.prototype.versionFactory=null;
        DdlRndParserApi.prototype.lastPadFileResolverUsedToGetByteCode=null;
        DdlRndParserApi.prototype.lastParseSourceHaltedTimeout=0;
        DdlRndParserApi.prototype.scannerDoesStrictSeparationOfTokensAtPlusMinus=false;
        DdlRndParserApi.prototype.scannerDoesStrictSeparationOfTokensAtSlash=false;
        DdlRndParserApi.prototype.scannerCreatesDotDotTokens=false;
        DdlRndParserApi.prototype.scannerCreatesEnumIdTokens=false;
        DdlRndParserApi.prototype.scannerCreatesColonFollowedByIdTokens=false;
        DdlRndParserApi.prototype.scannerCreatesPipePipeTokens=false;
        DdlRndParserApi.DdlRndParserApi1 = function(version,versionFactory) {
            var result = new DdlRndParserApi();
            result.version=version;
            result.versionFactory=versionFactory;
            return result;
        }
        DdlRndParserApi.DdlRndParserApi2 = function(version,versionFactory,scannerDoesStrictSeparationOfTokensAtPlusMinus) {
            var result = DdlRndParserApi.DdlRndParserApi1(version,versionFactory);
            result.scannerDoesStrictSeparationOfTokensAtPlusMinus=scannerDoesStrictSeparationOfTokensAtPlusMinus;
            return result;
        }
        DdlRndParserApi.DdlRndParserApi3 = function(version,versionFactory,scannerDoesStrictSeparationOfTokensAtPlusMinus,scannerDoesStrictSeparationOfTokensAtSlash) {
            var result = DdlRndParserApi.DdlRndParserApi2(version,versionFactory,scannerDoesStrictSeparationOfTokensAtPlusMinus);
            result.scannerDoesStrictSeparationOfTokensAtSlash=scannerDoesStrictSeparationOfTokensAtSlash;
            return result;
        }
        DdlRndParserApi.DdlRndParserApi4 = function(version,versionFactory,scannerDoesStrictSeparationOfTokensAtPlusMinus,scannerDoesStrictSeparationOfTokensAtSlash,scannerCreatesDotDotTokens) {
            var result = DdlRndParserApi.DdlRndParserApi3(version,versionFactory,scannerDoesStrictSeparationOfTokensAtPlusMinus,scannerDoesStrictSeparationOfTokensAtSlash);
            result.scannerCreatesDotDotTokens=scannerCreatesDotDotTokens;
            return result;
        }
        DdlRndParserApi.DdlRndParserApi5 = function(version,versionFactory,scannerDoesStrictSeparationOfTokensAtPlusMinus,scannerDoesStrictSeparationOfTokensAtSlash,scannerCreatesDotDotTokens,scannerCreatesEnumIdTokens) {
            var result = DdlRndParserApi.DdlRndParserApi4(version,versionFactory,scannerDoesStrictSeparationOfTokensAtPlusMinus,scannerDoesStrictSeparationOfTokensAtSlash,scannerCreatesDotDotTokens);
            result.scannerCreatesEnumIdTokens=scannerCreatesEnumIdTokens;
            return result;
        }
        DdlRndParserApi.DdlRndParserApi6 = function(version,versionFactory,scannerDoesStrictSeparationOfTokensAtPlusMinus,scannerDoesStrictSeparationOfTokensAtSlash,scannerCreatesDotDotTokens,scannerCreatesEnumIdTokens,scannerCreatedColonFollowedByIdTokens) {
            var result = DdlRndParserApi.DdlRndParserApi5(version,versionFactory,scannerDoesStrictSeparationOfTokensAtPlusMinus,scannerDoesStrictSeparationOfTokensAtSlash,scannerCreatesDotDotTokens,scannerCreatesEnumIdTokens);
            result.scannerCreatesColonFollowedByIdTokens=scannerCreatedColonFollowedByIdTokens;
            return result;
        }
        DdlRndParserApi.DdlRndParserApi7 = function(version,versionFactory,scannerDoesStrictSeparationOfTokensAtPlusMinus,scannerDoesStrictSeparationOfTokensAtSlash,scannerCreatesDotDotTokens,scannerCreatesEnumIdTokens,scannerCreatedColonFollowedByIdTokens,scannerCreatesPipePipeTokens) {
            var result = DdlRndParserApi.DdlRndParserApi6(version,versionFactory,scannerDoesStrictSeparationOfTokensAtPlusMinus,scannerDoesStrictSeparationOfTokensAtSlash,scannerCreatesDotDotTokens,scannerCreatesEnumIdTokens,scannerCreatedColonFollowedByIdTokens);
            result.scannerCreatesPipePipeTokens=scannerCreatesPipePipeTokens;
            return result;
        }
        DdlRndParserApi.prototype.getByteCode = function(resolver) {
            var stream=resolver.getPadFileContent(); var byteCode=null; try { byteCode=ByteCodeFactory.readByteCode(stream,resolver.getRelease(),true); this.lastPadFileResolverUsedToGetByteCode=resolver; } catch(e) { console.log(e); } return byteCode;
        };
        DdlRndParserApi.prototype.getCachedByteCode = function() {
            var localByteCode=this.byteCode;
            return localByteCode;
        };
        DdlRndParserApi.prototype.parseSource = function(resolver,source) {
            var localByteCode=this.byteCode;
            if (localByteCode == null) {
                localByteCode=this.getByteCode(resolver);
            }
            this.assertByteCodeVersion(localByteCode);
            var scanner=DdlScanner.DdlScanner6(localByteCode,this.scannerDoesStrictSeparationOfTokensAtPlusMinus,this.scannerDoesStrictSeparationOfTokensAtSlash,this.scannerCreatesDotDotTokens,this.scannerCreatesEnumIdTokens,this.scannerCreatesColonFollowedByIdTokens,this.scannerCreatesPipePipeTokens);
            var parser=this.versionFactory.createParser(this.version,localByteCode,scanner,null);
            this.initParser(parser);
            parser.TRACING_ENABLED=true;
            parser.m_resync=true;
            parser.setInput(source,new rnd.CursorPos(1,1,null),new rnd.CursorPos(-1,-1,null),null);
            this.initBeforeParseSource(parser);
            parser.run(rnd.CompletionModes.COMPL_MODE_NONE.getValue(),new DdlParseSourceHaltedCallback(),this.getCurrentHaltedInterval());
            this.byteCode=localByteCode;
            return parser.m_scanner.getInput();
        };

        DdlRndParserApi.prototype.parseTokens = function(resolver,tokens) {
            var localByteCode=this.byteCode;
            if (localByteCode == null) {
                localByteCode=this.getByteCode(resolver);
            }
            this.assertByteCodeVersion(localByteCode);
            var scanner=DdlScanner.DdlScanner6(localByteCode,this.scannerDoesStrictSeparationOfTokensAtPlusMinus,this.scannerDoesStrictSeparationOfTokensAtSlash,this.scannerCreatesDotDotTokens,this.scannerCreatesEnumIdTokens,this.scannerCreatesColonFollowedByIdTokens,this.scannerCreatesPipePipeTokens);
            var parser=this.versionFactory.createParser(this.version,localByteCode,scanner,null);
            this.initParser(parser);
            parser.TRACING_ENABLED=true;
            parser.m_resync=true;

            scanner.resetInput();
            parser.m_scanner.m_input = tokens;
            parser.resetInput();
            parser.onResetInput();

            this.initBeforeParseSource(parser);
            parser.run(rnd.CompletionModes.COMPL_MODE_NONE.getValue(),new DdlParseSourceHaltedCallback(),this.getCurrentHaltedInterval());
            this.byteCode=localByteCode;
            return parser.m_scanner.getInput();
        };
        DdlRndParserApi.prototype.initBeforeParseSource = function(parser) {
        };
        DdlRndParserApi.prototype.initParser = function(parser) {
            parser.init();
            parser.setPadFileResolverUsedToGetByteCode(this.lastPadFileResolverUsedToGetByteCode);
            parser.setDdlParser(this);
        };
        DdlRndParserApi.prototype.tokenize = function(resolver,source) {
            var localByteCode=this.byteCode;
            if (localByteCode == null) {
                localByteCode=this.getByteCode(this.versionFactory.createPadFileResolver(this.version));
            }
            this.assertByteCodeVersion(localByteCode);
            var scanner=DdlScanner.DdlScanner6(localByteCode,this.scannerDoesStrictSeparationOfTokensAtPlusMinus,this.scannerDoesStrictSeparationOfTokensAtSlash,this.scannerCreatesDotDotTokens,this.scannerCreatesEnumIdTokens,this.scannerCreatesColonFollowedByIdTokens,this.scannerCreatesPipePipeTokens);
            scanner.setInput(source,new rnd.CursorPos(1,1,null),new rnd.CursorPos(-1,-1,null));
            this.byteCode = localByteCode;
            return scanner.getInput();
        };
        DdlRndParserApi.prototype.getCodeCompletions = function(resolver,source,line,column,repositoryAccess) {
            var localByteCode=this.byteCode;
            try {
                if (localByteCode == null) {
                    localByteCode = this.getByteCode(resolver);
                    this.byteCode = localByteCode;
                }
                this.assertByteCodeVersion(localByteCode);
                var scanner = DdlScanner.DdlScanner6(localByteCode, this.scannerDoesStrictSeparationOfTokensAtPlusMinus, this.scannerDoesStrictSeparationOfTokensAtSlash, this.scannerCreatesDotDotTokens, this.scannerCreatesEnumIdTokens, this.scannerCreatesColonFollowedByIdTokens, this.scannerCreatesPipePipeTokens);
                var m_resolver = this.versionFactory.createParser(this.version, localByteCode, scanner, repositoryAccess);
                var cocoTriggerPos = new rnd.CursorPos(line, column, null);
                if (m_resolver.isAstNeededForCoCo()) {
                    var cu = this.parseAndGetAstInternal(resolver, repositoryAccess, source, null, null, cocoTriggerPos);
                    m_resolver.setCompilationUnitForCoCo(cu);
                }
                this.initParser(m_resolver);
                m_resolver.setInput(source, new rnd.CursorPos(1, 1, null), cocoTriggerPos, "");
                m_resolver.setSupportedAnnotations(this.getSupportedAnnotations());
                m_resolver.run(rnd.CompletionModes.COMPL_MODE_UNIQUE.getValue(), new DdlHaltedCallback(), this.getDefaultHaltedInterval());
                return m_resolver;
            }catch (e) {
                console.log(e.stack);
            }
            finally{
                this.byteCode=localByteCode;
            }
        };
        DdlRndParserApi.prototype.getTypedCompletions4 = function(resolver,source,line,column) {
            var m_resolver=this.getCodeCompletions(resolver,source,line,column,null);
            if (m_resolver == null) {
                return [];
            }
            var completionNames=m_resolver.getTypedCompletionNames(m_resolver);
            return completionNames;
        };
        DdlRndParserApi.prototype.getTypedCompletions5 = function(resolver,repositoryAccess,source,line,column) {
            var m_resolver=this.getCodeCompletions(resolver,source,line,column,repositoryAccess);
            if (m_resolver == null) {
                return [];
            }
            var completionNames=m_resolver.getTypedCompletionNames(m_resolver);
            return completionNames;
        };
        DdlRndParserApi.prototype.getTypedCodeCompletions4 = function(resolver,source,line,column) {
            var m_resolver=this.getCodeCompletions(resolver,source,line,column,null);
            if (m_resolver == null) {
                return [];
            }
            var completionNames=m_resolver.getTypedCodeCompletionNames(m_resolver);
            return completionNames;
        };
        DdlRndParserApi.prototype.getTypedCodeCompletions5 = function(resolver,repositoryAccess,source,line,column) {
            var m_resolver=this.getCodeCompletions(resolver,source,line,column,repositoryAccess);
            if (m_resolver == null) {
                return [];
            }
            var completionNames=m_resolver.getTypedCodeCompletionNames(m_resolver);
            return completionNames;
        };
        DdlRndParserApi.prototype.getCompletions4 = function(resolver,source,line,column) {
            var m_resolver=this.getCodeCompletions(resolver,source,line,column,null);
            if (m_resolver == null) {
                return [];
            }
            var completionNames=m_resolver.getCodeCompletionNames(m_resolver);
            return completionNames;
        };
        DdlRndParserApi.prototype.getCompletions5 = function(resolver,repositoryAccess,source,line,column) {
            var m_resolver=this.getCodeCompletions(resolver,source,line,column,repositoryAccess);
            if (m_resolver == null) {
                return [];
            }
            var completionNames=m_resolver.getCodeCompletionNames(m_resolver);
            return completionNames;
        };
        DdlRndParserApi.prototype.getCurrentHaltedInterval = function() {
            if (this.lastParseSourceHaltedTimeout > 0 && System.currentTimeMillis() - this.lastParseSourceHaltedTimeout < DdlRndParserApi.DELTA_TIMEFRAME_TO_LAST_PARSE_TIMEOUT_RUN) {
                return 1000;
            }
            return this.getDefaultHaltedInterval();
        };
        DdlRndParserApi.prototype.getDefaultHaltedInterval = function() {
            return 100 * 1000;
        };
        DdlRndParserApi.prototype.parseAndGetAst3 = function(resolver,source,visitor) {
            return this.parseAndGetAstInternal(resolver,null,source,visitor,null,null);
        };
        DdlRndParserApi.prototype.parseAndGetAst4 = function(resolver,repositoryAccess,source,visitor) {
            return this.parseAndGetAstInternal(resolver,repositoryAccess,source,visitor,null,null);
        };
        DdlRndParserApi.prototype.parseAndGetAstInternal = function(resolver,repositoryAccess,source,visitor,startRule,cocoTriggerPos) {
            var localByteCode=this.byteCode;
            if (localByteCode == null) {
                localByteCode=this.getByteCode(resolver);
            }
            this.assertByteCodeVersion(localByteCode);
            var scanner=DdlScanner.DdlScanner6(localByteCode,this.scannerDoesStrictSeparationOfTokensAtPlusMinus,this.scannerDoesStrictSeparationOfTokensAtSlash,this.scannerCreatesDotDotTokens,this.scannerCreatesEnumIdTokens,this.scannerCreatesColonFollowedByIdTokens,this.scannerCreatesPipePipeTokens);
            var m_resolver=this.versionFactory.createParser(this.version,localByteCode,scanner,null);
            if (startRule != null) {
                m_resolver.setStartRuleName(startRule);
            }
            if (cocoTriggerPos != null) {
                m_resolver.setTriggerPosForCoCo(cocoTriggerPos);
            }
            this.initParser(m_resolver);
            m_resolver.setInput(source,new rnd.CursorPos(1,1,null),new rnd.CursorPos(-1,-1,null),null);
            m_resolver.visitor=visitor;
            m_resolver.setisActionDisabledDuringErrorReplay(false);
            m_resolver.run(rnd.CompletionModes.COMPL_MODE_GEN.getValue(),new DdlHaltedCallback(),this.getDefaultHaltedInterval());
            this.byteCode=localByteCode;
            var compilationUnit=m_resolver.compilationUnit;
            if (compilationUnit == null) {
                return null;
            }
            compilationUnit.setParsedSource(source);
            compilationUnit.setTokenList(m_resolver.m_scanner.getInput());
            var statements=compilationUnit.getStatements();
            if (statements != null) {
                for (var statementCount=0;statementCount<statements.length;statementCount++) {
                    var statement=statements[statementCount];
                    if (statement instanceof ViewDefinitionImpl) {
                        if (m_resolver.currentSelect != null && m_resolver.lastFoundDataSources.length > 1) {
                            var ds=this.getDataSourceForStack(m_resolver,m_resolver.lastFoundDataSources);
                            m_resolver.currentSelect.setFrom(ds);
                        }
                    }
                }
            }
            compilationUnit.setRepositoryAccess(repositoryAccess);
            this.calculateAssociationTargetReferences(m_resolver.allAssociationDeclarations,m_resolver.allEntityDeclarations,compilationUnit);
            return compilationUnit;
        };
        DdlRndParserApi.prototype.calculateAssociationTargetReferences = function(allAssociationDeclarations,allEntityDeclarations,cu) {
            var proxyStatementByFqnTargetName={};
            var entityByFqn=DdlStatementMatchUtil.createEntityDeclarationFqnIndexMap(allEntityDeclarations);
            for (var assocCount=0;assocCount<allAssociationDeclarations.length;assocCount++) {
                var assoc=allAssociationDeclarations[assocCount];
                try {
                    var fqn=DdlStatementMatchUtil.getFullyQualifiedNameInLowerCase(assoc.getTargetEntityName(),entityByFqn);
                    var entity=entityByFqn[fqn];
                    if (entity == null) {
                        entity=DdlStatementMatchUtil.findBestMatch(fqn,entityByFqn,cu);
                    }
                    var existingProxy=proxyStatementByFqnTargetName[fqn];
                    if (existingProxy != null) {
                        assoc.setTargetProxy(existingProxy);
                    }else{
                        var proxy=IAstFactory.eINSTANCE.createProxyStatement();
                        if (entity != null) {
                            proxy.setTarget(entity);
                            var targetEntityPath=assoc.getTargetEntityPath();
                            proxy.setNamePathRef(targetEntityPath);
                        }else{
                            var targetEntityPath=assoc.getTargetEntityPath();
                            proxy.setNamePathRef(targetEntityPath);
                        }
                        proxy.setCompilationUnit(cu);
                        assoc.setTargetProxy(proxy);
                        proxyStatementByFqnTargetName[fqn]=proxy;
                    }
                    if (assoc.eContainer() instanceof ViewSelectImpl) {
                        var ds=IAstFactory.eINSTANCE.createDataSource();
                        var targetPath=assoc.getTargetEntityPath();
                        var targetPathCopy=targetPath;//EcoreUtil.copy(targetPath);
                        ds.setNamePathExpression(targetPathCopy);
                        var entries=targetPath.getEntries();
                        var firstToken=entries[0].getNameToken();
                        var lastToken=entries[entries.length - 1].getNameToken();
                        var tokenFirstIndex=0;
                        var tokenLastIndex=0;
                        var tokens=cu.getTokenList();
                        for (var i=assoc.getStartTokenIndex() + 1;i < tokens.length;i++) {
                            if (firstToken == tokens[i]) {
                                tokenFirstIndex=i;
                            }
                            if (lastToken == tokens[i]) {
                                tokenLastIndex=i;
                                break;
                            }
                        }
                        ds.setStartTokenIndex(tokenFirstIndex);
                        ds.setEndTokenIndex(tokenLastIndex);
                        var nameToken=assoc.getNameToken();
                        if ((nameToken != null) && (Utils.stringCompareToIgnoreCase(nameToken.getM_lexem(), targetPath.getPathString(false)) != 0)) {
                            ds.setAliasToken(nameToken);
                            for (var j=tokenLastIndex + 1;j < tokens.length;j++) {
                                if (nameToken==tokens[j]) {
                                    tokenLastIndex=j;
                                    break;
                                }
                            }
                            ds.setEndTokenIndex(tokenLastIndex);
                        }
                        assoc.setTargetDataSource(ds);
                    }
                }
                catch(e) {
                    //silently ignored
                    //console.log(e.stack);
                }
            }
        };
        DdlRndParserApi.prototype.getDataSourceForStack = function(resolver,lastFoundDataSources) {
            if (lastFoundDataSources.length == 0) {
                return null;
            }
            if (lastFoundDataSources.length == 1) {
                return lastFoundDataSources.pop();
            }
            var left=lastFoundDataSources.pop();
            while (true) {
                var right=lastFoundDataSources.pop();
                left=resolver.viewparser_leftjoinDatasource(left,right,null);
                if (lastFoundDataSources.length == 0) {
                    break;
                }
            }
            return left;
        };
        DdlRndParserApi.prototype.parseAndGetAst2 = function(resolver,source) {
            return this.parseAndGetAstInternal(resolver,null,source,null,null,null);
        };
        DdlRndParserApi.prototype.parseAndGetAst3 = function(resolver,repositoryAccess,source) {
            return this.parseAndGetAstInternal(resolver,repositoryAccess,source,null,null,null);
        };
        DdlRndParserApi.prototype.assertByteCodeVersion = function(bc) {

        };
        DdlRndParserApi.prototype.setRepositoryAccess = function(access) {
        };
        DdlRndParserApi.prototype.getVersion = function() {
            return this.version;
        };
        DdlRndParserApi.prototype.setSupportedAnnotations = function(annots) {
            this.supportedAnnotations=annots;
        };
        DdlRndParserApi.prototype.getSupportedAnnotations = function() {
            return this.supportedAnnotations;
        };
        DdlRndParserApi.prototype.parseAnnotationDefinition = function(resolver,source) {
            return this.parseAndGetAstInternal(resolver,null,source,null,DdlRndParserApi.RULE_NAME_ANNOTATION_DEFINTIONS,null);
        };
        DdlRndParserApi.prototype.lastParseSourceRunHadTimeout = function() {
            if (System.currentTimeMillis() - this.lastParseSourceHaltedTimeout < DdlRndParserApi.DELTA_TIMEFRAME_TO_LAST_PARSE_TIMEOUT_RUN) {
                return true;
            }
            return false;
        };
        return DdlRndParserApi;
    }
);
define(
    'commonddl/DdlParserFactoryBackendVersion',["commonddl/DdlRndParserApi"], //dependencies
    function (DdlRndParserApi) {
        DdlParserFactoryBackendVersion.prototype = Object.create(null);
        DdlParserFactoryBackendVersion.DDL_CONTENT_TYPE_XML="application/vnd.sap.adt.ddl.ddlParserInfo.v1+xml";
        DdlParserFactoryBackendVersion.DDL_CONTENT_TYPE_TEXT="text/plain";
        DdlParserFactoryBackendVersion.DDL_PROPERTY_PARSER_VERSION="ddlParserVersion";
        DdlParserFactoryBackendVersion.SUPPORTED_ANNOTATION_NAME="supportedAnnotationName";
        DdlParserFactoryBackendVersion.xmlPropertiesByProject={};
        DdlParserFactoryBackendVersion.parserByProject={};
        DdlParserFactoryBackendVersion.prototype.versionFactory=null;
        function DdlParserFactoryBackendVersion() {
        }

        DdlParserFactoryBackendVersion.prototype.getVersionFactory = function() {
            if (this.versionFactory == null) {
                this.versionFactory=this.createVersionFactory();
            }
            return this.versionFactory;
        };
        DdlParserFactoryBackendVersion.prototype.getOrCreateParser = function(project) {
            if (DdlParserFactoryBackendVersion.parserByProject[project]) {
                return DdlParserFactoryBackendVersion.parserByProject[project];
            }
            var version=this.mapToClientVersion(project);
            var parser=this.createParser(version);
            var supportedAnnotations=this.getSupportedAnnotations3(project,parser,version);
            parser.setSupportedAnnotations(supportedAnnotations);
            if (project != null) {
                DdlParserFactoryBackendVersion.parserByProject[project]=parser;
            }
            return parser;
        };
        DdlParserFactoryBackendVersion.prototype.getSupportedAnnotations3 = function(project,parser,version) {
            var supportedAnnotations=null;
            if (DdlParserFactoryBackendVersion.xmlPropertiesByProject[project]) {
                var info=DdlParserFactoryBackendVersion.xmlPropertiesByProject[project];
                supportedAnnotations=this.getSupportedAnnotations3(info,parser,project);
            }
            return supportedAnnotations;
        };
        DdlParserFactoryBackendVersion.prototype.mapToClientVersion = function(project) {
        };
        DdlParserFactoryBackendVersion.prototype.createVersionFactory = function() {
        };
        DdlParserFactoryBackendVersion.prototype.releaseParser = function(project) {
            delete DdlParserFactoryBackendVersion.parserByProject[project];
            delete DdlParserFactoryBackendVersion.xmlPropertiesByProject[project];
        };
        DdlParserFactoryBackendVersion.prototype.getSupportedAnnotations3 = function(info,iDdlParser,project) {
            if (info == null) {
                return null;
            }
            var parseAnnotationDefinition=null;
            var source=info.annotationDefinitions;
            var version=DdlParserFactoryBackendVersion.getParserVersion(project);
            var resolver=this.createResolver(version);
            parseAnnotationDefinition=iDdlParser.parseAnnotationDefinition(resolver,source);
            if (parseAnnotationDefinition == null || parseAnnotationDefinition.getStatements() == null || parseAnnotationDefinition.getStatements().length == 0) {
                var projectName=project.getName();
                Activator.trace("DDL annotations for " + projectName + " couldn't be parsed! All features related to annoations will not work! ");
            }
            return parseAnnotationDefinition;
        };

        DdlParserFactoryBackendVersion.prototype.createParser = function(version) {
            return DdlRndParserApi.DdlRndParserApi7(version,this.getVersionFactory(),true,true,false,false,false,false);
        };
        DdlParserFactoryBackendVersion.prototype.createResolver = function(version) {
            return this.getVersionFactory().createPadFileResolver(version);
        };
        DdlParserFactoryBackendVersion.getParserVersion = function(project) {
            var parserVersion=null;
            if (DdlParserFactoryBackendVersion.xmlPropertiesByProject[project]) {
                var info=DdlParserFactoryBackendVersion.xmlPropertiesByProject[project];
                parserVersion=info.version;
            }
            return parserVersion;
        };
        DdlParserFactoryBackendVersion.isPropertiesForProjectExist = function(project) {
            var info=DdlParserFactoryBackendVersion.xmlPropertiesByProject[project];
            if (info != null) {
                if (info instanceof DdlErrorneousParserBackendInfo) {
                    var errInfo=info;
                    if (System.currentTimeMillis() - errInfo.timestamp > 30 * 1000) {
                        return false;
                    }
                }
                return true;
            }
            return false;
        };
        return DdlParserFactoryBackendVersion;
    }
);
define(
    'commonddl/DdlSourceColoringCacheHelper',["rndrt/rnd"],
    function (rnd) {
        DdlSourceColoringCacheHelper.prototype = Object.create(null);
        function DdlSourceColoringCacheHelper() {
        }
        
        DdlSourceColoringCacheHelper.prototype.convertTokensToLineCache = function(tokens) {
            var tokensByLine = {};
            for (var i=0;i<tokens.length;i++) {
                var token = tokens[i];
                if ((token.m_category == rnd.Category.CAT_COMMENT || token.m_category == rnd.Category.CAT_LITERAL ) && token.m_lexem.indexOf("\n") >= 0) {
                    var literalOrBlockCommentLines = token.m_lexem.split("\n");
                    var cacheIndex = token.m_line-1;
                    var newOffset = token.m_offset;
                    var newColumn = token.m_column;
                    
                    for (var j=0;j<literalOrBlockCommentLines.length;j++) {
                        if (j>0) {
                            newOffset = newOffset + literalOrBlockCommentLines[j-1].length;
                            newColumn = 1;
                        }
                        
                        var tl = tokensByLine[cacheIndex];  
                        if (tl==null) {
                            tl=[];
                            tokensByLine[cacheIndex]=tl;
                        }
                        var copy = new rnd.Token(token.m_num, literalOrBlockCommentLines[j], token.m_category,
                                             newOffset, cacheIndex+1, newColumn, token.m_start_of_line, token.m_err_state);
                        tl.push(copy);
                        cacheIndex++;
                    }
                    continue;
                }
                var row = token.m_line-1;
                var tl = tokensByLine[row];
                if (tl==null) {
                    tl=[];
                    tokensByLine[row]=tl;
                }
                tl.push(token);
            }
            return tokensByLine;
        };
        
        
        return DdlSourceColoringCacheHelper;
    }
);
define(
    'commonddl/WordFormattingEnum',[], //dependencies
    function () {
        function WordFormattingEnum(val) {
            this.m_value = val;
        }

        WordFormattingEnum.UpperCase = new WordFormattingEnum(0);
        WordFormattingEnum.LowerCase = new WordFormattingEnum(1);
        WordFormattingEnum.CamelCase = new WordFormattingEnum(2);
        WordFormattingEnum.NoChange = new WordFormattingEnum(3);

        //public
        WordFormattingEnum.prototype.getValue = function () {
            return this.m_value;
        };
        return WordFormattingEnum;

    }
);
define(
    'commonddl/DdlSourceFormattingStyle',["commonddl/WordFormattingEnum"], //dependencies
    function (WordFormattingEnum) {
        function DdlSourceFormattingStyle() {
        };
        DdlSourceFormattingStyle.prototype.formattingKeyword=WordFormattingEnum.LowerCase;
        DdlSourceFormattingStyle.prototype.formattingIdentifier=WordFormattingEnum.NoChange;
        DdlSourceFormattingStyle.DdlSourceFormattingStyle1 = function(keywordFormatting,identifierFormatting) {
            var result = new DdlSourceFormattingStyle();
            result.formattingKeyword=keywordFormatting;
            result.formattingIdentifier=identifierFormatting;
            return result;
        }
        DdlSourceFormattingStyle.DdlSourceFormattingStyle2 = function() {
            var result = new DdlSourceFormattingStyle();
            return result;
        }
        DdlSourceFormattingStyle.prototype.setKeywordFormatting = function(keywordFormatting) {
            this.formattingKeyword=keywordFormatting;
        };
        DdlSourceFormattingStyle.prototype.getKeywordFormatting = function() {
            return this.formattingKeyword;
        };
        DdlSourceFormattingStyle.prototype.setIdentifierFormatting = function(identifierFormatting) {
            this.formattingIdentifier=identifierFormatting;
        };
        DdlSourceFormattingStyle.prototype.getIdentifierFormatting = function() {
            return this.formattingIdentifier;
        };
        DdlSourceFormattingStyle.convertToCamelCase = function(text) {
            var textConverted=text.substring(0,1).toUpperCase() + text.substring(1,text.length).toLowerCase();
            return textConverted;
        };
        return DdlSourceFormattingStyle;
    }
);
define(
    'commonddl/DdlTypeUsagePayload',[], //dependencies
    function () {
        function DdlTypeUsagePayload() {
            this.isDdlTypeUsage = true;// please don't remove , is used in AbapDdlTokenizerWithWorker
        }
        return DdlTypeUsagePayload;
    }
);
define(
    'commonddl/PredefinedDataType',[], //dependencies
    function () {

        function PredefinedDataType() {
        }
        PredefinedDataType.prototype.name = "";
        PredefinedDataType.prototype.pattern = "";
        PredefinedDataType.prototype.description = "";
        return PredefinedDataType;
    }
);
define(
    'commonddl/SapViewFormatter',["commonddl/DdlSourceFormattingStyle","rndrt/rnd","commonddl/SapDdlConstants","commonddl/AnnotationPayload","commonddl/WordFormattingEnum","commonddl/AnnotationUtil"], //dependencies
    function (DdlSourceFormattingStyle,rnd,SapDdlConstants,AnnotationPayload,WordFormattingEnum,AnnotationUtil) {
        var Utils = rnd.Utils;

        function SapViewFormatter() {
        };
        SapViewFormatter.QUOTATION_MARK="\"";
        SapViewFormatter.prototype.insertions={};
        SapViewFormatter.prototype.processedFrames=[];
        SapViewFormatter.prototype.formatingStyle=new DdlSourceFormattingStyle();
        SapViewFormatter.prototype.getFormatingStyle = function() {
            return this.formatingStyle;
        };
        SapViewFormatter.prototype.setFormatingStyle = function(simpleFormatingStyle) {
            if (simpleFormatingStyle != null) {
                this.formatingStyle=simpleFormatingStyle;
            }
        };
        SapViewFormatter.prototype.format = function(source,parser,resolver) {
            var tokens=this.getSourceTokens(source,parser,resolver);
            if (this.hasErrorState(tokens)) {
                throw new OperationCanceledException();
            }
            this.allAnnotations=null;
            var result=new rnd.StringBuffer(source);
            var token;
            for (var i=tokens.length - 1;i >= 0;i--) {
                token=tokens[i];
                if (SapDdlConstants.EOF===token.m_lexem) {
                    continue;
                }
                var textConverted=token.m_lexem;
                if (this.isKeyword1(token)) {
                    textConverted=this.formatBasedOnFormattingSettings(textConverted,this.formatingStyle.getKeywordFormatting());
                }else if (this.isIdentifier(token)) {
                    if (this.isAnnotation(token) == true) {
                        textConverted=this.formatAnnotation(textConverted,parser);
                    }else{
                        textConverted=this.formatIdentifier(token);
                    }
                }
                var start=token.m_offset;
                var end=start + token.m_lexem.length;
                result.replace(start,end,textConverted);
            }
            return result.toString();
        };
        SapViewFormatter.prototype.formatAnnotation = function(textConverted,parser) {
            try {
                if (parser == null || textConverted == null) {
                    return textConverted;
                }
                var annWordsSupported=this.getSuppoetedAnnotationWords(parser);
                for (var annWordCount=0;annWordCount<annWordsSupported.length;annWordCount++) {
                    var annWord=annWordsSupported[annWordCount];
                    if (Utils.stringEqualsIgnoreCase(annWord, textConverted)) {
                        return annWord;
                    }
                }
            }
            catch(e) {
                console.log(e.stack);
            }
            return textConverted;
        };
        SapViewFormatter.prototype.formatIdentifier = function(token) {
            var textConverted=token.m_lexem;
            if (this.beginsWithQuotationMark(token) == false) {
                textConverted=this.formatBasedOnFormattingSettings(textConverted,this.formatingStyle.getIdentifierFormatting());
            }else{
                textConverted=this.formatBasedOnFormattingSettings(textConverted,WordFormattingEnum.UpperCase);
            }
            return textConverted;
        };
        SapViewFormatter.prototype.getSuppoetedAnnotationWords = function(parser) {
            var annsMap=AnnotationUtil.getAnnotationsAsStringList1(parser.getSupportedAnnotations());
            var anns=Object.keys(annsMap);
            var annWords=[];
            var delimiter="\\.";
            for (var annCount=0;annCount<anns.length;annCount++) {
                var ann=anns[annCount];
                var words=ann.split(delimiter);
                for (var wordCount=0;wordCount<words.length;wordCount++) {
                    var word=words[wordCount];
                    annWords.push(word);
                }
            }
            return annWords;
        };
        SapViewFormatter.prototype.allAnnotations=null;
        SapViewFormatter.prototype.getSourceTokens = function(source,parser,resolver) {
            return parser.parseSource(resolver,source);
        };
        SapViewFormatter.prototype.isAnnotation = function(token) {
            if (token == null) {
                return false;
            }
            var payload=token.getPayload();
            if (payload instanceof AnnotationPayload) {
                return true;
            }
            return false;
        };
        SapViewFormatter.prototype.beginsWithQuotationMark = function(token) {
            if (token == null) {
                return false;
            }
            var index=token.m_lexem.indexOf(SapViewFormatter.QUOTATION_MARK);
            if (index == 0) {
                return true;
            }
            return false;
        };
        SapViewFormatter.prototype.formatBasedOnFormattingSettings = function(textToBeConverted,fe) {
            if (textToBeConverted == null) {
                return null;
            }
            if (fe != null) {
                if (fe===WordFormattingEnum.UpperCase) {
                    textToBeConverted=textToBeConverted.toUpperCase();
                }else if (fe===WordFormattingEnum.LowerCase) {
                    textToBeConverted=textToBeConverted.toLowerCase();
                }else if (fe===WordFormattingEnum.CamelCase) {
                    textToBeConverted=DdlSourceFormattingStyle.convertToCamelCase(textToBeConverted);
                }
            }
            return textToBeConverted;
        };
        SapViewFormatter.prototype.hasErrorState = function(tokens) {
            for (var tokenCount=0;tokenCount<tokens.length;tokenCount++) {
                var token=tokens[tokenCount];
                if (!(rnd.ErrorState.Correct===token.m_err_state)) {
                    return true;
                }
            }
            return false;
        };
        SapViewFormatter.prototype.isKeyword3 = function(tokens,i,keywords) {
            var result=true;
            for (var kCount=0;kCount<keywords.length;kCount++) {
                var k=keywords[kCount];
                var t=tokens[i];
                if (Utils.stringEqualsIgnoreCase(k, t.m_lexem) && this.isKeyword1(t)) {
                    i++;
                }else{
                    result=false;
                    break;
                }
            }
            return result;
        };
        SapViewFormatter.prototype.addLineBreak = function(result,identLevel) {
            result.append("\r\n");
            for (var i=0;i < identLevel;i++) {
                result.append("    ");
            }
        };
        SapViewFormatter.prototype.isIdentifier = function(t) {
            if (rnd.Category.CAT_IDENTIFIER===t.m_category) {
                return true;
            }
            return false;
        };
        SapViewFormatter.prototype.isKeyword1 = function(t) {
            if (t != null && rnd.Category.CAT_KEYWORD===t.m_category) {
                return true;
            }
            return false;
        };
        SapViewFormatter.prototype.isOperator = function(t) {
            if (t != null && rnd.Category.CAT_OPERATOR===t.m_category) {
                return true;
            }
            return false;
        };
        SapViewFormatter.prototype.isLiteral = function(t) {
            if (t != null && rnd.Category.CAT_LITERAL===t.m_category) {
                return true;
            }
            return false;
        };
        SapViewFormatter.prototype.isComparator = function(t) {
            var SQL_COMPARATORS=["=","<",">","~=","!=","^=","<="," >=","IS NULL","IS NOT NULL","LIKE","NOT LIKE","BETWEEN","IN"];
            var comparatorsSQL=SQL_COMPARATORS;
            if (t == null) {
                return false;
            }
            var str=t.m_lexem.toUpperCase();
            if (Utils.arrayContains(comparatorsSQL, str)) {
                return true;
            }
            return false;
        };
        return SapViewFormatter;
    }
);
define(
    'commonddl/ace/BaseEditorNavigationHandler',["rndrt/rnd"],
    function (rnd) {
        var Utils = rnd.Utils;

        function BaseEditorNavigationHandler(editor, parse, resolve, Rang) {
            this.aceEditor = editor;
            this.Range = Rang;
            this.ctrlClicked = false;
            this.parser = parse;
            this.resolver = resolve;
        }

        /**
         * intended to be sub classed
         * @param {AceEditor} aceEditor
         * @param {int} row
         * @param {int} startColumn
         * @param {int} endColumn
         */
        BaseEditorNavigationHandler.prototype.doNavigate = function (aceEditor, row, startColumn, endColumn) {
        };

        /**
         * helper function to navigate within the same editor to a given range
         * @param {AceEditor} aceEditor instance of ACE editor
         * @param startRow
         * @param startColumn
         * @param endRow
         * @param endColumn
         */
        BaseEditorNavigationHandler.prototype.navigateToSameFile = function (aceEditor, startRow, startColumn, endRow, endColumn) {
            setTimeout(function () {
                aceEditor.exitMultiSelectMode();
                var currentSession = aceEditor.getSession();
                currentSession.selection.moveTo(startRow, startColumn);
                currentSession.selection.selectTo(endRow, endColumn);
            }, 500);
        };

        /**
         * helper function to open a new editor and navigate to a given range
         * @param url
         * @param context
         * @param startRow
         * @param startColumn
         * @param endRow
         * @param endColumn
         */
        BaseEditorNavigationHandler.prototype.openAndNavigateToDifferentFile = function (url, context, startRow, startColumn, endRow, endColumn) {
            var loFileService = context.service.filesystem.documentProvider;
            var loEditorService = context.service.editor;
            var loContentService = context.service.content;
            loFileService.getDocument(url).then(function (ioDocument) {
                loEditorService.getDefaultEditor(ioDocument).then(function (oEditor) {
                    loContentService.open(ioDocument, oEditor.service).then(function () {
                        loContentService.getCurrentEditor().then(function (ioCurrentEditor) {
                            ioCurrentEditor.gotoLine(startRow, startColumn, true);
                            //select name token
                            ioCurrentEditor.getUI5Editor().then(function (ed) {
                                var currentSession = ed.getSession();
                                currentSession.selection.moveTo(startRow, startColumn);
                                currentSession.selection.selectTo(endRow, endColumn);
                            });
                        });
                    });
                });
            });
        };

        BaseEditorNavigationHandler.prototype.registerKeyboardShortcut = function () {
            var me = this;
            this.aceEditor.commands.addCommand({
                name: 'navigateCommand',
                bindKey: {win: 'F3', mac: 'F3'},
                exec: function (editor) {
                    var sel = editor.selection.getCursor();
                    if (sel != null) {
                        me.doNavigate(editor, sel.row, sel.column, sel.column);
                    }
                }
            });
        };

        BaseEditorNavigationHandler.prototype.registerEventListeners = function () {
            var me = this;
            this.aceEditor.on('click', function (event, locationData) {
                if (me.ctrlClicked == true) {
                    //navigate
                    var sess = me.aceEditor.getSession();
                    var markers = sess.getMarkers();
                    var m = markers[me.lastMarker];
                    if (m != null && m.id === me.lastMarker) {
                        me.doNavigate(me.aceEditor, m.range.start.row, m.range.start.column, m.range.end.column);
                        return;
                    }
                }
            });

            this.aceEditor.container.addEventListener('keydown', function (event, locationData) {
                if (me.ctrlClicked != true) {
                    if (event.keyCode == 17 || event.keyCode === 91) {
                        //console.log("ctrl clicked");
                        me.ctrlClicked = true;
                    }
                }
            }, false);
            this.aceEditor.container.addEventListener('keyup', function (event, locationData) {
                if (event.keyCode == 17 || event.keyCode === 91) {
                    //console.log("ctrl released");
                    me.ctrlClicked = false;
                    me.removeLastMarker();
                }
            }, false);

            this.aceEditor.on("mousemove", function (event) {
                if (me.ctrlClicked == true) {
                    var position = event.getDocumentPosition();
                    //access syntax coloring result to identify the word to be underlined
                    var sess = me.aceEditor.getSession();
                    var lineTokens = sess.bgTokenizer.lines[position.row];
                    if (lineTokens != null) {
                        var cols = me.getWordStartEndColumns(lineTokens, position.column);
                        //if (me.lastMarker)
                        //    return;
                        if (cols != null) {
                            var markerDeco = "ace_active-line";
                            me.removeLastMarker();
                            if (document.getElementById('editor')==null) { // aha, HANA WebIDE scenario
                                if (document.cachedUserPreferences !== undefined) {
                                    markerDeco = "sapHWISelectionPointer sapHWISelectionUnderline";
                                    if (document.cachedUserPreferences.hasOwnProperty("sapHWIEditorBackground")) {
                                       if ( document.cachedUserPreferences.sapHWIEditorBackground === "dark" ) {
                                           markerDeco = "sapHWISelectionPointer sapHWISelectionUnderlineWhite";    
                                       }
                                    }
                                    me.lastMarker = sess.addMarker(new me.Range(position.row, cols.startColumn, position.row, cols.endColumn), markerDeco, "text");
                                }
                            } else {
                                me.lastMarker = sess.addMarker(new me.Range(position.row, cols.startColumn, position.row, cols.endColumn), markerDeco, "text");
                            }
                        }
                    }

                }
            });
        };

        BaseEditorNavigationHandler.prototype.getWordStartEndColumns = function (aceTokens, column) {
            var col = 0;
            for (var i = 0; i < aceTokens.length; i++) {
                var tok = aceTokens[i];
                var end = col + tok.value.length;
                if (this.isAceTokenNavigable(tok) && column >= col && column <= end) { //no navigation support for keywords
                    var deltaSpaces = tok.value.length - Utils.stringTrim(tok.value).length;
                    return {startColumn: col + deltaSpaces, endColumn: end};
                }
                col = end;
            }
        };

        BaseEditorNavigationHandler.prototype.isAceTokenNavigable = function (aceToken) {
            if (aceToken.type === "keyword" || aceToken.type==="comment") {
                return false;
            }
            var v = Utils.stringTrim(aceToken.value);
            if (this.isNumber(v)) {
                return false;
            }
            return true;
        };

        BaseEditorNavigationHandler.prototype.isNumber = function(value) {
            if (parseInt(value) >= 0) {
                return true;
            }
            return false;
        };

        BaseEditorNavigationHandler.prototype.removeLastMarker = function () {
            //remove last marker
            var sess = this.aceEditor.getSession();
            if (this.lastMarker) {
                sess.removeMarker(this.lastMarker);
                this.lastMarker = null;
            }
        };

        return BaseEditorNavigationHandler;
    }
);

define(
    'commonddl/ace/BaseDdlTokenizerWithWorker',["rndrt/rnd"],
    function (rnd) {
        var Utils = rnd.Utils;

        function BaseDdlTokenizerWithWorker(Range, padFilePath, myName) {
            this.tokensByLine = {}; // map: key= line number; value = token list for given line
            this.Range = Range;
            this.padFilePath = padFilePath;
            this.myName = myName;
            this.createWorker();
            this.tokensByLineInvalid = false;
        }

        BaseDdlTokenizerWithWorker.prototype.getTokenizerPath = function () {
            var scripts = document.getElementsByTagName("script");
            for (var q = 0; q < scripts.length; ++q) {
                var s = scripts[q].src;
                if (Utils.stringEndsWith(s, this.myName)) { //find path to start worker
                    var lind = s.lastIndexOf("/");
                    var p = s.substring(0, lind);
                    return p;
                }
            }
            return "";
        };

        BaseDdlTokenizerWithWorker.prototype.createWorker = function () {
            var that = this;
            var workerPath = this.getTokenizerPath() + "/parserWorker.js";
            this.worker = new Worker(workerPath);
            this.worker.addEventListener('message', function (e) {
                if (e.data != null) {
                    if (e.data === "notyetloaded") {
                        that.triggerParseRequestViaWorker();
                    } else {
                        that.tokensByLine = e.data;
                        //re-trigger coloring for visible area
                        var rend = that.aceEditor.renderer;
                        var sess = that.aceEditor.getSession();
                        // delete line cache so that - *DdlTokenizer.getLineTokens is called
                        var first = that.aceEditor.getFirstVisibleRow();
                        var last = that.aceEditor.getLastVisibleRow();
                        for (var i = 0; i <= sess.bgTokenizer.lines.length; i++) { // delete all cached lines so that tokensByLine cache will be used when scrolling takes place
                            var l = sess.bgTokenizer.lines[i];
                            if (l != null && l.length > 0) {
                                delete sess.bgTokenizer.lines[i];
                            }
                        }
                        rend.updateLines(first, last);
                    }
                }
            });
        };

        BaseDdlTokenizerWithWorker.prototype.triggerParseRequestViaWorker = function () {
            var doc = this.sourceDocument;
            this.worker.postMessage({
                padFilePath: this.padFilePath,
                source: doc.$lines.join("\n")
            });
        };

        /**
         * intended to be sub classed
         */
        BaseDdlTokenizerWithWorker.prototype.isMyEditorSessionMode = function (editor) {
            return false;
        };

        /**
         * intended to be sub classed
         * @param {Range} Range
         * @param {AceEditor} editor
         */
        BaseDdlTokenizerWithWorker.prototype.addNavigationHandler = function (editor) {
        };

        BaseDdlTokenizerWithWorker.prototype.setCurrentActiveEditor = function (editor) {
            //editor instance is always the same -> but editor.session changes per editor tab
            if (this.isMyEditorSessionMode(editor.session) !== true) {
                return;
            }
            var doc = editor.session.doc;
            if (doc === this.sourceDocument) {
                return; //nothing to do
            }
            this.setDocument(doc);
            this.triggerParseRequestViaWorker();
            this.addChangeListenerIfNecessary(editor);
            this.tokensByLine = {};

            if (this.aceEditor == null) {
                //register listeners only once per editor
                this.addMacContentAssistSupport(editor);
                this.addNavigationHandler(editor);
            }
            this.aceEditor = editor;
            editor.rndTokenizer = this; // store reference from ace editor instance to BaseDdlTokenizerWithWorker
        };

        BaseDdlTokenizerWithWorker.prototype.onSessionChange = function (change, session) {
            if (BaseDdlTokenizerWithWorker.current.isMyEditorSessionMode(session) !== true) {
                return;
            }
            // invalidate line caches when source is modified
            BaseDdlTokenizerWithWorker.current.tokensByLineInvalid = true;
            //do this with delayed timeout // not too much often
            if (BaseDdlTokenizerWithWorker.current.lastTimeout != null) clearTimeout(BaseDdlTokenizerWithWorker.current.lastTimeout);
            BaseDdlTokenizerWithWorker.current.lastTimeout = setTimeout(function () {
                BaseDdlTokenizerWithWorker.current.triggerParseRequestViaWorker();
            }, 700);
        };

        BaseDdlTokenizerWithWorker.prototype.addChangeListenerIfNecessary = function (editor) {
            BaseDdlTokenizerWithWorker.current = this;
            var session = editor.getSession();
            if (Utils.arrayContains(session._eventRegistry.change, this.onSessionChange) == false) {
                session.on('change', this.onSessionChange);
            }
        };

        BaseDdlTokenizerWithWorker.prototype.setDocument = function (sourceDoc) {
            this.sourceDocument = sourceDoc;
        };

        BaseDdlTokenizerWithWorker.prototype.addMacContentAssistSupport = function (editor) {
            editor.commands.addCommand({
                name: 'myCommand',
                bindKey: {win: 'Ctrl-Space', mac: 'Command-Space'},
                exec: function (editor) {
                    editor.execCommand("startAutocomplete");
                }
            });
        };

        BaseDdlTokenizerWithWorker.prototype.createSpaces = function (line, fromColumn, toColumn) {
            var str = this.sourceDocument.$lines[line];
            var result = [];
            for (var i = fromColumn; i < toColumn; i++) {
                var ws = str[i];
                if (ws !== undefined)
                    result.push(ws);
            }
            var res = result.join("");
            return res;
        };

        BaseDdlTokenizerWithWorker.prototype.convertOffsetToRowColumn = function (str, offset) {
            var row = 0;
            var column = 0;
            for (var i = 0; i < str.length; i++) {
                if (i === offset)
                    break;
                if (str[i] == '\n') {
                    row++;
                    column = 0;
                    continue;
                }
                column++;
            }
            return {row: row, column: column};
        };

        /**
         * intended to be sub classed
         */
        BaseDdlTokenizerWithWorker.prototype.convertRndTokensToAce = function (rndTokens) {
            return [];
        };

        BaseDdlTokenizerWithWorker.prototype.getLineTokens = function (line, state, row) {
            var currentState = "start";
            var aceTokens = [];
            var rndTokens;

            //check result from worker -> if exists, take it
            if (this.tokensByLineInvalid === true) {
                var cachedTokens = this.tokensByLine[row];
                this.tokensByLineInvalid = false;
                if (cachedTokens !== undefined && cachedTokens.length == 1 && cachedTokens[0].m_category.value == rnd.Category.CAT_COMMENT.value) {
                    // TODO: May be we are editing comment. Lets find out for sure
                    var aceToken = {};
                    aceToken.value = line;
                    aceToken.type = "comment";
                    aceTokens.push(aceToken);
                    return {
                        tokens: aceTokens,
                        state: currentState
                    };
                }
                this.tokensByLine = {};
            }

            if (Object.keys(this.tokensByLine).length > 0) {
                rndTokens = this.tokensByLine[row];
            }
            if (rndTokens === undefined) { // Fallback in any case ;)
                rndTokens = this.parser.tokenize(this.resolver, line);
            }

            aceTokens = this.convertRndTokensToAce(rndTokens, row);

            return {
                tokens: aceTokens,
                state: currentState
            };
        };

        BaseDdlTokenizerWithWorker.prototype.createMarkerForErrorToken = function (row, column, length) {
            var sess = this.aceEditor.getSession();
            var markerDeco = "acmark_error errorType_error errorId_0";
            var marker = sess.addMarker(new this.Range(row, column, row, column + length), markerDeco, "text");
            if (sess.__markersByRow === undefined) {
                sess.__markersByRow = {}; // store the markersByRow map on EditSession level (think off multiple editors)
            }

            var markers = sess.__markersByRow[row];
            if (markers === undefined) {
                markers = [];
                sess.__markersByRow[row] = markers;
            }
            markers.push(marker);
        };

        BaseDdlTokenizerWithWorker.prototype.deleteLastErrorTokenMarkers = function (row) {
            var sess = this.aceEditor.getSession();
            if (sess.__markersByRow !== undefined) {
                var markers = sess.__markersByRow[row];
                if (markers !== undefined) {
                    for (var i = 0; i < markers.length; i++) {
                        sess.removeMarker(markers[i]);
                    }
                    markers.splice(0, markers.length); // delete the markers array
                }
            }
        };

        return BaseDdlTokenizerWithWorker;
    }
);
define(
    'commonddl/commonddl',[   "commonddl/astmodel/AbstractAnnotationImpl",
        "commonddl/astmodel/AbstractAnnotationValueImpl",
        "commonddl/astmodel/AnnotatedImpl",
        "commonddl/astmodel/AnnotationArrayValueImpl",
        "commonddl/astmodel/AnnotationDeclarationImpl",
        "commonddl/astmodel/AnnotationNameValuePairImpl",
        "commonddl/astmodel/AnnotationRecordValueImpl",
        "commonddl/astmodel/AnnotationValueImpl",
        "commonddl/astmodel/AnonymousTypeDeclarationImpl",
        "commonddl/astmodel/AssociationDeclarationImpl",
        "commonddl/astmodel/AstFactoryImpl",
        "commonddl/astmodel/AttributeDeclarationImpl",
        "commonddl/astmodel/BetweenExpressionImpl",
        "commonddl/astmodel/BooleanExpressionImpl",
        "commonddl/astmodel/BooleanType",
        "commonddl/astmodel/ColumnImpl",
        "commonddl/astmodel/CompExpressionImpl",
        "commonddl/astmodel/CompilationUnitImpl",
        "commonddl/astmodel/ComponentDeclarationImpl",
        "commonddl/astmodel/ConcatenationExpressionImpl",
        "commonddl/astmodel/ConstDeclarationImpl",
        "commonddl/astmodel/ContextDeclarationImpl",
        "commonddl/astmodel/DataSourceAssociationImpl",
        "commonddl/astmodel/DataSourceImpl",
        "commonddl/astmodel/DdlStatementImpl",
        "commonddl/astmodel/ElementDeclarationImpl",
        "commonddl/astmodel/EntityDeclarationImpl",
        "commonddl/astmodel/EnumerationDeclarationImpl",
        "commonddl/astmodel/EnumerationValueImpl",
        "commonddl/astmodel/EObjectContainmentEList",
        "commonddl/astmodel/EObjectImpl",
        "commonddl/astmodel/ExpressionContainerImpl",
        "commonddl/astmodel/ExpressionImpl",
        "commonddl/astmodel/ForeignKeyImpl",
        "commonddl/astmodel/FuncExpressionImpl",
        "commonddl/astmodel/GroupByEntryImpl",
        "commonddl/astmodel/GroupByImpl",
        "commonddl/astmodel/IAstFactory",
        "commonddl/astmodel/InExpressionImpl",
        "commonddl/astmodel/JoinDataSourceImpl",
        "commonddl/astmodel/JoinEnum",
        "commonddl/astmodel/LikeExpressionImpl",
        "commonddl/astmodel/LiteralExpressionImpl",
        "commonddl/astmodel/NamedDeclarationImpl",
        "commonddl/astmodel/NamespaceDeclarationImpl",
        "commonddl/astmodel/NotExpressionImpl",
        "commonddl/astmodel/NullExpressionImpl",
        "commonddl/astmodel/OrderByEntryImpl",
        "commonddl/astmodel/OrderByImpl",
        "commonddl/astmodel/PathDeclarationImpl",
        "commonddl/astmodel/PathEntryImpl",
        "commonddl/astmodel/PathExpressionImpl",
        "commonddl/astmodel/PreAnnotationImpl",
        "commonddl/astmodel/ProxyStatementImpl",
        "commonddl/astmodel/SelectListEntryExtensionImpl",
        "commonddl/astmodel/SelectListEntryImpl",
        "commonddl/astmodel/SelectListEntryType",
        "commonddl/astmodel/SelectListImpl",
        "commonddl/astmodel/SourceRangeImpl",
        "commonddl/astmodel/StatementContainerImpl",
        "commonddl/astmodel/StdFuncExpressionImpl",
        "commonddl/astmodel/TypeDeclarationImpl",
        "commonddl/astmodel/UsingDirectiveImpl",
        "commonddl/astmodel/ViewDefinitionImpl",
        "commonddl/astmodel/ViewExtendImpl",
        "commonddl/astmodel/ViewSelectImpl",
        "commonddl/astmodel/SearchedCaseExpressionImpl",
        "commonddl/astmodel/SimpleCaseExpressionImpl",
        "commonddl/astmodel/CaseWhenExpressionImpl",
        "commonddl/astmodel/ArithmeticExpressionImpl",
        "commonddl/astmodel/PostAnnotationImpl",
        "commonddl/AbstractDdlCodeCompletionProposal",
        "commonddl/AbstractDdlParser",
        "commonddl/AbstractDdlVisitor",
        "commonddl/AbstractSemanticCodeCompletionRepositoryAccess",
        "commonddl/AnnotationPayload",
        "commonddl/AnnotationUtil",
        "commonddl/DdlCodeCompletionType",
        "commonddl/DdlCompletionProposal",
        "commonddl/DdlCompletionScope",
        "commonddl/DdlErrorneousParserBackendInfo",
        "commonddl/DdlHaltedCallback",
        "commonddl/DdlKeywordCodeCompletionProposal",
        "commonddl/DdlParserBackendInfo",
        "commonddl/DdlParserFactoryBackendVersion",
        "commonddl/DdlRndParserApi",
        "commonddl/DdlScanner",
        "commonddl/DdlSourceColoringCacheHelper",
        "commonddl/DdlSourceFormattingStyle",
        "commonddl/DdlStatementMatchUtil",
        "commonddl/DdlTypeUsagePayload",
        "commonddl/PredefinedDataType",
        "commonddl/SapDdlConstants",
        "commonddl/SapViewFormatter",
        "commonddl/TokenUtil",
        "commonddl/WordFormattingEnum",
        "commonddl/ace/BaseEditorNavigationHandler",
        "commonddl/ace/BaseDdlTokenizerWithWorker",
        "commonddl/astmodel/SelectImpl",
        "commonddl/astmodel/ViewSelectSetImpl"
    ], //dependencies
    function (AbstractAnnotationImpl,
              AbstractAnnotationValueImpl,
              AnnotatedImpl,
              AnnotationArrayValueImpl,
              AnnotationDeclarationImpl,
              AnnotationNameValuePairImpl,
              AnnotationRecordValueImpl,
              AnnotationValueImpl,
              AnonymousTypeDeclarationImpl,
              AssociationDeclarationImpl,
              AstFactoryImpl,
              AttributeDeclarationImpl,
              BetweenExpressionImpl,
              BooleanExpressionImpl,
              BooleanType,
              ColumnImpl,
              CompExpressionImpl,
              CompilationUnitImpl,
              ComponentDeclarationImpl,
              ConcatenationExpressionImpl,
              ConstDeclarationImpl,
              ContextDeclarationImpl,
              DataSourceAssociationImpl,
              DataSourceImpl,
              DdlStatementImpl,
              ElementDeclarationImpl,
              EntityDeclarationImpl,
              EnumerationDeclarationImpl,
              EnumerationValueImpl,
              EObjectContainmentEList,
              EObjectImpl,
              ExpressionContainerImpl,
              ExpressionImpl,
              ForeignKeyImpl,
              FuncExpressionImpl,
              GroupByEntryImpl,
              GroupByImpl,
              IAstFactory,
              InExpressionImpl,
              JoinDataSourceImpl,
              JoinEnum,
              LikeExpressionImpl,
              LiteralExpressionImpl,
              NamedDeclarationImpl,
              NamespaceDeclarationImpl,
              NotExpressionImpl,
              NullExpressionImpl,
              OrderByEntryImpl,
              OrderByImpl,
              PathDeclarationImpl,
              PathEntryImpl,
              PathExpressionImpl,
              PreAnnotationImpl,
              ProxyStatementImpl,
              SelectListEntryExtensionImpl,
              SelectListEntryImpl,
              SelectListEntryType,
              SelectListImpl,
              SourceRangeImpl,
              StatementContainerImpl,
              StdFuncExpressionImpl,
              TypeDeclarationImpl,
              UsingDirectiveImpl,
              ViewDefinitionImpl,
              ViewExtendImpl,
              ViewSelectImpl,
              SearchedCaseExpressionImpl,
              SimpleCaseExpressionImpl,
              CaseWhenExpressionImpl,
              ArithmeticExpressionImpl,
              PostAnnotationImpl,
              AbstractDdlCodeCompletionProposal,
              AbstractDdlParser,
              AbstractDdlVisitor,
              AbstractSemanticCodeCompletionRepositoryAccess,
              AnnotationPayload,
              AnnotationUtil,
              DdlCodeCompletionType,
              DdlCompletionProposal,
              DdlCompletionScope,
              DdlErrorneousParserBackendInfo,
              DdlHaltedCallback,
              DdlKeywordCodeCompletionProposal,
              DdlParserBackendInfo,
              DdlParserFactoryBackendVersion,
              DdlRndParserApi,
              DdlScanner,
              DdlSourceColoringCacheHelper,
              DdlSourceFormattingStyle,
              DdlStatementMatchUtil,
              DdlTypeUsagePayload,
              PredefinedDataType,
              SapDdlConstants,
              SapViewFormatter,
              TokenUtil,
              WordFormattingEnum,
              BaseEditorNavigationHandler,
              BaseDdlTokenizerWithWorker,
              SelectImpl,
              ViewSelectSetImpl
        ) {

        return {
            AbstractAnnotationImpl: AbstractAnnotationImpl,
            AbstractAnnotationValueImpl: AbstractAnnotationValueImpl,
            AnnotatedImpl: AnnotatedImpl,
            AnnotationArrayValueImpl: AnnotationArrayValueImpl,
            AnnotationDeclarationImpl: AnnotationDeclarationImpl,
            AnnotationNameValuePairImpl: AnnotationNameValuePairImpl,
            AnnotationRecordValueImpl: AnnotationRecordValueImpl,
            AnnotationValueImpl: AnnotationValueImpl,
            AnonymousTypeDeclarationImpl: AnonymousTypeDeclarationImpl,
            AssociationDeclarationImpl: AssociationDeclarationImpl,
            AstFactoryImpl: AstFactoryImpl,
            AttributeDeclarationImpl: AttributeDeclarationImpl,
            BetweenExpressionImpl: BetweenExpressionImpl,
            BooleanExpressionImpl: BooleanExpressionImpl,
            BooleanType: BooleanType,
            ColumnImpl: ColumnImpl,
            CompExpressionImpl: CompExpressionImpl,
            CompilationUnitImpl: CompilationUnitImpl,
            ComponentDeclarationImpl: ComponentDeclarationImpl,
            ConcatenationExpressionImpl: ConcatenationExpressionImpl,
            ConstDeclarationImpl: ConstDeclarationImpl,
            ContextDeclarationImpl: ContextDeclarationImpl,
            DataSourceAssociationImpl: DataSourceAssociationImpl,
            DataSourceImpl: DataSourceImpl,
            DdlStatementImpl: DdlStatementImpl,
            ElementDeclarationImpl: ElementDeclarationImpl,
            EntityDeclarationImpl: EntityDeclarationImpl,
            EnumerationDeclarationImpl: EnumerationDeclarationImpl,
            EnumerationValueImpl: EnumerationValueImpl,
            EObjectContainmentEList: EObjectContainmentEList,
            EObjectImpl: EObjectImpl,
            ExpressionContainerImpl: ExpressionContainerImpl,
            ExpressionImpl: ExpressionImpl,
            ForeignKeyImpl: ForeignKeyImpl,
            FuncExpressionImpl: FuncExpressionImpl,
            GroupByEntryImpl: GroupByEntryImpl,
            GroupByImpl: GroupByImpl,
            IAstFactory: IAstFactory,
            InExpressionImpl: InExpressionImpl,
            JoinDataSourceImpl: JoinDataSourceImpl,
            JoinEnum: JoinEnum,
            LikeExpressionImpl: LikeExpressionImpl,
            LiteralExpressionImpl: LiteralExpressionImpl,
            NamedDeclarationImpl: NamedDeclarationImpl,
            NamespaceDeclarationImpl: NamespaceDeclarationImpl,
            NotExpressionImpl: NotExpressionImpl,
            NullExpressionImpl: NullExpressionImpl,
            OrderByEntryImpl: OrderByEntryImpl,
            OrderByImpl: OrderByImpl,
            PathDeclarationImpl: PathDeclarationImpl,
            PathEntryImpl: PathEntryImpl,
            PathExpressionImpl: PathExpressionImpl,
            PreAnnotationImpl: PreAnnotationImpl,
            ProxyStatementImpl: ProxyStatementImpl,
            SelectListEntryExtensionImpl: SelectListEntryExtensionImpl,
            SelectListEntryImpl: SelectListEntryImpl,
            SelectListEntryType: SelectListEntryType,
            SelectListImpl: SelectListImpl,
            SourceRangeImpl: SourceRangeImpl,
            StatementContainerImpl: StatementContainerImpl,
            StdFuncExpressionImpl: StdFuncExpressionImpl,
            TypeDeclarationImpl: TypeDeclarationImpl,
            UsingDirectiveImpl: UsingDirectiveImpl,
            ViewDefinitionImpl: ViewDefinitionImpl,
            ViewExtendImpl: ViewExtendImpl,
            ViewSelectImpl: ViewSelectImpl,
            SearchedCaseExpressionImpl: SearchedCaseExpressionImpl,
            SimpleCaseExpressionImpl: SimpleCaseExpressionImpl,
            CaseWhenExpressionImpl: CaseWhenExpressionImpl,
            ArithmeticExpressionImpl: ArithmeticExpressionImpl,
            PostAnnotationImpl : PostAnnotationImpl,
            //
            AbstractDdlCodeCompletionProposal: AbstractDdlCodeCompletionProposal,
            AbstractDdlParser: AbstractDdlParser,
            AbstractDdlVisitor: AbstractDdlVisitor,
            AbstractSemanticCodeCompletionRepositoryAccess: AbstractSemanticCodeCompletionRepositoryAccess,
            AnnotationPayload: AnnotationPayload,
            AnnotationUtil: AnnotationUtil,
            DdlCodeCompletionType: DdlCodeCompletionType,
            DdlCompletionProposal: DdlCompletionProposal,
            DdlCompletionScope: DdlCompletionScope,
            DdlErrorneousParserBackendInfo: DdlErrorneousParserBackendInfo,
            DdlHaltedCallback: DdlHaltedCallback,
            DdlKeywordCodeCompletionProposal: DdlKeywordCodeCompletionProposal,
            DdlParserBackendInfo: DdlParserBackendInfo,
            DdlParserFactoryBackendVersion: DdlParserFactoryBackendVersion,
            DdlRndParserApi: DdlRndParserApi,
            DdlScanner: DdlScanner,
            DdlSourceColoringCacheHelper: DdlSourceColoringCacheHelper,
            DdlSourceFormattingStyle: DdlSourceFormattingStyle,
            DdlStatementMatchUtil: DdlStatementMatchUtil,
            DdlTypeUsagePayload: DdlTypeUsagePayload,
            PredefinedDataType: PredefinedDataType,
            SapDdlConstants: SapDdlConstants,
            SapViewFormatter: SapViewFormatter,
            TokenUtil: TokenUtil,
            WordFormattingEnum: WordFormattingEnum,
            BaseEditorNavigationHandler: BaseEditorNavigationHandler,
            BaseDdlTokenizerWithWorker: BaseDdlTokenizerWithWorker,
            SelectImpl: SelectImpl,
            ViewSelectSetImpl: ViewSelectSetImpl

        };
    }
);

