/*eslint-disable no-eq-null,eqeqeq,camelcase,max-statements,complexity,quotes,curly,max-params,max-len,no-redeclare,no-empty,no-octal-escape,no-fallthrough,radix,no-proto,no-new-wrappers*/
// based on commit
//583ac20c0c8fe14ce2536413c1b7e50a5f038d5a New AST nodes
define(
    [
        "commonddl/astmodel/ExpressionImpl",
        "rndrt/rnd"
    ], //dependencies
    function (
        ExpressionImpl,
        rnd
        ) {
        var Token = rnd.Token;
        var StringBuffer = rnd.StringBuffer;
        function CastExpressionImpl() {
            ExpressionImpl.call(this);
        }
        CastExpressionImpl.prototype = Object.create(ExpressionImpl.prototype);
        CastExpressionImpl.prototype.constructor = CastExpressionImpl;
        CastExpressionImpl.prototype.value = null;
        CastExpressionImpl.TYPE_NAMESPACE_EDEFAULT = null;
        CastExpressionImpl.prototype.typeNamespace = CastExpressionImpl.TYPE_NAMESPACE_EDEFAULT;
        CastExpressionImpl.TYPE_NAME_EDEFAULT = null;
        CastExpressionImpl.prototype.typeName = CastExpressionImpl.TYPE_NAME_EDEFAULT;
        CastExpressionImpl.LENGTH_EDEFAULT = null;
        CastExpressionImpl.prototype.length = CastExpressionImpl.LENGTH_EDEFAULT;
        CastExpressionImpl.DECIMALS_EDEFAULT = null;
        CastExpressionImpl.prototype.decimals = CastExpressionImpl.DECIMALS_EDEFAULT;
        CastExpressionImpl.prototype.lengthExpression = null;
        CastExpressionImpl.prototype.decimalsExpression = null;
        CastExpressionImpl.prototype.getValue = function() {
            return this.value;
        };
        CastExpressionImpl.prototype.basicSetValue = function(newValue,msgs) {
            var oldValue = this.value;
            this.value = newValue;
            this.value.setContainer(this);
            return msgs;
        };
        CastExpressionImpl.prototype.setValue = function(newValue) {
            if (newValue != this.value) {
                var msgs = null;
                if (this.value != null) {

                }
                if (newValue != null) {

                }
                msgs = this.basicSetValue(newValue,msgs);
                if (msgs != null) {
                    msgs.dispatch();
                }
            }
        };
        CastExpressionImpl.prototype.getTypeNamespace = function() {
            return this.typeNamespace;
        };
        CastExpressionImpl.prototype.setTypeNamespace = function(newTypeNamespace) {
            var oldTypeNamespace = this.typeNamespace;
            this.typeNamespace = newTypeNamespace;
        };
        CastExpressionImpl.prototype.getTypeName = function() {
            return this.typeName;
        };
        CastExpressionImpl.prototype.setTypeName = function(newTypeName) {
            var oldTypeName = this.typeName;
            this.typeName = newTypeName;
        };
        CastExpressionImpl.prototype.getLength = function() {
            return this.length;
        };
        CastExpressionImpl.prototype.setLength = function(newLength) {
            var oldLength = this.length;
            this.length = newLength;
        };
        CastExpressionImpl.prototype.getDecimals = function() {
            return this.decimals;
        };
        CastExpressionImpl.prototype.setDecimals = function(newDecimals) {
            var oldDecimals = this.decimals;
            this.decimals = newDecimals;
        };
        CastExpressionImpl.prototype.getLengthExpression = function() {
            return this.lengthExpression;
        };
        CastExpressionImpl.prototype.basicSetLengthExpression = function(newLengthExpression,msgs) {
            var oldLengthExpression = this.lengthExpression;
            this.lengthExpression = newLengthExpression;
            this.lengthExpression.setContainer(this);
            return msgs;
        };
        CastExpressionImpl.prototype.setLengthExpression = function(newLengthExpression) {
            if (newLengthExpression != this.lengthExpression) {
                var msgs = null;
                if (this.lengthExpression != null) {

                }
                if (newLengthExpression != null) {

                }
                msgs = this.basicSetLengthExpression(newLengthExpression,msgs);
                if (msgs != null) {
                    msgs.dispatch();
                }
            }
        };
        CastExpressionImpl.prototype.getDecimalsExpression = function() {
            return this.decimalsExpression;
        };
        CastExpressionImpl.prototype.basicSetDecimalsExpression = function(newDecimalsExpression,msgs) {
            var oldDecimalsExpression = this.decimalsExpression;
            this.decimalsExpression = newDecimalsExpression;
            this.decimalsExpression.setContainer(this);
            return msgs;
        };
        CastExpressionImpl.prototype.setDecimalsExpression = function(newDecimalsExpression) {
            if (newDecimalsExpression != this.decimalsExpression) {
                var msgs = null;
                if (this.decimalsExpression != null) {

                }
                if (newDecimalsExpression != null) {

                }
                msgs = this.basicSetDecimalsExpression(newDecimalsExpression,msgs);
                if (msgs != null) {
                    msgs.dispatch();
                }
            }
        };
        CastExpressionImpl.prototype.toString = function() {
            var result = new StringBuffer(ExpressionImpl.prototype.toString.call(this));
            result.append(" (typeNamespace: ");
            result.append(this.typeNamespace);
            result.append(", typeName: ");
            result.append(this.typeName);
            result.append(", length: ");
            result.append(this.length);
            result.append(", decimals: ");
            result.append(this.decimals);
            result.append(')');
            return result.toString();
        };
        return CastExpressionImpl;
    }
);