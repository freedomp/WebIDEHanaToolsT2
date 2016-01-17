/**
 * Defines a generic object adapter for generic analysis object.
 * User: I063946
 * Date: 24/06/15
 * (c) Copyright 2013-2015 SAP SE. All rights reserved
 */

namespace("sap.hana.impactAnalysis.generic", function (nsLocal) {
    "use strict";

    /**
     * @class
     * Generic object adapter for generic analysis object.
     * @name sap.galilei.impactAnalysis.generic.ObjectAdapter.
     */
    nsLocal.ObjectAdapter = sap.galilei.core.defineClass({
        // Define class name
        fullClassName: "sap.hana.impactAnalysis.generic.ObjectAdapter",

        // Define parent class
        parent: sap.galilei.impactAnalysis.generic.ObjectAdapter,

        // Define methods
        methods: {
            /**
             * Checks whether the object has impact objects.
             * @name hasImpact
             * @memberOf sap.galilei.impactAnalysis.generic.ObjectAdapter#
             * @param {Object} oAnalysisObject The analysis object.
             * @param {Node} oNode The node object.
             * @returns {Boolean}
             */
            hasImpact: function (oAnalysisObject, oNode) {
                return oAnalysisObject ? (oAnalysisObject.impactObjects.length > 0) : false;
            },

            /**
             * Checks whether the object has lineage objects.
             * @name hasLineage
             * @memberOf sap.galilei.impactAnalysis.generic.ObjectAdapter#
             * @param {Object} oAnalysisObject The analysis object.
             * @param {Node} oNode The node object.
             * @returns {Boolean}
             */
            hasLineage: function (oAnalysisObject, oNode) {
                return oAnalysisObject ? (oAnalysisObject.lineageObjects.length > 0) : false;
            },

            /**
             * Checks whether there are impact objects. It allows lazy loading.
             * By default, it uses hasImpact().
             * The result is returned in fnSuccess
             * @name getHasImpactObjects
             * @memberOf sap.galilei.impactAnalysis.ObjectAdapter#
             * @param {Object} oAnalysisObject The analysis object.
             * @param {Node} oNode The node object.
             * @param {Function} fnSuccess The success(Array) callback function.
             * @param {Function} fnError The error(sError) callback function.
             */
//            getHasImpactObjects: function (oAnalysisObject, oNode, fnSuccess, fnError) {
//            	fnSuccess(true);
//            },
            getDisplayName: function(oAnalysisObject) { 
            	var displayname1 = oAnalysisObject.displayName;  
            	displayname1 =displayname1.substring(displayname1.lastIndexOf(":")+1,displayname1.length);
            	var name1 = oAnalysisObject.name;      
            		name1 =name1.substring(name1.lastIndexOf(":")+1,name1.length);              
            	return oAnalysisObject ? (displayname1 || name1) : ""
        	 },
		  getIcon: function(oAnalysisObject) {
                  return oAnalysisObject.type === "VIEW" ? "resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview/images/calculation_scenario.png" :
                	  		"resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview/images/Table.png";
            }, 
            /**
             * Checks whether there are lineage objects. It allows lazy loading.
             * By default, it uses hasLineage().
             * The result is returned in fnSuccess
             * @name getHasLineageObjects
             * @memberOf sap.galilei.impactAnalysis.generic.ObjectAdapter#
             * @param {Object} oAnalysisObject The analysis object.
             * @param {Node} oNode The node object.
             * @param {Function} fnSuccess The success(Array) callback function.
             * @param {Function} fnError The error(sError) callback function.
             */
//            getHasLineageObjects: function (oAnalysisObject, oNode, fnSuccess, fnError) {
//            	fnSuccess(true);
//            },
        },

        // Define static members
        statics: {
            /**
             * The shared object adapter instance.
             * @static
             * @private
             */
            _instance: undefined,

            /**
             * Gets the shared object adapter instance.
             * @static
             * @name getInstance
             * @memberOf sap.hana.impactAnalysis.generic.ObjectAdapter#
             * @param {Object} oAnalysisObject The analysis object.
             * @param {Function} fnSuccess The success(Collection|Array) callback function.
             * @param {Function} fnError The error(sError) callback function.
             * @returns {Boolean}
             */
            getInstance: function () {
                if (!this._instance) {
                    this._instance = new sap.hana.impactAnalysis.generic.ObjectAdapter();
                }
                return this._instance;
            }
        }
    });
});
