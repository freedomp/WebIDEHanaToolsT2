/* based on commit 
 * ed4089fb1e5d8b06a17fb28cceb49c7fe1d0f29c CDS: Add Parameter Bindings into AST model
 */
define(["commonddl/astmodel/SourceRangeImpl", "commonddl/astmodel/EObjectContainmentEList"], // dependencies
function(SourceRangeImpl, EObjectContainmentEList) {
    function ParameterBindingsImpl() {
        SourceRangeImpl.call(this);
    }
    ParameterBindingsImpl.prototype = Object.create(SourceRangeImpl.prototype);
    ParameterBindingsImpl.prototype.bindings = null;
    ParameterBindingsImpl.prototype.constructor = ParameterBindingsImpl;
    ParameterBindingsImpl.prototype.getBindings = function() {
        /*eslint-disable no-eq-null*/
        if (this.bindings == null) {
            this.bindings = new EObjectContainmentEList(this);
        }
        return this.bindings;
    };
    return ParameterBindingsImpl;
});