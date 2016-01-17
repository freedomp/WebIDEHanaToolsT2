define(
    ["commonddl/astmodel/CompExpressionImpl","rndrt/rnd"], //dependencies
    function (CompExpressionImpl,rnd) {
        function LikeExpressionImpl() {
            CompExpressionImpl.call(this);
        }
        LikeExpressionImpl.prototype = Object.create(CompExpressionImpl.prototype);
        LikeExpressionImpl.ESCAPE_TOKEN_EDEFAULT = null;
        LikeExpressionImpl.prototype.escapeToken = LikeExpressionImpl.ESCAPE_TOKEN_EDEFAULT;
        LikeExpressionImpl.prototype.constructor = LikeExpressionImpl;
        LikeExpressionImpl.prototype.getEscapeToken = function() {
            return this.escapeToken;
        };
        LikeExpressionImpl.prototype.setEscapeToken = function(newEscapeToken) {
            var oldEscapeToken = this.escapeToken;
            this.escapeToken = newEscapeToken;
        };
        LikeExpressionImpl.prototype.toString = function() {
            var result = new rnd.StringBuffer(CompExpressionImpl.prototype.toString.call(this));
            result.append(" (escapeToken: ");
            result.append(this.escapeToken);
            result.append(")");
            return result.toString();
        };
        return LikeExpressionImpl;
    }
);