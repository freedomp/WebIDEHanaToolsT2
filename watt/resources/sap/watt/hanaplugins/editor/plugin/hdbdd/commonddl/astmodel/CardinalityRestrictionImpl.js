// based on commit
//46c2ae038d5b999086be0a8b5470f7ebe155b51f AST: add parameter type,len,dec and filter cardinality restriction
define(
    [
        "rndrt/rnd","commonddl/astmodel/SourceRangeImpl"
    ], //dependencies
    function (
        rnd,SourceRangeImpl
        ) {
        var Token = rnd.Token;
        var StringBuffer = rnd.StringBuffer;
        function CardinalityRestrictionImpl() {
            SourceRangeImpl.call(this);
        }
        CardinalityRestrictionImpl.prototype = Object.create(SourceRangeImpl.prototype);
        CardinalityRestrictionImpl.VALUE_EDEFAULT = null;
        CardinalityRestrictionImpl.prototype.value = CardinalityRestrictionImpl.VALUE_EDEFAULT;
        CardinalityRestrictionImpl.COLON_EDEFAULT = null;
        CardinalityRestrictionImpl.prototype.colon = CardinalityRestrictionImpl.COLON_EDEFAULT;
        CardinalityRestrictionImpl.prototype.constructor = CardinalityRestrictionImpl;
        CardinalityRestrictionImpl.prototype.getValue = function() {
            return this.value;
        };
        CardinalityRestrictionImpl.prototype.setValue = function(newValue) {
            var oldValue = this.value;
            this.value = newValue;
        };
        CardinalityRestrictionImpl.prototype.getColon = function() {
            return this.colon;
        };
        CardinalityRestrictionImpl.prototype.setColon = function(newColon) {
            var oldColon = this.colon;
            this.colon = newColon;
        };
        CardinalityRestrictionImpl.prototype.toString = function() {
            var result = new StringBuffer(SourceRangeImpl.prototype.toString.call(this));
            result.append(" (value: ");
            result.append(this.value);
            result.append(", colon: ");
            result.append(this.colon);
            result.append(")");
            return result.toString();
        };
        return CardinalityRestrictionImpl;
    }
);