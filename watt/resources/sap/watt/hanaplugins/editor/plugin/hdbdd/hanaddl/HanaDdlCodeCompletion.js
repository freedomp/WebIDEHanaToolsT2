// based on commit
//449c081101fd3dfd46338cc1a3c4cb92f78b2304 CDS: Implement code completion for DCL statements
/*eslint-disable no-eq-null,eqeqeq,camelcase,max-params,quotes,complexity,max-statements,curly,max-len,no-empty,no-proto,no-redeclare,radix,no-undef,no-console,valid-jsdoc,no-constant-condition*/
define(
    [ "commonddl/commonddlNonUi","hanaddl/IBaseCdsDdlParserConstants","hanaddl/UsingDirectiveInserter","hanaddl/HanaAnnotationUtil" ], // dependencies
    function(commonddl,IBaseCdsDdlParserConstants,UsingDirectiveInserter,HanaAnnotationUtil) {
        var AbstractDdlCodeCompletionProposal = commonddl.AbstractDdlCodeCompletionProposal;
        var CompilationUnitImpl = commonddl.CompilationUnitImpl;
        var ElementDeclarationImpl = commonddl.ElementDeclarationImpl;
        var NamedDeclarationImpl = commonddl.NamedDeclarationImpl;

        function HanaDdlCodeCompletion(name, type) {
            AbstractDdlCodeCompletionProposal.call(this, name, type);
        }
        HanaDdlCodeCompletion.prototype = Object.create(AbstractDdlCodeCompletionProposal.prototype);
        HanaDdlCodeCompletion.prototype.externalNameDecl = null;
        HanaDdlCodeCompletion.prototype.cocoCu = null;
        HanaDdlCodeCompletion.prototype.doReplaceTokenAtCurrentOffset = true;
        HanaDdlCodeCompletion.prototype.replacementLength = -1;
        HanaDdlCodeCompletion.prototype.replacementOffset = -1;
        HanaDdlCodeCompletion.prototype.annotationElementDeclaration = null;
        HanaDdlCodeCompletion.prototype.supportsLinkedEditing = false;
        HanaDdlCodeCompletion.prototype.additionalDisplayString = "";
        HanaDdlCodeCompletion.prototype.replacementString = "";
        HanaDdlCodeCompletion.prototype.addScopingOperator = false;

        HanaDdlCodeCompletion.HanaDdlCodeCompletion1 = function(name,type,supportsLinkedEditing) {
            var result = new HanaDdlCodeCompletion(name, type);
            result.supportsLinkedEditing = supportsLinkedEditing;
            return result;
        };
        HanaDdlCodeCompletion.HanaDdlCodeCompletion2 = function(externalNameDecl,cocoCu,name,type) {
            var result = new HanaDdlCodeCompletion(name, type);
            result.supportsLinkedEditing = false;
            result.externalNameDecl = externalNameDecl;
            result.cocoCu = cocoCu;
            return result;
        };
        HanaDdlCodeCompletion.prototype.isDoReplaceTokenAtCurrentOffset = function() {
            return this.doReplaceTokenAtCurrentOffset;
        };
        HanaDdlCodeCompletion.prototype.setDoReplaceTokenAtCurrentOffset = function(v) {
            this.doReplaceTokenAtCurrentOffset = v;
        };
        HanaDdlCodeCompletion.prototype.getExternalNameDecl = function() {
            return this.externalNameDecl;
        };
        HanaDdlCodeCompletion.prototype.getCocoCu = function() {
            return this.cocoCu;
        };
        HanaDdlCodeCompletion.prototype.hashCode = function() {
            var prime = 31;
            var result = AbstractDdlCodeCompletionProposal.prototype.hashCode.call(this);
            result = prime * result + ((this.cocoCu == null) ? 0 : this.cocoCu.hashCode());
            result = prime * result + ((this.externalNameDecl == null) ? 0 : this.externalNameDecl.hashCode());
            return result;
        };
        HanaDdlCodeCompletion.prototype.equals = function(obj) {
            if (this == obj) {
                return true;
            }
            if (!AbstractDdlCodeCompletionProposal.prototype.equals.call(
                this, obj)) {
                return false;
            }
            // if (this.getClass() != obj.getClass()) {
            // return false;
            // }
            var other = obj;
            if (this.cocoCu == null) {
                if (other.cocoCu != null) {
                    return false;
                }
            } else if (!(this.cocoCu === other.cocoCu)) {
                return false;
            }
            if (this.externalNameDecl == null) {
                if (other.externalNameDecl != null) {
                    return false;
                }
            }else if (!(this.externalNameDecl === other.externalNameDecl)) {
                return false;
            }
            return true;
        };
        HanaDdlCodeCompletion.prototype.setReplacementOffsetLength = function(replacementOffsetParam,replacementLengthParam) {
            this.replacementOffset = replacementOffsetParam;
            this.replacementLength = replacementLengthParam;
        };
        HanaDdlCodeCompletion.prototype.getReplacementLength = function() {
            return this.replacementLength;
        };
        HanaDdlCodeCompletion.prototype.getReplacementOffset = function() {
            return this.replacementOffset;
        };
        HanaDdlCodeCompletion.prototype.getAnnotationElementDeclaration = function() {
            return this.annotationElementDeclaration;
        };
        HanaDdlCodeCompletion.prototype.setAnnotationElementDeclaration = function(annotationElementDeclaration) {
            this.annotationElementDeclaration = annotationElementDeclaration;
        };
        HanaDdlCodeCompletion.prototype.getSupportsLinkedEditing = function() {
            return this.supportsLinkedEditing;
        };
        HanaDdlCodeCompletion.prototype.setAdditionalDisplayString = function(str) {
            this.additionalDisplayString = str;
        };
        HanaDdlCodeCompletion.prototype.getAdditionalDisplayString = function() {
            return this.additionalDisplayString;
        };
        HanaDdlCodeCompletion.prototype.setReplacementString = function(str) {
            this.replacementString = str;
        };
        HanaDdlCodeCompletion.prototype.getReplacementString = function() {
            return this.replacementString;
        };
        HanaDdlCodeCompletion.prototype.getAddScopingOperator = function() {
            return this.addScopingOperator;
        };
        HanaDdlCodeCompletion.prototype.setAddScopingOperator = function(addScopingOperator) {
            this.addScopingOperator = addScopingOperator;
        };
        function ReplacementInformation(string,offset,length) {
            this.string = string;
            this.offset = offset;
            this.length = length;
        }
        ReplacementInformation.prototype.string = null;
        ReplacementInformation.prototype.offset = -1;
        ReplacementInformation.prototype.length = -1;
        ReplacementInformation.prototype.externalNamedDeclaration = null;
        ReplacementInformation.prototype.alias = null;

        HanaDdlCodeCompletion.prototype.calculateReplacementInformation = function(replacementString,replacementLength,replacementOffset) {
            if (IBaseCdsDdlParserConstants.WARNING_TYPE === this.getType() || IBaseCdsDdlParserConstants.LOADING_TYPE === this.getType()) {
                return null;
            }
            var replacementInformation = new ReplacementInformation(replacementString, replacementOffset, replacementLength);
            var cocoCu = null;
            replacementInformation.externalNamedDeclaration = this.getExternalNameDecl();
            cocoCu = this.getCocoCu();
            if (this.isDoReplaceTokenAtCurrentOffset() == false) {
                replacementInformation.offset += replacementInformation.length;
                replacementInformation.length = 0;
            }
            replacementInformation.alias = new UsingDirectiveInserter().getAliasOrNull(replacementInformation.externalNamedDeclaration,cocoCu);
            if (replacementInformation.alias != null) {
                replacementInformation.string = replacementInformation.alias;
            }else if (this.getAnnotationElementDeclaration() != null) {
                replacementInformation.string += HanaAnnotationUtil.getAnnotationCompletionForArray(this.getAnnotationElementDeclaration());
            }else if (this.getReplacementString() != null && this.getReplacementString().length > 0) {
                replacementInformation.string = this.getReplacementString();
            }
            if (this.getAddScopingOperator()) {
                replacementInformation.string = ":" + replacementInformation.string;
            }
            return replacementInformation;
        };
        return HanaDdlCodeCompletion;
    }
);