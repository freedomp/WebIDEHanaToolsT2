define(
    [
        "commonddl/ace/BaseEditorNavigationHandler",
        "commonddl/ace/BaseDdlTokenizerWithWorker",
        "commonddl/ace/AbstractSemanticCodeCompletionRepositoryAccess",
        "commonddl/ace/TokenTooltip"
    ],
    function (BaseEditorNavigationHandler,
              BaseDdlTokenizerWithWorker,
              AbstractSemanticCodeCompletionRepositoryAccess,
              TokenTooltip) {

        return {
            BaseEditorNavigationHandler: BaseEditorNavigationHandler,
            BaseDdlTokenizerWithWorker: BaseDdlTokenizerWithWorker,
            AbstractSemanticCodeCompletionRepositoryAccess: AbstractSemanticCodeCompletionRepositoryAccess,
            TokenTooltip: TokenTooltip
        };
    }
);
