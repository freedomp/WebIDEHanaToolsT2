define(
        ["commonddl/astmodel/RoleComponentDeclarationImpl"

        ], // dependencies
        function(RoleComponentDeclarationImpl) {
            function RuleDeclarationImpl() {
                RoleComponentDeclarationImpl.call(this);
            }
            RuleDeclarationImpl.prototype = Object
                    .create(RoleComponentDeclarationImpl.prototype);
            RuleDeclarationImpl.prototype.from = null;
            RuleDeclarationImpl.prototype.where = null;
            RuleDeclarationImpl.prototype.constructor = RuleDeclarationImpl;
            RuleDeclarationImpl.prototype.getFrom = function() {
                return this.from;
            };
            RuleDeclarationImpl.prototype.basicSetFrom = function(newFrom, msgs) {
                var oldFrom = this.from;
                this.from = newFrom;
                this.from.setContainer(this);
                return msgs;
            };
            RuleDeclarationImpl.prototype.setFrom = function(newFrom) {
                if (newFrom !== this.from) {
                    this.basicSetFrom(newFrom);
                }
            };
            RuleDeclarationImpl.prototype.getWhere = function() {
                return this.where;
            };
            RuleDeclarationImpl.prototype.basicGetWhere = function() {
                return this.where;
            };
            RuleDeclarationImpl.prototype.setWhere = function(newWhere) {
                var oldWhere = this.where;
                this.where = newWhere;
                /*eslint-disable no-eq-null*/
                if (this.where != null) {
                    this.where.setContainer(this);
                }
            };
            return RuleDeclarationImpl;
        });