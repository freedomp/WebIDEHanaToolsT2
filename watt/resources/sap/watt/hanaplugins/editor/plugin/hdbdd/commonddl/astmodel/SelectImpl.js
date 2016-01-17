define(
    [
        "commonddl/astmodel/OrderByImpl",
        "commonddl/astmodel/SourceRangeImpl"
    ], //dependencies
    function (
        OrderByImpl,SourceRangeImpl
        ) {
        function SelectImpl() {
            SourceRangeImpl.call(this);
        }
        SelectImpl.prototype = Object.create(SourceRangeImpl.prototype);
        SelectImpl.prototype.orderBy = null;
        SelectImpl.prototype.constructor = SelectImpl;
        SelectImpl.prototype.getOrderBy = function() {
            return this.orderBy;
        };
        SelectImpl.prototype.basicSetOrderBy = function(newOrderBy,msgs) {
            var oldOrderBy = this.orderBy;
            this.orderBy = newOrderBy;
            this.orderBy.setContainer(this);
            return msgs;
        };
        SelectImpl.prototype.setOrderBy = function(newOrderBy) {
            if (newOrderBy !== this.orderBy) {
                this.basicSetOrderBy(newOrderBy);
            }
        };
        return SelectImpl;
    }
);