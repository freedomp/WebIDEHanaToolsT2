
/**
 * Factory for getting an instance of the {@link DdlRndParserApi DDL RND parser}.
 * <p>
 * The usage of the parser requires a so-called PAD file resolver, that provides the necessary PAD fle to the parser.
 * This resolver can also be created with this factory, see {@link createResolver}.
 * <p>
 * Example (note that the parser version 5 should be used):
 * <code>
 *     require(
 *     [
 *          "hanaddl/hanaddlNonUi",
 *          "hanaddl/hanav5/CdsDdlParserResolver"
 *     ],
 *     function (hanaddl) {
 *
 *        var parserFactoryRootFolder = "../../../../../../webapp/resources/editor/plugin/hdbdd";
 *
 *        var version = "5";
 *
 *        var resolver = parserFactoryApi.createResolver(version, parserFactoryRootFolder);
 *        var parser = parserFactoryApi.createParser(version);
 *
 *        var tokens = parser.parseAndGetAst2(resolver, "entity myEntity { myElement : Integer; };").tokenList;
 *     });
 * </code>
 */

define(
    "hanaddl/DdlParserFactoryApi",
    [
        "hanaddl/DdlParserFactoryRespectingBackendVersion",
        "hanaddl/VersionsFactory"
    ],
    function (DdlParserFactoryRespectingBackendVersion, VersionsFactory) {

        var parserFactory = DdlParserFactoryRespectingBackendVersion.eInstance;
        var versionsFactory = VersionsFactory;

        var checkVersion = function checkVersion(iVersion) {

            if (typeof iVersion !== "string") {
                var message = "\"version\" must be a string (\"version\" = " + iVersion + ")";
                throw message;
            }

            var minVersion = 1;
            var maxVersion = versionsFactory.versionLast;
            if (iVersion < minVersion || iVersion > maxVersion) {
                var message = "\"version\" must be between " + minVersion + " and " + maxVersion + " (\"version\" = " + iVersion + ")";
                throw message;
            }
        };

        /**
         * Creates a {@link CdsDdlPadFileResolver parser PAD file resolver} instance.
         *
         * @param nVersion {number} The resolver version, see {@link VersionsFactory}. Parser and resolver instances need to be created for the same version.
         * @param sParserFactoryRootFolder The folder of this parser factory API.
         *
         * @returns {CdsDdlPadFileResolver} The parser PAD file resolver.
         *
         * @see {@link createParser}
         */
        var createResolver = function (nVersion, sParserFactoryRootFolder) {

            checkVersion(nVersion);

            return parserFactory.createResolver(nVersion, sParserFactoryRootFolder + "/hanaddl");
        };

        /**
         * Creates a {@link DdlRndParserApi DDL RND parser} instance.
         *
         * @param nVersion {number} The parser version, see {@link VersionsFactory}. Parser and resolver instances need to be created for the same version.
         *
         * @returns {DdlRndParserApi} The parser instance.
         *
         * @see {@link createResolver}
         */
        var createParser = function (nVersion) {

            checkVersion(nVersion);

            return parserFactory.createParser(nVersion);
        };

        return {
            createResolver: createResolver,
            createParser: createParser,
            versionsFactory: versionsFactory
        };
    }
);
