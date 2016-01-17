define(
    ["commonddl/astmodel/SourceRangeImpl","commonddl/astmodel/EObjectContainmentEList"], //dependencies
    function (SourceRangeImpl,EObjectContainmentEList) {
        function GroupByImpl() {
            SourceRangeImpl.call(this);
        }
        GroupByImpl.prototype = Object.create(SourceRangeImpl.prototype);
        GroupByImpl.prototype.entries = null;
        GroupByImpl.prototype.constructor = GroupByImpl;
        GroupByImpl.prototype.getEntries = function() {
            /*eslint-disable no-eq-null*/
            if (this.entries == null) {
                this.entries = new EObjectContainmentEList(this);
            }
            return this.entries;
        };
        return GroupByImpl;
    }
);