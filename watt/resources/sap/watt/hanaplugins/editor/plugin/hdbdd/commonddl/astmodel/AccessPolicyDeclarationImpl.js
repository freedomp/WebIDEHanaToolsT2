define(
        [ "commonddl/astmodel/DdlStatementImpl", "commonddl/astmodel/EObjectContainmentEList"

        ], // dependencies
        function(DdlStatementImpl, EObjectContainmentEList) {
            function AccessPolicyDeclarationImpl() {
                DdlStatementImpl.call(this);
            }
            AccessPolicyDeclarationImpl.prototype = Object.create(DdlStatementImpl.prototype);
            AccessPolicyDeclarationImpl.prototype.annotationList = null;
            AccessPolicyDeclarationImpl.prototype.statements = null;
            AccessPolicyDeclarationImpl.prototype.constructor = AccessPolicyDeclarationImpl;
            AccessPolicyDeclarationImpl.prototype.getAnnotationList = function() {
                /*eslint-disable no-eq-null*/
                if (this.annotationList == null) {
                    this.annotationList = [];
                }
                return this.annotationList;
            };
            AccessPolicyDeclarationImpl.prototype.getStatements = function() {
                /*eslint-disable no-eq-null*/
                if (this.statements == null) {
                    this.statements = new EObjectContainmentEList(this);
                }
                return this.statements;
            };
            return AccessPolicyDeclarationImpl;
        });