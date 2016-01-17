define(
        ["rndrt/rnd","commonddl/astmodel/RuleFromClauseImpl"

        ], // dependencies
        function(rnd,RuleFromClauseImpl) {
            function PrefixRuleFromClauseImpl() {
                RuleFromClauseImpl.call(this);
            }
            PrefixRuleFromClauseImpl.prototype = Object
                    .create(RuleFromClauseImpl.prototype);
            PrefixRuleFromClauseImpl.ON_TOKEN_EDEFAULT = null;
            PrefixRuleFromClauseImpl.prototype.onToken = PrefixRuleFromClauseImpl.ON_TOKEN_EDEFAULT;
            PrefixRuleFromClauseImpl.prototype.constructor = PrefixRuleFromClauseImpl;
            PrefixRuleFromClauseImpl.prototype.getOnToken = function() {
                return this.onToken;
            };
            PrefixRuleFromClauseImpl.prototype.setOnToken = function(newOnToken) {
                var oldOnToken = this.onToken;
                this.onToken = newOnToken;
            };
            PrefixRuleFromClauseImpl.prototype.toString = function() {
                var result = new rnd.StringBuffer(
                        RuleFromClauseImpl.prototype.toString.call(this));
                result.append(" (onToken: ");
                result.append(this.onToken);
                result.append(")");
                return result.toString();
            };
            return PrefixRuleFromClauseImpl;
        });