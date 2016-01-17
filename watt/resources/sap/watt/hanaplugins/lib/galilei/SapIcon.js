/**
 * Supports shapes based on SAP UI5 icons.
 * Date: 07/04/15
 * (c) Copyright 2013-2015 SAP SE. All rights reserved
 */

jQuery.sap.declare("sap.galilei.ui5.shape.SapIcon");

namespace("sap.galilei.ui5.shape", function (nsLocal) {
    "use strict";

    /**
     * @class
     * Shape based on SAP UI5 icons. To use it, you can set:
     *     src: The SAP icon name. Example: sap-icon://video.
     *     size: The icon size. Default: 16.
     *     fill: The icon color. Examples: "blue", "#666666".
     * @public
     * @augments sap.galilei.ui.common.shape.IconFont
     */
    sap.galilei.ui5.shape.SapIcon = sap.galilei.ui.common.shape.defineShape({
        // Define class name
        fullClassName: "sap.galilei.ui5.shape.SapIcon",

        // Define parent
        parent: sap.galilei.ui.common.shape.IconFont,

        // Define shape name
        shapeName: "SapIcon",

        // Define shape category
        shapeCategory: "Standard",

        // Define fields
        fields: {
            // The font collection name
            _collectionName: undefined,

            // The icon name
            _iconName: undefined
        },

        // Define properties
        properties: {
            /**
             * Gets or sets the icon URI. Example: sap-icon://video.
             * @name src
             * @memberOf sap.galilei.ui5.shape.SapIcon#
             * @type {String}
             */
            src: {
                field: "_src",
                get: function () {
                    return this.getFieldOrBindValue("_src");
                },
                set: function (vValue) {
                    this.setFieldOrBindValue("_src", vValue, true);
                    this._parseIconURI();
                }
            }
        },

        // Define methods
        methods: {
            /**
             * Parses the icon URI to extract collection name and icon name.
             * @name _parseIconURI
             * @memberOf sap.galilei.ui5.shape.SapIcon#
             */
            _parseIconURI: function () {
                var sSrc = this.src,
                    index,
                    sPrefix,
                    sCollectionAndIconName,
                    oIconInfo;

                if (sSrc) {
                    index = sSrc.indexOf(":");
                    sPrefix = sSrc.slice(0, index);
                    if (sPrefix === "sap-icon") {
                        sCollectionAndIconName = sSrc.slice(index + 3);
                        index = sCollectionAndIconName.indexOf("/");
                        if (index !== -1) {
                            this._collectionName = sCollectionAndIconName.slice(0, index);
                            this._iconName = sCollectionAndIconName.slice(index + 1);
                        } else {
                            this._iconName = sCollectionAndIconName;
                        }
                        if (this._iconName) {
                            oIconInfo = sap.ui.core.IconPool.getIconInfo(this._iconName, this._collectionName);
                            // {
                            //     name: "video",
                            //     collection: undefined,
                            //     uri: "sap-icon://video",
                            //     fontFamily: "SAP-icons",
                            //     content: ""
                            //  }
                            if (oIconInfo) {
                                this.fontFamily = oIconInfo.fontFamily;
                                this.text = oIconInfo.content;
                            }
                        }
                    }
                }
            }
        }
    });
});
