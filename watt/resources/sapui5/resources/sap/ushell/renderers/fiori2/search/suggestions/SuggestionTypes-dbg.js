(function() {
    "use strict";

    // =======================================================================
    // declare package
    // =======================================================================    
    jQuery.sap.declare('sap.ushell.renderers.fiori2.search.suggestions.SuggestionTypes');

    // =======================================================================
    // suggestion types
    // =======================================================================        
    sap.ushell.renderers.fiori2.search.suggestions.SuggestionTypes = {

        // string constants
        SUGGESTION_TYPE_DATASOURCE: 'datasource',
        SUGGESTION_TYPE_APPS: 'apps',
        SUGGESTION_TYPE_HISTORY: 'history',
        SUGGESTION_TYPE_OBJECT_DATA: 'businessobject',

        // properties of datasource suggestions
        datasource: {
            position: 10,
            limit: 2
        },

        // properties of app suggestions
        apps: {
            position: 20,
            limitDsAll: 3,
            limitDsApps: jQuery.device.is.phone ? 7 : 7
        },

        // properties of history suggestions
        history: {
            position: 30,
            limit: 3
        },

        // properties of object data suggestions
        objectData: {
            position: 40,
            limit: jQuery.device.is.phone ? 7 : 7
        }


    };


})();
