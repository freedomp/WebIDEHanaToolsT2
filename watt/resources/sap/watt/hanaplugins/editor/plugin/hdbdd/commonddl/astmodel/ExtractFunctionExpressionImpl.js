/*eslint-disable no-eq-null,eqeqeq,camelcase,max-statements,complexity,quotes,curly,max-params,max-len,no-redeclare,no-empty,no-octal-escape,no-fallthrough,radix,no-proto,no-new-wrappers*/
// based on commit
//583ac20c0c8fe14ce2536413c1b7e50a5f038d5a New AST nodes
define(
    [
        "rndrt/rnd",
        "commonddl/astmodel/FuncExpressionImpl"
    ], //dependencies
    function (
        rnd,
        FuncExpressionImpl
        ) {
        var Token = rnd.Token;
        var StringBuffer = rnd.StringBuffer;
        function ExtractFunctionExpressionImpl() {
            FuncExpressionImpl.call(this);
        }
        ExtractFunctionExpressionImpl.prototype = Object.create(FuncExpressionImpl.prototype);
        ExtractFunctionExpressionImpl.prototype.constructor = ExtractFunctionExpressionImpl;
        ExtractFunctionExpressionImpl.UNIT_EDEFAULT = null;
        ExtractFunctionExpressionImpl.prototype.unit = ExtractFunctionExpressionImpl.UNIT_EDEFAULT;
        ExtractFunctionExpressionImpl.FROM_KEYWORD_EDEFAULT = null;
        ExtractFunctionExpressionImpl.prototype.fromKeyword = ExtractFunctionExpressionImpl.FROM_KEYWORD_EDEFAULT;
        ExtractFunctionExpressionImpl.prototype.getUnit = function() {
            return this.unit;
        };
        ExtractFunctionExpressionImpl.prototype.setUnit = function(newUnit) {
            var oldUnit = this.unit;
            this.unit = newUnit;
        };
        ExtractFunctionExpressionImpl.prototype.getFromKeyword = function() {
            return this.fromKeyword;
        };
        ExtractFunctionExpressionImpl.prototype.setFromKeyword = function(newFromKeyword) {
            var oldFromKeyword = this.fromKeyword;
            this.fromKeyword = newFromKeyword;
        };
        ExtractFunctionExpressionImpl.prototype.toString = function() {
            var result = new StringBuffer(FuncExpressionImpl.prototype.toString.call(this));
            result.append(" (unit: ");
            result.append(this.unit);
            result.append(", fromKeyword: ");
            result.append(this.fromKeyword);
            result.append(')');
            return result.toString();
        };
        return ExtractFunctionExpressionImpl;
    }
);