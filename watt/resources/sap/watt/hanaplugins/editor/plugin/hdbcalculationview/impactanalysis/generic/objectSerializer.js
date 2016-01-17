/**
 * Defines a generic object serializer for creating analysis objects from standard impact and lineage JSON data.
 * User: I063946
 * Date: 24/06/15
 * (c) Copyright 2013-2015 SAP SE. All rights reserved
 */

namespace("sap.hana.impactAnalysis.generic", function (nsLocal) {
    "use strict";

    /**
     * @class
     * Impact and Lineage analysis object serializer
     * Creates generic analysis objects from standard impact and lineage analysis JSON data.
     */
    nsLocal.ObjectSerializer = sap.galilei.core.defineClass({
        // Define class name
        fullClassName: "sap.hana.impactAnalysis.generic.ObjectSerializer",

        // Define parent
        parent: sap.galilei.impactAnalysis.generic.ObjectSerializer,

        // Define methods
        methods: {
            
        },

        // Define static members
        statics: {
            /**
             * The shared serailizer instance.
             * @static
             * @private
             */
            _instance: undefined,

            /**
             * Gets a shared instance of the generic object serializer.
             * @static
             * @function
             * @name getInstance
             * @memberOf sap.hana.impactAnalysis.generic.ObjectSerializer#
             * @returns {sap.hana.impactAnalysis.generic.ObjectSerializer}
             */
            getInstance: function () {
                if (!this._instance) {
                    this._instance = new sap.hana.impactAnalysis.generic.ObjectSerializer();
                }
                return this._instance;
            }
        }
    });
});

