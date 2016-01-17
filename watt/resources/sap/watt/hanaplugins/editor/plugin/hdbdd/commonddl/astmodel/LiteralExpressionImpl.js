define(
    ["commonddl/astmodel/ExpressionImpl","rndrt/rnd"], //dependencies
    function (ExpressionImpl,rnd) {
        function LiteralExpressionImpl() {
            ExpressionImpl.call(this);
        }
        LiteralExpressionImpl.prototype = Object.create(ExpressionImpl.prototype);
        LiteralExpressionImpl.TOKEN_EDEFAULT = null;
        LiteralExpressionImpl.TOKEN_TOKEN_EDEFAULT = null;
        LiteralExpressionImpl.prototype.tokenToken = LiteralExpressionImpl.TOKEN_TOKEN_EDEFAULT;
        LiteralExpressionImpl.prototype.constructor = LiteralExpressionImpl;
        LiteralExpressionImpl.prototype.getToken = function() {
            return this.getTokenToken().m_lexem;
        };
        LiteralExpressionImpl.prototype.getTokenToken = function() {
            return this.tokenToken;
        };
        LiteralExpressionImpl.prototype.setTokenToken = function(newTokenToken) {
            var oldTokenToken = this.tokenToken;
            this.tokenToken = newTokenToken;
        };
        LiteralExpressionImpl.prototype.toString = function() {
            var result = new rnd.StringBuffer(ExpressionImpl.prototype.toString.call(this));
            result.append(" (tokenToken: ");
            result.append(this.tokenToken);
            result.append(")");
            return result.toString();
        };
        return LiteralExpressionImpl;
    }
);