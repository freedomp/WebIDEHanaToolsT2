// this file is written by hand and not generated
// it will only work in HANA scenario
define(["hanaddl/hanaddlNonUi"], function (hanaddlNonUi) {

        function EclipseUtil() {
        }

        EclipseUtil.prototype.createSimpleProject = function (str) {
            hanaddlNonUi.CompilationUnitManager.singleton.clearTestData();
            return {name:str};
        };

        EclipseUtil.prototype.createFile = function (project, file, content) {
            var version = hanaddlNonUi.VersionsFactory.versionLast;
            var parser = hanaddlNonUi.DdlParserFactoryRespectingBackendVersion.eInstance.createParser(version);
            var resolver = hanaddlNonUi.DdlParserFactoryRespectingBackendVersion.eInstance.createResolver(version);
            var ast = parser.parseAndGetAst2(resolver,content);
            hanaddlNonUi.CompilationUnitManager.singleton.addTestData(ast);
        };

        return EclipseUtil;
    });