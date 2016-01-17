define(
        ["rndrt/rnd","commonddl/astmodel/EObjectImpl"

        ], // dependencies
        function(rnd,EObjectImpl

        ) {
            function RuleFromClauseImpl() {
                EObjectImpl.call(this);
            }
            RuleFromClauseImpl.prototype = Object.create(EObjectImpl.prototype);
            RuleFromClauseImpl.prototype.dataSource = null;
            RuleFromClauseImpl.COMMAND_TOKEN_EDEFAULT = null;
            RuleFromClauseImpl.prototype.commandToken = RuleFromClauseImpl.COMMAND_TOKEN_EDEFAULT;
            RuleFromClauseImpl.prototype.constructor = RuleFromClauseImpl;
            RuleFromClauseImpl.prototype.getDataSource = function() {
                return this.dataSource;
            };
            RuleFromClauseImpl.prototype.basicSetDataSource = function(
                    newDataSource, msgs) {
                var oldDataSource = this.dataSource;
                this.dataSource = newDataSource;
                this.dataSource.setContainer(this);
                return msgs;
            };
            RuleFromClauseImpl.prototype.setDataSource = function(newDataSource) {
                if (newDataSource !== this.dataSource) {
                    this.basicSetDataSource(newDataSource);
                }
            };
            RuleFromClauseImpl.prototype.getCommandToken = function() {
                return this.commandToken;
            };
            RuleFromClauseImpl.prototype.setCommandToken = function(
                    newCommandToken) {
                var oldCommandToken = this.commandToken;
                this.commandToken = newCommandToken;
            };
            RuleFromClauseImpl.prototype.toString = function() {
                var result = new rnd.StringBuffer(EObjectImpl.prototype.toString
                        .call(this));
                result.append(" (commandToken: ");
                result.append(this.commandToken);
                result.append(")");
                return result.toString();
            };
            return RuleFromClauseImpl;
        });