define(
    ["commonddl/DdlCodeCompletionType","commonddl/AbstractDdlCodeCompletionProposal"], //dependencies
    function (DdlCodeCompletionType,AbstractDdlCodeCompletionProposal) {

        function DdlKeywordCodeCompletionProposal(name) {
            AbstractDdlCodeCompletionProposal.call(this,name,DdlCodeCompletionType.KEYWORD);
            this.replacementLength = 0;
        }
        DdlKeywordCodeCompletionProposal.prototype = Object.create(AbstractDdlCodeCompletionProposal.prototype);

        return DdlKeywordCodeCompletionProposal;
    }
);