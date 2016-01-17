/*eslint-disable no-eq-null,eqeqeq,camelcase,max-statements,complexity,quotes,curly,max-params,max-len,no-redeclare,no-empty,no-octal-escape,no-fallthrough,radix,no-proto,no-new-wrappers*/
// based on commit
//583ac20c0c8fe14ce2536413c1b7e50a5f038d5a New AST nodes
define(
    [
        "commonddl/astmodel/ExpressionImpl",
        "rndrt/rnd",
        "commonddl/astmodel/FuncExpressionImpl"
    ], //dependencies
    function (
        ExpressionImpl,
        rnd,
        FuncExpressionImpl
        ) {
        var Token = rnd.Token;
        var StringBuffer = rnd.StringBuffer;
        function TrimFunctionExpressionImpl() {
            FuncExpressionImpl.call(this);
        }
        TrimFunctionExpressionImpl.prototype = Object.create(FuncExpressionImpl.prototype);
        TrimFunctionExpressionImpl.prototype.constructor = TrimFunctionExpressionImpl;
        TrimFunctionExpressionImpl.FROM_KEYWORD_EDEFAULT = null;
        TrimFunctionExpressionImpl.prototype.fromKeyword = TrimFunctionExpressionImpl.FROM_KEYWORD_EDEFAULT;
        TrimFunctionExpressionImpl.prototype.removeString = null;
        TrimFunctionExpressionImpl.TRIM_POSITION_EDEFAULT = null;
        TrimFunctionExpressionImpl.prototype.trimPosition = TrimFunctionExpressionImpl.TRIM_POSITION_EDEFAULT;
        TrimFunctionExpressionImpl.prototype.getFromKeyword = function() {
            return this.fromKeyword;
        };
        TrimFunctionExpressionImpl.prototype.setFromKeyword = function(newFromKeyword) {
            var oldFromKeyword = this.fromKeyword;
            this.fromKeyword = newFromKeyword;
        };
        TrimFunctionExpressionImpl.prototype.getRemoveString = function() {
            return this.removeString;
        };
        TrimFunctionExpressionImpl.prototype.basicSetRemoveString = function(newRemoveString,msgs) {
            var oldRemoveString = this.removeString;
            this.removeString = newRemoveString;
            this.removeString.setContainer(this);
            return msgs;
        };
        TrimFunctionExpressionImpl.prototype.setRemoveString = function(newRemoveString) {
            if (newRemoveString != this.removeString) {
                var msgs = null;
                if (this.removeString != null) {

                }
                if (newRemoveString != null) {

                }
                msgs = this.basicSetRemoveString(newRemoveString,msgs);
                if (msgs != null) {
                    msgs.dispatch();
                }
            }
        };
        TrimFunctionExpressionImpl.prototype.getTrimPosition = function() {
            return this.trimPosition;
        };
        TrimFunctionExpressionImpl.prototype.setTrimPosition = function(newTrimPosition) {
            var oldTrimPosition = this.trimPosition;
            this.trimPosition = newTrimPosition;
        };
        TrimFunctionExpressionImpl.prototype.toString = function() {
            var result = new StringBuffer(FuncExpressionImpl.prototype.toString.call(this));
            result.append(" (fromKeyword: ");
            result.append(this.fromKeyword);
            result.append(", trimPosition: ");
            result.append(this.trimPosition);
            result.append(')');
            return result.toString();
        };
        return TrimFunctionExpressionImpl;
    }
);