define(
    ["commonddl/astmodel/SourceRangeImpl","commonddl/astmodel/EObjectContainmentEList"], //dependencies
    function (SourceRangeImpl,EObjectContainmentEList) {
        function EnumerationDeclarationImpl() {
            SourceRangeImpl.call(this);
        }
        EnumerationDeclarationImpl.prototype = Object.create(SourceRangeImpl.prototype);
        EnumerationDeclarationImpl.prototype.values = null;
        EnumerationDeclarationImpl.prototype.constructor = EnumerationDeclarationImpl;
        EnumerationDeclarationImpl.prototype.getValues = function() {
            /*eslint-disable no-eq-null*/
            if (this.values == null) {
                this.values = new EObjectContainmentEList(this);
            }
            return this.values;
        };
        return EnumerationDeclarationImpl;
    }
);