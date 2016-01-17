/* global $,jQuery,window */
// iteration 0

(function() {
    "use strict";
    /* eslint no-warning-comments:0 */

    jQuery.sap.declare('sap.ushell.renderers.fiori2.search.SearchIntentsResolver');
    var module = sap.ushell.renderers.fiori2.search.SearchIntentsResolver = function() {
        this.init.apply(this, arguments);
    };

    module.prototype = {
        init: function(model) {
            this._oCrossAppNav = sap.ushell && sap.ushell.Container && sap.ushell.Container.getService("CrossApplicationNavigation");
            this._model = model;
        },

        resolveIntents: function(results) {
            var that = this;

            // Synchronize all intent requests through one additional deferred object
            var dfd = new $.Deferred();

            that._model.sina.sinaSystem().getServerInfo().then(
                function(serverInfo) {
                    var semanticObjectTypeSupported = false;
                    for (var i = 0; i < serverInfo.rawServerInfo.Services.length; ++i) {
                        var service = serverInfo.rawServerInfo.Services[i];
                        if (service.Service === 'Search') {
                            for (var j = 0; j < service.Capabilities.length; ++j) {
                                var capability = service.Capabilities[j];
                                if (capability.Capability === 'SemanticObjectType') {
                                    semanticObjectTypeSupported = true;
                                    break;
                                }
                            }
                            break;
                        }
                    }

                    if (!semanticObjectTypeSupported) {
                        dfd.resolve();
                    } else {
                        var proms = [];
                        for (var k = 0; k < results.length; k++) {
                            var result = results[k];

                            // reset main URL
                            result.uri = "";

                            if (result.semanticObjectType && result.semanticObjectType.length > 0) {
                                var prom = that._doResolveIntents(result);
                                proms.push(prom);
                            }
                        }

                        //var dfd = new $.Deferred();
                        $.when.apply(null, proms).always(function(args) { //TODO: error handling
                            dfd.resolve();
                        });
                    }
                }
            );

            return dfd.promise();
        },

        _doResolveIntents: function(result) {
            var that = this;
            // additional deferredObject is necessary, because if one of the inner
            // promise objects fails, $.when.always (see below) resolves immediately
            // and does not wait for the other inner proms to either resolve or fail.
            var outerProm = new $.Deferred();
            var prom = that._oCrossAppNav.getSemanticObjectLinks(result.semanticObjectType, result.semanticObjectTypeAttrs);
            prom.done(function(intents) {
                var factSheetAction = "-displayFactSheet";
                var foundFactSheet = false;

                result.intents = [];

                for (var i = 0; i < intents.length; i++) {
                    var intent = intents[i];

                    var externalTarget = {
                        target: {
                            shellHash: intent.intent
                        }
                    };
                    var externalHash = that._oCrossAppNav.hrefForExternal(externalTarget);

                    if (!foundFactSheet && intent.intent.substr(intent.intent.indexOf("-"), factSheetAction.length) === factSheetAction) {
                        result.uri = externalHash;
                        foundFactSheet = true;
                    } else {
                        intent.target = externalTarget.target;
                        intent.externalHash = externalHash;
                        result.intents.push(intent);
                    }
                }
                outerProm.resolve();
            });
            prom.fail(function(arg) {
                outerProm.resolve();
            });
            return outerProm;
        }
    };

})();
