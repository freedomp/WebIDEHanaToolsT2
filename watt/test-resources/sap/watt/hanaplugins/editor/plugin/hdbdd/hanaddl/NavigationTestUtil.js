define(
    [
        "./TestUtilEclipseSelectionHandling",
        "hanaddl/hanaddlNonUi",
        "hanaddl/hanaddlUi"
    ],
    function (TestUtilEclipseSelectionHandling, hanaddlNonUi, hanaddlUi) {
        var EditorNavigationHandler = hanaddlUi.EditorNavigationHandler;

        function NavigationTestUtil() {
        }

        NavigationTestUtil.navigate = function (sourceParam, parser, padFileResolver) {
            var editor = {};
            var cut = new EditorNavigationHandler(editor, parser, padFileResolver);
            var resultRow = 0;
            var resultColumn = 0;
            cut.navigateToSameFile = function (aceEditor, startRow, startColumn, endRow, endColumn) {
                resultRow = startRow;
                resultColumn = startColumn;
            };
            var sourceWithSelections = sourceParam;
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections, source, selections);

            var expResult = NavigationTestUtil.convertOffsetToRowColumn(source[0], selections["one"].getOffset());
            var rc = NavigationTestUtil.convertOffsetToRowColumn(source[0], selections["two"].getOffset());
            var row = rc.row;
            var column = rc.column;
            return cut.doNavigate(NavigationTestUtil.createTextEditor(source[0]), row, column + 1, column).then(function(){
                equal(expResult.row, resultRow);
                equal(expResult.column, resultColumn);
            });
        };

        NavigationTestUtil.navigateToOtherEditor = function (sourceParam, offset, parser, padFileResolver, project, expectedResultOffset) {
            var editor = {};
            var cut = new EditorNavigationHandler(editor, parser, padFileResolver);
            var resultStartRow;
            var resultStartColumn;
            cut.openAndNavigateToDifferentFile = function (url, context, startRow, startColumn, endRow, endColumn) {
                resultStartRow = startRow;
                resultStartColumn = startColumn;
            };
            var source = sourceParam;

            var expectedResult = NavigationTestUtil.convertOffsetToRowColumn(window.targetFileContent, expectedResultOffset);

            var rc = NavigationTestUtil.convertOffsetToRowColumn(source, offset);
            var row = rc.row;
            var column = rc.column;
            return cut.doNavigate(NavigationTestUtil.createTextEditor(source), row, column + 1, column).then(function() {
                equal(resultStartRow, expectedResult.row);
                equal(resultStartColumn, expectedResult.column);
            });
        };

        NavigationTestUtil.navigateToExternalAttribute = function (sourceParam, targetSourceParam, parser, padFileResolver, expRow, expColumn) {
            //inject CompilationUnitManager.getCU call
            var origGetCu = hanaddlNonUi.CompilationUnitManager.singleton.getCU;
            try {
                hanaddlNonUi.CompilationUnitManager.singleton.getCU = function (fqn, project) {
                    var resolver = project.versionFactory.createPadFileResolver(project.version);
                    var ast = project.parseAndGetAst2(padFileResolver, targetSourceParam);
                    return ast;
                };

                var editor = {};
                var cut = new EditorNavigationHandler(editor, parser, padFileResolver);
                var resultRow = 0;
                var resultColumn = 0;
                cut.openAndNavigateToDifferentFile = function (url, context, startRow, startColumn, endRow, endColumn) {
                    resultRow = startRow;
                    resultColumn = startColumn;
                };
                var sourceWithSelections = sourceParam;
                var source = [""];
                var selections = {};
                TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections, source, selections);

                var rc = NavigationTestUtil.convertOffsetToRowColumn(source[0], selections["one"].getOffset());
                var row = rc.row;
                var column = rc.column;
                return cut.doNavigate(NavigationTestUtil.createTextEditor(source[0]), row, column + 1, column).then(function() {
                    equal(expRow, resultRow);
                    equal(expColumn, resultColumn);
                }).fin(function(){
                    hanaddlNonUi.CompilationUnitManager.singleton.getCU = origGetCu;
                });
            } finally {
                hanaddlNonUi.CompilationUnitManager.singleton.getCU = origGetCu;
            }
        };

        NavigationTestUtil.convertOffsetToRowColumn = function (str, offset) {
            var row = 0;
            var column = 0;
            for (var i = 0; i < str.length; i++) {
                if (i === offset)
                    break;
                if (str[i] == '\n') {
                    row++;
                    column = 0;
                    continue;
                }
                column++;
            }
            return {row: row, column: column};
        };
        NavigationTestUtil.navigateNoResult = function (sourceParam, parser, padFileResolver) {
            var editor = {};
            var cut = new EditorNavigationHandler(editor, parser, padFileResolver);
            var resultRow = -1;
            var resultColumn = -1;
            cut.navigateToSameFile = function (aceEditor, startRow, startColumn, endRow, endColumn) {
                resultRow = startRow;
                resultColumn = startColumn;
            };
            var sourceWithSelections = sourceParam;
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections, source, selections);

            var rc = NavigationTestUtil.convertOffsetToRowColumn(source[0], selections["two"].getOffset());
            var row = rc.row;
            var column = rc.column;
            return cut.doNavigate(NavigationTestUtil.createTextEditor(source[0]), row, column, column).then(function(){
                equal(-1, resultRow);
                equal(-1, resultColumn);
            });
        };
        NavigationTestUtil.createTextEditor = function (source) {
            var lines = source.split("\n");
            return {
                session: {
                    doc: {
                        $lines: lines
                    }
                }
            };
        };
        return NavigationTestUtil;
    }
);