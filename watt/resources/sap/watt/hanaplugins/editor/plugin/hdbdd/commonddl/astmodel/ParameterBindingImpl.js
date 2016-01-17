/* based on commit 
 * ed4089fb1e5d8b06a17fb28cceb49c7fe1d0f29c CDS: Add Parameter Bindings into AST model
 */
define(["rndrt/rnd","commonddl/astmodel/SourceRangeImpl"], // dependencies
function(rnd,SourceRangeImpl) {
    function ParameterBindingImpl() {
        SourceRangeImpl.call(this);
    }
    ParameterBindingImpl.prototype = Object.create(SourceRangeImpl.prototype);
    ParameterBindingImpl.NAME_TOKEN_EDEFAULT = null;
    ParameterBindingImpl.prototype.nameToken = ParameterBindingImpl.NAME_TOKEN_EDEFAULT;
    ParameterBindingImpl.prototype.value = null;
    ParameterBindingImpl.prototype.constructor = ParameterBindingImpl;
    ParameterBindingImpl.prototype.getNameToken = function() {
        return this.nameToken;
    };
    ParameterBindingImpl.prototype.setNameToken = function(newNameToken) {
        var oldNameToken = this.nameToken;
        this.nameToken = newNameToken;
    };
    ParameterBindingImpl.prototype.getValue = function() {
        return this.value;
    };
    ParameterBindingImpl.prototype.basicSetValue = function(newValue, msgs) {
        var oldValue = this.value;
        this.value = newValue;
        this.value.setContainer(this);
        return msgs;
    };
    ParameterBindingImpl.prototype.setValue = function(newValue) {
        if (newValue !== this.value) {
            this.basicSetValue(newValue);
        }
    };
    ParameterBindingImpl.prototype.toString = function() {
        var result = new rnd.StringBuffer(SourceRangeImpl.prototype.toString.call(this));
        result.append(" (nameToken: ");
        result.append(this.nameToken);
        result.append(")");
        return result.toString();
    };
    return ParameterBindingImpl;
});