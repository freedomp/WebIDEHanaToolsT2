/* global console */

(function() {
    "use strict";

    // =======================================================================
    // declare package
    // =======================================================================    
    jQuery.sap.declare('sap.ushell.renderers.fiori2.search.SemanticObjectsHandler');
    var module = sap.ushell.renderers.fiori2.search.SemanticObjectsHandler = {};

    // =======================================================================
    // semantic object
    // =======================================================================
    module.SemanticObject = function() {
        this.init.apply(this, arguments);
    };

    module.SemanticObject.prototype = {

        init: function(params) {
            this.type = params.type;
            this.action = params.action;
            this.key = params.key;
        },

        getSemanticLinks: function() {
            var that = this;
            return module.getSemanticObjectsMetadata().then(function(metaData) {
                var result = {};
                var type = metaData[that.type];
                for (var i = 0; i < type.Links.results.length; ++i) {
                    var link = type.Links.results[i];
                    if (link.id.indexOf(that.type + "-displayFactSheet~") >= 0) {
                        if (that.action !== "displayFactSheet") {
                            //                          only if the main link is not a Factsheet link
                            if (!result.displayFactSheet) {
                                result.displayFactSheet = [];
                                result.displayFactSheet.push({
                                    link: link.id + '?' + that.key,
                                    text: link.text,
                                    shortText: sap.ushell.resources.i18n.getText("action_display")
                                });
                            }
                        }
                    } else if (link.id.indexOf(that.type + "-change~") >= 0) {
                        if (!result.change) {
                            result.change = [];
                            result.change.push({
                                link: link.id + '?' + that.key,
                                text: link.text,
                                shortText: sap.ushell.resources.i18n.getText("action_change")
                            });
                        }
                    } else if (link.id.indexOf(that.type + "-display~") >= 0) {
                        if (!result.display) {
                            result.display = [];
                            result.display.push({
                                link: link.id + '?' + that.key,
                                text: link.text,
                                shortText: sap.ushell.resources.i18n.getText("action_display")
                            });
                        }
                    } else if (link.id.indexOf(that.type + "-manage~") >= 0) {
                        if (!result.manage) {
                            result.manage = [];
                            result.manage.push({
                                link: link.id + '?' + that.key,
                                text: link.text,
                                shortText: sap.ushell.resources.i18n.getText("action_manage")
                            });
                        }
                    } else if (link.id.indexOf(that.type + "-approve~") >= 0) {
                        if (!result.approve) {
                            result.approve = [];
                            result.approve.push({
                                link: link.id + '?' + that.key,
                                text: link.text,
                                shortText: sap.ushell.resources.i18n.getText("action_approve")
                            });
                        }
                    } else {
                        if (!result.other) {
                            result.other = [];
                        }
                        result.other.push({
                            link: link.id + '?' + that.key,
                            text: link.text
                        });
                    }
                }
                return result;
            });
        }
    };

    module.createSemanticObjectFromLink = function(link) {

        // get semantic object type from link
        var index = link.indexOf('-');
        if (index < 0) {
            throw 'Error when parsing link, missing \'-\' delimiter in \'' + link + '\'';
        }
        var type = link.slice(0, index);

        // get launchpad action from link
        link = link.slice(index + 1);
        index = link.indexOf('?');
        if (index < 0) {
            throw 'Error when parsing link, missing \'?\' delimiter in \'' + link + '\'';
        }
        var action = link.slice(0, index);

        // get semantic object key from link
        var key = link.slice(index + 1);

        // create semantic object
        return new module.SemanticObject({
            type: type,
            action: action,
            key: key
        });
    };

    // =======================================================================
    // semantic objects metadata handling
    // =======================================================================    

    module.semanticObjectsMetadataDeferred = null;

    module.metaDataUrl = '/sap/opu/odata/UI2/INTEROP/SemanticObjects?$expand=Links&$format=json';

    module.getSemanticObjectsMetadata = function() {
        if (module.semanticObjectsMetadataDeferred) {
            return module.semanticObjectsMetadataDeferred;
        }
        module.semanticObjectsMetadataDeferred = new jQuery.Deferred();
        var oJSONModel = new sap.ui.model.json.JSONModel();
        oJSONModel.loadData(module.metaDataUrl);
        oJSONModel.attachRequestCompleted(function() {
            // make hashmap from array
            var result = {};
            var types = this.getData().d.results;
            for (var i = 0; i < types.length; ++i) {
                var type = types[i];
                result[type.id] = type;
            }
            module.semanticObjectsMetadataDeferred.resolve(result);
        });
        return module.semanticObjectsMetadataDeferred;
    };

    // =======================================================================
    // link determination for ui
    // =======================================================================
    module.linkDetermination = function(mainLink) {
        return module.getSemanticObjectsMetadata().then(function(metaData) {
            /* eslint no-lonely-if:0 */
            var result = {},
                link = mainLink;

            // get semantic object type from link
            var index = link.indexOf("-");
            if (index < 0) {
                throw "Error when parsing link, missing \'-\' delimiter in \'" + link + "\'";
            }
            var semanticObject = link.slice(0, index);

            // get launchpad action from link
            link = link.slice(index + 1);
            index = link.indexOf("?");
            if (index < 0) {
                throw "Error when parsing link, missing \'?\' delimiter in \'" + link + "\'";
            }
            var action = link.slice(0, index);

            // get semantic object key from link
            var key = link.slice(index + 1);

            if (action === "displayFactSheet") {
                // the main link is a Fact Sheet link -> no further action
                result.mainLink = mainLink;
                return result;
            }

            // main link is not a Fact Sheet link
            var type = metaData[semanticObject];
            var oFactSheet = {},
                sAppLink = "";
            for (var i = 0; i < type.Links.results.length; ++i) {
                link = type.Links.results[i];
                if (link.id.indexOf("-" + action + "~") >= 0) {
                    // main link is authorised
                    sAppLink = mainLink;
                }
                if (link.id.indexOf(semanticObject + "-displayFactSheet~") >= 0) {
                    oFactSheet.link = link.id + "?" + key;
                    oFactSheet.text = sap.ushell.resources.i18n.getText("show_related_objects");
                }
            }
            if (sAppLink) {
                result.mainLink = sAppLink;
                if (oFactSheet.link) {
                    result.relatedLink = oFactSheet;
                }
            } else {
                // main link is NOT authorised
                if (oFactSheet.link) {
                    result.mainLink = oFactSheet.link;
                }
            }
            return result;
        });
    };

    // =======================================================================
    // test
    // =======================================================================    

    module.test = function() {
        /* eslint no-unused-vars:0 */

        // create semantic object from link
        var semanticObject = module.createSemanticObjectFromLink('SalesOrder-displayFactSheet?SalesOrder=0000027');

        // get semantic links
        semanticObject.getSemanticLinks().done(function(links) {
            for (var i = 0; i < links.length; ++i) {
                var link = links[i];
                //console.log('-->', link.text, link.link);
            }
        });
        semanticObject.getSemanticLinks().done(function(links) {
            for (var i = 0; i < links.length; ++i) {
                var link = links[i];
                //console.log('-->', link.text, link.link);
            }
        });

    };

})();
