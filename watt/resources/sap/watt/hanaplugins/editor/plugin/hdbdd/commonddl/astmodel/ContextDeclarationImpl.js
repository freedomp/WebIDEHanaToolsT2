define(
    ["commonddl/astmodel/DdlStatementImpl","commonddl/astmodel/EObjectContainmentEList"], //dependencies
    function (DdlStatementImpl,EObjectContainmentEList) {
        function ContextDeclarationImpl() {
            DdlStatementImpl.call(this);
        }
        ContextDeclarationImpl.prototype = Object.create(DdlStatementImpl.prototype);
        ContextDeclarationImpl.prototype.annotationList = null;
        ContextDeclarationImpl.prototype.statements = null;
        ContextDeclarationImpl.prototype.constructor = ContextDeclarationImpl;
        ContextDeclarationImpl.prototype.getAnnotationList = function() {
            /*eslint-disable no-eq-null*/
            if (this.annotationList == null) {
                this.annotationList = [];
            }
            return this.annotationList;
        };
        ContextDeclarationImpl.prototype.getStatements = function() {
            /*eslint-disable no-eq-null*/
            if (this.statements == null) {
                this.statements = new EObjectContainmentEList(this);
            }
            return this.statements;
        };
        return ContextDeclarationImpl;
    }
);