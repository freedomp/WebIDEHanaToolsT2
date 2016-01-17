define(
    ["rndrt/rnd", "commonddl/astmodel/ExpressionImpl"], //dependencies
    function (rnd, ExpressionImpl) {
        function NullExpressionImpl() {
            ExpressionImpl.call(this);
        }

        NullExpressionImpl.prototype = Object.create(ExpressionImpl.prototype);
        NullExpressionImpl.prototype.left = null;
        NullExpressionImpl.NOT_EDEFAULT = false;
        NullExpressionImpl.prototype.not = NullExpressionImpl.NOT_EDEFAULT;
        NullExpressionImpl.prototype.constructor = NullExpressionImpl;
        NullExpressionImpl.prototype.getLeft = function () {
            return this.left;
        };
        NullExpressionImpl.prototype.basicSetLeft = function (newLeft, msgs) {
            var oldLeft = this.left;
            this.left = newLeft;
            this.left.setContainer(this);
            return msgs;
        };
        NullExpressionImpl.prototype.setLeft = function (newLeft) {
            if (newLeft !== this.left) {
                this.basicSetLeft(newLeft);
            }
        };
        NullExpressionImpl.prototype.isNot = function () {
            return this.not;
        };
        NullExpressionImpl.prototype.setNot = function (newNot) {
            var oldNot = this.not;
            this.not = newNot;
        };
        NullExpressionImpl.prototype.toString = function () {
            var result = new rnd.StringBuffer(ExpressionImpl.prototype.toString.call(this));
            result.append(" (not: ");
            result.append(this.not);
            result.append(")");
            return result.toString();
        };
        return NullExpressionImpl;
    }
);