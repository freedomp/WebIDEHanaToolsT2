define(
    ["rndrt/rnd", "commonddl/astmodel/ExpressionImpl"], //dependencies
    function (rnd, ExpressionImpl) {
        function StdFuncExpressionImpl() {
            ExpressionImpl.call(this);
        }
        StdFuncExpressionImpl.prototype = Object.create(ExpressionImpl.prototype);
        StdFuncExpressionImpl.FUNC_NAME_EDEFAULT = null;
        StdFuncExpressionImpl.FUNC_NAME_TOKEN_EDEFAULT = null;
        StdFuncExpressionImpl.prototype.funcNameToken = StdFuncExpressionImpl.FUNC_NAME_TOKEN_EDEFAULT;
        StdFuncExpressionImpl.prototype.parameter = null;
        StdFuncExpressionImpl.DISTINCT_TOKEN_EDEFAULT = null;
        StdFuncExpressionImpl.prototype.distinctToken = StdFuncExpressionImpl.DISTINCT_TOKEN_EDEFAULT;
        StdFuncExpressionImpl.ALL_TOKEN_EDEFAULT = null;
        StdFuncExpressionImpl.prototype.allToken = StdFuncExpressionImpl.ALL_TOKEN_EDEFAULT;
        StdFuncExpressionImpl.prototype.constructor = StdFuncExpressionImpl;
        StdFuncExpressionImpl.prototype.getFuncName = function () {
            var t = this.getFuncNameToken();
            /*eslint-disable no-eq-null*/
            if (t != null) {
                return t.m_lexem;
            }
            return null;
        };
        StdFuncExpressionImpl.prototype.getFuncNameToken = function () {
            return this.funcNameToken;
        };
        StdFuncExpressionImpl.prototype.setFuncNameToken = function (newFuncNameToken) {
            var oldFuncNameToken = this.funcNameToken;
            this.funcNameToken = newFuncNameToken;
        };
        StdFuncExpressionImpl.prototype.getParameter = function () {
            return this.parameter;
        };
        StdFuncExpressionImpl.prototype.basicSetParameter = function (newParameter, msgs) {
            var oldParameter = this.parameter;
            this.parameter = newParameter;
            this.parameter.setContainer(this);
            return msgs;
        };
        StdFuncExpressionImpl.prototype.setParameter = function (newParameter) {
            if (newParameter !== this.parameter) {
                this.basicSetParameter(newParameter);
            }
        };
        StdFuncExpressionImpl.prototype.getDistinctToken = function () {
            return this.distinctToken;
        };
        StdFuncExpressionImpl.prototype.setDistinctToken = function (newDistinctToken) {
            var oldDistinctToken = this.distinctToken;
            this.distinctToken = newDistinctToken;
        };
        StdFuncExpressionImpl.prototype.getAllToken = function () {
            return this.allToken;
        };
        StdFuncExpressionImpl.prototype.setAllToken = function (newAllToken) {
            var oldAllToken = this.allToken;
            this.allToken = newAllToken;
        };
        StdFuncExpressionImpl.prototype.toString = function () {
            var result = new rnd.StringBuffer(ExpressionImpl.prototype.toString.call(this));
            result.append(" (funcNameToken: ");
            result.append(this.funcNameToken);
            result.append(", distinctToken: ");
            result.append(this.distinctToken);
            result.append(", allToken: ");
            result.append(this.allToken);
            result.append(")");
            return result.toString();
        };
        return StdFuncExpressionImpl;
    }
);