define(
    ["commonddl/astmodel/EObjectImpl","require","rndrt/rnd"], //dependencies
    function (EObjectImpl,require,rnd) {
        function ColumnImpl() {
            EObjectImpl.call(this);
        }
        ColumnImpl.prototype = Object.create(EObjectImpl.prototype);
        ColumnImpl.NAME_EDEFAULT = null;
        ColumnImpl.SELECTED_EDEFAULT = null;
        ColumnImpl.prototype.selected = ColumnImpl.SELECTED_EDEFAULT;
        ColumnImpl.prototype.expressions = null;
        ColumnImpl.prototype.name = "";
        ColumnImpl.prototype.constructor = ColumnImpl;
        ColumnImpl.prototype.getName = function() {
            return this.name;
        };
        ColumnImpl.prototype.getSelected = function() {
            return this.selected;
        };
        ColumnImpl.prototype.setSelected = function(newSelected) {
            var oldSelected = this.selected;
            this.selected = newSelected;
        };
        ColumnImpl.prototype.getExpressions = function() {
            var ViewSelectImpl = require("commonddl/astmodel/ViewSelectImpl");
            /*eslint-disable no-eq-null*/
            if (this.expressions == null) {
                this.expressions = [];//new EObjectEList<IPathExpression>(IPathExpression.class,this,IAstPackage.COLUMN__EXPRESSIONS);
                var prnt = this;
                /*eslint-disable no-eq-null*/
                while (prnt != null) {
                    if (prnt instanceof ViewSelectImpl) {
                        (prnt).computeAllExpressionColumns();
                    }
                    prnt = prnt.eContainer();
                }
            }
            return this.expressions;
        };
        ColumnImpl.prototype.toString = function() {
            var result = new rnd.StringBuffer(EObjectImpl.prototype.toString.call(this));
            result.append(" (selected: ");
            result.append(this.selected);
            result.append(")");
            return result.toString();
        };
        return ColumnImpl;
    }
);