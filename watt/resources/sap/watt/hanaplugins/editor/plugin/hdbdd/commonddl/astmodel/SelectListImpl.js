define(
    ["commonddl/astmodel/SourceRangeImpl","commonddl/astmodel/EObjectContainmentEList"], //dependencies
    function (SourceRangeImpl,EObjectContainmentEList) {
        function SelectListImpl() {
            SourceRangeImpl.call(this);
        }
        SelectListImpl.prototype = Object.create(SourceRangeImpl.prototype);
        SelectListImpl.prototype.entries = null;
        SelectListImpl.prototype.constructor = SelectListImpl;
        SelectListImpl.prototype.getEntries = function() {
            /*eslint-disable no-eq-null*/
            if (this.entries == null) {
                this.entries = new EObjectContainmentEList(this);
            }
            return this.entries;
        };
        SelectListImpl.prototype.getEntry = function(selectListEntry) {
            throw new Error();
        };
        SelectListImpl.prototype.addEntry2 = function(selectListEntry,entry) {
            throw new Error();
        };
        SelectListImpl.prototype.addEntry1 = function(entry) {
            /*eslint-disable no-eq-null*/
            if (entry == null) {
                return;
            }
            this.getEntries().push(entry);
        };
        return SelectListImpl;
    }
);