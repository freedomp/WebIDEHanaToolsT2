define(
    ["commonddl/astmodel/ElementDeclarationImpl","rndrt/rnd"], //dependencies
    function (ElementDeclarationImpl,rnd) {
        function AttributeDeclarationImpl() {
            ElementDeclarationImpl.call(this);
        }
        AttributeDeclarationImpl.prototype = Object.create(ElementDeclarationImpl.prototype);
        AttributeDeclarationImpl.LENGTH_TOKEN_EDEFAULT = null;
        AttributeDeclarationImpl.prototype.lengthToken = AttributeDeclarationImpl.LENGTH_TOKEN_EDEFAULT;
        AttributeDeclarationImpl.DECIMALS_TOKEN_EDEFAULT = null;
        AttributeDeclarationImpl.prototype.decimalsToken = AttributeDeclarationImpl.DECIMALS_TOKEN_EDEFAULT;
        AttributeDeclarationImpl.prototype.constructor = AttributeDeclarationImpl;
        AttributeDeclarationImpl.prototype.getLengthToken = function() {
            return this.lengthToken;
        };
        AttributeDeclarationImpl.prototype.setLengthToken = function(newLengthToken) {
            var oldLengthToken = this.lengthToken;
            this.lengthToken = newLengthToken;
        };
        AttributeDeclarationImpl.prototype.getDecimalsToken = function() {
            return this.decimalsToken;
        };
        AttributeDeclarationImpl.prototype.setDecimalsToken = function(newDecimalsToken) {
            var oldDecimalsToken = this.decimalsToken;
            this.decimalsToken = newDecimalsToken;
        };
        AttributeDeclarationImpl.prototype.toString = function() {
            var result = new rnd.StringBuffer(ElementDeclarationImpl.prototype.toString.call(this));
            result.append(" (lengthToken: ");
            result.append(this.lengthToken);
            result.append(", decimalsToken: ");
            result.append(this.decimalsToken);
            result.append(")");
            return result.toString();
        };
        AttributeDeclarationImpl.prototype.getTypeId = function() {
            var result = ElementDeclarationImpl.prototype.getTypeId.call(this);
            var token = this.getLengthToken();
            /*eslint-disable no-eq-null*/
            if (token != null) {
                result += "(" + token.m_lexem;
                token = this.getDecimalsToken();
                /*eslint-disable no-eq-null*/
                if (token != null) {
                    result += ", " + token.m_lexem;
                }
                result += ")";
            }
            return result;
        };
        return AttributeDeclarationImpl;
    }
);