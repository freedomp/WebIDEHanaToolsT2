define(
    ["commonddl/astmodel/ExpressionImpl", "commonddl/astmodel/EObjectContainmentEList"], //dependencies
    function (ExpressionImpl, EObjectContainmentEList) {
        function InExpressionImpl() {
            ExpressionImpl.call(this);
        }

        InExpressionImpl.prototype = Object.create(ExpressionImpl.prototype);
        InExpressionImpl.prototype.left = null;
        InExpressionImpl.prototype.ins = null;
        InExpressionImpl.prototype.constructor = InExpressionImpl;
        InExpressionImpl.prototype.getLeft = function () {
            return this.left;
        };
        InExpressionImpl.prototype.basicSetLeft = function (newLeft, msgs) {
            var oldLeft = this.left;
            this.left = newLeft;
            this.left.setContainer(this);
            return msgs;
        };
        InExpressionImpl.prototype.setLeft = function (newLeft) {
            if (newLeft !== this.left) {
                this.basicSetLeft(newLeft);
            }
        };
        InExpressionImpl.prototype.getIns = function () {
            /*eslint-disable no-eq-null*/
            if (this.ins == null) {
                this.ins = new EObjectContainmentEList(this);
            }
            return this.ins;
        };
        return InExpressionImpl;
    }
);