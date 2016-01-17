define(
    ["commonddl/astmodel/SourceRangeImpl", "rndrt/rnd"], //dependencies
    function (SourceRangeImpl, rnd) {
        function ExpressionContainerImpl() {
            SourceRangeImpl.call(this);
        }
        ExpressionContainerImpl.prototype = Object.create(SourceRangeImpl.prototype);
        ExpressionContainerImpl.prototype.expression = null;
        ExpressionContainerImpl.SHORT_DESCRIPTION_EDEFAULT = null;
        ExpressionContainerImpl.prototype.shortDescription = ExpressionContainerImpl.SHORT_DESCRIPTION_EDEFAULT;
        ExpressionContainerImpl.prototype.constructor = ExpressionContainerImpl;
        ExpressionContainerImpl.prototype.getExpression = function () {
            return this.expression;
        };
        ExpressionContainerImpl.prototype.basicSetExpression = function (newExpression, msgs) {
            var oldExpression = this.expression;
            this.expression = newExpression;
            this.expression.setContainer(this);
            return msgs;
        };
        ExpressionContainerImpl.prototype.setExpression = function (newExpression) {
            if (newExpression !== this.expression) {
                this.basicSetExpression(newExpression);
            }
        };
        ExpressionContainerImpl.prototype.getShortDescription = function () {
            /*eslint-disable no-eq-null*/
            if (this.shortDescription == null) {
                var start = this.getStartOffset();
                var end = this.getEndOffset();
                var cu = SourceRangeImpl.getCompilationUnit(this);
                this.shortDescription = cu.getParsedSource().substring(start, end);
            }
            return this.shortDescription;
        };
        ExpressionContainerImpl.prototype.toString = function () {
            var result = new rnd.StringBuffer(SourceRangeImpl.prototype.toString.call(this));
            result.append(" (shortDescription: ");
            result.append(this.shortDescription);
            result.append(")");
            return result.toString();
        };
        return ExpressionContainerImpl;
    }
);