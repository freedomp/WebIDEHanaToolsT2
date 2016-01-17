define(
    ["commonddl/astmodel/SourceRangeImpl","commonddl/astmodel/EObjectContainmentEList"], //dependencies
    function (SourceRangeImpl,EObjectContainmentEList) {
        function OrderByImpl() {
            SourceRangeImpl.call(this);
        }
        OrderByImpl.prototype = Object.create(SourceRangeImpl.prototype);
        OrderByImpl.prototype.entries = null;
        OrderByImpl.prototype.constructor = OrderByImpl;
        OrderByImpl.prototype.getEntries = function() {
            /*eslint-disable no-eq-null*/
            if (this.entries == null) {
                this.entries = new EObjectContainmentEList(this);
            }
            return this.entries;
        };
        return OrderByImpl;
    }
);