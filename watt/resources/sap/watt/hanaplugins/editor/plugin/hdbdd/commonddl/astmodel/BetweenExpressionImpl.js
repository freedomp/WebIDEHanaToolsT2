define(
    ["commonddl/astmodel/ExpressionImpl"], //dependencies
    function (ExpressionImpl) {
        function BetweenExpressionImpl() {
            ExpressionImpl.call(this);
        }
        BetweenExpressionImpl.prototype = Object.create(ExpressionImpl.prototype);
        BetweenExpressionImpl.prototype.left = null;
        BetweenExpressionImpl.prototype.lower = null;
        BetweenExpressionImpl.prototype.upper = null;
        BetweenExpressionImpl.prototype.constructor = BetweenExpressionImpl;

        BetweenExpressionImpl.prototype.getLeft = function() {
            return this.left;
        };
        BetweenExpressionImpl.prototype.basicSetLeft = function(newLeft,msgs) {
            var oldLeft = this.left;
            this.left = newLeft;
            this.left.setContainer(this);
            return msgs;
        };
        BetweenExpressionImpl.prototype.setLeft = function(newLeft) {
            if (newLeft !== this.left) {
                this.basicSetLeft(newLeft);
            }
        };
        BetweenExpressionImpl.prototype.getLower = function() {
            return this.lower;
        };
        BetweenExpressionImpl.prototype.basicSetLower = function(newLower,msgs) {
            var oldLower = this.lower;
            this.lower = newLower;
            this.lower.setContainer(this);
            return msgs;
        };
        BetweenExpressionImpl.prototype.setLower = function(newLower) {
            if (newLower !== this.lower) {
                this.basicSetLower(newLower);
            }
        };
        BetweenExpressionImpl.prototype.getUpper = function() {
            return this.upper;
        };
        BetweenExpressionImpl.prototype.basicSetUpper = function(newUpper,msgs) {
            var oldUpper = this.upper;
            this.upper = newUpper;
            this.upper.setContainer(this);
            return msgs;
        };
        BetweenExpressionImpl.prototype.setUpper = function(newUpper) {
            if (newUpper !== this.upper) {
                this.basicSetUpper(newUpper);
            }
        };
        return BetweenExpressionImpl;
    }
);