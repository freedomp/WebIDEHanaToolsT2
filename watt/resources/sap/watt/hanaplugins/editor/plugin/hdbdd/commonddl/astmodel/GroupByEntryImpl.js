define(
    ["commonddl/astmodel/SourceRangeImpl"], //dependencies
    function (SourceRangeImpl) {
        function GroupByEntryImpl() {
            SourceRangeImpl.call(this);
        }
        GroupByEntryImpl.prototype = Object.create(SourceRangeImpl.prototype);
        GroupByEntryImpl.prototype.expression = null;
        GroupByEntryImpl.prototype.constructor = GroupByEntryImpl;
        GroupByEntryImpl.prototype.getExpression = function() {
            return this.expression;
        };
        GroupByEntryImpl.prototype.basicSetExpression = function(newExpression,msgs) {
            var oldExpression = this.expression;
            this.expression = newExpression;
            this.expression.setContainer(this);
            return msgs;
        };
        GroupByEntryImpl.prototype.setExpression = function(newExpression) {
            if (newExpression !== this.expression) {
                this.basicSetExpression(newExpression);
            }
        };
        return GroupByEntryImpl;
    }
);