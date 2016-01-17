define("sap.watt.hana.editor.hdbdd/Plugin", function () {

    return {
        initialize: function initialize() {

            var that = this;

            var hdbddRootPath = "sap/watt/hanaplugins/editor/plugin/hdbdd";
            var libRootPath = "sap/watt/hanaplugins/lib";

            var commonddlPath = hdbddRootPath + "/commonddl";
            var cssPath = hdbddRootPath + "/css";
            var hdbddPath = hdbddRootPath;
            var hanaddlPath = hdbddRootPath + "/hanaddl";
            var modePath = hdbddRootPath + "/mode";
            var rndrtPath = libRootPath + "/rndrt";

            require.config({
                waitSeconds: 0,
                paths: {
                    "commonddl": commonddlPath,
                    "hanaddl": hanaddlPath,
                    "hdbdd": hdbddPath,
                    "mode": modePath,
                    "rndrt": rndrtPath
                }
            });

            jQuery.sap.includeStyleSheet(jQuery.sap.getModulePath(cssPath) + "/hdbdd.css");

            require(["hanaddl/hanaddlCache"], function (cache) {
                // cache preferences for further usage
                that.context.service.preferences.get("sap.hana.ide.editor.ide").then(function (preferences) {
                    cache.preferences = preferences || {};
                });

                // cache context for further usage
                cache.context = that.context;
            });
        },

        tabClosed: function tabClosed(event) {

            event.source.getCurrentDocument().then(function getCurrentDocument(document) {

                if (!document) {
                    return; // if last editor is closed "document" is null - this is a bug in WATT
                }
                var entity = document.getEntity();
                if (!entity) {
                    return;
                }
                var ext = entity.getFileExtension();
                if (!ext) {
                    return;
                }

                if ("hdbcds" === ext.toLowerCase()) {
                    // remove the CompilationUnitManager cache

                    var name = entity.getName();
                    if (!name) {
                        return;
                    }

                    var ind = name.lastIndexOf(".hdbcds");
                    var rootContextName = name.substring(0, ind);

                    require(["hanaddl/CompilationUnitManager"], function (CompilationUnitManager) {
                        CompilationUnitManager.singleton.removeTestDataForContext(rootContextName);
                    });
                }
            });
        }
    };
});