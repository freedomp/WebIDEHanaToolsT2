/**
 * Defines the Impact Analysis model and objects used for the Impact analysis diagram.
 * User: I063946
 * Date: 04/05/15
 * (c) Copyright 2013-2013 SAP SE. All rights reserved
 */

(function () {
    "use strict";

    /**
     * Impact Analysis meta-model definition.
     */
    var oResource,
        oReader,
        oModelDef = {
            contents: {
                /**
                 * The impact analysis meta-model definition.
                 */
                "Sap.Galilei.ImpactAnalysis.Model": {
                    classDefinition: "sap.galilei.model.Package",
                    displayName: "Impact Analysis Model",
                    namespaceName: "sap.galilei.impactAnalysis",
                    classifiers: {
                        /**
                         * @class
                         * @name sap.galilei.impactAnalysis.Node
                         * The impact analysis Node object.
                         */
                        "Node": {
                            displayName: "Node",
                            parent: "sap.galilei.common.NamedObject",
                            properties: {
                                /**
                                 * The adapter for the analysis object.
                                 * @name objectAdapter
                                 * @memberOf sap.galilei.impactAnalysis.Node#
                                 * @type {String}
                                 */
                                "Node.objectAdapter": {
                                    name: "objectAdapter", dataType: sap.galilei.model.dataTypes.gBlob, isVolatile: true
                                },
                                /**
                                 * The display name.
                                 * @name displayName
                                 * @memberOf sap.galilei.impactAnalysis.Node#
                                 * @type {String}
                                 */
                                "Node.displayName": {
                                    name: "displayName",
                                    get: function () {
                                        var sName;

                                        if (this.analysisObject) {
                                            if (this.objectAdapter) {
                                                sName = this.objectAdapter.getDisplayName(this.analysisObject);
                                            } else {
                                                sName = this.analysisObject.displayName;
                                            }
                                        }
                                        return sName;
                                    }
                                },
                                /**
                                 * The icon URL.
                                 * @name icon
                                 * @memberOf sap.galilei.impactAnalysis.Node#
                                 * @type {String}
                                 */
                                "Node.icon": {
                                    name: "icon",
                                    get: function () {
                                        var sIcon;

                                        if (this.analysisObject && this.objectAdapter) {
                                            sIcon = this.objectAdapter.getIcon(this.analysisObject);
                                        }
                                        return sIcon;
                                    }
                                },
                                /**
                                 * The icon URL.
                                 * @name icon
                                 * @memberOf sap.galilei.impactAnalysis.Node#
                                 * @type {Number}
                                 */
                                "Node.level": {
                                    name: "level", dataType: sap.galilei.model.dataTypes.gInteger, defaultValue: 0, isVolatile: true
                                },
                                /**
                                 * Indicates whether the analysis object has impact objects.
                                 * @name hasImpact
                                 * @memberOf sap.galilei.impactAnalysis.Node#
                                 * @type {Boolean}
                                 */
//                                "Node.hasImpact": {
//                                    name: "hasImpact",
//                                    get: function () {
//                                        // Checks the private _hasImpactObjects field first
//                                        if (this._hasImpactObjects === undefined) {
//                                            if (this.isImpactExpanding) {
//                                                // Do not call hasImpactAsync when drawing the symbol. It will be call by ExpandNode any way
//                                                this.isImpactExpanding = false;
//                                                return true;
//                                            } else {
//                                                // Calls hasImpactAsync, it will fire property changed event when it is done
//                                                jQuery.when(this.getHasImpactAsync())
//                                                    .done(function (bHasImpact) {
//                                                    });
//                                            }
//                                        }
//                                        return (this._hasImpactObjects !== undefined) ? this._hasImpactObjects : false;
//                                    }
//                                },
                                /**
                                 * Indicates whether the analysis object has lineage objects.
                                 * @name hasLineage
                                 * @memberOf sap.galilei.impactAnalysis.Node#
                                 * @type {Boolean}
                                 */
//                                "Node.hasLineage": {
//                                    name: "hasLineage",
//                                    get: function () {
//                                        // Checks the private _hasLineageObjects field first
//                                        if (this._hasLineageObjects === undefined) {
//                                            if (this.isLineageExpanding) {
//                                                // Do not call hasLineageAsync when drawing the symbol. It will be call by expandNode any way
//                                                this.isLineageExpanding = false;
//                                                return true;
//                                            } else {
//                                                // Calls hasLineageAsync, it will fire property changed event when it is done
//                                                jQuery.when(this.getHasLineageAsync())
//                                                    .done(function (hasLineage) {
//                                                    });
//                                            }
//                                        }
//                                        return (this._hasLineageObjects !== undefined) ? this._hasLineageObjects : false;
//                                    }
//                                },
                                /**
                                 * Indicates whether the node is the root node for the initial object.
                                 * @name isRoot
                                 * @memberOf sap.galilei.impactAnalysis.Node#
                                 * @type {Boolean}
                                 */
                                "Node.isRoot": { name: "isRoot", dataType: sap.galilei.model.dataTypes.gBool, defaultValue: false, isVolatile: true },
                                /**
                                 * Indicates whether the node is a node of impact object.
                                 * @name isImpact
                                 * @memberOf sap.galilei.impactAnalysis.Node#
                                 * @type {Boolean}
                                 */
                                "Node.isImpact": { name: "isImpact", dataType: sap.galilei.model.dataTypes.gBool, defaultValue: false, isVolatile: true },
                                /**
                                 * Indicates whether the node is a node of lineage object.
                                 * @name isLineage
                                 * @memberOf sap.galilei.impactAnalysis.Node#
                                 * @type {Boolean}
                                 */
                                "Node.isLineage": { name: "isLineage", dataType: sap.galilei.model.dataTypes.gBool, defaultValue: false, isVolatile: true },
                                /**
                                 * Indicates whether the impact data is loaded.
                                 * @name isImpactLoaded
                                 * @memberOf sap.galilei.impactAnalysis.Node#
                                 * @type {Boolean}
                                 */
                                "Node.isImpactLoaded": { name: "isImpactLoaded", dataType: sap.galilei.model.dataTypes.gBool, defaultValue: false, isVolatile: true },
                                /**
                                 * Indicates whether the lineage data is loaded.
                                 * @name isLineageLoaded
                                 * @memberOf sap.galilei.impactAnalysis.Node#
                                 * @type {Boolean}
                                 */
                                "Node.isLineageLoaded": { name: "isLineageLoaded", dataType: sap.galilei.model.dataTypes.gBool, defaultValue: false, isVolatile: true },
                                /**
                                 * Indicates whether the impact objects are created.
                                 * @name isImpactObjectsCreated
                                 * @memberOf sap.galilei.impactAnalysis.Node#
                                 * @type {Boolean}
                                 */
                                "Node.isImpactObjectsCreated": { name: "isImpactObjectsCreated", dataType: sap.galilei.model.dataTypes.gBool, defaultValue: false, isVolatile: true },
                                 /**
                                 * Indicates whether the lineage objects are created.
                                 * @name isLineageObjectsCreated
                                 * @memberOf sap.galilei.impactAnalysis.Node#
                                 * @type {Boolean}
                                 */
                                "Node.isLineageObjectsCreated": { name: "isLineageObjectsCreated", dataType: sap.galilei.model.dataTypes.gBool, defaultValue: false, isVolatile: true },
                                /**
                                 * Indicates whether the node is expanding its impact nodes.
                                 * @name isImpactExpanding
                                 * @memberOf sap.galilei.impactAnalysis.Node#
                                 * @type {Boolean}
                                 */
                                "Node.isImpactExpanding": { name: "isImpactExpanding", dataType: sap.galilei.model.dataTypes.gBool, defaultValue: false, isVolatile: true },
                                /**
                                 * Indicates whether the node is expanding its lineage nodes.
                                 * @name isLineageExpanding
                                 * @memberOf sap.galilei.impactAnalysis.Node#
                                 * @type {Boolean}
                                 */
                                "Node.isLineageExpanding": { name: "isLineageExpanding", dataType: sap.galilei.model.dataTypes.gBool, defaultValue: false, isVolatile: true },
                                /**
                                 * Indicates whether the impact nodes are expanded.
                                 * @name isImpactExpanded
                                 * @memberOf sap.galilei.impactAnalysis.Node#
                                 * @type {Boolean}
                                 */
                                "Node.isImpactExpanded": { name: "isImpactExpanded", dataType: sap.galilei.model.dataTypes.gBool, defaultValue: false, isVolatile: true },
                                /**
                                 * Indicates whether the lineage nodes are expanded.
                                 * @name isLineageExpanded
                                 * @memberOf sap.galilei.impactAnalysis.Node#
                                 * @type {Boolean}
                                 */
                                "Node.isLineageExpanded": { name: "isLineageExpanded", dataType: sap.galilei.model.dataTypes.gBool, defaultValue: false, isVolatile: true }
                            },
                            references: {
                                /**
                                 * Gets or sets the analysis object associated with the Node.
                                 * @name analysisObject
                                 * @memberOf sap.galilei.impactAnalysis.Node#
                                 * @type {sap.galilei.model.Object}
                                 */
                                "Node.analysisObject": { name: "analysisObject", displayName: "Analysis Object", classDefinition: "sap.galilei.model.Reference", contentType: "sap.galilei.model.Object", isMany: false }
                            },
                            methods: {
                                /**
                                 * Checks whether the analysis object has impact objects asynchronously.
                                 * @name getHasImpactAsync
                                 * @memberOf sap.galilei.impactAnalysis.Node#
                                 * @returns {Deferred}
                                 */
                                getHasImpactAsync: function () {
                                    var self = this,
                                        oResult = jQuery.Deferred();

                                    if (this._hasImpactObjects === undefined) {
                                        if (this.analysisObject && this.objectAdapter) {
                                            this.objectAdapter.getHasImpactObjects(
                                                this.analysisObject,
                                                this,
                                                function (bHasImpact) {
                                                    self._hasImpactObjects = bHasImpact;
                                                    // Updates the monitor backing field
                                                    if (self.__hasImpact) {
                                                        self.__hasImpact.value = self._hasImpactObjects;
                                                    }
                                                    // Fires member change event
                                                    if (self.fireMemberChanged) {
                                                        self.fireMemberChanged("hasImpact");
                                                    }
                                                    oResult.resolve(bHasImpact);
                                                },
                                                function () {
                                                    // TODO
                                                    oResult.resolve(false);
                                                }
                                            );
                                        } else {
                                            oResult.resolve();
                                        }
                                    } else {
                                        oResult.resolve((this._hasImpactObjects !== undefined) ? this._hasImpactObjects : false);
                                    }

                                    return oResult;
                                },
                                /**
                                 * Checks whether the analysis object has lineage objects asynchronously.
                                 * @name getHasLineageAsync
                                 * @memberOf sap.galilei.impactAnalysis.Node#
                                 * @returns {Deferred}
                                 */
                                getHasLineageAsync: function () {
                                    var self = this,
                                        oResult = jQuery.Deferred();

                                    if (this._hasLineageObjects === undefined) {
                                        if (this.analysisObject && this.objectAdapter) {
                                            this.objectAdapter.getHasLineageObjects(
                                                this.analysisObject,
                                                this,
                                                function (bHasLineage) {
                                                    self._hasLineageObjects = bHasLineage;
                                                    // Updates the monitor backing field
                                                    if (self.__hasLineage) {
                                                        self.__hasLineage.value = self._hasLineageObjects;
                                                    }
                                                    // Fires member change event
                                                    if (self.fireMemberChanged) {
                                                        self.fireMemberChanged("hasLineage");
                                                    }
                                                    oResult.resolve(bHasLineage);
                                                },
                                                function () {
                                                    // TODO
                                                    oResult.resolve(false);
                                                }
                                            );
                                        } else {
                                            oResult.resolve();
                                        }
                                    } else {
                                        oResult.resolve((this._hasLineageObjects !== undefined) ? this._hasLineageObjects : false);
                                    }

                                    return oResult;
                                },
                                /**
                                 * Retrieves the impact objects.
                                 * @function
                                 * @name retrieveImpactObjects
                                 * @memberOf sap.galilei.impactAnalysis.Node#
                                 * @param fnSuccess The success callback function. It has the parameter aObjectsInfo.
                                 * Each element has the properties:
                                 *   object The retrieved analysis object
                                 *   source The source of the analysis object
                                 *   link
                                 *       object The link object if there is one
                                 *       referenceName The reference name if there is one
                                 * @param fnError
                                 */
                                retrieveImpactObjects: function (fnSuccess, fnError) {
                                    var self = this;

                                    function successCallback(aObjects) {
                                        self.isImpactLoaded = true;
                                        if (fnSuccess) {
                                            fnSuccess(aObjects);
                                        }
                                    }

                                    if (this.analysisObject && this.objectAdapter) {
                                        this.objectAdapter.retrieveImpactObjects(this.analysisObject, this, successCallback, fnError);
                                    }
                                },

                                /**
                                 * Retrieves the lineage objects.
                                 * @function
                                 * @name retrieveLineageObjects
                                 * @memberOf sap.galilei.impactAnalysis.Node#
                                 * @param fnSuccess The success callback function. It has the parameter aObjectsInfo.
                                 * Each element has the properties:
                                 *   object The retrieved analysis object
                                 *   source The source of the analysis object
                                 *   link
                                 *       object The link object if there is one
                                 *       referenceName The reference name if there is one
                                 * @param fnError
                                 */
                                retrieveLineageObjects: function (fnSuccess, fnError) {
                                    var self = this;

                                    function successCallback(aObjects) {
                                        self.isLineageLoaded = true;
                                        if (fnSuccess) {
                                            fnSuccess(aObjects);
                                        }
                                    }

                                    if (this.analysisObject && this.objectAdapter) {
                                        this.objectAdapter.retrieveLineageObjects(this.analysisObject, this, successCallback, fnError);
                                    }
                                },

                                /**
                                 * Gets the impact nodes.
                                 * @function
                                 * @name getImpactNodes
                                 * @memberOf sap.galilei.impactAnalysis.Node#
                                 * @returns {Array}
                                 */
                                getImpactNodes: function () {
                                    var aNodes = [],
                                        aLinks,
                                        index,
                                        max,
                                        oNode;

                                    aLinks = this.getSourceLinkObjects();
                                    if (aLinks) {
                                        for (index = 0, max = aLinks.length; index < max; index++) {
                                            oNode = aLinks[index].target;
                                            if (aNodes.indexOf(oNode) === -1) {
                                                aNodes.push(oNode);
                                            }
                                        }
                                    }

                                    return aNodes;
                                },

                                /**
                                 * Gets the lineage nodes.
                                 * @function
                                 * @name getLineageNodes
                                 * @memberOf sap.galilei.impactAnalysis.Node#
                                 * @returns {Array}
                                 */
                                getLineageNodes: function () {
                                    var aNodes = [],
                                        aLinks,
                                        index,
                                        max,
                                        oNode;

                                    aLinks = this.getTargetLinkObjects();
                                    if (aLinks) {
                                        for (index = 0, max = aLinks.length; index < max; index++) {
                                            oNode = aLinks[index].source;
                                            if (aNodes.indexOf(oNode) === -1) {
                                                aNodes.push(oNode);
                                            }
                                        }
                                    }

                                    return aNodes;
                                }
                            }
                        },
                        /**
                         * @class
                         * The impact analysis Node Link object.
                         * @name sap.galilei.impactAnalysis.NodeLink
                         */
                        "NodeLink": {
                            displayName: "Node Link",
                            parent: "sap.galilei.common.LinkObject",
                            properties: {
                                /**
                                 * The reference name of the source analysis object that contains the target analysis (Optional).
                                 * @name referenceName
                                 * @memberOf sap.galilei.impactAnalysis.NodeLink#
                                 * @type {String}
                                 */
                                "NodeLink.referenceName": { name: "referenceName", dataType: sap.galilei.model.dataTypes.gString, isVolatile: true },
                                /**
                                 * Indicates whether there are more than one level between the source and target nodes.
                                 * @name isCrossLevels
                                 * @memberOf sap.galilei.impactAnalysis.Node#
                                 * @type {Boolean}
                                 */
                                "NodeLink.isCrossLevels": {
                                    name: "isCrossLevels",
                                    get: function () {
                                        var nLevels = 0;

                                        if (this.source && this.target) {
                                            nLevels = this.source.level - this.target.level;
                                        }
                                        return Math.abs(nLevels) > 1;
                                    }
                                }
                            },
                            references: {
                                /**
                                 * Gets or sets The analysis link object associated with the NodeLink (Optional).
                                 * @name analysisObject
                                 * @memberOf sap.galilei.impactAnalysis.NodeLink#
                                 * @type {sap.galilei.model.Object}
                                 */
                                "NodeLink.analysisObject": { name: "analysisObject", displayName: "Analysis Object", classDefinition: "sap.galilei.model.Reference", contentType: "sap.galilei.model.Object", isMany: false }
                            }
                        },
                        /**
                         * The impact analysis model.
                         */
                        "Model": {
                            displayName: "Model",
                            parent: "sap.galilei.common.Model",
                            references: {
                                /**
                                 * The nodes.
                                 */
                                "Model.nodes": {
                                    name: "nodes",
                                    contentType: "sap.galilei.impactAnalysis.Node",
                                    isMany: true,
                                    isContainment: true
                                },
                                /**
                                 * The node links.
                                 */
                                "Model.nodeLinks": {
                                    name: "nodeLinks",
                                    contentType: "sap.galilei.impactAnalysis.NodeLink",
                                    isMany: true,
                                    isContainment: true
                                }
                            }
                        }
                    }
                }
            }
        };

    oResource = new sap.galilei.model.Resource();
    oReader = new sap.galilei.model.JSONReader();
    oReader.load(oResource, oModelDef);
}());