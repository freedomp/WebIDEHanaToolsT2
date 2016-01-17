define(
    ["commonddl/astmodel/DdlStatementImpl","commonddl/astmodel/EObjectContainmentEList"], //dependencies
    function (DdlStatementImpl,EObjectContainmentEList) {
        function ComponentDeclarationImpl() {
            DdlStatementImpl.call(this);
        }
        ComponentDeclarationImpl.prototype = Object.create(DdlStatementImpl.prototype);
        ComponentDeclarationImpl.prototype.elements = null;
        ComponentDeclarationImpl.prototype.constructor = ComponentDeclarationImpl;
        ComponentDeclarationImpl.prototype.getElements = function() {
            /*eslint-disable no-eq-null*/
            if (this.elements == null) {
                this.elements = new EObjectContainmentEList(this);
            }
            return this.elements;
        };
        return ComponentDeclarationImpl;
    }
);