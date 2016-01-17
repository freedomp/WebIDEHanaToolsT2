/*eslint-disable no-eq-null,eqeqeq,camelcase,max-statements,complexity,quotes,curly,max-params,max-len,no-redeclare,no-empty,no-octal-escape,no-fallthrough,radix,no-proto,no-new-wrappers*/
// based on commit
//583ac20c0c8fe14ce2536413c1b7e50a5f038d5a New AST nodes
define(
    [
        "commonddl/astmodel/ExpressionImpl",
        "commonddl/astmodel/EObjectContainmentEList"
    ], //dependencies
    function (ExpressionImpl, EObjectContainmentEList) {
        function ExpressionsContainerExpressionImpl() {
            ExpressionImpl.call(this);
        }

        ExpressionsContainerExpressionImpl.prototype = Object.create(ExpressionImpl.prototype);
        ExpressionsContainerExpressionImpl.prototype.constructor = ExpressionsContainerExpressionImpl;
        ExpressionsContainerExpressionImpl.prototype.expressions = null;
        ExpressionsContainerExpressionImpl.prototype.getExpressions = function () {
            if (this.expressions == null) {
                this.expressions = new EObjectContainmentEList(this);
            }
            return this.expressions;
        };
        return ExpressionsContainerExpressionImpl;
    }
);