define([
        "hanaddl/ace/EditorNavigationHandler",
        "hanaddl/ace/HanaDdlTokenizerWithWorker",
        "hanaddl/ace/HanaRepositoryAccess"
    ],
    function (EditorNavigationHandler,
              HanaDdlTokenizerWithWorker,
              HanaRepositoryAccess) {

        return {
            EditorNavigationHandler: EditorNavigationHandler,
            HanaDdlTokenizerWithWorker: HanaDdlTokenizerWithWorker,
            HanaRepositoryAccess: HanaRepositoryAccess
        };
    }
);
