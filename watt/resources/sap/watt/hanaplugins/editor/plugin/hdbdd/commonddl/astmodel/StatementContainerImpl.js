define(
    ["commonddl/astmodel/EObjectImpl","commonddl/astmodel/EObjectContainmentEList"], //dependencies
    function (EObjectImpl,EObjectContainmentEList) {
        function StatementContainerImpl() {
            EObjectImpl.call(this);
        }
        StatementContainerImpl.prototype = Object.create(EObjectImpl.prototype);
        StatementContainerImpl.prototype.statements = null;
        StatementContainerImpl.prototype.constructor = StatementContainerImpl;
        StatementContainerImpl.prototype.getStatements = function() {
            /*eslint-disable no-eq-null*/
            if (this.statements == null) {
                this.statements = new EObjectContainmentEList(this);
            }
            return this.statements;
        };
        StatementContainerImpl.isStatementContainerInstance = function(o) {
            /*eslint-disable no-eq-null*/
            if (o != null) {
                if (o.getStatements) {
                    return true;
                }
            }
            return false;

        };
        return StatementContainerImpl;
    }
);