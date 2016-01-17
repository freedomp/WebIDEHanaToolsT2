define(["commonddl/astmodel/RuleFromClauseImpl"

], // dependencies
function(RuleFromClauseImpl) {
    function PostfixRuleFromClauseImpl() {
        RuleFromClauseImpl.call(this);
    }
    PostfixRuleFromClauseImpl.prototype = Object
            .create(RuleFromClauseImpl.prototype);
    PostfixRuleFromClauseImpl.prototype.constructor = PostfixRuleFromClauseImpl;
    return PostfixRuleFromClauseImpl;
});