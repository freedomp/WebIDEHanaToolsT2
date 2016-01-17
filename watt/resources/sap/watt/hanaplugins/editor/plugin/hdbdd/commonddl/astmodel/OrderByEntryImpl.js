define(
    ["rndrt/rnd", "commonddl/astmodel/SourceRangeImpl"], //dependencies
    function (rnd, SourceRangeImpl) {
        function OrderByEntryImpl() {
            SourceRangeImpl.call(this);
        }
        OrderByEntryImpl.prototype = Object.create(SourceRangeImpl.prototype);
        OrderByEntryImpl.prototype.expression = null;
        OrderByEntryImpl.ORDER_SEQUENCE_TOKEN_EDEFAULT = null;
        OrderByEntryImpl.prototype.orderSequenceToken = OrderByEntryImpl.ORDER_SEQUENCE_TOKEN_EDEFAULT;
        OrderByEntryImpl.NULLS_TOKEN_EDEFAULT = null;
        OrderByEntryImpl.prototype.nullsToken = OrderByEntryImpl.NULLS_TOKEN_EDEFAULT;
        OrderByEntryImpl.NULLS_FIRST_LAST_TOKEN_EDEFAULT = null;
        OrderByEntryImpl.prototype.nullsFirstLastToken = OrderByEntryImpl.NULLS_FIRST_LAST_TOKEN_EDEFAULT;
        OrderByEntryImpl.prototype.constructor = OrderByEntryImpl;
        OrderByEntryImpl.prototype.getExpression = function () {
            return this.expression;
        };
        OrderByEntryImpl.prototype.basicSetExpression = function (newExpression, msgs) {
            var oldExpression = this.expression;
            this.expression = newExpression;
            this.expression.setContainer(this);
            return msgs;
        };
        OrderByEntryImpl.prototype.setExpression = function (newExpression) {
            if (newExpression !== this.expression) {
                this.basicSetExpression(newExpression);
            }
        };
        OrderByEntryImpl.prototype.getOrderSequenceToken = function () {
            return this.orderSequenceToken;
        };
        OrderByEntryImpl.prototype.setOrderSequenceToken = function (newOrderSequenceToken) {
            var oldOrderSequenceToken = this.orderSequenceToken;
            this.orderSequenceToken = newOrderSequenceToken;
        };
        OrderByEntryImpl.prototype.getNullsToken = function () {
            return this.nullsToken;
        };
        OrderByEntryImpl.prototype.setNullsToken = function (newNullsToken) {
            var oldNullsToken = this.nullsToken;
            this.nullsToken = newNullsToken;
        };
        OrderByEntryImpl.prototype.getNullsFirstLastToken = function () {
            return this.nullsFirstLastToken;
        };
        OrderByEntryImpl.prototype.setNullsFirstLastToken = function (newNullsFirstLastToken) {
            var oldNullsFirstLastToken = this.nullsFirstLastToken;
            this.nullsFirstLastToken = newNullsFirstLastToken;
        };
        OrderByEntryImpl.prototype.toString = function () {
            var result = new rnd.StringBuffer(SourceRangeImpl.prototype.toString.call(this));
            result.append(" (orderSequenceToken: ");
            result.append(this.orderSequenceToken);
            result.append(", nullsToken: ");
            result.append(this.nullsToken);
            result.append(", nullsFirstLastToken: ");
            result.append(this.nullsFirstLastToken);
            result.append(")");
            return result.toString();
        };
        return OrderByEntryImpl;
    }
);