define(
        ["commonddl/astmodel/DdlStatementImpl","commonddl/astmodel/EObjectContainmentEList"

        ], // dependencies
        function(DdlStatementImpl, EObjectContainmentEList) {
            function RoleDeclarationImpl() {
                DdlStatementImpl.call(this);
            }
            RoleDeclarationImpl.prototype = Object
                    .create(DdlStatementImpl.prototype);
            RoleDeclarationImpl.prototype.annotationList = null;
            RoleDeclarationImpl.prototype.entries = null;
            RoleDeclarationImpl.prototype.constructor = RoleDeclarationImpl;
            RoleDeclarationImpl.prototype.getAnnotationList = function() {
                /*eslint-disable no-eq-null*/
                if (this.annotationList == null) {
                    this.annotationList = [];
                }
                return this.annotationList;
            };
            RoleDeclarationImpl.prototype.getEntries = function() {
                /*eslint-disable no-eq-null*/
                if (this.entries == null) {
                    this.entries = new EObjectContainmentEList(this);
                }
                return this.entries;
            };
            return RoleDeclarationImpl;
        });