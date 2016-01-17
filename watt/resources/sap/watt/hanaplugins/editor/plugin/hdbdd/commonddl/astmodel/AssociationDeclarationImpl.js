// based on commit
// df5d88d14a69ac3ca1a4d784d3bf0f60855bd52a CDS - ProxyStatement class movement from AST Layer to Graphical Layer
/*eslint-disable max-statements*/
define(
    ["commonddl/astmodel/ElementDeclarationImpl","rndrt/rnd","commonddl/astmodel/EObjectContainmentEList","require"], //dependencies
    function (ElementDeclarationImpl,rnd,EObjectContainmentEList,require) {
        var Utils = rnd.Utils;
        function AssociationDeclarationImpl() {
            ElementDeclarationImpl.call(this);
        }
        AssociationDeclarationImpl.prototype = Object.create(ElementDeclarationImpl.prototype);
        AssociationDeclarationImpl.SOURCE_MAX_CARDINALITY_TOKEN_EDEFAULT = null;
        AssociationDeclarationImpl.prototype.sourceMaxCardinalityToken = AssociationDeclarationImpl.SOURCE_MAX_CARDINALITY_TOKEN_EDEFAULT;
        AssociationDeclarationImpl.MIN_TOKEN_EDEFAULT = null;
        AssociationDeclarationImpl.prototype.minToken = AssociationDeclarationImpl.MIN_TOKEN_EDEFAULT;
        AssociationDeclarationImpl.MAX_TOKEN_EDEFAULT = null;
        AssociationDeclarationImpl.prototype.maxToken = AssociationDeclarationImpl.MAX_TOKEN_EDEFAULT;
        AssociationDeclarationImpl.prototype.keys = null;
        AssociationDeclarationImpl.CARDINALITIES_EDEFAULT = null;
        AssociationDeclarationImpl.prototype.targetEntityPath = null;
        AssociationDeclarationImpl.prototype.targetDataSource = null;
        AssociationDeclarationImpl.prototype.onExpression = null;
        AssociationDeclarationImpl.ON_TOKEN_EDEFAULT = null;
        AssociationDeclarationImpl.prototype.onToken = AssociationDeclarationImpl.ON_TOKEN_EDEFAULT;
        AssociationDeclarationImpl.prototype.constructor = AssociationDeclarationImpl;
        AssociationDeclarationImpl.prototype.getSourceMaxCardinalityToken = function() {
            return this.sourceMaxCardinalityToken;
        };
        AssociationDeclarationImpl.prototype.setSourceMaxCardinalityToken = function(newSourceMaxCardinalityToken) {
            var oldSourceMaxCardinalityToken = this.sourceMaxCardinalityToken;
            this.sourceMaxCardinalityToken = newSourceMaxCardinalityToken;
        };
        AssociationDeclarationImpl.prototype.getMinToken = function() {
            return this.minToken;
        };
        AssociationDeclarationImpl.prototype.setMinToken = function(newMinToken) {
            var oldMinToken = this.minToken;
            this.minToken = newMinToken;
        };
        AssociationDeclarationImpl.prototype.getMaxToken = function() {
            return this.maxToken;
        };
        AssociationDeclarationImpl.prototype.setMaxToken = function(newMaxToken) {
            var oldMaxToken = this.maxToken;
            this.maxToken = newMaxToken;
        };
        AssociationDeclarationImpl.prototype.getKeys = function() {
            /*eslint-disable no-eq-null*/
            if (this.keys == null) {
                this.keys = new EObjectContainmentEList(this);
            }
            return this.keys;
        };
        AssociationDeclarationImpl.prototype.getTargetEntityName = function() {
            var path = this.getTargetEntityPath();
            var result = new rnd.StringBuffer();
            /*eslint-disable no-eq-null*/
            if (path != null && path.getEntries() != null && path.getEntries().length > 0) {
                var str = path.getPathString(false);
                return str;
            }
            return result.toString();
        };
        AssociationDeclarationImpl.prototype.getCardinalities = function() {
            var result = "";
            var token = this.getMinToken();
            /*eslint-disable no-eq-null*/
            if (token != null) {
                result = token.getM_lexem();
            }
            token = this.getMaxToken();
            /*eslint-disable no-eq-null*/
            if (token != null) {
                result += ".." + token.getM_lexem();
            }
            return result;
        };
        AssociationDeclarationImpl.prototype.getOnCondition = function() {
            return this.getOnExpression();
        };
        AssociationDeclarationImpl.prototype.getTargetEntityPath = function() {
            return this.targetEntityPath;
        };
        AssociationDeclarationImpl.prototype.basicSetTargetEntityPath = function(newTargetEntityPath,msgs) {
            var oldTargetEntityPath = this.targetEntityPath;
            this.targetEntityPath = newTargetEntityPath;
            this.targetEntityPath.parent = this;
            return msgs;
        };
        AssociationDeclarationImpl.prototype.setTargetEntityPath = function(newTargetEntityPath) {
            if (newTargetEntityPath !== this.targetEntityPath) {
                this.basicSetTargetEntityPath(newTargetEntityPath);
            }
        };
        AssociationDeclarationImpl.prototype.getTargetDataSource = function() {
            return this.targetDataSource;
        };
        AssociationDeclarationImpl.prototype.basicSetTargetDataSource = function(newTargetDataSource,msgs) {
            var oldTargetDataSource = this.targetDataSource;
            this.targetDataSource = newTargetDataSource;
            this.targetDataSource.setContainer(this);
            return msgs;
        };
        AssociationDeclarationImpl.prototype.setTargetDataSource = function(newTargetDataSource) {
            if (newTargetDataSource !== this.targetDataSource) {
                this.basicSetTargetDataSource(newTargetDataSource);
            }
        };
        AssociationDeclarationImpl.prototype.getOnExpression = function() {
            return this.onExpression;
        };
        AssociationDeclarationImpl.prototype.basicSetOnExpression = function(newOnExpression,msgs) {
            var oldOnExpression = this.onExpression;
            this.onExpression = newOnExpression;
            this.onExpression.setContainer(this);
            return msgs;
        };
        AssociationDeclarationImpl.prototype.setOnCondition = function(exp) {
            this.setOnExpression(exp);
        };
        AssociationDeclarationImpl.prototype.setOnExpression = function(newOnExpression) {
            if (newOnExpression !== this.onExpression) {
                this.basicSetOnExpression(newOnExpression);
            }
        };
        AssociationDeclarationImpl.prototype.getOnToken = function() {
            return this.onToken;
        };
        AssociationDeclarationImpl.prototype.setOnToken = function(newOnToken) {
            var oldOnToken = this.onToken;
            this.onToken = newOnToken;
        };
        AssociationDeclarationImpl.prototype.getTypeId = function() {
            return this.getTargetEntityName();
        };
        AssociationDeclarationImpl.prototype.toString = function() {
            var result = new rnd.StringBuffer(ElementDeclarationImpl.prototype.toString.call(this));
            result.append(" (sourceMaxCardinalityToken: ");
            result.append(this.sourceMaxCardinalityToken);
            result.append(", minToken: ");
            result.append(this.minToken);
            result.append(", maxToken: ");
            result.append(this.maxToken);
            result.append(")");
            return result.toString();
        };
        return AssociationDeclarationImpl;
    }
);