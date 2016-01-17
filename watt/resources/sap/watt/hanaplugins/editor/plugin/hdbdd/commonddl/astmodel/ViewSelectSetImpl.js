define(
    [
        "rndrt/rnd",
        "commonddl/astmodel/SelectImpl"
    ], //dependencies
    function (rnd, SelectImpl) {
        var Token = rnd.Token;
        var StringBuffer = rnd.StringBuffer;
        function ViewSelectSetImpl() {
            SelectImpl.call(this);
        }
        ViewSelectSetImpl.prototype = Object.create(SelectImpl.prototype);
        ViewSelectSetImpl.prototype.left = null;
        ViewSelectSetImpl.prototype.right = null;
        ViewSelectSetImpl.OPERATOR_EDEFAULT = null;
        ViewSelectSetImpl.prototype.operator = ViewSelectSetImpl.OPERATOR_EDEFAULT;
        ViewSelectSetImpl.DISTINCT_EDEFAULT = null;
        ViewSelectSetImpl.prototype.distinct = ViewSelectSetImpl.DISTINCT_EDEFAULT;
        ViewSelectSetImpl.ALL_EDEFAULT = null;
        ViewSelectSetImpl.prototype.all = ViewSelectSetImpl.ALL_EDEFAULT;
        ViewSelectSetImpl.prototype.constructor = ViewSelectSetImpl;
        ViewSelectSetImpl.prototype.getLeft = function () {
            return this.left;
        };
        ViewSelectSetImpl.prototype.basicSetLeft = function (newLeft, msgs) {
            var oldLeft = this.left;
            this.left = newLeft;
            this.left.setContainer(this);
            return msgs;
        };
        ViewSelectSetImpl.prototype.setLeft = function (newLeft) {
            if (newLeft !== this.left) {
                /*eslint-disable no-eq-null*/
                if (newLeft != null) {
                    //newLeft.eInverseRemove(this, IAstPackage.VIEW_DEFINITION__SELECT);
                    // Cannot be migrated. We need it in case we have UNION. Select within
                    // ViewDefinitionImpl must be reseted
                    if (newLeft.getViewDefinition !== undefined) {
                        newLeft.getViewDefinition(newLeft).setSelect(null);
                    }
                }
                this.basicSetLeft(newLeft);
            }
        };
        ViewSelectSetImpl.prototype.getRight = function () {
            return this.right;
        };
        ViewSelectSetImpl.prototype.basicSetRight = function (newRight, msgs) {
            var oldRight = this.right;
            this.right = newRight;
            this.right.setContainer(this);
            return msgs;
        };
        ViewSelectSetImpl.prototype.setRight = function (newRight) {
            if (newRight !== this.right) {
                this.basicSetRight(newRight);
            }
        };
        ViewSelectSetImpl.prototype.getOperator = function () {
            return this.operator;
        };
        ViewSelectSetImpl.prototype.setOperator = function (newOperator) {
            var oldOperator = this.operator;
            this.operator = newOperator;
        };
        ViewSelectSetImpl.prototype.getDistinct = function () {
            return this.distinct;
        };
        ViewSelectSetImpl.prototype.setDistinct = function (newDistinct) {
            var oldDistinct = this.distinct;
            this.distinct = newDistinct;
        };
        ViewSelectSetImpl.prototype.getAll = function () {
            return this.all;
        };
        ViewSelectSetImpl.prototype.setAll = function (newAll) {
            var oldAll = this.all;
            this.all = newAll;
        };
        ViewSelectSetImpl.prototype.toString = function () {
            var result = new rnd.StringBuffer(SelectImpl.prototype.toString.call(this));
            result.append(" (operator: ");
            result.append(this.operator);
            result.append(", distinct: ");
            result.append(this.distinct);
            result.append(", all: ");
            result.append(this.all);
            result.append(")");
            return result.toString();
        };
        return ViewSelectSetImpl;
    }
);