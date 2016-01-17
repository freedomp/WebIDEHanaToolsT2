define(
    ["commonddl/astmodel/SourceRangeImpl", "rndrt/rnd"], //dependencies
    function (SourceRangeImpl, rnd) {
        function EnumerationValueImpl() {
            SourceRangeImpl.call(this);
        }
        EnumerationValueImpl.prototype = Object.create(SourceRangeImpl.prototype);
        EnumerationValueImpl.SYMBOL_EDEFAULT = null;
        EnumerationValueImpl.prototype.symbol = EnumerationValueImpl.SYMBOL_EDEFAULT;
        EnumerationValueImpl.prototype.literal = null;
        EnumerationValueImpl.prototype.constructor = EnumerationValueImpl;
        EnumerationValueImpl.prototype.getSymbol = function () {
            return this.symbol;
        };
        EnumerationValueImpl.prototype.setSymbol = function (newSymbol) {
            var oldSymbol = this.symbol;
            this.symbol = newSymbol;
        };
        EnumerationValueImpl.prototype.getLiteral = function () {
            return this.literal;
        };
        EnumerationValueImpl.prototype.basicSetLiteral = function (newLiteral, msgs) {
            var oldLiteral = this.literal;
            this.literal = newLiteral;
            return msgs;
        };
        EnumerationValueImpl.prototype.setLiteral = function (newLiteral) {
            if (newLiteral !== this.literal) {
                this.basicSetLiteral(newLiteral);
            }
        };
        EnumerationValueImpl.prototype.toString = function () {
            var result = new rnd.StringBuffer(SourceRangeImpl.prototype.toString.call(this));
            result.append(" (symbol: ");
            result.append(this.symbol);
            result.append(")");
            return result.toString();
        };
        return EnumerationValueImpl;
    }
);